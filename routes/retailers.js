const express = require('express');
const { getWinnerResultsByDate, claimeTicket, getBetHistory, getBetHistoryReport, getOnlineRetailers, getAllBetHistory, getCommissionByDate, addComplaint, getReprintData, getDayTickets, getBetHistoryDayWise } = require("../controllers/retailers")
const { protect, authorize } = require("../middleware/auth");
const Bet = require("../models/Bet")
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

//use middleware to protect, authorize
router.use(protect);

router.get("/online", getOnlineRetailers);

router.use(authorize("retailer"));
// router.route("/addCreditPoint").post(addDistributerCreditPoint);
// router.route("/reduceCreditPoint").post(reduceDistributerCreditPoint);
// router.route("/distributers").get(getDistributers);
// router.route("/retailers").get(getRetailers);
router.route("/betHistory/").get(advancedResults(Bet), getAllBetHistory)
router.get("/betHistory/:retailerId", getBetHistory)
router.get("/betDayHistory", getBetHistoryDayWise)
router.route("/reprint/:ticketId").get(getReprintData);
router.route("/tickets").get(getDayTickets);
router.route("/winResultByDate/:date").get(getWinnerResultsByDate);
router.get("/betHistoryReports", getBetHistoryReport);
router.route("/claim").put(claimeTicket);
router.route("/complaint").post(addComplaint);
router.route("/commission").get(getCommissionByDate);
module.exports = router;