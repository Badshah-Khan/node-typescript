export interface ICORSConfig {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    origin?: (origin: string, callback: any) => void;
    credentials?: boolean;
  }