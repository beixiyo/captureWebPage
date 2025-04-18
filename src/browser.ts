import type { Browser, Page } from 'puppeteer-core'
import { ResourceMap, type BrowserFactory } from './types'

export async function initBrowser(createBrowser: BrowserFactory) {
  const b = await createBrowser()
  if (!b) {
    throw new Error('Please provide a valid browser instance')
  }

  return b
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