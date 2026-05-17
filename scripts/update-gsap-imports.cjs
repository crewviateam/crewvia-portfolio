const fs = require('fs');
const path = require('path');

const componentsDir = path.join(process.cwd(), 'components');
const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  let content = fs.readFileSync(path.join(componentsDir, f), 'utf-8');
  
  // Replace gsap + ScrollTrigger imports
  content = content.replace(
    /import\s+\{\s*gsap\s*\}\s+from\s+['"]gsap['"];\nimport\s+\{\s*ScrollTrigger\s*\}\s+from\s+['"]gsap\/ScrollTrigger['"];\n+gsap\.registerPlugin\(ScrollTrigger\);\n*/g,
    'import { gsap, ScrollTrigger } from \'../lib/gsap\';\n\n'
  );
  
  // Replace just gsap imports
  content = content.replace(
    /import\s+\{\s*gsap\s*\}\s+from\s+['"]gsap['"];\n*/g,
    'import { gsap } from \'../lib/gsap\';\n\n'
  );

  fs.writeFileSync(path.join(componentsDir, f), content);
  console.log('Updated ' + f);
});
