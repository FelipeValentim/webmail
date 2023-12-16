import Address from "./Address";
import Attachment from "./Attachment";

interface Message {
  uniqueId: { id: number; isValid: boolean; validity: number };
  content: string;
  subject: string;
  date: string;
  hasAttachment: boolean;
  seen: boolean;
  isSent: boolean;
  flagged: boolean;
  fromAddresses: Array<Address>;
  toAddresses: Array<Address>;
  attachments: Array<Attachment>;
}

export default Message;
