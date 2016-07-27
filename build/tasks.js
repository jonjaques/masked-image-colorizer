import gulp from 'gulp'
import colorize from '../src'
import yargs from 'yargs'
import path from 'path'

const args = yargs
  .default('color', 'lightblue')
  .number('brightness')
  .default('brightness', 100)
  .number('opacity')
  .default('opacity', 100)
  .argv

gulp.task('default', ['test'])

gulp.task('test', (done)=> {
  const src = path.resolve('test/couch.jpg')
  const mask = path.resolve('test/couch-mask-blur.png')
  const color = args.color
  const intermediateBrightness = args.brightness
  const opacity = args.opacity

  colorize({ src, mask, color, intermediateBrightness, opacity }).then((gmFile)=> {
    gmFile.write(path.resolve('test/output/couch.jpg'), (err)=> {
      if (err) return console.log(err)
      done()
    })
  })
})