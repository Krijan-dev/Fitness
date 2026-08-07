/** Browser-like headers for unofficial supermarket UI / BFF endpoints. */
export function browserJsonHeaders(options: {
  referer: string;
  origin?: string;
}): HeadersInit {
  return {
    "User-Agent":
      process.env.GROCERY_HTTP_USER_AGENT ||
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-AU,en;q=0.9",
    Referer: options.referer,
    Origin: options.origin ?? options.referer.replace(/\/$/, ""),
  };
}

export function isForbiddenStatus(status: number): boolean {
  return status === 401 || status === 403 || status === 429;
}
