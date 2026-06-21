/**
 * The tournament currently shown on the /live page.
 *
 * Set `id` to the EOS tournament id (the long token in a tournament's EOS URL)
 * when an event is running; set the whole export to null between events to show
 * the "no live event" state. Scores update automatically while live — this only
 * points at which tournament. Changing it requires a redeploy (static site).
 */
export interface LiveTournament {
  id: string
  name: string
}

// No event live right now. To go live, set this to { id, name } and push;
// set back to null when the event ends.
export const LIVE_TOURNAMENT: LiveTournament | null = null
