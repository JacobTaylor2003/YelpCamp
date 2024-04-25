if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log(process.env.SECRET)

//Possibly Take these lines out later
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const mongoose = require("mongoose");
const express = require("express");
const ejsMate = require("ejs-mate");
const path = require("path");
const methodOverride = require("method-override")
const Campground = require("./models/campground")
const Review = require("./models/review")
const errorHandler = require("./utilities/AppError")
const {validateCampground, validateReview} = require("./utilities/Schema")
const wrapSync = require("./utilities/wrapSync")
const cities = require("./seeds/cities")
const {descriptors, places} = require("./seeds/seedHelpers");
const { rmSync } = require("fs");
const { wrap } = require("module");
const routes = require('./routes/routes')
const session = require('express-session')
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const flash = require('connect-flash');
const review = require("./models/review");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const userRoutes = require('./routes/userRoutes')
const helmet = require('helmet')
const {storeReturnTo} = require('./middleware')

const port = process.env.PORT || '3000'
const secret = process.env.SECRET || 'myappssupersecretsecret'
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp'

mongoose.connect(dbURL, {
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"))


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
  );

  const options = {
    mongoUrl: process.env.DB_URL,
    secret: secret,
    touchAfter: 24 * 60 * 60
  };


const sessionConfig = {
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        name: 'session',
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        store: MongoStore.create(options)
    }
}



app.use(session(sessionConfig));
app.use(flash());
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dmd1jnvxy/",
                "https://images.unsplash.com/",
                "https://source.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const arrayEvaluator = (array) => input = Math.floor(Math.random() * array.length)

const seedDB = async() => {
    await Campground.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const city = cities[arrayEvaluator(cities)];
        const camp = new Campground({
            author: '661483eeb384f8391188d31f',
            title: `${descriptors[arrayEvaluator(descriptors)]} ${places[arrayEvaluator(places)]}`,
            location: `${city.city}, ${city.state}`,
            images: {
                url: `https://source.unsplash.com/collection/483251/1600x900`,
                name: 'name'
            },
            geometry: {
                type: 'Point',
                coordinates: [city.longitude,city.latitude]  // Empty initially.
            },
            price: Math.floor((Math.random() * 200)) + 0.99,
            description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit."
        });
        await camp.save();
    }
}
seedDB()

app.listen(port, () => {
    console.log(`Port Open on ${port}`);
});

app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes);
app.use("/campground", routes);

app.get('/', (req, res) => {
    res.render('home')
    console.log("QUERY LOGGING ACCURING HERE!")
    console.log(req.query);
})

app.all('*', (req, res, next) => {
    throw new errorHandler('Page Not Found', 404)
})

app.use((err,req,res,next) => {
    if (!(err.statusCode)) {
        err.statusCode = 500;
    }
    if (!(err.message)) {
        err.message = "Oops! Something Went Wrong."
    }
    res.status(err.statusCode).render("./campgrounds/error", {err})
    console.log(err)
})