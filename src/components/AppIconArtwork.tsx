const GOLD="#f2c84b",RED="#ff5573",INK="#090a0e";

export function AppIconArtwork({dimension}:{dimension:number}){
  const unit=dimension/512;
  return <div style={{position:"relative",display:"flex",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"linear-gradient(145deg,#17130a 0%,#090a0e 52%,#13090d 100%)"}}>
    <div style={{position:"absolute",display:"flex",width:300*unit,height:300*unit,left:70*unit,top:70*unit,border:`${44*unit}px solid ${GOLD}`,borderRightColor:"transparent",borderRadius:"50%",transform:"rotate(-32deg)",boxShadow:`0 0 ${42*unit}px rgba(242,200,75,.16)`}}/>
    <div style={{position:"absolute",display:"flex",width:92*unit,height:92*unit,right:72*unit,top:70*unit,border:`${10*unit}px solid ${INK}`,borderRadius:"50%",background:`radial-gradient(circle at 34% 28%,#ffb3c0 0%,${RED} 36%,#c91f43 100%)`,boxShadow:`0 ${12*unit}px ${28*unit}px rgba(255,85,115,.35)`}}/>
    <div style={{position:"absolute",display:"flex",gap:13*unit,left:155*unit,bottom:86*unit}}>{[0,1,2].map(index=><div key={index} style={{display:"flex",width:54*unit,height:54*unit,alignItems:"center",justifyContent:"center",border:`${6*unit}px solid ${GOLD}`,borderRadius:11*unit,background:index===1?RED:"#15171d"}}><div style={{display:"flex",width:12*unit,height:12*unit,borderRadius:"50%",background:index===1?"#fff4d1":GOLD}}/></div>)}</div>
  </div>
}
