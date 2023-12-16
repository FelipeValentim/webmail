export function defineCancelApiObject(apiObject: Record<string, any>) {
  // an object that will contain a cancellation handler
  // associated with each API property name in the apiObject API object
  const cancelApiObject: Record<
    string,
    { handleRequestCancellation: () => AbortController }
  > = {};

  // each property in the apiObject API layer object
  // is associated with a function that defines an API call

  // this loop iterates over each API property name
  Object.getOwnPropertyNames(apiObject).forEach((apiPropertyName) => {
    const cancellationControllerObject = {
      controller: undefined as AbortController | undefined,
    };

    // associating the request cancellation handler with the API property name
    cancelApiObject[apiPropertyName] = {
      handleRequestCancellation: () => {
        // if the controller already exists,
        // cancel the request
        if (cancellationControllerObject.controller) {
          // cancel the request and return this custom message
          cancellationControllerObject.controller.abort();
        }

        // generate a new controller
        // with the AbortController factory
        cancellationControllerObject.controller = new AbortController();

        return cancellationControllerObject.controller!;
      },
    };
  });

  return cancelApiObject;
}
