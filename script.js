'use strict';
const slides=[...document.querySelectorAll('.slide')];
const $=id=>document.getElementById(id);
let current=0,blocked=false,lastFocus=null;
function fit(){const d=$('deck');const scaleX=d.clientWidth/1280,scaleY=d.clientHeight/720;slides.forEach(s=>s.style.transform=`scale(${scaleX},${scaleY})`);}
function go(index,updateHash=true){current=Math.min(slides.length-1,Math.max(0,index));slides.forEach((s,i)=>{s.classList.toggle('active',i===current);s.setAttribute('aria-hidden',String(i!==current));});$('counter').textContent=`${String(current+1).padStart(2,'0')} / ${slides.length}`;$('sectionLabel').textContent=slides[current].dataset.title;$('progressFill').style.width=`${(current+1)/slides.length*100}%`;$('prevBtn').disabled=current===0;$('nextBtn').disabled=current===slides.length-1;$('noteText').textContent=slides[current].querySelector('.speaker-notes').textContent;$('slideTime').textContent=`Suggested time ${slides[current].dataset.time}`;document.querySelectorAll('#overviewGrid button').forEach((b,i)=>b.classList.toggle('current',i===current));if(updateHash)history.replaceState(null,'',`#${current+1}`);fit();document.dispatchEvent(new Event('slidechange'));}
function fromHash(){const number=Number(location.hash.slice(1));go(Number.isInteger(number)&&number>=1&&number<=slides.length?number-1:0,false);}
function notes(show=$('notesPanel').hidden){$('notesPanel').hidden=!show;$('notesBtn').setAttribute('aria-pressed',String(show));}
function overview(show=$('overview').hidden){if(show){lastFocus=document.activeElement;$('overview').hidden=false;document.querySelectorAll('#overviewGrid button')[current].focus();}else{$('overview').hidden=true;lastFocus?.focus();}}
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{ $('fullBtn').title='Use browser fullscreen (F)';}}
$('prevBtn').onclick=()=>go(current-1);$('nextBtn').onclick=()=>go(current+1);$('notesBtn').onclick=()=>notes();$('closeNotes').onclick=()=>notes(false);$('overviewBtn').onclick=()=>overview();$('closeOverview').onclick=()=>overview(false);$('fullBtn').onclick=fullscreen;
slides.forEach((s,i)=>{const b=document.createElement('button');const n=document.createElement('span');n.textContent=`${String(i+1).padStart(2,'0')} · ${s.dataset.time}`;b.append(n,document.createTextNode(s.dataset.title));b.onclick=()=>{go(i);overview(false);};$('overviewGrid').append(b);});
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(!$('overview').hidden){if(e.key==='Escape'){overview(false);return;}if(e.key==='Tab'){const focusable=[...$('overview').querySelectorAll('button')];const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}return;}if((e.key===' '||e.key==='Enter')&&e.target.closest('button,a'))return;switch(e.key){case'ArrowRight':case'ArrowDown':case'PageDown':case' ':e.preventDefault();go(current+1);break;case'ArrowLeft':case'ArrowUp':case'PageUp':e.preventDefault();go(current-1);break;case'Home':e.preventDefault();go(0);break;case'End':e.preventDefault();go(slides.length-1);break;case'n':case'N':notes();break;case'o':case'O':overview();break;case'f':case'F':fullscreen();break;case'Escape':notes(false);}});
let touchStart=null;$('deck').addEventListener('touchstart',e=>{touchStart={x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};},{passive:true});$('deck').addEventListener('touchend',e=>{if(!touchStart||e.target.closest('button,a'))return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)go(current+(dx<0?1:-1));touchStart=null;},{passive:true});
function quota(){const counts=blocked?[6,1,0]:[4,1,0];$('quotaCounts').replaceChildren(...counts.map((n,i)=>{const div=document.createElement('div');div.append(document.createTextNode(`Label ${i+1}`));const b=document.createElement('b');b.textContent=n;div.append(b);return div;}));$('quotaCalculation').textContent=blocked?'6 + 2 + 2 = 10 > 9':'4 + 2 + 2 = 8 ≤ 9';$('quotaCalculation').dataset.tex=blocked?'6+2+2=10>9':'4+2+2=8\\le9';window.renderPresentationMath?.($('quotaCalculation'));$('quotaStatus').textContent=blocked?'Not extendable: one slot short':'Extendable: enough room to meet all quotas';$('quotaStatus').classList.toggle('blocked',blocked);$('quotaToggle').textContent=blocked?'Show an extendable state':'Show a blocked state';}
if($('quotaToggle'))$('quotaToggle').onclick=()=>{blocked=!blocked;quota();};
const results={email:[533.860,532.127,478.412,534.246],grqc:[585.273,585.984,531.081,578.531]};
const names=['Fair-Greedy','Fair-Threshold','OPFSA','MPFSA'];
function chart(dataset){const values=results[dataset];$('resultsChart').replaceChildren(...values.map((value,i)=>{const row=document.createElement('div');row.className='bar-row';const name=document.createElement('span');name.textContent=names[i];const track=document.createElement('div');track.className='bar-track';const bar=document.createElement('div');bar.className='bar';bar.style.width=`${value/650*100}%`;track.append(bar);const number=document.createElement('span');number.className='bar-value';number.textContent=value.toFixed(3);row.append(name,track,number);return row;}));$('resultsChart').setAttribute('aria-label',`Objective values at B = 30 on ${dataset==='email'?'Email-Eu-core':'ca-GrQc'}. Bars use a common zero baseline and a 650-unit scale.`);document.querySelectorAll('[data-dataset]').forEach(b=>{b.classList.toggle('selected',b.dataset.dataset===dataset);b.setAttribute('aria-pressed',String(b.dataset.dataset===dataset));});}
document.querySelectorAll('[data-dataset]').forEach(b=>b.onclick=()=>chart(b.dataset.dataset));window.addEventListener('resize',fit);window.addEventListener('hashchange',fromHash);document.addEventListener('fullscreenchange',()=>{$('fullBtn').title=document.fullscreenElement?'Exit fullscreen (F)':'Fullscreen (F)';$('fullBtn').setAttribute('aria-label',$('fullBtn').title);fit();});if($('quotaToggle'))quota();if($('resultsChart'))chart('email');fromHash();

