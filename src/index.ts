import "reflect-metadata";
import express, { Express } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { DataSource } from "typeorm";
import { createServer } from "http";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import {
  ConnectionContext,
  SubscriptionServer,
} from "subscriptions-transport-ws";

import { HelloWorldResolver } from "./resolvers/HelloWorldResolver";
import { User } from "./entities/User";
import { UserResolver } from "./resolvers/UserResolver";
import { execute, subscribe } from "graphql";

(async () => {
  const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    entities: [User],
    synchronize: true,
    logging: true,
  });

  await AppDataSource.initialize();

  const app: Express = express();
  const httpServer = createServer(app);

  const schema = await buildSchema({
    resolvers: [HelloWorldResolver, UserResolver],
  });

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,

      execute,
      subscribe,

      async onConnect(
        connectionParams: Object,
        webSocket: WebSocket,
        context: ConnectionContext
      ) {},
    },
    {
      server: httpServer,

      path: "/graphql",
    }
  );

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground,
      ApolloServerPluginDrainHttpServer({ httpServer }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = 8080;

  httpServer.listen(PORT, () => {
    console.log(
      `server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  });
})();
