import { ENV } from './util/env';
import { io, server } from './server';

server.listen(ENV.PORT, () => {
  console.log(`Lattice backend now listening at ${ENV.HOST}:${ENV.PORT}`);
  console.log('Heya Noah! 💪😉');

  console.log(`Log level set to ${ENV.LOG_LEVEL}.`);
});
io.start();
