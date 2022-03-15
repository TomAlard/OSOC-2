import express from 'express';

import {Responses} from '../types';
import * as util from '../utility';

/* eslint-disable no-unused-vars */

/**
 *  Attempts to log a user into the system.
 *  @param _ The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function login(_: express.Request): Promise<Responses.Key> {
  var sessionkey: string = "";
  // TODO: login logic
  return Promise.resolve({sessionkey : sessionkey});
}

/**
 *  Attempts to log a user out of the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function logout(req: express.Request): Promise<Responses.Empty> {
  return util.checkSessionKey(req).then((_: express.Request) => {
    // TODO logout logic
    return Promise.resolve({});
  });
}

/* eslint-enable no-unused-vars */

/**
 *  Gets the router for all `/login/` related endpoints.
 *  @returns An Epress.js {@link express.Router} routing all `/login/`
 * endpoints.
 */
export function getRouter(): express.Router {
  var router: express.Router = express.Router();

  router.post('/', (req, res) => util.respOrErrorNoReinject(res, login(req)));
  router.delete('/',
                (req, res) => util.respOrErrorNoReinject(res, logout(req)));
  util.addInvalidVerbs(router, '/');
  return router;
}
