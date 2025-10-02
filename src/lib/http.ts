import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// 定义响应数据结构
interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
}

// 创建请求配置接口
interface RequestConfig extends AxiosRequestConfig {
  loading?: boolean; // 是否显示loading
  showError?: boolean; // 是否显示错误提示
}

class HttpRequest {
  private instance: AxiosInstance;
  private pendingRequests = new Map<string, AbortController>();

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.setupInterceptors();
  }

  // 设置拦截器
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 处理重复请求
        const requestKey = this.getRequestKey(config);
        if (this.pendingRequests.has(requestKey)) {
          const controller = this.pendingRequests.get(requestKey);
          controller?.abort();
        }
        const controller = new AbortController();
        config.signal = controller.signal;
        this.pendingRequests.set(requestKey, controller);

        // 添加token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ResponseData>) => {
        // 请求完成后，删除pending请求
        const requestKey = this.getRequestKey(response.config);
        this.pendingRequests.delete(requestKey);
        
        const { code, data, message } = response.data;
        
        // 这里可以根据业务需求处理不同的状态码
        if (code === 200) {
          return data;
        } else {
          return Promise.reject(new Error(message || '请求失败'));
        }
      },
      (error: AxiosError) => {
        // 请求失败后，删除pending请求
        if (error.config) {
          const requestKey = this.getRequestKey(error.config);
          this.pendingRequests.delete(requestKey);
        }

        if (error.response) {
          // 处理HTTP错误状态码
          switch (error.response.status) {
            case 401:
              // 处理未授权
              this.handleUnauthorized();
              break;
            case 404:
              error.message = '请求的资源不存在';
              break;
            case 500:
              error.message = '服务器错误';
              break;
            default:
              error.message = `连接错误${error.response.status}`;
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应
          error.message = '服务器无响应';
        } else {
          // 请求配置出错
          error.message = '请求配置错误';
        }

        return Promise.reject(error);
      }
    );
  }

  // 生成请求唯一标识
  private getRequestKey(config: AxiosRequestConfig): string {
    const { method, url, params, data } = config;
    return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
  }

  // 处理未授权情况
  private handleUnauthorized() {
    // 清除token
    localStorage.removeItem('token');
    // 可以跳转到登录页
    window.location.href = '/login';
  }

  // GET请求
  public get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }

  // POST请求
  public post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  // PUT请求
  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  // DELETE请求
  public delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config);
  }

  // PATCH请求
  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.patch(url, data, config);
  }
}

// 创建请求实例
const http = new HttpRequest({
//   baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  baseURL: "http://127.0.0.1:5000/",
  timeout: 30000,
//   headers: {
//     'Content-Type': 'application/json'
//   }
});

export default http;
