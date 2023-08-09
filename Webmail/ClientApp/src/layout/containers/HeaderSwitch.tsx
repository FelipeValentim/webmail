import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

const HeaderSwitch = () => {
  return (
    <div className="dark-mode-switch d-flex">
      <input type="checkbox" id="darkmode-toggle" />
      <label htmlFor="darkmode-toggle">
        <FontAwesomeIcon className="sun" icon={faSun} />
        <FontAwesomeIcon className="moon" icon={faMoon} />
      </label>
    </div>
  );
};

export default HeaderSwitch;
