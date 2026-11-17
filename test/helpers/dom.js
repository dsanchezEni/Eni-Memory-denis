/**
 * ENI-Memory - Sandbox de test avec mini-DOM
 *
 * Fournit un contexte Node vm qui simule le navigateur :
 * - document (getElementById, querySelector, querySelectorAll, createElement, createTextNode)
 * - localStorage
 * - alert, window
 * - des éléments DOM factices si supportant listeners, classes, style et innerHTML
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PROJECT = path.resolve(__dirname, '..', '..');

class FakeNode {
  constructor(tag) {
    this.tagName = tag;
    this.id = '';
    this.className = '';
    this.children = [];
    this.parentElement = null;
    this.style = {};
    this.attrs = {};
    this.listeners = {};
    this.textContent = '';
    this._ih = '';
    this._classes = new Set();
    const self = this;
    this.classList = {
      add: (...cs) => cs.forEach(c => self._classes.add(c)),
      remove: (...cs) => cs.forEach(c => self._classes.delete(c)),
      contains: (c) => self._classes.has(c),
      get size() { return self._classes.size; },
    };
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return (k in this.attrs) ? this.attrs[k] : null; }
  appendChild(c) { c.parentElement = this; this.children.push(c); return c; }
  addEventListener(ev, fn) { (this.listeners[ev] ||= []).push(fn); }
  removeEventListener(ev, fn) {
    (this.listeners[ev] ||= []);
    const i = this.listeners[ev].indexOf(fn);
    if (i >= 0) this.listeners[ev].splice(i, 1);
  }
  click() { (this.listeners['click'] || []).slice().forEach(fn => fn({ target: this })); }
  set innerHTML(html) {
    this._ih = html;
    this.children.length = 0;
    if (!String(html).includes('double-face')) return;
    const df = new FakeNode('div');
    df.className = 'double-face';
    df.parentElement = this;
    this.children.push(df);
    const img = new FakeNode('img');
    img.src = (String(html).match(/src="([^"]+)"/) || [])[1] || '';
    img.id = (String(html).match(/id="(carte\d+)"/) || [])[1] || '';
    img.parentElement = df;
    df.children.push(img);
  }
  get innerHTML() { return this._ih; }
}

class FakeNodeList extends Array {}

class FakeTable {
  constructor() {
    this.rows = [makeCell()];
    this.nbRowsDeleted = 0;
  }
  insertRow(i) {
    const row = { cells: [] };
    row.insertCell = (k) => { const c = makeCell(); row.cells[k] = c; return c; };
    this.rows.splice(i ?? this.rows.length, 0, row);
    return row;
  }
  deleteRow(i) { this.rows.splice(i, 1); this.nbRowsDeleted++; }
  dataRows() { return this.rows.slice(1); }
}

function makeCell() {
  const c = { appended: [], colSpan: 0, _textContent: '' };
  c.appendChild = (n) => { c.appended.push(n == null ? '' : String((n && n.text) ?? '')); return c; };
  Object.defineProperty(c, 'textContent', {
    get: () => c._textContent,
    set: (v) => { c._textContent = String(v); },
  });
  c.getText = () => [...c.appended, c._textContent].filter(Boolean).join('');
  return c;
}

/**
 * Crée une sandbox avec mini-DOM
 * @param {object} [options]
 * @param {object} [options.localStorage] - Données initiales du localStorage
 * @param {object} [options.selectors] - Correspondances querySelector -> objet
 * @param {number} [options.nombreColonnes] - Nombre de cellules du tableau des scores par défaut
 * @returns {object} sandbox + repères pour les tests
 */
function createSandbox({ localStorage = {}, selectors = {} } = {}) {
  const grid = new FakeNode('div');
  grid.id = 'memoryGrid';
  const els = {
    advice: new FakeNode('p'),
    score: new FakeNode('div'),
    timer: new FakeNode('div'),
  };
  const tableEl = new FakeTable();
  const selectTaille = new FakeNode('select');
  selectTaille.id = 'tailleMemory';
  selectTaille.value = '';
  const radioChoisi = { value: '' };

  const store = Object.assign({}, localStorage);
  const alerts = [];
  const navigations = [];

  const documentMock = {
    getElementById: (id) => (
      { memoryGrid: grid, tableScore: tableEl, timer: els.timer, tailleMemory: selectTaille }[id] ?? null
    ),
    querySelector: (sel) => {
      if (Object.prototype.hasOwnProperty.call(selectors, sel)) return selectors[sel];
      if (sel === '.advice') return els.advice;
      if (sel === '.score') return els.score;
      if (sel === 'form') return new FakeNode('form');
      if (sel.includes('choixMemory')) return radioChoisi;
      return null;
    },
    querySelectorAll: (sel) => {
      if (sel === '.icone-verif' || sel === '.error-msg' || sel === '.lines div') {
        return Array.from({ length: 5 }, () => new FakeNode('span'));
      }
      const all = [];
      const walk = (n) => { all.push(n); n.children.forEach(walk); };
      grid.children.forEach(walk);
      if (sel === '.card') return all.filter(n => n.className === 'card');
      if (sel === '.double-face') return all.filter(n => n.className === 'double-face');
      return new FakeNodeList();
    },
    createElement: (t) => new FakeNode(t),
    addEventListener: () => {},
    createTextNode: (s) => ({ text: String(s) }),
  };

  const sandbox = {
    console,
    document: documentMock,
    localStorage: {
      getItem: (k) => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: (k) => { delete store[k]; },
    },
    alert: (m) => alerts.push(String(m)),
    window: {
      addEventListener: () => {},
      location: {
        get href() { return navigations[navigations.length - 1] || ''; },
        set href(dest) { navigations.push(dest); },
        reload() { navigations.push("reload"); },
      },
      reload() { navigations.push('reload'); },
    },
    TextEncoder,
    setInterval: () => 0,
    clearInterval: () => {},
    Date,
    crypto: require('node:crypto').webcrypto,
  };

  vm.createContext(sandbox);
  return {
    vm,
    sandbox,
    grid,
    els,
    tableEl,
    selectTaille,
    radioChoisi,
    alerts,
    navigations,
    loadScript(relPath, exposeCode) {
      const code = fs.readFileSync(path.join(PROJECT, relPath), 'utf8').replace(/\r/g, '');
      vm.runInContext(code + '\n' + (exposeCode || ''), sandbox);
    },
    run(code) { return vm.runInContext(code, sandbox); },
    storage: store,
  };
}

module.exports = { PROJECT, createSandbox, FakeNode, FakeNodeList, FakeTable };
