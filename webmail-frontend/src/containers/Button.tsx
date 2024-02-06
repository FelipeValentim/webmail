import React, { FC } from "react";

interface ButtonProps {
  component: React.ReactNode;
  icon?: boolean;
  label?: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  title?: string;
}

const Button: FC<ButtonProps> = ({
  component,
  icon = true,
  className = "",
  onClick,
  title,
  ...props
}) => {
  return (
    <div
      className={`btn${icon ? " btn-icon" : ""} ${className}`}
      onClick={onClick}
      title={title}
      {...props}
    >
      {component}
    </div>
  );
};

export default Button;
