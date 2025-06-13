const { Queue } = require('bullmq');
const markerQueue = new Queue('markers', { 
    connection: { 
        port: 8768, 
        username: 'default', 
        host: '168.231.94.201', 
        password: '1rAsEOjoGqIQjRHyAPQIs9EooeX0eaYvcnOcI9maO1N9BaD8Ju2l5ndFJqVFQHpO' 
    } 
});
module.exports = markerQueue;
