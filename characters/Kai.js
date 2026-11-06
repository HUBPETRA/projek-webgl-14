class Kai {
 constructor(GL,shaderProgram,originX=0){
  this.originX=originX;
  this.root=new SceneNode('kaiRoot');this.joints={};
  const joint=(name,pivot,parent)=>this.joints[name]=new SceneNode(name,pivot,parent);
  const pelvis=joint('pelvis',[0,-.65,0],this.root);
  const torso=joint('torso',[0,-.45,0],pelvis);
  joint('chest',[0,.90,0],torso);
  joint('cloth',[0,-.74,.52],pelvis);
  joint('head',[0,1.47,0],torso);
  joint('mane',[0,1.45,-.15],torso);
  for(const s of [-1,1]){
   const shoulder=joint('shoulder'+s,[s*.94,.98,0],torso);
   const elbow=joint('elbow'+s,[s*1.68,.93,0],shoulder);
   joint('wrist'+s,[s*2.39,.93,0],elbow);
   const hip=joint('hip'+s,[s*.43,-.71,0],pelvis);
   const knee=joint('knee'+s,[s*.45,-1.29,0],hip);
   joint('ankle'+s,[s*.45,-1.66,.035],knee);
  }
  this.builder=new RigBuilder(GL,shaderProgram,0);
  this.createModel();this.builder.bind();
  this.weapons=[-1,1].map(s=>new KaiWeapon(GL,shaderProgram,this.joints['wrist'+s],s));
  this.update(0);
 }
 createModel(){
  const B=this.builder,skin=[.37,.39,.38],muscle=[.40,.42,.41],dark=[.24,.27,.25],black=[.035,.047,.038],hair=[.035,.075,.044],jade=[.09,.53,.18],jadeBright=[.16,.76,.30],iron=[.40,.43,.39],leather=[.19,.095,.045],ivory=[.70,.70,.56];
  B.joint=this.joints.torso;
  // Siluet torso menyatu: bahu lebar, perut besar, pinggul lebih sempit.
  B.ellipsoid(.89,1.30,.58,0,.27,-.04,skin);
  B.ellipsoid(.85,.88,.60,0,-.01,.02,skin);
  B.ellipsoid(.99,.64,.52,0,.95,-.035,dark);
  for(const s of [-1,1]){
   B.joint=this.joints.chest;
   B.ellipsoid(.52,.26,.14,s*.43,.98,.44,muscle,0,0,-s*9);
   B.joint=this.joints['shoulder'+s];
   B.ellipsoid(.52,.36,.41,s*.99,1.00,.0,muscle);
   // Lengan horizontal: cylinder sebagai tulang, ellipsoid untuk biceps/triceps.
   B.cylinder(.25,.76,s*1.30,.94,0,skin,0,0,90);
   B.ellipsoid(.43,.27,.33,s*1.43,1.00,.045,muscle);
   B.ellipsoid(.42,.17,.28,s*1.44,.76,-.015,dark);
   B.joint=this.joints['elbow'+s];
   B.ellipsoid(.35,.23,.27,s*1.87,.92,0,skin);
   B.frustum(.31,.28,.59,s*2.01,.93,0,leather,0,0,90);
   for(const x of [1.76,2.25]) B.frustum(.322,.322,.055,s*x,.93,0,iron,0,0,90);
   B.joint=this.joints['wrist'+s];
   B.hyperboloid(.20,.20,.25,s*2.39,.93,0,dark,0,0,90);
   B.ellipsoid(.24,.16,.20,s*2.57,.93,.02,skin);
   for(let k=0;k<3;k++)B.ellipsoid(.11,.10,.070,s*2.67,.91,-.13+k*.14,dark);
   B.joint=this.joints['elbow'+s];
   // Rantai membungkus pelindung lengan, cincin bergantian menyilang.
   for(let turn=0;turn<3;turn++)for(let i=0;i<14;i++){
    const a=i*Math.PI*2/14,x=s*(1.80+turn*.16+.025*Math.sin(a));
    B.torus(.064,.016,x,.93+.34*Math.cos(a),.34*Math.sin(a),iron,0,90,i*360/14+(i%2?55:0));
   }
   for(let k=0;k<3;k++)B.segment([s*(1.86+k*.15),1.18,-.03],[s*(1.88+k*.15),1.42,-.02],.064,0,iron);
   B.joint=this.joints['hip'+s];
   B.ellipsoid(.39,.37,.36,s*.43,-.99,-.03,skin);
   B.joint=this.joints['knee'+s];
   B.ellipsoid(.25,.24,.25,s*.45,-1.29,0,skin);
   B.cylinder(.23,.65,s*.45,-1.40,.00,skin);
   B.joint=this.joints['ankle'+s];
   B.paraboloidSection(.235,.22,.45,s*.45,-1.69,.035,dark,90,0,0,0,.80);
   for(const d of [-1,1]) B.paraboloidSection(.106,.11,.19,s*.45+d*.12,-1.78,.34,black,90,0,0,0,.82);
  }
  B.joint=this.joints.head;
  // Pangkal leher tertutup surai, kepala yak relatif kecil.
  B.ellipsoid(.40,.40,.34,0,1.47,.00,dark);
  B.ellipsoid(.43,.50,.34,0,1.90,.10,dark);
  B.ellipsoid(.31,.30,.23,0,1.71,.32,skin);
  B.paraboloidSection(.29,.145,.24,0,1.69,.39,[.48,.49,.46],90,0,0,0,.82);
  B.ellipsoid(.24,.10,.10,0,1.79,.585,dark);
  for(const s of [-1,1]){
   B.ellipsoid(.055,.033,.020,s*.14,1.80,.667,black);
   B.ellipsoid(.12,.073,.041,s*.17,2.02,.394,black);
   B.ellipsoid(.082,.043,.025,s*.17,2.02,.434,jadeBright);
   B.ellipsoid(.024,.040,.013,s*.17,2.02,.457,black);
   B.curve([[s*.05,2.09,.46],[s*.16,2.10,.46],[s*.24,2.17,.42],[s*.33,2.12,.32]],.043,black,.014);
   B.ellipsoid(.28,.10,.125,s*.45,1.99,.01,skin,0,0,s*7);
   // Tanduk hijau besar melengkung mengikuti Bezier.
   const horn=[[s*.31,2.26,.02],[s*1.25,2.45,-.15],[s*.50,3.59,-.42],[s*.25,4.25,-.49]];
   B.curvedHorn(horn,.23,jade);
   for(let k=0;k<3;k++){
    const p=cubicBezier(...horn,.23+k*.19);
    B.curvedHorn([p,[p[0]+s*.14,p[1]+.04,p[2]],[p[0]+s*.18,p[1]+.19,p[2]],[p[0]+s*.13,p[1]+.26,p[2]]],.07,jade);
   }
   B.curvedHorn([[s*.35,1.99,.02],[s*.59,1.91,.11],[s*.77,1.96,.12],[s*.92,2.11,.10]],.045,jade);
   B.cone(.039,.12,s*.20,1.59,.63,ivory,0,0,s*8);
  }
  B.curve([[-.24,1.61,.565],[-.1,1.57,.62],[.1,1.57,.62],[.24,1.61,.565]],.017,black);
  for(let i=0;i<5;i++)B.ellipsoid(.023,.022,.014,(i-2)*.057,1.588,.623,ivory);
  // Manik giok kecil pada rambut di dahi.
  for(let row=0;row<3;row++)for(let col=-1;col<=1;col++) B.ellipsoid(.023,.022,.017,col*.10,2.16+row*.085,.34-row*.025,jadeBright);
  B.joint=this.joints.mane;
  // Surai belakang panjang: permukaan parametrik dengan tepi bergerigi.
  for(const back of [0,.045]) B.surface((u,v)=>{
   const a=(u-.5)*Math.PI,wide=.42+1.00*v;
   return [Math.sin(a)*wide,1.96-3.72*v-.13*Math.cos(u*17*Math.PI)*Math.pow(v,5),-.19-.83*v-.57*Math.cos(a)*Math.sin(Math.PI*v)+back];
  },72,40,hair,(u,v)=>hair.map((c,k)=>c*(.72+.36*Math.pow(Math.cos(u*11+v*3),8))));
  // Helai rambut bervolume, hitam dengan ujung hijau; tidak menyalin vertex GLB.
  const strand=(pts,r)=>{
   const m=generateBezierTail(...pts,r,.002,30,9,hair);
   for(let i=0;i<m.vertices.length;i+=6){const t=Math.floor(i/6/9)/30,f=Math.pow(t,2.3);for(let k=0;k<3;k++)m.vertices[i+3+k]=hair[k]*(1-f)+jade[k]*f;}
   B.addMesh(m,0,0,0);
  };
  for(const s of [-1,1])for(let i=0;i<14;i++){
   const t=i/13,x=s*(.48+.45*t),z=.02-.08*t;
   strand([[s*(.37+.16*t),2.14-.08*t,z],[x,1.65,.49],[s*(.45+.63*t),1.00,.63],[s*(.41+.80*t+.04*Math.sin(i*5)),.16+.70*t+.13*Math.sin(i*3),.62]],.058+.016*t);
  }
  for(let i=0;i<13;i++){
   const x=(i-6)*.070;
   strand([[x,2.15,-.20],[x*2.2,1.46,-.72],[x*3.0,-.25,-1.08],[x*3.2,-1.70-(i%3)*.08,-1.1]],.105);
  }
  strand([[0,1.55,.47],[.03,1.00,.61],[-.02,.44,.61],[0,-.03,.57]],.11);
  for(const s of [-1,1])strand([[s*.28,1.77,.29],[s*.35,1.16,.47],[s*.39,.71,.49],[s*.44,.47,.49]],.066);
  B.joint=this.joints.pelvis;
  // Sabuk, kain pinggang, dan cincin logam.
  const belt=generateTruncatedCone(.82,.84,.13,48,[.17,.25,.12]);for(let i=2;i<belt.vertices.length;i+=6)belt.vertices[i]*=.74;B.addMesh(belt,0,-.72,0);
  B.joint=this.joints.cloth;
  B.surface((u,v)=>[(u-.5)*.72*(1-.25*v),-.74-v*.93+.035*Math.sin(u*7*Math.PI)*v,.54+.035*Math.sin(u*6*Math.PI)+.02*v],24,20,leather);
  B.joint=this.joints.pelvis;
  for(let i=0;i<5;i++)B.torus(.062,.015,(i-2)*.28,-.85,.55,iron);
 }
 // Waktu absolut dalam detik membuat replay, pause, dan seek konsisten.
 update(seconds){KaiAnimation.apply(this,seconds);}
 draw(v,p){this.root.draw(v,p);for(const weapon of this.weapons)weapon.draw(v,p);}
}
