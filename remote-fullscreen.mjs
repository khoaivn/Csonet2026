// Remote requests cannot supply the browser's required local user activation.
export function createRemoteFullscreen(doc,onChange=()=>{}){
 let pending=false,prompt;
 const active=()=>!!(doc.fullscreenElement||doc.webkitFullscreenElement);
 const state=()=>({fullscreen:active(),fullscreenPending:pending});
 function clear(){pending=false;if(prompt)prompt.hidden=true;}
 function show(){
  pending=true;
  if(!prompt){
   prompt=doc.createElement('button');prompt.type='button';prompt.className='remote-fullscreen-prompt';
   prompt.textContent='Điện thoại yêu cầu toàn màn hình. Bấm vào đây để bật';
   prompt.onclick=()=>set(true);doc.body.append(prompt);
  }
  prompt.hidden=false;
 }
 async function set(enabled){
  if(typeof enabled!=='boolean')return;
  clear();
  try{
   if(enabled&&!active()){
    const enter=doc.documentElement.requestFullscreen||doc.documentElement.webkitRequestFullscreen;
    if(!enter)throw Error('Fullscreen unavailable');
    await enter.call(doc.documentElement);
   }else if(!enabled&&active()){
    const exit=doc.exitFullscreen||doc.webkitExitFullscreen;
    if(!exit)throw Error('Fullscreen unavailable');
    await exit.call(doc);
   }
  }catch{if(enabled&&!active())show();}
  onChange(state());
 }
 function changed(){clear();onChange(state());}
 doc.addEventListener('fullscreenchange',changed);
 doc.addEventListener('webkitfullscreenchange',changed);
 return {state,set,cancel:()=>{clear();onChange(state());}};
}
