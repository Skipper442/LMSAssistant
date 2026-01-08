// ==UserScript==
// @name         LMS Assistant PRO for Back Office (GitHub)
// @namespace    http://tampermonkey.net/
// @author       Liam Moss and Jack Tyson
// @version      1.48
// @description  LMS Assistant PRO with Back Office modules only
// @icon         https://raw.githubusercontent.com/Skipper442/CC-icon/main/Credit-cube-logo.png
// @match        https://apply.creditcube.com/*
// @match        https://portal.decisionlogic.com/CreateRequest.aspx*
// @updateURL    https://github.com/Skipper442/LMSAssistant/raw/refs/heads/BackOffice/LMSAssistant.user.js
// @downloadURL  https://github.com/Skipper442/LMSAssistant/raw/refs/heads/BackOffice/LMSAssistant.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      api.creditsense.ai
// @run-at       document-idle
// ==/UserScript==


(function () {
    'use strict';

    // ===== Version Changelog Popup =====
    const CURRENT_VERSION = "1.48";

 const changelog = [
  
  'Fixed — Max Exposure Module '
 
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

const MODULES = {
  lmsAssistant: true, // Logic will apply but module is hidden
  emailFilter: true,
  qcSearch: true,
  ibvShortener: true,
  remarkFilter: true,
  lmsToDlAutofill: true,
  maxExposure: true,
  overpaidCheck: true,
  crmStatusCleaner: true
};

const MODULE_LABELS = {
  emailFilter: 'Email Filter',
  qcSearch: 'QC Search',
  ibvShortener: 'IBV Shortener',
  lmsToDlAutofill: 'Register Copy Buttons',
  remarkFilter: 'Remark Filter',
  maxExposure: 'Max Exposure',
  overpaidCheck: 'Overpaid Check',
  crmStatusCleaner: 'Loan Status Cleaner'
};

const MODULE_DESCRIPTIONS = {
  lmsAssistant: 'Highlights states, manages call hours',
  emailFilter: 'Filters the list of email templates',
  qcSearch: 'QC Search — quick phone-based lookup',
  ibvShortener: 'Allows to shorten IBV/ESIG links and insert into TXT preview',
  lmsToDlAutofill: 'Adds buttons to copy customer info for 3rd party registration and verification',
  remarkFilter: 'Hides unnecessary loan remarks, keeps only critical ones',
  maxExposure: 'Adds button to allow you calculate Max Exposure directly in LMS ',
  overpaidCheck: "Checks overpaid status and options for potential refinance",
  crmStatusCleaner: 'Reduces the list of loan statuses'
};


Object.keys(MODULES).forEach(key => {
        const saved = localStorage.getItem(`lms_module_${key}`);
        if (saved !== null) MODULES[key] = JSON.parse(saved);
    });

 /*** ============ TopMenu ============ ***/
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
        newMenuItem.innerHTML = '&nbsp;🛠️ LMS Assistant PRO (Back Office)&nbsp;';
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

        const dropdown = document.createElement('div');
        dropdown.id = 'lmsDropdownMenu';
        Object.assign(dropdown.style, {
            display: 'none',
            position: 'absolute',
            width: '260px',
            borderCollapse: 'collapse',
            fontFamily: '"Segoe UI", Arial, sans-serif',
            fontSize: '11px',
            textTransform: 'uppercase',
            textAlign: 'left',
            textShadow: '1px 1px #000',
            color: 'white',
            backgroundImage: 'url(Images/submenu-back.png)',
            backgroundRepeat: 'repeat-x',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            border: 'none',
            borderRadius: 'none',
            zIndex: '9999',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
        });


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
  background-color: #4CAF50;
}
.lms-switch input:checked + .lms-slider:before {
  transform: translateX(18px);
}
`;
        document.head.appendChild(style);


        Object.keys(MODULES).forEach(key => {
            if (key === 'lmsAssistant') return;
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

            const moduleName = document.createElement('span');
            moduleName.textContent = MODULE_LABELS[key];

            // Info icon
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

        // "New Ideas / Bug Report"
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

    // ==== ЛОГІКА ЛІВОГО МЕНЮ (toggle) ====

    const MENU_STORAGE_KEY = 'cc_left_menu_hidden'; // "true"/"false"

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

        // стилі додаємо один раз
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

        // уникаємо дублювання кнопки
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

    // ====== Далі існуючий функціонал Bria / попапів / репортів ======

    function getLocalTime(state) {
        const currTime = new Date();
        return currTime.toLocaleTimeString('en-US', { timeZone: tzData[state], hour12: false });
    }

    function isCallable(state) {
        const time = getLocalTime(state);
        return time > callHours.start && time < callHours.end;
    }

    function makePhoneClickable(phoneEl) {
        if (!phoneEl || phoneEl.dataset.briaLinked) return null;

        const rawNumber = phoneEl.textContent.trim();
        const sanitizedNumber = rawNumber.replace(/[^\d]/g, '');
        if (sanitizedNumber.length < 7) return null;

        const span = document.createElement('span');
        span.textContent = rawNumber;
        span.title = 'Click to call via Bria';
        span.style.cursor = 'pointer';
        span.style.display = 'inline';
        span.style.textDecoration = 'underline';
        span.style.textUnderlineOffset = '2px';
        span.style.transition = 'opacity 0.2s ease, text-decoration-color 0.2s ease';
        span.style.textDecorationColor = 'inherit';
        span.className = phoneEl.className;

        span.onmouseover = () => {
            span.style.opacity = '0.8';
            span.style.textDecorationColor = '#28a745';
        };
        span.onmouseout = () => {
            span.style.opacity = '1';
            span.style.textDecorationColor = 'inherit';
        };

        span.onclick = () => {
            const number = `sip:211${sanitizedNumber}`;

            const isFirstTime = !localStorage.getItem('briaConfirmed');

            if (isFirstTime) {
                localStorage.setItem('briaConfirmed', 'true');
                window.open(number, '_blank');
                alert("✅ Please allow Bria to open and check 'Always allow'.\n\nNext time, call will be automatic.");
            } else {
                const popup = window.open('', '_blank', 'width=1,height=1,left=9999,top=9999');
                if (popup) {
                    popup.document.write(`
                        <html>
                            <head><title></title></head>
                            <body>
                                <script>
                                    setTimeout(() => { location.href = "${number}"; }, 100);
                                    setTimeout(() => { window.close(); }, 2000);
                                <\/script>
                            </body>
                        </html>
                    `);
                } else {
                    alert("The pop-up has been blocked. Please allow it in your browser.");
                }
            }
        };

        phoneEl.replaceWith(span);
        span.dataset.briaLinked = 'true';
        return span;
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
            marginTop: "10px", padding: "4px 12px", border: "1px solid #a27c33", borderRadius: "4px",
            background: "#5c4400", backgroundImage: "url(Images/global-button-back.png)", backgroundRepeat: "repeat-x",
            color: "#fff", fontWeight: "bold", cursor: "pointer", fontFamily: "Arial, Helvetica, sans-serif"
        });
        closeBtn.onclick = () => box.remove();

        Object.assign(box.style, {
            position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)",
            backgroundColor: "#fff3cd", color: "#5c4400", padding: "15px 25px", borderRadius: "10px",
            fontSize: "15px", fontFamily: "Segoe UI, sans-serif", fontWeight: "500", zIndex: "99999",
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)", maxWidth: "90%", textAlign: "center"
        });

        box.appendChild(header);
        box.appendChild(text);
        box.appendChild(closeBtn);
        document.body.appendChild(box);
    }

    if (location.href.includes('CustomerDetails.aspx?')) {
        togglepin();

        // ініціалізація toggle лівого меню на сторінці клієнта
        initLeftMenuToggle();

        const observer = new MutationObserver(() => {
            const custCell = document.querySelector('#ContactSection .ProfileSectionTable tbody tr:nth-child(2) td:nth-child(4)');
            const cellPhone = document.querySelector('#ctl00_Span_CellPhone strong');
            const homePhone = document.querySelector('#ctl00_Span_HomePhone strong');
            const sendBtn = document.querySelector('input[id^="ctl00_LoansRepeater_Btn_DoLetterActionSend_"]');
            const statusElem = document.querySelector('#ctl00_LoansRepeater_Span_Loan_Status_0');
            const container = statusElem?.closest('td');
            const headerDiv = document.querySelector("div.Header");
            const profileTable = document.querySelector("table.ProfileProperties");

            if (!custCell || !cellPhone || !homePhone || !sendBtn || !headerDiv || !profileTable) return;

            const custState = custCell.textContent.trim().substring(0, 2);
            const unsupportedStates = ['GA', 'VA', 'PA', 'IL'];
            if (unsupportedStates.includes(custState)) {
                showStyledPopup("Unsupported State", [`Customer from ${custState}. Reloan not allowed.`], true);
            }

            [cellPhone, homePhone].forEach(phone => {
                const span = makePhoneClickable(phone);
                if (span) {
                    span.style.fontWeight = '800';
                    span.style.color = isCallable(custState) ? 'green' : 'red';
                }
            });

            const followUps = Array.from(document.querySelectorAll(".tr-followup td.td1")).map(td => td.innerText.trim());
            if (followUps.length > 0) {
                showStyledPopup("Follow-Up Reminder", followUps);
            }

            const notesButton = document.querySelector('#ctl00_LoansRepeater_NotesLink_0');
            const containerId = document.querySelector('#LastLoanSection [id^="loan_"]')?.id;
            if (!notesButton || !containerId) return;

            const notesSpan = notesButton.parentElement;
            const statusText = container?.innerText || '';

            if (statusText.includes("AA Call In Progress") && !document.getElementById("cancelVoiceBtn")) {
                const [, loanId] = containerId.split('_');

                const cancelBtn = document.createElement("input");
                cancelBtn.type = "button";
                cancelBtn.id = "cancelVoiceBtn";
                cancelBtn.value = "Cancel Voice Bot Call";
                Object.assign(cancelBtn.style, {
                    marginRight: "6px", padding: "4px 8px", fontSize: "12px", fontWeight: "bold",
                    fontFamily: "Arial, Helvetica, sans-serif", background: "#f33", color: "#fff",
                    border: "1px solid #a00", cursor: "pointer"
                });

                cancelBtn.onclick = function () {
                    if (!confirm("Are you sure you want to cancel voice bot call?")) return;

                    if (!document.getElementById('loader-style')) {
                        const style = document.createElement('style');
                        style.id = 'loader-style';
                        style.innerHTML = `
                            .loader-container {
                                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                                background-color: rgba(255,255,255,0.7); display: flex;
                                justify-content: center; align-items: center; z-index: 9999;
                            }
                            .loader {
                                border: 5px solid #f3f3f3; border-top: 5px solid #3498db;
                                border-radius: 50%; width: 50px; height: 50px;
                                animation: spin 2s linear infinite;
                            }
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }`;
                        document.head.appendChild(style);
                    }

                    const loaderContainer = document.createElement("div");
                    loaderContainer.className = "loader-container";
                    loaderContainer.id = "page-loader";
                    const loader = document.createElement("div");
                    loader.className = "loader";
                    loaderContainer.appendChild(loader);
                    document.body.appendChild(loaderContainer);

                    const domain = "https://ibv.creditsense.ai";
                    const width = 600, height = 400;
                    const left = (screen.width - width) / 2;
                    const top = (screen.height - height) / 2;

                    const newWindow = window.open(
                        `${domain}/cancel-voice-bot-call?layout=embedded&loanId=${loanId}`,
                        'newWindow',
                        `width=${width},height=${height},left=${left},top=${top},location=no`
                    );

                    const timer = setInterval(() => {
                        if (newWindow.closed) {
                            clearInterval(timer);
                            location.reload();
                        }
                    }, 100);

                    const listener = function (event) {
                        if (event.origin !== domain) return;
                        window.removeEventListener("message", listener);
                        newWindow.close();
                    };
                    window.addEventListener("message", listener);
                };

                notesSpan.before(cancelBtn);
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
    const params = new URL(document.location.href).searchParams;
    const action = params.get("action");
    const mode = params.get("mode");
    const letterId = params.get("letterid");
    const allowedIds = ["120", "139", "620"];
    const GRAPHQL_ENDPOINT = 'https://api.creditsense.ai/';
    const SHORTENER_DOMAIN = 'tap.cy';
    const API_KEY_STORAGE_KEY = 'shorturl_api_key';

    // === Use hardcoded API key ===
    const apiKey = '845112af-3685-4cd1-b82b-e2adfc24eb1e';

    if (action === "textmessage" && mode === "preview" && allowedIds.includes(letterId)) {
        const parseLMSDateFromCDT = (dateStr) => {
            const [datePart, timePart, ampm] = dateStr.trim().split(/\s+/);
            const [month, day, year] = datePart.split("/").map(Number);
            let [hour, minute, second] = timePart.split(":" ).map(Number);
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
                        const pattern = /https:\/\/creditcube\.com\/(ibv|esig)\?t=(\[token_aes_cbc\]|[a-zA-Z0-9]+)/;
                        const match = textarea.value.match(pattern);
                        if (match) {
                            const newText = textarea.value.replace(pattern, shortUrl);
                            textarea.value = newText;
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
                    : /https:\/\/ccwusa\.org\/[a-zA-Z0-9]{7,}/;

                let found = null;
                for (let i = rows.length - 1; i >= 0; i--) {
                    const cells = rows[i].querySelectorAll("td");
                    if (cells.length < 3) continue;
                    const dateStr = cells[0].textContent.trim();
                    const noteText = cells[2].textContent;
                    const match = noteText.match(REGEX);
                    if (match) {
                        found = { link: match[0], dateStr };
                        break;
                    }
                }

                if (!found) return alert(`❌ No ${type} link found in notes`);

                const parsed = parseLMSDateFromCDT(found.dateStr);
                const now = new Date();
                const diffMs = now.getTime() - parsed.getTime();
                const absDiff = Math.abs(diffMs);
                const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const direction = diffMs >= 0 ? "ago" : "from now";

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
                input.value = `Found ${type}: ${formatted} (${days} days and ${hours} hours ${direction})\n${found.link}`;
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
                            query: `
                                mutation ShortURL($url: String!, $domain: String!) {
                                    shortUrl(input: { url: $url, domain: $domain })
                                }
                            `,
                            variables: {
                                url,
                                domain: SHORTENER_DOMAIN
                            }
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

/* ============ LMS to DL Autofill + Register Copy ============ */
(function() {
  'use strict';

  if (!window.MODULES) window.MODULES = {};
  if (typeof MODULES.lmsToDlAutofill === 'undefined') MODULES.lmsToDlAutofill = true;
  if (!MODULES.lmsToDlAutofill) return;


  const settings = {
    triggerPII: {
      skipSecondCell: true
    }
  };

  // ---------- UI ----------
  const showPopup = (text, type = "success") => {
    try {
      const el = document.createElement('div');
      el.textContent = text;
      Object.assign(el.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: type === 'error' ? '#f8d7da' : '#d4edda',
        color: type === 'error' ? '#721c24' : '#155724',
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 'bold',
        zIndex: '9999',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      });
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    } catch(_) {}
  };

  const createStyledButton = (label, onClick, id, dlStyle = false) => {
    const btn = document.createElement("input");
    btn.type = "button";
    btn.value = label;
    if (id) btn.id = id;
    Object.assign(btn.style, dlStyle ? {
      display: "inline-block",
      margin: "0 4px 5px 0",
      lineHeight: "1.42857143",
      textAlign: "center",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
      touchAction: "manipulation",
      userSelect: "none",
      backgroundImage: "none",
      border: "1px solid transparent",
      borderRadius: "4px",
      WebkitAppearance: "button",
      cursor: "pointer",
      backgroundColor: "#166b9d",
      color: "white",
      padding: "3px 6px",
      fontSize: "12px",
      fontWeight: "normal"
    } : {
      padding: "4px",
      fontFamily: "Arial, Helvetica, sans-serif",
      fontWeight: "bold",
      fontSize: "12px",
      border: "1px solid #2e9fd8",
      background: "#2e9fd8 url(Images/global-button-back.png) left top repeat-x",
      color: "#DFDFDF",
      cursor: "pointer",
      marginLeft: "8px"
    });
    btn.addEventListener('click', onClick);
    return btn;
  };

  const waitForElement = (selector, cb) => {
    const el = document.querySelector(selector);
    if (el) { cb(el); return; }
    const mo = new MutationObserver(() => {
      const n = document.querySelector(selector);
      if (n) { mo.disconnect(); cb(n); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  };


  const safeText = sel => document.querySelector(sel)?.textContent?.trim() || '';
  const toUpper = s => (s || '').toUpperCase();
  const onlyDigits = s => (s || '').match(/\d+/)?.[0] || '';
  const stateAbbr = s => (s || '').toUpperCase().match(/[A-Z]{2}/)?.[0] || '';

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { return false; }
  };


  if (location.href.includes("CustomerDetails.aspx")) {

    const injectLMSButton = () => {
      waitForElement("#ctl00_EditBankInformationLink", (referenceNode) => {
        if (document.getElementById("copyForDLBtn")) return;

        const wrapper = document.createElement("span");
        wrapper.style.display = "inline-flex";
        wrapper.style.alignItems = "center";
        wrapper.style.gap = "4px";

        referenceNode.parentNode.insertBefore(wrapper, referenceNode);
        wrapper.appendChild(referenceNode);

        const button = createStyledButton("Copy info", async () => {
          const customerId = safeText('#mainpropertiesview > table:nth-child(3) td:nth-child(4)');
          const fullName = safeText('#maincontent_Span_Name');
          const [firstName, ...rest] = fullName.split(" ");
          const lastName = rest.join(" ") || "";
          const accountNumber = safeText('#BankSection > table.ProfileSectionTable > tbody > tr:nth-child(6) > td:nth-child(2)');
          const routingNumber = safeText('#BankSection > table.ProfileSectionTable > tbody > tr:nth-child(5) > td:nth-child(2)');
          const email = safeText('#ctl00_Span_Email');
          const phone = safeText('#ctl00_Span_CellPhone > span');
          const data = { customerId, firstName, lastName, accountNumber, routingNumber, email, phone };
          try {
            await navigator.clipboard.writeText(JSON.stringify(data));
            showPopup("✅ Info copied to clipboard");
          } catch {
            showPopup("❌ Clipboard copy failed", "error");
          }
        }, "copyForDLBtn");

        wrapper.appendChild(button);
      });
    };


    const injectRegisterButtons = () => {
      const extractMainRow = () => {
        const name = toUpper(safeText('#maincontent_Span_Name'));
        const customerId = safeText('#mainpropertiesview > table:nth-child(3) > tbody > tr > td > table > tbody > tr:nth-child(1) > td:nth-child(4)');
        const ssnRaw = safeText('#mainpropertiesview > table:nth-child(3) > tbody > tr > td > table > tbody > tr:nth-child(1) > td:nth-child(2) > b');
        const dob = safeText('#ContactSection > table.ProfileSectionTable > tbody > tr:nth-child(9) > td:nth-child(4)');
        const email = safeText('#ctl00_Span_Email');
        const last4 = ssnRaw.slice(-4);
        const ssnMasked = `xxx-xx-${last4}`;
        return [name, customerId, '', ssnMasked, dob, email].join('\t');
      };

      const extractIdStateLoanRow = () => {
        const name = toUpper(safeText('#maincontent_Span_Name'));
        const customerId = safeText('#mainpropertiesview > table:nth-child(3) > tbody > tr > td > table > tbody > tr:nth-child(1) > td:nth-child(4)');
        const stateRaw = safeText('#ContactSection > table.ProfileSectionTable > tbody > tr:nth-child(2) > td:nth-child(4)');
        const state = stateAbbr(stateRaw);
        const loanHeader = Array.from(document.querySelectorAll('div.Header')).find(div => /Loan#\s*\d+/.test(div.textContent));
        const loanId = loanHeader?.textContent?.match(/Loan#\s*(\d+)/)?.[1] || '';
        return [customerId, state, loanId, name].join('\t');
      };

      const nameSpan = document.querySelector("#maincontent_Span_Name");
      if (!nameSpan || document.getElementById("copyMainRowBtn")) return;

      const mainBtn = createStyledButton("3rd Party Register Info", () => {
        navigator.clipboard.writeText(extractMainRow()).then(() => showPopup("✅ Copied!")).catch(() => showPopup("❌ Clipboard copy failed", "error"));
      }, "copyMainRowBtn");

      const idBtn = createStyledButton("Check Registration Info", () => {
        navigator.clipboard.writeText(extractIdStateLoanRow()).then(() => showPopup("✅ Copied!")).catch(() => showPopup("❌ Clipboard copy failed", "error"));
      }, "copyIDStateBtn");

      const wrapper = document.createElement("span");
      wrapper.style.display = "inline-flex";
      wrapper.style.alignItems = "center";
      wrapper.style.gap = "6px";
      wrapper.style.marginLeft = "8px";
      wrapper.appendChild(mainBtn);
      wrapper.appendChild(idBtn);
      nameSpan.after(wrapper);
    };


    const injectTriggerPIIButton = () => {
      waitForElement("#maincontent_Span_Name", (nameSpan) => {
        if (document.getElementById("copyTriggerPIIBtn")) return;

        const btn = createStyledButton("Copy Trigger PII", async () => {
          const stateRaw = safeText('#ContactSection > table.ProfileSectionTable > tbody > tr:nth-child(2) > td:nth-child(4)');
          const state = stateAbbr(stateRaw);
          const headerNode = Array.from(document.querySelectorAll('div.Header')).find(div => /Loan#\s*\d+/.test(div.textContent));
          const loanId = headerNode?.textContent?.match(/Loan#\s*(\d+)/)?.[1] || '';
          const fullName = toUpper(safeText('#maincontent_Span_Name'));


          const sep12 = settings.triggerPII.skipSecondCell ? '\t\t' : '\t';
          const tsv = state + sep12 + loanId + '\t' + fullName;

          const ok = await copyText(tsv);
          showPopup(ok ? "✅ Trigger PII copied (TSV)" : "❌ Clipboard copy failed", ok ? "success" : "error");
        }, "copyTriggerPIIBtn");

        const siblingWrapper = nameSpan.nextElementSibling;
        if (siblingWrapper && siblingWrapper.tagName === 'SPAN') siblingWrapper.appendChild(btn);
        else {
          const wrap = document.createElement("span");
          wrap.style.display = "inline-flex";
          wrap.style.alignItems = "center";
          wrap.style.gap = "6px";
          wrap.style.marginLeft = "8px";
          wrap.appendChild(btn);
          nameSpan.after(wrap);
        }
      });
    };

    setTimeout(() => {
      injectLMSButton();
      injectRegisterButtons();
      injectTriggerPIIButton();
    }, 500);
  }

  // ---------- CreateRequest (existing) ----------
  if (location.href.includes("CreateRequest.aspx")) {
    const insertButtons = () => {
      const pasteTarget = document.querySelector(
        "#ctl00_ctl00_MainContent_MainContent_pnlSections23 > table:nth-child(1) > tbody > tr:nth-child(4) > td:nth-child(3)"
      );
      const clearTarget = document.querySelector(
        "#ctl00_ctl00_MainContent_MainContent_pnlSections23 > table:nth-child(1) > tbody > tr:nth-child(5) > td:nth-child(3)"
      );
      if (!pasteTarget || !clearTarget) return;

      if (!document.getElementById("pasteFromLMSBtn")) {
        const pasteBtn = createStyledButton("Paste from LMS", async () => {
          try {
            const text = await navigator.clipboard.readText();
            const data = JSON.parse(text);
            const setValue = (sel, val) => { const el = document.querySelector(sel); if (el) el.value = val; };
            setValue('#tbCustomerId', data.customerId);
            setValue('#tbFirstName', data.firstName);
            setValue('#tbLastName', data.lastName);
            setValue('#tbAccountNum', data.accountNumber);
            setValue('#tbRoutingNum', data.routingNumber);
            setValue('#ctl00_ctl00_MainContent_MainContent_tbEmailAddress', data.email);
            setValue('#ctl00_ctl00_MainContent_MainContent_tbPhoneNumber', data.phone);
            showPopup("✅ Info pasted from clipboard");
          } catch {
            showPopup("⚠️ Invalid or empty clipboard", "error");
          }
        }, "pasteFromLMSBtn", true);
        pasteTarget.appendChild(pasteBtn);
      }

      if (!document.getElementById("clearLMSFieldsBtn")) {
        const clearBtn = createStyledButton("Clear All Fields", () => {
          const clearValue = (sel) => { const el = document.querySelector(sel); if (el) el.value = ''; };
          ['#tbCustomerId', '#tbFirstName', '#tbLastName', '#tbAccountNum',
           '#tbRoutingNum', '#ctl00_ctl00_MainContent_MainContent_tbEmailAddress',
           '#ctl00_ctl00_MainContent_MainContent_tbPhoneNumber'].forEach(clearValue);
          showPopup("Fields cleared");
        }, "clearLMSFieldsBtn", true);
        clearTarget.appendChild(clearBtn);
      }
    };

    const observer = new MutationObserver(insertButtons);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(insertButtons, 500);
  }

})();

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



/*** ============ CRM Status Cleaner (module) ============ ***/
if (MODULES.crmStatusCleaner && location.href.includes('EditStatus.aspx')) {

  // Конфіг whitelist
  const RAW_ALLOWED = [
    'Frozen','Void CRA Reporting','CRA Reporting Accommodation (AW)','Bankruptcy',
    'In-House Collections','Centralized Collections','Never Answered','TBW',
    'Pending Approval','Courtesy Bump Given','Reduced Payment Given','Customer Did Not Apply',
    'Incorrect Phone','Suspected Fraud','TBC','FRAUD!','Do Not Contact','For Review',
    'Do Not Loan','Escalation','Debt Consolidation Company','Revoke ACH','Revoke RCC',
    'Military','FP-CLM','PBK(CRP)'
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
      /* Вбудовані опції для Bankruptcy (ледачий рендер) */
      #${COMPACT_ID} .inline-controls { display:none; align-items:center; gap:8px; margin-left:16px; }
      #${COMPACT_ID} .inline-controls select { margin:0; }
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


  function findOrigBankruptcyInput(scopeEl) {
    const lbl = Array.from(scopeEl.querySelectorAll('label[for]'))
      .find(l => normalize(l.textContent) === 'bankruptcy');
    return lbl ? document.getElementById(lbl.getAttribute('for')) : null;
  }
  function findOriginalStage() { return document.getElementById('maincontent_BankruptcyStage'); }
  function findOriginalChapter() { return document.getElementById('maincontent_BankruptcyChapter'); }


  function cloneSelectWithSync(orig, id) {
    if (!orig) return null;
    let dup = document.getElementById(id);
    if (!dup) dup = document.createElement('select');
    dup.id = id;

    const rebuild = () => {
      dup.innerHTML = '';
      for (const opt of orig.options) {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.textContent;
        dup.appendChild(o);
      }
      dup.value = orig.value;
    };
    rebuild();

    dup.onchange = () => {
      if (orig.value !== dup.value) {
        orig.value = dup.value;
        orig.dispatchEvent(new Event('change', { bubbles: true }));
        orig.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };
    const sync = () => {
      const a = Array.from(orig.options).map(o => o.value).join('|');
      const b = Array.from(dup.options).map(o => o.value).join('|');
      if (a !== b) rebuild(); else dup.value = orig.value;
    };
    orig.addEventListener('change', sync);
    orig.addEventListener('input', sync);

    return dup;
  }

  function buildList(container, title, items, scopeEl) {
    container.innerHTML = '';
    const t = document.createElement('div');
    t.className = 'labelTitle';
    t.textContent = title;
    const list = document.createElement('div');
    list.className = 'stack';
    container.appendChild(t);
    container.appendChild(list);

    const origBk = findOrigBankruptcyInput(scopeEl);
    const stageOrig = findOriginalStage();
    const chapterOrig = findOriginalChapter();

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

        if (it.key === 'bankruptcy') {
          toggleInlineControls(row, cb.checked);
        }
      });

      row.appendChild(cb);
      row.appendChild(lb);

      if (it.key === 'bankruptcy') {
        let inline = row.querySelector('.inline-controls');
        if (!inline) {
          inline = document.createElement('span');
          inline.className = 'inline-controls';

          if (stageOrig) {
            const sLbl = document.createElement('span'); sLbl.textContent = 'Stage:';
            const sDup = cloneSelectWithSync(stageOrig, 'crmDupRow_BankruptcyStage');
            if (sDup) { sDup.style.margin = '0'; inline.appendChild(sLbl); inline.appendChild(sDup); }
          }
          if (chapterOrig) {
            const cLbl = document.createElement('span'); cLbl.textContent = 'Chapter:';
            const cDup = cloneSelectWithSync(chapterOrig, 'crmDupRow_BankruptcyChapter');
            if (cDup) { cDup.style.margin = '0'; inline.appendChild(cLbl); inline.appendChild(cDup); }
          }
          row.appendChild(inline);
        }


        const initiallyOn = cb.checked || (origBk && origBk.checked);
        toggleInlineControls(row, initiallyOn);


        if (origBk) {
          origBk.addEventListener('change', () => toggleInlineControls(row, origBk.checked));
        }
      }

      list.appendChild(row);
    }

    function toggleInlineControls(row, on) {
      const wrap = row.querySelector('.inline-controls');
      if (wrap) wrap.style.display = on ? 'inline-flex' : 'none';
    }
  }

  function ensureToggler(mode, onToggle) {
    let btn = document.getElementById(TOGGLER_ID);
    if (!btn) {
      btn = document.createElement('button');
      btn.id = TOGGLER_ID;
      document.body.appendChild(btn);
    }
    const render = () => { btn.innerHTML = `BackOffice mode: <span class="state">${mode === 'on' ? 'On' : 'Off'}</span>`; };
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
    buildList(compact, 'Selected statuses', allowedItems, scopeEl);
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
    
})();
