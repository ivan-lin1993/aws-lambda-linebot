// const request = require('request');
const request = require('request-promise');
const fs = require('fs')
const http = require('http')
const fetch = require('node-fetch')

let sleep = (ms)=>{
    return new Promise(resolve => setTimeout(resolve, ms));
}

let download_file = async ()=>{
    console.log("start")
    // let res = await download_file()
    const response = await fetch('https://tpairbox.blob.core.windows.net/blobfs/AirBoxData_V3.gz')
    
    
    await new Promise(resolve=>{
        const des = fs.createWriteStream('/tmp/pm25')
        response.body.pipe(des)
        des.on('finish',()=>{
            return resolve()
        })
    })
    
    let pm25file  = await fs.readFileSync('/tmp/pm25')
    let pm25object = JSON.parse(pm25file.toString())
    console.log(pm25object.devices)
    return pm25object.devices
}

let readfile = async ()=>{
    let pm25file  = await fs.readFileSync('pm25')
    let pm25object = JSON.parse(pm25file.toString())
    console.log(pm25object)
    let mlist = []
    for (let i=0 ; i < pm25object.devices.length ; i+=1){
        console.log(i)
        mlist.push(pm25object.devices[i].name)
    }
    console.log(mlist.toString())
}

module.exports ={
    get_data: async ()=>{
        let res = await download_file()
        return res
    }
}