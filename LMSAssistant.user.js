// ==UserScript==
// @name         LMS Assistant PRO for Collections (GitHub)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  LMS Assistant PRO with Collections-specific modules only
// @match        https://apply.creditcube.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const MODULES = {
        lmsAssistant: true, // Hidden but always on
        emailFilter: true,
        copyPaste: true,
        qcSearch: true,
        notifications: true
    };

    const MODULE_LABELS = {
        emailFilter: 'Email Filter',
        copyPaste: 'Copy/Paste',
        qcSearch: 'QC Search',
        notifications: 'Notifications BETA'
    };

    const MODULE_DESCRIPTIONS = {
        lmsAssistant: "Highlights states, manages call hours",
        emailFilter: "Filters the list of email templates",
        copyPaste: "Adds phone copy button",
        qcSearch: "QC Search — quick phone-based lookup",
        notifications: "Enables sound and notifications for the tab"
    };

    Object.keys(MODULES).forEach(key => {
        const saved = localStorage.getItem(`lms_module_${key}`);
        if (saved !== null) MODULES[key] = JSON.parse(saved);
    });

    function findHelpMenuItem() {
        const menuCells = document.querySelectorAll('#TopMenu td');
        for (const cell of menuCells) {
            if (cell.textContent.trim().toUpperCase() === 'HELP') {
                return cell;
            }
        }
        return null;
    }

    function injectTopMenuPanel() {
        const helpMenuItem = findHelpMenuItem();
        if (!helpMenuItem) return;

        const newMenuItem = document.createElement('td');
        newMenuItem.id = "TopMenu-menuItemLMS";
        newMenuItem.innerHTML = '&nbsp;🛠️ LMS Assistant PRO (Collections)&nbsp;';
        Object.assign(newMenuItem.style, {
            color: 'white', cursor: 'pointer', padding: '0 10px', height: '30px',
            lineHeight: '30px', fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '12px',
            textShadow: '1px 1px #000', textTransform: 'uppercase'
        });
        helpMenuItem.parentNode.insertBefore(newMenuItem, helpMenuItem.nextSibling);

        const dropdown = document.createElement('div');
        dropdown.id = 'lmsDropdownMenu';
        Object.assign(dropdown.style, {
            display: 'none', position: 'absolute', width: '260px',
            fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '11px',
            textTransform: 'uppercase', textAlign: 'left', textShadow: '1px 1px #000',
            color: 'white', backgroundImage: 'url(Images/submenu-back.png)',
            backgroundRepeat: 'repeat-x', backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: 'none', zIndex: '9999', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        });

        const style = document.createElement('style');
        style.textContent = `
.lms-switch { position: relative; display: inline-block; width: 36px; height: 18px; margin-left: 10px; }
.lms-switch input { display: none; }
.lms-slider {
  position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
  background-color: #ccc; transition: .3s; border-radius: 34px;
}
.lms-slider:before {
  position: absolute; content: ""; height: 14px; width: 14px;
  left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%;
}
.lms-switch input:checked + .lms-slider {
  background-color: #4CAF50;
}
.lms-switch input:checked + .lms-slider:before {
  transform: translateX(18px);
}`;
        document.head.appendChild(style);

        Object.keys(MODULES).forEach(key => {
            if (key === 'lmsAssistant') return;
            const wrapper = document.createElement('div');
            Object.assign(wrapper.style, {
                boxSizing: 'border-box', width: '100%', height: '40px', padding: '1px 3px 1px 20px',
                fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '11px', textTransform: 'uppercase',
                textAlign: 'left', textShadow: '1px 1px #000', backgroundImage: 'url(Images/submenu-back.png)',
                backgroundRepeat: 'repeat-x', backgroundColor: 'transparent', cursor: 'pointer',
                color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                transition: 'all 0.2s ease'
            });

            const nameContainer = document.createElement('div');
            nameContainer.style.display = 'flex';
            nameContainer.style.alignItems = 'center';

            const moduleName = document.createElement('span');
            moduleName.textContent = MODULE_LABELS[key];

            const helpIcon = document.createElement('img');
            helpIcon.src = 'https://cdn-icons-png.flaticon.com/512/108/108153.png';
            helpIcon.alt = 'Info';
            helpIcon.style.width = '14px';
            helpIcon.style.height = '14px';
            helpIcon.style.marginLeft = '5px';
            helpIcon.style.cursor = 'help';
            helpIcon.title = MODULE_DESCRIPTIONS[key] || 'LMS Module';
            helpIcon.style.filter = 'invert(1)';

            nameContainer.appendChild(moduleName);
            nameContainer.appendChild(helpIcon);

            wrapper.appendChild(nameContainer);

            const toggle = document.createElement('label');
            toggle.className = 'lms-switch';

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = MODULES[key];
            input.onchange = () => {
                MODULES[key] = input.checked;
                localStorage.setItem(`lms_module_${key}`, input.checked);
                location.reload();
            };

            const slider = document.createElement('span');
            slider.className = 'lms-slider';

            toggle.appendChild(input);
            toggle.appendChild(slider);
            wrapper.appendChild(toggle);
            dropdown.appendChild(wrapper);
        });

        document.body.appendChild(dropdown);

        newMenuItem.addEventListener('mouseover', () => {
            dropdown.style.display = 'block';
            newMenuItem.style.backgroundColor = 'rgb(175, 209, 255)';
            newMenuItem.style.color = 'black';
            newMenuItem.style.textShadow = '1px 1px white';
        });
        newMenuItem.addEventListener('mouseout', () => {
            dropdown.style.display = 'none';
            newMenuItem.style.backgroundColor = '';
            newMenuItem.style.color = 'white';
            newMenuItem.style.textShadow = '1px 1px black';
        });
        dropdown.addEventListener('mouseover', () => dropdown.style.display = 'block');
        dropdown.addEventListener('mouseout', () => {
            dropdown.style.display = 'none';
            newMenuItem.style.backgroundColor = '';
            newMenuItem.style.color = 'white';
            newMenuItem.style.textShadow = '1px 1px black';
        });

        const positionDropdown = () => {
            const rect = newMenuItem.getBoundingClientRect();
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.top = `${rect.bottom}px`;
        };
        positionDropdown();
        window.addEventListener('resize', positionDropdown);
    }

    injectTopMenuPanel();

    /*** ============ LMS Assistant ============ ***/
    if (MODULES.lmsAssistant) {
        const callHours = { start: '08:00:00', end: '20:00:00' };
        const tzData = {
            'AL': 'America/Chicago','AK': 'America/Anchorage','AZ': 'America/Phoenix','AR': 'America/Chicago',
            'CA': 'America/Los_Angeles','CO': 'America/Denver','CT': 'America/New_York','DE': 'America/New_York',
            'FL': 'America/New_York','GA': 'America/New_York','HI': 'Pacific/Honolulu','ID': 'America/Denver',
            'IL': 'America/Chicago','IN': 'America/Indiana/Indianapolis','IA': 'America/Chicago','KS': 'America/Chicago',
            'KY': 'America/New_York','LA': 'America/Chicago','ME': 'America/New_York','MD': 'America/New_York',
            'MA': 'America/New_York','MI': 'America/New_York','MN': 'America/Chicago','MS': 'America/Chicago',
            'MO': 'America/Chicago','MT': 'America/Denver','NE': 'America/Chicago','NV': 'America/Los_Angeles',
            'NH': 'America/New_York','NJ': 'America/New_York','NM': 'America/Denver','NY': 'America/New_York',
            'NC': 'America/New_York','ND': 'America/North_Dakota/Center','OH': 'America/New_York','OK': 'America/Chicago',
            'OR': 'America/Los_Angeles','PA': 'America/New_York','RI': 'America/New_York','SC': 'America/New_York',
            'SD': 'America/Chicago','TN': 'America/Chicago','TX': 'America/Chicago','UT': 'America/Denver',
            'VT': 'America/New_York','VA': 'America/New_York','WA': 'America/Los_Angeles','WV': 'America/New_York',
            'WI': 'America/Chicago','WY': 'America/Denver','AS': 'Pacific/Samoa','GU': 'Pacific/Guam',
            'MP': 'Pacific/Guam','PR': 'America/Puerto_Rico','VI': 'America/Puerto_Rico'
        };

        function getLocalTime(state) {
            const currTime = new Date();
            return currTime.toLocaleTimeString('en-US', { timeZone: tzData[state], hour12: false });
        }

        function isCallable(state) {
            const time = getLocalTime(state);
            return time > callHours.start && time < callHours.end;
        }

        if (location.href.includes('CustomerDetails.aspx?')) {
            togglepin();
            setTimeout(() => {
                const custState = document.querySelector('#ContactSection .ProfileSectionTable tbody tr:nth-child(2) td:nth-child(4)').textContent.trim().substring(0, 2);
                const cellPhone = document.querySelector('#ctl00_Span_CellPhone strong');
                const homePhone = document.querySelector('#ctl00_Span_HomePhone strong');
                const unsupportedStates = ['GA', 'VA', 'PA', 'IL'];
                if (unsupportedStates.includes(custState)) {
                    alert(`Customer from ${custState}. Reloan not allowed.`);
                }
                [cellPhone, homePhone].forEach(phone => {
                    phone.style.fontWeight = '800';
                    phone.style.color = isCallable(custState) ? 'green' : 'red';
                });
            }, 1000);
        }


        if (location.href.includes('LoansReport.aspx?reportpreset=pending')) {
            const leads = document.querySelectorAll('#Page_Form table.DataTable.FixedHeader tbody tr:not(:last-child)');
            leads.forEach(row => {
                const cell = row.querySelector('td:nth-child(9)');
                const state = cell.textContent.trim().substring(0, 2);
                cell.style.fontWeight = '800';
                cell.style.color = isCallable(state) ? 'green' : 'red';
            });
        }
    }
