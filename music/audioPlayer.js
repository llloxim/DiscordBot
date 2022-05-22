const { createAudioPlayer, NoSubscriberBehavior } = require('@discordjs/voice');

module.exports = async function (guildId){
    return player = createAudioPlayer({
	    behaviors: {
		    noSubscriber: NoSubscriberBehavior.Pause,
	    },
    });
}