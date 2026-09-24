class Oogway {
 constructor(GL,shaderProgram,originX=0){this.builder=new CharacterBuilder(GL,shaderProgram,originX);this.createModel();}
 createModel(){
  const B=this.builder,skin=[.53,.56,.28],skinLight=[.65,.66,.39],shell=[.43,.44,.19],rim=[.44,.44,.26],belly=[.72,.71,.60],seam=[.48,.49,.38],olive=[.40,.40,.095],dark=[.105,.12,.075],white=[.92,.92,.81];
  // Badan oval dan tempurung berbentuk elliptic paraboloid tinggi.
  B.ellipsoid(.89,1.11,.53,0,-.02,.04,skin);
  B.paraboloid(1.03,1.52,.68,0,.18,-.28,shell,-90);
  const shellPoint=(r,a)=>[1.03*r*Math.cos(a),.18+1.52*r*Math.sin(a),-.28-.68*(1-r*r)];
  // Bingkai tebal mengelilingi tempurung; segmen Bezier mengikuti elips.
  for(let k=0;k<16;k++){
   const a=k*2*Math.PI/16,b=(k+1)*2*Math.PI/16;
   B.curve([shellPoint(1,a),shellPoint(1,a+(b-a)/3),shellPoint(1,a+2*(b-a)/3),shellPoint(1,b)],.060,rim);
  }
  // Pola scute di belakang mengikuti permukaan, bukan garis datar yang tertutup badan.
  for(const radius of [.45,.80])for(let k=0;k<6;k++){
   const a=k*Math.PI/3,b=(k+1)*Math.PI/3;
   B.curve([shellPoint(radius,a),shellPoint(radius,a+(b-a)/3),shellPoint(radius,a+2*(b-a)/3),shellPoint(radius,b)].map(p=>[p[0],p[1],p[2]-.013]),.025,rim);
  }
  for(let k=0;k<6;k++){
   const a=k*Math.PI/3;
   B.curve([shellPoint(.45,a),shellPoint(.61,a),shellPoint(.79,a),shellPoint(1,a)].map(p=>[p[0],p[1],p[2]-.015]),.022,rim);
  }
  // Pelat plastron menyatu mengikuti satu ellipsoid, celah tipis antarbaris.
  const plate=(u,v)=>{const th=-Math.PI*.46+u*Math.PI*.92,lat=-1.1+v*2.22;return [.86*Math.sin(th)*Math.cos(lat),-.04+1.10*Math.sin(lat),.10+.55*Math.cos(th)*Math.cos(lat)];};
  for(let row=0;row<5;row++)for(let col=0;col<2;col++){
   B.surface((u,v)=>plate(col*.5+.005+u*.49,row*.2+.006+v*.189),24,10,belly,(u,v)=>belly.map(c=>c*(.94+.06*Math.sin(Math.PI*v))));
  }
  // Pangkal leher ellipsoid, leher miring memakai hyperboloid.
  B.ellipsoid(.60,.49,.42,0,.78,.06,skin);
  const neckA=[0,.96,.18],neckB=[0,2.18,.81];
  B.along(generateHyperboloidOneSheet(.245,.235,Math.hypot(1.22,.63),44,28,.80,skin),neckA,neckB);
  B.ellipsoid(.29,.29,.28,0,2.18,.81,skin);
  B.ellipsoid(.36,.34,.35,0,2.40,.94,skinLight);
  B.paraboloidSection(.34,.15,.26,0,2.26,1.15,belly,90,0,0,0,.83);
  B.ellipsoid(.275,.14,.20,0,2.15,1.23,belly);
  // Mata setengah terpejam dengan kelopak atas dan lipatan di dahi.
  for(const s of [-1,1]){
   B.ellipsoid(.165,.125,.12,s*.18,2.51,1.19,white);
   B.ellipsoid(.073,.058,.038,s*.18,2.51,1.30,[.36,.37,.20]);
   B.ellipsoid(.042,.044,.023,s*.18,2.51,1.333,dark);
   B.ellipsoid(.016,.019,.012,s*.163,2.54,1.350,white);
   // Half-ellipsoid lid follows the same eyeball, covering upper third.
   B.surface((u,v)=>{const a=u*Math.PI*2,t=.13+v*(Math.PI/2-.13);return [s*.18+.171*Math.cos(t)*Math.cos(a),2.51+.135*Math.sin(t),1.19+.127*Math.cos(t)*Math.sin(a)];},36,10,skin);
   B.curve([[s*.05,2.62,1.24],[s*.12,2.72,1.25],[s*.27,2.70,1.22],[s*.33,2.57,1.16]],.040,skin,.025);
   B.curve([[s*.07,2.66,1.18],[s*.10,2.77,1.09],[s*.22,2.77,1.03],[s*.30,2.66,.97]],.018,rim,.009);
   B.ellipsoid(.033,.020,.010,s*.118,2.35,1.395,dark);
   for(let k=0;k<3;k++)B.curve([[s*.25,2.43-k*.043,1.23],[s*.32,2.41-k*.041,1.19],[s*.36,2.39-k*.04,1.11],[s*.35,2.38-k*.04,1.04]],.010,rim,.004);
  }
  B.curve([[-.29,2.245,1.30],[-.19,2.16,1.423],[.19,2.16,1.423],[.29,2.245,1.30]],.018,[.27,.29,.16]);
  // Lipatan leher memanjang tipis; warna saja tidak mengganti bentuk hyperboloid.
  for(const s of [-1,1]) B.curve([[s*.09,2.16,1.02],[s*.14,1.79,.86],[s*.10,1.38,.63],[s*.25,1.08,.51]],.012,rim,.007);
  for(const s of [-1,1]){
   B.cylinder(.16,.87,s*1.01,.53,.03,skin,0,0,90);
   B.ellipsoid(.43,.235,.255,s*1.05,.55,.06,skinLight);
   B.ellipsoid(.32,.15,.24,s*1.57,.52,.08,skin);
   for(let i=0;i<3;i++){
    const z=-.10+i*.16;
    B.ellipsoid(.22,.075,.068,s*1.76,.51,z,skinLight);
    B.cone(.057,.26,s*1.98,.49,z,[.26,.28,.20],0,0,-s*96);
   }
   B.cylinder(.235,.68,s*.45,-1.19,-.02,skin);
   B.paraboloidSection(.30,.19,.43,s*.45,-1.60,.04,skinLight,90,0,0,0,.85);
   for(let i=0;i<4;i++)B.ellipsoid(.055,.047,.10,s*.45+(i-1.5)*.13,-1.70,.32,[.46,.47,.37]);
  }
  // Selendang zaitun dan manik hijau kebiruan sesuai referensi.
  B.surface((u,v)=>{const a=-Math.PI*.48+u*Math.PI*1.7;return [(.90+.025*v)*Math.sin(a),.66+.20*Math.sin(a)-v*.19,(.53+.025*v)*Math.cos(a)+.02];},64,8,olive);
  B.curve([[-.79,.59,.34],[-.42,.29,.66],[.37,.53,.69],[.81,.86,.22]],.075,olive,.068);
  const beads=[[-.70,.92,.35],[-.60,.59,.65],[-.41,.61,.68],[-.27,.57,.67]];
  for(let i=0;i<14;i++){const p=cubicBezier(...beads,i/13);B.ellipsoid(.038,.045,.035,...p,[.13,.43,.36]);}
  // Staff remains cylinder + Bezier 3D + cone tips as listed in the DOCX.
  B.cylinder(.042,3.47,-2.20,.04,.04,[.32,.35,.18]);
  B.curve([[-2.20,1.75,.04],[-2.13,2.02,.04],[-2.58,2.04,.04],[-2.46,2.40,.04]],.053,olive,.036);
  B.curve([[-2.46,2.40,.04],[-2.32,2.73,.04],[-1.90,2.65,.04],[-1.92,2.38,.04]],.038,olive,.003);
  B.curve([[-2.20,1.75,.04],[-1.90,1.78,.04],[-1.96,2.15,.04],[-2.19,2.09,.04]],.066,olive,.035);
  B.curve([[-2.19,2.09,.04],[-2.38,2.01,.04],[-2.17,1.83,.04],[-2.11,1.97,.04]],.036,olive,.004);
  B.cone(.045,.11,-1.92,2.38,.04,olive,0,0,160);
  B.cone(.033,.12,-2.11,1.97,.04,olive,0,0,30);
  // Ekor kura-kura memanjang di belakang, di luar daftar utama DOCX.
  B.curve([[0,-.83,-.53],[0,-1.55,-.76],[0,-2.14,-.82],[0,-2.48,-.89]],.17,skin,.002);
  B.tintPalette([skin,skinLight,shell],(p,c)=>{
   const n=Math.sin(p[0]*16+2*Math.sin(p[2]*11))*Math.sin(p[1]*13+Math.sin(p[0]*9));
   return c.map(v=>v*(.93+.16*n));
  });
 }
 update(){} draw(v,p){this.builder.draw(v,p);}
}
