import "reflect-metadata";
import * as program from 'commander';
import {createConnection} from "typeorm";
import cleanAliases from './aliases';


async function main() {
	await createConnection();

	return cleanAliases();
}

program
	.option(
		'--dry-run',
		'Run the data cleaner without committing any data changes'
	)
	.parse(process.argv);

main()
	.then(() => console.log('Done!'));
