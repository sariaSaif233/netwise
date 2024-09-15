
const Feedback = require('../../../../models/feedback');
const Teacher = require('../../../../models/teachers');
const Student = require('../../../../models/students');
const Subject = require('../../../../models/subjects');
const Class = require('../../../../models/classes');

module.exports.getFeedback = async (req, res, next) => { 
    const { teacherId } = req.body; // Destructure teacherId from the request body

    try {
        // Fetch feedbacks for the given teacher
        const feedbacks = await Feedback.findAll({
            where: { teacherId: teacherId }
        });

        if (!feedbacks.length) {
            return res.status(404).json({ error: 'Teacher does not have feedback' });
        }
        
        // Extract studentIds and subjectIds from feedbacks
        const studentIds = feedbacks.map(fb => fb.studentId);
        const subjectIds = feedbacks.map(fb => fb.subjectId);
        // console.log("11212",studentIds)

        // Fetch student details for the extracted studentIds
        const students = await Student.findAll({
            where: { id: studentIds },
            attributes: ['id', 'name'] // Include id to map the feedback
        });

        // Create a map of studentId to student name for quick lookup
        const studentMap = {};
        students.forEach(student => {
            studentMap[student.id] = student.name;

        });

        // Fetch subject details for the extracted subjectIds
        const subjects = await Subject.findAll({
            where: { id: subjectIds },
            attributes: ['id', 'name', 'classId'] // Include classId to fetch class details
        });

        // Create a map of subjectId to subject name and classId for quick lookup
        const subjectMap = {};
        subjects.forEach(subject => {
            subjectMap[subject.id] = { name: subject.name, classId: subject.classId };

        });

        // Extract classIds from subjects
        const classIds = subjects.map(sub => sub.classId);

        // Fetch class details for the extracted classIds
        const classes = await Class.findAll({
            where: { id: classIds },
            attributes: ['id', 'name'] // Include id to map the subjects
        });

        // Create a map of classId to class name for quick lookup
        const classMap = {};
        classes.forEach(classObj => {
            classMap[classObj.id] = classObj.name;
        });

        // Combine feedback with corresponding student names, subject names, and class names
        const feedbackWithDetails = feedbacks.map(feedback => {
            const subject = subjectMap[feedback.subjectId];
            return {
                ...feedback.dataValues, // Include all feedback fields
                studentName: studentMap[feedback.studentId], // Add student name
                subjectName: subject.name, // Add subject name
                className: classMap[subject.classId] // Add class name
            };
        });

        // Send the combined data in the response
        res.status(200).json(feedbackWithDetails);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching feedback' });
    }
};

module.exports.deleteFeedback = async (req, res, next) => { 
const id = req.body.id;
try{
const feedback = await Feedback.findOne({
    where:{
        id:id
    }
})
if(!feedback){
    res.status(500).json({ error: 'Feedback not found' });    
}
await feedback.destroy();
res.status(200).json({message: 'Deleted successfully'});


}catch(error){
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching feedback' });
}
}
module.exports.getAllTeacherFeedback = async (req, res, next) => { 

    try{
         
        const teacher = await Teacher.findAll();

     if(!teacher){

        res.status(500).json({ error: 'Teacher Not Found' });
     }

     res.status(200).json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching feedback' });
    }}

