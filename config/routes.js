// Server routes
// 

// bring in Scrape function from our script directory
var scrape = require("../scripts/scrape");

// bring in headlines and notes from the controller
var headlinesController = require("../controllers/headlines");
var notesController = require("../controllers/notes");

module.exports = function(router) {
    // this route renders the homepage
    router.get("/", function(req, res) {
        res.render("home");
    });
    // this route renders the saved handlebars page
    router.get("/saved", function(req, res) {
        res.render("saved");
    });

    // fetch all articles
    router.get("/api/fetch", function(req, res) {
        headlinesController.fetch(function(err, docs) {
            if (!docs || docs.insertedCount === 0) {
                res.json({
                    message: "No new articles today. Check back tomorrow!"
                });
            }
            else {
                res.json({
                    message: "Added "+docs.insertedCount+" new articles!"
                });
            }
        });
    });

    // fetch specific queried articles
    router.get("/api/headlines", function(req, res) {
        var query = {};
        if (req.query.saved) {
            query = req.query;
        }

        headlinesController.get(query, function(data) {
            res.json(data);
        });
    });

    // delete specific article
    router.delete("/api/headlines/:id", function(req, res) {
        var query = {};
        query._id = req.params.id;
        headlinesController.delete(query, function(err, data) {
            res.json(data);
        });
    });

    // updates headlines
    router.patch("/api/headlines", function(req, res) {
        headlinesController.update(req.body, function(err, data) {
            res.json(data);
        });
    });

    // grabs all the notes associated with article
    router.get("/api/notes/:headline_id?", function(req, res) {
        var query = {};
        if (req.params.headline_id) {
            query._id = req.params.headline_id;
        }

        notesController.get(query, function(err, data) {
            res.json(data);
        });
    });

    // deletes notes
    router.delete("/api/notes/:id", function(req, res) {
        var query = {};
        query._id = req.params.id;
        notesController.delete(query, function(err, data) {
            res.json(data);
        });
    });

    // post new notes to articles
    router.post("/api/notes", function(req,res) {
        notesController.save(req.body, function(data) {
            res.json(data);
        });
    });

    
};