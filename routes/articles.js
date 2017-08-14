const express = require('express');
const router = express.Router();

// Article model
let Article = require('../models/article');
// User model
let User = require('../models/user');

// Add articles route
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('add_article', {
      title: 'Add Article'
    });
});

// Get single article
router.get('/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err) {
      console.log(err);
    }
    else {
      User.findById(article.author, (err, user) => {
        res.render('article', {
          article: article,
          author: user.name
        });
      });
    }
  });
});

// Edit single article
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if(err) {
      console.log(err);
    }
    else {
      if(article.author !== req.user.id) {
        req.flash('danger', 'Not authorized!');
        res.redirect('/');
      } else {
        res.render('edit_article', {
          title: 'Edit Article',
          article: article
        });
      }
    }
  });
});

// Add submit POST route
router.post('/add', (req, res) => {
  req.checkBody('title', 'Title can\'t be empty!').notEmpty();
  req.checkBody('body', 'Body can\'t be empty!').notEmpty();

  let errors = req.validationErrors();

  if(errors) {
    res.render('add_article', {
      errors: errors,
      title: 'Add Article'
    });
  }
  else {
    let article = new Article();
    article.title = req.body.title;
    article.body = req.body.body;
    article.author = req.user._id;

    article.save(function(err) {
      if(err) {
        console.log(err);
      }
      else {
        req.flash('success', 'Article Added!');
        res.redirect('/');
      }
    });
  }


});

// Update submit POST route
router.post('/edit/:id', (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.body = req.body.body;
  article.author = req.user._id;

  let query = {_id: req.params.id}

  Article.update(query, article, (err) => {
    if(err) {
      console.log(err);
    }
    else {
      req.flash('success', 'Article Updated!');
      res.redirect('/');
    }
  });
});

router.delete('/:id', (req, res) => {
  if(!req.user.id) {
    res.status(500).send();
  }
  let query = {_id: req.params.id};

  Article.findById(query, (err, article) => {
    if(article.author !== req.user.id) {
      res.status(500).send();
    } else {
      Article.remove(query, (err) => {
        if(err) {
          req.flash('danger', 'Error Occured!');
          console.log(err);
        }
        req.flash('success', 'Article deleted!');
        res.send('Success!');
      });
    }
  });

});

// Access Control
function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}


module.exports = router;
