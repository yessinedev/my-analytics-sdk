import { AnalyticsConfig } from "./types";

let config: AnalyticsConfig = {
  clientId: '',
};


export function setConfig(options: Partial<AnalyticsConfig>): void {
  config = { ...config, ...options };
}


export function getConfig(): AnalyticsConfig {
  return { ...config };
}
