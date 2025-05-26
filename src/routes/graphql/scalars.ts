import { GraphQLScalarType, Kind } from 'graphql';

export const UUID = new GraphQLScalarType({
  name: 'UUID',
  description: 'UUID custom scalar type',
  parseValue(value) {
    return value;
  },
  serialize(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return ast.value;
    return null;
  },
});

export const MemberTypeId = new GraphQLScalarType({
  name: 'MemberTypeId',
  description: 'Alias for MemberType.id as UUID',
  parseValue(value) {
    return value;
  },
  serialize(value) {
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) return ast.value;
    return null;
  },
});
