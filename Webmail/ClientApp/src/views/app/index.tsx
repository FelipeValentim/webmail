import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";

const index = () => {
  return (
    <React.Fragment>
      <AppLayout>
        <Suspense fallback={<div className="loading" />}>
          <Outlet />
        </Suspense>
      </AppLayout>
    </React.Fragment>
  );
};

export default index;
