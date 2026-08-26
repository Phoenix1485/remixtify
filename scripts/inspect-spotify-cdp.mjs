import { writeFile } from "node:fs/promises";
import path from "node:path";

const port = Number(process.argv[2] || 9333);
const targets = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
const target = targets.find((candidate) => candidate.type === "page");
if (!target?.webSocketDebuggerUrl) throw new Error("Spotify page target was not found");

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let nextID = 1;

socket.addEventListener("message", (event) => {
  const message = JSON.parse(String(event.data));
  if (!message.id) return;
  const waiter = pending.get(message.id);
  if (!waiter) return;
  pending.delete(message.id);
  if (message.error) waiter.reject(new Error(message.error.message));
  else waiter.resolve(message.result);
});

await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = nextID++;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

const fullExpression = `(() => {
  const nodeInfo = (node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      tag: node.tagName,
      id: node.id || undefined,
      className: typeof node.className === 'string' ? node.className : undefined,
      testid: node.getAttribute('data-testid') || undefined,
      role: node.getAttribute('role') || undefined,
      aria: node.getAttribute('aria-label') || undefined,
      text: node.children.length < 4 ? node.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 90) : undefined,
      rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
      display: style.display,
      position: style.position,
      gridArea: style.gridArea,
      overflow: style.overflow,
    };
  };
  const describe = (selector) => {
    const node = document.querySelector(selector);
    if (!node) return null;
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      selector,
      tag: node.tagName,
      className: node.className,
      parentClass: node.parentElement?.className,
      rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      display: style.display,
      position: style.position,
      gridArea: style.gridArea,
      gridTemplateAreas: style.gridTemplateAreas,
      gridTemplateColumns: style.gridTemplateColumns,
      margin: style.margin,
      padding: style.padding,
      background: style.background,
      borderRadius: style.borderRadius,
      overflow: style.overflow,
      zIndex: style.zIndex,
    };
  };
  return {
    url: location.href,
    viewport: { width: innerWidth, height: innerHeight },
    htmlClasses: document.documentElement.className,
    dataset: { ...document.documentElement.dataset },
    runtime: window.SpotifyRedesign?.version,
    readyState: document.readyState,
    scripts: Array.from(document.scripts).map((script) => ({ src: script.src, type: script.type, text: script.src ? "" : script.textContent?.slice(0, 160) })),
    resources: performance.getEntriesByType('resource').map((entry) => entry.name).slice(-80),
    text: document.body.innerText.slice(0, 1000),
    settingsButton: describe('.srd-settings-button'),
    topbarHost: describe('.srd-topbar-host'),
    root: describe('.Root'),
    topContainer: describe('.Root__top-container'),
    nav: describe('.Root__nav-bar'),
    main: describe('.Root__main-view'),
    right: describe('.Root__right-sidebar'),
    playerRoot: describe('.Root__now-playing-bar'),
    player: describe('.main-nowPlayingBar-nowPlayingBar'),
    globalNav: describe('.main-globalNav-globalNav'),
    scrollChild: describe('.main-view-container__scroll-node-child'),
    contentSpacing: describe('.contentSpacing'),
    cards: document.querySelectorAll('.main-card-card, [data-testid="card-container"]').length,
    rootTree: (() => {
      const root = document.querySelector('.Root');
      if (!root) return [];
      return Array.from(root.querySelectorAll('*'))
        .map((node) => ({ node, info: nodeInfo(node) }))
        .filter(({ info }) => info.rect.width > 0 && info.rect.height > 0)
        .filter(({ node, info }) =>
          node.parentElement === root || info.testid || info.role || info.aria ||
          info.rect.width >= innerWidth * .7 || info.rect.height >= innerHeight * .7 ||
          (info.rect.y < 72 && info.rect.height >= 30) ||
          (info.rect.y > innerHeight - 100 && info.rect.height >= 30) ||
          (info.rect.x < 100 && info.rect.height >= 100) ||
          (info.rect.x > innerWidth - 450 && info.rect.height >= 100)
        )
        .slice(0, 350)
        .map(({ info }) => info);
    })(),
    rootChildren: (() => {
      const root = document.querySelector('.Root');
      if (!root) return [];
      const output = [];
      const visit = (node, depth) => {
        if (depth > 4) return;
        for (const child of node.children) {
          const info = nodeInfo(child);
          output.push({ depth, ...info });
          if (info.rect.width >= innerWidth * .6 || info.rect.height >= innerHeight * .6) visit(child, depth + 1);
        }
      };
      visit(root, 0);
      return output.slice(0, 250);
    })(),
    testids: Array.from(new Set(Array.from(document.querySelectorAll('[data-testid]')).map((node) => node.getAttribute('data-testid')))).sort(),
    controls: Array.from(document.querySelectorAll('button, [role="button"], [role="slider"], input')).map(nodeInfo).filter((info) => info.rect.width > 0 && info.rect.height > 0),
    bodyChildren: Array.from(document.body.children).map((node) => ({ tag: node.tagName, className: node.className, id: node.id })),
  };
})()`;

