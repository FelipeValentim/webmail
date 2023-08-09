import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { removeAccessToken } from "../../helpers/storage";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/user";

const LogOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  function logOut() {
    removeAccessToken();
    dispatch(logoutUser());
    navigate("/login");
  }

  return (
    <div className="logout" onClick={() => logOut()}>
      <FontAwesomeIcon icon={faRightFromBracket} />
    </div>
  );
};

export default LogOut;
