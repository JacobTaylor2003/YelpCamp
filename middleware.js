const Campground = require("./models/campground");
const Review = require("./models/review")

function storeReturnTo(req, res, next) {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

function isLoggedin(req, res, next) {
    if(!(req.isAuthenticated())) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You Need To Be Signed In!');
        return res.redirect('/login')
    }
    next();
}

async function isAuthor(req, res, next) {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!(req.user && camp.author.equals(req.user._id))) {
        req.flash('error', 'You Do Not Have Permission To Edit This Page!')
        return res.redirect(`/campground/${id}`)
}
next();
}

async function canDelete(req,res,next) {
    const review = await Review.findById(req.params.reviewID).populate('author');
    if (!(req.user._id && review.author._id.equals(req.user._id))) {
        req.flash('error', 'You Do Not Have Permission to Delete This!')
        return res.redirect(`/campground/${req.params.id}`)
}
next();
}

module.exports = {storeReturnTo, isLoggedin, isAuthor, canDelete};

