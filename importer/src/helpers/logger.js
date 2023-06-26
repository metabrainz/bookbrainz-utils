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


import util from 'node:util';
import {createLogger, format, transports} from 'winston';


/** @module config */

/**
 * @type {Object} log
 * Winston logger Object:
 * 		Transport added: console
 * 		Pretty printed using utils.inspect
 * 		Doesn't exit on error
 */
const log = createLogger({
	exitOnError: false,
	levels: {
		alert: 1,
		crit: 2,
		debug: 7,
		emerg: 0,
		error: 3,
		info: 6,
		notice: 5,
		read: 8,
		warning: 4
	},
	prettyPrint: function prettyPrint(object) {
		return util.inspect(object);
	},
	transports: [
		new transports.Console({
			format: format.combine(
				format.colorize(),
				format.timestamp(),
				format.printf((info) => `${info.timestamp} - ${info.level}: ${info.message}`)
			),
			handleExceptions: true,
			level: 'debug'
		})
	]
});

export default log;
