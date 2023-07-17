// express server essentials
const express = require('express');
const app = express();
const port = 5000;
// used Node Modules

// custom imported modules
// project related constants
const url = "https://demo.myruntime.com/sustainability-run/fulfillmentClustersService/api/getPhilClusterOptions/sustainabilityRun";
const firstURL =`https://demo.myruntime.com/website/fulfillmentClustersService/api/getPhilClusters/myruntimeWeb`
const municipality = "Miagao";
const province = "Iloilo";

//custom query modules
const {fetchBarangay} = require("./Script1")
const {axiosPromise} = require("./Script2")
const {asyncGetBarangay} = require("./Script3")
const {getAllBarangay} = require("./SecondStretch");
// first and second stretch modules
const {firstStretch} = require("./FirstStretch")

// server endpoint
app.get('/', (req, res) => {
    firstStretch(province);
});

// application listens to port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});