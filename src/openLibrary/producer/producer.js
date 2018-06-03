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


import * as Error from '../../helpers/errors';
import Promise from 'bluebird';
import {Queue} from '../../queue';
import fs from 'fs';
import {isNotDefined} from '../../helpers/utils';
import log from '../../helpers/logger';
import readline from 'readline';


/**
 * readLine - Function which takes in instanceArgs and processes them.
 * @param {Object} obj - Primary argument
 * @param {Promise} obj.init - Connection promise
 * @param {number} obj.id - Numerical Id of the worker process running this
 * 		instance
 * @param {string} obj.base - This is path to the file to be processed
 * @param {function} callback - Function used send back the results. Used for
 * 		promsifying the result.
 **/
function readLine({base, id, init}, callback) {
	if (isNotDefined(base)) {
		Error.undefinedValue('producerPromise:: File path (base args).');
	}

	if (id !== 0 && isNotDefined(id)) {
		Error.undefinedValue('producerPromise:: Worker Id undefined.');
	}

	// Errors related to init value will be handled on the queue side
	const queue = new Queue(init);

	const fileName = base.split('/').pop();
	log.info(`[WORKER::${id}] Running instance function on ${fileName}.`);

	const rl = readline.createInterface({
		input: fs.createReadStream(base)
	});

	let count = 0;

	rl.on('line', line => {
		count++;
		try {
			const json = JSON.parse(line.split('\t')[4]);
			log.log(`WORKER${id}:: Pushing record ${count}`);
			// TODO : parse(json) Implement parser function to process records
			queue.push(json);
		}
		catch (err) {
			log.warning(
				`Error in ${fileName} in line number ${count}.`,
				'Skipping. Record for reference: \n [[',
				line, ']]'
			);
		}
	});

	rl.on('close', () => {
		callback(null, {
			connection: init,
			id,
			workerCount: count
		});
	});
}

/**
 * explorePromise - Promisfied version of readLine
 * @type {function}
 * @returns {Promise}
 **/
const producerPromise = Promise.promisify(readLine);

export default producerPromise;
