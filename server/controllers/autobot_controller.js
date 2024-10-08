const { Autobot, User } = require('../models');

// Get autobots
module.exports = {
    async getAllAutobots(req, res) {
        console.log(req.cookies);
        const autobots = await Autobot.find().populate({
            path: 'createdBy',
            select: 'email -_id'
        });

        res.json(autobots);
    },

    async getSingleUser(req, res) {
        const user = await User.findById(req.user_id).populate('autobots');

        res.json(user);
    },

    async createAutobot(req, res) {
        // Create the autobot
        const newAutobot = await Autobot.create({
            name: req.body.name,
            color: req.body.color,
            createdBy: req.user._id
        });

        req.user.autobots.push(newAutobot._id);
        await req.user.save();

        res.json({
            message: 'Autobot created successfully!',
            autobot: newAutobot
        });
    },

    // Update autobot
    async updateAutobot(req, res){
        const autobot_id = req.body.autobot_id;
        
        if (!req.user.autobots.includes(autobot_id)) {  // '.' means does not
            return res.status(403).json({
                message: 'You cannot update an autobot that you did not create'
            })
        }

        const updatedAutobot = await Autobot.findOneAndUpdate({
            _id: autobot_id
        }, req.body, {
            new: true
        });

        res.json({
            message: 'Autobot updated successfully!',
            autobot: updatedAutobot
        })
    },

    // Delete autobot
    async deleteAutobot(req, res) {
        const autobot_id = req.body.autobot_id;
        
        if (!req.user.autobots.includes(autobot_id)) {  // '.' means does not
            return res.status(403).json({
                message: 'You cannot delete an autobot that you did not create'
            })
        } 
        
        await Autobot.deleteOne({
            _id: autobot_id
        });

        req.user.autobots.pull(autobot_id);
        await req.user.save();

        res.json({
            message: 'Autobot deleted successfully!'
        })
    }
}