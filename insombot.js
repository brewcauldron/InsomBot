var cc = require('config-multipaas'),
  env = require('./env.json'),
  Discord = require("discord.js"),
  Giphy = require('giphy-wrapper')(env["giphy_key"]);


var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var config_overrides = {
  PORT: server_port
}
var config = cc(config_overrides);

var mybot = new Discord.Client();

mybot.on("message", function (msg) {

  var message = msg.content;

  //keywords
  var giphy = "/giphy ";
  var hatter = "hater";

  // Reply to direct mentions
  if (msg.isMentioned(mybot.user)) {
    mybot.reply(msg, "right back atcha");
    return;
  }

  //Giphy
  var giphyIndex = message.indexOf(giphy);
  if (giphyIndex > -1) {
    var term = message.substring(giphyIndex + giphy.length).trim().replace(/\s/g, "+");

    Giphy.search(term, 10, 0, function (err, data) {
      if (err) {
        return;
      }

      var items = data.data;

      if (items.length > 0) {
        var item = items[Math.floor(Math.random() * items.length)];
        mybot.sendMessage(msg, item.url);
      }
      else {
        var apology = "Sorry, I couldn't find any giphys for the term: " + term;
        mybot.reply(msg, apology);
      }
    });

    return;
  }

  //Hatter
  if (message === hatter) {
    mybot.sendMessage(msg, "https://pbs.twimg.com/media/CM5gg9YVAAAVMcn.png");
    return;
  }

});

mybot.login(env["discord_email"], env["discord_pass"]);
