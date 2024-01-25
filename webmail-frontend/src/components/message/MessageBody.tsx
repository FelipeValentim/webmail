import React from "react";

interface MessageBodyProps {
  content: string;
}

const MessageBody: React.FC<MessageBodyProps> = ({ content }) => {
  return (
    <div className="message-body">
      <iframe
        className="w-100 h-100"
        style={{ border: "none" }}
        title="message"
        srcDoc={content}
      ></iframe>
    </div>
  );
};

export default MessageBody;
