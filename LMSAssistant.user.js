// ==UserScript==
// @name         LMS Assistant PRO for UW (GitHub)
// @namespace    http://tampermonkey.net/
// @author       Liam Moss and Jack Tyson
// @version      1.96
// @description  Extended version of "LMS Assistant". With additional modules and control panel
// @match        https://apply.creditcube.com/*
// @updateURL    https://github.com/Skipper442/LMSAssistant/raw/refs/heads/main/LMSAssistant.user.js
// @downloadURL  https://github.com/Skipper442/LMSAssistant/raw/refs/heads/main/LMSAssistant.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
// ===== Version Changelog Popup =====
    const CURRENT_VERSION = "1.96";

    const changelog = [
    "🆕 New Remark Filter module – hides all loan remarks except 2 key ones",
    "⚙️ LMS Assistant module optimized – faster and more reliable",
    "🚫 Unsupported States Reminder redesigned – now shows as yellow pop-up at the top",
    "🎯 Element positioning improved – smoother layout and button injection"
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
    remarkFilter: true
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
    remarkFilter: 'Remark Filter'
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
  remarkFilter: "Hides unnecessary loan remarks, keeps only critical ones"
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
        const getLoginName = (id) => {
            return fetch(`https://apply.creditcube.com/plm.net/customers/reports/YodleeReport.aspx?mode=json&savedinstantbankverificationreportid=${id}`)
                .then(res => res.json())
                .then(data => data?.userData?.[0]?.user?.loginName);
        };

        const waitForIBVButton = () => {
            const jsonBtn = document.querySelector('input[value="Show JSON"]');
            if (!jsonBtn) return setTimeout(waitForIBVButton, 500);
            if (document.getElementById('openInCrpBtn')) return;

            const btn = document.createElement('input');
            btn.type = 'button';
            btn.id = 'openInCrpBtn';
            btn.value = 'Open in CRP';
            Object.assign(btn.style, {
                padding: '4px', fontFamily: 'Arial', fontWeight: 'bold', fontSize: '12px',
                border: '1px solid #2e9fd8', background: '#2e9fd8 url(Images/global-button-back.png) left top repeat-x',
                color: '#DFDFDF', cursor: 'pointer', marginLeft: '5px'
            });

            btn.onclick = async () => {
                const select = document.getElementById('maincontent_ReportBarControl_YodleeIbvReports');
                const selectedId = select?.value;
                if (!selectedId) return alert('Select a report.');
                const loginName = await getLoginName(selectedId);
                if (loginName) {
                    const crpLink = `https://ibv.creditsense.ai/report/Yodlee/${loginName}`;
                    window.open(crpLink, '_blank');
                } else alert('loginName not found.');
            };
            jsonBtn.after(btn);
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

        const allowedRemarks = [
            "Bank Account Verification missing",
            "Customer Signature missing"
        ];

        const listItems = remarkDiv.querySelectorAll("ul li");
        listItems.forEach(li => {
            const text = li.textContent.trim();
            if (!allowedRemarks.includes(text)) {
                li.style.display = "none";
            }
        });
    };

    const observer = new MutationObserver(waitForRemarkBlock);
    observer.observe(document.body, { childList: true, subtree: true });
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

            if (percentage > 20) {
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
