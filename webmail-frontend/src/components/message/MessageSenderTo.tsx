interface MessageSubjectProps {
  subject: string;
}

const MessageSenderTo: React.FC<MessageSubjectProps> = ({ subject }) => {
  return (
    <div id="message-subject">
      <span className="subject">{subject}</span>
    </div>
  );
};

export default MessageSenderTo;
