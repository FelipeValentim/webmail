import { AxiosResponse } from "axios";
import MessageFilter from "../interfaces/MessageFilter";
import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";
import SendDataMessages from "../interfaces/SendDataMessages";

export const MessageAPI = {
  getAll: async function (
    messageFilter: MessageFilter,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/message/get`,
      method: "POST",
      data: messageFilter,
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.getAll.name].handleRequestCancellation().signal
        : undefined,
    });
  },
  get: async function (
    folder: string,
    id: string,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/message/${folder}/${id}`,
      method: "GET",
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.get.name].handleRequestCancellation().signal
        : undefined,
    });
  },
  spamMessages: async function (
    sendDataMessages: SendDataMessages,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/message/spammessages`,
      method: "PUT",
      data: sendDataMessages,
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.spamMessages.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(MessageAPI);
