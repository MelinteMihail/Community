const buttonLeft = document.querySelector('.left');
const buttonRight = document.querySelector('.right');
const title = document.querySelector('.title');
const tab = document.querySelector('.tab');
const tabWrapper = document.querySelector('.tab-wrapper');
const podiumParent = tab.querySelector('.podium-parent');

const mobilenav = document.getElementById('mobilenav');
const mobilemenu = document.getElementById('mobilemenu');
const mobilenavBtn = document.querySelector(".mobilenav_btn");
const menuNavItems = document.querySelectorAll(".menu_nav_item");
const closeBtn = document.querySelector(".closebtn");
const hasDropdownItems = document.querySelectorAll(".has-dropdown");

const secondTab = tab.cloneNode(true);
secondTab.className = 'second-tab';
tabWrapper.appendChild(secondTab);

let yearArray = [];
let currentYear = 0;
let savedData;
let selectedTeam = 1;

window.addEventListener("load", readDataFile);
secondTab.addEventListener('transitionend', updateYear);
buttonRight.addEventListener("click", () => changeYear(1));
buttonLeft.addEventListener("click", () => changeYear(-1));

podiumParent.querySelectorAll('.podium').forEach((podium, index) => {
    const name = podium.querySelector('.name');

    podium.addEventListener('transitionend', () => {
        if (index === 3 && event.propertyName !== 'height')
            return;

        name.classList.add('active');
        name.style.transition = "opacity 0.25s ease-in-out";

        if (![...podiumParent.querySelectorAll('.podium')].some(p => p.classList.contains('selected'))) {
            handlePodiumClick(podiumParent.querySelector('.first'));
        }
    });

    podium.addEventListener('click', () => handlePodiumClick(podium));
});

function readDataFile() {
    fetch("data/data.json")
        .then(res => res.ok ? res.json() : Promise.reject(`HTTP ${res.status}`))
        .then(handleData)
        .catch(err => console.error("Fetch error:", err));
}

function getYearFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("year");
}


function handleData(data) {
    yearArray = Object.keys(data);
    savedData = data;

    const urlYear = getYearFromURL();

    if (urlYear && yearArray.includes(urlYear)) {
        currentYear = yearArray.indexOf(urlYear);
    } else {
        currentYear = yearArray.length - 1;
    }

    updateNavigationButtons();
    updateYear();
}


function changeYear(direction) {
    const newYear = currentYear + direction;
    if (newYear < 0 || newYear >= yearArray.length) return;
    currentYear = newYear;
    changeTab(direction > 0 ? "right" : "left");
}

function updateNavigationButtons() {
    buttonLeft.disabled = currentYear <= 0;
    buttonRight.disabled = currentYear >= yearArray.length - 1;
}

function changeTab(direction) {
    const xTranslate = direction === "right" ? 100 : -100;
    updateTab(secondTab);

    secondTab.style.transition = "none";
    secondTab.style.transform = `translateX(${xTranslate}%)`;
    secondTab.offsetHeight;

    secondTab.style.transition = "transform 0.6s ease";
    secondTab.style.transform = "translateX(0)";
    tab.style.transition = "transform 0.6s ease";
    tab.style.transform = `translateX(${-xTranslate}%)`;

    tab.querySelectorAll('.info > *').forEach(el => {

        if (el == ".link-wrapper")
            el.querySelector(".link").classList.remove("visible");
        else
            el.classList.remove('visible');
    });

    updateNavigationButtons();
}

function resetPodiumsVisual() {
    podiumParent.querySelectorAll('.podium').forEach(podium => {
        podium.classList.remove('active', 'selected', 'dimmed');
        const name = podium.querySelector('.name');
        name?.classList.remove('active');
        name.style.transition = "none";
    });
}

function updateYear() {
    resetTabPositions();
    deselectAllPodiums();

    const yearKey = yearArray[currentYear];
    title.textContent = yearKey;
    updateNavigationButtons();

    podiumParent.querySelectorAll('.podium').forEach((podium, i) => {
        podium.classList.remove('active');
        podium.style.transition = "none";
        void podium.offsetWidth;

        const name = podium.querySelector('.name');
        name?.classList.remove('active');
        name.style.transition = "none";

        let delay = (i + 1) * 0.1 * ((i + 1) % 2);
        if (i === 3) delay = 0.3;
        const data = savedData[yearKey];

        podium.style.transition = `height 0.6s ${delay}s cubic-bezier(0, 0.55, 0.45, 1), opacity 0.5s ease`;

        void podium.offsetWidth;

        if (i !== 3 || data.fourth)
            podium.classList.add('active');
    });

    updateTab(tab);
}

