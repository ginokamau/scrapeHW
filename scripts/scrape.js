// scrape script

// require request and cheerio, making our scrapes possible
var request = require("request");
var cheerio = require("cheerio");

var scrape = function (cb) {

    request("https://www.cleveland.com/#sports", function(err, res, body){

        var $ = cheerio.load(body);

        var articles = [];

        $(".article__details").each(function(i, element){

            var head = $(this).children(".article__details--headline").text().trim();
            var sum = $(this).children(".article__details--summary").text().trim();

            if(head && sum){
                // regex replace method to trim white space
                var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
                var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();

                var dataToAdd = {
                    headline: headNeat,
                    summary: sumNeat
                }

                articles.push(dataToAdd);
            }
        });
        cb(articles);
    });
};

module.exports = scrape;