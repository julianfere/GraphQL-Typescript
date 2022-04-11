import "reflect-metadata";
import express, { Express } from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { HelloWorldResolver } from "./resolvers/HelloWorldResolver";

(
    async () => {
        const app:Express = express();

      
        const apolloServer = new ApolloServer({
          schema: await buildSchema({
            resolvers: [HelloWorldResolver]
          }),
          context: ({ req, res }) => ({ req, res })
        });
      
        apolloServer.applyMiddleware({ app, cors: false });
      
        app.listen(3000, () => {
          console.log("express server started");
        });
    }
)();