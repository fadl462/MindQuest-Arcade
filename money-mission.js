(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$,shuffle=a=>[...a].sort(()=>Math.random()-.5),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES=["count","compare","change","budget","discount"];
const INFO={
 count:["Money Match","Count Ghana cedi coins and notes.","Add the values carefully, then choose the total."],
 compare:["Price Detective","Compare prices and decide which amount is greater, smaller or equal.","Read both amounts before choosing."],
 change:["Change Maker","Work out the change from a purchase.","Subtract the price from the amount paid."],
 budget:["Smart Shopper","Choose purchases that fit the budget.","Add the selected prices. Stay within the budget." ],
 discount:["Sale Detective","Work out the sale price after a simple discount.","Find the discount amount, then subtract it from the original price."]
};
const VALUES=[1,2,5,10,20,50,100];
function activity(){return Number.isInteger(S.moneyActivity)?S.moneyActivity:0}
function ageBand(){return ["3–5","6–8","9–11","12–14","15–18"][S.age]||"3–5"}
function scale(){return [0.55,.75,1,1.2,1.4][S.age]||1}
function levelIndex(){return S.level-1}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">MONEY MISSION • ${ageBand()}</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$('game-message').textContent=last?'✓ Four money challenges complete!':`✓ Activity ${activity()+1} complete. Loading the next money challenge…`;if(last){S.moneyActivity=0;S.timer=setTimeout(()=>finishLevel(),650)}else{S.moneyActivity=activity()+1;S.timer=setTimeout(()=>{$('game-message').textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){const type=TYPES[(S.level-1+activity())%5],i=INFO[type];S.active=false;clearTimeout(S.timer);$('game-stage').innerHTML=`<div class="universal-instruction"><div class="ui-icon">💰</div><span class="ui-skill">COGNITIVE</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>💵 Use Ghana cedis</span><span>✓ 4 activities per level</span></div><button id="money-start" class="primary-btn ui-start">Start Activity →</button></div>`;$('money-start').onclick=()=>runActivity(type)}
function runActivity(type){if(type==="count")count();else if(type==="compare")compare();else if(type==="change")change();else if(type==="discount")discount();else budget()}
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
function budget(){const maxBudget=S.level<7?10:S.level<14?25:50;const budget=Math.round(maxBudget*scale());const count=S.level<7?2:S.level<14?3:4;const prices=[];for(let i=0;i<count;i++)prices.push(VALUES[(levelIndex()+i+activity())%VALUES.length]);let total=prices.reduce((a,b)=>a+b,0);
 while(total>budget){const idx=prices.reduce((best,v,i)=>v>prices[best]?i:best,0);if(prices[idx]===1)break;prices[idx]=VALUES[Math.max(0,VALUES.indexOf(prices[idx])-1)];total=prices.reduce((a,b)=>a+b,0)}
 if(total>budget){prices.fill(1);total=prices.length}
 let distract=total+2;if(distract<=budget)distract=total+1;
 const choices=[{label:`BUY ALL • ${money(total)}`,correct:true},{label:`BUY ALL • ${money(distract)}`,correct:false}];
 $('game-stage').innerHTML=`<div class="team-stage money-stage">${head('budget',`Choose the option that stays within a budget of ${money(budget)}.`)}<div class="money-basket">${prices.map(v=>`<span>Item ${money(v)}</span>`).join('')}</div><div class="team-options">${shuffle(choices).map(x=>`<button class="team-option" data-correct="${x.correct}">${x.label}</button>`).join('')}</div></div>`;S.active=true;document.querySelectorAll('.money-stage [data-correct]').forEach(b=>b.onclick=()=>b.dataset.correct==='true'?complete():fail())}
function discount(){
 const prices=[10,20,30,40,50,60,80,100],price=prices[(S.level+activity()+S.age)%prices.length];
 const rates=S.level<7?[10,20]:S.level<14?[10,20,25]:[10,20,25,50];
 const rate=rates[(S.level+activity())%rates.length];
 const sale=price-(price*rate/100);
 const choices=[sale,sale+price/10,Math.max(1,sale-price/10),price].filter((v,i,a)=>a.indexOf(v)===i);
 choice(head('discount'),`An item costs <b>${money(price)}</b> and is <b>${rate}% off</b>. What is the sale price?`,choices.map(money),money(sale));
}

function finishLevel(){ if(!S.active)return; S.active=false; MQ.levelComplete(); }

window.MQMoneyMission={run:instruction};

window.MQMoneyMission={run:instruction};
})();
