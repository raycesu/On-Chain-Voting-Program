// Poll account.
// PDA seeds: ["poll", poll_id].
// Fields: poll_id, creator, status, start_unix_timestamp, end_unix_timestamp,
// option_count, bump, event_sequence, reserved padding.
// Vote totals are not stored here. They live on PollOption so casting a vote
// does not write-lock the poll.
