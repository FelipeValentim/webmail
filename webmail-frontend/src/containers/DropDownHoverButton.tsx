import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, ReactNode, FC } from "react";

interface DropDownHoverButtonProps {
  children: ReactNode;
  component?: ReactNode;
  place?: "left" | "right" | "up" | "down";
  className?: string;
}

const DropDownHoverButton: FC<DropDownHoverButtonProps> = ({
  children,
  component,
  place = "right",
  className = "",
}) => {
  const [popup, setPopup] = useState(false);

  return (
    <div
      className={`btn btn-hover popup-container ${place} ${className}`}
      onMouseEnter={() => setPopup(true)}
      onMouseLeave={() => setPopup(false)}
    >
      {component}
      {popup && <div className="popup">{children}</div>}
    </div>
  );
};

export default DropDownHoverButton;
