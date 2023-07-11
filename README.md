# Sass pkg: test

This is a repo to prove out the recommended algorithm for resolving `pkg` URLs
as dependencies in Sass, per the Package Imports proposal.

The node_modules_keep folder contains mocked dependencies. Running `npm install`
will install the dependencies and then copy the mocked dependencies over in the
`postinstall` script.

To run the tests, run `npm install`, and then `node index.js`.

## Contributing

To provide sample use cases, add new test cases to `index.js`. If needed, add a
new mocked package to `node_modules_keep`. At minimum, a `package.json` and
files will be needed.
