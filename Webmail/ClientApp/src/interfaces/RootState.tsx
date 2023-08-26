import DataMessages from "./DataMessages";
import Folder from "./Folder";
import Search from "./Search";
import User from "./User";

interface RootState {
  themeSwitch: string;
  user: User;
  folders: Array<Folder>;
  dataMessages: DataMessages;
  selectedFolder: Folder;
  search: Search;

  // Outras chaves de estado aqui...
}

export default RootState;
