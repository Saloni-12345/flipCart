const mongoose = require("mongoose")
require("mongoose-double")(mongoose);
 
const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true,
    },
    lastname:{
        type: String,
        required: true,
    },
    username:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
    },
    phone:{
        type: Number,
        required: true,
    }
});
const productSchema = new mongoose.Schema({
     id:{
        type: String,
        required: true,
    },
     category:{
        type: String,
        required: true,
    } ,
      brand:{
        type: String,
        required: true,
    }, name:{
        type: String,
        required: true,
    },img:{
        type: String,
        required: true,
    },rating:{
        type: mongoose.Schema.Types.Double,
        required: true,
    }, 
      ratingDesc:{
        type: String,
        required: true,
    },
      details:{
        type: Array,
        required: true,
    },price:{
        type: Number,
        required: true,
    },
      assured:{
        type: Boolean,
        required: true,
    },prevPrice:{
        type: Number,
        required: true,
    }, 
      discount:{
        type: Number,
        required: true,
    },emi:{
        type: String,
    },exchange:{
        type: String,
    },popularity:{
        type: Number,
        required: true,
    },offers:{
        type: Array,
        required: true,
    }
});
const mobileSchema = new mongoose.Schema({
    id:{
       type: String,
       required: true,
   },
    category:{
       type: String,
       required: true,
   } ,
     brand:{
       type: String,
       required: true,
   }, name:{
       type: String,
       required: true,
   },img:{
       type: String,
       required: true,
   },rating:{
       type: mongoose.Schema.Types.Double,
       required: true,
   }, 
     ratingDesc:{
       type: String,
       required: true,
   },
     details:{
       type: Array,
       required: true,
   },price:{
       type: Number,
       required: true,
   },
     assured:{
       type: Boolean,
       required: true,
   },prevPrice:{
       type: Number,
       required: true,
   }, 
     discount:{
       type: Number,
       required: true,
   },emi:{
       type: String,
   },exchange:{
       type: String,
   },ram:{
    type: Number,
    required: true,
   },
   popularity:{
       type: Number,
       required: true,
   },offers:{
       type: Array,
       required: true,
   }
})
const brandSchema = new mongoose.Schema({
  id:{
    type: Number,
    required: true,
},brand:{
    type: String,
    required: true,
},imgList:{
    type: Array,
    required: true,
},brandImg:{
    type: String,
    required: true,
}
})
const pincodeSchema = new mongoose.Schema({
    pincode:{
     type: Number,
     required: true
    },
    mobileList:{
      type: Array,
      required: true
    }
})
const reviewSchema = new mongoose.Schema({
    id:{
        type: Number,
        required: true
    },
    mobileId:{
     type: String,
     required: true
    },
    ratings:{
        type: Array,
        required: true
    }
})
const User = mongoose.model('USER', userSchema);
const Product = mongoose.model('PRODUCT', productSchema);
const Mobile = mongoose.model('MOBILE', mobileSchema);
const Brand = mongoose.model('BRAND', brandSchema);
const Pincode = mongoose.model('PINCODE', pincodeSchema);
const Review = mongoose.model('REVIEW', reviewSchema);
module.exports = {User,Product ,Mobile,Brand,Pincode,Review};