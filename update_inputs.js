const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'components/builder/steps');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const oldInputClsRegex = /const inputCls\s*=\s*['"`][^`'"]+['"`];/s;
const newInputCls = `const inputCls =\n    'w-full rounded-[8px] border border-[#E2E8F0] bg-white px-[14px] py-[10px] text-[14px] text-slate-900 transition-colors duration-150 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 focus:outline-none';`;

const oldGroupLabel = /<p className="text-\[10px\] font-bold uppercase tracking-\[0\.14em\] text-slate-400">\{children\}<\/p>/g;
const newGroupLabel = `<p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">{children}</p>`;

for (const file of files) {
  const p = path.join(dir, file);
  let content = fs.readFileSync(p, 'utf8');
  let original = content;

  content = content.replace(oldInputClsRegex, newInputCls);
  content = content.replace(oldGroupLabel, newGroupLabel);
  
  if (content !== original) {
    fs.writeFileSync(p, content, 'utf8');
    console.log('Updated', file);
  }
}
