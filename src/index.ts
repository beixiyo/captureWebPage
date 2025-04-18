import { initBrowser, createPage, getResources } from './browser'
import { downloadResource } from './downloader'
import { createDirectory, getResourcePath, writeFile, updateHtmlContent, getOutputDir } from './fileManager'
import { Resource } from './types'
import path from 'node:path'

async function captureHtml(url: string) {
  try {
    const browser = await initBrowser()
    const page = await createPage(browser)
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 1000 * 10 * 60, })

    // 根据URL创建输出目录
    const outputDirName = getOutputDir(url)
    const outputDir = path.join(process.cwd(), outputDirName)
    createDirectory(outputDir)

    // 获取所有资源URL
    const urlObj = new URL(url)
    const resources = await getResources(page, urlObj.origin)
    let html = await page.content()

    // 下载并保存资源
    const newPage = await createPage(browser)
    for (const type of ['scripts', 'styles', 'prefetch'] as const) {
      for (const url of resources[type]) {
        if (!url) continue
        const resource: Resource = { url, type }
        try {
          const content = await downloadResource(newPage, resource, url)
          resource.localPath = path.relative(outputDir, getResourcePath(resource, outputDir))
          writeFile(path.join(outputDir, resource.localPath), content)
          html = updateHtmlContent(html, resource)
        }
        catch (error) {
          console.error(`Failed to process resource ${url}:`, error)
          // 继续处理其他资源
          continue
        }
      }
    }

    // 保存HTML文件
    writeFile(path.join(outputDir, 'index.html'), html)
    console.log(`HTML content has been saved to ${outputDirName}/index.html`)

    await browser.close()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

const url = process.argv[2]
if (!url) {
  console.error('Please provide a URL as an argument')
  console.log('Usage: pnpm start <url>')
  process.exit(1)
}

captureHtml(url)