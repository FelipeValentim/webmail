import React from "react";

interface MessageBodyProps {
  content: string;
  summary?: string | null;
}

const MessageBody: React.FC<MessageBodyProps> = ({ content, summary }) => {
  return (
    <div className="message-body">
      <iframe
        className="w-100 h-100"
        style={{ border: "none" }}
        title="message"
        srcDoc={summary ?? content}
      ></iframe>
    </div>
  );
};

export default MessageBody;
