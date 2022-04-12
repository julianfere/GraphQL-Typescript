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
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

import { HelloWorldResolver } from "./resolvers/HelloWorldResolver";
import { User } from "./entities/User";
import { UserResolver } from "./resolvers/UserResolver";

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
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const schema = await buildSchema({
    resolvers: [HelloWorldResolver, UserResolver],
  });

  const serverCleanup = useServer({ schema }, wsServer);

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
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  const PORT = 3000;

  httpServer.listen(PORT, () => {
    console.log(
      `server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    );
  });
})();
