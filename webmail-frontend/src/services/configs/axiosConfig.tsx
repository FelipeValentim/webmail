import axios, { AxiosError } from "axios";
import { httpStatus } from "../../constants/default";
import { removeUser } from "../../helpers/storage";
import store from "../../redux/configureStore";
import { logoutUser } from "../../redux/user";
import { toast } from "react-toastify";

// initializing the axios instance with custom configs
const api = axios.create({
  withCredentials: true,
  baseURL: "https://localhost:5000",
});

const errorHandler = async (error: AxiosError) => {
  const statusCode = error.response?.status;
  // logging only errors that are not 401
  if (statusCode && statusCode !== httpStatus.unauthorized) {
    if (typeof error.response?.data === "string") {
      const message: string = error.response?.data;
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  } else if (statusCode && statusCode === httpStatus.unauthorized) {
    removeUser();
    store.dispatch(logoutUser());
  }

  return Promise.reject(error);
};

// registering the custom error handler to the
// "api" axios instance
api.interceptors.response.use(undefined, (error) => {
  return errorHandler(error);
});

export default api;
