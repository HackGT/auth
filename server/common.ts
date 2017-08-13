import * as fs from "fs";
import * as crypto from "crypto";
import * as path from "path";
import "passport";
import * as moment from "moment-timezone";

//
// Config
//
import { IConfig } from "./schema";
class Config implements IConfig.Main {
	public secrets: IConfig.Secrets = {
		"session": crypto.randomBytes(32).toString("hex"),
		"github": {
			"id": "",
			"secret": ""
		},
		"google": {
			"id": "",
			"secret": ""
		},
		"facebook": {
			"id": "",
			"secret": ""
		}
	};
	public email: IConfig.Email = {
		from: "HackGT Team <hello@hackgt.com>",
		host: "",
		username: "",
		password: "",
		port: 465
	};
	public server: IConfig.Server = {
		isProduction: false,
		port: 3000,
		versionHash: fs.existsSync(".git") ? require("git-rev-sync").short() : "",
		workflowReleaseCreatedAt: null,
		workflowReleaseSummary: null,
		cookieMaxAge: 1000 * 60 * 60 * 24 * 30 * 6, // 6 months
		cookieSecureOnly: false,
		mongoURL: "mongodb://localhost/",
		passwordResetExpiration: 1000 * 60 * 60 // 1 hour
	};
	public admins: string[] = [];
	public eventName: string = "Untitled Event";

	public sessionSecretSet: boolean = false;

	constructor(fileName: string = "config.json") {
		this.loadFromJSON(fileName);
		this.loadFromEnv();
	}
	protected loadFromJSON(fileName: string): void {
		// tslint:disable-next-line:no-shadowed-variable
		let config: IConfig.Main | null = null;
		try {
			config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./config", fileName), "utf8"));
		}
		catch (err) {
			if (err.code !== "ENOENT") {
				throw err;
			}
		}
		if (!config) {
			return;
		}
		if (config.secrets) {
			for (let key of Object.keys(config.secrets) as (keyof IConfig.Secrets)[]) {
				this.secrets[key] = config.secrets[key];
			}
		}
		if (config.email) {
			for (let key of Object.keys(config.email) as (keyof IConfig.Email)[]) {
				this.email[key] = config.email[key];
			}
		}
		if (config.server) {
			for (let key of Object.keys(config.server) as (keyof IConfig.Server)[]) {
				this.server[key] = config.server[key];
			}
		}
		if (config.admins) {
			this.admins = config.admins;
		}
		if (config.eventName) {
			this.eventName = config.eventName;
		}
		if (config.secrets && config.secrets.session) {
			this.sessionSecretSet = true;
		}
	}
	protected loadFromEnv(): void {
		// Secrets
		if (process.env.SESSION_SECRET) {
			this.secrets.session = process.env.SESSION_SECRET!;
			this.sessionSecretSet = true;
		}
		if (process.env.GITHUB_CLIENT_ID) {
			this.secrets.github.id = process.env.GITHUB_CLIENT_ID!;
		}
		if (process.env.GITHUB_CLIENT_SECRET) {
			this.secrets.github.secret = process.env.GITHUB_CLIENT_SECRET!;
		}
		if (process.env.GOOGLE_CLIENT_ID) {
			this.secrets.google.id = process.env.GOOGLE_CLIENT_ID!;
		}
		if (process.env.GOOGLE_CLIENT_SECRET) {
			this.secrets.google.secret = process.env.GOOGLE_CLIENT_SECRET!;
		}
		if (process.env.FACEBOOK_CLIENT_ID) {
			this.secrets.facebook.id = process.env.FACEBOOK_CLIENT_ID!;
		}
		if (process.env.FACEBOOK_CLIENT_SECRET) {
			this.secrets.facebook.secret = process.env.FACEBOOK_CLIENT_SECRET!;
		}
		// Email
		if (process.env.EMAIL_FROM) {
			this.email.from = process.env.EMAIL_FROM!;
		}
		if (process.env.EMAIL_HOST) {
			this.email.host = process.env.EMAIL_HOST!;
		}
		if (process.env.EMAIL_USERNAME) {
			this.email.username = process.env.EMAIL_USERNAME!;
		}
		if (process.env.EMAIL_PASSWORD) {
			this.email.password = process.env.EMAIL_PASSWORD!;
		}
		if (process.env.EMAIL_PORT) {
			let port = parseInt(process.env.EMAIL_PORT!, 10);
			if (!isNaN(port) && port > 0) {
				this.email.port = port;
			}
		}
		// Server
		if (process.env.PRODUCTION && process.env.PRODUCTION!.toLowerCase() === "true") {
			this.server.isProduction = true;
		}
		if (process.env.PORT) {
			let port = parseInt(process.env.PORT!, 10);
			if (!isNaN(port) && port > 0) {
				this.server.port = port;
			}
		}
		if (process.env.VERSION_HASH) {
			this.server.versionHash = process.env.VERSION_HASH!;
		}
		if (process.env.SOURCE_REV) {
			this.server.versionHash = process.env.SOURCE_REV!;
		}
		if (process.env.SOURCE_VERSION) {
			this.server.versionHash = process.env.SOURCE_VERSION!;
		}
		if (process.env.WORKFLOW_RELEASE_CREATED_AT) {
			this.server.workflowReleaseCreatedAt = process.env.WORKFLOW_RELEASE_CREATED_AT!;
		}
		if (process.env.WORKFLOW_RELEASE_SUMMARY) {
			this.server.workflowReleaseSummary = process.env.WORKFLOW_RELEASE_SUMMARY!;
		}
		if (process.env.COOKIE_MAX_AGE) {
			let maxAge = parseInt(process.env.COOKIE_MAX_AGE!, 10);
			if (!isNaN(maxAge) && maxAge > 0) {
				this.server.cookieMaxAge = maxAge;
			}
		}
		if (process.env.COOKIE_SECURE_ONLY && process.env.COOKIE_SECURE_ONLY!.toLowerCase() === "true") {
			this.server.cookieSecureOnly = true;
		}
		if (process.env.MONGO_URL) {
			this.server.mongoURL = process.env.MONGO_URL!;
		}
		if (process.env.PASSWORD_RESET_EXPIRATION) {
			let expirationTime = parseInt(process.env.PASSWORD_RESET_EXPIRATION!, 10);
			if (!isNaN(expirationTime) && expirationTime > 0) {
				this.server.passwordResetExpiration = expirationTime;
			}
		}
		// Admins
		if (process.env.ADMIN_EMAILS) {
			this.admins = JSON.parse(process.env.ADMIN_EMAILS!);
		}
		// Event name
		if (process.env.EVENT_NAME) {
			this.eventName = process.env.EVENT_NAME!;
		}
	}
}
export let config = new Config();

