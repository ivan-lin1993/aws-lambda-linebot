const request = require('request-promise')
const fs = require('fs')
const http = require('http')
const fetch = require('node-fetch')


let get_youbike_list = async ()=>{
    let data = await request.get("http://data.ntpc.gov.tw/od/data/api/54DDDC93-589C-4858-9C95-18B2046CC1FC?$format=json")
    data = JSON.parse(data)
    let mlist = []
    let count = 2
    for(let i = 0;i<data.length;i++){
        if (data[i]['sno'] == '1033' || data[i]['sno'] == '1034'){
            let t = data[i]['mday']
            mlist.push({
                'name': data[i]['sna'],
                'total': data[i]['tot'],
                'avalible': data[i]['sbi'],
                'space': data[i]['bemp'],
                'time': t.slice(0,4) + "/" + t.slice(4,6) + "/" + t.slice(6,8) + "T" + t.slice(8,10) + '.' + t.slice(10,12) + '.' + t.slice(12,14)
            })
            count -= 1
        }
        if (count == 0){
            break
        }
        
    }
    return mlist
}
module.exports ={
    get_youbike_list: async ()=>{
        return await get_youbike_list()
    }
}