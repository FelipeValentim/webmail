import React, { Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!location.hash) {
      navigate("/#inbox");
    }
  }, [location, navigate]);

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

export default Index;
