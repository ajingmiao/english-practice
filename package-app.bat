@echo off
echo 正在打包英语练习应用...

:: 创建打包目录
set PACKAGE_DIR=english-practice-package
if exist %PACKAGE_DIR% rmdir /s /q %PACKAGE_DIR%
mkdir %PACKAGE_DIR%

:: 复制必要文件
echo 复制构建文件...
xcopy /E /I .next %PACKAGE_DIR%\.next
copy package.json %PACKAGE_DIR%\
copy package-lock.json %PACKAGE_DIR%\
copy next.config.mjs %PACKAGE_DIR%\
if exist public xcopy /E /I public %PACKAGE_DIR%\public

:: 创建启动脚本
echo 创建启动脚本...
echo @echo off > %PACKAGE_DIR%\start-app.bat
echo echo 正在启动英语练习应用... >> %PACKAGE_DIR%\start-app.bat
echo echo 请确保已安装Node.js 20.18.0版本 >> %PACKAGE_DIR%\start-app.bat
echo echo 首次运行请先执行: npm install --production >> %PACKAGE_DIR%\start-app.bat
echo npm run start >> %PACKAGE_DIR%\start-app.bat

:: 创建README文件
echo 创建README文件...
echo # 英语练习应用 > %PACKAGE_DIR%\README.md
echo. >> %PACKAGE_DIR%\README.md
echo ## 部署说明 >> %PACKAGE_DIR%\README.md
echo. >> %PACKAGE_DIR%\README.md
echo 1. 确保服务器已安装Node.js 20.18.0版本 >> %PACKAGE_DIR%\README.md
echo 2. 首次部署时，在此目录运行: `npm install --production` >> %PACKAGE_DIR%\README.md
echo 3. 启动应用: `npm run start` 或运行 `start-app.bat` >> %PACKAGE_DIR%\README.md
echo 4. 应用将在 http://localhost:3000 上运行 >> %PACKAGE_DIR%\README.md
echo. >> %PACKAGE_DIR%\README.md
echo ## 应用特性 >> %PACKAGE_DIR%\README.md
echo. >> %PACKAGE_DIR%\README.md
echo - 英语句子构建练习 >> %PACKAGE_DIR%\README.md
echo - 多个主题的练习内容 >> %PACKAGE_DIR%\README.md
echo - 自动检查答案功能 >> %PACKAGE_DIR%\README.md
echo - 适配PC屏幕的界面设计 >> %PACKAGE_DIR%\README.md

:: 创建ZIP文件（如果有7z）
where 7z >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo 创建ZIP压缩包...
    7z a -tzip english-practice.zip %PACKAGE_DIR%\*
    echo 打包完成! 文件已保存为 english-practice.zip
) else (
    echo 打包完成! 文件已保存在 %PACKAGE_DIR% 目录
    echo 注意: 未找到7z程序，无法创建ZIP文件。您可以手动压缩该目录。
)

echo.
echo 感谢使用英语练习应用打包工具!
