import { AxiosResponse } from "axios";
import MessageFilter from "../interfaces/MessageFilter";
import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";
import SendDataMessages from "../interfaces/SendDataMessages";
import SendDataMessage from "../interfaces/SendDataMessage";
import SendMessage from "../interfaces/SendMessage";

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
  flaggedMessage: async function (
    sendDataMessages: SendDataMessage,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/message/flagged`,
      method: "PUT",
      data: sendDataMessages,
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.flaggedMessage.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  send: async function (
    sendMessage: SendMessage,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/message/send`,
      method: "POST",
      data: sendMessage,
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.send.name].handleRequestCancellation().signal
        : undefined,
    });
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(MessageAPI);
