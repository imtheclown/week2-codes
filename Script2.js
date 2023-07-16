// imported module
const https = require("https");
const {default: axios} = require("axios");
// imported custom modules
const {csvCreator} = require("./CSVFileWriter")
const {province, municipality, firstURL, mainURL} = require("./Script1");
//
const filename = `Script2.csv`
// https.Agent configuration
const errorCertAgent = new https.Agent({
    rejectUnauthorized: false,
})
//customized instance of axios
const axiosInstance = axios.create({
    timeout: 60000,
    headers: { 'X-Custom-Header': 'foobar' },
    httpsAgent: errorCertAgent,
});

const endpoints = [
    `${mainURL}?parentOption=${province}&childOption=${municipality}`,
    `${firstURL}`
]
function axiosPromise(province, municipality){
    // create a list of promises
    const newPromiseList = endpoints.map(endpoint => {
        return new Promise((resolve, reject) => {
            axiosInstance({
                method: "GET",
                url: endpoint
            }).then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        }).then(res => {
            if (res && res.data) {
                return res
            }
        }).catch(err => {
            console.log(err)
        })
    })
    // executes all the generated promises
    // if at least one fails, the process fails
    Promise.all(newPromiseList)
        // creates CSV file
        .then(res => {
        if (res && res.length === newPromiseList.length) {
            csvCreator(res[0].data, res[1].data, filename, province, municipality)
                .then(() => {
                console.log("Process executed successfully")
            }).catch(err => {
                console.log(err);
                console.log("creation of CSV encountered an error")
            })
        }
    }).catch(() => {
        console.log("Failed to retrieve all the required information")
    })
}
module.exports = {axiosInstance, axiosPromise}



