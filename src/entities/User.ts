import { Field, Int, ObjectType } from "type-graphql";
import { Column, PrimaryGeneratedColumn, Entity, BaseEntity } from "typeorm";

@Entity()
@ObjectType()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  surname: string;

  @Column()
  @Field(() => Int)
  age: number;
}
