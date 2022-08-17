export default {
  files: ['test/**/*.test.ts'],
  concurrency: 5,
  failFast: true,
  failWithoutAssertions: false,
  verbose: true,
  nodeArguments: [
    '--no-warnings',
    '--loader=@esbuild-kit/esm-loader',
    '--experimental-specifier-resolution=node',
  ],
  extensions: {
    ts: 'module',
  },
}
