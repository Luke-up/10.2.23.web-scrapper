const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const PORT = 8000;

const app = express();

const url = "https://www.timelessboardgames.co.za/online-shop/";
const games = [];

axios(url)
    .then(async res => {
        const html = res.data;
        const $ = cheerio.load(html);

        $('.w3-card .w3-display-bottommiddle .w3-small a strong', html).each(function() {
            const title = $(this).text();
            games.push({ title }); // Push titles as objects for consistency
        });

        const elements = $('.w3-card .w3-button', html);

        if (elements.length >= 2) {
            const pageCount = elements.eq(elements.length - 2).text();
            return Number(pageCount); // Return pageCount for the next `then` block
        }
    })
    .then(async pageCount => {
        if (pageCount) {
            const requests = [];
            for (let i = 2; i < pageCount + 1; i++) {
                const otherUrl = url + "?page=" + i;
                console.log(otherUrl);
                requests.push(
                    axios(otherUrl)
                        .then(res => {
                            const html = res.data;
                            const $ = cheerio.load(html);

                            $('.w3-card .w3-display-bottommiddle .w3-small a strong', html).each(function() {
                                const title = $(this).text();
                                games.push({ title });
                            });
                        })
                        .catch(err => console.log(err))
                );
            }
            // Wait for all requests to finish
            await Promise.all(requests);
            // Print all games
            console.log("All games found:");
            games.forEach(game => console.log(game.title));
        }
    })
    .catch(err => console.log(err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
