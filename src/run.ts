import { callClearCacheApi } from '@/lib/fetchUtils';
import { startProxyServer } from '@/proxyServer';
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

export const run = async (argv: string[]) => {
  // Operate the proxy server if the command line arguments are for the operations
  const operationalOptions = operationalOptionsSchema.safeParse(
    program.parse(argv).opts(),
  ).data;
  if (operationalOptions?.clearCache) {
    callClearCacheApi();
    return;
  }

  // Start the proxy server if the command line arguments are for the server
  const serverOptions = serverOptionsSchema.safeParse(
    program.parse(argv).opts(),
  ).data;
  if (serverOptions) {
    startProxyServer(serverOptions.port, serverOptions.origin);
    return;
  }

  // If the proper combination of options is passed, display the help
  program.outputHelp();
};
