/*
 * Copyright (C) 2018  Shivam Tripathi
 *               2023  David Kellner
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import {fileURLToPath} from 'node:url';
import log from './logger.ts';
import {readFileSync} from 'node:fs';


export type Configuration = {
	// TODO: use knex configuration type
	database: {
		client: string;
		connection: {
			host: string;
			database: string;
			user: string;
			password: string;
		};
	};
	import: {
		retryLimit: number;
	};
	queue: {
		connection: string;
	}
};

const configPath = fileURLToPath(new URL('../../config/config.json', import.meta.url));

// eslint-disable-next-line import/no-mutable-exports -- we only do this to catch parsing errors
export let config: Partial<Configuration> = {};

try {
	config = JSON.parse(readFileSync(configPath).toString());
}
catch (error) {
	log.error('[ERROR::CONFIG] Failed to parse configuration file');
	throw error;
}

export default config;
