import {
  operationalOptionsSchema,
  serverOptionsSchema,
} from '@/types/commandOptions';
import { program } from 'commander';

program
  .name('caching-proxy')
  .summary('start and control a local proxy server')
  .description(
    'Starts the local proxy server if you speficy ---port and --origin options.\nIf you execute this command with --clear-cache option flag, this command just clears the local proxy cache.',
  )
  .option('-p, --port <port>', 'specify local server port', '3000')
  .option('-o, --origin <origin>', 'origin server URL')
  .option('--clear-cache', 'set this flag to clear proxy cache');

export const getServerOptions = (argv: string[]) =>
  serverOptionsSchema.safeParse(program.parse(argv).opts()).data;

export const getOperationalOptions = (argv: string[]) =>
  operationalOptionsSchema.safeParse(program.parse(argv).opts()).data;
