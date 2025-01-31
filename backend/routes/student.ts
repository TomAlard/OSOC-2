import express from "express";

import * as ormEv from "../orm_functions/evaluation";
import * as ormJo from "../orm_functions/job_application";
import * as ormLa from "../orm_functions/language";
import * as ormRo from "../orm_functions/role";
import * as ormSt from "../orm_functions/student";
import * as ormOs from "../orm_functions/osoc";
import * as rq from "../request";
import { Responses } from "../types";
import * as util from "../utility";
import { errors } from "../utility";
import * as ormP from "../orm_functions/person";

/**
 *  Attempts to list all students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listStudents(
    req: express.Request
): Promise<Responses.StudentList> {
    const parsedRequest = await rq.parseStudentAllRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }
    const studentList: object[] = [];
    const students = await ormSt.getAllStudents();
    for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
        const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
            students[studentIndex].student_id
        );
        if (jobApplication != null) {
            const roles = [];
            for (const applied_role of jobApplication.applied_role) {
                const role = await ormRo.getRole(applied_role.role_id);
                if (role != null) {
                    roles.push(role.name);
                } else {
                    return Promise.reject(errors.cookInvalidID());
                }
            }

            const evaluations = await ormJo.getStudentEvaluationsTotal(
                students[studentIndex].student_id
            );

            for (
                let skillIndex = 0;
                skillIndex < jobApplication.job_application_skill.length;
                skillIndex++
            ) {
                if (
                    jobApplication.job_application_skill[skillIndex]
                        .language_id != null
                ) {
                    const language = await ormLa.getLanguage(
                        Number(
                            jobApplication.job_application_skill[skillIndex]
                                .language_id
                        )
                    );
                    if (language != null) {
                        jobApplication.job_application_skill[skillIndex].skill =
                            language.name;
                    } else {
                        return Promise.reject(errors.cookInvalidID());
                    }
                }
            }

            studentList.push({
                student: students[studentIndex],
                jobApplication: jobApplication,
                evaluations: evaluations,
                roles: roles,
            });
        } else {
            return Promise.reject(errors.cookInvalidID());
        }
    }

    return Promise.resolve({
        data: studentList,
    });
}

/**
 *  Attempts to get all data for a certain student in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getStudent(req: express.Request): Promise<Responses.Student> {
    const parsedRequest = await rq.parseSingleStudentRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
        student.student_id
    );
    if (jobApplication == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const roles = [];
    for (const applied_role of jobApplication.applied_role) {
        const role = await ormRo.getRole(applied_role.role_id);
        if (role != null) {
            roles.push(role.name);
        } else {
            return Promise.reject(errors.cookInvalidID());
        }
    }

    const evaluations = await ormJo.getStudentEvaluationsTotal(
        student.student_id
    );

    for (const job_application_skill of jobApplication.job_application_skill) {
        if (job_application_skill.language_id != null) {
            const language = await ormLa.getLanguage(
                job_application_skill.language_id
            );
            if (language == null) {
                return Promise.reject(errors.cookInvalidID());
            }
            job_application_skill.skill = language.name;
        }
    }

    return Promise.resolve({
        student: student,
        jobApplication: jobApplication,
        evaluations: evaluations,
        roles: roles,
    });
}

/**
 *  Attempts to delete a student from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteStudent(req: express.Request): Promise<Responses.Empty> {
    return rq
        .parseDeleteStudentRequest(req)
        .then((parsed) => util.isAdmin(parsed))
        .then(async (parsed) => {
            return ormSt
                .deleteStudent(parsed.data.id)
                .then(() =>
                    ormP
                        .deletePersonById(parsed.data.id)
                        .then(() => Promise.resolve({}))
                );
        });
}

/**
 *  Attempts to create a student suggestion in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentSuggestion(
    req: express.Request
): Promise<Responses.Empty> {
    const parsedRequest = await rq.parseSuggestStudentRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const osocYear = await ormOs.getLatestOsoc();

    if (osocYear == null) {
        return Promise.reject(errors.cookNoDataError());
    }

    const suggestionsTotal = (
        await ormJo.getStudentEvaluationsTemp(student.student_id)
    ).filter(
        (suggestion) =>
            suggestion.osoc.year === osocYear.year &&
            suggestion.evaluation.some(
                (evaluation) =>
                    evaluation.login_user.login_user_id ===
                    checkedSessionKey.userId
            )
    );

    const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
        student.student_id
    );
    if (jobApplication == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    if (suggestionsTotal.length > 0) {
        const suggestion = suggestionsTotal[0].evaluation.filter(
            (evaluation) =>
                evaluation.login_user.login_user_id === checkedSessionKey.userId
        );

        await ormEv.updateEvaluationForStudent({
            evaluation_id: suggestion[0].evaluation_id,
            loginUserId: checkedSessionKey.userId,
            decision: checkedSessionKey.data.suggestion,
            motivation: checkedSessionKey.data.reason,
        });
    } else {
        await ormEv.createEvaluationForStudent({
            loginUserId: checkedSessionKey.userId,
            jobApplicationId: jobApplication.job_application_id,
            decision: checkedSessionKey.data.suggestion,
            motivation: checkedSessionKey.data.reason,
            isFinal: false,
        });
    }

    return Promise.resolve({});
}

/**
 *  Attempts to list all suggestions for a certain student.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getStudentSuggestions(
    req: express.Request
): Promise<Responses.SuggestionInfo> {
    const parsedRequest = await rq.parseGetSuggestionsStudentRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const student = await ormSt.getStudent(checkedSessionKey.data.id);
    if (student == null) {
        return Promise.reject(errors.cookInvalidID());
    }

    const osoc =
        checkedSessionKey.data.year == undefined
            ? await ormOs.getLatestOsoc()
            : checkedSessionKey.data.year;
    if (osoc == null) {
        return Promise.resolve({
            data: [],
            sessionkey: checkedSessionKey.data.sessionkey,
        });
    }
    const suggestionsTotal = (
        await ormJo.getStudentEvaluationsTotal(student.student_id)
    ).filter((suggestion) => suggestion.osoc.year === osoc.year);

    const suggestionsInfo = [];
    for (const suggestion of suggestionsTotal) {
        for (const evaluation of suggestion.evaluation) {
            suggestionsInfo.push({
                senderFirstname: evaluation.login_user.person.firstname,
                senderLastname: evaluation.login_user.person.lastname,
                reason: evaluation.motivation,
                decision: evaluation.decision,
                isFinal: evaluation.is_final,
            });
        }
    }

    return Promise.resolve({
        data: suggestionsInfo,
    });
}

/**
 *  Attempts to create a student confirmation in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createStudentConfirmation(
    req: express.Request
): Promise<Responses.Empty> {
    const parsedRequest = await rq.parseFinalizeDecisionRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const isAdminCheck = await util.isAdmin(parsedRequest);

    if (isAdminCheck.is_admin) {
        const student = await ormSt.getStudent(checkedSessionKey.data.id);
        if (student == null) {
            return Promise.reject(errors.cookInvalidID());
        }

        const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
            student.student_id
        );
        if (jobApplication == null) {
            return Promise.reject(errors.cookInvalidID());
        }

        await ormEv.createEvaluationForStudent({
            loginUserId: checkedSessionKey.userId,
            jobApplicationId: jobApplication.job_application_id,
            decision: checkedSessionKey.data.reply,
            motivation: checkedSessionKey.data.reason,
            isFinal: true,
        });

        return Promise.resolve({});
    }

    return Promise.reject(errors.cookInsufficientRights());
}

/**
 *  Attempts to filter students in the system by name, role, alumni, student coach, status or email.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function filterStudents(
    req: express.Request
): Promise<Responses.StudentList> {
    const parsedRequest = await rq.parseFilterStudentsRequest(req);
    const checkedSessionKey = await util
        .checkSessionKey(parsedRequest)
        .catch((res) => res);
    if (checkedSessionKey.data == undefined) {
        return Promise.reject(errors.cookInvalidID());
    }

    const students = await ormSt.filterStudents(
        checkedSessionKey.data.firstNameFilter,
        checkedSessionKey.data.lastNameFilter,
        checkedSessionKey.data.emailFilter,
        checkedSessionKey.data.roleFilter,
        checkedSessionKey.data.alumniFilter,
        checkedSessionKey.data.coachFilter,
        checkedSessionKey.data.statusFilter,
        checkedSessionKey.data.osocYear,
        checkedSessionKey.data.emailStatusFilter,
        checkedSessionKey.data.firstNameSort,
        checkedSessionKey.data.lastNameSort,
        checkedSessionKey.data.emailSort,
        checkedSessionKey.data.alumniSort
    );

    const studentlist = [];

    for (const student of students) {
        const jobApplication = await ormJo.getLatestJobApplicationOfStudent(
            student.student_id
        );
        if (jobApplication == null) {
            return Promise.reject(errors.cookInvalidID());
        }

        const roles = [];
        for (const applied_role of jobApplication.applied_role) {
            const role = await ormRo.getRole(applied_role.role_id);
            if (role != null) {
                roles.push(role.name);
            } else {
                return Promise.reject(errors.cookInvalidID());
            }
        }

        const evaluations = await ormJo.getStudentEvaluationsTotal(
            student.student_id
        );

        for (const job_application_skill of jobApplication.job_application_skill) {
            if (job_application_skill.language_id != null) {
                const language = await ormLa.getLanguage(
                    job_application_skill.language_id
                );
                if (language == null) {
                    return Promise.reject(errors.cookInvalidID());
                }
                job_application_skill.skill = language.name;
            }
        }

        studentlist.push({
            student: student,
            jobApplication: jobApplication,
            evaluations: evaluations,
            roles: roles,
        });
    }

    return Promise.resolve({
        data: studentlist,
    });
}

/**
 *  Gets the router for all `/student/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/student/`
 * endpoints.
 */
export function getRouter(): express.Router {
    const router: express.Router = express.Router();

    util.setupRedirect(router, "/student");
    util.route(router, "get", "/filter", filterStudents);
    util.route(router, "get", "/all", listStudents);
    util.route(router, "get", "/:id", getStudent);
    util.route(router, "delete", "/:id", deleteStudent);

    util.route(router, "post", "/:id/suggest", createStudentSuggestion);

    util.route(router, "get", "/:id/suggest", getStudentSuggestions);

    util.route(router, "post", "/:id/confirm", createStudentConfirmation);

    util.addAllInvalidVerbs(router, [
        "/",
        "/all",
        "/:id",
        "/:id/suggest",
        "/:id/confirm",
        "/filter",
    ]);

    return router;
}
