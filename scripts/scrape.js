// scrape script

// require request and cheerio, making our scrapes possible
var request = require("request");
var cheerio = require("cheerio");

var scrape = function (cb) {

    request("https://www.clevelandbrowns.com/news/all", function(err, res, body){

        var $ = cheerio.load(body);

        var articles = [];

        $(".d3-o-media-object__body").each(function(i, element){

            var head = $(this).children(".d3-o-media-object__title").text().trim();
            var sum = $(this).children(".d3-o-media-object__summary").text().trim();

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