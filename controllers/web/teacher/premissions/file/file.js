const fs = require('fs');
const Chapter = require('../../../../../models/chapters.js');
const SubTech = require('../../../../../models/sub_teach.js');
const Subject = require('../../../../../models/subjects.js');
const multer = require('multer');
const path = require('path');
const Op = require('sequelize')
// const {console}=require('console')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const name = req.body.name;
        if (!name) {
            return cb(new Error('Name is required in the request body'));
        }
        const uploadPath = path.resolve(__dirname, '../../../../../uploads', name);
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
        const fileName = `${Date.now()}_${file.originalname}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    //fileFilter: fileFilter
}).single('pdf');



module.exports.upload_file = async (req, res, next) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const subjectId = req.body.subject_id;
            const teacherId = req.userID.userID;

                const subject = await Subject.findOne({
                    where: {
                        id: subjectId,
                        deleted_at: null 
                    }
                });
                // console.log('Subject ID:',subject); // Log the subjectId

        
                // Properly handle the result of findOne
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

            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.body.name}/${req.file.filename}`;
            const fileRecord = await Chapter.create({
                name: req.body.name,
                pdf_url: fileUrl,
                subTeachId: subTechId,
                uploadDate: new Date()
            });

            res.status(200).json({ message: 'File uploaded successfully', file: fileRecord });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({ error: 'Error saving file information to the database' });
        }
    });
};



module.exports.delete_file = async (req, res, next) => {
    const { id } = req.body;

    try {
        // Find the file record in the database
        const fileRecord = await Chapter.findByPk(id);

        if (!fileRecord) {
            return res.status(404).json({ error: 'File record not found' });
        }

        const relativeImagePath = fileRecord.pdf_url.replace(`${req.protocol}://${req.get('host')}/`, '');
        const filePath = path.join(__dirname, `../../../../../${relativeImagePath}`);

        // Check if the file exists before attempting to delete
        fs.access(filePath, fs.constants.F_OK, async (err) => {
            if (err) {
                console.error('File not found:', filePath);
                // File does not exist, still delete the record from the database
                await fileRecord.destroy();
                return res.status(200).json({ message: 'Record deleted, but file not found on server' });
            }

            // File exists, delete it
            fs.unlink(filePath, async (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error deleting file:', unlinkErr);
                    return res.status(500).json({ error: 'Error deleting file from server' });
                }

                // Delete the record from the database
                await fileRecord.destroy();
                return res.status(200).json({ message: 'File and record deleted successfully' });
            });
        });
    } catch (dbError) {
        console.error('Database error:', dbError);
        return res.status(500).json({ error: 'Error deleting file record from the database' });
    }
};





