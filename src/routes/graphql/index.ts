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
    // url: '/graphql',

    method: 'POST',
    // schema: {
    //   ...createGqlResponseSchema,
    //   response: {
    //     200: gqlResponseSchema,
    //   },
    // },
    schema: {
      ...createGqlResponseSchema,
      // ❌ отключаем валидацию ответа
      response: {},
    },

    // async handler(req, reply) {
    //   const { query, variables } = req.body;

    //   const result = await graphql({
    //     schema,
    //     source: query,
    //     variableValues: variables,
    //   });
    //   reply.header('Content-Type', 'application/json');

    //   return result;
    // },
    async handler(req, reply) {
      const { query, variables } = req.body;

      console.log('[GRAPHQL][QUERY]', query);
      console.log('[GRAPHQL][VARIABLES]', variables);

      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
      });

      console.log('[GRAPHQL][RESULT]', inspect(result, { depth: null, colors: true }));

      reply.header('Content-Type', 'application/json');
      return result;
    }
  });
};

export default plugin;
