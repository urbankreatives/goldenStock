var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Cart = require('../models/cart');
var Dispatch = require('../models/dispatch');
var Category = require('../models/stock');
var nodemailer = require('nodemailer');
var Product = require('../models/product');
var Chart = require('../models/chart')
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
/*const connectEnsureLogin = require('connect-ensure-login')*/


var storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,file.originalname)
    }
})



var upload = multer({
    storage:storage
})








router.get('/', function (req, res, next) {
  var messages = req.flash('error');
  
  res.render('login', { messages: messages, hasErrors: messages.length > 0});
});
router.post('/', passport.authenticate('local.signin', {
  failureRedirect: '/',
  failureFlash: true
}), function (req, res, next) {
  if(req.user.role == "admin"){
    res.redirect("/dash");
  }else if (req.user.role == 'merchant')
  res.redirect('/merch/deliveries')
 

  
});

router.get('/chartX',isLoggedIn,function(req,res){
  res.render('product/chart')
})

router.get('/chartAjax',isLoggedIn,function(req,res){
  res.render('product/dashAjax')
})
router.get('/dash',isLoggedIn,function(req,res){
  res.render('product/index')
})

router.get('/dashStock',isLoggedIn,function(req,res){
  res.render('product/chart')
})


router.get('/dashChartX',isLoggedIn,function(req,res){
  var customer = req.body.customer
  var shop = req.body.shop
  var category = req.body.category
  var product = req.body.product
  var date = req.body.date
  var arr = []
  
  var m = moment(date)
  console.log(date.split('-')[0])
  var startDate = date.split('-')[0]
  var endDate = date.split('-')[1]
   var startValue = moment(startDate).valueOf()
   var endValue = moment(endDate).valueOf()
  console.log(startValue,endValue,'output')
  Sales.find({customer:customer,shop:shop},function(err,docs) {
    for(var i = 0;i<docs.length;i++){

      let sdate = docs[i].dateValue
      if(sdate >= startValue && sdate <= endValue){
        let productName = docs[i].productName
        let category = docs[i].category
        let barcodeNumber = docs[i].barcodeNumber
        
        let qty = docs[i].qty

       
        

        Chart.find({barcodeNumber:barcodeNumber},function(err,locs) {
          console.log(locs.length)
    if(locs.length == 0 ){

      

      var chart = Chart();
            chart.productName = productName
            chart.category = category;
            chart.barcodeNumber = barcodeNumber
            chart.qty = qty
            chart.customer = customer
            chart.shop = shop
            chart.save()
    .then(chartX =>{

      
      arr.push(chartX)

    })

    }else{
let qtyX = docs[i].qty + locs[0].qty
Chart.findByIdAndUpdate(locs[0]._id,{$set:{qty:qtyX}},function(err,koc){
  arr.push(koc)
})
    }
        })

//arr.push(docs[i])
      }
    }
    //console.log(arr,'arr')
       
    res.send(arr)
   
});
})
router.get('/add',function(req,res){

 

    res.render('admitHb')
 
 
})

router.post('/dashChart',isLoggedIn,function(req,res){
  var customer = req.body.customer
  var shop = req.body.shop
  var category = req.body.category
  var product = req.body.product
  var date = req.body.date
  var arr = []
  var id = req.user._id
  let num = req.user.num
  num++
  
  var m = moment(date)
  console.log(date.split('-')[0])
  var startDate = date.split('-')[0]
  var endDate = date.split('-')[1]
   var startValue = moment(startDate).valueOf()
   var endValue = moment(endDate).valueOf()
  console.log(startValue,endValue,'output')


  Sales.find({customer:customer,shop:shop},function(err,docs) {
    for(var i = 0;i<docs.length;i++){

      let sdate = docs[i].dateValue
      if(sdate >= startValue && sdate <= endValue){
        
       if(arr.length > 0 && arr.find(value => value.barcodeNumber == docs[i].barcodeNumber)){
              console.log('true')
             arr.find(value => value.barcodeNumber == docs[i].barcodeNumber).qty += docs[i].qty;
        }else{
arr.push(docs[i])
        }

      }
    }
    //console.log(arr,'arr')
   res.send(arr)
  })

})

