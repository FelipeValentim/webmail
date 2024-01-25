interface Folder {
  name: string;
  path: string;
  totalEmails: number;
  unread: number;
  parent: string | null;
  id: number | null;
  subFolders: [] | null;
}

export default Folder;
