(() => {
'use strict';
const MQ=window.MQ;if(!MQ)return;
const S=MQ.state,$=MQ.$;
const shuffle=a=>{const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out};
const AGE=['3–5','6–8','9–11','12–14','15–18'];
const TYPES=['choice','order','match','plan','empathy','responsibility','communication','negotiation','conflict','leadership','actionSequence','tradeoff','activeListening','perspective'];
const INFO={
 choice:['Team Decision','Choose the response that best supports the group.'],order:['Team Order','Put the steps in a sensible order.'],match:['Team Match','Match the situation with the response that fits it.'],plan:['Team Plan','Select the actions that create a strong team plan.'],empathy:['Empathy Check','Choose the response that recognises another person’s feelings or needs.'],responsibility:['Responsibility Check','Choose the action that shows ownership and reliability.'],communication:['Communication Check','Choose the clearest and most respectful message.'],negotiation:['Negotiation Check','Choose a fair way to reach agreement.'],conflict:['Conflict Resolution','Choose the calm response that helps a disagreement move forward.'],leadership:['Leadership Check','Choose the delegation or leadership response that fits the shared goal.'],actionSequence:['Action Sequence','Put the actions in the best order before acting.'],tradeoff:['Team Trade-off','Choose a solution that balances competing needs.'],activeListening:['Active Listening','Choose the response that shows you understood before reacting.'],perspective:['Perspective Check','Choose the response that best considers another person’s point of view.']
};
const CHOICES=[
 ['Two teammates want the same resource. What is fair?',['Take turns and agree on a schedule','Hide the resource','Let the loudest person take it','Ignore the problem']],
 ['A teammate has a different idea. What should you do first?',['Ask them to explain the idea','Interrupt them','Reject it immediately','Tell everyone to stop talking']],
 ['Your group is behind schedule. What helps?',['Share the remaining tasks and agree on priorities','Blame the slowest person','Leave the group','Hide the deadline']],
 ['A teammate is confused about a task. What helps most?',['Explain the step and check their understanding','Tell them to guess','Ignore them','Take over without explaining']],
 ['A shared item is damaged by accident. What is responsible?',['Tell the group and help fix or replace it','Hide the damage','Blame someone else','Leave it for another person']],
 ['Two people disagree about a rule. What is a good next step?',['Check the agreed rule and discuss it calmly','Shout until someone gives in','Invent a new rule secretly','Stop the activity without talking']],
 ['A new member joins the group. What helps them participate?',['Welcome them and explain the task','Keep them out of the discussion','Give them no role','Tell them to watch silently']],
 ['You finish your part while a teammate is still working. What is constructive?',['Ask whether they need useful help','Distract them','Delete their work','Leave without telling anyone']]
];
const ORDERS=[
 ['Identify the goal','Share roles','Do the work','Check the result'],
 ['Notice the problem','Listen to the people involved','Choose a plan','Act and review'],
 ['Welcome the new member','Explain the goal','Give them a role','Work together'],
 ['Hear each idea','Compare the ideas','Choose together','Try the plan'],
 ['Spot the issue','Ask what is needed','Offer appropriate help','Check that it helped'],
 ['Receive feedback','Ask for an example','Make an adjustment','Try again']
];
const MATCH=[
 ['A teammate is confused','Explain the instructions and check understanding'],
 ['Two people need one item','Agree on turn-taking'],
 ['Someone is left out','Invite them to join'],
 ['The deadline is close','Share and prioritise the remaining tasks'],
 ['A mistake happens','Tell the team and fix it together'],
 ['Someone is speaking','Listen without interrupting'],
 ['A rule is unclear','Check the agreed rule'],
 ['A new member arrives','Welcome them and explain the activity']
];
const PLANS=[
 ['Agree on the goal','Share clear roles','Set a check-in point','Review the result'],
 ['Listen to ideas','Compare options','Choose together','Tell everyone the decision'],
 ['Identify the problem','List possible solutions','Choose one','Test it'],
 ['Set a deadline','Divide the work','Share progress','Check completion']
];
const EMPATHY=[
 ['A teammate makes a mistake and looks embarrassed.',['Encourage them and help fix it','Tell everyone about the mistake','Laugh at them','Pretend they are not there']],
 ['Someone is quiet during a discussion.',['Invite them to share if they want','Speak for them without asking','Ignore them completely','Tell them their idea is probably wrong']],
 ['A teammate says a task is confusing.',['Ask which part needs explaining','Tell them to figure it out alone','Move on without checking','Make fun of the question']],
 ['A new player is nervous about joining.',['Welcome them and explain the first step','Tell them to watch only','Give them the hardest task immediately','Tell them they are slowing the group down']]
];
const RESPONSIBILITY=[
 ['You forgot materials you promised to bring. What is responsible?',['Tell the team honestly and help find another solution','Pretend you brought them','Blame another person','Say nothing']],
 ['You cannot finish your part on time.',['Tell the team early and agree on the next step','Wait until the deadline passes','Hide the unfinished work','Delete the task']],
 ['You notice an error in shared work.',['Point it out and help correct it','Hide it','Change someone else’s work without telling them','Leave it']],
 ['The group rule applies to everyone.',['Follow it even when it is inconvenient','Break it secretly','Ask others to break it','Follow it only when watched']]
];
const COMMUNICATION=[
 ['A teammate is late. Which message is clearest?',['Are you able to arrive by 3 PM?','You are always late.','Whatever, just come.','Nobody can work with you.']],
 ['A task is unclear. What should you say?',['Could you explain which part I should complete first?','You did not explain anything.','I will guess.','Forget it.']],
 ['You need help. Which message is specific?',['I finished step one. Could you help me with step two?','I need everything done.','Someone help!','You should know what I mean.']],
 ['Plans changed. What is constructive?',['The plan changed; here is the new time and what we need to do.','Everything is ruined.','Do whatever you want.','I will not tell anyone.']]
];
const NEGOTIATION=[
 ['Two teammates want different roles.',['Discuss strengths and agree on roles together','Let the louder person choose','Refuse to discuss it','Give both people the same role']],
 ['Two people need the same equipment.',['Agree on a turn-taking plan','Hide the equipment','Let one person keep it all day','Cancel the task']],
 ['Two good ideas compete for limited time.',['Compare both against the shared goal and agree on one','Pick the first idea without discussion','Choose the louder person’s idea','Use both even if neither can be completed']],
 ['A teammate cannot meet the original deadline.',['Discuss a realistic new deadline and adjust the plan','Pretend the deadline was met','Blame them','Remove them from the task without discussion']]
];
const CONFLICT=[
 ['Two teammates disagree and voices are rising.',['Pause, listen to both views and agree on the issue to solve','Shout louder','Choose a side without listening','Walk away and never address it']],
 ['A disagreement starts during a game.',['Check the rule and discuss the next fair step','Change the rule secretly','Blame one player','Stop listening']],
 ['Someone says your idea will not work.',['Ask what concern they have and discuss evidence','Insult them','Tell them they cannot speak','End the meeting immediately']],
 ['Two people think the other caused the problem.',['Focus on what happened and what can fix it','Choose a person to blame','Hide the problem','Argue about who is worse']]
];
const LEADERSHIP=[
 ['The team needs someone to explain the instructions. Who should lead that task?',['Someone who understands the instructions and can explain clearly','The newest member regardless of experience','Whoever shouts first','Nobody']],
 ['A task needs careful checking. What is good delegation?',['Give it to someone with strong attention to detail and agree on a check-in','Give it to the first person available without explaining','Keep every task for yourself','Assign it randomly']],
 ['One teammate is confident speaking; another is good at organising materials.',['Match each role to the relevant strength','Give both the same role','Give all tasks to the confident speaker','Ignore their strengths']],
 ['The team is tired near the end. What should a leader do?',['Reconfirm priorities, share remaining work and check progress','Add unrelated work','Blame the tired people','Leave without updating anyone']]
];
const TRADEOFF=[
 ['There is one quiet study space and two groups need it. What is fairest?',['Agree on time slots so both groups can use it','Let one group take it all day','Hide the space','Cancel both groups']],
 ['The team has time for one improvement before sharing work.',['Choose the change that best improves the shared goal and explain why','Choose the easiest change without checking the goal','Let one person decide secretly','Do both even if neither can be finished']],
 ['Two teammates need the same computer.',['Set a turn-taking schedule and keep the deadline visible','Give it to the first person who asks','Hide the computer','Ask both to stop working']],
 ['The group must choose between speed and checking accuracy.',['Agree on the minimum check needed before sharing','Skip all checking','Check forever and miss the deadline','Let one person decide without discussion']]
];
const ACTIVE=[
 ['A teammate says, “I do not understand step two.” What shows active listening?',['So step two is the part you want explained — is that right?','You should have listened.','I will do it for you.','Just keep going.']],
 ['A teammate says, “I think our route is too long.”',['Ask what part seems too long and restate their concern before deciding','Tell them they are wrong','Ignore the comment','Change the route without asking']],
 ['Someone gives feedback on your work.',['Restate the key point to check you understood it','Argue immediately','Walk away','Tell them their feedback is useless']],
 ['A teammate says they need more time.',['Confirm what they need time for and discuss the next step','Tell them to hurry','Assume they are avoiding work','Ignore them']]
];
const PERSPECTIVE=[
 ['A teammate is quiet after their idea was not chosen. What should you consider?',['They may feel disappointed; invite them to share if they want','They must be angry','They do not care','They should leave']],
 ['A new player makes a mistake because they do not know the rules.',['They may need clear instructions before another attempt','They are careless','They should be excluded','They should be given the hardest task']],
 ['A teammate asks for a different role.',['They may have a reason; ask and discuss the role needs','They are being difficult','Ignore the request','Tell everyone they are unfair']],
 ['Someone disagrees with your plan.',['Their concern may reveal information you missed; ask about it','They are against you','End the discussion','Tell them to agree']]
];
function activity(){return Number.isInteger(S.teamActivity)?S.teamActivity:0}
function levelIndex(){return (S.level-1)%20}
function ageBand(){return AGE[S.age]||AGE[0]}
function head(type,sub){const i=INFO[type]||INFO.choice;return `<div class="arcade-lab-head"><div><span class="lab-kind">TEAM QUEST • ${ageBand()}</span><h3>${i[0]}</h3><p>${sub||i[1]}</p></div><span class="activity-chip">Activity ${activity()+1}/4</span></div>`}
function complete(){if(!S.active)return;S.active=false;clearTimeout(S.timer);const last=activity()===3;$('game-message').textContent=last?'✓ Four team challenges complete!':`✓ Activity ${activity()+1} complete. Loading the next team challenge…`;if(last){S.teamActivity=0;S.timer=setTimeout(()=>MQ.levelComplete(),650)}else{S.teamActivity=activity()+1;S.timer=setTimeout(()=>{$('game-message').textContent='';MQ.nextChallenge()},650)}}
function fail(){if(!S.active)return;S.active=false;clearTimeout(S.timer);MQ.levelFailed()}
function choice(type,prompt,choices,correct){$('game-stage').innerHTML=`<div class="team-stage">${head(type)}<div class="team-question">${prompt}</div><div id="team-options" class="team-options"></div></div>`;const box=$('team-options');S.active=true;shuffle(choices).forEach(x=>{const b=document.createElement('button');b.type='button';b.className='team-option';b.textContent=x;b.onclick=()=>x===correct?complete():fail();box.appendChild(b)})}
function order(type,steps){const seq=[...steps];$('game-stage').innerHTML=`<div class="team-stage">${head(type)}<p class="team-question">Put the steps in the right order.</p><div id="team-order" class="team-order"></div></div>`;const box=$('team-order');let next=0;S.active=true;shuffle(seq.map((x,i)=>({x,i}))).forEach(o=>{const b=document.createElement('button');b.type='button';b.className='team-option';b.textContent=o.x;b.onclick=()=>{if(!S.active||b.disabled)return;if(o.i===next){b.disabled=true;b.classList.add('good');next++;if(next===seq.length)complete()}else{b.classList.add('bad');fail()}};box.appendChild(b)})}
function multiPlan(){const base=PLANS[(levelIndex()+activity())%PLANS.length],need=S.level<6?2:S.level<13?3:4,correct=base.slice(0,Math.min(need,base.length)),bad=['Hide information','Blame a teammate','Ignore the plan','Interrupt everyone','Change roles secretly'];const options=shuffle([...correct,...bad.slice(0,Math.max(1,5-correct.length))]);$('game-stage').innerHTML=`<div class="team-stage">${head('plan',`Choose ${need} actions that belong in a strong team plan.`)}<div id="team-plan" class="team-plan"></div><button id="team-submit" class="primary-btn ui-start">Check Plan ✓</button></div>`;const box=$('team-plan'),selected=new Set();S.active=true;options.forEach(x=>{const b=document.createElement('button');b.type='button';b.className='team-option';b.textContent=x;b.onclick=()=>{if(!S.active)return;if(selected.has(x)){selected.delete(x);b.classList.remove('selected')}else{selected.add(x);b.classList.add('selected')}};box.appendChild(b)});$('team-submit').onclick=()=>{if(selected.size!==need)return;if([...selected].every(x=>correct.includes(x)))complete();else fail()}}
function run(){const type=TYPES[(S.level-1+activity())%TYPES.length];if(type==='choice'){const q=CHOICES[(levelIndex()+activity())%CHOICES.length];choice(type,q[0],q[1],q[1][0])}else if(type==='order'){order(type,ORDERS[(levelIndex()+activity())%ORDERS.length])}else if(type==='match'){const q=MATCH[(levelIndex()+activity()*2)%MATCH.length];choice(type,`Situation: <b>${q[0]}</b><br>Which response matches?`,[q[1],'Ignore the situation','Do it alone','Make the problem worse'],q[1])}else if(type==='plan')multiPlan();else if(type==='empathy'){const q=EMPATHY[(levelIndex()+activity())%EMPATHY.length];choice(type,q[0],q[1],q[1][0])}else if(type==='responsibility'){const q=RESPONSIBILITY[(levelIndex()+activity())%RESPONSIBILITY.length];choice(type,q[0],q[1],q[1][0])}else if(type==='communication'){const q=COMMUNICATION[(levelIndex()+activity())%COMMUNICATION.length];choice(type,q[0],q[1],q[1][0])}else if(type==='negotiation'){const q=NEGOTIATION[(levelIndex()+activity())%NEGOTIATION.length];choice(type,q[0],q[1],q[1][0])}else if(type==='conflict'){const q=CONFLICT[(levelIndex()+activity())%CONFLICT.length];choice(type,q[0],q[1],q[1][0])}else if(type==='leadership'){const q=LEADERSHIP[(levelIndex()+activity())%LEADERSHIP.length];choice(type,q[0],q[1],q[1][0])}else if(type==='actionSequence'){order(type,ORDERS[(levelIndex()+activity()+2)%ORDERS.length])}else if(type==='tradeoff'){const q=TRADEOFF[(levelIndex()+activity())%TRADEOFF.length];choice(type,q[0],q[1],q[1][0])}else if(type==='activeListening'){const q=ACTIVE[(levelIndex()+activity())%ACTIVE.length];choice(type,q[0],q[1],q[1][0])}else{const q=PERSPECTIVE[(levelIndex()+activity())%PERSPECTIVE.length];choice(type,q[0],q[1],q[1][0])}}
function instruction(){const type=TYPES[(S.level-1+activity())%TYPES.length],i=INFO[type]||INFO.choice;S.active=false;clearTimeout(S.timer);$('game-stage').innerHTML=`<div class="universal-instruction"><div class="ui-icon">🤝</div><span class="ui-skill">BEHAVIOURAL</span><h2>${i[0]}</h2><p class="ui-purpose">${i[1]}</p><div class="ui-rule"><strong>HOW TO PLAY</strong><p>Read the situation, think about the shared goal and choose or arrange the response that fits.</p></div><div class="ui-meta"><span>🤝 Cooperation and communication</span><span>✓ Four activities per level</span></div><button id="team-start" class="primary-btn ui-start">Start Activity →</button></div>`;$('team-start').onclick=run}
window.MQTeamQuest={run:instruction};
})();
