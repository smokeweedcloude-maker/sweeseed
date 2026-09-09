(()=>{'use strict';
const canvas=document.getElementById('sculpture');
const gl=canvas.getContext('webgl',{alpha:true,antialias:true,powerPreference:'low-power'});if(!gl){document.getElementById('model-fallback').hidden=false;return;}
const vs=`attribute vec3 position;attribute vec3 normal;uniform vec2 angle;uniform float aspect;varying vec3 n;varying vec3 p;void main(){float a=angle.x,b=angle.y;mat3 ry=mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));mat3 rx=mat3(1.,0.,0.,0.,cos(b),sin(b),0.,-sin(b),cos(b));mat3 rot=rx*ry;p=rot*position;n=rot*normal;float z=5.5-p.z;gl_Position=vec4(p.x*2.8/aspect,p.y*2.8,0.5*z-1.,z);}`;
const fs=`precision mediump float;uniform vec3 tint;varying vec3 n;varying vec3 p;void main(){vec3 N=normalize(n);vec3 V=normalize(vec3(0.,0.,5.5)-p);vec3 R=reflect(-V,N);float band=pow(abs(sin(R.y*3.1+R.x*.8)),12.);float key=pow(max(dot(reflect(-normalize(vec3(-2.,3.,4.)),N),V),0.),45.);float rim=pow(1.-abs(dot(N,V)),2.8);float soft=max(dot(N,normalize(vec3(-.5,.8,1.))),0.);vec3 c=vec3(.075,.078,.08)+vec3(.5,.52,.54)*soft*.6+vec3(.73,.75,.77)*band+vec3(.9,.84,.71)*key+vec3(.5,.48,.43)*rim;gl_FragColor=vec4(c*tint,1.);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader unavailable');return s;}
try{
const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
const pos=[],norm=[],indices=[],TAU=Math.PI*2,U=180,V=24;
function center(t){return [(1+.34*Math.cos(3*t))*Math.cos(2*t),(1+.34*Math.cos(3*t))*Math.sin(2*t),.42*Math.sin(3*t)];}
const sub=(a,b)=>a.map((x,i)=>x-b[i]);const unit=a=>{const l=Math.hypot(...a);return a.map(x=>x/l);};const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
for(let i=0;i<=U;i++){const t=i/U*TAU,c=center(t),T=unit(sub(center(t+.001),center(t-.001))),B=unit(cross(T,[0,0,1])),N=unit(cross(B,T));for(let j=0;j<=V;j++){const v=j/V*TAU,n=N.map((x,k)=>x*Math.cos(v)+B[k]*Math.sin(v));pos.push(...c.map((x,k)=>x+.25*n[k]));norm.push(...n);}}
for(let i=0;i<U;i++)for(let j=0;j<V;j++){const a=i*(V+1)+j,b=a+V+1;indices.push(a,b,a+1,b,b+1,a+1);}
function attribute(name,data){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0);}
attribute('position',pos);attribute('normal',norm);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
const tint=gl.getUniformLocation(program,'tint');gl.uniform3f(tint,1,1,1);document.querySelectorAll('[data-material]').forEach(b=>b.addEventListener('click',()=>{const colors={chrome:[1,1,1],red:[1,.08,.12],violet:[.55,.22,1]};gl.uniform3f(tint,...colors[b.dataset.material]);document.querySelectorAll('[data-material]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw();}));
const angle=gl.getUniformLocation(program,'angle'),aspect=gl.getUniformLocation(program,'aspect');let enabled=!document.body.classList.contains('motion-off'),visible=true,raf=0,time=0,last=0,px=0,py=0;
function draw(){const r=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.5);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.uniform1f(aspect,w/h);gl.uniform2f(angle,.45+time*.00017+px,.7+Math.sin(time*.0001)*.2+py);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);}
function tick(now){raf=0;if(!enabled||!visible||document.hidden)return;if(last)time+=Math.min(now-last,60);last=now;draw();raf=requestAnimationFrame(tick);}
function start(){if(enabled&&visible&&!document.hidden&&!raf){last=0;raf=requestAnimationFrame(tick);}}
function stop(){cancelAnimationFrame(raf);raf=0;last=0;}
window.addEventListener('motionchange',e=>{enabled=e.detail;stop();if(enabled)start();else{px=0;py=0;draw();}});
let drag=null;canvas.addEventListener('pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag)return;px+=(e.clientX-drag[0])*.009;py+=(e.clientY-drag[1])*.009;drag=[e.clientX,e.clientY];draw();});for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>drag=null);canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();px+=(e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0);py+=(e.key==='ArrowUp'?-.15:e.key==='ArrowDown'?.15:0);draw();});document.getElementById('reset-model').addEventListener('click',()=>{px=py=time=0;draw();});
document.addEventListener('visibilitychange',()=>{stop();start();});
if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;stop();start();},{threshold:0}).observe(canvas);
window.addEventListener('resize',()=>{if(!enabled)draw();},{passive:true});canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();canvas.parentElement.classList.remove('webgl-ready');document.getElementById('model-fallback').hidden=false;});
draw();canvas.parentElement.classList.add('webgl-ready');start();
}catch(e){canvas.parentElement.classList.remove('webgl-ready');document.getElementById('model-fallback').hidden=false;}
})();
