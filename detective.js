(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const AGE=['3–5','6–8','9–11','12–14','15–18'];
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

/* Every level has four different investigation styles. Content is generated from
   the level + activity + age, so the same case is not recycled. */
const PLANS=[
 ['sequence','odd','pattern','analogy'],['visual','clue','sequence','order'],['pattern','analogy','odd','rule'],['clue','sequence','visual','deduction'],
 ['odd','pattern','order','analogy'],['sequence','clue','rule','visual'],['analogy','odd','deduction','pattern'],['order','sequence','clue','rule'],
 ['visual','deduction','odd','analogy'],['pattern','order','sequence','clue'],['rule','visual','analogy','odd'],['deduction','pattern','clue','order'],
 ['sequence','rule','visual','analogy'],['odd','deduction','pattern','clue'],['order','analogy','sequence','rule'],['visual','clue','deduction','pattern'],
 ['analogy','odd','order','visual'],['rule','sequence','clue','deduction'],['pattern','visual','analogy','order'],['deduction','rule','sequence','odd']
];
const INFO={
 sequence:['Sequence Detective','Find what comes next.','Follow the change from one item to the next.'],
 odd:['Odd One Out','Find the item that does not belong.','Compare all four items and find the one that breaks the rule.'],
 pattern:['Pattern Detective','Complete the pattern.','Look for repetition, growth, alternation or movement.'],
 analogy:['Analogy Detective','Match the relationship.','Work out the first relationship, then apply it to the second.'],
 clue:['Clue Detective','Use every clue.','The correct answer must satisfy every clue.'],
 order:['Order Detective','Put the steps in order.','Think about time, cause and effect, or what must happen first.'],
 rule:['Rule Detective','Discover the rule.','Study the examples and choose the next item that follows the same rule.'],
 visual:['Shape Detective','Complete the visual rule.','Watch direction, shape, size and count.'],
 deduction:['Logic Detective','Make the logical conclusion.','Combine the statements and choose what must be true.']
};
const THEMES=[
 ['🐶','🐱','🐰','🐼','🦊','🐸','🐵','🐯','🐨','🐷','🐮','🐙','🐳','🦋','🐝','🐢'],
 ['🍎','🍌','🍊','🍉','🍓','🍇','🥕','🌽','🍪','🍕','🧁','🥭','🍍','🥝','🍋','🍒'],
 ['🚗','🚌','🚲','🚀','✈️','🚁','🚂','⛵','🎈','🪁','⚽','🎸','🎨','🎁','🧸','🛴'],
 ['⭐','🌙','☀️','☁️','🌈','🌳','🌻','🌊','🔥','❄️','🌟','🍀','🌺','🌴','⛰️','🌋']
];
const WORDSETS=[
 ['Ball','Apple','Book','Shoe','Bird','Fish','Tree','Car','Moon','Hat','Cup','Dog','House','Bus','Cake','Boat'],
 ['Bird','Nest','Dog','Kennel','Fish','Water','Bee','Hive','Horse','Stable','Book','Library','Car','Garage','Plane','Hangar'],
 ['Seed','Plant','Egg','Chick','Teacher','School','Doctor','Hospital','Chef','Kitchen','Pilot','Airport','Artist','Studio','Farmer','Farm'],
 ['Thermometer','Temperature','Clock','Time','Compass','Direction','Ruler','Length','Scale','Weight','Barometer','Pressure','Odometer','Distance','Calendar','Date']
];

function age(){return S.age}
function lvl(){return S.level}
function seed(){return age()*1000+lvl()*37+(S.detectiveActivity||0)*101}
function pick(arr,n,offset=0){const out=[];for(let i=0;i<n;i++)out.push(arr[(seed()+offset+i*3)%arr.length]);return out}
function uniqueChoices(correct,others){
 const out=[String(correct)];
 for(const x of others.map(String))if(!out.includes(x))out.push(x);
 const n=Number(correct);
 if(out.length<4 && Number.isFinite(n)){
  for(const d of [1,-1,2,-2,3,-3,4,-4,5,-5]){const x=String(n+d);if(!out.includes(x))out.push(x);if(out.length===4)break}
 }
 return shuffle(out.slice(0,4)).map(v=>({value:v,label:`<strong>${v}</strong>`}));
}
function begin(type,html,choices,correct){
 const expected=String(correct);
 $('game-stage').innerHTML=`<div class="detective-stage"><div class="detective-title"><span>${INFO[type][0]}</span><span class="activity-chip">Activity ${(S.detectiveActivity||0)+1}/4</span></div>${html}<div id="detective-choices" class="detective-choices"></div></div>`;
 const box=$('detective-choices');S.active=true;
 shuffle(choices).forEach(c=>{
  const b=document.createElement('button');b.type='button';b.className='detective-choice';b.innerHTML=c.label;
  b.addEventListener('click',()=>{
   if(!S.active)return;
   if(String(c.value)===expected){b.classList.add('good');activityComplete()}
   else{b.classList.add('bad');S.detectiveActivity=0;MQ.levelFailed()}
  },{once:true});box.appendChild(b);
 });
}
function activityComplete(){
 if(!S.active)return;S.active=false;
 if((S.detectiveActivity||0)===3){
  S.detectiveActivity=0;$('game-message').textContent='✓ Four investigations solved!';
  $('detective-choices')?.querySelectorAll('button').forEach(b=>b.disabled=true);
  S.active=true;S.timer=setTimeout(()=>MQ.levelComplete(),650);
 }else{
  S.detectiveActivity++;
  $('game-message').textContent='✓ Investigation solved. Loading the next case…';
  S.timer=setTimeout(()=>{$('game-message').textContent='';MQ.nextChallenge()},650);
 }
}
function instruction(type){
 const x=INFO[type];S.active=false;clearTimeout(S.timer);
 $('game-stage').innerHTML=`<div class="detective-instruction"><div class="ui-icon">🔎</div><span class="ui-skill">COGNITIVE • ${AGE[age()]}</span><div class="activity-chip">Activity ${(S.detectiveActivity||0)+1}/4</div><h2>${x[0]}</h2><p class="ui-purpose">${x[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${x[2]}</p></div><div class="ui-meta"><span>🧩 Level ${S.level} reasoning</span><span>✓ One correct answer</span></div><button id="detective-start" class="primary-btn ui-start" type="button">Start Activity →</button></div>`;
 $('detective-start').onclick=()=>run(type);
}

/* ---- Age-appropriate generators ---- */
function sequence(){
 const a=age(),l=lvl(),k=(l-1)*5+a;
 if(a===0){
  const step=[1,2,1,3,2][l%5],start=1+(k%5),c=start+step*3;
  return begin('sequence',`<div class="detective-prompt"><div class="case-label">Add ${step} each time.</div><div class="logic-sequence">${[start,start+step,start+2*step,'?'].map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>What comes next?</p></div>`,uniqueChoices(c,[c+2,c-1,c+step]),c);
 }
 if(a===1){
  const mode=l%3;
  if(mode===0){const s=2+(k%6),c=s+4*2;return begin('sequence',`<div class="detective-prompt"><div class="case-label">Add 2 each time.</div><div class="logic-sequence">${[s,s+2,s+4,s+6,'?'].map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>Choose the next number.</p></div>`,uniqueChoices(c,[c+1,c-2,c+3]),c)}
  if(mode===1){const s=2+(k%5),c=s*2;return begin('sequence',`<div class="detective-prompt"><div class="case-label">Double each time.</div><div class="logic-sequence">${[s,s*2,s*4,'?'].map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>Choose the next number.</p></div>`,uniqueChoices(c,[c-2,c+2,c+4]),c)}
  const s=1+(k%4),c=s+9;return begin('sequence',`<div class="detective-prompt"><div class="case-label">Add 3 each time.</div><div class="logic-sequence">${[s,s+3,s+6,'?'].map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>Choose the next number.</p></div>`,uniqueChoices(c,[c-1,c+2,c+3]),c);
 }
 if(a===2){
  const modes=[
   ()=>{const s=2+k%5,c=s+20;return [s,s+4,s+8,s+12,'?'].map(x=>x)}, 
   ()=>{const s=2+k%4,c=s*5;return [s,s*2,s*3,s*4,'?']},
   ()=>{const s=2+k%3,c=s*16;return [s,s*2,s*4,s*8,'?']}
  ];
  const m=l%3,v=modes[m](),c=m===0?v[0]+16:m===1?(v[0]*5):(v[0]*16);
  const rule=m===0?'Add 4 each time.':m===1?'Use consecutive multiples.':'Double each time.';
  return begin('sequence',`<div class="detective-prompt"><div class="case-label">${rule}</div><div class="logic-sequence">${v.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>What is the missing value?</p></div>`,uniqueChoices(c,[c-4,c+4,c+8]),c);
 }
 if(a===3){
  if(l%2){const s=2+k%4,c=s*32;return begin('sequence',`<div class="detective-prompt"><div class="case-label">Double each time.</div><div class="logic-sequence">${[s,s*2,s*4,s*8,s*16,'?'].map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>Find the next value.</p></div>`,uniqueChoices(c,[c-8,c+8,c+16]),c)}
  const s=3+k%5,c=s+25;return begin('sequence',`<div class="detective-prompt"><div class="case-label">Add 5 each time.</div><div class="logic-sequence">${[s,s+5,s+10,s+15,s+20,'?'].map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>Find the next value.</p></div>`,uniqueChoices(c,[c-5,c+5,c+10]),c);
 }
 const s=3+k%4,c=s*16+1;return begin('sequence',`<div class="detective-prompt"><div class="case-label">Multiply by 2, then add 1.</div><div class="logic-sequence">${[s,s*2+1,(s*2+1)*2+1,((s*2+1)*2+1)*2+1,'?'].map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>What comes next?</p></div>`,uniqueChoices(c,[c-2,c+2,c+4]),c);
}
function odd(){
 const a=age(),l=lvl(),k=l+a*7;
 let arr,correct;
 if(a===0){
  const pool=THEMES[(k)%THEMES.length];
  const i=(l*3+a)%10, j=(i+5)%pool.length, m=(i+9)%pool.length;
  const families=[
   [pool[i],pool[(i+1)%pool.length],pool[(i+2)%pool.length],'🚗'],
   [pool[i],pool[(i+3)%pool.length],pool[(i+6)%pool.length],'🍎'],
   [pool[i],pool[(i+2)%pool.length],pool[(i+5)%pool.length],'🎸'],
   [pool[i],pool[(i+4)%pool.length],pool[(i+7)%pool.length],'🌳'],
   [pool[i],pool[(i+1)%pool.length],pool[(i+4)%pool.length],'⚽']
  ];
  arr=families[l%families.length];correct=arr[3];
 }else if(a===1){
  const starts=[2,3,4,5,6,7,8,9,11,12,13,14,15,16,18,20,21,22,24,25],s0=starts[l-1];
  if(l%4===0)arr=[`${s0}`,`${s0+2}`,`${s0+4}`,`${s0+7}`],correct=arr[3];
  else if(l%4===1)arr=[`${s0}`,`${s0+3}`,`${s0+6}`,`${s0+9}`],correct=arr[3];
  else if(l%4===2)arr=[`Day ${l}`,`Day ${l+1}`,`Day ${l+2}`,`Fruit ${l}`],correct=arr[3];
  else arr=[`🔵${l}`,`🟢${l}`,`🟡${l}`,`🔺${l}`],correct=arr[3];
 }else{
  const n=5+l+a;
  if(a===2){
   const base=10+l*2;arr=[`${base}`,`${base+6}`,`${base+12}`,`${base+15}`];correct=arr[3];
   if(l%3===1)arr=[`${base}`,`${base+7}`,`${base+14}`,`${base+17}`];
   if(l%3===2)arr=[`${base}`,`${base+4}`,`${base+8}`,`${base+11}`];
  }else if(a===3){
   const base=2+l;arr=[`${base}²`,`${base+1}²`,`${base+2}²`,`${base+2}²+1`];correct=arr[3];
   if(l%2===0)arr=[`${base}×2`,`${base+1}×3`,`${base+2}×4`,`${base+3}×5+1`];
  }else{
   const base=3+l;arr=[`${base}×2`,`${base+1}×2`,`${base+2}×2`,`${base+3}×2+1`];correct=arr[3];
  }
 }
 begin('odd',`<div class="detective-prompt"><h3>Which one does not belong?</h3><div class="odd-grid">${arr.map(x=>`<span>${x}</span>`).join('')}</div><p>Choose the single item that breaks the shared rule.</p></div>`,arr.map(x=>({value:x,label:`<strong>${x}</strong>`})),correct);
}
function pattern(){
 const a=age(),l=lvl(),k=l*3+a;
 let seq,c,o,rule;
 const colors=['🔴','🔵','🟢','🟡','🟣','🟠'],shapes=['▲','■','●','◆','★','⬟'];
 if(a===0){
  const m=l%6,x=colors[k%colors.length],y=colors[(k+2)%colors.length],z=colors[(k+4)%colors.length],shape=shapes[k%shapes.length];
  if(m===0){seq=[x,y,x,y,'?'];c=x;o=[y,z,'🟣'];rule='The colours alternate.'}
  else if(m===1){seq=[shape,shape+shape,shape.repeat(3),'?'];c=shape.repeat(4);o=[shape.repeat(2),shape.repeat(3),'●●●●●'];rule='Add one shape each time.'}
  else if(m===2){seq=[x,y,y,x,y,'?'];c=x;o=[y,z,'⭐'];rule='One colour appears, then the other appears twice.'}
  else if(m===3){seq=['⭐','🌙','⭐⭐','🌙🌙','⭐'.repeat(3),'?'];c='🌙'.repeat(3);o=['⭐'.repeat(3),'🌙🌙','🌈🌈🌈'];rule='Alternate pictures and add one each pair.'}
  else if(m===4){seq=[shape,'🔵',shape+shape,'🔵🔵',shape.repeat(3),'?'];c='🔵'.repeat(3);o=[shape.repeat(3),'🔵🔵','🟢🟢🟢'];rule='Alternate the pictures and grow the group.'}
  else{seq=['🐶','🐱','🐶🐶','🐱🐱','🐶🐶🐶','?'];c='🐱🐱🐱';o=['🐶🐶🐶','🐱🐱','🐶🐱'];rule='Take turns and add one animal each time.'}
 }else{
  const m=(l+a)%6;
  if(m===0){const s=shapes[k%shapes.length],t=shapes[(k+2)%shapes.length];seq=[s,t,s,t,'?'];c=s;o=[t,'●','◆'];rule='The two shapes alternate.'}
  else if(m===1){const s=shapes[k%shapes.length];seq=[s,s+s,s.repeat(3),s.repeat(4),'?'];c=s.repeat(5);o=[s.repeat(3),s.repeat(4),'■■■■■'];rule='Add one shape.'}
  else if(m===2){const x=colors[k%colors.length],y=colors[(k+1)%colors.length];seq=[x,y,x+x,y+y,x.repeat(3),'?'];c=y.repeat(3);o=[x.repeat(2),y.repeat(2),'🟢🟢🟢'];rule='Alternate colours and increase the count.'}
  else if(m===3){const s=shapes[k%shapes.length],n=(l%3)+2;seq=[s,'→',''+s.repeat(n),'?'];c=s.repeat(n+1);o=[s.repeat(n-1),'●','◆'];rule='The group grows by one.'}
  else if(m===4){const dirs=['▲','▶','▼','◀'];const off=l%4;seq=[dirs[off],dirs[(off+1)%4],dirs[(off+2)%4],dirs[(off+3)%4],'?'];c=dirs[off];o=[dirs[(off+1)%4],dirs[(off+2)%4],dirs[(off+3)%4]];rule='Rotate one quarter-turn each time.'}
  else{const n=l+2;seq=[`${n}`,`${n+3}`,`${n+8}`,`${n+15}`,'?'];c=String(n+24);o=[String(n+21),String(n+23),String(n+25)];rule='The gaps grow by 2: +3, +5, +7, +9.'}
 }
 begin('pattern',`<div class="detective-prompt"><div class="shape-sequence">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>${rule}</p></div>`,uniqueChoices(c,o),c);
}
function analogy(){
 const a=age(),l=lvl();
 const banks=[
  [['Bird','nest','Dog','?','kennel','shoe','tree'],['Fish','water','Bird','?','sky','sand','house'],['Hand','glove','Foot','?','shoe','hat','book'],['Bee','hive','Bird','?','nest','pond','cage'],['Cow','calf','Goat','?','kid','foal','chick'],['Cat','kitten','Dog','?','puppy','cub','calf'],['Tree','leaf','Flower','?','petal','root','seed'],['Sun','day','Moon','?','night','rain','wind']],
  [['Bird','fly','Fish','?','swim','walk','read'],['Hand','glove','Foot','?','shoe','hat','book'],['Book','read','Song','?','listen','write','eat'],['Dog','bark','Cat','?','meow','run','sleep'],['Fire','hot','Ice','?','cold','wet','hard'],['Bird','feather','Fish','?','scale','fur','leaf'],['Car','road','Boat','?','water','sky','track'],['Bee','honey','Cow','?','milk','wool','eggs']],
  [['Seed','plant','Egg','?','chick','tree','nest'],['Teacher','school','Doctor','?','hospital','book','farm'],['Author','book','Composer','?','song','school','paint'],['Chef','kitchen','Pilot','?','cockpit','garage','office'],['Painter','canvas','Writer','?','page','stage','road'],['Architect','building','Composer','?','music','garden','recipe'],['Bee','honey','Silkworm','?','silk','wool','milk'],['Root','plant','Foundation','?','building','river','cloud']],
  [['Thermometer','temperature','Clock','?','time','speed','distance'],['Compass','direction','Scale','?','weight','height','colour'],['Editor','article','Director','?','film','book','music'],['Odometer','distance','Clock','?','time','pressure','weight'],['Barometer','pressure','Thermometer','?','temperature','direction','length'],['Map','location','Calendar','?','date','weight','speed'],['Ruler','length','Scale','?','weight','temperature','time'],['Dictionary','meaning','Atlas','?','maps','numbers','music']],
  [['Thermometer','temperature','Barometer','?','pressure','distance','speed'],['Compass','direction','Odometer','?','distance','time','weight'],['Editor','article','Director','?','film','number','weather'],['Sensor','signal','Camera','?','image','sound','heat'],['Algorithm','problem','Formula','?','calculation','picture','weather'],['Database','records','Library','?','books','roads','songs'],['Encryption','security','Firewall','?','network','paper','battery'],['Hypothesis','test','Theory','?','evidence','colour','shape']]
 ];
 const s=banks[a][(l-1)%banks[a].length],pair=s.slice(0,4),c=s[4],o=s.slice(5);
 begin('analogy',`<div class="analogy"><div>${pair[0]} <b>→</b> ${pair[1]}</div><div>${pair[2]} <b>→</b> ?</div></div><p>Which option has the same relationship?</p>`,uniqueChoices(c,o),c);
}
function clue(){
 const a=age(),l=lvl();
 const preschool=[
  [['It is round.','You can kick it.','It is used in a game.'],['Ball','Apple','Book','Shoe'],'Ball'],
  [['It has feathers.','It can fly.','It can lay eggs.'],['Bird','Fish','Dog','Tree'],'Bird'],
  [['It is yellow.','You can peel it.','Monkeys may eat it.'],['Banana','Carrot','Ball','Shoe'],'Banana'],
  [['It is cold.','You can eat it.','It may come in a cone.'],['Ice cream','Soup','Rice','Bread'],'Ice cream'],
  [['It has four wheels.','It carries people.','It travels on roads.'],['Car','Boat','Bird','Spoon'],'Car'],
  [['It shines in the sky.','You see it in daytime.','It gives light.'],['Sun','Moon','Cloud','Tree'],'Sun'],
  [['It lives in water.','It has fins.','It breathes with gills.'],['Fish','Bird','Dog','Cat'],'Fish'],
  [['It has pages.','You can read it.','It is often used at school.'],['Book','Ball','Spoon','Shoe'],'Book'],
  [['It tells time.','It has hands or digits.','You may wear it on your wrist.'],['Watch','Spoon','Bag','Book'],'Watch'],
  [['It is used for writing.','It has ink.','You hold it in your hand.'],['Pen','Cup','Hat','Shoe'],'Pen'],
  [['It is orange.','You can peel it.','It is a fruit.'],['Orange','Book','Shoe','Ball'],'Orange'],
  [['It is soft.','You sleep on it.','It is on a bed.'],['Pillow','Plate','Ball','Spoon'],'Pillow'],
  [['It can swim.','It has a shell.','It moves slowly.'],['Turtle','Bird','Dog','Car'],'Turtle'],
  [['It is used when it rains.','You hold it above your head.','It keeps you dry.'],['Umbrella','Hat','Shoe','Cup'],'Umbrella'],
  [['It is sweet.','It is made from cocoa.','People often eat it as a treat.'],['Chocolate','Carrot','Rice','Bread'],'Chocolate'],
  [['It is long and yellow.','Monkeys may eat it.','You peel it before eating.'],['Banana','Apple','Potato','Cake'],'Banana'],
  [['It has a trunk.','It is very large.','It is an animal.'],['Elephant','Horse','Dog','Bird'],'Elephant'],
  [['It has a shell.','It moves slowly.','It can hide inside its shell.'],['Turtle','Rabbit','Cat','Fish'],'Turtle'],
  [['It has wings.','It makes honey.','It can sting.'],['Bee','Butterfly','Fish','Dog'],'Bee'],
  [['It is a place with many books.','People read there.','You can borrow books there.'],['Library','Kitchen','Garage','Garden'],'Library']
 ];
 const general=[
  [['It is a planet.','It is known for its rings.','It is not Earth.'],['Saturn','Moon','Sun','Mars'],'Saturn'],
  [['It measures temperature.','It is not a clock.','It checks how hot or cold something is.'],['Thermometer','Compass','Ruler','Scale'],'Thermometer'],
  [['It shows direction.','It has a pointer.','Travellers use it for navigation.'],['Compass','Clock','Ruler','Thermometer'],'Compass'],
  [['It measures atmospheric pressure.','It is used in weather observation.','It is not a thermometer.'],['Barometer','Compass','Ruler','Thermometer'],'Barometer'],
  [['It has three sides.','Its angles add to 180°.','It can be scalene, isosceles or equilateral.'],['Triangle','Square','Pentagon','Circle'],'Triangle'],
  [['It is a programming structure.','It repeats instructions.','It can stop when a condition changes.'],['Loop','Variable','Comment','Function'],'Loop'],
  [['It has pages.','It contains information.','People can read it.'],['Book','Clock','Chair','Shoe'],'Book'],
  [['It measures distance.','It is often found in a vehicle.','It records how far something has travelled.'],['Odometer','Compass','Scale','Thermometer'],'Odometer'],
  [['It shows dates.','It helps organise days.','It may hang on a wall.'],['Calendar','Ruler','Map','Clock'],'Calendar'],
  [['It shows places.','It helps people navigate.','It can show roads.'],['Map','Calendar','Scale','Book'],'Map']
 ];
 const q=(a===0?preschool:general)[(l-1)%(a===0?20:10)];
 const [clues,answers,c]=q;
 begin('clue',`<div class="clue-box">${clues.map((x,i)=>`<div><b>CLUE ${i+1}</b>${x}</div>`).join('')}</div><p>Which answer satisfies every clue?</p>`,answers.map(x=>({value:x,label:`<strong>${x}</strong>`})),c);
}
function order(){
 const a=age(),l=lvl();
 const preschool=[
 ['Wake up','Brush teeth','Eat breakfast','Go to school'],
 ['Put on shoes','Open the door','Walk outside','Leave for school'],
 ['Plant a seed','Water it','It grows','Pick the fruit'],
 ['Wash hands','Get food','Eat','Clean up'],
 ['Choose a toy','Play','Put it away','Choose another toy'],
 ['Put on pyjamas','Brush teeth','Get into bed','Go to sleep'],
 ['Get a cup','Pour water','Drink water','Put cup away'],
 ['Find crayons','Draw a picture','Show the picture','Put crayons away'],
 ['Put on socks','Put on shoes','Tie laces','Go outside'],
 ['Open lunchbox','Take out food','Eat lunch','Pack lunchbox'],
 ['Find a puzzle','Put pieces together','Finish puzzle','Pack it away'],
 ['Get toothbrush','Add toothpaste','Brush teeth','Rinse'],
 ['Pick a book','Open the book','Read the story','Close the book'],
 ['Get dressed','Put on shoes','Pack bag','Leave home'],
 ['Get a plate','Add food','Eat food','Put plate away'],
 ['Find a ball','Hold the ball','Throw the ball','Catch it'],
 ['Get paper','Choose crayons','Draw','Put crayons away'],
 ['Put seeds in soil','Add water','Wait for growth','See the plant'],
 ['Find a coat','Put on the coat','Zip it up','Go outside'],
 ['Get ready for bed','Put on pyjamas','Brush teeth','Sleep']
 ];
 const older=[
 ['Choose topic','Research','Write','Review'],['Plan','Collect materials','Build','Test'],['Identify problem','Gather evidence','Test explanation','Draw conclusion'],['Set goal','Plan actions','Execute plan','Evaluate result'],
 ['Define problem','Gather evidence','Test hypothesis','Evaluate evidence'],['Set objective','Design method','Collect data','Interpret results'],['Question','Evidence','Analysis','Conclusion'],['Goal','Strategy','Action','Reflection'],
 ['Choose ingredients','Prepare ingredients','Cook','Serve'],['Observe','Record data','Compare results','Explain finding'],['Identify need','Design solution','Build prototype','Test prototype'],['Read instructions','Gather tools','Complete task','Check work'],
 ['Set destination','Plan route','Travel','Arrive'],['Choose claim','Find evidence','Organise evidence','Present conclusion'],['Notice issue','Suggest options','Choose option','Review result'],['Define task','Break into steps','Complete steps','Check outcome'],
 ['Collect data','Clean data','Analyse data','Report findings'],['Set question','Research sources','Evaluate sources','Answer question'],['Plan lesson','Teach','Observe learning','Reflect'],['Set target','Measure progress','Adjust approach','Review result']
 ];
 const steps=(a===0?preschool:older)[l-1],correct=steps.join(' → ');
 const alts=[
  [...steps].reverse().join(' → '),
  [steps[1],steps[0],steps[2],steps[3]].join(' → '),
  [steps[0],steps[2],steps[1],steps[3]].join(' → ')
 ];
 begin('order',`<div class="order-question"><p>Which order makes the most sense?</p><div class="order-sequence">${shuffle(steps).map((x,i)=>`<span>${String.fromCharCode(65+i)}. ${x}</span>`).join('')}</div></div>`,uniqueChoices(correct,alts),correct);
}
function rule(){
 const a=age(),l=lvl();
 const step=(l%5)+1,start=1+l+(a*2),c=start+step*4;
 let g=[start,start+step,start+2*step,start+3*step];
 let text=`Add ${step} each time.`;
 if(a>=2 && l%4===0){const s=2+l+a;g=[s,s*2,s*4,s*8];return begin('rule',`<div class="rule-box"><p>Find the next number.</p><div>${g.map(x=>`<span>${x}</span>`).join('')}</div><p><strong>Double each time.</strong></p></div>`,uniqueChoices(s*16,[s*12,s*14,s*18]),s*16)}
 if(a>=3 && l%5===0){const s=3+l;g=[s,s+3,s+8,s+15];return begin('rule',`<div class="rule-box"><p>Find the next number.</p><div>${g.map(x=>`<span>${x}</span>`).join('')}</div><p><strong>Add +3, +5, +7, then +9.</strong></p></div>`,uniqueChoices(s+24,[s+22,s+23,s+25]),s+24)}
 return begin('rule',`<div class="rule-box"><p>These numbers follow a rule.</p><div>${g.map(x=>`<span>${x}</span>`).join('')}</div><p><strong>${text}</strong><br>Which number comes next?</p></div>`,uniqueChoices(c,[c-1,c+1,c+step]),c);
}
function visual(){
 const a=age(),l=lvl(),m=l%8;
 const dirs=['↑','→','↓','←'],diag=['↗','↘','↙','↖'],sh=['▲','▶','▼','◀','◆','●','■','★'];
 let seq,c,o,rule;
 if(a===0){
  if(m<4){const off=(l+a)%4;seq=[dirs[off],dirs[(off+1)%4],dirs[(off+2)%4],'?'];c=dirs[(off+3)%4];o=[dirs[off],dirs[(off+1)%4],dirs[(off+2)%4]];rule='Turn one quarter-turn each time.'}
  else if(m===4){const s=sh[(l+a)%sh.length];seq=[s,s+s,s.repeat(3),'?'];c=s.repeat(4);o=[s.repeat(2),s.repeat(3),'●●●●'];rule='Add one shape each time.'}
  else if(m===5){const x=['🔴','🔵','🟢','🟡'][(l)%4],y=['🔴','🔵','🟢','🟡'][(l+1)%4];seq=[x,y,x,y,'?'];c=x;o=[y,'🟣','🟠'];rule='Alternate the colours.'}
  else if(m===6){const x=['⭐','🌙','☀️','🌈'][(l)%4],y=['⭐','🌙','☀️','🌈'][(l+1)%4];seq=[x,y,y,x,'?'];c=x;o=[y,'🍎','🐶'];rule='The first picture returns after a pair.'}
  else{const off=(l+1)%4;seq=[diag[off],diag[(off+1)%4],diag[(off+2)%4],'?'];c=diag[(off+3)%4];o=[diag[off],diag[(off+1)%4],diag[(off+2)%4]];rule='Turn diagonally each step.'}
 }else{
  if(m===0){const off=(l+a)%4;seq=[dirs[off],dirs[(off+1)%4],dirs[(off+2)%4],dirs[(off+3)%4],'?'];c=dirs[off];o=[dirs[(off+1)%4],dirs[(off+2)%4],dirs[(off+3)%4]];rule='Rotate 90° clockwise.'}
  else if(m===1){const s=sh[(l+a)%sh.length];seq=[s,s+s,s.repeat(3),s.repeat(4),'?'];c=s.repeat(5);o=[s.repeat(3),s.repeat(4),'■■■■■'];rule='Add one symbol.'}
  else if(m===2){const x=['○','●','◆','★'][(l)%4],y=['○','●','◆','★'][(l+1)%4];seq=[x,y+y,x.repeat(3),y.repeat(4),'?'];c=x.repeat(5);o=[y.repeat(5),x.repeat(4),'■■■■■'];rule='Alternate the symbols and increase the count.'}
  else if(m===3){const off=(l+a)%4;seq=[diag[off],diag[(off+1)%4],diag[(off+2)%4],diag[(off+3)%4],'?'];c=diag[off];o=[diag[(off+1)%4],diag[(off+2)%4],diag[(off+3)%4]];rule='Rotate 90° around the diagonal directions.'}
  else if(m===4){const n=l+1;seq=[`${n}`,`${n+3}`,`${n+8}`,`${n+15}`,'?'];c=String(n+24);o=[String(n+21),String(n+23),String(n+25)];rule='The gaps grow by 2.'}
  else if(m===5){const s=sh[(l*2+a)%sh.length];seq=[s,s.repeat(2),s.repeat(4),s.repeat(6),'?'];c=s.repeat(8);o=[s.repeat(5),s.repeat(7),s.repeat(9)];rule='Add two symbols each time.'}
  else if(m===6){const pal=['🔴','🔵','🟢','🟡','🟣','🟠'];const off=l%3;seq=[pal[off],pal[off+1],pal[off+2],pal[off+3],'?'];c=pal[off+4];o=[pal[off+5],pal[off],pal[(off+1)%6]];rule='Follow the colour wheel.'}
  else{const n=2+l;seq=[`${n}`,`${n*2}`,`${n*3}`,`${n*4}`,'?'];c=String(n*5);o=[String(n*4+1),String(n*6),String(n*5+2)];rule='Use consecutive multiples.'}
 }
 begin('visual',`<div class="visual-rule">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>${rule}</p>`,uniqueChoices(c,o),c);
}
function deduction(){
 const a=age(),l=lvl();
 const sets=[
  ['All red blocks are circles.','This block is red.','What shape must it be?','Circle',['Circle','Square','Triangle','Star']],
  ['Every bird has wings.','Kofi is a bird.','Kofi has…','Wings',['Wings','Wheels','Fins','Roots']],
  ['Every apple is fruit.','This is an apple.','What must it be?','Fruit',['Fruit','Metal','Vehicle','Animal']],
  ['All swimmers can move through water.','Ama is a swimmer.','Ama can…','Move through water',['Move through water','Fly','Grow wings','Drive']],
  ['Every triangle has three sides.','This shape is a triangle.','It has…','Three sides',['Three sides','Four sides','Five sides','No sides']],
  ['All project leaders approve the final plan.','Mina is the project leader.','What must Mina do?','Approve the final plan',['Approve the final plan','Write every task','Cancel the project','Change the budget']],
  ['Every square has four equal sides.','Shape A is a square.','What must be true?','Its four sides are equal',['Its four sides are equal','It has three sides','It is a circle','It has no corners']],
  ['If a device is connected, its status is online.','Device X is connected.','What must be true?','Device X is online',['Device X is online','Device X is offline','Device X is broken','Device X is new']],
  ['Every valid experiment has a testable hypothesis.','This investigation is a valid experiment.','What must it contain?','A testable hypothesis',['A testable hypothesis','A guaranteed result','A perfect result','No evidence']],
  ['Every careful reader checks the instructions.','Nana is a careful reader.','What must Nana do?','Check the instructions',['Check the instructions','Skip the instructions','Erase the task','Change the answer']]
 ];
 const q=sets[(a*2+l-1)%sets.length];
 begin('deduction',`<div class="deduction-box">${q[0]}<br>${q[1]}<h3>${q[2]}</h3></div>`,q[4].map(x=>({value:x,label:`<strong>${x}</strong>`})),q[3]);
}
function run(type){({sequence,odd,pattern,analogy,clue,order,rule,visual,deduction}[type]||sequence)()}
function start(){S.detectiveActivity=Number.isInteger(S.detectiveActivity)?S.detectiveActivity:0;window.MQDetective={run:()=>instruction(PLANS[S.level-1]?.[S.detectiveActivity]||'sequence')}}
start();
})();