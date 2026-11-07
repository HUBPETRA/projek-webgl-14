// Hanya tiga karakter asli + lingkungan. Tidak ada properti komedi tambahan.
class SceneDirector {
 constructor(gl,program){
  this.duration=DuelAnimation.duration;this.events=DuelAnimation.cues;
  this.kai=new Kai(gl,program,0);
  this.oogRig=CharacterRigs.oogway(gl,program);this.oogway=this.oogRig.model;this.oogwayRoot=this.oogRig.root;
  this.pingRig=CharacterRigs.ping(gl,program);this.ping=this.pingRig.model;this.pingRoot=this.pingRig.root;
  this.environment=new NoodleRestaurant(gl,program);
  this.shadows=new CharacterBuilder(gl,program,0);
  this.shadowMeshes=[this.shadows.ellipsoid(.98,.009,.70,0,0,0,[.29,.28,.22]),this.shadows.ellipsoid(.73,.009,.64,0,0,0,[.29,.28,.22]),this.shadows.ellipsoid(.62,.009,.46,0,0,0,[.29,.28,.22])];
  this.update(0);
 }
 update(seconds){
  this.time=Math.max(0,Math.min(this.duration,seconds));
  DuelAnimation.oogway(this,this.time);DuelAnimation.ping(this,this.time);DuelAnimation.kai(this,this.time);DuelAnimation.finalizeStaff(this,this.time);
  CharacterRigs.keepStaffAboveFloor(this.oogRig.staff);
  [this.kai.root,this.oogwayRoot,this.pingRoot].forEach((root,i)=>this.shadowMeshes[i].MODEL_MATRIX=Mat4.translation(root.position[0],.018,root.position[2]));
 }
 draw(v,p,{environment=true,solo=null}={}){
  if(environment)this.environment.draw(v,p);
  for(const [i,name] of ['kai','oogway','ping'].entries())if((!solo||solo===name)&&environment)this.shadowMeshes[i].render(v,p);
  if(!solo||solo==='kai')this.kai.draw(v,p);
  if(!solo||solo==='oogway')this.oogwayRoot.draw(v,p);
  if(!solo||solo==='ping')this.pingRoot.draw(v,p);
 }
}
