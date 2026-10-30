// PollStatus state machine.
// Draft -> Open -> Closed -> Finalized.
// Draft -> Cancelled.
// Open -> Cancelled only when no votes have been cast.
// Open or Closed -> Finalized after the window ends.
// Transition methods live on the enum.
