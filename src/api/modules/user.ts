import Axios from '@/plugins/axios'
// import AxiosConfig from '@/config/axiosConfig'

const userApi = {
  loginUser: `admincenter-dev/v1/tenant/info/bindUrl`
}

export default {
  loginUser: (data: any = {}) => {
    return Axios({
      url: userApi.loginUser,
      method: 'get',
      data
    })
  }
}
