export interface Resource {
  url: string;
  type: 'scripts' | 'styles';
  localPath?: string;
}

export interface ResourceMap {
  scripts: string[];
  styles: string[];
}