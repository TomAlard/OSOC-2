import { getMockReq, getMockRes } from "@jest-mock/express";
import express from "express";
import { mockDeep } from "jest-mock-extended";

import * as session_key from "../orm_functions/session_key";
import * as sessionKey from "../routes/session_key.json";

jest.mock("../orm_functions/session_key");
const session_keyMock = session_key as jest.Mocked<typeof session_key>;

import * as login_user from "../orm_functions/login_user";
jest.mock("../orm_functions/login_user");
const login_userMock = login_user as jest.Mocked<typeof login_user>;

import * as crypto from "crypto";
jest.mock("crypto");
const cryptoMock = crypto as jest.Mocked<typeof crypto>;

import * as config from "../config.json";
import { ApiError, Anything } from "../types";
import * as util from "../utility";
import { errors } from "../utility";

interface Req {
    url: string;
    verb: string;
}

function genPromises(): Promise<unknown>[] {
    const data: unknown[] = [
        6,
        "abc",
        { key: "value" },
        { complex: { object: "with", array: [1, 2, 3, 4] } },
    ];
    const promises: Promise<unknown>[] = data.map((val) =>
        util.debug(val).then((res) => {
            expect(res).toBe(val);
            return res;
        })
    );
    return promises;
}

function obtainResponse() {
    const { res } = getMockRes();
    const statSpy = jest.spyOn(res, "status");
    const sendSpy = jest.spyOn(res, "send");
    return { res, statSpy, sendSpy };
}

test("utility.errors.cook* work as expected", () => {
    // easy ones
    expect(util.errors.cookInvalidID()).toBe(config.apiErrors.invalidID);
    expect(util.errors.cookArgumentError()).toBe(
        config.apiErrors.argumentError
    );
    expect(util.errors.cookUnauthenticated()).toBe(
        config.apiErrors.unauthenticated
    );
    expect(util.errors.cookInsufficientRights()).toBe(
        config.apiErrors.insufficientRights
    );
    expect(util.errors.cookServerError()).toBe(config.apiErrors.serverError);
    expect(util.errors.cookLockedRequest()).toBe(
        config.apiErrors.lockedRequest
    );
    expect(util.errors.cookPendingAccount()).toBe(
        config.apiErrors.pendingAccount
    );

    // annoying ones
    // non-existent endpoint
    const nonexistData: string[] = [
        "/",
        "/login",
        "/student/684648a68498e9/suggest",
    ];
    const nonexistExpect: { url: string; err: ApiError }[] = nonexistData.map(
        (url) => ({
            url: url,
            err: {
                http: config.apiErrors.nonExistent.http,
                reason: config.apiErrors.nonExistent.reason.replace(
                    /~url/,
                    url
                ),
            },
        })
    );
    nonexistExpect.forEach((val) =>
        expect(util.errors.cookNonExistent(val.url)).toStrictEqual(val.err)
    );

    // invalid verb
    const verbs: Req[] = [
        { verb: "GET", url: "/" },
        { verb: "POST", url: "/students/all" },
        { verb: "DELETE", url: "/coach/all" },
        { verb: "PUT", url: "/login" },
        { verb: "HEAD", url: "/admin/all" },
        { verb: "OPTIONS", url: "/student/abcdeabcde" },
    ];
    const verbExpect: { err: ApiError; req: express.Request }[] = verbs.map(
        (v) => {
            const req: express.Request = getMockReq();
            req.method = v.verb;
            req.url = v.url;
            const msg = config.apiErrors.invalidVerb.reason
                .replace(/~url/, v.url)
                .replace(/~verb/, v.verb);
            return {
                err: { http: config.apiErrors.invalidVerb.http, reason: msg },
                req: req,
            };
        }
    );
    verbExpect.forEach((v) =>
        expect(util.errors.cookInvalidVerb(v.req)).toStrictEqual(v.err)
    );

    // non json
    const mimes: string[] = [
        "text/html",
        "audio/aac",
        "image/bmp",
        "text/css",
        "video/mp4",
    ];
    const mimeExpect: { err: ApiError; mime: string }[] = mimes.map((mime) => ({
        mime: mime,
        err: {
            http: config.apiErrors.nonJSONRequest.http,
            reason: config.apiErrors.nonJSONRequest.reason.replace(
                /~mime/,
                mime
            ),
        },
    }));
    mimeExpect.forEach((m) =>
        expect(util.errors.cookNonJSON(m.mime)).toStrictEqual(m.err)
    );
});

