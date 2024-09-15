const express = require('express');

const authTeacher = require('../../../controllers/web/teacher/auth/auth_controller_teacher');
const profileController = require('../../../controllers/web/teacher/profile/profile');
const fileController = require('../../../controllers/web/teacher/premissions/file/file');
const examContoroller = require('../../../controllers/web/teacher/premissions/exam/exam');
const infoController = require('../../../controllers/web/teacher/premissions/information/information');
const reportController = require('../../../controllers/web/teacher/premissions/report/report');
const videoController = require('../../../controllers/web/teacher/premissions/video/video');

const is_auth = require('../../../middleware/is_auth');
const is_valid = require('../../../middleware/is_valid');

const router = express.Router();


// auth routes:

router.post('/login', authTeacher.Login);
router.post('/logout',is_auth, authTeacher.Logout);
router.post('/forgot-password', authTeacher.forget_password);
router.post('/check-code', authTeacher.check_code);
router.post('/reset-password', authTeacher.reset_password);


// file routes:
router.post('/upload_file',is_auth,is_valid,fileController.upload_file);
router.post('/delete_file',is_auth,is_valid,fileController.delete_file);


// profile routes:

router.get('/getInfo', is_auth,is_valid , profileController.getInfo);
router.post('/editprofile', is_auth,is_valid , profileController.editprofile);
router.post('/upload_image',is_auth,is_valid,profileController.upload_image);
router.delete('/delete_image',is_auth,is_valid,profileController.delete_image);
router.post('/reset-password-profile',is_auth,is_valid, profileController.reset_password_profile);
router.get('/delete_my_account',is_auth,is_valid,profileController.delete_teacher);
router.get('/put_the_default_image',is_auth,profileController.put_the_default_image);

// exam routes:

router.post('/createQuestion',is_auth,is_valid,examContoroller.createQuestion);
router.post('/createExam',is_auth,is_valid,examContoroller.createExam);
router.delete('/deleteExam',is_auth, is_valid,examContoroller.deleteExam);
router.delete('/deleteQuestion', is_auth,is_valid,examContoroller.deleteQuestion);
router.post('/showQuestionForCreatingExam', is_auth,is_valid,examContoroller.showQuestionForCreatingExam);
router.post('/showAllQuestionForSubject', is_auth,is_valid,examContoroller.showAllQuestionForSubject);
router.post('/getExams', is_auth,is_valid,examContoroller.getExams);


//information routes:
router.get('/get_class', is_auth,is_valid , infoController.get_class);
router.post('/get_subjects', is_auth,is_valid , infoController.get_subjects);
router.post('/get_files', is_auth,is_valid , infoController.get_files);
router.post('/get_videos', is_auth,is_valid , infoController.get_videos);



//report routes:
router.post('/report', is_auth ,is_valid, reportController.report);
router.get('/showReport', is_auth , is_valid,reportController.showReport);
router.delete('/deleteReport', is_auth , is_valid,reportController.deleteReport);

//video routes:

router.post('/upload_video',is_auth,is_valid,videoController.upload_video);
router.post('/delete_video',is_auth,is_valid,videoController.delete_video);


module.exports = router;