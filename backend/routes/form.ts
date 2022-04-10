/* eslint-disable @typescript-eslint/no-unused-vars */
import express from 'express';

import * as ormP from '../orm_functions/person';
import * as ormSt from '../orm_functions/student';
import * as ormOs from '../orm_functions/osoc';
import * as ormJo from '../orm_functions/job_application';
import {Requests, Responses} from '../types';
import * as util from "../utility";
import {errors} from "../utility";
import * as validator from 'validator';

/**
 *  This function searches a question with a given key in the form.
 *  @param form The form with the answers.
 *  @param key The key of the question.
 *  @returns The question that corresponds with the given key.
 */
function filterQuestion(form: Requests.Form, key: string): Responses.FormResponse<Requests.Question> {
    const filteredQuestion = form.data.fields.filter(question => question.key == key);
    return filteredQuestion.length > 0 ? {data : filteredQuestion[0]} : {data : null};
}

/**
 *  This function searches the chosen option for a given question.
 *  @param question The question.
 *  @returns The option that corresponds with the given answer.
 */
function filterChosenOption(question: Requests.Question): Responses.FormResponse<Requests.Option> {
    if(question.options != undefined) {
        const filteredOption = question.options.filter(option => option.id === question.value);
        return {data : filteredOption[0]};
    }
    return {data : null}
}

/**
 *  This function checks if the answer on a certain question contains a word.
 *  @param question The question.
 *  @param word the word we are searching for in the answer.
 *  @returns True if the question options contain the word, else false.
 */
function checkWordInAnswer(question: Requests.Question, word : string): Responses.FormResponse<boolean> {
    const chosenOption : Responses.FormResponse<Requests.Option> = filterChosenOption(question);
    return chosenOption.data != null ? {data : chosenOption.data.text.toLowerCase().includes(word)} : {data : null};
}

function checkQuestionsExist(questions: Responses.FormResponse<Requests.Question>[]) : boolean {
    const checkErrorInForm : Responses.FormResponse<Requests.Question>[] = questions.filter(dataError => dataError.data == null);
    return checkErrorInForm.length === 0;
}

/* parse form to person
***********************/

/**
 *  Parse the form to the birth name of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getBirthName(form: Requests.Form) : Promise<string> {
    const questionBirthName: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_npDErJ");
    const questionsExist : boolean = checkQuestionsExist([questionBirthName]);
    if(!questionsExist || questionBirthName.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }
    return Promise.resolve(questionBirthName.data.value);
}

/**
 *  Parse the form to the last name of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getLastName(form: Requests.Form) : Promise<string> {
    const questionLastName: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_319eXp");
    const questionsExist : boolean = checkQuestionsExist([questionLastName]);
    if(!questionsExist || questionLastName.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }
    return Promise.resolve(questionLastName.data.value);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEmail(form: Requests.Form) : Promise<string> {
    const questionEmail: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mY46PB");
    const questionsExist : boolean = checkQuestionsExist([questionEmail]);
    if(!questionsExist || questionEmail.data?.value == null || !validator.default.isEmail(questionEmail.data.value)) {
        return Promise.reject(errors.cookArgumentError());
    }
    return Promise.resolve(validator.default.normalizeEmail(questionEmail.data.value).toString());
}

/**
 *  Attempts to parse the answers in the form into a person entity.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToPerson(form: Requests.Form): Promise<Responses.Id> {
    const birthName = await getBirthName(form);
    const lastName = await getLastName(form);
    const email = await getEmail(form);

    const person = await ormP.createPerson({firstname : birthName, lastname : lastName, email : email});

    return Promise.resolve({id: person.person_id});
}

/* parse form to student
************************/

