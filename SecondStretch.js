const { axiosInstance } = require("./Script2")
const axios = require("axios")
const { firstURL, mainURL, province} = require("./Script1")
const { barangayInProvinceGetter } = require("./FirstStretch")
const { writeToCSV, csvCreator} = require("./CSVFileWriter");
const filename = `SecondStrech.csv`;
const {axiosPromiseCreator} = require("./Script2")

async function SecondStretch(){
    const provinces = await axiosPromiseCreator(firstURL).then(res =>{
        if(res && res.data &&res.data.data){
            if(res.data.data["parentOptions"]){
                return res.data.data["parentOptions"]
            }
        }
    })
    const resultArray = []
    const errorArray = []
    for(key in provinces){
        await barangayInProvinceGetter(provinces[key])
        .then(res =>{
            resultArray.push(...res.result);
            errorArray.push(...res.error)
        })
        console.log(`finished ${provinces[key]}`);
    }
    await writeToCSV(resultArray, filename).then(()=>{
        console.log("barangays saved")
    }).catch(()=>{
        console.log("barangays are not saved")
    })
    await writeToCSV(errorArray, `error${filename}`).then(()=>{
        console.log("errors saved");
    }).catch(()=>{
        console.log("errors are not saved");
    })
}

const timeStarted = Date.now()
async function executePromises(arrayParam) {
    let failedArray = [];
    let resultArray = [];
    let successful = 0, failed = 0;
    let start = Date.now(), end = Date.now()
    for(key in arrayParam){
        start = Date.now();
        while (end - start <= 3000){
            end = Date.now();
        }
        await  axiosInstance({
            method: "GET",
            url: arrayParam[key]["url"]
        }).then(resp =>{
            console.log("success");
            successful++;
            if(resp.data && resp.data.data){
                for (newkey in resp.data.data){
                    resultArray.push({
                        "province": `${arrayParam[key]["province"]}`,
                        "municipality": `${arrayParam[key]["municipality"]}`,
                        "barangay": `${resp.data.data[newkey]}`
                    })
                }
            }
        }).catch(err =>{
            console.log(`Error: Province: ${arrayParam[key]["province"]} with municipality: ${arrayParam[key]["municipality"]}`)
            failedArray.push({
                "parentOption": `${arrayParam[key]["province"]}`,
                "childOption":`${arrayParam[key]["municipality"]}`
            })
            failed ++;
        })

    }
    console.log(`Finished with ${successful} successful queries and ${failed} failed queries`);
    writeToCSV(resultArray, filename).then(()=>{
        console.log("success");
    }).catch(()=>{
        console.log("failed");
    })
    writeToCSV(failedArray, `${filename}Failed.csv`).then(() => {
        console.log("saving failed parent and child options successful")
    }).catch(() => {
        console.log("error saving failed parent and child options")
    })
    console.log(`Process took ${(Date.now() - start)/60} minutes`);

}

module.exports = {SecondStretch}