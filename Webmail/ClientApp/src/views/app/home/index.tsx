import React from "react";
import { NavLink } from "react-router-dom";

const index = () => {
  return (
    <div>
      <NavLink to="/message">Ir para Message</NavLink>
    </div>
  );
};

export default index;
