import ytdl from "ytdl-core";
import { getVideo } from './youtube';

const queue = new Map();

export async function execute(message, id) {
	const args = message.content.split(" ");

	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel) {
		return message.channel.send("You need to be in a voice channel to play music!");
	}
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
		return message.channel.send(
			"I need the permissions to join and speak in your voice channel!"
		);
	}

	const search = checkArgs(args);

	if (!search.isUrl) {
		search.video = await getVideo(search)
	}
	const songInfo = await ytdl.getInfo(search.video);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url
	}

	const serverQueue = queue.get(id);

	if (!serverQueue) {
		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		}

		queue.set(message.guild.id, queueConstruct);
		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			connection.on("disconnect", () => {
				queue.delete(message.guild.id);
			})

			play(id, queueConstruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}

	} else {
		serverQueue.songs.push(song);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}
}

function play(id, song) {
	const serverQueue = queue.get(id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(id);
		return;
	}

	const dispatcher = serverQueue.connection
		.play(ytdl(song.url))
		.on("finish", () => {
			serverQueue.songs.shift();
			play(id, serverQueue.songs[0]);
		})
		.on("error", err => console.error(err));
	
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

export function skip(message, id) {
	if (!message.member.voice.channel) {
		return message.channel.send("You hame to be in a voice channel to stop the music!")
	}
	const serverQueue = queue.get(id);
	if (!serverQueue) {
		return message.channel.send("There is no song that I could skip");
	}
	if (serverQueue.connection && serverQueue.connection.dispatcher) {
		serverQueue.connection.dispatcher.end();
	}
}

export function stop (message, id) {
	if (!message.member.voice.channel) {
		return message.channel.send("You have to be in voice channel to stop the music!");
	}
	const serverQueue = queue.get(id);
	if (serverQueue) {
		serverQueue.songs = [];
		if (serverQueue.connection && serverQueue.connection.dispatcher) {
			serverQueue.connection.dispatcher.end();
		}
	}
}

function checkArgs(args) {
	args.shift();
	if (args.length === 1 && args[0].includes("https://www.youtube")) {
		return {isUrl: true, video: args[0]}
	} else {
		return {isUrl: false, q: args.join(" ")}
	}
}