router.post('/dashChartC',isLoggedIn,function(req,res){
  var customer = req.body.customer
  var shop = req.body.shop

  var date = req.body.date
  var arr = []
  var id = req.user._id
  let num = req.user.num
  num++
  
  var m = moment(date)
  console.log(date.split('-')[0])
  var startDate = date.split('-')[0]
  var endDate = date.split('-')[1]
   var startValueA = moment(startDate)
   var startValueB=startValueA.subtract(1,"days");
   var startValue = moment(startValueB).valueOf()

   var endValueA = moment(endDate)
   var endValueB = endValueA.add(1,"days");
   var endValue= moment(endValueB).valueOf()
  console.log(startValue,endValue,'output')


  Sales.find({customer:customer,shop:shop},function(err,docs) {
   // console.log(docs,'docs')
    for(var i = 0;i<docs.length;i++){

      let sdate = docs[i].dateValue
      if(sdate >= startValue && sdate <= endValue){
        console.log(docs[i],'docs')
       if(arr.length > 0 && arr.find(value => value.category == docs[i].category)){
              console.log('true')
             arr.find(value => value.category == docs[i].category).qty += docs[i].qty;
        }else{
arr.push(docs[i])
        }

      }
    }
   // console.log(arr,'arr')
   res.send(arr)
  })

})





router.post('/dashChartCS',isLoggedIn,function(req,res){
  var customer = req.body.customer
 

  var date = req.body.date
  var arr = []
  var id = req.user._id
  let num = req.user.num
  num++
  
  var m = moment(date)
  console.log(date.split('-')[0])
  var startDate = date.split('-')[0]
  var endDate = date.split('-')[1]
   var startValueA = moment(startDate)
   var startValueB=startValueA.subtract(1,"days");
   var startValue = moment(startValueB).valueOf()

   var endValueA = moment(endDate)
   var endValueB = endValueA.add(1,"days");
   var endValue= moment(endValueB).valueOf()
  console.log(startValue,endValue,'output')


  Sales.find({customer:customer},function(err,docs) {
   // console.log(docs,'docs')
    for(var i = 0;i<docs.length;i++){

      let sdate = docs[i].dateValue
      if(sdate >= startValue && sdate <= endValue){
        console.log(docs[i],'docs')
       if(arr.length > 0 && arr.find(value => value.shop == docs[i].shop)){
              console.log('true')
             arr.find(value => value.shop == docs[i].shop).qty += docs[i].qty;
        }else{
arr.push(docs[i])
        }

      }
    }
   // console.log(arr,'arr')
   res.send(arr)
  })

})



router.post('/dashStockCS',isLoggedIn,function(req,res){
  var customer = req.body.customer
 

  var date = req.body.date
  var arr = []
  var id = req.user._id
  let num = req.user.num
  num++
  
  var m = moment(date)
  console.log(date.split('-')[0])
  var startDate = date.split('-')[0]
  var endDate = date.split('-')[1]
   var startValueA = moment(startDate)
   var startValueB=startValueA.subtract(1,"days");
   var startValue = moment(startValueB).valueOf()

   var endValueA = moment(endDate)
   var endValueB = endValueA.add(1,"days");
   var endValue= moment(endValueB).valueOf()
  console.log(startValue,endValue,'output')


  Stock.find({category:customer},function(err,docs) {
   // console.log(docs,'docs')
    for(var i = 0;i<docs.length;i++){

    
       if(arr.length > 0 && arr.find(value => value.category == docs[i].category)){
              console.log('true')
             arr.find(value => value.category == docs[i].category).quantity += docs[i].quantity;
        }else{
arr.push(docs[i])
        }

      
    }
   // console.log(arr,'arr')
   res.send(arr)
  })

})




