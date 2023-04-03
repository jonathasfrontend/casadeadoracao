const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fileUpload = require('express-fileupload');
const axios = require('axios');

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
      res.redirect('/pedidoenviado')
})

app.get('/pedidoenviado', async (req, res) =>{
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
        var pedidoscdaoracao = data.data.map(function(val){
            return {
                name: val.name,
                telefone: val.telefone,
                pedido: val.pedido,
                createdAt: val.createdAt,
            }
        })
            res.render('oracoes',{data_iniciosobre:iniciosobre,pedidositems:pedidoscdaoracao});
    })
    })
})

var usuarios = [
    {
        nome: 'Jonathas',
        email: 'jonathass5678@gmail.com',
        senha: '@Jona20182293325',
    }
]

app.post('/admin', async (req,res)=>{
    await usuarios.map(function(val){
        if(val.email == req.body.login && val.senha == req.body.senha){

            axios.get(process.env.URL_API_INICIO_SOBRE).then(function(data){
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
                    res.render('logado',{data_iniciosobre:iniciosobre, contat:linkscontato});
                })
            })

        }else{
           axios.get(process.env.URL_API_INICIO_SOBRE).then(function(data){
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
                    res.render('login',{data_iniciosobre:iniciosobre, contat:linkscontato});
                })
            })
        }
    })
})

app.get('/admin', async (req,res)=>{
    if(req.session.email == null){
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
                res.render('login',{data_iniciosobre:iniciosobre, contat:linkscontato});
            })
        })
    }else{
        
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
                res.render('logado',{data_iniciosobre:iniciosobre, contat:linkscontato});
            })
        })

    }
});

app.use(function(req, res, next) {
    res.status(404).render('404');
});

app.listen(process.env.PORT || 3000,()=>{
    console.log('server rodando na porta 3000');
})
