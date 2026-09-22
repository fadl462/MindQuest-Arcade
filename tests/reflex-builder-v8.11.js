const fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');
const r=fs.readFileSync(path.join(ROOT,'reflex-arena.js'),'utf8');
const b=fs.readFileSync(path.join(ROOT,'builder.js'),'utf8');
let pass=0,fail=0;const ok=(name,cond)=>{console.log(`${cond?'PASS':'FAIL'} ${name}`);cond?pass++:fail++};
// Reflex progression and solvability
ok('age difficulty has five pathway values',/function ageDifficulty\(\)\{return \[0,0,0,1,1\]\[S\.age\]\|\|0\}/.test(r));
ok('response timing incorporates age difficulty',/function difficulty\(\)\{return S\.level\+activity\(\)\*\.55\+ageDifficulty\(\)\*\.35\}/.test(r));
ok('reaction sequence length scales by age',/len=clamp\(3\+Math\.floor\(\(S\.level-1\)\/4\)\+activity\(\)\+ageDifficulty\(\),3,9\)/.test(r));
ok('multi-target sequence length scales by age',/len=clamp\(2\+Math\.floor\(\(S\.level-1\)\/5\)\+activity\(\)\+ageDifficulty\(\),2,6\)/.test(r));
ok('combo symbol variety scales by age',/slice\(0,clamp\(3\+ageDifficulty\(\),3,5\)\)/.test(r));
ok('rhythm length scales by age',/Math\.floor\(activity\(\)\/2\)\+ageDifficulty\(\),2,8\)/.test(r));
ok('double target positions remain distinct',/second=\(first\+2\+activity\(\)\)%count===first\?\(first\+1\)%count/.test(r));
ok('double target reveals second only after first',/S\.doubleStep=1/.test(r)&&/cells\[second\]\.disabled=false/.test(r));
ok('multi-target positions are distinct',/shuffle\(\[\.\.\.Array\(6\)\.keys\(\)\]\)\.slice\(0,len\)/.test(r));
ok('moving chase advances one target at a time',/clearTimeout\(S\.timer\);hit\+\+/.test(r)&&/if\(hit>=steps\)\{complete\(\);return\}spawn\(\)/.test(r));
// Builder progression and solvability
ok('builder has age complexity tier',/function ageComplexity\(\)\{return \[0,0,0,1,1\]\[S\.age\]\|\|0\}/.test(b));
ok('builder count scales with pathway',/Math\.round\(\(2\+Math\.floor\(S\.level\/3\)\+activity\(\)\)\*ageScale\(\)\)/.test(b));
ok('maze extra blocks never occupy safe path',/filter\(i=>!path\.includes\(i\)\)/.test(b));
ok('maze age complexity increases obstacle density',/Math\.floor\(S\.level\/4\)\+ageComplexity\(\)/.test(b));
ok('tile match guarantees a target',/if\(!target\.size\)target\.add/.test(b));
ok('symmetry removes a real mirrored target',/const source=candidates/.test(b)&&/cells\[target\]=false/.test(b));
ok('mirror guarantees at least one target',/if\(!left\.length\)\{const fallback=/.test(b));
ok('numeric Builder choices are unique',/const choices=\[\.\.\.new Set/.test(b)&&/const options=\[\.\.\.new Set/.test(b));
console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
