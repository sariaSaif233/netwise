
const fs = require('fs');
const Video = require('../../../../../models/video.js');
const SubTech = require('../../../../../models/sub_teach.js');
const Subject = require('../../../../../models/subjects.js');
const multer = require('multer');
const path = require('path');
const Op = require('sequelize')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const name = req.body.name;
        if (!name) {
            return cb(new Error('Name is required in the request body'));
        }
        const uploadPath = path.resolve(__dirname, '../../../../../videos', name);
        console.log('Absolute upload path:', uploadPath);  // Log the absolute upload path

        fs.mkdir(uploadPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating folder:', err);
                return cb(err);
            }
            cb(null, uploadPath);
        });
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `${Date.now()}_${file.originalname}`;
        cb(null, fileName);
    }
});


const upload = multer({ 
    storage: storage,
}).single('video');

module.exports.upload_video = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No video uploaded' });
        }

        try {
            const subjectId = req.body.subject_id;
            const teacherId = req.userID.userID;
            
            const subject = await Subject.findAll({
                where: {
                    id: subjectId,
                    deleted_at:  null // Check if `deleted_at` is null, meaning not soft-deleted
                    
                }
            });
            

            if (!subject) {
                return res.status(404).json({ error: 'The subject does not exist or has been soft-deleted.' });
            }

            const subTechRecord = await SubTech.findOne({
                where: {
                    subjectId: subjectId,
                    teacherId: teacherId
                }
            });

            if (!subTechRecord) {
                return res.status(404).json({ error: 'SubTech record not found' });
            }

            const subTechId = subTechRecord.id;

            const videoUrl = `${req.protocol}://${req.get('host')}/videos/${req.body.name}/${req.file.filename}`;
            const videoRecord = await Video.create({
                name: req.body.name,
                video_url: videoUrl,
                subTeachId: subTechId,
                uploadDate: new Date()
            });

            res.status(200).json({ message: 'video uploaded successfully', video: videoRecord });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({ error: 'Error saving video to the database' });
        }
    });
};





module.exports.delete_video = async (req, res, next) => {
    const { id } = req.body;

    try {
        // Find the file record in the database
        const videoRecord = await Video.findByPk(id);

        if (!videoRecord) {
            return res.status(404).json({ error: 'Video record not found' });
        }

        const relativeImagePath = videoRecord.video_url.replace(`${req.protocol}://${req.get('host')}/`, '');
        const videoPath = path.join(__dirname, `../../../../../${relativeImagePath}`);

        // Check if the file exists before attempting to delete
        fs.access(videoPath, fs.constants.F_OK, async (err) => {
            if (err) {
                console.error('Video not found:', videoPath);
                // File does not exist, still delete the record from the database
                await videoRecord.destroy();
                return res.status(200).json({ message: 'Record deleted, but video not found on server' });
            }

            // File exists, delete it
            fs.unlink(videoPath, async (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting video:', unlinkErr);
                    return res.status(500).json({ error: 'Error deleting video from server' });
                }

                // Delete the record from the database
                await videoRecord.destroy();
                return res.status(200).json({ message: 'Video and record deleted successfully' });
            });
        });
    } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ error: 'Error deleting video record from the database' });
    }
};





