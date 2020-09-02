import connect from 'connect';

import helmet from 'helmet';
import bodyParser from 'body-parser';
import serviceVersion from 'service-version';
import serviceName from 'service-name';
import cors from 'cors';
import logger from './custom/logger';
import internalToken from './custom/internalToken';

const customMiddlewares = {
  logger,
  internalToken,
  helmet,
  bodyParserJson: bodyParser.json,
  bodyParserUrl: bodyParser.urlencoded,
  serviceVersion,
  serviceName,
  cors,
};

const functions = Object.keys(customMiddlewares);

const defaultConfiguration = {
  bodyParserUrl: {
    extended: true,
  },
};

/**
 * Custom middlewares
 * @param {any} options
 * @return {Object} An object of middleware functions
 */
export default function middlewares(options = {}) {
  if (options.constructor.name === 'IncomingMessage') {
    throw new Error(
      'It appears you have done something like `app.use(middlewares)`, but it should be `app.use(middlewares())`.',
    );
  }

  const chain = connect();

  functions.forEach(middlewareName => {
    const middleware = customMiddlewares[middlewareName];
    const middlewareOptions = Object.assign(
      defaultConfiguration[middlewareName] || {},
      options[middlewareName] || {},
    );

    if (options[middlewareName] === false) {
      return;
    }

    if (middlewareOptions != null) {
      chain.use(middleware(middlewareOptions));
    } else {
      chain.use(middleware());
    }
  });

  return chain;
}
