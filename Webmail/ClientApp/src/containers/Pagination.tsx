import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";

interface PaginationProps {
  rowsPerPage: number;
  page: number;
  count: number;
  onPageChange: (newPage: number) => void;
  nextLabel: string;
  previousLabel: string;
}

const Pagination: FC<PaginationProps> = ({
  rowsPerPage,
  page,
  count,
  onPageChange,
  nextLabel,
  previousLabel,
}) => {
  const currentPage = rowsPerPage * (page + 1);

  const activeNext = rowsPerPage - (currentPage - count) > rowsPerPage;

  const nextPage = () => {
    if (activeNext) {
      onPageChange(page + 1);
    }
  };

  const previousPage = () => {
    if (page > 0) {
      onPageChange(page - 1);
    }
  };

  return (
    <div className="pagination">
      <div>
        {count > 0 ? rowsPerPage * page + 1 : count}-
        {activeNext ? currentPage : currentPage - (currentPage - count)} de{" "}
        {count}
      </div>
      <span
        title={previousLabel}
        onClick={previousPage}
        className={page > 0 ? "active" : "disabled"}
      >
        <FontAwesomeIcon icon={faChevronLeft} />
      </span>
      <span
        title={nextLabel}
        onClick={nextPage}
        className={activeNext ? "active" : "disabled"}
      >
        <FontAwesomeIcon icon={faChevronRight} />
      </span>
    </div>
  );
};

export default Pagination;
