import { AxiosResponse } from "axios";
import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";
import SendDataMessages from "../interfaces/SendDataMessages";

export const FolderAPI = {
  getAll: async function (cancel = false): Promise<AxiosResponse> {
    return api.request({
      url: `/folder/get`,
      method: "GET",
      signal: cancel
        ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal
        : undefined,
    });
  },
  deleteMessages: async function (
    sendDataMessages: SendDataMessages,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/folder/deletemessages`,
      method: "DELETE",
      data: sendDataMessages,
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.deleteMessages.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  archiveMessages: async function (
    sendDataMessages: SendDataMessages,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/folder/archivemessages`,
      method: "PUT",
      data: sendDataMessages,
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.archiveMessages.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  moveMessages: async function (
    sendDataMessages: SendDataMessages,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/folder/movemessages`,
      method: "PUT",
      data: sendDataMessages,
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.moveMessages.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(FolderAPI);
