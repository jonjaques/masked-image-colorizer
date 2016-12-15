import gulp from 'gulp'
import colorize from '../src'
import yargs from 'yargs'
import path from 'path'

const args = yargs
  .default('color', 'green')
  .number('brightness')
  .default('brightness', 150)
  .number('opacity')
  .number('width')
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
  const width = args.width || null
  colorize({ src, mask, color, brightness, saturation, opacity, width })
    .catch(err => console.log(err))
    .then((gmFile)=> {
      let p = path.resolve('test/mm_test/g611/G611-2_computed.jpg')
      gmFile.write(p, (err)=> {
        if (err) return console.log(err)
        console.log('Wrote file ' + p)
        done()
      })
    })
})