import logo from "assets/logo/logo_app.svg";
import logomarca from "assets/logo/logomarca_app.svg";

import HeaderSwitch from "./HeaderSwitch";
import LogOut from "./LogOut";
import HeaderSearchBar from "./HeaderSearchBar";
const Header = () => {
  return (
    <header className="app-header">
      <div className="logos">
        <img src={logo} alt="" />
        <img src={logomarca} alt="" />
      </div>
      <HeaderSearchBar />

      <div className="d-flex align-items-center gap-3">
        <HeaderSwitch />
        <LogOut />
      </div>
    </header>
  );
};

export default Header;