test("utility.debug returns identical", () => {
    return Promise.all(genPromises());
});

test("utility.debug logs their data", () => {
    const logSpy = jest.spyOn(console, "log");
    return Promise.all(
        genPromises().map((it) =>
            it.then((val) => expect(logSpy).toHaveBeenCalledWith(val))
        )
    );
});

test("utility.reply writes to a response", () => {
    const data: { status: number; data: unknown }[] = [
        { status: 200, data: "success!" },
        { status: 405, data: "invalid" },
        { status: 200, data: { using: "some", kind: { of: "data" } } },
    ];

    const { res, statSpy, sendSpy } = obtainResponse();

    const promises: Promise<void>[] = data.map((data) =>
        util.reply(res, data.status, data.data).then(() => {
            expect(sendSpy).toBeCalledWith(data.data);
            expect(statSpy).toBeCalledWith(data.status);
        })
    );
    return Promise.all(promises);
});

test("utility.replyError writes to a response", () => {
    // load api errors
    const someUrls: string[] = ["/", "/logout", "/signup"];
    const someVerbs: Req[] = [
        { verb: "PUT", url: "/" },
        { verb: "OPTIONS", url: "/login" },
        { verb: "DELETE", url: "/student/all" },
    ];
    const someReqs: express.Request[] = someVerbs.map((req) => {
        const request: express.Request = getMockReq();
        request.method = req.verb;
        request.url = req.url;
        return request;
    });
    const someMimes: string[] = [
        "text/html",
        "audio/aac",
        "image/bmp",
        "text/css",
        "video/mp4",
    ];

    const errors: ApiError[] = [
        util.errors.cookInvalidID(),
        util.errors.cookArgumentError(),
        util.errors.cookUnauthenticated(),
        util.errors.cookInsufficientRights(),
        util.errors.cookServerError(),
    ];
    someUrls.forEach((url) => errors.push(util.errors.cookNonExistent(url)));
    someReqs.forEach((req) => errors.push(util.errors.cookInvalidVerb(req)));
    someMimes.forEach((mime) => errors.push(util.errors.cookNonJSON(mime)));

    // run tests
    errors.forEach((err) => {
        const { res, statSpy, sendSpy } = obtainResponse();
        const datafield: unknown = { success: false, reason: err.reason };
        util.replyError(res, err).then(() => {
            expect(statSpy).toBeCalledWith(err.http);
            expect(sendSpy).toBeCalledWith(datafield);
        });
    });
});

test("utility.replySuccess writes to a response", () => {
    const successes: Anything[] = [{}];

    successes.forEach((succ) => {
        const { res, statSpy, sendSpy } = obtainResponse();
        util.replySuccess(res, succ).then(() => {
            succ.success = true;
            expect(statSpy).toBeCalledWith(200);
            expect(sendSpy).toBeCalledWith(succ);
        });
    });
});

test("utility.addInvalidVerbs adds verbs", () => {
    const router: express.Router = express.Router();
    const routerSpy = jest.spyOn(router, "all");
    util.addInvalidVerbs(router, "/");
    // we seem unable to trigger the route with jest?
    // please someone check this?
    expect(routerSpy).toHaveBeenCalledTimes(1);
});

// we need to check line_#117 but I have no idea on how to do that...

test("utility.logRequest logs request and passes control", () => {
    const writeSpy = jest.spyOn(console, "log");
    const request: express.Request = getMockReq();
    const callback = jest.fn(() => {
        expect(writeSpy).toHaveBeenCalledWith("GET /student/all");
    });
    request.method = "GET";
    request.url = "/student/all";
    util.logRequest(request, callback);
    expect(callback).toHaveReturnedTimes(1);
});

test("utility.respOrErrorNoReinject sends successes", async () => {
    // positive case
    const { res, statSpy, sendSpy } = obtainResponse();
    const obj: Anything = {
        data: { some: "data" },
        sessionkey: "updated-session-key",
    };
    const exp: unknown = {
        data: { some: "data" },
        sessionkey: "updated-session-key",
        success: true,
    };

    await expect(
        util.respOrErrorNoReinject(res, Promise.resolve(obj))
    ).resolves.not.toThrow();
    expect(sendSpy).toHaveBeenCalledWith(exp);
    expect(statSpy).toHaveBeenCalledWith(200);
});

