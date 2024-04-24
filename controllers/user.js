const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('auth/register');
};

module.exports.createRegister = async(req, res, next) => {
    const {username, password, email} = req.body;
    const user = new User({email, username});
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, err => {
        if (err) return next(err);
        req.flash('success', 'Successfully Registered Your Account');
        res.redirect('/campground');
    })
};

module.exports.renderLogin = (req, res) => {
    res.render('auth/login');
};

module.exports.createLogin = (req, res) => {
    req.flash('success', 'Welcome Back!');
    const redirectUrl = res.locals.returnTo || '/campground';
    res.redirect(redirectUrl);
    res.locals.returnTo = null;
};

module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye');
        res.redirect('/campground');
    });
}