/*** ============ Email Category Filter ============ ***/

    if (MODULES.emailFilter && location.href.includes('CustomerDetails')) {
        const categories = ["Loan Letters", "Collection Letters", "Marketing Letters", "DRS Letters"];
        const unwantedEmails = ["Adv Action Test", "TEST TEST TEST DO NOT SEND"];
        const PANEL_ID = 'emailCategoryControlPanel';

        const createControlPanel = () => {
            if (document.getElementById(PANEL_ID)) return;
            const panel = document.createElement('div');
            panel.id = PANEL_ID;
            panel.style.marginLeft = '10px';
            panel.style.display = 'inline-block';
            const labelText = document.createElement('span');
            labelText.textContent = "Categories:";
            labelText.style.marginRight = "10px";
            panel.appendChild(labelText);

            categories.forEach(cat => {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = JSON.parse(localStorage.getItem(`show_${cat}`) || "true");
                checkbox.style.marginRight = '5px';
                checkbox.addEventListener('change', () => {
                    localStorage.setItem(`show_${cat}`, checkbox.checked);
                    filterSelectOptions();
                });

                const label = document.createElement('label');
                label.style.marginRight = '10px';
                label.style.cursor = 'pointer';
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(cat));
                panel.appendChild(label);
            });

            const sendButton = document.querySelector('input[type="submit"][value="Send"]');
            if (sendButton && sendButton.parentElement) {
                sendButton.parentElement.insertBefore(panel, sendButton.nextSibling);
            }
        };

        const filterSelectOptions = () => {
            const select = document.querySelector('#ctl00_LoansRepeater_Letter_ForEmail_0');
            if (!select) return;

            let currentCategory = null;
            Array.from(select.options).forEach(option => {
                const text = option.textContent.trim();
                if (categories.some(cat => text === `-- ${cat} --`)) {
                    currentCategory = categories.find(cat => text === `-- ${cat} --`);
                    option.style.display = '';
                    return;
                }
                const isDRS = text.includes("[z3RDParty]");
                const showCurrentCategory = currentCategory && JSON.parse(localStorage.getItem(`show_${currentCategory}`) || "true");
                const shouldHide =
                    unwantedEmails.includes(text) ||
                    (!isDRS && !showCurrentCategory) ||
                    (isDRS && !JSON.parse(localStorage.getItem("show_DRS Letters") || "false"));

                option.style.display = shouldHide ? 'none' : '';
            });
        };

        const observer = new MutationObserver(filterSelectOptions);
        observer.observe(document.body, { childList: true, subtree: true });

        window.addEventListener('load', () => setTimeout(() => {
            createControlPanel();
            filterSelectOptions();
        }, 700));
    }
