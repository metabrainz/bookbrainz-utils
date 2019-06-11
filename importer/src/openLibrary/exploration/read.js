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

import Promise from 'bluebird';
import fs from 'fs';
import log from '../../helpers/logger';
import readline from 'readline';

/**
 * readLine - Function which takes in instanceArgs and processes them.
 * @param {Object} obj - Primary argument
 * @param {number} obj.id - Numerical Id of the worker process running this
 * 		instance
 * @param {string} obj.base - This is path to the file to be processed
 * @param {function} callback - Function used send back the results. Used for
 * 		promsifying the result.
 **/
function readLine({base, id}, callback) {
	const fileName = base.split('/').pop();
	log.info(`[WORKER::${id}] Running instance function on ${fileName}.`);

	const rl = readline.createInterface({
		input: fs.createReadStream(base)
	});

	let count = 0;
	const set = new Set();

	rl.on('line', line => {
		count++;
		try {
			// According to details at https://openlibrary.org/developers/dumps
			// Tab separated values in the following order
			// 		➜ type - type of record (/type/edition, /type/work etc.)
			// 		➜ key - unique key of the record. (/books/OL1M etc.)
			// 		➜ revision - revision number of the record
			// 		➜ last_modified - last modified timestamp
			// 		➜ JSON - the complete record in JSON format
			const json = JSON.parse(line.split('\t')[4]);
			Object.keys(json).forEach(key => set.add(key));
		} catch (err) {
			log.warning(
				`[WORKER::${id}] Error in ${fileName} in line number ${count}.`,
				`Skipping. Record for reference: \n [[ ${line} ]]`
			);
		}
	});

	rl.on('close', () => {
		callback(null, {workerCount: count, workerSet: set});
	});
}

/**
 * explorePromise - Promisfied version of readLine
 **/
const explorePromise = Promise.promisify(readLine);

export default explorePromise;
