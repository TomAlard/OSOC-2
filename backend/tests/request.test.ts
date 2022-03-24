import {getMockReq} from '@jest-mock/express';
import express from 'express';

import * as Rq from '../request'
import * as T from '../types';
import {errors} from '../utility';

test("Can parse Key-only requests", () => {
  const valid: express.Request = getMockReq();
  const invalid: express.Request = getMockReq();
  const wrongprop: express.Request = getMockReq();

  valid.body.sessionkey = "hello I am a key";
  wrongprop.body.key = "hello I am a key as well";

  const calls = [
    Rq.parseLogoutRequest, Rq.parseStudentAllRequest, Rq.parseCoachAllRequest,
    Rq.parseGetAllCoachRequestsRequest, Rq.parseAdminAllRequest,
    Rq.parseProjectAllRequest, Rq.parseConflictAllRequest,
    Rq.parseFollowupAllRequest, Rq.parseTemplateListRequest
  ];

  const successes =
      calls.map(call => expect(call(valid)).resolves.toStrictEqual({
        sessionkey : "hello I am a key"
      }));

  const failures = calls.flatMap(call => [call(invalid), call(wrongprop)])
                       .map(sub => expect(sub).rejects.toStrictEqual(
                                errors.cookUnauthenticated()));

  return Promise.all([ successes, failures ].flat());
});

test("Can parse Key-ID requests", () => {
  const res:
      T.Requests.IdRequest = {sessionkey : "Hello I am a key", id : 20123};
  const valid: express.Request = getMockReq();
  const neither: express.Request = getMockReq();
  const onlyKey: express.Request = getMockReq();
  const onlyid: express.Request = getMockReq();

  valid.body.sessionkey = res.sessionkey;
  valid.params.id = res.id.toString();
  onlyKey.body.sessionkey = res.sessionkey;
  onlyid.params.id = res.id.toString();

  const calls = [
    Rq.parseSingleStudentRequest, Rq.parseDeleteStudentRequest,
    Rq.parseStudentGetSuggestsRequest, Rq.parseSingleCoachRequest,
    Rq.parseDeleteCoachRequest, Rq.parseGetCoachRequestRequest,
    Rq.parseAcceptNewCoachRequest, Rq.parseDenyNewCoachRequest,
    Rq.parseSingleAdminRequest, Rq.parseDeleteAdminRequest,
    Rq.parseSingleProjectRequest, Rq.parseDeleteProjectRequest,
    Rq.parseGetDraftedStudentsRequest, Rq.parseGetFollowupStudentRequest,
    Rq.parseGetTemplateRequest, Rq.parseDeleteTemplateRequest
  ];

  const successes =
      calls.map(call => expect(call(valid)).resolves.toStrictEqual(res));

  const failures = calls.flatMap(call => [call(neither), call(onlyid)])
                       .map(sub => expect(sub).rejects.toStrictEqual(
                                errors.cookUnauthenticated()));

  const otherfails = calls.map(call => call(onlyKey))
                         .map(sub => expect(sub).rejects.toStrictEqual(
                                  errors.cookArgumentError()));

  return Promise.all([ successes, failures, otherfails ].flat());
})

// TODO: fix deze test