/**
 *  Parse the form to the pronouns of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getPronouns(form: Requests.Form) : Promise<string[] | null> {
    const questionPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3yJQMg");
    const questionPreferedPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3X4aLg");
    const questionEnterPronouns: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_w8ZBq5");

    const questionsExist : boolean = checkQuestionsExist([questionPronouns, questionPreferedPronouns, questionEnterPronouns]);
    if(!questionsExist || questionPronouns.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let pronouns: string[] | null = null;

    const wordInAnswer :  Responses.FormResponse<boolean> = checkWordInAnswer(questionPronouns.data, "yes");

    if(wordInAnswer.data == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    if(wordInAnswer) {
        const chosenOption : Responses.FormResponse<Requests.Option> = filterChosenOption(questionPreferedPronouns.data as Requests.Question);
        if(chosenOption.data == null || chosenOption.data?.id.length === 0 || questionPreferedPronouns.data?.value == null || checkWordInAnswer(questionPreferedPronouns.data, "other").data == null) {
            return Promise.reject(util.errors.cookArgumentError());
        } else if(!checkWordInAnswer(questionPreferedPronouns.data, "other").data && chosenOption.data?.text != undefined) {
            pronouns = chosenOption.data.text.split("/");
        } else {
            if(questionEnterPronouns.data?.value == null) {
                return Promise.reject(util.errors.cookArgumentError());
            }
            pronouns = questionEnterPronouns.data.value.split("/");
        }
    }

    return Promise.resolve(pronouns);
}

/**
 *  Parse the form to the gender of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getGender(form: Requests.Form) : Promise<string> {
    const questionGender: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wg9laO");
    const questionsExist : boolean = checkQuestionsExist([questionGender]);
    if(!questionsExist || questionGender.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenGender : Responses.FormResponse<Requests.Option> = filterChosenOption(questionGender.data);

    if(chosenGender.data == null || chosenGender.data.id.length === 0) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(chosenGender.data.text);
}

/**
 *  Parse the form to the phone number of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getPhoneNumber(form: Requests.Form) : Promise<string> {
    const questionPhoneNumber: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wd9MEo");
    const questionsExist : boolean = checkQuestionsExist([questionPhoneNumber]);
    if(!questionsExist || questionPhoneNumber.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }
    return Promise.resolve(questionPhoneNumber.data.value);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getNickname(form: Requests.Form) : Promise<string | null> {
    const questionCheckNickname: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wME4XM");
    const questionEnterNickname: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mJOPqo");

    const questionsExist : boolean = checkQuestionsExist([questionCheckNickname, questionEnterNickname]);
    if(!questionsExist || questionCheckNickname.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    let nickname = null;

    if (checkWordInAnswer(questionCheckNickname.data, "yes")) {
        if(questionEnterNickname.data?.value == null) {
            return Promise.reject(errors.cookArgumentError());
        }
        nickname = questionEnterNickname.data.value;
    }

    return Promise.resolve(nickname);
}

/**
 *  Parse the form to the email of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getAlumni(form: Requests.Form) : Promise<boolean> {
    const questionCheckAlumni: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mVzejJ");

    const questionsExist : boolean = checkQuestionsExist([questionCheckAlumni]);

    if(!questionsExist || questionCheckAlumni.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const wordInAnswer : boolean | null = checkWordInAnswer(questionCheckAlumni.data, "yes").data;

    if(wordInAnswer == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(wordInAnswer);
}

/**
 *  Attempts to parse the answers in the form into a student entity.
 *  @param form The form with the answers.
 *  @param personId The id of a person.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToStudent(form: Requests.Form, personId: Responses.Id): Promise<Responses.Id> {
    const pronouns = await getPronouns(form);
    const gender = await getGender(form);
    const phoneNumber = await getPhoneNumber(form);
    const nickname = await getNickname(form);
    const alumni = await getAlumni(form);

    const student = await ormSt.createStudent({
        personId : personId.id,
        gender : gender,
        pronouns : pronouns != null ? pronouns : undefined,
        phoneNumber : phoneNumber,
        nickname : nickname != null ? nickname : undefined,
        alumni : alumni
    });

    return Promise.resolve({id: student.student_id});
}

/* parse form to job application
********************************/

