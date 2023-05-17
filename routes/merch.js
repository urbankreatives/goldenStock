var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Cart = require('../models/cart');
var Dispatch = require('../models/dispatch');
var Category = require('../models/stock');
var nodemailer = require('nodemailer');
var Product = require('../models/product');
var Sales = require('../models/sales');
var ShopStock = require('../models/shopStock');
var QStats = require('../models/qtyStats');
var PStats = require('../models/productStats');
var Message = require('../models/message');
var Recepient = require('../models/recepients');
var Time = require("intl-relative-time-format");
var CStats = require('../models/categoryStats');
var IncStats = require('../models/incomeStats');
var Shop = require('../models/shop');
var Stock = require('../models/stock');
var Note = require('../models/note');
var SalesStats= require('../models/salesStats');
const keys = require('../config1/keys')
const stripe = require('stripe')('sk_test_IbxDt5lsOreFtqzmDUFocXIp0051Hd5Jol');
var xlsx = require('xlsx')
var multer = require('multer')
const fs = require('fs')
var path = require('path');
var passport = require('passport');
var moment = require('moment')
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const jwt = require('jsonwebtoken');
const JWT_KEY = "jwtactive987";
const JWT_RESET_KEY = "jwtreset987";


router.get('/deliveries',isLoggedIn,function(req,res){
    var shop = req.user.shop
    var customer = req.user.customer

    var pro = req.user
    const arr = []
  const m = moment();
    var id =req.user._id

   
      
            console.log(req.user._id)
            console.log(req.user.email)
              Note.find({recId:req.user._id},function(err,docs){
                console.log(docs,'docs')
             for(var i = 0;i<docs.length;i++){
      
             
               let date = docs[i].date
               let id = docs[i]._id
               let timeX = moment(date)
               let timeX2 =timeX.fromNow()
               console.log(timeX2,'timex2')
      
               Note.findByIdAndUpdate(id,{$set:{status4:timeX2}},function(err,locs){
      
               
               
              // Format relative time using negative value (-1).
      
                
              })
            }
      
            Note.find({recId:req.user._id,status1:'new'},function(err,flocs){
              var les 
           
              Note.find({recId:req.user._id,status:'not viewed'},function(err,jocs){
               les = jocs.length > 0
            
              for(var i = flocs.length - 1; i>=0; i--){
          
                arr.push(flocs[i])
              }
           
    Dispatch.find({shop:shop, customer:customer,status:'Pending'},(err, docs) => {
        if (!err) {
            res.render("merchant/list", {
               listX:docs, pro:pro,list:arr, les:les
              
            });
        }
    });

})
              
})

})



})
  


//update subject
router.get('/deliveries/:id',function(req,res){
    var pro = req.user
 Dispatch.findById(req.params.id, (err, doc) => {
   if (!err) {
   
       res.render("merchant/update", {
          
           doc: doc,pro:pro
         
           
       });
     
   }
});



})


