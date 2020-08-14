# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

"""Utility functions used across Superset"""

import logging
import time
import urllib.request
from collections import namedtuple
from datetime import datetime, timedelta
from email.utils import make_msgid, parseaddr
from typing import (
    Any,
    Callable,
    Dict,
    Iterator,
    NamedTuple,
    Optional,
    Tuple,
    TYPE_CHECKING,
    Union,
)
from urllib.error import URLError  # pylint: disable=ungrouped-imports

import croniter
import pandas as pd
import simplejson as json
from celery.app.task import Task
from dateutil.tz import tzlocal
from flask import current_app, render_template, url_for
from flask_babel import gettext as __
from retry.api import retry_call
from selenium.common.exceptions import WebDriverException
from selenium.webdriver import chrome, firefox
from selenium.webdriver.remote.webdriver import WebDriver
from sqlalchemy.exc import NoSuchColumnError, ResourceClosedError

from superset import app, db, security_manager, thumbnail_cache
from superset.extensions import celery_app, machine_auth_provider_factory
from superset.models.alerts import Alert, AlertLog
from superset.models.core import Database
from superset.models.dashboard import Dashboard
from superset.models.schedules import (
    EmailDeliveryType,
    get_scheduler_model,
    ScheduleType,
    SliceEmailReportFormat,
)
from superset.models.slice import Slice
from superset.sql_parse import ParsedQuery
from superset.tasks.slack_util import deliver_slack_msg
from superset.utils.core import get_email_address_list, send_email_smtp
from superset.utils.screenshots import ChartScreenshot, WebDriverProxy
from superset.utils.urls import get_url_path

# pylint: disable=too-few-public-methods

if TYPE_CHECKING:
    # pylint: disable=unused-import
    from werkzeug.datastructures import TypeConversionDict
    from flask_appbuilder.security.sqla.models import User


# Globals
config = app.config
logger = logging.getLogger("tasks.email_reports")
logger.setLevel(logging.INFO)

stats_logger = current_app.config["STATS_LOGGER"]
EMAIL_PAGE_RENDER_WAIT = config["EMAIL_PAGE_RENDER_WAIT"]
WEBDRIVER_BASEURL = config["WEBDRIVER_BASEURL"]
WEBDRIVER_BASEURL_USER_FRIENDLY = config["WEBDRIVER_BASEURL_USER_FRIENDLY"]

ReportContent = namedtuple(
    "EmailContent",
    [
        "body",  # email body
        "data",  # attachments
        "images",  # embedded images for the email
        "slack_message",  # html not supported, only markdown
        # attachments for the slack message, embedding not supported
        "slack_attachment",
    ],
)


class ScreenshotData(NamedTuple):
    url: str  # url to chat/dashboard for this screenshot
    image: Optional[bytes]  # bytes for the screenshot


class AlertContent(NamedTuple):
    label: str  # alert name
    sql: str  # sql statement for alert
    alert_url: str  # url to alert details
    image_data: Optional[ScreenshotData]  # data for the alert screenshot


def _get_email_to_and_bcc(
    recipients: str, deliver_as_group: bool
) -> Iterator[Tuple[str, str]]:
    bcc = config["EMAIL_REPORT_BCC_ADDRESS"]

    if deliver_as_group:
        to = recipients
        yield (to, bcc)
    else:
        for to in get_email_address_list(recipients):
            yield (to, bcc)


# TODO(bkyryliuk): move email functionality into a separate module.
def _deliver_email(  # pylint: disable=too-many-arguments
    recipients: str,
    deliver_as_group: bool,
    subject: str,
    body: str,
    data: Optional[Dict[str, Any]],
    images: Optional[Dict[str, bytes]],
) -> None:
    for (to, bcc) in _get_email_to_and_bcc(recipients, deliver_as_group):
        send_email_smtp(
            to,
            subject,
            body,
            config,
            data=data,
            images=images,
            bcc=bcc,
            mime_subtype="related",
            dryrun=config["SCHEDULED_EMAIL_DEBUG_MODE"],
        )


