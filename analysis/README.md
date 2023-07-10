# Sass pkg test analysis

Scripts for fetching and analyzing popular and community package.json files.

## Loading

Run `node load.js`. This will fetch the package metadata for each package listed in `packages.js`. 
By default, this will not re-fetch data that already exists, so you can re-run if there are timeout or other errors.

## Analsis

Run `node analyze.js`. This will output the result of the analysis. The
`analyze.js` file has a bit of context on what the results are.