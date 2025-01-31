import express from "express";

import * as ormJA from "../orm_functions/job_application";
import * as ormOsoc from "../orm_functions/osoc";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";

/**
 *  Attempts to list all followups in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listFollowups(
    req: express.Request
): Promise<Responses.FollowupList> {
    return rq
        .parseFollowupAllRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then(() =>
            ormOsoc
                .getLatestOsoc()
                .then((osoc) => util.getOrReject(osoc))
                .then(async (osoc) =>
                    ormJA
                        .getJobApplicationByYear(osoc.year)
                        .then((arr) =>
                            arr.map((v) => ({
                                student: v.student_id,
                                application: v.job_application_id,
                                status: v.email_status,
                            }))
                        )
                        .then((res) =>
                            Promise.resolve({
                                data: res,
                            })
                        )
                )
        );
}

/**
 *  Attempts to get a single followup.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getFollowup(
    req: express.Request
): Promise<Responses.SingleFollowup> {
    return rq
        .parseGetFollowupStudentRequest(req)
        .then((parsed) => util.checkSessionKey(parsed))
        .then((checked) =>
            ormJA
                .getLatestJobApplicationOfStudent(checked.data.id)
                .then((data) => util.getOrReject(data))
                .then((ja) =>
                    Promise.resolve({
                        student: ja.student_id,
                        application: ja.job_application_id,
                        status: ja.email_status,
                    })
                )
        );
}

/**
 *  Attempts to update a single followup.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function updateFollowup(
    req: express.Request
): Promise<Responses.SingleFollowup> {
    return rq
        .parseSetFollowupStudentRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then((checked) =>
            ormJA
                .getLatestJobApplicationOfStudent(checked.data.id)
                .then((ja) => {
                    if (ja == null) return Promise.reject();
                    return Promise.resolve(ja);
                })
                .then((ja) =>
                    ormJA.changeEmailStatusOfJobApplication(
                        ja.job_application_id,
                        checked.data.type
                    )
                )
                .then((res) =>
                    Promise.resolve({
                        student: res.student_id,
                        application: res.job_application_id,
                        status: res.email_status,
                    })
                )
        );
}

export function getRouter() {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/followup");
    util.route(router, "get", "/all", listFollowups);
    util.route(router, "get", "/:id", getFollowup);
    util.route(router, "post", "/:id", updateFollowup);

    util.addAllInvalidVerbs(router, ["/", "/all"]);

    return router;
}
