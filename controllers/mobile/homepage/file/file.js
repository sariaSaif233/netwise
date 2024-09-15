const fs = require('fs');
const SubTech = require('../../../../models/sub_teach.js');
const Subject = require('../../../../models/subjects.js');
const Chapter = require('../../../../models/chapters.js');
const User = require('../../../../models/students.js');
const Teacher = require('../../../../models/teachers.js');
const Video = require('../../../../models/video.js');

// const is_valid = require('../../../../middleware/is_valid.js');
const Read = require('../../../../models/read.js');
const Subscribe = require('../../../../models/subscribe.js');
const { Op, sequelize } = require('sequelize');


module.exports.get_file = async (req, res, next) => {
    try {
        const subjectId = req.body.subjectId;
        const teacherId = req.body.teacherId;
               
        const subTech = await SubTech.findOne({
            where: {
                subjectId: subjectId,
                teacherId: teacherId
            }
        });

        const subTech_id=subTech.id;
        console.log(subTech_id);

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




module.exports.get_video = async (req, res, next) => {
  try {
      const subjectId = req.body.subjectId;
      const teacherId = req.body.teacherId;
             
      const subTech = await SubTech.findOne({
          where: {
              subjectId: subjectId,
              teacherId: teacherId
          }
      });

      const subTech_id=subTech.id;
      console.log(subTech_id);

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
// module.exports.get_all_subjects = async (req, res, next) => {
//     try {
       
//         const subject= await Subject.findAll();
      
//         res.json(subject); 
//     }
//      catch (error) {
//         console.error('Error:', error);
//         res.status(500).send('Internal server error');
//     }
// }




module.exports.get_subjects = async (req, res, next) => {
    try {
        // Find the user by ID
        const id = req.body.userId;
        const user = await User.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }       
        const subscribedSubjectIds = await Subscribe.findAll({
          attributes: ['subjectId'],
          where: { studentId: id },
          raw: true
      }).then(subscriptions => subscriptions.map(subscription => subscription.subjectId));
      

        const userClass = user.classId;

            // Fetch subjects with classId and deleted_at is null
      const subjectsWithNullDeletedAt = await Subject.findAll({
        where: {
            classId: userClass,
            deleted_at: null
        }
      });

      // Fetch subjects with classId and id in subscribedSubjectIds
      const subjectsWithSubscribedIds = await Subject.findAll({
        where: {
            classId: userClass,
            id: subscribedSubjectIds
        }
      });

      // Combine the results
      const subjects = [...subjectsWithNullDeletedAt, ...subjectsWithSubscribedIds].reduce((unique, item) => {
        return unique.includes(item) ? unique : [...unique, item];
      }, []);

        
        res.json(subjects);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};
module.exports.get_teacher_unsubscribe = async (req, res, next) => {
  try {
    const subjectId = req.body.subjectId;
    const student_Id = req.userID.userID;

    const subject = await Subject.findOne({
      where: {
        id: subjectId,
        deleted_at: null // Ensure the subject is not soft-deleted
      }
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found or has been deleted' });
    }

    // Find all teacher IDs associated with the given subject ID in the SubTech table
    const subTeach = await SubTech.findAll({
      where: { subjectId: subjectId
      },
      attributes: ['teacherId', 'salary']
    });

    const teacherIds = subTeach.map(stb => stb.teacherId);
    const teacherSalaries = subTeach.reduce((acc, stb) => {
      acc[stb.teacherId] = stb.salary;
      return acc;
    }, {});

    // Find all teacher IDs in the Subscribe table
    const subscribedTeachers = await Subscribe.findAll({
      where: { studentId: student_Id},
      attributes: ['teacherId'],
      raw: true
    });

    const subscribedTeacherIds = subscribedTeachers.map(sub => sub.teacherId);

    // Filter out teacher IDs that are present in the Subscribe table
    const unsubscribedTeacherIds = teacherIds.filter(id => !subscribedTeacherIds.includes(id));

    // Find teacher information for the filtered teacher IDs
    const Teachers = await Teacher.findAll({
      where: {
        valid: 1,
        id: unsubscribedTeacherIds
      }
    });

    // Map the teachers with their respective salaries
    const teacherWithSalaries = Teachers.map(teacher => ({
      ...teacher.toJSON(),
      salary: teacherSalaries[teacher.id]
    }));

    res.json(teacherWithSalaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching teacher information.' });
  }
};

    
    module.exports.get_subscribed_teachers = async (req, res, next) => {
      try {
        const subjectId = req.body.subject_id;
        const studentId = req.userID.userID;

        // Find all subscribed teacher IDs associated with the given subject ID in the Subscribe table
        const subscribedTeachers = await Subscribe.findAll({
          where: { 
            subjectId: subjectId,
            studentId:studentId
           },
          attributes: ['teacherId'],
          raw: true
        });
    
        const teacherIds = subscribedTeachers.map(sub => sub.teacherId);
    
        if (teacherIds.length === 0) {
          return res.json([]); // Return an empty array if no teachers are found
        }
    
        // Find teacher information for the matched teacher IDs
        const Teachers = await Teacher.findAll({
          where: {
            valid: 1,
            id: teacherIds
          }
        });
    
        // Find the salaries from the SubTech table for the given subjectId and teacherIds
        const subTechEntries = await SubTech.findAll({
          where: {
            subjectId: subjectId,
            teacherId: teacherIds
          },
          attributes: ['teacherId', 'salary'],
          raw: true
        });
    
        // Create a map of teacherId to salary
        const salaryMap = subTechEntries.reduce((map, entry) => {
          map[entry.teacherId] = entry.salary;
          return map;
        }, {});
    
        // Map the teachers with their respective salaries
        const teacherWithSalaries = Teachers.map(teacher => ({
          ...teacher.toJSON(),
          salary: salaryMap[teacher.id]
        }));
    
        res.json(teacherWithSalaries);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching subscribed teacher information.' });
      }
    };
    


module.exports.read = async (req, res, next) => {

    const  student_Id = req.userID.userID;
  const  chapter_Id  = req.body.chapterId;

  try {
    const readEntry = await Read.create({  chapterId:chapter_Id, studentId: student_Id,});
    res.status(201).json(readEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create read entry' });
  }
};


module.exports.un_read = async (req, res, next) => {

    const  student_Id = req.userID.userID;
  const  chapter_Id  = req.body.chapterId;
  try {
    // Find the entry to delete
    const readEntry = await Read.findOne({
      where: {
        chapterId:chapter_Id,
        studentId:student_Id
      }
    });

    if (!readEntry) {
      return res.status(404).json({ message: 'Read entry not found' });
    }

    // Delete the entry
    await readEntry.destroy();

    res.status(200).json({ message: 'Read entry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete read entry' });
  }
};

module.exports.get_not_read = async (req, res, next) => {
    try {
        const studentId = req.userID.userID;
        const subjectId = req.body.subjectId;
        const teacherId = req.body.teacherId;
        
        
        const subTech = await SubTech.findOne({
            where: {
                 subjectId:subjectId,
                 teacherId:teacherId 
            }
        });

        if (!subTech) {
            return res.status(404).json({ message: 'Subject and teacher combination not found' });
        }

        const subTech_id = subTech.id;
        
       
        const readEntries  = await Read.findAll({
            where: { studentId: studentId },
            attributes: ['chapterId'] 
        });

        const readChapterIds = readEntries.map(entry => entry.chapterId);



        const chapters = await Chapter.findAll({
            where: {
                subTeachId: subTech_id,
                id: {
                  [Op.notIn]: readChapterIds
              }
            }
        });
              
        console.log(subTech_id);

        res.json(chapters);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};


module.exports.get_is_read = async (req, res, next) => {
    try {
        const studentId = req.userID.userID;
       
        const readEntries  = await Read.findAll({
            where: { studentId: 
              studentId },
            attributes: ['chapterId'] 
        });
  
        const readChapterIds = readEntries.map(entry => entry.chapterId);
  
        const chapters = await Chapter.findAll({
            where: {
                id: readChapterIds,
            }
        });
          
        res.json(chapters);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
  };