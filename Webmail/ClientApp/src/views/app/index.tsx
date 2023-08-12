import React, { Suspense } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../../interfaces/RootState";
import { setSelectedFolder } from "../../redux/selectedFolder";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedFolder = useSelector(
    (state: RootState) => state.selectedFolder
  );
  const folders = useSelector((state: RootState) => state.folders);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (!location.hash) {
      navigate("/#inbox");
    }
  }, [location, navigate]);

  React.useEffect(() => {
    if (folders) {
      const folder = folders.find(
        (x) => x.path.toLowerCase() === location.hash.substring(1).toLowerCase()
      );
      dispatch(setSelectedFolder(folder));
    }
    // dispatch(setSelectedFolder());
  }, [location, folders, selectedFolder, dispatch]);

  React.useEffect(() => {
    console.log(selectedFolder);
  }, [selectedFolder]);

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
