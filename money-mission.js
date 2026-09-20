(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$,shuffle=a=>[...a].sort(()=>Math.random()-.5),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const TYPES=["count","compare","change","budget","discount","unit","savings","needs","savingPlan","compareShop","basketBuild","budgetMax","exactChange","priceCeiling"];
const INFO={
 count:["Money Match","Count Ghana cedi coins and notes.","Add the values carefully, then choose the total."],
 compare:["Price Detective","Compare prices and decide which amount is greater, smaller or equal.","Read both amounts before choosing."],
 change:["Change Maker","Work out the change from a purchase.","Subtract the price from the amount paid."],
 budget:["Smart Shopper","Choose purchases that fit the budget.","Add the selected prices. Stay within the budget." ],
 unit:["Unit Price Detective","Compare the cost per item to find the better value.","Divide the total price by the number of items."],
 discount:["Sale Detective","Work out the sale price after a simple discount.","Find the discount amount, then subtract it from the original price."],
 savings:["Savings Mission","Calculate how much more you need to reach a savings goal.","Compare your current savings with the target."],
 needs:["Needs & Wants","Choose the purchase that best matches a stated need and budget.","Think about the purpose of the money before choosing a purchase."],
 savingPlan:["Savings Planner","Choose the plan that reaches a goal while leaving a realistic amount to save each time.","Compare the goal, starting amount and regular saving amount."],
 compareShop:["Smart Price Compare","Compare two products using both price and quantity.","Check the total price and how many items you receive before deciding."],
budgetMax:["Budget Builder","Choose the basket that gives the most value without exceeding the budget.","Check the total cost first, then compare what each basket gives you."],
exactChange:["Exact Change","Select the coins and notes that make the exact change.","Use the fewest pieces you can while reaching the exact amount."],
basketBuild:["Basket Builder","Build a useful basket while meeting the item requirement and budget.","Select the required number of items without exceeding the budget."],
priceCeiling:["Price Ceiling","Choose the highest price you can afford without exceeding your spending limit.","Compare each price with the limit and select the highest affordable one."]
};
const VALUES=[1,2,5,10,20,50,100];
function activity(){return Number.isInteger(S.moneyActivity)?S.moneyActivity:0}
function ageBand(){return ["3–5","6–8","9–11","12–14","15–18"][S.age]||"3–5"}
function scale(){return [0.55,.75,1,1.2,1.4][S.age]||1}
function levelIndex(){return S.level-1}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">MONEY MISSION • ${ageBand()}</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$('game-message').textContent=last?'✓ Four money challenges complete!':`✓ Activity ${activity()+1} complete. Loading the next money challenge…`;if(last){S.moneyActivity=0;S.timer=setTimeout(()=>finishLevel(),650)}else{S.moneyActivity=activity()+1;S.timer=setTimeout(()=>{$('game-message').textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function instruction(){const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type];S.active=false;clearTimeout(S.timer);$('game-stage').innerHTML=`<div class="universal-instruction"><div class="ui-icon">💰</div><span class="ui-skill">COGNITIVE</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>💵 Use Ghana cedis</span><span>✓ 4 activities per level</span></div><button id="money-start" class="primary-btn ui-start">Start Activity →</button></div>`;$('money-start').onclick=()=>runActivity(type)}

function budgetMax(){
 const budget=S.level<8?20:S.level<15?40:70;const qs=[
  {a:`2 notebooks + 2 pencils for ${money(14)}`,b:`1 notebook + 4 pencils for ${money(12)}`,c:'B'},
  {a:`3 fruit + 1 juice for ${money(18)}`,b:`2 fruit + 2 juice for ${money(16)}`,c:'A'},
  {a:`2 books for ${money(30)}`,b:`1 book + 3 notebooks for ${money(28)}`,c:'B'}
 ];const q=qs[(S.level+activity()+S.age)%qs.length];choice(head('budgetMax',`Budget: ${money(budget)}. Which basket gives more useful items for less money?`),`Choose the better-value basket.<div class="money-compare"><b>A: ${q.a}</b><span>vs</span><b>B: ${q.b}</b></div>`,['A','B'],q.c)
}
function savingPlan(){
 const start=S.level<7?10:25+(S.level%4)*5, goal=start+20+(S.level%5)*10, weekly=S.level<8?5:10+(S.level%3)*5;
 const weeks=Math.ceil((goal-start)/weekly); const correct=`${weeks} weeks`;
 choice(head('savingPlan'),`You have <b>${money(start)}</b> and want <b>${money(goal)}</b>. If you save <b>${money(weekly)}</b> each week, about how long will it take?`,[correct,`${Math.max(1,weeks-1)} weeks`,`${weeks+1} weeks`,`${weeks+2} weeks`],correct);
}

function exactChange(){
 const amounts=[6,9,12,15,18,24,30],target=amounts[(S.level+activity()+S.age)%amounts.length];const den=[10,5,2,1];let remaining=target;const correct=[];for(const d of den){while(remaining>=d){correct.push(d);remaining-=d}}
 $('game-stage').innerHTML=`<div class="team-stage money-stage">${head('exactChange',`Make exactly ${money(target)}.`)}<div id="change-pieces" class="team-options"></div><div id="change-total" style="margin:12px 0;font-weight:700">0 / ${money(target)}</div><button id="change-check" class="primary-btn">Check Change →</button></div>`;
 const box=$('change-pieces');let total=0,selected=[];S.active=true;den.forEach(d=>{const b=document.createElement('button');b.className='team-option';b.textContent=money(d);b.onclick=()=>{if(!S.active)return;if(total+d>target)return;total+=d;selected.push(d);$('change-total').textContent=`${money(total)} / ${money(target)}`};box.appendChild(b)});$('change-check').onclick=()=>{if(total===target&&selected.length===correct.length)complete();else fail()};
}

function runActivity(type){if(type==="count")count();else if(type==="compare")compare();else if(type==="change")change();else if(type==="discount")discount();else if(type==="unit")unit();else if(type==="savings")savings();else if(type==="needs")needs();else if(type==="savingPlan")savingPlan();else if(type==="compareShop")compareShop();else if(type==="basketBuild")basketBuild();else if(type==="budgetMax")budgetMax();else if(type==="exactChange")exactChange();else if(type==="priceCeiling")priceCeiling();else budget()}
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

function unit(){const bundles=[[4,20],[5,25],[6,24],[8,40],[10,50],[3,18],[12,60]],q=bundles[(S.level+activity()+S.age)%bundles.length],a=q[0],total=q[1],unitPrice=total/a,alt=unitPrice+(S.level%3)+1;choice(head('unit'),`Which option has the lower cost per item? <div class="money-compare"><b>${a} items for ${money(total)}</b><span>vs</span><b>${a} items for ${money(alt*a)}</b></div>`,['FIRST','SECOND'],unitPrice<alt?'FIRST':'SECOND');}

function needs(){
 const qs=[
  ['You have GH₵10 and need something to write with for school. Which choice fits the need and budget?','Pencil — GH₵3',['Pencil — GH₵3','Toy — GH₵12','Sticker set — GH₵11','Game — GH₵15']],
  ['You have GH₵20 and need food for lunch. Which choice fits?','Rice and beans — GH₵12',['Rice and beans — GH₵12','Video game — GH₵25','Toy car — GH₵22','Poster — GH₵21']],
  ['You need to travel a short distance and have GH₵8. Which choice fits?','Bus fare — GH₵5',['Bus fare — GH₵5','Headphones — GH₵20','Football — GH₵15','Book — GH₵10']],
  ['You have GH₵15 and need a notebook. Which is sensible?','Notebook — GH₵8',['Notebook — GH₵8','Fancy toy — GH₵15','Snack pack — GH₵16','Game card — GH₵18']]
 ];
 const q=qs[(S.level+activity()+S.age)%qs.length];
 choice(head('needs'),q[0],q[2],q[1]);
}
function basketBuild(){
 const budget=S.level<8?15:S.level<15?30:50, pool=[['Bread',5],['Fruit',3],['Book',10],['Toy',12],['Pencil',2],['Juice',4]],needCount=S.level<8?2:3;
 const shuffled=shuffle(pool).slice(0,5);let total=0,chosen=0;
 $('game-stage').innerHTML=`<div class="team-stage money-stage">${head('budget',`Build a useful basket with ${needCount} items and stay within ${money(budget)}.`)}<div id="basket-items" class="team-options"></div><div id="basket-total" style="margin:12px 0;font-weight:700">0 / ${money(budget)} • 0 items</div><button id="basket-done" class="primary-btn">Check Basket →</button></div>`;
 const box=$('basket-items');S.active=true;shuffled.forEach(([name,price])=>{const b=document.createElement('button');b.className='team-option';b.textContent=`${name} • ${money(price)}`;b.onclick=()=>{if(!S.active)return;if(b.classList.contains('good')){b.classList.remove('good');total-=price;chosen--}else{if(total+price>budget)return; b.classList.add('good');total+=price;chosen++}$('basket-total').textContent=`${money(total)} / ${money(budget)} • ${chosen} items`};box.appendChild(b)});$('basket-done').onclick=()=>chosen===needCount&&total<=budget?complete():fail();
}
function savings(){const have=5+(S.level%8)*5,goal=have+10+((S.level+activity())%5)*5,need=goal-have;choice(head('savings'),`Your savings goal is <b>${money(goal)}</b>. You already have <b>${money(have)}</b>. How much more do you need?`,[money(need),money(need+5),money(Math.max(0,need-5)),money(goal)],money(need));}

function compareShop(){
 const qs=[
  ['Pack A: 4 pencils for GH₵12','Pack B: 6 pencils for GH₵15','PACK B'],
  ['Pack A: 5 notebooks for GH₵25','Pack B: 4 notebooks for GH₵16','PACK B'],
  ['Pack A: 3 juice boxes for GH₵9','Pack B: 5 juice boxes for GH₵20','PACK A'],
  ['Pack A: 8 stickers for GH₵16','Pack B: 10 stickers for GH₵25','PACK A']
 ];
 const q=qs[(S.level+activity()+S.age)%qs.length];choice(head('compareShop'),`Which pack has the lower price per item?<div class="money-compare"><b>${q[0]}</b><span>vs</span><b>${q[1]}</b></div>`,['PACK A','PACK B'],q[2]);
}

function priceCeiling(){const limit=[12,18,25,35,50][(S.level+activity()+S.age)%5]+(S.level>12?10:0);const prices=[limit-6,limit-3,limit-1,limit+4];const correct=Math.max(...prices.filter(x=>x<=limit));choice(head('priceCeiling'),`Your spending limit is <b>${money(limit)}</b>. Which price is the highest you can afford?`,prices.map(money),money(correct))}
function finishLevel(){ S.active=false; MQ.state.active=true; MQ.levelComplete(); }

window.MQMoneyMission={run:instruction};

window.MQMoneyMission={run:instruction};
})();
