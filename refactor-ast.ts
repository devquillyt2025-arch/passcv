import { Project, SyntaxKind, JsxElement, JsxFragment } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

const project = new Project();
const dir = path.join('d:', 'My Projects', 'passcv', 'components', 'resume-templates');
project.addSourceFilesAtPaths(`${dir}/*Template.tsx`);

const DEFAULT_ORDER = [
  'summary', 'skills', 'experience', 'education', 'projects',
  'certifications', 'languages', 'awards', 'volunteer', 'courses', 'publications'
];

for (const sourceFile of project.getSourceFiles()) {
  const fileName = sourceFile.getBaseName();
  if (fileName === 'index.tsx') continue;
  console.log(`Processing ${fileName}...`);

  // 1. Update Props type in the default export signature
  const defaultExport = sourceFile.getDefaultExportSymbol();
  if (defaultExport) {
    const fnDecl = defaultExport.getDeclarations()[0];
    if (fnDecl.isKind(SyntaxKind.FunctionDeclaration)) {
      const param = fnDecl.getParameters()[0];
      if (param) {
        const text = param.getText();
        if (text.includes('{ data }') || text.includes('{data}')) {
           param.replaceWithText('{ data, sectionOrder, builderDesign }: TemplateProps');
        } else if (text.includes('data')) {
           const withoutBraces = text.substring(1, text.length - 1);
           param.replaceWithText(`{ ${withoutBraces}, sectionOrder, builderDesign }: TemplateProps`);
        }
      }
    }
  }

  if (fileName === 'ElegantSerifTemplate.tsx') {
    const varDecl = sourceFile.getVariableDeclaration('BURGUNDY');
    if (varDecl) varDecl.setInitializer("builderDesign?.accentColor || '#7f1d1d'");
  }

  // 2. Find the main returned JSX element
  const returnStatements = sourceFile.getDescendantsOfKind(SyntaxKind.ReturnStatement);
  if (returnStatements.length === 0) continue;
  
  const mainReturn = returnStatements[returnStatements.length - 1];
  let rootJsx = mainReturn.getExpression();
  if (rootJsx?.isKind(SyntaxKind.ParenthesizedExpression)) {
    rootJsx = rootJsx.getExpression();
  }
  if (!rootJsx?.isKind(SyntaxKind.JsxElement) && !rootJsx?.isKind(SyntaxKind.JsxFragment)) {
    continue;
  }

  // 3. Collect the static blocks
  const blocks = new Map<string, string>();
  const expressions = rootJsx.getDescendantsOfKind(SyntaxKind.JsxExpression);
  
  for (const expr of expressions) {
    const text = expr.getText();
    let key = '';
    
    if (text.startsWith('{data.summary &&') || text.startsWith('{ data.summary &&')) key = 'summary';
    else if (text.startsWith('{has(data.skills) &&') || text.startsWith('{ has(data.skills) &&')) key = 'skills';
    else if (text.startsWith('{has(data.experience) &&')) key = 'experience';
    else if (text.startsWith('{has(data.education) &&')) key = 'education';
    else if (text.startsWith('{has(data.projects) &&')) key = 'projects';
    
    if (key && !blocks.has(key)) {
      const innerJsxList = expr.getChildrenOfKind(SyntaxKind.BinaryExpression);
      if (innerJsxList.length > 0) {
          const right = innerJsxList[0].getRight();
          blocks.set(key, right.isKind(SyntaxKind.ParenthesizedExpression) ? right.getExpression().getText() : right.getText());
      } else {
          const parens = expr.getDescendantsOfKind(SyntaxKind.ParenthesizedExpression)[0];
          if (parens) blocks.set(key, parens.getExpression().getText());
          else {
              let raw = expr.getText();
              const ampIdx = raw.indexOf('&&');
              if (ampIdx !== -1) {
                  raw = raw.substring(ampIdx + 2).trim();
                  if (raw.startsWith('(')) raw = raw.substring(1);
                  if (raw.endsWith('}')) raw = raw.substring(0, raw.length - 1).trim();
                  if (raw.endsWith(')')) raw = raw.substring(0, raw.length - 1).trim();
                  blocks.set(key, raw);
              }
          }
      }
    }
  }

  // Special fix for CreativePurpleTemplate where experience is wrapped in <>
  if (fileName === 'CreativePurpleTemplate.tsx') {
      const frags = rootJsx.getDescendantsOfKind(SyntaxKind.JsxFragment);
      for (const frag of frags) {
          const text = frag.getText();
          if (text.includes('>Experience<')) blocks.set('experience', text);
          if (text.includes('>Projects<')) blocks.set('projects', text);
      }
  }

  if (!blocks.has('experience')) {
    console.log(`Failed to find experience block in ${fileName}`);
    continue;
  }

  const projBlock = blocks.get('projects') || blocks.get('experience');
  const expBlock = blocks.get('experience');

  const certsBlock = projBlock
    .replace(/data\.projects\.map\(\(p\)/g, 'data.certifications.map((p: any)')
    .replace(/p\.id/g, 'p.id')
    .replace(/p\.name/g, 'p.name')
    .replace(/p\.startDate/g, 'p.issueDate')
    .replace(/p\.endDate/g, 'p.expiryDate')
    .replace(/p\.url/g, 'p.credentialUrl')
    .replace(/>Projects</g, '>Certifications<')
    .replace(/"Projects"/g, '"Certifications"');
    
  let langBlock = (blocks.get('skills') || expBlock)
    .replace(/data\.skills\.map\(\(s\)/g, 'data.languages.map((s: any)')
    .replace(/s\.name/g, '`${s.name} - ${s.proficiency}`')
    .replace(/>Skills</g, '>Languages<')
    .replace(/"Skills"/g, '"Languages"')
    .replace(/>Expertise</g, '>Languages<')
    .replace(/"Expertise"/g, '"Languages"');
    
  const awardsBlock = projBlock
    .replace(/data\.projects\.map\(\(p\)/g, 'data.awards.map((p: any)')
    .replace(/p\.startDate/g, 'p.date')
    .replace(/p\.endDate/g, '""')
    .replace(/>Projects</g, '>Awards<')
    .replace(/"Projects"/g, '"Awards"');
    
  const volBlock = expBlock
    .replace(/data\.experience\.map\(\(e\)/g, 'data.volunteer.map((e: any)')
    .replace(/e\.position/g, 'e.role')
    .replace(/e\.company/g, 'e.organization')
    .replace(/e\.currentlyWorking/g, 'e.currentlyVolunteering')
    .replace(/>Experience</g, '>Volunteer<')
    .replace(/"Experience"/g, '"Volunteer"');
    
  const coursesBlock = projBlock
    .replace(/data\.projects\.map\(\(p\)/g, 'data.courses.map((p: any)')
    .replace(/p\.startDate/g, 'p.completionDate')
    .replace(/p\.endDate/g, '""')
    .replace(/p\.url/g, 'p.certificateUrl')
    .replace(/>Projects</g, '>Courses<')
    .replace(/"Projects"/g, '"Courses"');
    
  const pubBlock = projBlock
    .replace(/data\.projects\.map\(\(p\)/g, 'data.publications.map((p: any)')
    .replace(/p\.name/g, 'p.title')
    .replace(/p\.startDate/g, 'p.date')
    .replace(/p\.endDate/g, '""')
    .replace(/>Projects</g, '>Publications<')
    .replace(/"Projects"/g, '"Publications"');
    
  const customBlock = projBlock
    .replace(/data\.projects\.map\(\(p\)/g, 'customSection.items.map((p: any)')
    .replace(/p\.description/g, '(p.description || "")')
    .replace(/>Projects</g, '>{customSection.name || customSection.title}<')
    .replace(/"Projects"/g, '"{customSection.name || customSection.title}"');

  const functionCode = `
  const defaultOrder = ${JSON.stringify(DEFAULT_ORDER)};
  const customIds = (data.customSections || []).map(c => c.id);
  const order = sectionOrder || [...defaultOrder, ...customIds];
  
  const renderSection = (id: string) => {
    if (id.startsWith('custom-')) {
      const customSection = data.customSections?.find((c: any) => c.id === id);
      if (!customSection || !has(customSection.items)) return null;
      return (
        <div key={id}>
          ${customBlock}
        </div>
      );
    }
    
    switch(id) {
      case 'summary': return data.summary ? (<div key={id}>${blocks.get('summary') || ''}</div>) : null;
      case 'skills': return has(data.skills) ? (<div key={id}>${blocks.get('skills') || ''}</div>) : null;
      case 'experience': return has(data.experience) ? (<div key={id}>${expBlock}</div>) : null;
      case 'education': return has(data.education) ? (<div key={id}>${blocks.get('education') || ''}</div>) : null;
      case 'projects': return has(data.projects) ? (<div key={id}>${blocks.get('projects') || ''}</div>) : null;
      case 'certifications': return has(data.certifications) ? (<div key={id}>${certsBlock}</div>) : null;
      case 'languages': return has(data.languages) ? (<div key={id}>${langBlock}</div>) : null;
      case 'awards': return has(data.awards) ? (<div key={id}>${awardsBlock}</div>) : null;
      case 'volunteer': return has(data.volunteer) ? (<div key={id}>${volBlock}</div>) : null;
      case 'courses': return has(data.courses) ? (<div key={id}>${coursesBlock}</div>) : null;
      case 'publications': return has(data.publications) ? (<div key={id}>${pubBlock}</div>) : null;
      default: return null;
    }
  };
  `;

  mainReturn.getParent().insertStatements(mainReturn.getChildIndex(), functionCode);

  // Now figure out the layout
  let isTwoColumn = false;
  let layoutType = 'single';
  
  const allDivs = rootJsx.getDescendantsOfKind(SyntaxKind.JsxElement);
  
  let leftDiv: any = null;
  let rightDiv: any = null;

  // Let's identify the columns
  for (const div of allDivs) {
      const open = div.getOpeningElement().getText();
      if (open.includes("width: '35%'") || open.includes('width: "35%"') || open.includes("width: '30%'") || open.includes("width: '38%'") || open.includes("gridTemplateColumns")) {
          if (!leftDiv) leftDiv = div;
      }
      if (open.includes("width: '65%'") || open.includes('width: "65%"') || open.includes("width: '70%'") || open.includes("width: '62%'")) {
          if (!rightDiv) rightDiv = div;
      }
  }
  
  // Special handling for SidebarDarkTemplate because grid is used differently
  if (fileName === 'SidebarDarkTemplate.tsx') {
      leftDiv = allDivs.find(d => d.getOpeningElement().getText().includes("backgroundColor: '#111827'"));
      rightDiv = allDivs.find(d => d.getOpeningElement().getText().includes("backgroundColor: '#ffffff'"));
  }
  if (fileName === 'CardStackTemplate.tsx' || fileName === 'SwissGridTemplate.tsx') {
      leftDiv = null; rightDiv = null;
  }

  if (leftDiv && rightDiv) {
      layoutType = 'two';
  } 

  if (layoutType === 'two') {
      mainReturn.getParent().insertStatements(mainReturn.getChildIndex(), `const leftKeys = ['summary', 'skills', 'education', 'languages', 'certifications', 'awards'];`);
      
      const leftOpen = leftDiv.getOpeningElement().getText();
      const rightOpen = rightDiv.getOpeningElement().getText();
      
      leftDiv.replaceWithText(`${leftOpen}\n{order.filter(id => leftKeys.includes(id)).map(renderSection)}\n</div>`);
      rightDiv.replaceWithText(`${rightOpen}\n{order.filter(id => !leftKeys.includes(id)).map(renderSection)}\n</div>`);
      
      // Remove summary node from top if it exists
      for (const expr of rootJsx.getDescendantsOfKind(SyntaxKind.JsxExpression)) {
         if (expr.wasForgotten()) continue;
         if (expr.getText().includes('data.summary &&')) {
             if (expr.getParent()?.isKind(SyntaxKind.JsxElement)) {
                 // only remove if not inside leftDiv
                 if (!leftDiv.getText().includes(expr.getText())) {
                     expr.replaceWithText("");
                 }
             }
         }
      }
  } else {
      // Single column
      // We will just find where the sections start (e.g. experience) and replace its parent with {order.map()}
      const exprs = rootJsx.getDescendantsOfKind(SyntaxKind.JsxExpression);
      for (const expr of exprs) {
          if (expr.wasForgotten()) continue;
          const txt = expr.getText();
          if (txt.includes('data.summary &&') || txt.includes('data.skills') || txt.includes('data.experience') || txt.includes('data.education') || txt.includes('data.projects')) {
              expr.replaceWithText("");
          }
      }
      
      const rootText = rootJsx.getText();
      const closingRegex = /<\/[a-zA-Z0-9]+>\s*$/;
      if (closingRegex.test(rootText)) {
          rootJsx.replaceWithText(rootText.replace(closingRegex, `\n{order.map(renderSection)}\n$&`));
      } else if (rootJsx.isKind(SyntaxKind.JsxFragment)) {
          rootJsx.replaceWithText(rootText.replace(/<\/>\s*$/, `\n{order.map(renderSection)}\n</>`));
      }
  }

}

project.saveSync();
console.log("AST modification complete!");