def _generate_report_content(
    delivery_type: EmailDeliveryType, screenshot: bytes, name: str, url: str
) -> ReportContent:
    data: Optional[Dict[str, Any]]

    # how to: https://api.slack.com/reference/surfaces/formatting
    slack_message = __(
        """
        *%(name)s*\n
        <%(url)s|Explore in Superset>
        """,
        name=name,
        url=url,
    )

    if delivery_type == EmailDeliveryType.attachment:
        images = None
        data = {"screenshot": screenshot}
        body = __(
            '<b><a href="%(url)s">Explore in Superset</a></b><p></p>',
            name=name,
            url=url,
        )
    elif delivery_type == EmailDeliveryType.inline:
        # Get the domain from the 'From' address ..
        # and make a message id without the < > in the ends
        domain = parseaddr(config["SMTP_MAIL_FROM"])[1].split("@")[1]
        msgid = make_msgid(domain)[1:-1]

        images = {msgid: screenshot}
        data = None
        body = __(
            """
            <b><a href="%(url)s">Explore in Superset</a></b><p></p>
            <img src="cid:%(msgid)s">
            """,
            name=name,
            url=url,
            msgid=msgid,
        )

    return ReportContent(body, data, images, slack_message, screenshot)


def _get_url_path(view: str, user_friendly: bool = False, **kwargs: Any) -> str:
    with app.test_request_context():
        base_url = (
            WEBDRIVER_BASEURL_USER_FRIENDLY if user_friendly else WEBDRIVER_BASEURL
        )
        return urllib.parse.urljoin(str(base_url), url_for(view, **kwargs))


def create_webdriver() -> WebDriver:
    return WebDriverProxy(driver_type=config["WEBDRIVER_TYPE"]).auth(get_reports_user())


def get_reports_user() -> "User":
    return security_manager.find_user(config["EMAIL_REPORTS_USER"])


def destroy_webdriver(
    driver: Union[chrome.webdriver.WebDriver, firefox.webdriver.WebDriver]
) -> None:
    """
    Destroy a driver
    """

    # This is some very flaky code in selenium. Hence the retries
    # and catch-all exceptions
    try:
        retry_call(driver.close, tries=2)
    except Exception:  # pylint: disable=broad-except
        pass
    try:
        driver.quit()
    except Exception:  # pylint: disable=broad-except
        pass


def deliver_dashboard(
    dashboard_id: int,
    recipients: Optional[str],
    slack_channel: Optional[str],
    delivery_type: EmailDeliveryType,
    deliver_as_group: bool,
) -> None:

    """
    Given a schedule, delivery the dashboard as an email report
    """
    dashboard = db.session.query(Dashboard).filter_by(id=dashboard_id).one()

    dashboard_url = _get_url_path(
        "Superset.dashboard", dashboard_id_or_slug=dashboard.id
    )
    dashboard_url_user_friendly = _get_url_path(
        "Superset.dashboard", user_friendly=True, dashboard_id_or_slug=dashboard.id
    )

    # Create a driver, fetch the page, wait for the page to render
    driver = create_webdriver()
    window = config["WEBDRIVER_WINDOW"]["dashboard"]
    driver.set_window_size(*window)
    driver.get(dashboard_url)
    time.sleep(EMAIL_PAGE_RENDER_WAIT)

    # Set up a function to retry once for the element.
    # This is buggy in certain selenium versions with firefox driver
    get_element = getattr(driver, "find_element_by_class_name")
    element = retry_call(
        get_element, fargs=["grid-container"], tries=2, delay=EMAIL_PAGE_RENDER_WAIT
    )

    try:
        screenshot = element.screenshot_as_png
    except WebDriverException:
        # Some webdrivers do not support screenshots for elements.
        # In such cases, take a screenshot of the entire page.
        screenshot = driver.screenshot()  # pylint: disable=no-member
    finally:
        destroy_webdriver(driver)

    # Generate the email body and attachments
    report_content = _generate_report_content(
        delivery_type,
        screenshot,
        dashboard.dashboard_title,
        dashboard_url_user_friendly,
    )

    subject = __(
        "%(prefix)s %(title)s",
        prefix=config["EMAIL_REPORTS_SUBJECT_PREFIX"],
        title=dashboard.dashboard_title,
    )

    if recipients:
        _deliver_email(
            recipients,
            deliver_as_group,
            subject,
            report_content.body,
            report_content.data,
            report_content.images,
        )
    if slack_channel:
        deliver_slack_msg(
            slack_channel,
            subject,
            report_content.slack_message,
            report_content.slack_attachment,
        )


