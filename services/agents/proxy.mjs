#!/usr/bin/env node
// Local reverse proxy: forwards Anthropic SDK requests to AgentRouter
// spoofing the claude-code client headers it expects.
// Run: node proxy.mjs
// Then set ANTHROPIC_BASE_URL=http://localhost:3099/

import http from "http";
import https from "https";

const TARGET = "agentrouter.org";
const PORT = 3099;

http.createServer((req, res) => {
  const body = [];
  req.on("data", (chunk) => body.push(chunk));
  req.on("end", () => {
    const options = {
      hostname: TARGET,
      port: 443,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: TARGET,
        "user-agent": "Anthropic/JS 0.70.0",
        "x-stainless-lang": "js",
        "x-stainless-package-version": "0.70.0",
        "x-stainless-os": "Linux",
        "x-stainless-arch": "x64",
        "x-stainless-runtime": "node",
        "x-stainless-runtime-version": process.version,
        "x-app": "cli",
      },
    };

    const proxy = https.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxy.on("error", (err) => {
      res.writeHead(502);
      res.end(err.message);
    });

    if (body.length) proxy.write(Buffer.concat(body));
    proxy.end();
  });
}).listen(PORT, () => {
  console.log(`Proxy listening on http://localhost:${PORT} -> https://${TARGET}`);
});
