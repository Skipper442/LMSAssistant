// ==UserScript==
// @name         LMS Assistant PRO for UW (GitHub)
// @namespace    http://tampermonkey.net/
// @author       Liam Moss and Jack Tyson
// @version      2.53
// @description  Extended version of "LMS Assistant". With additional modules and control panel
// @icon         https://raw.githubusercontent.com/Skipper442/CC-icon/main/Credit-cube-logo.png
// @match        https://apply.creditcube.com/*
// @updateURL    https://github.com/Skipper442/LMSAssistant/raw/refs/heads/main/LMSAssistant.user.js
// @downloadURL  https://github.com/Skipper442/LMSAssistant/raw/refs/heads/main/LMSAssistant.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      api.creditsense.ai
// @run-at       document-idle

// ==/UserScript==

(function () {
    'use strict';
// ===== Version Changelog Popup =====
    const CURRENT_VERSION = "2.53";

const changelog = [
  "🆕 NEW MODULE - Early Pay Bank module checker"

];


    const savedVersion = localStorage.getItem("lms_assistant_version");
    if (savedVersion !== CURRENT_VERSION) {
        showVersionPopup(CURRENT_VERSION, changelog);
        localStorage.setItem("lms_assistant_version", CURRENT_VERSION);
    }

    function showVersionPopup(version, changes) {
        const box = document.createElement("div");

        const header = document.createElement("h3");
        header.textContent = `🛠 LMS Assistant PRO (UW) — updated to version ${version}`;
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
    lmsAssistant: true,
    ibvButton: true,
    emailFilter: true,
    toggleRemarks: true,
    copyPaste: true,
    qcSearch: true,
    notifications: true,
    overpaidCheck: true,
    ibvShortener: true,
    remarkFilter: true,
    maxExposure: true,
    crmStatusCleaner: true,
    loyaltyRefi: true,
    earlyPayBank: true
};

const MODULE_LABELS = {
    lmsAssistant: 'LMS Assistant',
    ibvButton: 'IBV Button',
    emailFilter: 'Email Filter',
    toggleRemarks: 'Toggle All Remarks',
    copyPaste: 'Copy/Paste',
    qcSearch: 'QC Search',
    notifications: 'Notifications Sound BETA',
    overpaidCheck: 'Overpaid Check',
    ibvShortener: 'IBV Shortener',
    remarkFilter: 'Remark Filter',
    maxExposure: 'Max Exposure',
    crmStatusCleaner: 'Loan Status Cleaner',
    loyaltyRefi: 'Loyalty Points Calc',
    earlyPayBank: 'Early Pay Bank'
};



const MODULE_DESCRIPTIONS = {
    lmsAssistant: "Highlights states, manages call hours",
    ibvButton: "Adds a CRP button in LMS",
    emailFilter: "Filters the list of email templates",
    toggleRemarks: "Adds a 'Toggle All Remarks' button",
    copyPaste: "Adds phone/email copy buttons",
    qcSearch: "QC Search — quick phone-based lookup",
    notifications: "Enables sound and notifications for the tab",
    overpaidCheck: "Checks overpaid status and options for potential refinance",
    ibvShortener: "Allows to shorten IBV/ESIG links and insert into TXT preview",
    remarkFilter: "Hides unnecessary loan remarks, keeps only critical ones",
    maxExposure: 'Adds button to allow you calculate Max Exposure directly in LMS ',
    crmStatusCleaner: 'Reduces the list of loan statuses',
    loyaltyRefi: 'Tracks refinance, adjusts loyalty points',
    earlyPayBank: "Warns when customer’s primary bank is probably an early pay bank"
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
    if (!helpMenuItem) {

        console.warn('HELP menu item not found — cannot insert LMS Assistant PRO');
        return;
    }


    const newMenuItem = document.createElement('td');
    newMenuItem.id = "TopMenu-menuItemLMS";
    newMenuItem.innerHTML = '&nbsp;🛠️ LMS Assistant PRO (UW)&nbsp;';
    Object.assign(newMenuItem.style, {
        color: 'white',
        cursor: 'pointer',
        padding: '0 10px',
        height: '30px',
        lineHeight: '30px',
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '12px',
        textShadow: '1px 1px #000',
        textTransform: 'uppercase'
    });
helpMenuItem.parentNode.insertBefore(newMenuItem, helpMenuItem.nextSibling);
    // 2. Creating dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'lmsDropdownMenu';
    dropdown.style.display = 'none';
    dropdown.style.position = 'absolute';
    dropdown.style.width = '260px';
    dropdown.style.borderCollapse = 'collapse';
    dropdown.style.fontFamily = '"Segoe UI", Arial, sans-serif';
    dropdown.style.fontSize = '11px';
    dropdown.style.textTransform = 'uppercase';
    dropdown.style.textAlign = 'left';
    dropdown.style.textShadow = '1px 1px #000';
    dropdown.style.color = 'white';
    dropdown.style.backgroundImage = 'url(Images/submenu-back.png)';
    dropdown.style.backgroundRepeat = 'repeat-x';
    dropdown.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
    dropdown.style.border = 'none';
    dropdown.style.zIndex = '9999';
    dropdown.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';


    const style = document.createElement('style');
    style.textContent = `
.lms-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 18px;
  margin-left: 10px;
}
.lms-switch input { display: none; }
.lms-slider {
  position: absolute;
  cursor: pointer;
  top: 0; left: 0;
  right: 0; bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 34px;
}
.lms-slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}
.lms-switch input:checked + .lms-slider {
  background-color: #4CAF50; /* Зелений колір */
}
.lms-switch input:checked + .lms-slider:before {
  transform: translateX(18px);
}
`;
    document.head.appendChild(style);


    Object.keys(MODULES).forEach(key => {
        const wrapper = document.createElement('div');
        Object.assign(wrapper.style, {
            boxSizing: 'border-box',
            width: '100%',
            height: '40px',
            padding: '1px 3px 1px 20px',
            fontFamily: '"Segoe UI", Arial, sans-serif',
            fontSize: '11px',
            textTransform: 'uppercase',
            textAlign: 'left',
            textShadow: '1px 1px #000',
            backgroundImage: 'url(Images/submenu-back.png)',
            backgroundRepeat: 'repeat-x',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'all 0.2s ease'
        });


        const nameContainer = document.createElement('div');
        nameContainer.style.display = 'flex';
        nameContainer.style.alignItems = 'center';

        // Module names
        const moduleName = document.createElement('span');
        moduleName.textContent = MODULE_LABELS[key];

        // Info icon (for MODULE_DESCRIPTIONS)
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

        // Hover (wrapper)
        wrapper.addEventListener('mouseover', () => {
            wrapper.style.backgroundColor = 'rgb(175, 209, 255)';
            wrapper.style.color = 'black';
            wrapper.style.textShadow = '1px 1px white';
            newMenuItem.style.backgroundColor = 'rgb(175, 209, 255)';
            newMenuItem.style.color = 'black';
            newMenuItem.style.textShadow = '1px 1px white';

            helpIcon.style.filter = 'none';
        });
        wrapper.addEventListener('mouseout', () => {
            wrapper.style.backgroundColor = 'transparent';
            wrapper.style.color = 'white';
            wrapper.style.textShadow = '1px 1px black';
            newMenuItem.style.backgroundColor = '';
            newMenuItem.style.color = 'white';
            newMenuItem.style.textShadow = '1px 1px black';

            helpIcon.style.filter = 'invert(1)';
        });

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

        wrapper.appendChild(nameContainer);
        wrapper.appendChild(toggle);

        dropdown.appendChild(wrapper);
    });

    const ideasWrapper = document.createElement('div');
    Object.assign(ideasWrapper.style, {
        boxSizing: 'border-box',
        width: '100%',
        height: '40px',
        padding: '1px 3px 1px 20px',
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '11px',
        textTransform: 'uppercase',
        textAlign: 'left',
        textShadow: '1px 1px #000',
        backgroundImage: 'url(Images/submenu-back.png)',
        backgroundRepeat: 'repeat-x',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s ease'
    });
    ideasWrapper.textContent = 'New Ideas / Bug Report';

    ideasWrapper.addEventListener('mouseover', () => {
        ideasWrapper.style.backgroundColor = 'rgb(175, 209, 255)';
        ideasWrapper.style.color = 'black';
        ideasWrapper.style.textShadow = '1px 1px white';
        newMenuItem.style.backgroundColor = 'rgb(175, 209, 255)';
        newMenuItem.style.color = 'black';
        newMenuItem.style.textShadow = '1px 1px white';
    });
    ideasWrapper.addEventListener('mouseout', () => {
        ideasWrapper.style.backgroundColor = 'transparent';
        ideasWrapper.style.color = 'white';
        ideasWrapper.style.textShadow = '1px 1px black';
        newMenuItem.style.backgroundColor = '';
        newMenuItem.style.color = 'white';
        newMenuItem.style.textShadow = '1px 1px black';
    });

    // Google Form (URL)
    ideasWrapper.addEventListener('click', () => {
        window.open('https://forms.gle/esmUuaVD9oxCh7mz7');
    });

    dropdown.appendChild(ideasWrapper);


    document.body.appendChild(dropdown);
    helpMenuItem.parentNode.appendChild(newMenuItem);

    // Hover for LMS Assistant PRO (header menu)
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


/*** ============ LMS Assistant (always enabled, not in menu) ============ ***/
if (MODULES.lmsAssistant) {
    const callHours = { start: '07:00:00', end: '20:00:00' };
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

    function showStyledPopup(title, items, noIcon = false) {
        const box = document.createElement("div");

        const header = document.createElement("h3");
        header.innerHTML = noIcon ? `${title}` : `<span style="color: red;">📌</span> ${title}`;
        header.style.marginBottom = "10px";

        const text = document.createElement("div");
        text.innerHTML = items.map(txt => `• ${txt}`).join("<br>");
        text.style.textAlign = "left";

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "OK";
        Object.assign(closeBtn.style, {
            marginTop: "10px",
            padding: "4px 12px",
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

        box.appendChild(header);
        box.appendChild(text);
        box.appendChild(closeBtn);
        document.body.appendChild(box);
    }

    if (location.href.includes('CustomerDetails.aspx?')) {
        togglepin();

        const observer = new MutationObserver(() => {
            const custCell = document.querySelector('#ContactSection .ProfileSectionTable tbody tr:nth-child(2) td:nth-child(4)');
            const cellPhone = document.querySelector('#ctl00_Span_CellPhone strong');
            const homePhone = document.querySelector('#ctl00_Span_HomePhone strong');

            if (!custCell || !cellPhone || !homePhone) return;

            const custState = custCell.textContent.trim().substring(0, 2);
            const unsupportedStates = ['GA', 'VA', 'PA', 'IL'];
            if (unsupportedStates.includes(custState)) {
                showStyledPopup("Unsupported State", [`Customer from ${custState}. Reloan not allowed.`], true);
            }

            [cellPhone, homePhone].forEach(phone => {
                phone.style.fontWeight = '800';
                phone.style.color = isCallable(custState) ? 'green' : 'red';
            });

            observer.disconnect();
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


    /*** ============ IBV Button Injector ============ ***/
if (MODULES.ibvButton && location.href.includes('CustomerDetails')) {
    const getLoginName = (id, type = 'Yodlee') => {
        let url;
        if (type === 'Yodlee') {
            url = `https://apply.creditcube.com/plm.net/customers/reports/YodleeReport.aspx?mode=json&savedinstantbankverificationreportid=${id}`;
        } else if (type === 'Chirp') {
            url = `https://apply.creditcube.com/plm.net/customers/reports/ChirpReport.aspx?mode=json&savedinstantbankverificationreportid=${id}`;
        }

        return fetch(url)
            .then(res => res.json())
            .then(data => {
                if (type === 'Yodlee') return data?.userData?.[0]?.user?.loginName;
                if (type === 'Chirp') return data?.RequestCode;
            });
    };

    const createButton = (onClickHandler, id) => {
        const btn = document.createElement('input');
        btn.type = 'button';
        btn.id = id;
        btn.value = 'Open in CRP';
        Object.assign(btn.style, {
            padding: '4px',
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fontSize: '12px',
            border: '1px solid #2e9fd8',
            background: '#2e9fd8 url(Images/global-button-back.png) left top repeat-x',
            color: '#DFDFDF',
            cursor: 'pointer',
            marginLeft: '5px'
        });
        btn.onclick = onClickHandler;
        return btn;
    };

    const waitForIBVButton = () => {
        const jsonBtn = document.querySelector('input[value="Show JSON"]');

        // Yodlee 
        const yodleeSelect = document.getElementById('maincontent_ReportBarControl_YodleeIbvReports');
        if (jsonBtn && yodleeSelect && !document.getElementById('openInCrpBtn')) {
            const btn = createButton(async () => {
                const selectedId = yodleeSelect?.value;
                if (!selectedId) return alert('Select a Yodlee report.');
                const loginName = await getLoginName(selectedId, 'Yodlee');
                if (loginName) {
                    const crpLink = `https://ibv.creditsense.ai/report/Yodlee/${loginName}`;
                    window.open(crpLink, '_blank');
                } else alert('loginName not found.');
            }, 'openInCrpBtn');
            jsonBtn.after(btn);
        }

        // Chirp (LendMate)
        const lendmateBtn = document.querySelector('#maincontent_ReportBarControl_Holder_LendMateIbvReportControls > span > span.LendMateIbvSpan.reportSpan.nowrap > input[type=button]:nth-child(2)');
        if (lendmateBtn && !document.getElementById('openInCrpBtn_LendMate')) {
            const chirpSelect = document.getElementById('maincontent_ReportBarControl_LendMateIbvReports');
            const btn = createButton(async () => {
                const selectedId = chirpSelect?.value;
                if (!selectedId) return alert('Select a Chirp report.');
                const requestCode = await getLoginName(selectedId, 'Chirp');
                if (requestCode) {
                    const crpLink = `https://ibv.creditsense.ai/report/Chirp/${requestCode}`;
                    window.open(crpLink, '_blank');
                } else alert('RequestCode not found.');
            }, 'openInCrpBtn_LendMate');
            lendmateBtn.after(btn);
        }

        if (!jsonBtn || (!yodleeSelect && !lendmateBtn)) {
            setTimeout(waitForIBVButton, 500);
        }
    };

    waitForIBVButton();
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
            sendButton.parentElement.insertBefore(panel, sendButton.nextSibling?.nextSibling || null);
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


    /*** ============ Toggle All Remarks ============ ***/

    if (MODULES.toggleRemarks && location.href.includes('LoanRemarks.aspx')) {
        let allChecked = false;

        function simulateUserClick(element) {
            if (!element) return;
            element.focus();
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        }

        function toggleAllRemarks() {
            allChecked = !allChecked;
            document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
                if (checkbox.checked !== allChecked) simulateUserClick(checkbox);
            });
        }

        function addToggleButton() {
            const updateButton = document.querySelector("input#maincontent_Btn_Update");
            if (!updateButton) return;

            const button = document.createElement("button");
            button.innerText = "Toggle all remarks";
            Object.assign(button.style, {
                padding: "4px", fontFamily: "Arial", fontWeight: "bold", fontSize: "12px",
                border: "1px solid #2e9fd8", background: "#2e9fd8 url(Images/global-button-back.png) left top repeat-x",
                color: "#DFDFDF", cursor: "pointer", marginRight: "10px"
            });

            button.onclick = (event) => {
                event.preventDefault();
                toggleAllRemarks();
            };

            updateButton.parentNode.insertBefore(button, updateButton);
        }

        addToggleButton();
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
            var phoneNumber = "211" + usPhoneNumbers[0];
            navigator.clipboard.writeText(phoneNumber)
              .then(() => {
                console.log("Copied: " + phoneNumber);
              })
              .catch(err => console.error("Failed to copy:", err));

        } else {
            // Якщо знайдено 2 і більше номерів
            var phoneNumber2 = "211" + usPhoneNumbers[1];
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
            targetInputs[0].value = inputValue.substring(1, 4);
            targetInputs[1].value = inputValue.substring(4, 7);
            targetInputs[2].value = inputValue.substring(7);
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
/*** ============ Remark Filter ============ ***/
if (MODULES.remarkFilter && location.href.includes('CustomerDetails')) {
    const waitForRemarkBlock = () => {
        const remarkDiv = document.querySelector('[id^="ctl00_LoansRepeater_Div_ApprovalIssues_"]');
        if (!remarkDiv) {
            requestAnimationFrame(waitForRemarkBlock);
            return;
        }

        const hiddenPhrases = [
            'Loan remark "Personal Info Verification"',
            'Loan remark "Bank account # and ABA verified"',
            'Loan remark "T&C Read and Agreed"',
            'Loan remark "Minimum Amount The Customer Agrees To"',
            'Loan remark "All Accounts checked on DL"',
            'Loan remark "Loan Type Matches Cust Loyalty Status"',
            'Loan remark "Loan Amount Fixed"',
            'Loan remark "Promotion Code"'
        ];

        const listItems = remarkDiv.querySelectorAll("ul li");
        listItems.forEach(li => {
            const text = li.textContent.trim();
            const shouldHide = hiddenPhrases.some(phrase => text.includes(phrase));
            if (shouldHide) {
                li.style.display = "none";
            }
        });
    };

    const observer = new MutationObserver(waitForRemarkBlock);
    observer.observe(document.body, { childList: true, subtree: true });
}

/*** ============ IBV Shortener ============ ***/
if (MODULES.ibvShortener && location.href.includes("PreviewLetter.aspx")) {
  const changelog = [
    "🆕 To increase TXT delivery and reduce their blocking by providers, we added IBV Shortener module (only for TXT with Full Token)",
    "✂️ Allows shortening of manual IBV/ESIG links directly in LMS",
    "✅ Inserts short link into txt with one click"
  ];

  const params = new URL(document.location.href).searchParams;
  const action = params.get("action");
  const mode = params.get("mode");
  const letterId = params.get("letterid");
  const allowedIds = ["120", "139", "620"];
  const GRAPHQL_ENDPOINT = 'https://api.creditsense.ai/';
  const SHORTENER_DOMAIN = 'tap.cy';
  const apiKey = '845112af-3685-4cd1-b82b-e2adfc24eb1e';

  if (action === "textmessage" && mode === "preview" && allowedIds.includes(letterId)) {
    const parseLMSDateFromCDT = (dateStr) => {
      const [datePart, timePart, ampm] = dateStr.trim().split(/\s+/);
      const [month, day, year] = datePart.split("/").map(Number);
      let [hour, minute, second] = timePart.split(":").map(Number);
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
      return new Date(Date.UTC(year, month - 1, day, hour + 5, minute, second));
    };

    const shortenUI = document.createElement("div");
    shortenUI.style.cssText = `
      background:#fff; padding:12px; border:2px solid green; border-radius:10px;
      box-shadow:0 0 10px rgba(0,0,0,0.2); margin-bottom:15px; margin-top:15px;
      font-family:Arial,sans-serif; min-width:400px;`;

    shortenUI.innerHTML = `
      <b>Shorten IBV Link</b><br>
      <textarea id="linkInput" style="width:100%; height:80px; margin-top:5px; font-family:monospace;"></textarea><br>
      <div style="margin-top:5px; display:flex; gap:10px; flex-wrap:wrap;">
        <button type="button" id="fetchIBV" style="flex:1;">Find latest IBV link</button>
        <button type="button" id="fetchESIG" style="flex:1;">Find latest E-Sign link</button>
        <button type="button" id="fetchSHORT" style="flex:1;">Find latest Shortened link</button>
        <button type="button" id="shortenBtn" style="flex:1;">Shorten</button>
      </div>
      <div id="shortenResult" style="margin-top:10px; font-family:monospace"></div>
    `;

    const insertAfter = (newNode, referenceNode) => {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };

    const waitForButtonAndInject = () => {
      const sendBtn = document.getElementById("maincontent_TextMessageButton");
      if (!sendBtn) return setTimeout(waitForButtonAndInject, 300);
      insertAfter(shortenUI, sendBtn);

      const renderShortLinkUI = (shortUrl) => {
        const result = document.getElementById("shortenResult");
        result.innerHTML = `✅ <a href="${shortUrl}" target="_blank">${shortUrl}</a> <button type="button" id="copyShort">Insert to txt</button>`;

        document.getElementById("copyShort").onclick = () => {
          if (typeof GM_setClipboard !== 'undefined') {
            GM_setClipboard(shortUrl);
          } else {
            navigator.clipboard.writeText(shortUrl);
          }

          const textarea = document.getElementById("maincontent_TextAreaPlain");
          if (textarea) {
            const pattern = /https:\/\/creditcube\.com\/(ibv|esig)\?t=([a-zA-Z0-9]+|\[token_aes_cbc\])/;
            const match = textarea.value.match(pattern);
            if (match) {
              textarea.value = textarea.value.replace(pattern, shortUrl);
              textarea.style.color = 'green';
              setTimeout(() => { textarea.style.color = ''; }, 2200);
            }
          }
        };
      };

      const fetchFromNotes = async (type) => {
        const customerIdMatch = location.href.match(/customerid=(\d+)/);
        if (!customerIdMatch) return alert("❌ CustomerID not found in URL");

        const customerId = customerIdMatch[1];
        const res = await fetch(`/plm.net/customers/CustomerNotes.aspx?customerid=${customerId}&isnosection=true`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const rows = Array.from(doc.querySelectorAll("table.DataTable tbody tr"));

        const REGEX = type === "IBV"
          ? /https:\/\/creditcube\.com\/ibv\?t=[a-zA-Z0-9]+/
          : type === "eSig"
            ? /https:\/\/creditcube\.com\/esig\?t=[a-zA-Z0-9]+/
            : /https:\/\/tap\.cy\/[a-zA-Z0-9]{6,}/;

        let found = null;
        for (let i = rows.length - 1; i >= 0; i--) {
          const cells = rows[i].querySelectorAll("td");
          if (cells.length < 3) continue;
          const dateStr = cells[0].textContent.trim();
          const noteText = cells[2].textContent;
          const match = noteText.match(REGEX);
          if (match) {
            const parsed = parseLMSDateFromCDT(dateStr);
            const now = new Date();
            const ageDays = (now - parsed) / (1000 * 60 * 60 * 24);
            if (ageDays <= 5) {
              found = { link: match[0], dateStr };
              break;
            }
          }
        }

        if (!found) {
          alert("❌ There are no fresh links to shorten (last 5 days). Please send the Full Token link yourself first.");
          return;
        }

        const parsed = parseLMSDateFromCDT(found.dateStr);
        const now = new Date();
        const diffMs = now - parsed;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: "America/Chicago",
          timeZoneName: "short",
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        }).format(parsed);

        const input = document.getElementById("linkInput");
        input.value = `Found ${type}: ${formatted} (${days} days and ${hours} hours ago)\n${found.link}`;
        input.style.border = "2px solid green";
        setTimeout(() => { input.style.border = ""; }, 2000);

        const shortenBtn = document.getElementById("shortenBtn");
        if (type === "Shorten") {
          shortenBtn.disabled = true;
          shortenBtn.textContent = "🔒 Already Shortened";
          renderShortLinkUI(found.link);
        } else {
          shortenBtn.disabled = false;
          shortenBtn.textContent = "Shorten";
        }
      };

      document.getElementById("fetchIBV").onclick = () => fetchFromNotes("IBV");
      document.getElementById("fetchESIG").onclick = () => fetchFromNotes("eSig");
      document.getElementById("fetchSHORT").onclick = () => fetchFromNotes("Shorten");

      document.getElementById("shortenBtn").onclick = async function () {
        const input = document.getElementById("linkInput").value.trim();
        const result = document.getElementById("shortenResult");

        const urlMatch = input.match(/https:\/\/creditcube\.com\/(ibv|esig)\?t=[a-zA-Z0-9]+/);
        if (!urlMatch) {
          result.innerHTML = `<span style='color:red'>❌ Error: No valid link found</span>`;
          return;
        }

        const url = urlMatch[0];
        result.textContent = "⏳ Shortening...";

        try {
          const r = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
            },
            body: JSON.stringify({
              query: `mutation ShortURL($url: String!, $domain: String!) {
                shortUrl(input: { url: $url, domain: $domain }) }`,
              variables: { url, domain: SHORTENER_DOMAIN }
            })
          });

          const json = await r.json();
          const txt = json?.data?.shortUrl;

          if (!r.ok || !txt?.startsWith("http")) {
            throw new Error("❌ Invalid or empty response: " + JSON.stringify(json));
          }

          renderShortLinkUI(txt);
        } catch (e) {
          result.innerHTML = `❌ Error: ${e.message}`;
        }
      };
    };

    waitForButtonAndInject();
  }
}


/*** ============ Max Exposure (always rightmost among left actions) ============ ***/

if (MODULES.maxExposure && location.href.includes('CustomerDetails.aspx')) {
  const API_URL = 'https://api.creditsense.ai/';
  const API_KEY = '845112af-3685-4cd1-b82b-e2adfc24eb1e';
  const DECIMALS = 2;
  const THRESHOLD = 100;

  const BTN_STYLE = `
    border-spacing:0;
    text-decoration:none;
    padding:4px;
    margin-left:6px;
    margin-top:3px;
    font-family:Arial, Helvetica, sans-serif;
    font-weight:bold;
    font-size:12px;
    border:1px solid #2e9fd8;
    background:#2e9fd8 url(Images/global-button-back.png) left top repeat-x !important;
    color:#DFDFDF !important;
    cursor:pointer;
    display:inline-block;
  `;
  const BTN_HOVER = `
    background:#3eb0ff url(Images/global-button-back.png) left top repeat-x !important;
    color:#fff !important;
  `;
  const BADGE_BASE = `
    display:inline-block; margin-left:8px; padding:2px 8px;
    font-family:Arial, Helvetica, sans-serif; font-weight:800; font-size:12px;
    border:1px solid; border-radius:12px; cursor:pointer;
  `;
  const BADGE_OK = { color:'#14833b', bg:'#e9fff0', border:'#bde0c8' };
  const BADGE_ERR = { color:'#b00', bg:'#fdecea', border:'#f5c6cb' };
  const BADGE_WARN= { color:'#b00020', bg:'#ffe9e9', border:'#ffc7c7' };

  const QUERY = `
    query MaxExposureQuery($customerId: ID!) {
      creditExposure(customerId: $customerId) { allowedAmount }
    }`;

  const safeJson = (t) => { try { return t ? JSON.parse(t) : null; } catch { return null; } };
  const getCustomerIdFromUrl = () => (location.href.match(/[?&]customerid=(\d+)/i) || [])[1] || '';

  function gql(variables) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: API_URL,
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        data: JSON.stringify({ query: QUERY, variables, operationName: 'MaxExposureQuery' }),
        onload: (res) => {
          const text = res.responseText || '';
          const json = safeJson(text);
          const ok = res.status >= 200 && res.status < 300 && json && !json.errors;
          if (ok) resolve(json.data); else reject(json?.errors?.[0] || { status: res.status, body: text });
        },
        onerror: (e) => reject(e)
      });
    });
  }


  function getButtonsRow() {

    let a = document.querySelector('#ctl00_LoansRepeater_Btn_ChangePendingDetails_0');
    if (a && a.parentElement) return a.parentElement;


    a = document.querySelector('#ctl00_LoansRepeater_Btn_ReviewAndUpdateCustomerInfo_0');
    if (a && a.parentElement) return a.parentElement;


    a = document.querySelector('#ctl00_LoansRepeater_Btn_Preview_0, #ctl00_LoansRepeater_Btn_Send_0');
    if (a && a.parentElement) return a.parentElement;


    a = document.querySelector('#ctl00_LoansRepeater_Btn_ExpressLoan_0');
    if (a && a.parentElement) return a.parentElement;


    const tdWithButtons = Array.from(document.querySelectorAll('td')).find(td =>
      td.querySelector('input[type="button"]')
    );
    return tdWithButtons || null;
  }


  function getOrCreateControls(row) {
    let btn = row.querySelector('a[data-mx-btn="1"]');
    let badge = row.querySelector('span[data-mx-badge="1"]');

    if (!btn) {
      btn = document.createElement('a');
      btn.href = 'javascript:void(0)';
      btn.textContent = 'Max Exposure';
      btn.setAttribute('role', 'button');
      btn.dataset.mxBtn = '1';
      btn.style.cssText = BTN_STYLE;
      btn.title = 'Fetch allowedAmount';
      btn.addEventListener('mouseenter', () => { btn.style.cssText = BTN_STYLE + BTN_HOVER; });
      btn.addEventListener('mouseleave', () => { btn.style.cssText = BTN_STYLE; });
      row.appendChild(btn);
    }
    if (!badge) {
      badge = document.createElement('span');
      badge.dataset.mxBadge = '1';
      badge.title = 'Click to copy';
      badge.style.cssText = BADGE_BASE;
      badge.style.display = 'none';
      applyBadgeTheme(badge, BADGE_OK);
      row.appendChild(badge);
    }
    return { btn, badge };
  }


  function placeAtRowEnd(row, btn, badge) {
    const rightBlocks = Array.from(row.querySelectorAll('span[style*="float: right"]'));
    const insertBeforeNode = rightBlocks.length ? rightBlocks[0] : null;


    if (insertBeforeNode) {
      if (badge.nextSibling !== insertBeforeNode) row.insertBefore(badge, insertBeforeNode);
      if (btn.nextSibling !== badge) row.insertBefore(btn, badge);
    } else {
      if (badge !== row.lastElementChild) row.appendChild(badge);
      if (btn !== badge.previousElementSibling) row.insertBefore(btn, badge);
    }
  }

  function applyBadgeTheme(el, theme) {
    el.style.color = theme.color;
    el.style.background = theme.bg;
    el.style.borderColor = theme.border;
  }

  function ensureButton() {
    const row = getButtonsRow();
    if (!row) return false;

    const { btn, badge } = getOrCreateControls(row);
    placeAtRowEnd(row, btn, badge);

    if (!badge.textContent || badge.textContent === '') badge.textContent = '—';

    const customerId = getCustomerIdFromUrl();

    btn.onclick = async () => {
      if (!customerId) {
        badge.style.display = 'inline-block';
        badge.textContent = 'No ID';
        applyBadgeTheme(badge, BADGE_ERR);
        return;
      }
      badge.style.display = 'inline-block';
      badge.textContent = '…';
      badge.style.color = '#0070f3';
      badge.style.background = '#eef4ff';
      badge.style.borderColor = '#c6d8ff';

      try {
        const data = await gql({ customerId });
        const allowed = data?.creditExposure?.allowedAmount;
        if (allowed != null && !Number.isNaN(+allowed)) {
          const val = +allowed;
          badge.textContent = `$${val.toFixed(DECIMALS)}`;
          applyBadgeTheme(badge, val < THRESHOLD ? BADGE_WARN : BADGE_OK);
        } else {
          badge.textContent = '—';
          applyBadgeTheme(badge, BADGE_ERR);
        }
      } catch {
        badge.textContent = 'Error';
        applyBadgeTheme(badge, BADGE_ERR);
      }
    };

    badge.onclick = () => {
      const txt = badge.textContent.startsWith('$') ? badge.textContent.slice(1) : badge.textContent;
      if (!txt || txt === '—' || txt === 'Error' || txt === 'No ID' || txt === '…') return;
      try {
        if (typeof GM_setClipboard !== 'undefined') GM_setClipboard(txt);
        else navigator.clipboard.writeText(txt);
        const oldBg = badge.style.background;
        badge.style.background = '#d1ffe0';
        setTimeout(() => { badge.style.background = oldBg; }, 600);
      } catch {}
    };

    return true;
  }

  (function initMaxExposureAdaptive() {
    ensureButton();
    const obs = new MutationObserver(() => { ensureButton(); });
    obs.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('beforeunload', () => obs.disconnect());
  })();
}


