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

var parser = require('@babel/parser');
var t = require('@babel/types');
var traverse = require('@babel/traverse');
var generate = require('@babel/generator');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var t__namespace = /*#__PURE__*/_interopNamespace(t);
var traverse__default = /*#__PURE__*/_interopDefaultLegacy(traverse);
var generate__default = /*#__PURE__*/_interopDefaultLegacy(generate);

// Adapted from https://github.com/egoist/babel-plugin-eliminator/blob/d29859396b7708b7f7abbacdd951cbbc80902f00/src/index.ts
function getIdentifier(path) {
  let parentPath = path.parentPath;
  if (parentPath.type === "VariableDeclarator") {
    let variablePath = parentPath;
    let name = variablePath.get("id");
    return name.node.type === "Identifier" ? name : null;
  }
  if (parentPath.type === "AssignmentExpression") {
    let variablePath = parentPath;
    let name = variablePath.get("left");
    return name.node.type === "Identifier" ? name : null;
  }
  if (path.node.type === "ArrowFunctionExpression") {
    return null;
  }
  return path.node.id && path.node.id.type === "Identifier" ? path.get("id") : null;
}
function isIdentifierReferenced(ident) {
  let binding = ident.scope.getBinding(ident.node.name);
  if (binding !== null && binding !== void 0 && binding.referenced) {
    // Functions can reference themselves, so we need to check if there's a
    // binding outside the function scope or not.
    if (binding.path.type === "FunctionDeclaration") {
      return !binding.constantViolations.concat(binding.referencePaths)
      // Check that every reference is contained within the function:
      .every(ref => ref.findParent(parent => parent === (binding === null || binding === void 0 ? void 0 : binding.path)));
    }
    return true;
  }
  return false;
}
const removeExports = (source, exportsToRemove) => {
  let document = parser.parse(source, {
    sourceType: "module"
  });
  let generateCode = () => generate__default["default"](document).code;
  let referencedIdentifiers = new Set();
  let removedExports = new Set();
  let markImport = path => {
    let local = path.get("local");
    if (isIdentifierReferenced(local)) {
      referencedIdentifiers.add(local);
    }
  };
  let markFunction = path => {
    let identifier = getIdentifier(path);
    if (identifier !== null && identifier !== void 0 && identifier.node && isIdentifierReferenced(identifier)) {
      referencedIdentifiers.add(identifier);
    }
  };
  traverse__default["default"](document, {
    VariableDeclarator(variablePath) {
      if (variablePath.node.id.type === "Identifier") {
        let local = variablePath.get("id");
        if (isIdentifierReferenced(local)) {
          referencedIdentifiers.add(local);
        }
      } else if (variablePath.node.id.type === "ObjectPattern") {
        let pattern = variablePath.get("id");
        let properties = pattern.get("properties");
        properties.forEach(p => {
          let local = p.get(p.node.type === "ObjectProperty" ? "value" : p.node.type === "RestElement" ? "argument" : function () {
            throw new Error("invariant");
          }());
          if (isIdentifierReferenced(local)) {
            referencedIdentifiers.add(local);
          }
        });
      } else if (variablePath.node.id.type === "ArrayPattern") {
        let pattern = variablePath.get("id");
        let elements = pattern.get("elements");
        elements.forEach(element => {
          var _element$node, _element$node2;
          let local;
          if (((_element$node = element.node) === null || _element$node === void 0 ? void 0 : _element$node.type) === "Identifier") {
            local = element;
          } else if (((_element$node2 = element.node) === null || _element$node2 === void 0 ? void 0 : _element$node2.type) === "RestElement") {
            local = element.get("argument");
          } else {
            return;
          }
          if (isIdentifierReferenced(local)) {
            referencedIdentifiers.add(local);
          }
        });
      }
    },
    FunctionDeclaration: markFunction,
    FunctionExpression: markFunction,
    ArrowFunctionExpression: markFunction,
    ImportSpecifier: markImport,
    ImportDefaultSpecifier: markImport,
    ImportNamespaceSpecifier: markImport,
    ExportNamedDeclaration(path) {
      let shouldRemove = false;

      // Handle re-exports: export { preload } from './foo'
      path.node.specifiers = path.node.specifiers.filter(spec => {
        if (spec.exported.type !== "Identifier") {
          return true;
        }
        let {
          name
        } = spec.exported;
        for (let namedExport of exportsToRemove) {
          if (name === namedExport) {
            removedExports.add(namedExport);
            return false;
          }
        }
        return true;
      });
      let {
        declaration
      } = path.node;

      // When no re-exports are left, remove the path
      if (!declaration && path.node.specifiers.length === 0) {
        shouldRemove = true;
      }
      if (declaration && declaration.type === "VariableDeclaration") {
        declaration.declarations = declaration.declarations.filter(declarator => {
          for (let name of exportsToRemove) {
            if (declarator.id.name === name) {
              removedExports.add(name);
              return false;
            }
          }
          return true;
        });
        if (declaration.declarations.length === 0) {
          shouldRemove = true;
        }
      }
      if (declaration && declaration.type === "FunctionDeclaration") {
        for (let name of exportsToRemove) {
          var _declaration$id;
          if (((_declaration$id = declaration.id) === null || _declaration$id === void 0 ? void 0 : _declaration$id.name) === name) {
            shouldRemove = true;
            removedExports.add(name);
          }
        }
      }
      if (shouldRemove) {
        path.remove();
      }
    }
  });
  if (removedExports.size === 0) {
    // No server-specific exports found so there's
    // no need to remove unused references
    return generateCode();
  }
  let referencesRemovedInThisPass;
  let sweepFunction = path => {
    let identifier = getIdentifier(path);
    if (identifier !== null && identifier !== void 0 && identifier.node && referencedIdentifiers.has(identifier) && !isIdentifierReferenced(identifier)) {
      ++referencesRemovedInThisPass;
      if (t__namespace.isAssignmentExpression(path.parentPath.node) || t__namespace.isVariableDeclarator(path.parentPath.node)) {
        path.parentPath.remove();
      } else {
        path.remove();
      }
    }
  };
  let sweepImport = path => {
    let local = path.get("local");
    if (referencedIdentifiers.has(local) && !isIdentifierReferenced(local)) {
      ++referencesRemovedInThisPass;
      path.remove();
      if (path.parent.specifiers.length === 0) {
        path.parentPath.remove();
      }
    }
  };

  // Traverse again to remove unused references. This happens at least once,
  // then repeats until no more references are removed.
  do {
    referencesRemovedInThisPass = 0;
    traverse__default["default"](document, {
      Program(path) {
        path.scope.crawl();
      },
      // eslint-disable-next-line no-loop-func
      VariableDeclarator(variablePath) {
        if (variablePath.node.id.type === "Identifier") {
          let local = variablePath.get("id");
          if (referencedIdentifiers.has(local) && !isIdentifierReferenced(local)) {
            ++referencesRemovedInThisPass;
            variablePath.remove();
          }
        } else if (variablePath.node.id.type === "ObjectPattern") {
          let pattern = variablePath.get("id");
          let beforeCount = referencesRemovedInThisPass;
          let properties = pattern.get("properties");
          properties.forEach(property => {
            let local = property.get(property.node.type === "ObjectProperty" ? "value" : property.node.type === "RestElement" ? "argument" : function () {
              throw new Error("invariant");
            }());
            if (referencedIdentifiers.has(local) && !isIdentifierReferenced(local)) {
              ++referencesRemovedInThisPass;
              property.remove();
            }
          });
          if (beforeCount !== referencesRemovedInThisPass && pattern.get("properties").length < 1) {
            variablePath.remove();
          }
        } else if (variablePath.node.id.type === "ArrayPattern") {
          let pattern = variablePath.get("id");
          let beforeCount = referencesRemovedInThisPass;
          let elements = pattern.get("elements");
          elements.forEach(e => {
            var _e$node, _e$node2;
            let local;
            if (((_e$node = e.node) === null || _e$node === void 0 ? void 0 : _e$node.type) === "Identifier") {
              local = e;
            } else if (((_e$node2 = e.node) === null || _e$node2 === void 0 ? void 0 : _e$node2.type) === "RestElement") {
              local = e.get("argument");
            } else {
              return;
            }
            if (referencedIdentifiers.has(local) && !isIdentifierReferenced(local)) {
              ++referencesRemovedInThisPass;
              e.remove();
            }
          });
          if (beforeCount !== referencesRemovedInThisPass && pattern.get("elements").length < 1) {
            variablePath.remove();
          }
        }
      },
      FunctionDeclaration: sweepFunction,
      FunctionExpression: sweepFunction,
      ArrowFunctionExpression: sweepFunction,
      ImportSpecifier: sweepImport,
      ImportDefaultSpecifier: sweepImport,
      ImportNamespaceSpecifier: sweepImport
    });
  } while (referencesRemovedInThisPass);
  return generateCode();
};

exports.removeExports = removeExports;
