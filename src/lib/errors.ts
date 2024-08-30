import { originUrlTableName } from '@/dbServer';

export class RequestFailedError extends Error {
  constructor(
    protected response: Response,
    protected urlString: string
  ) {
    super(
      `request failed: ${response.status} ${response.statusText} ${urlString}`
    );
  }

  get status(): number {
    return this.response.status;
  }
}

export class InvalidUrlError extends Error {
  constructor(urlString: string) {
    super(`invalid URL: ${urlString}`);
  }
}

export class NoOriginUrlError extends Error {
  constructor() {
    super(
      `no origin URL is set in the ${originUrlTableName} table in the database`
    );
  }
}
