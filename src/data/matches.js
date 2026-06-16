export const FLAG = {
  Mexico:'🇲🇽',Jamaica:'🇯🇲',Venezuela:'🇻🇪',Ecuador:'🇪🇨',
  USA:'🇺🇸',Panama:'🇵🇦','Costa Rica':'🇨🇷',Canada:'🇨🇦',
  Brazil:'🇧🇷',Paraguay:'🇵🇾',Colombia:'🇨🇴',Bolivia:'🇧🇴',
  Argentina:'🇦🇷',Chile:'🇨🇱',Uruguay:'🇺🇾',Peru:'🇵🇪',
  France:'🇫🇷',Belgium:'🇧🇪',Switzerland:'🇨🇭',Cameroon:'🇨🇲',
  Spain:'🇪🇸',Portugal:'🇵🇹',Morocco:'🇲🇦','New Zealand':'🇳🇿',
  England:'🏴',Germany:'🇩🇪',Croatia:'🇭🇷',Senegal:'🇸🇳',
  Netherlands:'🇳🇱',Poland:'🇵🇱',Japan:'🇯🇵','DR Congo':'🇨🇩',
  Italy:'🇮🇹',Turkey:'🇹🇷',Ghana:'🇬🇭',Indonesia:'🇮🇩',
  'South Korea':'🇰🇷','Saudi Arabia':'🇸🇦',Iran:'🇮🇷',Uzbekistan:'🇺🇿',
  Australia:'🇦🇺',Egypt:'🇪🇬',Nigeria:'🇳🇬',Guatemala:'🇬🇹',
  Serbia:'🇷🇸',Denmark:'🇩🇰','Czech Republic':'🇨🇿',Tunisia:'🇹🇳',
  TBD:'🏳️',
}

// Groups: each array has [team1, team2, team3, team4]
// Matchday schedule: (0v1,2v3), (0v2,1v3), (0v3,1v2)
const GROUPS = {
  A: { teams:['Mexico','Jamaica','Venezuela','Ecuador'],   dates:['2026-06-11','2026-06-15','2026-06-19'], tz:'-06:00' },
  B: { teams:['USA','Panama','Costa Rica','Canada'],       dates:['2026-06-12','2026-06-16','2026-06-20'], tz:'-05:00' },
  C: { teams:['Brazil','Bolivia','Colombia','Paraguay'],   dates:['2026-06-12','2026-06-16','2026-06-20'], tz:'-04:00' },
  D: { teams:['Argentina','Peru','Chile','Uruguay'],       dates:['2026-06-13','2026-06-17','2026-06-21'], tz:'-03:00' },
  E: { teams:['France','Belgium','Switzerland','Cameroon'],dates:['2026-06-13','2026-06-17','2026-06-21'], tz:'+02:00' },
  F: { teams:['Spain','Morocco','Portugal','New Zealand'], dates:['2026-06-14','2026-06-18','2026-06-22'], tz:'+02:00' },
  G: { teams:['England','Senegal','Germany','Croatia'],    dates:['2026-06-14','2026-06-18','2026-06-22'], tz:'+01:00' },
  H: { teams:['Netherlands','Japan','Poland','DR Congo'],  dates:['2026-06-15','2026-06-19','2026-06-23'], tz:'+09:00' },
  I: { teams:['Italy','Turkey','Ghana','Indonesia'],       dates:['2026-06-15','2026-06-19','2026-06-23'], tz:'+02:00' },
  J: { teams:['South Korea','Uzbekistan','Saudi Arabia','Iran'], dates:['2026-06-16','2026-06-20','2026-06-24'], tz:'+09:00' },
  K: { teams:['Australia','Guatemala','Nigeria','Egypt'],  dates:['2026-06-16','2026-06-20','2026-06-24'], tz:'+10:00' },
  L: { teams:['Serbia','Tunisia','Denmark','Czech Republic'], dates:['2026-06-17','2026-06-21','2026-06-25'], tz:'+02:00' },
}

