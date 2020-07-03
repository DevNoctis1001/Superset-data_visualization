import SupersetClientClass from './SupersetClientClass';

export type Body = RequestInit['body'];
export type Cache = RequestInit['cache'];
export type Credentials = RequestInit['credentials'];
export type Endpoint = string;
export type FetchRetryOptions = {
  retries?: number;
  retryDelay?: number | ((attempt: number, error: Error, response: Response) => number);
  retryOn?: number[] | ((attempt: number, error: Error, response: Response) => boolean);
};
export type Headers = { [k: string]: string };
export type Host = string;

export type JsonPrimitive = string | number | boolean | null;
/**
 * More strict JSON value types. If this fails to satisfy TypeScript when using
 * as function arguments, use `JsonObject` instead. `StrictJsonObject` helps make
 * sure all values are plain objects, but it does not accept specific types when
 * used as function arguments.
 * (Ref: https://github.com/microsoft/TypeScript/issues/15300).
 */
export type StrictJsonValue = JsonPrimitive | StrictJsonObject | StrictJsonArray;
export type StrictJsonArray = StrictJsonValue[];
/**
 * More strict JSON objects that makes sure all values are plain objects.
 * If this fails to satisfy TypeScript when using as function arguments,
 * use `JsonObject` instead.
 * (Ref: https://github.com/microsoft/TypeScript/issues/15300).
 */
export type StrictJsonObject = { [member: string]: StrictJsonValue };

export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonArray = JsonValue[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JsonObject = { [member: string]: any };

/**
 * Post form or JSON payload, if string, will parse with JSON.parse
 */
export type Payload = JsonObject | string;

export type Method = RequestInit['method'];
export type Mode = RequestInit['mode'];
export type Redirect = RequestInit['redirect'];
export type ClientTimeout = number | undefined;
export type ParseMethod = 'json' | 'text' | 'raw' | null | undefined;
export type Signal = RequestInit['signal'];
export type Stringify = boolean;
export type Url = string;

export interface RequestBase {
  body?: Body;
  credentials?: Credentials;
  fetchRetryOptions?: FetchRetryOptions;
  headers?: Headers;
  host?: Host;
  mode?: Mode;
  method?: Method;
  postPayload?: Payload;
  jsonPayload?: Payload;
  signal?: Signal;
  stringify?: Stringify;
  timeout?: ClientTimeout;
}

export interface CallApi extends RequestBase {
  url: Url;
  cache?: Cache;
  redirect?: Redirect;
}

export interface RequestWithEndpoint extends RequestBase {
  endpoint: Endpoint;
  url?: Url;
}

export interface RequestWithUrl extends RequestBase {
  url: Url;
  endpoint?: Endpoint;
}

// this make sure at least one of `url` or `endpoint` is set
export type RequestConfig = RequestWithEndpoint | RequestWithUrl;

export interface JsonResponse {
  response: Response;
  json: JsonObject;
}

export interface TextResponse {
  response: Response;
  text: string;
}

export type CsrfToken = string;
export type CsrfPromise = Promise<string | undefined>;
export type Protocol = 'http:' | 'https:';

export interface ClientConfig {
  baseUrl?: string;
  host?: Host;
  protocol?: Protocol;
  credentials?: Credentials;
  csrfToken?: CsrfToken;
  fetchRetryOptions?: FetchRetryOptions;
  headers?: Headers;
  mode?: Mode;
  timeout?: ClientTimeout;
}

export interface SupersetClientInterface
  extends Pick<
    SupersetClientClass,
    'delete' | 'get' | 'post' | 'put' | 'request' | 'init' | 'isAuthenticated' | 'reAuthenticate'
  > {
  configure: (config?: ClientConfig) => SupersetClientClass;
  getInstance: (maybeClient?: SupersetClientClass) => SupersetClientClass;
  reset: () => void;
}

export type SupersetClientResponse = Response | JsonResponse | TextResponse;
