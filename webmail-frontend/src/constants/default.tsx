const { MODE, VITE_ORIGIN_PRODUCTION_URL, VITE_ORIGIN_DEV_URL } = import.meta
  .env;

export const ORIGIN_URL =
  MODE === "production" ? VITE_ORIGIN_PRODUCTION_URL : VITE_ORIGIN_DEV_URL;

export const mailboxUser = "mailbox_user";

export const themeKey = "mailbox_theme";
export const defaultTheme = "light-theme";

const SearchQuery = {
  All: "All",
  Seen: "Seen",
  NotSeen: "NotSeen",
  Flagged: "Flagged",
  NotAnswered: "NotAnswered",
};

export const httpStatus = {
  ok: 200,
  unauthorized: 401,
};

export default SearchQuery;
