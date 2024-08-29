export class RequestFailedError extends Error {
  constructor(response: Response, urlString: string) {
    super(
      `Request failed: ${response.status} ${response.statusText} ${urlString}`
    );
  }
}

export class InvalidUrlError extends Error {
  constructor(urlString: string) {
    super(`Invalid URL: ${urlString}`);
  }
}
