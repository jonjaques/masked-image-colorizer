import gm from 'gm'
import temp from 'temp'
import Color from 'color'

temp.track()

const defaults = {
  brightness: 100,
  saturation: 100,
  desaturate: true,
  resize: false
}

export default async function colorizedImage(options) {
  const dfd = deferred()
  const opts = { ...defaults, ...options }
  const { 
    src, 
    mask, 
    color, 
    saturation,
    desaturate,
    resize,
    brightness
  } = opts

  const mod = Color(color)
  const colorizeParams = rgbArrayToColorizeParams(mod.rgbArray())
  
  let colorized = gm(src)
    .modulate(brightness, desaturate ? 0 : 100)
    .colorize(...colorizeParams)
    .modulate(100, saturation)

  temp.open('colorizedImage', async (err, tmp)=> {
    if (err) { return dfd.reject(err) }

    if (resize) {
      try {
        let size = await getSize(gm(src))
        let maskSize = await getSize(gm(mask))
        if (size.width != maskSize.width || size.height != maskSize.width) {
          await gmWrite(gm(mask).resizeExact(size.width, size.height), mask)
        }
      } catch(e) {
        return reject(e)
      }
    }

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

function getSize(gmInstance) {
  return new Promise((resolve, reject)=> {
    gmInstance.size((err, size)=> {
      if (err) return reject(err)
      resolve(size)
    })
  })
}

function gmWrite(gmInstance, path) {
  return new Promise((resolve, reject)=> {
    gmInstance.write(path, (err)=> {
      if (err) return reject(err)
      resolve(path)
    })
  })
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
