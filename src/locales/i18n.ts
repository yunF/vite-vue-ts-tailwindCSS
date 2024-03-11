import { createI18n } from 'vue-i18n'
import messages from '@intlify/unplugin-vue-i18n/messages'

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages
})

// 以下两种方式均可以实现在js中动态国际化
export const $t = (args: string) => {
  return i18n.global.t(args)
}
export const useI18nMessage = (args: string) => {
  const { t } = useI18n()
  return t(args)
}

export default i18n
