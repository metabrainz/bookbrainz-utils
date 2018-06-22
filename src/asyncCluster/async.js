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


import async from 'async';


/**
 * Convert instance functions into async.parallel compatible functions with
 * 		relevant arguments passed via closure
 * @param {Object} args - Arguments passed
 * @param {function} args.instanceFunction - Instance function to run on each
 * 		clusterArgs
 * @param {Array<Object>} args.allWorkerArgs - Instance function argument array
 * @returns {Array<function>} Array of async worker functions
 */
function getAsyncWorkerFunctions({instanceFunction, allWorkerArgs}) {
	function asyncWorkerFunction(args) {
		return (callback) => callback(null, instanceFunction(args));
	}

	return allWorkerArgs.map(args => asyncWorkerFunction(args));
}

/**
 * asyncWorker - Base worker function to run instances of instance function
 * @param {Object} args - Arguments passed
 * @param {number} args.asyncLimit - Number of instanceFunction tasks to run
 * 		asynchronously
 * @param {function} args.instanceFunction - Instance function to process each
 * 		clusterArgs
 * @param {Array<?>} args.workerArgs - clusterArgs chunk for this worker
 * @param {function} args.workerExitCallback - Function called back by async
 * 		library after all workerArgs have been processed by the instance funtion
 * @param {function} args.workerInitFunction - Function called before execution
 * 		of intance functions is carried out to formally initialize the worker
 * @param {number} args.workerId - The numerical worker id of this worker
 */
function asyncWorker({
	asyncLimit,
	instanceFunction,
	workerArgs,
	workerExitCallback,
	workerInitFunction,
	workerId
}) {
	const initArgs = workerInitFunction ? workerInitFunction(workerId) : null;

	const allWorkerArgs = workerArgs.map(wargs =>
		({base: wargs, id: workerId, init: initArgs}));

	const asyncWorkerFunctions = getAsyncWorkerFunctions({
		allWorkerArgs,
		instanceFunction
	});

	async.parallelLimit(
		asyncWorkerFunctions,
		asyncLimit,
		workerExitCallback
	);
}

export default asyncWorker;
