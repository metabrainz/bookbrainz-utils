import type {ParsedAuthor, QueuedEntity} from 'bookbrainz-data/lib/types/parser.d.ts';

export const entity: QueuedEntity<ParsedAuthor> = {
	"data": {
		"alias": [{
			"name": "Test Author",
			"sortName": "Author, Test",
			"languageId": 120, // English, TODO: use language codes
			"default": true,
			"primary": true
		}],
		"disambiguation": "import test",
		"type": "Person", // unused, TODO: map to ID
		"typeId": 1, // Person
		"genderId": 3, // Other
		"beginDate": "1701-04-23",
		"endDate": "1742-12-31",
		"ended": true,
		"identifiers": [],
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
	"lastEdited": "2024-07-17",
	"originId": "A123", // change this to import another dummy entity
	"source": "Testdata"
};
