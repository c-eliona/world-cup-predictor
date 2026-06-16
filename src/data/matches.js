// Official FIFA World Cup 2026 schedule
// Matchday 2 through Final (80 matches — no Matchday 1)
// Times are UTC
//
// To update knockout teams: replace 'TBD' with real team names below,
// then go to /admin and click "Sync Teams from Code"

export const FLAG = {
  // Group A
  Mexico: '🇲🇽', 'South Korea': '🇰🇷', 'Czech Republic': '🇨🇿', 'South Africa': '🇿🇦',
  // Group B
  Switzerland: '🇨🇭', Canada: '🇨🇦', Qatar: '🇶🇦', 'Bosnia and Herzegovina': '🇧🇦',
  // Group C
  Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', Morocco: '🇲🇦', Brazil: '🇧🇷', Haiti: '🇭🇹',
  // Group D
  USA: '🇺🇸', Australia: '🇦🇺', Turkey: '🇹🇷', Paraguay: '🇵🇾',
  // Group E
  Germany: '🇩🇪', 'Ivory Coast': '🇨🇮', Ecuador: '🇪🇨', Curacao: '🇨🇼',
  // Group F
  Netherlands: '🇳🇱', Sweden: '🇸🇪', Tunisia: '🇹🇳', Japan: '🇯🇵',
  // Group G
  Belgium: '🇧🇪', 'New Zealand': '🇳🇿', Egypt: '🇪🇬', Iran: '🇮🇷',
  // Group H
  Uruguay: '🇺🇾', Spain: '🇪🇸', 'Cape Verde': '🇨🇻', 'Saudi Arabia': '🇸🇦',
  // Group I
  France: '🇫🇷', Senegal: '🇸🇳', Iraq: '🇮🇶', Norway: '🇳🇴',
  // Group J
  Argentina: '🇦🇷', Algeria: '🇩🇿', Austria: '🇦🇹', Jordan: '🇯🇴',
  // Group K
  Portugal: '🇵🇹', 'Congo DR': '🇨🇩', Uzbekistan: '🇺🇿', Colombia: '🇨🇴',
  // Group L
  Ghana: '🇬🇭', Panama: '🇵🇦', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', Croatia: '🇭🇷',
  TBD: '🏳️',
}

