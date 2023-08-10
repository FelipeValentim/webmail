import Folders from "./Folders";
import User from "./User";

interface RootState {
  themeSwitch: string;
  user: User;
  folders: Array<Folders>;
  // Outras chaves de estado aqui...
}

export default RootState;
