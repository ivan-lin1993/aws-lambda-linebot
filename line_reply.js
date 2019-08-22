const request = require('request-promise')

function LineReply(){}

LineReply.prototype.reply_template = (mlist,function_text="功能")=>{
    return {
        "type":"template",
        "altText":"功能",
        "template":{
            "type":"buttons",
            "text":function_text,
            "actions": mlist
        }
    }
}

LineReply.prototype.reply_text = msg => {
    return {
        "type":"text",
        "text":msg
    }
}



LineReply.prototype.post_data = async (replyToken, message) => {
    // let message = event['events'][0]['message'].text
    // let userId = event['events'][0]['source']['userId']
    // let replyToken = event['events'][0]['replyToken']
    let post_data = {
        "replyToken": replyToken,
        "messages": message
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
}

module.exports = {
    LineReply: LineReply
}