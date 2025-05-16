@echo off
echo 正在启动英语练习应用服务器...
echo 请确保已经运行过 node package.js 生成 dist 目录

:: 启动原生 Node.js HTTP 服务器
echo 启动服务器...
node serve.js

echo.
echo 服务器已启动，请访问 http://localhost:3000
echo 按 Ctrl+C 停止服务器
