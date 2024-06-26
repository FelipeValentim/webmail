import React, { Suspense } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import AppLayout from "../../layout/AppLayout";
import { useDispatch, useSelector } from "react-redux";
import RootState from "../../interfaces/RootState";
import { setSelectedFolder } from "../../redux/selectedFolder";
import { useLottie } from "lottie-react";
import mailbox from "../../assets/lotties/mailbox.json";
import { setFolders } from "../../redux/folders";
import Folder from "../../interfaces/Folder";
import { FolderAPI } from "../../services/FolderAPI";

type HomeParams = {
  folder: string;
};

const Index = () => {
  const [loading, setLoading] = React.useState(true);
  const location = useLocation();
  const folders = useSelector((state: RootState) => state.folders);
  const dispatch = useDispatch();

  const options = {
    animationData: mailbox,
    loop: true,
  };
  const params = useParams<HomeParams>();
  const { View: LoadingLottie } = useLottie(options);

  React.useEffect(() => {
    const getFolders = async () => {
      try {
        const response = await FolderAPI.getAll();

        const data: Array<Folder> = response.data;

        dispatch(setFolders(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (!folders) getFolders();
  }, []);

  React.useEffect(() => {
    if (folders) {
      const folder = location.hash
        ? folders.find(
            (x) =>
              x.path.toLowerCase() ===
              decodeURIComponent(location.hash).substring(1).toLowerCase()
          )
        : folders.find(
            (x) =>
              x.path.toLowerCase() ===
              decodeURIComponent(params.folder ?? "inbox").toLowerCase()
          );

      if (folder) {
        dispatch(setSelectedFolder(folder));
      }
    }
    // dispatch(setSelectedFolder());
  }, [location, folders]);

  return (
    <React.Fragment>
      {loading ? (
        <div className="loading-animation">{LoadingLottie}</div>
      ) : (
        <AppLayout>
          <Suspense fallback={<div className="loading" />}>
            <Outlet />
          </Suspense>
        </AppLayout>
      )}
    </React.Fragment>
  );
};

export default Index;
