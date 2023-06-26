const express = require("express");
const dotenv = require("dotenv");
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

dotenv.config({path: "./config.env"});

let port = process.env.PORT || 2410 ;
require("./db/conn");

const {User,Product,Mobile,Brand,Pincode,Review} = require("./model/userSchema");

let middleware =(req,res,next)=>{
    console.log("Hello we are in the middleware");
    next();
}
app.listen(port,()=> console.log(`Node app listening on port ${port}!`))

app.get("/",(req,res)=>{
  res.send("Hello welcome to flipCart !!!")
})
app.get("/about", middleware, (req,res)=>{
  console.log("Hello About page");
  res.send("Hello welcome to about page...");
})
app.get("/products",async function(req,res){
  let { page } = req.query;
 try{
 let data = await Product.find({});
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
app.get("/product/:id",async function(req,res){
  let id = req.params.id;
  try{
  let data = await Product.findOne({ id : id });
  if(data) res.send(data);
  else res.status(404).send("No Data Found");
  }catch(err){ res.status(500).send(err)}
})
app.get("/mobiles",async function(req,res){
  let { page }= req.query;
  let { brand, ram, rating, price } = req.query;
    let filterr = {}; 
    let brands = brand ? brand.split(","): [];
    let rams = ram? ram.split(","): [];
    let rate = rating? rating.split(","): [];
    let prices = price? price.split(","):[];
    if(brand)  filterr.brand = {$in: brands} 
  try{  
  let data = await Mobile.find(filterr);
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
app.get("/mobile/:id",async function(req,res){
    let id = req.params.id;
    try{
    let data = await Mobile.findOne({ id : id });
    if(data) res.send(data);
    else res.status(404).send("No Data Found");
  } catch(err){ res.status(500).send(err)}
})
app.post("/register",async (req,res)=>{
  let {  firstname,lastname,username,email,password,phone} = req.body;
  if( !firstname || !lastname || !username || !email || !password || !phone)
    return res.status(422).json({ error: "Please filled the all field properly"})
  try{
   let userdata = await User.findOne({email: email})
   if(userdata) return res.status(401).json({ error: "User already exists"})
   else {
    const user = new User({firstname,lastname,username,email,password,phone})
   let user1 = user.save();
    if(user1) res.send({ username: firstname})
   }
  }catch(err){ console.log(err)}
})
app.post("/login",async function(req,res){
  let { username, password } = req.body;
  let data = await User.findOne({$and :[{ username : username}, {password: password}]})
  if(!data) res.status(404).send({error:"Invalid Username or password"})
  else{ 
    res.send({
   username: data.firstname});
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
