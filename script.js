const switchTab = false;

const showView = (tab) => {
    document.querySelectorAll(".viewNavContent .tab-pane.active").forEach(tabPane => tabPane.classList.remove("show", "active"));
    document.querySelectorAll(`.viewNavContent .${tab}`).forEach(tabPane => tabPane.classList.add("show", "active"));
}

const updatePlaylistView = (player, playlistName, playlistData) => {
    if (playlistData) {
        const tier = playlistData.stats.tier.value % 3 ? playlistData.stats.tier.value % 3 : 3;
        document.querySelector(`#${player}-tab-pane .${playlistName}RatingIcon`).src = playlistData.stats.rating.metadata.iconUrl;
        document.querySelector(`#${player}-tab-pane .${playlistName}TierDiv`).innerText = tier + "-" + (playlistData.stats.division.value + 1);
        document.querySelector(`#${player}-tab-pane .${playlistName}MMR`).innerText = playlistData.stats.rating.value;
    } else {
        document.querySelector(`#${player}-tab-pane .${playlistName}MMR`).innerHTML = "&mdash;";
    }
}

const updatePlayerStats = (player, playerData) => {
    const playlists = playerData.data.segments.filter((seg) => seg.type == "playlist");
    const peakRatings = playerData.data.segments.filter((seg) => seg.type == "peak-rating");
    const overview = playerData.data.segments.filter((seg) => seg.type == "overview")[0];

    // Load current playlist ratings
    document.querySelector(`#${player}-tab-pane .lastUpdated`).innerText = new Date(playerData.data.metadata.lastUpdated.value).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
    updatePlaylistView(player, "ThreesCurr", playlists.filter((seg) => seg.metadata.name == "Ranked Standard 3v3")[0]);
    updatePlaylistView(player, "TwosCurr", playlists.filter((seg) => seg.metadata.name == "Ranked Doubles 2v2")[0]);
    updatePlaylistView(player, "OnesCurr", playlists.filter((seg) => seg.metadata.name == "Ranked Duel 1v1")[0]);
    updatePlaylistView(player, "RumbleCurr", playlists.filter((seg) => seg.metadata.name == "Rumble")[0]);
    updatePlaylistView(player, "HoopsCurr", playlists.filter((seg) => seg.metadata.name == "Hoops")[0]);
    updatePlaylistView(player, "DropshotCurr", playlists.filter((seg) => seg.metadata.name == "Dropshot")[0]);
    updatePlaylistView(player, "SnowdayCurr", playlists.filter((seg) => seg.metadata.name == "Snowday")[0]);
    document.querySelector(`#${player}-tab-pane .CasualCurrMMR`).innerText = playlists.filter((seg) => seg.metadata.name == "Casual")[0].stats.rating.value;

    // Load lifetime stats
    document.querySelector(`#${player}-tab-pane .SRL`).src = overview.stats.seasonRewardLevel.metadata.iconUrl;
    document.querySelector(`#${player}-tab-pane .Wins`).innerText = overview.stats.wins.value;
    document.querySelector(`#${player}-tab-pane .MVPs`).innerText = overview.stats.mVPs.value;
    document.querySelector(`#${player}-tab-pane .Goals`).innerText = overview.stats.goals.value;
    document.querySelector(`#${player}-tab-pane .Shots`).innerText = overview.stats.shots.value;
    document.querySelector(`#${player}-tab-pane .GSR`).innerText = overview.stats.goalShotRatio.displayValue + "%";
    document.querySelector(`#${player}-tab-pane .Assists`).innerText = overview.stats.assists.value;
    document.querySelector(`#${player}-tab-pane .Saves`).innerText = overview.stats.saves.value;
}

const updatePlayerHistory = (player, historyData) => {

}

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const profileNavItemTemplate = document.getElementById("profileNavItemTemplate");
    const profileTabPaneTemplate = document.getElementById("profileTabPaneTemplate");
    const profileNav = document.getElementById("profileNav");
    const profileTabContent = document.getElementById("profileTabContent");

    // Load player data
    for (const [player, playerData] of urlParams) {
        dataObj = JSON.parse(playerData);
        const newNavItem = document.importNode(profileNavItemTemplate.content, true);
        const navButton = newNavItem.getElementById("template-tab");
        navButton.id = `${player}-tab`;
        navButton.dataset.bsTarget = `#${player}-tab-pane`;
        navButton.innerText = dataObj.data.platformInfo.platformUserHandle;
        profileNav.appendChild(newNavItem);

        const newTabPane = document.importNode(profileTabPaneTemplate.content, true);
        newTabPane.getElementById("template-tab-pane").id = `${player}-tab-pane`;
        profileTabContent.appendChild(newTabPane);

        updatePlayerStats(player, dataObj);
    }

    if (switchTab) {
        profileNav.append(...Array.from(profileNav.childNodes).reverse());
    }

    document.querySelector("#profileNav .nav-item:first-of-type .nav-link")?.click();

    document.getElementById("searchModal").addEventListener('shown.bs.modal', () => setTimeout(() => document.getElementById("search").focus(), 100));

    document.getElementById("searchForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const searchInput = document.getElementById("searchInput");
        const searchValue = searchInput.value;
        bootstrap.Modal.getInstance(document.getElementById("searchModal")).hide();
        searchInput.value = "";
        // console.log(`shortcuts://run-shortcut?name=RL%20Tracker&input=text&text=${encodeURIComponent(searchValue)}`);
        window.open(`shortcuts://run-shortcut?name=RL%20Tracker&input=text&text=${encodeURIComponent(searchValue)}`);
    });
}
