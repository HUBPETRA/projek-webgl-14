// Model prosedural, proporsi ditinjau dari GLB. Tidak memuat vertex/tekstur GLB.
class Shifu {
 constructor(GL,shaderProgram,originX=-5){this.builder=new CharacterBuilder(GL,shaderProgram,originX);this.createModel();}
 createModel(){
  const B=this.builder,cream=[.88,.87,.77],white=[.97,.96,.88],rust=[.59,.38,.17],tan=[.56,.37,.13],brown=[.25,.14,.075],green=[.075,.29,.12],dark=[.09,.07,.055],gold=[.69,.54,.16];
  B.ellipsoid(.23,.27,.24,0,.89,.02,cream);
  B.ellipsoid(.79,.62,.49,0,1.53,.04,cream);
  B.ellipsoid(.64,.36,.42,0,1.25,.16,cream);
  for(const s of [-1,1]){
   // Dua sisi telinga paraboloid pipih membentuk volume, bukan bidang datar.
   B.paraboloid(.31,.69,.13,s*.61,2.13,-.035,cream,90,0,-s*28);
   B.paraboloid(.31,.69,.15,s*.61,2.13,-.035,cream,-90,0,-s*28);
   B.paraboloid(.265,.60,.14,s*.61,2.15,.01,rust,90,0,-s*28);
   B.paraboloid(.20,.44,.11,s*.59,2.12,.085,[.39,.28,.16],90,0,-s*28);
   B.paraboloid(.145,.27,.08,s*.49,1.94,.13,white,90,0,-s*28);
   B.ellipsoid(.34,.31,.11,s*.32,1.57,.444,rust,0,0,-s*10);
   B.ellipsoid(.235,.213,.095,s*.32,1.58,.516,[.45,.31,.16]);
   B.ellipsoid(.187,.153,.105,s*.32,1.58,.560,cream);
   B.ellipsoid(.095,.106,.039,s*.32,1.57,.654,[.24,.46,.57]);
   B.ellipsoid(.050,.070,.024,s*.32,1.57,.686,[.025,.038,.04]);
   B.ellipsoid(.021,.025,.015,s*.298,1.61,.707,white);
   B.curve([[s*.13,1.65,.62],[s*.22,1.81,.65],[s*.41,1.82,.61],[s*.53,1.65,.57]],.027,brown);
   B.curve([[s*.075,1.82,.55],[s*.23,1.94,.56],[s*.55,1.91,.50],[s*.83,1.65,.33]],.061,white,.011);
   for(let i=0;i<7;i++){
    const x=s*(.47+i*.045),y=1.88-i*.018;
    B.curve([[x,y,.42],[x+s*.09,y+.08,.46],[x+s*.13,y+.01,.42],[x+s*.09,y-.16-i*.012,.38]],.022,white,.001);
   }
   B.ellipsoid(.32,.205,.13,s*.37,1.25,.48,white,0,0,s*8);
   for(let i=0;i<8;i++)B.curve([[s*(.46+i*.022),1.36,.39],[s*(.64+i*.018),1.32,.40],[s*(.66+i*.015),1.18,.34],[s*(.59+i*.014),1.10,.26]],.028,cream,.004);
  }
  B.paraboloidSection(.25,.145,.22,0,1.37,.49,white,90,0,0,0,.83);
  B.ellipsoid(.10,.075,.070,0,1.43,.708,brown);
  B.curve([[-.11,1.31,.695],[-.06,1.275,.717],[.06,1.275,.717],[.11,1.31,.695]],.015,dark);
  for(const s of [-1,1]){
   B.curve([[s*.105,1.36,.66],[s*.25,1.23,.75],[s*.22,.71,.76],[s*.235,.30,.72]],.022,white,.0025);
   B.curve([[s*.17,1.34,.63],[s*.23,1.17,.72],[s*.25,.86,.72],[s*.27,.48,.68]],.011,cream,.001);
  }
  B.curve([[0,1.14,.48],[0,.97,.65],[.025,.86,.68],[0,.73,.65]],.104,white,.021);
  B.curve([[0,.77,.65],[.045,.62,.67],[-.015,.52,.70],[.035,.44,.68]],.030,white,.001);
  B.frustum(.032,.032,.045,0,.76,.65,brown);
  B.ellipsoid(.64,.85,.40,0,-.03,-.05,tan);
  const robe=generateTruncatedCone(.72,.55,1.57,48,tan);
  for(let i=2;i<robe.vertices.length;i+=6)robe.vertices[i]*=.60;
  B.addMesh(robe,0,-.47,-.07); // Elliptic cone frustum untuk jubah bawah.
  for(const s of [-1,1]){
   B.cylinder(.175,1.03,s*1.01,.51,-.04,rust,0,0,90);
   B.frustum(.27,.23,.88,s*1.03,.50,-.04,tan,0,0,90);
   B.frustum(.28,.28,.060,s*1.48,.50,-.04,gold,0,0,90);
   B.hyperboloid(.12,.13,.19,s*1.57,.51,-.04,brown,0,0,90); // Tambahan di luar DOCX.
   B.ellipsoid(.22,.073,.135,s*1.73,.50,-.01,brown);
   for(let i=0;i<3;i++){
    B.cylinder(.025,.19,s*(1.90-i*.035),.495,-.10+i*.08,brown,0,0,90);
    B.cone(.022,.075,s*(2.015-i*.035),.495,-.10+i*.08,[.33,.27,.18],0,0,-s*90);
   }
   B.cylinder(.17,.48,s*.25,-1.36,0,cream);
   B.ellipsoid(.21,.13,.30,s*.25,-1.61,.10,cream);
   for(let i=0;i<2;i++)B.ellipsoid(.095,.075,.105,s*.25+(i-.5)*.19,-1.65,.35,tan);
  }
  // Selendang tambahan mengikuti lipatan parametrik. Tidak dihitung sebagai quadric.
  const cloth=(u,v)=>{
   const a=-Math.PI/2+2*Math.PI*u,top=.38+.43*Math.sin(a),bottom=-1.20+.13*Math.sin(a);
   const r=.62+.13*v+.051*Math.sin(18*u+7*v)*Math.sin(Math.PI*v);
   return [r*Math.sin(a),top+(bottom-top)*v,(.49+.025*Math.sin(20*u-5*v))*Math.cos(a)-.02];
  };
  B.surface(cloth,72,28,green,(u,v)=>green.map(c=>c*(.9+.10*Math.sin(19*u+6*v))));
  B.surface((u,v)=>[.66+u*.90,.70-.12*u-v*(.45+.70*u),-.08+.30*Math.cos(Math.PI*v)+.04*Math.sin(u*15+v*4)],32,28,green);
  B.curve([[-.67,-1.22,.14],[-.30,-1.25,.60],[.30,-1.05,.61],[.73,-1.05,.1]],.020,[.12,.35,.17]);
  B.curve([[-.61,-.03,.28],[-.22,.25,.59],[.32,.55,.56],[.68,.80,.03]],.025,[.15,.38,.17]);
  for(let i=0;i<5;i++)B.torus(.071,.025,.60+i*.046,.78-i*.055,.34,gold,0,0,-30);
  B.curve([[.72,.69,.34],[.84,.72,.33],[.81,.52,.40],[.90,.46,.43]],.033,gold);
  // Potongan paraboloid berturutan dengan parameter sama: sambungan ekor kontinu.
  for(let i=0;i<7;i++)B.paraboloidSection(.34,.29,1.60,0,-.72,-.30,i%2?cream:[.53,.46,.34],-123,0,0,i/7,(i+1)/7);
  B.tintPalette([tan,rust],(p,c)=>c.map(v=>v*(.96+.07*Math.sin(p[0]*14+p[2]*9)*Math.sin(p[1]*19))));
 }
 update(){} draw(v,p){this.builder.draw(v,p);}
}
