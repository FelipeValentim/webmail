import React from "react";
import { NavLink, useParams } from "react-router-dom";
import MessageHeader from "../../../components/message/MessageHeader";
import { Suspense } from "react";
import api from "../../../api";
import { useSelector } from "react-redux";
import RootState from "../../../interfaces/RootState";
import Message from "../../../interfaces/Message";

type MessageParams = {
  folder: string;
  uniqueid: string;
};

const Index = () => {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<Message>();

  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  const params = useParams<MessageParams>();

  React.useEffect(() => {
    const getMessage = async () => {
      try {
        setLoading(true);

        // MessageAPI.get(selectedFolder.path, params.uniqueid);

        // const data: Message = response.data;
        // setMessage(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    if (selectedFolder) {
      getMessage();
    }
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
