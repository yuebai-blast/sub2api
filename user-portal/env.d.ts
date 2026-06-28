/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** 语言模式：AUTO=显示切换并自动检测；zh-CN/en-US=锁定该语言并隐藏切换 */
  readonly VITE_PORTAL_LOCALE?: 'AUTO' | 'zh-CN' | 'en-US'
  /** 分布卡片文案模式：MODEL=模型厂商分布（Claude/GPT/Gemini）；APPLICATION=应用类型分布（Text/Vision/Voice） */
  readonly VITE_PORTAL_DISTRIBUTION_MODE?: 'MODEL' | 'APPLICATION'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
