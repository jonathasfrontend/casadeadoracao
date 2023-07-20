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