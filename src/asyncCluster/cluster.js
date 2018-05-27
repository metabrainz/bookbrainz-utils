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


import * as Error from '../helpers/errors';
import asyncWorker from './async';
import cluster from 'cluster';
import {isNotDefined} from '../helpers/utils';
import log from '../helpers/logger';


/**
 * Extract the import configuration from the config file.
 * @param {Object} argsObj - Arguments passed
 * @param {function} args.masterExitCallback - Function called before the master
 * 		process exits, with results from each worker passed as arguments
 * @param {number} args.processLimit - Maximum number of worker processes to be
 * 		forked
 * @param {Array.<Array.<?>>} args.workerArgsArr - Array containing clusterArgs
 * 		chunks, split into number of workers
 * @param {Object} args - Remaining arguments passed
 */
export default function runClusters({
	masterExitCallback,
	processLimit,
	workerArgsArr,
	...args
}) {
	if (typeof masterExitCallback !== 'function') {
		Error.undefinedValue('Cluster:: Undefined masterExitCallback.');
	}

	if (isNotDefined(processLimit)) {
		Error.undefinedValue('Cluster:: Undefined processLimit.');
	}

	if (!Array.isArray(workerArgsArr)) {
		Error.undefinedValue('Cluster:: workerArgsArr is not an array.');
	}

	if (workerArgsArr.length === 0) {
		Error.sizeMismatch('Cluster:: WorkerArgsArr empty.');
	}

	if (cluster.isMaster) {
		log.info('CLUSTER::MASTER has started.');
		const results = [];

		for (let i = 0; i < workerArgsArr.length; i++) {
			const worker = cluster.fork();

			worker.on('message', msg => {
				results.push(msg);
			});

			worker.send({id: i});
		}
		process.on('exit', () => {
			masterExitCallback(results);
		});
	}
	else {
		process.on('message', ({id}) => {
			asyncWorker({
				workerArgs: workerArgsArr[id],
				workerId: id,
				...args
			});
		});
	}
}
