/**
 * @remix-run/dev v2.2.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var events = require('events');
var multipart = require('parse-multipart-data');
var setCookieParser = require('set-cookie-parser');
var stream = require('stream');
var undici = require('undici');
var node = require('@remix-run/node');
var serverRuntime = require('@remix-run/server-runtime');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var multipart__default = /*#__PURE__*/_interopDefaultLegacy(multipart);

// @ts-nocheck
node.installGlobals();
function nodeToWeb(nodeStream) {
  let destroyed = false;
  let listeners = {};
  function start(controller) {
    listeners["data"] = onData;
    listeners["end"] = onData;
    listeners["end"] = onDestroy;
    listeners["close"] = onDestroy;
    listeners["error"] = onDestroy;
    for (let name in listeners) nodeStream.on(name, listeners[name]);
    nodeStream.pause();
    function onData(chunk) {
      if (destroyed) return;
      controller.enqueue(chunk);
      nodeStream.pause();
    }
    function onDestroy(err) {
      if (destroyed) return;
      destroyed = true;
      for (let name in listeners) nodeStream.removeListener(name, listeners[name]);
      if (err) controller.error(err);else controller.close();
    }
  }
  function pull() {
    if (destroyed) return;
    nodeStream.resume();
  }
  function cancel() {
    destroyed = true;
    for (let name in listeners) nodeStream.removeListener(name, listeners[name]);
    nodeStream.push(null);
    nodeStream.pause();
    if (nodeStream.destroy) nodeStream.destroy();else if (nodeStream.close) nodeStream.close();
  }
  return new ReadableStream({
    start: start,
    pull: pull,
    cancel: cancel
  });
}
function createHeaders(requestHeaders) {
  let headers = new undici.Headers();
  for (let [key, values] of Object.entries(requestHeaders)) {
    if (values) {
      if (Array.isArray(values)) {
        for (let value of values) {
          headers.append(key, value);
        }
      } else {
        headers.set(key, values);
      }
    }
  }
  return headers;
}
class NodeRequest extends undici.Request {
  constructor(input, init) {
    if (init && init.data && init.data.on) {
      var _init$data$headers$co;
      init = {
        duplex: "half",
        ...init,
        body: (_init$data$headers$co = init.data.headers["content-type"]) !== null && _init$data$headers$co !== void 0 && _init$data$headers$co.includes("x-www") ? init.data : nodeToWeb(init.data)
      };
    }
    super(input, init);
  }

  // async json() {
  //   return JSON.parse(await this.text());
  // }

  async buffer() {
    return Buffer.from(await super.arrayBuffer());
  }

  // async text() {
  //   return (await this.buffer()).toString();
  // }

  // @ts-ignore
  async formData() {
    if (this.headers.get("content-type") === "application/x-www-form-urlencoded") {
      return await super.formData();
    } else {
      let data = await this.buffer();
      let input = multipart__default["default"].parse(data, this.headers.get("content-type").replace("multipart/form-data; boundary=", ""));
      let form = new undici.FormData();
      input.forEach(({
        name,
        data,
        filename,
        type
      }) => {
        // file fields have Content-Type set,
        // whereas non-file fields must not
        // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#multipart-form-data
        let isFile = type !== undefined;
        if (isFile) {
          let value = new undici.File([data], filename, {
            type
          });
          form.append(name, value, filename);
        } else {
          let value = data.toString("utf-8");
          form.append(name, value);
        }
      });
      return form;
    }
  }

  // @ts-ignore
  clone() {
    /** @type {BaseNodeRequest & { buffer?: () => Promise<Buffer>; formData?: () => Promise<FormData> }}  */
    let el = super.clone();
    el.buffer = this.buffer.bind(el);
    el.formData = this.formData.bind(el);
    return el;
  }
}
function createRequest(req) {
  let origin = req.headers.origin && "null" !== req.headers.origin ? req.headers.origin : `http://${req.headers.host}`;
  let url = new URL(req.url, origin);
  let init = {
    method: req.method,
    headers: createHeaders(req.headers),
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
    data: ["POST", "PUT", "DELETE", "PATCH"].includes(req.method) ? req : null
  };
  return new NodeRequest(url.href, init);
}
async function handleNodeResponse(webRes, res) {
  res.statusCode = webRes.status;
  res.statusMessage = webRes.statusText;
  for (let [name, value] of webRes.headers) {
    if (name === "set-cookie") {
      res.setHeader(name, setCookieParser.splitCookiesString(value));
    } else res.setHeader(name, value);
  }
  if (webRes.body) {
    let readable = stream.Readable.from(webRes.body);
    readable.pipe(res);
    await events.once(readable, "end");
  } else {
    res.end();
  }
}
let createRequestHandler = (build, {
  mode = "production",
  criticalCss
}) => {
  let handler = serverRuntime.createRequestHandler(build, mode);
  return async (req, res) => {
    let request = createRequest(req);
    let response = await handler(request, {}, {
      __criticalCss: criticalCss
    });
    handleNodeResponse(response, res);
  };
};

exports.createRequestHandler = createRequestHandler;
