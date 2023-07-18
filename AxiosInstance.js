const https = require("https");
const {default: axios} = require("axios");

// https.Agent configuration
const errorCertAgent = new https.Agent({
    rejectUnauthorized: false,
})
//customized instance of axios
const axiosInstance = axios.create({
    timeout: 1000,
    headers: { 'X-Custom-Header': 'foobar' },
    httpsAgent: errorCertAgent,
});
axios.interceptors.response.use(undefined, (err) => {
    const { config, message } = err;
    console.log(message)
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

module.exports = {axiosInstance}
