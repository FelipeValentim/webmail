import {
  faArrowsRotate,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
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
  selectedMessages,
  page,
  rowsPerPage,
  setPage,
}) => {
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  return (
    <div className="home-header">
      <div className="options">
        <div className="select">
          <input title="Selecionar" className="select" type="checkbox" />
          <span>
            <FontAwesomeIcon icon={faSortDown} />
          </span>
        </div>
        <span>
          <FontAwesomeIcon icon={faArrowsRotate} />
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
