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
  summarize: async function (
    text: string,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/textcortex/summarize`,
      method: "POST",
      data: text,
      signal: cancel
        ? cancelApiObject[this.summarize.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  paraphrase: async function (
    text: string,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/textcortex/paraphrase`,
      method: "POST",
      data: text,
      signal: cancel
        ? cancelApiObject[this.paraphrase.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  autocomplete: async function (
    text: string,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/textcortex/autocomplete`,
      method: "POST",
      data: text,
      signal: cancel
        ? cancelApiObject[this.autocomplete.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
  suggestion: async function (
    text: string,
    cancel = false
  ): Promise<AxiosResponse> {
    return api.request({
      url: `/textcortex/suggestion`,
      method: "POST",
      data: text,
      signal: cancel
        ? cancelApiObject[this.suggestion.name].handleRequestCancellation()
            .signal
        : undefined,
    });
  },
};

// defining the cancel API object for ProductAPI
const cancelApiObject = defineCancelApiObject(TextCortexAPI);
