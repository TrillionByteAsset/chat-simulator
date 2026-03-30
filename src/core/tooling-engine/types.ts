// src/core/tooling-engine/types.ts

export type ToolRenderType = 'component' | 'page';

export interface ToolGEO {
  latitude?: string;
  longitude?: string;
  region?: string;
  placename?: string;
}

export interface ToolSEO {
  title: string;
  h1?: string;
  description: string;
  keywords?: string[];
  openGraph?: {
    images?: string[];
  };
}

export interface ToolNavItem {
  title: string;
  url: string;
  target?: string;
  icon?: string;
}

export interface ToolFooterGroup {
  title: string;
  items: ToolNavItem[];
}

export interface ToolHeader {
  logo?: string;
  nav?: ToolNavItem[];
}

export interface ToolFooter {
  groups?: ToolFooterGroup[];
}

export interface ToolUsage {
  title?: string;
  description?: string;
  content?: string;
}

export interface ToolPlatformRoadmap {
  title?: string;
  description?: string;
  content?: string;
}

export interface RecommendedTool {
  title: string;
  description: string;
  icon?: string;
  url: string;
  target?: string;
}

export interface ToolRecommendations {
  title?: string;
  description?: string;
  tools: RecommendedTool[];
}

export interface ToolManifest {
  name: string;
  version: string;
  type: ToolRenderType;
  entry: string;
  config: {
    skin_preset: string;
    supported_skins: string[];
    [key: string]: any;
  };
  seo: ToolSEO;
  geo?: ToolGEO;
  header?: ToolHeader;
  footer?: ToolFooter;
  usage?: ToolUsage;
  platformRoadmap?: ToolPlatformRoadmap;
  recommendations?: ToolRecommendations;
}
