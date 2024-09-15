const Teacher = require('../models/teachers');

module.exports = async (req, res, next) => {
    const teacher_id = req.userID.userID;

    try {
        // Find the teacher by ID
        const teacher = await Teacher.findOne({
            where: {
                id: teacher_id
            }
        });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if valid is 0
        if (teacher.valid === 0) {
            return res.status(403).json({
                message: "You don't have access"
            });
        }

        // If valid is not 0, continue to the next middleware
        next();
    } catch (error) {
        console.error('Error fetching teacher:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