test("utility.respOrErrorNoReinject sends api errors", () => {
    // api error case
    const { res, statSpy, sendSpy } = obtainResponse();
    const err: ApiError = util.errors.cookArgumentError();
    const errObj: unknown = { success: false, reason: err.reason };
    util.respOrErrorNoReinject(res, Promise.reject(err)).then(() => {
        expect(statSpy).toHaveBeenCalledWith(err.http);
        expect(sendSpy).toHaveBeenCalledWith(errObj);
    });
});

test("utility.respOrErrorNoReinject sends generic errors as server errors", () => {
    const { res, statSpy, sendSpy } = obtainResponse();
    const writeSpy = jest.spyOn(console, "log");
    const error = { msg: "some", error: { generic: true } };
    const send = {
        success: false,
        reason: config.apiErrors.serverError.reason,
    };
    util.respOrErrorNoReinject(res, Promise.reject(error)).then(() => {
        expect(statSpy).toHaveBeenCalledWith(config.apiErrors.serverError.http);
        expect(sendSpy).toHaveBeenCalledWith(send);
        expect(writeSpy).toHaveBeenCalledWith(
            "UNCAUGHT ERROR " + JSON.stringify(error)
        );
    });
});

function setSessionKey(req: express.Request, key: string): void {
    req.headers.authorization = config.global.authScheme + " " + key;
}

test("utility.respOrError sends responses with updated keys", async () => {
    const { res, statSpy, sendSpy } = obtainResponse();
    const req = getMockReq();
    // req.body.sessionkey = "key";
    setSessionKey(req, "key");

    session_keyMock.refreshKey.mockReset();
    session_keyMock.refreshKey.mockImplementation((k, nd) => {
        return Promise.resolve({
            session_key_id: 0,
            login_user_id: 0,
            session_key: k,
            valid_until: nd,
        });
    });

    cryptoMock.createHash.mockReset();
    cryptoMock.createHash.mockImplementation(() => {
        const h = mockDeep<crypto.Hash>();
        h.update.mockImplementation(() => h);
        h.digest.mockImplementation(() => "abcd");
        return h;
    });

    const obj = { data: { some: "data" }, sessionkey: "" };
    const exp = { data: { some: "data" }, sessionkey: "", success: true };

    await expect(
        util.respOrError(req, res, Promise.resolve(obj))
    ).resolves.not.toThrow();
    expect(sendSpy).toHaveBeenCalledWith(exp);
    expect(statSpy).toHaveBeenCalledWith(200);
});

test("utility.redirect sends an HTTP 303", () => {
    const { res, statSpy, sendSpy } = obtainResponse();
    const headerSpy = jest.spyOn(res, "header");
    util.redirect(res, "/some/other/url").then(() => {
        expect(statSpy).toHaveBeenCalledWith(303);
        expect(sendSpy).toHaveBeenCalledTimes(1); // no args
        expect(headerSpy).toHaveBeenCalledWith({ Location: "/some/other/url" });
    });
});

test("utility.checkSessionKey works on valid session key", async () => {
    login_userMock.getLoginUserById.mockReset();
    session_keyMock.checkSessionKey.mockReset();
    login_userMock.getLoginUserById.mockResolvedValue({
        login_user_id: 123456789,
        person_id: 987654321,
        password: "pass",
        is_admin: true,
        is_coach: false,
        account_status: "ACTIVATED",
        person: {
            firstname: "Bob",
            lastname: "Test",
            email: "bob.test@mail.com",
            github: "bob.test@github.com",
            person_id: 987654321,
            github_id: "46845",
        },
    });
    session_keyMock.checkSessionKey.mockResolvedValue({
        login_user_id: 123456789,
    });
    const obj = { sessionkey: "key" };
    const res = {
        data: { sessionkey: "key" },
        userId: 123456789,
        accountStatus: "ACTIVATED",
        is_admin: true,
        is_coach: false,
    };

    await expect(util.checkSessionKey(obj)).resolves.toStrictEqual(res);
    expect(session_keyMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.checkSessionKey).toHaveBeenCalledWith("key");
});

test("utility.checkSessionKey fails on valid session key (pending)", async () => {
    login_userMock.getLoginUserById.mockReset();
    session_keyMock.checkSessionKey.mockReset();
    login_userMock.getLoginUserById.mockResolvedValue({
        login_user_id: 123456789,
        person_id: 987654321,
        password: "pass",
        is_admin: true,
        is_coach: false,
        account_status: "PENDING",
        person: {
            firstname: "Bob",
            lastname: "Test",
            email: "bob.test@mail.com",
            github: "bob.test@github.com",
            person_id: 987654321,
            github_id: "46845",
        },
    });
    session_keyMock.checkSessionKey.mockResolvedValue({
        login_user_id: 123456789,
    });
    const obj = { sessionkey: "key" };

    await expect(util.checkSessionKey(obj)).rejects.toStrictEqual(
        errors.cookPendingAccount()
    );
    expect(session_keyMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.checkSessionKey).toHaveBeenCalledWith("key");
});

