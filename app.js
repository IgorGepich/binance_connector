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

//
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
            binance.marketSell(pair, quantity, {type:'LIMIT'}, (error, response) => {
                console.info("Market Buy response", response)
                console.info("order id: " + response.orderId)
            })
        }


        if(orderType === "long") {
            binance.marketBuy(pair, quantity)
                .then(a => submitLog.info("HI"))
        }
        // binance.buy(pair, quantity, 0, "MARKET")
    })
})

app.get('/price', (req, res) => {
    getLastPrice()
        .then(async () => res.status(200).send(await getLastPrice()))
        // .then(c => console.log(c))
        // .then(res => console.log(res)


    // req.on(getLastPrice())

// .then(res => res.status(200).send("THEN"))
//     res.status(200).send("getLastPrice()")


    // Getting list of open orders
    // binance.openOrders("ETHBTC", function(error, json) {
        // console.log("openOrders()",json);
    // });

    // // .then(res =   > res.json())
        // // .then(json => res.end(Buffer.from(JSON.stringify(json)))) // !!!!Возращает
        // // .then(json => debugLog.debug(json))
        // .catch(err => {
        //     console.log(err, "Response error")
        // })
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

app.listen(SERVER_SUBMIT_ORDER_PORT,() => {
    console.log('Server has been started on port', + SERVER_SUBMIT_ORDER_PORT, '...')
})