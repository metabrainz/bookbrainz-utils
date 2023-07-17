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


export const musicBrainzReleaseId = 1;
export const musicBrainzArtistId = 2;
export const musicBrainzWorkId = 3;
export const wikidataIdEdition = 4;
export const amazonASINEdition = 5;
export const openLibraryBookIdEdition = 6;
export const openLibraryWorkId = 8;
export const ISBN13Edition = 9;
export const ISBN10Edition = 10;
export const barcodeEdition = 11;
export const VIAFAuthor = 12;
export const INSIAuthor = 13;
export const libraryThingWork = 14;
export const libraryThingAuthor = 15;
export const IMDbTitleIdEdition = 16;
export const musicBrainzLabelId = 17;
export const wikidataIdAuthor = 18;
export const wikidataIdPublication = 19;
export const wikidataIdPublisher = 20;
export const wikidataIdWork = 21;

export const identifiers = {
	IMDbTitleIdEdition,
	INSIAuthor,
	ISBN10Edition,
	ISBN13Edition,
	VIAFAuthor,
	amazonASINEdition,
	barcodeEdition,
	libraryThingAuthor,
	libraryThingWork,
	musicBrainzArtistId,
	musicBrainzLabelId,
	musicBrainzReleaseId,
	musicBrainzWorkId,
	openLibraryBookIdEdition,
	openLibraryWorkId,
	wikidataIdAuthor,
	wikidataIdEdition,
	wikidataIdPublication,
	wikidataIdPublisher,
	wikidataIdWork
};

export const francMinMapping = {
	amh: 'Amharic',
	arb: 'Standard Arabic',
	azj: 'North Azerbaijani (Latin)',
	bel: 'Belarusian',
	ben: 'Bengali',
	bho: 'Bhojpuri',
	bos: 'Bosnian (Latin)',
	bul: 'Bulgarian',
	ceb: 'Cebuano',
	ces: 'Czech',
	ckb: 'Central Kurdish',
	cmn: 'Mandarin Chinese',
	deu: 'German',
	ell: 'Modern Greek (1453-)',
	eng: 'English',
	fas: 'Persian',
	fra: 'French',
	fuv: 'Nigerian Fulfulde',
	gax: 'Borana-Arsi-Guji Oromo',
	guj: 'Gujarati',
	hau: 'Hausa',
	hin: 'Hindi',
	hms: 'Southern Qiandong Miao',
	hnj: 'Hmong Njua',
	hrv: 'Croatian',
	hun: 'Hungarian',
	ibo: 'Igbo',
	ilo: 'Iloko',
	ind: 'Indonesian',
	ita: 'Italian',
	jav: 'Javanese',
	jpn: 'Japanese',
	kan: 'Kannada',
	kaz: 'Kazakh',
	kin: 'Kinyarwanda',
	koi: 'Komi-Permyak',
	kor: 'Korean',
	lin: 'Lingala',
	mad: 'Madurese',
	mai: 'Maithili',
	mal: 'Malayalam',
	mar: 'Marathi',
	mya: 'Burmese',
	nep: 'Nepali (macrolanguage)',
	nld: 'Dutch',
	nya: 'Nyanja',
	ori: 'Oriya (macrolanguage)',
	pan: 'Panjabi',
	pbu: 'Northern Pashto',
	plt: 'Plateau Malagasy',
	pol: 'Polish',
	por: 'Portuguese',
	qug: 'Chimborazo Highland Quichua',
	ron: 'Romanian',
	run: 'Rundi',
	rus: 'Russian',
	sin: 'Sinhala',
	skr: 'Saraiki',
	som: 'Somali',
	spa: 'Spanish',
	srp: 'Serbian (Latin)',
	sun: 'Sundanese',
	swe: 'Swedish',
	swh: 'Swahili (individual language)',
	tam: 'Tamil',
	tel: 'Telugu',
	tgl: 'Tagalog',
	tha: 'Thai',
	tur: 'Turkish',
	ukr: 'Ukrainian',
	urd: 'Urdu',
	uzn: 'Northern Uzbek (Latin)',
	vie: 'Vietnamese',
	yor: 'Yoruba',
	zlm: 'Malay (individual language) (Latin)',
	zul: 'Zulu',
	zyb: 'Yongbei Zhuang'
};

export const mbLanguageMapping = {
	Amharic: 15,
	Belarusian: 45,
	Bengali: 47,
	Bhojpuri: 49,
	'Borana-Arsi-Guji Oromo': 2359,
	Bulgarian: 62,
	Burmese: 63,
	Cebuano: 70,
	'Central Kurdish': 1705,
	'Chimborazo Highland Quichua': 5612,
	Croatian: 366,
	Czech: 98,
	Dutch: 113,
	English: 120,
	French: 134,
	German: 145,
	Gujarati: 161,
	Hausa: 165,
	Hindi: 171,
	'Hmong Njua': 2740,
	Hungarian: 176,
	Igbo: 179,
	Iloko: 186,
	Indonesian: 189,
	Italian: 195,
	Japanese: 198,
	Javanese: 196,
	Kannada: 206,
	Kinyarwanda: 218,
	'Komi-Permyak': 3439,
	Korean: 224,
	Lingala: 242,
	Madurese: 255,
	Maithili: 258,
	Malayalam: 260,
	'Mandarin Chinese': 1739,
	Marathi: 264,
	'Nigerian Fulfulde': 2333,
	'Northern Pashto': 5307,
	Panjabi: 330,
	Persian: 334,
	'Plateau Malagasy': 5431,
	Polish: 338,
	Portuguese: 340,
	Romanian: 351,
	Rundi: 352,
	Russian: 353,
	Sinhala: 373,
	Somali: 390,
	'Southern Qiandong Miao': 2728,
	Spanish: 393,
	'Standard Arabic': 818,
	Sundanese: 399,
	'Swahili (individual language)': 6228,
	Swedish: 403,
	Tagalog: 414,
	Tamil: 407,
	Telugu: 409,
	Thai: 415,
	Turkish: 433,
	Ukrainian: 441,
	Urdu: 444,
	Uzbek: 445,
	Vietnamese: 448,
	'Yongbei Zhuang': 7839,
	Yoruba: 464,
	Zulu: 470
};

export function mapLanguage(francCode: string): number {
	const language = francMinMapping[francCode];
	const code = mbLanguageMapping[language];
	return code || mbLanguageMapping.English;
}
