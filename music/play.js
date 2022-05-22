const subscription = connection.subscribe(audioPlayer);

// subscription could be undefined if the connection is destroyed!
if (subscription) {
	// Unsubscribe after 5 seconds (stop playing audio on the voice connection)
	setTimeout(() => subscription.unsubscribe(), 5_000);
}