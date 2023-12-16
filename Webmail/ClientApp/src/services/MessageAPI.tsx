import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";

export const MessageAPI = {
  get: async function (folder: string, id: number, cancel = false) {
    const response = await api.request({
      url: `/message/${folder}/${id}`,
      method: "GET",
      // retrieving the signal value by using the property name
      signal: cancel
        ? cancelApiObject[this.get.name].handleRequestCancellation().signal
        : undefined,
    });

    // returning the product returned by the API
    return response.data.product;
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(MessageAPI);
