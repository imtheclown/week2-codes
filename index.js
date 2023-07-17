// express server essentials
const express = require('express');
const app = express();
const port = 5000;
// used Node Modules
// custom imported modules
// project related constants
const province = "Iloilo";
//custom query modules
// Script1
const {fetchBarangay} = require("./Script1")
// Script2
const {axiosPromise} = require("./Script2")
// Script3
const {asyncGetBarangay} = require("./Script3")
// second stretch
const {SecondStretch} = require("./SecondStretch");
// first stretch
const {firstStretch} = require("./FirstStretch")

// server endpoint
app.get('/', (req, res) => {
    SecondStretch()
});

// application listens to port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});