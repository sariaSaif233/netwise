const express = require('express');
const sequelize = require('./util/database');
const mobileRoutes = require('./routes/mobile/student');
const adminRoutes = require('./routes/web/admin/admin');
const teacherRoutes = require('./routes/web/teacher/teacher');

const path = require('path');

const fileUpload = require('express-fileupload');

const app = express();
const Student = require('./models/students');
const Teacher = require('./models/teachers');
const Manager = require('./models/managers');
const Subject = require('./models/subjects');
const Class = require('./models/classes');
const Chapter = require('./models/chapters');
const sub_teach = require('./models/sub_teach');
const class_teach = require('./models/class_teach');
const wallet = require('./models/wallet');
const check = require('./models/check');
const note = require('./models/note');
const subscribe = require('./models/subscribe');
const Exam = require('./models/exams');
const Question = require('./models/questions');
const Answer = require('./models/answers');
const ExamQuestion  = require('./models/exam_question');
const Read = require('./models/read');
const grade = require('./models/grade');
const Feedback = require('./models/feedback');
const Report = require('./models/report');
const Video = require('./models/video');



const BP = require('body-parser');





app.use(BP.urlencoded({ extended: true }));
app.use(BP.json());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/web/teacher', teacherRoutes);
app.use('/web/admin', adminRoutes);
app.use('/mobile', mobileRoutes);


app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/defaultImage', express.static(path.join(__dirname, 'defaultImage')));


// relations DataBase

Class.hasMany(Student);
Student.belongsTo(Class);

Class.hasMany(Subject);
Subject.belongsTo(Class);

Teacher.belongsToMany(Subject, { through: sub_teach });
Subject.belongsToMany(Teacher, { through: sub_teach });


Teacher.belongsToMany(Class, { through: class_teach });
Class.belongsToMany(Teacher, { through: class_teach });


Chapter.belongsTo(sub_teach);
sub_teach.hasMany(Chapter);


Video.belongsTo(sub_teach);
sub_teach.hasMany(Video);


wallet.hasOne(Student);
Student.belongsTo(wallet);
wallet.hasOne(Teacher);
Teacher.belongsTo(wallet);
wallet.hasOne(Manager);
Manager.belongsTo(wallet);


Student.hasMany(check);
check.belongsTo(Student);

Student.hasMany(note);
note.belongsTo(Student);


Teacher.belongsToMany(Student, { through: subscribe }); 
Student.belongsToMany(Teacher, { through: subscribe });


Subject.hasMany(Exam);
Teacher.hasMany(Exam);
Exam.belongsTo(Subject);
Exam.belongsTo(Teacher);


Question.belongsTo(Subject);
Question.hasMany(Answer);
Question.belongsToMany(Exam, { through: ExamQuestion }); 
Exam.belongsToMany(Question, { through: ExamQuestion  });


Answer.belongsTo(Question);


Subject.hasMany(subscribe);
subscribe.belongsTo(Subject);


Teacher.hasMany(Question);
Question.belongsTo(Teacher);

Chapter.belongsToMany(Student, { through: Read }); 
Student.belongsToMany(Chapter, { through: Read });


Student.belongsToMany(Exam, { through: grade }); 
Exam.belongsToMany(Student, { through: grade });


Teacher.hasMany(Feedback);
Feedback.belongsTo(Teacher);

Student.hasMany(Feedback);
Feedback.belongsTo(Student);


Subject.hasMany(Feedback);
Feedback.belongsTo(Subject);

Student.hasMany(Report);
Report.belongsTo(Student);

Teacher.hasMany(Report);
Report.belongsTo(Teacher);


sequelize
//.sync({force:true})
.sync()
    .then(result => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });




