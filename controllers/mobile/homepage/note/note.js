const Student=require('../../../../models/students');
const Note=require('../../../../models/note');




module.exports.add_note = async (req, res, next) => {
  try {
    const studentId = req.userID.userID;
    const { title, text } = req.body;

    if (!text) {
      return res.status(400).send('text is required');
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).send('Student not found');
    }

    const note = await Note.create({
      title,
      text,
      studentId: student.id
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.edit_note = async (req, res, next) => {
  try {
    const studentId = req.userID.userID;
    const { title, text } = req.body;
    const noteId = req.body.noteId; 

    if (!text) {
      return res.status(400).send('text is required');
    }

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).send('Student not found');
    }

    const note = await Note.findOne({
      where: {
        id: noteId,
        studentId: student.id
      }
    });

    if (!note) {
      return res.status(404).send('Note not found');
    }

    note.title = title;
    note.text = text;
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports.delete_note = async (req, res, next) => {
  try {
    const studentId = req.userID.userID;
    const noteId = req.body.noteId; // Assuming the note ID is provided as a URL parameter

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).send('Student not found');
    }

    const note = await Note.findOne({
      where: {
        id: noteId,
        studentId: student.id
      }
    });

    if (!note) {
      return res.status(404).send('Note not found');
    }

    await note.destroy();

    res.status(200).json({ message: 'Note has been deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports.show_note = async (req, res, next) => {
  try {
    const studentId = req.userID.userID;

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).send('Student not found');
    }

    const notes = await Note.findAll({
      where: {
        studentId: student.id
      }
    });

    if (notes.length == 0) {
      return res.status(200).send('You don\'t have any notes');
    }

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};