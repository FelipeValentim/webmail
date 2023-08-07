import React from "react";
import { Route, Routes } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";
const Message = React.lazy(() => import("./message/index"));
const Home = React.lazy(() => import("./home/index"));

const index = () => {
  return (
    <React.Fragment>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/message" element={<Message />} />
        </Routes>
      </AppLayout>
    </React.Fragment>
  );
};

export default index;
