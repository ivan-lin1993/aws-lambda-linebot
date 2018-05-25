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
    const response = await fetch('https://tpairbox.blob.core.windows.net/blobfs/AirBoxData_V3.gz')
    return await new Promise(resolve=>{
        const des = fs.createWriteStream('/tmp/pm25')
        response.body.pipe(des)
        des.on('finish',()=>{
            return resolve()
        })
    })
}

let readfile2Json = async ()=>{
    let pm25file  = await fs.readFileSync('/tmp/pm25')
    let pm25object = JSON.parse(pm25file.toString())
    return await pm25object
}


let to_list = data => {
    let mlist = []
    for (let i=0 ; i < data.devices.length ; i+=1){
        mlist.push(data.devices[i].name)
    }
    return mlist
}


let get_location_list = async () =>{
    await download_file()
    let mobj = await readfile2Json()
    return to_list(mobj)
    
}


let get_pm25 = async location_name => {
    await download_file()
    let mobj = await readfile2Json()
    for (let i =0 ; i < mobj.devices.length; i+=1){
        if (mobj.devices[i].name == location_name){
            return {
                "name":location_name,
                "pm25":mobj.devices[i].pm25,
                "time":mobj.devices[i].time
            }
        }
    }
    return false
} 

module.exports ={
    get_location_list: async ()=>{
        return await get_location_list()
    },
    get_pm25: async (location)=>{
        return await get_pm25(location)
    }
}

let test = async ()=>{
    let res = await get_location_list()
    console.log(res)
    res = await get_pm25('臺北市大理國小')
    console.log(res)
}
// test()