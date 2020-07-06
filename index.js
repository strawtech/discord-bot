import discord from "discord.js";
import { prefix, token } from "./config.json";
import commands from "./src/commands.js"

const client = new discord.Client();
client.login(token);

client.once('ready', () => {
	console.log('Ready!');
});

client.once('reconnecting', () => {
	console.log('Reconnecting!');
});

client.once('disconnect', () => {
	console.log('Disconnect!');
});


client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

	const found = commands.find((command) => {
		return message.content.startsWith(`${prefix}${command.name}`)
	})

	found ? found.callback(message, message.guild.id) : message.channel.send("You need to enter a valid command!")

});

