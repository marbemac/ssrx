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

var channel = require('../channel.js');

const createLazyValue = args => {
  let channel$1;
  return {
    async get() {
      // Create channel and request lazy value on first `get` call
      if (!channel$1) {
        channel$1 = channel.create();
        try {
          channel$1.ok(await args.get());
        } catch (err) {
          channel$1.err(err);
        }
      }

      // Share the same result with all callers
      let result = await channel$1.result;
      if (!result.ok) {
        throw result.error;
      }
      return result.value;
    },
    cancel() {
      var _args$onCancel;
      (_args$onCancel = args.onCancel) === null || _args$onCancel === void 0 ? void 0 : _args$onCancel.call(args, {
        resolve: value => {
          var _channel;
          return (_channel = channel$1) === null || _channel === void 0 ? void 0 : _channel.ok(value);
        },
        reject: error => {
          var _channel2;
          return (_channel2 = channel$1) === null || _channel2 === void 0 ? void 0 : _channel2.err(error);
        }
      });
    }
  };
};

exports.createLazyValue = createLazyValue;
