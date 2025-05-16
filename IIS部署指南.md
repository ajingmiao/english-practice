# 英语练习应用 IIS 部署指南

## 准备工作

1. 确保您的 IIS 服务器已安装并正确配置
2. 确保已安装 URL Rewrite 模块（可从 Microsoft 官网下载）
3. 确保 IIS 支持静态文件类型：.json, .js, .css, .html, .woff, .woff2

## 部署步骤

### 1. 构建应用程序

在开发环境中执行以下命令构建应用程序：

```bash
# 清理旧的构建文件
rm -rf .next out

# 安装依赖
npm install

# 构建应用
npm run build
```

如果您在构建过程中遇到权限问题，可以尝试以下方法：

- 关闭所有可能使用这些文件的应用程序（如 VS Code, Node.js 进程等）
- 以管理员身份运行命令提示符
- 重启电脑后再尝试构建

### 2. 准备 web.config 文件

确保在 `out` 目录中包含 `web.config` 文件，内容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <staticContent>
      <!-- 添加MIME类型支持 -->
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff" mimeType="application/font-woff" />
      <mimeMap fileExtension=".woff2" mimeType="application/font-woff2" />
    </staticContent>
    <rewrite>
      <rules>
        <!-- 处理客户端路由 -->
        <rule name="SPA Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### 3. 部署到 IIS

1. 在 IIS 中创建一个新网站或应用程序
2. 将网站的物理路径指向您的应用程序文件
3. 将 `out` 目录中的所有文件复制到 IIS 网站根目录
4. 确保 `web.config` 文件位于网站根目录

### 4. 配置 IIS 应用程序池

1. 为您的网站创建一个新的应用程序池
2. 将应用程序池的 .NET CLR 版本设置为"无托管代码"
3. 确保应用程序池具有足够的权限访问网站文件

### 5. 启动网站

1. 在 IIS 管理器中启动网站
2. 访问网站 URL 测试应用程序是否正常工作

## 故障排除

如果您遇到问题，请检查：

1. IIS 日志文件（通常位于 `%SystemDrive%\inetpub\logs\LogFiles`）
2. 确保所有必要的 MIME 类型都已配置
3. 确保 URL Rewrite 模块已正确安装
4. 检查应用程序池身份是否有足够权限访问网站文件

## 其他注意事项

- 本应用程序是一个完全静态的单页应用程序，不需要服务器端渲染
- 所有数据都存储在浏览器的 localStorage 中，不需要数据库
- 应用程序使用客户端路由，因此需要 URL Rewrite 模块来处理客户端路由