router.post('/dashNum',function(req,res){
  var id = req.user._id
  var num = req.user.num
  num++
  User.findByIdAndUpdate(id,{$set:{num:num}},function(err,docs){

res.send(docs)
  })


})
router.post('/add', function(req,res){
  var m = moment()
                  var year = m.format('YYYY')
                  
                var name = req.body.name
                var surname = req.body.surname
                var mobile = req.body.mobile
                var email = req.body.email
                var password = req.body.password
                req.check('name','Enter Name').notEmpty();
                req.check('surname','Enter Surname').notEmpty();
              
                req.check('email','Enter email').notEmpty().isEmail();
         
                
             
                req.check('mobile', 'Enter Phone Number').notEmpty();
                req.check('password', 'Password do not match').isLength({min: 4}).equals(req.body.confirmPassword);
                    
                
                      
                   
                var errors = req.validationErrors();
                    if (errors) {
                
                    
                      req.session.errors = errors;
                      req.session.success = false;
                      res.render('admit',{ errors:req.session.errors,})
                      
                    
                  }
                  else
                
                 {
                    User.findOne({'email':email})
                    .then(user =>{
                        if(user){ 
                      // req.session.errors = errors
                        //req.success.user = false;
                    
                       req.session.message = {
                         type:'errors',
                         message:'user id already in use'
                       }     
                       
                          res.render('admit', {
                              message:req.session.message,    }) 
                       
                        
                  }
                  
                                else  {   
               

                  
                  var user = new User();
                  user.fullname = name +" "+ surname;
                  user.email = email;
                  user.mobile = mobile;
                  user.photo = 'propic.jpg';
                  user.role = 'clerk';
                  user.num = 0
                  user.category = 'null'
                  user.msgId = 'null'
                  user.shop = 'null'
                  user.customer = 'null'
                  user.autoCustomer='null'

          
                  
                  
                  user.password = user.encryptPassword(password)

                  
                   
              
                   
          
                  user.save()
                    .then(user =>{
                      
                })
              }
            
                    })
                  }
              
                 
                
                    
                    
                
                 
                  

                  
})













router.get('/notify',isLoggedIn, function(req,res){
  res.render('notifs')
})

router.post('/notify',isLoggedIn, function(req,res){
                var m = moment()
                var year = m.format('YYYY')
                var numDate = m.valueOf()
                var date = m.toString()
                var subject = req.body.subject
                var message = req.body.message
                var role = req.user.role
                var recRole ='clerk'
                var user = req.user.fullname
           
                console.log(role,'role')
                req.check('subject','Enter Subject').notEmpty();
                req.check('message','Enter Message').notEmpty();
              
               
                    
                
                      
                   
                var errors = req.validationErrors();
                    if (errors) {
                
                    
                      req.session.errors = errors;
                      req.session.success = false;
                      res.render('notifs',{ errors:req.session.errors,})
                      
                    
                  }
                  else{

              User.find({recRole:recRole},function(err,docs){

                for(var i = 0; i<docs.length;i++){

                  let id = docs[i]._id
                  var not = new Note();
                  not.role = role
                  not.subject = subject;
                  not.message = message
                  not.status = 'not viewed';
                  not.status1 = 'new';
                  not.user = user;
                  not.type = 'null'
                  not.status2 = 'new'
                  not.status3 = 'new'
                  not.status4 = 'null'
                  not.date = date
                  not.dateViewed = 'null'
                  not.recId = docs[i]._id
                  not.recRole = recRole
                  not.numDate = numDate
                 

          
                  
                  
               

                  
                   
              
                   
          
                  not.save()
                    .then(user =>{
                      
                })


                }
              })
              
                 res.redirect('/notify')

              }
                              

                  
})



router.post('/not/:id',function(req,res){
  var m = moment()
  var date = m.toString()

var id = req.params.id
  Note.find({recId:id},function(err,docs){
    for(var i = 0; i<docs.length; i++){
      let nId = docs[i]._id

      Note.findByIdAndUpdate(nId,{$set:{status:'viewed',dateViewed:date}},function(err,locs){

      })
    }

    res.send('success')
  })
})




router.get('/update',isLoggedIn,function(req,res){
var m = moment()
let n = m.valueOf()
var id = req.user._id

Note.find({recId:id},function(err,docs){

for(var i = 0; i<docs.length;i++){
let value = docs[i].numDate
let num = n - value
let nId = docs[i]._id

if(num >= 86000000){
  Note.findByIdAndUpdate(nId,{$set:{status1:'old'}},function(err,nocs){


  })
}

}


})



})

