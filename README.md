# capture-web-page

一个基于 Puppeteer 的网页内容抓取工具，可以将网页及其相关资源（JS、CSS等）保存到本地。


## 特性

- 自动下载网页中的所有资源（JS、CSS、预加载资源等）
- 保持原始目录结构
- 自动修正资源引用路径
- 支持自定义输出目录


## 系统要求

- Node.js >= 16.17.0


## 命令行调用

```bash
catch-html <url> [options]

选项：
  -h, --help            显示帮助信息
  -o, --output <dir>    指定输出目录
  -t, --timeout <ms>    设置超时时间(毫秒)
```


## API 使用

```ts
import { captureWebPage } from 'catch-html'

await captureWebPage('https://example.com', {
  outputDir: './output',
  timeout: 30000,
  downloadResources: true
})
```


## 调试

首先把 `tsconfig.json`.sourceMap 设置为 true

```bash
pnpm i
# 打开 VSCode，按下 F5，输入你的 url 即可
```