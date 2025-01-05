const Joi = require('joi');

const validateDocument = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().min(3).required(),
        content: Joi.string().min(3).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
    }
    next();
};

module.exports = { validateDocument };