def _get_slice_data(slc: Slice, delivery_type: EmailDeliveryType) -> ReportContent:
    slice_url = _get_url_path(
        "Superset.explore_json", csv="true", form_data=json.dumps({"slice_id": slc.id})
    )

    # URL to include in the email
    slice_url_user_friendly = _get_url_path(
        "Superset.slice", slice_id=slc.id, user_friendly=True
    )

    # Login on behalf of the "reports" user in order to get cookies to deal with auth
    auth_cookies = machine_auth_provider_factory.instance.get_auth_cookies(
        get_reports_user()
    )
    # Build something like "session=cool_sess.val;other-cookie=awesome_other_cookie"
    cookie_str = ";".join([f"{key}={val}" for key, val in auth_cookies.items()])

    opener = urllib.request.build_opener()
    opener.addheaders.append(("Cookie", cookie_str))
    response = opener.open(slice_url)
    if response.getcode() != 200:
        raise URLError(response.getcode())

    # TODO: Move to the csv module
    content = response.read()
    rows = [r.split(b",") for r in content.splitlines()]

    if delivery_type == EmailDeliveryType.inline:
        data = None

        # Parse the csv file and generate HTML
        columns = rows.pop(0)
        with app.app_context():  # type: ignore
            body = render_template(
                "superset/reports/slice_data.html",
                columns=columns,
                rows=rows,
                name=slc.slice_name,
                link=slice_url_user_friendly,
            )

    elif delivery_type == EmailDeliveryType.attachment:
        data = {__("%(name)s.csv", name=slc.slice_name): content}
        body = __(
            '<b><a href="%(url)s">Explore in Superset</a></b><p></p>',
            name=slc.slice_name,
            url=slice_url_user_friendly,
        )

    # how to: https://api.slack.com/reference/surfaces/formatting
    slack_message = __(
        """
        *%(slice_name)s*\n
        <%(slice_url_user_friendly)s|Explore in Superset>
        """,
        slice_name=slc.slice_name,
        slice_url_user_friendly=slice_url_user_friendly,
    )

    return ReportContent(body, data, None, slack_message, content)


def _get_slice_screenshot(slice_id: int) -> ScreenshotData:
    slice_obj = db.session.query(Slice).get(slice_id)

    chart_url = get_url_path("Superset.slice", slice_id=slice_obj.id, standalone="true")
    screenshot = ChartScreenshot(chart_url, slice_obj.digest)
    image_url = _get_url_path(
        "Superset.slice", user_friendly=True, slice_id=slice_obj.id,
    )

    user = security_manager.find_user(current_app.config["THUMBNAIL_SELENIUM_USER"])
    image_data = screenshot.compute_and_cache(
        user=user, cache=thumbnail_cache, force=True,
    )

    db.session.commit()
    return ScreenshotData(image_url, image_data)


def _get_slice_visualization(
    slc: Slice, delivery_type: EmailDeliveryType
) -> ReportContent:
    # Create a driver, fetch the page, wait for the page to render
    driver = create_webdriver()
    window = config["WEBDRIVER_WINDOW"]["slice"]
    driver.set_window_size(*window)

    slice_url = _get_url_path("Superset.slice", slice_id=slc.id)
    slice_url_user_friendly = _get_url_path(
        "Superset.slice", slice_id=slc.id, user_friendly=True
    )

    driver.get(slice_url)
    time.sleep(EMAIL_PAGE_RENDER_WAIT)

    # Set up a function to retry once for the element.
    # This is buggy in certain selenium versions with firefox driver
    element = retry_call(
        driver.find_element_by_class_name,
        fargs=["chart-container"],
        tries=2,
        delay=EMAIL_PAGE_RENDER_WAIT,
    )

    try:
        screenshot = element.screenshot_as_png
    except WebDriverException:
        # Some webdrivers do not support screenshots for elements.
        # In such cases, take a screenshot of the entire page.
        screenshot = driver.screenshot()  # pylint: disable=no-member
    finally:
        destroy_webdriver(driver)

    # Generate the email body and attachments
    return _generate_report_content(
        delivery_type, screenshot, slc.slice_name, slice_url_user_friendly
    )


