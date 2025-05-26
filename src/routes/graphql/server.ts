import { FastifyPluginAsync } from 'fastify';
import { graphql } from 'graphql';
import { schema } from './gqlSchema.js';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';

const graphqlServer: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: createGqlResponseSchema,
    handler: async (request, reply) => {
      const { query, variables } = request.body as {
        query: string;
        variables?: Record<string, unknown>;
      };

      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
      });

      reply.send(result);
    },
  });
};

export default graphqlServer;