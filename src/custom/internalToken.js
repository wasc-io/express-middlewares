import errs from 'errs';

/**
 * This middleware extracts the tokens used by internal requests to the public apis
 *
 * The token will be sent as a `x-wasc-internal` header and contains two parts, seperated by a dot.
 * First the api token, that is used to verify the request is actually comming from an internal service
 * And secondly a base64 encoded json object for the token payload, similar to those of a JWT token.
 */

export default options => {
  if (!options.API_KEY) {
    throw errs.create({
      name: 'NoApiKey',
      message:
        'No Api key provided. The middleware cannot function properly without an API_TOKEN to validate the incoming requests',
    });
  }

  if (!options.header) {
    throw errs.create({
      name: 'NoHeader',
      message: 'Please provide the name of the header, on which the internalToken will be passed',
    });
  }

  /**
   * The authentication middleware
   * @param {Request} request The express Request Object
   * @param {Response} response The express Response Object
   * @param {Function} next The express next function
   * @return
   */
  return (request, response, next) => {
    const token = request.get(options.header);

    if (!token) return next();

    try {
      // No Authorization
      if (!token) return next();

      const [apiKey, payload] = token.split('.');

      if (apiKey !== options.API_KEY)
        throw errs.create({
          message: 'NotAuthorized',
          name: 'NotAuthorized',
        });

      request.auth = {
        isAuthenticated: true,
      };

      if (payload) {
        const asciiPayload = Buffer.from(payload, 'base64').toString('ascii');

        const jsonPayload = JSON.parse(asciiPayload);

        request.scope = jsonPayload.scope;
        request.user = jsonPayload.user;

        request.auth = {
          ...request.auth,
          scope: jsonPayload.scope,
        };
      }
      return next();
    } catch (error) {
      if (error.name === 'SyntaxError') {
        return response.status(401).json({
          name: 'TokenMalformed',
          message: 'The payload of the token could not be parsed',
        });
      }

      return response.status(400).json({
        name: 'BadRequest',
        message: 'BadRequest',
      });
    }
  };
};
