module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.eAdmin == 1) {
            next();
        } else {
            req.flash("error_msg", "Você precisa ser um administrador");
            res.redirect("/");
        }
    }
}