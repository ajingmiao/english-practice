/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 启用静态导出
  images: {
    unoptimized: true, // 对于静态导出，需要禁用图片优化
  },
};

module.exports = nextConfig;
