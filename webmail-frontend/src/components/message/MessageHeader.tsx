import Button from "../../containers/Button";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import RootState from "../../interfaces/RootState";
import { setReturning } from "../../redux/pagination";

const MessageHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );

  const goBack = () => {
    dispatch(setReturning(true));
    navigate(`/#${encodeURIComponent(selectedFolder.path)}`);
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
