// creator_add_poll_option
// Appends one PollOption PDA while the poll is Draft.
// Signer: creator.
// Reads: poll.
// Writes: poll.option_count, poll_option.
// Seeds: ["poll-option", poll_id, option_index].
