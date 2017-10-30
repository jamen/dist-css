#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const CleanCSS = require('clean-css')
const autoprefixer = require('autoprefixer')

const cli = require('minimist')(process.argv.slice(2), {
  default: {
    sourcemap: true,
  },
  alias: {
    sourcemap: 'm',
    output: 'o',
    input: 'i',
    file: 'f'
  }
})

// Shortcut for transforming a single file
if (cli.file) cli.input = cli.output = cli.file

// Create streams from input/output options
const input = cli.input ? fs.createReadStream(cli.input) : process.stdin
const output = cli.output ? fs.createWriteStream(cli.output) : process.stdout

// Read data
const bufs = []
input.on('data', x => bufs.push(x))
input.on('end', () => maybeSourcemap(Buffer.concat(bufs)))

function maybeSourcemap (css) {
  const sm = cli.sourcemap
  if (sm && sm !== 'inline' && output !== process.stdout) {
    compile(css, path.resolve(sm && sm !== true ? sm : cli.output + '.map'))
  } else {
    compile(css, null)
  }
}

function compile (css, sourcemap) {
  const clean = new CleanCSS({
    sourceMap: cli.sourcemap !== 'inline' && cli.sourcemap,
    sourceMapInlineSources: cli.sourcemap === 'inline',
    returnPromise: true
  })

  console.log(sourcemap)

  postcss([ autoprefixer ]).process(css, {
    from: path.resolve(cli.input),
    to: path.resolve(cli.output),
    map: sourcemap && {
      inline: cli.sourcemp === 'inline',
      // from: clisourcemap
    }
  })
  .then(result => {
    if (result.map) {
      const sourcemapData = JSON.stringify(result.map)
      return clean.minify(result.css, sourcemapData).then(output => {
        return new Promise((resolve, reject) => {
          fs.writeFile(sourcemap, sourcemapData, (err) => {
            if (err) return reject(err)
            return resolve(output.styles)
          })
        })
      })
    } else {
      return clean.minify(result.css).then(x => x.styles)
    }
  })
  .then(css => {
    // console.log(cli.output)
    if (output !== process.stdout) {
      output.end(css)
    } else {
      output.write(css)
    }
  })
  .then(() => {
    // console.log('Finished')
  })
  .catch(err => {
    console.error(err)
  })
}
