if(process.env.NODE_ENV === 'production'){
    // Configurações para produção
    module.exports = {mongoURI: process.env.MONGO_URL};
}else{
    // Configurações para desenvolvimento
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'};
}