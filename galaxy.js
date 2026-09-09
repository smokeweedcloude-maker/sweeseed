(()=>{'use strict';
const root=document.documentElement;
const back=document.getElementById('galaxy-back'),front=document.getElementById('galaxy-front'),stage=back.parentElement,character=document.querySelector('.character-wrap'),b=back.getContext('2d'),f=front.getContext('2d');if(!b||!f)return;
let width=1,height=1,elapsed=0,last=0,raf=0,visible=true,on=!document.body.classList.contains('motion-off'),pointerX=0,pointerY=0;
let seed=137;function random(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
const particles=Array.from({length:650},(_,i)=>{const r=.49+random()*.51;return{angle:random()*Math.PI*2,r,y:(random()-.5)*.085,size:i%19===0?3+random()*6:.4+random()*1.1,star:i%19===0,alpha:.22+random()*.7};});
function resize(){const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,1.6);[back,front].forEach(c=>{c.width=Math.round(width*dpr);c.height=Math.round(height*dpr);c.getContext('2d').setTransform(dpr,0,0,dpr,0,0);});render();}
function star(ctx,x,y,size,angle){ctx.beginPath();for(let i=0;i<10;i++){const a=angle+i*Math.PI/5-Math.PI/2,r=i%2?size*.43:size;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();}
function render(){b.clearRect(0,0,width,height);f.clearRect(0,0,width,height);const light=root.dataset.theme==='light',mobile=width<680;const radius=Math.min(width*(mobile?.54:.43),490),cy=height*.59,cx=width*.5;const rotation=elapsed*.000045,tilt=.53+pointerY*.04,roll=-.18+pointerX*.018;
for(const p of particles){const a=p.angle+rotation*(1.1-p.r*.35),x=Math.cos(a)*p.r*radius,z=Math.sin(a)*p.r*radius,yy=z*tilt+p.y*radius;const scale=1+z/radius*.09;const xx=(x*Math.cos(roll)-yy*Math.sin(roll))*scale+cx,sy=(x*Math.sin(roll)+yy*Math.cos(roll))*scale+cy;const ctx=z>0?f:b;ctx.globalAlpha=p.alpha*(z>0?.9:.62);if(p.star){star(ctx,xx,sy,p.size*(mobile?.7:1)*scale,a*.35);ctx.fillStyle='#050505';ctx.fill();ctx.strokeStyle=light?'#252325':'#777176';ctx.lineWidth=light?.55:.9;ctx.stroke();}else{ctx.beginPath();ctx.arc(xx,sy,p.size*(mobile?.8:1),0,Math.PI*2);ctx.fillStyle=light?'#2e2b30':'#88828a';ctx.fill();}}
b.globalAlpha=f.globalAlpha=1;
}
function tick(now){raf=0;if(!on||!visible||document.hidden)return;if(last)elapsed+=Math.min(now-last,60);last=now;render();raf=requestAnimationFrame(tick);}
function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
function start(){if(on&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(tick);}
window.addEventListener('themechange',()=>render());
window.addEventListener('motionchange',e=>{on=e.detail;stop();if(on)start();else{pointerX=pointerY=0;character.style.setProperty('--char-x','0px');character.style.setProperty('--char-y','0px');render();}});
if(matchMedia('(hover:hover) and (pointer:fine)').matches){stage.addEventListener('pointermove',e=>{if(!on)return;const r=stage.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;character.style.setProperty('--char-x',pointerX*12+'px');character.style.setProperty('--char-y',pointerY*9+'px');});stage.addEventListener('pointerleave',()=>{pointerX=pointerY=0;character.style.setProperty('--char-x','0px');character.style.setProperty('--char-y','0px');});}
document.addEventListener('visibilitychange',()=>{stop();start();});if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;stop();start();},{threshold:0}).observe(stage);
if('ResizeObserver'in window)new ResizeObserver(resize).observe(stage);else window.addEventListener('resize',resize,{passive:true});resize();start();
})();
