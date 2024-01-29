<% for(let i = 0; i < users.length; i++) { %>
  <div class="usuarios">
    <p>Nome: <strong><%= users[i].nome %></strong></p>
    <p>Data de nascimento: <strong><%= users[i].nascimento %></strong></p>
    <p>telefone: <strong><%= users[i].telefone %></strong></p>
    <p>estadocivil: <strong><%= users[i].estadocivil %></strong></p>
    <p>naturalde: <strong><%= users[i].naturalde %></strong></p>
    <p>endereco: <strong><%= users[i].endereco %></strong></p>
    <p>createdAt: <strong><%= users[i].createdAt %></strong></p>
  </div>
<% } %>

#header
<li><a href="/blog">Blog</a></li></ul>
<div class="header-btn">
    <a class="M1" href="/pedidosdeoracao">Pedido de Oração</a>
    <a class="M1" href="/cursodemembresia">Curso de membresia</a>
</div>
<li><a href="/blog">Blog</a></li>
<li><a class="M1" href="/pedidosdeoracao">Pedido de Oração</a></li>
<li><a class="M1" href="/cursodemembresia">Curso de membresia</a></li>

js urls

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