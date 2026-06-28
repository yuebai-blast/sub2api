/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** 语言模式：AUTO=显示切换并自动检测；zh-CN/en-US=锁定该语言并隐藏切换 */
  readonly VITE_PORTAL_LOCALE?: 'AUTO' | 'zh-CN' | 'en-US'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