/*** ============ Copy/Paste LMS ============ ***/

if (MODULES.copyPaste && location.href.includes('CustomerDetails')) {

    function isUSPhoneNumber(str) {
        var regex = /^\(?(\d{3})\)?[- .]?(\d{3})[- .]?(\d{4})$/;
        return regex.test(str);
    }

    function displayUSPhoneNumbers() {
        var text = document.body.innerText;

        var matches = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g);
        if (!matches) {
            alert("No phone numbers found on this page.");
            return;
        }

        var usPhoneNumbers = matches.filter(isUSPhoneNumber);

        if (usPhoneNumbers.length === 0) {
            alert("No US phone numbers found on this page.");
        } else if (usPhoneNumbers.length === 1) {
            // Якщо знайдено рівно 1 номер
            var phoneNumber = "111" + usPhoneNumbers[0];
            navigator.clipboard.writeText(phoneNumber)
              .then(() => {
                console.log("Copied: " + phoneNumber);
              })
              .catch(err => console.error("Failed to copy:", err));

        } else {
            // Якщо знайдено 2 і більше номерів
            var phoneNumber2 = "111" + usPhoneNumbers[1];
            navigator.clipboard.writeText(phoneNumber2)
              .then(() => {
                console.log("Copied: " + phoneNumber2);
              })
              .catch(err => console.error("Failed to copy:", err));
        }
    }

    // Функція створення кнопки
    function createCopyButton() {
        var button = document.createElement("button");
        button.innerHTML = "Copy Cell Number";
        Object.assign(button.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            zIndex: "9999",
            padding: "6px 12px",
            background: "#2e9fd8",
            color: "#fff",
            border: "none",
            borderRadius: "none",
            cursor: "pointer",
            fontWeight: "bold"
        });
        button.onclick = function() {
            displayUSPhoneNumbers();
        };
        document.body.appendChild(button);
    }

    // Додамо кнопку після завантаження
    window.addEventListener('load', function() {
        createCopyButton();
    });
}
/*** ============ QC LMS Search Assistant ============ ***/

    if (MODULES.qcSearch && location.href.includes('CustomersReport')) {
    const getElement = (selector) => document.querySelector(selector);
    const getElements = (selector) => document.querySelectorAll(selector);

    const mainContentSelector = '#maincontent_';
    const sourceInput = getElement(`${mainContentSelector}City`);
    const targetInputs = getElements('[id^="maincontent_Phone_"]');
    const searchButton = getElement(`${mainContentSelector}Btn_Search`);

    const clearInputs = () => {
        targetInputs.forEach(input => (input.value = ''));
    };

    const insertCharacters = () => {
        const inputValue = sourceInput.value;
        if (inputValue.length >= 10) {
            targetInputs[0].value = inputValue.substring(2, 5);
            targetInputs[1].value = inputValue.substring(5, 8);
            targetInputs[2].value = inputValue.substring(8);
            sourceInput.value = '';
            if (searchButton) searchButton.click();
        } else {
            clearInputs();
        }
    };

    let timeout;
    sourceInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(insertCharacters, 200);
    });

    const createClearButton = (inputs, parentElement) => {
        const btn = document.createElement('button');
        btn.textContent = 'Clear';
        btn.type = 'button';

        // Buttons style (LMS like)
       Object.assign(btn.style, {
    marginLeft: '5px',
    padding: '2px 6px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontWeight: 'bold',
    fontSize: '11px',
    border: '1px solid #2e9fd8',
    background: '#2e9fd8 url(Images/global-button-back.png) left top repeat-x',
    color: '#DFDFDF',
    cursor: 'pointer'
});

        btn.onclick = () => {
            inputs.forEach(id => {
                const el = getElement(`#${id}`);
                if (el) el.value = '';
            });
        };
        parentElement.appendChild(btn);
    };

    createClearButton(['maincontent_Ssn_SSN_0', 'maincontent_Ssn_SSN_1', 'maincontent_Ssn_SSN_2'], getElement('#maincontent_Ssn_SSN_2')?.parentNode);
    createClearButton(['maincontent_Phone_1', 'maincontent_Phone_2', 'maincontent_Phone_3'], targetInputs[2]?.parentNode);

    const element = getElement('#maincontent_Td_CityHeader');
    if (element) element.textContent = 'Quick Search';
}

