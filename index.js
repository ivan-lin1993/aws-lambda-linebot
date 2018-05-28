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
    return {
        "type":"template",
        "altText":"PM2.5",
        "template":{
            "type":"buttons",
            "text":"PM2.5",
            "actions": mlist
        }
    }
}


let reply = async msg => {
    msg = msg.toLowerCase()
    let re_arry=[];
    if (msg.indexOf("罵我")>=0){
        re_arry.push(reply_text("別"))
    }
    else if (msg=="抽"){
        re_arry.push(reply_text('抽個頭'))
    }
    else if (msg == "help"){
        re_arry.push(reply_template([{
                "type": "message",
                "label": "PM2.5 列表",
                "text": "air list"
            },{
                "type": "message",
                "label": '互相傷害',
                "text": "罵我"
            }
        ]))
    }
    else if (msg.indexOf("air")>=0){
        if (msg.indexOf("list")>=0){
            let res_list = await pm2.get_location_list()
            let res_msg = ""
            res_list.forEach((data,index)=>{
                console.log(data)
                // res_msg 
                let content = "地點: "+data.name+'\n'+
                "PM2.5: "+data.pm25+"\n" + 
                "最後更新時間: "+data.time+'\n'+
                "----"+'\n'
                // line message limit can't over 2000 char
                // split message
                if (content.length + res_msg.length >= 2000){
                    re_arry.push(reply_text(res_msg))
                    res_msg = content
                }else{
                    res_msg += content
                }
            })
            if (res_msg.length > 0){
                re_arry.push(reply_text(res_msg))
            }
        }
        else if (msg.indexOf("air:pm25:") >= 0 ){
            let location = msg.replace("air:pm25:","")
            let res = await pm2.get_pm25(location)
            re_arry.push(reply_text(
                "地點: "+location+'\n'+
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
    console.log(JSON.stringify(re_arry))
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
    console.log("---------------")
    console.log(JSON.stringify(j))
}
test()