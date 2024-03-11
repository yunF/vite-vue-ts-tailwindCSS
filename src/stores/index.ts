import { createPinia, storeToRefs } from 'pinia'

// 创建
const store = createPinia()

// 不必额外导入，直接使用此方法
export const getStoreRefs = (store: any) => {
  return storeToRefs(store)
}

// pinia.use(() => {
// 	return { testDysId: 1 };
// });

// 导出自定义其他状态文件
import { useUserInfo } from './modules/user'
import { useRouterList } from './modules/routerMeta'

export interface AppStore {
  useUserInfo: ReturnType<typeof useUserInfo>
  useRouterList: ReturnType<typeof useRouterList>
}

export const appStore: AppStore = {
  useUserInfo: useUserInfo(store),
  useRouterList: useRouterList(store)
} as AppStore

export default store
