import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, ReactNode, FC } from "react";

interface DropDownHoverButtonProps {
  children: ReactNode;
  text?: string;
  place?: "left" | "right" | "up" | "down";
  className?: string;
}

const DropDownHoverButton: FC<DropDownHoverButtonProps> = ({
  children,
  text,
  place = "right",
  className = "",
}) => {
  const [popup, setPopup] = useState(false);

  return (
    <div
      className={`btn btn-hover popup-container ${place} ${className}`}
      onMouseEnter={() => setPopup(true)}
    >
      {text}
      {popup && <div className="popup">{children}</div>}
    </div>
  );
};

export default DropDownHoverButton;
