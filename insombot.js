var env = require('./env.json'),
  Discord = require("discord.js"),
  Giphy = require('giphy-wrapper')(env["giphy_key"]);


var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var mybot = new Discord.Client();

mybot.on("message", function (msg) {

  var message = msg.content;

  //keywords
  var hello = "hello";
  var giphy = "gif:";

  //Hello
  if (message === hello) {
    mybot.reply(msg, "hi QT");

    return;
  }

  //Giphy
  if (message.indexOf(giphy) > -1) {
    var term = message.substring(message.indexOf(":") + 1).trim().replace(/\s/g, "+");

    Giphy.search(term, 10, 0, function (err, data) {
      if (err) {
        return;
      }

      var items = data.data;

      var item = items[Math.floor(Math.random() * items.length)];

      mybot.reply(msg, item.url);
    });

    return;
  }
});

mybot.login(env["discord_email"], env["discord_pass"]);
