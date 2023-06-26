const mongoose = require("mongoose");
let DBurl = process.env.DATABASE;

mongoose.connect(DBurl).then(()=>{
    console.log(`connection successful`);
  }).catch((err)=> console.log("no connection"));
  

  