const layoutExpression = `(() => {
  const info = (node, depth = 0) => {
    const r = node.getBoundingClientRect();
    const s = getComputedStyle(node);
    return {
      depth,
      tag: node.tagName,
      id: node.id || '',
      className: typeof node.className === 'string' ? node.className : '',
      parentClass: typeof node.parentElement?.className === 'string' ? node.parentElement.className : '',
      grandparentClass: typeof node.parentElement?.parentElement?.className === 'string' ? node.parentElement.parentElement.className : '',
      testid: node.getAttribute('data-testid') || '',
      role: node.getAttribute('role') || '',
      aria: node.getAttribute('aria-label') || '',
      rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      display: s.display,
      position: s.position,
      gridArea: s.gridArea,
      gridTemplateAreas: s.gridTemplateAreas,
      gridTemplateColumns: s.gridTemplateColumns,
      gridTemplateRows: s.gridTemplateRows,
      overflow: s.overflow,
      opacity: s.opacity,
      visibility: s.visibility,
      transform: s.transform,
      zIndex: s.zIndex,
    };
  };
  const root = document.querySelector('.Root');
  const hierarchy = [];
  const visit = (node, depth) => {
    if (depth > 5) return;
    for (const child of node.children) {
      const item = info(child, depth);
      hierarchy.push(item);
      const [x, y, w, h] = item.rect;
      if (depth < 2 || w > innerWidth * .65 || h > innerHeight * .65) visit(child, depth + 1);
    }
  };
  if (root) visit(root, 0);
  return {
    viewport: [innerWidth, innerHeight],
    hierarchy,
    panelAncestors: (() => {
      const output = [];
      let node = document.querySelector('[data-testid="cover-art-image"]');
      while (node && node !== root) {
        output.push(info(node));
        node = node.parentElement;
      }
      return output;
    })(),
    semantic: Array.from(document.querySelectorAll('[data-testid], [role="slider"]'))
      .map((node) => info(node))
      .filter(({ rect: [x, y, w, h] }) => w > 0 && h > 0 && x < innerWidth && y < innerHeight)
      .filter(({ testid, role, rect: [x, y, w, h] }) => role === 'slider' || y < 100 || y > innerHeight - 110 || x < 110 || x > innerWidth - 460 || w > innerWidth * .65),
  };
})()`;

