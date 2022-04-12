import { User } from "../entities/User";
import {
  Arg,
  Int,
  Mutation,
  Publisher,
  PubSub,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";

type NotificationPayload = {
  user: User;
};

@Resolver()
export class UserResolver {
  @Query(() => [User])
  users(
    @Arg("name", { nullable: true }) name: string,
    @Arg("surname", { nullable: true }) surname: string,
    @Arg("age", { nullable: true }) age: number,
    @Arg("limit", () => Int, { nullable: true }) limit: number
  ): Promise<User[]> {
    return User.find({
      where: {
        name,
        surname,
        age,
      },
      take: limit ? limit : 10,
    });
  }

  @Mutation(() => User)
  async createUser(
    @Arg("name") name: string,
    @Arg("surname") surname: string,
    @Arg("age") age: number,
    @PubSub("NOTIFICATIONS") publish: Publisher<NotificationPayload>
  ): Promise<User> {
    const user = User.create({ name, surname, age });
    await user.save();

    await publish({ user });

    return user;
  }

  @Mutation(() => User)
  async updateUser(
    @Arg("id") id: number,
    @Arg("name", { nullable: true }) name?: string,
    @Arg("surname", { nullable: true }) surname?: string,
    @Arg("age", () => Int, { nullable: true }) age?: number
  ): Promise<User | null> {
    const input = Object.fromEntries(
      Object.entries({ name, surname, age }).filter(([_, v]) => v != undefined)
    );

    await User.update({ id }, input);
    const user = await User.findOne({
      where: {
        id,
      },
    });

    return user;
  }

  @Mutation(() => Boolean)
  async deleteUser(@Arg("id", () => Int) id: number): Promise<boolean> {
    await User.delete(id);
    return true;
  }

  @Subscription({
    topics: "NOTIFICATIONS",
  })
  newUser(@Root() notificationPayload: NotificationPayload): String {
    const user = notificationPayload?.user;
    return user
      ? `New user created ${user.name} ${user.surname}, with the id ${user.id}`
      : "";
  }
}
