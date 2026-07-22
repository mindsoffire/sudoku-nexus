const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8877;
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname;
  
  let filePath = pathname === '/' ? './index.html' : '.' + pathname;
  filePath = path.resolve(filePath);
  
  const workspacePath = path.resolve('.');
  if (!filePath.startsWith(workspacePath)) {
    res.statusCode = 403;
    res.end('Access Denied');
    return;
  }

  const extname = path.extname(filePath);
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.statusCode = 404;
        res.end('File Not Found');
      } else {
        res.statusCode = 500;
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      if (pathname === '/') {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        });
      } else {
        res.writeHead(200, { 
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400' 
        });
      }
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Sudoku Server is live at http://localhost:${PORT}/`);
});
