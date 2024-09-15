const express = require('express');


const fileControlloer = require('../../controllers/mobile/homepage/file/file')
const authUser = require('../../controllers/mobile/auth/auth_controller_student');
const is_auth = require('../../middleware/is_auth');
const profileControlloer = require('../../controllers/mobile/homepage/profile/profile');
const walletControlloer = require('../../controllers/mobile/homepage/wallet/wallet');
const noteControlloer = require('../../controllers/mobile/homepage/note/note');
const examContoroller = require('../../controllers/mobile/homepage/exam/exam');
const feedbackController = require('../../controllers/mobile/homepage/feedback/feedback');
const reportController = require('../../controllers/mobile/homepage/report/report');


const router = express.Router();


// auth routes:

router.post('/register',authUser.register);
 router.post('/login', authUser.Login);
 router.post('/logout',is_auth, authUser.Logout);
 router.post('/forgot-password', authUser.forget_password);
 router.post('/check-code', authUser.check_code);
 router.post('/reset-password', authUser.reset_password);
 router.get('/getClass',authUser.getClasses);

// file routes:

//  router.get('/get_all_subjects',fileControlloer.get_all_subjects);
 router.post('/get_subjects',fileControlloer.get_subjects);
 router.post('/get_teacher_unsubscribe',is_auth,fileControlloer.get_teacher_unsubscribe);
 router.post('/get_teacher_subscribe',is_auth,fileControlloer.get_subscribed_teachers);
 router.post('/read',is_auth,fileControlloer.read);
 router.post('/un_read',is_auth,fileControlloer.un_read);
 router.post('/get_not_read',is_auth,fileControlloer.get_not_read);
 router.get('/get_is_read',is_auth,fileControlloer.get_is_read);
 router.post('/get_video',is_auth,fileControlloer.get_video);
 router.post('/get_file',is_auth,fileControlloer.get_file);


// profile routes:

router.get('/getInfo', is_auth , profileControlloer.getInfo);
router.post('/editprofile', is_auth , profileControlloer.editprofile);
router.post('/upload_image',is_auth,profileControlloer.upload_image);
router.delete('/delete_image',is_auth,profileControlloer.delete_image);
router.get('/put_the_default_image',is_auth,profileControlloer.put_the_default_image);

router.post('/reset-password-profile',is_auth, profileControlloer.reset_password_profile);
router.get('/delete_my_account',is_auth, profileControlloer.delete_my_account);


// wallet routes:
router.post('/send_check', is_auth , walletControlloer.send_check);
router.post('/delete_check', is_auth , walletControlloer.delete_check);
router.post('/subscribe', is_auth , walletControlloer.subscribe);
router.get('/get_wallet', is_auth , walletControlloer.get_wallet);


// note routes:
router.get('/show_note', is_auth , noteControlloer.show_note);
router.post('/add_note', is_auth , noteControlloer.add_note);
router.post('/edit_note', is_auth , noteControlloer.edit_note);
router.post('/delete_note', is_auth , noteControlloer.delete_note);


// exam routes:
router.post('/get_exam', is_auth , examContoroller.getExams);
router.post('/getExamQuestions', is_auth , examContoroller.getExamQuestions);
router.post('/store_grade', is_auth , examContoroller.store_grade);
router.post('/show_grade', is_auth , examContoroller.show_grade);


//feedback rotes:
router.get('/getTeacherforFeedback', is_auth , feedbackController.getTeacherforFeedback);
router.post('/geSubjectforFeedback', is_auth , feedbackController.geSubjectforFeedback);
router.post('/feedback', is_auth , feedbackController.feedback);


//report routes:
router.post('/report', is_auth , reportController.report);
router.get('/showReport', is_auth , reportController.showReport);
router.delete('/deleteReport', is_auth , reportController.deleteReport);




module.exports = router;
