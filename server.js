'use strict';

const express = require('express');
const url = require('url');

const app = express();
const port = process.env.PORT || 8080;

app.get('/', function(req, res) {
    res.send('hi');
});

/**
 * Get original url and shortened url 
 */
app.get(/api\/short\/.*[\:\/]*.*/, function(req, res) {
    const urlRegex = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const urlMatch = url.parse(req.url).pathname.match(urlRegex);
    
    // handling invalid url
    if (!urlMatch)
        res.send({error: 'invalid url'});
    
    const result = {};
    const originalUrl = urlMatch[0];

    result.original_url = originalUrl;
    result.short_url = req.headers.host + '/' + new Date().getTime();
    
    // TODO: save in database
    
    res.send(result);
    
});

app.get('/:siteId', function() {
    // TODO
    // read from db
    // redirect traffic
});

app.listen(port, function() {
   console.log('Server is Listening to', port); 
});