router.get('/nots',isLoggedIn, function(req,res){
  var m = moment();
var id = req.user._id
  Note.find({recId:id,status:'viewed'},function(err,docs){
    for(var i = 0;i<docs.length;i++){
      let duration =moment(docs[i].dateViewed)
      let days=m.diff(duration,"days");
      let nId = docs[i]._id
console.log(days,'days')
     if(days > 0){
Note.findByIdAndUpdate(nId,{$set:{status2:'expired',status1:'old'}},function(err,nocs){

})
     }
    }
  })


})


router.get("/logout", (req, res) => {
  req.logout(req.user, err => {
    if(err) return next(err);
    res.redirect("/");
  });
});

  
  
//add Shops imports

router.get('/importShop',function(req,res){
  res.render('product/importShop')
})



router.post('/importShop', upload.single('file'),  (req,res)=>{
 

  if(!req.file){
      req.session.message = {
        type:'errors',
        message:'Select File!'
      }     
        res.render('product/imports', {message:req.session.message}) 
      }else if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
          req.session.message = {
              type:'errors',
              message:'Upload Excel File'
            }     
              res.render('product/importShop', {message:req.session.message
                   
               }) 



      }
        
      else{
   

      
          const file = req.file.filename;
  
          
               var wb =  xlsx.readFile('./public/uploads/' + file)
       
               var sheets = wb.Sheets;
               var sheetNames = wb.SheetNames;
   
               var sheetName = wb.SheetNames[0];
   var sheet = wb.Sheets[sheetName ];
   
      for (var i = 0; i < wb.SheetNames.length; ++i) {
       var sheet = wb.Sheets[wb.SheetNames[i]];
   
       console.log(wb.SheetNames.length)
       var data =xlsx.utils.sheet_to_json(sheet)
           
       var newData = data.map(async function (record){
   
      let customer = record.customer
      let name = record.name
      let city = record.city
     
    
        
       


        
req.body.customer = record.customer
req.body.name = record.name     
req.body.city = record.city  
req.body.num = record.num

 
         

          
      
          try{
            req.check('customer','Enter Customer').notEmpty();
            req.check('name','Enter Name').notEmpty();
            req.check('city','Enter City').notEmpty();
           
           
         


            var errors = req.validationErrors();

            if (errors) {
              
              req.session.errors = errors;
              req.session.success = false;
              for(let x=0;x<req.session.errors.length;x++){
                throw new SyntaxError(req.session.errors[x].msg +" "+"on line"+record.num)
              }
            
        }


    
      
        var product = new Shop();
                product.name = name;
                product.city = city
                product.customer =customer;
             
          
              
               
                product.save()
                  .then(productId =>{

                 
                  })
           
                   
               
                   
                 
                  // .catch(err => console.log(err))
                }
                catch(e){
                  //res.send(e.message)
                  console.log(e.message)
                 }
                  })
                
                
       
                }
                
                
                  
                  
      
                 
      
                  
           
              }
    
      


})










router.get('/info', isLoggedIn,function(req,res){
  var pro = req.user
  res.render('product/addProduct',{pro:pro})
})



