export interface Settings {
  open: boolean;
  tab: number;
}

export interface ConnectionSettings {
  host: string;
  port?: number;
  secureSocketOptions: number;
  type?: string;
}

export interface ProviderSettings {
  imap?: ConnectionSettings;
  smtp?: ConnectionSettings;
}
