const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { Strategy, ExtractJwt } = require("passport-jwt");
const fs = require("fs");
const csv = require("csv-parser");
const app = express();
app.use(express.json());
app.use(function(req,res,next){
  res.header("Access-Control-Allow-Origin","*");
  res.header("Access-Control-Allow-Methods",
  "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS");
  res.header("Access-Control-Allow-Headers",
  "Origin,X-Requested-With,Content-Type,Accept, Authorization");
  next();
  });
app.use(passport.initialize());
dotenv.config({path: "./config.env"});
require("./db/conn");
const {User,Brand,Pincode,Review,AllProduct,Search,Logs} = require("./model/userSchema");

let port = process.env.PORT || 2410 ;
app.listen(port,()=> console.log(`Node app listening on port ${port}!`))
let params = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "jwtFromToken123"
};
let jwtExpirySecond = 86400;
let strategy = new Strategy(params,async function(token, done){
  console.log("In Strategy All",token);
  let user = await User.findOne({_id: token.id });
  if(!user) return done(null, false, {message:"Incorrect username or password"})
  else return done(null, user);
})
let strategyAdmin = new Strategy(params, async (token, done)=>{
  console.log("In Strategy Admin", token);
  let user = await User.findOne({_id: token.id });
  if(!user) return done(null, false, { message:"Incorrect username or password"})
  else if(user.role!="admin") return done(null, false, {message: "You don't have admin role"})
  else return done(null, user);
})
passport.use("roleAll", strategy);
passport.use("roleAdmin", strategyAdmin);

