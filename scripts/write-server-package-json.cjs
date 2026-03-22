const { mkdirSync, writeFileSync } = require("node:fs");
const { dirname, resolve } = require("node:path");

const outputPath = resolve(__dirname, "..", "dist", "server", "package.json");

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, '{\n  "type": "commonjs"\n}\n');