router.post('/info',isLoggedIn, upload.single('file'),function(req,res){
  var pro = req.user
  var name = req.body.name
  var category = req.body.category
  var quantity = req.body.quantity
  var price = req.body.price
  var barcodeNumber = req.body.barcodeNumber
  var zwl = req.body.zwl
        req.check('name','Enter Product Name').notEmpty();
            
               req.check('category','Enter Product Category').notEmpty();
               req.check('price','Enter Product Price').notEmpty();
               req.check('quantity', 'Enter Product Quantity').notEmpty();
               req.check('barcodNumber', 'Enter Product Barcode Number').notEmpty();
               req.check('zwl', 'Enter ZWL Price').notEmpty();
               var errors = req.validationErrors();
  
        if(!req.file){

            req.session.message = {
              type:'errors',
              message:'Select File!'
            }     
              res.render('product/addProduct', {message:req.session.message,pro:pro
           
               })
              }
             
                else if (errors) {
            
                     req.session.errors = errors;
                     req.session.success = false;
                     res.render('book',{ errors:req.session.errors,pro:pro})
              
                 }

                 else
                 {
                  Product.findOne({'barcodeNumber':barcodeNumber})
                  .then(bk =>{
                      if(bk){ 
                    // req.session.errors = errors
                      //req.success.user = false;
                  
                     req.session.message = {
                       type:'errors',
                       message:'product/barcodeNumber already in the system'
                     }     
                     
                        res.render('product/addProduct', {
                            message:req.session.message, pro:pro   }) 
                     
                      
                }
                
                              else  {   
             

        
              
          
                const imageFile = req.file.filename;
        
                var book = new Product();
                  book.barcodeNumber = barcodeNumber
                  book.category = category
                  book.name = name
                  book.filename = imageFile;
              
                  book.quantity = quantity
                 
             
                  book.rate = 0
                  book.zwl = 0
                  book.price = price
                      
                       
                        book.save()
                          .then(title =>{
                          
                            req.session.message = {
                              type:'success',
                              message:'Product added'
                            }  
                            res.render('product/addProduct',{message:req.session.message,pro:pro});
                          
                        
                        })
                         
                        
                      }
                        })
                      }
                        
                         });

  



                         router.get('/import',function(req,res){
                          res.render('product/imports')
                        })
                        
                      
                        
                        router.post('/import', upload.single('file'),  (req,res)=>{
                         
                        
                          if(!req.file){
                              req.session.message = {
                                type:'errors',
                                message:'Select File!'
                              }     
                                res.render('product/imports', {message:req.session.message}) 
                              }else if (req.file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
                                  req.session.message = {
                                      type:'errors',
                                      message:'Upload Excel File'
                                    }     
                                      res.render('product/imports', {message:req.session.message
                                           
                                       }) 
                        
                        
                        
                              }
                                
                              else{
                           
                      
                              
                                  const file = req.file.filename;
                          
                                  
                                       var wb =  xlsx.readFile('./public/uploads/' + file)
                               
                                       var sheets = wb.Sheets;
                                       var sheetNames = wb.SheetNames;
                           
                                       var sheetName = wb.SheetNames[0];
                           var sheet = wb.Sheets[sheetName ];
                           
                              for (var i = 0; i < wb.SheetNames.length; ++i) {
                               var sheet = wb.Sheets[wb.SheetNames[i]];
                           
                               console.log(wb.SheetNames.length)
                               var data =xlsx.utils.sheet_to_json(sheet)
                                   
                               var newData = data.map(async function (record){
                           
                              
                             
                            
                                
                               
                      
                      
                                
                      
                      req.body.name = record.name     
                      req.body.price = record.price  
                      req.body.barcodeNumber = record.barcodeNumber
                      req.body.zwl = record.zwl
                      req.body.category = record.category  
                      req.body.rate = record.rate
                      req.body.quantity = record.quantity
                      req.body.filename = record.filename  
                                 
                      
                                  
                              
                                  try{
                                    req.check('price','Enter price').notEmpty();
                                    req.check('name','Enter Name').notEmpty();
                                    req.check('barcodeNumber','Enter Barcode Number').notEmpty();
                                    req.check('zwl','Enter ZWL').notEmpty();
                                    req.check('category','Enter Category').notEmpty();
                                    req.check('filename','Enter Filename').notEmpty();
                                    req.check('quantity','Enter Quantity').notEmpty();
                                    req.check('rate','Enter Rate').notEmpty();
                                   
                                 
                      
                      
                                    var errors = req.validationErrors();
                        
                                    if (errors) {
                                      
                                      req.session.errors = errors;
                                      req.session.success = false;
                                      for(let x=0;x<req.session.errors.length;x++){
                                        throw new SyntaxError(req.session.errors[x].msg +" "+"on line")
                                      }
                                    
                                }
                      
                      
                            
                              
                                var product = new Product();
                                        product.name = req.body.name;
                                        product.price = req.body.price
                                        product.barcodeNumber = req.body.barcodeNumber;
                                        product.quantity = req.body.quantity;
                                        product.rate = req.body.rate;
                                        product.category= req.body.category;
                                        product.zwl = req.body.zwl;
                                        product.filename = req.body.filename;
                                  
                                      
                                       
                                        product.save()
                                          .then(productId =>{
                      
                                         
                                          })
                                   
                                           
                                       
                                           
                                         
                                          // .catch(err => console.log(err))
                                        }
                                        catch(e){
                                          res.send(e.message)
                                         }
                                          })
                                        
                                        
                               
                                        }
                                        
                                        
                                          
                                          
                              
                                         
                              
                                          
                                   
                                      }
                            
                              
                        
                        
                        })
                        
                      
                      
                      
                      
                      
                      
                  




                         router.get('/viewStock',isLoggedIn, (req, res) => {
                          var pro = req.user
                          Stock.find({},(err, docs) => {
                              if (!err) {
                                  res.render("product/productList", {
                                     list:docs,pro:pro
                                    
                                  });
                              }
                          });
                          });

                          router.get('/viewProducts',isLoggedIn, (req, res) => {
                            var pro = req.user
                            Product.find({},(err, docs) => {
                                if (!err) {
                                    res.render("product/listX", {
                                       list:docs,pro:pro
                                      
                                    });
                                }
                            });
                            });
  


                          router.get('/viewDispatch',isLoggedIn, (req, res) => {
                            var pro = req.user
                            Dispatch.find({},(err, docs) => {
                                if (!err) {
                                    res.render("product/dispatchList", {
                                       list:docs,pro:pro
                                      
                                    });
                                }
                            });
                            });

