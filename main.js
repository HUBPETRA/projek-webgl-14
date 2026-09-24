function main() {
    const canvas=document.getElementById('mycanvas');
    const gl=canvas.getContext('webgl',{antialias:true});
    if(!gl){document.getElementById('status').textContent='WebGL tidak tersedia di browser ini.';return;}
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(.10,.14,.13,1);
    const program=createShaderProgram(gl);if(!program)return;
    const camera=new Camera(canvas);
    const characters=[new Shifu(gl,program,-5),new Oogway(gl,program,0),new Kai(gl,program,5.2)];
    let selected=-1,rotate=false,previous=0;
    function resize(){const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(innerWidth*d);canvas.height=Math.round(innerHeight*d);gl.viewport(0,0,canvas.width,canvas.height);}
    addEventListener('resize',resize);resize();
    function select(i){
        selected=i;
        camera.target=i<0?[.1,.9,0]:[[ -5,.55,.0],[0,.15,.15],[5.2,1.15,0]][i].slice();
        // Sesuaikan jarak untuk layar sempit dengan proyeksi bawaan proyek.
        camera.distance=(i<0?17:[7.6,8.8,10.0][i])*Math.max(1,innerHeight/innerWidth*1.35);
        camera.yaw=0;camera.pitch=.04;
        document.querySelectorAll('[data-character]').forEach(b=>b.setAttribute('aria-pressed',Number(b.dataset.character)===i));
        document.getElementById('status').textContent=i<0?'Shifu · Oogway · Kai':['Shifu — paraboloid, cone, hyperboloid (manset tambahan)','Oogway — paraboloid, hyperboloid, cone','Kai — paraboloid, hyperboloid, cone'][i];
    }
    document.querySelectorAll('[data-character]').forEach(b=>b.onclick=()=>select(Number(b.dataset.character)));
    document.getElementById('front').onclick=()=>{camera.yaw=0;camera.pitch=.04;};
    document.getElementById('side').onclick=()=>{camera.yaw=Math.PI/2;camera.pitch=.04;};
    document.getElementById('back').onclick=()=>{camera.yaw=Math.PI;camera.pitch=.04;};
    document.getElementById('spin').onclick=e=>{rotate=!rotate;e.target.setAttribute('aria-pressed',rotate);};
    canvas.addEventListener('dblclick',()=>select(selected));
    select(-1);
    function frame(time){
        const dt=previous?Math.min((time-previous)/1000,.1):0;previous=time;
        if(rotate&&!camera.isDragging)camera.yaw+=dt*.35;
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        const projection=LIBS.get_projection(40,canvas.width/canvas.height,.1,100),view=camera.getViewMatrix();
        characters.forEach((c,i)=>{if(selected<0||i===selected){c.update(time/1000);c.draw(view,projection);}});
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
}
addEventListener('load',main);
