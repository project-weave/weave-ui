import axiosInstance, { AxiosRequestHeaders, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const axios = axiosInstance.create();

function camelToSnake(o: any): Record<string, any> {
  if (typeof o !== "object" || o === null) {
    return o;
  }
  if (Array.isArray(o)) {
    return o.map((item) => camelToSnake(item));
  }
  return Object.keys(o).reduce(
    (acc, key) => {
      const snakeKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
      acc[snakeKey] = camelToSnake(o[key]);
      return acc;
    },
    {} as Record<string, any>
  );
}

function snakeToCamel(o: any): Record<string, any> {
  if (typeof o !== "object" || o === null) {
    return o;
  }
  if (Array.isArray(o)) {
    return o.map((item) => snakeToCamel(item));
  }
  return Object.keys(o).reduce(
    (acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (match, group1) => group1.toUpperCase());
      acc[camelKey] = snakeToCamel(o[key]);
      return acc;
    },
    {} as Record<string, any>
  );
}

axios.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.data) {
      response.data = snakeToCamel(response.data);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.data) {
      config.data = camelToSnake(config.data);
    }
    config.headers = config.headers || ({} as AxiosRequestHeaders); // Add this line to ensure headers exist
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;
