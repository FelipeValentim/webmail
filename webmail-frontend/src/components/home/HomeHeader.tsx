import {
  faArchive,
  faArrowsRotate,
  faEllipsisVertical,
  faExclamationCircle,
  faFilter,
  faSortDown,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import RootState from "../../interfaces/RootState";
import { useDispatch, useSelector } from "react-redux";
import PaginationContainer from "../../containers/PaginationContainer";
import DropDownButton from "../../containers/DropDownButton";
import SearchQuery from "../../constants/default";
import Pagination from "../../interfaces/Pagination";
import { setSearch } from "../../redux/search";
import Button from "../../containers/Button";
import Separator from "../../containers/Separator";
import { MessageAPI } from "../../services/MessageAPI";
import SendDataMessages from "../../interfaces/SendDataMessages";
import { toast } from "react-toastify";
import { removeMessages } from "../../redux/dataMessages";
import { setTotalEmails } from "../../redux/selectedFolder";
import { FolderAPI } from "../../services/FolderAPI";
import DropDownHoverButton from "../../containers/DropDownHoverButton";

interface HomeHeaderProps {
  setSelectedMessages: (selectedMessages: number[]) => void;
  selectedMessages: number[]; // O tipo correto para selectedMessages
  pagination: Pagination;
  setPagination: (pagination: Pagination) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  setSelectedMessages,
  selectedMessages,
  pagination,
  setPagination,
}) => {
  const [validating, setValidating] = React.useState(false);
  const dispatch = useDispatch();
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );
  const folders = useSelector((state: RootState) => state.folders);
  const search = useSelector((state: RootState) => state.search);
  const dataMessages = useSelector((state: RootState) => state.dataMessages);

  const setSelection = () => {
    if (
      selectedMessages.length >= 0 &&
      selectedMessages.length !== dataMessages?.messages.length
    ) {
      setSelectedMessages(dataMessages.messages.map((x) => x.uniqueId.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const spamMessages = async () => {
    if (!validating) {
      try {
        setValidating(true);

        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: selectedMessages,
        };
        const { data } = await MessageAPI.spamMessages(sendDataMessages);

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

        const countMessages: number =
          dataMessages.countMessages - selectedMessages.length;
        console.log(dataMessages.countMessages, selectedMessages.length);
        dispatch(setTotalEmails(countMessages));

        dispatch(removeMessages(selectedMessages));

        setSelectedMessages([]);
      } finally {
        setValidating(false);
      }
    }
  };

  const moveMessages = async (folder: string) => {
    if (!validating) {
      try {
        setValidating(true);

        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: selectedMessages,
          type: folder,
        };
        const { data } = await FolderAPI.moveMessages(sendDataMessages);

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

        const countMessages: number =
          dataMessages.countMessages - selectedMessages.length;

        dispatch(setTotalEmails(countMessages));

        dispatch(removeMessages(selectedMessages));

        setSelectedMessages([]);
      } finally {
        setValidating(false);
      }
    }
  };

  const deleteMessages = async () => {
    if (!validating) {
      try {
        setValidating(true);
        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: selectedMessages,
        };

        const { data } = await FolderAPI.deleteMessages(sendDataMessages);

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

        const countMessages: number =
          dataMessages.countMessages - selectedMessages.length;

        dispatch(setTotalEmails(countMessages));

        dispatch(removeMessages(selectedMessages));

        setSelectedMessages([]);
      } finally {
        setValidating(false);
      }
    }
  };

  const archiveMessages = async () => {
    if (!validating) {
      try {
        setValidating(true);
        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: selectedMessages,
        };

        const { data } = await FolderAPI.archiveMessages(sendDataMessages);

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

        const countMessages: number =
          dataMessages.countMessages - selectedMessages.length;

        dispatch(setTotalEmails(countMessages));

        dispatch(removeMessages(selectedMessages));

        setSelectedMessages([]);
      } finally {
        setValidating(false);
      }
    }
  };

  return (
    <div className="home-header">
      <div className="options">
        <div className="select">
          <input
            onChange={setSelection}
            onClick={(event) => event.stopPropagation()}
            checked={selectedMessages.length > 0}
            title="Selecionar"
            className={
              selectedMessages.length !== dataMessages?.messages.length
                ? "select inderteminate"
                : "select"
            }
            type="checkbox"
          />
          <DropDownButton className="btn-secondary dropdown" icon={faSortDown}>
            <ul>
              <li onClick={() => setSelectedMessages([])}>Nenhum</li>
              <li
                onClick={() =>
                  setSelectedMessages(
                    dataMessages.messages.map((x) => x.uniqueId.id)
                  )
                }
              >
                Todos
              </li>
              <li
                onClick={() =>
                  setSelectedMessages(
                    dataMessages.messages
                      .filter((x) => x.seen)
                      .map((x) => x.uniqueId.id)
                  )
                }
              >
                Lidos
              </li>
              <li
                onClick={() =>
                  setSelectedMessages(
                    dataMessages.messages
                      .filter((x) => !x.seen)
                      .map((x) => x.uniqueId.id)
                  )
                }
              >
                Não lidos
              </li>
              <li
                onClick={() =>
                  setSelectedMessages(
                    dataMessages.messages
                      .filter((x) => x.flagged)
                      .map((x) => x.uniqueId.id)
                  )
                }
              >
                Favoritos
              </li>
              <li
                onClick={() =>
                  setSelectedMessages(
                    dataMessages.messages
                      .filter((x) => !x.flagged)
                      .map((x) => x.uniqueId.id)
                  )
                }
              >
                Não favoritos
              </li>
            </ul>
          </DropDownButton>
        </div>
        <Button
          className="btn-secondary"
          onClick={() => setPagination({ ...pagination })}
          icon={faArrowsRotate}
        />

        <DropDownButton className="btn-secondary" icon={faFilter}>
          <ul>
            <li
              className={
                search.query === SearchQuery.All ? "active" : "desactive"
              }
              onClick={() =>
                dispatch(setSearch({ ...search, query: SearchQuery.All }))
              }
            >
              Todos
            </li>
            <li
              className={
                search.query === SearchQuery.Seen ? "active" : "desactive"
              }
              onClick={() =>
                dispatch(setSearch({ ...search, query: SearchQuery.Seen }))
              }
            >
              Lidos
            </li>
            <li
              className={
                search.query === SearchQuery.NotSeen ? "active" : "desactive"
              }
              onClick={() =>
                dispatch(setSearch({ ...search, query: SearchQuery.NotSeen }))
              }
            >
              Não lidos
            </li>
            <li
              className={
                search.query === SearchQuery.Flagged ? "active" : "desactive"
              }
              onClick={() =>
                dispatch(setSearch({ ...search, query: SearchQuery.Flagged }))
              }
            >
              Favoritos
            </li>
            <li
              className={
                search.query === SearchQuery.NotAnswered
                  ? "active"
                  : "desactive"
              }
              onClick={() =>
                dispatch(
                  setSearch({ ...search, query: SearchQuery.NotAnswered })
                )
              }
            >
              Não respondidos
            </li>
          </ul>
        </DropDownButton>

        <DropDownButton className="btn-secondary" icon={faEllipsisVertical}>
          <ul>
            <DropDownHoverButton text="Mover para">
              <ul>
                {folders.map(({ name, path }) =>
                  selectedFolder.path == path ? (
                    <li
                      className="disabled"
                      title="Email já se encontra nessa pasta"
                    >
                      {name}
                    </li>
                  ) : (
                    <li onClick={() => moveMessages(path)}>{name}</li>
                  )
                )}
              </ul>
            </DropDownHoverButton>
          </ul>
        </DropDownButton>
        {selectedMessages.length > 0 && (
          <>
            <Separator height={18} />

            <Button
              className="btn-secondary"
              icon={faTrash}
              title="Deletar"
              onClick={deleteMessages}
            />
            <Button
              className="btn-secondary"
              icon={faExclamationCircle}
              title="Spam"
              onClick={spamMessages}
            />
            <Button
              className="btn-secondary"
              icon={faArchive}
              title="Arquivar"
              onClick={archiveMessages}
            />
          </>
        )}
      </div>
      <PaginationContainer
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        onPageChange={(newPage) =>
          setPagination({ ...pagination, page: newPage })
        }
        count={selectedFolder?.totalEmails ?? 0}
        previousLabel="Anterior"
        nextLabel="Próximo"
      />
    </div>
  );
};

export default HomeHeader;
