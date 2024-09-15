const Subject = require('../../../../../models/subjects.js');
const Teacher = require('../../../../../models/teachers.js');
const Exam = require('../../../../../models/exams.js');
const Question = require('../../../../../models/questions.js');
const Answer = require('../../../../../models/answers.js');
const ExamQuestion = require('../../../../../models/exam_question.js');
const Op=require('sequelize')


module.exports.createQuestion = async (req, res, next) => {

    const teacherId = req.userID.userID;
    const { question, answers, rightAnswer, level, subjectID } = req.body;
  
    try {

      const subject = await Subject.findOne({
        where: {
            id: subjectID,
            deleted_at: null
        }
    });

    if (!subject) {
        return res.status(404).json({ error: 'The subject does not exist or has been soft-deleted.' });
    }

    if (!answers.includes(rightAnswer)) {
            return res.status(400).json({ error: 'The right answer must be one of the provided answers.' });
      }
      // Create the question
      const newQuestion = await Question.create({
        question_text: question,
        difficulty: level,
        subjectId: subjectID,  
        teacherId:teacherId 
       });
  
      // Create answers
      for (let i = 0; i < answers.length; i++) {
        const isCorrect = answers[i] === rightAnswer;
        await Answer.create({
          questionId: newQuestion.id,
          answer_text: answers[i],
          is_correct: isCorrect
        });
      }
  
      res.status(201).json({ message: 'Question and answers created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the question and answers' });
    }
  }
  

  
  
  



module.exports.createExam = async (req, res, next) => {
    const { subject_id, level, questionIDs ,name } = req.body;
    const teacherID = req.userID.userID; 
    console.log(subject_id,name);
    try {

    // Check if the subject is soft-deleted
    const subject = await Subject.findOne({
      where: {
          id: subject_id,
          deleted_at:null
      }
    });

    if (!subject) {
      return res.status(404).json({ error: 'The subject does not exist or has been soft-deleted.' });
    }

      // Create the exam
      const exam = await Exam.create({
        subjectId: subject_id,
        teacherId: teacherID,
        level: level,
        name:name
      });
  
      // Add selected questions to the exam
      for (let i = 0; i < questionIDs.length; i++) {
        await ExamQuestion.create({
          examId: exam.id,
          questionId: questionIDs[i],
        });
      }
  
      res.status(201).json({ message: 'Exam created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while creating the exam' });
    }
  }




  module.exports.deleteExam = async (req, res, next) => {
    const  examID  = req.body.exam_id;
  
    try {
      const exam = await Exam.findByPk(examID);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
  
      // Delete related entries in the ExamQuestion table
      await ExamQuestion.destroy({ where: { examId: examID } });
  
      // Delete the exam
      await Exam.destroy({ where: { id: examID } });
  
      res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while deleting the exam' });
    }
  };
  
  
  
  module.exports.deleteQuestion = async (req, res, next) => {
    const  questionID  = req.body.question_id;
  
    try {
      const question = await Question.findByPk(questionID);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
  
      // Delete related entries in the ExamQuestion table
      await ExamQuestion.destroy({ where: { questionId: questionID } });
  
      // Delete related entries in the Answer table
      await Answer.destroy({ where: { questionId: questionID } });
  
      // Delete the question
      await Question.destroy({ where: { id: questionID } });
  
      res.status(200).json({ message: 'Question deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while deleting the question' });
    }
  };
  

  
  module.exports.showQuestionForCreatingExam = async (req, res, next) => {
    const teacherID = req.userID.userID;
    const { difficulty, subjectID } = req.body;
  
    // Validate request body
    if (!difficulty || !subjectID) {
      return res.status(400).json({ error: 'difficulty and subjectID are required' });
    }
      
    try {

      let questions;
      if (difficulty=="Normal"){

       questions = await Question.findAll({
          where: {
            teacherId: teacherID,
            subjectId: subjectID
          }
        });

      }
       
    else{
      questions = await Question.findAll({
        where: {
          teacherId: teacherID,
          subjectId: subjectID,
          difficulty: difficulty
        }
      });
    }
      if (questions.length === 0) {
        return res.status(404).send('Questions not found');
      }
      res.status(200).json(questions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
  

 
   
  module.exports.showAllQuestionForSubject = async (req, res, next) => {
    const teacherID = req.userID.userID;
    const {  subjectID} = req.body;
  
    // Validate request body
    if (!subjectID) {
      return res.status(400).json({ error: ' subjectID is required' });
    }
      
    try {

     const questions = await Question.findAll({
        where: {
          teacherId: teacherID,
          subjectId: subjectID,
          }
      });
    
      if (questions.length === 0) {
        return res.status(404).send('Questions not found');
      }
      res.status(200).json(questions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
  

 

  module.exports.getExams = async (req, res, next) => {
    const { subject_id } = req.body;
    const teacher_id=req.userID.userID;
    try {
      const exams = await Exam.findAll({
        where: {
          subjectId: subject_id,
          teacherId: teacher_id,
        },
      });
  
      res.status(200).json(exams);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching the exams' });
    }
  }

  