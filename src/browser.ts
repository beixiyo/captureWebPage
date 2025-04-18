import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import { ResourceMap } from './types'

export async function initBrowser() {
  return await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    timeout: 1000 * 60 * 10,
    protocolTimeout: 1000 * 60 * 10,
  })
}

export async function createPage(browser: Browser) {
  return await browser.newPage()
}

export async function getResources(page: Page, prefix: string = ''): Promise<ResourceMap> {
  return page.evaluate(
    (prefix) => {
      const getUrls = (selector: string, attribute: string) =>
        Array.from(document.querySelectorAll(selector))
          .map(el => comebineUrl(prefix, el.getAttribute(attribute)))
          .filter(url => url && !url.startsWith('data:'))

      function comebineUrl(prefix: string, url?: string | null) {
        if (!url) {
          return ''
        }

        if (prefix.endsWith('/')) {
          prefix = prefix.slice(0, -1)
        }
        if (!url.startsWith('/')) {
          url = `/${url}`
        }

        if (url.startsWith('http')) {
          return url
        }

        return `${prefix}${url}`
      }

      return {
        scripts: getUrls('script[src]', 'src'),
        styles: getUrls('link[rel="stylesheet"]', 'href'),
        prefetch: getUrls('link[rel="prefetch"]', 'href')
      }
    },
    prefix
  )
}