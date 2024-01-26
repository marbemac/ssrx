// src/request.ts
import { Http2ServerRequest } from "http2";
import { Readable } from "stream";
var newRequestFromIncoming = (method, url, incoming) => {
  const headerRecord = [];
  const rawHeaders = incoming.rawHeaders;
  for (let i = 0; i < rawHeaders.length; i += 2) {
    const { [i]: key, [i + 1]: value } = rawHeaders;
    if (key.charCodeAt(0) !== /*:*/
    58) {
      headerRecord.push([key, value]);
    }
  }
  const init = {
    method,
    headers: headerRecord
  };
  if (!(method === "GET" || method === "HEAD")) {
    init.body = Readable.toWeb(incoming);
    init.duplex = "half";
  }
  return new Request(url, init);
};
var getRequestCache = Symbol("getRequestCache");
var requestCache = Symbol("requestCache");
var incomingKey = Symbol("incomingKey");
var urlKey = Symbol("urlKey");
var requestPrototype = {
  get method() {
    return this[incomingKey].method || "GET";
  },
  get url() {
    return this[urlKey];
  },
  [getRequestCache]() {
    return this[requestCache] ||= newRequestFromIncoming(
      this.method,
      this[urlKey],
      this[incomingKey]
    );
  }
};
[
  "body",
  "bodyUsed",
  "cache",
  "credentials",
  "destination",
  "headers",
  "integrity",
  "mode",
  "redirect",
  "referrer",
  "referrerPolicy",
  "signal"
].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    get() {
      return this[getRequestCache]()[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(requestPrototype, k, {
    value: function() {
      return this[getRequestCache]()[k]();
    }
  });
});
Object.setPrototypeOf(requestPrototype, global.Request.prototype);
var newRequest = (incoming) => {
  const req = Object.create(requestPrototype);
  req[incomingKey] = incoming;
  req[urlKey] = new URL(
    `http://${incoming instanceof Http2ServerRequest ? incoming.authority : incoming.headers.host}${incoming.url}`
  ).href;
  return req;
};
export {
  newRequest
};
