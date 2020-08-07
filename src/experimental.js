import { types } from '@babel/core';

export const visitors = {
  TSEnumDeclaration(path) {
    if (!path.node.const) {
      path.skip();
      return;
    }
    const members = path.get('members');
    let numberVal = 0;
    for (const member of members) {
      const val = member.node.initializer;
      const key = path.node.id.name;
      const property = member.node.id.name;
      if (!this.enums[key]) {
        this.enums[key] = {};
      }
      this.shouldDoubleCheck = true;

      if (types.isStringLiteral(val)) {
        this.enums[key][property] = val;
      } else if (types.isNumericLiteral(val)) {
        let actualVal = val.value;
        numberVal = actualVal + 1;
        this.enums[key][property] = {type: val.type, value: val.value};
      } else {
        // No initializer
        if (val !== undefined) {
          console.log('weird ');
        }
        this.enums[key][property] = types.numericLiteral(numberVal++);
      }
    }

    const newNode = types.variableDeclaration('var', [
        types.variableDeclarator(
          types.identifier(path.node.id.name),
          types.objectExpression(
            [],
          ),
        ),
      ]);
    const parentWithBody = path.findParent(
      (p) => p.node !== undefined && p.node.body !== undefined
    );
    const [newPath] = parentWithBody.unshiftContainer("body", newNode);
    newPath.scope.registerDeclaration(newPath);
    this.toRemove.push(newPath, path);
  },
  MemberExpression(path) {
    const name = path.node.object.name;
    if (!(name in this.enums)) {
      this.toDoubleCheck.push(path);
      path.skip();
      return;
    }
    replace(path, this.enums);
  },
};

export const replace = (path, enums) => {
  const name = path.node.object.name;
  if (!enums[name][path.node.property.name]) {
    throw path.buildCodeFrameError(
      'weird cuz no property like dat man in ', enums,
      'cuz you wanted', path.node.property.name,
    );
  } else if (!path.scope.hasBinding(name) && !(path.global && path.hasGlobal(name))) {
    console.log(
      'enum exists but is not in scope'
    );
  }
  path.replaceWith(enums[name][path.node.property.name]);
}
