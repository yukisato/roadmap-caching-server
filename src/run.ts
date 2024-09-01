import { clearCache } from '@/lib/cacheManager';
import {
  getOperationalOptions,
  getServerOptions,
} from '@/lib/commandOptionPrser';
import { program } from 'commander';
import { startProxyServer } from '@/proxyServer';

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
    startProxyServer(serverOptions.port, serverOptions.origin);
    return;
  }

  // If the proper combination of options is passed, display the help
  program.outputHelp();
};
