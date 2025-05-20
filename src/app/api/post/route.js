import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import sql from 'mssql';
import { connectDB } from '../../../../sql.config';
import { GraphQLScalarType, Kind } from 'graphql';

const typeDefs = `#graphql
scalar Date

  type User {
    id: ID
    title: String
    description: String
    status : String
    due_date : Date
    created_date : Date
    updated_date : Date
  }

  type Mutation {
    addTodo(
      title: String!
      description: String!
      status: String!
      due_date: Date!
    ): String
    
    deleteTodo(id: ID!): String
    
    statusTodo(id: ID!, status: String!): String
    
    editTodo(
      id : ID!
      title: String!
      description: String!
      status: String!
      due_date: Date!
    ): String
  }

  type Query {
    hello: String
    todos: [User]
  }
`;

const resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value)
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.STRING) {
                return new Date(ast.value)
            }
        },
        serialize(value) {
            return value.toISOString();
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.STRING) {
                return new Date(ast.value);
            }
            return null;
        },
    }),
    Query: {
        hello: () => "Hello from GraphQL!",
        todos: async () => {
            try {
                const pool = await connectDB()
                const result = await pool.request().query(`SELECT * FROM todos`);
                return result.recordset;
            } catch (error) {
                console.error("Failed to fetch todos", error)
                throw new Error("Failed to load database query")
            }
        }
    },
    Mutation: {
        addTodo: async (_, { title, description, status, due_date }) => {
            try {
                console.log('Received:', { title, description, status, due_date });
                const pool = await connectDB();
                const now = new Date();

                await pool
                    .request()
                    .input('title', sql.NVarChar, title)
                    .input('description', sql.NVarChar, description)
                    .input('status', sql.VarChar, status)
                    .input('due_date', sql.DateTime, due_date)
                    .input('created_date', sql.DateTime, now)
                    .input('updated_date', sql.DateTime, now)
                    .query(`
            INSERT INTO todos (title, description, status, due_date, created_date, updated_date)
            VALUES (@title, @description, @status, @due_date, @created_date, @updated_date)
          `);

                return "Todo created successfully!";
            } catch (error) {
                console.error("Failed to insert todo:", error);
                throw new Error("Database error");
            }
        },
        deleteTodo: async (_, { id }) => {
            try {
                const pool = await connectDB();
                await pool
                    .request()
                    .input('id', sql.Int, id)
                    .query(`DELETE FROM todos WHERE id = @id`);

                return "Todo deleted successfully!";
            } catch (error) {
                console.error("Failed to delete todo:", error);
                throw new Error("Database error");
            }
        },
        statusTodo: async (_, { id, status }) => {
            try {
                const pool = await connectDB();
                const now = new Date();

                await pool
                    .request()
                    .input('id', sql.Int, id)
                    .input('status', sql.VarChar, status)
                    .input('updated_date', sql.DateTime, now)
                    .query(`
                       UPDATE todos
                       SET status = @status, updated_date = @updated_date
                       WHERE id = @id
                     `);
                return "Todo status updated successfully!";
            } catch (error) {
                console.log(error)
                throw new Error("Database error");
            }
        },
        editTodo: async (_, { id, title, description, status, due_date }) => {
            try {
                console.log('Received:', { id, title, description, status, due_date });
                const pool = await connectDB();
                const now = new Date();

                await pool
                    .request()
                    .input('id', sql.Int, id)
                    .input('title', sql.NVarChar, title)
                    .input('description', sql.NVarChar, description)
                    .input('status', sql.VarChar, status)
                    .input('due_date', sql.Date, due_date)
                    .input('updated_date', sql.DateTime, now)
                    .query(`
                 UPDATE todos 
                 SET  
                 title = @title, 
                 description = @description , 
                 status = @status , 
                 due_date = @due_date , 
                 updated_date = @updated_date 
                 WHERE id = @id
                `);

                return "Todo updated successfully"

            } catch (error) {
                console.log(error)
            }
        }
    },
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const handler = startServerAndCreateNextHandler(server);

export async function POST(req) {
    return handler(req);
}
