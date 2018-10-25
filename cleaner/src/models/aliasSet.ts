import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import {Alias} from './alias';

@Entity({name: 'alias_set', schema: "bookbrainz"})
export class AliasSet {
    @PrimaryGeneratedColumn()
    id: number;

	@Column({name: 'default_alias_id'})
	defaultAliasID: number;

	@ManyToOne(type => Alias)
	@JoinColumn({name: 'default_alias_id'})
	defaultAlias: Alias;

	@ManyToMany(type => Alias)
    @JoinTable({
		inverseJoinColumn: {name: 'alias_id'},
		joinColumn: {name: 'set_id'},
		name: 'alias_set__alias'
	})
    aliases: Alias[];
}
