(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const plans=[
 ['sequence','odd','pattern','analogy'],['sequence','odd','order','math'],['pattern','sequence','odd','rule'],['analogy','math','order','sequence'],
 ['clue','pattern','analogy','odd'],['rule','sequence','math','clue'],['order','analogy','pattern','deduction'],['math','clue','sequence','rule'],
 ['deduction','pattern','order','analogy'],['sequence','rule','clue','math'],['visual','odd','deduction','order'],['pattern','math','analogy','clue'],
 ['rule','deduction','sequence','visual'],['analogy','order','math','pattern'],['clue','rule','deduction','sequence'],['visual','math','order','analogy'],
 ['deduction','pattern','clue','rule'],['sequence','visual','analogy','math'],['order','deduction','pattern','clue'],['rule','math','visual','deduction']
];
const info={
 sequence:['Sequence Detective','Find what comes next in the sequence.','Look for the change between each item, then choose the item that continues the rule.'],
 odd:['Odd One Out','Find the item that does not belong.','Compare the choices carefully. Three follow a common rule; one does not.'],
 pattern:['Pattern Detective','Discover the hidden repeating or growing pattern.','Study the pattern, identify its rule, then select the missing part.'],
 analogy:['Analogy Detective','Work out the relationship between two things.','Use the first relationship as your clue for the second pair.'],
 math:['Number Detective','Use the number rule to find the answer.','Look for addition, subtraction, multiplication or a repeating number rule.'],
 clue:['Clue Detective','Use several clues to identify the correct answer.','Read every clue before choosing. Each clue narrows the possibilities.'],
 order:['Order Detective','Put events or objects into the correct order.','Think about what must happen first, next and last.'],
 rule:['Rule Detective','Discover which rule the group follows.','Test the choices against the rule and select the one that fits.'],
 visual:['Shape Detective','Find the shape that completes the visual rule.','Compare sides, symbols, position or rotation to discover the rule.'],
 deduction:['Logic Detective','Combine clues to make one logical conclusion.','Use all the information. Do not choose an answer that conflicts with a clue.']
};
function age(){return S.age}
function difficulty(){return S.level + age()*.7}
function choose(correct,others){return shuffle([String(correct),...others.map(String)]);}
function renderInstruction(type){
 const x=info[type]; const level=S.level; const ageText=['3–5','6–8','9–11','12–14','15–18'][age()];
 S.active=false;clearTimeout(S.timer);
 $('game-stage').innerHTML=`<div class="detective-instruction"><div class="ui-icon">🔎</div><span class="ui-skill">COGNITIVE • ${ageText}</span><div class="activity-chip">Activity ${S.detectiveActivity+1}/4</div><h2>${x[0]}</h2><p class="ui-purpose">${x[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${x[2]}</p></div><div class="ui-meta"><span>🧩 Level ${level} reasoning</span><span>✓ One correct answer</span></div><button id="detective-start" class="primary-btn ui-start" type="button">Start Activity →</button></div>`;
 $('detective-start').addEventListener('click',()=>run(type),{once:true});
}
function begin(type,html,choices,correct){
 $('game-stage').innerHTML=`<div class="detective-stage"><div class="detective-title"><span>${info[type][0]}</span><span class="activity-chip">Activity ${S.detectiveActivity+1}/4</span></div>${html}<div id="detective-choices" class="detective-choices"></div></div>`;
 const box=$('detective-choices');S.active=true;
 shuffle(choices).forEach((c)=>{const b=document.createElement('button');b.type='button';b.className='detective-choice';b.innerHTML=c.label;
  b.addEventListener('click',()=>{if(!S.active)return;if(c.value===correct){b.classList.add('good');activityComplete()}else{b.classList.add('bad');S.detectiveActivity=0;MQ.levelFailed();}},{once:true});box.appendChild(b);});
}
function activityComplete(){if(!S.active)return;S.active=false;S.detectiveCorrect=(S.detectiveCorrect||0)+1;
 if(S.detectiveActivity===3){S.detectiveActivity=0;$('game-message').textContent='✓ Four investigations solved!';S.timer=setTimeout(()=>{MQ.levelComplete()},650)}
 else{S.detectiveActivity++;$('game-message').textContent='✓ Investigation solved. Loading the next case…';S.timer=setTimeout(()=>{$('game-message').textContent='';MQ.nextChallenge()},650)}
}
function sequence(){
 const l=S.level,a=age();let seq,correct,others;
 if(a===0){const step= l<8?1:2;const start=1+(l%3);seq=[start,start+step,start+step*2,'?'];correct=start+step*3;others=[correct+1,correct-1,correct+step+1]}
 else if(l<7){const start=2+(l%4),step=1+(l%3);seq=[start,start+step,start+2*step,'?'];correct=start+3*step;others=[correct+1,correct-1,correct+step]}
 else if(l<14){const start=3+(l%5),step=2+(l%4);seq=[start,start+step,start+2*step,start+3*step,'?'];correct=start+4*step;others=[correct+1,correct-step,correct+step*2]}
 else{const base=2+(l%4);seq=[base,base*2,base*3,base*4,'?'];correct=base*5;others=[correct-1,base*6,correct+base]}
 begin('sequence',`<div class="detective-prompt"><div class="logic-sequence">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>What comes next?</p></div>`,chooseObjs(correct,others),String(correct));
}
function chooseObjs(correct,others){return choose(correct,others).map(v=>({value:v,label:`<strong>${v}</strong>`}))}
function odd(){
 const sets=[['🐶','🐱','🐰','🍎'],['🔵','🟢','🟡','🔺'],['2','4','6','9'],['Monday','Tuesday','March','Wednesday'],['triangle','square','circle','January']];
 const idx=Math.min(sets.length-1,Math.floor((S.level-1)/4));let arr=[...sets[idx]];
 if(S.level>=9)arr=['12','18','24','25']; if(S.level>=15)arr=['14','21','28','32'];
 const correct=arr[arr.length-1];begin('odd',`<div class="detective-prompt"><h3>Which one does not belong?</h3><div class="odd-grid">${arr.map(x=>`<span>${x}</span>`).join('')}</div></div>`,arr.map(x=>({value:x,label:`<strong>${x}</strong>`})),correct);
}
function pattern(){
 const shapes=['●','■','▲','◆','★'];const step=S.level%3+1;const arr=[];for(let i=0;i<4;i++)arr.push(shapes[(i*step)%shapes.length]);const correct=shapes[(4*step)%shapes.length];
 const others=shuffle(shapes.filter(x=>x!==correct)).slice(0,3);begin('pattern',`<div class="detective-prompt"><div class="shape-sequence">${arr.map(x=>`<span>${x}</span>`).join('')}<span class="missing-box">?</span></div><p>Which symbol completes the pattern?</p></div>`,chooseObjs(correct,others),correct);
}
function analogy(){
 const sets=S.level<8?[['Bird','Fly','Fish','Swim'],['Hand','Glove','Foot','Shoe'],['Cup','Drink','Plate','Eat']]:S.level<15?[['Seed','Plant','Egg','Chick'],['Book','Read','Song','Listen'],['Teacher','School','Doctor','Hospital']]:[['Thermometer','Temperature','Clock','Time'],['Compass','Direction','Scale','Distance'],['Editor','Article','Director','Film']];
 const [a,b,c,d]=sets[(S.level-1)%sets.length];begin('analogy',`<div class="analogy"><div>${a} <b>→</b> ${b}</div><div>${c} <b>→</b> ?</div></div>`,[d,'Grow','Read','Measure'].filter((x,i,a)=>a.indexOf(x)===i).slice(0,4).map(x=>({value:x,label:`<strong>${x}</strong>`})),d);
}
function math(){
 const l=S.level,a=age();let seq,correct,others;
 if(a===0){const start=2+l%3;seq=[start,start+2,start+4,'?'];correct=start+6;others=[correct+1,correct-2,correct+2]}
 else if(l<8){const start=3+l%4;seq=[start,start*2,start*2+2,'?'];correct=start*2+4;others=[correct+1,correct+2,start*3]}
 else if(l<15){const start=2+l%3;seq=[start,start+3,start+6,start+9,'?'];correct=start+12;others=[correct-3,correct+3,correct*2]}
 else{const start=2+l%3;seq=[start,start*2,start*4,start*8,'?'];correct=start*16;others=[correct-2,start*12,correct+4]}
 begin('math',`<div class="detective-prompt"><div class="logic-sequence">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>Find the number that follows the rule.</p></div>`,chooseObjs(correct,others),String(correct));
}
function clue(){
 const cases=S.level<8?[['The animal is small.','It can fly.','It has feathers.'],['The object is round.','You can kick it.','It is used in a game.']]:S.level<15?[['It is larger than a dog.','It lives in water.','It has fins.'],['It is used at school.','It contains pages.','You can read it.']]:[['It measures temperature.','It is not a clock.','It is used when checking heat.'],['It shows direction.','It has a needle.','It helps travellers navigate.']];
 const answers=S.level<8?['Bird','Ball','Fish','Book']:(S.level<15?['Thermometer','Book','Compass','Thermometer']:['Thermometer','Compass','Book','Thermometer']);const correct=answers[(S.level-1)%answers.length];
 begin('clue',`<div class="clue-box">${cases[(S.level-1)%cases.length].map((x,i)=>`<div><b>CLUE ${i+1}</b>${x}</div>`).join('')}</div><p>What is being described?</p>`,answers.map(x=>({value:x,label:`<strong>${x}</strong>`})),correct);
}
function order(){
 const sets=S.level<8?[['Wake up','Brush teeth','Eat breakfast','Go to school'],['Plant seed','Water it','It grows','Pick the fruit']]:S.level<15?[['Plan','Collect materials','Build','Test'],['Choose topic','Research','Write','Review']]:[['Identify problem','Gather evidence','Test explanation','Draw conclusion'],['Set goal','Plan actions','Execute plan','Evaluate result']];
 const s=sets[(S.level-1)%sets.length];const correct=s.join(' → ');begin('order',`<div class="order-question"><p>Which order makes the most sense?</p><div class="order-sequence">${s.map((x,i)=>`<span>${i+1}. ${x}</span>`).join('')}</div></div>`,[s.join(' → '),[...s].reverse().join(' → '),[s[1],s[0],s[2],s[3]].join(' → '),[s[0],s[2],s[1],s[3]].join(' → ')].map(x=>({value:x,label:`<span>${x}</span>`})),correct);
}
function rule(){
 const l=S.level;let group,correct,others;
 if(l<8){group=['2','4','6','8'];correct='10';others=['9','11','12']}
 else if(l<15){group=['3','6','9','12'];correct='15';others=['14','16','18']}
 else{group=['5','10','20','40'];correct='80';others=['45','60','70']}
 begin('rule',`<div class="rule-box"><p>These numbers follow a rule:</p><div>${group.map(x=>`<span>${x}</span>`).join('')}</div><p>Which number follows the same rule?</p></div>`,chooseObjs(correct,others),correct);
}
function visual(){
 const seq=['●','●●','●●●','?'];const correct='●●●●';const others=['●●','▲▲▲▲','■■'];begin('visual',`<div class="visual-rule">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>What comes next?</p>`,chooseObjs(correct,others),correct);
}
function deduction(){
 const sets=S.level<8?[['All red blocks are circles.','This block is red.','It must be a…','Circle',['Circle','Square','Triangle','Star']],['Every bird has wings.','Kofi is a bird.','Kofi has…','Wings',['Wings','Wheels','Fins','Roots']]]:[['All planners make lists.','Ama is a planner.','Ama makes…','Lists',['Lists','Cakes','Maps','Songs']],['Every triangle has three sides.','This shape is a triangle.','It has…','Three sides',['Three sides','Four sides','Five sides','No sides']]];
 const q=sets[(S.level-1)%sets.length];begin('deduction',`<div class="deduction-box">${q[0]}<br>${q[1]}<h3>${q[2]}</h3></div>`,q[4].map(x=>({value:x,label:`<strong>${x}</strong>`})),q[3]);
}
function run(type){switch(type){case'sequence':sequence();break;case'odd':odd();break;case'pattern':pattern();break;case'analogy':analogy();break;case'math':math();break;case'clue':clue();break;case'order':order();break;case'rule':rule();break;case'visual':visual();break;case'deduction':deduction();}}
function start(){S.detectiveActivity=0;S.detectiveCorrect=0;window.MQDetective={run:()=>{const type=plans[S.level-1][S.detectiveActivity]||'sequence';renderInstruction(type)}}}
start();
})();
