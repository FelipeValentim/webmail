import React from "react";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api";
import RootState from "../../interfaces/RootState";
import { setFolders } from "../../redux/folders";
import Folder from "../../interfaces/Folder";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { token } = useSelector((state: RootState) => state.user);
  const folders = useSelector((state: RootState) => state.folders);
  const dispatch = useDispatch();

  React.useEffect(() => {
    const getFolders = async () => {
      try {
        const response = await api.get("webmail/folders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data: Array<Folder> = response.data;
        console.log(data);
        dispatch(setFolders(data));
      } catch (error) {
        console.error(error);
      }
    };

    if (!folders) getFolders();
  }, []);

  return (
    <nav className="app-sidebar">
      {folders ? (
        <React.Fragment>
          <div className="btn-icon">
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
