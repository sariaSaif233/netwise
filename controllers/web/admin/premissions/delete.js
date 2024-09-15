const Teacher = require('../../../../models/teachers');
const Subject = require('../../../../models/subjects');
const Class = require('../../../../models/classes');
const Manger = require('../../../../models/managers');
const Subteach = require('../../../../models/sub_teach');
const Video = require('../../../../models/video');
const Chapter = require('../../../../models//chapters');
const path = require('path');
const fs = require('fs');

module.exports.delete_teacher = async (req, res, next) => {
    
    try {
        const  teacher_id = req.body.teacher_id;
        const teacher = await Teacher.findByPk(teacher_id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        teacher.valid = 0;
        await teacher.save();

        res.json({ message: 'Teacher validated successfully', teacher });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.soft_delete_subject = async (req, res, next) => {
    try {
        const subjectId = req.body.subjectId;

        // Update the deleted_at field instead of actually deleting
        await Subject.update(
            { deleted_at: new Date() },
            { where: { id: subjectId } }
        );

        res.status(200).send('Subject soft deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};


module.exports.soft_delete_class = async (req, res, next) => {
    try {
        const classId = req.body.classId;

        // Soft delete the class
        await Class.update(
            { deleted_at: new Date() },
            { where: { id: classId } }
        );

        // Soft delete all subjects associated with this class
        await Subject.update(
            { deleted_at: new Date() },
            { where: { classId: classId } } // No condition to check if already deleted
        );

        res.status(200).send('Class and associated subjects soft deleted successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};


module.exports.deleteTeacherFromSubjcet = async (req, res, next) => {
const teacherId=req.body.teacherId;
const subjectId=req.body.subjectId;
try{
const subTeach=await Subteach.findOne({
    where:{
    teacherId:teacherId,
    subjectId:subjectId        
    }
})
await subTeach.destroy();
return res.status(200).json({ message: 'Teacher deleted from that subject' });
}
catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}
}


module.exports.deleteAdmin = async (req, res, next) => {
    
    const adminId=req.body.adminId;
    try{
    const manager=await Manger.findOne({
        where:{
        adminId:adminId,
        }
    })
    await manager.destroy();
    return res.status(200).json({ message: 'Admin deleted successfully' });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
}

module.exports.deleteMyAccount = async (req, res, next) => {
    
    const adminId=req.userID.userID;
    try{
    const manager=await Manger.findOne({
        where:{
        id:adminId,
        }
    })
    await manager.destroy();
    return res.status(200).json({ message: 'your Account deleted successfully' });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
}



module.exports.delete_files = async (req, res, next) => {
    const { id } = req.body;

    try {
        // Find the file record in the database
        const fileRecord = await Chapter.findByPk(id);

        if (!fileRecord) {
            return res.status(404).json({ error: 'File record not found' });
        }

        const relativeImagePath = fileRecord.pdf_url.replace(`${req.protocol}://${req.get('host')}/`, '');
        const filePath = path.join(__dirname, `../../../../${relativeImagePath}`);

        // Check if the fi le exists before attempting to delete
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



module.exports.delete_videos = async (req, res, next) => {
    const { id } = req.body;

    try {
        // Find the file record in the database
        const videoRecord = await Video.findByPk(id);

        if (!videoRecord) {
            return res.status(404).json({ error: 'Video record not found' });
        }

        const relativeImagePath = videoRecord.video_url.replace(`${req.protocol}://${req.get('host')}/`, '');
        const videoPath = path.join(__dirname, `../../../../${relativeImagePath}`);

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
