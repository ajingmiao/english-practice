Write-Host "正在准备打包英语练习应用..." -ForegroundColor Green

Write-Host "清理旧的构建文件..." -ForegroundColor Yellow
if (Test-Path -Path ".next") { Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path -Path "out") { Remove-Item -Path "out" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path -Path "dist") { Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue }

Write-Host "开始构建应用..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败，请检查错误信息。" -ForegroundColor Red
    exit 1
}

Write-Host "创建部署包..." -ForegroundColor Yellow
if (-not (Test-Path -Path "dist")) { New-Item -Path "dist" -ItemType Directory }
Copy-Item -Path "out\*" -Destination "dist\" -Recurse -Force

Write-Host "复制 web.config 到部署包..." -ForegroundColor Yellow
Copy-Item -Path "public\web.config" -Destination "dist\" -Force

Write-Host "打包完成！部署包位于 dist 目录。" -ForegroundColor Green
Write-Host "请将 dist 目录中的所有文件复制到 IIS 网站根目录。" -ForegroundColor Green
