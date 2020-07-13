const app = require('express')();
const cors = require('cors');
const server = require('http').Server(app);
const port = process.env.PORT || 5000;

const io = require('socket.io')(server, {
    path:"/"
});

app.use(cors());

app.get('/', function(req, res){
    res.send('Servidor ativo');
});

var usuarios = {};
var chat = [];

app.get('/ativos', function(req, res){
    res.json(usuarios);
});

io.on("connection", function(user){
    
    user.on("join", function(nome){
        
        if(usuarios[user.id] !== "undefined"){
            console.log("Usuário " + nome + " entrou");
            usuarios[user.id] = nome;
            user.emit("update", "Bem-vindo ao Chat");
            io.emit("update",nome + " entrou no servidor");
        }

    });

    user.on("send", function(msg){
        console.log("Mensagem de " + usuarios[user.id] + ": " + msg);
        var data = {
            nome:usuarios[user.id],
            mensagem:msg
        }
        chat.push(data);
        io.emit("chat", chat);
    });

    user.on("disconnect", function(){
        if(usuarios[user.id] !== "undefined"){
            console.log(usuarios[user.id] + " foi desconectado");
            io.emit("update", usuarios[user.id] + " saiu");
            delete usuarios[user.id];
        }
    });
});

server.listen(port, () => {
    console.log('Servidor rodando na porta ' + port)
});