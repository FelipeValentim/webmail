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
import RicTextEditor from "../../components/RichTextEditor/RichTextEditor";
import Button from "../../containers/Button";
import { InputTags } from "../../containers/Fields";

const Sidebar = () => {
  const [modal, setModal] = React.useState(false);
  const [addresses, setAddresses] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("");
  const folders = useSelector((state: RootState) => state.folders);
  const dispatch = useDispatch();
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  const handleClickOutside = (event) => {
    if (
      event.target === event.currentTarget &&
      window.getSelection()?.toString() === ""
    ) {
      setModal(false); // Fecha a modal apenas se o clique ocorrer no elemento de bloqueio (fora da modal)
    }
  };

  return (
    <React.Fragment>
      {modal && (
        <div className="modal" onClick={handleClickOutside}>
          <div className="modal-wrapper">
            <div className="modal-header">
              <span className="title">Nova mensagem</span>
              <Button
                component={<FontAwesomeIcon icon={faXmark} />}
                className="btn-secondary"
                onClick={() => setModal(false)}
              />
            </div>
            <div className="modal-body">
              <form>
                <div className="input-group">
                  <div className="form-control">
                    <label htmlFor="to">Destinatários</label>
                    {/* <input placeholder="Para" id="to"></input> */}
                    <InputTags
                      value={addresses}
                      addTag={(value) => setAddresses([...addresses, value])}
                      deleteTag={(_, i) =>
                        setAddresses(
                          addresses.filter((tag, index) => index !== i)
                        )
                      }
                    />
                  </div>

                  <div className="form-control">
                    <label htmlFor="subject">Assunto</label>
                    <input placeholder="Seu assunto" id="subject"></input>
                  </div>

                  <div className="form-control">
                    <label htmlFor="to">Mensagem</label>

                    <RicTextEditor data={message} setData={setMessage} />
                  </div>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <Button
                icon={false}
                component={
                  <span className="d-flex align-items-center gap-0-5">
                    Enviar <FontAwesomeIcon icon={faShare} />
                  </span>
                }
                title="Enviar"
                onClick={() => console.log(message)}
                className="btn-primary mt-2"
              />
            </div>
          </div>
        </div>
      )}
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
