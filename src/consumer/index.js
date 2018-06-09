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


import {Connection} from '../queue';
import Promise from 'bluebird';
import asyncCluster from '../asyncCluster';
import consumerPromise from './consumer';
import log from '../helpers/logger';


// Func called by the master(cluster head) before it quits to collect results
//		from each worker process
function masterExitCallback() {
	log.info(
		'[CLUSTER::MASTER] All workers exited.',
		'Cluster master is now shutting down.'
	);
}

// Func called by the worker before it quits to collect results from each thread
function workerExitCallback(results) {
	return Promise.all(results)
		.then((res) => {
			log.info(`[WORKER::${res[0].id}]`,
				'Consumer process is now shutting down.');
			Connection.shutdown(res[0].connection);
		});
}

// Run before worker function begins it's execution. Return value is passed to
// 		each instance function as {init} of argument.
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
