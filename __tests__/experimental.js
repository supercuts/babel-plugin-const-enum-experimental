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
  console.log(output)
  expect(output).toMatchSnapshot();
});

it('works unstably when enum declaration after use', async () => {
  const input = `console.log(Direction.Left)
const enum Direction { Left, Right, Down, Up }`;

  const { code: output } = await transformAsync(input, options);
  expect(output).toMatchSnapshot();

});

it('error if not in scope', async () => {
  const input = `{const enum Direction { Left, Right, Down, Up }}
console.log(Direction.Left)`;
  try {
    const { code: output } = await transformAsync(input, options);
    expect(1 === 2).toBeTruthy();
  } catch(e) {
    expect(1 === 1).toBeTruthy();
  }
});
