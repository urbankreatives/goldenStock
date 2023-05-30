var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    barcodeNumber:{type:String, required:true},
    name: {type: String, required:true },
    category: { type: String, required:true },
    openingQuantity: {type: Number, required: true},
    rcvdQuantity: {type: Number, required: true},
    quantity: {type: Number, required: true},
    caseUnits: {type: Number, required: true},
    filename: {type: String, required: true},
    rate: {type: Number, required: true},
    zwl: {type: Number, required: true},
    price: {type: Number, required: true},
});

module.exports = mongoose.model('Product', schema);