const panelExpression = `(() => {
  const describe = (node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      tag: node.tagName,
      className: typeof node.className === 'string' ? node.className : '',
      testid: node.getAttribute('data-testid') || '',
      role: node.getAttribute('role') || '',
      aria: node.getAttribute('aria-label') || '',
      text: node.children.length < 4 ? node.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 100) || '' : '',
      rect: [rect.x, rect.y, rect.width, rect.height].map(Math.round),
      display: style.display,
      position: style.position,
      flexDirection: style.flexDirection,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      order: style.order,
      overflow: style.overflow,
    };
  };
  const chain = (selector) => {
    const output = [];
    let node = document.querySelector(selector);
    while (node && output.length < 14) {
      const r = node.getBoundingClientRect();
      const s = getComputedStyle(node);
      output.push({
        tag: node.tagName,
        className: typeof node.className === 'string' ? node.className : '',
        testid: node.getAttribute('data-testid') || '',
        rect: [r.x, r.y, r.width, r.height].map(Math.round),
        display: s.display,
        opacity: s.opacity,
        visibility: s.visibility,
        overflow: s.overflow,
        zIndex: s.zIndex,
        contain: s.contain,
        contentVisibility: s.contentVisibility,
        filter: s.filter,
        mixBlendMode: s.mixBlendMode,
        maskImage: s.maskImage,
        clipPath: s.clipPath,
        transform: s.transform,
        background: s.background,
        color: s.color,
      });
      node = node.parentElement;
    }
    return output;
  };
  const descendants = (selector) => {
    const root = document.querySelector(selector);
    return root ? Array.from(root.querySelectorAll('*')).map(describe).filter(({ rect: [x, y, w, h] }) => w > 0 && h > 0 && y < innerHeight * 1.5).slice(0, 40) : [];
  };
  return {
    modal: document.querySelector('.srd-backdrop') ? { count: document.querySelectorAll('.srd-backdrop').length, text: document.querySelector('.srd-modal')?.textContent?.slice(0, 300) } : null,
    themeState: {
      id: document.documentElement.dataset.srdTheme,
      link: document.querySelector('#spotify-redesign-theme-style')?.href,
      loaded: Boolean(document.querySelector('#spotify-redesign-theme-style')?.sheet),
      choices: document.querySelectorAll('.srd-theme-choice').length,
      customEditor: Boolean(document.querySelector('.srd-css-editor')),
      fileAccept: document.querySelector('.srd-css-actions input[type="file"]')?.accept,
    },
    right: chain('[data-testid="NPV_Panel_OpenDiv"] [data-testid="cover-art-image"]'),
    rightImage: (() => {
      const image = document.querySelector('[data-testid="NPV_Panel_OpenDiv"] [data-testid="cover-art-image"]');
      return image ? { src: image.currentSrc, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight, complete: image.complete } : null;
    })(),
    rightPseudo: (() => {
      const node = document.querySelector('.srd-right-sidebar');
      if (!node) return null;
      return ['::before', '::after'].map((pseudo) => {
        const s = getComputedStyle(node, pseudo);
        return { pseudo, content: s.content, display: s.display, position: s.position, inset: s.inset, background: s.background, zIndex: s.zIndex, opacity: s.opacity };
      });
    })(),
    rightHitTest: document.elementsFromPoint(1700, 200).slice(0, 12).map((node) => ({
      tag: node.tagName,
      className: typeof node.className === 'string' ? node.className : '',
      testid: node.getAttribute('data-testid') || '',
      background: getComputedStyle(node).background,
      zIndex: getComputedStyle(node).zIndex,
      pointerEvents: getComputedStyle(node).pointerEvents,
    })),
    player: chain('[data-testid="now-playing-bar"]'),
    playerDescendants: descendants('[data-testid="now-playing-bar"]'),
    playerDirect: (() => {
      const player = document.querySelector('[data-testid="now-playing-bar"]');
      const root = player?.firstElementChild;
      return root ? [describe(root), ...Array.from(root.children).map(describe)] : [];
    })(),
    playerSemantic: Array.from(document.querySelectorAll('[data-testid="now-playing-bar"] [data-testid], [data-testid="now-playing-bar"] [role]'))
      .map(describe)
      .filter(({ rect: [x, y, w, h] }) => w > 0 && h > 0),
    settings: chain('.srd-settings-button'),
  };
})()`;

