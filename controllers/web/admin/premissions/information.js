
const Class = require('../../../../models/classes');
const Subject = require('../../../../models/subjects');
const Manager = require('../../../../models/managers');
const Teacher = require('../../../../models/teachers');
const Subscribe = require('../../../../models/subscribe');
const Sub_teach = require('../../../../models/sub_teach');
const Video = require('../../../../models/video');
const Chapter = require('../../../../models/chapters');
const Student = require('../../../../models/students');
const { Op } = require('sequelize');
const fs = require('fs');
const { subscribe } = require('diagnostics_channel');





module.exports.get_subjects = async (req, res, next) => {
    try {
       
        const class_id = req.body.class_id; 
        const subjectss = await Subject.findAll({
          where: {
            classId: class_id,
            deleted_at:  null // Only include classes where deleted_at is null
          
        }
        });
        
        res.json(subjectss);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
}



module.exports.get_Statistics = async (req, res, next) => {
  try {
    const teacherId = req.body.teacherId;

    // Find all student IDs subscribed to the given teacher
    const subscriptions = await Subscribe.findAll({
      where: {
        teacherId: teacherId
      },
      attributes: ['studentId']
    });

    // Extract student IDs from the subscriptions
    const studentIds = subscriptions.map(subscription => subscription.studentId);

    // Fetch all student details based on the extracted student IDs
    const students = await Student.findAll({
      where: {
        id: studentIds
      }    });

    // Return the student details in the response
    res.status(200).json(students);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
}



module.exports.get_All_teacher = async (req, res, next) => {
  try {
    const Teachers = await Teacher.findAll();

    res.json(Teachers);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
}
}


module.exports.getClasses = async (req, res, next) => {
    try {
        const classes = await Class.findAll({
            where: {
                deleted_at:  null // Only include classes where deleted_at is null
                
            }
        });

        res.status(200).json(classes);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};



module.exports.get_teacher = async (req, res, next) => {
    try {
      const subjectId = req.body.subjectId;
  
      const subjects = await Subject.findByPk(subjectId);
  
      if (!subjects) {
        return res.status(404).json({ error: 'Subject not found' });
      }
  
      const subTeaches = await Sub_teach.findAll({
        where: { subjectId: subjectId },
        attributes: ['teacherId', 'salary', 'precntage']
      });
       
      if (subTeaches.length === 0) {
        return res.status(404).json({ error: 'No teachers found for this subject' });
      }
  
      const teacherIds = subTeaches.map(st => st.teacherId);
  
      const teachers = await Teacher.findAll({
        where: { id: teacherIds }
      });
  
      if (teachers.length === 0) {
        return res.status(404).json({ error: 'No teachers found matching the criteria' });
      }
  
      const teachersWithDetails = teachers.map(teacher => {
        const subTeachInfo = subTeaches.find(st => st.teacherId === teacher.id);
        return {
          id: teacher.id,
          name: teacher.name,
          valid: teacher.valid,
          phoneNumber: teacher.phoneNumber,
          email: teacher.email,
          salary: subTeachInfo.salary,
          precntage: subTeachInfo.precntage,
        };
      });
  
      res.json(teachersWithDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching teachers' });
    }
  };


  module.exports.get_Admin = async (req, res, next) => {
    try{
  const admin = await Manager.findAll({
    where:{
      isSuperAdmin:0
    }
  });
  res.status(200).json(admin);

    }catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching teachers' });
    }

  }
  module.exports.search_teacher = async (req, res, next) => {
    try {
      const subjectId = req.body.subjectId;
      const name = req.body.name;
  
      const teacherIdsRecords = await Sub_teach.findAll({
        where: { subjectId: subjectId },
        attributes: ['teacherId']
      });
  
      const teacherIds = teacherIdsRecords.map(record => record.teacherId);
  
      const teachers = await Teacher.findAll({
        where: {
          id: teacherIds,
          name: name
        }
      });
    
      res.json(teachers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching teachers' });
    }
  }



  
module.exports.get_files = async (req, res, next) => {
  try {
      const teacherId = req.body.teacherId;
      const subjectId = req.body.subjectId;
    
             
      const subTech = await Sub_teach.findOne({
          where: {
            teacherId: teacherId,
            subjectId:subjectId
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
      const teacherId = req.body.teacherId;
     
             
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
  

  