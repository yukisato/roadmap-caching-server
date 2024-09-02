import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { getCachedOrFetchUrl } from '@/lib/fetchUtils';
import {
  InvalidUrlError,
  NoOriginUrlError,
  RequestFailedError,
} from '@/lib/errors';
import { clearCache, getOriginUrl, setOriginUrl } from '@/lib/cacheManager';
import express from 'express';
import { Server } from 'node:http';
import { initDb, setPortNumber } from './lib/dbManager';

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

export const startProxyServer = (
  port: number,
  origin: string,
  callback?: () => void
): Server => {
  initDb();
  setPortNumber(port);
  clearCache();
  setOriginUrl(origin);

  return initExpress().listen(port, () => {
    console.log(`Proxy server started on port ${port}. Origin: ${origin}`);
    if (callback) callback();
  });
};
