// let request = require("request");
const got = require("got");
const cheerio = require("cheerio");
const chalk = require("chalk");
const fs = require("fs");
const stream = require("stream");

const encryptAES = require("./encrypt");
const getValidateCode = require("./getValidateCode");
const { promisify } = require("util");
const { HttpProxyAgent, HttpsProxyAgent } = require("hpagent");
const headers = {
    "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36`,
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Cache-control": "no-cache",
};
const options = {
    method: "GET",
    // agent: {
    //     https: new HttpsProxyAgent({
    //         keepAlive: true,
    //         keepAliveMsecs: 1000,
    //         maxSockets: 256,
    //         maxFreeSockets: 256,
    //         scheduling: "lifo",
    //         proxy: "http://localhost:8888",
    //     }),
    //     http: new HttpProxyAgent({
    //         keepAlive: true,
    //         keepAliveMsecs: 1000,
    //         maxSockets: 256,
    //         maxFreeSockets: 256,
    //         scheduling: "lifo",
    //         proxy: "http://localhost:8888",
    //     }),
    // },
};
const pipeline = promisify(stream.pipeline);

let url;
let response, cookie, formData, validateCode;

async function gymAutoOrder(config, startProcess = 0) {
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
    let success = false;
    try {
        if (startProcess <= 0) {
            // 请求：获取登录信息
            console.log(`${chalk.blueBright("开始获取登录信息...")}`);
            url =
                "https://newids.seu.edu.cn/authserver/login?goto=http://yuyue.seu.edu.cn/eduplus/order/initOrderIndex.do?sclId=1";
            headers["Referer"] = url;
            options.headers = headers;

            response = await got(url, options);
            console.log(`${chalk.green.bold("获取登录成功！")}`);
            cookie = response.headers["set-cookie"];
            appendCookie(cookie);

            formData = getLoginInputInfo(response.body, config);
            startProcess += 1;
            url =
                "https://newids.seu.edu.cn/authserver/login?goto=http://yuyue.seu.edu.cn/eduplus/order/initOrderIndex.do?sclId=1";
        }
        if (startProcess <= 1) {
            console.log(`${chalk.blueBright.bold("开始登录...")}`);
            // headers.Referer = url;
            options.headers = headers;
            options.form = formData;
            options.method = "POST";
            options.followRedirect = false;

            response = await got(url, options);
            if (response.statusCode === 302) {
                let location = response.headers.location;
                headers.Cookie = headers.Cookie
                    ? headers.Cookie.concat(response.headers["set-cookie"])
                    : response.headers["set-cookie"];
                options.headers = headers;
                if (location.substring(0, 4) === "http") {
                    url = location;
                } else {
                    url =
                        "http://yuyue.seu.edu.cn/eduplus/order/initOrderIndex.do?sclId=1";
                }
                options.host = "yuyue.seu.edu.cn";
                let success = await gymAutoOrder(config, startProcess);
                if (success) startProcess = 5;
            } else if (response.statusCode == 200) {
                if (response.body.substring(0, 7) === "<script") {
                    location = /window.location.href='([^']+)'/.exec(
                        response.body
                    )[1];
                    url = location;
                    let success = await gymAutoOrder(config, startProcess);
                    if (success) startProcess = 5;
                } else {
                    url =
                        "http://yuyue.seu.edu.cn/eduplus/control/validateimage";
                    startProcess += 1;
                }
            }
        }
        if (startProcess <= 2) {
            console.log(`${chalk.blueBright.bold("开始获取验证码...")}`);
            let validateDirExists = fs.existsSync("Validate");
            if(!validateDirExists){
                fs.mkdirSync("Validate");
            }
            let filepath = `Validate/validate${formData.username}.jpg`;
            let stream = fs.createWriteStream(filepath);
            headers.Referer = url;
            options.headers = headers;
            options.form = formData;
            options.method = "POST";
            options.followRedirect = true;
            await pipeline(
                got.stream(url, options),
                fs.createWriteStream(filepath)
            );
            console.log(`${chalk.green.bold("写入验证码图片完成")}`);
            console.log(`${chalk.blueBright.bold("开始解析验证码...")}`);
            validateCode = await getValidateCode(filepath);
            console.log(
                `${chalk.yellow.bold("验证码为：")} ${chalk.green.bold(
                    validateCode
                )}`
            );
            url =
                "http://yuyue.seu.edu.cn/eduplus/order/order/order/insertOredr.do?sclId=1";
            startProcess += 1;
        }

        if (startProcess <= 3) {
            console.log(`${chalk.blueBright.bold("开始预定场地...")}`);
            console.log(config.orderItem);
            const orderItemMap = {
                乒乓球: "7",
                篮球: "8",
                排球: "9",
                羽毛球: "10",
                舞蹈: "11",
                健身: "12",
                武术: "13",
                跆拳道: "14",
                牌区羽毛球: "15",
                牌区乒乓球: "16",
                牌区网球: "17",
            };
            let orderFormData = {
                "orderVO.useTime": `${config.orderDate} ${config.orderTime}`,
                "orderVO.itemId": orderItemMap[config.orderItem] || "10",
                "orderVO.useMode": "2",
                useUserIds: "14516",
                "orderVO.phone": "15151855151",
                "orderVO.remark": "",
                validateCode: validateCode,
            };
            options.form = orderFormData;

            let response = await got(url, options);
            if (response.statusCode === 302) {
                let location = response.headers.location;
                headers.Cookie = headers.Cookie
                    ? headers.Cookie.concat(response.headers["set-cookie"])
                    : response.headers["set-cookie"];
                options.headers = headers;
                if (location.substring(0, 4) === "http") {
                    url = location;
                } else {
                    url =
                        "http://yuyue.seu.edu.cn/eduplus/order/initOrderIndex.do?sclId=1";
                }
                options.host = "yuyue.seu.edu.cn";
                let success = await gymAutoOrder(config, 1);
                if (success) startProcess = 5;
            } else if (response.statusCode == 200) {
                // console.log(body);
                if (response.body.substring(0, 7) === "<script") {
                    location = /window.location.href='([^']+)'/.exec(
                        response.body
                    )[1];
                    url = location;
                    let success = await gymAutoOrder(config, 1);
                    if (success) startProcess = 5;
                } else {
                    if (response.body === "success") {
                        console.log(
                            `${chalk.green.bold("预订成功，返回结果：")} ${
                                response.body
                            }`
                        );
                        success = true;
                        startProcess += 1;
                    } else {
                        console.error(
                            `${chalk.red.bold("预定失败！错误原因：")} ${
                                response.body
                            }`
                        );
                        url =
                            "http://yuyue.seu.edu.cn/eduplus/control/validateimage";
                        let success = await gymAutoOrder(config, 2);
                        if (success) startProcess = 5;
                    }
                }
            }
        }
        if (startProcess <= 4) {
            console.log(`${chalk.blueBright.bold("预定程序终止！")}`);
        }
        return true;
    } catch (error) {
        // if(error.response.statusCode === 302)
        console.log(
            `【${chalk.red(moment().format('YYYY-MM-DD HH:mm:ss'))}】${chalk.red.bold("请求")} ${chalk.redBright.bold(
                url
            )} ${chalk.red.bold("时发生错误，错误原因：")} ${chalk.red(error)}`
        );
        console.table(error);
        return false;
    }
}

function appendCookie(cookie) {
    headers["Cookie"] = headers["Cookie"]
        ? headers["Cookie"].concat(cookie)
        : cookie;
}

function getLoginInputInfo(body, config) {
    console.log(`${chalk.blueBright.bold("开始解析登录信息...")}`);
    const $ = cheerio.load(body, { ignoreWhitespace: true });
    const lt = $("input[name=lt]").val();
    const execution = $("input[name=execution]").val();
    const dllt = $("input[name=dllt]").val();
    const _eventId = $("input[name=_eventId]").val();
    const rmShown = $("input[name=rmShown]").val();
    const pwdDefaultEncryptSalt = $("input#pwdDefaultEncryptSalt").val();
    const password = encryptAES(config.password, pwdDefaultEncryptSalt);
    const username = config.username;

    console.log(
        `${chalk.green.bold("登录信息解析成功：")}`,
        username,
        password,
        lt,
        execution,
        dllt,
        _eventId,
        rmShown,
        pwdDefaultEncryptSalt
    );

    return {
        username,
        password,
        lt,
        execution,
        dllt,
        _eventId,
        rmShown,
    };
}

module.exports = gymAutoOrder;
