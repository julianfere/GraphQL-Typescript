import { Query, Resolver } from "type-graphql";

@Resolver()
class HelloWorldResolver {
    @Query(() => String)
    hello(): string {
        return "Hello World!";
    }
}

export { HelloWorldResolver };