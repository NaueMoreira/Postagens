const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagens');
const Postagem = mongoose.model('postagens');
const { eAdmin } = require('../helpers/eAdmin');
const { eAutenticado } = require('../helpers/eAutenticado');
const { eAutorOuAdmin } = require('../helpers/eAutorOuAdmin');

// Definições de rotas 

router.get('/', eAdmin,(req,res) =>{
    res.render("admin/index");
})

router.get('/posts', (req,res) =>{
    res.send('Pagina de posts');
})

router.get('/categorias', eAutenticado,(req,res) =>{
    Categoria.find().sort({data: "desc"}).lean().then((categorias) =>{
        res.render("admin/categorias", {categorias: categorias});
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/");
    })
    
})

router.get("/categorias/add", eAutenticado,(req,res) =>{
    res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAutenticado,(req,res) =>{
    let erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"});
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"});
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"});
    } // verificação de erro nome muito pequeno

    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros});
    }else{
        const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug,
        autor: req.user._id
    };
    new Categoria(novaCategoria).save().then(() =>{
        req.flash("success_msg", "categoria criada com sucesso!");
        res.redirect("/categorias");
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!");
        res.redirect("/categorias/add");
    });
    }

});

//rota de edição de categoria
router.get('/categorias/edit/:id', eAutorOuAdmin,(req, res) =>{
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria});
    }).catch((err) =>{
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/admin/categorias");
    });

});


//rota de atualização de categoria
router.post('/categorias/edit', eAutorOuAdmin,(req, res) => {
  // validação (mantém seu código de validação)
  Categoria.findById(req.body.id).then(categoria => {
    if(!categoria){
      req.flash('error_msg', 'Categoria não encontrada');
      return res.redirect('/admin/categorias');
    }
    categoria.nome = req.body.nome;
    categoria.slug = req.body.slug;
    return categoria.save();
  }).then(() => {
    req.flash('success_msg', 'Categoria editada com sucesso!');
    res.redirect('/admin/categorias');
  }).catch(err => {
    req.flash('error_msg', 'Houve um erro ao editar a categoria');
    res.redirect('/admin/categorias');
  });
});

router.post('/categorias/deletar', eAutorOuAdmin,(req, res) => {
    // garante que deletamos pelo _id corretamente
    Categoria.findByIdAndDelete(req.body.id).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!');
        res.redirect('/admin/categorias');
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a categoria');
        res.redirect('/admin/categorias');
    });
});

router.get('/postagens', eAutenticado,(req,res) =>{

    Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) =>{
        res.render("admin/postagens", {postagens: postagens});
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as postagens");
        res.redirect("/");
    });
});

router.get('/postagens/add',eAutenticado, (req,res) =>{
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário");
        res.redirect("/");
    });
});

router.post('/postagens/new', eAutenticado,(req,res) =>{
    let erros = [];

    if(!req.body.titulo || req.body.titulo.trim() === ""){
        erros.push({texto: "Título inválido"});
    }

    if(!req.body.slug || req.body.slug.trim() === ""){
        erros.push({texto: "Slug inválido"});
    }

    if(erros.length > 0){
        Categoria.find().lean().then((categorias) => {
            res.render("admin/addpostagens", {erros: erros, categorias: categorias});
        });
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria && req.body.categoria !== "0" ? req.body.categoria : null,
            autor: req.user._id
        }
        new Postagem(novaPostagem).save().then(() =>{
            req.flash("success_msg", "Postagem criada com sucesso!");
            res.redirect("/");
        }).catch((err) =>{
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem");
            res.redirect("/admin/postagens/add");
        });
    }
})

router.get('/postagens/edit/:id', eAutorOuAdmin,(req, res) =>{

Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

    Categoria.find().lean().then((categorias) => {
        res.render('admin/editpostagens', {postagem: postagem, categorias: categorias});
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias");
        res.redirect("/admin/postagens");
    });
    
}).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário de edição");
    res.redirect("/admin/postagens");
})

});

router.post('/postagens/edit', eAutorOuAdmin,(req, res) => {
    Postagem.findById(req.body.id).then((postagem) => {
        if(!postagem){
            req.flash('error_msg', 'Postagem não encontrada');
            return res.redirect('/admin/postagens');
        }
        postagem.titulo = req.body.titulo;
        postagem.slug = req.body.slug;
        postagem.descricao = req.body.descricao;
        postagem.conteudo = req.body.conteudo;
        postagem.categoria = req.body.categoria && req.body.categoria !== "0" ? req.body.categoria : null;
        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((err) => {
            req.flash('error_msg', 'Erro interno');
            res.redirect('/admin/postagens');
        });
    }).catch((err) => {
        console.log(err);
        req.flash('error_msg', 'Houve um erro ao salvar a edição da postagem');
        res.redirect('/admin/postagens');
    })
});

router.get("/postagens/deletar/:id", eAutorOuAdmin,(req,res) =>{

    Postagem.deleteOne({_id: req.params.id}).lean().then( () => {
        req.flash("success_msg", "Postagem deletada com sucesso!");
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem");
        res.redirect("/admin/postagens");
    })
})



module.exports = router;