app.get("/",(req,res)=>{
  res.send("Hello welcome to flipCart !!!")
})
app.get("/about",(req,res)=>{
  console.log("Hello About page");
  res.send("Hello welcome to about page...");
})
app.get("/allproducts",passport.authenticate("roleAdmin",{session:false}), async (req,res)=>{
  let page = +req.query.page;
 try{
    let data = await AllProduct.find();
    let token = req.headers.authorization
    let log = await Logs.findOne({ token });
    if(log) {
      log.paths.push({ method: req.method, path: req.path})
      await Logs.findOneAndUpdate({token}, { paths: log.paths })
    }
    if(page){
      let totalItems = data.length;
      let size = 10 ;
      let startIndex = (page - 1) * size;
      let endIndex = totalItems> startIndex + size - 1 ?
      startIndex + size - 1 : totalItems - 1;
      let data1 = totalItems> size ? data.filter((d1,index)=>index>=startIndex && index<= endIndex): data;
      res.send({
        totalItems: totalItems,
        startIndex : startIndex,
        endIndex : endIndex,
        productData : data1
      })
    }
    else res.send(data)
  }catch(err){
    res.status(500).send(err)
  }
})
app.get("/products",async function(req,res){
  let { page } = req.query;
 try{
 let data = await AllProduct.find({category:{$ne: "Mobiles"}});
 if(!page) res.send(data);
 else{
   let size = 4;
   let startIndex = (+page - 1);
   let endIndex = data.length> startIndex + size -1 ?
   startIndex + size -1 : data.length - 1;
   let data1 = data.length>4 ? data.filter((d1,index)=> index>= startIndex && index<= endIndex): data;
   res.send({
    totalItems : data.length,
    productData :  data1,
    startIndex : startIndex,
    endIndex : endIndex 
   })
 }}catch(err){ res.status(500).send(err)}
})
app.post("/products",passport.authenticate("roleAdmin",{session: false}), async function(req,res){
let body = req.body;
try{
  let token = req.headers.authorization
  let log = await Logs.findOne({ token });
  if(log) {
    log.paths.push({ method: req.method, path: req.path})
    await Logs.findOneAndUpdate({token}, { paths: log.paths })
  }
 let data =  new AllProduct(body);
 let data1 = await data.save();
 res.send(data1)
}catch(err){
  res.status(500).send(err)
}
})
app.put("/products/:id",passport.authenticate("roleAdmin",{session: false}) ,async function(req,res){
  let body = req.body;
  let id = req.params.id;
  try{
    let token = req.headers.authorization
    let log = await Logs.findOne({ token });
    if(log) {
      log.paths.push({ method: req.method, path: req.path})
      await Logs.findOneAndUpdate({token}, { paths: log.paths })
    }
   let data = await AllProduct.findOneAndUpdate({_id: id}, body);
   if(!data) res.status(404).send("No data found")
   else{
     res.send(data); 
   }
  }catch(err){
    res.status(500).send(err);
  }
})
app.post("/upload",passport.authenticate("roleAdmin",{session:false}),async (req,res)=>{
 let text = req.body.text;
 let result =[];
 let token = req.headers.authorization
 let log = await Logs.findOne({ token });
 if(log) {
   log.paths.push({ method: req.method, path: req.path})
   await Logs.findOneAndUpdate({token}, { paths: log.paths })
 }
 fs.writeFile('myFile.csv',text,(err,resu)=>{
  console.log("Successfully Write")
 }) 
 fs.createReadStream('./myFile.csv')
 .pipe(csv())
 .on('data',(data)=> result.push(data))
 .on('end',async ()=>{
  try{    
     
      let result1 = result.map((r1)=>({
        id: r1.id,
        category: r1.category,
        brand: r1.brand,
        name: r1.name,
        img: r1.img,
        rating: +r1.rating,
         ratingDesc: r1.ratingDesc,
         details: JSON.parse(r1.details),
         price: +r1.price,
         assured:(r1.assured=="true"),
         prevPrice: +r1.prevPrice,
         discount: +r1.discount,
         emi: r1.emi,
         exchange: r1.exchange,
         popularity: +r1.popularity,
         offers:JSON.parse(r1.offers),
         ram: r1.ram,
      }));
      await AllProduct.insertMany(result1);
      res.send("Successfully Inserted !!!");
     fs.unlink('./myFile.csv',(err1)=>{
      if(err1) console.log(err1);
      console.log("Successfully Deleted"); 
     })
  }catch(err){ res.status(500).send(err)}
 })
})
app.get("/download",passport.authenticate("roleAdmin",{session: false}), async (req,res)=>{
 let data =  await AllProduct.find({});
 let token = req.headers.authorization
 let log = await Logs.findOne({ token });
 if(log) {
   log.paths.push({ method: req.method, path: req.path})
   await Logs.findOneAndUpdate({token}, { paths: log.paths })
 }
 res.send(data);
})
app.get("/reportCart", passport.authenticate("roleAdmin",{session: false}), async (req,res)=>{
let page = +req.query.page;
let sort = req.query.sort;
  try{
    let data = await User.find({ cart :{$ne : []}})
    let cartData = data.reduce((acc,curr)=>curr.cart?[...acc,...curr.cart]:[...acc],[]);
    let cartDa = [];
    cartData.filter((c1)=>cartDa.find((c2)=>c2._id==c1._id)?
     cartDa.find((c2)=>c2._id==c1._id).qty+=c1.qty? cartDa.find((c2)=>c2._id==c1._id).count+=1: false:
     cartDa.push({...c1,count:1}));
     let token = req.headers.authorization
     let log = await Logs.findOne({ token });
     if(log) {
       log.paths.push({ method: req.method, path: req.path})
       await Logs.findOneAndUpdate({token}, { paths: log.paths })
     }
    if(page){
      let totalItems = cartDa.length;
      let size = 10 ;
      let startIndex = (page - 1) * size;
      let endIndex = totalItems> startIndex + size - 1 ?
      startIndex + size - 1 : totalItems - 1;
      let data1 = totalItems> size ? cartDa.filter((d1,index)=>index>=startIndex && index<= endIndex): cartDa;
      if(sort) data1 = data1.sort((c1,c2)=>(typeof c1[sort])=="string"? c1[sort].localeCompare(c2[sort]):
        c1[sort] - (c2[sort]));
      res.send({
        totalItems: totalItems,
        startIndex : startIndex,
        endIndex : endIndex,
        productData : data1
      })
    }
    else res.send(cartDa)
  }catch(err){ res.status(500).send(err)}
})
app.get("/reportWishlist", passport.authenticate("roleAdmin",{session: false}), async (req,res)=>{
  let page = +req.query.page;
  let sort = req.query.sort;
try{
  let data = await User.find({ wishlist :{$ne : []}})
  let wishData = data.reduce((acc,curr)=>curr.wishlist?[...acc,...curr.wishlist]:[...acc],[]);
  let wishDa = [];
  wishData.filter((w1)=>wishDa.find((w2)=>w2._id==w1._id)?wishDa.find((w2)=>w2._id==w1._id).count+=1:
  wishDa.push({...w1, count:1}))
  let token = req.headers.authorization
    let log = await Logs.findOne({ token });
    if(log) {
      log.paths.push({ method: req.method, path: req.path})
      await Logs.findOneAndUpdate({token}, { paths: log.paths })
    }
  if(page){
    let totalItems = wishDa.length;
    let size = 10 ;
    let startIndex = (page - 1) * size;
    let endIndex = totalItems> startIndex + size - 1 ?
    startIndex + size - 1 : totalItems - 1;
    let data1 = totalItems> size ? wishDa.filter((d1,index)=>index>=startIndex && index<= endIndex): wishDa;
    if(sort) data1 = data1.sort((c1,c2)=>(typeof c1[sort])=="string"? c1[sort].localeCompare(c2[sort]):
    c1[sort] - (c2[sort]));
    res.send({
      totalItems: totalItems,
      startIndex : startIndex,
      endIndex : endIndex,
      productData : data1
    })
  }
  else res.send(wishDa)
}catch(err){
  res.status(500).send(err)
}
})
app.get("/product/:id",async function(req,res){
  let id = req.params.id;
  try{
  let data = await AllProduct.findOne({ _id : id });
  if(data) res.send(data);
  else res.status(404).send("No Data Found");
  }catch(err){ res.status(500).send(err)}
})
app.get("/mobiles",async function(req,res){
  let { page }= req.query;
  let { brand, ram, rating, price } = req.query;
    let filterr = {category: "Mobiles"}; 
    let brands = brand ? brand.split(","): [];
    let rams = ram? ram.split(","): [];
    let rate = rating? rating.split(","): [];
    let prices = price? price.split(","):[];
    if(brand)  filterr.brand = {$in: brands} 
  try{  
  let data = await AllProduct.find(filterr);
  if(ram) data = data.filter((d1)=> rams.find((r1)=>(
    r1.includes("-")?d1.ram>= +r1.split("-")[0] && d1.ram<=+r1.split("-")[1]: d1.ram==+r1
  )))
  if(rating) data = data.filter((d1)=>rate.find((r1)=>d1.rating>= +r1.split("-")[0] && d1.rating<+r1.split("-")[1]))
  if(price) data = data.filter((d1)=>prices.find((r1)=>d1.price>= +r1.split("-")[0] && d1.price<+r1.split("-")[1]))
  if(!page) res.send(data)
  else{
    let size = 5;
    let pageNum = +page;
    let startIndex = ( pageNum - 1 );
    let endIndex = data.length> startIndex+ size - 1?
    startIndex + size - 1: data.length - 1;
    let data1 = data.length> size ?
    data.filter((d1,index)=> index >= startIndex && index <= endIndex ): data;
      res.send({
      totalItems : data.length,
      mobileData :  data1,
      startIndex : startIndex,
      endIndex : endIndex 
      });
  }}catch(err){ res.status(500).send(err)}
})
app.get("/search",passport.authenticate("roleAdmin",{session: false}), async (req,res)=>{
  let page = +req.query.page;
  let sort = req.query.sort;
  try{
   let data = await Search.find();
   let token = req.headers.authorization
   let log = await Logs.findOne({ token });
   if(log) {
     log.paths.push({ method: req.method, path: req.path})
     await Logs.findOneAndUpdate({token}, { paths: log.paths })
   }
   if(!page) res.send(data);
   else{
    let totalItem = data.length;
    let size = 10;
    let startIndex = (page -1 )*size;
    let endIndex = totalItem> startIndex + size -1?
    startIndex + size -1: totalItem -1 ;
    let data1 = totalItem>size?data.filter((d1,index)=> index>=startIndex && index<=endIndex): data;
    if(sort) data1 = data1.sort((c1,c2)=>(typeof c1[sort])=="string"? c1[sort].localeCompare(c2[sort]):
    c1[sort] - (c2[sort]));
  
    res.send({
      totalItems: totalItem,
      startIndex : startIndex,
      endIndex : endIndex,
      productData : data1 
    })
   }
  }catch(err){ res.status(500).send(err)}
})
app.post("/search",async (req,res)=>{
  let body = req.body;
try{
 let data = await Search.findOne({ id:body.id });
 if(data){
    data.query.push(body.q)
    await Search.findOneAndUpdate({ _id: data._id}, {count: +data.count+1, query:data.query});
    res.send(await Search.findOne({_id: data._id}));
 }else {
    let data1 = new Search({...body, count: 1, query: [body.q]});
    let data2 = await data1.save();
    res.send(data2);
 }
}catch(err){ res.status(500).send(err)}
})
app.post("/register",async (req,res)=>{
  let {  firstname,lastname,username,email,password,phone,role,cart,wishlist} = req.body;
  console.log(req.body)
  if( !firstname || !lastname || !username || !email || !password || !phone || !role)
    return res.status(422).json({ error: "Please filled the all field properly"})
  try{
   let userdata = await User.findOne({email: email})
   if(userdata) return res.status(401).json({ error: "User already exists"})
   else {
    let date = new Date();
    let time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    const user = new User({firstname,lastname,username,email,password,phone,role,cart,wishlist})
   let user1 = await user.save();
    if(user1){
      let payload = { id: user1._id};
      let token = jwt.sign(payload,params.secretOrKey,{
        algorithm:"HS256",
        expiresIn: jwtExpirySecond
      });
    
      let log = new Logs({firstname, lastname, username,email, password, phone, role,
        login: time ,logout: "", paths: [{method: req.method, path: req.path}],token:"bearer "+token });
      let log1 = await log.save();   
      console.log(log1);
      res.send({token:"bearer "+token})
    }
   }
  }catch(err){ console.log(err)}
})
app.post("/login",async function(req,res){
  let { username, password,cart } = req.body;
  let data = await User.findOne({$and :[{ username : username}, {password: password}]})
  if(!data) res.status(404).send({error:"Invalid Username or password"})
  else{
    let date = new Date();
    let time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    let cart1 = []
    let carts = [ ...data.cart,...cart]
   carts.filter(c1=> cart1.find(c2=> c2.id==c1.id)? cart1.find(c2=> c2.id==c1.id).qty+=c1.qty:cart1.push(c1));
    let user = await User.updateOne({_id: data._id}, {cart: cart1});
     console.log(cart1)
    let payload = { id: data._id};
    let token = jwt.sign(payload, params.secretOrKey,{
      algorithm:"HS256",
      expiresIn:jwtExpirySecond
    });
    let { firstname, lastname, username,email, password, phone, role} = data;
    
    let log = new Logs({firstname, lastname, username,email, password, phone, role,
      login: time ,logout: "", paths: [{method: req.method, path: req.path}],token:"bearer "+token });
    let log1 = await log.save();   
    console.log(log1);
    res.send({token:"bearer "+token})
  }
})
app.get("/user",passport.authenticate("roleAll",{session: false}) ,async (req,res)=>{
   res.send(req.user);
   let token = req.headers.authorization
   let log = await Logs.findOne({ token });
   if(log) {
     log.paths.push({ method: req.method, path: req.path})
     await Logs.findOneAndUpdate({token}, { paths: log.paths })
   }
})
app.get("/logs",passport.authenticate("roleAdmin", { session: false }), async (req,res)=>{
  let page = +req.query.page;
  let sort = req.query.sort;
try{
  let logData = await Logs.find();
  if(!page) res.send(logData);
  else{
    let token = req.headers.authorization
    let log = await Logs.findOne({ token });
    if(log) {
      log.paths.push({ method: req.method, path: req.path})
      await Logs.findOneAndUpdate({token}, { paths: log.paths })
    }
    let size = 10;
    let totalItem = logData.length;
    let startIndex = (page-1) * size;
    let endIndex = totalItem> startIndex + size -1?
    startIndex + size - 1: totalItem -1 ;
    let data1 = totalItem> size ? logData.filter((l1,index)=> index>= startIndex && index<= endIndex): logData;
    if(sort) data1 = data1.sort((d1,d2)=>(typeof d1[sort] =="string"? d1[sort].localeCompare(d2[sort]):
    +d1[sort] - (d2[sort])));
    res.send({
      totalItems: totalItem,
      startIndex : startIndex,
      endIndex : endIndex,
      productData : data1
    })
  }
}catch(err){ res.status(500).send(err)}
})
app.post("/cartItem",passport.authenticate("roleAll",{session: false}), async (req,res)=>{
  let id = req.user._id;
  let body = req.body;
  let index = req.user.cart.findIndex((c1)=>c1.id==body.id);
  if(index>=0) req.user.cart[index].qty+= 1;
  else req.user.cart.push({...body,qty: 1})
  let token = req.headers.authorization
  let log = await Logs.findOne({ token });
  if(log) {
    log.paths.push({ method: req.method, path: req.path})
    await Logs.findOneAndUpdate({token}, { paths: log.paths })
  }
  let user = await User.findOneAndUpdate({_id: id}, {cart: req.user.cart});
  res.send(req.user.cart)
})
app.put("/cart/:id",passport.authenticate("roleAll",{session: false}),async (req,res)=>{
  let id = req.params.id;
  let _id = req.user._id;
  let body = req.body;
  let index = req.user.cart.findIndex((c1)=>c1.id==id);
  if(req.user.cart[index].qty==1&& body.number ==-1) 
  req.user.cart.splice(index,1);
  else req.user.cart[index].qty+= body.number;
  let token = req.headers.authorization
  let log = await Logs.findOne({ token });
  if(log) {
    log.paths.push({ method: req.method, path: req.path})
    await Logs.findOneAndUpdate({token}, { paths: log.paths })
  }
  let user = await User.findOneAndUpdate({_id: _id}, {cart: req.user.cart});
    res.send(req.user.cart)
})
app.get("/cart",passport.authenticate("roleAll",{ session: false }), async (req,res)=>{
  let token = req.headers.authorization
  let log = await Logs.findOne({ token });
  if(log) {
    log.paths.push({ method: req.method, path: req.path})
    await Logs.findOneAndUpdate({token}, { paths: log.paths })
  }
  res.send(req.user.cart);
})
app.delete("/cart/:id",passport.authenticate("roleAll",{session:false}),async (req,res)=>{
  let id = req.params.id;
  let cart = req.user.cart;
  let index = cart.findIndex((c1)=>c1.id==id);
  if(index>=0) cart.splice(index, 1);
  else res.status(404).send("Item not found");
  let token = req.headers.authorization
  let log = await Logs.findOne({ token });
  if(log) {
    log.paths.push({ method: req.method, path: req.path})
    await Logs.findOneAndUpdate({token}, { paths: log.paths })
  }
  let user = await User.findOneAndUpdate({_id : req.user._id}, { cart: cart });
  res.send(cart); 
})
app.get("/wishlist", passport.authenticate("roleAll",{session: false}), async (req,res)=>{
  let token = req.headers.authorization
 let log = await Logs.findOne({ token });
 if(log) {
   log.paths.push({ method: req.method, path: req.path})
   await Logs.findOneAndUpdate({token}, { paths: log.paths })
 }
  res.send(req.user.wishlist);
})
app.post("/wishlist",passport.authenticate("roleAll",{session: false}), async (req,res)=>{
  let id = req.user._id;
  let body = req.body;
  let index = req.user.wishlist.findIndex((c1)=>c1.id==body.id);
  if(index>=0) req.user.wishlist.splice(index,1)
  else req.user.wishlist.push(body)
  let token = req.headers.authorization
  let log = await Logs.findOne({ token });
  if(log) {
    log.paths.push({ method: req.method, path: req.path})
    await Logs.findOneAndUpdate({token}, { paths: log.paths })
  }
  let user = await User.findOneAndUpdate({_id: id}, {wishlist: req.user.wishlist});
  if(!user) res.status(404).send("User Not Found");
  else{
    let find = await User.findOne({_id: id})
    res.send(find.wishlist)
  }
})
app.get("/brands/:brand",async function(req,res){
  let brand = req.params.brand;
try{
  let data = await Brand.findOne({ brand: brand });
  if(data) res.send(data);
  else res.status(404).send("No Pics Found");
}catch(err){ res.status(500).send(err)}
})
app.get("/reviews/:id",async function(req,res){
  let {reviewPage} = req.query;
  let id = req.params.id;
 try{
  let data = await Review.findOne({mobileId: id});
  if(data){
   let size = 5;
   let totalItems = data.ratings.length;
   let startIndex = (+reviewPage -1 )*size;
   let endIndex = totalItems> startIndex +size -1?
   startIndex + size -1 : totalItems -1 ;
   let data1 = totalItems>5?
   data.ratings.filter((d1,index)=>index>= startIndex&& index<=endIndex):data.ratings;
   let pageCount = (totalItems + size - totalItems % size)/size;
   res.send({
    pageCount: pageCount,
    totalItems: totalItems,
    reviewData: data1
   })
  }else res.sendStatus(404);
}catch(err){ res.status(500).send(err)}
})
app.post("/pincodes/:id",async function(req,res){
  let { pincode } = req.body;
  let id = req.params.id;
  try{
  let data = await Pincode.findOne({pincode: +pincode});
  if(data){
  let find = data.mobileList.find((d1)=>d1.id==id);
  if(find) res.send("Delivery available");
  else res.status(404).send("Delivery not available");
  } else res.status(404).send("Delivery not available")
}catch(err){ res.status(500).send(err)}
})
app.post("/logout", passport.authenticate("roleAll",{ session: false}),async (req,res)=>{
 let token = req.body.token;
 try{
  let log = await Logs.findOne({token: token});
  if(!log) res.status(404).send("User not Found");
  else{
    let date = new Date();
    let time = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
    log.paths.push({method: req.method, path: req.path});
    await Logs.findOneAndUpdate({ token: token},{ logout: time, paths: log.paths });
    res.send("Successfully Logout !!!")
  }
 }catch(err){ res.status(500).send(err)}
})