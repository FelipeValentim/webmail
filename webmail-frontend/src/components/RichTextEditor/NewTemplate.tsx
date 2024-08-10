import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faShare, faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "../../containers/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../Modal";
import Template from "../../interfaces/Template";
import { uuidv4 } from "../../helpers/generator";
import TemplateErrors from "../../interfaces/TemplateErrors";
import { addTemplate } from "../../helpers/storage";

interface NewTemplateProps {
  templates: Template[];
  setTemplates: (template: Template[]) => void;
}

const NewTemplate: React.FC<NewTemplateProps> = ({
  templates,
  setTemplates,
}) => {
  const defaultTemplate: Template = {
    guid: uuidv4(),
    title: "",
    text: "",
    favorite: false,
  };

  const [modal, setModal] = React.useState(false);
  const [template, setTemplate] = React.useState<Template>({
    ...defaultTemplate,
  });
  const saveTemplate = () => {
    if (!template.text || !template.title) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        title: !template.title ? "Título é obrigatório" : undefined,
        text: !template.text ? "Texto é obrigatória" : undefined,
      }));
    } else {
      addTemplate(template);

      setTemplates([...templates, template]);

      setTemplate({
        ...defaultTemplate,
      });

      setModal(false);
    }
  };
  const [errors, setErrors] = React.useState<TemplateErrors>({
    text: undefined,
    title: undefined,
  });

  return (
    <>
      <Button
        className="btn-secondary"
        onClick={() => setModal(true)}
        component={<FontAwesomeIcon icon={faPlus} />}
      />
      <Modal toggleModal={() => setModal(!modal)} modal={modal} nested>
        <ModalHeader>
          <span className="title">Novo template</span>
          <Button
            component={<FontAwesomeIcon icon={faXmark} />}
            className="btn-secondary"
            onClick={() => setModal(false)}
          />
        </ModalHeader>
        <ModalBody>
          <form>
            <div className="input-group">
              <div className="form-control">
                <label htmlFor="title">Título</label>
                <input
                  placeholder="Seu título"
                  id="title"
                  type="text"
                  value={template.title}
                  onChange={(event) =>
                    setTemplate({ ...template, title: event.target.value })
                  }
                ></input>
                {errors.title && (
                  <div className="invalid-feedback d-block">{errors.title}</div>
                )}
              </div>
              <div className="form-control">
                <label htmlFor="text">Texto</label>
                <textarea
                  placeholder="Seu texto"
                  id="text"
                  value={template.text}
                  onChange={(event) =>
                    setTemplate({ ...template, text: event.target.value })
                  }
                ></textarea>
                {errors.text && (
                  <div className="invalid-feedback d-block">{errors.text}</div>
                )}
              </div>
            </div>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button
            icon={false}
            component={
              <span className="d-flex align-items-center gap-0-5 color-light-color-bg">
                Salvar <FontAwesomeIcon icon={faShare} />
              </span>
            }
            title="Enviar"
            onClick={saveTemplate}
            className="btn-primary mt-2 position-relative"
          ></Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default NewTemplate;
