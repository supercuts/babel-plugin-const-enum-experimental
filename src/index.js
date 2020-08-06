import { declare } from '@babel/helper-plugin-utils';
import syntaxTypeScript from '@babel/plugin-syntax-typescript';
import removeConst from './remove-const';
import constObject from './const-object';
import experimental from './experimental';

export default declare((api, { transform = 'removeConst' }) => {
  api.assertVersion(7);

  let visitor;
  if (transform === 'removeConst') {
    visitor = removeConst;
  } else if (transform === 'constObject') {
    visitor = constObject;
  } else if (transform === 'experimental') {
    visitor = experimental;
  } else {
    throw Error('transform option must be removeConst|constObject');
  }

  return {
    name: 'const-enum',
    inherits: syntaxTypeScript,
    visitor,
    pre() {
      this.toRemove = []
    },
    post() {
      this.toRemove.forEach(path => {
        path.remove();
      })
    }
  };
});
