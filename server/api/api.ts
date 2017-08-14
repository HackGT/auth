import * as express from "express";

import { Session, User } from "../schema";

function safe_parse(json: string): any {
	try {
		return JSON.parse(json);
	} catch (e) {
		return;
	}
}

export function logout(params: undefined, request: express.Request): string {
	const proto = request.secure ? "https" : "http";
	return `${proto}://${request.headers.host}/logout`;
}

export function authenticate(
	params: { callback: string },
	request: express.Request
): string {
	const callback = encodeURIComponent(params.callback);
	const proto = request.secure ? "https" : "http";
	return `${proto}://${request.headers.host}/login?callback=${callback}`;
}

export async function user(
	params: { token: string }
): Promise<{
	id: string;
	email: string;
	email_verified: boolean;
	admin: boolean;
	name: string;
} | undefined> {
	const session = await Session.findOne({ "_id": params.token });
	if (!session || !session.session || !session.expires) return undefined;

	const data = safe_parse(session.session);
	if (!data || !data.passport || !data.passport.user) return undefined;

	// Check expiration date
	if (new Date() > session.expires) return undefined;

	const account = await User.findById(data.passport.user);
	if (!account) return undefined;

	return {
		id: account._id,
		email: account.email,
		email_verified: account.verifiedEmail,
		admin: account.admin || false,
		name: account.name
	};
}

export async function is_admin(
	params: { token: string; email: string; admin: boolean },
	request: express.Request
) {
	// Authenticate
	const account = await user({ token: params.token });
	if (!account || !account.admin) {
		return undefined;
	}

	// Set admin status
	const updated = await User.update({
		email: params.email
	}, {
		admin: params.admin
	});
	return updated.n > 0 ? params.admin : undefined;
}

