/**
 * update router
 * 本地静态路由数据配置，该配置由开发人员维护
 * 路由菜单配置，数据格式必须遵循一下规则，否则请自定义修改
 * **** true false 也可以用 0 和 1 代替，必须为数值或者boolean ****
 * path					必填 请求路径
 * component		必填 组件路径，默认在views/目录下，但不用填写views/
 * auth					必填 是否授权登录可访问 默认true
 * isKeepAlive	是否缓存组件状态 默认true
 *
 * icon         菜单、tagsView 图标，阿里：加 `iconfont xxx`，fontawesome：加 `fa xxx`
 * title        必填 菜单栏及 tagsView 栏、菜单搜索名称（国际化）
 * type         菜单类型 1菜单 2目录
 * sort	  			排序 默认1
 * isHide   		是否隐藏，当前菜单 默认false
 * isDisable  	是否禁用 默认false
 * isLink   		是否超链接菜单与 isIframe 互斥 默认false
 * isIframe 		是否内嵌窗口与 isLink 互斥 默认false
 * address 			当 isLink isIframe两者为true时此项必填 默认
 *
 * isAffix  		是否固定在 tagsView 栏上 默认true
 * isMobile  		是否为手机端 默认false
 * roles    		判断是否有当前角色，仅仅当前端控制权限时，此项必须，不建议前端去搞这玩意
 * permission   当前操作权限[C,R,U,D]
 * children
 */

export default {
  menus: [
    {
      id: 1,
      path: 'login',
      component: 'login',
      type: 1,
      title: 'message.menu.home',
      icon: 'icon-home',
      auth: 1,
      isLink: 0,
      isIframe: 0,
      address: '',
      isHide: 0,
      isAffix: 1,
      isKeepAlive: 1,
      isDisable: 0,
      isMobile: 0,
      roles: ['admin', 'system'],
      permission: ['C', 'R', 'U', 'D'],
      children: []
    }
  ]
}
