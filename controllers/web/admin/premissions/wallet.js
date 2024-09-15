const Wallet = require('../../../../models/wallet.js');
const Check=require('../../../../models/check.js');
const Student=require('../../../../models/students.js');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');


module.exports.get_check = async (req, res, next) => {
    try {
        const checks = await Check.findAll();  // Assuming Sequelize; use `find()` if using Mongoose
        res.status(200).json(checks);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal server error');
    }
};


    module.exports.approve_check = async (req, res, next) => {
        const checkId = req.body.check_id;  // Assuming check_id is sent in the body of the request
    
        try {
            const check = await Check.findByPk(checkId);
    
            if (!check) {
                return res.status(404).json({ error: 'Check not found' });
            }
            if (check.approved === 1) {
                return res.status(400).json({ error: 'Check is already approved' });
            }
    
            check.approved = 1;  // Update the approved attribute to 1
            await check.save();

            const price=check.price;
            const student_id=check.studentId;

            const student = await Student.findByPk(student_id);

            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }
            const wallet_id=student.walletId;
            const wallet = await Wallet.findByPk(wallet_id);

            if (!wallet) {
                return res.status(404).json({ error: 'Wallet not found' });
            }
            wallet.price =wallet.price+ price;
            wallet.save();
            res.status(200).json({ message: 'Check approved successfully', check });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal server error');
        }
    };
    