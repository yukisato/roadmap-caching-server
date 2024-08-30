import { Request, Response } from 'express';
import { getCachedOrFetchUrl } from '@/lib/getCachedOrFetchUrl';
import { InvalidUrlError, RequestFailedError } from '@/lib/errors';
import { getOriginUrl } from '@/dbServer';

export const getHandler = async (req: Request, res: Response) => {
  const origin = getOriginUrl();

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
