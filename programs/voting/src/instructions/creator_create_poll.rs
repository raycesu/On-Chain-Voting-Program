// creator_create_poll
// Creates a Poll PDA in Draft.
// Signer: creator (rent payer).
// Reads: global_config (must be Active).
// Writes: poll, global_config.poll_count.
// Seeds: ["poll", poll_id].
