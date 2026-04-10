import { ENV } from './util/env';
import { io, server } from './server';

server.listen(ENV.PORT, () => {
  console.log(`Lattice backend now listening at ${ENV.HOST}:${ENV.PORT}`);
  console.log('Hi Andrew! 😎');
});
io.start();
