/* Setting things up. */
var fs = require('fs'),
    util = require('util'),
    path = require('path'),
    express = require('express'),
    app = express(),   
    Twit = require('twit'),
    config = {
    /* Be sure to update the .env file with your API keys. See how to get them: https://botwiki.org/tutorials/make-an-image-posting-twitter-bot/#creating-a-twitter-app*/      
      twitter: {
        consumer_key: process.env.CONSUMER_KEY,
        consumer_secret: process.env.CONSUMER_SECRET,
        access_token: process.env.ACCESS_TOKEN,
        access_token_secret: process.env.ACCESS_TOKEN_SECRET
      }
    },
    T = new Twit(config.twitter),
    stream = T.stream('statuses/sample');

function random_from_array(arr){
  return arr[Math.floor(Math.random()*arr.length)]; 
}

app.use(express.static('public'));

/* You can use uptimerobot.com or a similar site to hit your /tweet endpoint to wake up your app and make your Twitter bot tweet. */

app.all("/tweet", function (request, response) {
  /* Respond to @ mentions */
  fs.readFile(__dirname + '/last_tweet_id.txt', 'utf8', function (err, last_tweet_id) {
    /* First, let's load the ID of the last tweet we responded to. */
    console.log('last_tweet_id:', last_tweet_id);
    var search_terms = process.env.SEARCH_TERMS.split(',');
    console.log('search_terms', search_terms);
    if (Object.prototype.toString.call( search_terms ) === '[object Array]' && search_terms.length > 1){
      search_terms = search_terms.join(' OR ');
    }

    T.get('search/tweets', { q:  search_terms + ' -from:' + process.env.TWITTER_HANDLE, since_id: last_tweet_id }, function(err, data, response) {
      err = err || 'API: no error';
      console.log(err)
      /* Next, let's search for some interesting Tweets. */
      if (data && data.statuses && data.statuses.length){
        // console.log(data.statuses);
        data.statuses.forEach(function(status) {
          console.log(util.inspect({
            status: {
              id_str: status.id_str,
              text: status.text,
              user: {
                screen_name: status.user.screen_name            
              }
            }
          }, false, null, true))

          /* Now we can retweet each tweet. */
          T.post('statuses/retweet/:id', {
            id: status.id_str
          }, function(err, data, response) {
            if (err){
              /* TODO: Proper error handling? */
              // console.log(util.inspect(err, false, null, true))
              console.log(`error ${err.code}: ${err.message}`);
            }
            else{
            }
fs.writeFile(__dirname + '/last_tweet_id.txt', status.id_str, function (err) {
  /* TODO: Error handling? */
});

          });
        });
      } else {
        /* No new tweets since the last time we checked. */
        console.log('No new tweets...');      
      }
    });    
  });
  
  /* TODO: Handle proper responses based on whether the tweets succeed, using Promises. For now, let's just return a success message no matter what. */
  response.sendStatus(200);
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is running on port ' + listener.address().port);
});
