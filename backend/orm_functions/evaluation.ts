import prisma from "../prisma/prisma";

import {
    CreateEvaluationForStudent,
    UpdateEvaluationForStudent,
} from "./orm_types";

/**
 * helper function of createEvaluationForStudent
 *
 * @param jobApplicationId: the jobApplicationId we are checking for if there is
 *     already a final evaluation
 * @returns the found evaluation or null if no final evaluation exists yet
 */
export async function checkIfFinalEvaluationExists(jobApplicationId: number) {
    return await prisma.evaluation.findFirst({
        where: {
            job_application_id: jobApplicationId,
            is_final: true,
        },
        select: {
            evaluation_id: true,
        },
    });
}

/**
 *
 * @param evaluation: this has an object that contains all the information for a
 *     new evaluation.
 * however, if the evaluation is final AND there is already another evaluation,
 * then we modify this earlier "final" decision
 * @returns a promise with the created evaluation
 */
export async function createEvaluationForStudent(
    evaluation: CreateEvaluationForStudent
) {
    if (evaluation.isFinal) {
        const foundEvaluation = await checkIfFinalEvaluationExists(
            evaluation.jobApplicationId
        );
        if (foundEvaluation) {
            return await updateEvaluationForStudent({
                evaluation_id: foundEvaluation.evaluation_id,
                loginUserId: evaluation.loginUserId,
                decision: evaluation.decision,
                motivation: evaluation.motivation,
            });
        }
    }
    return await prisma.evaluation.create({
        data: {
            login_user_id: evaluation.loginUserId,
            job_application_id: evaluation.jobApplicationId,
            decision: evaluation.decision,
            motivation: evaluation.motivation,
            is_final: evaluation.isFinal,
        },
    });
}

/**
 *
 * @param evaluation: the updated evaluation. This evaluation only contains some
 *     field because we don't want everything changeable.
 * @returns the updated evaluation.
 */
export async function updateEvaluationForStudent(
    evaluation: UpdateEvaluationForStudent
) {
    return await prisma.evaluation.update({
        where: {
            evaluation_id: evaluation.evaluation_id,
        },
        data: {
            login_user_id: evaluation.loginUserId,
            decision: evaluation.decision,
            motivation: evaluation.motivation,
        },
    });
}

/**
 * returns the loginUser with person data of the person that created the evaluation with given id
 * @param evaluationId: id of the evaluation whose creator we are searching.
 */
export async function getLoginUserByEvaluationId(evaluationId: number) {
    return await prisma.evaluation.findUnique({
        where: { evaluation_id: evaluationId },
        include: { login_user: { include: { person: true } } },
    });
}

/**
 * return all evaluations created by the user with userId, for student with studentID in osoc edition with given osocId
 *
 * @param userId: the creator of the evaluation
 * @param studentId: the student about who the evaluation is
 * @param osocId: the id of the osoc edition the evaluation belongs to
 */
export async function getEvaluationByPartiesFor(
    userId: number,
    studentId: number,
    osocId: number
) {
    return await prisma.evaluation.findMany({
        where: {
            login_user_id: userId,
            job_application: { student_id: studentId, osoc_id: osocId },
        },
    });
}

/**
 *
 * @param jobApplicationId: the id of the jobApplication whose evaluations we want to delete
 * @returns the number of deleted records in a promise
 */
export async function deleteEvaluationsByJobApplication(
    jobApplicationId: number
) {
    return await prisma.evaluation.deleteMany({
        where: {
            job_application_id: jobApplicationId,
        },
    });
}
