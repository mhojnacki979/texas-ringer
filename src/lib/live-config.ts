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

export const LIVE_TOURNAMENT: LiveTournament | null = {
  id: 'cXJTNytXU0JtaXE1VkhGeE9RTWlHdz09',
  name: 'Texas Archery League Night',
}
