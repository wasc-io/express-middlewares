import getPino from 'pino';

const pino = getPino();

export default () => (request, response, next) => {
  request.log =
    response.log ||
    pino.child({
      request: {
        method: request.method,
        url: request.url,
        headers: request.headers,
        remoteAddress: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
        remotePort: request.connection.remotePort,
      },
    });

  if (typeof next === 'function') next();
};
