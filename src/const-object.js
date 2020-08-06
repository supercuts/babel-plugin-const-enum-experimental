import { types } from '@babel/core';
import generate from '@babel/generator';
import membersToObjectProperties from './utils/membersToObjectProperties';

export default {
  TSEnumDeclaration(path) {
    if (path.node.const) {
      // `path === constObjectPath` for `replaceWith`.
      const [constObjectPath] = path.replaceWith(
        types.variableDeclaration('const', [
          types.variableDeclarator(
            types.identifier(path.node.id.name),
            types.objectExpression(
              membersToObjectProperties(path.get('members')),
            ),
          ),
        ]),
      );
      path.scope.registerDeclaration(constObjectPath);
    }
  },
};
