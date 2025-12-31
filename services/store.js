const fs = require("fs");
const path = require("path");

function filePath(rel) {
  return path.join(__dirname, "..", rel);
}

function readJson(rel) {
  const p = filePath(rel);
  const raw = fs.readFileSync(p, "utf-8");
  return JSON.parse(raw);
}

function writeJson(rel, data) {
  const p = filePath(rel);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { readJson, writeJson };
