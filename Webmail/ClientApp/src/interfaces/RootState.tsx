import Folder from "./Folder";
import Message from "./Message";
import User from "./User";

interface RootState {
  themeSwitch: string;
  user: User;
  folders: Array<Folder>;
  messages: Array<Message>;
  selectedFolder: Folder;

  // Outras chaves de estado aqui...
}

export default RootState;
