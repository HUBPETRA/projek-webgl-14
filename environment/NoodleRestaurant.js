// Seluruh furnitur tetap bagian lingkungan statis; area duel di tengah dikosongkan.
class NoodleRestaurant extends Environment {
 create(){
  const B=this.builder,wood=[.34,.18,.10],red=[.50,.16,.10],gold=[.84,.60,.27],cream=[.77,.66,.46],teal=[.16,.34,.30];
  this.box(0,-.32,-1,26,.62,21,[.27,.34,.29]);
  for(let x=-6;x<=6;x++)for(let z=-4;z<=4;z++)this.box(x*1.8,-.05,z*1.8,1.77,.12,1.77,[.50+.025*Math.sin(x*7+z),.46,.35]);
  this.box(0,3,-6.6,20,6,.25,cream);
  for(const x of [-9.5,-6.3,-3.1,.1,3.3,6.5,9.5])B.cylinder(.14,6.4,x,3.1,-6.3,red);
  this.box(0,.65,-6.4,20,1.25,.18,wood);this.box(0,5.78,-6.25,20,.25,.35,red);
  for(const x of [-7.8,-4.6,1.6,7.9]){
   this.box(x,3.2,-6.36,2.35,2.65,.18,teal);
   for(let j=-2;j<=2;j++)this.box(x+j*.4,3.2,-6.23,.045,2.6,.05,gold);
   for(let j=-2;j<=2;j++)this.box(x,3.2+j*.43,-6.2,2.3,.045,.05,gold);
  }
  this.roof(0,6.05,-6.4,21,3,1.0);
  this.box(-1.5,5.03,-6.05,5.0,.92,.17,wood);this.box(-1.5,5.03,-5.93,4.8,.74,.08,red);
  // Lambang mi merupakan ukiran papan, bukan objek yang dimainkan karakter.
  B.curve([[-2.15,5.04,-5.85],[-2.05,4.6,-5.85],[-.95,4.6,-5.85],[-.85,5.04,-5.85]],.045,gold);
  for(let x=-1.85;x<-1.1;x+=.3)B.curve([[x,5.06,-5.84],[x-.12,5.2,-5.84],[x+.1,5.27,-5.84],[x,5.37,-5.84]],.024,gold);
  for(const x of [-8,-4,0,4,8]){
   B.cylinder(.025,.45,x,5.4,-4.7,wood);B.ellipsoid(.34,.48,.34,x,4.91,-4.7,[.88,.31,.10]);
   B.cylinder(.25,.08,x,5.34,-4.7,gold);B.cylinder(.25,.08,x,4.48,-4.7,gold);
   for(const k of [-1,0,1])B.cylinder(.014,.28,x+k*.06,4.3,-4.7,gold);
  }
  // Konter dan dua meja berada di belakang; tidak ada mangkuk, spatula, atau sayuran.
  this.box(5.9,1,-4.65,5.4,2,1.25,red);this.box(5.9,2.08,-4.65,5.6,.20,1.5,wood);
  for(const x of [4.2,5.9,7.6])this.box(x,1,-3.99,1.25,1.35,.07,[.38,.12,.075]);
  for(const [x,z] of [[-7.1,-4.0],[8.2,-1.8]]){
   this.box(x,1.6,z,2.1,.16,1.4,wood);
   for(const dx of [-.8,.8])for(const dz of [-.45,.45])this.box(x+dx,.79,z+dz,.12,1.58,.12,wood);
  }
  for(const s of [-1,1]){
   B.cylinder(.16,5.8,s*10,2.9,1.8,red);
   this.box(s*10,.5,-1,.18,1,6,wood);this.box(s*10,5.8,-1,.25,.22,6.5,red);
   for(let i=0;i<5;i++)B.cylinder(.035,1.2,s*10,.8,-3.5+i,wood);
  }
  for(let i=0;i<9;i++)B.addMesh(generateCone(5,6+i%3*2,8,[.40+i%2*.06,.51,.45]),(i-4)*6,-1,-20-i%2*5);
 }
}
