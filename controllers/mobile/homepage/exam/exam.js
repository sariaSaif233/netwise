const Teacher = require('../../../../models/teachers.js')
const Sub_teach=require('../../../../models/sub_teach.js');
const Subject = require('../../../../models/subjects.js');
const Exam = require('../../../../models/exams.js');
const Question = require('../../../../models/questions.js');
const Answer = require('../../../../models/answers.js');
const ExamQuestion = require('../../../../models/exam_question.js');
const Grade = require('../../../../models/grade.js');
const sequelize = require('../../../../util/database.js');



module.exports.getExams = async (req, res, next) => {
    const { subject_id, level, teacher_id } = req.body;
    
    try {
      const exams = await Exam.findAll({
        where: {
          subjectId: subject_id,
          level: level,
          teacherId: teacher_id,
        },
      });
  
      res.status(200).json(exams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching the exams' });
    }
  }


  module.exports.getExamQuestions = async (req, res, next) => {
    const  examID  = req.body.exam_id;
  
    try {
      const exam = await Exam.findByPk(examID);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
  
      const examQuestions = await ExamQuestion.findAll({
        where: { examId: examID },
      });
  
      const questionIds = examQuestions.map(eq => eq.questionId);
  
      const questions = await Question.findAll({
        where: { id: questionIds },
      });
  
      const answers = await Answer.findAll({
        where: { questionId: questionIds },
      });
  
      const formattedQuestions = questions.map(question => {
        return {
          questionId: question.id,
          questionText: question.question_text,
          answers: answers.filter(answer => answer.questionId === question.id),
        };
      });
  
      res.status(200).json(formattedQuestions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching the questions' });
    }
  };
  


  // module.exports.get_teacher = async (req, res, next) => {
  //   try {
  //     const subjectId = req.body.subjectId;
  
  //     const subjects = await Subject.findByPk(subjectId);
  
  //     if (!subjects) {
  //       return res.status(404).json({ error: 'subject not found' });
  //     }
  
  //     const subTeaches = await Sub_teach.findAll({
  //       where: { subjectId: subjectId },
  //       attributes: ['teacherId'],
  //     });
       
  //     const teacherIds = subTeaches.map(st => st.teacherId);
  
  //     if (teacherIds.length === 0) {
  //       return res.status(404).json({ error: 'No teachers found for this subject' });
  //     }
  
  //     const teachers = await Teacher.findAll({
  //       where: { id: teacherIds }
  //     });
  
  //     if (teachers.length === 0) {
  //       return res.status(404).json({ error: 'No teachers found matching the criteria' });
  //     }
  
  //     res.json(teachers);
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ error: 'An error occurred while fetching teachers' });
  //   }
  // };


  module.exports.store_grade = async (req, res, next) => {
    const studentID = req.userID.userID;
    const { examID, mark } = req.body;
  
    if (!examID || !mark) {
      return res.status(400).json({ error: 'examID and mark are required' });
    }
  
    try {

      const grade = await Grade.create({
        studentId:studentID,
        examId:examID,
        mark:mark,
      });
     
      res.status(200).json(grade);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }



  module.exports.show_grade = async (req, res, next) => {
    const studentID = req.userID.userID;
    const { subject_id } = req.body;
  
    // Validate request body
    if (!subject_id) {
      return res.status(400).json({ error: 'subject_id is required' });
    } 
  
    try {
      // Retrieve exams for the specified subject
      const exams = await Exam.findAll({
        where: {
          subjectId: subject_id
        }
      });
  
      if (exams.length === 0) {
        return res.status(404).json({ error: 'No exams found for the specified subject' });
      }
  
      // Extract exam IDs from the retrieved exams
      const examIds = exams.map(exam => exam.id);
  
      // Retrieve grades for the student for the specified exam IDs
      const grades = await Grade.findAll({
        where: {
          studentId: studentID,
          examId: examIds
        }
      });
  
      if (grades.length === 0) {
        return res.status(404).json({ error: 'No grades found for the specified exams' });
      }
  
      // Combine grades and exams in the response
      const result = grades.map(grade => {
        const exam = exams.find(exam => exam.id === grade.examId);
        return {
          grade,
          exam
        };
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  };
  