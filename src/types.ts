export interface Resource {
  url: string
  type: 'scripts' | 'styles' | 'prefetch'
  localPath?: string
}

export interface ResourceMap {
  scripts: string[]
  styles: string[]
  prefetch: string[]
}