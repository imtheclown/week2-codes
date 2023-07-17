
const {axiosInstance} = require("./AxiosInstance")
const {firstURL, mainURL} = require("./Script1")
const {writeToCSV} = require("./CSVFileWriter")
const {axiosPromiseCreator} = require("./Script2")
// program related constants
const filename ="FirstStretch.csv"

async function firstStretch(province){
    await barangayInProvinceGetter(province).then(res =>{
        writeToCSV(res["result"], filename).then(()=>{
            console.log("barangays saved successfully")
        }).catch(err=>{
            console.log(err)
        })
        writeToCSV(res["error"], `err${filename}`).then(()=>{
            console.log("failed child and parent options are saved");
        }).catch(err =>{
            console.log(err)
        })
    })

}

async function barangayInProvinceGetter(province){
    return new Promise((resolve, reject)=>{
        // retrieves municipalities of a given province
        axiosPromiseCreator(firstURL).then(res =>{
            if(res && res.data){
                if(res.data.data && res.data.data.childOptions){
                    // stores the municipalities of a given province
                    let childOptions = res.data.data.childOptions;
                    childOptions = childOptions[`${province}`];
                    // calls a function that retrieves barangays for each municipality of the province
                    const allBarangay = getEachBarangay(childOptions, province)
                    allBarangay.then(res =>{
                        const resultArray = [];
                        const erroneousArray = []
                        for(key in res){
                            if(res[key].successful){
                                for(innerKey in res[key].data){
                                    resultArray.push({
                                        "barangay": res[key]["data"][innerKey],
                                        "municipality": res[key]["municipality"],
                                        "province": province
                                    })
                                }
                            }else{
                                erroneousArray.push({
                                    "province": province,
                                    "municipality": res[key]["municipality"]
                                })
                            }
                        }
                        resolve({
                            "result": resultArray,
                            "error": erroneousArray
                        })
                    }).catch(err=>{
                        console.log("something went wrong")
                        reject(err)
                    })
                }else{
                    console.log("may error")
                }
            }
        }).catch(err =>{
            console.log(err)
        })
    })


}

async function getEachBarangay(arrayParam, province){
    const result = []
    const error = []
    // creates a promise for each combination of province and municipality
    const promiseList = arrayParam.map(endpoint =>{
        return new Promise((resolve, reject) =>{
            axiosInstance({
                method: "GET",
                url: `${mainURL}?parentOption=${province}&childOption=${endpoint}`.replace(" ", "%20"),
            }).then(res =>{
                resolve({
                    "data": res.data.data,
                    "province": province,
                    "municipality": endpoint,
                    "successful": true
                })
            }).catch(err =>{
                if(err.response){
                    resolve({
                        "successful": false
                    })
                }else if(err.response){
                    console.log("failure")
                    reject(err)
                }else{
                    console.log("failure")
                    reject(err)
                }
            })
        })
    })
    // executes and waits for each of the generated promise above
    for(promise in promiseList){
        await promiseList[promise].then(res =>{
            result.push(res)
        }).catch(() =>{
            console.log(error)
        })
    }
    // returns the list of barangays of type object
    return result
}

module.exports ={barangayInProvinceGetter, firstStretch}
