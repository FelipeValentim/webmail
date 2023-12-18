import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Address from "../../interfaces/Address";
import UniqueId from "../../interfaces/UniqueId";
import { faReply, faSortDown } from "@fortawesome/free-solid-svg-icons";
import Button from "../../containers/Button";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import DropDownButton from "../../containers/DropDownButton";
import { toast } from "react-toastify";

interface MessageSubjectProps {
  toAddresses: Address[];
  fromAddresses: Address[];
  date: string;
  subject: string;
  uniqueId: UniqueId;
  isDraft: boolean;
  content: string;
  folderName: string;
  flagged: boolean;
}

const MessageSender: React.FC<MessageSubjectProps> = ({
  toAddresses,
  fromAddresses,
  date,
  subject,
  uniqueId,
  folderName,
  content,
  isDraft,
  flagged,
}) => {
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);

    toast.success(`${type} copiado com sucesso`);
  };

  return (
    <div id="message-sender">
      <div className="sender">
        <div className="info">
          <div className="from-picture">
            <span>
              {fromAddresses[0].name
                ? fromAddresses[0].name[0].toUpperCase()
                : fromAddresses[0].address[0].toUpperCase()}
            </span>
          </div>
          <div className="from-name">{fromAddresses[0].name}</div>
          <div className="from-address">&lt;{fromAddresses[0].address}&gt;</div>
          <div className="to-address">
            <DropDownButton
              className="btn-secondary dropdown"
              icon={faSortDown}
            >
              <ul>
                <li
                  onClick={() =>
                    copyToClipboard(`${fromAddresses[0].address}`, "Remetente")
                  }
                >
                  De:{" "}
                  <b>
                    {fromAddresses[0].name
                      ? `${fromAddresses[0].name} <${fromAddresses[0].address}>`
                      : fromAddresses[0].address}
                  </b>
                </li>
                <li
                  onClick={() =>
                    copyToClipboard(
                      `${toAddresses.map(({ address }) => address)}`,
                      "Destinatário"
                    )
                  }
                >
                  Para:{" "}
                  {toAddresses.map(({ address, name }, index) => (
                    <React.Fragment key={index}>
                      {name ? `${name} <${address}>` : address}
                      <br></br>
                    </React.Fragment>
                  ))}
                </li>
                <li onClick={() => copyToClipboard(subject, "Assunto")}>
                  Assunto: {subject}
                </li>
              </ul>
            </DropDownButton>
          </div>
        </div>
      </div>

      <div className="side-info">
        <div className="date">{date}</div>
        <div className="flag">
          {flagged ? (
            <FontAwesomeIcon className="flag flagged" icon={starSolid} />
          ) : (
            <FontAwesomeIcon className="flag" icon={starRegular} />
          )}
        </div>
        <div className="reply">
          <Button className="btn-secondary" title="Responder" icon={faReply} />
        </div>
      </div>
    </div>
  );
};

export default MessageSender;
