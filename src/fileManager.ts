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

/**
 * 获取可用的目录名，如果目录已存在则添加数字后缀
 */
export function getAvailableDirName(basePath: string, dirName: string): string {
  if (!fs.existsSync(path.join(basePath, dirName))) {
    return dirName
  }

  let counter = 2
  let newDirName = `${dirName}(${counter})`

  while (fs.existsSync(path.join(basePath, newDirName))) {
    counter++
    newDirName = `${dirName}(${counter})`
  }

  return newDirName
}

export function getOutputDir(url: string): string {
  try {
    const urlObj = new URL(url)
    // 获取 hash 部分（去掉开头的 #）并按 / 分割
    const hashPath = urlObj.hash.replace(/^#/, '')
    const pathSegments = hashPath.split('/').filter(segment => segment)

    // 如果 hash 路径存在，使用最后一个路径段
    if (pathSegments.length > 0) {
      return decodeURIComponent(pathSegments[pathSegments.length - 1])
    }

    // 如果没有 hash 路径，则尝试使用 pathname 的最后一段（排除文件名）
    const pathnameSegments = urlObj.pathname
      .split('/')
      .filter(segment => segment && !segment.includes('.'))

    return pathnameSegments.pop() || urlObj.hostname
  }
  catch (error) {
    // URL 解析失败时返回默认值
    return 'unknown'
  }
}