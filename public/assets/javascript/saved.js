/* global bootbox */
$(document).ready(function() {
 // getting a reference to the article container div we will be rendering all articles ?
    // inside of
    var articleContainer = $(".article-container");
    // adding event listeners for dynamically generated buttons for deleting articles, 
    // pulling up article notes, saving article notes, and deleting article notes
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNote);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);

    // initPage kicks everything off when the page is loaded
    initPage();

    function initPage() {
        // Empty the article container, run an AJAX request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=true")
            .then(function(data) {
                // if we have headlines, render them to the page
                if (data && data.length) {
                    renderArticles(data);
                }
                else {
                    renderEmpty();
                }
            });
    }

    function renderArticles(articles) {
        // this function handles appending HTML containing our article data to the page
        // we are passed an array of JSON containing all available articles in our database
        var articlePanels = [];
        // we pass each article JSON object to the createPanel function which returns a bootstrap
        // panel with our article data inside
        for (var i = 0; i<articles.length; i++) {
            articlePanels.push(createPanel(articles[i]));
        }
        // once we have all of the HTML for the articles storedd in our articlePanels array,
        // append them to the articlePanels container
        articleContainer.append(articlePanels);
    }

    function createPanel(article) {
        // this function takes in a single JSON object for an article/headline
        // it constructs a jQuery element containing all of the formatted HTML for the
        // article panel
        var panel =
            $(["<div class='card card-default'>",
                "<div class='card-heading'>",
                "<h3>",
                article.headline,
                "<a class='btn btn-danger delete'>",
                "Delete From Saved",
                "</a>",
                "<a class='btn btn-info notes'>Article Notes</a>",
                "</h3>",
                "</div>",
                "<div class='card-body'>",
                article.summary,
                "</div>",
                "</div>"
            ].join(""));
            // we attach the article's id to the jQuery element
            // we will use his when trying to figure out which article he user wants to save
        panel.data("_id", article._id);
        // we return the constructed panel jQuery element
        return panel; 
    }

    function renderEmpty() {
        // this function renders some HTML to the page explaining we dont have any articles to view
        // using a joined array of HTML string data because it's easier to read/change than a concatenated string
        var emptyAlert =
            $(["<div class='alert alert-warning text-center'>",
                "<h4>Uh Oh, Looks like we don't have any new articles.</h4>",
                "</div>",
                "<div class='card card-default'>",
                "<div class='card-heading text-center'>",
                "<h3>Would you like to Browse Available Articles?</h3>",
                "</div>",
                "<div class='card-body text-center'>",
                "<h4><a href='/'>Browse Articles</a></h4>",
                "</div>",
                "</div>"
            ].join(""));
            // appending this data to the page
        articleContainer.append(emptyAlert);
    }

    function renderNotesList(data) {
        // This function handles rendering note list items to our notes modal
        // setting up an array of notes to render after finished
        // also setting up a currentNote variable to temporarily store each note
        var noteToRender = [];
        var currentNote;
        if (!data.notes.length) {
            // if we have no notes, just display a message explaining this
            currentNote = [
                "<li class='list-group-item'>",
                "No notes for this article yet.",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        }
        else {
            // if we do have notes, go through each one
            for (var i=0; i<data.notes.length; i++) {
                // construct an li element to contain our noteText and a delete button
                currentNote = $([
                    "<li class='list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class='btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                // store the note id on the delete button for easy access when trying to 
                // delete
                currentNote.children("button").data("_id", data.notes[i]._id);
                // adding our currentNote to the notesToRender array
                notesToRender.push(currentNote);
            }
        }
        // now append the notesToRender to the note-container inside the note modal
        $(".note-container").append(notesToRender);
    }

    function handleArticleDelete() {
        // this function handles deleting articles/headlines
        // we grab the id of the article to delete from the panel element the delete button 
        // sits inside
        var articleToDelete = $(this).parent(".panel").data();
        // using a delete method here just to be semantic since we are deleting an article/headline
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id
        }).then(function(data) {
            // if this works out, run initPage again which will rerender our list of saved articles
            if (data.ok) {
                initPage();
            }
        });
    }

    function handleArticleNotes() {
        // this function handles opening the notes modal and displaying our notes
        // we grab the id of the article to get the notes for from the panel element the delete button sits inside
        var currentArticle = $(this).parents(".panel").data();
        // grab any notes with this headline/article id
        $.get("/api/notes/" + currentArticle._id).then(function(data) {
            // constructing our initial HTML to add to the notes modal
            var modalText = [
                "<div class='container-fluid text-center'>",
                "<h4>Notes For Article: ",
                currentArticle._id,
                "</h4>",
                "<hr />",
                "<ul class='list-group note-container'>",
                "</ul>",
                "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
                "<button class='btn btn-success save'>Save Note</button>",
                "</div>"
            ].join("");
            // adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            // adding some information about the article and article notes to the save button for easy access
            // when trying to add a new note
            $(".btn.save").data("article", noteData);
            // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
            renderNotesList(noteData);
        });
    }

    function handleNoteSave() {
        // this function handles what happens when a user tries to save a new note for an 
        // article
        // setting a variable to hold some formatted data about our note,
        // grabbing the note typed into the input box
        var noteData;
        var newNote = $(".bootbox-box textarea").val().trim();
        // if we actually have data typed into the note input field, format it and post it 
        // the "/api/notes" route and send the formatted noteData as well
        if (newNote) {
            noteData = {
                _id: $(this).data("article")._id,
                noteText: newNote
            };
            $.post("/api/notes", noteData).then(function() {
                // when complete, close the modal
                bootbox.hideAll();
            });
        }
    }

    function handleNoteDelete() {
        // this function handles the deletion of notes
        // first we grab the id of the note we want to delete
        // we stored this data on the delete button when we created it
        var noteDelete = $(this).data("_id");
        // performs a DELETE request to the "/api/notes/" with the id of the note we're 
        // deleting as a parameter
        $.ajax({
            url: "/api/notes/" +  noteDelete,
            method: "DELETE"
        }).then(function() {
            // when done hide the modal
            bootbox.hideAll();
        });
    }
});