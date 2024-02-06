import React from "react";
import Button from "../../containers/Button";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

const MessageHeader = () => {
  const navigate = useNavigate();

  const goBack = () => {
    // navigate(`/#${encodeURIComponent(selectedFolder.path)}`);
    navigate(-1);
  };

  return (
    <div className="home-header">
      <div className="options">
        <Button
          onClick={goBack}
          className="btn-secondary"
          title="Voltar"
          component={<FontAwesomeIcon icon={faArrowLeftLong} />}
        />
      </div>
    </div>
  );
};

export default MessageHeader;