/*** ============ Notifications module ============ ***/

    if (MODULES.notifications) {
const PRIMARY_TAB_KEY = "primaryLock";
    const PRIMARY_TAB_TIMESTAMP = "primaryTabTimestamp";
    const PRIMARY_COUNT_KEY = "primaryLastCount";
    const LAST_COUNT_KEY = "lastNotificationCount";
    const tabId = window.name || (window.name = Math.random().toString(36).substr(2, 9));
    let lastCount = parseInt(localStorage.getItem("lastNotificationCount") || "0", 10);
    let isPrimaryTab = false;

    function setPrimaryTab() {
        localStorage.setItem(PRIMARY_TAB_KEY, tabId);
        localStorage.setItem(PRIMARY_TAB_TIMESTAMP, Date.now());
        isPrimaryTab = true;
        document.title = document.title.startsWith("⭐ ") ? document.title : `⭐ ${document.title}`;
    }
    function clearPrimaryTab() {
        isPrimaryTab = false;
        document.title = document.title.replace(/^⭐\s*/, "");
    }
    function checkPrimaryTab() {
        const currentPrimaryId = localStorage.getItem(PRIMARY_TAB_KEY);
        const lastPrimaryUpdate = parseInt(localStorage.getItem("primaryTabTimestamp") || "0", 10);
        const now = Date.now();

        if (!currentPrimaryId || currentPrimaryId === tabId || (now - lastPrimaryUpdate > 10000)) {
            setPrimaryTab();
            localStorage.setItem("primaryTabTimestamp", now);
            isPrimaryTab = true;
            if (!document.title.startsWith("⭐")) {
                document.title = "⭐ " + document.title;
            }
        } else {
            clearPrimaryTab();
        }
    }

    window.addEventListener("storage", (event) => {
        if (event.key === PRIMARY_TAB_KEY && event.newValue !== tabId) {
            clearPrimaryTab();
        }
    });

    setInterval(checkPrimaryTab, 5000);

    function requestNotificationPermission() {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }

    function updateLastCount(count) {
        lastCount = count;
        localStorage.setItem("lastNotificationCount", String(lastCount));
        localStorage.setItem("primaryLastCount", String(lastCount));
    }

    function showNotification(count) {
        new Notification("🔔 New notification!", {
            body: `You have new notifications: ${count}`,
            icon: "https://cdn-icons-png.flaticon.com/512/1827/1827295.png"
        });
        updateLastCount(count);
    }

    function getNotificationElement() {
        return [...document.querySelectorAll('a.HeaderButton[onclick*="toggleNotificationPane"]')]
            .find(el => el.textContent.includes("Notifications"));
    }

    function checkNotifications() {
        const notificationElement = getNotificationElement();
        if (!notificationElement) return;

        const notificationText = notificationElement.querySelector("span");
        if (!notificationText) return;

        const currentCount = parseInt(notificationText.innerText.trim(), 10);
        if (isNaN(currentCount) || currentCount < 0) return;

        if (currentCount > lastCount && isPrimaryTab && Notification.permission === "granted") {
            showNotification(currentCount);
        }
        if (currentCount !== lastCount) {
            updateLastCount(currentCount);
        }
    }

    function observeNotifications() {
        const notificationElement = getNotificationElement();
        if (!notificationElement) {
            setTimeout(observeNotifications, 1000);
            return;
        }
        const observer = new MutationObserver(checkNotifications);
        observer.observe(notificationElement, { childList: true, subtree: true, characterData: true });
    }


    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }


    observeNotifications();
    setInterval(checkNotifications, 10000);
}
})();
