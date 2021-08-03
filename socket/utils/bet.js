const User = require("../../models/User");
const Bet = require("../../models/Bet");
const WinResult = require("../../models/WinResult");
const Winning = require("../../models/Winning");
async function placeBet(retailerId, position, betAmount, ticketId, commission) {
  //Verify Token
  try {
    let user = await User.findById(retailerId);

    if (user.creditPoint >= betAmount) {
      bet = await Bet.create({
        retailerId,
        bet: betAmount,
        startPoint: user.amount,
        position,
        email: user.email,
        ticketId,
        endPoint: user.amount - betAmount,
        commission,
      });
      await User.findByIdAndUpdate(retailerId, {
        $inc: { amount: -betAmount, playAmount: betAmount },
        lastBetAmount: betAmount,
        lastTicketId: ticketId,
      });

      return bet._id;
    }
    return 0;
  } catch (err) {
    console.log("Error on place bet", err.message);
    return;
  }
}
async function getAdminData() {
  let data = await Bet.aggregate([
    {
      $match: {
        DrDate: () =>
          new Date()
            .toLocaleString("en-US", {
              timeZone: "Asia/Calcutta",
            })
            .toString()
            .split(",")[0]
            .replace(/\//g, (x) => "-"),
      }
    },
    { $group: { _id: "$DrDate", totalCollection: { $sum: "$bet" }, totalPayment: { $sum: "$won" } } },

  ]);
  return data;
}
async function winGamePay(price, betId, winPosition) {
  try {
    console.log(
      "WInGame Pay: price : ",
      price,
      "  betId : ",
      betId,
      " winPosition : ",
      winPosition
    );

    const betData = await Bet.findByIdAndUpdate(betId, {
      $inc: { won: price, endPoint: price },
    });
    let user = "";
    user = await User.findByIdAndUpdate(betData.retailerId, {
      $inc: { creditPoint: price, wonAmount: price },
    });

    return betData.retailerId;
  } catch (err) {
    console.log("Error on winGamePay", err.message);
    return err.message;
  }
}

//Add result of the Game
async function addGameResult(result, isWinByAdmin) {
  try {
    await WinResult.create({ result, isWinByAdmin });
    await Bet.updateMany({ winPosition: "" }, { winPosition: result });
  } catch (err) {
    console.log("Error on addGameResult", err.message);
    return err.message;
  }
}

//Add result of the Game
async function getLastrecord() {
  try {
    let result = await WinResult.find()
      .select({ result: 1, _id: 0 })
      .sort("-createdAt")
      .limit(15);
    let data = [];


    for (res of result) {
      data.push(res.result);
    }

    return { records: data, x };
  } catch (err) {
    console.log("Error on getLastrecord", err.message);
    return err.message;
  }
}

//Get Admin Percentage for winning Result
async function getAdminPer() {
  return await Winning.findById("602e55e9a494988def7acc25");
}
//Get current running Game Data{
async function getCurrentBetData(retailerId) {
  let data = await Bet.find({ winPosition: "", retailerId });
  return data;
}

module.exports = {
  placeBet,
  winGamePay,
  getAdminPer,
  addGameResult,
  getLastrecord,
  getCurrentBetData,
  getAdminData
};
