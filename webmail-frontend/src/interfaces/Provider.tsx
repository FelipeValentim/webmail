export interface Settings {
  open: boolean;
  tab: number;
}

export interface ConnectionSettings {
  host: string;
  port?: number;
  security: number;
}

export interface ProviderSettings {
  imap?: ConnectionSettings;
  smtp?: ConnectionSettings;
}
