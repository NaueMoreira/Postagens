const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategoriaSchema = new Schema({
    nome: {
        type: String,
        required: true
    },

    slug:{
        type: String,
        required: true
    },

    autor:{
        type: Schema.Types.ObjectId,
        ref: "usuarios",
        required: true
    },

    data: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('categorias', CategoriaSchema);