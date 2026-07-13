/** Webpack/Turbopack-compatible loader: file contents → `export default "..."` */
module.exports = function rawStringLoader(source) {
  return `export default ${JSON.stringify(source)};`;
};