// test("Can parse update login user requests", () => {
//   const key: string = "key_u1";
//   const id: number = 64564;
//
//   const fillReq = (v: any) => {
//     var r = getMockReq();
//     r.params.id = v.id;
//     r.body.sessionkey = v.sessionkey;
//     ["pass", "isAdmin", "isCoach"].forEach(k => {
//       if (k in v)
//         r.body[k] = v[k]
//     });
//     return r;
//   };
//
//   const check =
//       (v: T.Requests.UpdateLoginUser, og: T.Requests.UpdateLoginUser) => {
//         expect(v.id).toBe(og.id);
//         expect(v.sessionkey).toBe(og.sessionkey);
//         expect(v.pass).toBe(og.pass);
//       };
//
//   const funcs = [ Rq.parseUpdateCoachRequest, Rq.parseUpdateAdminRequest ];
//
//   const options = [
//     {pass : "user1iscool", id : id, sessionkey : key, isAdmin: true, isCoach: true},
//     // {emailOrGithub : "user1@user2.be", id : id, sessionkey : key},
//     // {firstName : "User", id : id, sessionkey : key},
//     // {lastName : "One", id : id, sessionkey : key},
//     // {gender : "eno", id : id, sessionkey : key},
//     // {pass : "user1iscool", id : id, sessionkey : key},
//     // {gender : "eno", firstName : "Dead", id : id, sessionkey : key}, {
//     //   emailOrGithub : "user-1_git",
//     //   firstName : "Jef",
//     //   lastName : "Pollaq",
//     //   gender : "male",
//     //   pass : "",
//     //   id : id,
//     //   sessionkey : key
//     // }
//   ].map(v => ({val : fillReq(v), og : v}));
//
//   const res:
//       T.Requests.IdRequest = {sessionkey : "Hello I am a key", id : 684684};
//
//   var noupdate: express.Request = getMockReq();
//   var neither: express.Request = getMockReq();
//   var onlyKey: express.Request = getMockReq();
//   var onlyid: express.Request = getMockReq();
//
//   noupdate.body.sessionkey = res.sessionkey;
//   noupdate.params.id = res.id.toString();
//   onlyKey.body.sessionkey = res.sessionkey;
//   onlyid.params.id = res.id.toString();
//
//   const successes =
//       options.flatMap(v => funcs.map(f => ({val : f(v.val), og : v.og})))
//           .map(x => x.val.then(v => check(v, x.og)));
//
//   const failures = [ noupdate, onlyKey ]
//                        .flatMap(v => funcs.map(f => f(v)))
//                        .map(x => {expect(x).rejects.toStrictEqual(
//                                 errors.cookArgumentError())});
//
//   const failures2 = [ neither, onlyid ]
//                         .flatMap(v => funcs.map(f => f(v)))
//                         .map(x => {expect(x).rejects.toStrictEqual(
//                                  errors.cookUnauthenticated())});
//
//   return Promise.all([ successes, failures, failures2 ].flat());
// });

test("Can parse login request", () => {
  const valid: express.Request = getMockReq();
  const noname: express.Request = getMockReq();
  const nopass: express.Request = getMockReq();

  valid.body.name = "Name #1";
  valid.body.pass = "Pass #1";
  noname.body.pass = "Pass #2";
  nopass.body.name = "Name #2";

  return Promise.all([
    expect(Rq.parseLoginRequest(valid))
        .resolves.toStrictEqual({name : "Name #1", pass : "Pass #1"}),
    expect(Rq.parseLoginRequest(noname))
        .rejects.toBe(errors.cookArgumentError()),
    expect(Rq.parseLoginRequest(nopass))
        .rejects.toBe(errors.cookArgumentError())
  ]);
});

