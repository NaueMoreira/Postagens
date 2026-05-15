module.exports = {
    eAutorOuAdmin: function (req, res, next) {
        if (req.isAuthenticated()) {
            // Se for admin, permite
            if (req.user.eAdmin == 1) {
                return next();
            }

            // Verifica se é o autor baseado na URL ou body
            const userId = req.user._id;
            const itemId = req.params.id || req.body.id;

            if (!itemId) {
                req.flash("error_msg", "ID do item não encontrado");
                return res.redirect("/");
            }

            // Determina se é postagem ou categoria baseado na URL
            const isPostagem = req.originalUrl.includes('/postagens/');
            const Model = isPostagem ?
                require('../models/Postagens') :
                require('../models/Categoria');

            Model.findById(itemId).then(item => {
                if (!item) {
                    req.flash("error_msg", "Item não encontrado");
                    return res.redirect("/");
                }

                // Verifica se o usuário logado é o autor
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