router.get('/addStock',isLoggedIn,function(req,res){
  var pro = req.user
  res.render('product/stock',{pro:pro})
})


router.post('/addStock',isLoggedIn, function(req,res){
  var pro = req.user
  var barcodeNumber = req.body.barcodeNumber;
  var name = req.body.name;
  var m = moment()
  var year = m.format('YYYY')
  var dateValue = m.valueOf()
  var date = m.toString()
  var receiver = req.user.fullname
  var category = req.body.category
  var quantity = req.body.quantity
console.log(quantity,'qty')


  req.check('barcodeNumber','Enter Barcode Number').notEmpty();
  req.check('name','Enter Product Name').notEmpty();
  req.check('quantity','Enter Quantity').notEmpty();
 
  

  
  
  var errors = req.validationErrors();
   
  if (errors) {

    req.session.errors = errors;
    req.session.success = false;
    res.render('product/stock',{ errors:req.session.errors,pro:pro})
    
  
  }
  else
  var book = new Stock();
  book.barcodeNumber = barcodeNumber
  book.category = category
  book.name = name
  book.receiver = receiver;
  book.date  = date
  book.dateValue = dateValue
  book.quantity = quantity
  book.rate = 0
  book.zwl = 0
  book.price = 0
      
       
        book.save()
          .then(pro =>{

            Product.find({barcodeNumber:barcodeNumber},function(err,docs){
             let id = docs[0]._id
              
             nqty = pro.quantity + docs[0].quantity
             console.log(nqty,'nqty')
             Product.findByIdAndUpdate(id,{$set:{quantity:nqty}},function(err,nocs){

             })

            })
          
          /*  req.session.message = {
              type:'success',
              message:'Product added'
            }  
            res.render('product/stock',{message:req.session.message,pro:pro});*/
          
        
        })
res.redirect('/addStock')

})


router.get('/search',isLoggedIn,function(req,res){
  res.render('product/search')
})



router.get('/viewSales',isLoggedIn,function(req,res){
  var pro = req.user
 Sales.find({},(err, docs) => {
      if (!err) {
          res.render("product/sales", {
             list:docs,pro:pro
            
          });
      }
  });
})

router.post('/fill',function(req,res){

  console.log(req.body.value)
      var customer = req.body.value
  Shop.find({customer:customer},function(err,docs){
    console.log(docs,'data')
  
      if(docs == undefined){
          res.redirect('/')
         }else
        
           res.send(docs)
  
  })
  
  })
  

  router.post('/fillX',function(req,res){

    console.log(req.body.value)
        var category = req.body.value
    Product.find({category:category},function(err,docs){
    
        if(docs == undefined){
            res.redirect('/')
           }else
          
             res.send(docs)
    
    })
    
    })
    
  

/*router.post('/salesX',isLoggedIn,function(req,res){
var customer = req.body.customer
var shop = req.body.shop
var category = req.body.category
var product = req.body.product
var date = req.body.date

var m = moment(date)
console.log(date.split('-')[0])
var startDate = date.split('-')[0]
var endDate = date.split('-')[1]
console.log(customer, shop, category,product,date,'output')
})*/