test("Can parse update student request", () => {
  const dataV: any = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    alumni : false,
    firstName : "ab",
    lastName : "c",
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    nickname : "jefke",
    education : {
      level : 7,
      duration : 9,
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  const failure1: any = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    firstName : "ab", // no last name
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    education : {
      level : 7,
      duration : 9,
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  const failure2: any = {
    sessionkey : "abcdef",
    emailOrGithub : "ab@c.de",
    firstName : "ab",
    lastName : "c",
    gender : "Apache Attack Helicopter",
    pronouns : "vroom/vroom",
    phone : "+32420 696969",
    education : {
      level : 7, // missing duration
      year : "something?!?!?",
      institute : "KULeuven"
    }
  };

  const failure3: any = {sessionkey : "abcdef"};

  const id = 60011223369;

  const valid: express.Request = getMockReq();
  const ival1: express.Request = getMockReq();
  const ival2: express.Request = getMockReq();
  const ival3: express.Request = getMockReq();

  valid.body = {...dataV};
  valid.params.id = id.toString();
  ival1.body = {...failure1};
  ival1.params.id = id.toString();
  ival2.body = {...failure2};
  ival2.params.id = id.toString();
  ival3.body = {...failure3};
  ival3.params.id = id.toString();

  dataV.id = id;
  failure1.id = id;
  failure1.lastName = undefined;
  failure1.alumni = undefined;
  failure1.nickname = undefined;
  failure2.id = id;
  failure2.education.duration = undefined;
  failure2.alumni = undefined;
  failure2.nickname = undefined;

  const error = errors.cookArgumentError();

  return Promise.all([
    expect(Rq.parseUpdateStudentRequest(valid)).resolves.toStrictEqual(dataV),
    expect(Rq.parseUpdateStudentRequest(ival1))
        .resolves.toStrictEqual(failure1),
    expect(Rq.parseUpdateStudentRequest(ival2))
        .resolves.toStrictEqual(failure2),
    expect(Rq.parseUpdateStudentRequest(ival3)).rejects.toStrictEqual(error)
  ]);
});

test("Can parse suggest student request", () => {
  const key = "my-session-key";
  const id = 9845;
  const ys: any = {suggestion : "YES", sessionkey : key, senderId: 0};
  const mb: any = {suggestion : "MAYBE", sessionkey : key, senderId: 0};
  const no: any = {suggestion : "NO", sessionkey : key, senderId: 0};
  const nr: any = {
    suggestion : "NO",
    reason : "I just don't like you",
    sessionkey : key,
    senderId: 0
  };
  const i1: any = {suggestion : "TOMORROW", sessionkey : key, senderId: 0};
  const i2: any = {suggestion : "no", sessionkey : key, senderId: 0}; // no caps
  const i3: any = {sessionkey : key, senderId: 0};

  const okays = [ ys, mb, no, nr ].map(x => {
    const copy: any = {...x};
    copy.id = id;
    const req: express.Request = getMockReq();
    req.params.id = id.toString();
    req.body = x;
    ["reason"].forEach(x => {
      if (!(x in req.body)) {
        copy[x] = undefined
      }
    });
    return expect(Rq.parseSuggestStudentRequest(req))
        .resolves.toStrictEqual(copy);
  });

  const fails = [ i1, i2, i3 ].map(x => {
    const req: express.Request = getMockReq();
    req.params.id = id.toString();
    req.body = {...x};
    return expect(Rq.parseSuggestStudentRequest(req))
        .rejects.toBe(errors.cookArgumentError());
  });

  return Promise.all([ okays, fails ].flat());
});

test("Can parse final decision request", () => {
  const key = "key";
  const id = 6969420420;
  const data: any = {sessionkey : key};
  const dat2: any = {reply : "YES", sessionkey : key};
  const dat3: any = {reply : "NO", sessionkey : key};
  const dat4: any = {reply : "MAYBE", sessionkey : key};
  const dat5: any = {reply : "something", sessionkey : key};
  const dat6: any = {reply : "maybe", sessionkey : key};
  const dat7: any = {reply : "YES"};

  const p = [ data, dat2, dat3, dat4 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    x.id = id;
    if (!("reply" in x))
      x.reply = undefined;

    return expect(Rq.parseFinalizeDecisionRequest(r)).resolves.toStrictEqual(x);
  });

  const q = [ dat5, dat6 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    x.id = id;
    return expect(Rq.parseFinalizeDecisionRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  const r = [ dat7 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    x.id = id;
    return expect(Rq.parseFinalizeDecisionRequest(r))
        .rejects.toBe(errors.cookUnauthenticated());
  });

  return Promise.all([ p, q, r ].flat());
});

test("Can parse coach access request", () => {
  const r1: any = {
    firstName : "Jeff",
    lastName : "Georgette",
    emailOrGithub : "idonthavegithub@git.hub",
    pass : "thisismypassword"
  };

  const r2: any = {
    firstName : "Jeff",
    lastName : "Georgette",
    emailOrGithub : "idonthavegithub@git.hub"
  };

  const req1: express.Request = getMockReq();
  req1.body = {...r1};

  const req2: express.Request = getMockReq();
  req2.body = {...r2};
  r2.pass = undefined;

  const req3: express.Request = getMockReq();
  req3.body = {};

  const prom1: Promise<void> =
      expect(Rq.parseRequestCoachRequest(req1)).resolves.toStrictEqual(r1);
  const prom2: Promise<void> =
      expect(Rq.parseRequestCoachRequest(req2)).resolves.toStrictEqual(r2);
  const prom3: Promise<void> = expect(Rq.parseRequestCoachRequest(req3))
                                 .rejects.toBe(errors.cookArgumentError());

  return Promise.all([ prom1, prom2, prom3 ]);
});

test("Can parse new project request", () => {
  const key = "abcdefghijklmnopqrstuvwxyz";
  const d1: any = {
    sessionkey : key,
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    end : Date.now(),
    positions : 69
  };
  const d2: any = {sessionkey : key};
  const d3: any = {
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    end : Date.now(),
    positions : 420
  };

  const req1: express.Request = getMockReq();
  const req2: express.Request = getMockReq();
  const req3: express.Request = getMockReq();

  req1.body = {...d1};
  req2.body = {...d2};
  req3.body = {...d3};

  const p1: Promise<void> =
      expect(Rq.parseNewProjectRequest(req1)).resolves.toStrictEqual(d1);
  const p2: Promise<void> = expect(Rq.parseNewProjectRequest(req2))
                              .rejects.toBe(errors.cookArgumentError());
  const p3: Promise<void> = expect(Rq.parseNewProjectRequest(req3))
                              .rejects.toBe(errors.cookUnauthenticated());

  return Promise.all([ p1, p2, p3 ]);
});

test("Can parse update project request", () => {
  const key = "abcdefghijklmnopqrstuvwxyz";
  const id = 6845684;
  const d1: any = {
    sessionkey : key,
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    end : Date.now(),
    positions : 69
  };
  const d2: any = {sessionkey : key};
  const d3: any = {
    sessionkey : key,
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    positions : 420
  };
  const d4: any = {
    name : "Experiment One",
    partner : "Simic Combine",
    start : Date.now(),
    end : Date.now(),
    positions : 69
  };

  const req1: express.Request = getMockReq();
  const req2: express.Request = getMockReq();
  const req3: express.Request = getMockReq();
  const req4: express.Request = getMockReq();
  const req5: express.Request = getMockReq();

  req1.body = {...d1};
  req1.params.id = id.toString();
  req2.body = {...d2};
  req2.params.id = id.toString();
  req3.body = {...d3};
  req3.params.id = id.toString();
  req4.body = {...d4};
  req4.params.id = id.toString();
  req5.body = {...d1};

  d1.id = id;
  d2.id = id;
  d3.id = id;
  d3.end = undefined;
  d4.id = id;

  const p1: Promise<void> =
      expect(Rq.parseUpdateProjectRequest(req1)).resolves.toStrictEqual(d1);
  const p2: Promise<void> = expect(Rq.parseUpdateProjectRequest(req2))
                              .rejects.toBe(errors.cookArgumentError());
  const p3: Promise<void> =
      expect(Rq.parseUpdateProjectRequest(req3)).resolves.toStrictEqual(d3);
  const p4: Promise<void> = expect(Rq.parseUpdateProjectRequest(req4))
                              .rejects.toBe(errors.cookUnauthenticated());
  const p5: Promise<void> = expect(Rq.parseUpdateProjectRequest(req5))
                              .rejects.toBe(errors.cookArgumentError());

  return Promise.all([ p1, p2, p3, p4, p5 ]);
});

test("Can parse draft student request", () => {
  const key = "keyyyyy";
  const id = 89846;

  const d1: any = {
    sessionkey : key,
    studentId : "im-a-student",
    roles : [ "the", "one", "that", "does", "nothing" ]
  };
  const d2: any = {sessionkey : key, studentId : "im-a-student"};
  const d3: any = {
    studentId : "im-a-student",
    roles : [ "the", "one", "that", "does", "nothing" ]
  };

  const r1: express.Request = getMockReq();
  const r2: express.Request = getMockReq();
  const r3: express.Request = getMockReq();
  const r4: express.Request = getMockReq();

  r1.body = {...d1};
  r2.body = {...d2};
  r3.body = {...d3};
  r4.body = {...d1};

  r1.params.id = id.toString();
  r2.params.id = id.toString();
  r3.params.id = id.toString();

  d1.id = id;
  d2.id = id;
  d3.id = id;

  const p1: Promise<void> =
      expect(Rq.parseDraftStudentRequest(r1)).resolves.toStrictEqual(d1);
  const p2: Promise<void> = expect(Rq.parseDraftStudentRequest(r2))
                              .rejects.toBe(errors.cookArgumentError());
  const p3: Promise<void> = expect(Rq.parseDraftStudentRequest(r3))
                              .rejects.toBe(errors.cookUnauthenticated());
  const p4: Promise<void> = expect(Rq.parseDraftStudentRequest(r4))
                              .rejects.toBe(errors.cookArgumentError());

  return Promise.all([ p1, p2, p3, p4 ]);
});

test("Can parse mark as followed up request", () => {
  const key = "my-key-arrived-but";
  const id = 78945312;

  const ht: any = {sessionkey : key, type : "hold-tight"};
  const cf: any = {sessionkey : key, type : "confirmed"};
  const cd: any = {sessionkey : key, type : "cancelled"};
  const i1: any = {sessionkey : key, type : "invalid"};
  const i2: any = {type : "hold-tight"};
  const i3: any = {sessionkey : key};

  const okays = [ ht, cf, cd ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    x.id = id;
    return expect(Rq.parseSetFollowupStudentRequest(r))
        .resolves.toStrictEqual(x);
  });

  const fails1 = [ i1, i3 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    x.id = id;
    return expect(Rq.parseSetFollowupStudentRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  const fails2 = [ ht ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    return expect(Rq.parseSetFollowupStudentRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  const fails3 = [ i2 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    x.id = id;
    return expect(Rq.parseSetFollowupStudentRequest(r))
        .rejects.toBe(errors.cookUnauthenticated());
  });

  return Promise.all([ okays, fails1, fails2, fails3 ].flat());
});

test("Can parse new template request", () => {
  const key = "yet-another-session-key";

  const ok1:
      any = {name : "my-template", content : "hello-there", sessionkey : key};
  const ok2: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
  };
  const ok3: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    cc : "cc@gmail.com"
  };
  const ok4: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  const ok5: any = {
    name : "my-template",
    content : "hello-there",
    subject : "I like C++",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };

  const f1: any = {
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  const f2: any = {
    name : "my-template",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  const f3: any = {
    name : "my-template",
    content : "hello-there",
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };

  const okays = [ ok1, ok2, ok3, ok4, ok5 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    ["desc", "cc", "subject"].forEach(v => {
      if (!(v in x))
        x[v] = undefined;
    });

    return expect(Rq.parseNewTemplateRequest(r)).resolves.toStrictEqual(x);
  });

  const fails1 = [ f1, f2 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    return expect(Rq.parseNewTemplateRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  const fails2 = [ f3 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    return expect(Rq.parseNewTemplateRequest(r))
        .rejects.toBe(errors.cookUnauthenticated());
  });

  return Promise.all([ okays, fails1, fails2 ].flat());
});

test("Can parse update template request", () => {
  const key = "yet-another-session-key";
  const id = 987465327465;

  const ok1:
      any = {name : "my-template", content : "hello-there", sessionkey : key};
  const ok2: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?"
  };
  const ok3: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    cc : "cc@gmail.com"
  };
  const ok4: any = {
    name : "my-template",
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  const ok5: any = {
    content : "hello-there",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  const ok6: any = {
    name : "my-template",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };
  const ok7: any = {
    name : "my-template",
    content : "hello-there",
    subject : "I like C++",
    sessionkey : key,
    desc : "a description did you know that orcas have culture?",
    cc : "cc@gmail.com"
  };

  const f1: any = {sessionkey : key};
  const f2: any = {name : "my-template", content : "hello-there"};

  const okays = [ ok1, ok2, ok3, ok4, ok5, ok6, ok7 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    x.id = id;
    ["name", "content", "subject", "desc", "cc"].forEach(v => {
      if (!(v in x))
        x[v] = undefined;
    });

    return expect(Rq.parseUpdateTemplateRequest(r)).resolves.toStrictEqual(x);
  });

  const fails1 = [ f1 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    return expect(Rq.parseUpdateTemplateRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  const fails2 = [ ok1 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    return expect(Rq.parseUpdateTemplateRequest(r))
        .rejects.toBe(errors.cookArgumentError());
  });

  const fails3 = [ f2 ].map(x => {
    const r: express.Request = getMockReq();
    r.body = {...x};
    r.params.id = id.toString();
    return expect(Rq.parseUpdateTemplateRequest(r))
        .rejects.toBe(errors.cookUnauthenticated());
  });

  return Promise.all([ okays, fails1, fails2, fails3 ].flat());
});
