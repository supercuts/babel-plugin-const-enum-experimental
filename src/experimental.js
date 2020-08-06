import { types } from '@babel/core';
import generate from '@babel/generator';
import membersToObjectProperties from './utils/membersToObjectProperties';

let enums = {};

export default {
  TSEnumDeclaration(path) {
    if (!path.node.const) {
      path.skip();
      return;
    }
    const members = path.get('members');
    let numberVal = 0;
    for (const member of members) {
      const val = member.initializer;
      const key = path.node.id.name;
      const property = member.node.id.name;
      if (!enums[key]) {
        enums[key] = {};
      }

      if (types.isStringLiteral(val)) {
        enums[key][property] = val;
      } else if (types.isNumericLiteral(val)) {
        let actualVal;
        if (val.includes('.')) {
          actualVal = parseFloat(val);
        } else {
          actualVal = parseInt(val);
        }
        numberVal = actualVal + 1;
        enums[key][property] = val;
      } else {
        // No initializer
        if (val !== undefined) {
          console.log('weird ');
        }
        enums[key][property] = types.numericLiteral(numberVal++);
      }
    }
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
    this.toRemove.push(constObjectPath);
  },
  MemberExpression(path) {
    if (!(path.node.object.name in enums)) {
      path.skip();
      return;
    } else if (!enums[path.node.object.name][path.node.property.name]) {
      throw path.buildCodeFrameError(
        'weird cuz no property like dat man in ', enums,
        'cuz you wanted', path.node.property.name,
      );
    } else if (!path.scope.hasBinding(path.node.object.name)) {
      throw path.buildCodeFrameError(
        'enum exists but is not in scope',
      );
    }
    path.replaceWith(enums[path.node.object.name][path.node.property.name]);
  },
};