/*** ============ CRM Status Cleaner (module) — UW ============ ***/
if (MODULES.crmStatusCleaner && location.href.includes('EditStatus.aspx')) {

  // Конфіг whitelist для UW
  const RAW_ALLOWED = [
    'Never Answered',
    'TBW',
    'Pending Approval',
    'GFA',
    'UW',
    'Validated',
    'Cool Off Manual',
    'Suspected Fraud',
    'FRAUD!',
    'For Review',
    'Do Not Loan',
    'AIR: Bank information mismatch',
    'AIR: Account holder mismatch',
    'AIR: Need screenshot of last DDs',
    'AIR: Clarify pay frequency'
  ];
  const normalize = (s) => (s || '').toString().replace(/\u00A0/g, ' ').trim().toLowerCase();
  const ALLOWED = new Set(RAW_ALLOWED.map(normalize));

  // Ключі/ID
  const LS_MODE = 'crmBackOfficeMode'; // 'on' | 'off'
  const COMPACT_ID = 'crmStatusCompactList';
  const TOGGLER_ID = 'crmBackOfficeToggle';

  // Guard та Observer
  let working = false;
  let domObserver = null;

  // Стилі
  (function injectStyles() {
    if (document.getElementById('crmStatusCleanerStyles')) return;
    const st = document.createElement('style');
    st.id = 'crmStatusCleanerStyles';
    st.textContent = `
      #${COMPACT_ID} {
        margin-top: 8px; padding: 8px 10px; border: 1px solid #dfeaf5; border-radius: 6px;
        background: #f7fbff; max-width: 620px;
      }
      #${COMPACT_ID} .stack { display: grid; grid-auto-rows: minmax(20px, auto); row-gap: 6px; }
      #${COMPACT_ID} .itm { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
      #${COMPACT_ID} .itm input { margin: 0; }
      #${COMPACT_ID} .itm label { margin: 0; font: 12px/1.2 Arial, sans-serif; cursor: pointer; }
      #${COMPACT_ID} .labelTitle { font: bold 12px Arial, sans-serif; color:#345; margin-bottom:6px; }
      #${TOGGLER_ID} {
        position: fixed; right: 14px; top: 14px; z-index: 2147483647;
        font: 12px/1 Arial, sans-serif; padding: 4px 10px; cursor: pointer;
        border: 1px solid #2e9fd8; color: #DFDFDF; font-weight: bold;
        background: #2e9fd8 url(Images/global-button-back.png) repeat-x; border-radius: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,.15);
      }
      #${TOGGLER_ID} .state { font-weight: 800; margin-left: 6px; }
    `;
    document.head.appendChild(st);
  })();

  function findStatusContainer() {
    const tds = Array.from(document.querySelectorAll('td'));
    for (const td of tds) {
      const labels = td.querySelectorAll('label[for]');
      const inputs = td.querySelectorAll('input[type="checkbox"]');
      if (labels.length >= 5 && inputs.length >= 5) return td;
    }
    return null;
  }

  function collectPairs(scopeEl) {
    const res = [];
    const labels = Array.from(scopeEl.querySelectorAll('label[for]'));
    for (const lbl of labels) {
      const id = lbl.getAttribute('for');
      const input = id ? document.getElementById(id) : null;
      if (!input) continue;
      const text = (lbl.textContent || '').replace(/\u00A0/g, ' ').trim();
      res.push({ input, text, key: normalize(text), disabled: input.disabled, checked: input.checked, label: lbl });
    }
    return res;
  }

  // Побудова компактного списку
  function buildList(container, title, items) {
    container.innerHTML = '';
    const t = document.createElement('div');
    t.className = 'labelTitle';
    t.textContent = title;
    const list = document.createElement('div');
    list.className = 'stack';
    container.appendChild(t);
    container.appendChild(list);

    for (const it of items) {
      const row = document.createElement('div');
      row.className = 'itm';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = it.checked;
      cb.disabled = it.disabled;
      const lb = document.createElement('label');
      lb.textContent = it.text;
      lb.addEventListener('click', () => cb.click());

      cb.addEventListener('change', () => {
        it.input.click(); // тригеримо нативні обробники CRM
        cb.checked = it.input.checked;
      });

      row.appendChild(cb);
      row.appendChild(lb);
      list.appendChild(row);
    }
  }

  function ensureToggler(mode, onToggle) {
    let btn = document.getElementById(TOGGLER_ID);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = TOGGLER_ID;
      document.body.appendChild(btn);
    }
    const render = () => { btn.innerHTML = `UW mode: <span class="state">${mode === 'on' ? 'On' : 'Off'}</span>`; };
    render();
    btn.onclick = async () => {
      if (working) return;
      working = true;
      try {
        mode = mode === 'on' ? 'off' : 'on';
        localStorage.setItem(LS_MODE, mode);
        render();
        await onToggle(mode);
      } finally {
        working = false;
      }
    };
  }

  async function enableBackOffice(scopeEl) {
    if (!scopeEl) return;
    if (document.getElementById(COMPACT_ID) && scopeEl.style.display === 'none') return;

    scopeEl.style.display = 'none';

    let compact = document.getElementById(COMPACT_ID);
    if (!compact) {
      compact = document.createElement('div'); compact.id = COMPACT_ID;
      scopeEl.parentElement.insertAdjacentElement('afterend', compact);
    }

    const pairs = collectPairs(scopeEl);
    const allowedItems = pairs.filter(p => ALLOWED.has(p.key));
    buildList(compact, 'Selected statuses', allowedItems);
  }

  async function disableBackOffice(scopeEl) {
    if (!scopeEl) return;
    if (!document.getElementById(COMPACT_ID) && scopeEl.style.display !== 'none') return;

    document.getElementById(COMPACT_ID)?.remove();
    scopeEl.style.display = '';
  }

  function setupObserver(getMode) {
    if (domObserver) return;
    domObserver = new MutationObserver(() => {
      if (working) return;
      const scope = findStatusContainer();
      if (!scope) return;
      const mode = getMode();
      if (mode === 'on') {
        enableBackOffice(scope);
      } else {
        disableBackOffice(scope);
      }
    });
    domObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('beforeunload', () => domObserver && domObserver.disconnect());
  }

  (async function initCrmStatusCleaner() {
    const scope = findStatusContainer();
    if (!scope) return;

    let mode = localStorage.getItem(LS_MODE) || 'on';
    const getMode = () => (localStorage.getItem(LS_MODE) || 'on');

    if (mode === 'on') await enableBackOffice(scope); else await disableBackOffice(scope);

    ensureToggler(mode, async (m) => {
      const s = findStatusContainer();
      if (!s) return;
      if (m === 'on') await enableBackOffice(s); else await disableBackOffice(s);
    });

    setupObserver(getMode);
  })();
}

