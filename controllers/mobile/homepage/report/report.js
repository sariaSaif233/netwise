const Report=require('../../../../models/report');

module.exports.report = async (req, res, next) => {

const text = req.body.text;
const studentId = req.userID.userID;
try{

const report = await Report.create({
    text:text,
    studentId:studentId
})
    return res.status(200).json({ report });

}catch (error) {
    return res.status(500).json({ error: error.message });
}

}

module.exports.showReport = async (req, res, next) => {
    const studentId = req.userID.userID;
    console.log(studentId)
    try{
    const report = await Report.findAll({
        where:{
            studentId:studentId
        }
    })
    return res.status(200).json({ report });

}
catch (error) {
    return res.status(500).json({ error: error.message });
}

}

module.exports.deleteReport = async (req, res, next) => {
const reportId = req.body.reportId

const report = await Report.findOne({where:{
    id:reportId
}
})
await report.destroy();

return res.status(200).json({ message:'Report deleted successfully' });

}
