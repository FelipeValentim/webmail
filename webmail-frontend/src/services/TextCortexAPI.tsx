import { AxiosResponse } from "axios";
import api from "./configs/axiosConfig";
import { defineCancelApiObject } from "./configs/axiosUtils";

export const TextCortexAPI = {
  correct: async function (
    text: string,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/textcortex/correct`,
      method: "POST",
      data: text,
      signal: cancel
        ? cancelApiObject[this.correct.name].handleRequestCancellation().signal
        : undefined,
    });
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(TextCortexAPI);
