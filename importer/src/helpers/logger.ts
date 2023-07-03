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
		read: 8,
		warn: 4
	},
	transports: [
		// new transports.Console({
		// 	// format: format.combine(
		// 	// 	format.colorize(),
		// 	// 	format.timestamp(),
		// 	// 	format.printf((info) => `${info.timestamp} - ${info.level}: ${info.message}`)
		// 	// ),
		// 	// handleExceptions: true,
		// 	// level: 'debug'
		// })
	]
});

// Use standard console as drop-in replacement for winston for now.
// TODO: Use a proper logging library again once it is clear why the transports setup code above caused amqplib to hang.
// export default log;
export default console;
