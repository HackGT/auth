import * as express from "express";

import { Session, User } from "../schema";

function safe_parse(json: string): any {
	try {
		return JSON.parse(json);
	} catch (e) {
		return;
	}
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
	params: { token: string },
	request: express.Request
): Promise<{
	id: string;
	email: string;
	email_verified: boolean;
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
		name: account.name
	};
}
