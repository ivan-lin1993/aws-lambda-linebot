'use strict';

// const LineBot = require('line-bot-sdk');
// const request = require('request')
const request = require('request-promise');
const pm2 = require('./pm2');


let to_list = data => {
    let mlist = []
    for (let i=0 ; i < data.length ; i+=1){
        mlist.push(data[i].name)
    }
    return mlist.join('\n')
}


let reply = async msg => {
    let re_arry=[];
    if (msg.indexOf("罵我")>=0){
        re_arry.push({
            "type":"text",
            "text":"別"
        });
    }
    else if (msg=="抽"){
        re_arry.push({
            "type":"text",
            "text":"抽個頭"
        });
    }
    else if (msg.indexOf("air")>=0){
        let data = await pm2.get_data()
        console.log(data)
        if (msg.indexOf("list")>=0){
            let mlist = to_list(data)
            re_arry.push({
                "type": "text",
                "text": mlist
            })
        }
        else{
            re_arry.push({
                "type": "text",
                "text": "Use 'air list' to get location"
            })
        }
        
    }
    else{
        re_arry.push({
            "type":"text",
            "text":"Hello, user"
        });
    }
    return re_arry
}



exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    let message = event['events'][0]['message'].text
    let userId = event['events'][0]['source']['userId']
    let replyToken = event['events'][0]['replyToken']
    let post_data = {
        "replyToken": replyToken,
        "messages": await reply(message)
    }
    let options = {
        method: "POST",
        uri: 'https://api.line.me/v2/bot/message/reply',
        headers: {
            'User-Agent': 'request',
            'Content-Type':'application/json',
            'Authorization':'Bearer ' + process.env.channel_access_token
        },
        body:post_data,
        json:true
    };
    let k = await request(options)
    return "Done"
};


let test = async()=>{
    let j = await reply('air list')
    console.log(j)
}
// test()