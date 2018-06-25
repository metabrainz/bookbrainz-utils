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


import {validateCreator} from './creator';
import {validateEdition} from './edition';
import {validatePublication} from './publication';
import {validatePublisher} from './publisher';
import {validateWork} from './work';


function creator(record) {
	return true;
}

function edition(record) {
	return true;
}

function publication(record) {
	return true;
}

function publisher(record) {
	return true;
}

function work(record) {
	return true;
}

const validate = {
	creator,
	edition,
	publication,
	publisher,
	work
};

export default validate;
