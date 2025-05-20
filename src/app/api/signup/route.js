import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import { connectDB } from '../../../../sql.config';

const typeDefs = `#graphql
  type User {
    id: ID
    username: String
    email: String
  }

  type Mutation {
    signup(username: String!, email: String!, password: String!): String
  }

  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => "Hello from GraphQL!",
  },
  Mutation: {
    signup: async (_, { username, email, password }) => {
    console.log('Received:', { username, email, password });
      const pool = await connectDB();

      const result = await pool
        .request()
        .input("email", sql.VarChar, email)
        .query("SELECT * FROM users WHERE email = @email");

      if (result.recordset.length > 0) {
        throw new Error("Email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      await pool
        .request()
        .input("username", sql.VarChar, username)
        .input("email", sql.VarChar, email)
        .input("password", sql.VarChar, hashedPassword)
        .query(
          "INSERT INTO users (username, email, password) VALUES (@username, @email, @password)"
        );

      return "Signup successful";
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export async function POST(req){
    return handler(req)
}