/*
 * Copyright (C) 2023  David Kellner
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


import type {AliasT} from 'bookbrainz-data/lib/types/aliases.d.ts';
import type {EntityTypeString} from 'bookbrainz-data/lib/types/entity.d.ts';
import type {IdentifierT} from 'bookbrainz-data/lib/types/identifiers.d.ts';


// TODO: move into bookbrainz-data
type Insertable<T> = Omit<T, 'id'>;

export type ParsedAlias = Insertable<AliasT & {
	default?: boolean;
}>;

export type ParsedIdentifier = Insertable<IdentifierT>;

type ParsedBaseEntity = {
	entityType: EntityTypeString;
	alias: ParsedAlias[];
	annotation?: string;
	disambiguation?: string;
	identifiers: ParsedIdentifier[];
	metadata: {
		identifiers?: ParsedIdentifier[];
		links: Array<{
			title: string;
			url: string;
		}>;
		// TODO: find correct type in OL samples
		originId?: object[];
		relationships: Array<{
			type: string;
			value: string;
		}>;
		[custom: string]: any;
	};
	source: string;
	lastEdited?: string;
	originId?: string;
};

export type ParsedAuthor = ParsedBaseEntity & {
	beginDate?: string;
	endDate?: string;
	type?: 'Person';
};

export type ParsedWork = ParsedBaseEntity;

export type ParsedEntity =
	| ParsedAuthor
	| ParsedWork;