test("utility.checkSessionKey works on valid session key (pending,false)", async () => {
    login_userMock.getLoginUserById.mockReset();
    session_keyMock.checkSessionKey.mockReset();
    login_userMock.getLoginUserById.mockResolvedValue({
        login_user_id: 123456789,
        person_id: 987654321,
        password: "pass",
        is_admin: true,
        is_coach: false,
        account_status: "PENDING",
        person: {
            firstname: "Bob",
            lastname: "Test",
            email: "bob.test@mail.com",
            github: "bob.test@github.com",
            person_id: 987654321,
            github_id: "46845",
        },
    });
    session_keyMock.checkSessionKey.mockResolvedValue({
        login_user_id: 123456789,
    });
    const obj = { sessionkey: "key" };
    const res = {
        data: { sessionkey: "key" },
        userId: 123456789,
        accountStatus: "PENDING",
        is_admin: true,
        is_coach: false,
    };

    await expect(util.checkSessionKey(obj, false)).resolves.toStrictEqual(res);
    expect(session_keyMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.checkSessionKey).toHaveBeenCalledWith("key");
});

test("utility.checkSessionKey fails on invalid session key", async () => {
    session_keyMock.checkSessionKey.mockReset();
    session_keyMock.checkSessionKey.mockRejectedValue(new Error());

    await expect(
        util.checkSessionKey({
            sessionkey: "key",
        })
    ).rejects.toStrictEqual(util.errors.cookUnauthenticated());

    expect(session_keyMock.checkSessionKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.checkSessionKey).toHaveBeenCalledWith("key");
});

test(
    "utility.isAdmin should succeed on valid keys, fail on invalid keys" +
        "and fail on non-admin keys",
    async () => {
        session_keyMock.checkSessionKey.mockReset();
        session_keyMock.checkSessionKey.mockImplementation((key: string) => {
            if (key == "key_1") return Promise.resolve({ login_user_id: 1 });
            if (key == "key_2") return Promise.resolve({ login_user_id: 2 });
            return Promise.reject(new Error());
        });

        login_userMock.getLoginUserById.mockReset();
        login_userMock.getLoginUserById.mockImplementation(
            (loginUserId: number) => {
                if (loginUserId == 3)
                    return Promise.reject(errors.cookLockedRequest());
                if (loginUserId == 2)
                    return Promise.resolve({
                        login_user_id: 2,
                        person_id: -2,
                        password: "pass",
                        is_admin: false,
                        is_coach: false,
                        account_status: "ACTIVATED",
                        person: {
                            firstname: "firstname",
                            lastname: "lastname",
                            email: "email@hotmail.com",
                            github: "hiethub",
                            person_id: 1,
                            github_id: "123",
                        },
                    });
                return Promise.resolve({
                    login_user_id: 1,
                    person_id: -1,
                    password: "imapassword",
                    is_admin: true,
                    is_coach: false,
                    account_status: "ACTIVATED",
                    person: {
                        firstname: "firstname",
                        lastname: "lastname",
                        email: "email@mail.com",
                        github: "hiethub",
                        person_id: 0,
                        github_id: "123456",
                    },
                });
            }
        );

        login_userMock.searchAllAdminLoginUsers.mockReset();
        login_userMock.searchAllAdminLoginUsers.mockImplementation(
            (isAdmin: boolean) => {
                if (!isAdmin) return Promise.resolve([]);
                return Promise.resolve([
                    {
                        login_user_id: 1,
                        person_id: -1,
                        password: "imapassword",
                        is_admin: true,
                        is_coach: false,
                        account_status: "ACTIVATED",
                        person: {
                            lastname: "lastname",
                            firstname: "firstname",
                            github: "hiethub",
                            person_id: 0,
                            email: "email@mail.com",
                            github_id: "123456",
                        },
                        session_keys: [],
                    },
                ]);
            }
        );

        // test 1: succesfull
        await expect(
            util.isAdmin({
                sessionkey: "key_1",
            })
        ).resolves.toStrictEqual({
            data: { sessionkey: "key_1" },
            userId: 1,
            accountStatus: "ACTIVATED",
            is_admin: true,
            is_coach: false,
        });
        // test 2: not an admin
        await expect(
            util.isAdmin({
                sessionkey: "key_2",
            })
        ).rejects.toStrictEqual(util.errors.cookInsufficientRights());
        // test 3: invalid key
        await expect(
            util.isAdmin({
                sessionkey: "key_3",
            })
        ).rejects.toStrictEqual(util.errors.cookUnauthenticated());

        expect(session_keyMock.checkSessionKey).toHaveBeenCalledTimes(3);
        expect(login_userMock.searchAllAdminLoginUsers).toHaveBeenCalledTimes(
            2
        );
    }
);

