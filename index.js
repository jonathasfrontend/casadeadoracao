const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const mongoose = require('mongoose')
const uuid = require('uuid');
const linkify = require('linkifyjs');
const Noticias = require('./models/noticias')
const Comment = require('./models/comment')

const port = 3000;
const app = express();

function ehImagem(url) {
    const extensoesImagem = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
    return extensoesImagem.some((extensao) => url.toLowerCase().endsWith(extensao));
}
function detectarLinks(texto) {
const tokens = linkify.find(texto);
let linkedText = '';

let lastIndex = 0;
for (const token of tokens) {
    if (token.type === 'url') {
    const linkContent = texto.substring(lastIndex, token.start);
    if (linkContent.trim() !== '') {
        linkedText += linkContent;
    }

    if (ehImagem(token.href)) {
        linkedText += `<img src="${token.href}" alt="Imagem" />`;
    } else {
        linkedText += `<a href="${token.href}" target="_blank">${token.value}</a>`;
    }
    lastIndex = token.end;
    }
}
linkedText += texto.substring(lastIndex);

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
    try {
        const [
            responseInicioSobre,
            responseProjetos,
            responseConteConosco,
            responseLinksContato
        ] = await Promise.all([
            axios.get(process.env.URL_API_INICIO_SOBRE),
            axios.get(process.env.URL_API_PROJETO),
            axios.get(process.env.URL_API_CONTECONOSCO),
            axios.get(process.env.URL_API_LINKS_CONTATO)
        ]);
    
        const iniciosobre = responseInicioSobre.data.map(({ inicio, sobre, contato }) => ({
            inicio,
            sobre,
            contato
        }));
    
        const projetos = responseProjetos.data.map(({ img, title, sobre, url }) => ({
            img,
            title,
            sobre,
            url
        }));
    
        const conteconosco = responseConteConosco.data.map(({ img_url, nome, type }) => ({
            img_url,
            nome,
            type
        }));
    
        const linkscontato = responseLinksContato.data.map(({ img, title, url }) => ({
            img,
            title,
            url
        }));
    
        res.render('home', {data_iniciosobre: iniciosobre, dataprojetos: projetos, data_cont: conteconosco, contat: linkscontato});
    } catch (error) {
        console.error(error);
    }
})
app.get('/escoladefundamentos',async (req, res) => {
    try {
        const [responseInicioSobre, responseLinksContato, responseEscolaDeFundamentos, responseEdfMestres] = await Promise.all([
            axios.get(process.env.URL_API_INICIO_SOBRE),
            axios.get(process.env.URL_API_LINKS_CONTATO),
            axios.get(process.env.URL_API_ESCOLADEFUNDAMENTOS),
            axios.get(process.env.URL_API_EDFMESTRES)
        ]);
        const iniciosobre = responseInicioSobre.data.map(({ inicio, sobre, contato }) => ({
            inicio,
            sobre,
            contato
        }))
        const linkscontato = responseLinksContato.data.map(({ img, title, url }) => ({
            img,
            title,
            url
        }));
        const edfcontent = responseEscolaDeFundamentos.data.map(({ Visao, Missao, Desenvolvimento, Modulos, Mestres, link_curso, objetivo }) => ({
            Visao,
            Missao,
            Desenvolvimento,
            Modulos,
            Mestres,
            link_curso,
            objetivo
        }));
        const edfmestres = responseEdfMestres.data.map(({ nome, denominacao, avatar }) => ({
            nome,
            denominacao,
            avatar
        }));
        res.render('edf', { data_iniciosobre: iniciosobre, contat: linkscontato, edf: edfcontent, edfmestres });
    } catch (error) {
        console.error(error);
    }
    
})
app.get('/pedidosdeoracao',async (req, res) => {
    try {
        const responseInicioSobre = await axios.get(process.env.URL_API_INICIO_SOBRE);
        const iniciosobre = responseInicioSobre.data.map(({ inicio, sobre, contato }) => ({
            inicio,
            sobre,
            contato
        }));
    
        res.render('pedidos', { data_iniciosobre: iniciosobre });
    } catch (error) {
        console.error(error);
    }
    
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
app.post('/contatos',async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            number: req.body.number,
            menssagem: req.body.menssagem,
            };
        await axios.post(process.env.URL_CONTATOS_POST_MONGO, data);
        res.redirect('/enviado')
    } catch (error) {
        console.log(error)
    }
    
})
app.get('/blog', async (req, res) => {
    try {
        const [inicioSobre, linksContato, noticia, categoria] = await Promise.all([
            axios.get(process.env.URL_API_INICIO_SOBRE),
            axios.get(process.env.URL_API_LINKS_CONTATO),
            axios.get(process.env.URL_NOTICIA_GET_MONGO),
            axios.get(process.env.URL_GET_CATEGORIA_MONGO),
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

        const post = noticia.data.map(({ _id, title, category, body, createdAt, autor, views }) => ({
            id: _id,
            title,
            category,
            body: body.substr(0, 200),
            createdAt,
            autor,
            views
        }));
        
        const getCategoria = categoria.data.map(({ _id, categoria }) => ({
            id: _id,
            categoria,
        }));

        post.reverse();
        const postLimit = post.slice(0, 4);

        res.render('blog', { data_iniciosobre: iniciosobre, contat: linkscontato, post, nLimit: postLimit, getCategoria });
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
        const postesn = await Noticias.findById({ _id: slug });

        if (postesn) {
            postesn.views++;
            postesn.save();
            postesn.body = detectarLinks(postesn.body);

            const comments = await Comment.find({ postId: slug });
            comments.reverse();
            res.render('post', { data_iniciosobre: iniciosobre, contat: linkscontato, postesn, comments });
        } else {
            res.status(404).render('404');
        }
    } catch (error) {
        console.error(error);
    }
});
app.post('/blog/:id/comment', async (req, res) => {
    const slug = req.params.id;
    const { name, comment } = req.body;
    const newComment = new Comment({ name, comment, postId: slug, _id: uuid.v4() });

    try {
        // Salvar o comentário no banco de dados
        await newComment.save();

        // Redirecionar de volta à página do post após salvar o comentário
        res.redirect(`/blog/${slug}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao adicionar o comentário.' });
    }
});
app.post('/blog/search', async (req, res) => {
try {
    const [inicioSobre, linksContato, noticia2, categoria] = await Promise.all([
        axios.get(process.env.URL_API_INICIO_SOBRE),
        axios.get(process.env.URL_API_LINKS_CONTATO),
        axios.get(process.env.URL_NOTICIA_GET_MONGO),
        axios.get(process.env.URL_GET_CATEGORIA_MONGO),
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
    
    const postLimit = noticia2.data.map(({ _id, title, category, body, createdAt, autor, views }) => ({
        id: _id,
        title,
        category,
        body: body.substr(0, 200),
        createdAt,
        autor,
        views
    }));

    const getCategoria = categoria.data.map(({ _id, categoria }) => ({
        id: _id,
        categoria,
    }));

    postLimit.reverse();
    const nLimit = postLimit.slice(0, 4);

    let search = req.body.search;
    const searchNoSpecialChar = search.replace(/[^a-zA-Z0-9 ]/g, "");

    const data = await Noticias.find({
        $or: [
            { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
            { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
            { autor: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
            { category: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]
    });

    if (data.length === 0) {
        return res.redirect('/blog');
    }

    res.render("search", { data, data_iniciosobre: iniciosobre, contat: linkscontato, nLimit, getCategoria });
} catch (error) {
    console.error(error);
}
});
app.get('/enviado', async (req, res) =>{
    try {
        const response = await axios.get(process.env.URL_API_INICIO_SOBRE);
        const iniciosobre = response.data.map(({ inicio, sobre, contato }) => ({
            inicio,
            sobre,
            contato
        }));
        res.render('confirmed', { data_iniciosobre: iniciosobre });
    } catch (error) {
        console.error(error);
    }
})
app.get('/cursodemembresia', async (req, res) =>{
    try {
        const [responseInicioSobre, responseLinksContato] = await Promise.all([
            axios.get(process.env.URL_API_INICIO_SOBRE),
            axios.get(process.env.URL_API_LINKS_CONTATO)
        ]);
    
        const iniciosobre = responseInicioSobre.data.map(({ inicio, sobre, contato }) => ({
            inicio,
            sobre,
            contato
        }));
    
        const linkscontato = responseLinksContato.data.map(({ img, title, url }) => ({
            img,
            title,
            url
        }));
    
        res.render('cursom', { data_iniciosobre: iniciosobre, contat: linkscontato });
    } catch (error) {
        console.error(error);
    }    
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
.then(()=>{console.log("Banco de dados conectado!")})
.catch(()=>{console.log("Falha ao conectar com o banco!")});


app.use(function(req, res, next) {
    res.status(404).render('404');
});

app.listen(process.env.PORT || port,()=>{
    console.log(`Aplicação rodando, porta:${port}`);
})
