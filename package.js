const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 打印彩色文本
function log(message, color) {
  const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
  };
  
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 删除目录
function removeDir(dir) {
  if (fs.existsSync(dir)) {
    log(`删除目录: ${dir}`, 'yellow');
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (err) {
      log(`警告: 无法删除 ${dir}: ${err.message}`, 'yellow');
    }
  }
}

// 复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    log(`错误: 源目录不存在: ${src}`, 'red');
    return false;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
  
  return true;
}

// 主函数
async function main() {
  try {
    log('正在准备打包英语练习应用...', 'green');
    
    // 清理旧的构建文件
    log('清理旧的构建文件...', 'yellow');
    removeDir('.next');
    removeDir('out');
    removeDir('dist');
    
    // 构建应用
    log('开始构建应用...', 'yellow');
    execSync('npm run build', { stdio: 'inherit' });
    
    // 创建部署包
    log('创建部署包...', 'yellow');
    if (!fs.existsSync('dist')) {
      fs.mkdirSync('dist');
    }
    
    // 复制构建文件到部署包
    log('复制构建文件到部署包...', 'yellow');
    if (!copyDir('out', 'dist')) {
      log('错误: 无法复制构建文件', 'red');
      process.exit(1);
    }
    
    // 复制 web.config 到部署包
    log('复制 web.config 到部署包...', 'yellow');
    try {
      fs.copyFileSync('public/web.config', 'dist/web.config');
    } catch (err) {
      log(`警告: 无法复制 web.config: ${err.message}`, 'yellow');
    }
    
    log('打包完成！部署包位于 dist 目录。', 'green');
    log('请将 dist 目录中的所有文件复制到 IIS 网站根目录。', 'green');
  } catch (error) {
    log(`错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
