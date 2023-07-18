/*
 * Copyright (C) 2018  Shivam Tripathi
 * Copyright (C) 2018 Ben Ockmore
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


/**
 * mergeSets: Merge an array of sets into a single set.
 * @param {Array<Set>} setArr - Array containing a number of sets.
 * @returns {Set} - Set containing all unique values from the array of sets.
 */
export function mergeSets<T>(setArr: Array<Set<T>>): Set<T> {
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
export function isNotDefined(value: any): boolean {
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
export function splitArray<T>(array: Array<T>, parts: number): Array<Array<T>> {
	if (isNotDefined(array)) {
		return _.times(parts, () => []);
	}

	if (array.length < parts) {
		return _.chunk(array, 1);
	}

	const splitSize = Math.ceil(array.length / parts);
	const returnArray = _.chunk(array, splitSize);

	return returnArray;
}

/**
 * stripDot: Taken from bookbrainz-site
 * Removes all period characters (dots) from the input string, returning a new
 * string.
 *
 * @param {String} name the input string to strip
 * @returns {String} the string with dots removed
 */
function stripDot(name: string): string {
	return name.replace(/\./g, '');
}

/**
 * sortName: Taken from bookbrainz-site
 * Returns sorted string of the input name string
 * @param {string} name - name whose sorted version is to be found
 * @returns {string} - sortedName which is sorted version of the input
 */
export function sortName(name: string): string {
	const articles = ['a', 'an', 'the', 'los', 'las', 'el', 'la'];
	const suffixes = [
		'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi',
		'xii', 'xiii', 'xiv', 'xv', 'jr', 'junior', 'sr', 'senior', 'phd', 'md',
		'dmd', 'dds', 'esq'
	];

	/*
	 * Remove leading and trailing spaces, and return a blank sort name if
	 * the string is empty
	 */
	const trimmedName = name.trim();
	if (trimmedName.length === 0) {
		return '';
	}

	const words = trimmedName.replace(/,/g, '').split(' ');

	// If there's only one word, simply copy the name as the sort name
	if (words.length === 1) {
		return trimmedName;
	}

	// First, check if sort name is for collective, by detecting article
	const firstWord = stripDot(words[0]);
	const firstWordIsArticle = articles.includes(firstWord.toLowerCase());
	if (firstWordIsArticle) {
		// The Collection of Stories --> Collection of Stories, The
		return `${words.slice(1).join(' ')}, ${firstWord}`;
	}

	/*
	 * From here on, it is assumed that the sort name is for a person
	 * Split suffixes
	 */
	const isWordSuffix =
		words.map((word) => suffixes.includes(stripDot(word).toLowerCase()));
	const lastSuffix = isWordSuffix.lastIndexOf(false) + 1;

	// Test this to check that splice will not have a 0 deleteCount
	const suffixWords =
		lastSuffix < words.length ? words.splice(lastSuffix) : [];

	// Rearrange names to (last name, other names)
	const INDEX_BEFORE_END = -1;

	let [lastName] = words.splice(INDEX_BEFORE_END);
	if (suffixWords.length > 0) {
		lastName += ` ${suffixWords.join(' ')}`;
	}

	return `${lastName}, ${words.join(' ')}`;
}