def deliver_slice(  # pylint: disable=too-many-arguments
    slice_id: int,
    recipients: Optional[str],
    slack_channel: Optional[str],
    delivery_type: EmailDeliveryType,
    email_format: SliceEmailReportFormat,
    deliver_as_group: bool,
) -> None:
    """
    Given a schedule, delivery the slice as an email report
    """
    slc = db.session.query(Slice).filter_by(id=slice_id).one()

    if email_format == SliceEmailReportFormat.data:
        report_content = _get_slice_data(slc, delivery_type)
    elif email_format == SliceEmailReportFormat.visualization:
        report_content = _get_slice_visualization(slc, delivery_type)
    else:
        raise RuntimeError("Unknown email report format")

    subject = __(
        "%(prefix)s %(title)s",
        prefix=config["EMAIL_REPORTS_SUBJECT_PREFIX"],
        title=slc.slice_name,
    )

    if recipients:
        _deliver_email(
            recipients,
            deliver_as_group,
            subject,
            report_content.body,
            report_content.data,
            report_content.images,
        )
    if slack_channel:
        deliver_slack_msg(
            slack_channel,
            subject,
            report_content.slack_message,
            report_content.slack_attachment,
        )


@celery_app.task(
    name="email_reports.send",
    bind=True,
    soft_time_limit=config["EMAIL_ASYNC_TIME_LIMIT_SEC"],
)
def schedule_email_report(  # pylint: disable=unused-argument
    task: Task,
    report_type: ScheduleType,
    schedule_id: int,
    recipients: Optional[str] = None,
    slack_channel: Optional[str] = None,
) -> None:
    model_cls = get_scheduler_model(report_type)
    schedule = db.create_scoped_session().query(model_cls).get(schedule_id)

    # The user may have disabled the schedule. If so, ignore this
    if not schedule or not schedule.active:
        logger.info("Ignoring deactivated schedule")
        return

    recipients = recipients or schedule.recipients
    slack_channel = slack_channel or schedule.slack_channel
    logger.info(
        "Starting report for slack: %s and recipients: %s.", slack_channel, recipients
    )

    if report_type == ScheduleType.dashboard:
        deliver_dashboard(
            schedule.dashboard_id,
            recipients,
            slack_channel,
            schedule.delivery_type,
            schedule.deliver_as_group,
        )
    elif report_type == ScheduleType.slice:
        deliver_slice(
            schedule.slice_id,
            recipients,
            slack_channel,
            schedule.delivery_type,
            schedule.email_format,
            schedule.deliver_as_group,
        )
    else:
        raise RuntimeError("Unknown report type")


@celery_app.task(
    name="alerts.run_query",
    bind=True,
    soft_time_limit=config["EMAIL_ASYNC_TIME_LIMIT_SEC"],
    # TODO: find cause of https://github.com/apache/incubator-superset/issues/10530
    # and remove retry
    autoretry_for=(NoSuchColumnError, ResourceClosedError,),
    retry_kwargs={"max_retries": 5},
    retry_backoff=True,
)
def schedule_alert_query(  # pylint: disable=unused-argument
    task: Task,
    report_type: ScheduleType,
    schedule_id: int,
    recipients: Optional[str] = None,
    slack_channel: Optional[str] = None,
) -> None:
    model_cls = get_scheduler_model(report_type)

    try:
        schedule = db.session.query(model_cls).get(schedule_id)

        # The user may have disabled the schedule. If so, ignore this
        if not schedule or not schedule.active:
            logger.info("Ignoring deactivated alert")
            return

        if report_type == ScheduleType.alert:
            if recipients or slack_channel:
                deliver_alert(schedule.id, recipients, slack_channel)
                return

            if run_alert_query(
                schedule.id, schedule.database_id, schedule.sql, schedule.label
            ):
                # deliver_dashboard OR deliver_slice
                return
        else:
            raise RuntimeError("Unknown report type")
    except NoSuchColumnError as column_error:
        stats_logger.incr("run_alert_task.error.nosuchcolumnerror")
        raise column_error
    except ResourceClosedError as resource_error:
        stats_logger.incr("run_alert_task.error.resourceclosederror")
        raise resource_error


