@echo off
echo 正在准备打包英语练习应用...

echo 清理旧的构建文件...
if exist .next rmdir /s /q .next
if exist out rmdir /s /q out
if exist dist rmdir /s /q dist

echo 开始构建应用...
call npm run build

if errorlevel 1 (
  echo 构建失败，请检查错误信息。
  exit /b 1
)

echo 创建部署包...
if not exist dist mkdir dist
xcopy /E /I /Y out\* dist\

echo 复制 web.config 到部署包...
copy public\web.config dist\

echo 打包完成！部署包位于 dist 目录。
echo 请将 dist 目录中的所有文件复制到 IIS 网站根目录。
