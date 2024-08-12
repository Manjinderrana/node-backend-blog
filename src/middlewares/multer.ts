import multer from 'multer'

const storage = multer.diskStorage({
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '.' + file.mimetype.split('/')[1]
    cb(null, uniqueSuffix)
  },
})

const multerMiddleWare = multer({ storage: storage })

export default multerMiddleWare
