const request = require('request-promise')

let get_option = ()=>{
    return {
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': "g6nVDFIiUL1818CAC0DA5anANXv8WMqp7wHRzBO5"
        }
    }   
}


let get_cur_daily_logs = async (date=null) => {
    if (date === null){
        date = new Date();
        date = date.getFullYear() + "/" + ("0"+(date.getMonth()+1)).slice(-2) + "/" + ("0" + date.getDate()).slice(-2);
    }
    let option = get_option()
    let query = "select job_status, count(*) as mcount \
                    FROM at_job_log where job_name = 'cur billing job' and job_title like 'Daily-" + date +"%' group by job_status order by job_status" ;
    let mjson = {
        "usage":"is_query",
        "host_p":"/Prod/Billing/DB/aurora-endpoint",
        "user_p":"/Prod/Billing/DB/aurora-user",
        "password_p":"/Prod/Billing/DB/aurora-pwd",
        "DB":"atlas",
        "query": query,
    }
    option['json']=mjson
    let data = await request.post('https://i3d13vuq94.execute-api.us-west-2.amazonaws.com/deploy/',option)
    console.log(data)
    let res = "";
    for(let i = 0; i< data['result'].length ; i++) {
        res += "job_status:" + data['result'][i]['job_status'] + " : " + data['result'][i]['mcount'] + "\n"
    }    
    return res;
}

module.exports = {
    get_cur_daily_logs: get_cur_daily_logs
}

let test = async()=>{
    // let j = await reply('period put: 2019/07/26')
    let j = await get_cur_daily_logs()
}
// test()