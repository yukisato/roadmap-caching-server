import { Request, Response } from 'express';
import { getCachedOrFetchUrl } from '@/lib/getCachedOrFetchUrl';
import {
  InvalidUrlError,
  NoOriginUrlError,
  RequestFailedError,
} from '@/lib/errors';
import { getOriginUrl, initDb, storeOriginUrl } from '@/dbServer';
import express from 'express';
import { Server } from 'node:http';

export const getHandler = async (req: Request, res: Response) => {
  const origin = getOriginUrl();
  if (!origin) throw new NoOriginUrlError();

  try {
    const { data, isCache } = await getCachedOrFetchUrl(
      origin + req.originalUrl
    );
    res
      .append('X-Cache', isCache ? 'HIT' : 'MISS')
      .status(200)
      .send(data);
  } catch (error) {
    if (error instanceof RequestFailedError) {
      console.error(error.message);
      res.status(error.status);
    } else if (error instanceof InvalidUrlError) {
      console.error(error.message);
      res.status(400).send(error.message);
    } else if (error instanceof Error) {
      console.error(error.message);
      res.status(500).send(error.message);
    } else {
      console.error(error);
      res.status(500).send(error);
    }
  } finally {
    res.end();
  }

  return res;
};

export const initExpress = () => {
  const app = express();
  app.get(/.*/, getHandler);

  return app;
};

export const startProxyServer = (port: number, origin: string): Server => {
  initDb();
  storeOriginUrl(origin);

  return initExpress().listen(port, () => {
    console.log(`Proxy server started on port ${port}. Origin: ${origin}`);
  });
};
