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

var cacache = require('cacache');

const putJson = async (cachePath, key, data) => cacache.put(cachePath, key, JSON.stringify(data));
const getJson = async (cachePath, key) => cacache.get(cachePath, key).then(obj => JSON.parse(obj.data.toString("utf-8")));

exports.getJson = getJson;
exports.putJson = putJson;
