'use strict'

const request = require('request-promise')
const pm2 = require('./pm2')
const ubike = require('./youbike.js')
const period = require('./period.js')
const LineReply = require('./line_reply.js').LineReply
const ecv_log = require('./ecv_log.js')

let line_reply = new LineReply()
// let reply_text = msg => {
//     return {
//         "type":"text",
//         "text":msg
//     }
// }


// let reply_template = (mlist,function_text="功能")=>{
//     return {
//         "type":"template",
//         "altText":"功能",
//         "template":{
//             "type":"buttons",
//             "text":function_text,
//             "actions": mlist
//         }
//     }
// }

let help = () => {
    return line_reply.reply_template([{
        "type": "message",
        "label": "PM2.5 列表",
            "text": "air list"
        },{
            "type": "message",
            "label": 'Youbike',
            "text": "ubike"
        },{
            "type": "message",
            "label": '月經查詢',
            "text": "period"
        },{
            "type": "message",
            "label": 'ECV Logs',
            "text": "ecv log"
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
            let text = await period.get_data();
            re_arry.push(line_reply.reply_text(text));
        }
        else if(msg.indexOf("period put:")>=0){
            let date = msg.split("period put: ")[1]
            if (date.length == 10){
                let success = await period.update_date(date);
                if (success){
                    re_arry.push(line_reply.reply_text("Update to " + date))
                }else{
                    re_arry.push(line_reply.reply_text("Failed"))
                }
            }
            else{
                re_arry.push(line_reply.reply_text("period put: yyyy/mm/dd"))
            }
        }
        else{
            re_arry.push(line_reply.reply_template([
                {
                    "type": "message",
                    "label": "查詢",
                    "text": "period get"
                },{
                    "type": "message",
                    "label": "設置",
                    "text": "period put: "
                },
            ],"月經"))
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
                    re_arry.push(line_reply.reply_text(res_msg))
                    res_msg = content
                }else{
                    res_msg += content
                }
            })
            if (res_msg.length > 0){
                re_arry.push(line_reply.reply_text(res_msg))
            }
        }
        else if (msg.indexOf("air:pm25:") >= 0 ){
            let location = msg.replace("air:pm25:","")
            let res = await pm2.get_pm25(location)
            re_arry.push(line_reply.reply_text(
                "地點: "+location+'\n'+
                "PM2.5: "+res.pm25+"\n" + 
                "最後更新時間: "+res.time+'\n'
            ))
        }
        else{
            re_arry.push(line_reply.reply_text("Use 'air list' to get location"))
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
        re_arry.push(line_reply.reply_text(res_msg))
    }
    else if(msg.indexOf("ecv log")>=0){
        if (msg.indexOf("/")>=0){
            date = msg.split(": ")[1];
            let res_data = await ecv_log.get_cur_daily_logs(date)
            re_arry.push(line_reply.reply_text(res_data));
        }
        else if (msg.indexOf("today")>=0){
            let res_data = await ecv_log.get_cur_daily_logs()
            console.log(res_data)
            re_arry.push(line_reply.reply_text(res_data));

        }
        else{
            let date = new Date();
            date = date.getFullYear() + "/" + ("0"+(date.getMonth()+1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
            re_arry.push(line_reply.reply_template([
                {
                    "type": "message",
                    "label": "今日",
                    "text": "ecv log today"
                },{
                    "type": "message",
                    "label": "選擇日期",
                    "text": "ecv log:" + date
                },
            ],"ECV Logs"))
        }
    }
    else{
        re_arry.push(line_reply.reply_text("嗨囉～"));
        re_arry.push(line_reply.reply_template([{
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
    console.log(message)
    console.log(userId)
    console.log(replyToken)
    message = await reply(message);
    let res = await line_reply.post_data(replyToken, message)

    console.log(res)
    return "Done"
};


let test = async()=>{
    // let j = await reply('period put: 2019/07/26')
    let j = await reply('ecv log today')
}
test()