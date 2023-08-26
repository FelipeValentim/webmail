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
  label,
  className = "",
  onClick,
  title,
  ...props
}) => {
  return (
    <div
      className={`btn ${className}`}
      onClick={onClick}
      {...props}
      title={title}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      {label}
    </div>
  );
};

export default Button;
