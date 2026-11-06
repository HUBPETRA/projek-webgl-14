// Matriks column-major, vektor kolom: world = parentWorld * local.
const Mat4 = {
 identity: () => new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
 multiply(a,b) {
  const m=new Float32Array(16);
  for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)m[c*4+r]+=a[k*4+r]*b[c*4+k];
  return m;
 },
 translation(x=0,y=0,z=0){const m=this.identity();m[12]=x;m[13]=y;m[14]=z;return m;},
 scaling(x=1,y=x,z=x){const m=this.identity();m[0]=x;m[5]=y;m[10]=z;return m;},
 // ROTATE ARBITRARY AXIS: rumus Rodrigues. Sudut dalam radian.
 axisRotation(axis,angle){
  const n=Math.hypot(...axis);if(n<1e-8)return this.identity();
  const [x,y,z]=axis.map(v=>v/n),c=Math.cos(angle),s=Math.sin(angle),t=1-c;
  return new Float32Array([t*x*x+c,t*x*y+s*z,t*x*z-s*y,0,
   t*x*y-s*z,t*y*y+c,t*y*z+s*x,0,t*x*z+s*y,t*y*z-s*x,t*z*z+c,0,0,0,0,1]);
 },
 point(m,p){return [0,1,2].map(r=>m[r]*p[0]+m[4+r]*p[1]+m[8+r]*p[2]+m[12+r]);},
 // Membalik matriks rigid (rotasi + translasi), untuk endpoint senjata di dunia.
 inverseRigid(m){const a=this.identity();for(let c=0;c<3;c++)for(let r=0;r<3;r++)a[c*4+r]=m[r*4+c];const t=this.point(a,[-m[12],-m[13],-m[14]]);a[12]=t[0];a[13]=t[1];a[14]=t[2];return a;},
 perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),d=near-far;return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/d,-1,0,0,2*far*near/d,0]);},
 // Inverse transpose 3x3: pencahayaan tetap benar saat non-uniform scaling.
 normal(m){
  const a=[m[0],m[1],m[2]],b=[m[4],m[5],m[6]],c=[m[8],m[9],m[10]];
  const cross=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
  const u=cross(b,c),v=cross(c,a),w=cross(a,b),d=a.reduce((s,n,i)=>s+n*u[i],0);
  return new Float32Array([...u,...v,...w].map(n=>n/(Math.abs(d)>1e-8?d:1)));
 }
};

class SceneNode {
 constructor(name,pivot=[0,0,0],parent=null){
  this.name=name;this.pivot=pivot;this.parent=parent;this.children=[];this.meshes=[];
  this.position=[0,0,0];this.rotation=[0,0,0];this.scale=[1,1,1];
  this.axis=[0,1,0];this.angle=0;this.world=Mat4.identity();this.visible=true;
  if(parent)parent.children.push(this);
 }
 attach(mesh,rest=mesh.MODEL_MATRIX){
  // Ubah posisi model awal menjadi posisi relatif terhadap pivot sendi.
  this.meshes.push({mesh,local:Mat4.multiply(Mat4.translation(...this.pivot.map(x=>-x)),rest)});
 }
 reset(){this.position=[0,0,0];this.rotation=[0,0,0];this.scale=[1,1,1];this.angle=0;for(const c of this.children)c.reset();}
 updateWorld(parentMatrix=Mat4.identity()){
  const origin=this.parent?this.parent.pivot:[0,0,0];
  let local=Mat4.translation(...this.pivot.map((v,i)=>v-origin[i]+this.position[i]));
  for(let i=0;i<3;i++){const axis=[0,0,0];axis[i]=1;local=Mat4.multiply(local,Mat4.axisRotation(axis,this.rotation[i]));}
  local=Mat4.multiply(local,Mat4.axisRotation(this.axis,this.angle));
  local=Mat4.multiply(local,Mat4.scaling(...this.scale));
  this.world=Mat4.multiply(parentMatrix,local);
  for(const item of this.meshes)item.mesh.MODEL_MATRIX=Mat4.multiply(this.world,item.local);
  for(const child of this.children)child.updateWorld(this.world);
 }
 draw(v,p){if(!this.visible)return;for(const {mesh} of this.meshes)if(mesh.visible!==false)mesh.render(v,p);for(const child of this.children)child.draw(v,p);}
}

// Builder khusus Kai: bentuk geometrinya memakai helper proyek yang sama.
class RigBuilder extends CharacterBuilder {
 addMesh(...args){const mesh=super.addMesh(...args);mesh.joint=this.joint;return mesh;}
 bezierTube(...args){const mesh=super.bezierTube(...args);mesh.joint=this.joint;return mesh;}
 bind(){for(const mesh of this.parts){if(!mesh.joint)throw Error('Mesh Kai belum memiliki joint');mesh.joint.attach(mesh);}}
}
