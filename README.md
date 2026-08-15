# Komari 定制化部署（komari-custom）

基于开源监控面板 **Komari Monitor** 的定制化部署方案，包含自定义品牌图标、Chrome 小程序同窗口导航修复以及 nginx 安全加固。

## 源项目

本仓库是 [komari-monitor/komari](https://github.com/komari-monitor/komari)（作者 Akizon77）的定制化部署配置集合，**不包含** Komari 本体源码。使用时请先部署源项目，再应用本仓库的定制文件。

- 源项目仓库：https://github.com/komari-monitor/komari
- 本仓库定位：nginx 层的品牌定制 + 行为修复，不改动 Komari 二进制

## 为什么需要定制

Komari 以单二进制发布，前端资源（HTML/JS/图标）全部内嵌，无法直接修改源码文件。因此所有定制都通过 **nginx 反向代理层**实现：

1. **静态资源劫持**：用 nginx `location` 精确匹配，把 `/favicon.ico`、`/assets/pwa-icon.png` 指向自定义文件。
2. **HTML 注入**：用 nginx `sub_filter` 在页面 `</head>` 前注入脚本，实现浏览器行为修复。

## 修改内容

### 1. 自定义品牌图标

- 重新设计了监控主题的应用图标（玻璃质感 + 服务器机架 + 心跳线 + 状态指示灯）。
- 通过 nginx 劫持替换：
  - `/favicon.ico` → `web/favicon.ico`（多尺寸 ICO）
  - `/assets/pwa-icon.png` → `web/icon-512.png`（manifest 引用的 PWA 图标，Chrome 生成桌面小程序时使用）
- 生成素材：
  - `assets/komari-icon-source.png`：原始设计稿（1024×1024）
  - `assets/komari-app.icns`：macOS 应用图标（已嵌入 `aps监控器.app`）

### 2. Chrome 小程序同窗口导航修复

Chrome 以 `--app` / PWA 独立窗口打开面板时，部分同源链接会跳转到新的浏览器窗口，而不是在当前窗口内切换。注入 `web/same-window.js` 后：

- 拦截所有 `target="_blank"` 的同源链接，改为当前窗口导航；
- 拦截 `window.open()` 的同源调用，改为当前窗口导航；
- 外部链接行为不受影响。

### 3. nginx 安全加固

- 启用 HSTS（`Strict-Transport-Security: max-age=31536000; includeSubDomains`）；
- 隐藏 nginx 版本号（`server_tokens off`）；
- 面板私密模式（`private_site=true`，未登录 API 返回 401）。

## 目录结构

```text
komari-custom/
├── README.md                # 本文件
├── nginx/
│   └── komari-domain        # 定制后的 nginx 站点配置（25776 端口）
├── web/
│   ├── favicon.ico          # 自定义 favicon（多尺寸 ICO）
│   ├── icon-192.png         # PWA 图标 192×192
│   ├── icon-512.png         # PWA 图标 512×512
│   └── same-window.js       # 同窗口导航拦截脚本
└── assets/
    ├── komari-icon-source.png  # 图标设计稿
    └── komari-app.icns         # macOS 应用图标
```

## 部署方法

1. 按[源项目文档](https://github.com/komari-monitor/komari)部署 Komari 服务端（默认 25774 端口）与 nginx。
2. 将 `web/` 下文件放到静态目录（示例：`/var/www/komari-icons/`）：

   ```bash
   sudo mkdir -p /var/www/komari-icons
   sudo cp web/* /var/www/komari-icons/
   sudo chown -R www-data:www-data /var/www/komari-icons
   ```

3. 用 `nginx/komari-domain` 替换站点配置并重载：

   ```bash
   sudo cp nginx/komari-domain /etc/nginx/sites-available/komari-domain
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. 浏览器强刷面板（`Cmd+Shift+R`）即可看到新图标与修复后的导航行为。

## 环境说明

- 服务端：Ubuntu 24.04 + nginx 1.24
- Komari：v1.2.60（源项目）
- 部署示例域名：`https://komari.dhoqdqoqq.dpdns.org:25776`

## 免责声明

本项目仅为个人使用的定制部署配置。图标素材为 AI 生成，如需商用请自行确认授权。Komari 本体版权归源项目所有。
