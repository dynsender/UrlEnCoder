const express = require('express');
const crypto = require('crypto');
const app = express();
const port = 3001;
// In-memory storage for encoded URLs
const urlMapping = {};
// Function to validate URL
function isValidUrl(url) {
    const pattern = new RegExp('^(https?:\\/\\/)' + // protocol (http or https)
        '((([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\\.)+[a-zA-Z]{2,}|localhost|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4)
        '(\\:\\d+)?(\\/[-a-zA-Z0-9+&@#/%=~|\\.:,;]*)*'); // port and path without trailing space
    return pattern.test(url);
}
// Function to encode a URL
function encodeUrl(url) {
    return encodeURIComponent(url);
}
// Function to decode a URL
function decodeUrl(encodedUrl) {
    return decodeURIComponent(encodedUrl);
}
// Function to create a hash for the URL
function hashUrl(url) {
    return crypto.createHash('sha256').update(url).digest('hex');
}
// Route to serve the HTML form
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>URL Encoder</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                h1 {
                    color: #333;
                }
                form {
                    background: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                label {
                    display: block;
                    margin-bottom: 10px;
                    font-weight: bold;
                }
                input[type="text"] {
                    width: 100%;
                    padding: 10px;
                    margin-bottom: 20px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                }
                button {
                    padding: 10px 15px;
                    background-color: #5cb85c;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #4cae4c;
                }
                .result {
                    margin-top: 20px;
                    background: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                a {
                    display: inline-block;
                    margin-top: 10px;
                    color: #007bff;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>URL Encoder</h1>
            <form action="/encode" method="GET">
                <label for="url">Enter URL to encode:</label>
                <input type="text" id="url" name="url" required>
                <button type="submit">Encode URL</button>
            </form>
        </body>
        </html>
    `);
});
// Route to encode a URL
app.get('/encode', (req, res) => {
    const { url } = req.query;
    if (!url || !isValidUrl(url)) {
        return res.status(400).send('Please provide a valid URL to encode.');
    }
    const encodedUrl = encodeUrl(url);
    const urlHash = hashUrl(url);
    urlMapping[urlHash] = url; // Store the mapping
    // Escape HTML to prevent XSS
    const safeEncodedUrl = encodedUrl.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Encoded URL</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }
                h1 {
                    color: #333;
                }
                .result {
                    background: #fff;
                    padding: 20px;
                    border-radius: 5px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                }
                a {
                    display: inline-block;
                    margin-top: 10px;
                    color: #007bff;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <h1>Encoded URL</h1>
            <div class="result">
                <p><strong>Encoded URL:</strong></p>
                <p>${safeEncodedUrl}</p>
                <a href="/redirect/${urlHash}">Visit Encoded URL</a>
                <br>
                <a href="/">Go Back</a>
            </div>
        </body>
        </html>
    `);
});
// Route to decode and redirect to the original URL
app.get('/redirect/:urlHash', (req, res) => {
    const urlHash = req.params.urlHash;
    const originalUrl = urlMapping[urlHash];
    if (!originalUrl) {
        return res.status(404).send('URL not found.');
    }
    res.redirect(originalUrl);
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
