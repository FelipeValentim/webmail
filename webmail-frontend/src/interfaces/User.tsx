import { ConnectionSettings } from "./Provider";

interface User {
  username: string;
  password: string;
  serviceType: number;
  imapProvider: ConnectionSettings;
  smtpProvider: ConnectionSettings;
}

export default User;
