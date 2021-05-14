const filename = "moderna.json";
const maxLineLength = 157;
const indentWidth = 3;
const outputPrefix = "2d/moderna-";

const fs = require("fs");
const path = require("path");

function lineBreak(seq, max) {
  return seq.match(new RegExp(`.{1,${max}}`, "g"));
}

const bytes = fs.readFileSync(filename);
const sequence = JSON.parse(bytes);

const lines = sequence
  .map(([depth, line]) => [indentWidth * depth, line])
  .flatMap(([dx, line]) =>
    lineBreak(line, maxLineLength - dx).map((l) => [dx, l])
  );

const symbolsByBase = lines
  .flatMap(([dx, line], lineNumber) =>
    Array.from(line).map((c, x) => ({
      base: c,
      x: dx + x,
      y: lineNumber,
    }))
  )
  .reduce(
    (o, symbol) => ({
      ...o,
      [symbol.base]: [...(o[symbol.base] || []), toShape(symbol)],
    }),
    {}
  );

function toShape({ base, x, y }) {
  // Could do something with base if desired
  return `<rect x="${x}" y="${y}" width="1" height="1"/>`;
}

const viewBox = `0 0 ${maxLineLength} ${lines.length}`;
Object.keys(symbolsByBase).forEach((base) => {
  const shapes = symbolsByBase[base].join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${shapes}</svg>`;
  const outputFilename = `${outputPrefix}${base}.svg`;
  fs.writeFileSync(outputFilename, svg);
});
