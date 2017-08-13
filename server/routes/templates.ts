import * as fs from "fs";
import * as path from "path";
import * as express from "express";
import * as Handlebars from "handlebars";
import * as bowser from "bowser";

import {
	STATIC_ROOT,
	COOKIE_OPTIONS,
	config,
	all_host_cookie_opts
} from "../common";
import {
	User,
	ILoginTemplate
} from "../schema";

export let templateRoutes = express.Router();

// Load and compile Handlebars templates
let [
	loginTemplate,
	forgotPasswordTemplate,
	resetPasswordTemplate,
	unsupportedTemplate,
	successTemplate
] = [
	"login.html",
	"forgotpassword.html",
	"resetpassword.html",
	"unsupported.html",
	"success.html"
].map(file => {
	let data = fs.readFileSync(path.resolve(STATIC_ROOT, file), "utf8");
	return Handlebars.compile(data);
});

// Block IE
templateRoutes.use(async (request, response, next) => {
	// Only block requests for rendered pages
	if (path.extname(request.url) !== "") {
		next();
		return;
	}

	let userAgent = request.headers["user-agent"] as string | undefined;
	const minBrowser = {
		msie: "12", // Microsoft Edge+ (no support for IE)
		safari: "7.1" // Safari v7 was released in 2013
	};
	if (bowser.isUnsupportedBrowser(minBrowser, false, userAgent)) {
		let templateData = {
			siteTitle: config.eventName
		};
		response.send(unsupportedTemplate(templateData));
	}
	else {
		next();
	}
});

templateRoutes.route("/login").get((request, response) => {
	const ssoAuth = request.cookies["sso-auth"];
	if (request.isAuthenticated() && ssoAuth === request.sessionID) {
		response.redirect("/success");
	}

	let templateData: ILoginTemplate = {
		siteTitle: config.eventName,
		error: request.flash("error"),
		success: request.flash("success")
	};

	const callback = request.query.callback;
	if (callback) {
		response.cookie("callback", callback, COOKIE_OPTIONS);
	}
	response.send(loginTemplate(templateData));
});
templateRoutes.route("/logout").get((request, response) => {
	response.clearCookie("sso-auth", all_host_cookie_opts(request.hostname));

	if (request.session) {
		request.session.destroy(() => {
			response.redirect("/login");
		});
	} else {
		response.redirect("/login");
	}
});
templateRoutes.route("/success").get((request, response) => {
	response.send(successTemplate({
		siteTitle: config.eventName
	}));
});
templateRoutes.route("/").get((request, response) => {
	response.redirect("/login");
});
templateRoutes.route("/login/forgot").get((request, response) => {
	let templateData: ILoginTemplate = {
		siteTitle: config.eventName,
		error: request.flash("error"),
		success: request.flash("success")
	};
	response.send(forgotPasswordTemplate(templateData));
});
templateRoutes.get("/auth/forgot/:code", async (request, response) => {
	let user = await User.findOne({ "localData.resetCode": request.params.code });
	if (!user) {
		request.flash("error", "Invalid password reset code");
		response.redirect("/login");
		return;
	}
	else if (!user.localData!.resetRequested || Date.now() - user.localData!.resetRequestedTime.valueOf() > 1000 * 60 * 60) {
		request.flash("error", "Your password reset link has expired. Please request a new one.");
		user.localData!.resetCode = "";
		user.localData!.resetRequested = false;
		await user.save();
		response.redirect("/login");
		return;
	}
	let templateData: ILoginTemplate = {
		siteTitle: config.eventName,
		error: request.flash("error"),
		success: request.flash("success")
	};
	response.send(resetPasswordTemplate(templateData));
});
