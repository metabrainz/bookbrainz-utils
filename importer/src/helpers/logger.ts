/*
 * Copyright (C) 2018  Shivam Tripathi
 *               2023  David Kellner
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


import {createLogger, format, transports} from 'winston';


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
		warn: 4
	},
	transports: [
		new transports.Console({
			format: format.combine(
				format.colorize(),
				format.timestamp(),
				format.printf(({message, level, timestamp, ...metadata}) => {
					let output = `${timestamp} ${level}: ${message}`;
					if (Object.keys(metadata).length) output += ` ${JSON.stringify(metadata, null, 2)}`;
					return output;
				})
			),
			handleExceptions: true,
			level: 'debug'
		})
	]
});

export default log;

/**
 * Logs an error with stack trace (if present) and context.
 * @param {any} error - `Error` object or an error of arbitrary type.
 * @param {string} messagePrefix - Optional prefix to add context to the error message.
 */
export function logError(error: any, messagePrefix?: string) {
	const message = [
		messagePrefix,
		error instanceof Error ? error.stack : error.toString()
	].filter(Boolean).join(': ');
	log.error(message);
}
