import axios, { AxiosError } from "axios";
import { httpStatus } from "../../constants/default";

// initializing the axios instance with custom configs
const api = axios.create({
  withCredentials: true,
  baseURL: "/",
});

const errorHandler = (error: AxiosError) => {
  const statusCode = error.response?.status;

  // logging only errors that are not 401
  if (statusCode && statusCode !== httpStatus.unauthorized) {
    console.error(error);
  }

  return Promise.reject(error);
};

// registering the custom error handler to the
// "api" axios instance
api.interceptors.response.use(undefined, (error) => {
  return errorHandler(error);
});

export default api;
