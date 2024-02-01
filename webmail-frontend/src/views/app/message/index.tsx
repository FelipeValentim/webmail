import React from "react";
import { NavLink, useParams } from "react-router-dom";
import MessageHeader from "../../../components/message/MessageHeader";
import { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../../../interfaces/RootState";
import Message from "../../../interfaces/Message";
import { MessageAPI } from "../../../services/MessageAPI";
import MessageBody from "../../../components/message/MessageBody";
import MessageSubject from "../../../components/message/MessageSubject";
import MessageSender from "../../../components/message/MessageSender";
import { toggleFlag } from "../../../redux/dataMessages";
import SendDataMessage from "../../../interfaces/SendDataMessage";

type MessageParams = {
  folder: string;
  uniqueid: string;
};

const Index = () => {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<Message | null>(null);
  const [validating, setValidating] = React.useState(false);
  const dispatch = useDispatch();

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

  const flaggedMessages = async (id: number, type: string) => {
    if (!validating) {
      try {
        setValidating(true);

        const sendDataMessage: SendDataMessage = {
          folder: selectedFolder.path,
          id: id,
          type: type,
        };

        await MessageAPI.flaggedMessage(sendDataMessage);

        dispatch(toggleFlag({ id, type }));

        if (message) setMessage({ ...message, flagged: type == "flagged" });
      } finally {
        setValidating(false);
      }
    }
  };

  return (
    <Suspense fallback={<div className="loading" />}>
      <div className="main-content">
        <MessageHeader />
        {message ? (
          <div className="message">
            <MessageSubject subject={message.subject} />
            <MessageSender
              uniqueId={message.uniqueId}
              fromAddresses={message.fromAddresses}
              toAddresses={message.toAddresses}
              date={message.date}
              folderName={params.folder}
              content={message.content}
              subject={message.subject}
              isDraft={message.isDraft}
              flagged={message.flagged}
              flaggedMessage={flaggedMessages}
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
