const AWS = require('aws-sdk');
const bucket_name = "ivan-data";
const key_name = "clover/period";

let get_s3_value =  async () =>{
    let s3 = new AWS.S3();
    let body = await new Promise((resolve,reject)=>{
        try{
            s3.getObject({
                Bucket: bucket_name, 
                Key: key_name
               },(err, data)=>{
                   if (err){
                       reject(err)
                   }
                   resolve(data.Body)
            })
        }
        catch (err){
            reject(err)
        }
    }).catch((err)=>{
        console.log(err)
    })
    console.log(body.toString())
    return body.toString();
    
}
let format_date = (date)=>{
    return   date.getFullYear() + "/" + ("0"+(date.getMonth()+1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
}


let get_data = async () =>{
    let mdate = await get_s3_value()
    let dlist = mdate.split("/")
    let year= dlist[0]
    let month= dlist[1]
    let day= dlist[2]
    let date = new Date( parseInt(year), parseInt(month)-1, parseInt(day), +8)
    let date_end = new Date( parseInt(year), parseInt(month)-1, parseInt(day) + 5 , -16)
    let next_date = new Date( parseInt(year), parseInt(month)-1, parseInt(day) + 29, -16)
    let next_date_end = new Date( parseInt(year), parseInt(month)-1, parseInt(day) + 33 , -16)
    let danger_start1 = new Date( parseInt(year), parseInt(month)-1, parseInt(day)-18, -16)
    let danger_end1 = new Date( parseInt(year), parseInt(month)-1, parseInt(day)-9, -16)
    let danger_start2 = new Date( parseInt(year), parseInt(month)-1, parseInt(day)+10, -16)
    let danger_end2 = new Date( parseInt(year), parseInt(month)-1, parseInt(day)+19, -16)

    let res = ""
    res +="last time:\n" + format_date(date) + " ~ " + format_date(date_end) + "\n\n";
    res +="danger:\n" + format_date(danger_start1) + " ~ " + format_date(danger_end1) + "\n\n";
    res +="next time:\n" + format_date(next_date) + " ~ " + format_date(next_date_end) + "\n\n";
    res +="danger:\n" + format_date(danger_start2) + " ~ " + format_date(danger_end2) ;
    // console.log(format_date(date))
    // console.log(format_date(danger_start1))
    // console.log(format_date(danger_end1))
    return res
}

let update_date = async (date) =>{
    let s3 = new AWS.S3();
    let params = {
        Body: date, 
        Bucket: bucket_name, 
        Key: key_name
    };
    await new Promise((resolve,reject)=>{
        try{
            s3.putObject(params, function(err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                }
                console.log(data);
                resolve();
            });
        }catch(err){
            reject(err)
        }
    }).catch((err)=>{
        console.log(err)
        return false;
    });
    return true;
}

module.exports ={
    get_data: async () =>{
        return await get_data()
    },
    update_date: async (date) =>{
        return await update_date(date)
    }
}
let test = async ()=>{
    await update_date('2019-07-26')
    let res = await get_data()
    console.log(res)
}
// test()