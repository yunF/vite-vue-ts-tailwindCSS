import { RouteRecordRaw } from 'vue-router'

export const baseRoutes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'root',
    redirect: { name: 'login' },
    meta: {
      title: 'message.title.login',
      name: 'message.title.login',
      auth: false,
      isHide: true
    },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/login.vue'),
        meta: {
          title: 'message.title.login',
          name: 'message.title.login',
          auth: false,
          isHide: true
        }
      }
    ]
  }
]

export default [...baseRoutes]
