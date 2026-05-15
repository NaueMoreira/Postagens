const mongoose = require('mongoose');
require('../models/Categoria');
require('../models/Postagens');

module.exports = {
    eAutorOuAdmin: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.eAdmin == 1) {
                return next();
            }

            const userId = req.user._id;
            const itemId = req.params.id || req.body.id;

            if (!itemId) {
                req.flash("error_msg", "ID do item não encontrado");
                return res.redirect("/");
            }

            const isPostagem = req.originalUrl.includes('/postagens/');
            const Model = isPostagem ? mongoose.model('postagens') : mongoose.model('categorias');

            Model.findById(itemId).then(item => {
                if (!item) {
                    req.flash("error_msg", "Item não encontrado");
                    return res.redirect("/");
                }

                if (item.autor && item.autor.toString() === userId.toString()) {
                    return next();
                } else {
                    req.flash("error_msg", "Você não tem permissão para editar este item");
                    return res.redirect("/");
                }
            }).catch(err => {
                console.log(err);
                req.flash("error_msg", "Erro interno do servidor");
                res.redirect("/");
            });
        } else {
            req.flash("error_msg", "Você precisa estar logado");
            res.redirect("/usuarios/login");
        }
    }
}