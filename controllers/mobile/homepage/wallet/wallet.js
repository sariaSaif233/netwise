const Wallet = require('../../../../models/wallet.js');
const Check=require('../../../../models/check.js');
const Student=require('../../../../models/students.js');
const Subscribe=require('../../../../models/subscribe.js');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const Teacher = require('../../../../models/teachers.js');
const Sub_teach = require('../../../../models/sub_teach.js');
const Manager = require('../../../../models/managers.js');






const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const id = req.userID.userID;
            const uploadPath = path.join(__dirname, `../../../../images/Checks/${id}`);
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

module.exports.send_check = async (req, res, next) => {
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
            let price = req.body.price;
            
            price = parseFloat(price);
            console.log(price);
            if (!price) {
                return res.status(400).json({ error: 'Price is required' });
            }
        
            if (typeof price !== 'number' || isNaN(price) || price <= 0) {
                return res.status(400).json({ error: 'Invalid price' });
            }
            
            const fileUrl = `${req.protocol}://${req.get('host')}/images/Checks/${req.userID.userID}/${req.file.filename}`;   
            const checks = await Check.create({
                imagePath: fileUrl,
                price: price,
                studentId:req.userID.userID,
                uploadDate: new Date()
            });
            res.status(200).json({ message: 'Check submitted successfully', checks });
        } catch (dbError) {
            console.error('Database error:', dbError);
            res.status(500).json({ error: 'Error saving file information to the database' });
        }
    });
};

module.exports.subscribe = async (req, res, next) => {
    const  userID  = req.userID.userID;
    const teacherId=req.body.teacher_id;
    const subjectId=req.body.subject_id;
   
    try {
        // Create subscription
        const subscribe = await Subscribe.create({ teacherId:teacherId, studentId: userID , subjectId:subjectId });

        // Fetch teacher details
        const teacher = await Teacher.findOne({ where: { id: teacherId } });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Fetch subject-teacher relationship
        const subTeach = await Sub_teach.findOne({ where: { teacherId, subjectId } });
        if (!subTeach) {
            return res.status(404).json({ message: 'Subject or teacher association not found' });
        }

        ;
        const salary=subTeach.salary;
        const percentage=subTeach.precntage;
        console.log(percentage);
        // Fetch student details
        const student = await Student.findOne({ where: { id: userID } });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        
        const  walletStudentId= student.walletId;  
        
        
        // Fetch student's wallet details
        const walletStudent = await Wallet.findOne({ where: { id: walletStudentId } });
        if (!walletStudent) {
            return res.status(404).json({ message: 'Student wallet not found' });
        }

        // Check if student has sufficient funds before deducting
        if (walletStudent.price < salary) {
            return res.status(400).json({ message: 'Insufficient funds' });
        }

        // Deduct the salary from student's wallet
        walletStudent.price -= salary;
        await walletStudent.save();

        // Calculate amounts for teacher and admin
        const amountTeacher = (salary * percentage) / 100;
      
        const amountAdmin = salary - amountTeacher;

        // Fetch teacher's wallet details
        const walletTeacher = await Wallet.findOne({ where: { id: teacher.walletId } });
        if (!walletTeacher) {
            return res.status(404).json({ message: 'Teacher wallet not found' });
        }

        walletTeacher.price += amountTeacher;
        await walletTeacher.save();

        // Fetch manager details
        const manager = await Manager.findOne({ where: { isSuperAdmin: 1 } });
        if (!manager) {
            return res.status(404).json({ message: 'Manager not found' });
        }

        // Fetch manager's wallet details
        const walletManager = await Wallet.findOne({ where: { id: manager.walletId } });
        if (!walletManager) {
            return res.status(404).json({ message: 'Manager wallet not found' });
        }

        walletManager.price += amountAdmin;
        await walletManager.save();

        // Return success response
        res.status(200).json({ message: 'Subscription successful' });

    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports.get_wallet = async (req, res, next) => {
    const studentId= req.userID.userID;

    try {  
    const student = await Student. findOne({ 
        where: { id: studentId } });  

        const wallet_Id= student.walletId;

        const wallet = await Wallet. findOne({ 
            where: { id: wallet_Id } });
            const price= wallet.price;

            if(!price){
                res.status(404).json({message:'You dont have points'});
            }

            res.status(200).json({message:`Your points is :${price}`});
    }

 catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
}
};

module.exports.delete_check = async (req, res, next) => {
    const checkId= req.body.checkId;

    try {  
    const check = await Check. findOne({ 
        where: { id: checkId } }); 

        await check.destroy();
        res.status(200).json({message:'Check deleted successfully ' });

    }
        catch (error) {
            // Handle errors
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
        };
        