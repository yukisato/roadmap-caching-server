import {
  getOperationalOptions,
  getServerOptions,
} from './lib/commandOptionPrser';

export const run = async (argv: string[]) => {
  // Start the proxy server if the command line arguments are for the server
  const serverOptions = getServerOptions(argv);
  if (serverOptions) {
    listen(serverOptions.port, serverOptions.origin);
    return;
  }

  // Operate the proxy server if the command line arguments are for the operations
  const operationalOptions = getOperationalOptions(argv);
  if (operationalOptions?.clearCache) {
    console.log('TODO: Clearing cache');
    return;
  } else {
    console.error('Missing command line arguments');
  }
};

export const listen = async (port: number, origin: string) => {
  console.log(`Starting proxy server at ${origin} on port ${port}`);
};
