const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const WinResult = require("../models/WinResult");
const Bet = require("../models/Bet");
const Complaint = require("../models/Complaint");
const mongoose = require("mongoose");

//@desc      Get 7Days Bet History
//@routes    GET /api/retailers/tickets
//Access     Private/Admin
exports.getDayTickets = asyncHandler(async (req, res, next) => {
  console.log("date by Piyush", req.query.fromDate, req.query.toDate);
  let result = await WinResult.find({
    createDate: {
      $gte: new Date(req.query.fromDate),
      $lt: new Date(req.params.date),
    },
  });
  console.log("Result is", result);
  return res.status(200).json({ success: true, data: result });
});

// //@desc      Get Current Draw Records
// //@routes    Get /api/retailers/reprint/:drTime
// //Access     Private/Retailers
// exports.getReprintData = asyncHandler(async (req, res, next) => {
//     var now = new Date();
//     var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

//     let bets = await Bet.find({ DrTime: req.params.drTime, createdAt: { $gte: startOfToday } });

//     res.status(200).json({ success: true, data: bets });
// });

//@desc      Get Current Draw Records
//@routes    Get /api/retailers/reprint/:ticketId
//Access     Private/Retailers
exports.getReprintData = asyncHandler(async (req, res, next) => {
  var now = new Date();
  console.log("Ticket Id : " + req.params.ticketId);
  // var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let bet = await Bet.find({ ticketId: req.params.ticketId });

  res.status(200).json({ success: true, data: bet });
});

//@desc      Get Start to End Date Bet History
//@routes    GET /api/retailers/betHistoryReports
//Access     Private/Admin
exports.getBetHistoryReport = asyncHandler(async (req, res, next) => {
  console.log("date by Piyush", req.params, req.query, req.body);
  let result = await Bet.aggregate([
    {
      $match: {
        retailerId: mongoose.Types.ObjectId(req.user.id),
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      },
    },
  ]);
  console.log(
    "Result is ",
    result,
    "  Start Date : ",
    new Date(req.query.startDate),
    "  End Date : ",
    new Date(req.query.endDate)
  );
  return res.status(200).json({ success: true, data: result });
});

//@desc      Get all Bet History
//@routes    GET /api/retailers/betHistory
//Access     Private/Admin
exports.getAllBetHistory = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc      Get  Bet History via user
//@routes    GET /api/retailers/betHistory/:retailerId
//Access     Private/Admin
exports.getBetHistory = asyncHandler(async (req, res, next) => {
  console.log(req.query.retailerId, req.body.retailerId, req.params.retailerId);

  const bets = await Bet.find({ retailerId: req.params.retailerId });

  res.status(200).json({ success: true, count: bets.length, data: bets });
});

//@desc      Get  Bet History via user and DateWise
//@routes    GET /api/retailers/betDayHistory
//Access     Private/Admin
exports.getBetHistoryDayWise = asyncHandler(async (req, res, next) => {
  console.log(req.query.retailerId);

  const bets = await Bet.find({
    retailerId: req.query.retailerId,
    DrDate: req.query.date,
  });

  res.status(200).json({ success: true, count: bets.length, data: bets });
});

//@desc      Get all Online Retailer
//@routes    GET /api/retailers/online
//Access     Private/Admin
exports.getOnlineRetailers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ isLogin: true });
  res.status(200).json({ success: true, count: users.length, data: users });
});

//@desc      Get all Win Result History
//@routes    GET /api/retailers/winResultByDate/:date
//Access     Private/Admin
exports.getWinnerResultsByDate = asyncHandler(async (req, res, next) => {
  console.log(req.query.date, req.body.date, req.params.date);
  const winnerHistory = await WinResult.find({ DrDate: req.params.date });
  res
    .status(200)
    .json({ success: true, count: winnerHistory.length, data: winnerHistory });
});

//@desc      Claime Ticket
//@routes    Put /api/retailers/claim
//Access     Private/Admin
exports.claimeTicket = asyncHandler(async (req, res, next) => {
  console.log(
    "req.body.ticketId",
    req.body.ticketId,
    req.query.ticketId,
    req.params.ticketId
  );
  bets = await Bet.find({
    ticketId: req.body.ticketId.toString().toUpperCase(),
  });
  console.log("This is bets", bets);
  let result = "Ticket Id Not Found";
  if (bets.length != 0) {
    console.log(
      bets[0].retailerId,
      "& this is the system Owner Id",
      req.user.id
    );
    if (bets[0].retailerId == req.user.id) {
      if (bets[0].winPositions == "") result = "Result Not yet Declared";
      else if (bets[0].claim) {
        result = "Ticket Already Claimed.";
      } else {
        await Bet.findOneAndUpdate(
          { ticketId: req.body.ticketId },
          { claim: true }
        );
        if (bets[0].won != 0) result = "You won the Ticket of " + bets[0].won;
        else result = "You loss The Ticket";
      }
    } else result = "You purchased your ticket from other retailer..";
  }

  res.status(200).json({ success: true, data: result });
});

//@desc      Post all Bet History
//@routes    Post /api/retailers/complaint
//Access     Private/retailer
exports.addComplaint = asyncHandler(async (req, res, next) => {
  const bets = await Complaint.create({
    title: req.body.title,
    content: req.body.content,
  });
  res.status(200).json({ success: true, count: bets.length, data: bets });
});

//@desc      Get all Commision Result History
//@routes    GET /api/retailers/commission/
//Access     Private/retailer
exports.getCommissionByDate = asyncHandler(async (req, res, next) => {
  console.log(req.query.date, req.body.date, req.params.date);
  const data = await Bet.aggregate([
    {
      $match: {
        retailerId: req.user.id
      }
    },
    { $group: { _id: "$DrDate", totalCollection: { $sum: "$bet" }, totalPayment: { $sum: "$won" }, totalCommission: { $sum: "$retailerCommission" } } },
    { $sort: { createdAt: -1 } }
  ]);
  res
    .status(200)
    .json({ success: true, data });
});