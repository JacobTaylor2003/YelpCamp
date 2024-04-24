// const mongoose = require("mongoose");
// const express = require("express");
// const path = require("path");
// const Campground = require("../models/campground")

// mongoose.connect("mongodb://localhost:27017/yelp-camp")
// .then(()=> {
//     console.log("database connected")
// })
// .catch (err => {
//     console.log(err.err)
// })

// const seedDB = async() => {
//     await Campground.deleteMany({});
//     for (let i = 0; i<50; i++) {
//         const num1000 = Math.floor((Math.random() * 1000))
//         const drand = Math.floor((Math.random() * 17))
//         const placeRand = Math.floor((Math.random() * 20))
//        let newCamp = new Campground({location: `${cities[num1000].city}, ${cities[num1000].state}`, title: `${descriptors[drand]} ${places[placeRand]}`})
//        await newCamp.save()
//        console.log(newCamp)
//     }
// }
// seedDB().then(() => {
// //     mongoose.connection.close()
// // })