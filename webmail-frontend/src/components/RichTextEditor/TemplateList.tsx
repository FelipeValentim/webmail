import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faXmark } from "@fortawesome/free-solid-svg-icons";
import Button from "../../containers/Button";
import { Modal, ModalBody, ModalHeader } from "../Modal";
import Template from "../../interfaces/Template";

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

  return (
    <>
      <Button
        className="btn-secondary"
        onClick={() => setModal(true)}
        component={<FontAwesomeIcon icon={faGear} />}
      />
      <Modal toggleModal={() => setModal(!modal)} modal={modal} nested>
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
            {templates.map(({ text, title, guid }) => (
              <li onClick={() => handleGenerateText(text)} key={guid}>
                {title}
              </li>
            ))}
          </ul>
        </ModalBody>
      </Modal>
    </>
  );
};

export default TemplateList;
