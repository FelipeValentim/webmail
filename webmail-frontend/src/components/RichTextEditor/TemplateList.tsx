import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGear,
  faStar,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as fastarOutline } from "@fortawesome/free-regular-svg-icons";
import Button from "../../containers/Button";
import { Modal, ModalBody, ModalHeader } from "../Modal";
import Template from "../../interfaces/Template";
import { removeTemplate, toggleFavorite } from "../../helpers/storage";

interface NewTemplateProps {
  templates: Template[];
  setTemplates: (template: Template[]) => void;
  generateText: (text: string) => void;
}

const TemplateList: React.FC<NewTemplateProps> = ({
  templates,
  setTemplates,
  generateText,
}) => {
  const [modal, setModal] = React.useState(false);

  const handleGenerateText = (text: string) => {
    setModal(false);
    generateText(text);
  };

  const handleRemoveTemplate = (guid: string) => {
    removeTemplate(guid);
    setTemplates(templates.filter((x) => x.guid !== guid));
  };

  const handleToggleFavoriteTemplate = (guid: string) => {
    toggleFavorite(guid);
    setTemplates(
      templates.map((template) =>
        template.guid == guid
          ? { ...template, favorite: !template.favorite }
          : template
      )
    );
  };

  return (
    <>
      <Button
        className="btn-secondary"
        onClick={() => setModal(true)}
        component={<FontAwesomeIcon icon={faGear} />}
      />
      <Modal
        classWrapper="w-75"
        toggleModal={() => setModal(!modal)}
        modal={modal}
        nested
      >
        <ModalHeader>
          <span className="title">Templates</span>
          <Button
            component={<FontAwesomeIcon icon={faXmark} />}
            className="btn-secondary"
            onClick={() => setModal(false)}
          />
        </ModalHeader>
        <ModalBody>
          <ul className="template-list">
            {templates.map(({ text, title, guid, favorite }) => (
              <li key={guid}>
                <span
                  className="title"
                  onClick={() => handleGenerateText(text)}
                >
                  {title}
                </span>
                <Button
                  icon={true}
                  onClick={() => handleRemoveTemplate(guid)}
                  className="btn-secondary"
                  component={<FontAwesomeIcon icon={faTrash} />}
                />
                <Button
                  icon={true}
                  onClick={() => handleToggleFavoriteTemplate(guid)}
                  className="btn-secondary"
                  component={
                    <FontAwesomeIcon icon={favorite ? faStar : fastarOutline} />
                  }
                />
              </li>
            ))}
          </ul>
        </ModalBody>
      </Modal>
    </>
  );
};

export default TemplateList;
