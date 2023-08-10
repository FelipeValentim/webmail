interface Folders {
  name: string;
  path: string;
  totalEmails: number;
  unread: number;
  parent: string | null;
  id: string | null;
  subFolders: [] | null;
}

export default Folders;
