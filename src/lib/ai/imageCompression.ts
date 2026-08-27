import { IMAGE_COMPRESSION, fitWithinLongEdge, isSupportedImageFile } from "@/lib/ai/imageLimits";

export type CompressedImage={file:File;originalBytes:number;compressedBytes:number;originalWidth:number;originalHeight:number;width:number;height:number};

type LoadedImage={width:number;height:number;draw:(context:CanvasRenderingContext2D,width:number,height:number)=>void;close:()=>void};

async function loadImage(file:File):Promise<LoadedImage>{
  if(typeof createImageBitmap==="function"){
    try{
      const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"});
      return {width:bitmap.width,height:bitmap.height,draw:(context,width,height)=>context.drawImage(bitmap,0,0,width,height),close:()=>bitmap.close()};
    }catch{}
  }
  const url=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const element=new Image();element.onload=()=>resolve(element);element.onerror=()=>reject(new Error("decode_failed"));element.src=url});
    return {width:image.naturalWidth,height:image.naturalHeight,draw:(context,width,height)=>context.drawImage(image,0,0,width,height),close:()=>{}};
  }finally{URL.revokeObjectURL(url)}
}

function canvasBlob(canvas:HTMLCanvasElement,quality:number){
  return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error("encode_failed")),"image/jpeg",quality));
}

function jpegName(name:string){return `${name.replace(/\.[^.]+$/,"")||"slot-machine"}.jpg`}

export async function compressIdentificationImage(original:File):Promise<CompressedImage>{
  if(!isSupportedImageFile(original))throw new Error("unsupported_image");
  let loaded:LoadedImage;
  try{loaded=await loadImage(original)}catch{throw new Error(/\.(heic|heif)$/i.test(original.name)||/hei[cf]/i.test(original.type)?"heic_decode_failed":"decode_failed")}
  try{
    const initial=fitWithinLongEdge(loaded.width,loaded.height);let width=initial.width,height=initial.height,best:Blob|undefined,bestWidth=width,bestHeight=height;
    const canvas=document.createElement("canvas"),context=canvas.getContext("2d",{alpha:false});
    if(!context)throw new Error("encode_failed");
    for(let resizeAttempt=0;resizeAttempt<5;resizeAttempt+=1){
      canvas.width=width;canvas.height=height;context.fillStyle="#000";context.fillRect(0,0,width,height);loaded.draw(context,width,height);
      for(const quality of [IMAGE_COMPRESSION.initialJpegQuality,0.79,0.77,IMAGE_COMPRESSION.minimumJpegQuality]){
        const blob=await canvasBlob(canvas,quality);if(!best||blob.size<best.size){best=blob;bestWidth=width;bestHeight=height}if(blob.size<=IMAGE_COMPRESSION.targetBytes){best=blob;bestWidth=width;bestHeight=height;break}
      }
      if(best&&best.size<=IMAGE_COMPRESSION.targetBytes)break;
      const reduction=best?Math.max(.65,Math.min(.88,Math.sqrt(IMAGE_COMPRESSION.targetBytes/best.size)*.94)):.82;
      const nextLongEdge=Math.max(640,Math.round(Math.max(width,height)*reduction)),next=fitWithinLongEdge(width,height,nextLongEdge);
      width=next.width;height=next.height;
    }
    if(!best)throw new Error("encode_failed");
    if(best.size>=IMAGE_COMPRESSION.hardMaxBytes)throw new Error("compressed_too_large");
    const file=new File([best],jpegName(original.name),{type:"image/jpeg",lastModified:Date.now()});
    return {file,originalBytes:original.size,compressedBytes:file.size,originalWidth:loaded.width,originalHeight:loaded.height,width:bestWidth,height:bestHeight};
  }finally{loaded.close()}
}
