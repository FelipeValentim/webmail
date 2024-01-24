import React from "react";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../../../interfaces/RootState";
import { setMessages } from "../../../redux/dataMessages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";
import ScrollableContent from "../../../containers/ScrollableContent";
import HomeHeader from "../../../components/home/HomeHeader";
import DataMessages from "../../../interfaces/DataMessages";
import Pagination from "../../../interfaces/Pagination";
import { setSelectedFolder } from "../../../redux/selectedFolder";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageAPI } from "../../../services/MessageAPI";
import MessageFilter from "../../../interfaces/MessageFilter";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedMessages, setSelectedMessages] = React.useState<Array<number>>(
    []
  );
  const [pagination, setPagination] = React.useState<Pagination>({
    page: 0,
    rowsPerPage: 30,
  });

  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const dataMessages = useSelector((state: RootState) => state.dataMessages);
  const search = useSelector((state: RootState) => state.search);

  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  React.useEffect(() => {
    if (!location.hash) {
      navigate("/#inbox");
    }
  }, [location, navigate]);

  React.useEffect(() => {
    setPagination({ ...pagination, page: 0 });
    setSelectedMessages([]);
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

    if (selectedFolder) getMessages();

    return () => {
      isMounted = false;
    };
  }, [pagination]);

  const onSelectedMessage = (id: number) => {
    if (selectedMessages.includes(id)) {
      setSelectedMessages(selectedMessages.filter((x) => x != id));
    } else {
      setSelectedMessages([...selectedMessages, id]);
    }
  };

  return (
    <div className="main-content">
      <HomeHeader
        setSelectedMessages={setSelectedMessages}
        selectedMessages={selectedMessages}
        pagination={pagination}
        setPagination={setPagination}
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
              <Link
                key={uniqueId.id}
                to={`/${encodeURIComponent(selectedFolder.path)}/${
                  uniqueId.id
                }`}
              >
                <li className={seen ? "read" : ""}>
                  <input
                    title="Selecionar"
                    className="select"
                    type="checkbox"
                    onChange={() => onSelectedMessage(uniqueId.id)}
                    checked={selectedMessages.includes(uniqueId.id)}
                    onClick={(event) => event.stopPropagation()}
                  ></input>
                  {flagged ? (
                    <FontAwesomeIcon
                      className="flag flagged"
                      icon={starSolid}
                    />
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
              </Link>
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
