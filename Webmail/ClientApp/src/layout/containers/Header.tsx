import React from "react";
import logo from "assets/logo/logo_app.svg";
import logomarca from "assets/logo/logomarca_app.svg";
import { faSearch, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import HeaderSwitch from "./HeaderSwitch";
import LogOut from "./LogOut";
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
        <FontAwesomeIcon className="settings" icon={faSliders} />
      </div>
      <div className="d-flex align-items-center gap-3">
        <HeaderSwitch />
        <LogOut />
      </div>
    </header>
  );
};

export default Header;
