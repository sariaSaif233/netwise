const Report = require('../../../../models/report');
const Student = require('../../../../models/students');
const Teacher = require('../../../../models/teachers');


module.exports.showReports = async (req, res, next) => {
    try {
        const report = await Report.findAll({
            include: [
                {
                    model: Student,
                    attributes: ['name'],  
                },
                {
                    model: Teacher,
                    attributes: ['name'],  
                }
            ]
        });
        res.status(200).json(report);
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'An error occurred while fetching reports' });
    }
};
