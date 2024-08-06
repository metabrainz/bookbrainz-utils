import type {ParsedAuthor, QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';

export const entity: QueuedEntity<ParsedAuthor> = {
	"data": {
		"alias": [{
			"name": "Test Author",
			"sortName": "Author, Test",
			"languageId": 120, // English, TODO: use language codes
			"default": true,
			"primary": true
		}, {
			"name": "MusicBrainz Test Artist",
			"sortName": "Author, Test",
			"languageId": 120, // English
			"primary": false
		}, {
			"name": "Auteur du Test",
			"sortName": "Test, Auteur du",
			"languageId": 134, // French
			"primary": true
		}],
		"disambiguation": "import test",
		"type": "Person", // unused, TODO: map to ID
		"typeId": 1, // Person
		"genderId": 3, // Other
		"beginAreaId": 8558, // Hill
		"beginDate": "1701-04-23",
		"endAreaId": 98703, // Ciudad Nezahualcóyotl
		"endDate": "1742-12-31",
		"ended": true,
		"identifiers": [{
			"typeId": 2, // MusicBrainz Artist ID
			"value": "7e84f845-ac16-41fe-9ff8-df12eb32af55"
		}, {
			"typeId": 23, // OpenLibrary Author ID
			"value": "OL3673719A"
		}],
		"annotation": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto enim reprehenderit dolorum iure eaque accusamus, soluta pariatur aliquam commodi repellat cumque quaerat possimus nesciunt molestiae. Sunt deserunt magnam sint repellendus.",
		"metadata": { // currently unused
			"links": [{
				"title": "Example link",
				"url": "https://example.com/author"
			}],
			"relationships": []
		},
		"source": "Testdata"
	},
	"entityType": "Author",
	"lastEdited": "2024-07-25",
	"originId": "A1234", // change this to import another dummy entity
	"source": "Testdata"
};
