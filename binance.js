import dotenv from "dotenv";
import Binance from "node-binance-api";
import express from "express";
import {submitLog} from './loggingConf.js';

dotenv.config();
const BINANCE_SERVER_PORT = process.env.BINANCE_SERVER_PORT;
const app = express();

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET,
    useServerTime: true,
    // recvWindow: 60000,
    // test: true
})

app.post('/submit', (req, res) => {
    let postBodyRequest = '';
    req.on('data', chunk => {
        postBodyRequest += chunk.toString();
    });


    req.on('end', ()=>{
        let params = JSON.parse(postBodyRequest);
        submitLog.info("params: ", params );
        let orderType = params.type;
        let pair = params.pair;
        let quantity = params.volume;
        const flags = {type: 'MARKET', newOrderRespType: 'FULL'};

        // These orders will be executed at current market price.
        if(orderType === "short") {
            // binance.marketSell(pair, quantity, flags, function (error, response){
            //     if ( error ) return console.error('error');
            //     console.log("Market Buy response", response);
            //
            //
            // })
            binance.marketSell(pair, quantity)
                .then(a => submitLog.info("short"))
                .catch(err => console.log("sdfs"))
        }
        if(orderType === "long") {
            binance.marketBuy(pair, quantity)
                .then(a => submitLog.info("long"))
                .catch(err => console.log("sdfs"))
        }
    })
        // binance.buy(pair, quantity, 0, "MARKET")
})

app.post('/limit', (req, res) => {
    let postBodyRequest = '';
    req.on('data', chunk => {
        postBodyRequest += chunk.toString();
    });

    req.on('end', ()=>{
        let params = JSON.parse(postBodyRequest);
        let orderType = params.orderType;
        let pair = params.pair;
        let quantity = params.volume;
        let price = params.price;

        // if(orderType === "sell") {
        //     binance.sell(pair, quantity, price)
        // }
        // if(orderType === "buy") {
        //     binance.buy(pair, quantity, price)
        // }


        // let orderType = "sell";
        // let pair = "LUNAUSDT";
        // let quantity = 1.0;
        // let price = 101.0;
        if(orderType === "sell") {
            binance.sell(pair, quantity, price, {type:'LIMIT'}, (error, response) => {
                console.info("Limit Buy response", response);
                console.info("order id: " + response.orderId);
        })}
        if(orderType === "buy") {
            binance.buy(pair, quantity, price, {type:'LIMIT'}, (error, response) => {
                console.info("Limit Buy response", response);
                console.info("order id: " + response.orderId);
            })}



    })
})


app.get('/price', (req, res) => {
    getLastPrice()
        .then(async () => res.status(200).send(await getLastPrice()))

})

/**
 * @returns {JSON}
 */
async function getLastPrice(){
    return await binance.futuresPrices()
}

/**
 * @returns {String}
 */
// async function getLastPrice(){
//     const a = await binance.futuresPrices()
//     return a.BTCUSDT
// }


app.get('/balance', (req, res) => {
    getBinanceBalance()
        .then(async () => res.status(200).send(await getBinanceBalance()))
        .catch(res => console.log(''))
})


async function getBinanceBalance(){
    // Getting list of current balances
    binance.balance(async function (error, balances) {
        // get all account balances
        console.log("balances()", balances);
        if (typeof balances.BTC !== "undefined") {
            console.log("BTC balance: ", balances.BTC.available);
        }
        if (typeof balances.BNB !== "undefined") {
            console.log("BNB balance: ", balances.BNB.available);
        }
        if (typeof balances.USDT !== "undefined") {
            console.log("USDT balance: ", balances.USDT.available);
        }
        if (typeof balances.USDT !== "undefined") {
            console.log("LUNA balance: ", balances.LUNA.available);
        }
    });
        return await binance.balance()
}

app.get('/orders', (req, res) => {
    let b = getOrders()
        .then(async () => res.status(200).send('sdf'+ await b))

})

async function getOrders() {
    // Getting list of open orders
    binance.openOrders(false, (error, openOrders) => {
        console.info("openOrders", openOrders);
        //
        // });
        return binance.openOrders;
        // return "openOrders" + openOrders
    })
}

app.get('/history', (req, res) => {
    getTradeHistory()
        .then(async () => res.status(200).send('JSON.stringify(getTradeHistory())'))
        // .then(async () => res.json)

})

async function getTradeHistory(){
    let coins = ["BTCUSDT", "LUNAUSDT", "BNBUSDT", "BNBBTC"]
        for(let coin of coins) {
            binance.trades(coin, (error, trades, symbol) => {
                return console.info(symbol + " trade history", trades);
            });
        }
}

//
app.get('/bal', (req, res) => {
  getBal()
      .then(async () => res.status(200).send('ds'))
});


async function getBal() {
    await binance.useServerTime();
    binance.balance((error, balances) => {
        if (error) return console.error(error);
        console.info("balances()", balances);
        console.info("BNB balance: ", balances.BNB.available);
    });
}



//
app.listen(BINANCE_SERVER_PORT,() => {
    console.log('Server has been started on port', + BINANCE_SERVER_PORT, '...')
})