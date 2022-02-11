# Description

Collection of Webpack helper functions.

## Usage

Each function can be found in the source code.
Only the main functions are found below:

```js
const WebpackHelpers = require('webpack-helpers')

// Create basic/common config
module.exports = WebpackHelpers.Recipes.common(__dirname)

// Create basic/common rules
const rules = WebpackHelpers.Rules.common()

```

## Help

Create config:

```js
// webpack.config.js
const WebpackHelpers = require('webpack-helpers')
module.exports = WebpackHelpers.Recipes.common(__dirname)
```

Production build script:

```json
{
  "scripts": {
    "build-production": "cross-env NODE_ENV=production webpack -p"
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

## Feedback

Feel free to contact about feedback.
If you have any helpers you would like to add, please get in contact.
