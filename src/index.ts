import { initBrowser, createPage, getResources } from './browser'
import { downloadResource } from './downloader'
import { createDirectory, getResourcePath, writeFile, updateHtmlContent, getOutputDir, getAvailableDirName } from './fileManager'
import { Resource, type BrowserFactory } from './types'
import path from 'node:path'


export interface CaptureWebPageOptions {
  outputDir?: string
  timeout?: number
  downloadResources?: boolean
  browserFactory?: BrowserFactory
}

export async function captureWebPage(url: string, options: CaptureWebPageOptions = {}) {
  const {
    outputDir: baseOutputDir = './output',
    timeout = 30000,
    downloadResources = true,
    browserFactory = () => Promise.resolve(null as any),
  } = options

  console.log(`开始处理URL: ${url}`)
  try {
    console.log('正在初始化浏览器...')
    const browser = await initBrowser(browserFactory)
    const page = await createPage(browser)

    console.log('正在访问目标页面...')
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout
    })

    console.log('正在创建输出目录...')
    const baseDirName = getOutputDir(url)
    const outputDirName = getAvailableDirName(path.join(process.cwd(), baseOutputDir), baseDirName)
    const outputDir = path.join(process.cwd(), baseOutputDir, outputDirName)
    createDirectory(outputDir)

    console.log('正在获取页面资源...')
    const urlObj = new URL(url)
    const resources = await getResources(page, urlObj.origin)
    console.log(`找到资源数量: scripts=${resources.scripts.length}, styles=${resources.styles.length}, prefetch=${resources.prefetch.length}`)
    let html = await page.content()

    if (downloadResources) {
      console.log('开始下载资源...')
      const newPage = await createPage(browser)
      for (const type of ['scripts', 'styles', 'prefetch'] as const) {
        console.log(`\n处理 ${type} 类型资源:`)
        for (const url of resources[type]) {
          if (!url) continue
          console.log(`  正在处理: ${url}`)
          const resource: Resource = { url, type }
          try {
            const content = await downloadResource(newPage, resource, url)
            resource.localPath = path.relative(outputDir, getResourcePath(resource, outputDir))
            writeFile(path.join(outputDir, resource.localPath), content)
            html = updateHtmlContent(html, resource)
          }
          catch (error) {
            console.error(`Failed to process resource ${url}:`, error)
            continue
          }
        }
      }
    }

    // 保存HTML文件
    writeFile(path.join(outputDir, 'index.html'), html)
    console.log(`HTML content has been saved to ${path.join(baseOutputDir, outputDirName)}/index.html`)

    await browser.close()
  } catch (error) {
    console.error('处理过程中出错:', error)
    throw error
  }
}


export * from './types'
