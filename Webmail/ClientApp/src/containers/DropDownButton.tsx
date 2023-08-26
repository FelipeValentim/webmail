import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect, useRef, ReactNode, FC } from "react";

interface DropDownButtonProps {
  children: ReactNode;
  icon?: IconDefinition;
  label?: string;
  className?: string;
}

const DropDownButton: FC<DropDownButtonProps> = ({
  children,
  icon,
  label,
  className = "",
}) => {
  const ref = useRef<HTMLDivElement | null>(null); // Criando uma ref para o elemento popup
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current &&
        event.target instanceof Node &&
        !ref.current.contains(event.target)
      ) {
        setPopup(false);
      }
    };

    // Adicionando o event listener no montagem do componente
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Removendo o event listener ao desmontar o componente
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`btn popup-container ${className}`}
      onClick={() => setPopup(!popup)}
      ref={ref}
    >
      {icon && <FontAwesomeIcon icon={icon} />}
      {label}
      {popup && <div className="popup">{children}</div>}
    </div>
  );
};

export default DropDownButton;
