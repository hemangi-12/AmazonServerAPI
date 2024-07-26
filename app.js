require("dotenv").config();
const express=require("express");
const cors=require("cors");
const app=express();
const mongoose=require("mongoose");
require("./db/conn");


const cookieParser=require("cookie-parser");


const Products=require("./models/productsSchema");

const DefaultData=require("./defaultdata");

const router=require("./routes/router");


app.use(express.json());
app.use(cookieParser(""));
app.use(cors());
app.use(router);


const port=process.env.PORT;

app.listen(port,()=>{
    console.log("server is running on port number"+port);
});


DefaultData();