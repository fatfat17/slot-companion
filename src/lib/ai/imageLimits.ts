export const IMAGE_COMPRESSION = {
  maxLongEdge: 1920,
  initialJpegQuality: 0.82,
  minimumJpegQuality: 0.75,
  targetBytes: Math.floor(1.9 * 1024 * 1024),
  hardMaxBytes: Math.floor(3.8 * 1024 * 1024),
  maxRequestBytes: Math.floor(4.2 * 1024 * 1024),
} as const;

export const SELECTION_IMAGE_COMPRESSION = {
  maxImages: 5,
  maxLongEdge: 1280,
  initialJpegQuality: 0.8,
  minimumJpegQuality: 0.68,
  targetBytes: Math.floor(640 * 1024),
  hardMaxBytes: Math.floor(760 * 1024),
} as const;

export function isSupportedImageFile(file:Pick<File,"name"|"type">){
  return file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
}

export function fitWithinLongEdge(width:number,height:number,maxLongEdge:number=IMAGE_COMPRESSION.maxLongEdge){
  const scale=Math.min(1,maxLongEdge/Math.max(width,height));
  return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}

export function formatImageBytes(bytes:number){
  if(bytes<1024)return `${bytes} B`;
  if(bytes<1024*1024)return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(2)} MB`;
}
