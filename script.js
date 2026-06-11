/* ============================================
   SAMPSON DESTINY FOOTBALL AGENCY
   Premium JavaScript Application
   ============================================ */

const app = (function() {
    'use strict';

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const state = {
        currentPage: 'landing',
        currentAgreement: null, // 'commission' | 'representation'
        currentStep: 0,
        formData: {},
        signatureData: null,
        theme: localStorage.getItem('sda_theme') || 'dark',
        agreements: JSON.parse(localStorage.getItem('sda_agreements') || '[]'),
        isDrawing: false,
        lastX: 0,
        lastY: 0,
        canvas: null,
        ctx: null,
        hasSigned: false
    };

    // ============================================
    // AGREEMENT CONFIGURATIONS
    // ============================================
    const agreementConfigs = {
        commission: {
            title: 'Football Intermediary & Commission Agreement',
            subtitle: 'Commission-based intermediary services',
            steps: [
                {
                    title: 'Party Information',
                    description: 'Enter the details of all parties involved',
                    fields: [
                        { name: 'playerName', label: 'Player Full Name', type: 'text', required: true },
                        { name: 'playerNationality', label: 'Player Nationality', type: 'text', required: true },
                        { name: 'playerAddress', label: 'Player Address', type: 'textarea', required: true },
                        { name: 'playerContact', label: 'Player Contact Information', type: 'text', required: true, hint: 'Email and phone number' },
                        { name: 'clubName', label: 'Club Name', type: 'text', required: true },
                        { name: 'partnerAgency', label: 'Partner Agency Name', type: 'text', required: false },
                        { name: 'intermediaryName', label: 'Intermediary / Agency Name', type: 'text', required: true },
                        { name: 'intermediaryAddress', label: 'Intermediary Address', type: 'textarea', required: true },
                        { name: 'intermediaryContact', label: 'Intermediary Contact', type: 'text', required: true }
                    ]
                },
                {
                    title: 'Agreement Details',
                    description: 'Set the terms and duration of the agreement',
                    fields: [
                        { name: 'agreementDate', label: 'Agreement Date', type: 'date', required: true },
                        { name: 'transferFee', label: 'Transfer Fee (€)', type: 'number', required: false, hint: 'Leave blank for free agent deals' },
                        { name: 'annualSalary', label: 'Annual Salary (€)', type: 'number', required: false },
                        { name: 'contractDuration', label: 'Contract Duration (Years)', type: 'number', required: true },
                        { name: 'startDate', label: 'Agreement Start Date', type: 'date', required: true },
                        { name: 'endDate', label: 'Agreement End Date', type: 'date', required: true }
                    ]
                },
                {
                    title: 'Commission Structure',
                    description: 'Define the commission terms',
                    fields: [
                        { name: 'commissionTransfer', label: 'Transfer Fee Commission (%)', type: 'number', required: true, value: '3', hint: 'Standard is 3%' },
                        { name: 'commissionSalary', label: 'Annual Salary Commission (%)', type: 'number', required: true, value: '3', hint: 'Standard is 3% for free agent deals' },
                        { name: 'paymentTerms', label: 'Payment Terms', type: 'select', required: true, options: [
                            { value: 'upon_transfer', label: 'Upon Successful Transfer' },
                            { value: 'installments', label: 'In Installments' },
                            { value: 'upfront', label: 'Upfront Payment' }
                        ]},
                        { name: 'paymentDeadline', label: 'Payment Deadline (Days)', type: 'number', required: true, value: '30' }
                    ]
                },
                {
                    title: 'Legal Clauses',
                    description: 'Review and confirm legal provisions',
                    fields: [
                        { name: 'purpose', label: 'Purpose of Agreement', type: 'textarea', required: true, value: 'The purpose of this agreement is to establish the intermediary services provided by the Agency to facilitate the transfer and/or contract negotiation of the Player with the Club.' },
                        { name: 'nonCircumvention', label: 'Non-Circumvention Clause', type: 'textarea', required: true, value: 'The Parties agree not to circumvent each other in any dealings related to this agreement. Any direct contact between the Player and the Club without the Agency\'s involvement constitutes a breach of this agreement.' },
                        { name: 'confidentiality', label: 'Confidentiality Clause', type: 'textarea', required: true, value: 'All parties agree to maintain strict confidentiality regarding the terms of this agreement, financial details, and any proprietary information shared during the course of this engagement.' },
                        { name: 'governingLaw', label: 'Governing Law', type: 'select', required: true, options: [
                            { value: 'england', label: 'Laws of England and Wales' },
                            { value: 'fifa', label: 'FIFA Regulations' },
                            { value: 'swiss', label: 'Swiss Law' },
                            { value: 'other', label: 'Other (Specify in Notes)' }
                        ]},
                        { name: 'additionalNotes', label: 'Additional Notes', type: 'textarea', required: false }
                    ]
                },
                {
                    title: 'Confirmation',
                    description: 'Review and confirm all details',
                    fields: [
                        { name: 'confirmTerms', label: 'I confirm that all information provided is accurate and complete.', type: 'checkbox', required: true },
                        { name: 'confirmAuthority', label: 'I confirm that I have the legal authority to enter into this agreement.', type: 'checkbox', required: true },
                        { name: 'confirmFifa', label: 'I acknowledge that this agreement complies with FIFA regulations.', type: 'checkbox', required: true }
                    ]
                }
            ]
        },
        representation: {
            title: 'Exclusive Player Representation & Career Management Agreement',
            subtitle: 'Comprehensive career management services',
            steps: [
                {
                    title: 'Player Information',
                    description: 'Enter the player\'s personal details',
                    fields: [
                        { name: 'playerFullName', label: 'Player Full Name', type: 'text', required: true },
                        { name: 'playerNationality', label: 'Nationality', type: 'text', required: true },
                        { name: 'playerDOB', label: 'Date of Birth', type: 'date', required: true },
                        { name: 'playerPassport', label: 'Passport / ID Number', type: 'text', required: true },
                        { name: 'playerAddress', label: 'Residential Address', type: 'textarea', required: true },
                        { name: 'playerContact', label: 'Contact Information', type: 'text', required: true, hint: 'Email and phone number' },
                        { name: 'playerPosition', label: 'Playing Position', type: 'select', required: true, options: [
                            { value: 'goalkeeper', label: 'Goalkeeper' },
                            { value: 'defender', label: 'Defender' },
                            { value: 'midfielder', label: 'Midfielder' },
                            { value: 'forward', label: 'Forward' },
                            { value: 'winger', label: 'Winger' }
                        ]},
                        { name: 'currentClub', label: 'Current Club', type: 'text', required: false }
                    ]
                },
                {
                    title: 'Agency Representative',
                    description: 'Enter the agency representative details',
                    fields: [
                        { name: 'repName', label: 'Representative Full Name', type: 'text', required: true },
                        { name: 'repTitle', label: 'Representative Title', type: 'text', required: true },
                        { name: 'repLicense', label: 'FIFA License Number', type: 'text', required: true },
                        { name: 'repAddress', label: 'Agency Address', type: 'textarea', required: true },
                        { name: 'repContact', label: 'Agency Contact', type: 'text', required: true },
                        { name: 'agencyName', label: 'Agency Name', type: 'text', required: true, value: 'Sampson Destiny Football Agency' }
                    ]
                },
                {
                    title: 'Agreement Terms',
                    description: 'Define the terms of representation',
                    fields: [
                        { name: 'startDate', label: 'Agreement Start Date', type: 'date', required: true },
                        { name: 'endDate', label: 'Agreement End Date', type: 'date', required: true },
                        { name: 'exclusivity', label: 'Exclusivity Period', type: 'select', required: true, options: [
                            { value: '1_year', label: '1 Year' },
                            { value: '2_years', label: '2 Years' },
                            { value: '3_years', label: '3 Years' },
                            { value: '5_years', label: '5 Years' }
                        ]},
                        { name: 'commissionRate', label: 'Commission Rate (%)', type: 'number', required: true, value: '3', hint: 'Standard FIFA rate is 3%' },
                        { name: 'renewalTerms', label: 'Renewal Terms', type: 'textarea', required: false, value: 'This agreement may be renewed by mutual written consent of both parties at least 60 days prior to the expiration date.' }
                    ]
                },
                {
                    title: 'Player Responsibilities',
                    description: 'Define the player\'s obligations',
                    fields: [
                        { name: 'playerResponsibilities', label: 'Player Responsibilities', type: 'textarea', required: true, value: 'The Player agrees to:\n1. Maintain professional conduct at all times\n2. Provide accurate and timely information to the Agency\n3. Not engage with other agencies during the exclusivity period\n4. Attend all scheduled meetings and appointments\n5. Comply with all FIFA and club regulations' },
                        { name: 'imageRights', label: 'Image Rights', type: 'select', required: true, options: [
                            { value: 'agency_managed', label: 'Managed by Agency' },
                            { value: 'player_retained', label: 'Retained by Player' },
                            { value: 'shared', label: 'Shared Arrangement' }
                        ]},
                        { name: 'socialMedia', label: 'Social Media Obligations', type: 'textarea', required: false, value: 'The Player agrees to maintain a professional social media presence and consult with the Agency on major public statements related to their career.' }
                    ]
                },
                {
                    title: 'Agency Responsibilities',
                    description: 'Define the agency\'s obligations',
                    fields: [
                        { name: 'agencyResponsibilities', label: 'Agency Responsibilities', type: 'textarea', required: true, value: 'The Agency agrees to:\n1. Act in the best interests of the Player at all times\n2. Provide professional contract negotiation services\n3. Manage all communication with clubs and third parties\n4. Provide career development and strategic advice\n5. Ensure compliance with all FIFA regulations' },
                        { name: 'services', label: 'Additional Services', type: 'checkbox', required: false, options: [
                            { value: 'brand_management', label: 'Brand & Image Management' },
                            { value: 'legal_support', label: 'Legal Support' },
                            { value: 'financial_planning', label: 'Financial Planning' },
                            { value: 'media_training', label: 'Media Training' },
                            { value: 'career_counseling', label: 'Career Counseling' }
                        ]},
                        { name: 'performanceMetrics', label: 'Performance Metrics', type: 'textarea', required: false, value: 'The Agency will provide quarterly performance reports on contract negotiations, market positioning, and career development progress.' }
                    ]
                },
                {
                    title: 'Termination & Confidentiality',
                    description: 'Set termination and confidentiality terms',
                    fields: [
                        { name: 'terminationClause', label: 'Termination Clause', type: 'textarea', required: true, value: 'Either party may terminate this agreement with 90 days written notice. In the event of breach, immediate termination may apply subject to arbitration.' },
                        { name: 'confidentiality', label: 'Confidentiality Agreement', type: 'textarea', required: true, value: 'Both parties agree to maintain strict confidentiality regarding all financial terms, personal information, and strategic decisions discussed during the term of this agreement.' },
                        { name: 'disputeResolution', label: 'Dispute Resolution', type: 'select', required: true, options: [
                            { value: 'fifa_court', label: 'FIFA Dispute Resolution Chamber' },
                            { value: 'cas', label: 'Court of Arbitration for Sport (CAS)' },
                            { value: 'arbitration', label: 'Independent Arbitration' }
                        ]},
                        { name: 'governingLaw', label: 'Governing Law', type: 'select', required: true, options: [
                            { value: 'england', label: 'Laws of England and Wales' },
                            { value: 'fifa', label: 'FIFA Regulations' },
                            { value: 'swiss', label: 'Swiss Law' }
                        ]}
                    ]
                },
                {
                    title: 'Final Confirmation',
                    description: 'Review and confirm all details',
                    fields: [
                        { name: 'confirmTerms', label: 'I confirm that all information provided is accurate and complete.', type: 'checkbox', required: true },
                        { name: 'confirmExclusivity', label: 'I understand and agree to the exclusivity terms of this agreement.', type: 'checkbox', required: true },
                        { name: 'confirmFifa', label: 'I acknowledge that this agreement complies with FIFA regulations.', type: 'checkbox', required: true },
                        { name: 'confirmLegal', label: 'I have read and understood all legal clauses in this agreement.', type: 'checkbox', required: true }
                    ]
                }
            ]
        }
    };

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function generateId() {
        return 'sda_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    function formatCurrency(amount) {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    function showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
            error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
            warning: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
            info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="#B8860B" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
        };

        toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    function showLoading(text = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        overlay.querySelector('.loading-text').textContent = text;
        overlay.classList.add('active');
    }

    function hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    function saveToStorage() {
        localStorage.setItem('sda_agreements', JSON.stringify(state.agreements));
        localStorage.setItem('sda_theme', state.theme);
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================
    function initTheme() {
        document.body.setAttribute('data-theme', state.theme);
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', state.theme);
        localStorage.setItem('sda_theme', state.theme);
        showToast(`Switched to ${state.theme} mode`, 'info');
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById(pageId).classList.remove('hidden');
        state.currentPage = pageId;
        window.scrollTo(0, 0);
    }

    function goHome() {
        showPage('landingPage');
        state.currentAgreement = null;
        state.currentStep = 0;
        state.formData = {};
        state.signatureData = null;
        state.hasSigned = false;
    }

    function showAgreementSelection() {
        showPage('selectionPage');
    }

    function showDashboard() {
        showPage('dashboardPage');
        renderDashboard();
    }

    function closeMobileMenu() {
        document.getElementById('mobileMenu').classList.remove('active');
    }

    // ============================================
    // FORM SYSTEM
    // ============================================
    function startAgreement(type) {
        state.currentAgreement = type;
        state.currentStep = 0;
        state.formData = {};
        state.signatureData = null;
        state.hasSigned = false;

        // Load draft if exists
        const draftKey = `sda_draft_${type}`;
        const draft = localStorage.getItem(draftKey);
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                state.formData = parsed.formData || {};
                state.currentStep = parsed.currentStep || 0;
                showToast('Draft loaded successfully', 'info');
            } catch (e) {
                // ignore
            }
        }

        showPage('formPage');
        renderForm();
    }

    function renderForm() {
        const config = agreementConfigs[state.currentAgreement];
        const steps = config.steps;
        const currentStepData = steps[state.currentStep];

        // Update sidebar
        document.getElementById('formSidebarTitle').textContent = config.title;
        document.getElementById('formSidebarSubtitle').textContent = `Step ${state.currentStep + 1} of ${steps.length}`;
        renderProgressTracker();

        // Update mobile progress
        const mobileProgress = document.getElementById('mobileProgress');
        const progressPercent = ((state.currentStep + 1) / steps.length) * 100;
        mobileProgress.innerHTML = `<div class="mobile-progress-bar" style="width: ${progressPercent}%"></div>`;

        // Render form fields
        const container = document.getElementById('formStepsContainer');
        container.innerHTML = '';

        const stepDiv = document.createElement('div');
        stepDiv.className = 'form-step';
        stepDiv.innerHTML = `
            <div class="form-step-header">
                <h2>${currentStepData.title}</h2>
                <p>${currentStepData.description}</p>
            </div>
        `;

        currentStepData.fields.forEach(field => {
            const fieldHtml = renderField(field);
            stepDiv.insertAdjacentHTML('beforeend', fieldHtml);
        });

        container.appendChild(stepDiv);

        // Populate existing data
        currentStepData.fields.forEach(field => {
            if (state.formData[field.name] !== undefined) {
                const el = document.querySelector(`[name="${field.name}"]`);
                if (el) {
                    if (field.type === 'checkbox' && field.options) {
                        const values = state.formData[field.name] || [];
                        el.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                            cb.checked = values.includes(cb.value);
                        });
                    } else if (field.type === 'checkbox') {
                        el.checked = state.formData[field.name];
                    } else {
                        el.value = state.formData[field.name];
                    }
                }
            }
        });

        // Update nav buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const nextBtnText = document.getElementById('nextBtnText');

        if (state.currentStep === 0) {
            prevBtn.classList.remove('visible');
        } else {
            prevBtn.classList.add('visible');
        }

        if (state.currentStep === steps.length - 1) {
            nextBtnText.textContent = 'Continue to Signature';
        } else {
            nextBtnText.textContent = 'Next Step';
        }
    }

    function renderField(field) {
        const value = state.formData[field.name] !== undefined ? state.formData[field.name] : (field.value || '');
        const hasError = field._error ? 'error' : '';
        const errorMsg = field._error ? `<div class="form-error visible">${field._error}</div>` : '<div class="form-error"></div>';

        let input = '';

        switch (field.type) {
            case 'textarea':
                input = `<textarea name="${field.name}" class="form-textarea ${hasError}" rows="4" placeholder="Enter ${field.label.toLowerCase()}...">${value}</textarea>`;
                break;
            case 'select':
                const options = field.options.map(opt =>
                    `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`
                ).join('');
                input = `<select name="${field.name}" class="form-select ${hasError}"><option value="">Select ${field.label}</option>${options}</select>`;
                break;
            case 'checkbox':
                if (field.options) {
                    const checkedValues = Array.isArray(value) ? value : [];
                    const checkboxes = field.options.map(opt => `
                        <label class="form-checkbox">
                            <input type="checkbox" name="${field.name}" value="${opt.value}" ${checkedValues.includes(opt.value) ? 'checked' : ''}>
                            <div>
                                <div class="form-checkbox-label">${opt.label}</div>
                            </div>
                        </label>
                    `).join('');
                    input = `<div name="${field.name}">${checkboxes}</div>`;
                } else {
                    input = `<label class="form-checkbox">
                        <input type="checkbox" name="${field.name}" ${value ? 'checked' : ''}>
                        <div>
                            <div class="form-checkbox-label">${field.label}</div>
                        </div>
                    </label>`;
                }
                break;
            default:
                input = `<input type="${field.type}" name="${field.name}" class="form-input ${hasError}" value="${value}" placeholder="Enter ${field.label.toLowerCase()}...">`;
        }

        const hint = field.hint ? `<div class="form-hint">${field.hint}</div>` : '';
        const required = field.required ? '<span class="required">*</span>' : '';

        return `
            <div class="form-group">
                <label class="form-label">${field.label}${required}</label>
                ${input}
                ${hint}
                ${errorMsg}
            </div>
        `;
    }

    function renderProgressTracker() {
        const tracker = document.getElementById('progressTracker');
        const steps = agreementConfigs[state.currentAgreement].steps;

        tracker.innerHTML = steps.map((step, index) => {
            const isActive = index === state.currentStep;
            const isCompleted = index < state.currentStep;
            const statusClass = isActive ? 'active' : (isCompleted ? 'completed' : '');
            const numberContent = isCompleted
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>'
                : (index + 1);

            return `
                <div class="progress-step ${statusClass}" onclick="app.jumpToStep(${index})">
                    <div class="progress-step-number">${numberContent}</div>
                    <div class="progress-step-info">
                        <div class="progress-step-title">${step.title}</div>
                        <div class="progress-step-desc">${step.description}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function collectFormData() {
        const config = agreementConfigs[state.currentAgreement];
        const currentStepData = config.steps[state.currentStep];

        currentStepData.fields.forEach(field => {
            if (field.type === 'checkbox' && field.options) {
                const checkboxes = document.querySelectorAll(`[name="${field.name}"] input[type="checkbox"]`);
                state.formData[field.name] = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            } else if (field.type === 'checkbox') {
                const cb = document.querySelector(`[name="${field.name}"]`);
                state.formData[field.name] = cb ? cb.checked : false;
            } else {
                const el = document.querySelector(`[name="${field.name}"]`);
                if (el) state.formData[field.name] = el.value;
            }
        });
    }

    function validateStep() {
        const config = agreementConfigs[state.currentAgreement];
        const currentStepData = config.steps[state.currentStep];
        let isValid = true;

        currentStepData.fields.forEach(field => {
            field._error = null;
            const el = document.querySelector(`[name="${field.name}"]`);
            if (!el) return;

            let value;
            if (field.type === 'checkbox' && field.options) {
                const checkboxes = el.querySelectorAll('input[type="checkbox"]');
                value = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
            } else if (field.type === 'checkbox') {
                value = el.checked;
            } else {
                value = el.value.trim();
            }

            if (field.required) {
                if (field.type === 'checkbox' && field.options) {
                    if (value.length === 0) {
                        field._error = `Please select at least one option`;
                        isValid = false;
                    }
                } else if (field.type === 'checkbox') {
                    if (!value) {
                        field._error = `Please confirm this item`;
                        isValid = false;
                    }
                } else if (!value) {
                    field._error = `${field.label} is required`;
                    isValid = false;
                }
            }

            // Remove error class
            const inputEl = field.type === 'checkbox' && field.options ? el : el;
            if (inputEl && inputEl.classList) {
                inputEl.classList.remove('error');
            }
        });

        if (!isValid) {
            renderForm();
            showToast('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    function nextStep() {
        collectFormData();

        if (!validateStep()) return;

        const config = agreementConfigs[state.currentAgreement];

        if (state.currentStep < config.steps.length - 1) {
            state.currentStep++;
            renderForm();
            saveDraft();
        } else {
            saveDraft();
            showPage('signaturePage');
            initSignature();
        }
    }

    function prevStep() {
        if (state.currentStep > 0) {
            collectFormData();
            state.currentStep--;
            renderForm();
            saveDraft();
        }
    }

    function jumpToStep(index) {
        if (index >= state.currentStep) return;
        collectFormData();
        state.currentStep = index;
        renderForm();
    }

    function saveDraft() {
        const draftKey = `sda_draft_${state.currentAgreement}`;
        localStorage.setItem(draftKey, JSON.stringify({
            formData: state.formData,
            currentStep: state.currentStep,
            savedAt: new Date().toISOString()
        }));

        const indicator = document.getElementById('saveIndicator');
        if (indicator) {
            indicator.classList.add('saving');
            indicator.querySelector('span').textContent = 'Saving...';
            setTimeout(() => {
                indicator.classList.remove('saving');
                indicator.classList.add('saved');
                indicator.querySelector('span').textContent = 'Saved';
                setTimeout(() => {
                    indicator.classList.remove('saved');
                    indicator.querySelector('span').textContent = 'Auto-saved';
                }, 2000);
            }, 600);
        }
    }

    function goToForm() {
        showPage('formPage');
        renderForm();
    }

    // ============================================
    // SIGNATURE SYSTEM
    // ============================================
    function initSignature() {
        state.canvas = document.getElementById('signatureCanvas');
        state.ctx = state.canvas.getContext('2d');
        state.hasSigned = false;

        // Set canvas size to match display
        const rect = state.canvas.getBoundingClientRect();
        state.canvas.width = rect.width;
        state.canvas.height = 300;

        state.ctx.strokeStyle = '#1a1a1a';
        state.ctx.lineWidth = 2;
        state.ctx.lineCap = 'round';
        state.ctx.lineJoin = 'round';

        // Mouse events
        state.canvas.addEventListener('mousedown', startDrawing);
        state.canvas.addEventListener('mousemove', draw);
        state.canvas.addEventListener('mouseup', stopDrawing);
        state.canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        state.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        state.canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        state.canvas.addEventListener('touchend', stopDrawing);

        document.getElementById('signaturePlaceholder').classList.remove('hidden');
        document.getElementById('signatureContinueBtn').disabled = true;
        document.getElementById('signaturePreviewBox').style.display = 'none';
    }

    function getCanvasPos(e) {
        const rect = state.canvas.getBoundingClientRect();
        return {
            x: (e.clientX || e.touches[0].clientX) - rect.left,
            y: (e.clientY || e.touches[0].clientY) - rect.top
        };
    }

    function startDrawing(e) {
        state.isDrawing = true;
        const pos = getCanvasPos(e);
        state.lastX = pos.x;
        state.lastY = pos.y;
        document.getElementById('signaturePlaceholder').classList.add('hidden');
        state.canvas.parentElement.classList.add('active');
    }

    function draw(e) {
        if (!state.isDrawing) return;
        e.preventDefault();
        const pos = getCanvasPos(e);

        state.ctx.beginPath();
        state.ctx.moveTo(state.lastX, state.lastY);
        state.ctx.lineTo(pos.x, pos.y);
        state.ctx.stroke();

        state.lastX = pos.x;
        state.lastY = pos.y;
    }

    function stopDrawing() {
        if (!state.isDrawing) return;
        state.isDrawing = false;
        state.hasSigned = true;
        document.getElementById('signatureContinueBtn').disabled = false;
    }

    function handleTouchStart(e) {
        e.preventDefault();
        startDrawing(e);
    }

    function handleTouchMove(e) {
        e.preventDefault();
        draw(e);
    }

    function clearSignature() {
        if (!state.ctx) return;
        state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
        state.hasSigned = false;
        document.getElementById('signaturePlaceholder').classList.remove('hidden');
        state.canvas.parentElement.classList.remove('active');
        document.getElementById('signatureContinueBtn').disabled = true;
        document.getElementById('signaturePreviewBox').style.display = 'none';
    }

    function completeSignature() {
        if (!state.hasSigned) {
            showToast('Please sign before continuing', 'error');
            return;
        }
        state.signatureData = state.canvas.toDataURL('image/png');
        document.getElementById('signaturePreviewImg').src = state.signatureData;
        document.getElementById('signaturePreviewBox').style.display = 'block';

        setTimeout(() => {
            renderPreview();
            showPage('previewPage');
        }, 500);
    }

    function goToSignature() {
        showPage('signaturePage');
        initSignature();
    }

    // ============================================
    // PREVIEW SYSTEM
    // ============================================
    function renderPreview() {
        const config = agreementConfigs[state.currentAgreement];
        const data = state.formData;
        const container = document.getElementById('previewDocument');

        let html = `
            <h2>${config.title}</h2>
            <div class="preview-subtitle">SAMPSON DESTINY FOOTBALL AGENCY &mdash; Legal Document Preview</div>
        `;

        config.steps.forEach(step => {
            html += `<h3>${step.title}</h3>`;
            step.fields.forEach(field => {
                const value = data[field.name];
                if (value === undefined || value === '' || value === false || (Array.isArray(value) && value.length === 0)) return;

                let displayValue = value;
                if (field.type === 'checkbox' && field.options) {
                    displayValue = field.options.filter(opt => value.includes(opt.value)).map(opt => opt.label).join(', ');
                } else if (field.type === 'checkbox') {
                    displayValue = value ? 'Yes' : 'No';
                } else if (field.type === 'date') {
                    displayValue = formatDate(value);
                } else if (field.type === 'number' && field.name.includes('commission')) {
                    displayValue = value + '%';
                } else if (field.type === 'number' && (field.name.includes('Fee') || field.name.includes('Salary'))) {
                    displayValue = formatCurrency(value);
                }

                html += `
                    <div class="preview-field">
                        <span class="preview-field-label">${field.label}:</span>
                        <span class="preview-field-value">${displayValue}</span>
                    </div>
                `;
            });
        });

        // Signature section
        html += `
            <div class="preview-signature-section">
                <div class="preview-signature-block">
                    ${state.signatureData ? `<img src="${state.signatureData}" alt="Signature">` : '<div style="height:60px;border-bottom:1px solid var(--color-border);margin-bottom:8px;"></div>'}
                    <div class="sig-name">${data.playerName || data.playerFullName || 'Player'}</div>
                    <div class="sig-role">Player Signature</div>
                </div>
                <div class="preview-signature-block">
                    <div style="height:60px;border-bottom:1px solid var(--color-border);margin-bottom:8px;"></div>
                    <div class="sig-name">${data.repName || data.intermediaryName || 'Agency Representative'}</div>
                    <div class="sig-role">Agency Representative</div>
                </div>
            </div>
            <div class="preview-date">Document generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        `;

        container.innerHTML = html;
    }

    // ============================================
    // PDF GENERATION
    // ============================================
    function finalizeAgreement() {
        showLoading('Generating PDF...');

        const config = agreementConfigs[state.currentAgreement];
        const data = state.formData;

        // Save to agreements list
        const agreement = {
            id: generateId(),
            type: state.currentAgreement,
            title: config.title,
            playerName: data.playerName || data.playerFullName || 'Unknown',
            date: new Date().toISOString(),
            status: 'completed',
            formData: { ...data },
            signatureData: state.signatureData
        };

        state.agreements.unshift(agreement);
        saveToStorage();

        // Clear draft
        localStorage.removeItem(`sda_draft_${state.currentAgreement}`);

        // Generate PDF
        setTimeout(() => {
            generatePDF(agreement);
            hideLoading();
            showToast('Agreement finalized! PDF downloaded.', 'success');

            // Show dashboard after a delay
            setTimeout(() => {
                showDashboard();
            }, 1500);
        }, 1000);
    }

    function generatePDF(agreement) {
        const config = agreementConfigs[agreement.type];
        const data = agreement.formData;

        // Create a temporary container for PDF generation
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px;padding:40px;background:#fff;color:#1a1a1a;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;';

        let content = `
            <div style="text-align:center;margin-bottom:30px;">
                <h1 style="font-size:22px;font-weight:bold;color:#B8860B;margin-bottom:4px;">SAMPSON DESTINY FOOTBALL AGENCY</h1>
                <p style="font-size:11px;color:#666;margin-bottom:20px;">Building Professional Football Careers Worldwide</p>
                <h2 style="font-size:18px;font-weight:bold;color:#1a1a1a;margin-bottom:4px;">${config.title}</h2>
                <p style="font-size:11px;color:#666;">Legal Agreement Document</p>
            </div>
            <hr style="border:none;border-top:2px solid #B8860B;margin-bottom:24px;">
        `;

        config.steps.forEach(step => {
            content += `<h3 style="font-size:14px;font-weight:bold;color:#B8860B;text-transform:uppercase;letter-spacing:1px;margin:20px 0 12px;">${step.title}</h3>`;

            step.fields.forEach(field => {
                const value = data[field.name];
                if (value === undefined || value === '' || value === false || (Array.isArray(value) && value.length === 0)) return;

                let displayValue = value;
                if (field.type === 'checkbox' && field.options) {
                    displayValue = field.options.filter(opt => value.includes(opt.value)).map(opt => opt.label).join(', ');
                } else if (field.type === 'checkbox') {
                    displayValue = value ? 'Yes' : 'No';
                } else if (field.type === 'date') {
                    displayValue = formatDate(value);
                } else if (field.type === 'number' && field.name.includes('commission')) {
                    displayValue = value + '%';
                } else if (field.type === 'number' && (field.name.includes('Fee') || field.name.includes('Salary'))) {
                    displayValue = formatCurrency(value);
                }

                content += `
                    <div style="margin-bottom:8px;">
                        <span style="font-weight:bold;color:#555;min-width:200px;display:inline-block;">${field.label}:</span>
                        <span style="color:#1a1a1a;">${displayValue}</span>
                    </div>
                `;
            });
        });

        // Signature section
        content += `
            <h3 style="font-size:14px;font-weight:bold;color:#B8860B;text-transform:uppercase;letter-spacing:1px;margin:30px 0 12px;">Signatures</h3>
            <div style="display:flex;gap:40px;margin-top:20px;">
                <div style="text-align:center;flex:1;">
                    ${agreement.signatureData ? `<img src="${agreement.signatureData}" style="max-width:200px;height:auto;border-bottom:1px solid #ccc;padding-bottom:8px;margin-bottom:8px;">` : '<div style="height:60px;border-bottom:1px solid #ccc;margin-bottom:8px;"></div>'}
                    <div style="font-weight:bold;font-size:12px;">${data.playerName || data.playerFullName || 'Player'}</div>
                    <div style="font-size:11px;color:#666;">Player Signature</div>
                </div>
                <div style="text-align:center;flex:1;">
                    <div style="height:60px;border-bottom:1px solid #ccc;margin-bottom:8px;"></div>
                    <div style="font-weight:bold;font-size:12px;">${data.repName || data.intermediaryName || 'Agency Representative'}</div>
                    <div style="font-size:11px;color:#666;">Agency Representative</div>
                </div>
            </div>
            <div style="text-align:center;margin-top:30px;font-size:11px;color:#999;">
                Document generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} &mdash; Page 1 of 1
            </div>
            <div style="text-align:center;margin-top:8px;font-size:10px;color:#999;">
                Sampson Destiny Football Agency &mdash; Confidential &mdash; All Rights Reserved
            </div>
        `;

        tempDiv.innerHTML = content;
        document.body.appendChild(tempDiv);

        const options = {
            margin: [15, 15, 15, 15],
            filename: `SampsonDestiny_${agreement.type}_Agreement_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(options).from(tempDiv).save().then(() => {
            document.body.removeChild(tempDiv);
        }).catch(err => {
            console.error('PDF generation error:', err);
            document.body.removeChild(tempDiv);
            showToast('PDF generation failed. Please try again.', 'error');
        });
    }

    // ============================================
    // DASHBOARD
    // ============================================
    function renderDashboard() {
        const drafts = state.agreements.filter(a => a.status === 'draft');
        const completed = state.agreements.filter(a => a.status === 'completed');

        document.getElementById('draftsCount').textContent = drafts.length;
        document.getElementById('completedCount').textContent = completed.length;

        renderAgreementList('draftsList', drafts, 'draft');
        renderAgreementList('completedList', completed, 'completed');

        document.getElementById('draftsEmpty').style.display = drafts.length ? 'none' : 'block';
        document.getElementById('completedEmpty').style.display = completed.length ? 'none' : 'block';
    }

    function renderAgreementList(containerId, items, status) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        items.forEach(item => {
            const date = new Date(item.date);
            const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

            const div = document.createElement('div');
            div.className = 'agreement-item';
            div.innerHTML = `
                <div class="agreement-item-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
                    </svg>
                </div>
                <div class="agreement-item-info">
                    <div class="agreement-item-title">${item.title}</div>
                    <div class="agreement-item-meta">
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            ${item.playerName}
                        </span>
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${dateStr}
                        </span>
                    </div>
                </div>
                <span class="agreement-item-status status-${status}">${status}</span>
                <div class="agreement-item-actions">
                    ${status === 'completed' ? `
                        <button class="btn btn-ghost" onclick="app.downloadAgreement('${item.id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                            PDF
                        </button>
                    ` : ''}
                    <button class="btn btn-ghost" onclick="app.deleteAgreement('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                </div>
            `;
            container.appendChild(div);
        });
    }

    function switchDashboardTab(tab) {
        document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.dashboard-tab-content').forEach(c => c.classList.remove('active'));

        document.querySelector(`.dashboard-tab[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}Tab`).classList.add('active');
    }

    function downloadAgreement(id) {
        const agreement = state.agreements.find(a => a.id === id);
        if (!agreement) return;

        showLoading('Generating PDF...');
        setTimeout(() => {
            generatePDF(agreement);
            hideLoading();
            showToast('PDF downloaded successfully', 'success');
        }, 500);
    }

    function deleteAgreement(id) {
        if (!confirm('Are you sure you want to delete this agreement?')) return;
        state.agreements = state.agreements.filter(a => a.id !== id);
        saveToStorage();
        renderDashboard();
        showToast('Agreement deleted', 'info');
    }

    // ============================================
    // MOBILE MENU
    // ============================================
    function initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const menu = document.getElementById('mobileMenu');

        btn.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !btn.contains(e.target)) {
                menu.classList.remove('active');
            }
        });
    }

    // ============================================
    // NAV SCROLL EFFECT
    // ============================================
    function initNavScroll() {
        const nav = document.getElementById('mainNav');
        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            if (currentScroll > 50) {
                nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            } else {
                nav.style.boxShadow = 'none';
            }
            lastScroll = currentScroll;
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        initTheme();
        initMobileMenu();
        initNavScroll();

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);

        // Load any existing drafts
        const commissionDraft = localStorage.getItem('sda_draft_commission');
        const repDraft = localStorage.getItem('sda_draft_representation');

        console.log('Sampson Destiny Football Agency initialized');
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        goHome,
        showAgreementSelection,
        showDashboard,
        startAgreement,
        nextStep,
        prevStep,
        jumpToStep,
        goToForm,
        goToSignature,
        clearSignature,
        completeSignature,
        finalizeAgreement,
        switchDashboardTab,
        downloadAgreement,
        deleteAgreement,
        toggleTheme,
        closeMobileMenu
    };
})();
