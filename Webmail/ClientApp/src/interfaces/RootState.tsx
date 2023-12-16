import DataMessages from "./DataMessages";
import Folder from "./Folder";
import Search from "./Search";

interface RootState {
  themeSwitch: string;
  user: string;
  folders: Array<Folder>;
  dataMessages: DataMessages;
  selectedFolder: Folder;
  search: Search;

  // Outras chaves de estado aqui...
}

export default RootState;
