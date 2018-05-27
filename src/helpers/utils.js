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


/**
 * mergeSets: Merge an array of sets into a single set.
 * @param {Array.<Set>} setArr - Array containing a number of sets.
 * @returns {Set} - Set containing all unique values from the array of sets.
 */
export function mergeSets(setArr) {
	return new Set(function* generator() {
		for (const set of setArr) {
			yield* set;
		}
	}());
}
