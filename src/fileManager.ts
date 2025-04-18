import fs from 'fs';
import path from 'path';
import { Resource } from './types';

export function createDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getResourcePath(resource: Resource, baseDir: string): string {
  // 处理webjars路径
  const urlPath = resource.url.startsWith('webjars/')
    ? resource.url
    : new URL(resource.url, 'http://base').pathname;

  const dirPath = path.join(baseDir, 'webjars');
  createDirectory(dirPath);
  return path.join(dirPath, path.basename(urlPath));
}

export function writeFile(filePath: string, content: string): void {
  const dirPath = path.dirname(filePath);
  createDirectory(dirPath);
  fs.writeFileSync(filePath, content);
}

export function updateHtmlContent(html: string, resource: Resource): string {
  return html.replace(resource.url, resource.localPath || resource.url);
}

export function getOutputDir(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.hash.split('/');
    // 获取最后一个非空路径段
    const lastSegment = pathSegments.filter(segment => segment && segment !== '#').pop() || 'output';
    // 解码URL编码的字符
    return decodeURIComponent(lastSegment);
  } catch (error) {
    return 'output';
  }
}