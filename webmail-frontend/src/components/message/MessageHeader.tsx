import Button from "../../containers/Button";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RootState from "../../interfaces/RootState";

const MessageHeader = () => {
  const navigate = useNavigate();
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  const goBack = () => {
    navigate(`/#${encodeURIComponent(selectedFolder.path)}`, {
      state: { back: true },
    });
    // navigate(-1);
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
