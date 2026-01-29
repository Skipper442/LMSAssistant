// ==UserScript==
// @name         LMS Assistant PRO for Collections (GitHub)
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  LMS Assistant PRO with Collections-specific modules only
// @match        https://apply.creditcube.com/*
// @icon         https://raw.githubusercontent.com/Skipper442/CC-icon/main/Credit-cube-logo.png
// @updateURL    https://github.com/Skipper442/LMSAssistant/raw/refs/heads/Collections/LMSAssistant.user.js
// @downloadURL  https://github.com/Skipper442/LMSAssistant/raw/refs/heads/Collections/LMSAssistant.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      docs.google.com
// @connect      sheets.googleapis.com
// @connect      googleusercontent.com
// @connect      slack.ccwusa.org
// @connect      slack.com
// @run-at       document-idle
// ==/UserScript==


(function () {
    'use strict';

// ===== Version Changelog Popup =====
    const CURRENT_VERSION = "2.3";

const changelog = [
  "🆕 - Slack DM MODULE (in one click opens a your chat with the agent). - 🆕",
  "How to use: On the first click, wait for the authorization popup (can take up to ~10 seconds).",
  "On the next page click \"Allow\" to authorize.",
  "After you allow access, close the confirmation page and click the Slack DM button again to open the chat.",
  "If nothing happens: make sure Slack desktop/app is installed and you are logged into the correct workspace."
];


    const savedVersion = localStorage.getItem("lms_assistant_version");
    if (savedVersion !== CURRENT_VERSION) {
        showVersionPopup(CURRENT_VERSION, changelog);
        localStorage.setItem("lms_assistant_version", CURRENT_VERSION);
    }

    function showVersionPopup(version, changes) {
        const box = document.createElement("div");

        const header = document.createElement("h3");
        header.textContent = `🛠 LMS Assistant PRO — updated to version ${version}`;
        header.style.marginBottom = "10px";

        const list = document.createElement("ul");
        list.style.textAlign = "left";
        changes.forEach(change => {
            const li = document.createElement("li");
            li.textContent = change;
            list.appendChild(li);
        });

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "OK";
        Object.assign(closeBtn.style, {
            marginTop: "15px",
            padding: "6px 14px",
            border: "1px solid #a27c33",
            borderRadius: "4px",
            background: "#5c4400",
            backgroundImage: "url(Images/global-button-back.png)",
            backgroundRepeat: "repeat-x",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontFamily: "Arial, Helvetica, sans-serif"
        });
        closeBtn.onclick = () => box.remove();

        Object.assign(box.style, {
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff3cd",
            color: "#5c4400",
            padding: "20px 30px",
            borderRadius: "10px",
            fontSize: "14px",
            fontFamily: "Segoe UI, sans-serif",
            fontWeight: "500",
            zIndex: "99999",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            maxWidth: "90%",
            textAlign: "center"
        });

        box.appendChild(header);
        box.appendChild(list);
        box.appendChild(closeBtn);
        document.body.appendChild(box);
    }

    // ===== End Version Check =====

    const MODULES = {
        lmsAssistant: true, // Hidden but always on
        emailFilter: true,
        qcSearch: true,
        notifications: true,
        briaCall: true,
        slackDM: true
    };

    const MODULE_LABELS = {
        emailFilter: 'Email Filter',
        qcSearch: 'QC Search',
        notifications: 'Notifications BETA',
        briaCall: 'Bria Call',
        slackDM: 'Slack DM'
    };

    const MODULE_DESCRIPTIONS = {
        lmsAssistant: "Highlights states, manages call hours",
        emailFilter: "Filters the list of email templates",
        qcSearch: "QC Search — quick phone-based lookup",
        notifications: "Enables sound and notifications for the tab",
        briaCall: "Adds Call via Bria button on CustomerDetails",
        slackDM: "Open 1:1 Slack DM from LMS",
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
            wrapper.addEventListener('mouseover', () => {
                wrapper.style.backgroundColor = 'rgb(175, 209, 255)';
                wrapper.style.color = 'black';
                wrapper.style.textShadow = '1px 1px white';
                helpIcon.style.filter = 'none';
            });
            wrapper.addEventListener('mouseout', () => {
                wrapper.style.backgroundColor = 'transparent';
                wrapper.style.color = 'white';
                wrapper.style.textShadow = '1px 1px black';
                helpIcon.style.filter = 'invert(1)';
            });

            dropdown.appendChild(wrapper);
        });

        const ideasWrapper = document.createElement('div');
        Object.assign(ideasWrapper.style, {
            boxSizing: 'border-box', width: '100%', height: '40px', padding: '1px 3px 1px 20px',
            fontFamily: 'Segoe UI, Arial, sans-serif', fontSize: '11px', textTransform: 'uppercase',
            textAlign: 'left', textShadow: '1px 1px #000', backgroundImage: 'url(Images/submenu-back.png)',
            backgroundRepeat: 'repeat-x', backgroundColor: 'transparent', cursor: 'pointer',
            color: 'white', display: 'flex', alignItems: 'center', transition: 'all 0.2s ease'
        });
        ideasWrapper.textContent = 'New Ideas / Bug Report';
        ideasWrapper.addEventListener('mouseover', () => {
            ideasWrapper.style.backgroundColor = 'rgb(175, 209, 255)';
            ideasWrapper.style.color = 'black';
            ideasWrapper.style.textShadow = '1px 1px white';
        });
        ideasWrapper.addEventListener('mouseout', () => {
            ideasWrapper.style.backgroundColor = 'transparent';
            ideasWrapper.style.color = 'white';
            ideasWrapper.style.textShadow = '1px 1px black';
        });
        ideasWrapper.addEventListener('click', () => {
            window.open('https://forms.gle/esmUuaVD9oxCh7mz7', '_blank');
        });
        dropdown.appendChild(ideasWrapper);

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

    const unsupportedStates = ['GA', 'VA', 'PA', 'IL'];
    const softPolicyStates = ['MD', 'NC', 'IN', 'MN'];

    function getLocalTime(state) {
        const currTime = new Date();
        return currTime.toLocaleTimeString('en-US', { timeZone: tzData[state], hour12: false });
    }

    function isCallable(state) {
        const time = getLocalTime(state);
        return time > callHours.start && time < callHours.end;
    }

    function showCustomAlert(message) {
        const existing = document.getElementById("customLmsAlert");
        if (existing) existing.remove();

        const box = document.createElement("div");
        box.id = "customLmsAlert";

        const text = document.createElement("div");
        text.textContent = message;

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "OK";
        closeBtn.style.marginTop = "10px";
        closeBtn.style.padding = "4px 12px";
        closeBtn.style.border = "1px solid #a27c33";
        closeBtn.style.borderRadius = "4px";
        closeBtn.style.background = "#5c4400";
        closeBtn.style.backgroundImage = "url(Images/global-button-back.png)";
        closeBtn.style.backgroundRepeat = "repeat-x";
        closeBtn.style.color = "#fff";
        closeBtn.style.fontWeight = "bold";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.fontFamily = "Arial, Helvetica, sans-serif";
        closeBtn.onclick = () => box.remove();

        Object.assign(box.style, {
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#fff3cd",
            color: "#5c4400",
            padding: "15px 25px",
            borderRadius: "10px",
            fontSize: "15px",
            fontFamily: "Segoe UI, sans-serif",
            fontWeight: "500",
            zIndex: "99999",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            maxWidth: "90%",
            textAlign: "center"
        });

        box.appendChild(text);
        box.appendChild(closeBtn);
        document.body.appendChild(box);
    }

    // ==== ЛОГІКА ЛІВОГО МЕНЮ (toggle) ====
    const MENU_STORAGE_KEY = 'cc_left_menu_hidden';

    function readMenuHidden() {
        const v = localStorage.getItem(MENU_STORAGE_KEY);
        return v === 'true';
    }

    function writeMenuHidden(val) {
        localStorage.setItem(MENU_STORAGE_KEY, val ? 'true' : 'false');
    }

    function applyMenuState(hidden, nav, main, btn) {
        const table = nav.closest('table');

        if (hidden) {
            nav.style.display = 'none';
            main.colSpan = 2;
            main.classList.add('expanded-main');

            if (table) {
                table.style.width = '100%';
                table.style.maxWidth = '100%';
                table.style.marginLeft = '0';
                table.style.marginRight = '0';
            }

            btn.textContent = '≫';
        } else {
            nav.style.display = 'table-cell';
            main.colSpan = 1;
            main.classList.remove('expanded-main');

            if (table) {
                table.style.width = '';
                table.style.maxWidth = '';
                table.style.marginLeft = '';
                table.style.marginRight = '';
            }

            btn.textContent = '≪';
        }
    }

    function initLeftMenuToggle() {
        const nav = document.querySelector('#ctl00 > table > tbody > tr > td.PageNavigation');
        const main = document.querySelector('#ctl00 > table > tbody > tr > td.PageGradeRight');
        if (!nav || !main) return;

        if (!document.querySelector('#cc-left-menu-toggle-style')) {
            const style = document.createElement('style');
            style.id = 'cc-left-menu-toggle-style';
            style.textContent = `
                td.PageGradeRight {
                    transition: width 0.2s ease;
                }
                td.PageGradeRight.expanded-main {
                    width: 100%;
                }
                #nav-toggle-btn {
                    position: fixed;
                    top: 50%;
                    left: 0;
                    transform: translateY(-50%);
                    z-index: 9999;
                    padding: 4px 6px;
                    background: #333;
                    color: #fff;
                    cursor: pointer;
                    font-size: 12px;
                    border-radius: 0 4px 4px 0;
                }
            `;
            document.head.appendChild(style);
        }

        let btn = document.querySelector('#nav-toggle-btn');
        if (!btn) {
            btn = document.createElement('div');
            btn.id = 'nav-toggle-btn';
            document.body.appendChild(btn);
        }

        let hidden = readMenuHidden();
        applyMenuState(hidden, nav, main, btn);

        btn.onclick = () => {
            hidden = !hidden;
            applyMenuState(hidden, nav, main, btn);
            writeMenuHidden(hidden);
        };
    }

    // Основна логіка
    if (location.href.includes('CustomerDetails.aspx?')) {
        togglepin();
        initLeftMenuToggle();// ✅ Додано toggle меню

        const observer = new MutationObserver((mutations, obs) => {
            const custCell = document.querySelector('#ContactSection .ProfileSectionTable tbody tr:nth-child(2) td:nth-child(4)');
            const cellPhone = document.querySelector('#ctl00_Span_CellPhone strong');
            const homePhone = document.querySelector('#ctl00_Span_HomePhone strong');

            if (custCell && cellPhone && homePhone) {
                const custState = custCell.textContent.trim().substring(0, 2);

                if (unsupportedStates.includes(custState)) {
                    showCustomAlert(`⚠️ Customer from ${custState}. Reloan not allowed. ⚠️`);
                } else if (softPolicyStates.includes(custState)) {
                    showCustomAlert(`☝️ Soft policy state (${custState}). Communicate respectfully and avoid pressure.`);
                }

                [cellPhone, homePhone].forEach(phone => {
                    phone.style.fontWeight = '800';
                    phone.style.color = isCallable(custState) ? 'green' : 'red';
                });

                obs.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
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


/*** ============ Email/TXT Category Filter ============ ***/

if (MODULES.emailFilter && location.href.includes('CustomerDetails')) {
    const rawCategories = ["Loan Letters", "Collection Letters", "Marketing Letters", "DRS Letters"];
    const renamedCategories = {
        "Loan Letters": "Support",
        "Collection Letters": "Collection",
        "Marketing Letters": "Marketing",
        "DRS Letters": "DRS"
    };

    const unwantedEmails = ["Adv Action Test", "TEST TEST TEST DO NOT SEND"];
    const PANEL_ID = 'emailCategoryControlPanel';

    const getSelectedLetterType = () => {
        const select = document.querySelector('select[id$="LetterAction_0"]');
        return select?.value || "send";
    };

    const getLetterSelectId = () => {
        const type = getSelectedLetterType();
        switch (type) {
            case "send": return "#ctl00_LoansRepeater_Letter_ForEmail_0";
            case "textmessage": return "#ctl00_LoansRepeater_Letter_ForTextMessage_0";
            default: return null;
        }
    };

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

        rawCategories.forEach(cat => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = JSON.parse(localStorage.getItem(`show_${cat}`) || "true");
            checkbox.style.marginRight = '5px';
            checkbox.dataset.original = cat;
            checkbox.addEventListener('change', () => {
                localStorage.setItem(`show_${cat}`, checkbox.checked);
                filterSelectOptions();
            });

            const label = document.createElement('label');
            label.style.marginRight = '10px';
            label.style.cursor = 'pointer';
            label.dataset.category = cat;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(renamedCategories[cat] || cat));
            panel.appendChild(label);
        });

        const sendButton = document.querySelector('input[type="submit"][value="Send"]');
        if (sendButton && sendButton.parentElement) {
            sendButton.parentElement.insertBefore(panel, sendButton.nextSibling);
        }
    };

    const filterSelectOptions = () => {
        const selectId = getLetterSelectId();
        if (!selectId) return;

        const select = document.querySelector(selectId);
        if (!select) return;

        const letterType = getSelectedLetterType();

        const marketingLabel = [...document.querySelectorAll(`#${PANEL_ID} label`)].find(lbl => lbl.dataset.category === "Marketing Letters");
        if (marketingLabel) {
            marketingLabel.style.display = (letterType === "textmessage") ? "none" : "inline-block";
        }

        let currentCategory = null;
        Array.from(select.options).forEach(option => {
            const text = option.textContent.trim();

            if (rawCategories.some(cat => text === `-- ${cat} --`)) {
                currentCategory = rawCategories.find(cat => text === `-- ${cat} --`);
                option.style.display = '';
                return;
            }

            let show = true;
            if (letterType === "send") {
                const isDRS = text.includes("[z3RDParty]");
                const showCurrent = currentCategory && JSON.parse(localStorage.getItem(`show_${currentCategory}`) || "true");
                show = !unwantedEmails.includes(text) && ((showCurrent && !isDRS) || (isDRS && JSON.parse(localStorage.getItem("show_DRS Letters") || "false")));
            } else if (letterType === "textmessage") {
                const isSupport = text.includes("(Sup)");
                const isCollection = text.includes("(Coll)");
                const isDRS = text.includes("{zTXT}") || text.includes("(3RDParty)");

                const showSupport = JSON.parse(localStorage.getItem("show_Loan Letters") || "true");
                const showCollection = JSON.parse(localStorage.getItem("show_Collection Letters") || "true");
                const showDRS = JSON.parse(localStorage.getItem("show_DRS Letters") || "true");

                show =
                    (isSupport && showSupport) ||
                    (isCollection && showCollection && !isDRS) ||
                    (isDRS && showDRS);
            }
            option.style.display = show ? '' : 'none';
        });
    };

    const waitForSendButton = () => {
        const sendButton = document.querySelector('input[type="submit"][value="Send"]');
        if (!sendButton) {
            requestAnimationFrame(waitForSendButton);
            return;
        }

        createControlPanel();
        filterSelectOptions();

        const letterTypeSelector = document.querySelector('select[id$="LetterAction_0"]');
        if (letterTypeSelector) {
            letterTypeSelector.addEventListener("change", () => {
                setTimeout(() => {
                    filterSelectOptions();
                }, 50);
            });
        }
    };

    const observer = new MutationObserver(waitForSendButton);
    observer.observe(document.body, { childList: true, subtree: true });
}

/*** ============ LMS Bria Call Button (CustomerDetails) ============ ***/

if (MODULES.briaCall && location.href.includes('CustomerDetails')) {
    function extractCellPhone() {
        const cellPhoneEl = document.querySelector('#ctl00_Span_CellPhone strong');
        if (!cellPhoneEl) return null;

        const rawNumber = cellPhoneEl.textContent.trim();
        const sanitizedNumber = rawNumber.replace(/[^\d]/g, '');
        if (sanitizedNumber.length < 7) return null;

        return `sip:111${sanitizedNumber}`;
    }

    function createCallButton(historyLink) {
        if (document.getElementById("briaCallBtn")) return;

        const button = document.createElement("a");
        button.id = "briaCallBtn";
        button.className = "WordOnButton";
        button.href = "javascript:void(0);";

        button.innerHTML =
            '<span style="margin-right:4px;vertical-align:middle;color:transparent;text-shadow:0 0 0 #28a745;">&#128222;</span>' +
            '<span style="vertical-align:middle;">Call</span>';

        Object.assign(button.style, {
            fontWeight: "bold",
            whiteSpace: "nowrap",
            margin: "0 0 0 3px"
        });

        button.onclick = () => {
            const sipUri = extractCellPhone();
            if (!sipUri) {
                alert("Cell phone number not found or invalid.");
                return;
            }

            const isFirstTime = !localStorage.getItem('briaConfirmed');
            if (isFirstTime) {
                localStorage.setItem('briaConfirmed', 'true');
                window.open(sipUri, '_blank'); // напряму відкриваємо sip: посилання [web:178]
                alert("✅ Please allow Bria to open and check 'Always allow'.\n\nNext time, call will be automatic.");
            } else {
                // повторні виклики — теж просто відкриваємо sip: в новій вкладці
                window.open(sipUri, '_blank');
            }
        };

        historyLink.insertAdjacentElement('beforebegin', button);
    }

    const observer = new MutationObserver(() => {
        const cellPhone = document.querySelector('#ctl00_Span_CellPhone strong');
        const historyLink = document.querySelector('#maincontent_HistoryLink');

        if (cellPhone && historyLink) {
            createCallButton(historyLink);
            observer.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true }); //[web:181]
}


/*** ============ CC Slack DM Helper ============ ***/
if (MODULES.slackDM && location.href.includes("CustomerDetails.aspx")) {

  const CC_SLACK_DM = (() => {
    "use strict";

    const CONFIG = {
      enabledOn: "CustomerDetails.aspx",

      SHEET_URL:
        "https://docs.google.com/spreadsheets/d/1kpeuN8hNqBG8MtO8q--Ton5sHlJjiJFrgvWqHJn-aVc/export?format=csv&gid=0",

      COL_CRM_NICK: "CRM Name",
      COL_LMS_NAME: "Name in LMS",
      COL_SLACK_UID: "User ID (Slack)",

      CRM_NICK_SELECTOR:
        "#masterHeader > tbody > tr > td:nth-child(2) > span.LoginType",

      // fallback if worker doesn't send installUrl
      OAUTH_INSTALL_URL: "https://slack.ccwusa.org/install",
      DM_DEEPLINK_URL: "https://slack.ccwusa.org/dm_deeplink",

      CACHE_TTL_MS: 60 * 60 * 1000, // 1h
    };

    const ICON_IMG_DATA_URI =
      'data:image/jpeg;base64,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';

    // Make cache keys unique inside "big script"
    const CACHE_KEY = "CC_SLACK_DM__CSV_DUAL_MAPS";
    const CACHE_TS_KEY = "CC_SLACK_DM__CSV_DUAL_MAPS_TS";

    function normSpaces(s) {
      return String(s || "").replace(/\s+/g, " ").trim();
    }

    function gmGet(url, timeout = 15000) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "GET",
          url,
          timeout,
          onload: (r) =>
            resolve({
              status: r.status,
              text: r.responseText || "",
              headers: r.responseHeaders || "",
            }),
          onerror: (e) => reject({ type: "network_error", e }),
          ontimeout: () => reject({ type: "timeout" }),
        });
      });
    }

    function openSlackLegacy(url) {
      window.open(url, "_blank");
    }

    function openHttp(url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }

    function parseCSVLine(line) {
      const cols = [];
      let col = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === "," && !inQuotes) {
          cols.push(col);
          col = "";
        } else col += ch;
      }
      cols.push(col);

      return cols.map((c) => String(c || "").trim().replace(/^"|"$/g, ""));
    }

    function buildDualMaps(csv) {
      const lines = String(csv || "")
        .split(/\r?\n/)
        .filter((l) => l.trim().length);

      if (!lines.length) throw new Error("CSV empty");

      const header = parseCSVLine(lines[0]);

      const idxCrm = header.indexOf(CONFIG.COL_CRM_NICK);
      const idxLms = header.indexOf(CONFIG.COL_LMS_NAME);
      const idxSlack = header.indexOf(CONFIG.COL_SLACK_UID);

      if (idxCrm === -1 || idxLms === -1 || idxSlack === -1) {
        throw new Error(
          `CSV header mismatch. Need "${CONFIG.COL_CRM_NICK}", "${CONFIG.COL_LMS_NAME}", "${CONFIG.COL_SLACK_UID}". Got: ${header.join(" | ")}`
        );
      }

      const mapByCrmNick = Object.create(null);
      const mapByLmsName = Object.create(null);

      for (const line of lines.slice(1)) {
        const cols = parseCSVLine(line);
        const crmNick = (cols[idxCrm] || "").trim();
        const lmsName = (cols[idxLms] || "").trim();
        const slackUid = (cols[idxSlack] || "").trim();

        if (crmNick && slackUid) mapByCrmNick[crmNick] = slackUid;
        if (lmsName && slackUid) mapByLmsName[lmsName] = slackUid;
      }

      return { mapByCrmNick, mapByLmsName };
    }

    function getCrmNick() {
      const el = document.querySelector(CONFIG.CRM_NICK_SELECTOR);
      if (!el) return null;

      const raw = normSpaces(el.textContent || "");
      if (!raw) return null;

      return normSpaces(raw.split("|")[0]);
    }

    async function loadDualMaps(force = false) {
      const ts = GM_getValue(CACHE_TS_KEY, 0);
      const cached = GM_getValue(CACHE_KEY, null);

      if (!force && cached && Date.now() - ts < CONFIG.CACHE_TTL_MS) return cached;

      const res = await gmGet(CONFIG.SHEET_URL);
      const maps = buildDualMaps(res.text);

      GM_setValue(CACHE_KEY, maps);
      GM_setValue(CACHE_TS_KEY, Date.now());
      return maps;
    }

    async function fetchDeeplink(crmNick, agentSlackUid) {
      const apiUrl =
        `${CONFIG.DM_DEEPLINK_URL}` +
        `?login=${encodeURIComponent(crmNick)}` +
        `&agent=${encodeURIComponent(agentSlackUid)}`;

      const res = await gmGet(apiUrl, 20000);
      const text = normSpaces(res.text);

      try {
        const j = JSON.parse(res.text);
        return { kind: "json", status: res.status, body: j, rawText: text };
      } catch (e) {
        return { kind: "text", status: res.status, text };
      }
    }

    function showAuthHelp(msg, installUrl) {
      alert(msg);
      openHttp(installUrl || CONFIG.OAUTH_INSTALL_URL);
    }

    let clickLock = false;

    async function openDmToAgentByCellText(agentCellText) {
      if (clickLock) return;
      clickLock = true;
      setTimeout(() => (clickLock = false), 700);

      const crmNick = getCrmNick();
      if (!crmNick) {
        alert("CRM Nick not found (selector mismatch?)");
        return;
      }

      const { mapByLmsName } = await loadDualMaps(false);
      const agentLmsName = normSpaces(agentCellText || "");
      const agentSlackUid = mapByLmsName[agentLmsName];

      if (!agentSlackUid) {
        alert(`No Slack UID in CSV for agent "${agentLmsName}".`);
        return;
      }

      const resp = await fetchDeeplink(crmNick, agentSlackUid);

      if (resp.kind === "json") {
        const b = resp.body;

        if (b && b.ok === true && typeof b.url === "string") {
          if (b.type === "deeplink" && b.url.startsWith("slack://")) {
            openSlackLegacy(b.url);
            return;
          }
          if (b.type === "redirect" && b.url.startsWith("https://")) {
            openHttp(b.url);
            return;
          }
        }

        if (b && b.ok === false) {
          const message = b.message || "Slack authorization is required.";
          const installUrl = b.installUrl || CONFIG.OAUTH_INSTALL_URL;

          if (b.code === "not_authorized" || b.code === "token_revoked") {
            showAuthHelp(message, installUrl);
            return;
          }

          alert(message);
          console.warn("Worker error:", b);
          return;
        }

        alert("Unexpected response from Worker (JSON).");
        console.warn("Worker JSON:", b);
        return;
      }

      const link = resp.text;
      if (link.startsWith("slack://")) return void openSlackLegacy(link);
      if (link.startsWith("https://")) return void openHttp(link);

      alert(`Unexpected response from Worker: ${link}`);
      console.warn("Worker response:", link);
    }

    function createStyledIcon(agentName) {
      const icon = document.createElement("span");
      icon.innerHTML = `
        <img src="${ICON_IMG_DATA_URI}"
          width="16" height="16" style="
            vertical-align: middle;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.15s ease, transform 0.15s ease;
            margin-left: 4px;
            border: 1px solid rgba(0,0,0,0.15);
            border-radius: 4px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          ">
      `;

      icon.title = "DM in Slack";

      icon.addEventListener("mouseenter", () => {
        const img = icon.querySelector("img");
        if (!img) return;
        img.style.opacity = "1";
        img.style.transform = "scale(1.1)";
        img.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
      });

      icon.addEventListener("mouseleave", () => {
        const img = icon.querySelector("img");
        if (!img) return;
        img.style.opacity = "0.8";
        img.style.transform = "scale(1)";
        img.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
      });

      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        openDmToAgentByCellText(agentName).catch((err) => {
          console.error("openDmToAgentByCellText error:", err);
          alert("Error opening DM. See console.");
        });
      });

      return icon;
    }

    let scanScheduled = false;

    async function scanCells() {
      scanScheduled = false;

      const selectors =
        'div[id^="loan_"] table.ProfileSectionTable tbody tr:nth-child(4) td:nth-child(4), ' +
        'div[id^="loan_"] table.ProfileSectionTable tbody tr:nth-child(5) td:nth-child(4), ' +
        'div[id^="loan_"] table.ProfileSectionTable tbody tr:nth-child(6) td:nth-child(4)';

      const cells = Array.from(document.querySelectorAll(selectors));
      if (!cells.length) return;

      let maps;
      try {
        maps = await loadDualMaps(false);
      } catch (e) {
        console.error("CSV load failed:", e);
        return;
      }

      const mapByLmsName = maps.mapByLmsName || Object.create(null);

      for (const cell of cells) {
        if (cell.dataset.ccSlackDm === "1") continue;

        const agentText = normSpaces(cell.textContent || "");
        if (!agentText || agentText === "-") continue;

        if (!mapByLmsName[agentText]) continue;

        cell.appendChild(createStyledIcon(agentText));
        cell.dataset.ccSlackDm = "1";
      }
    }

    function scheduleScan() {
      if (scanScheduled) return;
      scanScheduled = true;
      setTimeout(() => scanCells().catch(console.error), 80);
    }

    function start() {
      // just in case this block is reused elsewhere
      if (!location.href.includes(CONFIG.enabledOn)) return;

      scheduleScan();
      new MutationObserver(scheduleScan).observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return {
      start,
      // optional debug hooks if you ever need them:
      _loadDualMaps: loadDualMaps,
      _getCrmNick: getCrmNick,
    };
  })();

  CC_SLACK_DM.start();
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
