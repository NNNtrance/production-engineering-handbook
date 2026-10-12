const PRODUCTION_PORT = 38450;
let staticServer = null;

function startStaticServer() {
  return new Promise((resolve) => {
    const outDir = path.join(__dirname, "../out");
    staticServer = http.createServer((req, res) => {
      // 1. SPA routing fallback for static Next.js export
      const parsedUrl = new URL(req.url, "http://127.0.0.1");
      let filePath = path.join(outDir, decodeURIComponent(parsedUrl.pathname));
      if (!path.extname(filePath)) {
        filePath = fs.existsSync(filePath + ".html")
          ? filePath + ".html"
          : path.join(filePath, "index.html");
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.join(outDir, "index.html");
      }
      // Stream file with strict MIME types...
      fs.createReadStream(filePath).pipe(res);
    });

    // 2. Fallback to dynamic port ONLY if fixed port is busy
    staticServer.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.warn(`Port ${PRODUCTION_PORT} in use, falling back to dynamic port.`);
        staticServer.listen(0, "127.0.0.1", () => {
          resolve(staticServer.address().port);
        });
      }
    });

    // 3. Guarantee persistent origin: http://127.0.0.1:38450
    staticServer.listen(PRODUCTION_PORT, "127.0.0.1", () => {
      resolve(PRODUCTION_PORT);
    });
  });
}