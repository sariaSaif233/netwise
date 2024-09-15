
const Student = require('../../../../models/students.js');
const Teacher = require('../../../../models/teachers.js');
const Subscribe = require('../../../../models/subscribe.js');
const Feedback = require('../../../../models/feedback.js');
const Subteach = require('../../../../models/sub_teach.js');
const Subject = require('../../../../models/subjects.js');


module.exports.geSubjectforFeedback = async (req, res, next) => {
  try {
    // Extract teacherId from request body and studentId from user object
    const teacherId = req.body.teacherId;
    const studentId = req.userID.userID;
    
    // Fetch the student details to get the classId
    const student = await Student.findOne({
      where: {
        id: studentId
      }
    });

    // Ensure student exists
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const classId = student.classId;

    // Fetch all subjects taught by the teacher
    const subTeach = await Subteach.findAll({
      where: {
        teacherId: teacherId
      }
    });

    // Extract subjectIds from subTeach records
    const subjectIds = subTeach.map(st => st.subjectId);

    // Fetch subjects that match the extracted subjectIds and have the same classId
    const subjects = await Subject.findAll({
      where: {
        id: subjectIds,
        classId: classId,
        deleted_at: null
      }
    });

    // Extract the subjectIds from the subjects found
    const subjectIdsFiltered = subjects.map(subject => subject.id);

    // Fetch subscriptions for the student for the filtered subjects
    const subscriptions = await Subscribe.findAll({
      where: {
        studentId: studentId,
        subjectId: subjectIdsFiltered
      }
    });

    // Extract subscribed subjectIds
    const subscribedSubjectIds = subscriptions.map(sub => sub.subjectId);

    // Filter subjects to only include those that are in the Subscribe table
    const finalSubjects = subjects.filter(subject => subscribedSubjectIds.includes(subject.id));

    // Respond with the filtered subjects
    res.status(200).json(finalSubjects);
  } catch (error) {
    // Handle errors
    console.error('Error fetching subjects for feedback:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports.getTeacherforFeedback = async (req, res, next) => {
const studentId=req.userID.userID;
    try{
        const subscribe = await Subscribe.findAll({
            where:{
                studentId:studentId
            },
             attributes: ['teacherId'],
        
        })  
        const teacherIds = subscribe.map(st => st.teacherId);
  
      if (teacherIds.length === 0) {
        return res.status(404).json({ error: 'No teachers found for that student' });
      }
  
      const teachers = await Teacher.findAll({
        where: { id: teacherIds,valid:1 }
      });
  
      if (teachers.length === 0) {
        return res.status(404).json({ error: 'No teachers found matching the criteria' });
      }
  
      res.json(teachers);
    } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'An error occurred while fetching teachers' });
          }
}


module.exports.feedback = async (req, res, next) => {
    const studentId = req.userID.userID;
    
    const { teacherOpinion, courseOpinion, rate, notes, teacherId,subjectId } = req.body;

    // Validate required fields
    if (!teacherOpinion || !courseOpinion) {
        return res.status(400).json({ error: 'teacherOpinion and courseOpinion are required' });
    }

    // Validate the rate to be between 1 and 5 or null
    if (rate !== null && (typeof rate !== 'number' || rate < 1 || rate > 5)) {
        return res.status(400).json({ error: 'Rate must be a number between 1 and 5 or null' });
    }

    try {
        // Create the feedback entry
        const feedback = await Feedback.create({
            teacherOpinion: teacherOpinion,
            courseOpinion: courseOpinion,
            rate: rate,
            notes: notes,
            studentId: studentId,
            teacherId: teacherId,
            subjectId:subjectId
        });

        // Send a success response
        res.status(201).json({ message: 'Feedback sent' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while sending feedback' });
    }
};
