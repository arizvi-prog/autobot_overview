const { model, Schema } = require('mongoose');
const { hash, compare } = require('bcrypt')

const userSchema = new Schema({
    email: {
        type: String,
        // Make sure to drop the user collection if it already exists to make the unique functionality work
        unique: true,
        validate: {
            validator(val) {
                // Validate that the string the user typed is a valid email string
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val);
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: [6, 'Your password must be at least 6 characters in length']
    },

    autobots: [{
        type: Schema.Types.ObjectId,
        ref: 'Autobot'
    }]
}, {
    // Edit the users object before it gets sent out in a JSON response to the browser/client
    toJSON: {
        transform(user, jsonVal) {
            delete jsonVal.password;
            delete jsonVal.__v;
            
            return jsonVal;
        }
    }
});

userSchema.pre('save', async function () {
    // Check if this is a newly created user and not just a user update
    if (this.isNew) {
        console.log('user save');
        this.password = await hash(this.password, 10);
    }
});

userSchema.methods.validatePassword = async function (formPassword) {
    const is_valid = await compare(formPassword, this.password);

    return is_valid;
}

const User = model('User', userSchema);

module.exports = User;