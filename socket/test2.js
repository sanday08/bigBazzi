//Get Flip Pages for andarBaharResult
getFlipPages = (pages, result) => {

    let randomNumbers = [];
    for (let i = 0; i < 52; i++) {
        let randomNumber = Math.floor(Math.random() * 52);
        while (randomNumbers.includes(randomNumber)) {
            randomNumber = Math.floor(Math.random() * 52);
        }
        randomNumbers[i] = randomNumber;
        if (pages.includes(randomNumber))
            break;

    }
    if (result != 0)
        if (result == "andar") {
            if (randomNumbers.length % 2 != 0)
                return randomNumbers
            else
                randomNumbers.shift();
        }
        else {
            if (randomNumbers.length % 2 == 0)
                return randomNumbers
            else if (randomNumbers.length > 2)
                randomNumbers.shift();
            else
                randomNumbers.unshift(pages[0] + 1);
        }

    return randomNumbers;
}


//get all Pages

getPages = (page) => {
    if (page > 38)
        return [page, page - 13, page - 26, page - 29]
    else if (page > 25)
        return [page, page + 13, page - 26, page - 13]
    else if (page > 12)
        return [page, page + 13, page + 26, page - 13]
    else return [page, page + 13, page + 26, page + 39]

}

for (i = 0; i < 10; i++) {
    let pages = getPages(4)
    let finalPages = getFlipPages(pages, "bahar")

    console.log("Pages", pages);
    console.log("");
    console.log(finalPages, finalPages.length);
    console.log("");
    console.log("");
}