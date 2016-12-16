import gm from 'gm'
import temp from 'temp'
import trimUrl from 'url-trim'
import Color from 'color'

temp.track()

const defaults = {
  brightness: 100,
  saturation: 100,
  desaturate: true,
  resize: false,
  width: null
}

export default async function colorizedImage(options) {
  const dfd = deferred()
  const opts = { ...defaults, ...options }

  if (opts.src) { opts.src = trimUrl(opts.src) }
  if (opts.mask) { opts.mask = trimUrl(opts.mask) }

  const { 
    src, 
    mask, 
    color, 
    saturation,
    desaturate,
    resize,
    brightness,
    width
  } = opts

  const mod = Color(color)
  const colorizeParams = rgbArrayToColorizeParams(mod.rgbArray())
  
  let colorized = gm(src)
    .modulate(brightness, desaturate ? 0 : 100)
    .colorize(...colorizeParams)
    .modulate(100, saturation)

  let tmp = await tempFile('colorizedImage')

  if (resize) {
    try {
      let size = await getSize(gm(src))
      let maskSize = await getSize(gm(mask))
      if (size.width != maskSize.width || size.height != maskSize.width) {
        await gmWrite(gm(mask).resizeExact(size.width, size.height), mask)
      }
    } catch(e) {
      return dfd.reject(e)
    }
  }

  let final = gm()
    .command('composite')
    .in(src)
    .in(tmp.path)
    .in(mask)

  colorized.write(tmp.path, async (err)=> {
    if (err) { return dfd.reject(err) }
    if (typeof width === 'number') {
      let tPath = await tempFile('resizedImage')
      await gmWrite(final, tPath.path)
      let newFinal = gm(tPath.path).resize(width, width)
      return dfd.resolve(newFinal)
    }
    dfd.resolve(final)
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

async function tempFile(name) {
  return new Promise((resolve, reject)=> {
    temp.open(name, (err, result)=> {
      if (err) return reject(err)
      resolve(result)
    })
  })
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
