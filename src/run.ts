import { clearCache } from '@/lib/clearCache';
import {
  getOperationalOptions,
  getServerOptions,
} from './lib/commandOptionPrser';
import { program } from 'commander';

export const run = async (argv: string[]) => {
  // Operate the proxy server if the command line arguments are for the operations
  const operationalOptions = getOperationalOptions(argv);
  if (operationalOptions?.clearCache) {
    clearCache();
    return;
  }

  // Start the proxy server if the command line arguments are for the server
  const serverOptions = getServerOptions(argv);
  if (serverOptions) {
    listen(serverOptions.port, serverOptions.origin);
    return;
  }

  // If the proper combination of options is passed, display the help
  program.outputHelp();
};

export const listen = async (port: number, origin: string) => {
  console.log(`Starting proxy server at ${origin} on port ${port}`);
};
