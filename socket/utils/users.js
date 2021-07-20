const jwt = require("jsonwebtoken");
const User = require("../../models/User");

async function getUserInfo(userId) {
  //Verify Token
  try {
    user = await User.findById(userId);
    return user;
  } catch (err) {
    return err.message;
  }
}
async function getUserInfoBytoken (tokenId) {
  
  let token;
  //Set token from Bearer token in header
  token = tokenId.split(" ")[1];
  //Verify Token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded Id is ",decoded)
    user = await User.findById(decoded.id);
    return user;
  } catch (err) {
    return err.message;
  }
} 
module.exports = { getUserInfo,getUserInfoBytoken };