import type { Page } from 'puppeteer-core'
import { Resource } from './types'

export async function downloadResource(page: Page, resource: Resource, baseUrl: string): Promise<string> {
  try {
    const absoluteUrl = new URL(resource.url, baseUrl).href
    console.log(`    开始下载: ${absoluteUrl}`)

    const response = await page.goto(absoluteUrl, {
      timeout: 1000 * 10 * 60,
      waitUntil: 'networkidle0'
    })
    if (!response) {
      throw new Error(`Failed to get response from: ${absoluteUrl}`)
    }
    const content = await response.buffer()
    if (!content) {
      throw new Error(`Failed to get content from: ${absoluteUrl}`)
    }
    console.log(`    下载完成: ${absoluteUrl}`)
    return content.toString()
  }
  catch (error) {
    console.error(`    下载失败: ${resource.url}`, error)
    throw error
  }
}