const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose')
const linkify = require('linkifyjs');
const Noticias = require('./models/noticias')

const app = express();

function ehImagem(url) {
    const extensoesImagem = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    return extensoesImagem.some((extensao) => url.toLowerCase().endsWith(extensao));
  }
  
  // Função para detectar e transformar URLs em links clicáveis com o texto ou imagem
  function detectarLinks(texto) {
    const tokens = linkify.find(texto);
    let linkedText = '';
  
    let lastIndex = 0;
    for (const token of tokens) {
      if (token.type === 'url') {
        const linkContent = texto.substring(lastIndex, token.start);
        if (linkContent.trim() !== '') {
          linkedText += linkContent; // Adiciona o texto antes da URL
        }
  
        if (ehImagem(token.href)) {
          linkedText += `<img src="${token.href}" alt="Imagem" />`; // Adiciona a imagem
        } else {
          linkedText += `<a href="${token.href}" target="_blank">${token.value}</a>`; // Adiciona o link clicável
        }
        lastIndex = token.end;
      }
    }
    linkedText += texto.substring(lastIndex); // Adiciona o texto após a última URL
  
    return linkedText;
  }
  

require('dotenv').config();
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true})); 
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
app.get('/blog', async (req, res) => {
    try {
        const [inicioSobre, linksContato, noticia] = await Promise.all([
            axios.get(process.env.URL_API_INICIO_SOBRE),
            axios.get(process.env.URL_API_LINKS_CONTATO),
            axios.get(process.env.URL_NOTICIA_GET_MONGO)
        ]);

        const iniciosobre = inicioSobre.data.map(({ inicio, sobre, contato }) => ({
            inicio,
            sobre,
            contato
        }));

        const linkscontato = linksContato.data.map(({ img, title, url }) => ({
            img,
            title,
            url
        }));

        const post = noticia.data.map(({ _id, title, category, body, createdAt, autor }) => ({
            id: _id,
            title,
            category,
            body: body.substr(0, 200),
            createdAt,
            autor
        }));

        const postLimit = post.slice(0, 4);

        res.render('blog', { data_iniciosobre: iniciosobre, contat: linkscontato, post, nLimit: postLimit });
    } catch (error) {
        console.error(error);
    }
});
app.get('/blog/:id', async (req, res) => {
    try {
        const [responseSobre, responseLinksContato] = await Promise.all([
            axios.get(process.env.URL_API_INICIO_SOBRE),
            axios.get(process.env.URL_API_LINKS_CONTATO)
        ]);

        const iniciosobre = responseSobre.data.map(({ inicio, sobre, contato }) => ({
            inicio,
            sobre,
            contato
        }));

        const linkscontato = responseLinksContato.data.map(({ img, title, url }) => ({
            img,
            title,
            url
        }));

        const slug = req.params.id;
        const postesn = await Noticias.findById(slug, { body: 1, title: 1 });

        if (postesn) {
            postesn.body = detectarLinks(postesn.body);
            res.render('post', { data_iniciosobre: iniciosobre, contat: linkscontato, postesn });
        } else {
            res.status(404).render('404');
        }
    } catch (error) {
        console.error(error);
    }
});
app.post('/blog/search', async (req, res) => {
    try {
        const [inicioSobre, linksContato, noticia2] = await Promise.all([
            axios.get(process.env.URL_API_INICIO_SOBRE),
            axios.get(process.env.URL_API_LINKS_CONTATO),
            axios.get(process.env.URL_NOTICIA_GET_MONGO)
        ]);

        const iniciosobre = inicioSobre.data.map(({ inicio, sobre, contato }) => ({
            inicio,
            sobre,
            contato
        }));

        const linkscontato = linksContato.data.map(({ img, title, url }) => ({
            img,
            title,
            url
        }));
        
        const postLimit = noticia2.data.map(({ _id, title, category, body, createdAt, autor }) => ({
            id: _id,
            title,
            category,
            body: body.substr(0, 100),
            createdAt,
            autor
        }));

        postLimit.reverse();
        const nLimit = postLimit.slice(0, 4);

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Noticias.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
                { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
            ]
        });

        if (data.length === 0) {
            return res.redirect('/blog');
        }

        res.render("search", { data, data_iniciosobre: iniciosobre, contat: linkscontato, nLimit });
    } catch (error) {
        console.error(error);
    }
});
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
});

mongoose.connect('mongodb+srv://root:Jonathas001@cluster0.vmkcvsj.mongodb.net/?retryWrites=true&w=majority')
.then(()=>{console.log("bd connected")})
.catch(()=>{console.log("Deu ruin")});


app.use(function(req, res, next) {
    res.status(404).render('404');
});

app.listen(process.env.PORT || 3000,()=>{
    console.log('server rodando na porta 3000');
})
