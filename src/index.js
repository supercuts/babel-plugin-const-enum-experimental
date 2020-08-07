import { declare } from '@babel/helper-plugin-utils';
import syntaxTypeScript from '@babel/plugin-syntax-typescript';
import removeConst from './remove-const';
import constObject from './const-object';
import { visitors as experimental, replace, getName, getObjectName } from './experimental';

export default declare((api, { transform = 'removeConst', experimental: { checkHoisting } = { checkHoisting: false } }) => {
  api.assertVersion(7);
  const isExperimental = transform === 'experimental';

  let visitor;
  if (transform === 'removeConst') {
    visitor = removeConst;
  } else if (transform === 'constObject') {
    visitor = constObject;
  } else if (isExperimental) {
    visitor = experimental(checkHoisting);
  } else {
    throw Error('transform option must be removeConst|constObject|experimental');
  }

  return {
    name: 'const-enum',
    inherits: syntaxTypeScript,
    visitor,
    pre() {
      if (isExperimental) {
        this.enums = {};
        this.toRemove = [];
        this.toDoubleCheck = [];
      }
    },
    post() {
      if (isExperimental) {
        this.toRemove.forEach(path => {
          path.remove();
        });
        if (this.shouldDoubleCheck && checkHoisting) {
          for (const doubleCheck of this.toDoubleCheck) {
            console.log('double checking', doubleCheck.node.property.name);
            const name = getName(getObjectName(doubleCheck.node), doubleCheck.scope)
            if (name in this.enums) {
              replace(doubleCheck, this.enums);
            }
          }
        } else if (!this.shouldDoubleCheck) {
          /* No enums were ever saved*/
          console.error('this plugin is useless for you!');
        }
      }
    },
  };
});
