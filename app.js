// app.js
// Registre Conductor Blueprints : fetch, normalisation, i18n FR/EN,
// rendu des cartes, filtres, recherche, tri, vote et soumission.

document.addEventListener('DOMContentLoaded', () => {
    // Dépôt canonique (monorepo) — tous les liens GitHub en dérivent.
    const REPO = 'SolSolis-Sys/conductor-blueprints';

    // === Internationalisation (FR/EN) ===========================
    const STRINGS = {
        fr: {
            countLabel: 'blueprints indexés',
            searchPlaceholder: 'Rechercher un blueprint (nom, description, tag, auteur)…',
            searchAria: 'Rechercher un blueprint',
            sortLabel: 'Trier',
            sortRecent: 'Récents',
            sortVotes: 'Populaires',
            submitBtn: 'Soumettre un Blueprint',
            closeAria: 'Fermer le détail',
            loading: 'Chargement des blueprints…',
            emptyFrame: '// catalogue vide',
            emptyDesc: 'Un registre ouvert de blueprints pour Conductor. Aucune entrée pour l’instant — ouvrez l’index avec la première soumission.',
            emptySubmit: 'Soumettre le premier blueprint',
            noResultsTitle: 'Aucun résultat',
            noResultsDesc: 'Aucun blueprint ne correspond à votre recherche ou à vos filtres.',
            resetFilters: 'Réinitialiser les filtres',
            errorTitle: 'Chargement impossible',
            errorDesc: 'Les blueprints n’ont pas pu être chargés. Vérifiez votre connexion puis réessayez.',
            retry: 'Réessayer',
            install: 'Install',
            metaAuthor: 'Auteur',
            metaRef: 'Réf. d’installation',
            metaVersion: 'Version',
            metaRepo: 'Dépôt',
            metaTier: 'Coût',
            flowTitle: 'Déroulé',
            copyRef: 'Copier',
            copied: 'Copié',
            tier: { low: 'faible', medium: 'moyen', high: 'élevé' },
            voteAria: (name) => `Voter pour ${name}`,
            detailAria: (name) => `Voir le détail de ${name}`
        },
        en: {
            countLabel: 'blueprints indexed',
            searchPlaceholder: 'Search a blueprint (name, description, tag, author)…',
            searchAria: 'Search a blueprint',
            sortLabel: 'Sort',
            sortRecent: 'Recent',
            sortVotes: 'Popular',
            submitBtn: 'Submit a Blueprint',
            closeAria: 'Close details',
            loading: 'Loading blueprints…',
            emptyFrame: '// empty catalog',
            emptyDesc: 'An open registry of blueprints for Conductor. No entries yet — open the index with the first submission.',
            emptySubmit: 'Submit the first blueprint',
            noResultsTitle: 'No results',
            noResultsDesc: 'No blueprint matches your search or filters.',
            resetFilters: 'Reset filters',
            errorTitle: 'Couldn’t load',
            errorDesc: 'Blueprints could not be loaded. Check your connection and try again.',
            retry: 'Retry',
            install: 'Install',
            metaAuthor: 'Author',
            metaRef: 'Install ref',
            metaVersion: 'Version',
            metaRepo: 'Repository',
            metaTier: 'Cost',
            flowTitle: 'Flow',
            copyRef: 'Copy',
            copied: 'Copied',
            tier: { low: 'low', medium: 'medium', high: 'high' },
            voteAria: (name) => `Vote for ${name}`,
            detailAria: (name) => `View details for ${name}`
        }
    };

    const LANG_KEY = 'cbh:lang';
    let lang = loadLang();
    function loadLang() {
        try {
            const saved = localStorage.getItem(LANG_KEY);
            if (saved === 'fr' || saved === 'en') return saved;
        } catch (_) {}
        return 'fr';
    }
    function t(key) { return STRINGS[lang][key]; }

    // Applique les chaînes statiques marquées dans le HTML
    function applyStaticI18n() {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const v = STRINGS[lang][el.getAttribute('data-i18n')];
            if (typeof v === 'string') el.textContent = v;
        });
        document.querySelectorAll('[data-i18n-ph]').forEach(el => {
            const v = STRINGS[lang][el.getAttribute('data-i18n-ph')];
            if (typeof v === 'string') el.setAttribute('placeholder', v);
        });
        document.querySelectorAll('[data-i18n-al]').forEach(el => {
            const v = STRINGS[lang][el.getAttribute('data-i18n-al')];
            if (typeof v === 'string') el.setAttribute('aria-label', v);
        });
    }

    // === Références DOM =========================================
    const searchBar = document.querySelector('.search-bar');
    const filterTagsContainer = document.getElementById('filter-tags');
    const sortSelect = document.getElementById('sort-select');
    const blueprintsGrid = document.getElementById('blueprints-grid');
    const submitButton = document.getElementById('submit-blueprint');
    const registryCount = document.getElementById('registry-count');
    const langButtons = document.querySelectorAll('.lang-btn[data-lang]');

    let blueprints = [];
    let activeFilters = new Set();
    let sortMode = 'recent';
    let currentDetail = null;
    let loaded = false;

    // === Normalisation du schéma legacy ========================
    // catalog.json = { version, blueprints:[{ id, name, version,
    // description, author, tags, cost_tier }] }. On normalise pour
    // que le rendu reste agnostique du format de stockage.
    function normalize(bp) {
        return {
            id: bp.id,
            name: bp.name,
            version: bp.version || '—',
            description: bp.description || '',
            author: bp.author || '—',
            tags: Array.isArray(bp.tags) ? bp.tags : [],
            tier: (bp.cost_tier || bp.tier || 'medium').toLowerCase(),
            repo: REPO
        };
    }
    function extractList(data) {
        const raw = Array.isArray(data) ? data
            : (data && Array.isArray(data.blueprints) ? data.blueprints : []);
        return raw.map(normalize);
    }

    // === Système de vote (persisté en localStorage, sans backend) ===
    const VOTES_KEY = 'cbh:votes';
    const VOTED_KEY = 'cbh:voted';
    let votes = loadJSON(VOTES_KEY, {});
    let voted = new Set(loadJSON(VOTED_KEY, []));

    function loadJSON(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch (_) { return fallback; }
    }
    function getVotes(id) { return votes[id] || 0; }
    function hasVoted(id) { return voted.has(id); }
    function toggleVote(id) {
        if (voted.has(id)) {
            voted.delete(id);
            votes[id] = Math.max(0, getVotes(id) - 1);
        } else {
            voted.add(id);
            votes[id] = getVotes(id) + 1;
        }
        try {
            localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
            localStorage.setItem(VOTED_KEY, JSON.stringify(Array.from(voted)));
        } catch (_) {}
    }

    const CARET_SVG = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 6l7 11H5z" fill="currentColor"/></svg>';

    function voteButtonHTML(blueprint) {
        const active = hasVoted(blueprint.id) ? ' voted' : '';
        const pressed = hasVoted(blueprint.id) ? 'true' : 'false';
        return `<button class="vote-btn${active}" type="button" data-id="${blueprint.id}"
            aria-pressed="${pressed}" aria-label="${t('voteAria')(blueprint.name)}">
            ${CARET_SVG}<span class="vote-count">${getVotes(blueprint.id)}</span>
        </button>`;
    }

    function refreshVoteUI(id) {
        document.querySelectorAll(`.vote-btn[data-id="${id}"]`).forEach(btn => {
            btn.classList.toggle('voted', hasVoted(id));
            btn.setAttribute('aria-pressed', hasVoted(id) ? 'true' : 'false');
            const count = btn.querySelector('.vote-count');
            if (count) count.textContent = getVotes(id);
        });
    }

    function tierLabel(tier) { return STRINGS[lang].tier[tier] || tier; }

    // === Chargement du catalogue ================================
    function showLoading() {
        blueprintsGrid.innerHTML = `
            <div class="loading-state" role="status">
                <span class="spinner" aria-hidden="true"></span>
                <p>${t('loading')}</p>
            </div>`;
    }

    showLoading();
    fetch('catalog.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            blueprints = extractList(data);
            loaded = true;
            renderFilterTags(blueprints);
            loadFiltersFromHash();
            applyFilters();
        })
        .catch(error => {
            console.error('Erreur lors du chargement des blueprints:', error);
            blueprintsGrid.innerHTML = `
                <div class="empty-state error" data-variant="error" role="alert">
                    <h2>${t('errorTitle')}</h2>
                    <p>${t('errorDesc')}</p>
                    <button class="install-btn" type="button" data-action="retry">${t('retry')}</button>
                </div>`;
            const retry = blueprintsGrid.querySelector('[data-action="retry"]');
            if (retry) retry.addEventListener('click', () => window.location.reload());
        });

    // === Rendu des cartes =======================================
    function renderBlueprints(blueprintsToRender) {
        if (registryCount) registryCount.textContent = blueprints.length;
        blueprintsGrid.innerHTML = '';

        if (blueprintsToRender.length === 0) {
            blueprintsGrid.innerHTML = blueprints.length === 0
                ? `<div class="empty-state" data-variant="catalog">
                        <p class="empty-frame">${t('emptyFrame')}</p>
                        <p class="empty-wordmark"><span class="wordmark">Conductor</span> Blueprints</p>
                        <p>${t('emptyDesc')}</p>
                        <button class="install-btn" type="button" data-action="submit">${t('emptySubmit')}</button>
                   </div>`
                : `<div class="empty-state" data-variant="search">
                        <h2>${t('noResultsTitle')}</h2>
                        <p>${t('noResultsDesc')}</p>
                        <button class="install-btn" type="button" data-action="reset">${t('resetFilters')}</button>
                   </div>`;

            const submitAction = blueprintsGrid.querySelector('[data-action="submit"]');
            if (submitAction) submitAction.addEventListener('click', openSubmitIssue);
            const resetAction = blueprintsGrid.querySelector('[data-action="reset"]');
            if (resetAction) resetAction.addEventListener('click', resetFilters);
            return;
        }

        blueprintsToRender.forEach(blueprint => {
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-id', blueprint.id);
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', t('detailAria')(blueprint.name));

            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${blueprint.name}</h3>
                    <span class="tier ${blueprint.tier}">${tierLabel(blueprint.tier)}</span>
                </div>
                <p class="card-description">${blueprint.description}</p>
                <div class="tags">${buildTagsHTML(blueprint.tags)}</div>
                <div class="card-footer">
                    <span class="author">${blueprint.author}</span>
                    <div class="card-actions">
                        ${voteButtonHTML(blueprint)}
                        <button class="install-btn" data-repo="${blueprint.repo}">${t('install')}</button>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => openDetail(blueprint));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openDetail(blueprint);
                }
            });

            const installBtn = card.querySelector('.install-btn');
            installBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const rawUrl = `https://raw.githubusercontent.com/SolSolis-Sys/conductor-blueprints/main/blueprints/${blueprint.name}/blueprint.json`;
                const done = () => {
                    installBtn.textContent = t('copied');
                    installBtn.classList.add('copied');
                    setTimeout(() => {
                        installBtn.textContent = t('install');
                        installBtn.classList.remove('copied');
                    }, 1500);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(rawUrl).then(done).catch(() => fallbackCopy(rawUrl, done));
                } else {
                    fallbackCopy(rawUrl, done);
                }
            });

            const voteBtn = card.querySelector('.vote-btn');
            voteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleVote(blueprint.id);
                refreshVoteUI(blueprint.id);
            });

            blueprintsGrid.appendChild(card);
        });
    }

    // === Tags colorés ===========================================
    const TAG_COLORS = {
        tdd: 'tag-green', bugs: 'tag-red', adversarial: 'tag-purple',
        review: 'tag-blue', quality: 'tag-teal', security: 'tag-red',
        ci: 'tag-blue', polling: 'tag-teal', automation: 'tag-orange',
        'auto-fix': 'tag-green', deploy: 'tag-blue', verification: 'tag-teal',
        'health-check': 'tag-green', 'smoke-test': 'tag-yellow', devops: 'tag-orange',
        brainstorming: 'tag-yellow', planning: 'tag-purple', 'pre-mortem': 'tag-red',
        'risk-analysis': 'tag-orange', 'decision-making': 'tag-pink'
    };
    function buildTagsHTML(tags) {
        return tags.map(tag => {
            const tagClass = TAG_COLORS[tag] || 'tag-blue';
            return `<span class="tag ${tagClass}">${tag}</span>`;
        }).join('');
    }

    // === Recherche ==============================================
    searchBar.addEventListener('input', () => applyFilters());

    // === Filtres de tags dynamiques =============================
    function renderFilterTags(items) {
        const unique = [...new Set(items.flatMap(bp => bp.tags || []))].sort();
        filterTagsContainer.innerHTML = '';

        unique.forEach(tagName => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'filter-tag';
            btn.setAttribute('data-tag', tagName);
            btn.setAttribute('aria-pressed', 'false');
            btn.textContent = tagName;

            btn.addEventListener('click', () => {
                const isActive = btn.classList.toggle('active');
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
                if (isActive) activeFilters.add(tagName);
                else activeFilters.delete(tagName);
                applyFilters();
                updateURLHash();
            });

            filterTagsContainer.appendChild(btn);
        });
    }

    function resetFilters() {
        activeFilters.clear();
        searchBar.value = '';
        filterTagsContainer.querySelectorAll('.filter-tag.active').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        applyFilters();
        updateURLHash();
    }

    // === Tri ====================================================
    sortSelect.addEventListener('change', () => {
        sortMode = sortSelect.value;
        applyFilters();
    });

    function applyFilters() {
        const searchTerm = searchBar.value.toLowerCase();

        let filtered = blueprints.filter(blueprint => {
            const matchesSearch =
                blueprint.name.toLowerCase().includes(searchTerm) ||
                blueprint.description.toLowerCase().includes(searchTerm) ||
                blueprint.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                blueprint.author.toLowerCase().includes(searchTerm);

            const matchesFilters = activeFilters.size === 0 ||
                blueprint.tags.some(tag => activeFilters.has(tag));

            return matchesSearch && matchesFilters;
        });

        if (sortMode === 'votes') {
            filtered = filtered.slice().sort((a, b) => getVotes(b.id) - getVotes(a.id));
        }

        renderBlueprints(filtered);
    }

    // === URL hash (filtres partageables) ========================
    function updateURLHash() {
        window.location.hash = Array.from(activeFilters).join(',');
    }
    function loadFiltersFromHash() {
        const hash = window.location.hash.substring(1);
        if (!hash) return;
        hash.split(',').forEach(tag => {
            if (!tag) return;
            activeFilters.add(tag);
            const filterTag = filterTagsContainer.querySelector(`.filter-tag[data-tag="${tag}"]`);
            if (filterTag) {
                filterTag.classList.add('active');
                filterTag.setAttribute('aria-pressed', 'true');
            }
        });
    }

    // === Vue détail (modale) ====================================
    const modal = document.getElementById('detail-modal');
    const modalContent = document.getElementById('modal-content');
    const modalClose = document.getElementById('modal-close');
    let lastFocused = null;

    // Déroulé opérationnel : étapes réelles extraites de la description
    // quand elle est séquencée par des flèches (→ / ->). Aucune étape
    // n'est inventée — sans flèche, pas de déroulé (la description seule).
    function parseFlow(description) {
        if (!description) return [];
        return description
            .split(/\s*(?:→|->)\s*/)
            .map(s => s.trim())
            .filter(Boolean);
    }

    // Copie de repli quand l'API Clipboard est indisponible.
    function fallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (_) {}
        document.body.removeChild(ta);
    }

    function renderModal(blueprint) {
        const flow = parseFlow(blueprint.description);
        const flowHTML = flow.length >= 2 ? `
            <div class="modal-flow">
                <span class="modal-section-label">${t('flowTitle')}</span>
                <ol class="flow-steps">
                    ${flow.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>` : '';

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2 id="modal-title">${blueprint.name}</h2>
                <span class="tier ${blueprint.tier}">${tierLabel(blueprint.tier)}</span>
            </div>
            <div class="tags">${buildTagsHTML(blueprint.tags)}</div>
            <p class="modal-description">${blueprint.description}</p>
            ${flowHTML}
            <dl class="modal-meta">
                <div><dt>${t('metaVersion')}</dt><dd>${blueprint.version}</dd></div>
                <div><dt>${t('metaAuthor')}</dt><dd>@${blueprint.author}</dd></div>
                <div><dt>${t('metaTier')}</dt><dd>${tierLabel(blueprint.tier)}</dd></div>
                <div class="modal-meta-wide"><dt>${t('metaRepo')}</dt><dd><a href="https://github.com/${blueprint.repo}" target="_blank" rel="noopener">${blueprint.repo}</a></dd></div>
            </dl>
            <div class="modal-install-ref">
                <span class="modal-section-label">${t('metaRef')}</span>
                <div class="install-ref-row">
                    <code>${blueprint.id}</code>
                    <button type="button" class="copy-btn" id="copy-ref-btn">${t('copyRef')}</button>
                </div>
            </div>
            <div class="modal-footer">
                ${voteButtonHTML(blueprint)}
                <button class="install-btn" data-repo="${blueprint.repo}">${t('install')}</button>
            </div>
        `;

        modalContent.querySelector('.install-btn').addEventListener('click', () => {
            const rawUrl = `https://raw.githubusercontent.com/SolSolis-Sys/conductor-blueprints/main/blueprints/${blueprint.name}/blueprint.json`;
            const modalInstallBtn = modalContent.querySelector('.install-btn');
            const done = () => {
                modalInstallBtn.textContent = t('copied');
                modalInstallBtn.classList.add('copied');
                setTimeout(() => {
                    modalInstallBtn.textContent = t('install');
                    modalInstallBtn.classList.remove('copied');
                }, 1500);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(rawUrl).then(done).catch(() => fallbackCopy(rawUrl, done));
            } else {
                fallbackCopy(rawUrl, done);
            }
        });
        modalContent.querySelector('.vote-btn').addEventListener('click', () => {
            toggleVote(blueprint.id);
            refreshVoteUI(blueprint.id);
        });
        const copyBtn = modalContent.querySelector('#copy-ref-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const done = () => {
                    copyBtn.textContent = t('copied');
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.textContent = t('copyRef');
                        copyBtn.classList.remove('copied');
                    }, 1600);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(blueprint.id).then(done).catch(() => fallbackCopy(blueprint.id, done));
                } else {
                    fallbackCopy(blueprint.id, done);
                }
            });
        }
    }

    function openDetail(blueprint) {
        lastFocused = document.activeElement;
        currentDetail = blueprint;
        renderModal(blueprint);
        modal.hidden = false;
        document.body.classList.add('modal-open');
        modalClose.focus();
    }

    function closeDetail() {
        modal.hidden = true;
        currentDetail = null;
        document.body.classList.remove('modal-open');
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    modalClose.addEventListener('click', closeDetail);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeDetail(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeDetail();
    });

    // Piège le focus clavier dans la modale ouverte
    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab' || modal.hidden) return;
        const focusables = modal.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    });

    // === Soumission → Issue GitHub pré-remplie (agent-ready) ====
    // Pas de page formulaire : la voie canonique d'ajout est d'éditer
    // catalog.json. L'issue fournit l'objet JSON exact à ajouter, ce
    // qu'un agent peut reprendre directement pour ouvrir une PR.
    function openSubmitIssue() {
        const body =
`## ${lang === 'fr' ? 'Nouvelle soumission de blueprint' : 'New blueprint submission'}

${lang === 'fr'
    ? 'Pour ajouter ce blueprint, ajoutez l’objet suivant au tableau `blueprints` de `catalog.json`, puis ouvrez une PR.'
    : 'To add this blueprint, append the following object to the `blueprints` array in `catalog.json`, then open a PR.'}
${lang === 'fr'
    ? '(Agents : voie d’ajout canonique = éditer catalog.json, aucune saisie manuelle requise.)'
    : '(Agents: canonical add path = edit catalog.json, no manual entry required.)'}

\`\`\`json
{
  "id": "solsolis/your-blueprint",
  "name": "your-blueprint",
  "version": "1.0.0",
  "description": "",
  "author": "",
  "tags": [],
  "cost_tier": "medium"
}
\`\`\`
`;
        const url = `https://github.com/${REPO}/issues/new`
            + `?title=${encodeURIComponent((lang === 'fr' ? 'Nouveau blueprint : ' : 'New blueprint: '))}`
            + `&labels=blueprint`
            + `&body=${encodeURIComponent(body)}`;
        window.open(url, '_blank', 'noopener');
    }

    submitButton.addEventListener('click', () => window.open('web/submit.html', '_blank'));

    // === Bascule de langue ======================================
    function setLang(next) {
        if (next !== 'fr' && next !== 'en') return;
        lang = next;
        try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
        langButtons.forEach(btn => {
            const active = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        applyStaticI18n();
        if (loaded) applyFilters();
        if (!modal.hidden && currentDetail) renderModal(currentDetail);
    }

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang')));
    });

    // Init : applique la langue persistée à l'UI statique + toggle.
    setLang(lang);
});
