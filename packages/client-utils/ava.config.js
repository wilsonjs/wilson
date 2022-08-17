export default {
  files: ['test/**/*.test.ts'],
  concurrency: 5,
  failFast: true,
  failWithoutAssertions: false,
  verbose: true,
  nodeArguments: [
    '--no-warnings',
    '--loader=ts-node/esm',
    '--experimental-specifier-resolution=node',
  ],
  extensions: {
    ts: 'module',
  },
}
