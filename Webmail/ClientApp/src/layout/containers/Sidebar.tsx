import React from "react";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RootState from "../../interfaces/RootState";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const folders = useSelector((state: RootState) => state.folders);
  return (
    <nav className="app-sidebar">
      {folders ? (
        <React.Fragment>
          <div className="btn-main">
            <FontAwesomeIcon icon={faPen} />
            Novo e-email
          </div>

          <div className="folders mt-1">
            <ul>
              {folders.map(({ name, path, unread }) => (
                <Link
                  className={
                    path.toLowerCase() ===
                    decodeURIComponent(location.hash).substring(1).toLowerCase()
                      ? "active"
                      : ""
                  }
                  to={`#${encodeURIComponent(path)}`}
                  key={path}
                >
                  <li>
                    <span className="folder-name">{name}</span>{" "}
                    <span className="folder-unread">{unread}</span>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
        </React.Fragment>
      ) : (
        <div className="loading" />
      )}
    </nav>
  );
};

export default Sidebar;
