
# dist-css

> Create dist version of your CSS.

Combines tools for adding comptibility and optimizations to your CSS compiler's
output.

```sh
$ dist-css dist/app.css
```

This will

- Run `postcss` with `autoprefixer`.
- Run `clean-css`.
- Use sourcemaps when given input and output paths.

Also see [`dist-js`](https://github.com/jamen/dist-js) for your JS files.

## Install

```sh
$ npm i -D dist-css
```

## Usage

### `dist-css [file] [...options]`

The easiest way to use the tool is transforming a file in place:

```sh
$ dist-css dist/app.css
```

It will also detect when you want to use stdio:

```sh
# Using stdout
$ dist-css dist/app.css | wc -c
6780

# Using stdin
$ echo "* { box-sizing: border-box }" | dist-css dist/app.css
finished dist-css at dist/app.css

# Using both
$ echo "a { ... }" | dist-css > dist/app.css
```

Alternative to this, use the `--input`, `-i` and `--output`, `-o` flags, where
if a flag is absent it uses the stdio equivalent instead.

Also note that you can only accept a sourcemap with an input path, and write a
sourcemap with an output path.  Inline sourcemaps are not supported out of
simplicity.

To disable sourcemaps regardless, supply the `--no-sourcemap` flag:

```sh
$ dist-css --no-sourcemap dist/app.css
```
