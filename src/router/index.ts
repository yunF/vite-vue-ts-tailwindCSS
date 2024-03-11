import { createRouter, createWebHistory, RouteRecordName, RouteRecordRaw } from 'vue-router'
import { getStoreRefs, appStore } from '@/stores'
import { baseRoutes } from './router'
// import Utils from '@/plugins/utils'
import RouterConfig from '@/config/routerConfig'
import RouteData from '@/config/routerData'
import AxiosCancel from '@/plugins/axios/cancel'
import Storage from '@/plugins/utils/storage'
import Constants from '@/plugins/constants'
import Cookie from '@/plugins/utils/cookie'
// import NProgress from '@/plugins/loading/progress'
// import api from '@/api'
// import { setupLayouts } from 'virtual:generated-layouts';
// import generatedRoutes from 'virtual:generated-pages';

declare interface MenuState {
  path: string
  component: string
  name: string
  title: string
  icon?: string
  auth: boolean | number
  isLink?: boolean | number
  isIframe?: boolean | number
  address?: string
  isHide?: boolean | number
  sort?: number
  isKeepAlive?: boolean | number
  isAffix?: boolean | number
  isDisable?: boolean | number
  isMobile?: boolean | number
  roles?: string[]
  permission?: string[]
  children?: MenuState[]
}

// const routes = setupLayouts(generatedRoutes)
const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes,
  strict: false,
  // 切换页面，滚动到最顶部
  scrollBehavior: () => ({ left: 0, top: 0 })
})

// 路由加载前
router.beforeEach(async (to, from, next) => {
  // NProgress.start()
  // Storage.setLocalStorage(Constants.storageKey.routerPrev, from.path)
  // Storage.setLocalStorage(Constants.storageKey.routerNext, to.path)
  // 取消所有请求
  AxiosCancel.removeAllCancel()
  const token = Storage.getSessionStorage(Constants.storageKey.token) || Cookie.getCookie(Constants.cookieKey.token)
  if (RouterConfig.whiteList.includes(to.path) && !token) {
    next()
  } else {
    if (!token || token === 'undefined') {
      Storage.removeSessionStorage(Constants.storageKey.token)
      Cookie.removeCookie(Constants.cookieKey.token)
      next(`${RouterConfig.routeLogin}?redirect=${to.path}&params=${JSON.stringify(to.query ? to.query : to.params)}`)
    } else if (token && (RouterConfig.whiteList.includes(to.path) || to.path === RouterConfig.routeRoot)) {
      next(RouterConfig.routeHome)
    } else {
      let requestData: any = []
      const { routerList } = getStoreRefs(appStore.useRouterList)
      if (routerList.value.length === 0) {
        // 从后端接口中重新获取数据，如果数据格式变化，直接写一个公共方法去转义即可
        //   const { data } = await api.systemApi.getMenuList({})
        //   requestData = data.list || []

        // 本地路由
        requestData = RouteData.menus
        // 后端控制路由：路由数据初始化，防止刷新时丢失
        await getDynamicRouter(requestData)
        // 动态添加路由：防止非首页刷新时跳转回首页的问题
        // 确保 addRoute() 时动态添加的路由已经被完全加载上去
        next({ ...to, replace: true })
      } else {
        appStore.useUserInfo.setUserInfo(to.meta)
        next()
      }
    }
  }
})

// 路由加载后，关闭loading
router.afterEach(() => {
  // NProgress.done()
})

const viewsModules: any = import.meta.glob('../views/**/**.{vue,tsx}')
const dynamicViewsModules: Record<string, Function> = Object.assign({}, { ...viewsModules })

// 获取动态路由数据
export async function getDynamicRouter(requestData: any) {
  if (!(Storage.getSessionStorage(Constants.storageKey.token) || Cookie.getCookie(Constants.cookieKey.token))) return false

  await appStore.useRouterList.setMenuList(requestData)

  await setAddRoute(requestData)
}

// 动态添加至路由中
export async function setAddRoute(data: any[]) {
  const routerList = getRouter(data)
  routerList.forEach((route: RouteRecordRaw) => {
    const { name } = route
    if (name !== '/') {
      router.removeRoute(<RouteRecordName>name)
    }
    router.addRoute(route)
  })
  await setRouterList(routerList)
}

// 存储原始数据
async function setRouterList(data: any[]) {
  await appStore.useRouterList.setRouterList(data)
}

/**
 * update router
 * @param data
 */
function getRouter(data: MenuState[] = []) {
  if (data.length === 0) return []
  let rootRouter: Array<RouteRecordRaw> = [
    {
      path: '/',
      name: '/',
      redirect: { path: '' },
      component: () => import('@/layouts/index.vue'),
      meta: { title: 'message.title.home', name: 'message.title.home', auth: false, isHide: false },
      children: []
    }
  ]
  let addRouters: any = []
  setRouterItem(addRouters, data, '')
  rootRouter[0].children = routeToComponent(addRouters)
  rootRouter[0].children = [...rootRouter[0].children]
  return rootRouter
}
/**
 * update router
 */
function setRouterItem(routerList: any, data: MenuState[] = [], parentPath: string = '') {
  if (data.length === 0) return []
  data.forEach((item: any) => {
    let path = parentPath + '/' + item.path
    let name = item.component.slice(item.component.lastIndexOf('/') + 1)
    let route: RouteRecordRaw = {
      path: path,
      name: path.replace('/', '-') + '-' + name,
      component: item.component,
      meta: {
        title: item.title,
        icon: item.icon,
        auth: item.auth || false,
        sort: item.sort || 1,
        isLink: item.isLink || false,
        isIframe: item.isIframe || false,
        address: item.address || '',
        isHide: item.isHide || false,
        isKeepAlive: item.isKeepAlive || false,
        isAffix: item.isAffix || false,
        isDisable: item.isDisable || false,
        isMobile: item.isMobile || false,
        roles: item.roles || [],
        permission: item.permission || []
      }
    }
    if (item.children && item.children.length) {
      // 当访问的路由是含有子节点的路由，并且子节点非菜单，那么重定向
      routerList.push(route)
      setRouterItem(routerList, item.children, path)
    } else {
      routerList.push(route)
    }
  })
}

function routeToComponent(routes: any[]) {
  if (!routes) return []
  return routes.map((item: any) => {
    if (item.component) item.component = componentImport(dynamicViewsModules, item.component as string)
    item.children && routeToComponent(item.children)
    return item
  })
}

function componentImport(viewsModule: Record<string, Function>, component: string) {
  const keys = Object.keys(viewsModule)
  const matchKeys = keys.filter((key) => {
    const k = key.replace(/..\/views|../, '')
    return k.startsWith(`${component}`) || k.startsWith(`/${component}`)
  })
  if (matchKeys?.length === 1) {
    const matchKey = matchKeys[0]
    return viewsModule[matchKey]
  }
  if (matchKeys?.length > 1) {
    return false
  }
}

export default router
