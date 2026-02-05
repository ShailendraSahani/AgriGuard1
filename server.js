import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { join, extname } from 'path';
import { readFile } from 'fs';

// Disable Turbopack to avoid CSS parsing issues with modern color functions
process.env.TURBOPACK = '0';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Serve static files from public directory
    if (pathname && (pathname.startsWith('/Home.png') || pathname.startsWith('/Home1.png') || pathname.startsWith('/carsoul4.jpeg') || pathname.startsWith('/carsoul1.png') || pathname.startsWith('/file.svg') || pathname.startsWith('/globe.svg') || pathname.startsWith('/next.svg') || pathname.startsWith('/vercel.svg') || pathname.startsWith('/window.svg'))) {
      const filePath = join(process.cwd(), 'public', pathname);
      const ext = extname(filePath);
      const contentType = {
        '.png': 'image/png',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
      }[ext] || 'application/octet-stream';

      readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end('File not found');
          return;
        }
        res.setHeader('Content-Type', contentType);
        res.end(data);
      });
      return;
    }

    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId);
      }
    });
  });

  // Set global socket server for API routes
  const { setSocketServer } = await import('./src/lib/globalSocket.js');
  setSocketServer(io);

  httpServer.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
