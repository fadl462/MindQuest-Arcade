(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const AGE=['3–5','6–8','9–11','12–14','15–18'];

// Four investigations per level. The mix changes as the player advances.
const plans=[
 ['sequence','odd','pattern','analogy'],['sequence','odd','order','math'],['pattern','sequence','odd','rule'],['analogy','math','order','sequence'],
 ['clue','pattern','analogy','odd'],['rule','sequence','math','clue'],['order','analogy','pattern','deduction'],['math','clue','sequence','rule'],
 ['deduction','pattern','order','analogy'],['sequence','rule','clue','math'],['visual','odd','deduction','order'],['pattern','math','analogy','clue'],
 ['rule','deduction','sequence','visual'],['analogy','order','math','pattern'],['clue','rule','deduction','sequence'],['visual','math','order','analogy'],
 ['deduction','pattern','clue','rule'],['sequence','visual','analogy','math'],['order','deduction','pattern','clue'],['rule','math','visual','deduction']
];
const info={
 sequence:['Sequence Detective','Find what comes next.','Look for the change from one item to the next, then choose the only answer that continues the rule.'],
 odd:['Odd One Out','Find the item that does not belong.','Compare the items and identify the one that breaks the shared rule.'],
 pattern:['Pattern Detective','Complete the pattern.','Look for repetition, growth, alternation or movement, then select the missing item.'],
 analogy:['Analogy Detective','Find the matching relationship.','Work out how the first pair is related. Apply the same relationship to the second pair.'],
 math:['Number Detective','Solve the number rule.','Use the information shown to calculate the next or missing value.'],
 clue:['Clue Detective','Use all the clues.','Read every clue. The correct answer must satisfy all of them, not just one.'],
 order:['Order Detective','Put the steps in the right order.','Use time, cause-and-effect or dependencies to determine what must happen first, next and last.'],
 rule:['Rule Detective','Discover the rule.','Study the examples, identify the rule they share, then choose the answer that also follows it.'],
 visual:['Shape Detective','Complete the visual rule.','Compare the number, direction, position or rotation of the symbols to find what comes next.'],
 deduction:['Logic Detective','Make the logical conclusion.','Combine every statement. Choose only the conclusion that must be true.']
};
function age(){return S.age}
function tier(){return age()}
function choose(correct,others){
 const answer=String(correct);
 const out=[answer];
 for(const item of others.map(String)){
   if(!out.includes(item))out.push(item);
 }
 const n=Number(answer);
 if(out.length<4 && Number.isFinite(n)){
   for(const delta of [1,-1,2,-2,3,-3,4,-4,5,-5]){
     const candidate=String(n+delta);
     if(!out.includes(candidate))out.push(candidate);
     if(out.length===4)break;
   }
 }
 return shuffle(out.slice(0,4));
}
function opts(correct,others){return choose(correct,others).map(v=>({value:String(v),label:`<strong>${v}</strong>`}));}
function renderInstruction(type){
 const x=info[type];
 S.active=false;clearTimeout(S.timer);
 $('game-stage').innerHTML=`<div class="detective-instruction"><div class="ui-icon">🔎</div><span class="ui-skill">COGNITIVE • ${AGE[age()]}</span><div class="activity-chip">Activity ${S.detectiveActivity+1}/4</div><h2>${x[0]}</h2><p class="ui-purpose">${x[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${x[2]}</p></div><div class="ui-meta"><span>🧩 Level ${S.level} reasoning</span><span>✓ One correct answer</span></div><button id="detective-start" class="primary-btn ui-start" type="button">Start Activity →</button></div>`;
 $('detective-start').addEventListener('click',()=>run(type),{once:true});
}
function begin(type,html,choices,correct){
 const expected=String(correct);
 $('game-stage').innerHTML=`<div class="detective-stage"><div class="detective-title"><span>${info[type][0]}</span><span class="activity-chip">Activity ${S.detectiveActivity+1}/4</span></div>${html}<div id="detective-choices" class="detective-choices"></div></div>`;
 const box=$('detective-choices');S.active=true;
 shuffle(choices).forEach(c=>{const b=document.createElement('button');b.type='button';b.className='detective-choice';b.innerHTML=c.label;
  b.addEventListener('click',()=>{if(!S.active)return;if(String(c.value)===expected){b.classList.add('good');activityComplete()}else{b.classList.add('bad');S.detectiveActivity=0;MQ.levelFailed();}},{once:true});box.appendChild(b);});
}
function activityComplete(){
 if(!S.active)return;S.active=false;S.detectiveCorrect=(S.detectiveCorrect||0)+1;
 if(S.detectiveActivity===3){
  S.detectiveActivity=0;
  $('game-message').textContent='✓ Four investigations solved!';
  // Keep the level attempt active until MQ.levelComplete() runs. The app-level
  // completion guard requires state.active=true; disabling the choices prevents
  // a second click during the short completion transition.
  $('detective-choices')?.querySelectorAll('button').forEach(b=>b.disabled=true);
  S.active=true;
  S.timer=setTimeout(()=>MQ.levelComplete(),650);
 }
 else{S.detectiveActivity++;$('game-message').textContent='✓ Investigation solved. Loading the next case…';S.timer=setTimeout(()=>{$('game-message').textContent='';MQ.nextChallenge()},650)}
}
function numberSequence(values,question,correct,others,rule){
 begin('sequence',`<div class="detective-prompt"><div class="case-label">${rule}</div><div class="logic-sequence">${values.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>${question}</p></div>`,opts(correct,others),correct);
}
function sequence(){
 const l=S.level,a=tier();
 if(a===0){
   const step=l<6?1:l<13?2:3,start=1+(l%3);const correct=start+step*3;
   return numberSequence([start,start+step,start+step*2,'?'],'Choose the next number.',correct,[correct+1,correct-1,correct+step],`Add ${step} each time.`);
 }
 if(a===1){
   if(l<8){const start=2+l%4,step=1+l%3,c=start+step*3;return numberSequence([start,start+step,start+step*2,'?'],'Choose the next number.',c,[c+1,c-1,c+step],`Add ${step} each time.`)}
   if(l<15){const start=3+l%4,step=2+l%3,c=start+step*4;return numberSequence([start,start+step,start+step*2,start+step*3,'?'],'Choose the next number.',c,[c+1,c-step,c+step*2],`Add ${step} each time.`)}
   const start=2+l%3,c=start*16;return numberSequence([start,start*2,start*4,start*8,'?'],'Choose the next number.',c,[c-2,start*12,c+start],`Double each time.`);
 }
 if(a===2){
   if(l<8){const start=3+l%4,c=start+12;return numberSequence([start,start+3,start+6,start+9,'?'],'Choose the next number.',c,[c-3,c+3,c+6],`Add 3 each time.`)}
   if(l<15){const start=2+l%4,c=start*5;return numberSequence([start,start*2,start*3,start*4,'?'],'Choose the next number.',c,[c-1,start*6,c+start],`Use consecutive multiples of ${start}.`)}
   const start=2+l%3,c=start*10;return numberSequence([start,start*2,start*4,start*7,'?'],'Choose the next number.',c,[start*8,start*9,start*12],`Multiply by 2, then 2, then 1.5.`);
 }
 if(a===3){
   if(l<8){const start=5+l%4,c=start+15;return numberSequence([start,start+3,start+6,start+9,'?'],'Choose the next number.',c,[c-3,c+3,c+6],`Add 3 each time.`)}
   if(l<15){const start=2+l%3,c=start*3;return numberSequence([start,start+2,start+4,start+6,'?'],'Choose the next number.',c,[c-1,c+1,c+2],`Add 2 each time.`)}
   const c=24;return numberSequence([2,6,12,20,'?'],'Choose the next number.',c,[22,26,30],`Add consecutive even numbers: +4, +6, +8, +10.`);
 }
 const l2=l;
 if(l2<8){const start=4+l2%3,c=start+20;return numberSequence([start,start+5,start+10,start+15,'?'],'Choose the next number.',c,[c-5,c+5,c+10],`Add 5 each time.`)}
 if(l2<15){const c=48;return numberSequence([3,6,12,24,'?'],'Choose the next number.',c,[36,42,54],`Double each time.`)}
 return numberSequence([3,8,15,24,'?'],'Choose the next number.',35,[32,34,36],`Add consecutive odd numbers: +5, +7, +9, +11.`);
}
function odd(){
 const a=tier(),l=S.level;let arr,correct;
 if(a===0){
  const sets=l<8?[['🐶','🐱','🐰','🍎'],['🍎','🍌','🍊','🚲']]:l<15?[['🐶','🐱','🐰','🐟'],['🍎','🍌','🍊','🥕']]:[['🐶','🐱','🐰','🐍'],['⭐','🌙','☀️','🍎']];
  arr=sets[(l-1)%sets.length];correct=arr[3];
 } else if(a===1){
  const sets=l<8?[['2','4','6','9'],['🔵','🟢','🟡','🔺']]:l<15?[['2','4','6','8'],['Monday','Tuesday','Wednesday','March']]:[['3','6','9','10'],['▲','■','●','January']];
  arr=sets[(l-1)%sets.length];correct=arr[3];
 } else if(a===2){
  const sets=l<8?[['12','18','24','25'],['9','16','25','30']]:l<15?[['15','20','25','31'],['2²','3²','4²','18']]:[['11','22','33','45'],['ACE','BDF','CEG','DFI']];
  arr=sets[(l-1)%sets.length];correct=arr[3];
 } else if(a===3){
  const sets=l<8?[['14','21','28','32'],['3²','4²','5²','26']]:l<15?[['2,4','3,6','4,8','5,11'],['AB','BC','CD','AC']]:[['2×3','3×4','4×5','5×7'],['10/2','12/3','18/3','20/4']];
  arr=sets[(l-1)%sets.length];correct=arr[3];
 } else {
  const sets=l<8?[['2²','3²','4²','18'],['10,20','15,30','20,40','25,55']]:l<15?[['3,6','4,8','5,10','6,13'],['ACE','BDF','CEG','DFH']]:[['2³','3³','4³','65'],['1,4,9','2,6,12','3,8,15','4,11,22']];
  arr=sets[(l-1)%sets.length];correct=arr[3];
 }
 begin('odd',`<div class="detective-prompt"><h3>Which one does not belong?</h3><div class="odd-grid">${arr.map(x=>`<span>${x}</span>`).join('')}</div><p>Choose the single item that breaks the shared rule.</p></div>`,arr.map(x=>({value:x,label:`<strong>${x}</strong>`})),correct);
}
function pattern(){
 const l=S.level,a=tier();let seq,correct,others,ruleText;
 if(a===0){
   if(l<8){seq=['🔴','🔵','🔴','🔵','?'];correct='🔴';others=['🟢','🟡','🔵'];ruleText='The colours alternate.'}
   else if(l<15){seq=['⭐','⭐⭐','⭐⭐⭐','⭐⭐⭐⭐','?'];correct='⭐⭐⭐⭐⭐';others=['⭐⭐','⭐⭐⭐⭐⭐⭐','🌟🌟🌟🌟'];ruleText='Add one star each step.'}
   else{seq=['🐶','🐱','🐶🐶','🐱🐱','?'];correct='🐶🐶🐶';others=['🐱🐱🐱','🐶🐶','🐶🐱🐶'];ruleText='The animal alternates while the group grows by one.'}
 } else if(a===1){
   if(l<8){seq=['▲','■','▲','■','?'];correct='▲';others=['■','●','◆'];ruleText='Repeat ▲, ■.'}
   else if(l<15){seq=['▲','■','●','▲','■','?'];correct='●';others=['▲','■','◆'];ruleText='Repeat ▲, ■, ●.'}
   else{seq=['●','●●','▲','▲▲','■','?'];correct='■■';others=['●●●','▲▲','■'];ruleText='Each shape appears once, then twice; the shape changes each pair.'}
 } else if(a===2){
   if(l<8){seq=['●','●●','●●●','●●●●','?'];correct='●●●●●';others=['●●','●●●','●●●●●●'];ruleText='Add one dot each step.'}
   else if(l<15){seq=['○','●●','○○○','●●●●','?'];correct='○○○○○';others=['●●●●●','○○○○','●●●●●●'];ruleText='Add one symbol and alternate hollow/filled.'}
   else{seq=['▲','▶▶','▼▼▼','◀◀◀◀','?'];correct='▲▲▲▲▲';others=['▶▶▶▶▶','▼▼▼▼▼','▲▲▲▲'];ruleText='Rotate 90° clockwise and add one symbol.'}
 } else if(a===3){
   if(l<8){seq=['▲','▶','▼','◀','?'];correct='▲';others=['▶','▼','◀'];ruleText='Rotate 90° clockwise.'}
   else if(l<15){seq=['○','●●','○○○','●●●●','?'];correct='○○○○○';others=['●●●●●','○○○○','●●●●●●'];ruleText='Add one symbol and alternate fill.'}
   else{seq=['▲','▶▶','▼▼▼','◀◀◀◀','?'];correct='▲▲▲▲▲';others=['▶▶▶▶▶','▼▼▼▼▼','▲▲▲▲'];ruleText='Rotate 90° and increase the count.'}
 } else {
   if(l<8){seq=['↑','↘','↓','↙','?'];correct='←';others=['↖','→','↑'];ruleText='Rotate 45° clockwise.'}
   else if(l<15){seq=['○','●●','○○○','●●●●','?'];correct='○○○○○';others=['●●●●●','○○○○','●●●●●●'];ruleText='Increase count and alternate fill.'}
   else{seq=['↑','→→','↓↓↓','←←←←','?'];correct='↑↑↑↑↑';others=['→→→→→','↓↓↓↓↓','↑↑↑↑'];ruleText='Rotate 90° and increase the count.'}
 }
 begin('pattern',`<div class="detective-prompt"><div class="shape-sequence">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>${ruleText}</p></div>`,opts(correct,others),correct);
}

function analogy(){
 const a=tier(),l=S.level;let pair,correct,others;
 if(a===0){const sets=[['Bird','nest','Dog','?','kennel','shoe','tree'],['Fish','water','Bird','?','sky','sand','house'],['Hand','glove','Foot','?','shoe','hat','book']];const s=sets[(l-1)%sets.length];pair=s.slice(0,4);correct=s[4];others=s.slice(5);}
 else if(a===1){const sets=[['Bird','fly','Fish','?','swim','walk','read'],['Hand','glove','Foot','?','shoe','hat','book'],['Book','read','Song','?','listen','write','eat']];const s=sets[(l-1)%sets.length];pair=s.slice(0,4);correct=s[4];others=s.slice(5);}
 else if(a===2){const sets=[['Seed','plant','Egg','?','chick','tree','nest'],['Teacher','school','Doctor','?','hospital','book','farm'],['Author','book','Composer','?','song','school','paint']];const s=sets[(l-1)%sets.length];pair=s.slice(0,4);correct=s[4];others=s.slice(5);}
 else if(a===3){const sets=[['Thermometer','temperature','Clock','?','time','speed','distance'],['Compass','direction','Scale','?','weight','height','colour'],['Editor','article','Director','?','film','book','music']];const s=sets[(l-1)%sets.length];pair=s.slice(0,4);correct=s[4];others=s.slice(5);}
 else {const sets=[['Thermometer','temperature','Barometer','?','pressure','distance','speed'],['Compass','direction','Odometer','?','distance','time','weight'],['Editor','article','Director','?','film','number','weather']];const s=sets[(l-1)%sets.length];pair=s.slice(0,4);correct=s[4];others=s.slice(5);}
 begin('analogy',`<div class="analogy"><div>${pair[0]} <b>→</b> ${pair[1]}</div><div>${pair[2]} <b>→</b> ?</div></div><p>Which option has the same relationship?</p>`,opts(correct,others),correct);
}
function math(){
 const l=S.level,a=tier();let seq,correct,others,rule;
 if(a===0){const start=2+l%3;seq=[start,start+2,start+4,'?'];correct=start+6;others=[correct+1,correct-2,correct+2];rule='Add 2 each time.'}
 else if(a===1){const start=3+l%4;seq=[start,start*2,start*2+2,'?'];correct=start*2+4;others=[correct+1,correct+2,start*3];rule='Double the first number, then add 2 each step.'}
 else if(a===2){const start=2+l%3;seq=[start,start+3,start+6,start+9,'?'];correct=start+12;others=[correct-3,correct+3,correct*2];rule='Add 3 each time.'}
 else if(a===3){const start=2+l%3;seq=[start,start*2,start*4,start*8,'?'];correct=start*16;others=[correct-2,start*12,correct+4];rule='Double each time.'}
 else{seq=[4,9,19,39,'?'];correct=79;others=[69,78,80];rule='Multiply by 2, then add 1.'}
 begin('math',`<div class="detective-prompt"><div class="case-label">RULE: ${rule}</div><div class="logic-sequence">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>Which number completes the calculation?</p></div>`,opts(correct,others),correct);
}
function clue(){
 const a=tier(),l=S.level;let clues,answers,correct;
 if(a===0){const sets=[
  [['It is round.','You can kick it.','It is used in a game.'],['Ball','Apple','Book','Shoe'],'Ball'],
  [['It has feathers.','It can fly.','It can lay eggs.'],['Bird','Fish','Dog','Tree'],'Bird'],
  [['It is yellow.','You can peel it.','Monkeys may eat it.'],['Banana','Carrot','Ball','Shoe'],'Banana']];[clues,answers,correct]=sets[(l-1)%sets.length];
 } else if(a===1){const sets=[
  [['It has pages.','You can read it.','It is often used at school.'],['Book','Ball','Spoon','Shoe'],'Book'],
  [['It lives in water.','It has fins.','It breathes with gills.'],['Fish','Bird','Dog','Cat'],'Fish'],
  [['It tells time.','It has hands or digits.','You may wear it on your wrist.'],['Watch','Spoon','Bag','Book'],'Watch']];[clues,answers,correct]=sets[(l-1)%sets.length];
 } else if(a===2){const sets=[
  [['It is larger than a dog.','It lives in water.','It has fins.'],['Whale','Eagle','Horse','Goat'],'Whale'],
  [['It is used at school.','It contains pages.','You can read it.'],['Book','Ball','Cup','Chair'],'Book'],
  [['It is a planet.','It is known for its rings.','It is not Earth.'],['Saturn','Moon','Sun','Mars'],'Saturn']];[clues,answers,correct]=sets[(l-1)%sets.length];
 } else if(a===3){const sets=[
  [['It measures temperature.','It is not a clock.','It is used to check heat.'],['Thermometer','Compass','Ruler','Scale'],'Thermometer'],
  [['It shows direction.','It has a needle or pointer.','Travellers use it for navigation.'],['Compass','Clock','Ruler','Thermometer'],'Compass'],
  [['It has four equal sides.','Its corners are right angles.','It is not a rectangle with unequal side lengths.'],['Square','Triangle','Circle','Pentagon'],'Square']];[clues,answers,correct]=sets[(l-1)%sets.length];
 } else {const sets=[
  [['It measures atmospheric pressure.','It is used in weather observation.','It is not a thermometer.'],['Barometer','Compass','Ruler','Thermometer'],'Barometer'],
  [['It is a programming structure.','It repeats instructions.','It stops when its condition is no longer met.'],['Loop','Variable','Comment','Function'],'Loop'],
  [['It has three sides.','Its interior angles sum to 180°.','It can be scalene, isosceles or equilateral.'],['Triangle','Square','Pentagon','Circle'],'Triangle']];[clues,answers,correct]=sets[(l-1)%sets.length];[clues,answers,correct]=[clues,answers,correct];
 }
 begin('clue',`<div class="clue-box">${clues.map((x,i)=>`<div><b>CLUE ${i+1}</b>${x}</div>`).join('')}</div><p>Which answer satisfies every clue?</p>`,answers.map(x=>({value:x,label:`<strong>${x}</strong>`})),correct);
}
function order(){
 const a=tier(),l=S.level;let steps,choices,correct;
 if(a===0){steps=l%2?['Wake up','Brush teeth','Eat breakfast','Go to school']:['Plant seed','Water it','It grows','Pick the fruit'];}
 else if(a===1){steps=l%2?['Wake up','Get dressed','Eat breakfast','Go to school']:['Plant seed','Water it','It grows','Pick the fruit'];}
 else if(a===2){steps=l%2?['Choose topic','Research','Write','Review']:['Plan','Collect materials','Build','Test'];}
 else if(a===3){steps=l%2?['Identify problem','Gather evidence','Test explanation','Draw conclusion']:['Set goal','Plan actions','Execute plan','Evaluate result'];}
 else{steps=l%2?['Define problem','Gather evidence','Test hypothesis','Evaluate evidence']:['Set objective','Design method','Collect data','Interpret results'];}
 correct=steps.join(' → ');
 const alt1=[...steps].reverse().join(' → '),alt2=[steps[1],steps[0],steps[2],steps[3]].join(' → '),alt3=[steps[0],steps[2],steps[1],steps[3]].join(' → ');choices=[correct,alt1,alt2,alt3];
 const shown=shuffle(steps).map((x,i)=>`${String.fromCharCode(65+i)}. ${x}`);begin('order',`<div class="order-question"><p>Put these steps into the order that makes the most sense.</p><div class="order-sequence">${shown.map(x=>`<span>${x}</span>`).join('')}</div></div>`,choices.map(x=>({value:x,label:`<span>${x}</span>`})),correct);
}
function rule(){
 const l=S.level,a=tier();let group,correct,others,ruleText;
 if(a===0){group=['2','4','6','8'];correct='10';others=['9','11','12'];ruleText='Even numbers: add 2.'}
 else if(a===1){group=['3','6','9','12'];correct='15';others=['14','16','18'];ruleText='Add 3 each time.'}
 else if(a===2){group=['5','10','15','20'];correct='25';others=['22','24','30'];ruleText='Add 5 each time.'}
 else if(a===3){group=['2','4','8','16'];correct='32';others=['24','30','34'];ruleText='Double each time.'}
 else{group=['3','7','15','31'];correct='63';others=['47','62','64'];ruleText='Multiply by 2, then add 1.'}
 begin('rule',`<div class="rule-box"><p>These numbers follow a rule.</p><div>${group.map(x=>`<span>${x}</span>`).join('')}</div><p><strong>${ruleText}</strong><br>Which number follows the same rule?</p></div>`,opts(correct,others),correct);
}
function visual(){
 const a=tier();let seq,correct,ruleText,others;
 if(a===0){seq=['⬆️','➡️','⬇️','?'];correct='⬅️';others=['⬆️','➡️','⬇️'];ruleText='Turn one quarter-turn clockwise each step.'}
 else if(a===1){seq=['●','●●','●●●','?'];correct='●●●●';others=['●●','●●●●●','■■■■'];ruleText='Add one dot each step.'}
 else if(a===2){seq=['▲','▶','▼','◀','?'];correct='▲';others=['▶','▼','◀'];ruleText='Rotate 90° clockwise each step.'}
 else if(a===3){seq=['○','●●','○○○','●●●●','?'];correct='○○○○○';others=['●●●●●','○○○○','●●●●●●'];ruleText='Add one symbol; alternate hollow and filled.'}
 else{seq=['↑','↘','↓','↙','?'];correct='←';others=['↖','→','↑'];ruleText='Rotate 45° clockwise each step.'}
 begin('visual',`<div class="visual-rule">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>${ruleText}</p>`,opts(correct,others),correct);
}
function deduction(){
 const a=tier(),l=S.level;let statements,question,correct,answers;
 if(a===0){const sets=[
  ['All red blocks are circles.','This block is red.','What shape must it be?','Circle',['Circle','Square','Triangle','Star']],
  ['Every bird has wings.','Kofi is a bird.','Kofi has…','Wings',['Wings','Wheels','Fins','Roots']]
 ];const q=sets[(l-1)%sets.length];return begin('deduction',`<div class="deduction-box">${q[0]}<br>${q[1]}<h3>${q[2]}</h3></div>`,q[4].map(x=>({value:x,label:`<strong>${x}</strong>`})),q[3]);}
 if(a===1){const sets=[['Every apple is fruit.','This is an apple.','What must it be?','Fruit',['Fruit','Metal','Vehicle','Animal']],['All swimmers can move through water.','Ama is a swimmer.','Ama can…','Move through water',['Move through water','Fly','Grow wings','Drive']]];const q=sets[(l-1)%sets.length];return begin('deduction',`<div class="deduction-box">${q[0]}<br>${q[1]}<h3>${q[2]}</h3></div>`,q[4].map(x=>({value:x,label:`<strong>${x}</strong>`})),q[3]);}
 if(a===2){const sets=[['All planners make lists.','Ama is a planner.','Ama makes…','Lists',['Lists','Cakes','Maps','Songs']],['Every triangle has three sides.','This shape is a triangle.','It has…','Three sides',['Three sides','Four sides','Five sides','No sides']]];const q=sets[(l-1)%sets.length];return begin('deduction',`<div class="deduction-box">${q[0]}<br>${q[1]}<h3>${q[2]}</h3></div>`,q[4].map(x=>({value:x,label:`<strong>${x}</strong>`})),q[3]);}
 if(a===3){const sets=[['All project leaders approve the final plan.','Mina is the project leader.','What must Mina do?','Approve the final plan',['Approve the final plan','Write every task','Cancel the project','Change the budget']],['Every square has four equal sides.','Shape A is a square.','What must be true?','Its four sides are equal',['Its four sides are equal','It has three sides','It is a circle','It has no corners']]];const q=sets[(l-1)%sets.length];return begin('deduction',`<div class="deduction-box">${q[0]}<br>${q[1]}<h3>${q[2]}</h3></div>`,q[4].map(x=>({value:x,label:`<strong>${x}</strong>`})),q[3]);}
 const sets=[['If a device is connected, its status is online.','Device X is connected.','What must be true?','Device X is online',['Device X is online','Device X is offline','Device X is broken','Device X is new']],['Every valid experiment has a testable hypothesis.','This investigation is a valid experiment.','What must it contain?','A testable hypothesis',['A testable hypothesis','A guaranteed result','A perfect result','No evidence']]];const q=sets[(l-1)%sets.length];begin('deduction',`<div class="deduction-box">${q[0]}<br>${q[1]}<h3>${q[2]}</h3></div>`,q[4].map(x=>({value:x,label:`<strong>${x}</strong>`})),q[3]);
}
function run(type){switch(type){case'sequence':sequence();break;case'odd':odd();break;case'pattern':pattern();break;case'analogy':analogy();break;case'math':math();break;case'clue':clue();break;case'order':order();break;case'rule':rule();break;case'visual':visual();break;case'deduction':deduction();break;}}
function start(){
 S.detectiveActivity=Number.isInteger(S.detectiveActivity)?S.detectiveActivity:0;S.detectiveCorrect=0;
 window.MQDetective={run:()=>{const type=plans[S.level-1]?.[S.detectiveActivity]||'sequence';renderInstruction(type)}};
}
start();
})();
