const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = {
  webpack: {
    plugins: {
      add: [new MonacoWebpackPlugin({
        languages: ['json', 'javascript', 'typescript', 'css', 'html', 'python', 'java', 'csharp', 'cpp', 'go', 'rust', 'ruby', 'php']
      })]
    }
  }
};
