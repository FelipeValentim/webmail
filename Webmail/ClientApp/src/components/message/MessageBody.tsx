import React from "react";

interface MessageBodyProps {
  content: string;
}

const MessageBody: React.FC<MessageBodyProps> = ({ content }) => {
  return (
    <div className="message-body w-100 h-100">
      <iframe
        className="w-100 h-100"
        frameBorder="0"
        title="message"
        srcDoc={content}
      ></iframe>
    </div>
  );
};

export default MessageBody;
