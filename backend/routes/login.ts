import express from "express";

import { getPasswordPersonByEmail } from "../orm_functions/person";
import {
    addSessionKey,
    removeAllKeysForUser,
} from "../orm_functions/session_key";
import { parseLoginRequest, parseLogoutRequest } from "../request";
import { Responses } from "../types";
import * as util from "../utility";

import * as session_key from "./session_key.json";

function orDefault<T>(v: T | undefined, def: T): T {
    return v == undefined || false ? def : v;
}

/**
 *  Attempts to log a user into the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function login(req: express.Request): Promise<Responses.Login> {
    console.log("Calling login endpoint " + JSON.stringify(req.body));
    return parseLoginRequest(req).then((parsed) =>
        getPasswordPersonByEmail(parsed.name).then(async (pass) => {
            if (
                pass == null ||
                pass.login_user == null ||
                pass?.login_user?.password != parsed.pass
            ) {
                return Promise.reject({
                    http: 409,
                    reason: "Invalid e-mail or password.",
                });
            }
            if (pass?.login_user?.account_status == "DISABLED") {
                return Promise.reject({
                    http: 409,
                    reason: "Account is disabled.",
                });
            }
            const key: string = util.generateKey();
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + session_key.valid_period);
            return addSessionKey(
                pass.login_user.login_user_id,
                key,
                futureDate
            ).then((ins) => ({
                sessionkey: ins.session_key,
                is_admin: orDefault(pass?.login_user?.is_admin, false),
                is_coach: orDefault(pass?.login_user?.is_coach, false),
                account_status: pass?.login_user?.account_status,
            }));
        })
    );
}

/**
 *  Attempts to log a user out of the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function logout(req: express.Request): Promise<Responses.Empty> {
    return parseLogoutRequest(req)
        .then((parsed) => util.checkSessionKey(parsed, false)) // logout can with pending account
        .then(async (checked) => {
            return removeAllKeysForUser(checked.data.sessionkey).then(() => {
                return Promise.resolve({});
            });
        });
}

/**
 *  Gets the router for all `/login/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/login/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    router.post("/", (req, res) => util.respOrErrorNoReinject(res, login(req)));
    router.delete("/", (req, res) =>
        util.respOrErrorNoReinject(res, logout(req))
    );
    util.addInvalidVerbs(router, "/");
    return router;
}
