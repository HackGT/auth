import * as path from "path";
import * as fs from "fs";

import * as express from "express";
import * as graphql from "express-graphql";
import * as serveStatic from "serve-static";
import * as compression from "compression";
import * as cookieParser from "cookie-parser";
import * as morgan from "morgan";
import { buildSchema } from "graphql";
import flash = require("connect-flash");

import {
	// Constants
	PORT, STATIC_ROOT, VERSION_NUMBER, VERSION_HASH, COOKIE_OPTIONS,
	config
} from "./common";

import { User } from "./schema";

import * as graphql_root from "./api/api";

// Set up Express and its middleware
export let app = express();
app.use(morgan("dev"));
app.use(compression());
let cookieParserInstance = cookieParser(undefined, COOKIE_OPTIONS);
app.use(cookieParserInstance);
app.use(flash());

// Auth needs to be the first route configured or else requests handled before it will always be unauthenticated
import {
	authRoutes,
	validateAndCacheHostName
} from "./routes/auth";

app.use("/auth", authRoutes);

// User facing routes
import {templateRoutes} from "./routes/templates";
app.use("/", templateRoutes);
app.route("/version").get((request, response) => {
	response.json({
		"version": VERSION_NUMBER,
		"hash": VERSION_HASH,
		"node": process.version
	});
});


//
// GraphQL API
//
const schema = buildSchema(fs.readFileSync(
	path.resolve(__dirname, "./api/api.graphql"), "utf8"));
// Since we might be returning a link to ourselves, validate the hostname
app.use("/graphql", validateAndCacheHostName);
app.use("/graphql", graphql({
	schema,
	rootValue: graphql_root,
	graphiql: true
}));


/// Update admins based on email
config.admins.forEach(async (email) => {
	const result = await User.update({ email }, { admin: true });
	if (result.nModified > 0) {
		console.log(`Adding new admin: ${email}`);
	}
});


app.use("/node_modules", serveStatic(path.resolve(__dirname, "../node_modules")));
app.use("/js", serveStatic(path.resolve(STATIC_ROOT, "js")));
app.use("/css", serveStatic(path.resolve(STATIC_ROOT, "css")));

app.listen(PORT, () => {
	console.log(`Auth system v${VERSION_NUMBER} @ ${VERSION_HASH} started on port ${PORT}`);
});
