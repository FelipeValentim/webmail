import React from "react";
import Button from "../containers/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { InputTags } from "../containers/Fields";
import {
  faFileLines,
  faLanguage,
  faList,
  faPen,
  faPenFancy,
  faShare,
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Errors from "../interfaces/Errors";
import SendMessage from "../interfaces/SendMessage";
import { AxiosResponse } from "axios";
import { MessageAPI } from "../services/MessageAPI";
import { toast } from "react-toastify";
import RichTextEditor from "./RichTextEditor/RichTextEditor";

const NewEmail = ({ modal, setModal }) => {
  const [addresses, setAddresses] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [validating, setValidating] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<Errors>({
    addresses: undefined,
    subject: undefined,
  });

  const handleClickOutside = (event) => {
    if (
      event.target === event.currentTarget &&
      window.getSelection()?.toString() === ""
    ) {
      setModal(false); // Fecha a modal apenas se o clique ocorrer no elemento de bloqueio (fora da modal)
    }
  };

  const checkAddresses = (tags: string[]) => {
    if (tags.length > 0) {
      setErrors({ ...errors, addresses: undefined });
    } else {
      setErrors({ ...errors, addresses: "Senha é obrigatório" });
    }
  };

  const checkSubject = (subject: string) => {
    if (subject.length > 0) {
      setSubject(subject);
      setErrors({ ...errors, subject: undefined });
    } else {
      setSubject("");
      setErrors({ ...errors, subject: "Assunto é obrigatório" });
    }
  };

  const sendMessage = async () => {
    if (validating) return;

    if (!subject || addresses.length == 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        addresses: addresses.length == 0 ? "Endereço é obrigatório" : undefined,
        subject: !subject ? "Assunto é obrigatória" : undefined,
      }));
    } else {
      setValidating(true);

      try {
        const user: SendMessage = {
          toAddresses: addresses,
          subject: subject,
          content: message,
        };
        const { data }: AxiosResponse = await MessageAPI.send(user);

        toast.success(data, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      } finally {
        setValidating(false);
      }
    }
  };

  return (
    modal && (
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
                    onChange={checkAddresses}
                  />
                  {errors.addresses && (
                    <div className="invalid-feedback d-block">
                      {errors.addresses}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label htmlFor="subject">Assunto</label>
                  <input
                    placeholder="Seu assunto"
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(event) => checkSubject(event.target.value)}
                  ></input>
                  {errors.subject && (
                    <div className="invalid-feedback d-block">
                      {errors.subject}
                    </div>
                  )}
                </div>

                <div className="form-control">
                  <label htmlFor="to">Mensagem</label>

                  <RichTextEditor data={message} setData={setMessage} />
                  <div className="ia-options">
                    <Button
                      className="btn-secondary"
                      title="Corrigir"
                      component={<FontAwesomeIcon icon={faWandMagicSparkles} />}
                    />
                    <Button
                      className="btn-secondary"
                      title="Autocomplementar"
                      component={<FontAwesomeIcon icon={faPen} />}
                    />
                    <Button
                      className="btn-secondary"
                      title="Paráfrase"
                      component={<FontAwesomeIcon icon={faFileLines} />}
                    />
                    <Button
                      className="btn-secondary"
                      title="Resumir"
                      component={<FontAwesomeIcon icon={faList} />}
                    />
                    <Button
                      className="btn-secondary"
                      title="Sugerir"
                      component={<FontAwesomeIcon icon={faPenFancy} />}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="modal-footer">
            <Button
              icon={false}
              component={
                <span className="d-flex align-items-center gap-0-5 color-light-color-bg">
                  Enviar <FontAwesomeIcon icon={faShare} />
                </span>
              }
              title="Enviar"
              onClick={sendMessage}
              className="btn-primary mt-2"
            />
          </div>
        </div>
      </div>
    )
  );
};

export default NewEmail;
