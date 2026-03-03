document.addEventListener('DOMContentLoaded', () => {
  // --- STATUS-MAPPING ---
  const STATUS_CLASSES = {
    'Entwurf': 'status-entwurf',
    'Prüfung': 'status-pruefung',
    'Veröffentlicht': 'status-veröffentlicht'
  };

  // --- STATE MANAGEMENT ---
  const DEFAULT_NODES = [
    { id: 1, title: 'Die Zukunft des CMS', type: 'Artikel', body: 'Skalierbare Architekturen für globale Unternehmen mit Drupal.', status: 'Veröffentlicht' },
    { id: 2, title: 'Unternehmens-Blog', type: 'Seite', body: 'Ein modulares System für die schnelle Erstellung von Inhalten.', status: 'Entwurf' }
  ];

  const DEFAULT_LAYOUT = [
    { id: 'lb-1', type: 'text', label: 'Banner-Block', value: 'Hochleistungs-Auslieferung' },
    { id: 'lb-2', type: 'grid', label: 'Grid-Block (3 Spalten)', value: '' },
    { id: 'lb-3', type: 'cta', label: 'CTA-Block', value: 'Jetzt beitreten' }
  ];

  const DEFAULT_USERS = [
    { id: 1, name: 'admin', role: 'Administrator', status: 'Aktiv' },
    { id: 2, name: 'redakteur_max', role: 'Redakteur', status: 'Aktiv' },
    { id: 3, name: 'gast_user', role: 'Gast', status: 'Inaktiv' }
  ];

  const state = {
    nodes: JSON.parse(localStorage.getItem('adesso_nodes')) || DEFAULT_NODES,
    layout: JSON.parse(localStorage.getItem('adesso_layout')) || DEFAULT_LAYOUT,
    users: JSON.parse(localStorage.getItem('adesso_users')) || DEFAULT_USERS,
    config: JSON.parse(localStorage.getItem('adesso_config')) || {
      siteName: 'adesso Showroom',
      accentColor: '#0066b3',
      perfMode: false
    }
  };

  const saveState = () => {
    localStorage.setItem('adesso_nodes', JSON.stringify(state.nodes));
    localStorage.setItem('adesso_layout', JSON.stringify(state.layout));
    localStorage.setItem('adesso_users', JSON.stringify(state.users));
    localStorage.setItem('adesso_config', JSON.stringify(state.config));
  };

  // --- ELEMENTS ---
  const cmsModal = document.getElementById('cms-dashboard');
  const adminLinks = {
    content: document.getElementById('admin-content-link'),
    structure: document.getElementById('admin-structure-link'),
    config: document.getElementById('admin-config-link'),
    appearance: document.getElementById('admin-appearance-link'),
    extend: document.getElementById('admin-extend-link'),
    people: document.getElementById('admin-people-link')
  };
  const closeCms = document.getElementById('close-cms');
  const cmsViews = document.querySelectorAll('.cms-view');
  const cmsMenuLinks = document.querySelectorAll('.cms-nav a');
  const layoutStack = document.getElementById('layout-builder-stack');
  const builderStack = document.getElementById('builder-layout-stack');
  const previewOverlay = document.getElementById('preview-overlay');
  const previewContent = document.getElementById('preview-content');
  const siteTitleElements = document.querySelectorAll('.admin-logo');

  // --- INITIALIZATION ---
  const init = () => {
    applyConfig();
    renderNodeList();
    renderViewsGrid();
    renderLayoutStack();
    renderUserList();
    setupAnimations();
  };

  const applyConfig = () => {
    document.documentElement.style.setProperty('--color-primary', state.config.accentColor);
    const rgb = state.config.accentColor === '#0077c0' ? '0, 119, 192' :
      state.config.accentColor === '#6366f1' ? '99, 102, 241' :
        state.config.accentColor === '#10b981' ? '16, 185, 129' : '245, 158, 11';
    document.documentElement.style.setProperty('--color-primary-rgb', rgb);

    siteTitleElements.forEach(el => {
      const svg = el.querySelector('svg').outerHTML;
      el.innerHTML = `${svg} ${state.config.siteName}`;
    });

    const nameInput = document.getElementById('config-site-name');
    if (nameInput) nameInput.value = state.config.siteName;

    const perfCheck = document.getElementById('config-perf-mode');
    if (perfCheck) perfCheck.checked = state.config.perfMode;

    const swatches = document.querySelectorAll('.color-swatch');
    swatches.forEach(s => {
      s.classList.toggle('active', s.dataset.color === state.config.accentColor);
    });
  };

  // --- CMS NAVIGATION ---
  const switchCmsView = (viewId) => {
    cmsViews.forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`cms-view-${viewId}`);
    if (targetView) targetView.classList.add('active');

    cmsMenuLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewId);
    });
  };

  // --- HERO DEMO BUTTON ---
  const btnHeroDemo = document.getElementById('btn-hero-demo');
  if (btnHeroDemo) {
    btnHeroDemo.addEventListener('click', () => {
      if (cmsModal) cmsModal.style.display = 'flex';
      switchCmsView('builder');
    });
  }

  // --- CMS SIDEBAR NAVIGATION ---
  cmsMenuLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      switchCmsView(link.dataset.view);
    });
  });

  // --- ADMIN BAR LINKS ---
  if (adminLinks.content) adminLinks.content.addEventListener('click', (e) => {
    e.preventDefault();
    if (cmsModal) cmsModal.style.display = 'flex';
    switchCmsView('list');
  });
  if (adminLinks.structure) adminLinks.structure.addEventListener('click', (e) => {
    e.preventDefault();
    if (cmsModal) cmsModal.style.display = 'flex';
    switchCmsView('structure');
  });
  if (adminLinks.config) adminLinks.config.addEventListener('click', (e) => {
    e.preventDefault();
    if (cmsModal) cmsModal.style.display = 'flex';
    switchCmsView('config');
  });
  if (adminLinks.appearance) adminLinks.appearance.addEventListener('click', (e) => {
    e.preventDefault();
    if (cmsModal) cmsModal.style.display = 'flex';
    switchCmsView('extend');
  });
  if (adminLinks.extend) adminLinks.extend.addEventListener('click', (e) => {
    e.preventDefault();
    if (cmsModal) cmsModal.style.display = 'flex';
    switchCmsView('extend');
  });
  if (adminLinks.people) adminLinks.people.addEventListener('click', (e) => {
    e.preventDefault();
    if (cmsModal) cmsModal.style.display = 'flex';
    switchCmsView('people');
  });

  // --- CLOSE CMS ---
  if (closeCms) {
    closeCms.addEventListener('click', () => {
      if (cmsModal) cmsModal.style.display = 'none';
    });
  }

  // --- RENDER FUNCTIONS ---
  const renderNodeList = () => {
    const tbody = document.getElementById('cms-node-list');
    if (!tbody) return;
    tbody.innerHTML = state.nodes.map(node => `
      <tr>
        <td><strong>${node.title}</strong></td>
        <td>${node.type}</td>
        <td><span class="status ${STATUS_CLASSES[node.status] || ''}">${node.status}</span></td>
        <td>
          <button class="btn glass btn-sm" onclick="this.closest('tr').querySelector('strong').setAttribute('contenteditable','true');this.closest('tr').querySelector('strong').focus();">Bearbeiten</button>
          <button class="btn glass btn-sm btn-delete" data-id="${node.id}">Löschen</button>
        </td>
      </tr>
    `).join('');

    // Delete listeners
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        state.nodes = state.nodes.filter(n => n.id !== parseInt(btn.dataset.id));
        saveState();
        renderNodeList();
      });
    });
  };

  const renderViewsGrid = () => {
    // Structure and Media views are already static HTML, no dynamic rendering needed
  };

  const renderLayoutStack = () => {
    const stack = builderStack || layoutStack;
    if (!stack) return;
    if (state.layout.length === 0) {
      stack.innerHTML = '<p style="text-align:center; color: var(--color-text-muted); padding: 2rem;">Keine Blöcke vorhanden. Fügen Sie Blöcke über die Schaltflächen oben hinzu.</p>';
      return;
    }
    stack.innerHTML = state.layout.map((block, i) => {
      let icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
      let preview = '';
      if (block.type === 'text') {
        icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
        preview = `<span style="color: var(--color-text-muted); font-size: 0.85rem;">${block.value || 'Textblock'}</span>`;
      } else if (block.type === 'grid') {
        icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';
        preview = '<div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.5rem; margin-top:0.5rem;"><div style="height:40px; background:rgba(255,255,255,0.07); border-radius:8px;"></div><div style="height:40px; background:rgba(255,255,255,0.07); border-radius:8px;"></div><div style="height:40px; background:rgba(255,255,255,0.07); border-radius:8px;"></div></div>';
      } else if (block.type === 'cta') {
        icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="9" width="16" height="6" rx="3"/><line x1="9" y1="12" x2="15" y2="12"/></svg>';
        preview = `<button class="btn btn-primary btn-sm" style="margin-top:0.5rem; pointer-events:none;">${block.value || 'CTA'}</button>`;
      } else if (block.type === 'image') {
        icon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
        preview = '<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:0.5rem; margin-top:0.5rem;"><div style="height:60px; background:rgba(255,255,255,0.07); border-radius:8px;"></div><div style="height:60px; background:rgba(255,255,255,0.07); border-radius:8px;"></div></div>';
      }
      return `
        <div class="layout-block glass" draggable="true" data-index="${i}" style="padding: 1rem 1.25rem; margin-bottom: 0.75rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: flex-start; cursor: grab; border: 1px solid var(--glass-border); background: rgba(255,255,255,0.04);">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span>${icon}</span>
              <strong>${block.label}</strong>
            </div>
            ${preview}
          </div>
          <div style="display: flex; gap: 0.5rem; align-items: center; flex-shrink: 0;">
            ${i > 0 ? `<button class="btn glass btn-sm btn-move-up" data-index="${i}" title="Nach oben">↑</button>` : ''}
            ${i < state.layout.length - 1 ? `<button class="btn glass btn-sm btn-move-down" data-index="${i}" title="Nach unten">↓</button>` : ''}
            <button class="btn glass btn-sm btn-remove-block" data-index="${i}" title="Entfernen" style="color: #ef4444;">✕</button>
          </div>
        </div>
      `;
    }).join('');

    // Move up
    stack.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        if (idx > 0) {
          [state.layout[idx], state.layout[idx - 1]] = [state.layout[idx - 1], state.layout[idx]];
          saveState();
          renderLayoutStack();
        }
      });
    });

    // Move down
    stack.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        if (idx < state.layout.length - 1) {
          [state.layout[idx], state.layout[idx + 1]] = [state.layout[idx + 1], state.layout[idx]];
          saveState();
          renderLayoutStack();
        }
      });
    });

    // Remove block
    stack.querySelectorAll('.btn-remove-block').forEach(btn => {
      btn.addEventListener('click', () => {
        state.layout.splice(parseInt(btn.dataset.index), 1);
        saveState();
        renderLayoutStack();
      });
    });

    // Drag and drop
    let dragIndex = null;
    stack.querySelectorAll('.layout-block').forEach(block => {
      block.addEventListener('dragstart', () => {
        dragIndex = parseInt(block.dataset.index);
        block.style.opacity = '0.4';
      });
      block.addEventListener('dragend', () => {
        block.style.opacity = '1';
        dragIndex = null;
      });
      block.addEventListener('dragover', (e) => {
        e.preventDefault();
        block.style.borderTop = '2px solid var(--color-primary)';
      });
      block.addEventListener('dragleave', () => {
        block.style.borderTop = '';
      });
      block.addEventListener('drop', (e) => {
        e.preventDefault();
        block.style.borderTop = '';
        const dropIndex = parseInt(block.dataset.index);
        if (dragIndex !== null && dragIndex !== dropIndex) {
          const [moved] = state.layout.splice(dragIndex, 1);
          state.layout.splice(dropIndex, 0, moved);
          saveState();
          renderLayoutStack();
        }
      });
    });
  };

  const renderUserList = () => {
    const tbody = document.getElementById('cms-user-list');
    if (!tbody) return;
    tbody.innerHTML = state.users.map(user => `
      <tr>
        <td><strong>${user.name}</strong></td>
        <td><span class="status">${user.status}</span></td>
        <td>${user.role}</td>
        <td><button class="btn glass btn-sm">Bearbeiten</button></td>
      </tr>
    `).join('');
  };

  const setupAnimations = () => {
    // Observe elements for fade-in animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  };

  // --- CREATE NODE ---
  const btnCreateNode = document.getElementById('btn-create-node');
  const nodeForm = document.getElementById('node-form');
  const btnCancelNode = document.getElementById('btn-cancel-node');

  if (btnCreateNode) {
    btnCreateNode.addEventListener('click', () => switchCmsView('create'));
  }

  if (btnCancelNode) {
    btnCancelNode.addEventListener('click', () => switchCmsView('list'));
  }

  if (nodeForm) {
    nodeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('node-title').value.trim();
      const type = document.getElementById('node-type').value;
      const status = document.getElementById('node-workflow').value;
      const body = document.getElementById('node-body').value;

      if (!title) return;

      state.nodes.push({
        id: Date.now(),
        title,
        type,
        body,
        status
      });

      saveState();
      renderNodeList();
      nodeForm.reset();
      switchCmsView('list');
    });
  }

  // --- BUILDER ACTIONS ---
  const btnAddText = document.getElementById('btn-add-text-builder');
  const btnAddImage = document.getElementById('btn-add-image-builder');
  const btnPreview = document.getElementById('btn-preview-page');
  const btnClosePreview = document.getElementById('btn-close-preview');

  if (btnAddText) {
    btnAddText.addEventListener('click', () => {
      state.layout.push({
        id: 'lb-' + Date.now(),
        type: 'text',
        label: 'Neuer Textblock',
        value: 'Ihr Text hier...'
      });
      saveState();
      renderLayoutStack();
    });
  }

  if (btnAddImage) {
    btnAddImage.addEventListener('click', () => {
      state.layout.push({
        id: 'lb-' + Date.now(),
        type: 'image',
        label: 'Bild-Grid Block',
        value: ''
      });
      saveState();
      renderLayoutStack();
    });
  }

  if (btnPreview && previewOverlay && previewContent) {
    btnPreview.addEventListener('click', () => {
      previewContent.innerHTML = state.layout.map(block => {
        if (block.type === 'text') {
          return `<section style="padding:3rem 0;"><h2 style="font-size:2rem; font-weight:700; margin-bottom:1rem; color:#0f172a;">${block.label}</h2><p style="font-size:1.1rem; line-height:1.8; color:#475569;">${block.value}</p></section>`;
        } else if (block.type === 'grid') {
          return `<section style="padding:2rem 0;"><h3 style="margin-bottom:1.5rem; color:#0f172a;">${block.label}</h3><div style="display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem;"><div style="height:200px; background:#e2e8f0; border-radius:12px;"></div><div style="height:200px; background:#e2e8f0; border-radius:12px;"></div><div style="height:200px; background:#e2e8f0; border-radius:12px;"></div></div></section>`;
        } else if (block.type === 'cta') {
          return `<section style="text-align:center; padding:4rem 2rem; background:linear-gradient(135deg, #0066b3, #0284c7); border-radius:16px;"><h2 style="color:white; font-size:2rem; margin-bottom:1rem;">${block.label}</h2><button style="padding:0.75rem 2rem; background:white; color:#0066b3; border:none; border-radius:8px; font-weight:700; font-size:1rem; cursor:pointer;">${block.value || 'Jetzt starten'}</button></section>`;
        } else if (block.type === 'image') {
          return `<section style="padding:2rem 0;"><h3 style="margin-bottom:1.5rem; color:#0f172a;">${block.label}</h3><div style="display:grid; grid-template-columns:repeat(2,1fr); gap:1.5rem;"><div style="height:250px; background:#e2e8f0; border-radius:12px;"></div><div style="height:250px; background:#e2e8f0; border-radius:12px;"></div></div></section>`;
        }
        return '';
      }).join('');
      previewOverlay.style.display = 'block';
    });
  }

  if (btnClosePreview && previewOverlay) {
    btnClosePreview.addEventListener('click', () => {
      previewOverlay.style.display = 'none';
    });
  }

  // --- CONFIG FORM ---
  const configForm = document.getElementById('config-form');
  if (configForm) {
    configForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('config-site-name');
      const perfCheck = document.getElementById('config-perf-mode');
      if (nameInput) state.config.siteName = nameInput.value;
      if (perfCheck) state.config.perfMode = perfCheck.checked;
      saveState();
      applyConfig();
    });
  }

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      state.config.accentColor = swatch.dataset.color;
      saveState();
      applyConfig();
    });
  });

  // --- MAIN TABS ---
  const navInfoLink = document.getElementById('nav-info-link');
  const navBuilderLink = document.getElementById('nav-builder-link');
  const navBuendnisLink = document.getElementById('nav-buendnis-link');
  const viewInfo = document.getElementById('view-info');
  const viewSandbox = document.getElementById('view-sandbox');
  const viewBuendnis = document.getElementById('view-buendnis');

  if (navInfoLink && navBuilderLink) {
    navInfoLink.addEventListener('click', (e) => {
      e.preventDefault();
      navInfoLink.classList.add('active');
      navBuilderLink.classList.remove('active');
      if (navBuendnisLink) navBuendnisLink.classList.remove('active');
      navInfoLink.style.color = '#0f172a';
      navBuilderLink.style.color = 'var(--color-text-muted)';
      if (navBuendnisLink) navBuendnisLink.style.color = 'var(--color-text-muted)';
      viewInfo.style.display = 'block';
      if (viewSandbox) viewSandbox.style.display = 'none';
      if (viewBuendnis) viewBuendnis.style.display = 'none';
      document.body.classList.remove('portal-active');
      const ab1 = document.querySelector('.drupal-admin-bar');
      if (ab1) ab1.style.display = '';
      applyConfig();
    });

    navBuilderLink.addEventListener('click', (e) => {
      e.preventDefault();
      navBuilderLink.classList.add('active');
      navInfoLink.classList.remove('active');
      if (navBuendnisLink) navBuendnisLink.classList.remove('active');
      navBuilderLink.style.color = '#0f172a';
      navInfoLink.style.color = 'var(--color-text-muted)';
      if (navBuendnisLink) navBuendnisLink.style.color = 'var(--color-text-muted)';
      if (viewSandbox) viewSandbox.style.display = 'block';
      viewInfo.style.display = 'none';
      if (viewBuendnis) viewBuendnis.style.display = 'none';
      document.body.classList.remove('portal-active');
      const ab2 = document.querySelector('.drupal-admin-bar');
      if (ab2) ab2.style.display = '';
      const cmsDashboard = document.getElementById('cms-dashboard');
      if (cmsDashboard) cmsDashboard.style.display = 'flex';
      renderLayoutStack();
    });

    navBuendnisLink.addEventListener('click', (e) => {
      e.preventDefault();
      // Redirect to the standalone Bündnis portal
      window.location.href = './buendnis/index.html';
    });
  }

  init();
});