class AlertState:
    ERROR = "error"
    TRIGGER = "trigger"
    PASS = "pass"


def deliver_alert(
    alert_id: int, recipients: Optional[str] = None, slack_channel: Optional[str] = None
) -> None:
    alert = db.session.query(Alert).get(alert_id)

    logging.info("Triggering alert: %s", alert)
    recipients = recipients or alert.recipients
    slack_channel = slack_channel or alert.slack_channel

    if alert.slice:
        alert_content = AlertContent(
            alert.label,
            alert.sql,
            _get_url_path("AlertModelView.show", user_friendly=True, pk=alert_id),
            _get_slice_screenshot(alert.slice.id),
        )
    else:
        # TODO: dashboard delivery!
        alert_content = AlertContent(
            alert.label,
            alert.sql,
            _get_url_path("AlertModelView.show", user_friendly=True, pk=alert_id),
            None,
        )

    if recipients:
        deliver_email_alert(alert_content, recipients)
    if slack_channel:
        deliver_slack_alert(alert_content, slack_channel)


def deliver_email_alert(alert_content: AlertContent, recipients: str) -> None:
    # TODO add sql query results to email
    subject = f"[Superset] Triggered alert: {alert_content.label}"
    deliver_as_group = False
    data = None
    images = {}
    # TODO(JasonD28): add support for emails with no screenshot
    image_url = None
    if alert_content.image_data:
        image_url = alert_content.image_data.url
        if alert_content.image_data.image:
            images = {"screenshot": alert_content.image_data.image}

    body = render_template(
        "email/alert.txt",
        alert_url=alert_content.alert_url,
        label=alert_content.label,
        sql=alert_content.sql,
        image_url=image_url,
    )

    _deliver_email(recipients, deliver_as_group, subject, body, data, images)


def deliver_slack_alert(alert_content: AlertContent, slack_channel: str) -> None:
    subject = __("[Alert] %(label)s", label=alert_content.label)

    image = None
    if alert_content.image_data:
        slack_message = render_template(
            "slack/alert.txt",
            label=alert_content.label,
            sql=alert_content.sql,
            url=alert_content.image_data.url,
            alert_url=alert_content.alert_url,
        )
        image = alert_content.image_data.image
    else:
        slack_message = render_template(
            "slack/alert_no_screenshot.txt",
            label=alert_content.label,
            sql=alert_content.sql,
            alert_url=alert_content.alert_url,
        )

    deliver_slack_msg(
        slack_channel, subject, slack_message, image,
    )


