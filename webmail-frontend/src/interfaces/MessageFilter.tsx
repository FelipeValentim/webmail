interface MessageFilter {
  folderName: string;
  page: number;
  rowsPerPage: number;
  searchQuery: string;
  searchText: string;
  searchParams: string[];
}

export default MessageFilter;
