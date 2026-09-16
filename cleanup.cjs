const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove the <View> block
  // It usually looks like:
  // {!reduced && (
  //   <View className="...">
  //     <Something3D />
  //   </View>
  // )}
  // Or just <View ...>...</View>

  // Let's use a regex that matches `<View` up to `</View>` including optional `{!reduced && (` wrapping
  const viewRegex1 = /\{\!reduced\s*&&\s*\(\s*<View[\s\S]*?<\/View>\s*\)\s*\}/g;
  const viewRegex2 = /<View[\s\S]*?<\/View>/g;

  content = content.replace(viewRegex1, '');
  content = content.replace(viewRegex2, '');

  // Remove imports for View and any 3D components we created
  // import { View } from '@react-three/drei';
  // import { ...3D } from '../components/3d/...3D';
  const importViewRegex = /import\s*\{\s*View\s*\}\s*from\s*['"]@react-three\/drei['"];?\n?/g;
  const import3DRegex = /import\s*\{\s*\w+3D\s*\}\s*from\s*['"]\.\.\/components\/3d\/\w+3D['"];?\n?/g;
  
  content = content.replace(importViewRegex, '');
  content = content.replace(import3DRegex, '');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned up ${file}`);
  }
}
