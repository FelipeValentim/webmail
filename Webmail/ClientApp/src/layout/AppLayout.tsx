import React from "react";
import Header from "./containers/Header";
import Sidebar from "./containers/Sidebar";
import Footer from "./containers/Footer";

const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <Sidebar />
      <main>
        <div className="container-fluid">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
