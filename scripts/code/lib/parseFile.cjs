"use strict";

const parser = require("@babel/parser");

const JSX_PLUGINS = ["jsx", "typescript", "decorators-legacy", "classProperties"];
const TS_PLUGINS = ["typescript", "decorators-legacy", "classProperties"];

function parseFile(absPath, code) {
  const isJsx = /\.(tsx|jsx)$/.test(absPath);

  const plugins = isJsx ? JSX_PLUGINS : TS_PLUGINS;

  try {
    return parser.parse(code, { sourceType: "module", plugins });
  } catch (e) {
    if (!isJsx) {
      try {
        return parser.parse(code, { sourceType: "module", plugins: JSX_PLUGINS });
      } catch {
        throw e;
      }
    }
    throw e;
  }
}

module.exports = { parseFile };
