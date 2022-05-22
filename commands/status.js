const { VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const ytdl = require('ytdl-core');
const {
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} = require('@discordjs/voice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('join call')
		.addStringOption(option => option.setName('input').setDescription('song name')),
	async execute(interaction) {
		var myVoiceChannel = interaction.member.voice.channel;
		var connection = getVoiceConnection(myVoiceChannel.guild.id);
		if (!connection){
			connection = joinVoiceChannel({
				channelId: myVoiceChannel.id,
				guildId: myVoiceChannel.guild.id,
				adapterCreator: myVoiceChannel.guild.voiceAdapterCreator,
				});
		}
		const stream = ytdl('https://www.youtube.com/watch?v=6NYeMlyBP4M', { filter: 'audioonly' });
      	const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
      	resource.volume.setVolume(0.5);
		const player = createAudioPlayer();

		connection.subscribe(player);
		player.play(resource);
/* 		const player = CreateAudioPlayer(myVoiceChannel.guild.id);
		const resource = createAudioResource('/home/user/voice/music.mp3', {
			metadata: {
				title: 'A good song!',
			},
		});
		player.play(resource);
		connection.subscribe(player); */

		connection.on(VoiceConnectionStatus.Ready, (oldState, newState) => {
			console.log('Connection is in the Ready state!');
			interaction.reply({ content: `Successfully joined`, ephemeral: true });
		});
		
		connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
			try {
				await Promise.race([
					entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
					entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
				]);
				// Seems to be reconnecting to a new channel - ignore disconnect
			} catch (error) {
				// Seems to be a real disconnect which SHOULDN'T be recovered from
				connection.destroy();
			}
		});
		
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
		
	},
};
