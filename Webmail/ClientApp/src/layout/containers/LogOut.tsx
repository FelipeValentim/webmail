import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/user";
import { removeUser } from "../../helpers/storage";

const LogOut = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  function logOut() {
    removeUser();
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
