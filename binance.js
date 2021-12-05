import dotenv from "dotenv";
import Binance from "node-binance-api";
import express from "express";
import {submitLog} from './loggingConf.js';

dotenv.config();
const SERVER_SUBMIT_ORDER_PORT = process.env.SERVER_SUBMIT_ORDER_PORT;
const app = express();

const binance = new Binance().options({
    APIKEY: process.env.API_KEY,
    APISECRET: process.env.API_SECRET,
    useServerTime: true
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

        // These orders will be executed at current market price.
        if(orderType === "short") {
            binance.marketSell(pair, quantity)
                .then(a => submitLog.info("short"))
        }
        if(orderType === "long") {
            binance.marketBuy(pair, quantity)
                .then(a => submitLog.info("long"))
        }
    })
        // binance.buy(pair, quantity, 0, "MARKET")
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
    });
        return await binance.balance()
}

app.listen(SERVER_SUBMIT_ORDER_PORT,() => {
    console.log('Server has been started on port', + SERVER_SUBMIT_ORDER_PORT, '...')
})