def run_alert_query(
    alert_id: int, database_id: int, sql: str, label: str
) -> Optional[bool]:
    """
    Execute alert.sql and return value if any rows are returned
    """
    logger.info("Processing alert ID: %i", alert_id)
    database = db.session.query(Database).get(database_id)
    if not database:
        logger.error("Alert database not preset")
        return None

    if not sql:
        logger.error("Alert SQL not preset")
        return None

    parsed_query = ParsedQuery(sql)
    sql = parsed_query.stripped()

    state = None
    dttm_start = datetime.utcnow()

    df = pd.DataFrame()
    try:
        logger.info("Evaluating SQL for alert <%s:%s>", alert_id, label)
        df = database.get_df(sql)
    except Exception as exc:  # pylint: disable=broad-except
        state = AlertState.ERROR
        logging.exception(exc)
        logging.error("Failed at evaluating alert: %s (%s)", label, alert_id)

    dttm_end = datetime.utcnow()
    last_eval_dttm = datetime.utcnow()

    if state != AlertState.ERROR:
        if not df.empty:
            # Looking for truthy cells
            for row in df.to_records():
                if any(row):
                    state = AlertState.TRIGGER
                    deliver_alert(alert_id)
                    break
        if not state:
            state = AlertState.PASS

    db.session.commit()
    alert = db.session.query(Alert).get(alert_id)
    if state != AlertState.ERROR:
        alert.last_eval_dttm = last_eval_dttm
    alert.last_state = state
    alert.logs.append(
        AlertLog(
            scheduled_dttm=dttm_start,
            dttm_start=dttm_start,
            dttm_end=dttm_end,
            state=state,
        )
    )
    db.session.commit()

    return None


def next_schedules(
    crontab: str, start_at: datetime, stop_at: datetime, resolution: int = 0
) -> Iterator[datetime]:
    crons = croniter.croniter(crontab, start_at - timedelta(seconds=1))
    previous = start_at - timedelta(days=1)

    for eta in crons.all_next(datetime):
        # Do not cross the time boundary
        if eta >= stop_at:
            break

        if eta < start_at:
            continue

        # Do not allow very frequent tasks
        if eta - previous < timedelta(seconds=resolution):
            continue

        yield eta
        previous = eta


def schedule_window(
    report_type: str, start_at: datetime, stop_at: datetime, resolution: int
) -> None:
    """
    Find all active schedules and schedule celery tasks for
    each of them with a specific ETA (determined by parsing
    the cron schedule for the schedule)
    """
    model_cls = get_scheduler_model(report_type)

    if not model_cls:
        return None

    dbsession = db.create_scoped_session()
    schedules = dbsession.query(model_cls).filter(model_cls.active.is_(True))

    for schedule in schedules:
        logging.info("Processing schedule %s", schedule)
        args = (report_type, schedule.id)
        schedule_start_at = start_at

        if (
            hasattr(schedule, "last_eval_dttm")
            and schedule.last_eval_dttm
            and schedule.last_eval_dttm > start_at
        ):
            schedule_start_at = schedule.last_eval_dttm + timedelta(seconds=1)

        # Schedule the job for the specified time window
        for eta in next_schedules(
            schedule.crontab, schedule_start_at, stop_at, resolution=resolution
        ):
            get_scheduler_action(report_type).apply_async(args, eta=eta)  # type: ignore
            break

    return None


def get_scheduler_action(report_type: str) -> Optional[Callable[..., Any]]:
    if report_type == ScheduleType.dashboard:
        return schedule_email_report
    if report_type == ScheduleType.slice:
        return schedule_email_report
    if report_type == ScheduleType.alert:
        return schedule_alert_query
    return None


@celery_app.task(name="email_reports.schedule_hourly")
def schedule_hourly() -> None:
    """ Celery beat job meant to be invoked hourly """

    if not config["ENABLE_SCHEDULED_EMAIL_REPORTS"]:
        logger.info("Scheduled email reports not enabled in config")
        return

    resolution = config["EMAIL_REPORTS_CRON_RESOLUTION"] * 60

    # Get the top of the hour
    start_at = datetime.now(tzlocal()).replace(microsecond=0, second=0, minute=0)
    stop_at = start_at + timedelta(seconds=3600)
    schedule_window(ScheduleType.dashboard, start_at, stop_at, resolution)
    schedule_window(ScheduleType.slice, start_at, stop_at, resolution)


@celery_app.task(name="alerts.schedule_check")
def schedule_alerts() -> None:
    """ Celery beat job meant to be invoked every minute to check alerts """
    resolution = 0
    now = datetime.utcnow()
    start_at = now - timedelta(
        seconds=3600
    )  # process any missed tasks in the past hour
    stop_at = now + timedelta(seconds=1)

    schedule_window(ScheduleType.alert, start_at, stop_at, resolution)
