
getResultRouletteRoyal = async (position) => {
  let result = "";



  if (Object.keys(position).length != undefined) {

    let sortResult = sortObject(position)

    for (num of sortResult) {
      let value = Object.values(num)[0];
      let key = Object.keys(num)[0];
      if (value < games.rouletteRoyal.adminBalance) {
        result = key;
      }
      if (value > games.rouletteRoyal.adminBalance) {
        break;
      }
    }
  }



  if (result == "") {
    result = Math.round(Math.random() * stopNum)

  }

  let counter = 0;
  if (position[result])
    while (games.rouletteRoyal.adminBalance < position[result]) {
      result = Math.round(Math.random() * stopNum)
      counter++;

      if (counter == 100) {
        result = Object.keys(position)[0];
        break;
      }
    }


  socket.emit("res", {
    data: {
      gameName,
      data: result
    },
    en: "result",
    status: 1
  })


  if (position[result])
    games[gameName].adminBalance -= position[result];






}