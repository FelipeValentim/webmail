import React from "react";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import Button from "./Button";

interface PaginationProps {
  rowsPerPage: number;
  page: number;
  count: number;
  onPageChange: (newPage: number) => void;
  nextLabel: string;
  previousLabel: string;
}

const PaginationContainer: FC<PaginationProps> = ({
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
      <Button
        title={previousLabel}
        onClick={previousPage}
        component={<FontAwesomeIcon icon={faChevronLeft} />}
        className={page > 0 ? "active btn-secondary" : "disabled btn-secondary"}
      />
      <Button
        title={nextLabel}
        onClick={nextPage}
        component={<FontAwesomeIcon icon={faChevronRight} />}
        className={
          activeNext ? "active btn-secondary" : "disabled btn-secondary"
        }
      />
    </div>
  );
};

export default PaginationContainer;