function updateTab(selectedTab) {
    const yearKey = yearArray[currentYear];
    const data = savedData[yearKey];

    selectedTab.querySelector('.text').textContent = data.first.text;
    selectedTab.querySelector('.first .name').textContent = data.first.name;
    selectedTab.querySelector('.second .name').textContent = data.second.name;
    selectedTab.querySelector('.third .name').textContent = data.third.name;
    selectedTab.querySelector('.fourth .name').textContent = data.fourth ? data.fourth.name : '';
}

let podiumTransitionInProgress = false;

function handlePodiumClick(clickedPodium) {
    if (clickedPodium.classList.contains('selected')) return;

    podiumParent.querySelectorAll('.podium').forEach(p => {
        p.classList.toggle('selected', p === clickedPodium);
        p.classList.toggle('dimmed', p !== clickedPodium);
    });

    selectedTeam = clickedPodium.classList.contains('first') ? 1
        : clickedPodium.classList.contains('second') ? 2
            : clickedPodium.classList.contains('third') ? 3
                : 4;

    const infoElements = tab.querySelectorAll('.info-card');
    const fadeDuration = 300;

    infoElements.forEach(el => el.classList.remove('visible'));

    setTimeout(() => {
        updateSelectedTeamContent();

        infoElements.forEach(el => el.classList.add('visible'));
    }, fadeDuration);
}

function updateSelectedTeamContent() {
    const posStr = parsePositionNumberToString(selectedTeam);
    const obj = savedData[yearArray[currentYear]][posStr];

    tab.querySelector('.text').textContent = obj.name;
    tab.querySelector('.elevi').textContent = obj.elevi.join(", ");
    tab.querySelector('.profesori').textContent = obj.profesori.join(", ");
    tab.querySelector('.scoala').textContent = obj.scoala;

    tab.querySelector('.link-wrapper .link').href = obj.link;

    console.log("Selected team:", selectedTeam);
}

function deselectAllPodiums() {
    podiumParent.querySelectorAll('.podium').forEach(podium => podium.classList.remove('selected', 'dimmed'));
}

function resetTabPositions() {
    secondTab.style.transition = "none";
    secondTab.style.transform = "translateX(100%)";
    tab.style.transition = "none";
    tab.style.transform = "translateX(0)";
}

function parsePositionNumberToString(num) {
    return ['none', 'first', 'second', 'third', 'fourth'][num] || 'none';
}

function mobilenav_click() {
    if (mobilenav.classList.contains('viz')) {
        mobilenav_close();
    } else {
        mobilenav.classList.add('viz');
        mobilemenu.classList.add('viz');
    }
}

function mobilenav_close() {
    mobilenav.classList.remove('viz');
    mobilemenu.classList.remove('viz');
    // Close all dropdowns when menu closes
    hasDropdownItems.forEach(item => {
        item.classList.remove('open');
    });
}

mobilenavBtn.addEventListener("click", mobilenav_click);
closeBtn.addEventListener("click", mobilenav_close);

// Handle dropdown toggles
hasDropdownItems.forEach(item => {
    const span = item.querySelector('span');
    if (span) {
        span.addEventListener('click', (e) => {
            e.stopPropagation();
            item.classList.toggle('open');
        });
    }
});

// Close menu when clicking regular nav items (not dropdowns)
menuNavItems.forEach(item => {
    if (!item.classList.contains('has-dropdown')) {
        item.addEventListener("click", mobilenav_close);
    }
});

// Close dropdown links also close the menu
document.querySelectorAll('.mobile-dropdown a').forEach(link => {
    link.addEventListener('click', mobilenav_close);
});

// Close menu when clicking outside
mobilemenu.addEventListener("click", (e) => {
    if (e.target === mobilemenu) {
        mobilenav_close();
    }
});