const sidebarExpression = `(() => {
  const describe = (node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      tag: node.tagName,
      id: node.id || '',
      className: typeof node.className === 'string' ? node.className : '',
      testid: node.getAttribute('data-testid') || '',
      role: node.getAttribute('role') || '',
      aria: node.getAttribute('aria-label') || '',
      ariaExpanded: node.getAttribute('aria-expanded') || '',
      title: node.getAttribute('title') || '',
      text: node.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 100) || '',
      rect: [rect.x, rect.y, rect.width, rect.height].map(Math.round),
      display: style.display,
      width: style.width,
      minWidth: style.minWidth,
      gridTemplateColumns: style.gridTemplateColumns,
    };
  };
  const sidebar = document.querySelector('#Desktop_LeftSidebar_Id');
  const grid = document.querySelector('.srd-app-grid');
  return {
    htmlDataset: { ...document.documentElement.dataset },
    grid: grid ? describe(grid) : null,
    sidebar: sidebar ? describe(sidebar) : null,
    sidebarAttributes: sidebar ? Object.fromEntries(Array.from(sidebar.attributes).map(({ name, value }) => [name, value])) : null,
    controls: Array.from(document.querySelectorAll('button, [role="button"]'))
      .filter((node) => {
        const rect = node.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.x < 280 && rect.y < 180;
      })
      .map(describe),
    descendants: sidebar ? Array.from(sidebar.querySelectorAll('[aria-label], [aria-expanded], [data-testid]')).slice(0, 80).map(describe) : [],
  };
})()`;

const homeExpression = `(() => {
  const describe = (node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      tag: node.tagName,
      id: node.id || '',
      className: typeof node.className === 'string' ? node.className : '',
      parentClass: typeof node.parentElement?.className === 'string' ? node.parentElement.className : '',
      grandparentClass: typeof node.parentElement?.parentElement?.className === 'string' ? node.parentElement.parentElement.className : '',
      testid: node.getAttribute('data-testid') || '',
      role: node.getAttribute('role') || '',
      aria: node.getAttribute('aria-label') || '',
      text: node.children.length < 5 ? node.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 100) || '' : '',
      rect: [rect.x, rect.y, rect.width, rect.height].map(Math.round),
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      gap: style.gap,
      padding: style.padding,
      margin: style.margin,
      background: style.background,
      overflow: style.overflow,
    };
  };
  const chain = (selector) => {
    const output = [];
    let node = document.querySelector(selector);
    while (node && output.length < 10) {
      output.push(describe(node));
      node = node.parentElement;
    }
    return output;
  };
  const descendants = (selector) => {
    const root = document.querySelector(selector);
    return root ? Array.from(root.querySelectorAll('*')).map(describe).filter(({ rect: [x, y, w, h] }) => w > 0 && h > 0 && y < innerHeight * 1.5).slice(0, 120) : [];
  };
  return {
    shortcut: chain('[data-testid="shortcut"]'),
    card: chain('[data-testid="card-container"]'),
    chipChain: chain('button[role="checkbox"][aria-label="All"]'),
    mainButtons: Array.from(document.querySelectorAll('.srd-main-view button')).map(describe).filter(({ rect: [x, y, w, h] }) => w > 0 && h > 0 && y < 520).slice(0, 40),
    sections: Array.from(document.querySelectorAll('.srd-main-view section')).map(describe).filter(({ rect: [x, y, w, h] }) => w > 0 && h > 0 && y < innerHeight * 1.5).slice(0, 30),
    quickGrid: descendants('section[aria-label="Good afternoon"]'),
    firstShelf: descendants('[data-testid="component-shelf"]'),
  };
})()`;

