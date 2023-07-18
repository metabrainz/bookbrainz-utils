/*
 * Copyright (C) 2018  Shivam Tripathi
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

import _ from 'lodash';
import {fileURLToPath} from 'node:url';
import log from '../helpers/logger.ts';
import {readFileSync} from 'node:fs';


/** @module config */

/*
 * @type {string} FILE
 * Path to config file.
 **/
const FILE = fileURLToPath(new URL('../../config/config.json', import.meta.url));

/**
 * Extract the import configuration from the config file.
 * @param {Array<string>} configKeys - The keys, in nesting order, to reach the
 *		relevant config object. For example, to extract OL works, if the JSON
 *		object structure is {"openLibrary": {"works": {...}, ...}, ...}, the
 *		arguments would be ['openLibrary', 'works'].
 * @returns {Object} - JS Object constaining configuration values.
 */
export default function config(configKeys) {
	try {
		if (configKeys) {
			const configContents =
				JSON.parse(readFileSync(`${FILE}`));

			log.info(`[CONFIG] Successfully read '${configKeys}' configuration.`);

			return _.get(configContents, configKeys);
		}
	}
	catch (err) {
		log.error('[ERROR::CONFIG] Please set up ./config/config.json files.');
		throw new Error('Configuration values not found!');
	}

	return null;
}
