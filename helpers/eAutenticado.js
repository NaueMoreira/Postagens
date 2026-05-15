module.exports = {
    eAutenticado: function (req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            req.flash("error_msg", "Você precisa estar logado para acessar essa página");
            res.redirect("/usuarios/login");
        }
    }
}