const stabilityExpression = `(async () => {
  const selectors = {
    shell: '.srd-app-grid',
    globalNav: '[data-testid="global-nav-bar"]',
    sidebar: '#Desktop_LeftSidebar_Id',
    main: '#main-view',
    right: '.srd-right-sidebar',
    player: '[data-testid="now-playing-bar"]',
    scroller: '.main-view-container__scroll-node > div:not(.os-scrollbar)',
    quickGrid: '[data-testid="home-page"] section[aria-label]:not([data-testid="component-shelf"]) > :first-child',
    shelf: '[data-testid="home-page"] [data-testid="component-shelf"]',
    card: '[data-testid="carousel-scroller"] .e-10451-card',
  };
  const expectedClasses = {
    shell: 'srd-app-grid',
    globalNav: 'srd-global-nav',
    sidebar: 'srd-left-sidebar',
    main: 'srd-main-view',
    right: 'srd-right-sidebar',
    player: 'srd-player',
    scroller: null,
    quickGrid: null,
    shelf: null,
    card: null,
  };
  const samples = Object.fromEntries(Object.keys(selectors).map((key) => [key, []]));
  let mutations = 0;
  const observer = new MutationObserver((records) => { mutations += records.length; });
  observer.observe(document.body, { childList: true, subtree: true });
  for (let index = 0; index < 40; index += 1) {
    for (const [key, selector] of Object.entries(selectors)) {
      const node = document.querySelector(selector);
      if (!node) {
        samples[key].push(null);
        continue;
      }
      const rect = node.getBoundingClientRect();
      samples[key].push({
        x: Math.round(rect.x * 10) / 10,
        y: Math.round(rect.y * 10) / 10,
        width: Math.round(rect.width * 10) / 10,
        height: Math.round(rect.height * 10) / 10,
        scrollTop: Math.round(node.scrollTop * 10) / 10,
        labelled: expectedClasses[key] ? node.classList.contains(expectedClasses[key]) : true,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 75));
  }
  observer.disconnect();
  const result = {};
  for (const [key, values] of Object.entries(samples)) {
    const present = values.filter(Boolean);
    const range = (field) => present.length ? Math.max(...present.map((value) => value[field])) - Math.min(...present.map((value) => value[field])) : null;
    const yValues = present.map((value) => value.y);
    const directions = yValues.slice(1).map((value, index) => Math.sign(value - yValues[index])).filter(Boolean);
    result[key] = {
      missingSamples: values.length - present.length,
      unlabelledSamples: present.filter((value) => !value.labelled).length,
      xRange: range('x'),
      yRange: range('y'),
      widthRange: range('width'),
      heightRange: range('height'),
      scrollTopRange: range('scrollTop'),
      directionChanges: directions.slice(1).filter((direction, index) => direction !== directions[index]).length,
      first: present[0] || null,
      last: present.at(-1) || null,
    };
  }
  return {
    runtime: window.SpotifyRedesign?.version,
    mutations,
    animationCount: document.getAnimations().length,
    redesignAnimations: document.getAnimations().filter((animation) => animation.animationName?.startsWith('srd-')).map((animation) => ({
      name: animation.animationName,
      state: animation.playState,
      target: animation.effect?.target?.className || animation.effect?.target?.tagName || '',
    })),
    result,
  };
})()`;

const buttonsExpression = `(() => {
  const describeNode = (node) => ({
    tag: node.tagName,
    className: typeof node.className === 'string' ? node.className : '',
    testid: node.getAttribute?.('data-testid') || '',
    role: node.getAttribute?.('role') || '',
    aria: node.getAttribute?.('aria-label') || '',
  });
  return Array.from(document.querySelectorAll('#main-view button'))
    .filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.y < innerHeight;
    })
    .map((button) => {
      const rect = button.getBoundingClientRect();
      const ancestors = [];
      let node = button.parentElement;
      while (node && ancestors.length < 6) {
        ancestors.push(describeNode(node));
        node = node.parentElement;
      }
      return { ...describeNode(button), rect: [rect.x, rect.y, rect.width, rect.height], ancestors };
    });
})()`;

const pageExpression = `(() => {
  const describe = (node, depth) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      depth,
      tag: node.tagName,
      className: typeof node.className === 'string' ? node.className : '',
      testid: node.getAttribute?.('data-testid') || '',
      role: node.getAttribute?.('role') || '',
      aria: node.getAttribute?.('aria-label') || '',
      rect: [rect.x, rect.y, rect.width, rect.height].map((value) => Math.round(value * 10) / 10),
      display: style.display,
      position: style.position,
    };
  };
  const root = document.querySelector('[data-testid="album-page"], [data-testid="playlist-page"], [data-testid="artist-page"], [data-testid="home-page"]');
  if (!root) return null;
  const output = [describe(root, 0)];
  const walk = (node, depth) => {
    if (depth > 4 || output.length > 180) return;
    for (const child of node.children) {
      output.push(describe(child, depth));
      walk(child, depth + 1);
    }
  };
  walk(root, 1);
  return output;
})()`;

