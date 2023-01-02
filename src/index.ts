import * as express from 'express';

import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import serviceVersion from 'service-version';
import serviceName from 'service-name';
import cors from 'cors';

const customMiddlewares = {
  helmet,
  bodyParserJson: bodyParser.json,
  bodyParserUrl: bodyParser.urlencoded,
  serviceVersion,
  serviceName,
  cors,
};

const functions = Object.keys(customMiddlewares);

type ConfigurationOptions = {
  helmet?: boolean | helmet.HelmetOptions;
  bodyParserJson?: boolean | bodyParser.OptionsJson;
  bodyParserUrl?: boolean | bodyParser.OptionsUrlencoded;
  serviceVersion?: boolean;
  serviceName?: boolean;
  cors?: boolean | cors.CorsOptions;
};

const defaultConfiguration: ConfigurationOptions = {
  bodyParserUrl: {
    extended: true,
  },
};

export default function middlewares(
  options: ConfigurationOptions = {},
): express.Router {
  if (options.constructor.name === 'IncomingMessage') {
    throw new Error(
      'It appears you have done something like `app.use(middlewares)`, but it should be `app.use(middlewares())`.',
    );
  }

  const router = express.Router();

  functions.forEach((middlewareName) => {
    const middleware = customMiddlewares[middlewareName];
    const middlewareOptions = Object.assign(
      defaultConfiguration[middlewareName] || {},
      options[middlewareName] || {},
    );

    if (options[middlewareName] === false) {
      return;
    }

    if (middlewareOptions != null) {
      router.use(middleware(middlewareOptions));
    } else {
      router.use(middleware());
    }
  });

  return router;
}
