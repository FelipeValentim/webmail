import React, { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../api";
import Message from "../../../interfaces/Message";
import RootState from "../../../interfaces/RootState";
import { setMessages } from "../../../redux/dataMessages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";
import ScrollableContent from "../../../containers/ScrollableContent";

const Index = () => {
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const { token } = useSelector((state: RootState) => state.user);
  const dataMessages = useSelector((state: RootState) => state.dataMessages);

  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  React.useEffect(() => {
    console.log("teste");
    if (loading) return;

    const getFolders = async () => {
      try {
        setLoading(true);
        const response = await api.post(
          "webmail/emails",
          { FolderName: selectedFolder.path, Page: 0, RowsPerPage: 30 },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data: Array<Message> = response.data;
        dispatch(setMessages(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedFolder) getFolders();
  }, [selectedFolder]);

  return dataMessages ? (
    <ScrollableContent updater={[dataMessages]}>
      {dataMessages.messages.map(
        ({
          content,
          flagged,
          isDraft,
          isSent,
          date,
          seen,
          subject,
          toAddresses,
          uniqueId,
        }) => (
          <li className={seen ? "read" : ""} key={uniqueId.id}>
            <input
              title="Selecionar"
              className="select"
              type="checkbox"
            ></input>
            {flagged ? (
              <FontAwesomeIcon className="flag flagged" icon={starSolid} />
            ) : (
              <FontAwesomeIcon className="flag" icon={starRegular} />
            )}

            <span className="addresses">
              {toAddresses.map(({ name, address }, index) => (
                <span key={index}>
                  {name ? name : address}
                  {index != toAddresses.length - 1 ? ", " : ""}
                </span>
              ))}
            </span>
            <span className="subject">{subject}</span>
            <span className="content">{content}</span>
            <span className="time">{date}</span>
          </li>
        )
      )}
    </ScrollableContent>
  ) : null;
};

export default Index;
