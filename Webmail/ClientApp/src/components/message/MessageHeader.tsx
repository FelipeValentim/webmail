import React from "react";
import Button from "../../containers/Button";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import RootState from "../../interfaces/RootState";
import { useSelector } from "react-redux";

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
          icon={faArrowLeftLong}
        />
      </div>
    </div>
  );
};

export default MessageHeader;
