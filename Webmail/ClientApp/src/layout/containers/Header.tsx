import React from "react";
import logo from "assets/logo/logo_app.svg";
import logomarca from "assets/logo/logomarca_app.svg";
import { faSearch, faGear } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const Header = () => {
  return (
    <header className="app-header">
      <div className="logos">
        <img src={logo} alt="" />
        <img src={logomarca} alt="" />
      </div>
      <div className="search-bar">
        <FontAwesomeIcon className="search" icon={faSearch} />
        <input placeholder="Pesquisar" type="text"></input>
        <FontAwesomeIcon className="settings" icon={faGear} />
      </div>
      <div>
        <div>switch</div>
      </div>
    </header>
  );
};

export default Header;
