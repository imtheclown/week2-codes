
const {default: axios} = require("axios");
//imported custom modules
const {csvCreator} = require("./CSVFileWriter");
const {province, municipality, firstURL, mainURL} = require("./Script1");
const filename = `Script3.csv`
const {axiosInstance} = require("./Script2")
//list of endpoints
const endPoints = [
    `${mainURL}?parentOption=${province}&childOption=${municipality}`,
    `${firstURL}`
]
//async and away function
async function asyncGetBarangay(){
    //creates and executes axios requests for all the entries at the endpoint array
    // if one of the requests fail the process fails
    await axios.all(endPoints.map(endpoint =>{
        return axiosInstance({
            method:"GET",
            url: endpoint
        })
    })).then(
        // creates the CSV file
        res =>{
            console.log(`attempt to get data from the ${endPoints.length} API endpoints is successful`)
            if(res && res.length > 0){
                if(res[0].data && res[1].data){
                    csvCreator(res[0].data, res[1].data, filename, province, municipality)
                        .then(()=>{
                            console.log("Process executed successfully")
                        })
                        .catch(() =>{
                            console.log("creation of CSV encountered an error")
                        })
                }
            }
        }
    ).catch(
        err=>{
            console.log(err)
            console.log(`Attempt to get data from the ${endPoints.length} API endpoints failed`)
        }
    )
}

module.exports ={asyncGetBarangay}