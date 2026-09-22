const fs=require('fs');
const reflex=fs.readFileSync('../reflex-arena.js','utf8');
const builder=fs.readFileSync('../builder.js','utf8');
const tests=[];
function ok(name,cond){tests.push([name,!!cond])}
ok('rhythm uses a multi-symbol pool',/const pool=SHAPES\.slice\(0,2\+Math\.min\(3,tier\(\)\+Math\.floor\(activity\(\)\/2\)\)\)/.test(reflex));
ok('rhythm avoids immediate repeated symbols',/next===beats\[i-1\]/.test(reflex));
ok('rhythm response buttons come from the same pool',/pool\.map\(x=>`<button class=\"reflex-key\" data-v=\"\$\{x\}/.test(reflex));
ok('builder path has distinct fourth route',/else \{for\(let r=0;r<n;r\+\+\)path\.push\(r\*n\+n-1\);for\(let c=n-2;c>=0;c--\)path\.push\(\(n-1\)\*n\+c\)\}/.test(builder));
ok('tile match starts inactive during memorization',/const picked=new Set\(\);let reveal=true;S\.active=false/.test(builder));
ok('tile match enables after memorization',/S\.active=true;\},hideAt\)/.test(builder));
ok('tile match exposes rebuild status',/Rebuild the pattern\./.test(builder));
let pass=0;for(const [n,c] of tests){if(c)pass++;else console.error('FAIL',n)}console.log(`${pass}/${tests.length} targeted v8.16 checks passed`);if(pass!==tests.length)process.exit(1);
