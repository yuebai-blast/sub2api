/**
 * Vitest 全局 setup：在每个测试文件加载之前运行。
 *
 * 问题：jsdom 的 navigator.language 默认为 "en-US"，导致 @/i18n 的 detectLocale()
 * 返回 "en-US"，i18n 单例以英文初始化，useLocaleStore 因此也以 en-US 初始化
 * （与测试预期 zh-CN 不符）。
 *
 * 修复：在 setup 文件（与测试文件共享同一模块缓存）里预先导入 i18n 单例，
 * 把 global.locale.value 强制重置为 zh-CN，使 useLocaleStore 创建时读到正确值。
 */
import i18n from '@/i18n'
import type { AppLocale } from '@/i18n'

i18n.global.locale.value = 'zh-CN' as AppLocale
