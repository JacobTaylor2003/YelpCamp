const Campground = require('../models/campground');
const errorHandler = require('../utilities/AppError');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("./campgrounds/index" ,{campgrounds, mapBoxToken});
};

module.exports.renderNewForm = (req, res) => {
    res.render("./campgrounds/new");
};

module.exports.renderEditForm = async (req, res) => {
    const camp = await Campground.findById(`${req.params.id}`);
    res.render("./campgrounds/edit", {camp});
};

module.exports.editCampground = async (req, res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, req.body);
    const newImages = req.files.map(f => ({url: f.path, name: f.filename}))
    if (newImages.length > 0) {
    camp.images.push(newImages[0])
    }
   
    if (req.body.deleteImages) {
        for (let file of req.body.deleteImages) {
            await camp.updateOne({$pull: {images: {name: {$in: req.body.deleteImages}}}})
            await cloudinary.uploader.destroy(file);
        }
    }
    await camp.save()
        req.flash('success', 'Successfully Edited a New Campground');
        res.redirect(`/campground/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    for(f of camp.reviews) {
        await Review.findByIdAndDelete(f);
    };
    
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', "Successfuly Deleted Campground");
    res.redirect("/campground");
};

module.exports.createCampground = async(req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.location,
        limit: 1
    }).send()
    images = req.files.map(f => ({url: f.path, name: f.filename}))
    const {title, location, price, description} = req.body;
    if (!(title,location,price,description,images)) {
        throw new errorHandler("Invalid Campground", 400);
    } else {
        const camp = new Campground({title: title, location: location,images: images,price: price, description: description, geometry: {
            type: 'Point',
            coordinates: geoData.body.features[0].geometry.coordinates
        }});
        camp.author = req.user._id;
       
    await camp.save();
    req.flash('success', 'Successfully Created a New Campground');
    res.redirect(`/campground/${camp._id}`);
    };
  };

module.exports.showCampground = async (req, res) => {
    const {id} = req.params;
    const campgrounds = await Campground.findById(id).populate('author').populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    });
    res.render("./campgrounds/show" ,{campgrounds, id, mapBoxToken });
};