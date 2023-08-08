import React from "react";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Sidebar = () => {
  return (
    <nav className="app-sidebar">
      <div className="btn-icon">
        <FontAwesomeIcon icon={faPen} />
        Novo e-email
      </div>

      <div className="folders mt-1">
        <ul>
          <li className="active">Caixa de entrada</li>
          <li>Com estrela</li>
          <li>Adiados</li>
          <li>Importante</li>
          <li>Enviados</li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
