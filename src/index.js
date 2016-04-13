import gm from 'gm'
import temp from 'temp'
import Color from 'color'

temp.track()

const defaults = {
  desaturate: true, 
  intermediateBrightness: 100
}

export default function colorizedImage(options) {
  const dfd = deferred()
  const opts = { ...defaults, ...options }
  const { src, mask, color, desaturate, intermediateBrightness } = opts

  const mod = Color(color)
  const colorizeParams = rgbArrayToColorizeParams(mod.rgbArray())
  
  let colorized = gm(src)
    .modulate(intermediateBrightness, desaturate ? 0 : 100)
    .colorize(...colorizeParams)

  temp.open('colorizedImage', (err, tmp)=> {
    if (err) { return dfd.reject(err) }

    const final = gm()
      .command('composite')
      .in(src)
      .in(tmp.path)
      .in(mask)

    colorized.write(tmp.path, (err)=> {
      if (err) { return dfd.reject(err) }
      dfd.resolve(final)
    })
  })

  return dfd.promise
}

function inverseIntensity(value) {
  return 100 - ((value / 255) * 100)
}

function rgbArrayToColorizeParams(arr) {
  return arr.map(inverseIntensity)
}

function deferred() {
  let resolve, reject;
  let promise = new Promise((_resolve, _reject)=> {
    resolve = _resolve
    reject = _reject
  })
  return {
    resolve,
    reject,
    promise
  }
}
