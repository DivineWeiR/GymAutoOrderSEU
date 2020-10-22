# GymAutoOrderSEU

## Introduction

A gym order system for Southeast University throw newids login using Nodejs.

We have multiple options for users to choose their own sport item. Such as badminton, table tennis.


## Usage

### Installation

First of all, clone or download zip of this project.
**Make sure that Nodejs has already been installed on your device.**

Then use `npm` to install all the needed package.
You can use this command to install:
```dos
npm install
```

### Order
Afterwards, you can start the project by using this command:
```dos
node ./orderByTime.js YourIdNumber YourPassword OrderDate OrderTimeIndex OrderItem
```

**YourIdNumber** is a 9 digit e-card number
**YourPassword** is the unified authentication password of your e-card (Same as your password for login to my.seu.edu.cn)
**OrderDate** is the date that you want to use the gym, you should type the date in `YYYY-MM-DD` (like 2020-10-24).
**OrderTime** is the time that you want to use the gym, here is the index of time and the argument. That means when you want to order a court of 18:00-19:00, you should set this argument to 6.
```js
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
``` 
**OrderItem** is the item you want to play. And it is set to `羽毛球` by default.

This is all the options:
```javascript
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
```

