const ytdl = require('ytdl-core');
const {
	StreamType,
	createAudioPlayer,
	createAudioResource,
} = require('@discordjs/voice');
const {AudioPlayerStatus } = require('@discordjs/voice');
module.exports = async function (connection, url, queue, guild, interaction){
	ServerQueue = queue.get(guild)
	if (!ServerQueue) {
        const queueContruct = {
          song: [],
          volume: 0.5,
          playing: true
        };
        queue.set(guild, queueContruct);
		ServerQueue = queue.get(guild)
		ServerQueue.song.push(url)
		const stream = ytdl(url, { filter: 'audioonly' });
    	const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
    	resource.volume.setVolume(0.5);//add a way to change volume
		const player = createAudioPlayer();
		connection.subscribe(player);
		player.play(resource);
		interaction.channel.send(`Playing ${ServerQueue.song[0].title}`);

		player.on(AudioPlayerStatus.Playing, () => {
			console.log('The audio player has started playing!');
		});
		player.on('error', error => {
			console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
			ServerQueue.song.shift()
			if (!ServerQueue.song) {
				queue.delete(guild.id);
				return;
			}
			const stream = ytdl(ServerQueue.song[0].url, { filter: 'audioonly' });
			const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
			resource.volume.setVolume(ServerQueue.volume);//add a way to change volume
			const player = createAudioPlayer();
			connection.subscribe(player);
			player.play(resource);
			interaction.channel.send(`Playing ${ServerQueue.song[0].title}`);
			
		});
		player.on(AudioPlayerStatus.Idle, () => {
			ServerQueue.song.shift()
			if (!ServerQueue.song) {
				queue.delete(guild.id);
				return;
			}
			const stream = ytdl(ServerQueue.song[0].url, { filter: 'audioonly' });
			const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
			resource.volume.setVolume(ServerQueue.volume);//add a way to change volume
			const player = createAudioPlayer();
			connection.subscribe(player);
			player.play(resource);
			interaction.channel.send(`Playing ${ServerQueue.song[0].title}`);
		});
      }
      else {
		const songInfo = await ytdl.getInfo(url);
		const song = {
			title: songInfo.videoDetails.title,
			url: songInfo.videoDetails.video_url,
		};
        ServerQueue.song.push(song);
        return interaction.reply({ content: `playing ${song.title}`, ephemeral: false });
    }
}