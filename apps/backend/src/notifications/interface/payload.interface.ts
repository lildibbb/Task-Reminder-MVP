export interface Payload {
  title: string;
  body?: string;
  data?: {
    url?: string;
  };
  actions?: any;
}
