# 英语练习应用打包脚本
Write-Host "正在打包英语练习应用..." -ForegroundColor Green

# 创建打包目录
$PACKAGE_DIR = "english-practice-package"
if (Test-Path $PACKAGE_DIR) {
    Remove-Item -Path $PACKAGE_DIR -Recurse -Force
}
New-Item -Path $PACKAGE_DIR -ItemType Directory | Out-Null

# 复制必要文件
Write-Host "复制构建文件..." -ForegroundColor Cyan
Copy-Item -Path ".next" -Destination "$PACKAGE_DIR\.next" -Recurse
Copy-Item -Path "package.json" -Destination "$PACKAGE_DIR\package.json"
Copy-Item -Path "package-lock.json" -Destination "$PACKAGE_DIR\package-lock.json"
Copy-Item -Path "next.config.mjs" -Destination "$PACKAGE_DIR\next.config.mjs"
if (Test-Path "public") {
    Copy-Item -Path "public" -Destination "$PACKAGE_DIR\public" -Recurse
}

# 创建启动脚本
Write-Host "创建启动脚本..." -ForegroundColor Cyan
@"
@echo off
echo 正在启动英语练习应用...
echo 请确保已安装Node.js 20.18.0版本
echo 首次运行请先执行: npm install --production
npm run start
"@ | Out-File -FilePath "$PACKAGE_DIR\start-app.bat" -Encoding utf8

# 创建README文件
Write-Host "创建README文件..." -ForegroundColor Cyan
@"
# 英语练习应用

## 部署说明

1. 确保服务器已安装Node.js 20.18.0版本
2. 首次部署时，在此目录运行: `npm install --production`
3. 启动应用: `npm run start` 或运行 `start-app.bat`
4. 应用将在 http://localhost:3000 上运行

## 应用特性

- 英语句子构建练习
- 多个主题的练习内容
- 自动检查答案功能
- 适配PC屏幕的界面设计
"@ | Out-File -FilePath "$PACKAGE_DIR\README.md" -Encoding utf8

# 尝试创建ZIP文件
$7zPath = (Get-Command "7z.exe" -ErrorAction SilentlyContinue).Source
if ($7zPath) {
    Write-Host "创建ZIP压缩包..." -ForegroundColor Cyan
    & $7zPath a -tzip "english-practice.zip" "$PACKAGE_DIR\*"
    Write-Host "打包完成! 文件已保存为 english-practice.zip" -ForegroundColor Green
} else {
    Write-Host "打包完成! 文件已保存在 $PACKAGE_DIR 目录" -ForegroundColor Green
    Write-Host "注意: 未找到7z程序，无法创建ZIP文件。您可以手动压缩该目录。" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "感谢使用英语练习应用打包工具!" -ForegroundColor Green
