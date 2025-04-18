import { captureWebPage } from './index'
import puppeteer from 'puppeteer-core'

// 开发测试用例
async function main() {
  const url = process.argv[2]
  try {
    await captureWebPage(url, {
      outputDir: './test-output',
      timeout: 60000,
      downloadResources: true,
      browserFactory: async () => {
        return puppeteer.launch({
          executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
          headless: true,
          timeout: 1000 * 60 * 10,
          protocolTimeout: 1000 * 60 * 10,
        })
      }
    })
  }
  catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()