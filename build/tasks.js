import gulp from 'gulp'
import colorize from '../src'
import yargs from 'yargs'
import path from 'path'

const args = yargs
  .default('color', 'green')
  .number('brightness')
  .default('brightness', 150)
  .number('opacity')
  .default('opacity', 100)
  .argv

gulp.task('default', ['test'])

gulp.task('test', (done)=> {
  const src = path.resolve('test/mm_test/g611/G611-2.jpg')
  const mask = path.resolve('test/mm_test/g611/G611-2_mask.jpg')
  const color = args.color
  const brightness = args.brightness
  const saturation = args.saturation || 10
  const opacity = args.opacity
  colorize({ src, mask, color, brightness, saturation, opacity })
    .catch(err => console.log(err))
    .then((gmFile)=> {
      gmFile.write(path.resolve('test/mm_test/g611/G611-2_computed.jpg'), (err)=> {
        if (err) return console.log(err)
        done()
      })
    })
})