import React from "react";
import {
  faPen,
  faShare,
  faX,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import RootState from "../../interfaces/RootState";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setReturning } from "../../redux/pagination";
import NewEmail from "../../components/NewEmail";

const Sidebar = () => {
  const [modal, setModal] = React.useState(false);
  const folders = useSelector((state: RootState) => state.folders);
  const dispatch = useDispatch();
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  return (
    <React.Fragment>
      <NewEmail modal={modal} setModal={setModal} />
      <nav className="app-sidebar">
        {folders ? (
          <React.Fragment>
            <div className="btn-main" onClick={() => setModal(true)}>
              <FontAwesomeIcon icon={faPen} />
              Novo e-email
            </div>
            <div className="folders mt-1">
              <ul>
                {folders.map(({ name, path, unread }) => (
                  <Link
                    className={
                      path.toLowerCase() === selectedFolder?.path.toLowerCase()
                        ? "active"
                        : ""
                    }
                    to={`/#${encodeURIComponent(path.toLowerCase())}`}
                    key={path}
                    onClick={() => dispatch(setReturning(false))}
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
    </React.Fragment>
  );
};

export default Sidebar;
