// imported modules
const axios = require("axios")
// custom scripts
const {axiosInstance} = require("./Script2")
const {firstURL, mainURL} = require("./Script1")
const {writeToCSV} = require("./CSVFileWriter")
const url = require("url");
// program related constants
const filename ="FirstStretch.csv"

axios.interceptors.response.use(undefined, (err) => {
    const { config, message } = err;
    if (!config || !config.retry) {
        return Promise.reject(err);
    }
    // retry while Network timeout or Network Error
    if (!(message.includes("timeout") || message.includes("Network Error"))) {
        return Promise.reject(err);
    }
    config.retry -= 1;
    const delayRetryRequest = new Promise((resolve) => {
        setTimeout(() => {
            console.log("retry the request", config.url);
            resolve();
        }, config.retryDelay || 1000);
    });
    return delayRetryRequest.then(() => axios(config));
});
async function getProvinceList(urlParam){
    return new Promise((resolve, reject)=>{
        return axiosInstance({
            method: "GET",
            url:`${urlParam}`
        }).then(res  =>{
            resolve(res);
        }).catch(err =>{
            reject(err);
        })
    })
}
async function barangayInProvinceGetter(province){
    getProvinceList(firstURL).then(res =>{
        if(res && res.data){
            if(res.data.data && res.data.data.childOptions){
                let childOptions = res.data.data.childOptions;
                childOptions = childOptions[`${province}`];
                const allBarangay = getEachBarangay(childOptions, province)
                allBarangay.then(resp =>{
                    if(resp && resp.length){
                        let commonArray =[]
                        let tempArray = []
                        for(key in resp){
                            tempArray = resp[key].data.data
                            for(innerKey in tempArray){
                                commonArray.push({"province": province, "municipality": childOptions[key], "barangay": tempArray[innerKey]})
                            }
                        }
                        if(commonArray.length){
                            writeToCSV(commonArray, filename).then(resp =>{
                                console.log(`successfully created a file and added ${commonArray.length} rows`)
                            }).catch(err =>{
                                console.log("error")
                            })
                        }

                    }
                }).catch((err)=>{
                    console.log(err)
                    console.log("Not all of the requests went successfully")
                })
            }else{
                console.log("may error")
            }
        }
    }).catch(err =>{
        console.log(err)
    })
}

function getEachBarangay(arrayParam, province){
    const promiseList = arrayParam.map(mun => {
        return axiosInstance.get(`${mainURL}?parentOption=${province}&childOption=${mun}`.replace(" ", "+"), {retry: 3, retryDelay: 3000})
    })
    return new Promise((resolve, reject) =>{
        axios.all(promiseList).then(res =>{
            resolve(res)
        }).catch(err =>{
            reject(err)
        })
    })
}

module.exports ={getEachBarangay, barangayInProvinceGetter, getProvinceList}
