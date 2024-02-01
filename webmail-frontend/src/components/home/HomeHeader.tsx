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
import {
  removeMessages,
  setFlaggedMessages,
  setSeenMessages,
} from "../../redux/dataMessages";
import { setTotalEmails } from "../../redux/selectedFolder";
import { FolderAPI } from "../../services/FolderAPI";
import DropDownHoverButton from "../../containers/DropDownHoverButton";
import SelectedMessage from "../../interfaces/SelectedMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import { setPagination } from "../../redux/pagination";

interface HomeHeaderProps {
  setSelectedMessages: (selectedMessages: SelectedMessage[]) => void;
  selectedMessages: SelectedMessage[]; // O tipo correto para selectedMessages
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  setSelectedMessages,
  selectedMessages,
}) => {
  const [validating, setValidating] = React.useState(false);
  const dispatch = useDispatch();
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );
  const pagination = useSelector((state: RootState) => state.pagination);
  const folders = useSelector((state: RootState) => state.folders);
  const search = useSelector((state: RootState) => state.search);
  const dataMessages = useSelector((state: RootState) => state.dataMessages);

  const setSelection = () => {
    if (
      selectedMessages.length >= 0 &&
      selectedMessages.length !== dataMessages?.messages.length
    ) {
      setSelectedMessages(
        dataMessages.messages.map(({ uniqueId, seen, flagged }) => ({
          id: uniqueId.id,
          seen,
          flagged,
        }))
      );
    } else {
      setSelectedMessages([]);
    }
  };

  const spamMessages = async () => {
    if (!validating) {
      try {
        setValidating(true);

        const ids = selectedMessages.map((x) => x.id);

        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: ids,
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
        dispatch(setTotalEmails(countMessages));

        dispatch(removeMessages(ids));

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

        const ids = selectedMessages.map((x) => x.id);

        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: ids,
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

        dispatch(removeMessages(ids));

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

        const ids = selectedMessages.map((x) => x.id);

        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: ids,
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

        dispatch(removeMessages(ids));

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

        const ids = selectedMessages.map((x) => x.id);

        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: ids,
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

        dispatch(removeMessages(ids));

        setSelectedMessages([]);
      } finally {
        setValidating(false);
      }
    }
  };

  const seenMessages = async (type: string) => {
    if (!validating) {
      try {
        setValidating(true);

        const ids = selectedMessages.map((x) => x.id);

        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: ids,
          type: type,
        };

        await FolderAPI.seenMessages(sendDataMessages);

        dispatch(setSeenMessages({ ids, type }));

        setSelectedMessages([]);
      } finally {
        setValidating(false);
      }
    }
  };

  const flaggedMessages = async (type: string) => {
    if (!validating) {
      try {
        setValidating(true);
        const ids = selectedMessages.map((x) => x.id);

        const sendDataMessages: SendDataMessages = {
          folder: selectedFolder.path,
          ids: ids,
          type: type,
        };

        await FolderAPI.flaggedMessages(sendDataMessages);

        dispatch(setFlaggedMessages({ ids, type }));

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
                    dataMessages.messages.map(
                      ({ uniqueId, seen, flagged }) => ({
                        id: uniqueId.id,
                        seen,
                        flagged,
                      })
                    )
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
                      .map(({ uniqueId, seen, flagged }) => ({
                        id: uniqueId.id,
                        seen,
                        flagged,
                      }))
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
                      .map(({ uniqueId, seen, flagged }) => ({
                        id: uniqueId.id,
                        seen,
                        flagged,
                      }))
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
                      .map(({ uniqueId, seen, flagged }) => ({
                        id: uniqueId.id,
                        seen,
                        flagged,
                      }))
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
                      .map(({ uniqueId, seen, flagged }) => ({
                        id: uniqueId.id,
                        seen,
                        flagged,
                      }))
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
          onClick={() => dispatch(setPagination({ ...pagination }))}
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

        {selectedMessages.length > 0 && (
          <>
            <DropDownButton className="btn-secondary" icon={faEllipsisVertical}>
              <ul>
                <DropDownHoverButton
                  component={
                    <>
                      <span>Mover para</span>
                      <FontAwesomeIcon
                        className="right"
                        icon={faArrowRight}
                      ></FontAwesomeIcon>
                    </>
                  }
                >
                  <ul>
                    {folders.map(({ name, path }) =>
                      selectedFolder.path == path ? (
                        <li
                          key={path}
                          className="disabled"
                          title="Email já se encontra nessa pasta"
                        >
                          {name}
                        </li>
                      ) : (
                        <li key={path} onClick={() => moveMessages(path)}>
                          {name}
                        </li>
                      )
                    )}
                  </ul>
                </DropDownHoverButton>

                {selectedMessages.some((x) => !x.seen) && (
                  <li onClick={() => seenMessages("seen")}>
                    Marcar como lidos
                  </li>
                )}

                {selectedMessages.some((x) => x.seen) && (
                  <li onClick={() => seenMessages("unseen")}>
                    Marcar como não lidos
                  </li>
                )}

                {selectedMessages.some((x) => !x.flagged) && (
                  <li onClick={() => flaggedMessages("flagged")}>
                    Marcar como favoritos
                  </li>
                )}

                {selectedMessages.some((x) => x.flagged) && (
                  <li onClick={() => flaggedMessages("unflagged")}>
                    Marcar como não favoritos
                  </li>
                )}
              </ul>
            </DropDownButton>

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
          dispatch(
            setPagination({ ...pagination, page: newPage, returning: false })
          )
        }
        count={selectedFolder?.totalEmails ?? 0}
        previousLabel="Anterior"
        nextLabel="Próximo"
      />
    </div>
  );
};

export default HomeHeader;
