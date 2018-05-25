'use strict'

const request = require('request-promise')
const pm2 = require('./pm2')


let reply_text = msg => {
    return {
        "type":"text",
        "text":msg
    }
}


let reply_template = mlist =>{
    let m_array = []
    for ( let i = 0; i < mlist.length ; i += 1 ){
        m_array.push({
            "type": "message",
            "label": mlist[i],
            "data": "air:pm25:" + mlist[i]
        })
    }
    return {
        "type":"template",
        "template":{
            "type":"button",
            "text":"PM2.5",
            "action": m_array
        }
    }
}


let reply = async msg => {
    let re_arry=[];
    if (msg.indexOf("罵我")>=0){
        re_arry.push(reply_text("別"))
    }
    else if (msg=="抽"){
        re_arry.push(reply_text('抽個頭'))
    }
    else if (msg.indexOf("air")>=0){
        if (msg.indexOf("list")>=0){
            let res = await pm2.get_location_list()
            re_arry.push(reply_template(res))
        }
        else if (msg.indexOf("air:pm2:") >= 0 ){
            let location = msg.replace("air:pm2:","")
            let res = await pm2.get_pm25(location)
            re_arry.push(reply_text(
                "地點: "+res.location+'\n'+
                "PM2.5: "+res.pm25+"\n" + 
                "最後更新時間: "+res.time+'\n'
            ))
        }
        else{
            re_arry.push(reply_text("Use 'air list' to get location"))
        }
        
    }
    else{
        re_arry.push(reply_text("嗨囉～"))
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
    let res = await request(options)
    console.log(res)
    return "Done"
};


let test = async()=>{
    let j = await reply('air list')
    console.log(JSON.stringify(j))
}
// test()