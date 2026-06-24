// 平台 / 厂商展示元数据（标签 + 圆点色），与设计稿配色一致
export interface PlatformMeta {
  label: string
  color: string
}

const MAP: Record<string, PlatformMeta> = {
  anthropic: { label: 'claude', color: '#D8362C' },
  claude: { label: 'claude', color: '#D8362C' },
  openai: { label: 'gpt', color: '#14C28A' },
  gpt: { label: 'gpt', color: '#14C28A' },
  gemini: { label: 'gemini', color: '#2A6FDB' },
  google: { label: 'gemini', color: '#2A6FDB' }
}

export function platformMeta(platform?: string | null): PlatformMeta {
  if (!platform) return { label: '其他', color: '#1A1A1A' }
  return MAP[platform.toLowerCase()] || { label: platform, color: '#1A1A1A' }
}