export function cookie_opts(domain?: string) {
	let base: {
		path: string;
		maxAge: number;
		secure: boolean;
		httpOnly: boolean;
		domain?: string;
	} = {
		path: "/",
		maxAge: config.server.cookieMaxAge,
		secure: config.server.cookieSecureOnly,
		httpOnly: true
	};
	if (domain) {
		base.domain = domain;
	}
	return base;
}

export function all_host_cookie_opts(hostname: string): any {
	const host = hostname.split(":")[0].split(".").slice(-2).join(".");
	const cookieDomain = host === "localhost" ? host : "." + host;
	return cookie_opts(cookieDomain);
}

//
// Constants
//
export const PORT = config.server.port;
export const STATIC_ROOT = path.resolve(__dirname, "../client");
export const VERSION_NUMBER = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../package.json"), "utf8")).version;
export const VERSION_HASH = config.server.versionHash;
export const COOKIE_OPTIONS = cookie_opts();

//
// Database connection
//
import * as mongoose from "mongoose";
(mongoose as any).Promise = global.Promise;
mongoose.connect(config.server.mongoURL, {
	useMongoClient: true
} as mongoose.ConnectionOptions);
export {mongoose};

import { Setting } from "./schema";

export async function setDefaultSettings() {
	async function doesNotExist(key: string): Promise<boolean> {
		return await Setting.find({ "name": key }).count() === 0;
	}

	const DEFAULTS: any = {};

	for (let setting in DEFAULTS) {
		if (await doesNotExist(setting)) {
			await updateSetting(setting, DEFAULTS[setting]);
			console.log(`Updated previously unset setting ${setting} to ${JSON.stringify(DEFAULTS[setting])}`);
		}
	}
}
export async function getSetting<T>(name: string, createMissing: boolean = true): Promise<T> {
	let setting = await Setting.findOne({ name });
	if (!setting) {
		if (createMissing) {
			await setDefaultSettings();
			setting = await Setting.findOne({ name });
			if (!setting) {
				throw new Error("Setting not created by setDefaultSettings()");
			}
		}
		else {
			throw new Error("Setting not found");
		}
	}
	return setting.value as T;
}
export async function updateSetting<T>(name: string, value: T, createMissing: boolean = true): Promise<void> {
	let setting = await Setting.findOne({ name });
	if (!setting) {
		if (!createMissing) {
			throw new Error("Setting not found to update");
		}
		await new Setting({ name, value }).save();
	}
	else {
		setting.value = value;
		setting.markModified("value");
		await setting.save();
	}
}

