import { captureWebPage } from './index'

// 开发测试用例
async function main() {
  const url = process.argv[2]
  try {
    await captureWebPage(url, {
      outputDir: './test-output',
      timeout: 60000,
      downloadResources: true
    })
  }
  catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()