test("utility.isAdmin can catch errors from the DB", async () => {
    session_keyMock.checkSessionKey.mockReset();
    session_keyMock.checkSessionKey.mockImplementation(() =>
        Promise.resolve({ login_user_id: 1 })
    );

    login_userMock.searchAllAdminLoginUsers.mockReset();
    login_userMock.searchAllAdminLoginUsers.mockImplementation(() =>
        Promise.reject({})
    );

    expect(
        util.isAdmin({
            sessionkey: "key",
        })
    ).rejects.toStrictEqual(util.errors.cookInsufficientRights());
});

test("utility.refreshKey removes a key and replaces it", async () => {
    session_keyMock.refreshKey.mockReset();

    // mock Date.now()
    const realDateNow = Date.now.bind(global.Date);
    const dateNowStub = jest.fn(() => 1530518207007);
    global.Date.now = dateNowStub;

    const futureDate = new Date(Date.now());
    futureDate.setDate(futureDate.getDate() + sessionKey.valid_period);
    session_keyMock.refreshKey.mockImplementation((old) => {
        return Promise.resolve({
            session_key_id: 0,
            login_user_id: 0,
            session_key: old,
            valid_until: futureDate,
        });
    });

    cryptoMock.createHash.mockReset();
    cryptoMock.createHash.mockImplementation(() => {
        const h = mockDeep<crypto.Hash>();
        h.update.mockImplementation(() => h);
        h.digest.mockImplementation(() => "abcd");
        return h;
    });

    await expect(util.refreshKey("ab")).resolves.toBe("ab");
    expect(session_keyMock.refreshKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.refreshKey).toHaveBeenCalledWith("ab", futureDate);
    global.Date.now = realDateNow;
});

test("utility.refreshAndInjectKey refreshes a key and injects it", async () => {
    session_keyMock.refreshKey.mockReset();

    // mock Date.now()
    const realDateNow = Date.now.bind(global.Date);
    const dateNowStub = jest.fn(() => 1530518207007);
    global.Date.now = dateNowStub;

    const futureDate = new Date(Date.now());
    futureDate.setDate(futureDate.getDate() + sessionKey.valid_period);
    session_keyMock.refreshKey.mockImplementation((k) => {
        return Promise.resolve({
            session_key_id: 0,
            login_user_id: 0,
            session_key: k,
            valid_until: futureDate,
        });
    });

    cryptoMock.createHash.mockReset();
    cryptoMock.createHash.mockImplementation(() => {
        const h = mockDeep<crypto.Hash>();
        h.update.mockImplementation(() => h);
        h.digest.mockImplementation(() => "abcd");
        return h;
    });

    const initial = {
        sessionkey: "",
        data: { id: 5, name: "jef", email: "jef@jef.com" },
    };

    const result = {
        sessionkey: "",
        data: { id: 5, name: "jef", email: "jef@jef.com" },
    };

    expect(util.refreshAndInjectKey("ab", initial)).resolves.toStrictEqual(
        result
    );
    expect(session_keyMock.refreshKey).toHaveBeenCalledTimes(1);
    expect(session_keyMock.refreshKey).toHaveBeenCalledWith("ab", futureDate);

    global.Date.now = realDateNow;
});

test("utility.getSessionKey fetches session key or crashes", () => {
    const r = getMockReq();
    const err = "No session key - you should check for the session key first.";
    setSessionKey(r, "some_key");
    expect(util.getSessionKey(r)).toBe("some_key");

    const f1 = getMockReq();
    f1.headers.authorization = "some_key";
    expect(() => util.getSessionKey(f1)).toThrow(err);

    const f2 = getMockReq();
    expect(() => util.getSessionKey(f2)).toThrow(err);
});

test("utility.getOrDefault returns the correct values", () => {
    expect(util.getOrDefault(null, 1)).toBe(1);
    expect(util.getOrDefault(undefined, "hello")).toBe("hello");
    expect(util.getOrDefault(27, 59)).toBe(27);
});
