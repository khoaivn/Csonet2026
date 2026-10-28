'use strict';
(async() => {
 if(new URLSearchParams(location.search).has('preview'))return;
 const $ = id => document.getElementById(id);
 const DEFAULT_DATABASE='https://slides-35d62-default-rtdb.asia-southeast1.firebasedatabase.app';
 const FIXED_ROOM='464f25357d6c0340eca766a44c6824ce';
 const controller = document.body.dataset.remote === 'controller';
 let access;
 try{const {authorizeRemote}=await import('./remote-auth.js?v=20261028-auth2');access=await authorizeRemote({controller});}
 catch(error){$('remoteStatus').textContent=error.message;return;}
 let database='', room='', timer, session=null, busy=false, applied='', disposed=false;
 let writeQueue=Promise.resolve();
 let hostSessionId='',phoneSessionId='',fixedController=false;
 let annotationStream=null,previewSlide=-1,connected=false;
 let tool='swipe',gesture=null,stroke=null,laser=null;
 const phoneInk=new Map();
 let annotationPending=null,annotationSending=false,annotationTimer;
 function preview(){return $('remotePreview')?.contentWindow?.deckRemote;}
 function currentAnnotation(){const index=session?.state?.slide??0;return {slide:index,ink:JSON.stringify(phoneInk.get(index)||[]),laser:!!laser,x:laser?.x||0,y:laser?.y||0,at:Date.now()};}
 function queueAnnotation(){
  if(!connected)return;
  annotationPending=currentAnnotation();preview()?.annotation(annotationPending);
  if(!annotationTimer&&!annotationSending)annotationTimer=setTimeout(flushAnnotation,80);
 }
 async function flushAnnotation(){
  annotationTimer=null;if(annotationSending||!annotationPending)return;
  const value=annotationPending;annotationPending=null;annotationSending=true;
  try{await request('/annotation','PUT',value);}catch(error){status('Không gửi được Laser/Pen. Kiểm tra mạng và Publish Rules mới.');}
  finally{annotationSending=false;if(annotationPending)annotationTimer=setTimeout(flushAnnotation,80);}
 }
 async function startAnnotationStream(){
  annotationStream?.close();
  const token=await access.getToken();if(disposed)return;
  annotationStream=new EventSource(`${database}/slideRooms/${room}/annotation.json?auth=${encodeURIComponent(token)}`);
  annotationStream.addEventListener('put',event=>{
   try{const value=JSON.parse(event.data);if(value.path==='/'&&value.data)window.deckRemote.annotation(value.data);}catch{status('Không đọc được dữ liệu Laser/Pen.');}
  });
  for(const name of ['cancel','auth_revoked'])annotationStream.addEventListener(name,()=>{annotationStream.close();status('Kết nối Laser/Pen đã đóng. Kiểm tra Rules hoặc tạo phòng mới.');});
 }
 function setTool(value){
  tool=value;gesture=null;stroke=null;laser=null;
  document.querySelectorAll('[data-tool]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.tool===value)));
  $('remoteGestureHint').textContent=value==='swipe'?'Vuốt trái: tiếp · Vuốt phải: trước':value==='laser'?'Chạm và kéo để chỉ laser':'Chạm và kéo để vẽ · Chọn biểu tượng bàn tay để vuốt slide';
  queueAnnotation();
 }
 function setupTools(){
  const surface=$('remoteSurface');
  const point=event=>{const b=surface.getBoundingClientRect();return {x:Math.max(0,Math.min(1280,(event.clientX-b.left)/b.width*1280)),y:Math.max(0,Math.min(720,(event.clientY-b.top)/b.height*720))};};
  document.querySelectorAll('[data-tool]').forEach(button=>button.onclick=()=>setTool(button.dataset.tool));
  $('remoteClear').onclick=()=>{if(!connected)return;phoneInk.delete(session.state.slide);laser=null;queueAnnotation();};
  surface.addEventListener('pointerdown',event=>{
   if(!connected||busy||gesture||event.button!==0)return;
   event.preventDefault();surface.setPointerCapture(event.pointerId);gesture={x:event.clientX,y:event.clientY,id:event.pointerId,slide:session.state.slide};
   if(tool==='pen'){const strokes=phoneInk.get(gesture.slide)||[];if(strokes.reduce((n,s)=>n+s.length,0)>=4000){gesture=null;status('Nét vẽ đã đầy. Xóa nét trước khi vẽ tiếp.');return;}stroke=[point(event)];strokes.push(stroke);phoneInk.set(gesture.slide,strokes);queueAnnotation();}
   if(tool==='laser'){laser=point(event);queueAnnotation();}
  });
  surface.addEventListener('pointermove',event=>{
   if(!gesture||gesture.id!==event.pointerId)return;
   if(tool==='laser'){laser=point(event);queueAnnotation();}
   if(tool==='pen'&&stroke){const strokes=phoneInk.get(gesture.slide)||[];if(strokes.reduce((n,s)=>n+s.length,0)>=4000){status('Nét vẽ đã đầy. Xóa nét trước khi vẽ tiếp.');return;}stroke.push(point(event));queueAnnotation();}
  });
  function finish(event){
   if(!gesture||gesture.id!==event.pointerId)return;
   const previous=gesture;gesture=null;stroke=null;
   if(tool==='swipe'&&event.type==='pointerup'){const dx=event.clientX-previous.x,dy=event.clientY-previous.y;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)sendSlide(previous.slide+(dx<0?1:-1));}
   else{laser=null;queueAnnotation();}
  }
  for(const event of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(event,finish);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){gesture=null;stroke=null;laser=null;queueAnnotation();}});
  setTool('swipe');
 }
 const status = message => { $('remoteStatus').textContent=message;if(!controller){const button=$('remoteBtn');button.title=`Điều khiển điện thoại: ${message}`;button.setAttribute('aria-label',button.title);} };
 window.addEventListener('remote-access-lost',()=>{disposed=true;connected=false;session=null;annotationPending=null;clearTimeout(timer);clearTimeout(annotationTimer);annotationStream?.close();if(controller)buttons(true);status('Đã ngắt kết nối: cần đăng nhập lại.');});
 access.onTokenChanged(()=>{if(!controller&&session&&!disposed)startAnnotationStream().catch(error=>status(error.message));});
 function validateDatabase(value) {
  const url=new URL(value.trim());
  if(url.protocol!=='https:' || !/^[a-z0-9-]+\.(?:[a-z0-9-]+\.)?(?:firebasedatabase\.app|firebaseio\.com)$/.test(url.hostname) || url.pathname!=='/' || url.search || url.hash) throw Error('Database URL chưa đúng. Hãy sao chép URL từ Firebase Realtime Database.');
  return url.origin;
 }
 async function request(path='',method='GET',data) {
  const token=await access.getToken();
  const response=await fetch(`${database}/slideRooms/${room}${path}.json?auth=${encodeURIComponent(token)}`,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(10000)});
  if(!response.ok){const denied=response.status===401||response.status===403;const action=method==='GET'?'đọc phòng':'ghi phòng';const error=Error(denied?`Firebase từ chối ${action} (HTTP ${response.status}). Kiểm tra tài khoản Google và Publish đúng firebase.rules.json mới nhất.`:`Lỗi kết nối (${response.status}).`);error.permissionDenied=denied;throw error;}
  return response.json();
 }
 function buttons(disabled) { document.querySelectorAll('[data-remote-nav]').forEach(button=>button.disabled=disabled); }
 function showState(state) {
  if(!state || !Number.isInteger(state.slide))return;
  $('remoteCounter').textContent=`${state.slide+1} / ${session.total}`;
  if(controller){
   $('remotePrevious').disabled=busy||state.slide===0;
   $('remoteNext').disabled=busy||state.slide===session.total-1;
   $('remoteSlide').value=String(state.slide);
   if(previewSlide!==state.slide){gesture=null;stroke=null;laser=null;previewSlide=state.slide;preview()?.go(state.slide);preview()?.annotation(currentAnnotation());}
   const slide=window.remoteSlides?.[state.slide];
   $('remoteTitle').textContent=slide?.dataset.title||'';
   $('remoteNotes').textContent=slide?.querySelector('.speaker-notes')?.textContent||'';
  }
 }
 function publishState(ack=applied) {
  const state={slide:window.deckRemote.current(),ack,heartbeat:{'.sv':'timestamp'}};
  writeQueue=writeQueue.catch(()=>{}).then(()=>request('/state','PUT',state));
  return writeQueue;
 }
 async function poll() {
  if(disposed)return;
  try {
   const value=await request();
   if(!value || value.expiresAt<=Date.now()){
    if(controller&&fixedController){connected=false;session=null;busy=false;buttons(true);status('Đang chờ máy tính mở trang slide…');timer=setTimeout(poll,1500);return;}
    throw Error('Phòng đã đóng hoặc hết hạn. Tạo phòng mới trên máy tính.');
   }
   if(!controller&&value.sessionId!==hostSessionId){disposed=true;annotationStream?.close();session=null;$('remoteSetup').hidden=false;$('remoteConnection').hidden=true;status('Đã chuyển quyền điều khiển sang phiên máy tính mới.');return;}
   if(controller&&phoneSessionId!==(value.sessionId||'')){phoneSessionId=value.sessionId||'';busy=false;applied='';previewSlide=-1;phoneInk.clear();gesture=null;stroke=null;laser=null;annotationPending=null;}
   if(disposed)return;
   session=value;
   if(controller) {
    if(busy && value.state?.ack===applied)busy=false;
    const live=Date.now()-(value.state?.heartbeat||0)<15000;connected=live;
    buttons(!live||busy);showState(value.state);
    status(live?(busy?'Đang chuyển slide…':'Đã kết nối với máy tính'):'Máy tính mất kết nối. Đang chờ kết nối lại…');
    if(!live)buttons(true);
   } else {
    if(value.command && value.command.id!==applied) {
     applied=value.command.id;
     const target=value.command.slide;
     if(Number.isInteger(target)&&target>=0&&target<value.total)window.deckRemote.go(target);
    }
    await publishState();
    status('Phòng đang mở · iPhone có thể kết nối');
   }
  } catch(error){status(error.message);if(controller){connected=false;buttons(true);}}
  if(!disposed)timer=setTimeout(poll,1000);
 }
 async function startHost(automatic=false) {
  $('remoteStart').disabled=true;
  try {
   database=validateDatabase($('databaseUrl').value);
   localStorage.setItem('csonetDatabase',database);
   room=FIXED_ROOM;hostSessionId=crypto.randomUUID();applied='';
   const slides=window.deckRemote.total;
   session={sessionId:hostSessionId,total:slides,expiresAt:Date.now()+4*60*60*1000,state:{slide:window.deckRemote.current(),ack:'',heartbeat:{'.sv':'timestamp'}}};
   await request('','PUT',session);
   const link=new URL('remote.html',location.href);if(database!==DEFAULT_DATABASE)link.hash=new URLSearchParams({db:database}).toString();
   $('remoteLink').value=link.href;$('remoteConnection').hidden=false;$('remoteSetup').hidden=true;
   disposed=false;startAnnotationStream().catch(error=>status(error.message));poll();
  } catch(error){status(error.message);session=null;if(automatic&&!$('remoteDialog').open)$('remoteDialog').showModal();}finally{$('remoteStart').disabled=false;}
 }
 async function sendSlide(slide) {
  if(busy || !session || slide<0 || slide>=session.total)return;
  busy=true;buttons(true);applied=crypto.randomUUID();status('Đang gửi…');
  try{await request('/command','PUT',{id:applied,slide});}
  catch(error){busy=false;status(error.message);showState(session.state);}
 }
 if(controller) {
  (async()=>{
   try{
    const params=new URLSearchParams(location.hash.slice(1));database=validateDatabase(params.get('db')||DEFAULT_DATABASE);room=params.get('room')||FIXED_ROOM;fixedController=!params.has('room');
    if(!/^[a-f0-9]{32}$/.test(room))throw Error('Liên kết không hợp lệ. Hãy mở liên kết từ máy tính.');
    const response=await fetch('index.html');if(!response.ok)throw Error('Không tải được nội dung slide.');
    window.remoteSlides=[...new DOMParser().parseFromString(await response.text(),'text/html').querySelectorAll('.slide')];
    window.remoteSlides.forEach((slide,index)=>{const option=document.createElement('option');option.value=index;option.textContent=`${index+1}. ${slide.dataset.title}`;$('remoteSlide').append(option);});
    $('remotePrevious').onclick=()=>sendSlide(session.state.slide-1);
    $('remoteNext').onclick=()=>sendSlide(session.state.slide+1);
    $('remoteSlide').onchange=event=>sendSlide(Number(event.target.value));
    setupTools();
    $('remotePreview').addEventListener('load',()=>{if(session){preview()?.go(session.state.slide);preview()?.annotation(currentAnnotation());}});
    poll();
   }catch(error){status(error.message);}
  })();
 } else {
  $('remoteBtn').onclick=()=>{$('remoteDialog').showModal();};
  $('remoteClose').onclick=()=>$('remoteDialog').close();
  $('databaseUrl').value=localStorage.getItem('csonetDatabase')||DEFAULT_DATABASE;
  $('remoteStart').onclick=()=>startHost();
  $('remoteCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('remoteLink').value);status('Đã sao chép liên kết. Gửi và mở bằng Safari trên iPhone.');}catch{$('remoteLink').select();status('Hãy sao chép liên kết trong ô phía trên.');}};
  $('remoteStop').onclick=async()=>{
   disposed=true;annotationStream?.close();clearTimeout(timer);await writeQueue.catch(()=>{});
   try{const active=await request();if(active?.sessionId===hostSessionId)await request('','DELETE');status('Đã ngắt kết nối. Mở lại trang slide để tự kết nối.');}catch(error){status(error.message);}
   session=null;room='';$('remoteSetup').hidden=false;$('remoteConnection').hidden=true;
  };
  document.addEventListener('slidechange',()=>{if(session&&!disposed)publishState().catch(error=>status(error.message));});
  // Opening the presentation is sufficient; preview iframes return above.
  startHost(true);
 }
})();
