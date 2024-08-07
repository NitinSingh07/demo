import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
 const token =req.cookies.access_token;
    console.log(token);
    if(!token){
        return next(errHandler(401,"Unauthorized"));
    }
  jwt.verify(token, process.env.JWT_TOKEN, (err, user) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    req.user = user;
    next();
  })
    };

export default auth;
