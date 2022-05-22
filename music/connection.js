const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = async function (channel){
	const connection = joinVoiceChannel({
	channelId: channel.id,
	guildId: channel.guild.id,
	adapterCreator: channel.guild.voiceAdapterCreator,
	});

	return connection
}