import {
  faArrowsRotate,
  faEllipsisVertical,
  faFilter,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import RootState from "../../interfaces/RootState";
import { useSelector } from "react-redux";
import Pagination from "../../containers/Pagination";
import DropDownButton from "../../containers/DropDownButton";

interface HomeHeaderProps {
  setSelectedMessages: (selectedMessages: number[]) => void;
  selectedMessages: number[]; // O tipo correto para selectedMessages
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  setSelectedMessages,
  selectedMessages,
  page,
  rowsPerPage,
  setPage,
}) => {
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  const dataMessages = useSelector((state: RootState) => state.dataMessages);

  const setSelection = () => {
    console.log(selectedMessages.length);
    console.log(dataMessages?.messages.length);
    if (
      selectedMessages.length >= 0 &&
      selectedMessages.length !== dataMessages?.messages.length
    ) {
      setSelectedMessages(dataMessages.messages.map((x) => x.uniqueId.id));
    } else {
      setSelectedMessages([]);
    }
  };

  return (
    <div className="home-header">
      <div className="options">
        <div className="select">
          <input
            checked={selectedMessages.length > 0}
            onClick={setSelection}
            title="Selecionar"
            className={
              selectedMessages.length !== dataMessages?.messages.length
                ? "select inderteminate"
                : "select"
            }
            type="checkbox"
          />
          <DropDownButton className="btn-secondary" icon={faSortDown}>
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
        <span className="btn-secondary">
          <FontAwesomeIcon icon={faArrowsRotate} />
        </span>
        <span className="btn-secondary">
          <FontAwesomeIcon icon={faFilter} />
        </span>
        <span className="btn-secondary">
          <FontAwesomeIcon icon={faEllipsisVertical} />
        </span>
      </div>
      <Pagination
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(newPage) => setPage(newPage)}
        count={selectedFolder?.totalEmails ?? 0}
        previousLabel="Anterior"
        nextLabel="Próximo"
      />
    </div>
  );
};

export default HomeHeader;
