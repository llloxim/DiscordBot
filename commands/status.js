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
const search = require("./search.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('join call')
		.addStringOption(option => option.setName('input').setDescription('song name').setRequired(true)),
	async execute(interaction) {
		const value = interaction.options.getString('input');
		var myVoiceChannel = interaction.member.voice.channel;
		var connection = getVoiceConnection(myVoiceChannel.guild.id);
		if (!connection){
			connection = joinVoiceChannel({
				channelId: myVoiceChannel.id,
				guildId: myVoiceChannel.guild.id,
				adapterCreator: myVoiceChannel.guild.voiceAdapterCreator,
				});
		}
		console.log(!value.includes("https://"))
		if (!value.includes("https://")){
			value = search(value);
		}
		const stream = ytdl(value, { filter: 'audioonly' });
      	const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
      	resource.volume.setVolume(0.5);
		const player = createAudioPlayer();
		connection.subscribe(player);
		player.play(resource);

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
