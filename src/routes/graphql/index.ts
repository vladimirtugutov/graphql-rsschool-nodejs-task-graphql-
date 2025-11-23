import { createLoaders } from './dataloaders.js';
import { FastifyPluginAsync } from 'fastify';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { graphql, parse, validate, specifiedRules } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './gqlSchema.js';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import type { FastifyRequest } from 'fastify';

type GqlRequestBody = {
  query: string;
  variables?: { [key: string]: unknown };
};

const plugin: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async handler(req: FastifyRequest<{ Body: GqlRequestBody }>, reply) {
      const { query, variables } = req.body;

      const loaders = createLoaders(fastify.prisma);

      let document;
      try {
        document = parse(query);
      } catch (parseError) {
        reply.code(400);
        return { errors: [parseError] };
      }

      const errors = validate(schema, document, [...specifiedRules, depthLimit(5)]);
      if (errors.length > 0) {
        reply.code(400);
        return { errors };
      }

      const result = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: {
          prisma: fastify.prisma,
          loaders,
          req,
        },
      });

      reply.header('Content-Type', 'application/json');
      return result;
    },
  });
};

export default plugin;
