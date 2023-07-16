const { axiosInstance } = require("./Script2")
const axios = require("axios")
const { firstURL, mainURL } = require("./Script1")
const { getProvinceList, getEachBarangay } = require("./FirstStretch")
const { writeToCSV } = require("./CSVFileWriter");
const filename = `SecondStrech.csv`;

async function getAllBarangay() {
    getProvinceList(firstURL).then(resp => {
                if (resp.data && resp.data.data) {
                    if (resp.data.data["childOptions"]) {
                        const endPointList = []
                        let childOptions = resp.data.data["childOptions"]
                        for (key in childOptions) {
                            for (innerKey in childOptions[`${key}`]) {
                                endPointList.push({
                                            "province": `${key}`,
                                            "municipality": `${childOptions[`${key}`][innerKey]}`,
                            "url": `${mainURL}?parentOption=${key}&childOption=${childOptions[`${key}`][innerKey]}`.replace(" ", "%20"),
                        })
                    }
                }
                executePromises(endPointList)

            }
        }
    }).catch(err=>{
        console.log(err);
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

module.exports = {getAllBarangay}