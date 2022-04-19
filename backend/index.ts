import body from "body-parser";
import cors from "cors";
import express from "express";
import path from "path";
import * as config from "./config.json";
import * as ep from "./endpoints";
import * as util from "./utility";
import { createServer } from "http";
import { Server } from "socket.io";
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from "./types";
import { registerLoginUserHandlers } from "./websocket_events/login_user";

const app: express.Application = express();
const port: number = config.port;
const httpServer = createServer(app);
export const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>(httpServer, {
    cors: {
        origin: "http://localhost:3000", //TODO: get this url from some kind of config file
    },
});

// require makes it A LOT easier to use this. Import gives some weird behaviour
// that is not easy to work around
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config({
    path: path.join(__dirname, `./.env.${process.env.NODE_ENV}`),
});

app.use(body.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use((req, _, next) => util.logRequest(req, next));
app.use((req, _, next) => {
    util.queryToBody(req);
    next();
});
ep.attach(app);
config.global.homes.forEach((home) => util.addInvalidVerbs(app, home + "/"));

io.on("connection", (socket) => {
    console.log("websocket connection achieved " + socket.id);
    console.log("number of clients:" + io.engine.clientsCount);
    registerLoginUserHandlers(io, socket);
});
httpServer.listen(port, () => {
    console.log(`TypeScript with Express
          http://localhost:${port}/`);
});
