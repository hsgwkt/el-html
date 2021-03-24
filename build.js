const watchOption = {
  onRebuild(error, _result) {
    if (error) console.error('watch build failed:', error)
    else console.error('watch build succeeded')
  }
}

require('esbuild').build({
  entryPoints: ['./src/index.ts'],
  // outdir: './dist',
  outfile: './dist/el-html.js',
  format: 'esm',
  target: ['es2019'],
  bundle: true,
  minify: process.env.NODE_ENV === 'production',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  watch: process.env.NODE_ENV === 'production' ? false : watchOption,
})
