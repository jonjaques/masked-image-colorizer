import gulp from 'gulp'
import colorize from '../src'
import yargs from 'yargs'
import path from 'path'

const args = yargs
  .default('color', 'lightblue')
  .argv

gulp.task('test', (done)=> {
  const src = path.resolve('test/couch.png')
  const mask = path.resolve('test/couch-mask-blur.png')
  const color = args.color

  colorize({ src, mask, color }).then((gmFile)=> {
    gmFile.write(path.resolve('test/output/couch.png'), (err)=> {
      if (err) return console.log(err)
      done()
    })
  })
})