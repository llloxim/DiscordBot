const { VoiceConnectionStatus} = require('@discordjs/voice');
const { getVoiceConnection } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const {
	joinVoiceChannel,
} = require('@discordjs/voice');
const search = require("../music/search.js");
const play = require("../music/play.js");
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
			search(connection, value);
		} else {
			play(connection, value)
		}

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
		
		
	},
};