// Presentation annotation tools. Coordinates are stored relative to each slide.
const inkCanvas=$('annotationCanvas'),inkContext=inkCanvas.getContext('2d');
const slideInk=new Map();
const remoteSlideInk=new Map();
let remoteLaserTimer;
let annotationMode=null,activeStroke=null;
function annotationBounds(){return slides[current].getBoundingClientRect();}
function renderInk(){
 const bounds=annotationBounds(),ratio=window.devicePixelRatio||1;
 inkCanvas.style.left=`${bounds.left}px`;inkCanvas.style.top=`${bounds.top}px`;
 inkCanvas.style.width=`${bounds.width}px`;inkCanvas.style.height=`${bounds.height}px`;
 inkCanvas.width=Math.round(bounds.width*ratio);inkCanvas.height=Math.round(bounds.height*ratio);
 inkContext.setTransform(ratio*bounds.width/1280,0,0,ratio*bounds.height/720,0,0);
 inkContext.strokeStyle='#e53935';inkContext.fillStyle='#e53935';inkContext.lineWidth=3;inkContext.lineCap='round';inkContext.lineJoin='round';
 for(const stroke of [...(slideInk.get(current)||[]),...(remoteSlideInk.get(current)||[])]){
  if(!stroke.length)continue;
  inkContext.beginPath();inkContext.moveTo(stroke[0].x,stroke[0].y);
  if(stroke.length===1){inkContext.arc(stroke[0].x,stroke[0].y,1.5,0,Math.PI*2);inkContext.fill();}
  else{for(const point of stroke.slice(1))inkContext.lineTo(point.x,point.y);inkContext.stroke();}
 }
}
function setAnnotationMode(mode){
 annotationMode=annotationMode===mode?null:mode;activeStroke=null;
 inkCanvas.style.pointerEvents=annotationMode?'auto':'none';
 inkCanvas.style.cursor=annotationMode==='pen'?'crosshair':annotationMode==='laser'?'none':'default';
 $('laserBtn').setAttribute('aria-pressed',String(annotationMode==='laser'));
 $('penBtn').setAttribute('aria-pressed',String(annotationMode==='pen'));
 $('laserPointer').hidden=true;clearLaserTrail();
}
function inkPoint(event){const b=annotationBounds();return{x:(event.clientX-b.left)/b.width*1280,y:(event.clientY-b.top)/b.height*720};}
let lastLaserPoint=null;
function clearLaserTrail(){document.querySelectorAll('.laser-trail').forEach(dot=>dot.remove());lastLaserPoint=null;}
function moveLaser(event){
 const point={x:event.clientX,y:event.clientY};
 if(lastLaserPoint){
  const dx=point.x-lastLaserPoint.x,dy=point.y-lastLaserPoint.y;
  const steps=Math.min(60,Math.ceil(Math.hypot(dx,dy)/4));
  for(let i=0;i<steps;i++){
   const dot=document.createElement('div');dot.className='laser-trail';dot.setAttribute('aria-hidden','true');
   dot.style.left=`${lastLaserPoint.x+dx*i/steps}px`;dot.style.top=`${lastLaserPoint.y+dy*i/steps}px`;
   document.body.append(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});
  }
 }
 lastLaserPoint=point;
 $('laserPointer').style.left=`${point.x}px`;$('laserPointer').style.top=`${point.y}px`;$('laserPointer').hidden=false;
}
$('laserBtn').onclick=()=>setAnnotationMode('laser');
$('penBtn').onclick=()=>setAnnotationMode('pen');
$('clearInkBtn').onclick=()=>{slideInk.delete(current);remoteSlideInk.delete(current);activeStroke=null;renderInk();};
inkCanvas.addEventListener('pointerdown',event=>{
 if(event.button!==0)return;
 if(annotationMode==='laser'){moveLaser(event);return;}
 if(annotationMode!=='pen')return;
 event.preventDefault();inkCanvas.setPointerCapture(event.pointerId);
 activeStroke=[inkPoint(event)];if(!slideInk.has(current))slideInk.set(current,[]);
 slideInk.get(current).push(activeStroke);renderInk();
});
inkCanvas.addEventListener('pointermove',event=>{if(annotationMode==='laser')moveLaser(event);else if(activeStroke){activeStroke.push(inkPoint(event));renderInk();}});
function endInk(){activeStroke=null;}
inkCanvas.addEventListener('pointerup',endInk);inkCanvas.addEventListener('pointercancel',endInk);inkCanvas.addEventListener('lostpointercapture',endInk);
inkCanvas.addEventListener('pointerleave',()=>{$('laserPointer').hidden=true;clearLaserTrail();});
document.addEventListener('keydown',event=>{
 if(event.altKey||event.ctrlKey||event.metaKey||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)||!$('overview').hidden)return;
 if(event.key.toLowerCase()==='l')setAnnotationMode('laser');
 if(event.key.toLowerCase()==='p')setAnnotationMode('pen');
 if(event.key.toLowerCase()==='c')$('clearInkBtn').click();
 if(event.key==='Escape')setAnnotationMode(null);
});
const annotationObserver=new MutationObserver(()=>{activeStroke=null;$('laserPointer').hidden=true;clearLaserTrail();renderInk();});
slides.forEach(slide=>annotationObserver.observe(slide,{attributes:true,attributeFilter:['class','style']}));
window.addEventListener('resize',renderInk);document.addEventListener('fullscreenchange',renderInk);
renderInk();

