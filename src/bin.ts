#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { captureWebPage, CaptureWebPageOptions } from './'
import puppeteer from 'puppeteer-core'

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    help: {
      type: 'boolean',
      short: 'h',
    },
    output: {
      type: 'string',
      short: 'o',
    },
    timeout: {
      type: 'string',
      short: 't',
    }
  },
  allowPositionals: true,
})

if (values.help || positionals.length === 0) {
  console.log(`
使用方法: catch-html <url> [options]

选项：
  -h, --help            显示帮助信息
  -o, --output <dir>    指定输出目录
  -t, --timeout <ms>    设置超时时间(毫秒)

示例：
  catch-html https://example.com -o ./output
`)
  process.exit(0)
}

const options: CaptureWebPageOptions = {
  outputDir: values.output,
  timeout: values.timeout ? parseInt(values.timeout) : undefined,
  browserFactory: async () => {
    return puppeteer.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
      timeout: 1000 * 60 * 10,
      protocolTimeout: 1000 * 60 * 10,
    })
  }
}

captureWebPage(positionals[0], options)
  .catch(err => {
    console.error('错误:', err)
    process.exit(1)
  })