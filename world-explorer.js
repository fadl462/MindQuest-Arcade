(() => {
"use strict";
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const TYPES=["place","landmark","clue","route","capital","culture","hemisphere","direction","climate","landform","compass","distance","timeZone","coordinates"];
const AGE=['3–5','6–8','9–11','12–14','15–18'];
const PLACES=[
 ["Ghana","Africa","Accra"],["Kenya","Africa","Nairobi"],["Egypt","Africa","Cairo"],["Nigeria","Africa","Abuja"],
 ["Morocco","Africa","Rabat"],["South Africa","Africa","Pretoria"],["Brazil","South America","Brasília"],["Canada","North America","Ottawa"],
 ["Japan","Asia","Tokyo"],["India","Asia","New Delhi"],["Australia","Oceania","Canberra"],["France","Europe","Paris"],
 ["Italy","Europe","Rome"],["Spain","Europe","Madrid"],["Mexico","North America","Mexico City"],["Peru","South America","Lima"],
 ["Greece","Europe","Athens"],["China","Asia","Beijing"],["New Zealand","Oceania","Wellington"],["Argentina","South America","Buenos Aires"]
];
const LANDMARKS=[
 ["Pyramids of Giza","Egypt","Africa"],["Eiffel Tower","France","Europe"],["Great Wall","China","Asia"],["Statue of Liberty","United States","North America"],
 ["Taj Mahal","India","Asia"],["Christ the Redeemer","Brazil","South America"],["Sydney Opera House","Australia","Oceania"],["Acropolis","Greece","Europe"],
 ["Table Mountain","South Africa","Africa"],["Mount Fuji","Japan","Asia"],["Machu Picchu","Peru","South America"],["Golden Gate Bridge","United States","North America"],
 ["Kakum National Park","Ghana","Africa"],["Victoria Falls","Zambia/Zimbabwe","Africa"],["Sagrada Família","Spain","Europe"],["Burj Khalifa","United Arab Emirates","Asia"]
];
const CLUES=[
 ["I am a country in West Africa. My capital is Accra. What am I?","Ghana",["Ghana","Kenya","India","Brazil"]],
 ["I am an island country in East Asia. My capital is Tokyo. What am I?","Japan",["Japan","Egypt","Peru","Canada"]],
 ["I am famous for the Pyramids of Giza. What country am I in?","Egypt",["Egypt","France","Greece","Australia"]],
 ["I am in South America and my capital is Lima. What country am I?","Peru",["Peru","Italy","Morocco","Japan"]],
 ["I am a European country whose capital is Paris. What am I?","France",["France","India","Brazil","Ghana"]],
 ["I am in North America and my capital is Ottawa. What country am I?","Canada",["Canada","Spain","Kenya","China"]],
 ["I am a landmark in India known for its white marble. What am I?","Taj Mahal",["Taj Mahal","Eiffel Tower","Great Wall","Acropolis"]],
 ["I am a landmark in Brazil with a huge statue overlooking Rio. What am I?","Christ the Redeemer",["Christ the Redeemer","Machu Picchu","Table Mountain","Sydney Opera House"]],
 ["I am in Australia and am famous for my sail-like roof. What am I?","Sydney Opera House",["Sydney Opera House","Golden Gate Bridge","Pyramids of Giza","Burj Khalifa"]],
 ["I am a famous mountain in Japan. What am I?","Mount Fuji",["Mount Fuji","Table Mountain","Mount Everest","Kilimanjaro"]],
 ["I am a famous ancient site in Peru high in the Andes. What am I?","Machu Picchu",["Machu Picchu","Acropolis","Taj Mahal","Great Wall"]],
 ["I am a national park in Ghana known for a canopy walkway. What am I?","Kakum National Park",["Kakum National Park","Serengeti","Kruger National Park","Yellowstone"]]
];
const ROUTES=[
 ["Travel from Ghana to Kenya. Which continent do you stay on?","Africa",["Africa","Europe","Asia","South America"]],
 ["Travel from France to Italy. Which continent do you stay on?","Europe",["Europe","Africa","Asia","Oceania"]],
 ["Travel from Japan to India. Which continent do you stay on?","Asia",["Asia","Europe","Africa","North America"]],
 ["Travel from Brazil to Peru. Which continent do you stay on?","South America",["South America","Africa","Europe","Asia"]],
 ["Put these in a sensible journey order: airport → hotel → sightseeing. What comes first?","Airport",["Airport","Hotel","Sightseeing","Dinner"]],
 ["A map route is: start → river → bridge → town. What comes after the river?","Bridge",["Bridge","Start","Town","Airport"]],
 ["You are planning a trip. Which should usually happen before choosing a hotel?","Choose the destination",["Choose the destination","Pack souvenirs","Take photos","Return home"]],
 ["Which direction takes you from Accra toward Kumasi?","North",["North","South","East","West"]]
];
const INFO={
 place:["Place Finder","Identify a country, continent or capital.","Read the clue and choose the place that fits."],
 landmark:["Landmark Match","Connect a famous place with its country or region.","Use what you know about the landmark and its location."],
 clue:["Explorer Clues","Solve a geography clue using all the information shown.","Every part of the clue matters. Choose the only answer that fits."],
 route:["Journey Planner","Think about locations, directions and travel order.","Choose the answer that keeps the journey logical."],
 culture:["Culture & Nature","Connect places with a simple cultural or environmental clue.","Use the clue to identify the country, region or natural feature."],
 direction:["Map Direction","Use relative location clues to identify a cardinal direction.","Think about where one place is compared with the other."],
 climate:["Climate Detective","Identify a broad climate pattern from a place and its clues.","Use the location and climate clues together; choose the broad pattern that fits."],
 landform:["Landform Explorer","Identify a broad natural landform from its description.","Use the physical clues to distinguish mountains, rivers, valleys and plains."],
 continent:["Continent Challenge","Connect countries with their correct continents.","Use the country location to identify its continent."],
 capital:["Capital Challenge","Match a country with its capital city.","Use the country clue and choose the correct capital."],
compass:["Compass Challenge","Use compass directions to navigate from one place to another.","Follow the directions carefully and choose the destination."],
distance:["Distance Order","Compare travel distances and identify the shortest route.","Use the given distances rather than guessing from the place names."],
timeZone:["Time Zone Explorer","Use broad world time-zone clues to compare locations.","For this challenge, use the simplified UTC offset shown in the question."],
hemisphere:["Hemisphere Challenge","Identify whether a location is north or south of the Equator.","Use the country’s position relative to the Equator."],
coordinates:["Coordinate Explorer","Use a simple grid coordinate to locate a place.","Read the letter and number together, then choose the matching place."]
};
function activity(){return Number.isInteger(S.worldActivity)?S.worldActivity:0}
function levelIndex(){return (S.level-1)%20}
function ageBand(){return AGE[S.age]||AGE[0]}
function head(type,sub){const i=INFO[type];return `<div class="arcade-lab-head"><div><span class="lab-kind">WORLD EXPLORER • ${ageBand()}</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$("game-message").textContent=last?"✓ Four exploration challenges complete!":`✓ Activity ${activity()+1} complete. Loading the next exploration…`;if(last){S.worldActivity=0;S.timer=setTimeout(()=>{MQ.state.active=true;MQ.levelComplete()},650)}else{S.worldActivity=activity()+1;S.timer=setTimeout(()=>{$("game-message").textContent="";MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function ageText(t){if(S.age===0)return t.replace(/continent/g,"place area").replace(/capital/g,"main city").replace(/landmark/g,"famous place");return t}
function instruction(){const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type];S.active=false;clearTimeout(S.timer);$("game-stage").innerHTML=`<div class="universal-instruction"><div class="ui-icon">🌍</div><span class="ui-skill">COGNITIVE</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>${i[2]}</p></div><div class="ui-meta"><span>🌍 Explore places</span><span>✓ Four activities per level</span></div><button id="world-start" class="primary-btn ui-start">Start Activity →</button></div>`;$("world-start").onclick=()=>runActivity(type)}
function compass(){
 const routes=[['Start at the market.','Move east, then north.','EAST','NORTH'],['Start at the school.','Move south, then east.','SOUTH','EAST'],['Start at the park.','Move west, then north.','WEST','NORTH']];
 const q=routes[(S.level+activity()+S.age)%routes.length],answer=[q[2],q[3]];let step=0;
 $('game-stage').innerHTML=`<div class="team-stage world-stage">${head('direction',q[0]+' '+q[1])}<div class="team-question">Choose the directions in order.</div><div id="compass-options" class="team-options"></div><div id="compass-picked" class="picked-sequence"></div></div>`;const box=$('compass-options'),picked=$('compass-picked');S.active=true;['NORTH','EAST','SOUTH','WEST'].forEach(d=>{const b=document.createElement('button');b.className='team-option';b.textContent=d;b.setAttribute('aria-pressed','false');b.onclick=()=>{if(!S.active)return;if(d!==answer[step]){b.classList.add('bad');fail();return}b.classList.add('good','selected');b.setAttribute('aria-pressed','true');b.dataset.picks=String((Number(b.dataset.picks)||0)+1);picked.textContent+=(step?' → ':'')+d;step++;if(step===answer.length)complete()};box.appendChild(b)})
}
function direction(){
 const BANK=[
  ['Accra is west of Kumasi. From Kumasi, which direction is Accra?','West'],
  ['Kumasi is north of Accra. From Accra, which direction is Kumasi?','North'],
  ['Cape Coast is west of Accra. From Accra, which direction is Cape Coast?','West'],
  ['Tamale is north of Kumasi. From Kumasi, which direction is Tamale?','North'],
  ['Tema is east of Accra. From Accra, which direction is Tema?','East'],
  ['Takoradi is west of Cape Coast. From Cape Coast, which direction is Takoradi?','West']
 ];
 const q=BANK[(S.level+activity()+S.age)%BANK.length];
 choice(head('direction'),q[0],['North','South','East','West'],q[1]);
}

function climate(){
 const BANK=[['Ghana','warm and tropical',['warm and tropical','polar and icy','very cold all year','desert everywhere']],['Canada','cold winters in many regions',['cold winters in many regions','tropical rainforest everywhere','hot all year everywhere','polar desert everywhere']],['Egypt','hot and dry in much of the country',['hot and dry in much of the country','cold and wet all year','tropical snow climate','cool rainforest climate']],['Brazil','many regions are warm, with tropical climates',['many regions are warm, with tropical climates','polar climate everywhere','cold tundra everywhere','snow all year']]];
 const q=BANK[(S.level+activity()+S.age)%BANK.length];choice(head('climate'),`Which broad climate clue fits <b>${q[0]}</b>?`,q[2],q[1]);
}
function landform(){
 const BANK=[
  ['A high area of land with steep sides and a summit.','Mountain',['Mountain','River','Plain','Island']],
  ['A long natural flow of water moving toward a sea or lake.','River',['River','Valley','Desert','Mountain']],
  ['A broad, mostly level area of land.','Plain',['Plain','Volcano','River','Island']],
  ['Low land between hills or mountains.','Valley',['Valley','Ocean','Plateau','Forest']]
 ];
 const q=BANK[(S.level+activity()+S.age)%BANK.length];choice(head('landform'),`Which landform matches this clue?<br><b>${q[0]}</b>`,q[2],q[1]);
}

function distance(){
 const base=10+S.level*3,vals=[base,base+7+(activity()*2),base+13];const order=[...vals].sort((a,b)=>a-b);const correct=order.join(' → ');choiceWorld('distance',`Three routes are ${vals[0]} km, ${vals[1]} km and ${vals[2]} km. Which order is shortest to longest?`,[correct,[...order].reverse().join(' → '),`${vals[1]} → ${vals[0]} → ${vals[2]}`,`${vals[2]} → ${vals[0]} → ${vals[1]}`],correct)
}
function choiceWorld(type,prompt,choices,correct){$('game-stage').innerHTML=`<div class="world-stage">${head(type)}<div class="world-question">${prompt}</div><div class="team-options" id="world-options"></div></div>`;const box=$('world-options');S.active=true;shuffle(choices).forEach(x=>{const b=document.createElement('button');b.className='team-option';b.textContent=x;b.onclick=()=>x===correct?complete():fail();box.appendChild(b)})}

function timeZone(){
 const qs=[['Accra is UTC+0 and City B is UTC+3. If it is 10:00 in Accra, what time is it in City B?','13:00',['11:00','13:00','15:00','07:00']],['Accra is UTC+0 and City C is UTC-5. If it is 14:00 in Accra, what time is it in City C?','09:00',['09:00','19:00','12:00','04:00']],['A city is UTC+2. If it is 08:00 UTC, what is the local time?','10:00',['06:00','08:00','10:00','12:00']]];
 const q=qs[(S.level+activity()+S.age)%qs.length];choice(head('timeZone'),q[0],q[2],q[1]);
}

function coordinates(){const bank=[['A3','Library'],['B2','Market'],['C4','School'],['D1','Park'],['B4','Museum'],['C2','Hospital']];const q=bank[(S.level+activity()+S.age)%bank.length];const others=shuffle(bank.filter(x=>x[0]!==q[0]).map(x=>x[1])).slice(0,3);choice(head('coordinates'),`Which place is at grid coordinate <b>${q[0]}</b>?`,[q[1],...others],q[1])}
function runActivity(type){if(type==="place")place();else if(type==="landmark")landmark();else if(type==="clue")clue();else if(type==="capital")capital();else if(type==="culture")culture();else if(type==="continent")continent();else if(type==="hemisphere")hemisphere();else if(type==="direction")direction();else if(type==="climate")climate();else if(type==="landform")landform();else if(type==="compass")compass();else if(type==="distance")distance();else if(type==="timeZone")timeZone();else if(type==="coordinates")coordinates();else route()}
function options(correct,others){const out=[String(correct)];for(const x of others.map(String)){if(!out.includes(x))out.push(x);if(out.length===4)break}return shuffle(out)}
function choice(title,prompt,choices,correct){$("game-stage").innerHTML=`<div class="team-stage world-stage">${title}<div class="team-question">${prompt}</div><div id="world-options" class="team-options"></div></div>`;const box=$("world-options");S.active=true;options(correct,choices).forEach(x=>{const b=document.createElement("button");b.className="team-option";b.textContent=ageText(x);b.onclick=()=>x===correct?complete():fail();box.appendChild(b)})}
function place(){const p=PLACES[levelIndex()];const mode=S.level<6?"country":S.level<13?"continent":"capital";if(mode==="country"){const others=shuffle(PLACES.filter(x=>x[1]===p[1]&&x[0]!==p[0]).map(x=>x[0])).slice(0,3);choice(head("place"),`Which country is in ${p[1]} and has ${p[2]} as its capital?`,[p[0],...others],p[0])}else if(mode==="continent"){const others=shuffle(PLACES.filter(x=>x[0]!==p[0]).map(x=>x[1])).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3);choice(head("place"),`Which continent is ${p[0]} in?`,[p[1],...others],p[1])}else{const others=shuffle([...new Set(PLACES.filter(x=>x[0]!==p[0]).map(x=>x[2]))]).slice(0,3);choice(head("place"),`What is the capital of ${p[0]}?`,[p[2],...others],p[2])}}
function landmark(){const l=LANDMARKS[levelIndex()%LANDMARKS.length];const mode=S.level<8?"country":S.level<15?"continent":"landmark";if(mode==="country"){const others=shuffle([...new Set(LANDMARKS.filter(x=>x[0]!==l[0]).map(x=>x[1]))]).slice(0,3);choice(head("landmark"),`The ${l[0]} is associated with which country?`,[l[1],...others],l[1])}else if(mode==="continent"){const others=shuffle(LANDMARKS.filter(x=>x[0]!==l[0]).map(x=>x[2])).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3);choice(head("landmark"),`Which continent is the ${l[0]} associated with?`,[l[2],...others],l[2])}else{const others=shuffle(LANDMARKS.filter(x=>x[0]!==l[0]).map(x=>x[0])).slice(0,3);choice(head("landmark"),`Which landmark is associated with ${l[1]}?`,[l[0],...others],l[0])}}
function clue(){const c=CLUES[levelIndex()%CLUES.length];choice(head("clue"),ageText(c[0]),c[2],c[1])}
function capital(){
 const p=PLACES[(S.level*2+activity()*3+S.age)%PLACES.length];
 const others=shuffle(PLACES.filter(x=>x[0]!==p[0]).map(x=>x[2])).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3);
 choice(head('capital'),`What is the capital of <b>${p[0]}</b>?`,[p[2],...others],p[2]);
}

function culture(){
 const BANK=[
  ['Which country is famous for Adinkra symbols?', 'Ghana', ['Ghana','Japan','Brazil','Canada']],
  ['Which country is famous for the Maasai people?', 'Kenya', ['Kenya','France','India','Peru']],
  ['Which natural feature is shared by Zambia and Zimbabwe?', 'Victoria Falls', ['Victoria Falls','Sahara Desert','Mount Fuji','Amazon River']],
  ['Which country is strongly associated with samba and Carnival?', 'Brazil', ['Brazil','Egypt','Greece','Canada']],
  ['Which country is famous for the ancient city of Petra?', 'Jordan', ['Jordan','Ghana','Australia','Spain']],
  ['Which ocean borders Ghana to the south?', 'Atlantic Ocean', ['Atlantic Ocean','Indian Ocean','Pacific Ocean','Arctic Ocean']],
  ['Which African country is famous for the Serengeti?', 'Tanzania', ['Tanzania','Portugal','China','Mexico']],
  ['Which country is famous for the Great Barrier Reef?', 'Australia', ['Australia','Italy','Morocco','Peru']]
 ];
 const q=BANK[(S.level+activity()*2+S.age)%BANK.length];
 choice(head('culture'),ageText(q[0]),q[2],q[1]);
}
function hemisphere(){const BANK=[['Ghana','Northern Hemisphere'],['Kenya','Southern Hemisphere'],['Brazil','Southern Hemisphere'],['Canada','Northern Hemisphere'],['Australia','Southern Hemisphere'],['Japan','Northern Hemisphere'],['Egypt','Northern Hemisphere'],['Argentina','Southern Hemisphere']];const q=BANK[(S.level+activity()+S.age)%BANK.length];choice(head('hemisphere'),`Which hemisphere is <b>${q[0]}</b> in?`,['Northern Hemisphere','Southern Hemisphere'],q[1]);}
function continent(){const p=PLACES[(S.level*3+activity()*2+S.age)%PLACES.length],others=shuffle([...new Set(PLACES.filter(x=>x[0]!==p[0]).map(x=>x[1]))]).filter(x=>x!==p[1]).slice(0,3);choice(head('continent'),`Which continent is <b>${p[0]}</b> in?`,[p[1],...others],p[1]);}
function route(){const r=ROUTES[(levelIndex()+activity()*2)%ROUTES.length];choice(head("route"),ageText(r[0]),r[2],r[1])}
window.MQWorldExplorer={run:instruction};
})();