function receiveRemoteAnnotation(data){
 if(!data || !Number.isInteger(data.slide) || data.slide<0 || data.slide>=slides.length)return;
 try{
  const strokes=JSON.parse(data.ink||'[]');
  if(!Array.isArray(strokes)||strokes.length>4000)return;
  let count=0;
  for(const stroke of strokes){if(!Array.isArray(stroke))return;for(const p of stroke){if(++count>4000||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1280||p.y<0||p.y>720)return;}}
  remoteSlideInk.set(data.slide,strokes);renderInk();
 }catch{return;}
 clearTimeout(remoteLaserTimer);
 if(data.slide===current&&data.laser&&Date.now()-data.at<3000&&Number.isFinite(data.x)&&Number.isFinite(data.y)){
  const b=annotationBounds();moveLaser({clientX:b.left+data.x/1280*b.width,clientY:b.top+data.y/720*b.height});
  remoteLaserTimer=setTimeout(()=>{$('laserPointer').hidden=true;clearLaserTrail();},700);
 }else{$('laserPointer').hidden=true;clearLaserTrail();}
}
window.deckRemote={background:color=>{if(/^#[0-9a-f]{6}$/i.test(color))document.documentElement.style.setProperty('--slide-background',color);},go,current:()=>current,total:slides.length,annotation:receiveRemoteAnnotation,geometry:()=>{const b=annotationBounds();return {left:b.left,top:b.top,width:b.width,height:b.height,viewportWidth:innerWidth,viewportHeight:innerHeight};}};
