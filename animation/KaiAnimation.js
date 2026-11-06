// Urutan otomatis berdurasi 32 detik. Nilai pose dihitung dari waktu absolut.
const KaiAnimation = {
 duration:32,
 cues:[{time:0,label:'Kedatangan Kai'},{time:8,label:'Oogway menghadang'},
  {time:10,label:'Serangan dekat'},{time:15,label:'Lemparan rantai'},
  {time:21,label:'Serangan balasan'},{time:24,label:'Berlutut'},
  {time:27,label:'Tumbang'},{time:30,label:'Pertarungan berakhir'}],
 smooth(a,b,t){const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);},
 pulse(a,b,c,d,t){return this.smooth(a,b,t)*(1-this.smooth(c,d,t));},
 label(t){let label=this.cues[0].label;for(const cue of this.cues)if(t>=cue.time)label=cue.label;return label;},
 apply(kai,seconds){
  const t=Math.max(0,Math.min(this.duration,seconds));kai.time=t;
  const J=kai.joints; kai.root.reset();
  const arrival=this.smooth(0,8,t),walking=1-this.smooth(7.2,8,t);
  const walkPhase=t*Math.PI*1.5;
  const melee=this.pulse(10,11.2,13.7,15,t);
  const chain=this.pulse(15.5,16.1,20.2,21,t);
  const hit=this.pulse(21,21.3,22.2,23,t);
  const kneel=this.smooth(24,27,t),fall=this.smooth(27.3,30,t);
  const dead=this.smooth(29.6,30.5,t);
  // TRANSLATE: lintasan Kai menuju pelataran, maju menyerang, mundur kena pukul.
  kai.root.position=[kai.originX-9+6.5*arrival+3.4*melee-.55*this.smooth(21,23,t),1.98,2*(1-arrival)];
  kai.root.rotation[1]=Math.PI/2+.16*(1-arrival);
  kai.root.rotation[2]=fall*1.48;
  // Bob tubuh mengikuti langkah; saat kneel pelvis turun mendekati lantai.
  kai.root.position[1]+=.045*Math.cos(walkPhase*2)*walking- .84*kneel-.36*fall;
  J.pelvis.rotation[1]=.045*Math.sin(walkPhase)*walking;
  J.torso.rotation[0]=.06*walking+.17*melee-.23*hit+.25*kneel;
  J.torso.rotation[1]=.20*Math.sin((t-10)*4.3)*melee;
  J.head.rotation[0]=-.05+.14*kneel;
  J.head.rotation[1]=-.10*Math.sin((t-10)*3)*melee;
  J.mane.rotation[0]=-.025*Math.sin(t*2)*(1-dead);
  J.mane.scale[1]=1-.30*kneel;
  J.mane.scale[0]=1-.45*fall;
  J.cloth.rotation[0]=-.15*kneel;
  J.cloth.scale[1]=1-.3*kneel;
  // SCALING: dada mengembang kecil saat bernapas; tidak ikut membesarkan sendi.
  const breath=Math.sin(t*2.2)*.025*(1-dead);
  J.chest.scale=[1+breath*.5,1+breath,1+breath];
  for(const s of [-1,1]){
   const advance=this.pulse(10,10.2,10.9,11.2,t)-this.pulse(13.7,13.9,14.8,15,t);
   const stride=Math.sin(walkPhase+(s<0?Math.PI:0))*walking+Math.sin(t*9+(s<0?Math.PI:0))*.8*advance;
   J['hip'+s].rotation[0]=-.42*stride-.15*kneel;
   J['knee'+s].rotation[0]=Math.max(0,-stride)*.65+1.72*kneel;
   J['ankle'+s].rotation[0]=-.12*stride-1.57*kneel;
   // ROTATE: bahu di pivot bahu, bukan memutar lengan dari pusat dunia.
   J['shoulder'+s].rotation[2]=-s*(1.00-.48*melee-.25*chain)+s*.16*hit;
   J['shoulder'+s].rotation[0]=-.12+stride*.12;
   J['elbow'+s].rotation[1]=-s*(.28+.7*melee+.5*chain);
   J['wrist'+s].rotation[0]=.15*Math.sin(t*5+s)*(1-dead);
   const swing=Math.sin((t-10)*4.3+(s<0?Math.PI:0));
   J['shoulder'+s].rotation[1]=-s*(.30+.95*(swing*.5+.5))*melee;
   J['shoulder'+s].rotation[0]-=.60*melee*(swing*.5+.5)+.55*chain;
   J['shoulder'+s].rotation[2]+=-s*.30*kneel+s*.45*fall;
   J['elbow'+s].rotation[1]*=1-fall;
   J['shoulder'+s].rotation[2]=J['shoulder'+s].rotation[2]*(1-fall)-s*1.9*fall;
   J['shoulder'+s].rotation[0]*=1-fall;
  }
  kai.root.updateWorld();
  // Kontak lantai: kaki saat berjalan, seluruh badan saat berlutut/tumbang.
  // Memakai titik mesh yang sudah ada, tanpa membangun ulang geometri GPU.
  let minY=Infinity;
  const supports=kneel<.01?[-1,1].flatMap(s=>J['ankle'+s].meshes.map(item=>item.mesh)):kai.builder.parts;
  for(const mesh of supports){
   const m=mesh.MODEL_MATRIX,v=mesh.vertices;
   for(let i=0;i<v.length;i+=6)minY=Math.min(minY,m[1]*v[i]+m[5]*v[i+1]+m[9]*v[i+2]+m[13]);
  }
  kai.root.position[1]+=.025-minY;kai.root.updateWorld();
  const spin=this.pulse(0,.7,8.1,9.3,t);
  for(const weapon of kai.weapons){
   const delay=weapon.side<0?2.4:0;
   const thrown=this.pulse(16+delay,16.7+delay,17.4+delay,18.2+delay,t);
   weapon.update(t,spin,thrown,this.smooth(26,29.8,t));
  }
 }
};
