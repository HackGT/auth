// tslint:disable:interface-name variable-name
// The database schema used by Mongoose
// Exports TypeScript interfaces to be used for type checking and Mongoose models derived from these interfaces
import {mongoose} from "./common";

// Secrets JSON file schema
export namespace IConfig {
	export interface Secrets {
		session: string;
		github: {
			id: string;
			secret: string;
		};
		google: {
			id: string;
			secret: string;
		};
		facebook: {
			id: string;
			secret: string;
		};
	}
	export interface Email {
		from: string;
		host: string;
		username: string;
		password: string;
		port: number;
	}
	export interface Server {
		isProduction: boolean;
		port: number;
		versionHash: string;
		workflowReleaseCreatedAt: string | null;
		workflowReleaseSummary: string | null;
		cookieMaxAge: number;
		cookieSecureOnly: boolean;
		mongoURL: string;
		passwordResetExpiration: number;
	}

	export interface Main {
		secrets: Secrets;
		email: Email;
		server: Server;
		admins: string[];
		eventName: string;
	}
}

export interface IUser {
	_id: mongoose.Types.ObjectId;
	email: string;
	name: string;
	verifiedEmail: boolean;

	localData?: {
		hash: string;
		salt: string;
		verificationCode: string;
		resetRequested: boolean;
		resetCode: string;
		resetRequestedTime: Date;
	};
	githubData?: {
		id: string;
		username: string;
		profileUrl: string;
	};
	googleData?: {
		id: string;
	};
	facebookData?: {
		id: string;
	};

	admin?: boolean;
}
export type IUserMongoose = IUser & mongoose.Document;

// This is basically a type definition that exists at runtime and is derived manually from the IUser definition above
export const User = mongoose.model<IUserMongoose>("User", new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true
	},
	name: String,
	verifiedEmail: Boolean,

	localData: {
		hash: String,
		salt: String,
		verificationCode: String,
		resetRequested: Boolean,
		resetCode: String,
		resetRequestedTime: Date
	},
	githubData: {
		id: String,
		username: String,
		profileUrl: String
	},
	googleData: {
		id: String
	},
	facebookData: {
		id: String
	},

	admin: Boolean
}));

export interface ISetting {
	_id: mongoose.Types.ObjectId;
	name: string;
	value: any;
}
export type ISettingMongoose = ISetting & mongoose.Document;

export const Setting = mongoose.model<ISettingMongoose>("Setting", new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	value: mongoose.Schema.Types.Mixed
}));

export interface ISession {
	_id: string;
	session: string;
	expires: Date;
	lastModified: Date;
}
export type ISessionMongoose = ISession & mongoose.Document;

export const Session = mongoose.model<ISessionMongoose>("Session", new mongoose.Schema({
	_id: {
		type: String,
		required: true,
		unique: true
	},
	session: {
		type: String,
		required: true
	},
	expires: {
		type: Date,
		required: true
	},
	lastModified: {
		type: Date
	}
}));

// Handlebars templates
export interface ICommonTemplate {
	siteTitle: string;
	user: IUser;
	settings: {
		teamsEnabled: boolean;
	};
}
export interface ILoginTemplate {
	siteTitle: string;
	error?: string;
	success?: string;
}
export interface ResponseCount {
	"response": string;
	"count": number;
}
export interface StatisticEntry {
	"questionName": string;
	"branch": string;
	"responses": ResponseCount[];
}

export interface DataLog {
	action: string;
	url: string;
	time: string;
	ip: string;
	userAgent?: string;
	user?: string;
}
