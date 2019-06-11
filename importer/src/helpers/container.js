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

class Container {
	#data = {};

	/**
	 * @param {Object} data - Initial data
	 */
	constructor(data) {
		this.#data = Object.assign({}, data);
	}

	/**
	 * Only adds a new property, throws an error if the property name is already present
	 *
	 * @param {string} key - name of the key
	 * @param {*} value - anything
	 *
	 * @throws {TypeError} when property is already present
	 */
	add(key, value) {
		if (is.not.undefined(this.#data[key])) {
			throw new TypeError(`Won't add <${key}>, already existing`);
		}
		Object.assign(this.#data, {
			[key]: value
		});
	}

	/**
	 * Getter function for the container
	 *
	 * @param {string} key - Property name
	 * @param {boolean} silent - If it should fail silently or throw an error
	 *
	 * @return {*} Value of the property name
	 * @throws {ReferenceError} When property name is not found and silent is false
	 */
	get(key, silent = false) {
		const value = this.#data[key];
		if (silent === false && !value) {
			throw new ReferenceError(`No key <${key}> found`);
		}
		return value;
	}

	/**
	 * Will update if present or add if missing
	 *
	 * @param {string} key - name of the key
	 * @param {*} value - anything
	 */
	set(key, value) {
		Object.assign(this.#data, {
			[key]: value
		});
	}

	/**
	 * Expose the container
	 *
	 * @return {Object} the whole data
	 */
	unpack() {
		return this.#data;
	}
}

export default new Container();
