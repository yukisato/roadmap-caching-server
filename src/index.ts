import { run } from '@/run';

(async () => {
  try {
    await run(process.argv);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
})();
