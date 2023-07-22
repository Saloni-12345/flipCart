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
    },
    role:{
        type:String,
        required: true
    },
    cart:{
        type: Array,
        required: true
    },
    wishlist:{
      type: Array,
      required: true
    }
});
const allProductSchema = new mongoose.Schema({
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
const searchSchema = new mongoose.Schema({
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
    },
    popularity:{
        type: Number,
        required: true,
    },offers:{
        type: Array,
        required: true,
    },query:{
       type: Array,
       required: true,
    },
    count:{
        type: Number,
        required: true
    }
})
const logSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true,
    }, lastname:{
        type: String,
        required: true,
    }, username:{
        type: String,
        required: true,
    },email:{
        type: String,
        required: true,
    }, password:{
        type: String,
        required: true,
    }, phone:{
        type: Number,
        required: true,
    }, role:{
        type: String,
        required: true,
    },
  paths:{
    type: Array,
    required: true,
  },
  login:{
    type: String,
    required: true,
  },
  logout:{
    type: String,
  },
  token:{
    type: String,
    required: true,
  }
})
const User = mongoose.model('USER', userSchema);
const Brand = mongoose.model('BRAND', brandSchema);
const Pincode = mongoose.model('PINCODE', pincodeSchema);
const Review = mongoose.model('REVIEW', reviewSchema);
const AllProduct = mongoose.model('ALLPRODUCT', allProductSchema);
const Search = mongoose.model('SEARCH',searchSchema);
const Logs = mongoose.model('LOG', logSchema);
module.exports = {User,Brand,Pincode,Review, AllProduct,Search,Logs};