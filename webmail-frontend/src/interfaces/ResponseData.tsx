interface ResponseData {
  succeeded: boolean;
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any | null;
}

export default ResponseData;
