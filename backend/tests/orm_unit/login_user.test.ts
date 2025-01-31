import { prismaMock } from "./singleton";
import { account_status_enum } from "@prisma/client";
import {
    CreateLoginUser,
    UpdateLoginUser,
} from "../../orm_functions/orm_types";
import {
    createLoginUser,
    getAllLoginUsers,
    getPasswordLoginUserByPerson,
    getPasswordLoginUser,
    searchLoginUserByPerson,
    searchAllAdminLoginUsers,
    searchAllCoachLoginUsers,
    searchAllAdminAndCoachLoginUsers,
    updateLoginUser,
    deleteLoginUserById,
    deleteLoginUserByPersonId,
    getLoginUserById,
    setCoach,
    setAdmin,
    filterLoginUsers,
} from "../../orm_functions/login_user";

const response = {
    session_id: "50",
    login_user_id: 1,
    person_id: 0,
    password: "password",
    is_admin: false,
    is_coach: false,
    session_keys: ["key1", "key2"],
    account_status: account_status_enum.DISABLED,
};

const returnValue = {
    login_user_id: 0,
    person_id: 0,
    password: "Password",
    is_admin: true,
    is_coach: true,
    account_status: account_status_enum.ACTIVATED,
    session_keys: [],
};

test("should create a login user in the db with the given object, returns the new record", async () => {
    const loginUser: CreateLoginUser = {
        personId: 0,
        password: "Password",
        isAdmin: true,
        isCoach: true,
        accountStatus: account_status_enum.ACTIVATED,
    };

    prismaMock.login_user.create.mockResolvedValue(returnValue);
    await expect(createLoginUser(loginUser)).resolves.toEqual(returnValue);
});

test("should return all login users in the db", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(getAllLoginUsers()).resolves.toEqual([returnValue]);
});

test("should return the HASHED password of the given person", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(returnValue);
    await expect(getPasswordLoginUserByPerson(0)).resolves.toEqual(returnValue);
});

test("should return the HASHED password of the given login user", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(returnValue);
    await expect(getPasswordLoginUser(0)).resolves.toEqual(returnValue);
});

test("should return the searched login user record with the given person id", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(returnValue);
    await expect(searchLoginUserByPerson(0)).resolves.toEqual(returnValue);
});

test("should return all the login user records that are admin", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(searchAllAdminLoginUsers(true)).resolves.toEqual([
        returnValue,
    ]);
});

test("should return all the login user records that are coach", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(searchAllCoachLoginUsers(true)).resolves.toEqual([
        returnValue,
    ]);
});

test("should return all the login user records that are coach aswell as admin", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(searchAllAdminAndCoachLoginUsers(true)).resolves.toEqual([
        returnValue,
    ]);
});

test("should update the login user with the new data and return the updated record", async () => {
    const loginUser: UpdateLoginUser = {
        loginUserId: 0,
        password: "New_pass",
        isAdmin: false,
        isCoach: false,
        accountStatus: "ACTIVATED",
    };

    prismaMock.login_user.update.mockResolvedValue(returnValue);
    await expect(updateLoginUser(loginUser)).resolves.toEqual(returnValue);
});

test("should delete the login user with the given id and return the deleted record", async () => {
    prismaMock.login_user.delete.mockResolvedValue(returnValue);
    await expect(deleteLoginUserById(0)).resolves.toEqual(returnValue);
});

test("should delete the login user with the given person id and return the deleted record", async () => {
    prismaMock.login_user.delete.mockResolvedValue(returnValue);
    await expect(deleteLoginUserByPersonId(0)).resolves.toEqual(returnValue);
});

test("should return the login_user with given id", async () => {
    prismaMock.login_user.findUnique.mockResolvedValue(response);
    await expect(getLoginUserById(0)).resolves.toEqual(response);
});

test("should return the filtered list of users", async () => {
    prismaMock.login_user.findMany.mockResolvedValue([returnValue]);
    await expect(
        filterLoginUsers(
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        )
    ).resolves.toEqual([returnValue]);
});

test("should reject and throw an error because only sorting on 1 field is allowed", async () => {
    try {
        await filterLoginUsers(
            undefined,
            undefined,
            "asc",
            "desc",
            undefined,
            undefined,
            undefined
        );
        // this should never get executed because filterLoginUser should reject
        expect(true).toBeFalsy();
    } catch (e) {
        // This should get executed!
        expect(true).toBeTruthy();
    }
});

test("should return the updated login_user", async () => {
    prismaMock.login_user.update.mockResolvedValue(response);
    await expect(setCoach(0, true)).resolves.toEqual(response);
});

test("should return the updated login_user", async () => {
    prismaMock.login_user.update.mockResolvedValue(response);
    await expect(setAdmin(0, true)).resolves.toEqual(response);
});
