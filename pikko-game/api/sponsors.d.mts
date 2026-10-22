export const UPSTREAM: string;
export interface SponsorsRequest { method?: string; headers?: Record<string, string | string[] | undefined> }
export interface SponsorsResponse { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void }
export function createSponsorsHandler(deps?: { fetchImpl?: typeof fetch; now?: () => number }): (req: SponsorsRequest, res: SponsorsResponse) => Promise<void>;
declare const handler: (req: SponsorsRequest, res: SponsorsResponse) => Promise<void>;
export default handler;
