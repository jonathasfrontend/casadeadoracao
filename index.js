const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const moment = require('moment');

const app = express();
app.use(session({secret: '0978hiutg978yge9r76fgnfgb89',}))

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : path.join(__dirname, 'temp')
}));
require('dotenv').config();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));


app.get('/',async (req, res) => {
    await axios.get(process.env.URL_API_INICIO_SOBRE).then(function(data){
        var iniciosobre = data.data.map(function(val){
            return {
                inicio: val.inicio,
                sobre: val.sobre,
                contato: val.contato
            }
        })
        axios.get(process.env.URL_API_PROJETO).then(function(data){
            var projetos = data.data.map(function(val){
                return {
                    img: val.img,
                    title: val.title,
                    sobre: val.sobre,
                    url: val.url
                }
            })
            axios.get(process.env.URL_API_CONTECONOSCO).then(function(data){
                var conteconosco = data.data.map(function(val){
                    return {
                        img_url: val.img_url,
                        nome: val.nome,
                        type: val.type
                    }
                })
                axios.get(process.env.URL_API_LINKS_CONTATO).then(function(data){
                    var linkscontato = data.data.map(function(val){
                        return {
                            img: val.img,
                            title: val.title,
                            url: val.url
                        }
                    })
                res.render('home',{data_iniciosobre:iniciosobre,dataprojetos:projetos,data_cont:conteconosco,contat:linkscontato});
            });
        });
    })
})
})

app.get('/escoladefundamentos',async (req, res) => {
    await axios.get(process.env.URL_API_INICIO_SOBRE).then(function(data){
        var iniciosobre = data.data.map(function(val){
            return {
                inicio: val.inicio,
                sobre: val.sobre,
                contato: val.contato
            }
        })
        axios.get(process.env.URL_API_LINKS_CONTATO).then(function(data){
            var linkscontato = data.data.map(function(val){
                return {
                    img: val.img,
                    title: val.title,
                    url: val.url
                }
            })
        axios.get(process.env.URL_API_ESCOLADEFUNDAMENTOS).then(function(data){
            var edfcontent = data.data.map(function(val){
                return {
                    Visao: val.Visao,
                    Missao: val.Missao,
                    Desenvolvimento: val.Desenvolvimento,
                    Modulos: val.Modulos,
                    Mestres: val.Mestres,
                    link_curso: val.link_curso,
                    objetivo: val.objetivo
                }
            })
                axios.get(process.env.URL_API_EDFMESTRES).then(function(data){
                    var edfmestres = data.data.map(function(val){
                        return{
                            nome: val.nome,
                            denominacao: val.denominacao,
                            avatar: val.avatar
                        }
                    })
                    res.render('edf',{data_iniciosobre:iniciosobre, contat:linkscontato, edf:edfcontent, edfmestres});
                })
            })
        })
    })
})

app.get('/pedidosdeoracao',async (req, res) => {
    await axios.get(process.env.URL_API_INICIO_SOBRE).then(function(data){
        var iniciosobre = data.data.map(function(val){
            return {
                inicio: val.inicio,
                sobre: val.sobre,
                contato: val.contato
            }
        })
            res.render('pedidos',{data_iniciosobre:iniciosobre});
    })
})

app.post('/pedidosdeoracao',async (req, res) => {
    const data = {
        name: req.body.name,
        telefone: req.body.telefone,
        pedido: req.body.pedido,
      };
      await axios.post(process.env.URL_PEDIDOS_POST_MONGODB, data);
      res.redirect('/enviado')
})

app.get('/enviado', async (req, res) =>{
    await axios.get(process.env.URL_API_INICIO_SOBRE).then(function(data){
        var iniciosobre = data.data.map(function(val){
            return {
                inicio: val.inicio,
                sobre: val.sobre,
                contato: val.contato
            }
        })
        res.render('confirmed',{data_iniciosobre:iniciosobre});
    })
})

app.get('/oracoes', async (req, res) =>{
    await axios.get(process.env.URL_API_INICIO_SOBRE).then(function(data){
        var iniciosobre = data.data.map(function(val){
            return {
                inicio: val.inicio,
                sobre: val.sobre,
                contato: val.contato
            }
        })
        axios.get(process.env.URL_PEDIDOS_GET_MONGODB).then(function(data){
        data.data.reverse();
        const urlDelet = "https://serverpedidoscda.vercel.app/deletaroracao";
        var pedidoscdaoracao = data.data.map(function(val){
            return {
                id: val._id,
                name: val.name,
                telefone: val.telefone,
                pedido: val.pedido,
                createdAt: val.createdAt,
            }
        })
            res.render('oracoes',{data_iniciosobre:iniciosobre,pedidositems:pedidoscdaoracao,deletar:urlDelet});
    })
    })
})

var usuarios = [
    {
        nome: 'Marcelo',
        senha: 'prmarcelo9090',
    }
]

app.post('/cursodemembresia/usuarios', async (req,res)=>{
    // const data = moment(new Date()).format('DD/MM/YYYY');
    await usuarios.map(function(val){
        if(val.nome == req.body.login && val.senha == req.body.senha){
            axios.get(process.env.URL_ADD_CDM_GET_MONGO).then(function(data){
                data.data.reverse();
                var usercdm = data.data.map(function(val){
                    return {
                        id: val._id,
                        nome: val.nome,
                        nascimento: val.nascimento,
                        telefone: val.telefone,
                        estadocivil: val.estadocivil,
                        naturalde: val.naturalde,
                        endereco: val.endereco,
                        createdAt: val.createdAt,
                    }
                })
                    res.render('logado',{users:usercdm});
            })
        }else{
            res.render('login');
        }
    })
})

app.get('/cursodemembresia/usuarios', async (req,res)=>{
    if(req.session.nome == null){
        res.render('login');
    }else{
        axios.get(process.env.URL_ADD_CDM_GET_MONGO).then(function(data){
            data.data.reverse();
            var usercdm = data.data.map(function(val){
                return {
                    id: val._id,
                    nome: val.nome,
                    nascimento: val.nascimento,
                    telefone: val.telefone,
                    estadocivil: val.estadocivil,
                    naturalde: val.naturalde,
                    endereco: val.endereco,
                    createdAt: val.createdAt,
                }
            })
                res.render('logado',{users:usercdm});
        })
    }
});

app.get('/cursodemembresia', async (req, res) =>{
    await axios.get(process.env.URL_API_INICIO_SOBRE).then(function(data){
        var iniciosobre = data.data.map(function(val){
            return {
                inicio: val.inicio,
                sobre: val.sobre,
                contato: val.contato
            }
        })
        axios.get(process.env.URL_API_LINKS_CONTATO).then(function(data){
            var linkscontato = data.data.map(function(val){
                return {
                    img: val.img,
                    title: val.title,
                    url: val.url
                }
            })
            res.render('cursom',{data_iniciosobre:iniciosobre, contat:linkscontato});
        })
    })
})

app.post('/cursodemembresia', async (req, res) =>{
    const data = {
        nome: req.body.nome,
        nascimento: req.body.nascimento,
        telefone: req.body.telefone,
        estadocivil: req.body.estadocivil,
        naturalde: req.body.natural,
        endereco: req.body.enereco
      };
      await axios.post(process.env.URL_ADD_CDM_POST_MONGO, data);
      res.redirect('/enviado')
})

app.use(function(req, res, next) {
    res.status(404).render('404');
});

app.listen(process.env.PORT || 3000,()=>{
    console.log('server rodando na porta 3000');
})
