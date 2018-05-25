'use strict';

// const LineBot = require('line-bot-sdk');
// const request = require('request')
const request = require('request-promise');
const pm2 = require('./pm2');


exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    let message = event['events'][0]['message'].text;
    let return_message = 'postback:' + message;
    let userId = event['events'][0]['source']['userId'];
    let replyToken = event['events'][0]['replyToken'];
    let post_data = {
        "replyToken": replyToken,
        "messages":reply(message)
    }
    var options = {
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
    .then( (res)=>{
        console.log(res);
    }).catch( (err)=>{
        console.log(err);
        return "Error";
    }).then( ()=>{
      return "Hello";
    });  
    return "KKK"
};


let reply = msg => {
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
    else if (msg.indexOf("air")){
        let data = pm2.get_data()
        console.log(data)
        if (msg.indexOf("list")){
            let mlist = to_list(data)
            re_arry.push({
                "type": "text",
                "text": pm2.get_data()
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

let to_list = data => {
    let mlist = []
    for (let i=0 ; i < pm25object.devices.length ; i+=1){
        mlist.push(pm25object.devices[i].name)
    }
    return mlist.join('\n')
}