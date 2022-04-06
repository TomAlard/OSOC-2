import express from 'express';

// import * as ormEv from '../orm_functions/evaluation';
import * as ormPr from '../orm_functions/project';
import * as rq from '../request';
import {Responses} from '../types';
import * as util from '../utility';
import {errors} from "../utility";

/**
 *  Attempts to create a new project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function createProject(req: express.Request): Promise<Responses.Project> {
  return rq.parseNewProjectRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(async parsed => {
        return ormPr
            .createProject({
              name : parsed.data.name,
              partner : parsed.data.partner,
              startDate : parsed.data.start,
              endDate : parsed.data.end,
              positions : parsed.data.positions,
              osocId : parsed.data.osocId
            })
            .then(project => Promise.resolve({
              sessionkey : parsed.data.sessionkey,
              data : {
                id : project.project_id,
                name : project.name,
                partner : project.partner,
                start_date : project.start_date.toString(),
                end_date : project.end_date.toString(),
                positions : project.positions,
                osoc_id : project.osoc_id
              }
            }));
      });
}

/**
 *  Attempts to list all projects in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function listProjects(req: express.Request):
    Promise<Responses.ProjectList> {
  return rq.parseProjectAllRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(
          async parsed =>
              ormPr.getAllProjects()
                  .then(obj => obj.map(val => ({
                                         id : Number(val.project_id),
                                         name : val.name,
                                         partner : val.partner,
                                         start_date : val.start_date.toString(),
                                         end_date : val.end_date.toString(),
                                         positions : val.positions,
                                         osoc_id : val.osoc_id
                                       })))
                  .then(
                      obj => Promise.resolve(
                          {sessionkey : parsed.data.sessionkey, data : obj})));
}

/**
 *  Attempts to get all data for a certain project in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getProject(req: express.Request): Promise<Responses.Project> {
  return rq.parseSingleProjectRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(async parsed => ormPr.getProjectById(parsed.data.id).then(obj => {
        if (obj !== null) {
          return Promise.resolve({
            sessionkey : parsed.data.sessionkey,
            data : {
              id : Number(obj.project_id),
              name : obj.name,
              partner : obj.partner,
              start_date : obj.start_date.toString(),
              end_date : obj.end_date.toString(),
              positions : obj.positions,
              osoc_id : obj.osoc_id
            }
          });
        } else {
          return Promise.reject(errors.cookInvalidID());
        }
      }));
}

async function modProject(req: express.Request): Promise<Responses.Project> {
  return rq.parseUpdateProjectRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(async parsed => {
        // UPDATING LOGIC
        return ormPr
            .updateProject({
              projectId : parsed.data.id,
              name : parsed.data.name,
              partner : parsed.data.partner,
              startDate : parsed.data.start,
              endDate : parsed.data.end,
              positions : parsed.data.positions,
              osocId : parsed.data.osocId
            })
            .then(project => Promise.resolve({
              sessionkey : parsed.data.sessionkey,
              data : {
                id : project.project_id,
                name : project.name,
                partner : project.partner,
                start_date : project.start_date.toString(),
                end_date : project.end_date.toString(),
                positions : project.positions,
                osoc_id : project.osoc_id
              }
            }));
      });
}

/**
 *  Attempts to delete a project from the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function deleteProject(req: express.Request): Promise<Responses.Key> {
  return rq.parseDeleteProjectRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(async parsed => {
        return ormPr.deleteProject(parsed.data.id).then(() => Promise.resolve({
          sessionkey : parsed.data.sessionkey
        }));
      });
}

/**
 *  Attempts to get all drafted students in the system.
 *  @param req The Express.js request to extract all required data from.
 *  @returns See the API documentation. Successes are passed using
 * `Promise.resolve`, failures using `Promise.reject`.
 */
async function getDraftedStudents(req: express.Request):
    Promise<Responses.ProjectDraftedStudents> {

  return rq.parseGetDraftedStudentsRequest(req)
      .then(parsed => util.checkSessionKey(parsed))
      .then(parsed => {
        // INSERTION LOGIC
        return Promise.resolve({
          data : {id : 0, name : '', students : []},
          sessionkey : parsed.data.sessionkey
        });
      });
}

async function modProjectStudent(req: express.Request):
    Promise<Responses.ModProjectStudent> {
  return rq.parseDraftStudentRequest(req)
      .then(parsed => util.isAdmin(parsed))
      .then(parsed => {
        // INSERTION LOGIC
        return Promise.resolve({
          data : {drafted : false, roles : []},
          sessionkey : parsed.data.sessionkey
        });
      });
}

export async function unRecommendStudent(req: express.Request):
    Promise<Responses.Key> {
  return rq.parseRemoveDraftStudentRequest(req).then(parsed => {
    ormPr.getProjectById(parsed.id).then();
    return Promise.resolve({sessionkey : parsed.sessionkey});
  })
}

// TODO project conflicts
/*async function getProjectConflicts(req: express.Request):
    Promise<Responses.ModProjectStudent> {
    return util.checkSessionKey(req).then(async (_) => {
        // check valid id
        // if invalid: return Promise.reject(util.cookInvalidID());
        // if valid: modify a student of this project
        let roles : string[] = [];
        return Promise.resolve({
            data : {drafted : true, roles : roles},
            sessionkey : ''
        });
    });
}*/

/**
 *  Gets the router for all `/coaches/` related endpoints.
 *  @returns An Express.js {@link express.Router} routing all `/coaches/`
 * endpoints.
 */
export function getRouter(): express.Router {
  const router: express.Router = express.Router();

  util.setupRedirect(router, '/project');
  util.route(router, "get", "/all", listProjects);
  router.post('/:id', (req, res) =>
                          util.respOrErrorNoReinject(res, createProject(req)));
  util.route(router, "get", "/:id", getProject);

  util.route(router, "post", "/:id", modProject);
  router.delete('/:id', (req, res) => util.respOrErrorNoReinject(
                            res, deleteProject(req)));

  util.route(router, "get", "/:id/draft", getDraftedStudents);
  util.route(router, "post", "/:id/draft", modProjectStudent);

  // TODO project conflicts
  // util.route(router, "get", "/conflicts", getProjectConflicts);

  // TODO add project conflicts
  util.addAllInvalidVerbs(
      router, [ "/", "/all", "/:id", "/:id/draft", "/request/:id" ]);

  return router;
}
