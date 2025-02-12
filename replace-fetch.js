const fs = require('fs');
const path = require('path');

const DIRS = ['src/pages', 'src/components', 'src/contexts'];
const BASE_URL = 'http://localhost:3002';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add import for fetchWithTimeout if not present
  if (!content.includes('import { fetchWithTimeout }')) {
    const importStatement = "import { fetchWithTimeout } from '../utils/api';\n";
    content = importStatement + content;
  }

  // Replace fetch calls
  content = content.replace(
    /fetch\((['"`])http:\/\/localhost:3002(.*?)\1,?\s*({[\s\S]*?})?/g, 
    (match, quote, path, options) => {
      const cleanPath = path.trim();
      const cleanOptions = options ? options.trim() : '{}';
      return `fetchWithTimeout('${BASE_URL}${cleanPath}', ${cleanOptions})`;
    }
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated: ${filePath}`);
}

function findAndReplaceFiles(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findAndReplaceFiles(fullPath);
    } else if ((file.endsWith('.jsx') || file.endsWith('.js')) && 
               !fullPath.includes('utils/api.js') && 
               fs.readFileSync(fullPath, 'utf8').includes('fetch(\'http://localhost:3002')) {
      replaceInFile(fullPath);
    }
  });
}

DIRS.forEach(dir => findAndReplaceFiles(path.join(__dirname, dir)));