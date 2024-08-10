import Address from "./Address";
import Attachment from "./Attachment";
import UniqueId from "./UniqueId";

interface Message {
  uniqueId: UniqueId;
  summary?: string;
  content: string;
  subject: string;
  date: string;
  hasAttachment: boolean;
  seen: boolean;
  isSent: boolean;
  isDraft: boolean;
  flagged: boolean;
  fromAddresses: Array<Address>;
  toAddresses: Array<Address>;
  attachments: Array<Attachment>;
}

export default Message;
