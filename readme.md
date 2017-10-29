
# dist-css (WIP)

> Create dist version of your CSS.

Combines multiple tools for easily creating dist version of your CSS.

```
$ dist-css -f dist/app.css
```

This will

 - Run `postcss` with `autoprefixer`
 - Run `clean-css` on the result of postcss
 - Creates `.css.map` where your file outputs.

## Install

```
$ npm i -D dist-css
```

## Usage

### `dist-css [...options]`

 - `--input`, `-i` the input file to compile
 - `--output`, `-o` the output file
 - `--file`, `-f` shorthand for when `-i` and `-o` are the same.
 - `--sourcemap`, `-m` enable sourcemaps (on by default)

When no input or output are provided, it reads from stdio.

Example usages:

```
dist-css -f dist/app.css
dist-css --no-sourcemap -f dist/app.css
dist-css -i web/app.css -o dist/app.css

# From stdio
cat dist/app.css | dist-css > dist/app.css
```
