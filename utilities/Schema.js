const errorHandler = require("../utilities/AppError")
const BaseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

function validateCampground(req,res, next) {
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    const campgroundSchema = Joi.object({
        title: Joi.string().escapeHTML(),
        price: Joi.number().min(0),
        description: Joi.string().escapeHTML(),
        location: Joi.string().escapeHTML(),
        images: {
            url: Joi.string().required().escapeHTML(),
            name: Joi.string().required().escapeHTML()
        }
    })
    const {error} = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new errorHandler(msg, 400)
    } else {
        next()
    }
    }

function validateReview(req,res, next) {
        const reviewSchema = Joi.object({
            reviewBody: Joi.string().required().escapeHTML(),
            rating: Joi.number().required().min(0).max(5)
        })
        const {error} = reviewSchema.validate(req.body)
        if (error) {
            const msg = error.details.map(el => el.message).join(',')
            throw new errorHandler(msg, 400)
        } else {
            next()
        }
        }
    module.exports = {validateReview, validateCampground};