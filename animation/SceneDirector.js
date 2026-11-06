// Penghubung sementara dengan Oogway. Model rekan tidak diubah.
// Ganti updateOogway() dengan animasi final rekan; gunakan waktu/cues yang sama.
class SceneDirector {
 constructor(gl,program){
  this.kai=new Kai(gl,program,0);
  this.oogway=new Oogway(gl,program,0);
  this.oogwayRoot=new SceneNode('oogwayPreviewRoot');
  for(const mesh of this.oogway.builder.parts)this.oogwayRoot.attach(mesh);
  this.environment=new Environment(gl,program);
  this.shadowBuilder=new CharacterBuilder(gl,program,0);
  this.kaiShadow=this.shadowBuilder.ellipsoid(1.0,.008,.72,0,.012,0,[.30,.33,.29]);
  this.oogwayShadow=this.shadowBuilder.ellipsoid(.70,.008,.56,3.6,.012,0,[.30,.33,.29]);
  this.counterBuilder=new CharacterBuilder(gl,program,0);
  this.counterRing=this.counterBuilder.torus(.66,.065,0,0,0,[.64,.89,.53]);
  this.counterCore=this.counterBuilder.ellipsoid(.19,.19,.19,0,0,0,[.84,.97,.66]);
  this.time=0;this.duration=KaiAnimation.duration;
  this.events=KaiAnimation.cues;
 }
 update(seconds){
  this.time=Math.max(0,Math.min(this.duration,seconds));
  this.kai.update(this.time);this.updateOogway(this.time);
  const fall=KaiAnimation.smooth(27.3,30,this.time),pos=this.kai.root.position;
  this.kaiShadow.MODEL_MATRIX=Mat4.multiply(Mat4.translation(pos[0],.013,pos[2]+fall*.7),Mat4.scaling(1,1,1+fall));
  this.oogwayShadow.MODEL_MATRIX=Mat4.translation(this.oogwayRoot.position[0],.013,this.oogwayRoot.position[2]);
 }
 updateOogway(t){
  const smooth=(a,b)=>KaiAnimation.smooth(a,b,t),pulse=(a,b,c,d)=>KaiAnimation.pulse(a,b,c,d,t);
  const dodge=pulse(16,16.6,17.6,18.3)+pulse(18.4,19,20,20.7);
  const counter=pulse(20.8,21.4,22,23.3);
  this.oogwayRoot.position=[3.6-.80*counter,1.87,.8*dodge];
  this.oogwayRoot.rotation=[0,-Math.PI/2,-.08*counter];
  this.oogwayRoot.updateWorld();
  this.counterVisible=t>=20.9&&t<=21.6;
  const travel=smooth(20.9,21.3);
  const chi=Mat4.translation(3.2-5.7*travel,2.3,0);
  this.counterRing.MODEL_MATRIX=Mat4.multiply(chi,Mat4.multiply(Mat4.axisRotation([0,0,1],Math.PI/2),Mat4.scaling(.5+.7*travel)));
  this.counterCore.MODEL_MATRIX=chi;
 }
 draw(view,projection,{environment=true,oogway=true}={}){
  if(environment)this.environment.draw(view,projection);
  if(environment){this.kaiShadow.render(view,projection);if(oogway)this.oogwayShadow.render(view,projection);}
  if(oogway)this.oogwayRoot.draw(view,projection);
  this.kai.draw(view,projection);
  if(oogway&&this.counterVisible)this.counterBuilder.draw(view,projection);
 }
}
