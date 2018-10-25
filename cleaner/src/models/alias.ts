import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity({schema: "bookbrainz"})
export class Alias {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({name: 'sort_name'})
    sortName: string;

    @Column({name: 'language_id'})
    languageID: number;
}