/**
 *  Parse the form to the responsibilities of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getResponsibilities(form: Requests.Form) : Promise<string | null> {
    const questionCheckResponsibilities: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wLPr9v");

    const questionsExist : boolean = checkQuestionsExist([questionCheckResponsibilities]);

    if(!questionsExist) {
        return Promise.reject(errors.cookArgumentError());
    }

    if(questionCheckResponsibilities.data?.value == undefined) {
        return Promise.resolve(null);
    }

    return Promise.resolve(questionCheckResponsibilities.data?.value);
}

/**
 *  Parse the form to the fun fact of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getFunFact(form: Requests.Form) : Promise<string> {
    const questionFunFact: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_nPzxpV");

    const questionsExist : boolean = checkQuestionsExist([questionFunFact]);

    if(!questionsExist || questionFunFact.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(questionFunFact.data.value);
}

/**
 *  Parse the form to the volunteer info of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getVolunteerInfo(form: Requests.Form) : Promise<string> {
    const questionCheckVolunteerInfo: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_wvPZM0");

    const questionsExist : boolean = checkQuestionsExist([questionCheckVolunteerInfo]);

    if(!questionsExist || questionCheckVolunteerInfo.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const chosenVolunteerInfo : Responses.FormResponse<Requests.Option> = filterChosenOption(questionCheckVolunteerInfo.data);

    if(chosenVolunteerInfo.data == null || chosenVolunteerInfo.data.id.length === 0) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(chosenVolunteerInfo.data.text);
}

/**
 *  Parse the form to the choice of being a student coach.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function isStudentCoach(form: Requests.Form) : Promise<boolean> {
    const questionStudentCoach: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_nPzxD5");

    const questionsExist : boolean = checkQuestionsExist([questionStudentCoach]);

    if(!questionsExist || questionStudentCoach.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    const wordInAnswer : boolean | null = checkWordInAnswer(questionStudentCoach.data, "yes").data;

    if(wordInAnswer == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(wordInAnswer);
}

/**
 *  Parse the form to the educations of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducations(form: Requests.Form) : Promise<string[]> {
    const questionCheckEducations: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3ExRK4");

    const questionsExist : boolean = checkQuestionsExist([questionCheckEducations]);

    if(!questionsExist || questionCheckEducations.data?.value == null ||
        questionCheckEducations.data.value.length === 0 || questionCheckEducations.data.value.length > 2) {
        return Promise.reject(errors.cookArgumentError());
    }

    const educations : string[] = [];

    for(let i = 0; i < questionCheckEducations.data.value.length; i++) {
        if(questionCheckEducations.data.options != undefined) {
            const filteredOption = questionCheckEducations.data.options.filter(option => option.id === questionCheckEducations.data?.value[i]);
            if(filteredOption.length !== 1) {
                return Promise.reject(errors.cookArgumentError());
            }
            if(filteredOption[0].text.includes("Other")) {
                const questionCheckOther: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_nro45N");
                const questionsExistOther : boolean = checkQuestionsExist([questionCheckOther]);

                if(!questionsExistOther || questionCheckOther.data?.value == null) {
                    return Promise.reject(errors.cookArgumentError());
                }

                educations.push(questionCheckOther.data.value);
            } else {
                educations.push(filteredOption[0].text);
            }
        }
    }

    return Promise.resolve(educations);
}

/**
 *  Parse the form to the education levels of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducationLevel(form: Requests.Form) : Promise<string[]> {
    const questionCheckEducationLevel: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_w4K6BX");

    const questionsExist : boolean = checkQuestionsExist([questionCheckEducationLevel]);

    if(!questionsExist || questionCheckEducationLevel.data?.value == null ||
        questionCheckEducationLevel.data.value.length === 0 || questionCheckEducationLevel.data.value.length > 2) {
        return Promise.reject(errors.cookArgumentError());
    }

    const educationLevels : string[] = [];

    for(let i = 0; i < questionCheckEducationLevel.data.value.length; i++) {
        if(questionCheckEducationLevel.data.options != undefined) {
            const filteredOption = questionCheckEducationLevel.data.options.filter(option => option.id === questionCheckEducationLevel.data?.value[i]);
            if(filteredOption.length !== 1) {
                return Promise.reject(errors.cookArgumentError());
            }
            if(filteredOption[0].text.includes("Other")) {
                const questionCheckOther: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3jlRba");
                const questionsExistOther : boolean = checkQuestionsExist([questionCheckOther]);

                if(!questionsExistOther || questionCheckOther.data?.value == null) {
                    return Promise.reject(errors.cookArgumentError());
                }

                educationLevels.push(questionCheckOther.data.value);
            } else {
                educationLevels.push(filteredOption[0].text);
            }
        }
    }

    return Promise.resolve(educationLevels);
}

/**
 *  Parse the form to the duration of the education of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducationDuration(form: Requests.Form) : Promise<number> {
    const questionEducationDuration: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_w2KWBj");

    const questionsExist : boolean = checkQuestionsExist([questionEducationDuration]);

    if(!questionsExist || questionEducationDuration.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(Number(questionEducationDuration.data.value));
}

/**
 *  Parse the form to the current year of the education of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducationYear(form: Requests.Form) : Promise<number> {
    const questionEducationYear: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_3xJqjr");

    const questionsExist : boolean = checkQuestionsExist([questionEducationYear]);

    if(!questionsExist || questionEducationYear.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(Number(questionEducationYear.data.value));
}

/**
 *  Parse the form to the university of this student.
 *  @param form The form with the answers.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
function getEducationUniversity(form: Requests.Form) : Promise<string> {
    const questionEducationUniversity: Responses.FormResponse<Requests.Question> = filterQuestion(form, "question_mRDNdd");

    const questionsExist : boolean = checkQuestionsExist([questionEducationUniversity]);

    if(!questionsExist || questionEducationUniversity.data?.value == null) {
        return Promise.reject(errors.cookArgumentError());
    }

    return Promise.resolve(questionEducationUniversity.data.value);
}

// TODO parse email status and created_at

/**
 *  Attempts to parse the answers in the form into a job application entity.
 *  @param form The form with the answers.
 *  @param studentId The student id.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
async function jsonToJobApplication(form: Requests.Form, student_id: Responses.Id): Promise<Responses.Empty> {
    const studentId = student_id.id;
    const responsibilities = await getResponsibilities(form);
    const funFact = await getFunFact(form);
    const volunteerInfo = await getVolunteerInfo(form);
    const studentCoach = await isStudentCoach(form);
    const latestOsoc = await ormOs.getLatestOsoc();
    if(latestOsoc == null) {
        return Promise.reject(errors.cookArgumentError());
    }
    const osocId = latestOsoc.osoc_id;
    const educations = await getEducations(form);
    const educationLevel = await getEducationLevel(form);
    const educationDuration = await getEducationDuration(form);
    const educationYear = await getEducationYear(form);
    const educationInstitute = await getEducationUniversity(form);
    const emailStatus = "NONE";
    let createdAt = new Date(Date.now()).toString();
    if(form.createdAt != undefined) {
        createdAt = form.createdAt;
    }

    const student = await ormJo.createJobApplication({
        studentId : studentId,
        responsibilities : responsibilities,
        funFact : funFact,
        studentVolunteerInfo : volunteerInfo,
        studentCoach : studentCoach,
        osocId : osocId,
        edus : educations,
        eduLevel : educationLevel,
        eduDuration : educationDuration,
        eduYear : educationYear,
        eduInstitute : educationInstitute,
        emailStatus : emailStatus,
        createdAt : createdAt
    });

    return Promise.resolve({id: student.student_id});
}


/**
 *  Attempts to create a new form in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 *  `Promise.resolve`, failures using `Promise.reject`.
 */
/*async function createForm(req: express.Request): Promise<Responses.Empty> {
  return rq.parseFormRequest(req).then(async form => {
    // Checks if the student will be in Belgium in July and if the student can
    // work enough in July.
    if (!checkWordInAnswer(filterQuestion(form, "question_wkNolR")) ||
        !checkWordInAnswer(filterQuestion(form, "question_mKVEz8"))) {
      return Promise.reject(util.errors.cookNonJSON("Invalid json"));
    }

    return jsonToPerson(form)
        .then(person => { return jsonToStudent(form, person); })
        .then(() => { return Promise.resolve({}); });
  });
}*/

/**
 *  Gets the router for all `/form/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/form/`
 *  endpoints.
 */
export function getRouter(): express.Router {
  const router: express.Router = express.Router();

  /*router.post('/',
              (req, res) => util.respOrErrorNoReinject(res, createForm(req)));*/

  util.addAllInvalidVerbs(router, [ "/" ]);

  return router;
}
