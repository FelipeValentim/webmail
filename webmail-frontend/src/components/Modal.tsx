import React, { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  toggleModal: () => void;
  modal: boolean;
  nested?: boolean;
}

interface ModalGenericProps {
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  children,
  toggleModal,
  modal,
  nested = false,
}) => {
  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget &&
      window.getSelection()?.toString() === ""
    ) {
      toggleModal(); // Fecha a modal apenas se o clique ocorrer no elemento de bloqueio (fora da modal)
    }
  };

  return (
    modal && (
      <div
        className={nested ? "modal nested" : "modal"}
        onClick={handleClickOutside}
      >
        <div className="modal-wrapper">{children}</div>
      </div>
    )
  );
};

const ModalHeader: React.FC<ModalGenericProps> = ({ children }) => {
  return <div className="modal-header">{children}</div>;
};

const ModalBody: React.FC<ModalGenericProps> = ({ children }) => {
  return <div className="modal-body">{children}</div>;
};

const ModalFooter: React.FC<ModalGenericProps> = ({ children }) => {
  return <div className="modal-footer">{children} </div>;
};

export { Modal, ModalHeader, ModalBody, ModalFooter };
