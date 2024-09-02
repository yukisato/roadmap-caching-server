import { clearCache, getOriginUrl, setOriginUrl } from '@/lib/cacheManager';
import { initDb, setPortNumber, unsetPortNumber } from '@/lib/dbManager';
import {
  InvalidUrlError,
  NoOriginUrlError,
  RequestFailedError,
} from '@/lib/errors';
import { getCachedOrFetchUrl } from '@/lib/fetchUtils';
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import { Server } from 'node:http';

export const getHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const origin = getOriginUrl();
  if (!origin) return next(new NoOriginUrlError());

  try {
    const { data, isCache } = await getCachedOrFetchUrl(
      origin + req.originalUrl
    );
    res
      .append('X-Cache', isCache ? 'HIT' : 'MISS')
      .status(200)
      .send(data)
      .end();
  } catch (error) {
    return next(error);
  }
};
export const clearCacheHandler = async (_: Request, res: Response) => {
  clearCache();
  res.sendStatus(204);
};

export const errorMiddleware: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response
) => {
  if (err instanceof RequestFailedError) {
    console.error(err.message);
    res.status(err.status).send(err.message);
  } else if (err instanceof InvalidUrlError) {
    console.error(err.message);
    res.status(400).send(err.message);
  } else if (err instanceof NoOriginUrlError) {
    console.error(err.message);
    res.sendStatus(500);
  } else if (err instanceof Error) {
    console.error(err.message);
    res.sendStatus(500);
  } else {
    console.error(err);
    res.sendStatus(500);
  }
};

export const initExpress = () => {
  const app = express();
  app.get('/clearCache', clearCacheHandler);
  app.get(/.*/, getHandler);
  app.use(errorMiddleware);

  return app;
};

export type ProxyServerCloser = () => Promise<void>;
export type StartProxyServerReturn = {
  closeProxyServer: ProxyServerCloser;
};
export const startProxyServer = async (
  port: number,
  origin: string
): Promise<StartProxyServerReturn> => {
  initDb();
  setPortNumber(port);
  clearCache();
  setOriginUrl(origin);

  const app = initExpress();
  let server: Server;
  try {
    await new Promise<void>((resolve, reject) => {
      server = app
        .listen(port)
        .once('listening', () => {
          console.log(`Server listening on port ${port}. Origin: ${origin}.`);
          resolve();
        })
        .once('close', () => {
          console.log(`Server closed.`);
          reject();
        });
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }

  const closeProxyServer: ProxyServerCloser = async () => {
    clearCache();
    unsetPortNumber();
    await new Promise((resolve) => server.close(resolve));
  };

  return { closeProxyServer };
};
