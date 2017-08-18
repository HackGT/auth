import * as fs from "fs";
import * as path from "path";
import * as graphql from "graphql";
import { generateNamespace } from "@gql2ts/from-schema";
import { PossibleSchemaInput } from "@gql2ts/util";

async function gen_types() {
	const schemaPath = path.resolve(__dirname, "../server/api/api.graphql");

	const schemaText = fs.readFileSync(schemaPath, "utf8");

	const schema = graphql.buildSchema(schemaText);

	const response = await graphql.graphql(schema, graphql.introspectionQuery, {});

	if (!response || !response.data) throw new Error("Could not generate schema.");

	const typings = generateNamespace("Auth", response as PossibleSchemaInput);

	fs.writeFileSync("index.d.ts", typings);
}

gen_types().catch(e => {
	throw e;
});
