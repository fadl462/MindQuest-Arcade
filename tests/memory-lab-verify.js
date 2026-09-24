const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(ROOT,'memory-lab.js'),'utf8');
let storage={};
global.localStorage={getItem:k=>storage[k]||null,setItem:(k,v)=>storage[k]=String(v)};
global.window={};
global.window.MQ={state:{age:0,level:1,memoryActivity:0},$:()=>({}),levelFailed(){},levelComplete(){},nextChallenge(){}};
global.document={};
vm.runInThisContext(source,{filename:'memory-lab.js'});
const api=window.MQMemoryLab;
let pass=0,fail=0;
const ok=(name,cond)=>{if(cond){pass++;console.log(`PASS ${name}`)}else{fail++;console.log(`FAIL ${name}`)}};
const t4=new Set(['reverse','dual','interference','switchback']);
const expectedFirst=[
  ['category','direction','grid','visual'],
  ['direction','grid','visual','category'],
  ['grid','visual','category','direction'],
  ['visual','category','direction','grid'],
  ['category','direction','grid','visual'],
  ['working','category','direction','grid']
];
ok('API exposed',!!api&&Array.isArray(api.plans)&&api.plans.length===5);
ok('5 pathways × 20 levels',api.plans.every(p=>p.length===20));
ok('4 activities per level',api.plans.every(p=>p.every(r=>r.length===4)));
ok('no duplicate mechanic inside a level',api.plans.every(p=>p.every(r=>new Set(r).size===4)));
ok('no same-slot consecutive mechanic repeats',api.plans.every(p=>p.slice(1).every((r,i)=>r.every((m,s)=>m!==p[i][s]))));
ok('3–5 excludes Tier 4',!api.plans[0].flat().some(m=>t4.has(m)));
ok('3–5 opening schedule matches source',expectedFirst.every((r,i)=>JSON.stringify(api.plans[0][i])===JSON.stringify(r)));
ok('6–8 first Tier 4 scheduled use is Level 20',api.plans[1].slice(0,19).flat().every(m=>!t4.has(m))&&api.plans[1][19].every(m=>t4.has(m)));
ok('9–11 first Tier 4 scheduled use is Level 12',api.plans[2].slice(0,11).flat().every(m=>!t4.has(m))&&api.plans[2][11].includes('switchback'));
ok('12–14 first Tier 4 scheduled use is Level 7',api.plans[3].slice(0,6).flat().every(m=>!t4.has(m))&&api.plans[3][6].every(m=>t4.has(m)));
ok('15–18 first Tier 4 scheduled use is Level 7',api.plans[4].slice(0,6).flat().every(m=>!t4.has(m))&&api.plans[4][6].every(m=>t4.has(m)));
ok('progressive unlock metadata matches source',JSON.stringify(api.unlocks)===JSON.stringify([{tier2:6,tier3:14,tier4:null},{tier2:3,tier3:9,tier4:17},{tier2:2,tier3:6,tier4:12},{tier2:1,tier3:3,tier4:7},{tier2:1,tier3:2,tier4:4}]));
const expected=[
  [3,5600,20000],[4,5300,19100],[5,5000,18000],[5,4700,16900],[5,4300,15800],
  [4,5000,17500],[5,4800,16700],[6,4500,15800],[6,4200,14800],[6,3900,13800],
  [5,4300,15000],[6,4100,14300],[7,3800,13500],[7,3600,12700],[7,3300,11900],
  [6,3700,12500],[7,3500,11900],[8,3300,11300],[8,3100,10600],[8,2900,9900],
  [7,3200,10500],[8,3000,10000],[9,2900,9500],[9,2700,8900],[9,2500,8300]
];
for(let age=0;age<5;age++){
  for(const [idx,l] of [[0,1],[1,5],[2,10],[3,15],[4,20]]){
    global.window.MQ.state.age=age;global.window.MQ.state.level=l;
    const p=api.difficulty[age][idx];
    const e=expected[age*5+idx];
    ok(`difficulty age ${age} level ${l}`,p.count===e[0]&&p.show===e[1]&&p.response===e[2]);
  }
}
ok('plan validator returns no errors',api.planErrors.length===0);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
