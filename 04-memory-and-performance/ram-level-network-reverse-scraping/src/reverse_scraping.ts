export interface CapturedApiExchange {
  requestId: string;
  url: string;
  method: string;
  status: number;
  mimeType: string;
  timestamp: number;
  data?: unknown;
}

export type CdpSender = <T = any>(method: string, params: Record<string, unknown>) => Promise<T>;

export class NetworkReverseScraper {
  private capturedExchanges: CapturedApiExchange[] = [];
  private readonly MAX_BUFFER = 50;

  constructor(private sendCdp: CdpSender) {}

  public async enable(): Promise<void> {
    await this.sendCdp("Network.enable", {});
  }

  public async handleResponseReceived(params: any): Promise<void> {
    const response = params.response || {};
    const mimeType = String(response.mimeType || "").toLowerCase();
    const url = String(response.url || "");

    const isJson = mimeType.includes("json") || url.includes("/api/") || url.includes("/graphql");
    if (!isJson || !params.requestId) return;

    try {
      const res = await this.sendCdp<{ body: string; base64Encoded: boolean }>(
        "Network.getResponseBody",
        { requestId: params.requestId }
      );
      if (!res?.body) return;

      let parsed: unknown = null;
      try {
        parsed = JSON.parse(res.body);
      } catch {
        parsed = res.body.slice(0, 1000);
      }

      this.capturedExchanges.push({
        requestId: params.requestId,
        url,
        method: "GET",
        status: response.status,
        mimeType,
        timestamp: Date.now(),
        data: parsed,
      });

      if (this.capturedExchanges.length > this.MAX_BUFFER) {
        this.capturedExchanges.shift();
      }
    } catch {
      // Ignored for streaming/evicted socket buffers
    }
  }

  public getLatestExchanges(): CapturedApiExchange[] {
    return [...this.capturedExchanges];
  }
}