/*** ============ Early Pay Bank Detector ============ ***/
if (MODULES.earlyPayBank && location.href.includes('CustomerDetails.aspx')) {
    (function () {
        'use strict';

        const DANGEROUS_BANKS = [
            'HUNTINGTON',
            'REGIONS',
            'CITIZENS',
            'DISCOVER',
            'NAVY FEDERAL',
            'FIFTH',
            'CREDIT UNION',
            ' CU ',
            ' FCU',
            'C U',
            'C/U'
        ];

        const CONFIG = {
            primaryBankSelector: '#BankSection > table:nth-child(4) > tbody > tr:nth-child(2) > td:nth-child(2)'
        };

        let lastDangerousName = null; // remembers last dangerous bank text

        function showStyledPopup(title, items, noIcon = false) {
            const box = document.createElement('div');

            const header = document.createElement('h3');
            header.innerHTML = noIcon ? title : `<span style="color: red;">📌</span> ${title}`;
            header.style.marginBottom = '10px';

            const text = document.createElement('div');
            text.innerHTML = items.map(txt => `• ${txt}`).join('<br>');
            text.style.textAlign = 'left';

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'OK';
            Object.assign(closeBtn.style, {
                marginTop: '10px',
                padding: '4px 12px',
                border: '1px solid #a27c33',
                borderRadius: '4px',
                background: '#5c4400',
                backgroundImage: 'url(Images/global-button-back.png)',
                backgroundRepeat: 'repeat-x',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'Arial, Helvetica, sans-serif'
            });
            closeBtn.onclick = () => box.remove();

            Object.assign(box.style, {
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#fff3cd',
                color: '#5c4400',
                padding: '15px 25px',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: 'Segoe UI, sans-serif',
                fontWeight: '500',
                zIndex: '99999',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                maxWidth: '90%',
                textAlign: 'center'
            });

            box.appendChild(header);
            box.appendChild(text);
            box.appendChild(closeBtn);
            document.body.appendChild(box);
        }

        function scanPrimaryBank() {
            const primaryField = document.querySelector(CONFIG.primaryBankSelector);
            if (!primaryField) {
                console.log('EPB scan: primaryField NOT FOUND');
                return null;
            }

            const rawText = primaryField.textContent.trim();
            const upper = rawText.toUpperCase();
            const normalized = ` ${upper.replace(/\s+/g, ' ')} `;

            const isDangerous = DANGEROUS_BANKS.some(bank => normalized.includes(bank));

            console.log('EPB scan:', rawText, '| dangerous =', isDangerous);

            return {
                isDangerous,
                fullText: rawText
            };
        }

        function checkAndWarn() {
            const result = scanPrimaryBank();
            if (!result) return;

            const { isDangerous, fullText } = result;

            if (!isDangerous) {
                // reset tracker if bank is safe
                lastDangerousName = null;
                return;
            }

            const currentName = fullText;

            // first ever dangerous OR changed dangerous bank name -> show popup
            if (lastDangerousName === null || lastDangerousName !== currentName) {
                const title = 'Probably Early Pay Bank!';
                const items = [
                    'This bank may show payroll one day earlier than it actually settles.',
                    `Bank name: ${currentName}`
                ];
                showStyledPopup(title, items, false);
                lastDangerousName = currentName;
            }
        }

        function initObserver() {
            const observer = new MutationObserver(() => {
                setTimeout(checkAndWarn, 100);
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        function init() {
            console.log('EPB: init');
            setTimeout(checkAndWarn, 800);
            initObserver();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
}

/*** ============ LMS Loyalty Refinance Helper ============ ***/
if (MODULES.loyaltyRefi) {

    (function () {
        'use strict';

        const MULTIPLIER = 0.5;
        const BONUS = 275;

        const href = location.href;

        if (href.includes('CustomerDetails.aspx')) {
            setupCustomerDetails();
        } else if (href.includes('EditCustomerCustomField.aspx')) {
            initPopup();
        }


        function storageKey(loanId) {
            return `loyaltyRefi_${loanId}`;
        }

        function parseLoanIdFromHeader(headerEl) {
            const text = headerEl.textContent || '';
            const m = text.match(/Loan#\s*(\d+)/i);
            return m ? m[1] : null;
        }

        function parseLMSDateFromCDT(dateStr) {
            const [datePart, timePart, ampm] = dateStr.trim().split(/\s+/);
            const [month, day, year] = datePart.split('/').map(Number);
            let [hour, minute, second] = timePart.split(':').map(Number);
            if (ampm === 'PM' && hour !== 12) hour += 12;
            if (ampm === 'AM' && hour === 12) hour = 0;
            return new Date(Date.UTC(year, month - 1, day, hour + 5, minute, second));
        }

        function GM_GetSafe(key) {
            try { return GM_getValue ? GM_getValue(key, null) : null; }
            catch (e) { console.warn('GM_getValue failed', e); return null; }
        }

        function GM_SetSafe(key, value) {
            try { if (typeof GM_setValue === 'function') GM_setValue(key, value); }
            catch (e) { console.warn('GM_setValue failed', e); }
        }

        function computePointsToRemove(refiAmount) {
            if (typeof refiAmount !== 'number' || isNaN(refiAmount)) return null;
            return Math.round(refiAmount * MULTIPLIER + BONUS);
        }

        // ===== Notes by LOANID =====
        async function fetchLoanNotesDocument(loanId) {
            const res = await fetch(`/plm.net/customers/CustomerNotes.aspx?loanid=${loanId}&isnosection=true`, {
                credentials: 'include'
            });
            const html = await res.text();
            return new DOMParser().parseFromString(html, 'text/html');
        }

        async function scanAllAdjNotesByLoan(loanId) {
            const doc = await fetchLoanNotesDocument(loanId);
            const rows = Array.from(doc.querySelectorAll('table.DataTable tbody tr'));
            const all = [];
            for (const tr of rows) {
                const cells = tr.querySelectorAll('td');
                if (cells.length < 3) continue;
                const dateStr = cells[0].textContent.trim();
                const noteText = cells[2].textContent || '';
                if (!noteText.includes('Loan#')) continue;

                const loanMatch = noteText.match(/Loan#\s+(\d+)/);
                if (!loanMatch || loanMatch[1] !== String(loanId)) continue;

                const origMatch = noteText.match(/Original LP\s*=\s*(\d+)/);
                const removedMatch = noteText.match(/Removed LP\s*=\s*(\d+)/);
                const fixedMatch = noteText.match(/Fixed\s*=\s*(\d+)/);

                all.push({
                    loanId:     loanMatch[1],
                    originalLP: origMatch ? Number(origMatch[1]) : null,
                    removedLP:  removedMatch ? Number(removedMatch[1]) : null,
                    fixedLP:    fixedMatch ? Number(fixedMatch[1]) : null,
                    dateString: dateStr,
                    date:       parseLMSDateFromCDT(dateStr),
                    text:       noteText
                });
            }
            return all;
        }

        async function getLastAdjNoteForLoanByLoanId(loanId) {
            const all = await scanAllAdjNotesByLoan(loanId);
            if (!all.length) return null;
            return all[all.length - 1];
        }

        function buildLoyaltyNote(loanId, originalLP, removedLP, fixedLP) {
            return [
                `Loan# ${loanId}`,
                `Original LP = ${originalLP}`,
                `Removed LP = ${removedLP}`,
                `Fixed = ${fixedLP}`
            ].join('\r\n');
        }

        async function addSystemNoteForLoanByLoanId(loanId, originalLP, removedLP, fixedLP) {
            const doc = await fetchLoanNotesDocument(loanId);
            const form = doc.querySelector('form');
            if (!form) {
                console.warn('Notes form not found for loan', loanId);
                return;
            }

            const noteText = buildLoyaltyNote(loanId, originalLP, removedLP, fixedLP);

            const formData = new FormData(form);
            formData.set('ctl00$maincontent$NewNoteText', noteText);
            formData.set('ctl00$maincontent$Btn_AddNote', 'Submit');
            formData.set('__EVENTTARGET', '');
            formData.set('__EVENTARGUMENT', '');

            await fetch(`/plm.net/customers/CustomerNotes.aspx?loanid=${loanId}&isnosection=true`, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            console.log('LRM: System note added for loan', loanId, ':', noteText);
        }

        // =================================================================
        // 1) CustomerDetails.aspx
        // =================================================================
        function setupCustomerDetails() {
            const processedLoans = new Set();

            async function scanHeadersAndHandle() {
                try {
                    const headers = Array.from(document.querySelectorAll('div.Header'));
                    if (!headers.length) return;

                    for (const h of headers) {
                        const txt = (h.textContent || '').trim();
                        const loanId = parseLoanIdFromHeader(h);
                        if (!loanId) continue;

                        const hasPending = txt.includes('/ Pending');
                        const hasPA = txt.includes('Pending Approval');

                        //
                        if (!hasPending || !hasPA) continue;

                        if (processedLoans.has(loanId)) {
                            //
                            ensureMarkerForLoan(loanId);
                            continue;
                        }

                        processedLoans.add(loanId);
                        await handleNewPendingApproval(loanId);
                    }
                } catch (e) {
                    console.error('LRM scanHeadersAndHandle error', e);
                }
            }


            setTimeout(scanHeadersAndHandle, 800);

            setInterval(scanHeadersAndHandle, 2000);
        }

        function getCurrentLoyaltyPointsInfo() {
            const link = document.querySelector('#ctl00_CustomerCustomFieldsRepeater_UpdateCustomFieldLink_1');
            if (!link) return null;
            const row = link.closest('tr');
            if (!row) return null;
            const tds = Array.from(row.querySelectorAll('td'));
            const labelIndex = tds.findIndex(td => (td.textContent || '').includes('Loyalty Current Points'));
            if (labelIndex === -1 || !tds[labelIndex + 1]) return null;
            const valueTd = tds[labelIndex + 1];
            const raw = (valueTd.textContent || '').trim();
            const current = parseInt(raw.replace(/[^\d]/g, ''), 10);
            if (isNaN(current)) return null;
            return { currentPoints: current, valueTd };
        }

        function markPointsNeedAdjustment(valueTd) {

            const green = valueTd.querySelector('.loyalty-refi-done');
            if (green) green.remove();

            if (valueTd.querySelector('.loyalty-refi-note')) return;
            const span = document.createElement('span');
            span.className = 'loyalty-refi-note';
            span.textContent = ' Need adjustment after refinance';
            span.style.marginLeft = '6px';
            span.style.color = '#d9534f';
            span.style.fontWeight = 'bold';
            valueTd.appendChild(span);
        }

        function markPointsAlreadyAdjusted(valueTd) {
            const red = valueTd.querySelector('.loyalty-refi-note');
            if (red) red.remove();

            let span = valueTd.querySelector('.loyalty-refi-done');
            if (!span) {
                span = document.createElement('span');
                span.className = 'loyalty-refi-done';
                span.style.marginLeft = '6px';
                span.style.color = '#28a745';
                span.style.fontWeight = 'bold';
                valueTd.appendChild(span);
            }
            span.textContent = ' Already adjusted';
        }

        function getRefinanceAmountForLoan() {
            const spans = Array.from(document.querySelectorAll('span'));
            const candidates = spans.filter(s => (s.textContent || '').includes('Refinance'));
            for (const span of candidates) {
                const txt = span.textContent || '';
                const m = txt.match(/Funded\s*\+\s*\$(\d[\d.,]*)\s*Refinance/i);
                if (m) {
                    return parseFloat(m[1].replace(/,/g, ''));
                }
            }
            return null;
        }

        async function handleNewPendingApproval(pendingLoanId) {
            console.log('LRM: handleNewPendingApproval for', pendingLoanId);

            const headers = Array.from(document.querySelectorAll('div.Header'));
            const hasActive = headers.some(h => (h.textContent || '').includes('/ Active'));
            if (!hasActive) return;

            const loyaltyInfo = getCurrentLoyaltyPointsInfo();
            const lastAdj = await getLastAdjNoteForLoanByLoanId(pendingLoanId);

            if (lastAdj) {
                if (loyaltyInfo) {
                    markPointsAlreadyAdjusted(loyaltyInfo.valueTd);
                }
                const payload = {
                    pendingLoanId,
                    refinanceAmount: null,
                    currentPoints: loyaltyInfo ? loyaltyInfo.currentPoints : null,
                    pointsToRemove: null,
                    finalPoints: null,
                    lastAdjDate: lastAdj.dateString
                };
                GM_SetSafe(storageKey(pendingLoanId), payload);
                console.log('LRM: loan already adjusted, payload =', payload);
                return;
            }

            if (!loyaltyInfo) return;
            markPointsNeedAdjustment(loyaltyInfo.valueTd);

            const refiAmount = getRefinanceAmountForLoan();
            if (refiAmount == null) return;

            const pointsToRemove = computePointsToRemove(refiAmount);
            if (pointsToRemove == null) return;

            const finalPoints = Math.max(0, loyaltyInfo.currentPoints - pointsToRemove);
            const payload = {
                pendingLoanId,
                refinanceAmount: refiAmount,
                currentPoints: loyaltyInfo.currentPoints,
                pointsToRemove,
                finalPoints,
                lastAdjDate: null
            };
            GM_SetSafe(storageKey(pendingLoanId), payload);
            console.log('LRM: stored NEW payload =', payload);
        }


        async function ensureMarkerForLoan(loanId) {
            const info = getCurrentLoyaltyPointsInfo();
            if (!info) return;

            const lastAdj = await getLastAdjNoteForLoanByLoanId(loanId);
            if (lastAdj) {
                markPointsAlreadyAdjusted(info.valueTd);
            } else {
                markPointsNeedAdjustment(info.valueTd);
            }
        }

        // =================================================================
        // 2) EditCustomerCustomField.aspx
        // =================================================================
        function initPopup() {
            window.addEventListener('load', () => {
                initPopupUI().catch(e => console.error('LRM Popup init error', e));
            });
        }

        async function initPopupUI() {
            const pointsInput = document.querySelector('#maincontent_CustomFieldValue');
            const updateBtn = document.querySelector('#maincontent_Btn_Update');
            if (!pointsInput) return;

            let loanId = null;
            try {
                const topDoc = window.top.document;
                const headers = Array.from(topDoc.querySelectorAll('div.Header'));
                const paHeader = headers.find(h =>
                    (h.textContent || '').includes('/ Pending, Pending Approval')
                );
                if (paHeader) loanId = parseLoanIdFromHeader(paHeader);
            } catch (e) {
                console.warn('LRM Popup: cannot read parent headers', e);
            }

            if (!loanId) {
                return;
            }

            let data = GM_GetSafe(storageKey(loanId));

            if (!data || data.pointsToRemove == null || data.finalPoints == null) {
                try {
                    const parentDoc = window.top.document;
                    const spans = Array.from(parentDoc.querySelectorAll('span'));
                    const cand = spans.filter(s => (s.textContent || '').includes('Refinance'));
                    let refiAmount = null;
                    for (const span of cand) {
                        const txt = span.textContent || '';
                        const m = txt.match(/Funded\s*\+\s*\$(\d[\d.,]*)\s*Refinance/i);
                        if (m) { refiAmount = parseFloat(m[1].replace(/,/g, '')); break; }
                    }
                    if (refiAmount != null) {
                        const currentPoints = parseInt(pointsInput.value.replace(/[^\d]/g, ''), 10) || 0;
                        const pointsToRemove = computePointsToRemove(refiAmount);
                        const finalPoints = Math.max(0, currentPoints - pointsToRemove);
                        data = {
                            pendingLoanId: loanId,
                            refinanceAmount: refiAmount,
                            currentPoints,
                            pointsToRemove,
                            finalPoints,
                            lastAdjDate: null
                        };
                        GM_SetSafe(storageKey(loanId), data);
                    }
                } catch (e) {
                    console.warn('LRM Popup: cannot recompute from parent', e);
                }
            }

            const lastAdj = await getLastAdjNoteForLoanByLoanId(loanId);

            const ui = ensureUiContainer(pointsInput);

            if (!lastAdj && data && data.pointsToRemove != null && data.finalPoints != null) {
                const finalPoints = data.finalPoints;
                ui.innerHTML =
                    `Current: <b>${data.currentPoints}</b>, ` +
                    `to remove: <b>${data.pointsToRemove}</b>, ` +
                    `final balance: <b>${finalPoints}</b>`;

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = `Set ${finalPoints}`;
                btn.style.marginLeft = '6px';
                btn.style.fontSize = '11px';
                btn.addEventListener('click', () => {
                    pointsInput.value = String(finalPoints);
                    try { pointsInput.focus(); pointsInput.select(); } catch (e) {}
                });
                ui.appendChild(btn);

            } else if (lastAdj) {
                ui.innerHTML =
                    `Already adjusted<br>` +
                    `Original LP = <b>${lastAdj.originalLP ?? '?'}</b>, ` +
                    `Removed LP = <b>${lastAdj.removedLP ?? '?'}</b>, ` +
                    `Fixed = <b>${lastAdj.fixedLP ?? '?'}</b>.`;
            } else {
                ui.textContent =
                    'Helper: no cached refinance data and no note for this loan.';
            }

            if (updateBtn && !updateBtn._lmsHooked) {
                updateBtn._lmsHooked = true;
                updateBtn.addEventListener('click', async () => {
                    try {
                        const current = parseInt(pointsInput.value.replace(/[^\d]/g, ''), 10) || 0;

                        let originalLP = data && data.currentPoints;
                        let removedLP = data && data.pointsToRemove;
                        let fixedLP = data && data.finalPoints;

                        if (fixedLP == null || current !== fixedLP) {
                            fixedLP = current;
                            if (originalLP != null) {
                                removedLP = originalLP - fixedLP;
                            }
                        }

                        if (originalLP == null) originalLP = fixedLP + (removedLP || 0);

                        await addSystemNoteForLoanByLoanId(
                            loanId,
                            originalLP,
                            removedLP ?? 0,
                            fixedLP
                        );
                    } catch (e) {
                        console.error('LRM Popup: addSystemNoteForLoan error', e);
                    }
                });
            }
        }

        function ensureUiContainer(pointsInput) {
            let ui = document.querySelector('#lms-loyalty-helper');
            if (!ui) {
                ui = document.createElement('div');
                ui.id = 'lms-loyalty-helper';
                ui.style.marginTop = '8px';
                ui.style.fontSize = '11px';
                ui.style.fontFamily = 'Segoe UI, Arial, sans-serif';
                ui.style.color = '#333';
                pointsInput.parentNode.insertBefore(ui, pointsInput.nextSibling);
            } else {
                ui.innerHTML = '';
            }
            return ui;
        }

    })();
}


/*** ============ Overpaid check module ============ ***/

if (MODULES.overpaidCheck && location.href.includes('CustomerHistory')) {
    'use strict';
const statusColumnSelector = '.DataTable.LoansTbl tbody tr td:nth-child(2)';
    // Перевіряємо, чи є статус "Gold", "Platinum", "VIP" або "Diamond"
    const statusCells = document.querySelectorAll(statusColumnSelector);
    let eligibleStatusFound = false;
    statusCells.forEach(statusCell => {
        const status = statusCell.textContent.trim();
        const allowedStatuses = ["Gold", "Platinum", "VIP", "Diamond"];
        if (allowedStatuses.includes(status)) {
            eligibleStatusFound = true;
        }
    });

    if (eligibleStatusFound) {
        // Функція для парсингу суми
        const extractAmount = (element) => {
            return parseFloat(element.textContent.trim().replace('$', '').replace(',', ''));
        };

        // Показуємо відсоток поруч із Total Paid
        const displayPercentage = (percentage, payments, status) => {
            const percentageElement = document.createElement('span');
            percentageElement.textContent = ` (${percentage.toFixed(2)}%)`;
            percentageElement.classList.add('loan-comparison-tooltip');

            if (percentage > 10) {
                if (payments < 3 && !status.includes("Paid in Full")) {
                    percentageElement.style.color = '#de9d1b';
                    percentageElement.title = "Not enough payments made for potential refinancing.";
                } else if (status.includes("Active") && status.includes("In-House Collections")) {
                    percentageElement.style.color = 'red';
                    percentageElement.title = "Last active loan is in collections.";
                } else if (status.includes("Past Due") && status.includes("In-House Collections")) {
                    percentageElement.style.color = 'red';
                    percentageElement.title = "Customer is in collection.";
                } else {
                    percentageElement.style.color = 'green';
                    percentageElement.title = "Might be eligible, check with TL.";
                }
                percentageElement.style.fontWeight = '900';
            } else {
                percentageElement.style.color = 'red';
                percentageElement.style.fontWeight = 'bold';
            }

            const totalPaidElement = document.querySelector(totalPaidSelector);
            totalPaidElement.appendChild(percentageElement);
        };

        const calculatePercentage = (totalPaid, totalPrincipalLoaned) => {
            return ((totalPaid - totalPrincipalLoaned) / totalPrincipalLoaned) * 100;
        };


        const totalPrincipalLoanedSelector = '#maincontent_AccountSummary .DataTable tr:nth-child(2) td:nth-child(2)';
        const totalPaidSelector = '#maincontent_AccountSummary .DataTable tr:nth-child(2) td:nth-child(4)';


        const loanStatusCells = document.querySelectorAll('.DataTable.LoansTbl tbody tr td:nth-child(3)');
        let lastEligibleRowIndex = -1;
        loanStatusCells.forEach((statusCell, index) => {
            const status = statusCell.textContent.trim();
            if (status.includes("Active") || status.includes("Paid in Full")) {
                lastEligibleRowIndex = index;
            } else if (status.includes("Past Due") && status.includes("In-House Collections")) {
                lastEligibleRowIndex = index;
            }
        });

        if (lastEligibleRowIndex !== -1) {
            const totalPrincipalLoanedElement = document.querySelector(totalPrincipalLoanedSelector);
            const totalPaidElement = document.querySelector(totalPaidSelector);
            if (totalPrincipalLoanedElement && totalPaidElement) {
                const totalPrincipalLoaned = extractAmount(totalPrincipalLoanedElement);
                const totalPaid = extractAmount(totalPaidElement);

                // Останній рядок із потрібним статусом
                const allRows = document.querySelectorAll('.DataTable.LoansTbl tbody tr');
                const lastEligibleRow = allRows[lastEligibleRowIndex];

                const paymentsElement = lastEligibleRow.querySelector('td:nth-child(11)');
                const payments = parseInt(paymentsElement.textContent.trim());

                const status = lastEligibleRow.querySelector('td:nth-child(3)').textContent.trim();
                const percentage = calculatePercentage(totalPaid, totalPrincipalLoaned);

                displayPercentage(percentage, payments, status);
            } else {
                console.error('One or more elements not found.');
            }
        } else {
            console.log('No clients with eligible statuses found.');
        }
    } else {
        console.log('No clients with eligible statuses found.');
    }
}
})();
