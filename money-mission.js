(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$,shuffle=a=>[...a].sort(()=>Math.random()-.5),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES=["count","compare","change","budget"];
const INFO={
 count:["Money Match","Count Ghana cedi coins and notes.","Add the values carefully, then choose the total."],
 compare:["Price Detective","Compare prices and decide which amount is greater, smaller or equal.","Read both amounts before choosing."],
 change:["Change Maker","Work out the change from a purchase.","Subtract the price from the amount paid."],
 budget:["Smart Shopper","Choose purchases that fit the budget.","Add the selected prices. Stay within the budget." ]
};
const VALUES=[1,2,5,10,20,50,100];
function activity(){return Number.isInteger(S.moneyActivity)?S.moneyActivity:0}
function ageBand(){return ["3–5","6–8","9–11","12–14","15–18"][S.age]||"3–5"}
function scale(){return [0.55,.75,1,1.2,1.4][S.age]||1}
function levelIndex(){return S.level-1}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">MONEY MISSION • ${ageBand()}</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$('game-message').textContent=last?'✓ Four money challenges complete!':`✓ Activity ${activity()+1} complete. Loading the next money challenge…`;if(last){S.moneyActivity=0;S.timer=setTimeout(()=>finishLevel(),650)}else{S.moneyActivity=activity()+1;S.timer=setTimeout(()=>{$('game-message').textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){const type=TYPES[(S.level-1+activity())%4],i=INFO[type];S.active=false;clearTimeout(S.timer);$('game-stage').innerHTML=`<div class="universal-instruction"><div class="ui-icon">💰</div><span class="ui-skill">COGNITIVE</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>💵 Use Ghana cedis</span><span>✓ 4 activities per level</span></div><button id="money-start" class="primary-btn ui-start">Start Activity →</button></div>`;$('money-start').onclick=()=>runActivity(type)}
function runActivity(type){if(type==="count")count();else if(type==="compare")compare();else if(type==="change")change();else budget()}
function money(n){return `GH₵${Number(n).toFixed(n%1?2:0)}`}
function options(correct,others){const out=[String(correct)];for(const x of others.map(String)){if(!out.includes(x))out.push(x);if(out.length===4)break}return shuffle(out)}
function choice(title,prompt,choices,correct){$('game-stage').innerHTML=`<div class="team-stage money-stage">${title}<div class="team-question">${prompt}</div><div id="money-options" class="team-options"></div></div>`;const box=$('money-options');S.active=true;options(correct,choices).forEach(x=>{const b=document.createElement('button');b.className='team-option';b.textContent=x;b.onclick=()=>x===String(correct)?complete():fail();box.appendChild(b)})}
function count(){
 const max=ageBand()==="3–5"?3:ageBand()==="6–8"?4:ageBand()==="9–11"?5:6;
 const len=clamp(2+Math.floor(levelIndex()/5)+activity(),2,max);let vals=[];for(let i=0;i<len;i++)vals.push(VALUES[(levelIndex()+activity()+i)%VALUES.length]);
 const total=vals.reduce((a,b)=>a+b,0), distract=[total+VALUES[Math.min(2,VALUES.length-1)],Math.max(1,total-VALUES[0]),total+2].filter(x=>x>0);
 choice(head('count'),`What is the total value? <div class="money-coins">${vals.map(v=>`<span>₵${v}</span>`).join('')}</div>`,[money(total),...distract.map(money)],money(total));
}
function compare(){const base=clamp(2+Math.floor(levelIndex()*.8*scale()),2,120),a=base+((levelIndex()+activity())%7)*2,b=base+((levelIndex()*2+activity()+1)%7)*2,correct=a===b?'EQUAL':a>b?'GREATER':'SMALLER';choice(head('compare'),`Which statement is correct? <div class="money-compare"><b>${money(a)}</b><span>vs</span><b>${money(b)}</b></div>`,['GREATER','SMALLER','EQUAL'],correct)}
function change(){const price=VALUES[(levelIndex()+activity())%VALUES.length]*(S.level<8?1:2),pay=[5,10,20,50,100].find(x=>x>price)||100;if(S.level>12){const p=VALUES[(levelIndex()*2+activity())%VALUES.length]*2; if(p<pay){} }const ans=pay-price;choice(head('change'),`You pay ${money(pay)} for an item costing ${money(price)}. How much change do you get?`,[money(ans),money(ans+1),money(Math.max(0,ans-1)),money(ans+2)],money(ans))}
function budget(){const maxBudget=S.level<7?10:S.level<14?25:50;const budget=Math.round(maxBudget*scale());const count=S.level<7?2:S.level<14?3:4;const prices=[];for(let i=0;i<count;i++)prices.push(VALUES[(levelIndex()+i+activity())%VALUES.length]);let total=prices.reduce((a,b)=>a+b,0);if(total>budget)prices[prices.length-1]=1;total=prices.reduce((a,b)=>a+b,0);const distract=total+VALUES[1], options=[`BUY ALL • ${money(total)}`,`BUY ALL • ${money(distract)}`];$('game-stage').innerHTML=`<div class="team-stage money-stage">${head('budget',`Choose the option that stays within a budget of ${money(budget)}.`)}<div class="money-basket">${prices.map(v=>`<span>Item ${money(v)}</span>`).join('')}</div><div class="team-options">${shuffle(options).map(x=>`<button class="team-option" data-answer="${x.includes(money(total))}">${x}</button>`).join('')}</div></div>`;S.active=true;document.querySelectorAll('.money-stage [data-answer]').forEach(b=>b.onclick=()=>b.dataset.answer==='true'?complete():fail())}
function finishLevel(){
 if(!S.active)return;
 S.active=false;
 S.streak++;
 S.bestStreak=Math.max(S.bestStreak,S.streak);
 const gain=75+S.level*20+S.streak*10;
 S.xp+=gain; S.score+=gain; S.earnedThisRun+=gain;
 S.skills.cognitive=(S.skills.cognitive||0)+1;
 if(S.level<20){
   $('game-message').textContent=`✓ Level ${S.level} complete! Level ${S.level+1} is harder. Starting automatically…`;
   S.level++;
   MQ.updateGlobal();
   S.timer=setTimeout(()=>{$('game-message').textContent="";MQ.nextChallenge()},900);
 } else {
   MQ.updateGlobal();
   $('result-text').textContent='You mastered all 20 levels of Money Mission. The money challenges became progressively harder as you advanced.';
   $('result-xp').textContent=S.earnedThisRun;
   $('result-levels').textContent=20;
   $('result-streak').textContent=S.bestStreak;
   document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));
   $('result').classList.add('active');
 }
}
window.MQMoneyMission={run:instruction};

