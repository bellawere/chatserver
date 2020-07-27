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

var bd = [];

var quizdata = {};
var resultado = [];
var contagem = [];
var total = "";

var url = "";

app.get('/ativos', function(req, res){
    res.json(usuarios);
});

app.get('/banco', function(req,res){
    res.json(bd);
});

app.get("/result", (req2, res2) =>{

    resultado.forEach((x) => {contagem[x] = (contagem[x] || 0)+1; });
    total = resultado.length;

    res2.json({
        contagem: contagem,
        total: total
    });
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
            chat = chat.slice(1);
        }
    });

    user.on("disconnect", function(){
        if(usuarios[user.id] !== "undefined" && usuarios[user.id] != null){
            console.log(usuarios[user.id] + " foi desconectado");
            var data = {
                nome: "Sistema",
                mensagem: usuarios[user.id] + " saiu do servidor"
            }
            chat.push(data);
            io.emit("chat",chat);
            delete usuarios[user.id];
        }
    });

    user.on("quiz", function(data){
        quizdata = data;
        io.emit("quiz", data);
    });

    user.on("reset", function(){
        var dados = {quizdata,resultado,contagem,total};
        bd.push(dados);
        resultado = [];
        contagem = [];
        total = "";
    })
    
    user.on("answer", function(data){
        resultado.push(data);
    });

    user.on("result", function(){
        resultado.forEach((x) => {contagem[x] = (contagem[x] || 0)+1; });
        total = resultado.length;
        var toEmit = {
            contagem:contagem,
            result: resultado,
            total:total
        }
        io.emit("result",toEmit);
    });

    user.on("video", function(){
        io.emit("videourl",url);
    });

    user.on("videourl", function(data){
        url = data;
        io.emit("videourl", url);
    });

    user.on("refresh", function(){
        io.emit("refresh",1);
    })
    
});

server.listen(port, () => {
    console.log('Servidor rodando na porta ' + port)
});