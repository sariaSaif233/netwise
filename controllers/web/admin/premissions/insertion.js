
const sub_teach = require('../../../../models/sub_teach');
const class_teach = require('../../../../models/class_teach');
const Class = require('../../../../models/classes');
const Subject = require('../../../../models/subjects');
const Manager = require('../../../../models/managers');
const Wallet = require('../../../../models/wallet');
const Teacher = require('../../../../models/teachers');
const Subteach = require('../../../../models/sub_teach');
const bcrypt = require('bcrypt');
const mail = require('../../../../services/Mails');
const { Op } = require('sequelize');


module.exports.AddClass = async (req, res, next) => {
    const { name, section } = req.body;

    try {
        // Check if the class with the given name and section exists
        const existingClass = await Class.findOne({
            where: {
                name,
                section
            }
        });

        if (existingClass) {
            if (existingClass.deleted_at) {
                // Unsoft delete the class if it is soft-deleted
                existingClass.deleted_at = null;
                await existingClass.save();

                // Find and unsoft delete related subjects
                const relatedSubjects = await Subject.findAll({
                    where: {
                        classId: existingClass.id,
                        deleted_at:  null
                        
                    }
                });

                if (relatedSubjects.length > 0) {
                    for (const subject of relatedSubjects) {
                        subject.deleted_at = null;
                        await subject.save();
                    }
                }

                return res.status(200).json({ message: 'Class and related subjects unsoft deleted successfully' });
            } else {
                // Return a message if the class already exists and is not soft-deleted
                return res.status(409).json({ message: 'Class already exists' });
            }
        } else {
            // Create a new class if it doesn't exist
            await Class.create({ name, section });
            return res.status(201).json({ message: 'Class created successfully' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while adding the class' });
    }
};

module.exports.AddSubject = async (req, res, next) => {
    const { name, class_id } = req.body;

    try {
        // Check if the subject with the given name and class_id exists
        const existingSubject = await Subject.findOne({
            where: {
                name,
                classId: class_id
            }
        });

        if (existingSubject) {
            if (existingSubject.deleted_at) {
                // Unsoft delete the subject if it is soft-deleted
                existingSubject.deleted_at = null;
                await existingSubject.save();
                return res.status(200).json({ message: 'Subject unsoft deleted successfully' });
            } else {
                // Return a message if the subject already exists and is not soft-deleted
                return res.status(409).json({ message: 'Subject already exists' });
            }
        } else {
            // Create a new subject if it doesn't exist
            await Subject.create({ name, classId: class_id });
            return res.status(201).json({ message: 'Subject created successfully' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while adding the subject' });
    }
};



module.exports.addAdmin = (req, res, next) => {
    try {
        const username = req.body.name;
        const password =  req.body.password;
        const email = req.body.email;
        const phoneNumber = req.body.phoneNumber;

    
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const defaultImagePath = `${baseUrl}/defaultImage/accountImage.jpg`;

        bcrypt.hash(password, 12).then(hashpassword=>{
            
            Manager.create({ name:username, password: hashpassword , email : email, phoneNumber:phoneNumber,imagePath:defaultImagePath});
        }).catch(err => {
            console.log(err);
        });

        mail(email,'You\'ve regestered successfully !');

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while registering user' });
    }
};



module.exports.addTeacher = async (req, res, next) => {
    try {
        const { name, password, email, subject_id, class_id, phoneNumber, salary , precntage } = req.body;
        const wallet=await Wallet.create();

        const wallet_id=wallet.id;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Validate phone number
        if (!/^(09)\d{8}$/.test(phoneNumber)) {
            return res.status(400).json({ message: 'Phone number should start with "09" and be 10 digits long' });
        }

        // Check if email already exists
        const existingEmail = await Teacher.findOne({ where: { email: email } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Check if phone number already exists
        const existingPhoneNumber = await Teacher.findOne({ where: { phoneNumber: phoneNumber } });
        if (existingPhoneNumber) {
            return res.status(400).json({ message: 'Phone number is already registered' });
        }

        // Check if class_id exists
        const classExists = await Class.findByPk(class_id);
        if (!classExists) {
            return res.status(400).json({ message: 'Class ID not found' });
        }

        // Check if subject_id exists
        const subjectExists = await Subject.findByPk(subject_id);
        if (!subjectExists) {
            return res.status(400).json({ message: 'Subject ID not found' });
        }
        if(subjectExists.deleted_at!=null){
            return res.status(400).json({ message: 'This subject is sof deleted' });
        }
        // Create new teacher
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        
        const defaultImagePath = `${baseUrl}/defaultImage/accountImage.jpg`;
        const newTeacher = await Teacher.create({ name:name, password: hashedPassword, email:email, phoneNumber:phoneNumber, walletId:wallet_id, imagePath:defaultImagePath});

        const teacherId = newTeacher.id;

        // Create associations
        await sub_teach.create({ subjectId: subject_id , teacherId: teacherId , precntage:precntage , salary:salary });
        await class_teach.create({ classId: class_id, teacherId: teacherId });

        // Send registration email
        await mail(email, 'You\'ve registered successfully!');

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while registering user' });
    }
};


module.exports.getTeacherToInsert = async (req, res, next) => {
    const subjectId = req.body.subject_id;

    try {
        // Fetch all teachers who teach the specified subject
        const subTeachRecords = await Subteach.findAll({
            where: { subjectId: subjectId },
            attributes: ['teacherId']
        });

        // Extract the teacherIds from the Subteach records
        const teacherIds = subTeachRecords.map(record => record.teacherId);

        // Fetch all teachers excluding those who teach the specified subject
        const teachers = await Teacher.findAll({
            where: {
                id: {
                    [Op.notIn]: teacherIds
                }
                ,valid:1
            }
        });

        // Respond with the filtered teachers
        res.status(200).json(teachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ error: 'An error occurred while fetching teachers' });
    }
};


module.exports.addTeacherToAnotherSubject = async (req, res, next) => {
    const { teacherId, subjectId } = req.body;

    try {
        // Validate if teacherId and subjectId are provided
        if (!teacherId || !subjectId) {
            return res.status(400).json({ error: 'teacherId and subjectId are required' });
        }

        // Optionally, you can validate if the teacher and subject exist in the database
        const teacher = await Teacher.findByPk(teacherId);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        const subject = await Subject.findByPk(subjectId);
        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Create a new Subteach record
        const subTeach = await Subteach.create({
            teacherId: teacherId,
            subjectId: subjectId
        });

        // Respond with the created subTeach record
        res.status(200).json(subTeach);
    } catch (error) {
        console.error('Error adding teacher to another subject:', error);
        res.status(500).json({ error: 'An error occurred while adding the teacher to the subject' });
    }
};


module.exports.modifyToValid = async (req, res, next) => {
try{
   const teacherId = req.body.teacherId;
    const teacher= await Teacher.findOne({
        where:{
            id:teacherId
        }
    })
    teacher.valid=1;
    teacher.save();
    return res.status(201).json({ message: 'This teacher is valid now' });
}
catch (error) {
        console.error('Error adding teacher to another subject:', error);
        res.status(500).json({ error: 'An error occurred while adding the teacher to the subject' });
    }};