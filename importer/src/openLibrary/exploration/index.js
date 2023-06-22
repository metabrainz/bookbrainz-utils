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
import asyncCluster from '../../asyncCluster/index.js';
import config from '../../helpers/config.js';
import explorePromise from './read.js';
import {hideBin} from 'yargs/helpers'
import log from '../../helpers/logger.js';
import {mergeSets} from '../../helpers/utils.js';
import util from 'util';
import yargs from 'yargs';


/* eslint-disable */

/**
 * @type {Object} Command line args parsed by yargs library
 **/
const argv = yargs(hideBin(process.argv)).usage('Usage: $0 [options]')
	.help('h')
	.option('dump', {
		alias : 'd',
		describe: 'Name of the dump key in OpenLibrary object.'
		+ 'Can take values `works`, `editions` or `authors`',
		type: 'string',
		nargs: 1,
		demand: 'dump name key is required',
		requiresArg:true
	})
	.alias('h', 'help')
	.epilog('BookBrainz Data Import Project')
	.argv;
/* eslint-enable */

/**
 * @type {Object} configOL - Object containing openLibrary dump import
 * 		configurations
 **/
const configOL = config(`openLibrary.${argv.dump}`);


/**
 * masterExitCallback - Func called by the master(cluster head) before it quits
 * to collect results from each worker process
 * @param {Array<?>} results - Array of results returned by the worker
 * 		functions
 **/
function masterExitCallback(results) {
	const aggregateResults = results.reduce((prev, {count, set}) => {
		prev.count += count;
		prev.set.push(set);
		return prev;
	}, {count: 0, set: []});

	aggregateResults.set = Array.from(mergeSets(aggregateResults.set));

	log.notice(
		`[MASTER::CLUSTER] Successfully read ${aggregateResults.count} records.`
	);

	log.notice(
		'[MASTER::CLUSTER] Set of unique key are:',
		util.inspect(aggregateResults.set)
	);

	log.info('[CLUSTER::MASTER] Master process is now shutting down.');
}

/**
 * workerExitCallback - Func called by the worker before it quits to collect
 * 		results from each instanceFunction
 * @param {Array<Promise>} results - Array containing promises which would yield
 * 		results from each instanceFunction
 * @returns {Promise} Promise returned carrying result to be sent to master
 **/
function workerExitCallback(results) {
	return Promise.all(results)
		.then((res) =>
			res.reduce((prev, {workerCount, workerSet}) => {
				prev.count.push(workerCount);
				prev.set.push(workerSet);
				return prev;
			}, {count: [], set: []}))
		.then(res => ({
			count: _.sum(res.count),
			set: Array.from(mergeSets(res.set))
		}));
}

/**
 * getClusterArgs - Function to generate arguments on which instance functions
 * 		would be run. These arguments would be passed to the cluster master
 * @returns {Array<string>} - Array containing cluter arguments
 **/
function getClusterArgs() {
	return _.range(1, configOL.fileCount + 1)
		.map(fileName => `${configOL.path}/${fileName}.txt`);
}

asyncCluster({
	clusterArgs: getClusterArgs(),
	instanceFunction: explorePromise,
	masterExitCallback,
	workerExitCallback
});
