const fs=require('fs');
const R=fs.readFileSync(__dirname+'/../reflex-arena.js','utf8');
const B=fs.readFileSync(__dirname+'/../builder.js','utf8');
let pass=0,fail=0;
function ok(name,cond){if(cond){console.log('PASS',name);pass++}else{console.error('FAIL',name);fail++}}
ok('Reflex has guarded sequential double-target flow',/S\.doubleStep=1/.test(R)&&/cells\[second\]\.disabled=false/.test(R)&&/if\(S\.doubleStep===1&&i===second\)/.test(R));
ok('Reflex Multi-Target uses distinct shuffled positions',/shuffle\(\[\.\.\.Array\(6\)\.keys\(\)\]\)\.slice\(0,len\)/.test(R));
ok('Builder maze has a guaranteed top-right-to-bottom-right safe route',/variant===0\)\{[\s\S]*variant===1\)\{[\s\S]*variant===2\)\{[\s\S]*else \{for\(let c=0;c<n;c\+\+\)path\.push\(c\);for\(let r=1;r<n;r\+\+\)path\.push\(r\*n\+n-1\)\}/.test(B));
ok('Builder maze no longer extends past the goal',!/for\(let c=n-2;c>=0;c--\)path\.push\(\(n-1\)\*n\+c\)/.test(B));
ok('Builder maze blocks only cells outside the guaranteed path',/filter\(i=>!path\.includes\(i\)\)/.test(B));
console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
