@echo off
echo 正在准备构建英语练习应用...

echo 清理旧的构建文件...
if exist build rmdir /s /q build
if exist out rmdir /s /q out
if exist dist rmdir /s /q dist

echo 开始构建应用...
call npm run build

if %ERRORLEVEL% NEQ 0 (
  echo 构建失败，请检查错误信息。
  exit /b %ERRORLEVEL%
)

echo 创建部署包...
if not exist dist mkdir dist
xcopy /E /I /Y build\* dist\

echo 复制 web.config 到部署包...
copy public\web.config dist\

echo 构建完成！部署包位于 dist 目录。
echo 请将 dist 目录中的所有文件复制到 IIS 网站根目录。
