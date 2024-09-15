const express = require('express');

const authAdmin = require('../../../controllers/web/admin/auth/auth_controller_admin');
const profileControlloer = require('../../../controllers/web/admin/porfile/profile');
const insertionControlloer = require('../../../controllers/web/admin/premissions/insertion');
const walletConrtoller = require('../../../controllers/web/admin/premissions/wallet');
const infoController = require('../../../controllers/web/admin/premissions/information');
const deleteController = require('../../../controllers/web/admin/premissions/delete');
const feedbackController = require('../../../controllers/web/admin/premissions/feedback');
const reportController = require('../../../controllers/web/admin/premissions/report');

const is_auth = require('../../../middleware/is_auth');

const router = express.Router();


// auth routes:


router.post('/login', authAdmin.Login);
router.post('/logout',is_auth, authAdmin.Logout);
router.post('/forgot-password', authAdmin.forget_password);
router.post('/check-code', authAdmin.check_code);
router.post('/reset-password', authAdmin.reset_password);


// insertion routes:
router.post('/addClass',is_auth,insertionControlloer.AddClass);
router.post('/addSubject',is_auth,insertionControlloer.AddSubject);
router.post('/addTeacher',is_auth,insertionControlloer.addTeacher);
router.post('/addAdmin',is_auth,insertionControlloer.addAdmin);
router.post('/getTeacherToInsert',is_auth,insertionControlloer.getTeacherToInsert);
router.post('/addTeacherToAnotherSubject',is_auth,insertionControlloer.addTeacherToAnotherSubject);
router.post('/modifyToValid',is_auth,insertionControlloer.modifyToValid);


// deletion routes:
router.post('/delete_teacher',is_auth,deleteController.delete_teacher);
router.post('/soft_delete_subject',is_auth,deleteController.soft_delete_subject);
router.post('/deleteTeacherFromSubjcet',is_auth,deleteController.deleteTeacherFromSubjcet);
router.post('/soft_delete_class',is_auth,deleteController.soft_delete_class);
router.post('/deleteAdmin',is_auth,deleteController.deleteAdmin);
router.delete('/deleteMyAccount',is_auth,deleteController.deleteMyAccount);
router.delete('/delete_files',is_auth,deleteController.delete_files);
router.delete('/delete_videos',is_auth,deleteController.delete_videos);





//information routes:
router.post('/get_subjects',is_auth,infoController.get_subjects);
router.get('/getClasses',is_auth,infoController.getClasses);
router.post('/get_teacher',is_auth,infoController.get_teacher);
router.get('/get_Admin',is_auth,infoController.get_Admin);
router.post('/search_teacher',is_auth,infoController.search_teacher);
router.post('/get_files',is_auth,infoController.get_files);
router.post('/get_videos',is_auth,infoController.get_videos);
router.post('/get_Statistics',is_auth,infoController.get_Statistics);
router.get('/get_All_teacher',is_auth,infoController.get_All_teacher);


// profile routes:

router.get('/getInfo', is_auth , profileControlloer.getInfo);
router.post('/editprofile', is_auth , profileControlloer.editprofile);
router.post('/upload_image',is_auth,profileControlloer.upload_image);
router.delete('/delete_image',is_auth,profileControlloer.delete_image);
router.post('/reset-password-profile',is_auth, profileControlloer.reset_password_profile);
router.get('/put_the_default_image',is_auth,profileControlloer.put_the_default_image);

// wallet routes:

router.get('/get_check', is_auth ,walletConrtoller.get_check);
router.post('/approve_check', is_auth ,walletConrtoller.approve_check);

//feedback routes:

router.post ('/getFeedback', is_auth ,feedbackController.getFeedback);
router.get ('/getAllTeacherFeedback', is_auth ,feedbackController.getAllTeacherFeedback);
router.post ('/deleteFeedback', is_auth ,feedbackController.deleteFeedback);

//report routes:
router.get ('/showReports', is_auth ,reportController.showReports);

module.exports = router;