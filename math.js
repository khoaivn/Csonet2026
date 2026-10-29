'use strict';
// Render explicit TeX expressions only; never parse code snippets or speaker notes.
window.renderPresentationMath=function(root=document){
 if(!window.katex)return;
 const nodes=root.matches?.('[data-tex]')?[root]:[...root.querySelectorAll('[data-tex]')];
 for(const node of nodes){
  node.classList.add('math');
  try{katex.render(node.dataset.tex,node,{throwOnError:true,strict:'error',trust:false,output:'htmlAndMathml'});}
  catch(error){console.error('Cannot render presentation formula:',node.dataset.tex,error);}
 }
};
window.renderPresentationMath();
// Font metrics may change after the slide's initial scale was calculated.
document.fonts.ready.then(()=>window.dispatchEvent(new Event('resize')));
