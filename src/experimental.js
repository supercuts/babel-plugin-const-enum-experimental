import { types } from '@babel/core';

export const visitors = checkHoisting => ({
  TSEnumDeclaration(enumPath) {
    if (!enumPath.node.const) {
      enumPath.skip();
      return;
    }
    const members = enumPath.get('members');
    let numberVal = 0;
    this.shouldDoubleCheck = true;
    const name = enumPath.node.id.name;

    /** Add new node hoisted */
    const newNode = types.variableDeclaration('var', [
      types.variableDeclarator(
        types.identifier(name),
        types.objectExpression(
          [],
        ),
      ),
    ]);
    const parentWithBody = enumPath.findParent(
      (p) => p.node !== undefined && p.node.body !== undefined,
    );
    const [newPath] = parentWithBody.unshiftContainer('body', newNode);
    const key = getName(name, newPath.scope);

    /** Save enum to state */
    for (const member of members) {
      const val = member.node.initializer;
      const property = member.node.id.name;
      if (!this.enums[key]) {
        this.enums[key] = {};
      }

      if (types.isStringLiteral(val)) {
        this.enums[key][property] = val;
      } else if (types.isNumericLiteral(val)) {
        let actualVal = val.value;
        numberVal = actualVal + 1;
        this.enums[key][property] = { type: val.type, value: val.value };
      } else {
        // No initializer
        if (val !== undefined) {
          console.log('weird ');
        }
        this.enums[key][property] = types.numericLiteral(numberVal++);
      }
    }
    newPath.scope.registerDeclaration(newPath);
    this.toRemove.push(newPath, enumPath);
  },
  MemberExpression(mePath) {
    const name = getName(mePath.node.object.name, mePath.scope);
    if (!(name in this.enums)) {
      if (checkHoisting) {
        this.toDoubleCheck.push(mePath);
      }
      mePath.skip();
      return;
    }
    replace(mePath, this.enums);
  },
});
/**
 * @param {string} name
 * @param {import('@babel/traverse').Scope} scope*/
export const getName = (name, scope) => {
  if (!scope.hasBinding(name) && !scope.hasGlobal(name)) {
    console.log(
      'enum exists but is not in scope',
    );
    return;
  }
  name = scope.uid + name;
  return name;
};

export const replace = (mePath, enums, name) => {
  if (!name) {
    name = getName(mePath.node.object.name, mePath.scope);
  }
  if (!enums[name]) {
    console.log('no such name ', name, 'in enums', this.enums);
  } else if (!enums[name][mePath.node.property.name]) {
    throw mePath.buildCodeFrameError(
      'weird cuz no property like dat man in ', enums,
      'cuz you wanted', mePath.node.property.name,
    );
  }
  const newNode = enums[name][mePath.node.property.name];
  mePath.replaceWith(newNode);
};
