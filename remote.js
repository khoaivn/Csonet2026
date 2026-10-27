'use strict';
(() => {
 const $ = id => document.getElementById(id);
 const controller = document.body.dataset.remote === 'controller';
 let database='', room='', timer, session=null, busy=false, applied='', disposed=false;
 let writeQueue=Promise.resolve();
 const status = message => { $('remoteStatus').textContent=message; };
 function validateDatabase(value) {
  const url=new URL(value.trim());
  if(url.protocol!=='https:' || !/^[a-z0-9-]+\.(?:[a-z0-9-]+\.)?(?:firebasedatabase\.app|firebaseio\.com)$/.test(url.hostname) || url.pathname!=='/' || url.search || url.hash) throw Error('Database URL chưa đúng. Hãy sao chép URL từ Firebase Realtime Database.');
  return url.origin;
 }
 async function request(path='',method='GET',data) {
  const response=await fetch(`${database}/slideRooms/${room}${path}.json`,{method,cache:'no-store',headers:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error(response.status===401||response.status===403?'Không có quyền truy cập hoặc phòng đã hết hạn. Kiểm tra Firebase Rules.':`Lỗi kết nối (${response.status}).`);
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
   if(!value || value.expiresAt<=Date.now())throw Error('Phòng đã đóng hoặc hết hạn. Tạo phòng mới trên máy tính.');
   if(disposed)return;
   session=value;
   if(controller) {
    if(busy && value.state?.ack===applied)busy=false;
    const live=Date.now()-(value.state?.heartbeat||0)<15000;
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
  } catch(error){status(error.message);if(controller)buttons(true);}
  if(!disposed)timer=setTimeout(poll,1000);
 }
 async function startHost() {
  $('remoteStart').disabled=true;
  try {
   database=validateDatabase($('databaseUrl').value);
   localStorage.setItem('csonetDatabase',database);
   room=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
   const slides=window.deckRemote.total;
   session={total:slides,expiresAt:Date.now()+4*60*60*1000,state:{slide:window.deckRemote.current(),ack:'',heartbeat:{'.sv':'timestamp'}}};
   await request('','PUT',session);
   const link=new URL('remote.html',location.href);link.hash=new URLSearchParams({db:database,room}).toString();
   $('remoteLink').value=link.href;$('remoteConnection').hidden=false;$('remoteSetup').hidden=true;
   disposed=false;poll();
  } catch(error){status(error.message);}finally{$('remoteStart').disabled=false;}
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
    const params=new URLSearchParams(location.hash.slice(1));database=validateDatabase(params.get('db')||'');room=params.get('room')||'';
    if(!/^[a-f0-9]{32}$/.test(room))throw Error('Liên kết không hợp lệ. Hãy mở liên kết từ máy tính.');
    const response=await fetch('index.html');if(!response.ok)throw Error('Không tải được nội dung slide.');
    window.remoteSlides=[...new DOMParser().parseFromString(await response.text(),'text/html').querySelectorAll('.slide')];
    window.remoteSlides.forEach((slide,index)=>{const option=document.createElement('option');option.value=index;option.textContent=`${index+1}. ${slide.dataset.title}`;$('remoteSlide').append(option);});
    $('remotePrevious').onclick=()=>sendSlide(session.state.slide-1);
    $('remoteNext').onclick=()=>sendSlide(session.state.slide+1);
    $('remoteSlide').onchange=event=>sendSlide(Number(event.target.value));
    poll();
   }catch(error){status(error.message);}
  })();
 } else {
  $('remoteBtn').onclick=()=>{$('remoteDialog').showModal();};
  $('remoteClose').onclick=()=>$('remoteDialog').close();
  $('databaseUrl').value=localStorage.getItem('csonetDatabase')||'https://slides-35d62-default-rtdb.asia-southeast1.firebasedatabase.app';
  $('remoteStart').onclick=startHost;
  $('remoteCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('remoteLink').value);status('Đã sao chép liên kết. Gửi và mở bằng Safari trên iPhone.');}catch{$('remoteLink').select();status('Hãy sao chép liên kết trong ô phía trên.');}};
  $('remoteStop').onclick=async()=>{
   disposed=true;clearTimeout(timer);await writeQueue.catch(()=>{});
   try{await request('','DELETE');status('Đã đóng phòng.');}catch(error){status(error.message);}
   session=null;room='';$('remoteSetup').hidden=false;$('remoteConnection').hidden=true;
  };
  document.addEventListener('slidechange',()=>{if(session&&!disposed)publishState().catch(error=>status(error.message));});
 }
})();
