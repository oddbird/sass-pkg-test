# Sass pkg: test

This is a repo to prove out the recommended algorithm for resolving `pkg` URLs as dependencies in Sass, per the Package Imports proposal.

The node_modules folder contains mocked dependencies. Do not run `npm install`, as this will remove the mocks.

To run the tests, run `node index.js`.

## Contributing

To provide sample use cases, add new test cases to `index.js`. If needed, add a new mocked package to `node_modules`. At minimum, a `package.json` and files will be needed.
