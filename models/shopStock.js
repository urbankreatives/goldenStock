var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({

    barcodeNumber:{type:String, required:true},
    name: {type: String, required:true },
    category: { type: String, required:true },
    openingQuantity: {type: Number, required: true},
    currentQuantity: {type: Number, required: true},
    date: {type: String, required: true},
    dateValue: {type: Number, required: true},
    receiver: {type: String, required: true},
    rate: {type: Number, required: true},
    zwl: {type: Number, required: true},
    price: {type: Number, required: true},
});

module.exports = mongoose.model('Shop Stock', schema);