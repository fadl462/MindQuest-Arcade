const fs=require('fs');
const reflex=fs.readFileSync('/mnt/data/mindquest_work/reflex-arena.js','utf8');
const builder=fs.readFileSync('/mnt/data/mindquest_work/builder.js','utf8');
const tests=[];
function t(name,ok){tests.push([name,!!ok]);}
t('Rhythm uses a non-binary pool for advanced age pathways',/pool=shuffle\(\['●','○','▲','■'\]\)/.test(reflex));
t('Rhythm sequence is not a simple alternating pattern',/beats=Array\.from\(\{length:len\},\(_,i\)=>pool\[/.test(reflex));
t('Precision target is visually centered at its coordinate',/transform:translate\(-50%,-50%\)/.test(reflex));
t('Precision target position is bounded',/Math\.min\(82,12\+/.test(reflex));
t('Tile Match starts inactive during memorization',/S\.active=false;\s*S\.timer=setTimeout/.test(builder));
t('Tile Match becomes active only after pattern hides',/target\.forEach\(i=>grid\[i\]\.classList\.remove\('filled'\)\);S\.active=true/.test(builder));
t('Tile Match uses generation token',/S\.builderToken/.test(builder));
t('Path variant 3 is distinct zigzag',/else \{let r=0,c=0;path\.push\(0\);while\(r<n-1\|\|c<n-1\)/.test(builder));
for(const [n,ok] of tests) console.log((ok?'PASS':'FAIL')+' '+n);
if(tests.some(x=>!x[1])) process.exit(1);
console.log(`${tests.length}/${tests.length} passed`);
