import { AxiosResponse } from "axios";
import User from "../interfaces/User";
import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";

export const UserAPI = {
  login: async function (user: User, cancel = false): Promise<AxiosResponse> {
    return api.request({
      url: `/user/login`,
      method: "POST",
      data: { ...user },
      signal: cancel
        ? cancelApiObject[this.login.name].handleRequestCancellation().signal
        : undefined,
    });
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(UserAPI);
