import React from "react";
import { NavLink, useParams } from "react-router-dom";
import MessageHeader from "../../../components/message/MessageHeader";
import { Suspense } from "react";
import api from "../../../api";
import { useSelector } from "react-redux";
import RootState from "../../../interfaces/RootState";
import Message from "../../../interfaces/Message";
import { MessageAPI } from "../../../services/MessageAPI";

type MessageParams = {
  folder: string;
  uniqueid: string;
};

const Index = () => {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<Message | null>(null);

  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  const params = useParams<MessageParams>();

  React.useEffect(() => {
    const getMessage = async () => {
      try {
        setLoading(true);

        if (params.uniqueid) {
          const response = await MessageAPI.get(
            selectedFolder.path,
            params.uniqueid
          );
          console.log(response);

          const data: Message = response.data;
          setMessage(data);
        }
      } finally {
        setLoading(false);
      }
    };

    if (selectedFolder) {
      getMessage();
    }
  }, [selectedFolder]);

  return (
    <Suspense fallback={<div className="loading" />}>
      <div className="main-content">
        <MessageHeader />
        {message ? (
          <div>
            <iframe
              className="w-100 h-100"
              frameBorder="0"
              title="message"
              srcDoc={message.content}
            ></iframe>
          </div>
        ) : (
          <div className="loading" />
        )}
      </div>
    </Suspense>
  );
};

export default Index;