//
// Express middleware
//
import * as express from "express";
import * as bodyParser from "body-parser";
export let postParser = bodyParser.urlencoded({
	extended: false
});

//
// Promisified APIs for use with async / await
//
export function pbkdf2Async(password: string | Buffer, salt: string | Buffer, iterations: number, keylength: number = 128, digest: string = "sha256") {
	return new Promise<Buffer>((resolve, reject) => {
		crypto.pbkdf2(password, salt, iterations, keylength, digest, (err: Error, derivedKey: Buffer) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(derivedKey);
		});
	});
}
export function readFileAsync(filename: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(filename, "utf8", (err, data) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(data);
		});
	});
}

//
// Email
//
import * as nodemailer from "nodemailer";
import * as marked from "marked";
// tslint:disable-next-line:no-var-requires
const striptags = require("striptags");
import { IUser } from "./schema";

export let emailTransporter = nodemailer.createTransport({
	host: config.email.host,
	port: config.email.port,
	secure: true,
	auth: {
		user: config.email.username,
		pass: config.email.password
	}
});
export async function sendMailAsync(mail: nodemailer.SendMailOptions): Promise<nodemailer.SentMessageInfo>  {
	return new Promise<nodemailer.SentMessageInfo>((resolve, reject) => {
		emailTransporter.sendMail(mail, (err, info) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(info);
		});
	});
}
export function sanitize(input: string): string {
	if (typeof input !== "string") {
		return "";
	}
	return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export async function renderEmailHTML(markdown: string, user: IUser): Promise<string> {
	return new Promise<string>(async (resolve, reject) => {
		// Interpolate and sanitize variables
		markdown = markdown.replace(/{{eventName}}/g, sanitize(config.eventName));
		markdown = markdown.replace(/{{email}}/g, sanitize(user.email));
		markdown = markdown.replace(/{{name}}/g, sanitize(user.name));

		marked(markdown, { sanitize: false, smartypants: true }, (err: Error | null, content: string) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(content);
		});
	});
}
export async function renderEmailText(markdown: string, user: IUser, markdownRendered: boolean = false): Promise<string> {
	let html: string;
	if (!markdownRendered) {
		html = await renderEmailHTML(markdown, user);
	}
	else {
		html = markdown;
	}
	// Remove <style> and <script> block's content
	html = html
		.replace(/<style>[\s\S]*?<\/style>/gi, "<style></style>")
		.replace(/<script>[\s\S]*?<\/script>/gi, "<script></script>");

	// Append href of links to their text
	const cheerio = await import("cheerio");
	let $ = cheerio.load(html, { decodeEntities: false });
	$("a").each((i, el) => {
		let element = $(el);
		element.text(`${element.text()} (${element.attr("href")})`);
	});
	html = $.html();

	let text: string = striptags(html);
	// Reverse sanitization
	return text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

import { DataLog } from "./schema";
export function trackEvent(action: string, request: express.Request, user?: string) {
	let thisEvent: DataLog = {
		action,
		url: request.path,
		time: moment.utc().format(),
		ip: request.ip,
		user,
		userAgent: request.headers["user-agent"] as string
	};
	console.log(thisEvent);
}
