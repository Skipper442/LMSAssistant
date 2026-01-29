// ==UserScript==
// @name         LMS Assistant PRO for UW (GitHub)
// @namespace    http://tampermonkey.net/
// @author       Liam Moss and Jack Tyson
// @version      2.61
// @description  Extended version of "LMS Assistant". With additional modules and control panel
// @icon         https://raw.githubusercontent.com/Skipper442/CC-icon/main/Credit-cube-logo.png
// @match        https://apply.creditcube.com/*
// @updateURL    https://github.com/Skipper442/LMSAssistant/raw/refs/heads/main/LMSAssistant.user.js
// @downloadURL  https://github.com/Skipper442/LMSAssistant/raw/refs/heads/main/LMSAssistant.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      api.creditsense.ai
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
    const CURRENT_VERSION = "2.61";

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
    earlyPayBank: true,
    algoAccountMatcher: true,
    slackDM: true,
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
    earlyPayBank: 'Early Pay Bank',
    algoAccountMatcher: 'Account Number Matcher',
    slackDM: 'Slack DM',
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
    maxExposure: "Calculates Max Exposure directly in LMS",
    crmStatusCleaner: "Reduces the list of loan statuses",
    loyaltyRefi: "Tracks refinance, adjusts loyalty points",
    earlyPayBank: "Warns when customer's primary bank is probably an early pay bank",
    algoAccountMatcher: "Parses ALGO notes, shows account number match status",
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

    // Payment Schedule helper:
    async function appendPaymentScheduleDetails(loanId) {
        try {
            const endpoint =
                `https://apply.creditcube.com/plm.net/customers/EditPendingLoan.aspx` +
                `?loanid=${encodeURIComponent(loanId)}&storeid=1&loantypeid=2`;

            const resp = await fetch(endpoint, {
                method: 'GET',
                credentials: 'include'
            });
            const htmlText = await resp.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');

            const freqTypeSelect = doc.querySelector('#maincontent_Loan_PaymentScheduleFrequencyType');
            if (!freqTypeSelect) return;

            const freqValue = freqTypeSelect.value;
            let suffix = '';

            if (freqValue === '2') {
                const sel = doc.querySelector('#maincontent_Loan_FrequencyBiWeekly_Weekday');
                if (sel) {
                    const dayText = sel.options[sel.selectedIndex].text.trim();
                    suffix = ` ${dayText}`;
                }
            } else if (freqValue === '1') {
                const sel = doc.querySelector('#maincontent_Loan_FrequencyWeekly_Weekday');
                if (sel) {
                    const dayText = sel.options[sel.selectedIndex].text.trim();
                    suffix = ` ${dayText}`;
                }
            } else if (freqValue === '4') {
                const firstSel = doc.querySelector('#maincontent_Loan_FrequencyTwicePerMonth_FirstDay_DayOrdinal');
                const secondSel = doc.querySelector('#maincontent_Loan_FrequencyTwicePerMonth_SecondDay_DayOrdinal');

                if (firstSel && secondSel) {
                    const firstText = firstSel.options[firstSel.selectedIndex].text.trim().toUpperCase();
                    const secondText = secondSel.options[secondSel.selectedIndex].text.trim().toUpperCase();
                    suffix = ` ${firstText} AND ${secondText}`;
                }
            }

            if (!suffix) return;

            const psLink = document.querySelector(
                `#loan_${loanId} > table.ProfileLoanBottom > tbody > tr > td:nth-child(2) > a:nth-child(1)`
            );
            if (!psLink) return;

            const baseText = psLink.textContent.trim();
            if (!baseText.includes(suffix.trim())) {
                psLink.textContent = baseText + suffix;
            }
        } catch (e) {
            console.error('LMS Assistant: Payment Schedule fetch error', e);
        }
    }

    // ==== (toggle) ====
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
        initLeftMenuToggle();

        const observer = new MutationObserver(() => {
            const custCell = document.querySelector('#ContactSection .ProfileSectionTable tbody tr:nth-child(2) td:nth-child(4)');
            const cellPhone = document.querySelector('#ctl00_Span_CellPhone strong');
            const homePhone = document.querySelector('#ctl00_Span_HomePhone strong');
            const headerDiv = document.querySelector('div.Header');

            if (!custCell || !cellPhone || !homePhone || !headerDiv) return;

            const custState = custCell.textContent.trim().substring(0, 2);
            const unsupportedStates = ['GA', 'VA', 'PA', 'IL'];
            if (unsupportedStates.includes(custState)) {
                showStyledPopup("Unsupported State", [`Customer from ${custState}. Reloan not allowed.`], true);
            }

            [cellPhone, homePhone].forEach(phone => {
                phone.style.fontWeight = '800';
                phone.style.color = isCallable(custState) ? 'green' : 'red';
            });

            const headerMatch = headerDiv.textContent.match(/Loan#\s*(\d+)/i);
            if (headerMatch) {
                appendPaymentScheduleDetails(headerMatch[1]);
            }

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
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAEBAQEBAQEBAQEBAQEBAQIBAQEBAQIBAQECAgICAgICAgIDAwQDAwMDAwICAwQDAwQEBAQEAgMFBQQEBQQEBAT/2wBDAQEBAQEBAQIBAQIEAwIDBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAT/wAARCAAwADADASIAAhEBAxEB/8QAGgABAQEAAwEAAAAAAAAAAAAAAAkIBAUHCv/EACkQAAAGAQQCAgICAwAAAAAAAAECAwQFBgcACBITCREUIhUhFiMYMkH/xAAYAQADAQEAAAAAAAAAAAAAAAAEBQcGAP/EACsRAAEDBAEDAgUFAAAAAAAAAAECAxEEBQYSBwATISJBCAkUMVEVFyQyQv/aAAwDAQACEQMRAD8A+/jTTTXdd001PLKu9WxY43PwmEv4IxWqa8rDQ8nOPFlyTb4ZgrYwPGAgYEepAXXASGKYTnbqBzTH/XzHDvkYn8mbyZbbm7x/DR9MXss9UqzPtni42ZFeDSfri6fAYwoHTcFjlQBJIhTJCsT+xQCj7eX7HbtjdNb6u7thLda2HWSFBWyDETqTqYIJBgiR7zEda554zev7mMorVfWIrf08pLTo/kzrrJTGm3o3/rPmdfV1VvTTTSPqxdNTp3wZO3Q0KYpjbB8bOo1Z7FqrzM9W6enbXij/ALjlBo47G65UCFSKmoQQKUVBUU+w8PQUW1D3yx7cPITne84dHaVbLG0xs1h1Yu3QFWymTGJoiXO7UMMzJiZ03F23+KdFNMqXeqiLdfil7W+7/GL7TY3eWrvV0DdYhEgtOiUKkESQQRKZkSCJ9vcFUfDzXPD/AO2r+ZJxZNQCs3NS+2GeyO7ptu35d17YHdb2mNjOquBifK28665cx6zulTmrlEq2NozmCXHDke0Yso47hMXiwyH49M7YEk+ahVCqF9HKX9H98DeF4UwlnPHvkBu+QX2LLYjCUGwX6+qTr+Cdo1WQbrxc+MWKD8CdSwO1HTUiZEjCcew31Dgfjj3cfuS3M4m8q+N8Uxebr02reLbXi3FyNYi7M+b0eVaOYSrBNFcxYqdDgH6r58dU65DKG7SfYOpLhZzIuPd0NpyRdHNWsUrZ45Sbcuo01ZyazbtGrIy5wapAz+aQ6HWTgQSGIHoxR/ZvfIZj8S3Pb1pbtVzx3DHKhe6mgxb0SRA3K1pQ2T+EjVv87KHpHS67fLNr+PqHEL3m/JS601iWb1TP1MykQyUMKL61H7FpZUHYnZCUDy4e68eua94+WbXkr/IiuzTakN41N/XJeeoJaIaNkTOCFCMYADdEXCPQdU5xU7VExRR5Kf2/aqOsTbUKFn6nydoXyu+l06+6j00YuInLMSxuTvO0phco8FlQSKVMDkN7EonE5P0PD2G2dB8bZVcs0xGmyG7Wqotz7hWDT1SSl5OqykEghKtVAbJ2SkkH7RBI9swN7jWkTiNRf1XlbRKjVrVsV7nfWdl+ETqBuuIif8hppprd9H9Qv3BeIm05m8hkFu6YZVr0Vjt1cave7lVnke6NckHNZQi23wo0SkFsdJ2SIREV1lCGRM4U9JLAUoG39jzazN0fPkrlX+XNFa6tIykmxiWySpJV3+SBcPjPPYAl1pC45gYomE5kCDxJ/wA2lprEZVx3imZ3K03a/sFb9tqBU06gtaNXUwQSEkbJlKSUqkEpAPiQa/kPOvJWUWO345eq1K6SiohQMp7TY1pkgJCSQkFSglKU7klUJHnaSWmmmtv1IOv/2Q==';

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


/*** ============ Max Exposure ============ ***/

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
    query MaxExposureQuery($customerId: String!) {
      creditExposure(customerId: $customerId) { allowedAmount }
    }`;

  const safeJson = (t) => { try { return t ? JSON.parse(t) : null; } catch { return null; } };


  const getCustomerIdFromUrl = () => {
    const idElement = document.querySelector('#mainpropertiesview > table:nth-child(3) > tbody > tr > td > table > tbody > tr:nth-child(1) > td:nth-child(4)');
    if (idElement) {
      const text = (idElement.textContent || idElement.innerText || '').trim();
      const id = text.match(/(\d{5,})/)?.[1];
      return String(id || '');
    }
    return '';
  };

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
      } catch (err) {
        console.error('API Error:', err);
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

  // whitelist for UW
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
            ' DFCU',
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

/*** ============= ALGO Account Matcher ============ ***/
if (MODULES.algoAccountMatcher && location.href.includes('CustomerDetails.aspx')) {
    (function () {
        'use strict';

        let lastALGOStatus = null;

        async function getNotesHtml(loanId) {
            try {
                const response = await fetch(`/plm.net/customers/CustomerNotes.aspx?loanid=${loanId}&isnosection=true`, {
                    credentials: 'include'
                });
                return await response.text();
            } catch (e) {
                return '';
            }
        }

        function parseAccountData(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const table = doc.querySelector('#Form_Notes table.DataTable');

            if (!table) return { status: null, date: null };

            const rows = table.querySelectorAll('tbody tr');
            for (const row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 3) {
                    const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());
                    const statusIndex = cellTexts.findIndex(text => /Account number matches:/i.test(text));

                    if (statusIndex !== -1) {
                        const statusMatch = cellTexts[statusIndex].match(/Account number matches:\s*(Yes|No|Partial)/i);
                        const status = statusMatch ? statusMatch[1] : null;
                        const date = statusIndex >= 2 ? cellTexts[statusIndex - 2] : null;
                        return { status, date };
                    }
                }
            }

            return { status: null, date: null };
        }

        function showPopup(loanId, status, date) {
            const oldPopup = document.getElementById('notes-account-popup');
            if (oldPopup) oldPopup.remove();

            const popup = document.createElement('div');
            popup.id = 'notes-account-popup';
            popup.style.cssText = `
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                width: 300px; background: #ffffff;
                border: 2px solid ${status === 'Yes' ? '#28a745' : status === 'No' ? '#dc3545' : '#ffc107'};
                border-radius: 8px; padding: 16px 20px; z-index: 99999; box-shadow: 0 8px 30px rgba(0,0,0,0.25);
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #333;
            `;

            const borderColor = status === 'Yes' ? '#28a745' : status === 'No' ? '#dc3545' : '#ffc107';
            const textColor = status === 'Yes' ? '#28a745' : status === 'No' ? '#dc3545' : '#d39e00';

            popup.innerHTML = `
                <div style="text-align: center; margin-bottom: 12px;">
                    <div style="font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        Loan #${loanId}
                    </div>
                    <div style="font-size: 13px; color: #666; margin-bottom: 8px;">
                        Account number matches
                    </div>
                    <div style="font-size: 28px; font-weight: 700; color: ${textColor}; margin-bottom: 8px;">
                        ${status}
                    </div>
                    <div style="font-size: 12px; color: #666; line-height: 1.3;">
                        Fetched for ALGO created on: ${date || 'N/A'}
                    </div>
                </div>
                <div style="text-align: center;">
                    <button id="notes-popup-ok" style="
                        background: ${borderColor}; color: #ffffff; border: none;
                        padding: 8px 20px; border-radius: 5px; font-weight: 500;
                        font-size: 13px; cursor: pointer; text-shadow: 0 1px 1px rgba(0,0,0,0.3);
                    " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        OK
                    </button>
                </div>
            `;

            document.body.appendChild(popup);

            document.getElementById('notes-popup-ok').onclick = function() {
                popup.remove();
            };
        }

        function extractLoanId() {
            const headerElements = document.querySelectorAll('.Header');
            for (const header of headerElements) {
                const match = header.textContent.match(/Loan#?\s*(\d{6,8})/i);
                if (match) return match[1];
            }

            const loanContainer = document.querySelector('[id^="loan_"]');
            if (loanContainer) {
                const headerInContainer = loanContainer.querySelector('.Header');
                if (headerInContainer) {
                    const match = headerInContainer.textContent.match(/Loan#?\s*(\d{6,8})/i);
                    if (match) return match[1];
                }
            }

            const urlMatch = location.search.match(/loanid=(\d+)/);
            return urlMatch ? urlMatch[1] : null;
        }

        function checkAndShowALGO() {
            const loanId = extractLoanId();
            if (!loanId) return;

            getNotesHtml(loanId).then((html) => {
                const data = parseAccountData(html);
                if (data.status && data.status !== lastALGOStatus) {
                    showPopup(loanId, data.status, data.date);
                    lastALGOStatus = data.status;
                }
            });
        }

        function initObserver() {
            const observer = new MutationObserver(() => {
                setTimeout(checkAndShowALGO, 100);
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        function init() {
            setTimeout(checkAndShowALGO, 300);
            initObserver();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    })();
}

/*** ============ LMS Loyalty Refinance Helper (by remarks) ============ ***/
if (MODULES.loyaltyRefi) {

    (function () {
        'use strict';

        const MULTIPLIER = 0.5;
        const BONUS = 275;

        const REMARKS_CONFIG = {
            checkDelay: 1500,
            debounce: 300
        };

        const REQUIRED_REMARKS = [
            'no duplicates',
            'personal info verification',
            'phone verification',
            'amount applied for',
            'verification of employment',
            'before/after',
            'bank account # and aba verified',
            't&c read and agreed',
            'minimum amount the customer agrees to',
            'bank acct matches online banking acct',
            'checking account',
            'direct deposit verified on online banking',
            'due date & pay schedule verified',
            'all accounts checked on dl',
            'final approved amount',
            'loan type matches cust loyalty status',
            'loan amount fixed',
            'promotion code',
            'other'
        ];

        const href = location.href;

        if (href.includes('CustomerDetails.aspx')) {
            setupCustomerDetails();
        } else if (href.includes('EditCustomerCustomField.aspx')) {
            initPopup();
        }

        // ================= Common helpers =================

        function storageKey(loanId) {
            return `loyaltyRefi_${loanId}`;
        }

        function parseLoanIdFromHeaderText(text) {
            const m = text.match(/Loan#\s*(\d+)/i);
            return m ? m[1] : null;
        }

        function getActiveLoanId(doc) {
            const root = doc || document;
            const headers = Array.from(root.querySelectorAll('div.Header'));
            const loanHeader = headers.find(h => (h.textContent || '').includes('Loan#'));
            if (!loanHeader) return null;
            return parseLoanIdFromHeaderText(loanHeader.textContent || '');
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
            catch (e) { return null; }
        }

        function GM_SetSafe(key, value) {
            try { if (typeof GM_setValue === 'function') GM_setValue(key, value); }
            catch (e) { /* ignore */ }
        }

        function GM_DeleteSafe(key) {
            try { if (typeof GM_deleteValue === 'function') GM_deleteValue(key); }
            catch (e) { /* ignore */ }
        }

        function computePointsToRemove(refiAmount) {
            if (typeof refiAmount !== 'number' || isNaN(refiAmount)) return null;
            return Math.round(refiAmount * MULTIPLIER + BONUS);
        }

        // ===== Refinance detector (only for active loan) =====
        function isRefinanceLoan(doc) {
            const root = doc || document;
            const activeLoanId = getActiveLoanId(root);
            if (!activeLoanId) return false;

            const span = root.querySelector(
                `#loan_${activeLoanId} > table.ProfileSectionTable > tbody > tr:nth-child(10) > td:nth-child(2) > span`
            );
            if (!span) return false;

            const txt = (span.textContent || '').toLowerCase();
            return txt.includes('refinance');
        }

        // ================== REMARKS DETECTOR ==================

        
        function findRemarksCellForActiveLoan(doc) {
            const root = doc || document;
            const activeLoanId = getActiveLoanId(root);
            if (!activeLoanId) return null;

            const loanDiv = root.querySelector(`div[id="loan_${activeLoanId}"]`);
            if (!loanDiv) return null;

            const tds = Array.from(loanDiv.querySelectorAll('table.ProfileSectionTable td'));
            return tds.find(td => (td.textContent || '').toLowerCase().includes('no duplicates')) || null;
        }

        function hasAllRequiredRemarks(text) {
            const normalizedText = text.toLowerCase();
            const missing = REQUIRED_REMARKS.filter(r => !normalizedText.includes(r));
            return missing.length === 0;
        }

        let lastCheckTime = 0;

        async function checkRemarksAndUpdate() {
            const now = Date.now();
            if (now - lastCheckTime < REMARKS_CONFIG.debounce) return;
            lastCheckTime = now;

            const activeLoanId = getActiveLoanId(document);
            if (!activeLoanId) return;

            const cell = findRemarksCellForActiveLoan(document);

            let allRemarks = false;
            if (cell) {
                const text = cell.textContent || cell.innerText || '';
                allRemarks = hasAllRequiredRemarks(text);
            }

            const info = getCurrentLoyaltyPointsInfo();

            
            if (!allRemarks) {
                if (info) clearMarkers(info.valueTd);
                GM_DeleteSafe(storageKey(activeLoanId));
                return;
            }

            
            if (!isRefinanceLoan(document)) {
                if (info) clearMarkers(info.valueTd);
                GM_DeleteSafe(storageKey(activeLoanId));
                return;
            }

            
            await updateLoyaltyStateForLoan(activeLoanId);
        }

        function initRemarksObserver() {
            const observer = new MutationObserver((mutations) => {
                let shouldCheck = false;

                for (const mutation of mutations) {
                    if (mutation.type !== 'childList' && mutation.type !== 'characterData') continue;
                    const target = mutation.target;

                    if (target.matches && target.matches('table.ProfileSectionTable td')) {
                        shouldCheck = true; break;
                    }
                    if (target.querySelector && target.querySelector('table.ProfileSectionTable td')) {
                        shouldCheck = true; break;
                    }
                }

                if (shouldCheck) {
                    setTimeout(checkRemarksAndUpdate, 100);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        // ================== Notes helpers ==================

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
            if (!form) return;

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
        }

        // =================================================================
        // 1) CustomerDetails.aspx
        // =================================================================
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

        function clearMarkers(valueTd) {
            if (!valueTd) return;
            const red = valueTd.querySelector('.loyalty-refi-note');
            const green = valueTd.querySelector('.loyalty-refi-done');
            if (red) red.remove();
            if (green) green.remove();
        }

        function markPointsNeedAdjustment(valueTd) {
            clearMarkers(valueTd);
            const span = document.createElement('span');
            span.className = 'loyalty-refi-note';
            span.textContent = ' Need adjustment after refinance';
            span.style.marginLeft = '6px';
            span.style.color = '#d9534f';
            span.style.fontWeight = 'bold';
            valueTd.appendChild(span);
        }

        function markPointsAlreadyAdjusted(valueTd) {
            clearMarkers(valueTd);
            const span = document.createElement('span');
            span.className = 'loyalty-refi-done';
            span.textContent = ' Already adjusted';
            span.style.marginLeft = '6px';
            span.style.color = '#28a745';
            span.style.fontWeight = 'bold';
            valueTd.appendChild(span);
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

        async function updateLoyaltyStateForLoan(loanId) {
            const loyaltyInfo = getCurrentLoyaltyPointsInfo();
            if (!loyaltyInfo) return;

            const lastAdj = await getLastAdjNoteForLoanByLoanId(loanId);

            if (lastAdj) {
                markPointsAlreadyAdjusted(loyaltyInfo.valueTd);
                const payloadGreen = {
                    pendingLoanId: loanId,
                    refinanceAmount: null,
                    currentPoints: loyaltyInfo.currentPoints,
                    pointsToRemove: null,
                    finalPoints: null,
                    lastAdjDate: lastAdj.dateString
                };
                GM_SetSafe(storageKey(loanId), payloadGreen);
                return;
            }

            markPointsNeedAdjustment(loyaltyInfo.valueTd);

            const refiAmount = getRefinanceAmountForLoan();
            if (refiAmount == null) return;

            const pointsToRemove = computePointsToRemove(refiAmount);
            if (pointsToRemove == null) return;

            const finalPoints = Math.max(0, loyaltyInfo.currentPoints - pointsToRemove);
            const payloadRed = {
                pendingLoanId: loanId,
                refinanceAmount: refiAmount,
                currentPoints: loyaltyInfo.currentPoints,
                pointsToRemove,
                finalPoints,
                lastAdjDate: null
            };
            GM_SetSafe(storageKey(loanId), payloadRed);
        }

        function setupCustomerDetails() {
            setTimeout(checkRemarksAndUpdate, REMARKS_CONFIG.checkDelay);
            initRemarksObserver();
        }

        // =================================================================
        // 2) EditCustomerCustomField.aspx — UI
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

            const topDoc = window.top.document;
            const loanId = getActiveLoanId(topDoc);
            if (!loanId) return;

            const ui = ensureUiContainer(pointsInput);

            // if it's not Refinance → we just inform and don't show the calculator
            if (!isRefinanceLoan(topDoc)) {
                ui.textContent = 'This loan is not a refinance. Loyalty points adjustment is not required.';
                return;
            }

            let allRemarks = false;
            try {
                const cell = findRemarksCellForActiveLoan(topDoc);
                if (cell) {
                    const txt = cell.textContent || cell.innerText || '';
                    allRemarks = hasAllRequiredRemarks(txt);
                }
            } catch (e) {
                allRemarks = false;
            }

            if (!allRemarks) {
                ui.textContent = 'Please complete all required loan remarks before adjusting loyalty points.';
                return;
            }

            let data = GM_GetSafe(storageKey(loanId));
            const lastAdj = await getLastAdjNoteForLoanByLoanId(loanId);

            if (!lastAdj && (!data || (data.pointsToRemove == null || data.finalPoints == null))) {
                try {
                    const spans = Array.from(topDoc.querySelectorAll('span'));
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
                    `Already adjusted for this loan.<br>` +
                    `Original LP = <b>${lastAdj.originalLP ?? '?'}</b>, ` +
                    `Removed LP = <b>${lastAdj.removedLP ?? '?'}</b>, ` +
                    `Fixed = <b>${lastAdj.fixedLP ?? '?'}</b>.`;
            } else {
                ui.textContent =
                    'Helper: no refinance data for this loan.';
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
    // "Gold", "Platinum", "VIP" or "Diamond"
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
        // Sum parsing
        const extractAmount = (element) => {
            return parseFloat(element.textContent.trim().replace('$', '').replace(',', ''));
        };

        // % from Total Paid
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

                // Last row with needed status
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
