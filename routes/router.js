const express=require("express");
const router = new express.Router();
const Products = require("../models/productsSchema");
const USER = require("../models/userSchema");
const bcrypt=require("bcryptjs");
const authenicate=require("../middleware/authenticate");

//get productsdata api
router.get("/getproducts", async(req, res) => {
    try {
        const productsdata = await Products.find();
        console.log("data mila hain" +productsdata );
        res.status(201).json(productsdata);
       
    } catch (error) {
        console.log("error" + error.message);
    }
});
//get individual data
router.get("/getproductsone/:id",async(req,res)=>{
    try {
        const {id}=req.params;
        //console.log(id);
        const individuadata= await Products.findOne({id:id});
       // console.log(individuadata +"individuald data");
       res.status(201).json(individuadata);
    } catch (error) {
        res.status(400).json(individuadata);
        console.log("error" + error.message);
        
    }
});


// register the data
router.post("/register", async (req, res) => {
    //console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "fill all the details" });
        console.log("no data avilable");
    };

    try {

        const preuser = await USER.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This email is already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finalUser = new USER({
                fname, email, mobile, password, cpassword
            });
               //password hashing process
            
            const storedata = await finalUser.save();
             console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        //console.log("error the bhai catch ma for registratoin time" + error.message);
        //res.status(422).send(error);
    }

});


//Login user api

router.post("/login", async (req, res) => {
    //console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" })
    };
    
    try {

        const userlogin = await USER.findOne({ email: email });
          console.log(userlogin +"user value");
       
          if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch +"pass match");

            //token generate
            const token = await userlogin.generateAuthtoken();
               // console.log(token);

               res.cookie("Amazonclone", token, {
                expires: new Date(Date.now() + 900000),
                httpOnly: true
            });

            if (!isMatch) {
                res.status(400).json({ error: "Invalid Password" })
            } else {
                res.status(201).json(userlogin);
            }

        }  else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid details" });
    }
})

//adding the data to cart
router.post("/addcart/:id", authenicate, async (req, res) => {

    try {
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        console.log(cart + "cart value");

        const UserContact = await USER.findOne({ _id: req.userID });
        console.log(UserContact);


        if (UserContact) {
            const cartData = await UserContact.addcartdata(cart);

            await UserContact.save();
            console.log(cartData);
            res.status(201).json(UserContact);
        }else{
            res.status(401).json({error :"Invalid user"}); 
        }
    } catch (error) {
        res.status(401).json({error :"Invalid user"});
       
    }
});

//get cart details
router.get("/cartdetails", authenicate, async (req, res) => {
    try {
        const buyuser = await USER.findOne({ _id: req.userID });
        //console.log(buyuser + "user hain buy pr");
        res.status(201).json(buyuser);
    } catch (error) {
        console.log("error" +error );
    }
});

//get valid user
router.get("/validuser", authenicate, async (req, res) => {
    try {
        const validuserone = await USER.findOne({ _id: req.userID });
        //console.log(validuserone + "user hain home k header main pr");
        res.status(201).json(validuserone);
    } catch (error) {
        console.log("error" +error );
    }
});

//remove item from cart
router.get("/remove/:id", authenicate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((cruval) => {
            return cruval.id != id;
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log("iteam remove");

    } catch (error) {
        console.log("error" + error);
        res.status(400).json(error);
    }
});

//for user logout
router.get("/logout", authenicate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("Amazonclone", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");

    } catch (error) {
        console.log("error for user logout");
    }
});








module.exports=router;