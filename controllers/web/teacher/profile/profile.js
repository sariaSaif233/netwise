
const Teacher = require('../../../../models/teachers.js');

const path = require('path');
const multer = require('multer');
const { use } = require('passport');
const fs = require('fs').promises;
const fsSync = require('fs');
const bcrypt = require('bcrypt');



module.exports.getInfo = async (req, res, next) => {
    try {
        // Extract userId from the request body
        const userId = req.userID;
        // Find the user by ID
        const user = await Teacher.findByPk(userId.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Include the class name in the response
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

    
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const id = req.userID.userID;
            if (!id) {
                return cb(new Error('ID is required in the request body'));
            }
            const uploadPath = path.join(__dirname, `../../../../images/profile/Teacher/${id}`);
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
    fileFilter: fileFilter
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
            const user = await Teacher.findByPk(req.userID.userID);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // If user already has an image, delete the old image
            if (user.imagePath) {
                const relativeImagePath = user.imagePath.replace(`${req.protocol}://${req.get('host')}/`, '');
                const oldImagePath = path.join(__dirname, `../../../../${relativeImagePath}`);
    
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

            const fileUrl = `${req.protocol}://${req.get('host')}/images/profile/Teacher/${req.userID.userID}/${req.file.filename}`;
            user.imagePath = fileUrl;
            user.uploadDate = new Date();
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
        const user = await Teacher.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!/^(09)\d{8}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Phone number should start with "09" and be 10 digits long' });
        }

        // Check if email already exists
        if(user.email!=email){
        const existingEmail = await Teacher.findOne({ where: { email: email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already registered' });
        }
    }
        // Check if phone number already exists
        if(user.phoneNumber!=phoneNumber){
        const existingPhoneNumber = await Teacher.findOne({ where: { phoneNumber: phoneNumber } });
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
        const user = await Teacher.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user has an image path
        if (user.imagePath) {
            // Extract the relative path from the image URL
            const relativeImagePath = user.imagePath.replace(`${req.protocol}://${req.get('host')}/`, '');
            const imagePath = path.join(__dirname, `../../../../${relativeImagePath}`);

            console.log('Attempting to delete image:', imagePath);

            try {
                // Check if the file exists before attempting to delete
                if (await fs.stat(imagePath)) {
                    try {
                        await fs.unlink(imagePath);
                        console.log('Image deleted successfully');
                    } catch (unlinkErr) {
                        console.error('Error deleting image:', unlinkErr);
                        return res.status(500).json({ error: 'Error deleting image from server' });
                    }
                } else {
                    console.log('Image file does not exist');
                }
            } catch (statErr) {
                console.error('Error accessing image file:', statErr);
                return res.status(500).json({ error: 'Error accessing image file on server' });
            }
        }

        // Remove the image path and upload date from the user record
        user.imagePath = null;
        await user.save();

        res.status(200).json({ message: 'Image and record updated successfully' });
    } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({ error: 'Error updating user record in the database' });
    }
};




module.exports.put_the_default_image = async (req, res, next) => {
    const id = req.userID.userID;
    try {
        // Find the user in the database
        const user = await Teacher.findByPk(id);

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
        const user = await Teacher.findByPk(userId);

        
        
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

        res.status(200).json('Password reset successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};


module.exports.delete_teacher = async (req, res, next) => {
    
    try {
        const  teacher_id = req.userID.userID;
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