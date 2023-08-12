import DataMessages from "./DataMessages";
import Folder from "./Folder";
import User from "./User";

interface RootState {
  themeSwitch: string;
  user: User;
  folders: Array<Folder>;
  dataMessages: DataMessages;
  selectedFolder: Folder;

  // Outras chaves de estado aqui...
}

export default RootState;
