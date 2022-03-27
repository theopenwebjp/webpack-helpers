const WebpackHelpers = require('./index')

/**
 * @param {string} groupName 
 * @param {[string, function][]} tests 
 */
async function g(groupName, tests) {
  console.log(`Group started: ${groupName}`)
  await Promise.all(tests.map(async t => {
    const [testName, func] = t
    console.log(`Test started: ${testName}`)
    try {
      const rawResponse = func()
      const response = rawResponse instanceof Promise ? await rawResponse : rawResponse
      console.log(`Test response:`, response)
    } catch (err) {
      console.error(`Test failed`, err)
    }
    console.log(`Test ended: ${testName}`)
  }))
  console.log(`Group end: ${groupName}`)
}

async function test() {
  await g('ungrouped', [
    ['mode', () => WebpackHelpers.mode()]
  ])

  await g('Plugins', [
    ['BundleAnalyzer', () => WebpackHelpers.Plugins.bundleAnalyzer()],
    ['jquery', () => WebpackHelpers.Plugins.jquery()]
  ])

  await g('Recipes', [
    ['common', () => WebpackHelpers.Recipes.common(__dirname)],
    ['babelLoader', () => WebpackHelpers.Recipes.babelLoader()],
    ['copyWebpackPluginPatterns', () => WebpackHelpers.Recipes.copyWebpackPluginPatterns()],
    ['cssLoaders', () => WebpackHelpers.Recipes.cssLoaders()],
    ['getCommonOutput', () => WebpackHelpers.Recipes.getCommonOutput(__dirname)],
    ['getWebpackMode', () => WebpackHelpers.Recipes.getWebpackMode()],
    ['tsLoader', () => WebpackHelpers.Recipes.tsLoader()],
    ['tsLoaderWithBabel', () => WebpackHelpers.Recipes.tsLoaderWithBabel()],
    ['webpack4ES6DropConsole', () => WebpackHelpers.Recipes.webpack4ES6DropConsole()],
    ['webpack4UglifyDropConsole', () => WebpackHelpers.Recipes.webpack4UglifyDropConsole()],
  ])
  
  await g('Rules', [
    ['common', () => WebpackHelpers.Rules.common()],
    ['cssString', () => WebpackHelpers.Rules.cssString()],
    ['htmlString', () => WebpackHelpers.Rules.htmlString()],
    ['image', () => WebpackHelpers.Rules.image()],
    ['json', () => WebpackHelpers.Rules.json()],
  ])
}

test()
