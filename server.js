'use strict';

const express = require('express');
const url = require('url');
const MongoClient = require('mongodb').MongoClient;

const app = express();
const port = process.env.PORT || 8080;
const dbUrl = process.env.MLAB_URI;

/**
 * Landing page 
 */
app.get('/', (req, res) => {
    res.send('hi');
});

/**
 * Get original url and shortened url 
 */
app.get(/api\/short\/.*[\:\/]*.*/, (req, res) => {
    const urlRegex = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const urlMatch = url.parse(req.url).pathname.match(urlRegex);
    const result = {};
    const originalUrl = urlMatch[0];
    const urlCode = new Date().getTime();

    // handle invalid url
    if (!urlMatch) return res.send({error: 'Invalid url'});
    
    result.original_url = originalUrl;
    result.short_url = `${req.protocol}://${req.headers.host}/${urlCode}`;
    
    // save in database
    MongoClient.connect(dbUrl, (err, db) => {
        if (err) return console.error(`Unable to connect mongoDB. ${err}`);
        
        console.log(`Connection established to ${dbUrl}`);
        
        db.collection('url').save({
            code: urlCode, 
            original: originalUrl
        }, (err, status) => {
            if (err) return console.error(`Uable to write to mongoDB. ${err}`);
            
            res.send(result);
            
            db.close();
            console.log(`Saved to database.`);
        });
    });
});

/**
 *  Redirect short url to the real site
 */
app.get('/:siteId', (req, res) => {
    // find url document from db
    MongoClient.connect(dbUrl, (err, db) => {
        if (err) return console.error(`Unable to connect mongoDB. ${err}`);
        
        console.log(`Connection established to ${dbUrl}`);
        
        const urlCode = parseInt(url.parse(req.url).pathname.replace('/', ''));
        
        db.collection('url').findOne({code: urlCode}, (err, url) => {
            if (err) return console.error(`Unable to fetch url record. ${err}`);

            // redirect to original site
            if (url) res.redirect(url.original);
            
            db.close();
        });
    });
});

app.listen(port, () => {
   console.log(`Server is Listening to port ${port}`); 
});