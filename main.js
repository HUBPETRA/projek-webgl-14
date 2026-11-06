function main(){
 const canvas=document.getElementById('mycanvas'),status=document.getElementById('status');
 const gl=canvas.getContext('webgl',{antialias:true,alpha:false});
 if(!gl){status.textContent='WebGL tidak tersedia. Coba aktifkan akselerasi grafis browser.';return;}
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(.76,.78,.69,1);
 let scene,program;
 try{program=createShaderProgram(gl);if(!program)throw Error('Shader gagal dikompilasi.');scene=new SceneDirector(gl,program);}catch(e){status.textContent=e.message;console.error(e);return;}
 const camera=new Camera(canvas);camera.maxDistance=90;camera.minDistance=5;
 let time=0,playing=true,previous=null,mode='wide',showEnvironment=true,showOogway=true;
 const timeline=document.getElementById('timeline'),play=document.getElementById('play');
 const selectView=(view)=>{
  mode=view;
  if(view==='wide'){camera.target=[0,3.7,-4];camera.distance=32;camera.yaw=.30;camera.pitch=.24;}
  if(view==='kai'){camera.target=[-2,2.1,0];camera.distance=12;camera.yaw=.65;camera.pitch=.12;}
  if(view==='side'){camera.target=[0,2,0];camera.distance=19;camera.yaw=Math.PI/2;camera.pitch=.12;}
  document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view));
 };
 selectView('wide');
 function resize(){const d=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);gl.viewport(0,0,canvas.width,canvas.height);}
 addEventListener('resize',resize);resize();
 const updatePlay=()=>{play.textContent=playing?'Jeda':'Putar';play.setAttribute('aria-label',playing?'Jeda animasi':'Putar animasi');};
 play.onclick=()=>{if(time>=scene.duration){time=0;}playing=!playing;updatePlay();};
 document.getElementById('restart').onclick=()=>{time=0;playing=true;updatePlay();};
 timeline.oninput=()=>{time=Number(timeline.value);playing=false;updatePlay();};
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>selectView(b.dataset.view));
 document.getElementById('environment').onchange=e=>showEnvironment=e.target.checked;
 document.getElementById('oogway').onchange=e=>showOogway=e.target.checked;
 document.getElementById('stage').onchange=e=>{time=Number(e.target.value);playing=true;updatePlay();};
 document.getElementById('speed').onchange=()=>{};
 canvas.addEventListener('dblclick',()=>selectView(mode));
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;status.textContent='Konteks WebGL terputus. Muat ulang halaman untuk melanjutkan.';});
 // API integrasi/debug: seek memakai waktu absolut, sama dengan timeline utama.
 window.demo={scene,camera,seek(t){time=Math.max(0,Math.min(scene.duration,t));playing=false;scene.update(time);updatePlay();},get time(){return time;},get playing(){return playing;}};
 function frame(now){
  const dt=previous===null?0:Math.min((now-previous)/1000,.05);previous=now;
  if(playing){time=Math.min(scene.duration,time+dt*Number(document.getElementById('speed').value));if(time===scene.duration){playing=false;updatePlay();}}
  scene.update(time);
  if(mode==='kai'){const p=scene.kai.root.position;camera.target=[p[0],2.1,p[2]];}
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const projection=Mat4.perspective(Math.PI/3.2,canvas.width/canvas.height,.1,150);
  scene.draw(camera.getViewMatrix(),projection,{environment:showEnvironment,oogway:showOogway});
  timeline.value=time;document.getElementById('clock').textContent=time.toFixed(1)+' / 32 s';
  status.textContent=KaiAnimation.label(time);
  requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
}
addEventListener('load',main);
