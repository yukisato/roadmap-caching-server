import {
  operationalOptionsSchema,
  serverOptionsSchema,
} from '@/types/commandOptions';
import { createCommand } from 'commander';

export const getServerOptions = (argv: string[]) => {
  const options = createCommand()
    .option('-p, --port <port>', 'orign server to fetch', '3000')
    .option('-o, --origin <origin>', 'origin server URL')
    .parse(argv)
    .opts();
  return serverOptionsSchema.safeParse(options).data;
};

export const getOperationalOptions = (argv: string[]) => {
  const options = createCommand()
    .option('--clear-cache', 'clear the cache')
    .parse(argv)
    .opts();
  return operationalOptionsSchema.safeParse(options).data;
};