const hitExpression = `(() => {
  const info = (node) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      tag: node.tagName,
      id: node.id || '',
      className: typeof node.className === 'string' ? node.className : '',
      testid: node.getAttribute?.('data-testid') || '',
      rect: [rect.x, rect.y, rect.width, rect.height].map((value) => Math.round(value)),
      position: style.position,
      display: style.display,
      opacity: style.opacity,
      visibility: style.visibility,
      zIndex: style.zIndex,
      background: style.background,
      pointerEvents: style.pointerEvents,
    };
  };
  const points = [[500, 300], [500, 600], [50, 300], [1000, 500], [1700, 500]];
  return {
    points: points.map(([x, y]) => ({ x, y, stack: document.elementsFromPoint(x, y).slice(0, 12).map(info) })),
    overlays: Array.from(document.querySelectorAll('body *')).map(info).filter((item) =>
      item.rect[2] > innerWidth * .8 && item.rect[3] > innerHeight * .75 &&
      item.display !== 'none' && item.visibility !== 'hidden'
    ).slice(0, 40),
  };
})()`;

const shellChildrenExpression = `(() => {
  const shell = document.querySelector('#main-view')?.parentElement;
  if (!shell) return [];
  return Array.from(shell.children).map((node, index) => {
    const rect = node.getBoundingClientRect();
    const style = getComputedStyle(node);
    return {
      index,
      tag: node.tagName,
      id: node.id || '',
      className: node.className || '',
      gridArea: style.gridArea,
      display: style.display,
      position: style.position,
      zIndex: style.zIndex,
      rect: [rect.x, rect.y, rect.width, rect.height],
      hasNowPlayingBar: Boolean(node.querySelector('[data-testid="now-playing-bar"]')),
      hasRightPanel: Boolean(node.querySelector('[data-testid="NPV_Panel_OpenDiv"]')),
    };
  });
})()`;

const cardsExpression = `(() => {
  const rect = (node) => {
    if (!node) return null;
    const value = node.getBoundingClientRect();
    return [value.x, value.y, value.width, value.height].map(Math.round);
  };
  const summarize = (node) => {
    const style = getComputedStyle(node);
    const title = node.querySelector('.e-10451-card-title, [data-testid="card-title"], a[href]');
    const textNodes = Array.from(node.querySelectorAll('.e-10451-text, .e-10451-line-clamp'))
      .filter((candidate) => candidate.textContent?.trim());
    const subtitle = textNodes.find((candidate) => candidate !== title && !title?.contains(candidate));
    const image = node.querySelector('[data-testid="card-image"], img');
    const main = node.querySelector('.e-10451-card__main');
    const parentStyle = getComputedStyle(node.parentElement);
    return {
      rect: rect(node),
      parentRect: rect(node.parentElement),
      imageRect: rect(image),
      mainRect: rect(main),
      titleRect: rect(title),
      title: title?.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 110) || '',
      subtitleRect: rect(subtitle),
      subtitle: subtitle?.textContent?.trim().replace(/\\s+/g, ' ').slice(0, 110) || '',
      height: style.height,
      minHeight: style.minHeight,
      maxHeight: style.maxHeight,
      overflow: style.overflow,
      parentDisplay: parentStyle.display,
      parentGap: parentStyle.gap,
    };
  };
  const chain = (node) => {
    const values = [];
    while (node && values.length < 7) {
      const style = getComputedStyle(node);
      values.push({
        tag: node.tagName,
        className: typeof node.className === 'string' ? node.className : '',
        testid: node.getAttribute('data-testid') || '',
        role: node.getAttribute('role') || '',
        rect: rect(node),
        display: style.display,
        gap: style.gap,
        margin: style.margin,
        padding: style.padding,
        gridTemplateColumns: style.gridTemplateColumns,
        gridAutoColumns: style.gridAutoColumns,
      });
      node = node.parentElement;
    }
    return values;
  };
  const firstCard = document.querySelector('[data-testid="component-shelf"] .e-10451-card');
  return {
    viewport: [innerWidth, innerHeight],
    firstCardHTML: firstCard?.outerHTML.slice(0, 7000) || '',
    firstCardChain: firstCard ? chain(firstCard) : [],
    shelves: Array.from(document.querySelectorAll('[data-testid="component-shelf"]')).map((shelf, index) => ({
      index,
      label: shelf.getAttribute('aria-label') || shelf.querySelector('h2')?.textContent?.trim() || '',
      gridColumn: getComputedStyle(shelf).gridColumn,
      rect: rect(shelf),
      scrollerRect: rect(shelf.querySelector('[data-testid="carousel-scroller"]')),
      gridRect: rect(shelf.querySelector('[role="grid"], [data-testid="grid-container"]')),
      cards: Array.from(shelf.querySelectorAll('.e-10451-card, [data-testid="card-container"], .main-card-card'))
        .filter((card) => card.getBoundingClientRect().width > 0)
        .slice(0, 10)
        .map(summarize),
    })),
    looseCards: Array.from(document.querySelectorAll('[data-testid="home-page"] [data-testid="card-container"], [data-testid="home-page"] .main-card-card'))
      .filter((card) => !card.closest('[data-testid="component-shelf"]') && card.getBoundingClientRect().width > 0)
      .slice(0, 20)
      .map(summarize),
  };
})()`;

