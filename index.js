// index.js

/**
 * Required External Modules
 */
    var express = require('express');
    var hbs = require('express-handlebars');
    var mongoose = require('mongoose');
    var session = require('express-session');


/**
 * App Variables
 */
    var app = express();

/**
 *  App Configuration
 */
    app.use(session({secret: 'ClaveSecreta'}));
    app.use(express.urlencoded());
    app.use(express.json());
    app.engine('hbs', hbs());
    app.set('view engine', 'hbs');
/**
 * MongoDB Schemas
 */
    mongoose.connect('mongodb://localhost:27017/trabajo2',{useNewUrlParser:true,useUnifiedTopology:true});
    var novedadSchema = new mongoose.Schema({
        novedad:String,
        creador:String});
    var Novedad = mongoose.model('Novedades',novedadSchema);

    var usuarioSchema = mongoose.Schema({
        usuario: String,
        lastName:String,
        email: String,
        password: String,
        number: String
    });

    var Usuario = mongoose.model('Usuario', usuarioSchema);
/**
 * Routes Definitions
 */
    app.get('/',function(req,res) {
        res.render('home');
    });
    app.get('/ver_registracion', function(req, res) {
        res.render('registracion');
    });
    app.post('/registracion', async function(req, res) {
        var usr = new Usuario();
        usr.usuario = req.body.usuario;
        usr.lastName = req.body.lastName;
        usr.email = req.body.email;
        usr.password = req.body.password;
        usr.number = req.body.number;
        await usr.save();
        res.redirect('/ver_login');
    });
    app.get('/ver_login', function(req, res) {
        res.render('login');
    });
    app.post('/login', async function(req, res) {
        var usr = await Usuario.findOne({usuario: req.body.usuario, password: req.body.password});
        if (usr) {
            req.session.usuario_id = usr._id;
            req.session.nombre =  req.body.usuario;
            res.redirect('/segura');
        } else {
            res.render('login', {mensaje_error: 'Usuario/password incorrecto', usuario: req.body.usuario});
        }
    });
    app.get('/segura', function(req, res) {
        if (!req.session.usuario_id) {
            res.redirect('/ver_login');
            return;
        }
        res.redirect('/ver_novedades');
    });

    app.get('/ver_novedades', async function(req, res) {
        var nvdd = await Novedad.find({});
        var nvdd = nvdd.reverse();
        if (!req.session.usuario_id) {
            res.redirect('/ver_login');
            return;
        }
        res.render('novedades',{novedades:nvdd, user:req.session.nombre});
    });
    app.get('/ver_nuevaNovedad', function(req, res) {
        if (!req.session.usuario_id) {
            res.redirect('/ver_login');
            return;
        }
        res.render('nuevaNovedad');
    });
    app.post('/nuevaNovedad', async function(req, res) {
        var nvdd = new Novedad();
        nvdd.novedad = req.body.novedad;
        nvdd.creador = req.session.nombre;
        await nvdd.save();
        res.redirect('/ver_novedades');
    });
    app.get('/ver_salir',function(req, res){
        req.session.nombre = null;
        res.redirect('/');
    });




    app.post('/api/registracion', async function(req, res) {
        var usr = new Usuario();
        usr.usuario = req.body.usuario;
        usr.lastName = req.body.lastName;
        usr.email = req.body.email;
        usr.password = req.body.password;
        usr.number = req.body.number;
        await usr.save();
        res.json(usr);
    });
    app.post('/api/login', async function (req, res) {
        var usr = await Usuario.findOne({usuario: req.body.usuario, password: req.body.password});
        if (usr) {
            req.session.usuario_id = usr._id;
            req.session.nombre =  req.body.usuario;
            res.redirect('/segura');
        } else {
            res.status(404).send();
        }
    });
    app.post('/api/nuevaNovedad', async function(req, res) {
        var nvdd = new Novedad();
        nvdd.novedad = req.body.novedad;
        nvdd.creador = req.session.nombre;
        await nvdd.save();
        res.json(nvdd);
    });
/**
 * Server Activation
 */
app.listen(3005, function () {
    console.log('Ejemplo de aplicacion escuchando en el port 3005!');
  });
  