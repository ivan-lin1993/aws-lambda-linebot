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
                "data": "air list"
            },{
                "type": "message",
                "label": '互相傷害',
                "data": "罵我"
            }
        ]))
    }
    else if (msg.indexOf("air")>=0){
        if (msg.indexOf("list")>=0){
            let res_list = await pm2.get_location_list()
            let res_msg = ""
            res_list.forEach((data,index)=>{
                console.log(data)
                res_msg +="地點: "+data.name+'\n'+
                "PM2.5: "+data.pm25+"\n" + 
                "最後更新時間: "+data.time+'\n'+
                "----"+'\n'
            })
            re_arry.push(reply_text(res_msg))
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
        re_arry.push(
            {
                "type": "template",
                "altText": "This is a buttons template",
                "template": {
                    "type": "buttons",
                    "thumbnailImageUrl": "https://example.com/bot/images/image.jpg",
                    "imageAspectRatio": "rectangle",
                    "imageSize": "cover",
                    "imageBackgroundColor": "#FFFFFF",
                    "title": "Menu",
                    "text": "Please select",
                    "defaultAction": {
                        "type": "uri",
                        "label": "View detail",
                        "uri": "http://example.com/page/123"
                    },
                    "actions": [
                        {
                          "type": "message",
                          "label": "Buy",
                          "data": "action=buy&itemid=123"
                        },
                        {
                          "type": "postback",
                          "label": "Add to cart",
                          "data": "action=add&itemid=123"
                        },
                        {
                          "type": "uri",
                          "label": "View detail",
                          "uri": "http://example.com/page/123"
                        }
                    ]
                }
              }
        )
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
    let j = await reply('help')
    console.log(JSON.stringify(j))
}
test()