const buttonLeft = document.querySelector('.left');
const buttonRight = document.querySelector('.right');
const title = document.querySelector('.title');
const tab = document.querySelector('.tab');
const tabWrapper = document.querySelector('.tab-wrapper');
const podiumParent = tab.querySelector('.podium-parent');

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
    
podiumParent.querySelectorAll('.podium').forEach(podium => {
    const name = podium.querySelector('.name');
    podium.addEventListener('transitionend', () => {
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

function handleData(data) {
    yearArray = Object.keys(data);
    savedData = data;
    currentYear = yearArray.length - 1;
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

        const delay = (i + 1) * 0.1 * ((i + 1) % 2);
        podium.style.transition = `height 0.6s ${delay}s cubic-bezier(0, 0.55, 0.45, 1), opacity 0.5s ease`;
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
                 : 3;

    const infoElements = tab.querySelectorAll('.info > *');
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

    const eleviText = "Elevi: " + obj.elevi.join(", ") + ".";
    const profesoriText = "Profesori Coordonatori: " + obj.profesori.join(", ") + ".";
    const scoalaText = "Școala de Proveniență: " + obj.scoala;

    tab.querySelector('.text').textContent = obj.text;
    tab.querySelector('.elevi').textContent = eleviText;
    tab.querySelector('.profesori').textContent = profesoriText;
    tab.querySelector('.scoala').textContent = scoalaText;
    tab.querySelector('.link').href = obj.link;

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
    return ['none', 'first', 'second', 'third'][num] || 'none';
}
