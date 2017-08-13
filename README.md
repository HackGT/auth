# HackGT Auth

**Simple and agnostic single-sign-on authentication for a federation of apps.**

[Check it out running in production](https://auth.hack.gt) for HackGT 4: New Heights!

## Building and running

First, make sure that you have a MongoDB server up and running and a recent version of Node.js installed. Once your `config.json` or environment variables are set, you can be up and running in less than 30 seconds:

To build and run the server:

	# Install dependencies
	npm install
	# Build question type definitions for TypeScript from the questions schema and compile
	npm run build
	# Run server (check the logs for the port and any warning information)
	npm start

Visit `http://localhost:3000` and you're good to go!

## Deployment

A [Dockerfile](Dockerfile) is provided for convenience.

Environment Variable | Description
---------------------|------------
PRODUCTION | Set to `true` to set OAuth callbacks to production URLs (default: `false`)
PORT | The port the check in system should run on (default: `3000`)
MONGO_URL | The URL to the MongoDB server (default: `mongodb://localhost/`)
COOKIE_MAX_AGE | The `maxAge` of cookies set in milliseconds (default: 6 months) **NOTE: this is different from the session TTL**
COOKIE_SECURE_ONLY | Whether session cookies should sent exclusively over secure connections (default: `false`)
PASSWORD_RESET_EXPIRATION | The time that password reset links sent via email should be valid for in milliseconds (default: 1 hour)
SESSION_SECRET | The secret used to sign and validate session cookies (default: random 32 bytes regenerated on every start up)
GITHUB_CLIENT_ID | OAuth client ID for GitHub *required*
GITHUB_CLIENT_SECRET | OAuth client secret for GitHub *required*
GOOGLE_CLIENT_ID | OAuth client ID for Google *required*
GOOGLE_CLIENT_SECRET | OAuth client secret for Google *required*
FACEBOOK_CLIENT_ID | OAuth client ID for Facebook *required*
FACEBOOK_CLIENT_SECRET | OAuth client secret for Facebook *required*
EMAIL_FROM | The `From` header for sent emails (default: `HackGT Team <hello@hackgt.com>`)
EMAIL_HOST | The SMTP email server's hostname (default: *none*)
EMAIL_PORT | The SMTP email server's port (default: `465`)
EMAIL_USERNAME | The username for the SMTP email server (default: *none*)
EMAIL_PASSWORD | The password for the SMTP email server (default: *none*)
EVENT_NAME | The current event's name which affects rendered templates and sent emails (default: `Untitled Event`)

### OAuth IDs and secrets

Can be obtained from:
- [GitHub](https://github.com/settings/developers)
	- Register a new application
	- Application name, URL, and description are up to you
	- Callback URL should be in the format: `https://YOUR_DOMAIN/auth/github/callback`
	- Local testing callback URL should be `http://localhost:3000/auth/github/callback`
	- GitHub only lets you register one callback URL per application so you might want to make a testing application and a separate application for production usage.
- [Google API Console](https://console.developers.google.com/apis/credentials)
	- Create an application
	- Go to the credentials tab in the left panel
	- Click Create credentials > OAuth client ID
	- Set web application as the application type
	- Give it a name (won't be shown publically, e.g. `HackGT auth server testing`)
	- Leave Authorized JavaScript origins blank
	- List all testing / production callback URLs in Authorized redirect URIs
		- Should be in the format: `https://YOUR_DOMAIN/auth/google/callback`
		- For local testing: `http://localhost:3000/auth/google/callback`
	- It is recommended that you create two OAuth applications with different IDs and secrets for testing and production usage.
- [Facebook](https://developers.facebook.com/)
	- Create an application
	- Add the Facebook Login product from the left panel
	- Enable Client OAuth Login, Web OAuth Login, and Embedded Browser OAuth Login
	- List all testing / production callback URLs in Valid OAuth redirect URLs
		- Should be in the format: `https://YOUR_DOMAIN/auth/facebook/callback`
		- For local testing: `http://localhost:3000/auth/facebook/callback`
	- Optionally, repeat the process for separate testing and production applications


## Contributing

If you happen to find a bug or have a feature you'd like to see implemented, please [file an issue](https://github.com/HackGT/auth/issues). 

If you have some time and want to help us out with development, thank you! You can get started by taking a look at the open issues, particularly the ones marked [help wanted](https://github.com/HackGT/auth/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22) or [help wanted - beginner](https://github.com/HackGT/auth/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted+-+beginner%22). Feel free to ask questions to clarify things, determine the best way to implement a new feature or bug fix, or anything else!

### Tips

- Please try your best to follow the existing coding styles and conventions.
- Use the latest version of TypeScript
- Use TypeScript's [type annotations](http://www.typescriptlang.org/docs/handbook/basic-types.html) whenever possible and Promises for asynchronous operations in conjunction with ES7 async/await (TypeScript's transpilation allows for the use of these features even on platforms that don't support or entirely support ES6 and ES7).
- We also have [TSLint](https://palantir.github.io/tslint/) [config](tslint.json) to catch *most* style errors or inconsistencies. Sometimes, however, it's necessary to break these rules to get something to work. First, consider if there might be a better way of tackling the problem so that disabling TSLint isn't required. Only if there isn't should you [disable TSLint](https://palantir.github.io/tslint/usage/rule-flags/) on a line or section basis. *Never disable for entire files.*
- Don't overuse TypeScript's [non-null assertion operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator) (the `!` after expressions). A value being `null` is something you should check for and not simply disregard. The preferred way to deal with possibly `null` values is to check with `if (value) {}` and fail gracefully if it is not truthy. The TypeScript compiler is usually smart enough to know when you do this, but in more complex cases, an object already checked for non-`null` status will be reported as possibly null. In this case, you should use the non-null assertion operator.
- **Make sure your branch builds without warnings or errors (including those from TSLint) before committing.** Automatic builds are set up with Travis CI and will be marked failed if your code doesn't compile.
- **Use descriptive commit messages that begin with an imperative verb, are properly capitalized, spelled correctly, descriptive, and do not exceed 72 characters.** For commits with additional detail, include this in the description and not the main message (you can do this by running `git commit` with no flags and entering your title, two new lines, and then your description). Descriptions can be as long as necessary.

## License

Copyright &copy; 2017 HackGT. Released under the MIT license. See [LICENSE](LICENSE) for more information.
