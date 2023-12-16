import React from "react";
import { NavLink, useParams } from "react-router-dom";
import MessageHeader from "../../../components/message/MessageHeader";
import { Suspense } from "react";
import api from "../../../api";
import { useSelector } from "react-redux";
import RootState from "../../../interfaces/RootState";
import Message from "../../../interfaces/Message";
import axios, { CancelTokenSource } from "axios";

type MessageParams = {
  folder: string;
  uniqueid: string;
};

const Index = () => {
  let cancelTokenSource: CancelTokenSource;
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<Message>();

  const { token } = useSelector((state: RootState) => state.user);
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  const params = useParams<MessageParams>();

  React.useEffect(() => {
    const getMessage = async () => {
      try {
        setLoading(true);

        // MessageAPI.get(selectedFolder.path, params.uniqueid);

        const response = await api.get(
          `message/${selectedFolder.path}/${params.uniqueid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cancelToken: cancelTokenSource.token,
          }
        );

        const data: Message = response.data;
        console.log(data);
        setMessage(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    cancelTokenSource = axios.CancelToken.source();

    if (selectedFolder) {
      getMessage();
    }

    return () => {
      cancelTokenSource.cancel("Cancelled due to stale request");
    };
  }, [selectedFolder]);

  return (
    <Suspense fallback={<div className="loading" />}>
      <MessageHeader />
      {message && <>teste</>}
      <NavLink to="/">Ir para homee</NavLink>
    </Suspense>
  );
};

export default Index;
