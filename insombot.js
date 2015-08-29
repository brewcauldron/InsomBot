var cc = require('config-multipaas'),
  env = require('./env.json'),
  Discord = require("discord.js"),
  Imgur = require("imgur-search"),
  Giphy = require('giphy-wrapper')(env["giphy_key"]),
  urban = require('urban');


var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var config_overrides = {
  PORT: server_port
}
var config = cc(config_overrides);

var mybot = new Discord.Client();
var isearch = new Imgur(env["imgur_key"]);

var termCount = new Map();
var seenURLs = new Map();

mybot.on("message", function (msg) {

  var message = msg.content;

  //keywords
  var giphy = "/giphy ";
  var imgurKey = "/img ";
  var hatter = "hater";
  var def = "/define ";
  var commands = "/commands";

  // Reply to direct mentions
  if (msg.isMentioned(mybot.user)) {
    mybot.reply(msg, "right back atcha");
    return;
  }

  // Giphy
  var giphyIndex = message.indexOf(giphy);
  if (giphyIndex > -1) {
    var term = message.substring(giphyIndex + giphy.length).trim().replace(/\s/g, "+");

    var count = termCount.get(term) || 0;
    // console.log("count for term " + term + " is: " + count);
    termCount.set(term,count+1);

    Giphy.search(term, 100, count, function (err, data) {
      if (err) {
        return;
      }

      var items = data.data;
      var index = Math.floor(Math.random() * items.length / 2.0);

      // console.log("found " + items.length + " items for " + term);
      while (index < items.length && seenURLs.get(items[index].url) !== undefined) {
        index++;
      }
      // console.log("using? result number " + index);

      if (items.length > index) {
        var item = items[index];
        seenURLs.set(item.url, 1);
        mybot.sendMessage(msg, item.url);
      } else {
        var apology = "sorry, I couldn't find any giphys for the term: " + term;
        mybot.reply(msg, apology);
      }
    });

    return;
  }

  var imgurIndex = message.indexOf(imgurKey);
  if (imgurIndex > -1) {
    var term = message.substring(imgurIndex + imgurKey.length).trim().replace(/\s/g, "+");
    // console.log("searching imgur for term: " + term);
    isearch.search(term).then(function(results) {
      // console.log("found results: " + JSON.stringify(results,null,2));
      if (results === undefined || results.length === 0) {
        mybot.reply(msg, "sorry, I couldn't find any imgurs for the term: " + term);
        return;
      }

      var image = results[Math.floor(Math.random() * results.length)];
      mybot.sendMessage(msg, "Here's a description of an image: " + image.title + " " + image.description + " " + image.link);
    });
    return;
  }

  var defIndex = message.indexOf(def);
  if (defIndex > -1) {
    var term = message.substring(defIndex + def.length).trim().replace(/\s/g, "+");
    urban(term).first(function(json) {
      if (json !== undefined) {
        // console.log("got json from UD: " + JSON.stringify(json,null,2));
        var definition = "" + json.word + ": " + json.definition + "\nupvotes: " + json.thumbs_up + "   downvotes: " + json.thumbs_down + "\n\nExample: " + json.example;
        mybot.reply(msg, definition);
      }
      else {
        var apology = "sorry, I couldn't find a definition for: " + term;
        mybot.reply(msg, apology);
      }
    });
  }

  //Hatter
  if (message === hatter) {
    mybot.sendMessage(msg, "https://pbs.twimg.com/media/CM5gg9YVAAAVMcn.png");
    return;
  }

  //Commands
  if (message === commands) {
    mybot.sendMessage(msg, "Available commands: /giphy | /img | /define");
    return;
  }

});

mybot.login(env["discord_email"], env["discord_pass"]);
