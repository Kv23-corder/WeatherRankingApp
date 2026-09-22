const { auth } = require('express-oauth2-jwt-bearer');

// Verifies the Auth0-issued JWT sent by the frontend in the
// Authorization: Bearer <token> header. Requests without a valid
// token are rejected with 401 before they reach the route handler.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
});

module.exports = { checkJwt };
