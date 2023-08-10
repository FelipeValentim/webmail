import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import { defaultTheme } from "../../constants/default";
import { darkMode, lightMode } from "../../redux/themeSwitch";
import { setTheme } from "../../helpers/storage";
import React from "react";
import RootState from "../../interfaces/RootState";

const HeaderSwitch = () => {
  const themeSwitch = useSelector((state: RootState) => state.themeSwitch);
  const dispatch = useDispatch();

  function changeTheme() {
    if (themeSwitch === defaultTheme) {
      dispatch(darkMode());
      setTheme("dark-theme");
    } else {
      dispatch(lightMode());
      setTheme("light-theme");
    }
  }

  React.useEffect(() => {
    document.body.className = "";
    document.body.classList.add(themeSwitch);
  }, [themeSwitch]);

  return (
    <div className="dark-mode-switch d-flex">
      <input
        checked={themeSwitch !== defaultTheme}
        onChange={changeTheme}
        title="Modo escuro/claro"
        type="checkbox"
        id="darkmode-toggle"
      />
      <label htmlFor="darkmode-toggle">
        <FontAwesomeIcon className="sun" icon={faSun} />
        <FontAwesomeIcon className="moon" icon={faMoon} />
      </label>
    </div>
  );
};

export default HeaderSwitch;
