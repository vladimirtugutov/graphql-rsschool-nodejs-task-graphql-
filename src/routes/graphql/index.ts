import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql } from 'graphql';
import { schema } from './gqlSchema.js';
import { inspect } from 'util';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.addHook('onRoute', (routeOptions) => {
    console.log('[REGISTERED ROUTE]', routeOptions.method, routeOptions.url);
  });
  fastify.route({
    url: '/',

    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply) {
      const { query, variables } = req.body;

      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
      });

      reply.header('Content-Type', 'application/json');
      return result;
    }
  });
};

export default plugin;
