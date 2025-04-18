import fs from 'fs'
import path from 'path'
import { Resource } from './types'

export function createDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

export function getResourcePath(resource: Resource, baseDir: string): string {
  try {
    // 解析URL路径
    const url = new URL(resource.url, 'http://base')
    const urlPath = url.pathname

    // 移除开头的斜杠，确保路径相对
    const relativePath = urlPath.startsWith('/') ? urlPath.substring(1) : urlPath

    // 创建完整的目录路径
    const fullPath = path.join(baseDir, relativePath)
    const dirPath = path.dirname(fullPath)

    // 确保目录存在
    createDirectory(dirPath)

    return fullPath
  }
  catch (error) {
    // 处理无效URL的情况
    console.warn(`无法解析资源URL: ${resource.url}，使用备用路径`)
    const dirPath = path.join(baseDir, 'assets', resource.type)
    createDirectory(dirPath)
    return path.join(dirPath, path.basename(resource.url))
  }
}

export function writeFile(filePath: string, content: string): void {
  const dirPath = path.dirname(filePath)
  createDirectory(dirPath)
  fs.writeFileSync(filePath, content)
}

export function updateHtmlContent(html: string, resource: Resource): string {
  return html.replace(resource.url, resource.localPath || resource.url)
}

export function getOutputDir(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathSegments = urlObj.hash.split('/')
    // 获取最后一个非空路径段
    const lastSegment = pathSegments.filter(segment => segment && segment !== '#').pop() || 'output'
    // 解码URL编码的字符
    return decodeURIComponent(lastSegment)
  } catch (error) {
    return 'output'
  }
}