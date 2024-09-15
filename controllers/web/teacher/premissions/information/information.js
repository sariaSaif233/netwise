const Sub_teach = require('../../../../../models/sub_teach');
const class_teach = require('../../../../../models/class_teach');
const Class = require('../../../../../models/classes');
const Subject = require('../../../../../models/subjects');
const Teacher = require('../../../../../models/teachers');
const Chapter = require('../../../../../models/chapters');
const Video = require('../../../../../models/video');



module.exports.get_class = async (req, res, next) => {
  try {
    const teacherId = req.userID.userID;

    
    const teacher = await Teacher.findByPk(teacherId);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    
    const classTeach = await class_teach.findAll({
      where: { teacherId: teacherId },
      attributes: ['classId'],
    });


    const classIds = classTeach.map(tc => tc.classId);

    if (classIds.length === 0) {
      return res.status(404).json({ error: 'No classes found for this teacher' });
    }

    const classes = await Class.findAll({
      where: {
         id: classIds 
        }
    });

    res.json(classes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching classes' });
  }
};


module.exports.get_subjects = async (req, res, next) => {
    try {
      const teacherId = req.userID.userID;
      const classId = req.body.classId;
  
      const teacher = await Teacher.findByPk(teacherId);
  
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
  
      const classes = await Class.findByPk(classId);
  
      if (!classes) {
          return res.status(404).json({ error: 'class not found' });
        }
  
      const subTeaches = await sub_teach.findAll({
        where: { 
          teacherId: teacherId 
            },
        attributes: ['subjectId'],
      });
  
      const subjectIds = subTeaches.map(st => st.subjectId);
  
      if (subjectIds.length === 0) {
        return res.status(404).json({ error: 'No subjects found for this teacher' });
      }
  
  
      const subjects = await Subject.findAll({
        where: {
          id: subjectIds,
          classId: classId,
        }
      });
  
      if (subjects.length === 0) {
        return res.status(404).json({ error: 'No subjects found matching the criteria' });
      }
  
      res.json(subjects);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching subjects' });
    }
  };

  
module.exports.get_files = async (req, res, next) => {
  try {
      const subjectId = req.body.subjectId;
      const teacherId = req.userID.userID;
             
      const subTech = await Sub_teach.findOne({
          where: {
              subjectId: subjectId,
              teacherId: teacherId
          }
      });

      const subTech_id=subTech.id;

      // console.log(subTech_id);

      const chapter= await Chapter.findAll({
          where :{
              subTeachId: subTech_id
          }
      })
      res.json(chapter);
  }
   catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal server error');
  }

}



module.exports.get_videos = async (req, res, next) => {
  try {
      const subjectId = req.body.subjectId;
      const teacherId = req.userID.userID;
             
      const subTech = await Sub_teach.findOne({
          where: {
              subjectId: subjectId,
              teacherId: teacherId
          }
      });

      const subTech_id=subTech.id;

      // console.log(subTech_id);

      const video= await Video.findAll({
          where :{
              subTeachId: subTech_id
          }
      })
      res.json(video);
  }
   catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal server error');
  }

}