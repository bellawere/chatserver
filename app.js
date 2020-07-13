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
            var data = {
                nome: "Sistema",
                mensagem: nome + " entrou no servidor"
            }
            chat.push(data);
            io.emit("chat",chat);
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

        console.log(chat.length);

        while(chat.length > 100){
            chat.pop();
        }
    });

    user.on("disconnect", function(){
        if(usuarios[user.id] !== "undefined"){
            console.log(usuarios[user.id] + " foi desconectado");
            var data = {
                nome: "Sistema",
                mensagem: nome + " saiu do servidor"
            }
            chat.push(data);
            io.emit("chat",chat);
            delete usuarios[user.id];
        }
    });
});

server.listen(port, () => {
    console.log('Servidor rodando na porta ' + port)
});