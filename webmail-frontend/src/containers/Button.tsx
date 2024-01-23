import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";

interface ButtonProps {
  icon?: IconDefinition;
  label?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  title?: string;
}

const Button: FC<ButtonProps> = ({
  icon,
  className = "",
  onClick,
  title,
  ...props
}) => {
  return (
    <div
      className={`btn btn-icon ${className}`}
      onClick={onClick}
      {...props}
      title={title}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
    </div>
  );
};

export default Button;
