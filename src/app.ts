import express from "express";
import "dotenv/config";
import { errorHandler } from "./middleware/errorHandler";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "server is up and running"
    })
})

import authRouter from "./features/auth/auth.routes";
app.use("/api/v1/auth", authRouter);

import organizationRouter from "./features/organizations/organization.routes";
app.use("/api/v1/organizations", organizationRouter);

import boardRouter from "./features/boards/board.route";
app.use("/api/v1/boards", boardRouter);

import { topLevelListRouter } from "./features/lists/list.routes";
app.use("/api/v1/lists", topLevelListRouter);

import { topLevelCardRouter } from "./features/cards/card.routes";
app.use("/api/v1/cards", topLevelCardRouter);

app.use(errorHandler);

export default app;