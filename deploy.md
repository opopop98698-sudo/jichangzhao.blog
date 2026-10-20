# jichangzhao.blog 部署与上线运维指南

本文档提供 `https://jichangzhao.blog` 的完整构建与生产环境部署方案（支持 Nginx 与 Apache）。

---

## 一、构建流程

### 1.1 安装依赖
在项目根目录下安装构建工具（主要是 Pagefind 全文搜索引擎）：
```bash
npm install
```

### 1.2 本地预览调试
启动 Hugo 开发服务器（支持热重载）：
```bash
npm run dev
# 或直接执行：hugo server --disableFastRender
```
浏览器访问：`http://localhost:1313`

### 1.3 生产构建（Hugo + Pagefind）
一键完成静态化编译与 Pagefind 索引建立：
```bash
npm run build
# 执行等价于：hugo --minify && npx pagefind --site public
```
构建产物将输出至根目录下的 `public/` 目录。

---

## 二、Nginx 生产环境配置

在 Linux 服务器（如 Debian / Ubuntu / CentOS）的 `/etc/nginx/sites-available/jichangzhao.blog` 或 `/etc/nginx/conf.d/jichangzhao.conf` 中配置如下：

```nginx
# HTTP 301 重定向至 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name jichangzhao.blog www.jichangzhao.blog;
    return 301 https://jichangzhao.blog$request_uri;
}

# HTTPS 主站点
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name jichangzhao.blog;

    root /var/www/jichangzhao/public;
    index index.html;

    # SSL 证书配置 (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/jichangzhao.blog/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jichangzhao.blog/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # 安全头
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml font/woff2 image/svg+xml;

    # 静态根路由与 Pagefind 索引匹配
    location / {
        try_files $uri $uri/ =404;
    }

    # 静态资源长期缓存优化 (CSS, JS, SVG, WebP, WOFF2)
    location ~* \.(css|js|svg|webp|png|jpg|jpeg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 404 错误页
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
```

测试并重载 Nginx：
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 三、Apache 生产环境配置

若使用 Apache 托管，Hugo 构建会自动将 `static/.htaccess` 复制到 `public/.htaccess`。

确保 Apache 启用了以下必要模块：
```bash
sudo a2enmod rewrite headers expires deflate
sudo systemctl restart apache2
```

虚拟主机配置示例：
```apache
<VirtualHost *:80>
    ServerName jichangzhao.blog
    Redirect permanent / https://jichangzhao.blog/
</VirtualHost>

<VirtualHost *:443>
    ServerName jichangzhao.blog
    DocumentRoot /var/www/jichangzhao/public

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/jichangzhao.blog/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/jichangzhao.blog/privkey.pem

    <Directory /var/www/jichangzhao/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorDocument 404 /404.html
</VirtualHost>
```

---

## 四、合规与自动化部署检查清单

部署前，确保满足以下硬约束：
1. **商业披露**：所有指向第三方品牌的出站链接带有 `rel="nofollow sponsored noopener"`，以及「含推广链接」的醒目标注。
2. **免责与合规声明**：页脚与 `/about/` 页面声明独立第三方属性，禁止提供翻墙技术指引。
3. **搜索引擎索引**：检查 `public/sitemap.xml` 与 `public/robots.txt` 已成功生成。
4. **全文搜索验证**：构建后确认 `public/pagefind/` 文件夹下生成了 `pagefind-ui.js` 和 `pagefind.en.pf_meta` 等索引文件。
