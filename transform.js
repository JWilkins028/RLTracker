// const apiResponse = `{}`;

const jsonData = JSON.parse(apiResponse).data;

const playlistNameMap = {
    "Ranked Duel 1v1": "Ranked 1v1",
    "Ranked Doubles 2v2": "Ranked 2v2",
    "Ranked Standard 3v3": "Ranked 3v3",
    "Ranked 4v4 Quads": "Ranked 4v4",
    "Tournament Matches": "Tournaments"
};

const playlistOrder = {
    "Ranked 3v3":  0,
    "Ranked 2v2":  1,
    "Ranked 1v1":  2,
    "Rumble":      3,
    "Hoops":       4,
    "Dropshot":    5,
    "Snowday":     6,
    "Heatseeker":  7,
    "Ranked 4v4":  8,
    "Tournaments": 9,
    "Casual":      10
};

let playerData = {
    error: ""
};

try {
    playerData.username = jsonData.platformInfo.platformUserHandle;
    playerData.lastUpdated = new Date(jsonData.metadata.lastUpdated.value).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });

    const playlists = jsonData.segments.filter((seg) => seg.type == "playlist");
    const peakRatings = jsonData.segments.filter((seg) => seg.type == "peak-rating");
    const overview = jsonData.segments.filter((seg) => seg.type == "overview")[0];

    playerData.playlists = playlists.map((playlist) => {
        const peakRankImg = peakRatings.find((peak) => peak.metadata.name === playlist.metadata.name)?.stats?.peakRating?.metadata?.iconUrl?.match(/[^\/]+$/)?.at(0) || null;
        return {
            name: playlistNameMap[playlist.metadata.name] || playlist.metadata.name,
            lastPlayedSeason: playlist.attributes.season,
            currentMMR: playlist.stats.rating.value,
            currentRank: playlist.stats.tier.value % 3 ? playlist.stats.tier.value % 3 : 3,
            currentDiv: playlist.stats.division.value + 1,
            currentRankImg: playlist.stats.tier.metadata.iconUrl.match(/[^\/]+$/)[0],
            peakMMR: playlist.stats.peakRating.value,
			peakRank: playlist.stats.peakTier.value % 3 ? playlist.stats.peakTier.value % 3 : 3,
			peakDiv: playlist.stats.peakDivision.value + 1,
			peakRankImg
        };
    })
    .sort((a, b) => (playlistOrder[a.name] ?? Infinity) - (playlistOrder[b.name] ?? Infinity));

    playerData.lifetime = {
        SRLUrl: overview.stats.seasonRewardLevel.metadata.iconUrl.match(/[^\/]+$/)[0],
        wins: overview.stats.wins.value,
        mvps: overview.stats.mVPs.value,
        goals: overview.stats.goals.value,
        shots: overview.stats.shots.value,
        goalShotRatio: overview.stats.goalShotRatio.displayValue + "%",
        assists: overview.stats.assists.value,
        saves: overview.stats.saves.value
    }
} catch (err) {
    playerData.error = err.message;
    console.error(err);
}

document.write((JSON.stringify(playerData)));
console.log(playerData);