// Matchday pairings: indices into teams array
const PAIRINGS = [
  [[0,1],[2,3]],  // Matchday 1
  [[0,2],[1,3]],  // Matchday 2
  [[0,3],[1,2]],  // Matchday 3
]

const TIMES = ['T15:00:00','T18:00:00']

function buildGroupMatches() {
  const out = []
  for (const [letter, g] of Object.entries(GROUPS)) {
    PAIRINGS.forEach((day, dayIdx) => {
      const date = g.dates[dayIdx]
      const mdLabel = `Group ${letter} - Matchday ${dayIdx + 1}`
      day.forEach(([hi, ai], pairIdx) => {
        out.push({
          homeTeam: g.teams[hi],
          awayTeam: g.teams[ai],
          kickoff: `${date}${TIMES[pairIdx]}${g.tz}`,
          round: mdLabel,
          group: letter,
        })
      })
    })
  }
  return out
}

// Knockout stage – TBD teams (filled by admin when group stage ends)
function tbd(n) { return `TBD${n}` }

function buildKnockoutMatches() {
  const ko = []

  // Round of 32 – 16 matches – July 4-8
  const r32Dates = [
    '2026-07-04T16:00:00Z','2026-07-04T20:00:00Z',
    '2026-07-05T16:00:00Z','2026-07-05T20:00:00Z',
    '2026-07-06T16:00:00Z','2026-07-06T20:00:00Z',
    '2026-07-07T16:00:00Z','2026-07-07T20:00:00Z',
    '2026-07-08T16:00:00Z','2026-07-08T20:00:00Z',
    '2026-07-09T16:00:00Z','2026-07-09T20:00:00Z',
    '2026-07-10T16:00:00Z','2026-07-10T20:00:00Z',
    '2026-07-11T16:00:00Z','2026-07-11T20:00:00Z',
  ]
  for (let i = 0; i < 16; i++) {
    ko.push({ homeTeam:'TBD', awayTeam:'TBD', kickoff: r32Dates[i], round:'Round of 32', group: null })
  }

  // Round of 16 – 8 matches – July 13-16
  const r16Dates = [
    '2026-07-13T16:00:00Z','2026-07-13T20:00:00Z',
    '2026-07-14T16:00:00Z','2026-07-14T20:00:00Z',
    '2026-07-15T16:00:00Z','2026-07-15T20:00:00Z',
    '2026-07-16T16:00:00Z','2026-07-16T20:00:00Z',
  ]
  for (let i = 0; i < 8; i++) {
    ko.push({ homeTeam:'TBD', awayTeam:'TBD', kickoff: r16Dates[i], round:'Round of 16', group: null })
  }

  // Quarter-finals – 4 matches – July 18-19
  const qfDates = [
    '2026-07-18T16:00:00Z','2026-07-18T20:00:00Z',
    '2026-07-19T16:00:00Z','2026-07-19T20:00:00Z',
  ]
  for (let i = 0; i < 4; i++) {
    ko.push({ homeTeam:'TBD', awayTeam:'TBD', kickoff: qfDates[i], round:'Quarter-finals', group: null })
  }

  // Semi-finals – 2 matches – July 22-23
  ko.push({ homeTeam:'TBD', awayTeam:'TBD', kickoff:'2026-07-22T20:00:00Z', round:'Semi-finals', group: null })
  ko.push({ homeTeam:'TBD', awayTeam:'TBD', kickoff:'2026-07-23T20:00:00Z', round:'Semi-finals', group: null })

  // Third place – July 25
  ko.push({ homeTeam:'TBD', awayTeam:'TBD', kickoff:'2026-07-25T20:00:00Z', round:'Third Place', group: null })

  // Final – July 27
  ko.push({ homeTeam:'TBD', awayTeam:'TBD', kickoff:'2026-07-27T20:00:00Z', round:'Final', group: null })

  return ko
}

export const matches = [...buildGroupMatches(), ...buildKnockoutMatches()]