const expression = process.argv[3] === "layout"
  ? layoutExpression
  : process.argv[3] === "panel"
    ? panelExpression
    : process.argv[3] === "sidebar"
      ? sidebarExpression
      : process.argv[3] === "home"
        ? homeExpression
        : process.argv[3] === "stability"
          ? stabilityExpression
          : process.argv[3] === "buttons"
            ? buttonsExpression
            : process.argv[3] === "page"
              ? pageExpression
            : process.argv[3] === "hit"
              ? hitExpression
              : process.argv[3] === "children"
                ? shellChildrenExpression
                : process.argv[3] === "cards"
                  ? cardsExpression
      : fullExpression;

if (process.argv[4] === "stack-fix") {
  await command("Runtime.evaluate", {
    expression: `(() => {
      document.querySelectorAll('#srd-cdp-stack-test').forEach((node) => node.remove());
      document.documentElement.dataset.srdLayout = 'studio';
      const style = document.createElement('style');
      style.id = 'srd-cdp-stack-test';
      style.textContent = '.srd-app-grid{grid-template-areas:"left-sidebar global-nav global-nav" "left-sidebar main-view right-sidebar" "left-sidebar now-playing-bar now-playing-bar"!important}.srd-global-nav{grid-area:global-nav!important}.srd-right-sidebar{grid-area:right-sidebar!important}.srd-player-zone{grid-area:now-playing-bar!important}';
      document.head.appendChild(style);
    })()`,
  });
}
if (process.argv[4] === "classic") {
  await command("Runtime.evaluate", { expression: `document.documentElement.dataset.srdLayout = 'classic'` });
}
if (process.argv[4] === "strip-right") {
  await command("Runtime.evaluate", { expression: `(() => {
    document.documentElement.dataset.srdLayout = 'studio';
    document.querySelectorAll('#srd-cdp-stack-test').forEach((node) => node.remove());
    const sheet = document.querySelector('#spotify-redesign-core-style')?.sheet;
    if (!sheet) return;
    for (let index = sheet.cssRules.length - 1; index >= 0; index -= 1) {
      const rule = sheet.cssRules[index];
      if (rule.cssText.includes('srd-right-sidebar')) sheet.deleteRule(index);
    }
  })()` });
}
if (process.argv[4] === "click-settings") {
  await command("Runtime.evaluate", { expression: `document.querySelector('.srd-settings-button')?.click()` });
  await new Promise((resolve) => setTimeout(resolve, 300));
}
if (process.argv[4] === "click-themes") {
  await command("Runtime.evaluate", { expression: `(() => {
    if (!document.querySelector('.srd-modal')) document.querySelector('.srd-settings-button')?.click();
    const tab = Array.from(document.querySelectorAll('.srd-tab')).find((node) => node.textContent?.trim() === 'Themes');
    tab?.click();
    return Boolean(tab);
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (process.argv[4] === "close-modal") {
  await command("Runtime.evaluate", { expression: `document.querySelector('.srd-close')?.click()` });
  await new Promise((resolve) => setTimeout(resolve, 300));
}
if (process.argv[4] === "toggle-spotlight") {
  await command("Runtime.evaluate", { expression: `(() => {
    if (!document.querySelector('.srd-modal')) document.querySelector('.srd-settings-button')?.click();
    const heading = Array.from(document.querySelectorAll('.srd-row h3')).find((node) => node.textContent?.trim() === 'Spotify spotlight');
    heading?.closest('.srd-row')?.querySelector('[role="switch"]')?.click();
    document.querySelector('.srd-close')?.click();
    return Boolean(heading);
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (process.argv[4] === "scroll-recents") {
  await command("Runtime.evaluate", { expression: `(() => {
    const shelf = Array.from(document.querySelectorAll('[data-testid="component-shelf"]'))
      .find((node) => node.getAttribute('aria-label')?.includes('Recents') || node.querySelector('h2')?.textContent?.includes('Recents'));
    shelf?.scrollIntoView({ block: 'start' });
    return Boolean(shelf);
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (process.argv[4] === "select-aurora") {
  await command("Runtime.evaluate", { expression: `(() => {
    if (!document.querySelector('.srd-modal')) document.querySelector('.srd-settings-button')?.click();
    const tab = Array.from(document.querySelectorAll('.srd-tab')).find((node) => node.textContent?.trim() === 'Themes');
    tab?.click();
    const choice = Array.from(document.querySelectorAll('.srd-theme-choice')).find((node) => node.textContent?.includes('Aurora'));
    choice?.click();
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (process.argv[4] === "select-crimson") {
  await command("Runtime.evaluate", { expression: `(() => {
    if (!document.querySelector('.srd-modal')) document.querySelector('.srd-settings-button')?.click();
    const tab = Array.from(document.querySelectorAll('.srd-tab')).find((node) => node.textContent?.trim() === 'Themes');
    tab?.click();
    const choice = Array.from(document.querySelectorAll('.srd-theme-choice')).find((node) => node.textContent?.includes('Crimson'));
    choice?.click();
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 500));
}
if (process.argv[4] === "click-library-toggle") {
  await command("Runtime.evaluate", { expression: `(() => {
    const controls = Array.from(document.querySelectorAll('button, [role="button"]'));
    const toggle = controls.find((node) => /library/i.test(node.getAttribute('aria-label') || '') && /open|close|collapse|expand|hide|show/i.test(node.getAttribute('aria-label') || ''));
    toggle?.click();
    return toggle?.getAttribute('aria-label') || null;
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 700));
}
if (process.argv[4] === "open-first-album") {
  await command("Runtime.evaluate", { expression: `(() => {
    document.querySelector('.srd-close')?.click();
    const link = document.querySelector('[data-testid="home-page"] a[href*="/album/"]');
    link?.click();
    return link?.getAttribute('href') || null;
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 1800));
}
if (process.argv[4] === "enable-motion") {
  await command("Runtime.evaluate", { expression: `(() => {
    const key = 'spotify-redesign:settings:v2';
    const settings = JSON.parse(localStorage.getItem(key) || '{}');
    settings.motion = true;
    localStorage.setItem(key, JSON.stringify(settings));
    location.reload();
  })()` });
  await new Promise((resolve) => setTimeout(resolve, 2500));
}
if (process.argv[4] === "sidebar-333" || process.argv[4] === "sidebar-420") {
  const width = process.argv[4] === "sidebar-333" ? 333 : 420;
  await command("Runtime.evaluate", { expression: `document.querySelector('#Desktop_LeftSidebar_Id')?.style.setProperty('--left-sidebar-width', '${width}')` });
  await new Promise((resolve) => setTimeout(resolve, 180));
}

const evaluation = await command("Runtime.evaluate", {
  expression,
  returnByValue: true,
  awaitPromise: true,
});
process.stdout.write(`${JSON.stringify(evaluation.result.value, null, 2)}\n`);

await command("Page.enable");
const screenshot = await command("Page.captureScreenshot", { format: "png", fromSurface: true });
const screenshotLabel = [process.argv[3] || "full", process.argv[4] || "view"]
  .join("-")
  .replace(/[^a-z0-9-]+/gi, "-")
  .toLowerCase();
const screenshotPath = path.resolve("build", `spotify-cdp-${screenshotLabel}.png`);
await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));
process.stdout.write(`Screenshot: ${screenshotPath}\n`);
socket.close();
