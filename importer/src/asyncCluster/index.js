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


import * as Error from '../helpers/errors.js';
import {isNotDefined, splitArray} from '../helpers/utils.js';
import _ from 'lodash';
import log from '../helpers/logger.js';
import os from 'os';
import runCluster from './cluster.js';


/**
 * Wrap the user provided workerExitCallback into higher abstraction with error
 * 		handling, sending results to master and terminating the worker process.
 * @namespace getWorkerExitCallback
 * @param {function} workerExitCallback - Function called before the master
 * 		process exits, with results from each worker passed as arguments
 * @returns {function} anonymous Function - Function according to async.parallel
 * 		module callback function, which takes in error and an array containing
 * 		results returned from the instance functions. The results are an array
 * 		promises and the workerExitCallback process these promises and in turn
 * 		returns a promise itself, which when returns a value is passed to the
 * 		master process and the worker process is then terminated.
 */
function getWorkerExitCallback(workerExitCallback) {
	return (err, results) => {
		if (err) {
			log.error('Worker function quit unexpectedly.');
			process.kill(process.pid, 'SIGHUP');
		}

		workerExitCallback(results)
			.then(res => process.send(res))
			.then(() => process.kill(process.pid, 'SIGHUP'));
	};
}

/**
 * Wrap the user provided workerExitCallback into higher abstraction with error
 * 		handling, sending results to master and terminating the worker process.
 * @namespace getWorkerExitCallback
 * @param {Object} argsObj - Argument passed to the function
 * @param {number} argsObj.asyncLimit - Maximum limit on instance functions run
 * 		asynchronously
 * @param {Array<?>} argsObj.clusterArgs - Array containing arguments to be
 * 		processed in the cluster
 * @param {function} argsObj.instanceFunction - Instance function to be run
 * 		against each clusterArgs
 * @param {function} argsObj.masterExitCallback - Function called with results
 * 		from each worker process before the master exists
 * @param {number} argsObj.processLimit - Maximum limit on forked worker
 * 		processes
 * @param {function} argsObj.workerInitFunction - Function called before the
 * 		worker process begins executing instance functions
 * @param {function} argsObj.workerExitCallback - Function called before the
 * 		worker exits, with results from all the instance functions passed to it
 * 		It must return a promise.
 */
function asyncCluster({
	asyncLimit = 4,
	clusterArgs,
	instanceFunction,
	masterExitCallback,
	processLimit = os.cpus().length,
	workerInitFunction,
	workerExitCallback
}) {
	const clusterConfig = {
		asyncLimit,
		instanceFunction,
		masterExitCallback,
		processLimit,
		workerInitFunction
	};

	if (!_.isFunction(clusterConfig.masterExitCallback)) {
		clusterConfig.masterExitCallback = () => {
			log.info('Master exiting');
		};
	}

	if (!_.isFunction(workerInitFunction)) {
		clusterConfig.workerInitFunction = () => {
			log.info('Worker Initialising');
		};
	}

	if (!_.isFunction(instanceFunction)) {
		Error.undefinedValue('AsyncCluster:: Missing instance function');
	}

	if (isNotDefined(clusterArgs)) {
		clusterConfig.workerArgsArr =
			_.times(processLimit, (id) => [`Worker number ${id}`]);
	}
	else {
		clusterConfig.workerArgsArr = splitArray(clusterArgs, processLimit);
	}

	if (!_.isFunction(workerExitCallback)) {
		clusterConfig.workerExitCallback = getWorkerExitCallback(
			(promise) => promise
		);
	}
	else {
		clusterConfig.workerExitCallback =
			getWorkerExitCallback(workerExitCallback);
	}

	runCluster(clusterConfig);
}

export default asyncCluster;
