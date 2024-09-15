
const User = require('../../../../models/students.js');
const Class=require('../../../../models/classes.js');
const path = require('path');
const multer = require('multer');
const { use } = require('passport');
const fs = require('fs').promises;
const fsSync = require('fs');
const bcrypt = require('bcrypt');
const sequelize = require('../../../../util/database.js');
const Wallet = require('../../../../models/wallet.js');
const Feedback = require('../../../../models/feedback.js');
const Report = require('../../../../models/report.js');
const Read = require('../../../../models/read.js');
const Grade = require('../../../../models/grade.js');
const Note = require('../../../../models/note.js');
const Check = require('../../../../models/check.js');
const Subscribe = require('../../../../models/subscribe.js');




module.exports.getInfo = async (req, res, next) => {
    try {
        // Extract userId from the request body
        const userId = req.userID;
        // Find the user by ID
        const user = await User.findByPk(userId.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Get the classId from the user
        const classId = user.classId;

        // Find the class by ID
        const classInfo = await Class.findByPk(classId);
        if (!classInfo) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // Include the class name in the response
        return res.status(200).json({ user, className: classInfo.name });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

    
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const id = req.userID.userID;
           
            const uploadPath = path.join(__dirname, `../../../../images/profile/Student/${id}`);
            await fs.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (err) {
            console.error('Error creating folder:', err);
            cb(err);
        }
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}_${file.originalname}`;
        cb(null, fileName);
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    // fileFilter: fileFilter
}).single('image');

module.exports.upload_image = async (req, res, next) => {
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
            const user = await User.findByPk(req.userID.userID);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // If user already has an image, delete the old image
            if (user.imagePath) {
                const relativeImagePath = user.imagePath.replace(`${req.protocol}://${req.get('host')}/`, '');
                const oldImagePath = path.join(__dirname, `../../../../${relativeImagePath}`);
                
                console.log('Attempting to delete old image:', oldImagePath);

                if (fsSync.existsSync(oldImagePath)) {
                    try {
                        await fs.unlink(oldImagePath);
                        console.log('Old image deleted successfully');
                    } catch (unlinkErr) {
                        console.error('Error deleting old image:', unlinkErr);
                    }
                } else {
                    console.log('Old image file does not exist');
                }
            }

            const fileUrl = `${req.protocol}://${req.get('host')}/images/profile/Student/${req.userID.userID}/${req.file.filename}`;
            user.imagePath = fileUrl;
            await user.save();

            res.status(200).json({ message: 'File uploaded successfully', user });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({ error: 'Error saving file information to the database' });
        }
    });
};

module.exports.editprofile = async (req, res, next) => {
    try {
        // Extract userId, name, and phoneNumber from the request body
        const {  name , email , phoneNumber } = req.body;
        const userId= req.userID.userID;
        // Find the user by ID
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!/^(09)\d{8}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Phone number should start with "09" and be 10 digits long' });
        }

        // Check if email already exists
        if(user.email!=email){
        const existingEmail = await User.findOne({ where: { email: email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already registered' });
        }
    }
        // Check if phone number already exists
        if(user.phoneNumber!=phoneNumber){
        const existingPhoneNumber = await User.findOne({ where: { phoneNumber: phoneNumber } });
        if (existingPhoneNumber) {
            return res.status(400).json({ message: 'Phone number is already registered' });
        }
    }
        // Update the user's name and phoneNumber
        user.name = name;
        user.email = email;
        user.phoneNumber = phoneNumber;

        // Save the updated user to the database
        await user.save();

        // Return the updated user
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


module.exports.delete_image = async (req, res, next) => {
    const id = req.userID.userID;
    try {
        // Find the user in the database
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        
            const relativeImagePath = user.imagePath.replace(`${req.protocol}://${req.get('host')}/`, '');
            const imagePath = path.join(__dirname, '../../../../', relativeImagePath);

            console.log('Attempting to delete image:', imagePath);

            try {
                // Check if the file exists before attempting to delete
                await fs.stat(imagePath);
                try {
                    await fs.unlink(imagePath);
                    console.log('Image deleted successfully');
                } catch (unlinkErr) {
                    console.error('Error deleting image:', unlinkErr);
                    return res.status(500).json({ error: 'Error deleting image from server' });
                }
            } catch (statErr) {
                console.error('Error accessing image file:', statErr);
                // If the image doesn't exist, we just skip the deletion process
            }
        

        // Set the user's image path to the full URL of the default image
        user.imagePath = null;
        await user.save();

        res.status(200).json({ 
            message: 'Image deleted ',
        });
    } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({ error: 'Error updating user record in the database' });
    }
};



module.exports.put_the_default_image = async (req, res, next) => {
    const id = req.userID.userID;
    try {
        // Find the user in the database
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const defaultImagePath = `${baseUrl}/defaultImage/accountImage.jpg`;
        user.imagePath=defaultImagePath;
        user.save();
        res.status(200).json({ 
            message: 'Image deleted and the default one updated',
        });
    }catch(error){
        res.status(500).json({ error: 'Error updating user record in the database' });

    }


}
module.exports.reset_password_profile = async (req, res, next) => {
    try {
        const {  oldPassword, newPassword } = req.body;
        const userId= req.userID.userID;
        console.log(userId);
        if (!newPassword) {
            return res.status(400).send('New password is required');
        }
        const user = await User.findByPk(userId);

        
        
        if (!user) {
            return res.status(404).json('User not found');
        }

        // Compare old password with the stored password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json('Old password is incorrect');
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        // Update the user's password
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({
            success: 1,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};



module.exports.delete_my_account = async (req, res, next) => {
    const studentId = req.userID.userID;
  
    try {
      await sequelize.transaction(async (t) => {
        // Find the student including their wallet_id
        const student = await User.findByPk(studentId, { transaction: t });
  
        if (!student) {
          return res.status(404).json({ error: 'Student not found' });
        }
  
        const walletId = student.walletId;
  
        // Delete the wallet record if wallet_id exists
        if (walletId) {
          await Wallet.destroy({
            where: { id: walletId },
            transaction: t,
          });
        }
          
  
         // Delete related records in other tables
         await Note.destroy({
          where: { studentId: studentId },
          transaction: t,
        });
  
        await Check.destroy({
          where: { studentId: studentId },
          transaction: t,
        });
              
        await Subscribe.destroy({
          where: { studentId: studentId },
          transaction: t,
        });
        await Read.destroy({
            where: { id: studentId },
            transaction: t,
          });
          await Grade.destroy({
            where: { id: studentId },
            transaction: t,
          });
          await Report.destroy({
            where: { id: studentId },
            transaction: t,
          });
          await Feedback.destroy({
            where: { id: studentId },
            transaction: t,
          });


        // Delete the student
        await User.destroy({
          where: { id: studentId },
          transaction: t,
        });
      

        // Commit the transaction
        await t.commit();
  
        res.json({ message: 'Student and related wallet record deleted successfully' });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while deleting student and related records' });
    }
  };