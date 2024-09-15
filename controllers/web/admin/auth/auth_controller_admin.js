const Manger = require('../../../../models/managers');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mail = require('../../../../services/Mails');




  module.exports.forget_password =async  (req, res, next) => {
 
    const user = await Manger.findOne({
        where:{
        email:req.body.email
        }
    });

    if (!user) {
        return res.status(404).send('User not found');
    }
     
    let code = Math.floor(Math.random() * 90000) + 10000;
    
    console.log("..........",user,"/////////////");

    mail(req.body.email , "this is your code : "+code );

    user.time =(Date.now());
    console.log("@@#!@#!@#"+user.time);
    user.code = code;
    
    await user.save((err, updatedUser) => {
        if (err) {
            return res.status(500).send(err); 
        }
        res.end("Check your email for the code");
    });
    return res.status(200).json({
        success: 1,
        message: 'Check your email for the code'
    });

  }

  module.exports.check_code = async (req, res, next) => {
    try {
        const user = await Manger.findOne({ 
            where :{
                email:req.body.email
            }
         });
        console.log(user);
        if (!user) {
            return res.status(404).send('User not found');
        }

        if (!user.code || !user.time) {
            return res.status(400).send('Code not found or expired');
        }
        console.log("//////////////" +(Date.now()-user.time)+ "////////"  );

        if (req.body.code !== user.code) {
            return res.status(400).send('Invalid code');
        } 

        else if ((req.body.code == user.code) && Date.now()-user.time > 60000 ){
            return res.status(400).send('Code expired');
                    }
        else {
            return res.status(200).json({
                success: 1,
                message: 'Code verified successfully'
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};

module.exports.reset_password = async (req, res, next) => {
    try {
        const user = await Manger.findOne({ 
         where:{
            email: req.body.email
        } });

        if (!user) {
            return res.status(404).send('User not found');
        }

        if (!req.body.newPassword) {
            return res.status(400).send('New password is required');
        }

        bcrypt.hash(req.body.newPassword, 12, async (err, hash) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Internal server error');
            }
            
            user.password = hash;
            await user.save();
            return res.status(200).json({
                success: 1,
                message: 'Password reset successfully'
            });

        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};
module.exports.Login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;

        const users = await Manger.findAll({ where: { email: email, name: name } });

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username, email or password' });
        }

        const user = users[0];

        // If passwords are hashed
         const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid username, email or password' });
        }

        const jsontoken = jwt.sign({ userID: user.id }, 'L93KjbNwTdR4yvSgEcP6XfM2D7zR8hWq', { expiresIn: '1h' });

        return res.status(200).json({
            success: 1,
            message: 'Logged in',
            token: jsontoken,
            admin:user.isSuperAdmin
    });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while logging in' });
    }
};

module.exports.Logout = (req, res, next) => {
  
   

    req.headers['authorization'] = undefined;
    return res.status(200).json({
        success: 1,
        message: 'Logged out'
    });
};

