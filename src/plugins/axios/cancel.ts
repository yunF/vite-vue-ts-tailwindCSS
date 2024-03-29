import axios, { AxiosRequestConfig, Canceler } from 'axios'
import qs from 'qs'
import { isFunction } from '@/plugins/utils/is'

const axiosCancel: any = {}
let cancelMap = new Map<string, Canceler>()

function getPending(config: AxiosRequestConfig): string {
  return [config.url, config.method, qs.stringify(config.data), qs.stringify(config.params)].join('&')
}

axiosCancel.addCancel = (config: AxiosRequestConfig) => {
  // 防止重复请求
  axiosCancel.removeCancel(config)
  const key = getPending(config)
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
      if (!cancelMap.has(key)) {
        cancelMap.set(key, cancel)
      }
    })
}
axiosCancel.removeCancel = (config: AxiosRequestConfig) => {
  const key = getPending(config)
  if (cancelMap.has(key)) {
    const cancel = cancelMap.get(key)
    cancel && cancel()
    cancelMap.delete(key)
  }
}
axiosCancel.removeAllCancel = () => {
  cancelMap.forEach((cancel) => {
    cancel && isFunction(cancel) && cancel()
  })
  cancelMap.clear()
}

export default axiosCancel
