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

interface HomeHeaderProps {
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
          <span>
            <FontAwesomeIcon icon={faSortDown} />
          </span>
        </div>
        <span>
          <FontAwesomeIcon icon={faArrowsRotate} />
        </span>
        <span>
          <FontAwesomeIcon icon={faFilter} />
        </span>
        <span>
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
