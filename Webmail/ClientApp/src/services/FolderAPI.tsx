import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";

export const FolderAPI = {
  getAll: async function (cancel = false) {
    return api.request({
      url: `/folder/get`,
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal
        : undefined,
    });
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(FolderAPI);
