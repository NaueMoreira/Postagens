///carregando modulos...
const express = require('express');
const { engine } = require('express-handlebars');
const bodyparser = require('body-parser');
const app = express();
const admin = require( './routes/admin')
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagens');
const Postagem = mongoose.model('postagens');
require("./models/Categoria")
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require('passport');
const eAdmin = require('./helpers/eAdmin');
require('./config/auth')(passport);
const db = require('./config/db');
//configurações...
    //session
    app.use(session({
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }));
// Passport
    app.use(passport.initialize());
    app.use(passport.session());
    //
    
    //flash
    app.use(flash());

    //middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg');
        res.locals.error_msg = req.flash('error_msg');
        res.locals.error = req.flash('error');
        res.locals.user = req.user || null;
        next();
    })
    // body parser
    app.use(bodyparser.urlencoded({extended: true}));
    app.use(bodyparser.json());
    // handlebars
    app.engine('handlebars', engine({defaultLayout: 'main',helpers:{
        formatDate: (d) => new Date(d).toLocaleDateString('pt-BR'),
        eq: (a, b) => a && b && a.toString() === b.toString(),
        or: function() {
            const args = Array.prototype.slice.call(arguments, 0, -1);
            return args.some(Boolean);
        }
    }
    }));
    app.set('view engine', 'handlebars');
    // mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect(db.mongoURI).then(() =>{
        console.log('Conectado ao mongo');
    }).catch((err) =>{
        console.log('Erro ao se conectar: ' + err);
    });
    // public
    app.use(express.static(path.join(__dirname, 'public')));
    app.use( (req, res, next) => {
        console.log('oi, eu sou um middleware');
        next();
    })
    // rotas

    app.get('/',(req, res) =>{
        Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) =>{
        res.render('index' , {postagens: postagens});
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/404');
    })
    });

    app.get('/postagem/:slug',(req,res) =>{
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) =>{
            if(postagem){
                res.render('postagem/index', {postagem: postagem});
            }else{
                req.flash('error_msg', 'Esta postagem não existe');
                res.redirect('/');
            }
    }).catch((err) =>{
        req.flash('error_msg', 'Houve um erro interno');
        res.redirect('/');
    })
});

app.get("/categorias",(req,res) =>{
    Categoria.find().lean().then((categorias) =>{
        res.render("categorias/index", {categorias: categorias});
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro interno ao listar as categorias");
        res.redirect("/");
    })
});

app.get("/categorias/:slug",(req,res) =>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria) =>{
        if(categoria){
            Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{

                res.render("categorias/postagens", {postagens: postagens, categoria: categoria});

            }).catch((err) =>{
                req.flash("error_msg", "Houve um erro ao listar os posts");
                res.redirect("/");

            })
        }else{
            req.flash("error_msg", "Esta categoria não existe");
            res.redirect("/");
        }
}).catch((err) =>{
    req.flash("error_msg", "Houve um erro ao listar os posts");
    res.redirect("/");
})
});


    app.use('/admin', admin);

    app.use('/usuarios', require('./routes/usuario'));

   
//Outros...
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando");
});