export const matches = [
  // ── GROUP STAGE – Matchday 2 ───────────────────────────────────────────────
  { homeTeam: 'Czech Republic',          awayTeam: 'South Africa',          kickoff: '2026-06-18T16:00:00Z', round: 'Group A - Matchday 2', group: 'A' },
  { homeTeam: 'Switzerland',             awayTeam: 'Bosnia and Herzegovina', kickoff: '2026-06-18T19:00:00Z', round: 'Group B - Matchday 2', group: 'B' },
  { homeTeam: 'Canada',                  awayTeam: 'Qatar',                  kickoff: '2026-06-18T22:00:00Z', round: 'Group B - Matchday 2', group: 'B' },
  { homeTeam: 'Mexico',                  awayTeam: 'South Korea',            kickoff: '2026-06-19T01:00:00Z', round: 'Group A - Matchday 2', group: 'A' },
  { homeTeam: 'Brazil',                  awayTeam: 'Haiti',                  kickoff: '2026-06-20T01:00:00Z', round: 'Group C - Matchday 2', group: 'C' },
  { homeTeam: 'Scotland',                awayTeam: 'Morocco',                kickoff: '2026-06-19T22:00:00Z', round: 'Group C - Matchday 2', group: 'C' },
  { homeTeam: 'Turkey',                  awayTeam: 'Paraguay',               kickoff: '2026-06-20T03:00:00Z', round: 'Group D - Matchday 2', group: 'D' },
  { homeTeam: 'USA',                     awayTeam: 'Australia',              kickoff: '2026-06-19T19:00:00Z', round: 'Group D - Matchday 2', group: 'D' },
  { homeTeam: 'Germany',                 awayTeam: 'Ivory Coast',            kickoff: '2026-06-20T20:00:00Z', round: 'Group E - Matchday 2', group: 'E' },
  { homeTeam: 'Ecuador',                 awayTeam: 'Curacao',                kickoff: '2026-06-21T00:00:00Z', round: 'Group E - Matchday 2', group: 'E' },
  { homeTeam: 'Netherlands',             awayTeam: 'Sweden',                 kickoff: '2026-06-20T17:00:00Z', round: 'Group F - Matchday 2', group: 'F' },
  { homeTeam: 'Tunisia',                 awayTeam: 'Japan',                  kickoff: '2026-06-21T04:00:00Z', round: 'Group F - Matchday 2', group: 'F' },
  { homeTeam: 'Uruguay',                 awayTeam: 'Cape Verde',             kickoff: '2026-06-21T22:00:00Z', round: 'Group H - Matchday 2', group: 'H' },
  { homeTeam: 'Spain',                   awayTeam: 'Saudi Arabia',           kickoff: '2026-06-21T16:00:00Z', round: 'Group H - Matchday 2', group: 'H' },
  { homeTeam: 'Belgium',                 awayTeam: 'Iran',                   kickoff: '2026-06-21T19:00:00Z', round: 'Group G - Matchday 2', group: 'G' },
  { homeTeam: 'New Zealand',             awayTeam: 'Egypt',                  kickoff: '2026-06-22T01:00:00Z', round: 'Group G - Matchday 2', group: 'G' },
  { homeTeam: 'Norway',                  awayTeam: 'Senegal',                kickoff: '2026-06-23T00:00:00Z', round: 'Group I - Matchday 2', group: 'I' },
  { homeTeam: 'France',                  awayTeam: 'Iraq',                   kickoff: '2026-06-22T21:00:00Z', round: 'Group I - Matchday 2', group: 'I' },
  { homeTeam: 'Argentina',               awayTeam: 'Austria',                kickoff: '2026-06-22T17:00:00Z', round: 'Group J - Matchday 2', group: 'J' },
  { homeTeam: 'Jordan',                  awayTeam: 'Algeria',                kickoff: '2026-06-23T03:00:00Z', round: 'Group J - Matchday 2', group: 'J' },
  { homeTeam: 'England',                 awayTeam: 'Ghana',                  kickoff: '2026-06-23T20:00:00Z', round: 'Group L - Matchday 2', group: 'L' },
  { homeTeam: 'Panama',                  awayTeam: 'Croatia',                kickoff: '2026-06-23T23:00:00Z', round: 'Group L - Matchday 2', group: 'L' },
  { homeTeam: 'Portugal',                awayTeam: 'Uzbekistan',             kickoff: '2026-06-23T17:00:00Z', round: 'Group K - Matchday 2', group: 'K' },
  { homeTeam: 'Colombia',                awayTeam: 'Congo DR',               kickoff: '2026-06-24T02:00:00Z', round: 'Group K - Matchday 2', group: 'K' },

  // ── GROUP STAGE – Matchday 3 ───────────────────────────────────────────────
  { homeTeam: 'Scotland',                awayTeam: 'Brazil',                 kickoff: '2026-06-24T22:00:00Z', round: 'Group C - Matchday 3', group: 'C' },
  { homeTeam: 'Morocco',                 awayTeam: 'Haiti',                  kickoff: '2026-06-24T22:00:00Z', round: 'Group C - Matchday 3', group: 'C' },
  { homeTeam: 'Switzerland',             awayTeam: 'Canada',                 kickoff: '2026-06-24T19:00:00Z', round: 'Group B - Matchday 3', group: 'B' },
  { homeTeam: 'Bosnia and Herzegovina',  awayTeam: 'Qatar',                  kickoff: '2026-06-24T19:00:00Z', round: 'Group B - Matchday 3', group: 'B' },
  { homeTeam: 'Czech Republic',          awayTeam: 'Mexico',                 kickoff: '2026-06-25T01:00:00Z', round: 'Group A - Matchday 3', group: 'A' },
  { homeTeam: 'South Africa',            awayTeam: 'South Korea',            kickoff: '2026-06-25T01:00:00Z', round: 'Group A - Matchday 3', group: 'A' },
  { homeTeam: 'Curacao',                 awayTeam: 'Ivory Coast',            kickoff: '2026-06-25T20:00:00Z', round: 'Group E - Matchday 3', group: 'E' },
  { homeTeam: 'Ecuador',                 awayTeam: 'Germany',                kickoff: '2026-06-25T20:00:00Z', round: 'Group E - Matchday 3', group: 'E' },
  { homeTeam: 'Japan',                   awayTeam: 'Sweden',                 kickoff: '2026-06-25T23:00:00Z', round: 'Group F - Matchday 3', group: 'F' },
  { homeTeam: 'Tunisia',                 awayTeam: 'Netherlands',            kickoff: '2026-06-25T23:00:00Z', round: 'Group F - Matchday 3', group: 'F' },
  { homeTeam: 'Turkey',                  awayTeam: 'USA',                    kickoff: '2026-06-26T02:00:00Z', round: 'Group D - Matchday 3', group: 'D' },
  { homeTeam: 'Paraguay',                awayTeam: 'Australia',              kickoff: '2026-06-26T02:00:00Z', round: 'Group D - Matchday 3', group: 'D' },
  { homeTeam: 'Norway',                  awayTeam: 'France',                 kickoff: '2026-06-26T19:00:00Z', round: 'Group I - Matchday 3', group: 'I' },
  { homeTeam: 'Senegal',                 awayTeam: 'Iraq',                   kickoff: '2026-06-26T19:00:00Z', round: 'Group I - Matchday 3', group: 'I' },
  { homeTeam: 'Egypt',                   awayTeam: 'Iran',                   kickoff: '2026-06-27T03:00:00Z', round: 'Group G - Matchday 3', group: 'G' },
  { homeTeam: 'New Zealand',             awayTeam: 'Belgium',                kickoff: '2026-06-27T03:00:00Z', round: 'Group G - Matchday 3', group: 'G' },
  { homeTeam: 'Cape Verde',              awayTeam: 'Saudi Arabia',           kickoff: '2026-06-27T00:00:00Z', round: 'Group H - Matchday 3', group: 'H' },
  { homeTeam: 'Uruguay',                 awayTeam: 'Spain',                  kickoff: '2026-06-27T00:00:00Z', round: 'Group H - Matchday 3', group: 'H' },
  { homeTeam: 'Panama',                  awayTeam: 'England',                kickoff: '2026-06-27T21:00:00Z', round: 'Group L - Matchday 3', group: 'L' },
  { homeTeam: 'Croatia',                 awayTeam: 'Ghana',                  kickoff: '2026-06-27T21:00:00Z', round: 'Group L - Matchday 3', group: 'L' },
  { homeTeam: 'Algeria',                 awayTeam: 'Austria',                kickoff: '2026-06-28T02:00:00Z', round: 'Group J - Matchday 3', group: 'J' },
  { homeTeam: 'Jordan',                  awayTeam: 'Argentina',              kickoff: '2026-06-28T02:00:00Z', round: 'Group J - Matchday 3', group: 'J' },
  { homeTeam: 'Colombia',                awayTeam: 'Portugal',               kickoff: '2026-06-27T23:30:00Z', round: 'Group K - Matchday 3', group: 'K' },
  { homeTeam: 'Congo DR',                awayTeam: 'Uzbekistan',             kickoff: '2026-06-27T23:30:00Z', round: 'Group K - Matchday 3', group: 'K' },

  // ── ROUND OF 32 ────────────────────────────────────────────────────────────
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-06-28T19:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-06-29T20:30:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-06-29T23:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-06-29T17:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-06-30T21:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-06-30T17:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-06-30T01:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-01T16:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-01T00:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-01T20:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-02T23:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-02T19:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-03T02:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-03T22:00:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-04T01:30:00Z', round: 'Round of 32', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-03T18:00:00Z', round: 'Round of 32', group: null },

  // ── ROUND OF 16 ────────────────────────────────────────────────────────────
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-04T21:00:00Z', round: 'Round of 16', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-04T17:00:00Z', round: 'Round of 16', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-05T20:00:00Z', round: 'Round of 16', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-06T00:00:00Z', round: 'Round of 16', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-06T19:00:00Z', round: 'Round of 16', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-07T00:00:00Z', round: 'Round of 16', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-07T16:00:00Z', round: 'Round of 16', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-07T20:00:00Z', round: 'Round of 16', group: null },

  // ── QUARTER-FINALS ─────────────────────────────────────────────────────────
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-09T20:00:00Z', round: 'Quarter-finals', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-10T19:00:00Z', round: 'Quarter-finals', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-11T21:00:00Z', round: 'Quarter-finals', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-12T01:00:00Z', round: 'Quarter-finals', group: null },

  // ── SEMI-FINALS ────────────────────────────────────────────────────────────
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-14T19:00:00Z', round: 'Semi-finals', group: null },
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-15T19:00:00Z', round: 'Semi-finals', group: null },

  // ── THIRD PLACE ────────────────────────────────────────────────────────────
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-18T21:00:00Z', round: 'Third Place', group: null },

  // ── FINAL ──────────────────────────────────────────────────────────────────
  { homeTeam: 'TBD', awayTeam: 'TBD', kickoff: '2026-07-19T19:00:00Z', round: 'Final', group: null },
]
