import React from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../../api";
import RootState from "../../../interfaces/RootState";
import { setMessages } from "../../../redux/dataMessages";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as starRegular } from "@fortawesome/free-regular-svg-icons";
import { faStar as starSolid } from "@fortawesome/free-solid-svg-icons";
import ScrollableContent from "../../../containers/ScrollableContent";
import HomeHeader from "../../../components/home/HomeHeader";
import axios, { CancelTokenSource } from "axios";
import DataMessages from "../../../interfaces/DataMessages";
import Pagination from "../../../interfaces/Pagination";
import { setSelectedFolder } from "../../../redux/selectedFolder";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Index = () => {
  let cancelTokenSource: CancelTokenSource;
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
  const { token } = useSelector((state: RootState) => state.user);
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
    const getFolders = async () => {
      try {
        setLoading(true);

        const response = await api.post(
          "webmail/emails",
          {
            FolderName: selectedFolder.path,
            Page: pagination.page,
            RowsPerPage: pagination.rowsPerPage,
            SearchQuery: search.query,
            SearchText: search.text,
            SearchParams: search.params,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cancelToken: cancelTokenSource.token,
          }
        );

        const data: DataMessages = response.data;
        dispatch(setMessages(data));

        dispatch(
          setSelectedFolder({
            ...selectedFolder,
            totalEmails: data.countMessages,
          })
        );

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    cancelTokenSource = axios.CancelToken.source();

    if (selectedFolder) getFolders();

    return () => {
      cancelTokenSource.cancel("Cancelled due to stale request");
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
    <div className="home-messages">
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
                    checked={selectedMessages.includes(uniqueId.id)}
                    onChange={() => onSelectedMessage(uniqueId.id)}
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
