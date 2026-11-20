// Serve Bujhi's OCR engine from our own origin so OCR does not depend on a third-party CDN.
// eng.traineddata.gz is committed (public/ocr); the engine files are copied from node_modules.
import { copyFileSync, mkdirSync } from "node:fs";
const out = new URL("../public/ocr/", import.meta.url);
mkdirSync(out, { recursive: true });
const core = "../node_modules/tesseract.js-core/";
const files = [["../node_modules/tesseract.js/dist/worker.min.js", "worker.min.js"],
  ...["", "simd-", "relaxedsimd-"].map(v => [`${core}tesseract-core-${v}lstm.wasm.js`, `tesseract-core-${v}lstm.wasm.js`])];
for (const [from, to] of files) copyFileSync(new URL(from, import.meta.url), new URL(to, out));
