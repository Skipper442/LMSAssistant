// ==UserScript==
// @name         LMS Assistant PRO for Collections (GitHub)
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  LMS Assistant PRO with Collections-specific modules only
// @match        https://apply.creditcube.com/*
// @updateURL    https://github.com/Skipper442/LMSAssistant/raw/refs/heads/Collections/LMSAssistant.user.js
// @downloadURL  https://github.com/Skipper442/LMSAssistant/raw/refs/heads/Collections/LMSAssistant.user.js
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

    if (location.href.includes('CustomerDetails.aspx?')) {
        togglepin();

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

                obs.disconnect(); // stop observing
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

    const isPinned = (text, type) => {
        const key = `pinned_${type}`;
        const list = JSON.parse(localStorage.getItem(key) || "[]");
        return list.includes(text);
    };

    const createControlPanel = () => {
        if (document.getElementById(PANEL_ID)) return;

        const sendBtn = document.querySelector('input[id^="ctl00_LoansRepeater_Btn_DoLetterActionSend_"]');
        const previewBtn = document.querySelector('input[id^="ctl00_LoansRepeater_Btn_DoLetterActionPreview_"]');

        if (!sendBtn || !previewBtn) return;

        const panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.style.marginLeft = '10px';
        panel.style.display = 'inline-block';

        const labelText = document.createElement('span');
        labelText.textContent = "Categories:";
        labelText.style.marginRight = "10px";

        const manageBtn = document.createElement('button');
        manageBtn.type = 'button';
        manageBtn.innerHTML = '📌';
        manageBtn.title = 'Favorites';
        manageBtn.style.marginRight = "10px";
       manageBtn.style.background = "transparent";
manageBtn.style.border = "none";
manageBtn.style.padding = "0";
manageBtn.style.fontSize = "18px";
manageBtn.style.cursor = "pointer";
manageBtn.style.color = "inherit"; // успадковує текстовий колір з LMS

        manageBtn.style.cursor = "pointer";
        manageBtn.onclick = (e) => {
            e.preventDefault();
            showFavoritesPopup();
        };

        const pinnedToggle = document.createElement("label");
        pinnedToggle.style.marginRight = "10px";
        const pinnedChecked = JSON.parse(localStorage.getItem("show_only_pinned") || "false");
        pinnedToggle.innerHTML = `<input type="checkbox" id="showOnlyPinned" style="margin-right:5px;" ${pinnedChecked ? "checked" : ""}>Show only pinned`;

        panel.appendChild(manageBtn);
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

        panel.appendChild(pinnedToggle);

        sendBtn.parentElement.insertBefore(panel, sendBtn.nextSibling);

        document.querySelector("#showOnlyPinned").addEventListener("change", (e) => {
            localStorage.setItem("show_only_pinned", e.target.checked);
            filterSelectOptions();
        });
    };

    const filterSelectOptions = () => {
        const selectId = getLetterSelectId();
        if (!selectId) return;

        const select = document.querySelector(selectId);
        if (!select) return;

        const letterType = getSelectedLetterType();
        const showOnlyPinned = JSON.parse(localStorage.getItem("show_only_pinned") || "false");

        const marketingLabel = [...document.querySelectorAll(`#${PANEL_ID} label`)].find(lbl => lbl.dataset.category === "Marketing Letters");
        if (marketingLabel) {
            marketingLabel.style.display = (letterType === "textmessage") ? "none" : "inline-block";
        }

        let currentCategory = null;
        Array.from(select.options).forEach(option => {
            if (!option.dataset.originalText) {
                option.dataset.originalText = option.textContent.trim().replace("📌", "").trim();
            }
            const text = option.dataset.originalText;
            const isPinnedNow = isPinned(text, letterType);

            if (rawCategories.some(cat => text === `-- ${cat} --`)) {
                currentCategory = rawCategories.find(cat => text === `-- ${cat} --`);
                option.style.display = showOnlyPinned ? 'none' : '';
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

            if (showOnlyPinned) {
                show = isPinnedNow;
            }

            option.style.display = show ? '' : 'none';
            option.textContent = isPinnedNow ? `${text} 📌` : text;
        });
    };

    const showFavoritesPopup = () => {
        const letterType = getSelectedLetterType();
        const selectId = getLetterSelectId();
        const select = document.querySelector(selectId);
        if (!select) return;

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.2)";
        overlay.style.zIndex = "99999";

        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.top = "20%";
        popup.style.left = "50%";
        popup.style.transform = "translateX(-50%)";
        popup.style.background = "#fff";
        popup.style.border = "2px solid #2e9fd8";
        popup.style.padding = "20px";
        popup.style.zIndex = "100000";
        popup.style.boxShadow = "0 5px 20px rgba(0,0,0,0.5)";
        popup.style.maxHeight = "400px";
        popup.style.overflowY = "auto";
        popup.onclick = e => e.stopPropagation();

        const title = document.createElement("h3");
        title.textContent = `📌 Manage favorites (${letterType === "send" ? "Email" : "TXT"})`;
        title.style.marginBottom = "15px";
        popup.appendChild(title);

        const selectAllBtn = document.createElement("button");
        selectAllBtn.textContent = "Select All";
        selectAllBtn.style.marginBottom = "10px";
        selectAllBtn.style.background = "#2e9fd8";
        selectAllBtn.style.color = "#fff";
        selectAllBtn.style.border = "none";
        selectAllBtn.style.padding = "4px 10px";
        selectAllBtn.style.cursor = "pointer";
        selectAllBtn.onclick = () => {
            const checkboxes = popup.querySelectorAll("input[type='checkbox']");
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            checkboxes.forEach(cb => { cb.checked = !allChecked; });
        };
        popup.appendChild(selectAllBtn);

        const pinnedKey = `pinned_${letterType}`;
        const currentPinned = new Set(JSON.parse(localStorage.getItem(pinnedKey) || "[]"));

        Array.from(select.options).forEach(option => {
            const text = (option.dataset.originalText || option.textContent.trim().replace("📌", "").trim());
            if (!text || text.startsWith("--")) return;

            const label = document.createElement("label");
            label.style.display = "block";
            label.style.marginBottom = "4px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = currentPinned.has(text);
            checkbox.style.marginRight = "6px";

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(text));
            popup.appendChild(label);
        });

        const btnContainer = document.createElement("div");
        btnContainer.style.marginTop = "15px";
        btnContainer.style.textAlign = "right";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Save";
        saveBtn.style.marginRight = "10px";
        saveBtn.style.padding = "5px 12px";
        saveBtn.style.border = "none";
        saveBtn.style.background = "#2e9fd8";
        saveBtn.style.color = "#fff";
        saveBtn.style.cursor = "pointer";
        saveBtn.onclick = () => {
            const checkboxes = popup.querySelectorAll("input[type='checkbox']");
            const newPinned = [];

            checkboxes.forEach(cb => {
                const label = cb.parentElement;
                const text = label.textContent.trim();
                if (cb.checked) {
                    newPinned.push(text);
                }
            });

            localStorage.setItem(pinnedKey, JSON.stringify(newPinned));
            filterSelectOptions();
            overlay.remove();
        };

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "Close";
        closeBtn.style.padding = "5px 12px";
        closeBtn.style.border = "none";
        closeBtn.style.background = "#2e9fd8";
        closeBtn.style.color = "#fff";
        closeBtn.style.cursor = "pointer";
        closeBtn.onclick = () => overlay.remove();

        btnContainer.appendChild(saveBtn);
        btnContainer.appendChild(closeBtn);
        popup.appendChild(btnContainer);

        overlay.appendChild(popup);
        overlay.onclick = () => overlay.remove();
        document.body.appendChild(overlay);
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
/*** ============ Copy/Paste LMS (Stable with Observer) ============ ***/

if (MODULES.copyPaste && location.href.includes('CustomerDetails')) {
    function isUSPhoneNumber(str) {
        return /^\(?(\d{3})\)?[- .]?(\d{3})[- .]?(\d{4})$/.test(str);
    }

    function displayUSPhoneNumbers() {
        const text = document.body.innerText;
        const matches = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g);
        if (!matches) {
            alert("No phone numbers found on this page.");
            return;
        }

        const usPhoneNumbers = matches.filter(isUSPhoneNumber);
        if (usPhoneNumbers.length === 0) {
            alert("No US phone numbers found on this page.");
        } else {
            const phoneNumber = "111" + usPhoneNumbers[Math.min(1, usPhoneNumbers.length - 1)];
            navigator.clipboard.writeText(phoneNumber)
                .then(() => console.log("Copied: " + phoneNumber))
                .catch(err => console.error("Failed to copy:", err));
        }
    }

    function createCopyButton() {
        if (document.getElementById("copyLmsBtn")) return;

        const button = document.createElement("button");
        button.id = "copyLmsBtn";
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
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontFamily: "Arial, Helvetica, sans-serif"
        });

        button.onclick = displayUSPhoneNumbers;
        document.body.appendChild(button);
    }

    // Стежимо за появою тіла сторінки та кнопки "Send"
    const observer = new MutationObserver(() => {
        const targetReady = document.querySelector('#ctl00_Span_CellPhone') || document.querySelector('#ContactSection');
        if (targetReady) {
            createCopyButton();
            observer.disconnect(); // лише один раз
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
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
