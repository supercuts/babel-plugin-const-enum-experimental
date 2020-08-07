import { declare } from '@babel/helper-plugin-utils';
import syntaxTypeScript from '@babel/plugin-syntax-typescript';
import removeConst from './remove-const';
import constObject from './const-object';
import { visitors as experimental, replace } from './experimental';

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
      this.enums = {};
      this.toRemove = [];
      this.toDoubleCheck = [];
      this.shouldDoubleCheck = false;
    },
    post() {
      this.toRemove.forEach(path => {
        path.remove();
      });
      console.log('post', this.enums);
      if(this.shouldDoubleCheck) {
        for(const doubleCheck of this.toDoubleCheck) {
          if(doubleCheck.node.object.name in this.enums) {
            console.log('replacing during double check');
            replace(doubleCheck, this.enums);
          }
        }
      } else if(Object.keys(this.enums).length === 0) {
        console.error("this plugin is useless for you!");
      }
    }
  };
});