router.post('/viewSales',isLoggedIn,function(req,res){
  var customer = req.body.customer
  var shop = req.body.shop
  var category = req.body.category
  var product = req.body.product
  var date = req.body.date
  var arr = []
  
  var m = moment(date)
  console.log(date.split('-')[0])
  var startDate = date.split('-')[0]
  var endDate = date.split('-')[1]
   var startValue = moment(startDate).valueOf()
   var endValue = moment(endDate).valueOf()
  console.log(startValue,endValue,'output')
  Sales.find({customer:customer,shop:shop},(err, docs) => {
    for(var i = 0;i<docs.length;i++){
      let sdate = docs[i].dateValue
      if(sdate >= startValue && sdate <= endValue){
arr.push(docs[i])
      }
    }
    console.log(arr,'arr')
        res.render("product/sales", {
           list:arr,
          
        });
   
   
});
  })
  











router.get('/dispatch',isLoggedIn,function(req,res){
  var pro = req.user
  res.render('product/dispatch',{pro:pro})
})


router.post('/dispatch',isLoggedIn, function(req,res){
  var pro = req.user
  var barcodeNumber = req.body.barcodeNumber;
  var name = req.body.name;
  var m = moment()
  var year = m.format('YYYY')
  var dateValue = m.valueOf()
  var date = m.toString()
  var dispatcher = req.user.fullname
  var category = req.body.category
  var quantity = req.body.quantity
  var dispatchedQty = req.body.dispatchedQty
  var shop = req.body.shopName
  var customer = req.body.customer



  req.check('barcodeNumber','Enter Barcode Number').notEmpty();
  req.check('name','Enter Product Name').notEmpty();
  req.check('quantity','Enter Quantity').notEmpty();
  req.check('dispatchedQty','Enter Quantity To Be Dispatched').notEmpty();
 
  

  
  
  var errors = req.validationErrors();
   
  if (errors) {

    req.session.errors = errors;
    req.session.success = false;
    res.render('product/dispatch',{ errors:req.session.errors,pro:pro})
    
  
  }
  else{

  var book = new Dispatch();
  book.barcodeNumber = barcodeNumber
  book.category = category
  book.name = name
  book.customer = customer
  book.quantity = quantity
  book.quantityDispatched = dispatchedQty
  book.dispatcher = dispatcher
  book.status ='Pending'
  book.status2 = 'Confirm Delivery'
  book.status3 = 'No'
  book.shop = shop
  book.qtyReceived = 0
  book.quantityVariance = 0
  book.dateDispatched = date
  book.dateDispatchedValue = dateValue
  book.dateReceived = 'null'
  book.dateReceivedValue = 'null'
  book.receiver = 'null'
  book.rate = 0
  book.zwl = 0
  book.price = 0
      
       
        book.save()
          .then(pro =>{


            Stock.find({barcodeNumber:barcodeNumber},function(err,docs){
              let id = docs[0]._id
               
              nqty =  docs[0].quantity - pro.quantityDispatched 
              console.log(nqty,'nqty')
              Stock.findByIdAndUpdate(id,{$set:{quantity:nqty}},function(err,nocs){
 
              })

              User.find({customer:customer, shop:shop},function(err,nocs){
  
                for(var i = 0; i<nocs.length;i++){
                  let id = noc[i]._id
              var not = new Note();
              not.role = role
              not.subject = 'Incoming Delivery';
              not.message = 'Incoming Delivery for'+" "+name
              not.status = 'not viewed';
              not.status1 = 'new';
              not.user = user;
              not.type = 'null'
              not.status2 = 'new'
              not.status3 = 'new'
              not.status4 = 'null'
              not.date = date
              not.dateViewed = 'null'
              not.recId = docs[i]._id
              not.recRole = recRole
              not.numDate = numDate
             
  
               
          
              not.save()
                .then(user =>{
                  
            })
          }
        })
 
             })

          
          /*  req.session.message = {
              type:'success',
              message:'Product added'
            }  
            res.render('product/dispatch',{message:req.session.message,pro:pro});*/
          
        
        })
      }
res.redirect('/dispatch')

})




