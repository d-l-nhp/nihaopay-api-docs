# Contributing to nihaopay-api-docs

## Editorial workflow

1. Always branch off from `main` and append or modify under `content`.
2. Frontmatter must validate against `schemas/frontmatter.ts`. New files start as `status: draft`.
3. Run the linter script before commiting your contribution: `pnpm lint:content` 
4. Tag the commit before pushing.
