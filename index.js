#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const CleanCSS = require('clean-css')
const autoprefixer = require('autoprefixer')

const options = require('minimist')(process.argv.slice(2), {
  boolean: ['sourcemap'],
  alias: {
    output: 'o',
    input: 'i'
  }
})

const hasStdout = !process.stdout.isTTY
const hasStdin = !process.stdin.isTTY
const noStdio = !hasStdout && !hasStdin

if (options._[0]) {
  if (noStdio) options.file = options._[0]
  else if (hasStdout) options.input = options._[0]
  else if (hasStdin) options.output = options._[0]
}

// Shortcut for transforming a single file
if (options.file) options.input = options.output = options.file

// Handle detection of sourcemap
const hasSourcemap = options.sourcemap != null
if (!options.output && hasSourcemap) {
  throw new Error('sourcemap requires an output path')
} else if (!hasSourcemap) {
  options.sourcemap = !!options.output
}

// Create input stream from file or stdin
const input = options.input
  ? fs.createReadStream(path.resolve(options.input))
  : process.stdin

// Read data
const bufs = []
input.on('data', x => bufs.push(x))
input.on('end', () => sourcemapMaybe(Buffer.concat(bufs)))

// Read sourcemap maybe
function sourcemapMaybe (css) {
  if (options.sourcemap) {
    fs.readFile(path.resolve(options.output + '.map'), 'utf8', (err, data) => {
      write(css, data)
    })
  } else {
    write(css, null)
  }
}

function write (css, sourcemapInput) {
  compile(css, sourcemapInput).then(result => {
    if (result.map) sourcemapInput = JSON.stringify(result.map)
    return minify(result.css, sourcemapInput)
  }).then(result => {
    return new Promise((resolve, reject) => {
      let lock = true

      if (options.sourcemap && result.sourceMap) {
        fs.writeFile(options.output + '.map', result.sourceMap, (err) => {
          if (err) return reject(err)
          if (!lock) return resolve()
          else lock = false
        })
      }

      if (options.output) {
        fs.writeFile(options.output, result.styles, (err) => {
          if (err) return reject(err)
          if (!lock) return resolve()
          else lock = false
        })
      } else {
        process.stdout.write(result.styles)
        if (!lock) resolve()
        else lock = false
      }
    }).then(() => {
      if (!hasStdout) {
        console.log(`finished dist-css at ${options.output}`)
      }
    }).catch(err => {
      console.error(err)
    })
  })
}

function compile (css) {
  return postcss([ autoprefixer ]).process(css, {
    from: options.input && path.resolve(options.input),
    to: options.output && path.resolve(options.output),
    map: options.sourcemap && {
      inline: false,
      from: path.resolve(options.input + '.map')
    }
  })
}

function minify (css, sourcemapInput) {
  const clean = new CleanCSS({
    sourceMap: options.sourcemap,
    returnPromise: true
  })

  return clean.minify(css, sourcemapInput)
}
