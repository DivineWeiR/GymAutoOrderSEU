const gymAutoOrder = require("./gymAutoOrderGot");
const chalk = require("chalk");
const moment = require("moment");
const argv = require("yargs")
    .option("u", {
        alias: "username",
        demand: true,
        describe: "您的一卡通号",
        type: "string",
    })
    .option("p", {
        alias: "password",
        demand: true,
        describe: "您的统一认证密码",
        type: "string",
    })
    .option("d", {
        alias: "date",
        demand: true,
        describe: "使用场馆的日期（例如2020-11-01）",
        type: "string",
    })
    .option("t", {
        alias: "time",
        demand: true,
        describe:
            "使用场馆的时间（例如 [11:30-12:30]=>11.5; [18:00-19:00]=>6）",
        type: "string",
    })
    .option("i", {
        alias: "item",
        demand: true,
        describe: "想要预定的项目",
        type: "string",
    })
    .usage("Usage: orderByTime.js [options]")
    .example(
        "orderByTime.js -i 213200001 -p 123456 -d 2020-11-01 -t 6 -w 羽毛球",
        "预定2020-11-01日晚上6点-7点的羽毛球场地"
    )
    .help("h")
    .alias("h", "help")
    .epilog("copyright 2020").argv;

const orderTimes = {
    11.5: "11:30-12:30",
    12.5: "12:30-13:30",
    9: "09:00-10:00",
    10: "10:00-11:00",
    11: "11:00-12:00",
    12: "12:00-13:00",
    1: "13:00-14:00",
    2: "14:00-15:00",
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

// console.log(process.argv);
// let arguments = process.argv.splice(2);
// let arguments = argv.splice(2);
let timeFormat = "YYYY-MM-DD H:mm:ss";
config = {
    username: argv.u,
    password: argv.p,
    orderDate: argv.d,
    orderTime: orderTimes[argv.t],
    orderItem: argv.i,
};
// console.log(arguments);
// config = {
//     username: arguments[0],
//     password: arguments[1],
//     orderDate: `${arguments[2]}`,
//     orderTime: orderTimes[arguments[3]],
//     orderItem: arguments[4] || "羽毛球",
// };
console.log(config);
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

    // while (now.date() < loginTime.date()) {
    //     isPreMode = true;
    //     console.log(`${chalk.blueBright.bold(`睡眠8h`)}`);
    //     await sleep(8 * 3600);
    //     now = moment();
    // }

    // if (now.hour() < loginTime.hour() - 1) {
    //     console.log(`${chalk.blueBright.bold(`睡眠${7 - now.hour()}h`)}`);
    //     await sleep((7 - now.hour()) * 3600);
    //     now = moment();
    // }
    // if (now.minute() < loginTime.minute() - 1) {
    //     console.log(`${chalk.blueBright.bold(`睡眠${59 - now.minute()}min`)}`);
    //     await sleep((59 - now.minute()) * 60);
    //     now = moment();
    // }

    // while (now.isBefore(loginTime)) {
    //     await sleep(1);
    //     console.log(
    //         `${chalk.blueBright.bold(`
    //         登录时间${loginTime.format(timeFormat)}
    //         现在时间${now.format(timeFormat)}
    //         预约时间${targetTime.format(timeFormat)}`)}`
    //     );
    //     now = moment();
    // }

    if (now.valueOf() < loginTime.valueOf()) {
        let difference = loginTime.diff(now, "second");
        console.log(`${chalk.blueBright.bold(`睡眠${difference}s`)}`);
        await sleep(difference);
        now = moment();
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
