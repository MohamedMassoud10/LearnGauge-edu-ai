const multer = require('multer');
const ApiError = require('../utils/apiError');

const multerOptions = () => {
    const multerStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/lectures/'); 
        },
        filename: (req, file, cb) => {
            const ext = file.mimetype.split('/')[1]; 
            cb(null, `lecture-${Date.now()}.${ext}`); 
        }
    });
     

    const multerFilter = (req, file, cb) => {
        if (
            file.mimetype === 'application/pdf' ||
            file.mimetype.startsWith('video') ||
            file.mimetype.startsWith('audio')
        ) {
            cb(null, true);
        } else {
            cb(new ApiError('Only PDF, video, and audio files are allowed', 400), false);
        }
    };

    return multer({ storage: multerStorage, fileFilter: multerFilter });
};

exports.uploadMixedFiles = () => multerOptions().fields([
    { name: 'pdf', maxCount: 1 },   
    { name: 'video', maxCount: 1 }, 
    { name: 'audio', maxCount: 1 }, 
]);
