export class RequestFailedError extends Error {
  constructor(
    protected response: Response,
    protected urlString: string
  ) {
    super(
      `Request failed: ${response.status} ${response.statusText} ${urlString}`
    );
  }

  get status(): number {
    return this.response.status;
  }
}

export class InvalidUrlError extends Error {
  constructor(urlString: string) {
    super(`Invalid URL: ${urlString}`);
  }
}
