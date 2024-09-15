
const Report=require('../../../../../models/report');

module.exports.report = async (req, res, next) => {


const text = req.body.text;
const teacherId = req.userID.userID;
try{

const report = await Report.create({
    text:text,
    teacherId:teacherId
})
    return res.status(200).json({ report });

}catch (error) {
    return res.status(500).json({ error: error.message });
}

}

module.exports.showReport = async (req, res, next) => {
    const teacherId = req.userID.userID;
    try{
    const report = await Report.findAll({
        where:{
            teacherId:teacherId
        }
    })
    return res.status(200).json({ report });

}
catch (error) {
    return res.status(500).json({ error: error.message });
}

}


module.exports.deleteReport = async (req, res, next) => {
    
    const reportId = req.body.reportId;
    console.log("ASDasd")
    try {
        const report = await Report.findOne({
            where: { id: reportId }
        });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        await report.destroy();

        return res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
