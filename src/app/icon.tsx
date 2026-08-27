import { ImageResponse } from "next/og";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export default function Icon() { return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#090a0e",color:"#f2c84b",fontSize:154,fontWeight:900,border:"30px solid #f2c84b",borderRadius:112}}>SC</div>,size); }
