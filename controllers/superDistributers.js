const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const Payment = require("../models/Payment");

//@desc      Get all Distributers via superDisributer
//@routes    GET /api/superDistributers/distributers/
//Access     Private/SuperDistributer
exports.getDistributers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ $and: [{ role: 'distributer' }, { referralId: req.user.id }] }).populate({
    path: "referralId",
    select: "userName name -_id"
  });
  res.status(200).json({ success: true, data: users });
});

//@desc      Get all retailer via Disributer
//@routes    GET /api/superDistributers/retailer
//Access     Private/SuperDistributer
exports.getRetailers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ $and: [{ role: 'retailer' }, { referralId: req.query.id }] }).populate({
    path: "referralId",
    select: "userName name -_id"
  });
  res.status(200).json({ success: true, data: users });
});



//@desc      Get Single Distributer via Disributer
//@routes    GET /api/superDistributers/distributers/:id
//Access     Private/SuperDistributer
exports.getSingleDistributers = asyncHandler(async (req, res, next) => {
  const users = await User.findById(req.params.id)
  res.status(200).json({ success: true, data: users });
});

//@desc      POST add Credit To Disributer
//@routes    POST /api/superDistributers/addCreditPoint
//Access     Private/SuperDistributer
exports.addDistributerCreditPoint = asyncHandler(async (req, res, next) => {
  if (req.body.creditPoint <= 0 || req.body.creditPoint === undefined) {
    return next(
      new ErrorResponse(
        `Please Add Credit Point And Credit Point should not be 0 or Negative`,
        404
      )
    );
  }


  const distributers = await User.find({ $and: [{ role: 'distributer' }, { referralId: req.user.id }, { _id: req.body.id }] })
  const superDistributer = await User.findById(req.user.id);
  if (req.body.transactionPin != superDistributer.transactionPin) {
    return next(
      new ErrorResponse(
        `Your Transaction PIn is Wrong.. `,
        401
      )
    );
  }
  if (superDistributer.creditPoint < req.body.creditPoint) {
    return next(
      new ErrorResponse(
        `Check Credit Point! Credit Point is insufficient..`,
        404
      )
    );
  }
  if (distributers.length === 1) {

    await Payment.create({ toId: req.body.id, fromId: req.user.id, creditPoint: req.body.creditPoint, macAddress: req.body.macAddress });
    const user = await User.findByIdAndUpdate(req.body.id, { $inc: { creditPoint: req.body.creditPoint } })
    await User.findByIdAndUpdate(req.user.id, { $inc: { creditPoint: -req.body.creditPoint } })
    res.status(200).json({ success: true, data: user });
  }
  else {
    return next(
      new ErrorResponse(
        `You are not Authorized to Add Credit to this User or May be your Transaction PIn is Wrong..`,
        401
      )
    );
  }
});

//@desc      POST Reduce Credit To Disributer
//@routes    POST /api/superDistributers/reduceCreditPoint
//Access     Private/Admin
exports.reduceDistributerCreditPoint = asyncHandler(async (req, res, next) => {
  if (req.body.creditPoint <= 0 || req.body.creditPoint === undefined) {
    return next(
      new ErrorResponse(
        `Please Add Credit Point And Credit Point should not be 0`,
        404
      )
    );
  }
  if (req.body.transactionPin != req.user.transactionPin) {
    return next(
      new ErrorResponse(
        `Your Transaction PIn is Wrong.. `,
        401
      )
    );
  }
  const distributers = await User.find({ $and: [{ role: 'distributer' }, { referralId: req.user.id }, { _id: req.body.id }] })

  if (distributers.length === 1) {
    if (distributers.creditPoint < req.body.creditPoint) {
      return next(
        new ErrorResponse(
          `Check Your Credit Point! Credit Point is insufficient..`,
          404
        )
      );
    }
    await Payment.create({ toId: req.body.id, fromId: req.user.id, creditPoint: req.body.creditPoint, macAddress: req.body.macAddress });
    const user = await User.findByIdAndUpdate(req.body.id, { $inc: { creditPoint: -req.body.creditPoint } })
    await User.findByIdAndUpdate(req.user.id, { $inc: { creditPoint: req.body.creditPoint } })
    res.status(200).json({ success: true, data: user });
  }
  else {
    return next(
      new ErrorResponse(
        `You are not Authorized to Add Credit to this User`,
        401
      )
    );
  }
});