const originalNext=MQ.nextChallenge;
MQ.nextChallenge=function(){if(S.game==='money')return window.MQMoneyMission.run();return originalNext()};
function startMoney(){
 clearTimeout(S.timer);S.game='money';S.level=1;S.lives=3;S.streak=0;S.bestStreak=0;S.score=0;S.earnedThisRun=0;S.moneyActivity=0;
 const icon=document.getElementById('game-icon'),name=document.getElementById('game-name'),skill=document.getElementById('game-skill');
 if(icon)icon.textContent='💰';if(name)name.textContent='Money Mission';if(skill)skill.textContent='COGNITIVE';
 document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById('game').classList.add('active');MQ.updateGlobal();window.MQMoneyMission.run();
}
function installMoneyTile(){
 const box=document.getElementById('game-list');if(!box||box.querySelector('[data-game="money"]'))return;
 const b=document.createElement('button');b.type='button';b.className='game-tile';b.dataset.game='money';b.innerHTML='<div class="icon">💰</div><h3>Money Mission</h3><p>Learn to count, compare, budget and make change with Ghana cedis.</p><span class="tag">COGNITIVE • 20 PROGRESSIVE LEVELS</span>';b.addEventListener('click',startMoney);box.appendChild(b);
}
const observer=new MutationObserver(installMoneyTile);observer.observe(document.getElementById('game-list'),{childList:true});setTimeout(installMoneyTile,0);
const play=document.getElementById('play-again');if(play)play.addEventListener('click',e=>{if(S.game==='money'){e.stopImmediatePropagation();startMoney()}},true);

})();
