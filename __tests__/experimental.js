import { transformAsync } from '@babel/core';
import plugin from '../src';

const options = {
  plugins: [[plugin, { transform: 'experimental' }]],
};
const optionsWithHoistingCheck = {
  plugins: [[plugin, { transform: 'experimental', experimental: {checkHoisting: true} }]],
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

it('works unstably when enum declaration after use with right config', async () => {
  const input = `console.log(Direction.Left)
const enum Direction { Left, Right, Down, Up }`;
  console.log(optionsWithHoistingCheck.plugins[0][1]);
  const { code: output } = await transformAsync(input, optionsWithHoistingCheck);
  expect(output).toMatchSnapshot();
});

it('does not work when enum declaration after use with wrong config', async () => {
  const input = `console.log(Direction.Left)
const enum Direction { Left, Right, Down, Up }`;
  const { code: output } = await transformAsync(input, options);
  expect(output).toMatchSnapshot();
});

it('error if not in scope', async () => {
  const input = `{const enum Direction { Left, Right, Down, Up }}
console.log(Direction.Left)`;
  const { code: output } = await transformAsync(input, options);
  expect(output).toMatchSnapshot();
});
