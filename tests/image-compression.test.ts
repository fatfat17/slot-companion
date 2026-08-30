import assert from "node:assert/strict";
import test from "node:test";
import { IMAGE_COMPRESSION, fitWithinLongEdge, formatImageBytes, isSupportedImageFile } from "../src/lib/ai/imageLimits.ts";

test("landscape image long edge is reduced to 1920px",()=>{
  assert.deepEqual(fitWithinLongEdge(4032,3024),{width:1920,height:1440});
});

test("portrait image keeps orientation and aspect ratio",()=>{
  assert.deepEqual(fitWithinLongEdge(3024,4032),{width:1440,height:1920});
});

test("small image is not enlarged",()=>{
  assert.deepEqual(fitWithinLongEdge(800,600),{width:800,height:600});
});

test("HEIC and HEIF extensions remain eligible for browser decoding",()=>{
  assert.equal(isSupportedImageFile({name:"machine.HEIC",type:""}),true);
  assert.equal(isSupportedImageFile({name:"machine.heif",type:"application/octet-stream"}),true);
  assert.equal(isSupportedImageFile({name:"notes.pdf",type:"application/pdf"}),false);
});

test("compression limits stay below Vercel-compatible request ceiling",()=>{
  assert.equal(IMAGE_COMPRESSION.maxLongEdge,1920);
  assert.ok(IMAGE_COMPRESSION.initialJpegQuality>=.75&&IMAGE_COMPRESSION.initialJpegQuality<=.85);
  assert.ok(IMAGE_COMPRESSION.targetBytes<2*1024*1024);
  assert.ok(IMAGE_COMPRESSION.hardMaxBytes<4*1024*1024);
  assert.ok(IMAGE_COMPRESSION.hardMaxBytes<IMAGE_COMPRESSION.maxRequestBytes);
  assert.ok(IMAGE_COMPRESSION.maxRequestBytes<4.5*1024*1024);
});

test("image sizes are formatted for the upload summary",()=>{
  assert.equal(formatImageBytes(1536),"1.5 KB");
  assert.equal(formatImageBytes(1572864),"1.50 MB");
});
