/*import { getMockRes } from "@jest-mock/express";

import * as form from "../../routes/form";

import * as config from "../../routes/form_keys.json";

const form_obj = {
    eventId: "beca2c16-7fa5-4aab-9bb9-94ee50c0869b",
    eventType: "FORM_RESPONSE",
    createdAt: "2022-04-24T10:41:30.976Z",
    data: {
        responseId: "npMq4E",
        submissionId: "npMq4E",
        respondentId: "3j9JVY",
        formId: "wMoDMm",
        formName: "(UGent) #osoc22 student application form",
        createdAt: "2022-04-24T10:41:30.000Z",
        fields: [
            {
                key: "question_mK177D",
                label: "Will you live in Belgium in July 2022?*",
                type: "MULTIPLE_CHOICE",
                value: "343f74a1-7b3d-481e-94f1-cfd613d78f00",
                options: [
                    {
                        id: "343f74a1-7b3d-481e-94f1-cfd613d78f00",
                        text: "Yes",
                    },
                    {
                        id: "2cf437cc-fee4-496b-8e46-f6c037dca583",
                        text: "No",
                    },
                ],
            },
            {
                key: "question_wLpAAJ",
                label: "Are you able to work 128 hours with a student employment agreement, or as a volunteer?*",
                type: "MULTIPLE_CHOICE",
                value: "46db63af-daaa-42ec-a755-8ff5c6d2b1bf",
                options: [
                    {
                        id: "46db63af-daaa-42ec-a755-8ff5c6d2b1bf",
                        text: "Yes, I can work with a student employment agreement in Belgium",
                    },
                    {
                        id: "f41e1bef-8a6c-4f9f-b369-cd388aacd9f9",
                        text: "Yes, I can work as a volunteer in Belgium",
                    },
                    {
                        id: "230a7690-7e05-43d5-97a4-58c0e37142dc",
                        text: "No – but I would like to join this experience for free",
                    },
                    {
                        id: "9a065686-5d60-423f-a343-db8ae9066028",
                        text: "No, I won’t be able to work as a student, as a volunteer or for free.",
                    },
                ],
            },
            {
                key: "question_npOjjP",
                label: "Can you work during the month of July, Monday through Thursday (~09:00 to 17:00)?*",
                type: "MULTIPLE_CHOICE",
                value: "115ad290-a86e-42f5-939e-8276ff41e749",
                options: [
                    {
                        id: "115ad290-a86e-42f5-939e-8276ff41e749",
                        text: "Yes",
                    },
                    {
                        id: "7e42e1a5-a15a-4866-b92a-5fd8041a5cc4",
                        text: "No, I wouldn't be able to work for the majority of days.",
                    },
                ],
            },
            {
                key: "question_31VZZb",
                label: "Are there any responsibilities you might have which could hinder you during the day?",
                type: "TEXTAREA",
                value: "Test responsibility",
            },
            {
                key: "question_wMRkk8",
                label: "Birth name",
                type: "INPUT_TEXT",
                value: "Bob",
            },
            {
                key: "question_mJzaaX",
                label: "Last name",
                type: "INPUT_TEXT",
                value: "Dylan",
            },
            {
                key: "question_wgGyyJ",
                label: "Would you like to be called by a different name than your birth name?",
                type: "MULTIPLE_CHOICE",
                value: "35e07206-f052-4826-8965-515ed783a43e",
                options: [
                    {
                        id: "35e07206-f052-4826-8965-515ed783a43e",
                        text: "Yes",
                    },
                    {
                        id: "e3558697-3a38-4137-b699-1fb8ec93e9ab",
                        text: "No",
                    },
                ],
            },
            {
                key: "question_3yYKKd",
                label: "How would you like to be called?",
                type: "INPUT_TEXT",
                value: "Bobby",
            },
            {
                key: "question_3X0VVz",
                label: "What is your gender?",
                type: "MULTIPLE_CHOICE",
                value: "2bcf2809-3efe-407d-87c1-dabcf3db0743",
                options: [
                    {
                        id: "d664cd5f-121f-421c-8f2c-e1b8b6505899",
                        text: "Female",
                    },
                    {
                        id: "2bcf2809-3efe-407d-87c1-dabcf3db0743",
                        text: "Male",
                    },
                    {
                        id: "afd31775-f165-41d0-9dd2-45dd4ae1c90a",
                        text: "Transgender",
                    },
                    {
                        id: "fc2cc0be-6688-4ab8-9567-36bedbe829b2",
                        text: "Rather not say",
                    },
                ],
            },
            {
                key: "question_w8xvvr",
                label: "Would you like to add your pronouns?",
                type: "MULTIPLE_CHOICE",
                value: "8b2065a1-09f1-46dc-a03e-138a20160230",
                options: [
                    {
                        id: "8b2065a1-09f1-46dc-a03e-138a20160230",
                        text: "Yes",
                    },
                    {
                        id: "e08c0951-9ea4-4781-b5e4-a5252b91855f",
                        text: "No",
                    },
                ],
            },
            {
                key: "question_n0O22A",
                label: "Which pronouns do you prefer?",
                type: "MULTIPLE_CHOICE",
                value: "c15e9f19-2997-4882-b7ec-1f3fd9c70af0",
                options: [
                    {
                        id: "97e74546-7f92-422c-b2be-ffaf7ef3f50b",
                        text: "she/her/hers",
                    },
                    {
                        id: "a8a3c71b-2d52-4319-9399-e13eeffb7e99",
                        text: "he/him/his",
                    },
                    {
                        id: "57489d99-aa62-4f9a-a9b9-5975570ea7d7",
                        text: "they/them/theirs",
                    },
                    {
                        id: "071f603c-e1f6-4212-bc2d-57a173a076b6",
                        text: "ze/hir/hir ",
                    },
                    {
                        id: "4e0d7394-23b3-4469-ad2d-2b6482186f8c",
                        text: "by firstname",
                    },
                    {
                        id: "a5c6726f-661e-43e1-b913-c33683f20ddd",
                        text: "by call name",
                    },
                    {
                        id: "c15e9f19-2997-4882-b7ec-1f3fd9c70af0",
                        text: "other",
                    },
                ],
            },
            {
                key: "question_wzYppg",
                label: "Enter your pronouns",
                type: "INPUT_TEXT",
                value: "he/him/his",
            },
            {
                key: "question_w5x66Q",
                label: "What language are you most fluent in?",
                type: "MULTIPLE_CHOICE",
                value: "86bb74b6-5dd8-4ce0-b28a-962604d2c630",
                options: [
                    {
                        id: "66165a2c-404a-4def-b925-846769a123bd",
                        text: "Dutch",
                    },
                    {
                        id: "86bb74b6-5dd8-4ce0-b28a-962604d2c630",
                        text: "English",
                    },
                    {
                        id: "551bd941-9c3c-4805-89c0-22ae46ac89d0",
                        text: "French",
                    },
                    {
                        id: "1ed59443-b164-4ddf-85ff-c603cd4edaf1",
                        text: "German",
                    },
                    {
                        id: "3594c098-46fd-4bf9-98b3-c11e568c3403",
                        text: "Other",
                    },
                ],
            },
            {
                key: "question_wddLLV",
                label: "What language are you most fluent in?",
                type: "INPUT_TEXT",
                value: null,
            },
            {
                key: "question_mYaEEv",
                label: "How would you rate your English?",
                type: "MULTIPLE_CHOICE",
                value: "1f4fa6d9-b2ba-42a7-9f82-5b1be7598d3e",
                options: [
                    {
                        id: "18419bd9-82b4-40f8-980a-10ce9a022db3",
                        text: "★ I can understand your form, but it is hard for me to reply.",
                    },
                    {
                        id: "eeba838b-5a34-4c92-a8ca-4cab70d19f93",
                        text: "★★ I can have simple conversations.",
                    },
                    {
                        id: "6023fc5b-6ae2-4280-a691-37dc781044d8",
                        text: "★★★ I can express myself, understand people and get a point across.",
                    },
                    {
                        id: "4bab946f-ff92-4e32-abd7-ed0c9113cdbf",
                        text: "★★★★ I can have extensive and complicated conversations.",
                    },
                    {
                        id: "1f4fa6d9-b2ba-42a7-9f82-5b1be7598d3e",
                        text: "★★★★★ I am fluent.",
                    },
                ],
            },
            {
                key: "question_mDzrrE",
                label: "Phone number",
                type: "INPUT_PHONE_NUMBER",
                value: "0487294163",
            },
            {
                key: "question_3lrooX",
                label: "Your email address\n",
                type: "INPUT_EMAIL",
                value: "bob.dylan@gmail.com",
            },
            {
                key: "question_mRPXXQ",
                label: "Upload your CV – size limit 10MB",
                type: "FILE_UPLOAD",
                value: [
                    {
                        id: "wgeV6d",
                        name: "attachment.txt",
                        url: "https://storage.googleapis.com/tally-response-assets/repXzN/ee3f362a-f4ab-4e19-9fe4-3886aff77462/attachment.txt",
                        mimeType: "text/plain",
                        size: 4,
                    },
                ],
            },
            {
                key: "question_woGrrN",
                label: "Or link to your CV",
                type: "INPUT_LINK",
                value: null,
            },
            {
                key: "question_nGlNNO",
                label: "Upload your portfolio – size limit 10MB",
                type: "FILE_UPLOAD",
                value: [
                    {
                        id: "3Xr7P4",
                        name: "attachment.txt",
                        url: "https://storage.googleapis.com/tally-response-assets/repXzN/4b6f238f-cd08-4dfe-be66-9dde191ecb09/attachment.txt",
                        mimeType: "text/plain",
                        size: 4,
                    },
                ],
            },
            {
                key: "question_mOGppM",
                label: "Or link to your portfolio / GitHub",
                type: "INPUT_LINK",
                value: null,
            },
            {
                key: "question_mVJRR6",
                label: "Upload your motivation – size limit 10MB",
                type: "FILE_UPLOAD",
                value: [
                    {
                        id: "w8zY4x",
                        name: "attachment.txt",
                        url: "https://storage.googleapis.com/tally-response-assets/repXzN/d3dda569-58db-45e0-a1dc-423ac1d6432e/attachment.txt",
                        mimeType: "text/plain",
                        size: 4,
                    },
                ],
            },
            {
                key: "question_nPOMMx",
                label: "Or link to your motivation",
                type: "INPUT_LINK",
                value: null,
            },
            {
                key: "question_3EWjj2",
                label: "Or write about your motivation",
                type: "TEXTAREA",
                value: "I am very motivated",
            },
            {
                key: "question_nrPNNX",
                label: "Add a fun fact about yourself",
                type: "TEXTAREA",
                value: "I am funny",
            },
            {
                key: "question_w4rWW5",
                label: "What do/did you study?",
                type: "CHECKBOXES",
                value: [
                    "63669061-f3e1-4b97-addc-f8b37a3989f4",
                    "dbb51b92-95ac-4e17-ba9b-925dd8feeb0a",
                ],
                options: [
                    {
                        id: "63669061-f3e1-4b97-addc-f8b37a3989f4",
                        text: "Backend development",
                    },
                    {
                        id: "816606cb-4f87-4632-9c27-7f09e1c0d0f4",
                        text: "Business management",
                    },
                    {
                        id: "dfedd70f-5780-42b4-bc74-85d3c4e69225",
                        text: "Communication Sciences",
                    },
                    {
                        id: "de2a0d9b-2cc1-472f-ad76-954677a8afb1",
                        text: "Computer Sciences",
                    },
                    {
                        id: "7f51c707-09f4-48bb-b6ea-1f90f5a7dee2",
                        text: "Design",
                    },
                    {
                        id: "ef021761-9972-46d6-960a-0236ba723963",
                        text: "Frontend development",
                    },
                    {
                        id: "bdefa065-f120-488b-bd01-244c5a59f20e",
                        text: "Marketing",
                    },
                    {
                        id: "c2c15641-dee6-4712-8fdf-0448d2dcaed1",
                        text: "Photography",
                    },
                    {
                        id: "e9964b65-12b7-4179-91bc-d63f5f02aee9",
                        text: "Videography",
                    },
                    {
                        id: "dbb51b92-95ac-4e17-ba9b-925dd8feeb0a",
                        text: "Other",
                    },
                ],
            },
            {
                key: "question_w4rWW5_63669061-f3e1-4b97-addc-f8b37a3989f4",
                label: "What do/did you study? (Backend development)",
                type: "CHECKBOXES",
                value: true,
            },
            {
                key: "question_w4rWW5_816606cb-4f87-4632-9c27-7f09e1c0d0f4",
                label: "What do/did you study? (Business management)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w4rWW5_dfedd70f-5780-42b4-bc74-85d3c4e69225",
                label: "What do/did you study? (Communication Sciences)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w4rWW5_de2a0d9b-2cc1-472f-ad76-954677a8afb1",
                label: "What do/did you study? (Computer Sciences)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w4rWW5_7f51c707-09f4-48bb-b6ea-1f90f5a7dee2",
                label: "What do/did you study? (Design)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w4rWW5_ef021761-9972-46d6-960a-0236ba723963",
                label: "What do/did you study? (Frontend development)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w4rWW5_bdefa065-f120-488b-bd01-244c5a59f20e",
                label: "What do/did you study? (Marketing)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w4rWW5_c2c15641-dee6-4712-8fdf-0448d2dcaed1",
                label: "What do/did you study? (Photography)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w4rWW5_e9964b65-12b7-4179-91bc-d63f5f02aee9",
                label: "What do/did you study? (Videography)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w4rWW5_dbb51b92-95ac-4e17-ba9b-925dd8feeb0a",
                label: "What do/did you study? (Other)",
                type: "CHECKBOXES",
                value: true,
            },
            {
                key: "question_3jPdd1",
                label: "What do/did you study?",
                type: "INPUT_TEXT",
                value: "Database design",
            },
            {
                key: "question_w2PqqM",
                label: "What kind of diploma are you currently going for?",
                type: "CHECKBOXES",
                value: ["a27ad504-f524-4e5b-9919-2ad70c14814a"],
                options: [
                    {
                        id: "ee039478-24af-46f0-8619-d0615512c2b7",
                        text: "A professional Bachelor",
                    },
                    {
                        id: "a27ad504-f524-4e5b-9919-2ad70c14814a",
                        text: "An academic Bachelor",
                    },
                    {
                        id: "97dbef1b-d707-4585-b61b-45c99db6c54c",
                        text: "An associate degree",
                    },
                    {
                        id: "9c28047c-0392-42eb-9e0f-0bd1b03a5e12",
                        text: "A master's degree",
                    },
                    {
                        id: "25c435fd-f20a-4e70-bafd-0563089e28ec",
                        text: "Doctoral degree",
                    },
                    {
                        id: "e5f9b310-6087-4c44-8422-ccee50b9378b",
                        text: "No diploma, I am self taught",
                    },
                    {
                        id: "67e44797-6696-4605-b1bd-bf76859c70f9",
                        text: "Other",
                    },
                ],
            },
            {
                key: "question_w2PqqM_ee039478-24af-46f0-8619-d0615512c2b7",
                label: "What kind of diploma are you currently going for? (A professional Bachelor)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w2PqqM_a27ad504-f524-4e5b-9919-2ad70c14814a",
                label: "What kind of diploma are you currently going for? (An academic Bachelor)",
                type: "CHECKBOXES",
                value: true,
            },
            {
                key: "question_w2PqqM_97dbef1b-d707-4585-b61b-45c99db6c54c",
                label: "What kind of diploma are you currently going for? (An associate degree)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w2PqqM_9c28047c-0392-42eb-9e0f-0bd1b03a5e12",
                label: "What kind of diploma are you currently going for? (A master's degree)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w2PqqM_25c435fd-f20a-4e70-bafd-0563089e28ec",
                label: "What kind of diploma are you currently going for? (Doctoral degree)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w2PqqM_e5f9b310-6087-4c44-8422-ccee50b9378b",
                label: "What kind of diploma are you currently going for? (No diploma, I am self taught)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_w2PqqM_67e44797-6696-4605-b1bd-bf76859c70f9",
                label: "What kind of diploma are you currently going for? (Other)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_3xYkkk",
                label: "What kind of diploma are you currently going for?",
                type: "INPUT_TEXT",
                value: "No diploma",
            },
            {
                key: "question_mZ6555",
                label: "How many years does your degree take?",
                type: "INPUT_NUMBER",
                value: 5,
            },
            {
                key: "question_3NW55p",
                label: "Which year of your degree are you in?",
                type: "INPUT_TEXT",
                value: "Third bachelor",
            },
            {
                key: "question_3qAZZ5",
                label: "What is the name of your college or university?",
                type: "INPUT_TEXT",
                value: "Ghent university",
            },
            {
                key: "question_wQ5221",
                label: "Which role are you applying for?",
                type: "CHECKBOXES",
                value: [
                    "687908c0-7091-429c-9f99-cf9670503892",
                    "dede10c8-a949-463c-8ae8-73f6fab6a362",
                ],
                options: [
                    {
                        id: "d2c3e561-28bd-4de9-a7db-00cd22beb3b7",
                        text: "Front-end developer",
                    },
                    {
                        id: "687908c0-7091-429c-9f99-cf9670503892",
                        text: "Back-end developer",
                    },
                    {
                        id: "def165c9-d40a-4d13-b174-98d480e1dd41",
                        text: "UX / UI designer",
                    },
                    {
                        id: "fae1aff3-eb1c-4109-abb5-c91ed8e64cf1",
                        text: "Graphic designer",
                    },
                    {
                        id: "37c7da5d-361c-4000-b8ed-fcf8e69971f0",
                        text: "Business Modeller",
                    },
                    {
                        id: "07228f94-e28d-41f6-ac6e-ccd039921f58",
                        text: "Storyteller",
                    },
                    {
                        id: "4b1c6ba6-e945-465e-9222-de02d44988ce",
                        text: "Marketer",
                    },
                    {
                        id: "e993e2bb-6dfe-4ec3-8f36-cf940b30533e",
                        text: "Copywriter",
                    },
                    {
                        id: "e7f54c05-e90b-4967-b9a5-7fa997abdabc",
                        text: "Video editor",
                    },
                    {
                        id: "7418ba9a-e88b-4a4c-98e7-4f346d61024e",
                        text: "Photographer",
                    },
                    {
                        id: "dede10c8-a949-463c-8ae8-73f6fab6a362",
                        text: "Other",
                    },
                ],
            },
            {
                key: "question_wQ5221_d2c3e561-28bd-4de9-a7db-00cd22beb3b7",
                label: "Which role are you applying for? (Front-end developer)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_687908c0-7091-429c-9f99-cf9670503892",
                label: "Which role are you applying for? (Back-end developer)",
                type: "CHECKBOXES",
                value: true,
            },
            {
                key: "question_wQ5221_def165c9-d40a-4d13-b174-98d480e1dd41",
                label: "Which role are you applying for? (UX / UI designer)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_fae1aff3-eb1c-4109-abb5-c91ed8e64cf1",
                label: "Which role are you applying for? (Graphic designer)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_37c7da5d-361c-4000-b8ed-fcf8e69971f0",
                label: "Which role are you applying for? (Business Modeller)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_07228f94-e28d-41f6-ac6e-ccd039921f58",
                label: "Which role are you applying for? (Storyteller)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_4b1c6ba6-e945-465e-9222-de02d44988ce",
                label: "Which role are you applying for? (Marketer)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_e993e2bb-6dfe-4ec3-8f36-cf940b30533e",
                label: "Which role are you applying for? (Copywriter)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_e7f54c05-e90b-4967-b9a5-7fa997abdabc",
                label: "Which role are you applying for? (Video editor)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_7418ba9a-e88b-4a4c-98e7-4f346d61024e",
                label: "Which role are you applying for? (Photographer)",
                type: "CHECKBOXES",
                value: false,
            },
            {
                key: "question_wQ5221_dede10c8-a949-463c-8ae8-73f6fab6a362",
                label: "Which role are you applying for? (Other)",
                type: "CHECKBOXES",
                value: true,
            },
            {
                key: "question_n9DGGX",
                label: "Which role are you applying for that is not in the list above?",
                type: "INPUT_TEXT",
                value: "Database designer",
            },
            {
                key: "question_meeZZQ",
                label: "Which skill would you list as your best one?",
                type: "INPUT_TEXT",
                value: "Writing songs",
            },
            {
                key: "question_nW599R",
                label: "Have you participated in osoc before?",
                type: "MULTIPLE_CHOICE",
                value: "127d3ef2-2929-4895-ba52-4d10bcaa1e19",
                options: [
                    {
                        id: "e47f258c-dc5e-449e-bf93-5587d5b8f3ee",
                        text: "No, it's my first time participating in osoc",
                    },
                    {
                        id: "127d3ef2-2929-4895-ba52-4d10bcaa1e19",
                        text: "Yes, I have been part of osoc before",
                    },
                ],
            },
            {
                key: "question_waYNN2",
                label: "Would you like to be a student coach this year?",
                type: "MULTIPLE_CHOICE",
                value: "6959f608-436d-4da8-a14e-f9cedb99f705",
                options: [
                    {
                        id: "ffa7874f-52db-4058-93a1-8a015376f256",
                        text: "No, I don't want to be a student coach",
                    },
                    {
                        id: "6959f608-436d-4da8-a14e-f9cedb99f705",
                        text: "Yes, I'd like to be a student coach",
                    },
                ],
            },
        ],
    },
};

test("Filter a question", () => {
    for(const value of Object.entries(config)) {
        expect(form.filterQuestion(form_obj, value))
    }
    const state = github.genState();
    expect(github.checkState(state)).toBe(true);
    expect(github.checkState(state)).toBe(false);
});*/
