import prisma from '../prisma/prisma'
import { CreateContract, UpdateContract } from './orm_types';

/**
 * add contract created by login_user_id for student_id that has the role project_role_id
 * 
 * @param contract: CreateContract object with all the info about the contract we want to create (who made the contract for which student for which job)
 * @returns created contract object in the database
 */
 export async function createContract(contract: CreateContract) {
    const result = await prisma.contract.create({
        data: {
            student_id: contract.studentId,
            project_role_id: contract.projectRoleId,
            information: contract.information,
            created_by_login_user_id: contract.loginUserId,
            contract_status: contract.contractStatus,
        }
    });
    return result;
}

/**
 * add contract created by login_user_id for student_id that has the role project_role_id
 * 
 * @param contract: the updated contract. Only the information and contractStatus field can be changed.
 * The created_by_login_user_id is updated to the user that made these last changes
 * @returns the updated contract
 */
export async function updateContract(contract: UpdateContract) {
    const result = await prisma.contract.update({
        where: {
            contract_id: contract.contractId
        },
        data: {
            created_by_login_user_id: contract.loginUserId,
            contract_status: contract.contractStatus,
            information: contract.information
        }
    });
    return result;
}

/**
 * remove all the contracts associated with studentId
 * 
 * @param studentId: the id of the student who's contracts we are removing
 * @returns the number of removed contracts {count: number}
 */ 
export async function removeContractsFromStudent(studentId: number) {
    const result = await prisma.contract.deleteMany({
        where: {
            student_id: studentId
        }
    });
    return result;
}

/**
 * remove the contract with contractId 
 * 
 * @param contractId: the id of the contract we are removing
 * @returns the removed contract
 */ 
export async function removeContract(contractId: number) {
    const result = await prisma.contract.delete({
        where: {
            contract_id: contractId
        }
    });
    return result;
}