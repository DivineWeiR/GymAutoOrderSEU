const gymAutoOrder = require("./gymAutoOrderGot");
const chalk = require("chalk");
const moment = require("moment");

// const config = {
//     username: "213141145",
//     password: "weiran0507",
//     orderDate: "2020-10-21",
//     orderTime: "18:00-19:00",
//     orderItem: "羽毛球",
// };

const orderTimes = {
    11: "11:30-12:30",
    12: "12:30-13:30",
    3: "15:00-16:00",
    4: "16:00-17:00",
    5: "17:00-18:00",
    6: "18:00-19:00",
    7: "19:00-20:00",
    8: "20:00-21:00",
};

/**
 *
 * @param {Number} time 睡眠的秒数
 */
function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve("over"), time * 1000);
    });
}

console.log(process.argv);
let arguments = process.argv.splice(2);
let timeFormat = "YYYY-MM-DD h:mm";
// console.log(arguments);
config = {
    username: arguments[0],
    password: arguments[1],
    orderDate: `2020-10-${arguments[2]}`,
    orderTime: orderTimes[arguments[3]],
    orderItem: arguments[4] || "羽毛球",
};
// console.log(config);
async function runOrderProcess() {
    let isPreMode = false;
    let now = moment();
    let targetTime = moment(
        `${config.orderDate} ${config.orderTime.split("-")[0]}`
    );
    let loginTime = moment(`${config.orderDate} 08:00`).subtract(2, "days");
    let logoutTime = loginTime.clone().add(4, "minutes");

    console.log(loginTime.date() - now.date());
    console.log(logoutTime - loginTime);

    while (now.date() < loginTime.date()) {
        isPreMode = true;
        console.log(`${chalk.blueBright.bold(`睡眠8h`)}`);
        await sleep(8 * 3600);
        now = moment();
    }

    if (now.hour() < loginTime.hour() - 1) {
        console.log(`${chalk.blueBright.bold(`睡眠${7 - now.hour()}h`)}`);
        await sleep((7 - now.hour()) * 3600);
        now = moment();
    }

    while (now.isBefore(loginTime)) {
        await sleep(1);
        console.log(
            `${chalk.blueBright.bold(`
            登录时间${loginTime.format(timeFormat)} 
            现在时间${now.format(timeFormat)}
            预约时间${targetTime.format(timeFormat)}`)}`
        );
    }
    let success = false;
    while (
        !success &&
        (!isPreMode || (isPreMode && now.isBefore(logoutTime)))
    ) {
        success = await gymAutoOrder(config, 0);
    }
}

runOrderProcess();
