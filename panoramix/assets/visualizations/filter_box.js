// JS
var d3 = window.d3 || require('d3');

// CSS
require('./filter_box.css');

function filterBox(slice) {
  var filtersObj = {};
  var d3token = d3.select(slice.selector);

  var fltChanged = function() {
    for (var filter in filtersObj) {
      var obj = filtersObj[filter];
      var val = obj.val();
      var vals = [];
      if (val !== '') {
        vals = val.split(',');
      }
      slice.setFilter(filter, vals);
    }
  };

  var refresh = function() {
    d3token.selectAll("*").remove();
    var container = d3token
      .append('div')
      .classed('padded', true);

    $.getJSON(slice.jsonEndpoint(), function(payload) {
        var maxes = {};
        for (var filter in payload.data) {
          var data = payload.data[filter];
          maxes[filter] = d3.max(data, function(d) {
            return d.metric;
          });
          var id = 'fltbox__' + filter;

          var div = container.append('div');
          div.append("label").text(filter);
          var sel = div
            .append('div')
            .attr('name', filter)
            .classed('form-control', true)
            .attr('multiple', '')
            .attr('id', id);

          filtersObj[filter] = $('#' + id).select2({
              placeholder: "Select [" + filter + ']',
              containment: 'parent',
              dropdownAutoWidth: true,
              data: data,
              multiple: true,
              formatResult: function(result, container, query, escapeMarkup) {
                var perc = Math.round((result.metric / maxes[result.filter]) * 100);
                var style = 'padding: 2px 5px;';
                style += "background-image: ";
                style += "linear-gradient(to right, lightgrey, lightgrey " + perc + "%, rgba(0,0,0,0) " + perc + "%";

                $(container).attr('style', 'padding: 0px; background: white;');
                $(container).addClass('filter_box');
                return '<div style="' + style + '"><span>' + result.text + '</span></div>';
              },
            })
            .on('change', fltChanged);
        }
        slice.done();
      })
      .fail(function(xhr) {
        slice.error(xhr.responseText);
      });
  };
  return {
    render: refresh,
    resize: refresh,
  };
}

module.exports = filterBox;
