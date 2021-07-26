const { io } = require("../server");
const { getUserInfoBytoken, getUserInfo } = require("./utils/users");
const {
  placeBet,
  winGamePay,
  getAdminPer,
  addGameResult,
  getLastrecord,
} = require("./utils/bet");
const immutable = require("object-path-immutable");
var _ = require("lodash");
const { customAlphabet } = require("nanoid");
const User = require("../models/User");
const nanoid = customAlphabet("1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);
let games = {
  startTime: new Date().getTime() / 1000,
  position: {},
  adminBalance: 0,
};
//users: use for store game Name so when user leave room than we can used
let users = {};
//used for when he won the match
let retailers = {};
//TransactionId
let transactions = {};
let adminPer = 90;

io.on("connection", (socket) => {
  //Join Event When Application is Start
  console.log("Socket Connected", socket.id);
  socket.on("join", async ({ token }) => {
    let user = await getUserInfoBytoken(token);
    //Log Out other User
    if (retailers[user._id] != socket.id) {
      io.to(retailers[user._id]).emit("res", {
        data: "Some one use your Id to other device",
        en: "logout",
        status: 1,
      });
    }
    retailers[user._id] = socket.id;
    console.log("Join call Game  ");

    let numbers = await getLastrecord();
    // let gameData = await getCurrentBetData( user._id)
    socket.emit("res", {
      data: {
        user,
        time: new Date().getTime() / 1000 - games.startTime,
        numbers: numbers.records,
        x: numbers.x,
      },
      en: "join",
      status: 1,
    });
  });

  socket.on("joinAdmin", async ({ adminId }) => {
    console.log("Vijay lodu joinj");
    let numbers = await getLastrecord();
    let user = await getUserInfo(adminId);
    if (user.role == "Admin") {
      socket.join("adminData");
      socket.emit("resAdmin", { data: games.position, numbers: numbers.records.splice(0, 5), x: numbers.x.splice(0, 5), time: new Date().getTime() / 1000 - games.startTime });
    } else
      socket.emit("res", {
        data: "You are not authorised to access this information",
        en: "error",
      });
  });

  socket.on("placeBet", async ({ retailerId, position, betPoint }) => {
    let ticketId = nanoid();
    const result = await placeBet(retailerId, position, betPoint, ticketId);

    if (result != 0) {
      playJeetoJoker(position, result);

      if (betPoint) games.adminBalance += (betPoint * adminPer) / 100;
      socket.to("adminData").emit("resAdminBetData", { data: games.position });
      console.log(
        "Viju vinod Chopda Admin balance is: ",
        games.adminBalance,
        "     Admin Per:",
        adminPer
      );
    }

    socket.emit("res", {
      data: {
        ticketId,
        result:
          result == 0
            ? "You don't have sufficient Balance or Error on Place bet"
            : "Place Bet Success",
      },
      en: "placeBet",
      status: 1,
    });
  });

  socket.on("leaveRoom", ({ userId }) => {
    socket.leave();
    delete users[socket.id];

    delete retailers[userId];
  });

  //Disconnect the users
  socket.on("disconnect", () => {
    if (users[socket.id]) {
      socket.leave(users[socket.id]);
      delete users[socket.id];
      for (userId in retailers) {
        if (retailers[userId] == socket.id) delete retailers[userId];
      }
    }
  });

  socket.on("beep", () => {
    socket.emit("boop", {
      data: {},
      status: 1,
    });
  });
});

setInterval(async () => {
  // if (new Date().getHours() > 7 && new Date().getHours() < 22) {

  if (new Date().getTime() / 1000 > games.startTime + 90) {
    getResult(11);
  }

  //Get Admin Percentage
  if (new Date().getMinutes() == 19 && new Date().getSeconds() < 1) {
    let p = await getAdminPer();
    adminPer = parseInt(p.percent);
    console.log("Now Admin Perchanted is", adminPer);
  }

  //}
}, 1000);
getResult = async (stopNum) => {
  let result = "";
  games.startTime = new Date().getTime() / 1000;
  let sortResult;
  if (Object.keys(games.position).length != undefined) {
    sortResult = sortObject(games.position);

    for (num of sortResult) {
      let value = Object.values(num)[0];
      let key = Object.keys(num)[0];
      if (value < games.adminBalance) {
        result = key;
      }
      if (value > games.adminBalance) {
        break;
      }
    }
  }
  if (result == "") {
    result = Math.round(Math.random() * stopNum) + 1;
  }

  let counter = 0;
  if (games.position[result])
    while (games.adminBalance < games.position[result]) {
      result = Math.round(Math.random() * stopNum) + 1;
      counter++;

      if (counter == 100) {
        result = Object.keys(sortResult[0])[0];
        break;
      }
    }
  let x = Math.floor(Math.random() * 3) + 2;
  if (games.adminBalance > games.position[result] * x) {
    for (let transId in transactions[result]) {
      transactions[result][transId] = transactions[result][transId] * x;
    }
  } else x = 1;

  io.emit("res", {
    data: {
      data: parseInt(result),
      x,
    },
    en: "result",
    status: 1,
  });

  if (games.position[result]) games.adminBalance -= (games.position[result] * x);

  await addGameResult(result, x);

  await payTransaction(result);

  // Pay Out of the winners

  flushAll();
  let numbers = await getLastrecord();
  io.to('adminData').emit("resAdmin", { data: games.position, numbers: numbers.records.splice(0, 5), x: numbers.x, time: new Date().getTime() / 1000 - games.startTime });
};

payTransaction = async (result) => {
  console.log(
    "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&",
    result,
    transactions
  );
  if (transactions.length != 0)
    if (transactions[result]) {
      for (let transId in transactions[result]) {
        console.log("Result Price is :", transactions[result][transId]);
        let userId = await winGamePay(
          transactions[result][transId],
          transId,
          result
        );
        io.to(retailers[userId]).emit("res", {
          data: {
            data: { winAmount: transactions[result][transId] },
          },
          en: "winner",
          status: 1,
        });
      }
    }
};

sortObject = (entry) => {
  const sortKeysBy = function (obj, comparator) {
    var keys = _.sortBy(_.keys(obj), function (key) {
      return comparator ? comparator(obj[key], key) : key;
    });
    console.log(keys);
    return _.map(keys, function (key) {
      return { [key]: obj[key] };
    });
  };

  const sortable = sortKeysBy(entry, function (value, key) {
    return value;
  });

  console.log("Vijay Bap no Dariyo", sortable);
  return sortable;
};

flushAll = () => {
  games.position = {};
  transactions = {};
};

playJeetoJoker = (position, result) => {
  for (pos in position) {
    games.position = immutable.update(games.position, [pos], (v) =>
      v ? v + position[pos] * 10 : position[pos] * 10
    );
    transactions = immutable.update(transactions, [pos, result], (v) =>
      v ? v + position[pos] * 10 : position[pos] * 10
    );
  }
};
