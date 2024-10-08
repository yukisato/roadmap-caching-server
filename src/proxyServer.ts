import { clearCache, getOriginUrl, setOriginUrl } from '@/lib/cacheManager';
import { initDb, setPortNumber, unsetPortNumber } from '@/lib/dbManager';
import {
  InvalidUrlError,
  NoOriginUrlError,
  RequestFailedError,
} from '@/lib/errors';
import { getCachedOrFetchUrl } from '@/lib/fetchUtils';
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response,
} from 'express';

export const getHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const origin = getOriginUrl();
  if (!origin) return next(new NoOriginUrlError());

  try {
    const { data, isCache } = await getCachedOrFetchUrl(
      origin + req.originalUrl,
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
  res: Response,
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

export const startProxyServer = (port: number, origin: string): void => {
  try {
    initDb();
    setPortNumber(port);
    clearCache();
    setOriginUrl(origin);

    const app = initExpress();
    app
      .listen(port)
      .on('error', (error: Error) => {
        console.error(error.message);
      })
      .once('listening', () => {
        console.log(`Server listening on port ${port}. Origin: ${origin}.`);
      })
      .once('close', () => {
        console.log('Server closed.');
      });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(`Unknown error: ${String(error)}`);
    }
    process.exit(1);
  }
};
