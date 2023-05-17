var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({

    barcodeNumber:{type:String, required:true},
    name: {type: String, required:true },
    category: { type: String, required:true },
    quantity: {type: Number, required: true},
    date: {type: String, required: true},
    dateValue: {type: Number, required: true},
    receiver: {type: String, required: true},
    rate: {type: Number, required: true},
    zwl: {type: Number, required: true},
    price: {type: Number, required: true},
});

module.exports = mongoose.model('Stock', schema);