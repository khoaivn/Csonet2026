// Convert a touch through the rotated iframe into the actual slide bounds.
export function slidePoint(clientX,clientY,frame,rotated,geometry){
 const u=rotated?(clientY-frame.top)/frame.height:(clientX-frame.left)/frame.width;
 const v=rotated?(frame.right-clientX)/frame.width:(clientY-frame.top)/frame.height;
 const x=(u*geometry.viewportWidth-geometry.left)/geometry.width*1280;
 const y=(v*geometry.viewportHeight-geometry.top)/geometry.height*720;
 return {x:Math.max(0,Math.min(1280,x)),y:Math.max(0,Math.min(720,y))};
}
