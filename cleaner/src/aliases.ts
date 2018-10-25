import * as _ from 'lodash';
import {Alias} from './models/alias';
import {AliasSet} from './models/aliasSet';
import {createQueryBuilder, getRepository, getConnection} from 'typeorm';


function isAliasEqual(objVal: Alias, othVal: Alias) {
	return _.isEqual(
		_.pick(objVal, ['name', 'sortName', 'languageID']),
		_.pick(othVal, ['name', 'sortName', 'languageID'])
	);
}

function isAliasSetEqual(objVal: AliasSet, othVal: AliasSet) {
	const idsEqual = objVal.id === othVal.id;

	const defaultAliasEqual = isAliasEqual(
		objVal.defaultAlias,
		othVal.defaultAlias
	);

	const aliasesEqual = _.isEmpty(
		_.differenceWith(objVal.aliases, othVal.aliases, isAliasEqual)
	);

	return idsEqual && defaultAliasEqual && aliasesEqual;
}

// function groupDuplicateAliases(aliases: Alias[]) {
// 	aliases.reduce((result, alias) => {}, {});
// }

async function removeDuplicateAliases() {
	const aliasSetRepo = getRepository(AliasSet);

	const problemAliasSets = await aliasSetRepo
		.createQueryBuilder('aliasSet')
		.innerJoinAndSelect('aliasSet.defaultAlias', 'defaultAlias')
		.innerJoinAndSelect('aliasSet.aliases', 'alias')
		.innerJoin('aliasSet.aliases', 'alias1')
		.innerJoin('aliasSet.aliases', 'alias2')
		.where('alias1.name = alias2.name')
		.andWhere('alias1.sortName = alias2.sortName')
		.andWhere('alias1.languageID = alias2.languageID')
		.andWhere('alias1.id < alias2.id')
		.getMany();

	if (_.isEmpty(problemAliasSets)) {
		return [];
	}

	const correctedAliasSets = problemAliasSets.map((aliasSet) => {
		const nonDefaultAliases = _.differenceWith(
			aliasSet.aliases, [aliasSet.defaultAlias], isAliasEqual
		);

		const aliasesToKeep = [
			aliasSet.defaultAlias,
			..._.uniqWith(nonDefaultAliases, isAliasEqual)
		];

		aliasSet.aliases = aliasesToKeep;
		return aliasSet;
	});

	return getConnection().transaction(async transactionalEntityManager => {
		const prom = await transactionalEntityManager.save(correctedAliasSets);

		const updatedAliasSets = await transactionalEntityManager
			.createQueryBuilder(AliasSet, 'aliasSet')
			.innerJoinAndSelect('aliasSet.defaultAlias', 'defaultAlias')
			.innerJoinAndSelect('aliasSet.aliases', 'alias')
			.where(
				'aliasSet.id IN (:...aliasSets)', {
					aliasSets: correctedAliasSets.map(aliasSet => aliasSet.id)
				}
			)
			.getMany();

		const differences = _.differenceWith(
			updatedAliasSets, problemAliasSets, isAliasSetEqual
		);

		if (_.isEmpty(differences)) {
			return prom;
		}

		throw Error([
			'Differences exist between pre-clean and post-clean aliases',
			' - aborting!'
		].join(''));
	});
}

async function uniquifyAliases() {
	const originalDuplicateMap = await createQueryBuilder()
		.select('a1.id', 'originalAliasID')
		.addSelect('a2.id', 'duplicateAliasID')
		.from(Alias, 'a1')
		.innerJoin(Alias, 'a2', 'a1.id < a2.id')
		.where('a1.name = a2.name')
		.andWhere('a1.sort_name = a2.sort_name')
		.andWhere('a1.language_id = a2.language_id')
		.getRawMany();

	const uniqueDuplicateIDs: Set<number> =
		new Set(originalDuplicateMap.map((x) => x.duplicateAliasID));

	if (uniqueDuplicateIDs.size === 0) {
		return [];
	}

	const aliasSetRepo = getRepository(AliasSet);

	const affectedAliasSets = await aliasSetRepo
		.createQueryBuilder('aliasSet')
		.innerJoinAndSelect('aliasSet.defaultAlias', 'defaultAlias')
		.innerJoinAndSelect('aliasSet.aliases', 'alias')
		.innerJoin('aliasSet.aliases', 'alias1')
		.where('alias1.id IN (:...aliases)', {aliases: Array.from(uniqueDuplicateIDs)})
		.getMany();

	const optimalOriginalDuplicateMap = originalDuplicateMap.filter((x) => !uniqueDuplicateIDs.has(x.originalAliasID));

	return getConnection().transaction(async transactionalEntityManager => {
		/* eslint-disable camelcase */
		const aliasJunctionUpdate = Promise.all(
			optimalOriginalDuplicateMap.map((x) => {
				return transactionalEntityManager.createQueryBuilder()
					.update('alias_set__alias')
					.set({alias_id: x.originalAliasID})
					.where('alias_id = :id', {id: x.duplicateAliasID})
					.execute();
			})
		);
		/* eslint-enable camelcase */

		const defaultAliasUpdate = Promise.all(
			optimalOriginalDuplicateMap.map((x) => {
				return transactionalEntityManager.createQueryBuilder()
					.update(AliasSet)
					.set({defaultAliasID: x.originalAliasID})
					.where('defaultAliasID = :id', {id: x.duplicateAliasID})
					.execute();
			})
		);

		await Promise.all([aliasJunctionUpdate, defaultAliasUpdate])

		const updatedAliasSets = await transactionalEntityManager
			.createQueryBuilder(AliasSet, 'aliasSet')
			.innerJoinAndSelect('aliasSet.defaultAlias', 'defaultAlias')
			.innerJoinAndSelect('aliasSet.aliases', 'alias')
			.where('aliasSet.id IN (:...aliasSets)', {aliasSets: affectedAliasSets.map(aliasSet => aliasSet.id)})
			.getMany();

		const differences = _.differenceWith(
			updatedAliasSets, affectedAliasSets, isAliasSetEqual
		);

		if (!_.isEmpty(differences)) {
			throw Error([
				'Differences exist between pre-clean and post-clean alias sets',
				' - aborting!'
			].join(''));
		}

		await transactionalEntityManager.delete(Alias, Array.from(uniqueDuplicateIDs));

		return updatedAliasSets;
	});
}


export default async function cleanAliases() {
	await removeDuplicateAliases();

	return uniquifyAliases();
	// empty
}
