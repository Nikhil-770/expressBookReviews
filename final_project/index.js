const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    app.use("/customer/auth/*", function auth(req, res, next) {
        const token = req.session && req.session.accessToken;
    
        if (!token) {
            return res.status(401).json({
                message: "User not logged in or token missing"
            });
        }
    
        try {
            // verify JWT token
            const decoded = jwt.verify(token, "fingerprint_customer");
    
            // attach user info to request (optional but useful)
            req.user = decoded;
    
            next();
        } catch (err) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }
    });
//Write the authenication mechanism here

});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
