import React from "react";
import { NavLink, useParams } from "react-router-dom";
import MessageHeader from "../../../components/message/MessageHeader";
import { Suspense } from "react";
import { useSelector } from "react-redux";
import RootState from "../../../interfaces/RootState";
import Message from "../../../interfaces/Message";
import { MessageAPI } from "../../../services/MessageAPI";
import MessageBody from "../../../components/message/MessageBody";
import MessageSubject from "../../../components/message/MessageSubject";
import MessageSender from "../../../components/message/MessageSender";

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
          <div className="message">
            <MessageSubject subject={message.subject} />
            <MessageSender
              fromAddresses={message.fromAddresses}
              toAddresses={message.toAddresses}
              date={message.date}
              uniqueId={message.uniqueId}
              folderName={params.folder}
              content={message.content}
              subject={message.subject}
              isDraft={message.isDraft}
              flagged={message.flagged}
            />
            <MessageBody content={message.content} />
          </div>
        ) : (
          <div className="loading" />
        )}
      </div>
    </Suspense>
  );
};

export default Index;
