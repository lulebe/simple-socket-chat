module.exports = process.env.NODE_ENV == 'production' ? cloud() : local()


function cloud () {
  const cloudinary = require('cloudinary')
  const streamifier = require('streamifier')
  const save = (buffer, cb) => {
    const cloudStream = cloudinary.uploader.upload_stream(result => {
      console.log(result)
      cb(null, result.secure_url)
    }, { width: 1000, height: 1000, crop: "limit" })
    streamifier.createReadStream(buffer).pipe(cloudStream)
  }
  return {
    save: save
  }
}



function local () {
  const fs = require('fs')
  const path = require('path')
  const imageType = require('image-type')
  const save = (buffer, cb) => {
    const randomName = 'img_'
      + Date.now()
      + (Math.floor(Math.random()*10000))
      + '.'
      + imageType(buffer).ext
    fs.writeFile(path.join(__dirname, 'uploads/', randomName), buffer, err => {
      if (err)
        cb(err)
      else
        cb(null, '/uploads/'+randomName)
    })
  }
  return {
    save: save
  }
}
