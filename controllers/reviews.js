const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body);
    review.author = req.user._id;
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    console.log(req.body);
    req.flash('success', 'Successfully Posted a Review');
    res.redirect(`/campground/${id}`);
};

module.exports.deleteReview = async (req, res) => {
    const {id, reviewID} = req.params;
    const campground = Campground.find({}).populate("reviews");
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewID}});
    await Review.findByIdAndDelete(reviewID);
    req.flash('success', 'Successfully Deleted a Review');
    res.redirect(`/campground/${id}`);
};