# Description

Collection of Webpack helper functions, rules, loaders, constants, etc.

## Usage

```bash
npm install @theopenweb/webpack-helpers
```

Each function can be found in the source code.
Only the main functions are found below:

```js
const WebpackHelpers = require('@theopenweb/webpack-helpers')

// Create basic/common config
module.exports = WebpackHelpers.Recipes.common(__dirname)

// Create basic/common rules
const rules = WebpackHelpers.Rules.common()

```

## Help

Create config:

```js
// webpack.config.js
const WebpackHelpers = require('@theopenweb/webpack-helpers')
module.exports = WebpackHelpers.Recipes.common(__dirname)
```

Production build script:

```json
{
  "scripts": {
    "build-production": "cross-env NODE_ENV=production webpack --mode production"
  }
}
```

Development build script:

```json
{
  "scripts": {
    "build-development": "cross-env NODE_ENV=development webpack"
  }
}
```

## Test

Testing is done using `npm run test`.
Only basic testing is done now. Please feel free to request improved testing.

## Notes

- "-p changed to --mode production": [Webpack when run in terminal it gives an "error error: unknown option '-p'"](https://stackoverflow.com/questions/65592541/webpack-when-run-in-terminal-it-gives-an-error-error-unknown-option-p)
- Changelog generation:
  - [auto-changelog](https://github.com/CookPete/auto-changelog)
  - Install: `npm i -g auto-changelog`
  - Execute: `auto-changelog`

## Feedback

Feel free to contact about feedback.
If you have any helpers you would like to add, please get in contact.
