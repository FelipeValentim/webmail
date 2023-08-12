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
import HomeHeader from "../../../components/home/HomeHeader";

const Index = () => {
  const [selectedMessages, setSelectedMessages] = React.useState<Array<number>>(
    []
  );
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(30);

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
          {
            FolderName: selectedFolder.path,
            Page: page,
            RowsPerPage: rowsPerPage,
          },
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

  const onSelectedMessage = (id: number) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(selectedMessages.filter((x) => x != id));
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  return (
    <div className="home-messages">
      <HomeHeader selectedMessages={selectedMessages} />
      <ScrollableContent updater={[dataMessages]}>
        {dataMessages && !loading ? (
          dataMessages.messages.map(
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
                  checked={selectedMessages.includes(uniqueId.id)}
                  onChange={() => onSelectedMessage(uniqueId.id)}
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
          )
        ) : (
          <div className="loading" />
        )}
      </ScrollableContent>
    </div>
  );
};

export default Index;
