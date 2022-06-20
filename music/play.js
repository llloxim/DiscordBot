const ytdl = require('ytdl-core');
const {
	StreamType,
	createAudioPlayer,
	createAudioResource,
} = require('@discordjs/voice');
const {AudioPlayerStatus } = require('@discordjs/voice');
module.exports = async function (connection, value){
	const stream = ytdl(value, { filter: 'audioonly' });
    const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
    resource.volume.setVolume(0.5);
	const player = createAudioPlayer();
	connection.subscribe(player);
	player.play(resource);

	player.on(AudioPlayerStatus.Playing, () => {
		console.log('The audio player has started playing!');
	});
	player.on('error', error => {
		console.error(`Error: ${error.message} with resource ${error.resource.metadata.title}`);
		player.play(getNextResource());
	});
	player.on(AudioPlayerStatus.Idle, () => {
		player.play(getNextResource());
	});
}