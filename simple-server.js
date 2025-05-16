const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 处理所有路由 - 支持客户端路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\x1b[32m服务器运行在 http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[33m按 Ctrl+C 停止服务器\x1b[0m`);
});