router.get('/verify',isLoggedIn,function(req,res){
  res.render('product/verify')
})







 

  router.post('/verifyScan',function(req,res){
  
    var barcodeNumber = req.body.code
     Product.find({barcodeNumber:barcodeNumber},function(err,docs){
    if(docs == undefined){
      res.redirect('/verify')
    }else
    console.log(docs,'docs')
   
       res.send(docs[0])
     })
   })
   

  //Autocomplete for customer
  router.get('/autocomplete/',isLoggedIn, function(req, res, next) {
    var id = req.user._id

      var regex= new RegExp(req.query["term"],'i');
     
      var shopFilter =Shop.find({customer:regex},{'customer':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
    
      
      shopFilter.exec(function(err,data){
     
   
    console.log('data',data)
    
    var result=[];
    
    if(!err){
       if(data && data.length && data.length>0){
         data.forEach(shop=>{
         let customer = shop.customer
          User.findByIdAndUpdate(id,{$set:{autoCustomer:customer}},function(err,docs){

          })
       
    
            
           let obj={
             id:shop._id,
             label: shop.customer
  
         
       
         
           
            
    
             
           };
          
           result.push(obj);
        
         
         });
    
       }
     
       res.jsonp(result);
  
      }
    
    })
   
    });
  

//this route autopopulates info of the customer
    router.post('/auto',isLoggedIn,function(req,res){
        var code = req.body.code

    
        
       
        Shop.find({customer:code},function(err,docs){
       if(docs == undefined){
         res.redirect('/')
       }else
      
          res.send(docs[0])
        })
      
      
      })
 
      

  //Autocomplete for Shop
  router.get('/autocompleteX/',isLoggedIn, function(req, res, next) {
    var id = req.user._id
    var customer = req.user.autoCustomer

      var regex= new RegExp(req.query["term"],'i');
     
      var shopFilter =Shop.find({customer:customer, name:regex},{'name':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
    
      
      shopFilter.exec(function(err,data){
     
   
    console.log('data',data)
    
    var result=[];
    
    if(!err){
       if(data && data.length && data.length>0){
         data.forEach(shop=>{
   

   
       
    
            
           let obj={
             id:shop._id,
             label: shop.name
  
         
       
         
           
            
    
             
           };
          
           result.push(obj);
        
          })
      
    
       }
     
       res.jsonp(result);
  
      }
    
    })
   
    });
  
 
//this route shop
    router.post('/autoShop',isLoggedIn,function(req,res){
        var code = req.body.code
        console.log(code,'code')
        var customer = req.user.autoCustomer

    
        
       
        Shop.find({customer:customer,name:code},function(err,docs){
       if(docs == undefined){
         res.redirect('/')
       }else

          res.send(docs[0])
        })
      
      
      })
 






    
      
      
    


router.get('/nList',isLoggedIn,function(req,res){
  var id = req.user._id
  var m = moment()
  console.log(m.valueOf(),'crap')
  Note.find({recId:id},function(err,docs){
    if(!err){

   
    res.render('notList',{list:docs})

    }
  })
})

router.get('/notify/:id', isLoggedIn, function(req,res){
  var id = req.params.id
  var uid = req.user._id
  console.log(id,'id')
  var arr = []
  Note.find({recId:uid,_id:id},function(err,tocs){

let subject = tocs[0].subject
let message = tocs[0].message



    
    res.render('notView',{message:message, subject:subject})
  })

})






      router.get('/autocompleteXN/', function(req, res, next) {
        var code
    
          var regex= new RegExp(req.query["term"],'i');
         
          var bookFilter =Book.find({},{'title':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
        
          
          bookFilter.exec(function(err,data){
         
       
        console.log('data',data)
        
        var result=[];
        
        if(!err){
           if(data && data.length && data.length>0){
             data.forEach(book=>{
       
              
           
        
                
               let obj={
                 id:book._id,
                 label: book.title
      
             
           
             
               
                
        
                 
               };
              
               result.push(obj);
            
           
             });
        
           }
         
           res.jsonp(result);
      
          }
        
        })
       
        });
      
      //role admin
    //this route autopopulates info of the title selected from the autompleteX route
        router.post('/autoXN',function(req,res){
            var code = req.body.code
    
        
            
           
            Book.find({title:code},function(err,docs){
           if(docs == undefined){
             res.redirect('/')
           }else
          
              res.send(docs[0])
            })
          
          
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
  
    
    