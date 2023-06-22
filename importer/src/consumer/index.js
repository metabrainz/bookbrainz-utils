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


import {Connection} from '../queue/index.js';
import asyncCluster from '../asyncCluster/index.js';
import consumerPromise from './consumer.js';
import log from '../helpers/logger.js';


/**
 * masterExitCallback - Function called upon master exit. Presently serves no
 * 		critical purpose, but added for handling conditions in future where
 * 		we may want to gracefully end the conusmer processes in case of failure.
 **/
function masterExitCallback() {
	log.info(
		'[CLUSTER::MASTER] All workers exited.',
		'Cluster master is now shutting down.'
	);
}

/**
* workerExitCallback - Func called by the worker before it quits to collect
* 		results from each thread. Primary intended to shutdown active
*		RMQ connection.
* @param {Array<Promise>} results - Array containing promises which would yield
* 		results from each instanceFunction
* @returns {Promise} Empty promise
**/
function workerExitCallback(results) {
	return Promise.all(results)
		.then((res) => {
			log.info(`[WORKER::${res[0].id}]`,
				'Consumer process is now shutting down.');
			Connection.shutdown(res[0].connection);
		});
}

/**
 * workerInitFunction - Used to set up queue connection before workers begin
 * 		consuming
 * @param {number} id - Worker ID for the running process
 * @returns {Promise} Promise containing connection object
 */
function workerInitFunction(id) {
	log.info(`[WORKER::${id}] Consumer worker process has begun.`);
	return Connection.connect();
}

asyncCluster({
	instanceFunction: consumerPromise,
	masterExitCallback,
	workerExitCallback,
	workerInitFunction
});
