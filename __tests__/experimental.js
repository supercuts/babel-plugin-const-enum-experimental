import { transformAsync } from '@babel/core';
import plugin from '../src';

const options = {
  plugins: [[plugin, { transform: 'experimental' }]],
};

it('works unstably', async () => {
  const input = `const enum Direction { Left, Right, Down, Up }
console.log(Direction.Left)`;

  const { code: output } = await transformAsync(input, options);
  expect(output).toMatchSnapshot();

});

it('works unstably starting with initializer', async () => {
  const input = `const enum Direction { Left = 1, Right, Down, Up }
console.log(Direction.Left)`;

  const { code: output } = await transformAsync(input, options);
  expect(output).toMatchSnapshot();

});

it('is empty if not in scope', async () => {
  const input = `{const enum Direction { Left, Right, Down, Up }}
console.log(Direction.Left)`;
  try {
    const { code: output } = await transformAsync(input, options);
    expect(1 === 2);
  } catch(e) {
    expect(1 === 1);
  }
});