router.post('/deliveries/:id',isLoggedIn,   (req, res) => {
 var pro = req.user
 var m = moment()
 var fullname = req.user.fullname
 var year = m.format('YYYY')
 var dateValue = m.valueOf()
 var date = m.toString()
 var id = req.params.id;
 var name = req.body.name;
 var shop = req.user.shop
 var customer = req.user.customer
 var category = req.body.category;
 var barcodeNumber = req.body.barcodeNumber
 var quantityDispatched = req.body.quantityDispatched
 let status3 = req.body.status3
 var quantityReceived = req.body.quantityReceived

        let reg = /\d+\.*\d*/g;

        let result = quantityReceived.match(reg)
        let quan = Number(result)
 var quantityVariance = quantityReceived - quantityDispatched
if(quantityDispatched > quantityReceived){
    status3 ="Pending"
    console.log('yes')
}


console.log(quantityReceived,"qtyReceived")
 req.check('name','Enter Name Of Subject').notEmpty();
 req.check('category','Enter Category').notEmpty();
 req.check('barcodeNumber','Enter Barcode Number').notEmpty();
 req.check('status3','Enter Answer').notEmpty();
 req.check('quantityReceived','Enter Quantity Delivered').notEmpty();

 
   
 var errors = req.validationErrors();



  if (errors) {
 
    
       req.session.errors = errors;
       req.session.success = false;
       res.render('merchant/update',{ errors:req.session.errors,pro:pro})
    
   
   }
 
else
{

   

        ShopStock.find({barcodeNumber:barcodeNumber},function(err,docs){
  
                if(docs.length == 0)
                {

    
           
    
                    var pass =ShopStock();
                    pass.barcodeNumber = barcodeNumber;
                    pass.name = name
                    pass.category= category;
                    pass.date = date
                    pass.dateValue = dateValue
                    pass.openingQuantity=quantityReceived;
                    pass.currentQuantity = quantityReceived;
                    pass.receiver = fullname;
                    pass.customer = customer;
                    pass.shop = shop;
                    pass.rate = 0
                    pass.zwl = 0
                    pass.price = 0
                
        
                    pass.save()
            .then(pas =>{

            })
        }
        else{
            var  idX  = docs[0]._id
            let openingQuantity = docs[0].currentQuantity
            var xquant = docs[0].currentQuantity + quan
            console.log(xquant,'xquant')
            ShopStock.findByIdAndUpdate(idX,{$set:{currentQuantity:xquant,openingQuantity:openingQuantity}},function(err,locs){

            })
        }
       
        Dispatch.findByIdAndUpdate(id,{$set:{status:status3,status3:status3,qtyReceived:quantityReceived, quantityVariance:quantityVariance}},function(err,locs){

        })

      
            })

res.redirect('/merch/deliveries')
   
}

});









router.get('/update',isLoggedIn,function(req,res){
    var shop = req.user.shop
    var customer = req.user.customer
    res.render('merchant/stockUpdate',{shop:shop,customer:customer})
})


router.post('/update',isLoggedIn,function(req,res){
var shop = req.body.shopName
var m = moment()
var year = m.format('YYYY')
var dateValue = m.valueOf()
var date = m.toString()
var customer = req.body.customer
var productName = req.body.name
var category = req.body.category
var quan = req.body.quantity
var barcodeNumber = req.body.barcodeNumber
console.log(barcodeNumber,'barcodeNumber')
console.log(quan,'quantity')
let reg = /\d+\.*\d*/g;

let result = quan.match(reg)
let currentStock = Number(result)

ShopStock.find({barcodeNumber:barcodeNumber,shop:shop,customer:customer},function(err,docs){
let oldStock = docs[0].currentQuantity
let sales = docs[0].currentQuantity - currentStock
ShopStock.findByIdAndUpdate(docs[0]._id,{$set:{currentStock:currentStock, openingQuantity:oldStock}},function(err,locs){

})




var sale = new Sales()
sale.productName = productName
sale.category = category
sale.barcodeNumber = barcodeNumber
sale.qty = sales
sale.date = date
sale.dateValue = dateValue
sale.customer = customer
sale.shop = shop
sale.price =0
sale.openingStock =oldStock
sale.newStock = currentStock
sale.save()
.then(sal =>{

})




res.redirect('/merch/update')
})





})







router.get('/viewStock',isLoggedIn,function(req,res){
    var shop = req.user.shop
    var customer = req.user.customer
    var pro = req.user
    ShopStock.find({shop:shop, customer:customer},(err, docs) => {
        if (!err) {
            res.render("merchant/listX2", {
               list:docs, pro:pro
              
            });
        }
    });
  
})




function encryptPassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);  
  };
  
    module.exports = router;
  
    function isLoggedIn(req, res, next) {
      if (req.isAuthenticated()) {
          return next();
      }
      else{
          res.redirect('/')
      }
    }
    
      
      