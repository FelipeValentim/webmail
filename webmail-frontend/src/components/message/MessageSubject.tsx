interface MessageSubjectProps {
  subject: string;
}

const MessageSubject: React.FC<MessageSubjectProps> = ({ subject }) => {
  return (
    <div id="message-subject">
      <span className="subject">{subject}</span>
    </div>
  );
};

export default MessageSubject;
