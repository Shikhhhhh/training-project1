module.exports = {
  plugins: [
    // Tailwind v4+ moved the PostCSS plugin to the `@tailwindcss/postcss` package.
    // Require the plugin function so PostCSS can call it.
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}
