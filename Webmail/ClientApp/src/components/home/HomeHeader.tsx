import {
  faArrowsRotate,
  faChevronLeft,
  faChevronRight,
  faEllipsisVertical,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const HomeHeader = ({ selectedMessages }) => {
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
      <div className="pagination">
        <div>1-50</div>
        <span>
          <FontAwesomeIcon icon={faChevronLeft} />
        </span>
        <span>
          <FontAwesomeIcon icon={faChevronRight} />
        </span>
      </div>
    </div>
  );
};

export default HomeHeader;
