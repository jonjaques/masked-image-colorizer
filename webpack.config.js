module.exports = {
  context: __dirname + "/src",
  entry: "./index",
  output: {
    path: __dirname,
    filename: "index.js",
    libraryTarget: "commonjs2"
  },
  externals: [
    /^[a-z\/\-0-9]+$/i
  ],
  module: {
    loaders: [
      { test: /.jsx?/, loader: 'babel' }
    ]
  }
}