'use strict'

const request = require('request-promise')
const pm2 = require('./pm2')
const ubike = require('./youbike.js')

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

let help = () => {
    return reply_template([{
        "type": "message",
        "label": "PM2.5 列表",
            "text": "air list"
        },{
            "type": "message",
            "label": 'Youbike',
            "text": "ubike"
        },{
            "type": "message",
            "label": '月經使用',
            "text": "period"
        }
    ]);
}

let reply = async msg => {
    msg = msg.toLowerCase()
    let re_arry=[];
    if (msg == "help"){
        re_arry.push(help());
    }
    else if (msg.indexOf("period")>=0){
        if (msg.indexOf("get")>=0){
            let text = "last time: \n";
            text +="danger: \n" ;
            text +="safe: \n" ;
            text +="next: " ;
            re_arry.push(reply_text(text));
        }
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
    else if(msg=="ubike"){
        let datalist = await ubike.get_youbike_list()
        let res_msg = ""
        for(let i =0;i<datalist.length;i+=1){
            res_msg += datalist[i]['name'] + ":\n" +
            "總共:" + datalist[i]['total'] + "\n" +
            "可用:" + datalist[i]['avalible'] + "\n" +
            "空位:" + datalist[i]['space'] +
            "最後更新時間:" + datalist[i]['time'] + "\n======================\n"
        }
        re_arry.push(reply_text(res_msg))
    }
    else{
        re_arry.push(reply_text("嗨囉～"));
        re_arry.push(reply_template([{
            "type": "message",
            "label": "功能列表",
                "text": "help"
            }
        ]));

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
    let j = await reply('ubike')
}
test()