const [profileNavItemTemplate, profileTabPaneTemplate, playlistStatGroupTemplate, lifetimeStatGroupTemplate] = document.querySelectorAll("template");
const profileNav = document.getElementById("profileNav");
const profileTabContent = document.getElementById("profileTabContent");

const lifetimeDataMap = {
    "Season Reward Level": "SRLUrl",
    "Wins": "wins",
    "MVPs": "mvps",
    "Goals": "goals",
    "Shots": "shots",
    "Goal Shot Ratio": "goalShotRatio",
    "Assists": "assists",
    "Saves": "saves"
};

const showView = (tab) => {
    document.querySelectorAll(".viewNavContent .tab-pane.active").forEach(tabPane => tabPane.classList.remove("show", "active"));
    document.querySelectorAll(`.viewNavContent .${tab}`).forEach(tabPane => tabPane.classList.add("show", "active"));
}

const toggleTheme = () => {
    const newTheme = document.documentElement.dataset.bsTheme === "light" ? "dark" : "light";
    const themeIcon = document.querySelector("#themeToggle i");
    const themeText = document.querySelector("#themeToggle span");

    document.documentElement.dataset.bsTheme = newTheme;
    themeIcon.classList.toggle("fa-sun");
    themeIcon.classList.toggle("fa-moon");
    themeText.innerText = newTheme;
}

// On page load
window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);

    let switchTab = false;
    if (urlParams.has("s")) {
        switchTab = true;
        urlParams.delete("s");
    }

    // Load player data
    for (const [player, data] of urlParams) {
        playerData = JSON.parse(data);
        loadPlayerData(player, playerData);
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
        window.open(`shortcuts://run-shortcut?name=RL%20Tracker&input=text&text=${encodeURIComponent(searchValue)}`);
    });
}

const loadPlayerData = (player, playerData) => {
    profileNav.appendChild(createNavItem(player, playerData.username));
    profileTabContent.appendChild(createProfileTabPane(player, playerData.lastUpdated, playerData.playlists, playerData.lifetime));
}

const createNavItem = (player, username) => {
    const newNavItem = document.importNode(profileNavItemTemplate.content, true);

    const navButton = newNavItem.getElementById("template-tab");
    navButton.id = `${player}-tab`;
    navButton.dataset.bsTarget = `#${player}-tab-pane`;
    navButton.innerText = username;

    return newNavItem;
}

const createProfileTabPane = (player, lastUpdated, allPlaylistData, lifetimeData) => {
    const newTabPane = document.importNode(profileTabPaneTemplate.content, true);
    const playlistStats = newTabPane.getElementById("playlistStats");
    const lifetimeStats = newTabPane.getElementById("lifetimeStats");
    newTabPane.getElementById("template-tab-pane").id = `${player}-tab-pane`;
    newTabPane.querySelector('.lastUpdated').innerText = lastUpdated;

    // Loop through playlists
    for (const playlistData of allPlaylistData) {
        if (playlistData.name !== "Casual") {
            playlistStats.append(createPlaylistStatGroup(playlistData));
        } else {
            playlistStats.append(createLifetimeStatGroup(playlistData.name, playlistData.currentMMR));
        }
    }

    // Loop through lifetime stats
    for (const [statName, statKeyName] of Object.entries(lifetimeDataMap)) {
        lifetimeStats.append(createLifetimeStatGroup(statName, lifetimeData[statKeyName]));
    }

    return newTabPane;
}

const createPlaylistStatGroup = (playlistData) => {
    const newPlaylistStatGroup = document.importNode(playlistStatGroupTemplate.content, true);

    newPlaylistStatGroup.querySelector(".playlistName").innerText = playlistData.name;
    newPlaylistStatGroup.querySelector(".ratingIcon").src = "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/" + playlistData.currentRankImg;
    newPlaylistStatGroup.querySelector(".tierDiv").innerText = playlistData.currentRank + "-" + playlistData.currentDiv;
    newPlaylistStatGroup.querySelector(".mmrValue").innerText = playlistData.currentMMR;

    return newPlaylistStatGroup;
}

const createLifetimeStatGroup = (statName, statValue) => {
    const newLifetimeStatGroup = document.importNode(lifetimeStatGroupTemplate.content, true);

    newLifetimeStatGroup.querySelector(".statName").innerText = statName;
    if (statName === "Season Reward Level") {
        newLifetimeStatGroup.querySelector(".statIcon").src = "https://trackercdn.com/cdn/tracker.gg/rocket-league/ranks/" + statValue;
        newLifetimeStatGroup.querySelector(".statValue").remove();
    } else {
        newLifetimeStatGroup.querySelector(".statValue").innerText = statValue;
        newLifetimeStatGroup.querySelector(".statIcon").remove();
    }

    return newLifetimeStatGroup;
}
