const fs = require('fs');
const path = require('path');
const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) results = results.concat(walk(file));
    else if (file.endsWith('.tsx')) results.push(file);
  });
  return results;
};
const files = walk('./src/app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let modified = false;
  
  content = content.replace(/<Button([^>]*)>([\s\S]*?)<\/Button>/g, (match, p1, p2) => {
    if (p1.includes('title=')) return match;
    let title = '';
    if (p2.includes('<Trash2')) title = 'Eliminar';
    else if (p2.includes('<Edit')) title = 'Editar';
    else if (p2.includes('<Undo2')) title = 'Devolver';
    else if (p2.includes('<AlertTriangle')) title = 'Registrar Incidente';
    else if (p2.includes('<Check') && !p2.includes('CheckCircle')) title = 'Confirmar / Entregar';
    else if (p2.includes('<Handshake')) title = 'Asignar / Prestar';
    
    if (title && !p2.includes(title)) {
      modified = true;
      return `<Button title="${title}"${p1}>${p2}</Button>`;
    }
    return match;
  });
  
  content = content.replace(/<button([^>]*)>([\s\S]*?)<\/button>/g, (match, p1, p2) => {
    if (p1.includes('title=')) return match;
    let title = '';
    if (p2.includes('<Trash2')) title = 'Eliminar';
    else if (p2.includes('<Edit')) title = 'Editar';
    
    if (title) {
      modified = true;
      return `<Button title="${title}" variant="ghost" size="icon"${p1}>${p2}</Button>`;
    }
    return match;
  });
  
  if (modified) {
    if (!content.includes('import { Button }')) {
      content = 'import { Button } from "@/components/ui/button";\n' + content;
    }
    fs.writeFileSync(f, content);
  }
});
