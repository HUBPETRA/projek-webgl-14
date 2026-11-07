// Koreografi waktu absolut: translate, rotate, scaling, Rodrigues, hierarki per karakter.
const DuelAnimation={
 duration:46,
 cues:[{time:0,label:'01 · Kai mencari Po'},{time:6,label:'02 · Rival lama'},
  {time:9,label:'03 · Mr. Ping melerai'},{time:15,label:'04 · Oogway maju'},
  {time:20,label:'05 · Tangkisan tongkat'},{time:24,label:'06 · Langkah menghindar'},
  {time:28,label:'07 · Putaran cangkang'},{time:33,label:'08 · Sapuan balasan'},
  {time:38,label:'09 · Bukan tempat bertarung'}],
 smooth(a,b,t){const u=Math.max(0,Math.min(1,(t-a)/(b-a)));return u*u*(3-2*u);},
 pulse(a,b,c,d,t){return this.smooth(a,b,t)*(1-this.smooth(c,d,t));},
 label(t){return this.cues.filter(c=>c.time<=t).at(-1).label;},
 dialogue(t){
  const lines=[[0,3,'KAI','Di mana Po? Aku tahu dia ada di lembah ini.'],[3,6,'MR. PING','Mencari Po? Ada urusan apa?'],
   [6,9,'KAI','Oogway... rupanya kau ada di sini.'],[9,12,'MR. PING','Hei! Turunkan senjata itu!'],
   [12,15,'KAI','Minggir. Ini urusanku dengannya.'],[15,19,'OOGWAY','Ping, mundurlah. Biar aku yang menghadapinya.'],
   [19,22,'KAI','Kali ini kau tidak akan lolos!'],[22,25,'OOGWAY','Amarah membuat gerakanmu mudah dibaca.'],
   [25,28,'MR. PING','Pelan-pelan! Restoranku bukan arena kung fu!'],[28,33,'KAI','Berhenti menghindar, Oogway!'],
   [33,38,'OOGWAY','Kalau begitu... berhentilah menyerang.'],[38,42,'MR. PING','Mau bertarung? DI LUAR! Ini tempat makan!'],
   [42,46,'KAI','Aku belum selesai denganmu...']];
  const line=lines.find(l=>t>=l[0]&&t<l[1])||[0,0,'OOGWAY','Kita bicarakan setelah kau tenang.'];return {speaker:line[2],text:line[3]};
 },
 oogway(scene,t){
  const R=scene.oogRig,J=R.joints,S=(a,b)=>this.smooth(a,b,t),P=(a,b,c,d)=>this.pulse(a,b,c,d,t);
  R.root.reset();const advance=S(15,19),walk=P(15,15.4,18.5,19),guard=P(18,19.5,35.5,38),
   parry=P(20.3,21.2,22,23.3),dodge=P(24,25.3,26.2,27.8),turn=P(28,29.7,30.4,32.6),
   crouch=P(28.1,29.3,30.8,32.5),sweep=P(35,35.8,36.4,37.5),settle=S(38,40);
  R.root.position=[4.25-2.75*advance+.5*dodge-1.15*sweep,1.78,.25+1.4*dodge];
  R.root.rotation[1]=-.68-.3*advance+Math.PI*.95*turn+.85*sweep+.35*settle;
  J.body.rotation=[.06*guard+.24*crouch,.20*parry-.28*sweep,.33*dodge];
  J.neck.rotation=[-.08*guard,.14*Math.sin(t*1.5)*guard,-.12*dodge];
  J.head.rotation=[-.11*parry+.12*S(40,41)*Math.sin(t*3),-.20*turn,0];
  const breath=.024*Math.sin(t*2)+.055*P(17.6,18.4,19.1,20);
  J.breath.scale=[1+breath*.5,1+breath,1+breath*.8];
  J.tail.rotation[0]=1.10+.10*Math.sin(t*3)*walk;
  for(const s of [-1,1]){
   const stride=Math.sin((t-15)*5.2+(s<0?Math.PI:0))*walk;
   J['hip'+s].rotation=[-.48*stride+.74*crouch,0,-s*.12*guard];
   J['knee'+s].rotation[0]=Math.max(0,-stride)*.55-1.25*crouch;
   J['ankle'+s].rotation[0]=.50*crouch;
   J['shoulder'+s].rotation=[-.18*guard,.15*s*guard,-s*(.65-.30*guard)];
   J['elbow'+s].rotation[1]=-s*.25*guard;
   J['wrist'+s].rotation[0]=-.10*guard;
  }
  // Tangan kiri -> siku -> pergelangan -> tongkat. Putaran diwariskan pada genggaman.
  J['shoulder-1'].rotation[0]=-.15-.38*parry-.25*crouch;
  J['shoulder-1'].rotation[2]=.42-.8*parry+.12*crouch-.15*sweep-.9*P(32.8,33.1,35,35.3);
  J['elbow-1'].rotation[1]=.3+.32*parry;
  J['wrist-1'].rotation[2]=-.18*parry;
  J.shoulder1.rotation[0]=-.65*guard-.30*parry;
  J.elbow1.rotation[1]=-.65*guard;
  J.staff.rotation=[.12*guard,0,.30*(1-guard)-.42*parry+.85*crouch+.8*dodge-1.18*sweep];
  J.staff.angle=Math.PI*2*S(33,35.1); // Rodrigues [0.35,0.82,0.44], satu putaran penuh.
  R.root.updateWorld();CharacterRigs.ground(R.root,R.feet);
  // Saat sapuan, tongkat diarahkan ke kaki Kai sebelum ia kehilangan keseimbangan.
  scene.staffContact=Mat4.point(J.staff.world,[0,.85,0]);
  scene.shellContact=Mat4.point(J.body.world,[0,.6,-.82]);
 },
 ping(scene,t){
  const R=scene.pingRig,J=R.joints,S=(a,b)=>this.smooth(a,b,t),P=(a,b,c,d)=>this.pulse(a,b,c,d,t);
  R.root.reset();const enter=S(8.5,10),retreat=S(12.2,15),returning=S(38,40),
   walk=P(8.5,8.7,9.8,10.2)+P(12.2,12.5,14.5,15)+P(38,38.3,39.6,40),
   stop=P(9.8,10.5,11.8,12.4),duck=P(12,12.6,13.2,14.3),scold=P(38.5,39.3,44.7,46);
  R.root.position=[6.1-5.5*enter+5.0*retreat-2.4*returning,1.42,-4.65+5.6*enter+1.9*retreat-.7*returning];
  R.root.rotation[1]=-.5-.10*enter+.25*retreat-.35*returning;
  J.body.rotation=[.05*Math.sin(t*9)*walk,0,-.06*Math.sin(t*11)*walk];
  J.body.angle=-.40*duck+.13*Math.sin((t-39)*5)*scold; // Rodrigues, tubuh condong diagonal.
  const breath=.022*Math.sin(t*2.6)+.085*P(38.4,39.1,39.8,40.4);
  J.breath.scale=[1+breath,1+breath*.6,1+breath];
  J.neck.rotation=[.30*duck,.11*Math.sin(t*5)*stop,-.12*scold];
  J.neck.scale[1]=1-.10*duck;
  J.head.rotation=[-.12*scold,-.4*stop+.22*Math.sin(t*7)*stop+.18*Math.sin(t*6)*scold,0];
  J.jaw.rotation[0]=.13*(.5+.5*Math.sin(t*13))*(stop+scold);
  for(const s of [-1,1]){
   const stride=Math.sin(t*10+(s<0?Math.PI:0))*walk;
   J['hip'+s].rotation[0]=-.55*stride+.55*duck;
   J['knee'+s].rotation[0]=Math.max(0,-stride)*.8-1.0*duck;
   J['ankle'+s].rotation[0]=.4*duck;
   J['shoulder'+s].rotation=[-.22*stop-.6*duck,.12*Math.sin(t*8)*stop,-s*(.78-.82*stop-.8*duck)];
   J['elbow'+s].rotation[1]=-s*(.45*stop+.6*duck);
   J['wrist'+s].rotation[2]=s*.17*Math.sin(t*11)*(stop+scold);
  }
  // Mengusir dengan sayap kiri ke arah jalan masuk, tanpa properti tambahan.
  J['shoulder-1'].rotation[2]+=-.90*scold;J['shoulder-1'].rotation[1]=-.65*scold;
  J['elbow-1'].rotation[1]=.25*scold;J['wrist-1'].rotation[1]=.3*Math.sin(t*7)*scold;
  J.shoulder1.rotation[2]+=.30*scold;
  R.root.updateWorld();CharacterRigs.ground(R.root,R.feet);
 },
 kai(scene,t){
  const K=scene.kai,J=K.joints,S=(a,b)=>this.smooth(a,b,t),P=(a,b,c,d)=>this.pulse(a,b,c,d,t);
  K.root.reset();const arrive=S(.5,5.5),walk=1-S(5,5.5),threat=P(6,7,11,12.4),
   attack=P(19,20,34.8,36.5),lunge=P(20,20.8,22,23.2)+P(24,24.8,26,27.6)+P(28,28.8,31,32.6),
   hit=P(36,36.5,37.3,38),fall=S(36.4,38.4),settle=S(40,42),strideTime=t*7;
  K.root.position=[-9.2+6.5*arrive+.80*lunge-.55*fall,1.94,1.4-1.45*arrive+.25*fall];
  K.root.rotation=[-.14*hit,1.14-.23*settle,.28*hit];
  J.torso.rotation=[.10*threat+.22*attack-.32*hit-.25*fall,.22*Math.sin(t*3)*attack,0];
  J.head.rotation=[-.12*threat+.2*fall,-.45*settle,.08*Math.sin(t*3)*settle];
  const breath=.025*Math.sin(t*2.3)+.075*P(6.1,6.8,7.6,8.4);
  J.chest.scale=[1+breath*.65,1+breath,1+breath];
  J.mane.rotation[0]=.04*Math.sin(t*3)+.12*attack+.9*fall;J.mane.scale[1]=1-.10*fall;
  J.cloth.rotation[0]=-1.2*fall;J.cloth.scale[1]=1-.25*fall;
  for(const s of [-1,1]){
   const step=Math.sin(strideTime+(s<0?Math.PI:0))*walk;
   J['hip'+s].rotation[0]=-.40*step-1.65*fall;
   J['knee'+s].rotation[0]=Math.max(0,-step)*.65+.75*fall;
   J['ankle'+s].rotation[0]=.35*fall;
   J['shoulder'+s].rotation=[-.10-.55*threat-.4*attack+.3*fall,-s*.25*attack,-s*(1.05-.35*threat-.20*attack+.2*fall)];
   J['elbow'+s].rotation[1]=-s*(.32+.45*attack);
   J['wrist'+s].rotation[0]=.15*Math.sin(t*5+s)*attack;
  }
  // Posisi duduk dihitung dari kaki/badan asli, bukan memperkecil model.
  K.root.position[1]-=.8*fall;K.root.updateWorld();
  const feet=[-1,1].flatMap(s=>J['ankle'+s].meshes.map(i=>i.mesh));
  CharacterRigs.ground(K.root,fall>.2?K.builder.parts:feet);
  const spin=P(0,.5,4.9,5.8);
  for(const weapon of K.weapons){
   const s=weapon.side;let target=null,weight=0;
   if(s===1&&t>=6&&t<12){target=[3.5,3.45,.35];weight=P(6,7.2,10.8,12);}
   if(s===1&&t>=12&&t<14.5){target=[.2,3.5,.6];weight=P(12,12.7,13.3,14.5);}
   if(s===1&&t>=20&&t<23.5){target=scene.staffContact;weight=P(20,21.1,22,23.5);}
   if(s===-1&&t>=24&&t<28){target=[1.6,3.1,.15];weight=P(24,25.1,26.3,28);}
   if(s===1&&t>=28&&t<33){target=scene.shellContact;weight=P(28,29.6,30.5,33);}
   weapon.targetOverride=target;weapon.update(t,spin,weight,fall);
  }
 },
 finalizeStaff(scene,t){
  const weight=this.pulse(35,35.75,36.3,37.25,t);if(weight<=0)return;
  const staff=scene.oogRig.joints.staff,grip=Mat4.point(staff.world,[0,0,0]);
  const target=Mat4.point(scene.kai.joints.ankle1.world,[0,-.18,.10]);
  const desired=normalizeVector(grip.map((v,i)=>v-target[i])),current=normalizeVector([staff.world[4],staff.world[5],staff.world[6]]);
  const axis=crossVector(current,desired),angle=Math.acos(Math.max(-1,Math.min(1,current.reduce((s,v,i)=>s+v*desired[i],0))))*weight;
  const around=Mat4.multiply(Mat4.translation(...grip),Mat4.multiply(Mat4.axisRotation(axis,angle),Mat4.translation(...grip.map(v=>-v))));
  staff.world=Mat4.multiply(around,staff.world);
  for(const item of staff.meshes)item.mesh.MODEL_MATRIX=Mat4.multiply(staff.world,item.local);
  scene.sweepTarget=target;scene.sweepTip=Mat4.point(staff.world,[0,-2.205,0]);
 }
};
