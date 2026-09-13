import { readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const [, , encodedPath, sourcePath, outputPath] = process.argv;
if (!encodedPath || !sourcePath || !outputPath) {
  throw new Error("Usage: node scripts/install-generated-image.mjs <base64-file> <source-image> <output-image>");
}

const projectRoot = process.cwd();
const source = resolve(projectRoot, sourcePath);
const output = resolve(projectRoot, outputPath);
const assetsRoot = resolve(projectRoot, "src", "assets");
if (!output.startsWith(assetsRoot)) throw new Error("Output must stay inside src/assets");

const metadata = await sharp(source).metadata();
const encoded = (await readFile(resolve(encodedPath), "utf8")).replace(/\s+/g, "");
const input = Buffer.from(encoded, "base64");
await mkdir(dirname(output), { recursive: true });
await sharp(input)
  .resize(metadata.width, metadata.height, { fit: "cover", position: "centre" })
  .webp({ quality: 88, effort: 5 })
  .toFile(output);

console.log(JSON.stringify({ output, width: metadata.width, height: metadata.height }));
