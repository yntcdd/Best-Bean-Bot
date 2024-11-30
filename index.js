const Discord = require("discord.js");
require("dotenv").config();

const generateImage = require("./generateImage");

const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});

let bot = {
  client,
  prefix: "b.",
  owners: ["767862326862020689"],
};

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.slashcommands = new Discord.Collection();
client.buttons = new Discord.Collection();

client.loadEvents = (bot, reload) => require("./handlers/events")(bot, reload);
client.loadCommands = (bot, reload) =>
  require("./handlers/commands")(bot, reload);
client.loadSlashCommands = (bot, reload) =>
  require("./handlers/slashcommands")(bot, reload);
client.loadButtons = (bot, reload) =>
  require("./handlers/buttons")(bot, reload);

client.loadEvents(bot, false);
client.loadCommands(bot, false);
client.loadSlashCommands(bot, false);
client.loadButtons(bot, false);

module.exports = bot;

const welcomeChannelId = "956635923490144406";

client.on("guildMemberAdd", async (member) => {
  const img = await generateImage(member);
  member.guild.channels.cache.get(welcomeChannelId).send({
    content: `<@${member.id}> Welcome to the server!`,
    files: [img],
  });
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isCommand()) return;
  if (!interaction.inGuild())
    return interaction.reply("This command can only be used in a server");

  const slashcmd = client.slashcommands.get(interaction.commandName);

  if (!slashcmd) return interaction.reply("Invalid slash command");

  if (slashcmd.perm && !interaction.member.permissions.has(slashcmd.perm))
    return interaction.reply("You do not have permission for this command");

  slashcmd.run(client, interaction);
});

client.login(process.env.TOKEN);
