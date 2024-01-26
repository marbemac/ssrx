// src/utils.ts
var buildOutgoingHttpHeaders = (headers) => {
  const res = {};
  const cookies = [];
  for (const [k, v] of headers) {
    if (k === "set-cookie") {
      cookies.push(v);
    } else {
      res[k] = v;
    }
  }
  if (cookies.length > 0) {
    res["set-cookie"] = cookies;
  }
  res["content-type"] ??= "text/plain;charset=UTF-8";
  return res;
};

// src/response.ts
var responseCache = Symbol("responseCache");
var cacheKey = Symbol("cache");
var GlobalResponse = global.Response;
var Response = class _Response {
  #body;
  #init;
  get cache() {
    delete this[cacheKey];
    return this[responseCache] ||= new GlobalResponse(this.#body, this.#init);
  }
  constructor(body, init) {
    this.#body = body;
    if (init instanceof _Response) {
      const cachedGlobalResponse = init[responseCache];
      if (cachedGlobalResponse) {
        this.#init = cachedGlobalResponse;
        this.cache;
        return;
      } else {
        this.#init = init.#init;
      }
    } else {
      this.#init = init;
    }
    if (typeof body === "string" || body instanceof ReadableStream) {
      let headers = init?.headers || { "content-type": "text/plain;charset=UTF-8" };
      if (headers instanceof Headers) {
        headers = buildOutgoingHttpHeaders(headers);
      }
      ;
      this[cacheKey] = [init?.status || 200, body, headers];
    }
  }
};
[
  "body",
  "bodyUsed",
  "headers",
  "ok",
  "redirected",
  "status",
  "statusText",
  "trailers",
  "type",
  "url"
].forEach((k) => {
  Object.defineProperty(Response.prototype, k, {
    get() {
      return this.cache[k];
    }
  });
});
["arrayBuffer", "blob", "clone", "formData", "json", "text"].forEach((k) => {
  Object.defineProperty(Response.prototype, k, {
    value: function() {
      return this.cache[k]();
    }
  });
});
Object.setPrototypeOf(Response, GlobalResponse);
Object.setPrototypeOf(Response.prototype, GlobalResponse.prototype);
Object.defineProperty(global, "Response", {
  value: Response
});
export {
  GlobalResponse,
  Response,
  cacheKey
};
