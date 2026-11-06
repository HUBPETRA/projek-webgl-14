// Golden Palace prosedural. Geometri statis digabung agar draw call lebih sedikit.
class Environment {
 constructor(gl,program){
  this.builder=new CharacterBuilder(gl,program,0);this.gl=gl;this.program=program;
  this.create();this.batch();
 }
 box(x,y,z,w,h,d,color){
  const v=[],f=[];
  const sides=[[[1,-1,-1],[1,1,-1],[1,1,1],[1,-1,1]],[[-1,-1,1],[-1,1,1],[-1,1,-1],[-1,-1,-1]],
   [[-1,1,-1],[-1,1,1],[1,1,1],[1,1,-1]],[[-1,-1,1],[-1,-1,-1],[1,-1,-1],[1,-1,1]],
   [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]];
  for(const side of sides){const n=v.length/6;for(const p of side)v.push(p[0]*w/2,p[1]*h/2,p[2]*d/2,...color);f.push(n,n+2,n+1,n,n+3,n+2);}
  return this.builder.addMesh({vertices:v,faces:f},x,y,z);
 }
 roof(x,y,z,w,d,h){
  const B=this.builder,gold=[.78,.54,.19],tile=[.38,.29,.16],trim=[.98,.72,.28];
  for(const side of [-1,1]){
   const point=(u,v)=>[x+(u-.5)*w,y+h*Math.pow(1-v,1.6)+.32*Math.pow(Math.abs(u-.5)*2,7)*v,z+side*d/2*v];
   B.surface(point,40,12,gold,(u,v)=>gold.map(c=>c*(.83+.17*Math.pow(Math.cos(u*Math.PI*32),2))));
   for(let i=0;i<=30;i++){
    const u=i/30;B.curve([point(u,0),point(u,.28),point(u,.65),point(u,1)],.025,tile);
   }
   B.curve([point(0,1),point(.25,1),point(.75,1),point(1,1)],.085,trim);
  }
  B.cylinder(.10,w,x,y+h,z,trim,0,0,90);
  for(const s of [-1,1])B.curve([[x+s*w/2,y+h,z],[x+s*(w/2+.3),y+h,z],[x+s*(w/2+.45),y+h+.4,z],[x+s*(w/2+.35),y+h+.6,z]],.10,trim,.025);
 }
 create(){
  const B=this.builder,stone=[.47,.49,.44],lightStone=[.68,.66,.54],red=[.39,.13,.10],gold=[.83,.59,.24],teal=[.16,.29,.26];
  this.box(0,-.32,-1,34,.6,30,[.25,.31,.27]);
  // Lantai: celah tipis dan perbedaan warna halus antarubin.
  for(let i=-8;i<=8;i++)for(let j=-6;j<=6;j++){
   const shade=.89+.08*Math.sin(i*13+j*7);this.box(i*1.9,-.075,j*1.9,1.86,.15,1.86,stone.map(c=>c*shade));
  }
  // Garis hias mengelilingi arena, jalur utama menuju tangga.
  for(const x of [-12,12])this.box(x,.008,0,.13,.018,20,gold);
  this.box(0,.008,9.5,24,.018,.13,gold);
  for(const x of [-2.5,2.5])this.box(x,.012,-4,.08,.018,13,lightStone);
  // Istana berada di belakang pelataran (sumbu -Z).
  this.box(0,.45,-12,22,.9,7.7,lightStone);
  for(let i=0;i<5;i++)this.box(0,.10+i*.17,-7.2-i*.55,8,.20,.62,lightStone.map(c=>c*(.90+i*.02)));
  this.box(0,3.15,-13,18,4.5,4.5,red);
  this.box(0,1.13,-10,19,.3,1.3,teal);
  // Pintu dan panel kisi.
  for(const x of [-6,-3,0,3,6]){
   this.box(x,2.8,-10.69,2.30,3.25,.16,[.12,.19,.17]);
   for(let k=-2;k<=2;k++)this.box(x+k*.36,2.8,-10.57,.055,3.1,.08,gold);
   for(let k=0;k<6;k++)this.box(x,1.4+k*.53,-10.54,2.2,.055,.08,gold);
  }
  for(const x of [-9,-6,-3,0,3,6,9]){
   B.cylinder(.18,4.8,x,3.2,-9.8,red);
   B.cylinder(.26,.18,x,.96,-9.8,gold);B.cylinder(.26,.20,x,5.5,-9.8,gold);
  }
  this.box(0,5.6,-11.9,20,.38,6,teal);this.roof(0,5.8,-12,22,8,1.65);
  this.box(0,8.0,-12.7,10,1.45,3.3,red);
  for(const x of [-4,-2,0,2,4])this.box(x,8.0,-10.99,1.25,.80,.08,gold);
  this.roof(0,8.75,-12.6,13,5.6,1.45);
  // Papan gerbang dan medali giok di tengah.
  this.box(0,4.70,-9.54,3.1,.72,.20,gold);
  this.box(0,4.70,-9.41,2.9,.54,.08,[.15,.24,.18]);
  B.torus(.22,.045,0,4.70,-9.34,gold);
  // Paviliun samping, lentera, dan pagar.
  for(const s of [-1,1]){
   this.box(s*12,1.2,-11,3,.8,6,lightStone);
   for(const z of [-9,-12])B.cylinder(.16,3.8,s*12,3.5,z,red);
   this.roof(s*12,5.5,-11,4.5,7,1.05);
   for(let i=0;i<6;i++){
    const z=-5+i*2.7;this.box(s*14,.65,z,.3,1.3,.32,lightStone);
    if(i<5)this.box(s*14,.85,z+1.35,.15,.18,2.7,lightStone);
   }
   for(const z of [-6,2,8]){
    const x=s*11.5;
    this.box(x,.28,z,.8,.56,.8,lightStone);
    B.cylinder(.09,2.7,x,1.7,z,red);
    this.box(x,3.13,z,1.2,.10,.14,gold);
    B.ellipsoid(.29,.43,.29,x,2.64,z,[.98,.43,.13]);
    B.cylinder(.30,.07,x,3.04,z,gold);B.cylinder(.30,.07,x,2.24,z,gold);
    B.cylinder(.024,.34,x,2.05,z,[.76,.22,.09]);
   }
   // Pohon di sisi arena, di luar lintasan rantai.
   for(const z of [-4,6]){
    const x=s*16;B.cylinder(.28,3.8,x,1.7,z,[.28,.20,.15],0,0,s*8);
    B.segment([x,2,z],[x+s*1.4,4.2,z+.4],.18,.06,[.28,.20,.15]);
    for(let k=0;k<5;k++)B.ellipsoid(1.25,.85,1.12,x+Math.sin(k*2.1)*1.1,3.7+(k%2)*.65,z+Math.cos(k*2.1)*.8,[.60+.03*k,.43+.025*k,.42+.02*k]);
   }
  }
  // Pegunungan berbidang kasar dengan warna lembut di kejauhan.
  for(let i=0;i<11;i++){
   const x=(i-5)*7,h=9+4*Math.sin(i*2.3)**2;
   B.addMesh(generateCone(7,h,7,[.40,.51,.49]),x,-2,-27-(i%3)*4);
   B.addMesh(generateCone(8,h+5,6,[.54,.62,.58]),x+2,-2,-43);
  }
 }
 batch(){
  const out=[];let vertices=[],faces=[];
  const flush=()=>{if(!vertices.length)return;out.push(new MyObject(this.gl,vertices,faces,this.program));vertices=[];faces=[];};
  for(const mesh of this.builder.parts){
   if(vertices.length/6+mesh.vertices.length/6>58000)flush();
   const offset=vertices.length/6;
   for(let i=0;i<mesh.vertices.length;i+=6)vertices.push(...Mat4.point(mesh.MODEL_MATRIX,mesh.vertices.slice(i,i+3)),...mesh.vertices.slice(i+3,i+6));
   for(const index of mesh.faces)faces.push(index+offset);
   this.gl.deleteBuffer(mesh.vertexBuffer);this.gl.deleteBuffer(mesh.indexBuffer);
  }
  flush();this.builder.parts=out;
 }
 draw(v,p){this.builder.draw(v,p);}
}
