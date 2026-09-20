(() => {
'use strict';
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const AGE=['3–5','6–8','9–11','12–14','15–18'];
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
const plans=[
 ['sequence','odd','pattern','analogy'],
 ['math','clue','order','rule'],
 ['visual','compare','classification','deduction'],
 ['sequence','analogy','constraint','ranking'],
 ['odd','math','data','elimination'],
 ['pattern','clue','probability','order'],
 ['rule','visual','logicGrid','estimate'],
 ['compare','deduction','chain','classification'],
 ['sequence','ranking','constraint','data'],
 ['analogy','math','elimination','probability'],
 ['odd','visual','logicGrid','rule'],
 ['clue','order','estimate','compare'],
 ['deduction','pattern','data','constraint'],
 ['sequence','classification','ranking','chain'],
 ['math','visual','probability','elimination'],
 ['analogy','rule','logicGrid','data'],
 ['compare','deduction','constraint','estimate'],
 ['sequence','odd','classification','ranking'],
 ['clue','chain','probability','logicGrid'],
 ['rule','math','visual','elimination']
];
const info={
 sequence:['Sequence Detective','Find what comes next.','Look for the change between each item and continue the same rule.'],
 odd:['Odd One Out','Find the item that does not belong.','Compare the choices and identify the one that breaks the shared rule.'],
 pattern:['Pattern Detective','Complete the visual pattern.','Look for repetition, movement or growth, then choose what comes next.'],
 analogy:['Analogy Detective','Complete the relationship.','Use the first pair to understand how the second pair should work.'],
 math:['Number Detective','Continue the number rule.','Identify the operation or pattern and apply it once more.'],
 clue:['Clue Detective','Solve the case from the clues.','Use every clue together. Each clue should support the same answer.'],
 order:['Order Detective','Choose the logical order.','Think about what must happen first, next and last.'],
 rule:['Rule Detective','Find the number that follows the rule.','Test the rule against the examples before choosing.'],
 visual:['Shape Detective','Complete the visual sequence.','Compare the number, shape or position of symbols.'],
 compare:['Comparison Detective','Compare two values.','Decide whether the left value is greater, smaller or equal.'],
 classification:['Classification Detective','Identify the item that belongs.','Find the defining property shared by the target category.'],
 deduction:['Logic Detective','Make one logical conclusion.','Use all the statements and reject answers that conflict with them.'],
 ranking:['Ranking Detective','Arrange values from smallest to largest.','Compare each value carefully before choosing the order.'],
 constraint:['Constraint Detective','Find the only option that satisfies every rule.','Check every condition, not just one.'],
 probability:['Probability Detective','Compare simple chances.','Count the possible outcomes and choose the most likely result.'],
 data:['Data Detective','Read the data and answer.','Compare the values shown in the table before choosing.'],
 chain:['Multi-Clue Chain','Solve linked clues.','Use the first clue to narrow the field and the second to confirm.'],
 logicGrid:['Logic Grid Detective','Match the correct pair.','Use both clues together to find the only valid pairing.'],
 elimination:['Elimination Detective','Eliminate impossible options.','Cross out every choice that breaks any clue.'],
 estimate:['Estimate Detective','Choose the closest sensible estimate.','Round to a useful scale rather than trying to be exact.']
};
function age(){return Number(S.age)||0}
function level(){return Number(S.level)||1}
function begin(type,html,choices,correct){
 const expected=String(correct);
 const normalized=(choices||[]).map(c=>typeof c==='object'&&c!==null?{value:String(c.value),label:String(c.label??c.value)}:{value:String(c),label:`<strong>${String(c)}</strong>`});
 const unique=[];const seen=new Set();for(const c of normalized){if(!seen.has(c.value)){seen.add(c.value);unique.push(c)}}
 if(!unique.some(c=>c.value===expected)) unique.unshift({value:expected,label:`<strong>${expected}</strong>`});
 const task=`<div class="detective-prompt detective-task-card"><span class="detective-task-label">YOUR TASK</span>${html}</div>`;
 $('game-stage').innerHTML=`<div class="detective-stage"><div class="detective-title"><div><span class="ui-skill">COGNITIVE • ${AGE[age()]}</span><h2>${info[type][0]}</h2></div><span class="activity-chip">Activity ${(S.detectiveActivity||0)+1}/4</span></div><div class="detective-task-area">${task}</div><div class="detective-answer-label">CHOOSE YOUR ANSWER</div><div id="detective-choices" class="detective-choices" role="group" aria-label="Answer choices"></div></div>`;
 const box=$('detective-choices');S.active=true;
 shuffle(unique).forEach(c=>{const b=document.createElement('button');b.type='button';b.className='detective-choice';b.innerHTML=c.label;b.addEventListener('click',()=>{if(!S.active)return;if(c.value===expected){b.classList.add('good');complete()}else{b.classList.add('bad');S.active=false;MQ.levelFailed()}},{once:true});box.appendChild(b)});
}
function complete(){if(!S.active)return;S.active=false;S.detectiveCorrect=(S.detectiveCorrect||0)+1;if(S.detectiveActivity===3){S.detectiveActivity=0;$('game-message').textContent='✓ Case solved. Level complete!';S.timer=setTimeout(()=>{MQ.state.active=true;MQ.levelComplete()},650)}else{S.detectiveActivity++;$('game-message').textContent='✓ Correct. Next case loading…';S.timer=setTimeout(()=>{$('game-message').textContent='';MQ.nextChallenge()},650)}}
function instruction(type){const x=info[type];S.active=false;clearTimeout(S.timer);$('game-stage').innerHTML=`<div class="detective-instruction"><div class="ui-icon">🔎</div><span class="ui-skill">COGNITIVE • ${AGE[age()]}</span><span class="activity-chip">Activity ${(S.detectiveActivity||0)+1}/4</span><h2>${x[0]}</h2><p class="ui-purpose">${x[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${x[2]}</p></div><div class="ui-meta"><span>🧩 Level ${level()} reasoning</span><span>✓ One correct answer</span></div><button id="detective-start" class="primary-btn ui-start" type="button">Start Activity →</button></div>`;$('detective-start').addEventListener('click',()=>run(type),{once:true})}
function choices(correct,others){return shuffle([String(correct),...others.map(String)]).map(v=>({value:v,label:`<strong>${v}</strong>`}))}
function sequence(){const l=level(),a=age();let seq,correct,others;if(a===0){const start=1+(l%3),step=l<8?1:2;seq=[start,start+step,start+2*step,'?'];correct=start+3*step;others=[correct+1,correct-1,correct+step]}else if(l<8){const start=2+(l%4),step=1+(l%3);seq=[start,start+step,start+2*step,'?'];correct=start+3*step;others=[correct+1,correct-1,correct+step+1]}else if(l<15){const start=3+(l%5),step=2+(l%4);seq=[start,start+step,start+2*step,start+3*step,'?'];correct=start+4*step;others=[correct+1,correct-step,correct+step*2]}else{const base=2+(l%4);seq=[base,base*2,base*3,base*4,'?'];correct=base*5;others=[correct-base,base*6,correct+base]};begin('sequence',`<div class="logic-sequence">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>What comes next?</p>`,choices(correct,others),correct)}
function odd(){const l=level();let arr,correct;if(l<5){arr=['🐶','🐱','🐰','🍎'];correct='🍎'}else if(l<9){arr=['2','4','6','9'];correct='9'}else if(l<13){arr=['Monday','Tuesday','March','Wednesday'];correct='March'}else if(l<17){arr=['14','21','28','32'];correct='32'}else{arr=['12','18','24','31'];correct='31'};begin('odd',`<h3>Which one does not belong?</h3><div class="odd-grid">${arr.map(x=>`<span>${x}</span>`).join('')}</div>`,choices(correct,arr.filter(x=>x!==correct)),correct)}
function pattern(){const shapes=['●','■','▲','◆','★'];const step=level()%3+1;const arr=[0,1,2,3].map(i=>shapes[(i*step)%shapes.length]);const correct=shapes[(4*step)%shapes.length];begin('pattern',`<div class="shape-sequence">${arr.map(x=>`<span>${x}</span>`).join('')}<span class="missing-box">?</span></div><p>Which symbol completes the pattern?</p>`,choices(correct,shuffle(shapes.filter(x=>x!==correct)).slice(0,3)),correct)}
function analogy(){const bank=[['Bird','Fly','Fish','Swim'],['Hand','Glove','Foot','Shoe'],['Cup','Drink','Plate','Eat'],['Thermometer','Temperature','Clock','Time'],['Compass','Direction','Scale','Distance'],['Editor','Article','Director','Film']];const q=bank[(level()+age()-1)%bank.length];begin('analogy',`<div class="analogy"><div><b>${q[0]}</b> → ${q[1]}</div><div><b>${q[2]}</b> → ?</div></div><p>Which answer has the same relationship?</p>`,choices(q[3],['Read','Measure','Grow']),q[3])}
function math(){const l=level(),a=age();let seq,correct,others;if(a===0){const s=2+l%3;seq=[s,s+2,s+4,'?'];correct=s+6;others=[correct+1,correct-2,correct+2]}else if(l<8){const s=3+l%4;seq=[s,s*2,s*2+2,'?'];correct=s*2+4;others=[correct+1,correct+2,s*3]}else if(l<15){const s=2+l%3;seq=[s,s+3,s+6,s+9,'?'];correct=s+12;others=[correct-3,correct+3,correct*2]}else{const s=2+l%3;seq=[s,s*2,s*4,s*8,'?'];correct=s*16;others=[correct-2,s*12,correct+4]};begin('math',`<div class="logic-sequence">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}</div><p>Find the number that follows the rule.</p>`,choices(correct,others),correct)}
function clue(){const sets=[{clues:['It is small.','It can fly.','It has feathers.'],a:'Bird',o:['Bird','Ball','Fish','Book']},{clues:['It is round.','You can kick it.','It is used in a game.'],a:'Ball',o:['Bird','Ball','Fish','Book']},{clues:['It lives in water.','It has fins.','It is an animal.'],a:'Fish',o:['Fish','Book','Ball','Bird']},{clues:['It is used at school.','It contains pages.','You can read it.'],a:'Book',o:['Book','Ball','Bird','Fish']}];const q=sets[(level()+age()-1)%sets.length];begin('clue',`<div class="clue-box">${q.clues.map((x,i)=>`<div><b>CLUE ${i+1}</b>${x}</div>`).join('')}</div><p>What is being described?</p>`,choices(q.a,q.o.filter(x=>x!==q.a)),q.a)}
function order(){const sets=[['Wake up','Brush teeth','Eat breakfast','Go to school'],['Plant seed','Water it','It grows','Pick the fruit'],['Plan','Collect materials','Build','Test'],['Choose topic','Research','Write','Review'],['Identify problem','Gather evidence','Test explanation','Draw conclusion'],['Set goal','Plan actions','Execute plan','Evaluate result']];const s=sets[(level()+age()-1)%sets.length];const correct=s.join(' → ');const o=[[...s].reverse().join(' → '),[s[1],s[0],s[2],s[3]].join(' → '),[s[0],s[2],s[1],s[3]].join(' → ')];begin('order',`<p>Which order makes the most sense?</p><div class="order-question">${s.map((x,i)=>`<span>${i+1}. ${x}</span>`).join('')}</div>`,choices(correct,o),correct)}
function rule(){const l=level();let group,correct,others;if(l<8){group=['2','4','6','8'];correct='10';others=['9','11','12']}else if(l<15){group=['3','6','9','12'];correct='15';others=['14','16','18']}else{group=['5','10','20','40'];correct='80';others=['45','60','70']};begin('rule',`<div class="rule-box"><p>These numbers follow a rule:</p><div>${group.map(x=>`<span>${x}</span>`).join('')}</div><p>Which number follows the same rule?</p></div>`,choices(correct,others),correct)}
function visual(){const n=Math.min(5,2+Math.ceil(level()/7));const seq=Array.from({length:n},(_,i)=>'●'.repeat(i+1));const correct='●'.repeat(n+1);const others=['▲'.repeat(n+1),'■'.repeat(Math.max(1,n-1)),'●'.repeat(n)];begin('visual',`<div class="visual-rule">${seq.map(x=>`<span>${x}</span>`).join('<b>→</b>')}<b>→</b><span>?</span></div><p>What comes next?</p>`,choices(correct,others),correct)}
function compare(){const l=level(),a=age();let x,y;if(a===0){x=1+l%5;y=x+(l%2?1:0)}else if(l<8){x=3+l%7;y=x+((l%3)-1)}else if(l<15){x=8+(l*2)%20;y=5+(l*3)%24}else{x=12+(l*3)%50;y=10+(l*5)%55};const c=x===y?'EQUAL':x>y?'GREATER':'SMALLER';begin('compare',`<div class="logic-sequence"><span>${x}</span><b>?</b><span>${y}</span></div><p>Is the left value greater, smaller or equal?</p>`,choices(c,['GREATER','SMALLER','EQUAL'].filter(v=>v!==c)),c)}
function classification(){const sets=[['Which belongs with fruits?',['Apple','Carrot','Potato','Onion'],'Apple'],['Which is a vehicle?',['Bus','Chair','Cup','Book'],'Bus'],['Which is renewable energy?',['Sunlight','Plastic','Glass','Concrete'],'Sunlight'],['Which is a geometric shape?',['Triangle','River','Cloud','Forest'],'Triangle'],['Which measures time?',['Clock','Ruler','Compass','Scale'],'Clock']];const q=sets[(level()+age()-1)%sets.length];begin('classification',`<h3>${q[0]}</h3><p>Choose the item that fits the category.</p>`,choices(q[2],q[1].filter(x=>x!==q[2])),q[2])}
function deduction(){const sets=[['All red blocks are circles.','This block is red.','What must it be?','Circle',['Circle','Square','Triangle','Star']],['Every bird has wings.','Kofi is a bird.','Kofi has…','Wings',['Wings','Wheels','Fins','Roots']],['All planners make lists.','Ama is a planner.','Ama makes…','Lists',['Lists','Cakes','Maps','Songs']],['Every triangle has three sides.','This shape is a triangle.','It has…','Three sides',['Three sides','Four sides','Five sides','No sides']]];const q=sets[(level()+age()-1)%sets.length];begin('deduction',`<div class="deduction-box">${q[0]}<br>${q[1]}<h3>${q[2]}</h3></div>`,choices(q[3],q[4].filter(x=>x!==q[3])),q[3])}
function ranking(){const base=5+(level()%6),step=1+(level()%4);const nums=[base,base+step*2,base+step,base+step*3];const correct=[...nums].sort((a,b)=>a-b).join(' < ');const variants=[[...nums].reverse().join(' < '),[nums[0],nums[2],nums[1],nums[3]].join(' < '),[nums[1],nums[0],nums[3],nums[2]].join(' < ')];begin('ranking',`<h3>Which order is smallest to largest?</h3><div class="logic-sequence">${nums.map(x=>`<span>${x}</span>`).join('')}</div>`,choices(correct,variants),correct)}
function constraint(){const sets=[['Which number is even, greater than 20, and less than 30?','24',['15','27','31']],['Which shape has 4 equal sides and 4 corners?','Square',['Triangle','Circle','Oval']],['Which number is a multiple of 5 and greater than 40?','45',['42','43','48']],['Which choice is both a vehicle and used on water?','Boat',['Bicycle','Train','Car']],['Which number is odd, greater than 10 and less than 20?','15',['12','18','20']]];const q=sets[(level()+S.detectiveActivity+age()-1)%sets.length];begin('constraint',`<h3>${q[0]}</h3><p>Check every condition before choosing.</p>`,choices(q[1],q[2]),q[1])}
function probability(){
 const a=age(),l=level(),idx=(l+S.detectiveActivity+a-1)%4;
 const banks=[
  [
   ['A bag has 3 red blocks and 1 blue block. Which colour are you more likely to pick?','Red',['Blue','Equal','Not sure']],
   ['A box has 5 big balls and 2 small balls. Which size are you more likely to pick?','Big',['Small','Equal','Not sure']],
   ['There are 4 apples and 1 banana in a basket. Which fruit are you more likely to pick?','Apple',['Banana','Equal','Not sure']],
   ['A jar has 2 green counters and 6 yellow counters. Which colour are you more likely to pick?','Yellow',['Green','Equal','Not sure']]
  ],
  [
   ['A bag has 6 red counters and 2 blue counters. Which colour is more likely?','Red',['Blue','Equal','Impossible to tell']],
   ['A spinner has 5 green sections and 3 yellow sections. Which colour is more likely?','Green',['Yellow','Equal','Impossible to tell']],
   ['A box has 7 square tiles and 4 circle tiles. Which shape is more likely?','Square',['Circle','Equal','Impossible to tell']],
   ['A basket has 3 mangoes and 8 oranges. Which fruit is more likely?','Orange',['Mango','Equal','Impossible to tell']]
  ],
  [
   ['A bag has 8 red counters and 4 blue counters. Which colour has the greater chance of being picked?','Red',['Blue','They are equal','Cannot tell']],
   ['A spinner has 3 yellow sections and 9 green sections. Which colour has the greater chance?','Green',['Yellow','They are equal','Cannot tell']],
   ['A box has 5 triangle cards and 10 circle cards. Which shape has the greater chance?','Circle',['Triangle','They are equal','Cannot tell']],
   ['A jar has 6 black beads and 6 white beads. What is the chance comparison?','They are equal',['Black is greater','White is greater','Cannot tell']]
  ],
  [
   ['A bag contains 12 red tokens and 4 blue tokens. Which colour is more likely to be drawn?','Red',['Blue','They are equally likely','There is not enough information']],
   ['A spinner has 2 yellow sections and 8 green sections of equal size. Which outcome is more likely?','Green',['Yellow','They are equally likely','It cannot be determined']],
   ['A box contains 9 triangle cards and 3 square cards. Which shape has the greater probability?','Triangle',['Square','They are equally likely','It cannot be determined']],
   ['A jar contains 7 black beads and 7 white beads. How do their chances compare?','They are equally likely',['Black is more likely','White is more likely','It cannot be determined']]
  ],
  [
   ['A bag has 3 red and 2 blue counters. If you draw one counter, what is the probability of red?','3/5',['2/5','1/2','3/2']],
   ['A spinner has 4 equal green sections and 6 equal yellow sections. What is the probability of green?','2/5',['3/5','4/6','1/5']],
   ['A box has 5 red and 5 blue cards. You draw one card, replace it, then draw again. Which outcome has the greatest chance?','Red then red',['Red then blue','Blue then red','All are equally likely']],
   ['A bag has 2 red, 3 blue and 5 green counters. What is the probability of not drawing green?','1/2',['1/5','3/10','2/3']]
  ]
 ];
 const q=banks[Math.min(a,4)][idx];
 begin('probability',`<h3>${q[0]}</h3><p>Compare the number of possible outcomes before choosing.</p>`,choices(q[1],q[2]),q[1]);
}
function data(){const sets=[{title:'Weekly Reading',rows:[['Ama',4],['Kojo',6],['Esi',5]],q:'Who read the most pages?',a:'Kojo',o:['Ama','Esi','They were equal']},{title:'Seeds Planted',rows:[['Team A',12],['Team B',9],['Team C',15]],q:'Which team planted the most?',a:'Team C',o:['Team A','Team B','They were equal']},{title:'Water Collected',rows:[['Monday',8],['Tuesday',11],['Wednesday',7]],q:'Which day had the highest amount?',a:'Tuesday',o:['Monday','Wednesday','All equal']}];const q=sets[(level()+S.detectiveActivity+age()-1)%sets.length];begin('data',`<h3>${q.title}</h3><div class="logic-sequence">${q.rows.map(r=>`<span>${r[0]}: ${r[1]}</span>`).join('')}</div><p>${q.q}</p>`,choices(q.a,q.o),q.a)}
function chain(){const sets=[['Ama has more books than Kojo. Esi has fewer than Kojo. Who must have the most?','Ama',['Kojo','Esi','They are equal']],['A number is greater than 20 and less than 30. It is even and divisible by 4. Which fits?','24',['22','26','28']],['Blue comes before Green. Red is not first. Which order works?','Blue → Green → Red',['Red → Blue → Green','Green → Blue → Red','Blue → Red → Green']],['A trip is longer than 2 hours but shorter than 5 hours. It is not 3. How long?','4 hours',['2 hours','3 hours','5 hours']]];const q=sets[(level()+S.detectiveActivity+age()-1)%sets.length];begin('chain',`<span class="detective-task-label">LINKED CLUES</span><h3>${q[0]}</h3><p>Use every part of the clue before choosing.</p>`,choices(q[1],q[2]),q[1])}
function logicGrid(){const sets=[['Ama','book','Kofi','ball'],['Kojo','pencil','Esi','drum'],['Yaw','kite','Mia','camera'],['Nana','map','Kofi','guitar']];const q=sets[(level()+age()-1)%sets.length];const correct=`${q[0]} → ${q[1]}`;begin('logicGrid',`<div class="clue-box"><b>${q[0]}</b> chose the first item. <b>${q[2]}</b> chose the other item. Which pairing is correct?</div>`,choices(correct,[`${q[0]} → ${q[3]}`,`${q[2]} → ${q[1]}`,`${q[2]} → ${q[3]}`]),correct)}
function elimination(){
 const a=age(),l=level(),idx=(l+S.detectiveActivity+a-1)%5;
 const banks=[
  [
   ['Which item fits all three clues?','It is larger than 5, even, and less than 10.','6',['4','8','11']],
   ['Which animal fits every clue?','It can fly, has feathers, and is not a penguin.','Eagle',['Dog','Cat','Turtle']],
   ['Which number fits every clue?','It is odd, greater than 7, and less than 12.','9',['6','8','12']],
   ['Which shape fits every clue?','It has 3 sides and no curved edges.','Triangle',['Circle','Square','Oval']],
   ['Which object fits every clue?','It is used to tell time, has hands, and has a face.','Clock',['Ruler','Cup','Spoon']]
  ],
  [
   ['Which number satisfies every condition?','It is even, greater than 20, and less than 30.','24',['21','27','31']],
   ['Which animal satisfies every clue?','It can fly, has feathers, and is not a penguin.','Eagle',['Dog','Fish','Turtle']],
   ['Which number satisfies every condition?','It is odd, greater than 10, and less than 20.','15',['12','18','20']],
   ['Which shape satisfies every clue?','It has 3 sides and no curved edges.','Triangle',['Circle','Square','Oval']],
   ['Which object satisfies every clue?','It measures time and has numbers on its face.','Clock',['Ruler','Scale','Compass']]
  ],
  [
   ['Which number satisfies all the constraints?','It is even, a multiple of 3, and between 20 and 30.','24',['21','25','28']],
   ['Which animal satisfies all the clues?','It can fly, has feathers, and is not a penguin.','Eagle',['Bat','Dog','Turtle']],
   ['Which number satisfies all the constraints?','It is odd, greater than 20, and divisible by 3.','21',['22','24','27']],
   ['Which shape satisfies all the clues?','It has 4 equal sides and 4 right angles.','Square',['Triangle','Circle','Oval']],
   ['Which object satisfies all the clues?','It shows direction, has a needle, and is used for navigation.','Compass',['Clock','Ruler','Scale']]
  ],
  [
   ['Which number satisfies every condition?','It is even, divisible by 4, and greater than 30 but less than 40.','32',['33','34','38']],
   ['Which number satisfies every condition?','It is odd, divisible by 5, and between 30 and 50.','35',['32','40','45']],
   ['Which shape satisfies every condition?','It has 4 equal sides, 4 right angles, and no curved edges.','Square',['Rectangle','Triangle','Circle']],
   ['Which vehicle satisfies every condition?','It travels on water, carries people, and has no wheels.','Boat',['Car','Bus','Bicycle']],
   ['Which object satisfies every condition?','It measures temperature and contains a numbered scale.','Thermometer',['Clock','Ruler','Compass']]
  ]
 ];
 const bank=banks[Math.min(a,3)];
 const q=bank[idx%bank.length];
 begin('elimination',`<h3>${q[0]}</h3><div class="clue-box"><p>${q[1]}</p></div><p>Eliminate every option that breaks the clue.</p>`,choices(q[2],q[3]),q[2]);
}
function estimate(){const l=level(),a=age(),base=18+l*7+a*5,step=l<8?10:l<15?25:50,correct=Math.round(base/step)*step;begin('estimate',`<div class="logic-sequence"><span>${base}</span><b>≈</b><span>?</span></div><p>Which value is the closest sensible estimate?</p>`,choices(correct,[correct-step,correct+step,correct+step*2].filter(x=>x>0)),correct)}
function run(type){switch(type){case'sequence':sequence();break;case'odd':odd();break;case'pattern':pattern();break;case'analogy':analogy();break;case'math':math();break;case'clue':clue();break;case'order':order();break;case'rule':rule();break;case'visual':visual();break;case'compare':compare();break;case'classification':classification();break;case'deduction':deduction();break;case'ranking':ranking();break;case'constraint':constraint();break;case'probability':probability();break;case'data':data();break;case'chain':chain();break;case'logicGrid':logicGrid();break;case'elimination':elimination();break;case'estimate':estimate();break;default:sequence()}}
function start(){S.detectiveActivity=Number(S.detectiveActivity)||0;S.detectiveCorrect=Number(S.detectiveCorrect)||0;window.MQDetective={run:()=>{const type=plans[level()-1]?.[S.detectiveActivity]||'sequence';instruction(type)}}}
start();
})();
