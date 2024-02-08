interface Errors {
  email?: string | undefined;
  password?: string | undefined;
  addresses?: string | undefined;
  subject?: string | undefined;
  invalidCredentials?: string | undefined;
}

export default Errors;
