import Address from "./Address";

interface Message {
  uniqueId: string;
  content: string;
  subject: string;
  date: string;
  hasAttachment: boolean;
  seen: boolean;
  isSent: boolean;
  flagged: boolean;
  fromAddresses: Array<Address>;
  toAddresses: Array<Address>;
}

export default Message;
