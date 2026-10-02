const fs = require('fs');
let code = fs.readFileSync('src/utils/media.ts', 'utf8');

code = code.replace(
  /function writeToDisk\(buffer: Buffer, type: MediaType, senderJid: string, downloadDir: string\): void \{([\s\S]*?)\} finally \{([\s\S]*?)\}/,
  (match, p1, p2) => {
    let replaced = match.replace(': void {', ': string {');
    replaced = replaced.replace('return;', 'return filePath;');
    replaced += '\n  return filePath;';
    return replaced;
  }
);

code = code.replace(
  /export async function processViewOnce\([\s\S]*?\): Promise<boolean> \{([\s\S]*?)return true;\n  \} catch \(e\) \{/m,
  (match, p1) => {
    let newFunc = match.replace(': Promise<boolean> {', ': Promise<string | boolean> {');
    
    // insert let savedPath = "";
    newFunc = newFunc.replace('const type = media.type;', 'const type = media.type;\n    let savedPath = "";');
    
    // fix writeToDisk call
    newFunc = newFunc.replace('writeToDisk(buffer, type, senderJid, downloadDir);', 'savedPath = writeToDisk(buffer, type, senderJid, downloadDir);');
    
    // Add savedPath to caption
    newFunc = newFunc.replace('const caption = Deco.header("VIEWONCE") + "\\n" + Deco.listItem("Remitente", +);', 
      'const caption = Deco.header("VIEWONCE") + "\\n" + Deco.listItem("Remitente", +) + (savedPath ? "\\n" + Deco.listItem("Ruta", savedPath) : "");'
    );
    
    newFunc = newFunc.replace('return true;', 'return savedPath || true;');
    return newFunc;
  }
);

fs.writeFileSync('src/utils/media.ts', code, 'utf8');
