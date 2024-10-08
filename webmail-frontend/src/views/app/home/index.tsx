import React from "react";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../../../interfaces/RootState";
import {
  setMessages,
  setSeenMessages,
  toggleFlag,
} from "../../../redux/dataMessages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";
import ScrollableContent from "../../../containers/ScrollableContent";
import HomeHeader from "../../../components/home/HomeHeader";
import DataMessages from "../../../interfaces/DataMessages";
import { setSelectedFolder } from "../../../redux/selectedFolder";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageAPI } from "../../../services/MessageAPI";
import MessageFilter from "../../../interfaces/MessageFilter";
import SendDataMessage from "../../../interfaces/SendDataMessage";
import { toast } from "react-toastify";
import SelectedMessage from "../../../interfaces/SelectedMessage";
import { setPagination } from "../../../redux/pagination";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedMessages, setSelectedMessages] = React.useState<
    Array<SelectedMessage>
  >([]);

  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const dataMessages = useSelector((state: RootState) => state.dataMessages);
  const search = useSelector((state: RootState) => state.search);
  const pagination = useSelector((state: RootState) => state.pagination);

  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  React.useEffect(() => {
    if (!location.hash) {
      navigate("/#inbox");
    }
  }, [location, navigate]);

  React.useEffect(() => {
    if (!pagination.returning) {
      dispatch(setPagination({ ...pagination, page: 0 }));
      setSelectedMessages([]);
    }
  }, [selectedFolder?.path, search.query, search.text]);

  React.useEffect(() => {
    setSelectedMessages([]);
  }, [pagination]);

  React.useEffect(() => {
    let isMounted = true;
    const getMessages = async () => {
      try {
        setLoading(true);

        const filter: MessageFilter = {
          folderName: selectedFolder.path,
          page: pagination.page,
          rowsPerPage: pagination.rowsPerPage,
          searchQuery: search.query,
          searchText: search.text,
          searchParams: search.params,
        };

        const response = await MessageAPI.getAll(filter, true);

        const data: DataMessages = response.data;
        dispatch(setMessages(data));

        dispatch(
          setSelectedFolder({
            ...selectedFolder,
            totalEmails: data.countMessages,
          })
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (selectedFolder && !pagination.returning) getMessages();

    return () => {
      isMounted = false;
    };
  }, [pagination]);

  const onSelectedMessage = (selectedMessage: SelectedMessage) => {
    if (selectedMessages.some((x) => x.id == selectedMessage.id)) {
      setSelectedMessages(
        selectedMessages.filter((x) => x.id != selectedMessage.id)
      );
    } else {
      setSelectedMessages([...selectedMessages, { ...selectedMessage }]);
    }
  };

  const handleToggleFlagged = async (
    e: MouseEvent,
    id: number,
    type: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const sendDataMessage: SendDataMessage = {
      folder: selectedFolder.path,
      id: id,
      type: type,
    };

    dispatch(toggleFlag({ id, type }));

    const { data } = await MessageAPI.flaggedMessage(sendDataMessage, true);

    toast.success(data, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <div className="main-content">
      <HomeHeader
        setSelectedMessages={setSelectedMessages}
        selectedMessages={selectedMessages}
      />
      <ScrollableContent updater={[dataMessages]}>
        {dataMessages && !loading ? (
          dataMessages.messages.map(
            ({
              content,
              flagged,
              date,
              seen,
              subject,
              toAddresses,
              uniqueId,
            }) => (
              <li
                onClick={() => {
                  dispatch(
                    setSeenMessages({ ids: [uniqueId.id], type: "seen" })
                  );

                  navigate(
                    `/${encodeURIComponent(
                      selectedFolder.path.toLowerCase()
                    )}/${uniqueId.id}`
                  );
                }}
                key={uniqueId.id}
                className={seen ? "read" : ""}
              >
                <input
                  title="Selecionar"
                  className="select"
                  type="checkbox"
                  onChange={() =>
                    onSelectedMessage({ id: uniqueId.id, flagged, seen })
                  }
                  checked={selectedMessages.some((x) => x.id == uniqueId.id)}
                  onClick={(event) => event.stopPropagation()}
                ></input>
                {flagged ? (
                  <FontAwesomeIcon
                    className="flag flagged"
                    icon={starSolid}
                    onClick={(e) =>
                      handleToggleFlagged(e, uniqueId.id, "unflagged")
                    }
                  />
                ) : (
                  <FontAwesomeIcon
                    className="flag"
                    icon={starRegular}
                    onClick={(e) =>
                      handleToggleFlagged(e, uniqueId.id, "flagged")
                    }
                  />
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
