const { firstURL, mainURL, province} = require("./Script1")
const { barangayInProvinceGetter } = require("./FirstStretch")
const { writeToCSV, csvCreator} = require("./CSVFileWriter");
const filename = `SecondStretch.csv`;
const {axiosPromiseCreator} = require("./Script2")

async function SecondStretch(){
    // retrieves list of provinces
    const provinces = await axiosPromiseCreator(firstURL).then(res =>{
        if(res && res.data &&res.data.data){
            if(res.data.data["parentOptions"]){
                return res.data.data["parentOptions"]
            }
        }
    })
    // storage arrays
    const resultArray = []
    const errorArray = []
    // loop through the array to get barangays in each province
    for(key in provinces){
        // returns object in form {result[], error[]}
        await barangayInProvinceGetter(provinces[key])
        .then(res =>{
            resultArray.push(...res.result);
            errorArray.push(...res.error)
        }).catch(err =>{
            console.log(err.response)
            })
    }
    // creates CSV file of barangays
    await writeToCSV(resultArray, filename).then(()=>{
        console.log(`Barangays saved, added ${resultArray.length} rows`);
    }).catch(()=>{
        console.log("barangays are not saved")
    })
    // creates CSV file for province and municipality with errors
    await writeToCSV(errorArray, `error${filename}`).then(()=>{
        console.log(`Errors saved, added ${errorArray.length} rows`);
    }).catch(()=>{
        console.log("errors are not saved");
    })
}



module.exports = {SecondStretch}