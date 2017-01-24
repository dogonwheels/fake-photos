## Fake Photo

A utility to generate images with 'realistic' sizing and timestamps. Images are simple solid colors with timestamp and dimensions rendered, in an attempt to keep file size down.

## Instructions

  - `brew install pkg-config cairo libpng jpeg giflib` for `canvas` Cairo dependencies
  - `npm install`
  - Edit `config.js` to have appropriate dates, probabilities (0 to 1) and number of photos
  - `node run generate` will create directories of `YYYY-MM` filled with your 'photos'

## Warning!

This is super dumb, quick and dirty, and will happily gobble loads of memory as we wait for the disk. A crude limiter blocks further creations by checking every second if there are still any outstanding. Sorry/not sorry.