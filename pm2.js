const request = require('request');
const fs = require('fs')
const http = require('http')

let sleep = (ms)=>{
    return new Promise(resolve => setTimeout(resolve, ms));
}



let download_file = ()=>{
    return new Promise((resolve,reject)=>{
        let file = fs.createWriteStream('tmp/test');
        request.get("https://tpairbox.blob.core.windows.net/blobfs/AirBoxData_V3.gz",(err,res)=>{
            console.log(res['body'])
        })
        
    })
}

let demo = async() =>{
    console.log("start")
    await sleep(100)
    let res = await download_file()
    
    console.log("end")
}

// demo()

module.exports ={
    get_data: async ()=>{
        let res = await download_file()
        return res
    }
}
