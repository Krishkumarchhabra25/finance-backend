const multer = require("multer");

const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({storage: memoryStorage});

module.exports = uploadMemory