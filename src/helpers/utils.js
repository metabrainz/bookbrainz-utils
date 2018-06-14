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


export const CREATOR = 'Creator';
export const EDITION = 'Edition';
export const PUBLICATION = 'Publication';
export const PUBLISHER = 'Publisher';
export const WORK = 'Work';
export const entityTypes = {CREATOR, EDITION, PUBLICATION, PUBLISHER, WORK};

/**
 * mergeSets: Merge an array of sets into a single set.
 * @param {Array<Set>} setArr - Array containing a number of sets.
 * @returns {Set} - Set containing all unique values from the array of sets.
 */
export function mergeSets(setArr) {
	return new Set(function* generator() {
		for (const set of setArr) {
			yield* set;
		}
	}());
}

/**
 * isNotDefined: Check if a variable is undefined, null or contains
 * 		any other falsy value
 * @param {?} value - The variable to be checked for definition
 * @returns {boolean} - Boolean value if the variable is not defined or not.
 */
export function isNotDefined(value) {
	if (typeof value === 'undefined' || !value) {
		return true;
	}
	return false;
}

/**
 * splitArray: Split an array into given number of parts
 * @param {Array<?>} array - Array to be split into parts.
 * @param {number} parts - Number of parts the given array has to be broken into
 * @returns {Array<Array<?>>} - A nested array containing broken down parts.
 */
export function splitArray(array, parts) {
	if (isNotDefined(array)) {
		return _.times(parts, []);
	}

	if (array.length < parts) {
		return _.chunk(array, 1);
	}

	const splitSize = Math.ceil(array.length / parts);
	const returnArray = _.chunk(array, splitSize);

	return returnArray;
}
