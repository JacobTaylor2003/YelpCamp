const express = require('express');
const campgrounds = require('../controllers/campgrounds');
const reviews = require('../controllers/reviews');
const router = express.Router();
const wrapSync = require("../utilities/wrapSync")
const {validateCampground, validateReview} = require("../utilities/Schema")
const Campground = require("../models/campground")
const Review = require("../models/review")
const {isLoggedin, isAuthor, canDelete, clearRedirect} = require('../middleware');
const multer  = require('multer');

const {storage} = require('../cloudinary');
const upload = multer({ storage });


router.get("/new", isLoggedin, campgrounds.renderNewForm);

router.get("/edit/:id",isAuthor,wrapSync(campgrounds.renderEditForm))

router.post("/review/:id", validateReview,isLoggedin, wrapSync(reviews.createReview));

router.delete("/:reviewID/:id", isLoggedin,canDelete,wrapSync(reviews.deleteReview));

router.route("/")
    .get(wrapSync(campgrounds.index))
    .post(isLoggedin, upload.array('image'),validateCampground,wrapSync(campgrounds.createCampground));

router.route("/:id")
    .get(wrapSync(campgrounds.showCampground))
    .put(isAuthor,upload.array('images'), validateCampground, wrapSync(campgrounds.editCampground))
    .delete(isLoggedin, isAuthor, wrapSync(campgrounds.deleteCampground));

module.exports = router;