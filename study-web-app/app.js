/* ─── Storage helpers ──────────────────────────────────────── */
const store = {
  get(k, fallback = null) {
    try { return JSON.parse(localStorage.getItem('erp_' + k)) ?? fallback; } catch { return fallback; }
  },
  set(k, v) { localStorage.setItem('erp_' + k, JSON.stringify(v)); },
  remove(k) { localStorage.removeItem('erp_' + k); }
};

const TEACHBACK_AUDIO_DB = 'erp_study_audio';
const TEACHBACK_AUDIO_STORE = 'teachback_audio';
const LESSON_AUDIO_STORE = 'lesson_audio';
const NOTE_AUDIO_STORE = 'note_audio';
const DEVICE_SPEECH_MAX_CHARS = 260;
const REMOTE_TTS_MAX_CHARS = 3500;
const DIRECT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DIRECT_OPENAI_LIGHT_MODEL = 'gpt-5.4-nano';
const DIRECT_OPENAI_HEAVY_MODEL = 'gpt-5.4-mini';
const DIRECT_OPENAI_TTS_MODEL = 'gpt-4o-mini-tts';
const DIRECT_OPENAI_TTS_VOICE = 'alloy';
const AI_SECURE_STORAGE_PREFIX = 'erp-study-ai_';
const AI_SECURE_STORAGE_KEY = 'openai_api_key';
const KNOWLEDGE_STOPWORDS = new Set([
  'ما', 'ماذا', 'كيف', 'هل', 'عن', 'من', 'في', 'على', 'الى', 'إلى', 'او', 'أو', 'بين', 'عند', 'الآن', 'الان', 'ثم', 'هذا', 'هذه', 'ذلك',
  'الفرق', 'فرق', 'قارن', 'مقارنة', 'اشرح', 'راجع', 'اجابتي', 'إجابتي', 'السؤال', 'المطلوب', 'بالضبط', 'دون', 'تعطيني', 'الحل', 'الكامل',
  'الحاليه', 'الحالية', 'لي', 'لدي', 'الذي', 'يطلبه', 'علىه', 'بدون', 'فقط', 'هنا', 'هناك', 'الجواب', 'اجابه', 'إجابة', 'الاختبار', 'السؤالين'
]);

const KNOWLEDGE_QUERY_PREFIX_PATTERNS = [
  /^اشرح\s+لي\s+ما\s+الذي\s+يطلبه\s+هذا\s+السؤال\s+بالضبط\s+دون\s+ا?ن\s+تعطيني\s+الحل\s+الكامل\s*[:\-]*/i,
  /^اشرح\s+لي\s+هذا\s+السؤال\s*[:\-]*/i,
  /^راجع\s+اجابتي\s+الحاليه.*?السؤال\s*[:\-]*/i,
  /^راجع\s+إجابتي\s+الحالية.*?السؤال\s*[:\-]*/i,
  /^الى\s+اي\s+مفهوم.*?السؤال\s*[:\-]*/i,
  /^قارن\s+اوامر\s+الانتاج/i,
];
const HEAVY_QUERY_PATTERNS = [
  /قارن.*(بتفصيل|تفصيلي|تفصيلاً|بعمق)/i,
  /(حلل|تحليل|فسر|اشرح لي لماذا|جذر|جذور|سبب|أسباب)/i,
  /(خطة|خارطة|roadmap|implementation|rollout|uat|go-live|تصميم|معمارية|architecture)/i,
  /(سيناريو|استثناء|انحراف|variance|kpi|تكلفة|تكاليف|تسوية|mrp|capacity)/i,
  /(oracle|sap|dynamics|odoo).*(oracle|sap|dynamics|odoo)/i,
  /(مقارنة|مقارن|اختلافات|trade-?off|best practice|gap analysis)/i,
];
const DEFAULT_AI_SETTINGS = {
  providerMode: 'direct',
  serverUrl: 'http://127.0.0.1:8787',
  openaiBaseUrl: DIRECT_OPENAI_BASE_URL,
  apiKey: '',
  cloudEnabled: false,
  webEnabled: true,
  preferredModelTier: 'auto',
};

function createClientId(prefix = 'id') {
  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeAiSettingsForStorage(settings = {}) {
  const next = { ...(settings || {}) };
  delete next.apiKey;
  return next;
}

function normalizeNoteType(value) {
  return String(value || '').trim().toLowerCase() === 'question' ? 'question' : 'note';
}

function normalizeNoteStatus(value) {
  return String(value || '').trim().toLowerCase() === 'done' ? 'done' : 'open';
}

function normalizeNoteEntry(entry = {}) {
  const now = new Date().toISOString();
  return {
    id: String(entry.id || createClientId('note')),
    lessonId: String(entry.lessonId || '').trim(),
    lessonTitle: String(entry.lessonTitle || '').trim(),
    type: normalizeNoteType(entry.type),
    status: normalizeNoteStatus(entry.status),
    title: String(entry.title || '').trim(),
    text: String(entry.text || '').trim(),
    audioId: entry.audioId ? String(entry.audioId) : '',
    createdAt: entry.createdAt || now,
    updatedAt: entry.updatedAt || entry.createdAt || now,
  };
}

function normalizeNoteEntries(entries = []) {
  if (!Array.isArray(entries)) return [];
  return entries
    .map(normalizeNoteEntry)
    .filter((entry) => entry.lessonId && (entry.title || entry.text || entry.audioId))
    .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0));
}

function migrateLegacyNotes(noteEntries = [], legacyNotes = {}) {
  const normalized = normalizeNoteEntries(noteEntries);
  const seenLessonIds = new Set(normalized.filter((entry) => entry.title === 'ملاحظة سابقة').map((entry) => entry.lessonId));
  const migrated = Object.entries(legacyNotes || {}).map(([lessonId, text]) => {
    const content = String(text || '').trim();
    if (!lessonId || !content || seenLessonIds.has(lessonId)) return null;
    return normalizeNoteEntry({
      id: `legacy-note:${lessonId}`,
      lessonId,
      lessonTitle: '',
      type: 'note',
      status: 'open',
      title: 'ملاحظة سابقة',
      text: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }).filter(Boolean);

  return [...migrated, ...normalized]
    .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0));
}

let teachBackAudioDbPromise = null;
let currentSpeechUtterance = null;
let currentSpeechQueueToken = 0;
let speechVoicesPromise = null;
let speechVoicesCache = [];
let secureStorageReadyPromise = null;

const persistedAiSettings = store.get('aiSettings', {});
const legacyPersistedAiApiKey = String(persistedAiSettings?.apiKey || '').trim();

function getSecureStoragePlugin() {
  return globalThis.capacitorSecureStorage?.SecureStorage || null;
}

async function ensureAiSecureStorageReady() {
  if (secureStorageReadyPromise) return secureStorageReadyPromise;
  secureStorageReadyPromise = (async () => {
    const plugin = getSecureStoragePlugin();
    if (!plugin) return false;
    try {
      await plugin.setKeyPrefix(AI_SECURE_STORAGE_PREFIX);
      return true;
    } catch {
      return false;
    }
  })();
  return secureStorageReadyPromise;
}

async function readAiApiKeySecure() {
  await ensureAiSecureStorageReady();
  const plugin = getSecureStoragePlugin();
  if (!plugin) return String(store.get('aiApiKeyFallback', '') || '').trim();
  try {
    return String(await plugin.getItem(AI_SECURE_STORAGE_KEY) || '').trim();
  } catch {
    return String(store.get('aiApiKeyFallback', '') || '').trim();
  }
}

async function persistAiApiKeySecure(apiKey) {
  const value = String(apiKey || '').trim();
  await ensureAiSecureStorageReady();
  const plugin = getSecureStoragePlugin();
  if (plugin) {
    try {
      if (value) await plugin.setItem(AI_SECURE_STORAGE_KEY, value);
      else await plugin.removeItem(AI_SECURE_STORAGE_KEY);
      store.remove('aiApiKeyFallback');
      return;
    } catch {
      // Fall through to the local fallback below.
    }
  }

  if (value) store.set('aiApiKeyFallback', value);
  else store.remove('aiApiKeyFallback');
}

async function hydrateAiSecureSettings() {
  const secureApiKey = await readAiApiKeySecure();
  const fallbackApiKey = String(store.get('aiApiKeyFallback', '') || '').trim();
  const resolvedApiKey = secureApiKey || legacyPersistedAiApiKey || fallbackApiKey || '';

  if (!secureApiKey && resolvedApiKey) {
    await persistAiApiKeySecure(resolvedApiKey);
  }

  state.aiSettings = {
    ...state.aiSettings,
    apiKey: resolvedApiKey,
  };

  if (legacyPersistedAiApiKey || Object.prototype.hasOwnProperty.call(persistedAiSettings || {}, 'apiKey')) {
    store.set('aiSettings', sanitizeAiSettingsForStorage({ ...state.aiSettings }));
  }
}

function normalizeAssistantServerUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function normalizeOpenAiBaseUrl(url) {
  return String(url || DIRECT_OPENAI_BASE_URL).trim().replace(/\/+$/, '') || DIRECT_OPENAI_BASE_URL;
}

function normalizeAiProviderMode(value) {
  return String(value || '').trim().toLowerCase() === 'server' ? 'server' : 'direct';
}

function normalizeAiModelTier(value) {
  const normalized = String(value || 'auto').trim().toLowerCase();
  return normalized === 'light' || normalized === 'heavy' ? normalized : 'auto';
}

function buildRemoteAssistantPrompt(body) {
  const historyText = Array.isArray(body.history)
    ? body.history.slice(0, 4).map((item, index) => `${index + 1}. ${item.query || ''} => ${item.title || item.intro || ''}`).join('\n')
    : '';

  const refsText = Array.isArray(body.localAnswer?.references)
    ? body.localAnswer.references
        .map((ref, index) => `${index + 1}. ${ref.title || ''} | ${ref.meta || ''} | ${ref.excerpt || ''}`)
        .join('\n')
    : '';

  const contextPack = body.contextPack || null;
  const contextItemsText = Array.isArray(contextPack?.items)
    ? contextPack.items
        .slice(0, 8)
        .map((item, index) => `${index + 1}. ${item.label || ''} | ${item.value || ''}`)
        .join('\n')
    : '';

  return [
    'سؤال المستخدم:',
    body.query || '',
    '',
    'السياق المحلي الموثوق من داخل التطبيق:',
    `العنوان المحلي: ${body.localAnswer?.title || ''}`,
    `التمهيد المحلي: ${body.localAnswer?.intro || ''}`,
    ...(body.localAnswer?.bullets || []).map((bullet, index) => `- نقطة محلية ${index + 1}: ${bullet}`),
    refsText ? ['', 'المراجع المحلية المتاحة:', refsText] : [],
    contextPack ? ['', `السياق الإضافي: ${contextPack.title || 'بدون عنوان'}`, contextPack.summary || '', contextPack.details || ''] : [],
    contextItemsText ? ['', 'عناصر سياقية إضافية:', contextItemsText] : [],
    body.activeLesson ? ['', `الدرس المفتوح الآن: ${body.activeLesson.title || ''} | ${body.activeLesson.sectionTitle || ''}`, body.activeLesson.summary || ''] : [],
    historyText ? ['', 'آخر الأسئلة:', historyText] : [],
  ].flat().join('\n');
}

function resolveDirectModelRouting(body, includeWebSearch) {
  const preferredTier = String(body.preferredModelTier || '').trim().toLowerCase();
  const query = String(body.query || '').trim();
  const queryWords = query.split(/\s+/).filter(Boolean).length;
  const bulletsCount = Array.isArray(body.localAnswer?.bullets) ? body.localAnswer.bullets.length : 0;
  const refsCount = Array.isArray(body.localAnswer?.references) ? body.localAnswer.references.length : 0;
  const historyCount = Array.isArray(body.history) ? body.history.length : 0;
  const contextPack = body.contextPack || null;
  const contextText = [
    contextPack?.summary || '',
    contextPack?.details || '',
    ...(Array.isArray(contextPack?.items) ? contextPack.items.map((item) => `${item.label || ''} ${item.value || ''}`) : []),
  ].join(' ');

  if (preferredTier === 'light') {
    return {
      model: DIRECT_OPENAI_LIGHT_MODEL,
      modelTier: 'light',
      escalated: false,
      reason: 'تم طلب المودل الخفيف صراحة.',
    };
  }

  let score = 0;
  const reasons = [];

  if (preferredTier === 'heavy') {
    score += 99;
    reasons.push('تم طلب المودل الأقوى صراحة من الواجهة.');
  }
  if (queryWords >= 18) {
    score += 1;
    reasons.push('السؤال أطول من سؤال مباشر قصير.');
  }
  if (queryWords >= 32 || query.length >= 220) {
    score += 1;
    reasons.push('السؤال يحمل تعليمات أو قيودًا كثيرة.');
  }
  if (refsCount >= 4) {
    score += 1;
    reasons.push('السياق المحلي يحتوي على مراجع متعددة تحتاج دمجًا.');
  }
  if (bulletsCount >= 5) {
    score += 1;
    reasons.push('الإجابة المحلية الأولية غنية وتحتاج إعادة تركيب.');
  }
  if (historyCount >= 3) {
    score += 1;
    reasons.push('هناك سجل أسئلة حديث يحتاج حفظ اتساق الإجابة معه.');
  }
  if (contextText.length >= 260) {
    score += 1;
    reasons.push('هناك سياق إضافي كبير من الشاشة الحالية.');
  }
  if (includeWebSearch) {
    score += 1;
    reasons.push('الطلب يسمح ببحث الويب مع السياق المحلي.');
  }
  if (HEAVY_QUERY_PATTERNS.some((pattern) => pattern.test(query))) {
    score += 2;
    reasons.push('صياغة السؤال تدل على مقارنة أو تحليل أو تخطيط ثقيل.');
  }

  const shouldEscalate = score >= 4;
  return {
    model: shouldEscalate ? DIRECT_OPENAI_HEAVY_MODEL : DIRECT_OPENAI_LIGHT_MODEL,
    modelTier: shouldEscalate ? 'heavy' : 'light',
    escalated: shouldEscalate,
    reason: shouldEscalate
      ? reasons[0] || 'تم التصعيد تلقائيًا بسبب ثقل الطلب.'
      : 'المودل الخفيف كافٍ لهذا النوع من الأسئلة.',
  };
}

function extractOpenAiOutputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const parts = [];
  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      if (content.type === 'output_text' && content.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join('\n\n').trim();
}

function extractOpenAiSources(payload) {
  const sources = [];
  const seen = new Set();

  for (const item of payload?.output || []) {
    for (const content of item?.content || []) {
      for (const annotation of content?.annotations || []) {
        const url = annotation.url || annotation.target?.url || '';
        if (!url || seen.has(url)) continue;
        seen.add(url);
        sources.push({
          title: annotation.title || annotation.target?.title || url,
          url,
        });
      }
    }
  }

  return sources.slice(0, 6);
}

function shouldRetryWithoutWebSearch(error) {
  const message = String(error?.message || '').toLowerCase();
  return message.includes('web_search') || message.includes('tool') || message.includes('unsupported');
}

/* ─── State ────────────────────────────────────────────────── */
const state = {
  currentFileId: null,
  currentPath: null,
  progress: store.get('progress', {}),
  readingProgress: store.get('readingProgress', {}),
  lessonState: store.get('lessonState', {}),
  reviewQueue: store.get('reviewQueue', {}),
  cardState: store.get('cardState', {}),
  quizAttempts: store.get('quizAttempts', {}),
  interviewAttempts: store.get('interviewAttempts', []),
  mistakes: store.get('mistakes', {}),
  blurts: store.get('blurts', {}),
  dailyStreak: store.get('streak', { count: 0, lastAt: null }),
  dailyRecallSession: null,
  flashcardFilter: store.get('flashcardFilter', 'all'),  // 'all' | 'term' | 'cloze'
  reviewInterleave: store.get('reviewInterleave', true),
  scenarios: [],
  scenarioAttempts: store.get('scenarioAttempts', {}),
  currentScenarioSession: null,
  scenarioFilters: store.get('scenarioFilters', { part: 'all', timing: 'all', type: 'all' }),
  confusionPairs: store.get('confusionPairs', {}),  // {"termA|termB": count}
  teachBack: store.get('teachBack', {}),            // {lessonId: [{role, text, audio, at, coverage}]}
  twoPassLessons: store.get('twoPassLessons', {}),  // {lessonId: true}
  notes: store.get('notes', {}),
  noteEntries: migrateLegacyNotes(store.get('noteEntries', []), store.get('notes', {})),
  scrollPos: store.get('scroll', {}),
  dark: store.get('dark', false),
  sidebarOpen: store.get('sidebar', true),
  fontScale: store.get('fontScale', 1),
  focusMode: store.get('focusMode', false),
  speechRate: store.get('speechRate', 1),
  aiAssistantHistory: store.get('aiAssistantHistory', []),
  aiSetupDismissed: !!store.get('aiSetupDismissed', false),
  aiSettings: {
    ...DEFAULT_AI_SETTINGS,
    ...sanitizeAiSettingsForStorage(persistedAiSettings),
  },
  aiConnectionStatus: null,
  aiRequestToken: 0,
  aiContextDraft: null,
  contentCache: {},     // path → text
  allItems: [],         // flat list of all file items
  glossaryTerms: [],
  flashcards: [],
  quizBank: [],
  systemComparisons: [],
  interviewBank: [],
  currentQuizSession: null,
  currentInterviewSession: null,
  contentIndex: null,
  aiKnowledge: null,
  studyMetadata: null,
  domainConfig: null,
  searchIndexReady: false,
};

store.set('noteEntries', state.noteEntries);

/* ─── DOM refs ─────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const $sidebar   = $('sidebar');
const $main      = $('main');
const $content   = $('content');
const $sideTree  = $('sidebar-tree');
const $progBar   = $('progress-bar');
const $progText  = $('progress-text');
const $btnDashboard = $('btn-dashboard');
const $btnAI     = $('btn-ai');
const $btnDone   = $('btn-done');
const $btnCards  = $('btn-cards');
const $btnQuiz   = $('btn-quiz');
const $btnSystems = $('btn-systems');
const $btnInterview = $('btn-interview');
const $btnReview = $('btn-review');
const $btnMistakes = $('btn-mistakes');
const $btnNotes  = $('btn-notes');
const $noteDrw   = $('notes-drawer');
const $noteBody  = $('notes-body');
const $noteFT    = $('notes-file-title');
const $srchOvl   = $('search-overlay');
const $srchInp   = $('search-input');
const $srchRes   = $('search-results');
const $srchStat  = $('search-status');
const $lesNav    = $('lesson-nav');
const $btnPrev   = $('btn-prev');
const $btnNext   = $('btn-next');
const $breadcrumb = $('content-breadcrumb');
const $contentMeta = $('content-meta');
const $readProgBar = $('lesson-reading-progress-bar');
const $contentTopbar = $('content-topbar');
const $lessonTools = $('lesson-tools');
const $btnFontSmaller = $('btn-font-smaller');
const $btnFontLarger = $('btn-font-larger');
const $btnFocusMode = $('btn-focus-mode');
const $btnMobileTools = $('btn-mobile-tools');
const $topbarActions = $('topbar-actions');
const $mobileReadingTools = $('mobile-reading-tools');
const $mobileReadingToolsSlot = $('mobile-reading-tools-slot');

/* ─── Helpers ──────────────────────────────────────────────── */
function encodePath(p) {
  return p.split('/').map(seg => encodeURIComponent(seg)).join('/');
}

function escapeHtml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderMarkdown(text) {
  if (window.marked?.parse) {
    return window.marked.parse(text);
  }

  return `
    <div style="padding:1rem; border:1px solid var(--border); border-radius:12px; background:var(--surface2);">
      <p style="margin-bottom:1rem; color:var(--text-muted);">تعذر تحميل محرّك Markdown المحلي، لذلك تم عرض المحتوى كنص خام.</p>
      <pre><code>${escapeHtml(text)}</code></pre>
    </div>
  `;
}

function isLocalHostname(hostname) {
  const value = String(hostname || '').trim().toLowerCase();
  return !value || value === 'localhost' || value === '127.0.0.1' || value === '::1';
}

function getSuggestedAssistantServerUrl() {
  if (typeof window === 'undefined') return '';
  const hostname = String(window.location.hostname || '').trim();
  if (isLocalHostname(hostname)) return '';
  return `http://${hostname}:8787`;
}

function cleanRemoteAssistantAnswer(text) {
  return String(text || '')
    .replace(/cite[^]*/g, '')
    .replace(/turn\d+search\d+/gi, '')
    .replace(/(<[^>]+>)/g, '')
    .replace(/(\*\*[^*\n]+\*\*)\s+-\s+/g, '$1\n- ')
    .replace(/([^\n])\s+(#{2,6}\s)/g, '$1\n\n$2')
    .replace(/([^\n])\s+(\d+[\.)]\s+)/g, '$1\n\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderRemoteAssistantBody(answer) {
  const cleaned = cleanRemoteAssistantAnswer(answer);
  if (!cleaned) {
    return '<div class="ai-remote-note">الخادم عاد بدون نص واضح.</div>';
  }
  return `<div class="ai-remote-markdown">${renderMarkdown(cleaned)}</div>`;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function supportsSpeechSynthesis() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function stopLessonSpeech() {
  if (!supportsSpeechSynthesis()) return;
  currentSpeechQueueToken += 1;
  window.speechSynthesis.cancel();
  currentSpeechUtterance = null;
}

function setSpeechRate(value) {
  const nextValue = Math.min(1.35, Math.max(0.75, Number(value) || 1));
  state.speechRate = Math.round(nextValue * 100) / 100;
  store.set('speechRate', state.speechRate);
}

function openTeachBackAudioDb() {
  if (teachBackAudioDbPromise) return teachBackAudioDbPromise;
  if (!('indexedDB' in window)) return Promise.resolve(null);

  teachBackAudioDbPromise = new Promise((resolve) => {
    const request = window.indexedDB.open(TEACHBACK_AUDIO_DB, 3);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TEACHBACK_AUDIO_STORE)) {
        db.createObjectStore(TEACHBACK_AUDIO_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(LESSON_AUDIO_STORE)) {
        db.createObjectStore(LESSON_AUDIO_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(NOTE_AUDIO_STORE)) {
        db.createObjectStore(NOTE_AUDIO_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });

  return teachBackAudioDbPromise;
}

async function saveTeachBackAudioBlob(lessonId, blob) {
  const db = await openTeachBackAudioDb();
  if (!db || !blob) return null;

  const audioId = `tb:${lessonId}:${Date.now()}`;
  return new Promise((resolve) => {
    const tx = db.transaction(TEACHBACK_AUDIO_STORE, 'readwrite');
    tx.objectStore(TEACHBACK_AUDIO_STORE).put({
      id: audioId,
      lessonId,
      blob,
      createdAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve(audioId);
    tx.onerror = () => resolve(null);
  });
}

async function getTeachBackAudioUrl(audioId) {
  const db = await openTeachBackAudioDb();
  if (!db || !audioId) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(TEACHBACK_AUDIO_STORE, 'readonly');
    const request = tx.objectStore(TEACHBACK_AUDIO_STORE).get(audioId);
    request.onsuccess = () => {
      const record = request.result;
      resolve(record?.blob ? URL.createObjectURL(record.blob) : null);
    };
    request.onerror = () => resolve(null);
  });
}

async function deleteTeachBackAudio(audioId) {
  const db = await openTeachBackAudioDb();
  if (!db || !audioId) return;

  await new Promise((resolve) => {
    const tx = db.transaction(TEACHBACK_AUDIO_STORE, 'readwrite');
    tx.objectStore(TEACHBACK_AUDIO_STORE).delete(audioId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

async function saveNoteAudioBlob(noteId, blob) {
  const db = await openTeachBackAudioDb();
  if (!db || !blob || !noteId) return null;

  const audioId = `note-audio:${noteId}:${Date.now()}`;
  return new Promise((resolve) => {
    const tx = db.transaction(NOTE_AUDIO_STORE, 'readwrite');
    tx.objectStore(NOTE_AUDIO_STORE).put({
      id: audioId,
      noteId,
      blob,
      createdAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve(audioId);
    tx.onerror = () => resolve(null);
  });
}

async function getNoteAudioUrl(audioId) {
  const db = await openTeachBackAudioDb();
  if (!db || !audioId) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(NOTE_AUDIO_STORE, 'readonly');
    const request = tx.objectStore(NOTE_AUDIO_STORE).get(audioId);
    request.onsuccess = () => {
      const record = request.result;
      resolve(record?.blob ? URL.createObjectURL(record.blob) : null);
    };
    request.onerror = () => resolve(null);
  });
}

async function deleteNoteAudio(audioId) {
  const db = await openTeachBackAudioDb();
  if (!db || !audioId) return;

  await new Promise((resolve) => {
    const tx = db.transaction(NOTE_AUDIO_STORE, 'readwrite');
    tx.objectStore(NOTE_AUDIO_STORE).delete(audioId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

function buildLessonAudioId(lessonId, scopeId) {
  return `lesson:${lessonId}:${scopeId || 'full'}`;
}

function preferredLessonAudioFormat() {
  if (typeof document === 'undefined') return 'mp3';
  const audio = document.createElement('audio');
  if (audio.canPlayType('audio/ogg; codecs="opus"')) return 'opus';
  if (audio.canPlayType('audio/aac')) return 'aac';
  return 'mp3';
}

function formatLessonAudioSize(bytes) {
  const size = Math.max(0, Number(bytes) || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

async function saveLessonAudioBlob(lessonId, scopeId, meta, blob) {
  const db = await openTeachBackAudioDb();
  const lessonAudioParts = Array.isArray(blob?.parts)
    ? blob.parts.filter((part) => part?.blob)
    : (blob?.blob ? [blob] : blob ? [{ blob }] : []);
  const primaryBlob = lessonAudioParts[0]?.blob || null;
  if (!db || !primaryBlob) return null;

  const audioId = buildLessonAudioId(lessonId, scopeId);
  return new Promise((resolve) => {
    const tx = db.transaction(LESSON_AUDIO_STORE, 'readwrite');
    tx.objectStore(LESSON_AUDIO_STORE).put({
      id: audioId,
      lessonId,
      scopeId,
      title: meta?.title || '',
      minutes: meta?.minutes || 0,
      format: meta?.format || '',
      model: meta?.model || '',
      voice: meta?.voice || '',
      bytes: Number(meta?.bytes) || lessonAudioParts.reduce((sum, part) => sum + (Number(part.bytes) || Number(part.blob?.size) || 0), 0),
      createdAt: new Date().toISOString(),
      blob: primaryBlob,
      parts: lessonAudioParts.map((part, index) => ({
        id: part.id || `part-${index + 1}`,
        title: part.title || `المقطع ${index + 1}`,
        bytes: Number(part.bytes) || Number(part.blob?.size) || 0,
        blob: part.blob,
      })),
    });
    tx.oncomplete = () => resolve(audioId);
    tx.onerror = () => resolve(null);
  });
}

async function getLessonAudioRecord(lessonId, scopeId) {
  const db = await openTeachBackAudioDb();
  if (!db) return null;

  return new Promise((resolve) => {
    const tx = db.transaction(LESSON_AUDIO_STORE, 'readonly');
    const request = tx.objectStore(LESSON_AUDIO_STORE).get(buildLessonAudioId(lessonId, scopeId));
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

async function getLessonAudioUrl(lessonId, scopeId) {
  const record = await getLessonAudioRecord(lessonId, scopeId);
  const parts = Array.isArray(record?.parts) && record.parts.length
    ? record.parts.filter((part) => part?.blob)
    : (record?.blob ? [{ blob: record.blob }] : []);
  return parts[0]?.blob ? URL.createObjectURL(parts[0].blob) : null;
}

async function requestLessonSpeechAudio(file, scope) {
  const settings = getAiSettings();
  const format = preferredLessonAudioFormat();
  const textParts = splitSpeechTextIntoChunks(scope?.text || '', REMOTE_TTS_MAX_CHARS);
  if (!textParts.length) throw new Error('لا يوجد نص واضح لتحضير الصوت العربي.');

  const audioParts = [];
  let lastModel = '';
  let lastVoice = '';
  let lastFormat = format;

  for (let index = 0; index < textParts.length; index += 1) {
    const partTitle = textParts.length > 1 ? `${scope.title} — الجزء ${index + 1}` : scope.title;
    if (settings.providerMode === 'direct') {
      if (!settings.apiKey) throw new Error('ضع مفتاح OpenAI في إعدادات الذكاء أولًا.');
      const baseUrl = normalizeOpenAiBaseUrl(settings.openaiBaseUrl);
      const requestBody = {
        model: DIRECT_OPENAI_TTS_MODEL,
        voice: DIRECT_OPENAI_TTS_VOICE,
        input: textParts[index],
        format,
        instructions: 'اقرأ النص بالعربية الفصحى الواضحة، بوتيرة تعليمية هادئة ومناسبة للمذاكرة، وتجنب تهجئة الرموز الإنجليزية حرفًا حرفًا إلا إذا كانت ضرورية.',
      };
      const res = await fetch(`${baseUrl}/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const suffix = textParts.length > 1 ? ` في الجزء ${index + 1} من ${textParts.length}` : '';
        throw new Error((errorBody?.error?.message || `فشل توليد الصوت العربي مباشرة (${res.status}).`) + suffix);
      }
      const blob = await res.blob();
      lastModel = DIRECT_OPENAI_TTS_MODEL;
      lastVoice = DIRECT_OPENAI_TTS_VOICE;
      lastFormat = format;
      audioParts.push({
        id: `part-${index + 1}`,
        title: textParts.length > 1 ? `المقطع ${index + 1}` : partTitle,
        blob,
        bytes: Number(blob.size) || 0,
      });
      continue;
    }

    const baseUrl = normalizeAssistantServerUrl(settings.serverUrl || DEFAULT_AI_SETTINGS.serverUrl);
    if (!baseUrl) throw new Error('عنوان خادم الصوت العربي غير مضبوط.');
    const res = await fetch(`${baseUrl}/api/lesson-audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lessonId: file.id,
        scopeId: scope.id,
        title: partTitle,
        text: textParts[index],
        format,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const suffix = textParts.length > 1 ? ` في الجزء ${index + 1} من ${textParts.length}` : '';
      throw new Error((body?.error || `فشل توليد الصوت العربي (${res.status}).`) + suffix);
    }

    const blob = await res.blob();
    lastModel = res.headers.get('X-TTS-Model') || lastModel;
    lastVoice = res.headers.get('X-TTS-Voice') || lastVoice;
    lastFormat = res.headers.get('X-TTS-Format') || lastFormat;
    audioParts.push({
      id: `part-${index + 1}`,
      title: textParts.length > 1 ? `المقطع ${index + 1}` : partTitle,
      blob,
      bytes: Number(res.headers.get('X-Audio-Bytes') || 0) || Number(blob.size) || 0,
    });
  }

  return {
    parts: audioParts,
    model: lastModel,
    voice: lastVoice,
    format: lastFormat,
    bytes: audioParts.reduce((sum, part) => sum + (Number(part.bytes) || Number(part.blob?.size) || 0), 0),
  };
}

async function renderLessonAudioPlayer(host, lessonId, scope, autoPlay = false) {
  if (!host || !lessonId || !scope) return false;
  const record = await getLessonAudioRecord(lessonId, scope.id);
  const parts = Array.isArray(record?.parts) && record.parts.length
    ? record.parts.filter((part) => part?.blob)
    : (record?.blob ? [{ id: 'part-1', title: record.title || 'المقطع 1', bytes: Number(record.bytes) || Number(record.blob?.size) || 0, blob: record.blob }] : []);
  if (!record || !parts.length) {
    host.innerHTML = '<div class="lesson-audio-cache-empty">لا يوجد صوت عربي محفوظ لهذا الجزء بعد.</div>';
    return false;
  }

  const renderedParts = parts.map((part, index) => ({
    ...part,
    url: URL.createObjectURL(part.blob),
    label: parts.length > 1 ? (part.title || `المقطع ${index + 1}`) : 'الصوت المحفوظ',
  }));

  host.innerHTML = `
    <div class="lesson-audio-parts">
      ${renderedParts.map((part, index) => `
        <div class="lesson-audio-part">
          <div class="lesson-audio-part-title">${escapeHtml(part.label)}${renderedParts.length > 1 ? ` • ${index + 1}/${renderedParts.length}` : ''}</div>
          <audio controls preload="metadata" src="${part.url}"></audio>
        </div>
      `).join('')}
    </div>
    <div class="lesson-audio-meta">صيغة مضغوطة: ${escapeHtml(String(record.format || 'mp3').toUpperCase())} • الحجم: ${escapeHtml(formatLessonAudioSize(record.bytes || record.blob?.size || 0))} • ${escapeHtml(String(renderedParts.length))} ${renderedParts.length === 1 ? 'مقطع' : 'مقاطع'}</div>
  `;
  if (autoPlay) {
    const audioNodes = Array.from(host.querySelectorAll('audio'));
    audioNodes.forEach((audioNode, index) => {
      audioNode.addEventListener('ended', () => {
        audioNodes[index + 1]?.play?.().catch(() => {});
      });
    });
    audioNodes[0]?.play?.().catch(() => {});
  }
  return true;
}

async function copyTextToClipboard(text) {
  const value = String(text || '').trim();
  if (!value) return false;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', 'readonly');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand('copy');
  textarea.remove();
  return success;
}

function buildLessonCopyText(file, scope, mode = 'plain') {
  const lessonScope = scope && scope.id !== 'full'
    ? scope
    : (collectLessonSpeechScopes(file)[0] || scope || null);
  const lessonTitle = file?.title || 'الدرس الحالي';
  const sectionTitle = lessonScope?.title || 'الدرس كامل';
  const contentText = String(lessonScope?.text || '').trim();

  if (!contentText) return '';

  if (mode === 'chat') {
    return [
      `عنوان الدرس: ${lessonTitle}`,
      `القسم المحدد: ${sectionTitle}`,
      '',
      'هذا هو المحتوى الحالي من درس داخل تطبيقي الدراسي:',
      contentText,
      '',
      'سؤالي لك:',
      '[اكتب سؤالك هنا]',
      '',
      'إذا كان سؤالي مرتبطًا بهذا المحتوى فاستخدمه مباشرة. وإذا كان عامًا أو خارج هذا المحتوى فاذكر ذلك بوضوح ثم أجب عنه.',
    ].join('\n');
  }

  return [
    `عنوان الدرس: ${lessonTitle}`,
    `القسم: ${sectionTitle}`,
    '',
    contentText,
  ].join('\n');
}

function markdownToSpeechText(markdown) {
  const sandbox = document.createElement('div');
  sandbox.innerHTML = renderMarkdown(String(markdown || ''));
  return sandbox.textContent.replace(/\s+/g, ' ').trim();
}

function normalizeSpeechText(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\bvs\b/gi, ' مقابل ')
    .replace(/[•▪●]/g, ' ')
    .replace(/[_*#>`~]/g, ' ')
    .replace(/\//g, ' / ')
    .replace(/&/g, ' و ')
    .replace(/\s+/g, ' ')
    .replace(/([:؛،.؟!])(?=\S)/g, '$1 ')
    .trim();
}

function splitSpeechTextIntoChunks(text, maxChars = DEVICE_SPEECH_MAX_CHARS) {
  const cleaned = normalizeSpeechText(text);
  if (!cleaned) return [];

  const sentences = cleaned.match(/[^\.؟!؛:\n]+[\.؟!؛:\n]*/g) || [cleaned];
  const chunks = [];
  let current = '';

  sentences.forEach((sentence) => {
    const part = sentence.trim();
    if (!part) return;

    if (!current) {
      current = part;
      return;
    }

    if ((`${current} ${part}`).length <= maxChars) {
      current = `${current} ${part}`.trim();
      return;
    }

    chunks.push(current);
    if (part.length <= maxChars) {
      current = part;
      return;
    }

    const words = part.split(/\s+/);
    current = '';
    words.forEach((word) => {
      if (!current) {
        current = word;
        return;
      }
      if ((`${current} ${word}`).length <= maxChars) {
        current = `${current} ${word}`;
      } else {
        chunks.push(current);
        current = word;
      }
    });
  });

  if (current) chunks.push(current);
  return chunks.filter(Boolean);
}

function estimateSpeechMinutes(text) {
  const words = normalizeSpeechText(text).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 150));
}

function formatSpeechMinutes(minutes) {
  const count = Math.max(1, Number(minutes) || 1);
  if (count === 1) return 'حوالي دقيقة واحدة';
  if (count === 2) return 'حوالي دقيقتين';
  if (count <= 10) return `حوالي ${count} دقائق`;
  return `حوالي ${count} دقيقة`;
}

function isSpeechExcludedNode(node) {
  if (!(node instanceof HTMLElement)) return true;
  if (node.matches('.study-aids, .lesson-reflection, .why-prompt, .teachback-panel, .blurt-panel, .lesson-audio-panel, .lesson-ai-panel, .lesson-toc, .pre-reading-prompt, .qa-spoiler, .hidden, script, style, button, select, textarea, input, audio')) {
    return true;
  }

  return !!node.closest('.study-aids, .lesson-reflection, .why-prompt, .teachback-panel, .blurt-panel, .lesson-audio-panel, .lesson-ai-panel, .lesson-toc, .pre-reading-prompt, .qa-spoiler, .hidden');
}

function extractSpeechTextFromNode(node) {
  if (!(node instanceof HTMLElement) || isSpeechExcludedNode(node)) return '';

  const clone = node.cloneNode(true);
  clone.querySelectorAll('.hidden, button, select, textarea, input, audio').forEach((child) => child.remove());
  const rawText = clone.textContent || '';
  const prefix = /^H[1-4]$/.test(node.tagName) ? `عنوان القسم: ${rawText}` : rawText;
  return normalizeSpeechText(prefix);
}

function collectLessonSpeechScopes(file) {
  const contentChildren = Array.from($content.children).filter((node) => node instanceof HTMLElement && !isSpeechExcludedNode(node));
  const sections = [];
  let currentSection = null;

  const flushSection = () => {
    if (!currentSection) return;
    const text = normalizeSpeechText(currentSection.parts.join(' '));
    if (!text) return;
    sections.push({
      id: currentSection.id,
      title: currentSection.title,
      text,
    });
  };

  contentChildren.forEach((node, index) => {
    if (/^H[1-3]$/.test(node.tagName)) {
      flushSection();
      currentSection = {
        id: node.id || `speech-section-${index + 1}`,
        title: normalizeSpeechText(node.textContent) || `القسم ${sections.length + 1}`,
        parts: [extractSpeechTextFromNode(node)],
      };
      return;
    }

    const text = extractSpeechTextFromNode(node);
    if (!text) return;
    if (!currentSection) {
      currentSection = {
        id: 'speech-intro',
        title: file?.title || 'مقدمة الدرس',
        parts: [],
      };
    }
    currentSection.parts.push(text);
  });

  flushSection();

  const scopes = sections.map((section) => ({
    id: `section:${section.id}`,
    title: section.title,
    text: section.text,
    minutes: estimateSpeechMinutes(section.text),
    chunks: splitSpeechTextIntoChunks(section.text, REMOTE_TTS_MAX_CHARS).length,
  }));

  const fullText = normalizeSpeechText(sections.map((section) => section.text).join(' '));
  if (fullText) {
    scopes.unshift({
      id: 'full',
      title: 'الدرس كامل',
      text: fullText,
      minutes: estimateSpeechMinutes(fullText),
      chunks: splitSpeechTextIntoChunks(fullText, REMOTE_TTS_MAX_CHARS).length,
    });
  }

  return scopes;
}

function describeSpeechScope(scope) {
  if (!scope) return 'لا يوجد نص واضح للقراءة في هذا الدرس.';
  return `سيُقرأ الآن: ${scope.title} • ${formatSpeechMinutes(scope.minutes)} • ${scope.chunks} مقاطع صوتية.`;
}

function getSpeechVoicesSnapshot() {
  if (!supportsSpeechSynthesis()) return [];
  return window.speechSynthesis.getVoices().filter(Boolean);
}

function cacheSpeechVoices(voices) {
  speechVoicesCache = Array.isArray(voices) ? voices.filter(Boolean) : [];
  return speechVoicesCache;
}

async function loadSpeechVoices(timeoutMs = 1500) {
  if (!supportsSpeechSynthesis()) return null;
  const immediateVoices = cacheSpeechVoices(getSpeechVoicesSnapshot());
  if (immediateVoices.length) return immediateVoices;
  if (speechVoicesPromise) return speechVoicesPromise;

  speechVoicesPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      synth.removeEventListener?.('voiceschanged', handleVoicesChanged);
      speechVoicesPromise = null;
      resolve(cacheSpeechVoices(getSpeechVoicesSnapshot()));
    };

    const handleVoicesChanged = () => {
      const voices = cacheSpeechVoices(getSpeechVoicesSnapshot());
      if (voices.length) finish();
    };

    synth.addEventListener?.('voiceschanged', handleVoicesChanged);
    cacheSpeechVoices(getSpeechVoicesSnapshot());
    setTimeout(finish, timeoutMs);
  });

  return speechVoicesPromise;
}

function findArabicSpeechVoice(voices) {
  const safeVoices = Array.isArray(voices) ? voices : [];
  const exactArabic = ['ar-sa', 'ar-eg', 'ar-001', 'ar-ae', 'ar-jo'];
  return exactArabic.map((lang) => safeVoices.find((voice) => voice.lang?.toLowerCase() === lang)).find(Boolean)
    || safeVoices.find((voice) => voice.lang?.toLowerCase().startsWith('ar'))
    || safeVoices.find((voice) => /arabic|ar-/i.test(`${voice.lang || ''} ${voice.name || ''}`))
    || null;
}

async function pickSpeechVoice() {
  if (!supportsSpeechSynthesis()) return null;
  const voices = speechVoicesCache.length ? speechVoicesCache : await loadSpeechVoices();
  return findArabicSpeechVoice(voices);
}

async function updateLessonSpeechAvailability(statusNode) {
  if (!statusNode) return;
  if (!supportsSpeechSynthesis()) {
    statusNode.textContent = 'القراءة الصوتية غير مدعومة على هذا الجهاز';
    return;
  }

  const voices = speechVoicesCache.length ? speechVoicesCache : await loadSpeechVoices();
  const arabicVoice = findArabicSpeechVoice(voices);
  if (arabicVoice) {
    statusNode.textContent = `جاهز لقراءة هذا الدرس بصوت عربي: ${arabicVoice.name || arabicVoice.lang || 'صوت عربي'}`;
    return;
  }

  statusNode.textContent = 'لم أجد صوتًا عربيًا مثبتًا على هذا الجهاز. قد يعمل المحرك الافتراضي، لكن الأفضل تثبيت Arabic TTS.';
}

async function startLessonSpeech(file, statusNode, scope) {
  if (!supportsSpeechSynthesis()) {
    if (statusNode) statusNode.textContent = 'القراءة الصوتية غير مدعومة على هذا الجهاز';
    return;
  }

  const selectedScope = scope || collectLessonSpeechScopes(file)[0] || null;
  const speechText = selectedScope?.text || markdownToSpeechText(state.contentCache[file.path] || '');
  if (!speechText) {
    if (statusNode) statusNode.textContent = 'لا يوجد نص مقروء متاح لهذا الدرس';
    return;
  }

  stopLessonSpeech();
  const queueToken = currentSpeechQueueToken;
  const chunks = splitSpeechTextIntoChunks(speechText);
  const voice = await pickSpeechVoice();
  const rate = state.speechRate || 1;

  if (!chunks.length) {
    if (statusNode) statusNode.textContent = 'تعذر تجهيز نص الدرس للقراءة';
    return;
  }

  const speakChunk = (index) => {
    if (queueToken !== currentSpeechQueueToken || index >= chunks.length) {
      if (queueToken === currentSpeechQueueToken && statusNode) {
        statusNode.textContent = `انتهت قراءة: ${selectedScope?.title || 'الدرس'}`;
      }
      currentSpeechUtterance = null;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    utterance.lang = voice?.lang || 'ar-SA';
    utterance.rate = rate;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (statusNode) {
        statusNode.textContent = `جاري قراءة: ${selectedScope?.title || 'الدرس'} (${index + 1}/${chunks.length}) بسرعة ${rate.toFixed(2)}x • ${voice?.name || 'محرك العربية الافتراضي'}`;
      }
    };
    utterance.onend = () => {
      if (queueToken !== currentSpeechQueueToken) return;
      speakChunk(index + 1);
    };
    utterance.onerror = () => {
      if (statusNode) statusNode.textContent = 'تعذر تشغيل القراءة الصوتية لهذا المقطع';
      currentSpeechUtterance = null;
    };

    currentSpeechUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  };

  if (statusNode && !voice) {
    statusNode.textContent = 'لم أجد صوتًا عربيًا مثبتًا بالاسم، سأجرب المحرك الافتراضي. إذا بقي النطق غير عربي فالمشكلة من إعدادات TTS في الجهاز.';
  }
  speakChunk(0);
}

async function hydrateTeachBackAudio(panel, entry) {
  if (!entry?.audioId) return;

  const host = panel.querySelector('[data-teachback-last-audio]');
  if (!host) return;

  host.textContent = 'جار تحميل الملاحظة الصوتية...';
  const audioUrl = await getTeachBackAudioUrl(entry.audioId);
  if (!audioUrl) {
    host.textContent = 'تعذر تحميل التسجيل المحفوظ';
    return;
  }

  host.innerHTML = `<audio controls preload="metadata" src="${audioUrl}"></audio>`;
}

function normalizedGlossaryTerms() {
  const seen = new Set();
  const terms = [];

  state.glossaryTerms.forEach(item => {
    const aliases = [item.arabic, item.english, ...(item.aliases || [])]
      .map(value => String(value || '').trim())
      .filter(value => value.length >= 2);

    aliases.forEach(alias => {
      const key = alias.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      terms.push({
        term: alias,
        item,
        pattern: new RegExp(escapeRegExp(alias), 'giu'),
      });
    });
  });

  return terms.sort((a, b) => b.term.length - a.term.length);
}

function applyGlossaryTooltips(container) {
  if (!state.glossaryTerms.length) return;

  const glossary = normalizedGlossaryTerms();
  if (!glossary.length) return;

  const blocked = new Set(['A', 'CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA', 'BUTTON']);
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (blocked.has(parent.tagName) || parent.closest('.glossary-term, .study-aids, .lesson-reflection')) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  const perTermCount = new Map();
  let totalMatches = 0;
  const maxTotalMatches = 80;
  const maxPerTerm = 2;

  nodes.forEach(node => {
    if (totalMatches >= maxTotalMatches) return;

    const text = node.nodeValue;
    const matches = [];

    glossary.forEach(entry => {
      if (totalMatches + matches.length >= maxTotalMatches) return;
      const currentCount = perTermCount.get(entry.term.toLowerCase()) || 0;
      if (currentCount >= maxPerTerm) return;

      entry.pattern.lastIndex = 0;
      let match;
      while ((match = entry.pattern.exec(text)) && currentCount + matches.filter(m => m.entry.term === entry.term).length < maxPerTerm) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          entry,
        });
      }
    });

    if (!matches.length) return;

    matches.sort((a, b) => a.start - b.start || b.end - a.end);
    const selected = [];
    let cursor = -1;
    matches.forEach(match => {
      if (match.start < cursor) return;
      selected.push(match);
      cursor = match.end;
    });

    if (!selected.length) return;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;

    selected.forEach(match => {
      if (match.start > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.start)));
      }

      const item = match.entry.item;
      const span = document.createElement('span');
      span.className = 'glossary-term';
      span.tabIndex = 0;
      span.textContent = match.text;
      span.setAttribute('data-term', item.arabic || item.english || match.text);
      span.setAttribute('data-english', item.english || '');
      span.setAttribute('data-definition', item.definition || '');

      const tooltip = document.createElement('span');
      tooltip.className = 'glossary-tooltip';
      tooltip.innerHTML = `
        <strong>${escapeHtml(item.arabic || match.text)}</strong>
        ${item.english ? `<em>${escapeHtml(item.english)}</em>` : ''}
        ${item.definition ? `<span>${escapeHtml(item.definition)}</span>` : ''}
      `;
      span.appendChild(tooltip);
      fragment.appendChild(span);

      const key = match.entry.term.toLowerCase();
      perTermCount.set(key, (perTermCount.get(key) || 0) + 1);
      totalMatches += 1;
      lastIndex = match.end;
    });

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    node.replaceWith(fragment);
  });
}

function allTrackable() {
  return state.allItems.filter(f => f.trackable);
}

function doneCount() {
  return allTrackable().filter(f => state.progress[f.id]).length;
}

function totalCount() {
  return allTrackable().length;
}

function findById(id) {
  return state.allItems.find(f => f.id === id);
}

function findByPath(path) {
  return state.allItems.find(f => f.path === path);
}

function sourceSections() {
  return state.contentIndex?.sections || BOOK.sections;
}

function contentBase() {
  return state.contentIndex?.contentBase || BOOK.contentBase;
}

function getLessonMetadata(fileId) {
  return state.studyMetadata?.lessons?.[fileId] || null;
}

function getLessonState(fileId) {
  return state.lessonState[fileId] || {};
}

function findCardById(cardId) {
  return state.flashcards.find(card => card.id === cardId);
}

function findQuestionById(questionId) {
  for (const quiz of state.quizBank) {
    const question = quiz.questions.find(q => q.id === questionId);
    if (question) return { quiz, question };
  }
  return null;
}

function getCardState(cardId) {
  return state.cardState[cardId] || {};
}

function saveCardState(cardId, patch) {
  state.cardState[cardId] = {
    ...getCardState(cardId),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.set('cardState', state.cardState);
}

function saveLessonState(fileId, patch) {
  state.lessonState[fileId] = {
    ...getLessonState(fileId),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  store.set('lessonState', state.lessonState);
}

function daysFromNow(days) {
  const due = new Date();
  due.setDate(due.getDate() + days);
  return due.toISOString();
}

/* SM-2 Light: unified scheduler for lessons, cards, and questions.
   rating: 'again' | 'medium' | 'easy'
   confidence: 'low' | 'med' | 'high'  (optional) */
function normalizeRating(raw, kind) {
  if (kind === 'lesson') {
    if (raw === 'low') return 'again';
    if (raw === 'high') return 'easy';
    return 'medium';
  }
  if (kind === 'card') {
    if (raw === 'again') return 'again';
    if (raw === 'easy') return 'easy';
    return 'medium';
  }
  if (kind === 'question') {
    if (raw === 'wrong') return 'again';
    if (raw === 'correct') return 'easy';
    return 'medium';
  }
  return raw;
}

function nextInterval(prev = {}, rating, confidence = 'med') {
  let ef = typeof prev.easeFactor === 'number' ? prev.easeFactor : 2.5;
  let reps = prev.reps || 0;
  let interval;

  if (rating === 'again') {
    reps = 0;
    ef = Math.max(1.3, ef - 0.2);
    interval = 0;
  } else {
    reps += 1;
    const q = rating === 'easy' ? 5 : rating === 'medium' ? 4 : 3;
    ef = Math.max(1.3, ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.max(1, Math.round((prev.intervalDays || 1) * ef));
  }

  if (confidence === 'low') interval = Math.max(0, Math.round(interval * 0.6));
  else if (confidence === 'high') interval = Math.round(interval * 1.15);

  return { easeFactor: Math.round(ef * 100) / 100, reps, intervalDays: interval };
}

function scheduleReview(fileId, result = 'manual', confidence = 'med') {
  const file = findById(fileId);
  if (!file) return;
  const rating = normalizeRating(getLessonState(fileId).selfRating || 'medium', 'lesson');
  const prev = state.reviewQueue[fileId] || {};
  const sched = nextInterval(prev, rating, confidence);

  state.reviewQueue[fileId] = {
    itemType: file.type === 'test' ? 'quiz-question' : 'lesson',
    sourceId: fileId,
    dueAt: daysFromNow(sched.intervalDays),
    intervalDays: sched.intervalDays,
    easeFactor: sched.easeFactor,
    reps: sched.reps,
    lastResult: result,
    updatedAt: new Date().toISOString(),
  };

  store.set('reviewQueue', state.reviewQueue);
  updateWelcomeStats();
}

function scheduleCardReview(cardId, result, confidence = 'med') {
  const card = findCardById(cardId);
  if (!card) return;
  const key = `card:${cardId}`;
  const prev = state.reviewQueue[key] || {};
  const sched = nextInterval(prev, normalizeRating(result, 'card'), confidence);

  state.reviewQueue[key] = {
    itemType: 'flashcard',
    sourceId: cardId,
    dueAt: daysFromNow(sched.intervalDays),
    intervalDays: sched.intervalDays,
    easeFactor: sched.easeFactor,
    reps: sched.reps,
    lastResult: result,
    updatedAt: new Date().toISOString(),
  };

  store.set('reviewQueue', state.reviewQueue);
  updateWelcomeStats();
}

function scheduleQuestionReview(questionId, result, confidence = 'med') {
  const found = findQuestionById(questionId);
  if (!found) return;
  const key = `question:${questionId}`;
  const prev = state.reviewQueue[key] || {};
  const sched = nextInterval(prev, normalizeRating(result, 'question'), confidence);

  state.reviewQueue[key] = {
    itemType: 'quiz-question',
    sourceId: questionId,
    dueAt: daysFromNow(sched.intervalDays),
    intervalDays: sched.intervalDays,
    easeFactor: sched.easeFactor,
    reps: sched.reps,
    lastResult: result,
    updatedAt: new Date().toISOString(),
  };

  store.set('reviewQueue', state.reviewQueue);
  updateWelcomeStats();
}

function dueReviewItems() {
  const now = Date.now();
  return Object.values(state.reviewQueue)
    .filter(item => Date.parse(item.dueAt) <= now)
    .map(item => {
      const card = item.itemType === 'flashcard' ? findCardById(item.sourceId) : null;
      const questionInfo = item.itemType === 'quiz-question' ? findQuestionById(item.sourceId) : null;
      const file = item.itemType === 'flashcard' || item.itemType === 'quiz-question' ? null : findById(item.sourceId);
      return { ...item, file, card, questionInfo };
    })
    .filter(item => item.file || item.card || item.questionInfo)
    .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}

function getSectionForItem(id) {
  return sourceSections().find(s => s.files.some(f => f.id === id));
}

/* ─── Build flat items list ────────────────────────────────── */
function buildItemsList() {
  state.allItems = [];
  sourceSections().forEach(section => {
    section.files.forEach(file => {
      state.allItems.push({
        ...file,
        type: file.type || file.docType,
        sectionId: section.id,
        sectionTitle: section.title,
      });
    });
  });
}

/* ─── Sidebar rendering ────────────────────────────────────── */
function renderSidebar() {
  $sideTree.innerHTML = '';

  sourceSections().forEach(section => {
    const trackItems = section.files.filter(f => f.trackable);
    const doneSec = trackItems.filter(f => state.progress[f.id]).length;

    const wrap = document.createElement('div');
    wrap.className = 'tree-section';
    wrap.dataset.sectionId = section.id;

    const header = document.createElement('div');
    header.className = 'tree-section-header';

    const isOpen = store.get('sec_' + section.id, true);
    if (isOpen) header.classList.add('open');

    let badgeHtml = '';
    if (section.badge) {
      badgeHtml = `<span class="section-badge" style="background:${section.color}">${section.badge}</span>`;
    }

    const progressMini = trackItems.length
      ? `<span class="section-progress-mini">${doneSec}/${trackItems.length}</span>`
      : '';

    header.innerHTML = `
      ${badgeHtml}
      <span>${section.title}</span>
      ${progressMini}
      <span class="section-arrow">▶</span>
    `;

    const filesDiv = document.createElement('div');
    filesDiv.className = 'tree-files' + (isOpen ? '' : ' collapsed');

    section.files.forEach(file => {
      const item = document.createElement('div');
      item.className = 'tree-item';
      item.dataset.fileId = file.id;

      if (state.currentFileId === file.id) item.classList.add('active');
      const docType = file.type || file.docType;
      if (docType === 'test') item.classList.add('test-item');
      if (file.trackable && state.progress[file.id]) item.classList.add('done');

      const check = file.trackable
        ? `<span class="item-check">${state.progress[file.id] ? '✓' : '○'}</span>`
        : '<span class="item-check" style="opacity:0">○</span>';

      const badge = docType === 'lesson' ? '<span class="item-type-badge badge-lesson">درس</span>'
                  : docType === 'test'   ? '<span class="item-type-badge badge-test">اختبار</span>'
                  : '';

      item.innerHTML = `${check}<span class="item-title">${file.title}</span>${badge}`;

      item.addEventListener('click', () => loadFile(file.id));
      filesDiv.appendChild(item);
    });

    header.addEventListener('click', () => {
      const open = !header.classList.contains('open');
      header.classList.toggle('open', open);
      filesDiv.classList.toggle('collapsed', !open);
      store.set('sec_' + section.id, open);
    });

    wrap.appendChild(header);
    wrap.appendChild(filesDiv);
    $sideTree.appendChild(wrap);
  });
}

/* ─── Sidebar update (without full re-render) ──────────────── */
function updateSidebarItem(fileId) {
  const el = $sideTree.querySelector(`[data-file-id="${fileId}"]`);
  if (!el) return;
  const file = findById(fileId);
  if (!file) return;
  const isDone = file.trackable && state.progress[fileId];
  el.classList.toggle('done', !!isDone);
  const check = el.querySelector('.item-check');
  if (check && file.trackable) check.textContent = isDone ? '✓' : '○';

  // Update section mini progress
  const section = getSectionForItem(fileId);
  if (section) {
    const secEl = $sideTree.querySelector(`[data-section-id="${section.id}"]`);
    if (secEl) {
      const track = section.files.filter(f => f.trackable);
      const done = track.filter(f => state.progress[f.id]).length;
      const mini = secEl.querySelector('.section-progress-mini');
      if (mini) mini.textContent = `${done}/${track.length}`;
    }
  }
}

function setActiveInSidebar(fileId) {
  $sideTree.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
  const el = $sideTree.querySelector(`[data-file-id="${fileId}"]`);
  if (el) {
    el.classList.add('active');
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    // Auto-expand section if collapsed
    const filesDiv = el.closest('.tree-files');
    if (filesDiv && filesDiv.classList.contains('collapsed')) {
      const section = el.closest('.tree-section');
      const header = section?.querySelector('.tree-section-header');
      if (header) {
        header.classList.add('open');
        filesDiv.classList.remove('collapsed');
        const sectionId = section.dataset.sectionId;
        store.set('sec_' + sectionId, true);
      }
    }
  }
}

/* ─── Progress ─────────────────────────────────────────────── */
function updateProgress() {
  const done = doneCount();
  const total = totalCount();
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  $progBar.style.width = pct + '%';
  $progText.textContent = pct + '%';
}

/* ─── Mark done button ─────────────────────────────────────── */
function updateDoneButton(fileId) {
  const file = findById(fileId);
  if (!file || !file.trackable) {
    $btnDone.classList.add('hidden');
    updateReadingToolsVisibility(fileId);
    return;
  }
  $btnDone.classList.remove('hidden');
  const isDone = !!state.progress[fileId];
  $btnDone.classList.toggle('done', isDone);
  $btnDone.textContent = isDone ? '✓ منتهي' : '○ علّم منتهياً';
  updateReadingToolsVisibility(fileId);
}

$btnDone.addEventListener('click', () => {
  if (!state.currentFileId) return;
  const file = findById(state.currentFileId);
  if (!file || !file.trackable) return;
  const isDone = !state.progress[state.currentFileId];
  if (isDone) state.progress[state.currentFileId] = true;
  else delete state.progress[state.currentFileId];
  store.set('progress', state.progress);
  if (isDone) {
    saveLessonState(state.currentFileId, { status: 'completed', completedAt: new Date().toISOString() });
    scheduleReview(state.currentFileId, 'completed');
  } else {
    saveLessonState(state.currentFileId, { status: 'in_progress', completedAt: null });
  }
  updateDoneButton(state.currentFileId);
  updateSidebarItem(state.currentFileId);
  updateProgress();
  updateWelcomeStats();
});

/* ─── Q&A spoiler processing ───────────────────────────────── */
const ANSWER_KEYWORDS = [
  'الإجابة', 'الإجابات', 'الحل', 'نموذج إجابة', 'الإجابة النموذجية',
  'الإجابة الاسترشادية', 'الإجابات الاسترشادية', 'مفتاح الإجابة',
  'تحقق من فهمك', 'نموذج الإجابة', 'الإجابة المختصرة'
];

function processQA(container) {
  const headings = container.querySelectorAll('h2, h3, h4');
  headings.forEach(heading => {
    const text = heading.textContent.trim();
    const isAnswer = ANSWER_KEYWORDS.some(kw => text.includes(kw));
    if (!isAnswer) return;

    // Gather siblings until next same-level heading
    const level = parseInt(heading.tagName[1]);
    const siblings = [];
    let next = heading.nextElementSibling;
    while (next) {
      const nextLevel = next.tagName.match(/^H(\d)$/) ? parseInt(next.tagName[1]) : 99;
      if (nextLevel <= level) break;
      siblings.push(next);
      next = next.nextElementSibling;
    }

    if (siblings.length === 0) return;

    // Wrap in spoiler
    const spoiler = document.createElement('div');
    spoiler.className = 'qa-spoiler';

    const toggle = document.createElement('button');
    toggle.className = 'qa-spoiler-toggle';
    toggle.innerHTML = `<span>💡 ${text}</span><span class="arrow">▼</span>`;

    const body = document.createElement('div');
    body.className = 'qa-spoiler-body hidden';

    siblings.forEach(sib => body.appendChild(sib.cloneNode(true)));

    toggle.addEventListener('click', () => {
      const open = body.classList.toggle('hidden');
      toggle.classList.toggle('open', !open);
    });

    spoiler.appendChild(toggle);
    spoiler.appendChild(body);

    heading.replaceWith(spoiler);
    siblings.forEach(sib => sib.remove());
  });
}

/* ─── File loading ─────────────────────────────────────────── */
function updateContentMeta(file) {
  if (!$contentMeta) return;
  const parts = [];
  if (file?.readingMinutes) parts.push(`${file.readingMinutes} دقائق قراءة`);
  if (file?.docType || file?.type) parts.push(file.docType || file.type);
  if (file?.trackable) parts.push(reviewStatusText(file.id));
  $contentMeta.textContent = parts.join(' · ');
}

function applyHeadingAnchors(file) {
  const renderedHeadings = Array.from($content.querySelectorAll('h1, h2, h3'));
  const indexedHeadings = file?.headings || [];

  renderedHeadings.forEach((heading, idx) => {
    const item = indexedHeadings[idx];
    heading.id = item?.id || `h-${idx + 1}`;
  });
}

/* ─── Blurt Mode (active recall before reading) ───────────── */
function getBlurts(fileId) {
  return state.blurts[fileId] || [];
}

function saveBlurt(fileId, text, coverage) {
  const entry = {
    text: String(text || ''),
    at: new Date().toISOString(),
    coveredTerms: coverage.covered,
    missedTerms: coverage.missed,
    coveragePct: coverage.pct,
  };
  state.blurts[fileId] = [entry, ...getBlurts(fileId)].slice(0, 10);
  store.set('blurts', state.blurts);
}

function lessonGlossaryTerms(file) {
  const text = state.contentCache[file.path] || '';
  if (!text) return [];
  const lower = text.toLowerCase();
  const seen = new Set();
  const result = [];
  state.glossaryTerms.forEach(item => {
    [item.arabic, item.english, ...(item.aliases || [])]
      .map(v => String(v || '').trim())
      .filter(v => v.length >= 3)
      .forEach(term => {
        if (seen.has(term.toLowerCase())) return;
        if (lower.includes(term.toLowerCase())) {
          seen.add(term.toLowerCase());
          result.push(term);
        }
      });
  });
  return result;
}

function computeBlurtCoverage(file, userText) {
  const terms = lessonGlossaryTerms(file);
  if (!terms.length) return { covered: [], missed: [], pct: 0 };
  const lower = String(userText || '').toLowerCase();
  const covered = [];
  const missed = [];
  terms.forEach(term => {
    if (lower.includes(term.toLowerCase())) covered.push(term);
    else missed.push(term);
  });
  const pct = Math.round((covered.length / terms.length) * 100);
  return { covered, missed, pct };
}

function openBlurtOverlay(file) {
  const existing = document.getElementById('blurt-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'blurt-overlay';
  overlay.className = 'blurt-overlay';
  overlay.innerHTML = `
    <div class="blurt-modal">
      <div class="blurt-header">
        <div>
          <div class="study-aid-label">قبل القراءة — استرجاع نشط</div>
          <h2>${escapeHtml(file.title)}</h2>
          <p>اكتب كل ما تتذكره عن هذا الموضوع. لا تفتح الدرس. لا تبحث. اكتب من ذاكرتك فقط.</p>
        </div>
        <button class="blurt-close" data-blurt-close aria-label="إغلاق">✕</button>
      </div>
      <textarea data-blurt-text placeholder="ابدأ الكتابة... كلمات، جمل، رسومات بالكلمات، أي شيء تتذكره."></textarea>
      <div class="blurt-actions">
        <span class="blurt-wordcount" data-blurt-wordcount>0 كلمة</span>
        <div class="blurt-action-buttons">
          <button class="blurt-skip" data-blurt-close>تخطي</button>
          <button class="blurt-save" data-blurt-save>حفظ ومتابعة القراءة</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const textarea = overlay.querySelector('[data-blurt-text]');
  const wc = overlay.querySelector('[data-blurt-wordcount]');
  textarea.addEventListener('input', () => {
    const count = textarea.value.trim().split(/\s+/).filter(Boolean).length;
    wc.textContent = `${count} كلمة`;
  });
  textarea.focus();

  overlay.querySelectorAll('[data-blurt-close]').forEach(btn => {
    btn.addEventListener('click', () => overlay.remove());
  });

  overlay.querySelector('[data-blurt-save]').addEventListener('click', () => {
    const text = textarea.value.trim();
    const coverage = computeBlurtCoverage(file, text);
    saveBlurt(file.id, text, coverage);
    overlay.remove();
    renderBlurtResult(file, coverage);
  });
}

function renderBlurtResult(file, coverage) {
  const note = document.createElement('div');
  note.className = 'blurt-result-toast';
  const msg = coverage.pct >= 70 ? 'استرجاع قوي 🔥' :
              coverage.pct >= 40 ? 'بداية جيدة، انتبه للناقص 👇' :
              'الدرس جديد عليك — ركّز على المصطلحات الناقصة';
  note.innerHTML = `
    <div class="blurt-toast-header">
      <strong>${coverage.pct}%</strong>
      <span>${escapeHtml(msg)}</span>
      <button class="blurt-toast-close" aria-label="إغلاق">✕</button>
    </div>
    ${coverage.missed.length ? `
      <div class="blurt-toast-body">
        <span class="blurt-toast-label">مصطلحات لم تذكرها (ركّز عليها):</span>
        <div class="blurt-missed-list">
          ${coverage.missed.slice(0, 12).map(t => `<span class="blurt-missed-chip">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    ` : ''}
  `;
  document.body.appendChild(note);
  note.querySelector('.blurt-toast-close').addEventListener('click', () => note.remove());
  setTimeout(() => note.remove(), 12000);
}

function renderStudyAids(file) {
  const metadata = getLessonMetadata(file.id);
  const headings = Array.from($content.querySelectorAll('h2, h3')).map(heading => ({
    id: heading.id,
    level: Number(heading.tagName[1]),
    title: heading.textContent.trim(),
  }));
  const isLesson = (file.type || file.docType) === 'lesson';
  if (!metadata?.preReadingPrompts?.length && headings.length === 0 && !isLesson) return;

  const wrap = document.createElement('div');
  wrap.className = 'study-aids';

  if (isLesson) {
    const speechScopes = collectLessonSpeechScopes(file);
    const selectedSpeechScope = speechScopes[0] || null;
    const audioPanel = document.createElement('section');
    audioPanel.className = 'lesson-audio-panel';
    audioPanel.innerHTML = `
      <div class="study-aid-label">🔊 قارئ الدرس</div>
      <h3>القراءة الصوتية للدرس</h3>
      <p>يمكنك تشغيل قراءة الجهاز مباشرة، أو تحضير صوت عربي محفوظ داخل التطبيق لهذا الدرس أو لهذا القسم.</p>
      <div class="lesson-audio-actions">
        <button data-lesson-audio-generate>حضّر صوتًا عربيًا</button>
        <button data-lesson-speech-start class="secondary">قراءة بصوت الجهاز</button>
        <button data-lesson-speech-stop class="secondary">إيقاف</button>
        <label class="lesson-audio-scope">
          <span>المحتوى</span>
          <select data-lesson-speech-scope>
            ${speechScopes.map((scope) => `<option value="${escapeHtml(scope.id)}">${escapeHtml(scope.title)}</option>`).join('')}
          </select>
        </label>
        <label class="lesson-audio-rate">
          <span>السرعة</span>
          <select data-lesson-speech-rate>
            <option value="0.85" ${Math.abs((state.speechRate || 1) - 0.85) < 0.01 ? 'selected' : ''}>0.85x</option>
            <option value="1" ${Math.abs((state.speechRate || 1) - 1) < 0.01 ? 'selected' : ''}>1.00x</option>
            <option value="1.15" ${Math.abs((state.speechRate || 1) - 1.15) < 0.01 ? 'selected' : ''}>1.15x</option>
            <option value="1.3" ${Math.abs((state.speechRate || 1) - 1.3) < 0.01 ? 'selected' : ''}>1.30x</option>
          </select>
        </label>
      </div>
      <div class="lesson-audio-preview" data-lesson-speech-preview>${escapeHtml(describeSpeechScope(selectedSpeechScope))}</div>
      <div class="lesson-audio-player" data-lesson-audio-player>جار فحص الصوت العربي المحفوظ...</div>
      <div class="lesson-audio-status" data-lesson-speech-status>
        ${supportsSpeechSynthesis() ? 'جاهز لقراءة هذا الدرس بصوت عربي إن كان متوفرًا على الجهاز' : 'القراءة الصوتية غير مدعومة على هذا الجهاز'}
      </div>
    `;

    const speechStatus = audioPanel.querySelector('[data-lesson-speech-status]');
    const speechScopeSelect = audioPanel.querySelector('[data-lesson-speech-scope]');
    const speechPreview = audioPanel.querySelector('[data-lesson-speech-preview]');
    const lessonAudioPlayer = audioPanel.querySelector('[data-lesson-audio-player]');
    const lessonAudioGenerateButton = audioPanel.querySelector('[data-lesson-audio-generate]');
    const resolveSelectedSpeechScope = () => speechScopes.find((scope) => scope.id === speechScopeSelect.value) || speechScopes[0] || null;

    const refreshLessonAudioCacheState = async (autoPlay = false) => {
      const scope = resolveSelectedSpeechScope();
      const hasCachedAudio = await renderLessonAudioPlayer(lessonAudioPlayer, file.id, scope, autoPlay);
      lessonAudioGenerateButton.textContent = hasCachedAudio ? 'شغّل الصوت العربي المحفوظ' : 'حضّر صوتًا عربيًا';
      return hasCachedAudio;
    };

    audioPanel.querySelector('[data-lesson-speech-start]').addEventListener('click', () => startLessonSpeech(file, speechStatus, resolveSelectedSpeechScope()));
    lessonAudioGenerateButton.addEventListener('click', async () => {
      const scope = resolveSelectedSpeechScope();
      if (!scope) {
        speechStatus.textContent = 'لا يوجد نطاق واضح لتحضير الصوت.';
        return;
      }

      const cached = await refreshLessonAudioCacheState(true);
      if (cached) {
        speechStatus.textContent = `تم تشغيل الصوت العربي المحفوظ: ${scope.title}`;
        return;
      }

      lessonAudioGenerateButton.disabled = true;
      speechStatus.textContent = `جارٍ تحضير صوت عربي لهذا الجزء: ${scope.title} (${scope.chunks || 1} ${scope.chunks === 1 ? 'مقطع' : 'مقاطع'})`;
      try {
        const result = await requestLessonSpeechAudio(file, scope);
        await saveLessonAudioBlob(file.id, scope.id, {
          ...scope,
          format: result.format,
          model: result.model,
          voice: result.voice,
          bytes: result.bytes,
        }, result);
        await refreshLessonAudioCacheState(true);
        speechStatus.textContent = `تم حفظ ${result.parts?.length || 1} ${result.parts?.length === 1 ? 'مقطع صوتي' : 'مقاطع صوتية'} مضغوطة (${String(result.format || 'mp3').toUpperCase()}) داخل التطبيق باستخدام ${result.model || 'TTS'}.`;
      } catch (error) {
        lessonAudioPlayer.innerHTML = '<div class="lesson-audio-cache-empty">تعذر تحضير الصوت العربي لهذا الجزء.</div>';
        speechStatus.textContent = error instanceof Error ? error.message : 'تعذر تحضير الصوت العربي.';
      } finally {
        lessonAudioGenerateButton.disabled = false;
      }
    });
    audioPanel.querySelector('[data-lesson-speech-stop]').addEventListener('click', () => {
      stopLessonSpeech();
      speechStatus.textContent = `تم إيقاف القراءة: ${resolveSelectedSpeechScope()?.title || 'الدرس'}`;
    });
    speechScopeSelect.addEventListener('change', async () => {
      const scope = resolveSelectedSpeechScope();
      speechPreview.textContent = describeSpeechScope(scope);
      speechStatus.textContent = `تم تحديد القراءة: ${scope?.title || 'الدرس'}`;
      await refreshLessonAudioCacheState(false);
    });
    audioPanel.querySelector('[data-lesson-speech-rate]').addEventListener('change', (event) => {
      setSpeechRate(event.target.value);
      speechStatus.textContent = `تم ضبط السرعة على ${state.speechRate.toFixed(2)}x`;
    });

    void updateLessonSpeechAvailability(speechStatus);
    void refreshLessonAudioCacheState(false);

    wrap.appendChild(audioPanel);

    const copyPanel = document.createElement('section');
    copyPanel.className = 'lesson-copy-panel';
    copyPanel.innerHTML = `
      <div class="study-aid-label">📋 انسخ واذهب لأي دردشة</div>
      <h3>نسخ محتوى الدرس للدردشة الخارجية</h3>
      <p>انسخ الدرس كاملًا أو القسم المحدد ثم انتقل إلى ChatGPT أو Copilot أو أي دردشة أخرى والصق المحتوى مباشرة.</p>
      <div class="lesson-copy-actions">
        <button data-lesson-copy-full>نسخ الدرس كاملًا</button>
        <button data-lesson-copy-section class="secondary">نسخ القسم المحدد</button>
        <button data-lesson-copy-chat class="secondary">نسخ قالب جاهز للدردشة</button>
      </div>
      <div class="lesson-copy-status" data-lesson-copy-status>جاهز لنسخ محتوى الدرس الحالي.</div>
    `;

    const copyStatus = copyPanel.querySelector('[data-lesson-copy-status]');
    const runLessonCopy = async (mode) => {
      const scope = mode === 'full'
        ? (speechScopes[0] || null)
        : resolveSelectedSpeechScope();
      const payload = buildLessonCopyText(file, scope, mode === 'chat' ? 'chat' : 'plain');
      if (!payload) {
        copyStatus.textContent = 'تعذر تجهيز النص المنسوخ لهذا الدرس.';
        return;
      }

      try {
        const copied = await copyTextToClipboard(payload);
        copyStatus.textContent = copied
          ? `تم النسخ: ${mode === 'full' ? 'الدرس كاملًا' : mode === 'chat' ? 'قالب الدردشة' : (scope?.title || 'القسم المحدد')}`
          : 'تعذر النسخ على هذا الجهاز.';
      } catch {
        copyStatus.textContent = 'فشل النسخ إلى الحافظة. جرّب مرة أخرى.';
      }
    };

    copyPanel.querySelector('[data-lesson-copy-full]').addEventListener('click', () => runLessonCopy('full'));
    copyPanel.querySelector('[data-lesson-copy-section]').addEventListener('click', () => runLessonCopy('section'));
    copyPanel.querySelector('[data-lesson-copy-chat]').addEventListener('click', () => runLessonCopy('chat'));

    speechScopeSelect.addEventListener('change', () => {
      const scope = resolveSelectedSpeechScope();
      copyStatus.textContent = `القسم الجاهز للنسخ الآن: ${scope?.title || 'الدرس'}`;
    });

    wrap.appendChild(copyPanel);

    const blurts = getBlurts(file.id);
    const last = blurts[0];
    const blurtPanel = document.createElement('section');
    blurtPanel.className = 'blurt-panel';
    blurtPanel.innerHTML = `
      <div class="study-aid-label">🧠 استرجاع نشط</div>
      <h3>اكتب ما تعرفه قبل أن تقرأ</h3>
      <p>أقوى طريقة لتثبيت الفهم: حاول كتابة كل ما تتذكره عن هذا الدرس قبل فتحه. حتى لو كان قليلاً.</p>
      <div class="blurt-panel-actions">
        <button data-start-blurt>${last ? 'تكرار الاسترجاع' : 'ابدأ الاسترجاع'}</button>
        ${last ? `<span class="blurt-last">آخر محاولة: ${last.coveragePct}% (${formatDueDate(last.at)})</span>` : ''}
      </div>
    `;
    blurtPanel.querySelector('[data-start-blurt]').addEventListener('click', () => openBlurtOverlay(file));
    wrap.appendChild(blurtPanel);
  }

  const lessonAiActions = [
    {
      label: 'بسّط الدرس',
      query: `بسّط لي درس "${file.title}" في 5 نقاط عملية للمبتدئ مع مثال سريع.`,
      tier: 'light',
    },
    {
      label: 'حوّله إلى مقابلة',
      query: `حوّل درس "${file.title}" إلى 5 أسئلة مقابلة مع إجابات مختصرة وواضحة.`,
      tier: 'heavy',
    },
    {
      label: 'أخطاء التطبيق',
      query: `استخرج من درس "${file.title}" أكثر 3 أخطاء تطبيقية ومؤشرات فشل مبكر وكيف أتجنبها.`,
      tier: 'heavy',
    },
  ];

  const lessonAiPanel = document.createElement('section');
  lessonAiPanel.className = 'lesson-ai-panel';
  lessonAiPanel.innerHTML = `
    <div class="study-aid-label">AI داخل الدرس</div>
    <h3>اسأل عن هذا الدرس مباشرة</h3>
    <p>استخدم سياق الدرس الحالي وملاحظاتك، ثم صعّد إلى مودل أقوى عندما يتحول السؤال إلى تحليل أو مقابلة أو مخاطر تطبيق.</p>
    <div class="lesson-ai-actions">
      ${lessonAiActions.map((action, index) => `<button data-lesson-ai="${index}">${escapeHtml(action.label)}</button>`).join('')}
    </div>
  `;
  lessonAiPanel.querySelectorAll('[data-lesson-ai]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = lessonAiActions[Number(button.dataset.lessonAi)];
      if (!action) return;
      openAiAssistantWithContext(action.query, {
        ...buildLessonAiContext(file),
        preferredModelTier: action.tier,
      });
    });
  });
  wrap.appendChild(lessonAiPanel);

  if (metadata?.preReadingPrompts?.length) {
    const prompt = document.createElement('section');
    prompt.className = 'pre-reading-prompt';
    prompt.innerHTML = `
      <div class="study-aid-label">قبل القراءة</div>
      <p>${escapeHtml(metadata.preReadingPrompts[0])}</p>
    `;
    wrap.appendChild(prompt);
  }

  if (headings.length) {
    const toc = document.createElement('nav');
    toc.className = 'lesson-toc';
    toc.innerHTML = `
      <div class="study-aid-label">فهرس الدرس</div>
      <div class="lesson-toc-links">
        ${headings.map(h => `
          <a class="toc-level-${h.level}" href="#${h.id}">${escapeHtml(h.title)}</a>
        `).join('')}
      </div>
    `;
    wrap.appendChild(toc);
  }

  if (isLesson) {
    const linkedScenarios = (state.scenarios || []).filter(s =>
      (s.linkedLessons || []).includes(file.id)
    );
    if (linkedScenarios.length) {
      const panel = document.createElement('section');
      panel.className = 'linked-scenarios-panel';
      panel.innerHTML = `
        <div class="study-aid-label">🎬 سيناريوهات تطبّق هذا الدرس</div>
        <p>اقرأ الدرس، ثم جرّب كيف تتصرف لو واجهت العميل بهذا الموقف:</p>
        <div class="linked-scenarios-list">
          ${linkedScenarios.map(sc => {
            const attempt = state.scenarioAttempts[sc.id];
            const status = attempt ? `${attempt.correct}/${attempt.total}` : 'جديد';
            return `
              <button class="linked-scenario-item" data-open-scenario="${sc.id}">
                <span class="linked-scenario-badge">${escapeHtml(TIMING_LABELS[sc.timing] || '')}</span>
                <strong>${escapeHtml(sc.title)}</strong>
                <span class="linked-scenario-meta">${sc.steps.length} قرارات · ${status}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
      panel.querySelectorAll('[data-open-scenario]').forEach(btn => {
        btn.addEventListener('click', () => {
          showScenarios();
          setTimeout(() => startScenario(btn.dataset.openScenario), 50);
        });
      });
      wrap.appendChild(panel);
    }
  }

  $content.prepend(wrap);
}

function renderLessonReflection(file) {
  const metadata = getLessonMetadata(file.id);
  const docType = file.type || file.docType;
  if (!metadata && docType !== 'lesson' && docType !== 'test') return;

  const lessonState = getLessonState(file.id);
  const feynmanText = lessonState.feynman || '';
  const rating = lessonState.selfRating || '';
  const recallPrompt = metadata?.recallPrompts?.[0] || 'اشرح أهم فكرة بثلاثة أسطر.';

  const panel = document.createElement('section');
  panel.className = 'lesson-reflection';
  panel.innerHTML = `
    <div class="reflection-header">
      <div>
        <div class="study-aid-label">بعد الدرس</div>
        <h2>تقييم الفهم والمراجعة</h2>
      </div>
      <span class="reflection-status">${rating ? 'تم التقييم' : 'لم يتم التقييم'}</span>
    </div>

    <div class="self-rating" role="group" aria-label="تقييم الفهم">
      <button data-rating="low" class="${rating === 'low' ? 'active' : ''}">لم أفهم جيدًا</button>
      <button data-rating="medium" class="${rating === 'medium' ? 'active' : ''}">فهمت جزئيًا</button>
      <button data-rating="high" class="${rating === 'high' ? 'active' : ''}">فهمت جيدًا</button>
    </div>

    <label class="feynman-box">
      <span>${escapeHtml(recallPrompt)}</span>
      <textarea data-feynman placeholder="اكتب شرحًا مختصرًا من ذاكرتك...">${escapeHtml(feynmanText)}</textarea>
    </label>

    <div class="reflection-actions">
      <button data-save-reflection>حفظ وإضافة للمراجعة</button>
      <span data-reflection-note></span>
    </div>
  `;

  const ratingButtons = panel.querySelectorAll('[data-rating]');
  const textarea = panel.querySelector('[data-feynman]');
  const note = panel.querySelector('[data-reflection-note]');

  ratingButtons.forEach(button => {
    button.addEventListener('click', () => {
      const nextRating = button.dataset.rating;
      saveLessonState(file.id, {
        selfRating: nextRating,
        feynman: textarea.value,
        status: state.progress[file.id] ? 'completed' : 'in_progress',
      });
      scheduleReview(file.id, nextRating);
      updateContentMeta(file);
      renderLessonReflectionState(panel, nextRating, 'تم حفظ التقييم وتحديث موعد المراجعة');
    });
  });

  panel.querySelector('[data-save-reflection]').addEventListener('click', () => {
    const nextRating = panel.querySelector('[data-rating].active')?.dataset.rating || rating || 'medium';
    saveLessonState(file.id, {
      selfRating: nextRating,
      feynman: textarea.value,
      status: state.progress[file.id] ? 'completed' : 'in_progress',
    });
    scheduleReview(file.id, 'reflection');
    updateContentMeta(file);
    note.textContent = 'تم الحفظ';
    setTimeout(() => { note.textContent = ''; }, 1800);
  });

  $content.appendChild(panel);

  // Append Teach-Back panel for lessons only
  if ((file.type || file.docType) === 'lesson') {
    $content.appendChild(renderTeachBackPanel(file));
  }
}

function renderLessonReflectionState(panel, rating, message) {
  panel.querySelectorAll('[data-rating]').forEach(button => {
    button.classList.toggle('active', button.dataset.rating === rating);
  });
  const status = panel.querySelector('.reflection-status');
  if (status) status.textContent = 'تم التقييم';
  const note = panel.querySelector('[data-reflection-note]');
  if (note) {
    note.textContent = message;
    setTimeout(() => { note.textContent = ''; }, 1800);
  }
}

let readingSaveTimer;
function updateReadingProgress() {
  if (!$readProgBar || !state.currentFileId) return;
  const maxScroll = Math.max(1, $content.scrollHeight - $content.clientHeight);
  const pct = Math.max(0, Math.min(100, Math.round(($content.scrollTop / maxScroll) * 100)));
  $readProgBar.style.width = `${pct}%`;

  clearTimeout(readingSaveTimer);
  readingSaveTimer = setTimeout(() => {
    state.readingProgress[state.currentFileId] = pct;
    store.set('readingProgress', state.readingProgress);
  }, 250);
}

$content.addEventListener('scroll', updateReadingProgress);

function formatDueDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('ar-JO', { year: 'numeric', month: 'short', day: 'numeric' });
}

function reviewStatusText(fileId) {
  const item = state.reviewQueue[fileId];
  if (!item) return 'لا توجد مراجعة مجدولة';
  const due = Date.parse(item.dueAt);
  if (due <= Date.now()) return 'مستحق الآن';
  return `مجدول: ${formatDueDate(item.dueAt)}`;
}

function dueCards(filter = state.flashcardFilter) {
  const now = Date.now();
  return state.flashcards.filter(card => {
    if (filter === 'term' && card.type !== 'term') return false;
    if (filter === 'cloze' && card.type !== 'cloze') return false;
    const scheduled = state.reviewQueue[`card:${card.id}`];
    return !scheduled || Date.parse(scheduled.dueAt) <= now;
  });
}

function cardsByType(type) {
  return state.flashcards.filter(c => c.type === type);
}

function clearReaderContext(title, meta = '') {
  stopLessonSpeech();

  if (state.currentPath) {
    state.scrollPos[state.currentPath] = $content.scrollTop;
    store.set('scroll', state.scrollPos);
  }

  state.currentFileId = null;
  state.currentPath = null;
  state.currentQuizSession = null;
  $lesNav.classList.add('hidden');
  $btnDone.classList.add('hidden');
  $breadcrumb.textContent = title;
  if ($contentMeta) $contentMeta.textContent = meta;
  if ($readProgBar) $readProgBar.style.width = '0%';
  $sideTree.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));
  syncReadingToolsLayout(null);
}

function lastOpenedFile() {
  const lastId = store.get('last');
  return lastId ? findById(lastId) : null;
}

function firstIncompleteLesson() {
  return allTrackable().find(item => !state.progress[item.id]) || null;
}

function openTodayLesson() {
  const lesson = firstIncompleteLesson() || lastOpenedFile() || allTrackable()[0];
  if (lesson) loadFile(lesson.id);
}

function openLastOrFirst() {
  const last = lastOpenedFile();
  if (last) loadFile(last.id);
  else openTodayLesson();
}

function openMistakeQuiz(questionId) {
  const found = findQuestionById(questionId);
  if (found) startQuiz(found.quiz.id);
}

function openMistakesJournal() {
  clearReaderContext('دفتر الأخطاء', `${openMistakes().length} خطأ مفتوح`);
  renderMistakesJournal();
}

function openMistakes() {
  return Object.values(state.mistakes)
    .filter(item => !item.graduatedAt)
    .sort((a, b) => (a.leitnerBox || 0) - (b.leitnerBox || 0)
      || Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0));
}

/* Leitner intervals per box (days): box 0 = retry today, then 2, 5, 10 */
const LEITNER_INTERVALS = [0, 2, 5, 10];
const LEITNER_GRADUATE_BOX = 3;

function recordMistakeAttempt(questionId, correct) {
  const m = state.mistakes[questionId];
  if (!m) return;
  const prevBox = m.leitnerBox || 0;
  const box = correct ? Math.min(LEITNER_GRADUATE_BOX, prevBox + 1) : 0;
  const cc = correct ? (m.consecutiveCorrect || 0) + 1 : 0;
  const now = new Date().toISOString();
  const graduated = box >= LEITNER_GRADUATE_BOX;
  const days = correct ? LEITNER_INTERVALS[box] : 0;

  state.mistakes[questionId] = {
    ...m,
    leitnerBox: box,
    consecutiveCorrect: cc,
    lastReviewedAt: now,
    graduatedAt: graduated ? now : null,
    updatedAt: now,
  };
  store.set('mistakes', state.mistakes);

  const reviewKey = `question:${questionId}`;
  if (graduated) {
    delete state.reviewQueue[reviewKey];
  } else {
    state.reviewQueue[reviewKey] = {
      itemType: 'quiz-question',
      sourceId: questionId,
      dueAt: daysFromNow(days),
      intervalDays: days,
      easeFactor: state.reviewQueue[reviewKey]?.easeFactor || 2.3,
      reps: state.reviewQueue[reviewKey]?.reps || 0,
      lastResult: correct ? 'correct' : 'wrong',
      updatedAt: now,
    };
  }
  store.set('reviewQueue', state.reviewQueue);
  updateWelcomeStats();
}

function weakTopicStats() {
  const scores = new Map();
  const add = (label, points, reason) => {
    if (!label) return;
    const current = scores.get(label) || { label, score: 0, reasons: [] };
    current.score += points;
    current.reasons.push(reason);
    scores.set(label, current);
  };

  Object.entries(state.lessonState).forEach(([fileId, value]) => {
    const file = findById(fileId);
    if (!file) return;
    if (value.selfRating === 'low') add(file.sectionTitle, 3, 'تقييم ضعيف');
    if (value.selfRating === 'medium') add(file.sectionTitle, 1, 'تقييم متوسط');
  });

  Object.values(state.mistakes).forEach(mistake => {
    const found = findQuestionById(mistake.questionId);
    if (found) add(found.quiz.sectionTitle, mistake.result === 'wrong' ? 3 : 2, 'خطأ اختبار');
  });

  Object.entries(state.cardState).forEach(([cardId, value]) => {
    const card = findCardById(cardId);
    if (!card) return;
    if (value.lastResult === 'again') add(card.category, 2, 'بطاقة معادة');
    if (value.lastResult === 'hard') add(card.category, 1, 'بطاقة صعبة');
  });

  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function dailyChallenge() {
  return {
    lesson: firstIncompleteLesson(),
    cards: dueCards().slice(0, 5),
    reviews: dueReviewItems().slice(0, 3),
    mistakes: openMistakes().slice(0, 3),
  };
}

/* ─── Daily Streak ────────────────────────────────────────── */
function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate();
}

function streakDoneToday() {
  const last = state.dailyStreak?.lastAt;
  return !!last && isSameDay(last, new Date().toISOString());
}

function bumpDailyStreak() {
  if (streakDoneToday()) return;
  const now = new Date();
  const last = state.dailyStreak?.lastAt;
  let count = 1;
  if (last) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (isSameDay(last, yesterday.toISOString())) {
      count = (state.dailyStreak.count || 0) + 1;
    }
  }
  state.dailyStreak = { count, lastAt: now.toISOString() };
  store.set('streak', state.dailyStreak);
}

/* ─── Daily 3-Minute Recall ───────────────────────────────── */
function buildDailyRecallSteps() {
  const steps = [];
  const card = dueCards()[0] || state.flashcards[Math.floor(Math.random() * Math.max(1, state.flashcards.length))];
  if (card) steps.push({ kind: 'card', card });

  const mistake = openMistakes()[0];
  if (mistake) steps.push({ kind: 'mistake', mistake });

  const recentLessons = allTrackable()
    .filter(item => state.lessonState[item.id]?.selfRating)
    .sort((a, b) => Date.parse(state.lessonState[b.id]?.updatedAt || 0) - Date.parse(state.lessonState[a.id]?.updatedAt || 0));
  const lesson = recentLessons[Math.floor(Math.random() * Math.min(5, recentLessons.length))] || firstIncompleteLesson();
  if (lesson) steps.push({ kind: 'recall', lesson });

  return steps;
}

function startDailyRecall() {
  const steps = buildDailyRecallSteps();
  if (!steps.length) {
    alert('لا توجد عناصر كافية للاسترجاع اليومي بعد. ادرس درساً واحداً أولاً.');
    return;
  }
  state.dailyRecallSession = { steps, index: 0, startedAt: new Date().toISOString() };
  clearReaderContext('استرجاع اليوم', 'جلسة 3 دقائق');
  renderDailyRecallStep();
}

function renderDailyRecallStep() {
  const session = state.dailyRecallSession;
  if (!session) return showDashboard();
  const step = session.steps[session.index];
  if (!step) {
    bumpDailyStreak();
    renderDailyRecallDone();
    return;
  }
  const progress = `${session.index + 1}/${session.steps.length}`;

  if (step.kind === 'card') {
    const card = step.card;
    $content.innerHTML = `
      <div class="daily-recall-view">
        <div class="recall-header">
          <span class="recall-progress">${progress}</span>
          <h1>بطاقة سريعة</h1>
          <p>تذكّر الإجابة قبل الكشف.</p>
        </div>
        <div class="recall-card">
          <div class="recall-front">${escapeHtml(card.front)}</div>
          <div class="recall-back hidden" data-recall-back>
            <strong>${escapeHtml(card.back)}</strong>
            ${card.hint ? `<p>${escapeHtml(card.hint)}</p>` : ''}
          </div>
        </div>
        <div class="recall-actions" data-recall-stage="hidden">
          <button data-recall-reveal>كشف الإجابة</button>
        </div>
        <div class="recall-actions hidden" data-recall-stage="revealed">
          <button data-card-result="again">إعادة</button>
          <button data-card-result="hard">صعبة</button>
          <button data-card-result="easy">سهلة</button>
        </div>
      </div>
    `;
    $content.querySelector('[data-recall-reveal]').addEventListener('click', () => {
      $content.querySelector('[data-recall-back]').classList.remove('hidden');
      $content.querySelector('[data-recall-stage="hidden"]').classList.add('hidden');
      $content.querySelector('[data-recall-stage="revealed"]').classList.remove('hidden');
    });
    $content.querySelectorAll('[data-card-result]').forEach(btn => {
      btn.addEventListener('click', () => {
        const result = btn.dataset.cardResult;
        saveCardState(card.id, {
          lastResult: result,
          lastReviewedAt: new Date().toISOString(),
          reviews: (getCardState(card.id).reviews || 0) + 1,
        });
        scheduleCardReview(card.id, result);
        session.index += 1;
        renderDailyRecallStep();
      });
    });
    return;
  }

  if (step.kind === 'mistake') {
    const m = step.mistake;
    $content.innerHTML = `
      <div class="daily-recall-view">
        <div class="recall-header">
          <span class="recall-progress">${progress}</span>
          <h1>سؤال من دفتر الأخطاء</h1>
          <p>هل أصبحت تعرف الإجابة الآن؟</p>
        </div>
        <div class="recall-question">
          <h2>${escapeHtml(m.prompt || 'سؤال')}</h2>
          <textarea data-recall-answer placeholder="اكتب إجابتك من الذاكرة..."></textarea>
        </div>
        <div class="recall-actions">
          <button data-mistake-result="wrong">✗ ما زلت أخطئ</button>
          <button data-mistake-result="correct">✓ أجبت صح</button>
        </div>
      </div>
    `;
    $content.querySelectorAll('[data-mistake-result]').forEach(btn => {
      btn.addEventListener('click', () => {
        const correct = btn.dataset.mistakeResult === 'correct';
        recordMistakeAttempt(m.questionId, correct);
        session.index += 1;
        renderDailyRecallStep();
      });
    });
    return;
  }

  if (step.kind === 'recall') {
    const lesson = step.lesson;
    const meta = getLessonMetadata(lesson.id);
    const prompt = meta?.recallPrompts?.[0] || 'اشرح أهم فكرة من هذا الدرس في ثلاثة أسطر.';
    $content.innerHTML = `
      <div class="daily-recall-view">
        <div class="recall-header">
          <span class="recall-progress">${progress}</span>
          <h1>استرجاع حر</h1>
          <p>درس: ${escapeHtml(lesson.title)}</p>
        </div>
        <div class="recall-question">
          <h2>${escapeHtml(prompt)}</h2>
          <textarea data-recall-answer placeholder="اكتب من ذاكرتك. لا تفتح الدرس."></textarea>
        </div>
        <div class="recall-actions">
          <button data-recall-self="low">لم أتذكر</button>
          <button data-recall-self="medium">جزئي</button>
          <button data-recall-self="high">قوي</button>
        </div>
      </div>
    `;
    $content.querySelectorAll('[data-recall-self]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = btn.dataset.recallSelf;
        saveLessonState(lesson.id, { selfRating: rating });
        scheduleReview(lesson.id, 'daily-recall');
        session.index += 1;
        renderDailyRecallStep();
      });
    });
    return;
  }

  session.index += 1;
  renderDailyRecallStep();
}

function renderDailyRecallDone() {
  state.dailyRecallSession = null;
  const streak = state.dailyStreak.count || 0;
  $content.innerHTML = `
    <div class="daily-recall-view daily-recall-done">
      <div class="recall-done-icon">🔥</div>
      <h1>أحسنت! تم استرجاع اليوم</h1>
      <p>سلسلة الاسترجاع المتواصل: <strong>${streak}</strong> ${streak === 1 ? 'يوم' : 'أيام'}</p>
      <div class="recall-done-actions">
        <button data-go-dashboard>العودة للوحة</button>
        <button data-go-cards>متابعة البطاقات</button>
      </div>
    </div>
  `;
  $content.querySelector('[data-go-dashboard]').addEventListener('click', showDashboard);
  $content.querySelector('[data-go-cards]').addEventListener('click', showFlashcards);
}

function showDashboard() {
  clearReaderContext('لوحة الدراسة', 'ابدأ من هنا اليوم');
  renderDashboard();
}

function renderDashboard() {
  const done = doneCount();
  const total = totalCount();
  const dueReviews = dueReviewItems();
  const dueCardCount = dueCards().length;
  const mistakes = openMistakes();
  const challenge = dailyChallenge();
  const weakTopics = weakTopicStats();
  const last = lastOpenedFile();
  const attempts = Object.values(state.quizAttempts).flat();
  const lastAttempt = attempts.sort((a, b) => Date.parse(b.completedAt || 0) - Date.parse(a.completedAt || 0))[0];
  const lastQuiz = lastAttempt ? state.quizBank.find(quiz => quiz.id === lastAttempt.quizId) : null;

  const streak = state.dailyStreak.count || 0;
  const doneToday = streakDoneToday();
  const dashboardAiActions = [
    {
      label: 'أولويات اليوم',
      query: 'انطلاقًا من حالتي الحالية، ما أولويات الدراسة اليوم ولماذا؟',
      tier: 'light',
    },
    {
      label: 'خطة 20 دقيقة',
      query: 'ابن لي خطة دراسة مركزة لمدة 20 دقيقة اليوم اعتمادًا على حالتي الحالية.',
      tier: 'light',
    },
    {
      label: 'حلل نقاط الضعف',
      query: 'حلل أضعف 3 مجالات عندي وابن لي مراجعة علاجية عملية مع ترتيب أولويات واضح.',
      tier: 'heavy',
    },
  ];

  $content.innerHTML = `
    <div class="dashboard-view">
      <div class="dashboard-header">
        <div>
          <h1>لوحة الدراسة</h1>
          <p>ملخص عملي لما يجب التركيز عليه الآن.</p>
        </div>
        <button data-dashboard-action="continue">متابعة</button>
      </div>

      <section class="daily-recall-hero ${doneToday ? 'done' : ''}">
        <div class="recall-hero-left">
          <div class="recall-hero-streak">
            <span class="recall-hero-flame">🔥</span>
            <strong>${streak}</strong>
            <span>${streak === 1 ? 'يوم متواصل' : 'أيام متواصلة'}</span>
          </div>
          <h2>استرجاع اليوم — 3 دقائق</h2>
          <p>${doneToday ? 'أنجزت استرجاع اليوم ✓ — يمكنك تكراره.' : 'بطاقة + خطأ سابق + استرجاع حر. أقوى تمرين يومي.'}</p>
        </div>
        <button class="recall-hero-cta" data-start-daily-recall>${doneToday ? 'تكرار' : 'ابدأ الآن'}</button>
      </section>

      <div class="dashboard-metrics">
        <button data-dashboard-action="continue"><strong>${done}/${total}</strong><span>الدروس</span></button>
        <button data-dashboard-action="review"><strong>${dueReviews.length}</strong><span>مراجعة مستحقة</span></button>
        <button data-dashboard-action="cards"><strong>${dueCardCount}</strong><span>بطاقات</span></button>
        <button data-dashboard-action="mistakes"><strong>${mistakes.length}</strong><span>أخطاء مفتوحة</span></button>
      </div>

      <section class="dashboard-ai-card">
        <div class="section-title-row">
          <h2>المدرب الذكي</h2>
          <span>من تقدمك الحالي</span>
        </div>
        <p>شغّل الذكاء من لوحة الدراسة نفسها ليبني لك أولوية اليوم، أو Sprint قصيرة، أو تحليلًا علاجيًا لنقاط الضعف.</p>
        <div class="dashboard-ai-actions">
          ${dashboardAiActions.map((action, index) => `<button data-dashboard-ai="${index}">${escapeHtml(action.label)}</button>`).join('')}
        </div>
      </section>

      <section class="daily-challenge">
        <div class="section-title-row">
          <h2>تحدي اليوم</h2>
          <span>${challenge.cards.length + challenge.reviews.length + (challenge.lesson ? 1 : 0)} عناصر</span>
        </div>
        <div class="challenge-list">
          ${challenge.lesson ? `
            <button data-open-lesson="${challenge.lesson.id}">
              <strong>درس اليوم</strong>
              <span>${escapeHtml(challenge.lesson.title)}</span>
            </button>
          ` : `
            <div class="challenge-empty">لا توجد دروس غير مكتملة.</div>
          `}
          <button data-dashboard-action="cards">
            <strong>بطاقات</strong>
            <span>${challenge.cards.length ? `راجع ${challenge.cards.length} بطاقات مستحقة` : 'لا توجد بطاقات مستحقة'}</span>
          </button>
          <button data-dashboard-action="review">
            <strong>مراجعة</strong>
            <span>${challenge.reviews.length ? `راجع ${challenge.reviews.length} عناصر` : 'لا توجد مراجعة مستحقة'}</span>
          </button>
          <button data-dashboard-action="mistakes">
            <strong>أخطاء</strong>
            <span>${challenge.mistakes.length ? `راجع ${challenge.mistakes.length} أخطاء` : 'لا توجد أخطاء مفتوحة'}</span>
          </button>
        </div>
      </section>

      ${renderStreakCalendar()}

      ${renderRetentionHeatmap()}

      <div class="dashboard-grid">
        <section>
          <div class="section-title-row">
            <h2>أضعف 3 مجالات</h2>
          </div>
          <div class="weak-list">
            ${weakTopics.length ? weakTopics.map(topic => `
              <div class="weak-item">
                <strong>${escapeHtml(topic.label)}</strong>
                <span>${topic.score} نقطة ضعف</span>
              </div>
            `).join('') : '<div class="challenge-empty">لا توجد بيانات ضعف كافية بعد.</div>'}
          </div>
        </section>

        <section>
          <div class="section-title-row">
            <h2>آخر نشاط</h2>
          </div>
          <div class="activity-list">
            <button data-dashboard-action="continue">
              <strong>آخر درس</strong>
              <span>${last ? escapeHtml(last.title) : 'لم تبدأ بعد'}</span>
            </button>
            <button data-dashboard-action="quiz">
              <strong>آخر اختبار</strong>
              <span>${lastQuiz ? `${escapeHtml(lastQuiz.title)} - ${lastAttempt.correct}/${lastAttempt.total}` : 'لا توجد محاولة بعد'}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  `;

  bindDashboardActions();

  $content.querySelectorAll('[data-dashboard-ai]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = dashboardAiActions[Number(button.dataset.dashboardAi)];
      if (!action) return;
      openAiAssistantWithContext(action.query, {
        ...buildDashboardAiContext(),
        preferredModelTier: action.tier,
      });
    });
  });
}

function comparisonRows() {
  return state.systemComparisons.flatMap(table => (
    table.rows || []
  ).map(row => ({
    ...row,
    tableId: table.id,
    tableTitle: table.title,
    sourceId: table.sourceId,
    sourceTitle: table.sourceTitle,
    sectionTitle: table.sectionTitle,
  })));
}

function showSystemComparison() {
  clearReaderContext('مقارنة الأنظمة', `${comparisonRows().length} عنصر مقارنة`);
  renderSystemComparisonView();
}

function renderSystemComparisonView(query = '') {
  const term = query.trim().toLowerCase();
  const rows = comparisonRows().filter(row => {
    if (!term) return true;
    return [row.concept, row.dynamics, row.oracle, row.sap, row.note, row.tableTitle, row.sourceTitle, row.sectionTitle]
      .some(value => String(value || '').toLowerCase().includes(term));
  });

  const tablesCount = state.systemComparisons.length;
  const totalRows = comparisonRows().length;

  $content.innerHTML = `
    <div class="systems-view">
      <div class="systems-header">
        <div>
          <h1>مقارنة الأنظمة</h1>
          <p>عرض عملي للمفاهيم نفسها بين Dynamics 365 وOracle Fusion Cloud وSAP S/4HANA.</p>
        </div>
        <div class="systems-stats">
          <strong>${totalRows}</strong>
          <span>عنصر من ${tablesCount} جداول</span>
        </div>
      </div>

      <div class="systems-search">
        <input type="search" data-system-search value="${escapeHtml(query)}" placeholder="ابحث عن مفهوم، نظام، أو مصطلح..." autocomplete="off">
      </div>

      <div class="systems-list">
        ${rows.length ? rows.map(renderSystemComparisonRow).join('') : `
          <div class="challenge-empty">لا توجد نتائج مطابقة.</div>
        `}
      </div>
    </div>
  `;

  const input = $content.querySelector('[data-system-search]');
  input?.addEventListener('input', event => renderSystemComparisonView(event.target.value));

  $content.querySelectorAll('[data-open-comparison-source]').forEach(button => {
    button.addEventListener('click', () => loadFile(button.dataset.openComparisonSource));
  });
}

function renderSystemComparisonRow(row) {
  return `
    <section class="system-comparison-row">
      <div class="comparison-row-head">
        <div>
          <span>${escapeHtml(row.tableTitle || row.sectionTitle || 'مقارنة')}</span>
          <h2>${escapeHtml(row.concept)}</h2>
        </div>
        <button data-open-comparison-source="${row.sourceId}">فتح المصدر</button>
      </div>

      <div class="comparison-grid">
        <div>
          <strong>Dynamics 365</strong>
          <p>${escapeHtml(row.dynamics || '-')}</p>
        </div>
        <div>
          <strong>Oracle Fusion Cloud</strong>
          <p>${escapeHtml(row.oracle || '-')}</p>
        </div>
        <div>
          <strong>SAP S/4HANA</strong>
          <p>${escapeHtml(row.sap || '-')}</p>
        </div>
      </div>

      ${row.note ? `<div class="comparison-note">${escapeHtml(row.note)}</div>` : ''}
      <div class="queue-meta">${escapeHtml(row.sourceTitle || '')}</div>
    </section>
  `;
}

function showInterviewHome() {
  clearReaderContext('محاكي المقابلة', `${state.interviewBank.length} سؤال`);
  renderInterviewHome();
}

function interviewQuestionsByMode(mode) {
  let questions = [...state.interviewBank];
  if (mode === 'comparison') {
    questions = questions.filter(question => question.type === 'system-comparison');
  } else if (mode === 'scenario') {
    questions = questions.filter(question => ['scenario', 'consultant-explanation'].includes(question.type));
  }

  if (!questions.length) questions = [...state.interviewBank];
  return questions
    .map(question => ({ question, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(item => item.question)
    .slice(0, mode === 'full' ? 10 : 6);
}

function renderInterviewHome() {
  const attempts = state.interviewAttempts || [];
  const lastAttempt = attempts[attempts.length - 1];
  const avg = attempts.length
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.scorePct, 0) / attempts.length)
    : 0;

  $content.innerHTML = `
    <div class="interview-view">
      <div class="queue-header">
        <div>
          <h1>محاكي المقابلة</h1>
          <p>تدريب كتابي سريع على إجابات Functional Consultant: وضوح المفهوم، الربط العملي، والتمييز بين الفجوة وضعف التشغيل.</p>
        </div>
        <div class="queue-count">${state.interviewBank.length}</div>
      </div>

      <div class="queue-summary">
        <div><strong>${attempts.length}</strong><span>جلسة</span></div>
        <div><strong>${avg}%</strong><span>متوسط</span></div>
        <div><strong>${lastAttempt ? `${lastAttempt.strong}/${lastAttempt.total}` : '-'}</strong><span>آخر نتيجة</span></div>
      </div>

      <div class="interview-modes">
        <button data-start-interview="mixed">
          <strong>جلسة مختلطة</strong>
          <span>6 أسئلة من المفاهيم والمقارنات والسيناريوهات.</span>
        </button>
        <button data-start-interview="comparison">
          <strong>مقارنة الأنظمة</strong>
          <span>أسئلة مركزة على Dynamics وOracle وSAP.</span>
        </button>
        <button data-start-interview="scenario">
          <strong>منظور المستشار</strong>
          <span>شرح، تشخيص، وأسئلة Discovery.</span>
        </button>
        <button data-start-interview="full">
          <strong>جلسة كاملة</strong>
          <span>10 أسئلة لمحاكاة مقابلة أطول.</span>
        </button>
      </div>
    </div>
  `;

  $content.querySelectorAll('[data-start-interview]').forEach(button => {
    button.addEventListener('click', () => startInterview(button.dataset.startInterview));
  });
}

function startInterview(mode = 'mixed') {
  const questions = interviewQuestionsByMode(mode);
  if (!questions.length) return;

  state.currentInterviewSession = {
    id: `interview-${Date.now()}`,
    mode,
    questionIndex: 0,
    questions,
    answers: {},
    startedAt: new Date().toISOString(),
  };

  renderInterviewQuestion();
}

function renderInterviewQuestion() {
  const session = state.currentInterviewSession;
  if (!session) return showInterviewHome();

  const index = session.questionIndex;
  const question = session.questions[index];
  if (!question) return finishInterview();

  const saved = session.answers[question.id] || {};
  const progress = `${index + 1}/${session.questions.length}`;

  $breadcrumb.textContent = 'محاكي المقابلة';
  if ($contentMeta) $contentMeta.textContent = `سؤال ${progress}`;

  $content.innerHTML = `
    <div class="interview-session">
      <div class="quiz-progress">
        <span>${progress}</span>
        <strong>${escapeHtml(question.sectionTitle || question.type)}</strong>
      </div>

      <section class="interview-card">
        <span class="queue-rating rating-medium">${escapeHtml(question.type)}</span>
        <h1>${escapeHtml(question.prompt)}</h1>
        <p>${escapeHtml(question.followUp || '')}</p>
        <textarea data-interview-answer placeholder="اكتب إجابة مقابلة مختصرة ومنظمة...">${escapeHtml(saved.answer || '')}</textarea>
      </section>

      <section class="interview-rubric">
        <h2>معيار التقييم</h2>
        <ul>
          ${(question.rubric || []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </section>

      <div class="quiz-self-grade">
        <button data-interview-result="weak" class="${saved.result === 'weak' ? 'active' : ''}">ضعيف</button>
        <button data-interview-result="acceptable" class="${saved.result === 'acceptable' ? 'active' : ''}">مقبول</button>
        <button data-interview-result="strong" class="${saved.result === 'strong' ? 'active' : ''}">قوي</button>
      </div>

      <div class="quiz-nav">
        <button data-interview-prev ${index === 0 ? 'disabled' : ''}>السابق</button>
        <button data-interview-next>${index === session.questions.length - 1 ? 'إنهاء' : 'التالي'}</button>
      </div>

      <div class="interview-source">
        <button data-open-interview-source="${question.sourceId}">فتح المصدر</button>
      </div>
    </div>
  `;

  $content.querySelectorAll('[data-interview-result]').forEach(button => {
    button.addEventListener('click', () => {
      saveInterviewAnswer(question.id, button.dataset.interviewResult);
      renderInterviewQuestion();
    });
  });

  $content.querySelector('[data-interview-prev]')?.addEventListener('click', () => {
    saveInterviewAnswer(question.id);
    session.questionIndex = Math.max(0, session.questionIndex - 1);
    renderInterviewQuestion();
  });

  $content.querySelector('[data-interview-next]')?.addEventListener('click', () => {
    saveInterviewAnswer(question.id);
    if (session.questionIndex >= session.questions.length - 1) finishInterview();
    else {
      session.questionIndex += 1;
      renderInterviewQuestion();
    }
  });

  $content.querySelector('[data-open-interview-source]')?.addEventListener('click', event => {
    saveInterviewAnswer(question.id);
    loadFile(event.currentTarget.dataset.openInterviewSource);
  });
}

function saveInterviewAnswer(questionId, result = null) {
  const session = state.currentInterviewSession;
  if (!session) return;

  const textarea = $content.querySelector('[data-interview-answer]');
  const previous = session.answers[questionId] || {};
  session.answers[questionId] = {
    answer: textarea ? textarea.value : previous.answer || '',
    result: result || previous.result || 'acceptable',
    answeredAt: new Date().toISOString(),
  };
}

function finishInterview() {
  const session = state.currentInterviewSession;
  if (!session) return showInterviewHome();

  let strong = 0;
  let acceptable = 0;
  let weak = 0;
  let score = 0;

  session.questions.forEach(question => {
    const answer = session.answers[question.id] || { result: 'weak', answer: '' };
    if (answer.result === 'strong') {
      strong += 1;
      score += 2;
    } else if (answer.result === 'acceptable') {
      acceptable += 1;
      score += 1;
    } else {
      weak += 1;
    }
  });

  const total = session.questions.length;
  const scorePct = Math.round((score / Math.max(1, total * 2)) * 100);
  const attempt = {
    id: session.id,
    mode: session.mode,
    startedAt: session.startedAt,
    completedAt: new Date().toISOString(),
    total,
    strong,
    acceptable,
    weak,
    scorePct,
    questions: session.questions.map(question => ({
      id: question.id,
      prompt: question.prompt,
      sourceId: question.sourceId,
      sourceTitle: question.sourceTitle,
      type: question.type,
      answer: session.answers[question.id] || { result: 'weak', answer: '' },
    })),
  };

  state.interviewAttempts = [...(state.interviewAttempts || []), attempt].slice(-25);
  store.set('interviewAttempts', state.interviewAttempts);
  state.currentInterviewSession = null;
  renderInterviewResult(attempt);
}

function renderInterviewResult(attempt) {
  $content.innerHTML = `
    <div class="interview-result">
      <div class="queue-header">
        <div>
          <h1>نتيجة المقابلة</h1>
          <p>النتيجة مبنية على تقييمك الذاتي لجودة الإجابة، وليست تصحيحًا آليًا.</p>
        </div>
        <div class="queue-count">${attempt.scorePct}%</div>
      </div>

      <div class="queue-summary">
        <div><strong>${attempt.strong}</strong><span>قوي</span></div>
        <div><strong>${attempt.acceptable}</strong><span>مقبول</span></div>
        <div><strong>${attempt.weak}</strong><span>ضعيف</span></div>
      </div>

      <div class="interview-review-list">
        ${attempt.questions.map(item => `
          <div class="interview-review-item">
            <div>
              <span class="queue-rating rating-${item.answer.result === 'strong' ? 'high' : item.answer.result === 'weak' ? 'low' : 'medium'}">${escapeHtml(item.answer.result)}</span>
              <h2>${escapeHtml(item.prompt)}</h2>
              <p>${escapeHtml(item.answer.answer || 'لا توجد إجابة محفوظة.')}</p>
              <div class="queue-meta">${escapeHtml(item.sourceTitle || '')}</div>
            </div>
            <button data-open-interview-review-source="${item.sourceId}">فتح المصدر</button>
          </div>
        `).join('')}
      </div>

      <div class="quiz-result-actions">
        <button data-new-interview>جلسة جديدة</button>
        <button data-interview-home>العودة للمحاكي</button>
      </div>
    </div>
  `;

  $content.querySelector('[data-new-interview]')?.addEventListener('click', () => startInterview(attempt.mode));
  $content.querySelector('[data-interview-home]')?.addEventListener('click', showInterviewHome);
  $content.querySelectorAll('[data-open-interview-review-source]').forEach(button => {
    button.addEventListener('click', () => loadFile(button.dataset.openInterviewReviewSource));
  });
}

function renderMistakesJournal() {
  const mistakes = Object.values(state.mistakes)
    .sort((a, b) => Date.parse(b.updatedAt || 0) - Date.parse(a.updatedAt || 0));
  const open = mistakes.filter(item => !item.graduatedAt);
  const reviewed = mistakes.length - open.length;
  const mistakeAiActions = open.length ? [
    {
      label: 'حلل نمط الأخطاء',
      query: 'حلل نمط أخطائي المفتوحة الآن، واذكر السبب الجذري الأرجح لكل نوع خطأ.',
      tier: 'heavy',
    },
    {
      label: 'مراجعة علاجية',
      query: 'ابن لي مراجعة علاجية قصيرة تعالج أخطائي المفتوحة بترتيب ذكي من الأسهل إلى الأثقل.',
      tier: 'heavy',
    },
  ] : [];

  $content.innerHTML = `
    <div class="mistakes-view">
      <div class="queue-header">
        <div>
          <h1>دفتر الأخطاء</h1>
          <p>الأسئلة التي كانت خاطئة أو جزئية في الاختبارات.</p>
        </div>
        <div class="queue-count">${open.length}</div>
      </div>

      <div class="queue-summary">
        <div><strong>${open.length}</strong><span>مفتوح</span></div>
        <div><strong>${reviewed}</strong><span>تمت مراجعته</span></div>
        <div><strong>${mistakes.length}</strong><span>الإجمالي</span></div>
      </div>

      ${open.length ? `
        <section class="mistakes-ai-card">
          <div class="section-title-row">
            <h2>AI لعلاج الأخطاء</h2>
            <span>${open.length} أخطاء مفتوحة</span>
          </div>
          <p>حوّل دفتر الأخطاء من أرشيف إلى تدريب علاجي: حلّل النمط، أو ابن مراجعة قصيرة، أو افتح سبب الخطأ لسؤال بعينه.</p>
          <div class="dashboard-ai-actions">
            ${mistakeAiActions.map((action, index) => `<button data-mistakes-ai="${index}">${escapeHtml(action.label)}</button>`).join('')}
          </div>
        </section>
      ` : ''}

      ${renderConfusionSection()}

      <div class="mistakes-list">
        ${mistakes.length ? mistakes.map(renderMistakeItem).join('') : `
          <div class="empty-queue">
            <h2>لا توجد أخطاء مسجلة</h2>
            <p>ستظهر هنا الأسئلة التي تضع لها تقييم خطأ أو جزئي داخل الاختبارات.</p>
          </div>
        `}
      </div>
    </div>
  `;

  $content.querySelectorAll('[data-open-compare-pair]').forEach(btn => {
    btn.addEventListener('click', () => {
      const [a, b] = btn.dataset.openComparePair.split('|');
      showComparePanel(a, b);
    });
  });

  $content.querySelectorAll('[data-retry-mistake]').forEach(button => {
    button.addEventListener('click', () => openMistakeQuiz(button.dataset.retryMistake));
  });

  $content.querySelectorAll('[data-mistake-answer]').forEach(button => {
    button.addEventListener('click', () => {
      const correct = button.dataset.mistakeAnswer === 'correct';
      recordMistakeAttempt(button.dataset.questionId, correct);
      renderMistakesJournal();
      updateWelcomeStats();
    });
  });

  $content.querySelectorAll('[data-open-mistake-source]').forEach(button => {
    button.addEventListener('click', () => {
      const found = findQuestionById(button.dataset.openMistakeSource);
      if (found) loadFile(found.quiz.sourceId);
    });
  });

  $content.querySelectorAll('[data-mistakes-ai]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = mistakeAiActions[Number(button.dataset.mistakesAi)];
      if (!action) return;
      openAiAssistantWithContext(action.query, {
        ...buildMistakesAiContext(),
        preferredModelTier: action.tier,
      });
    });
  });

  $content.querySelectorAll('[data-ai-mistake-coach]').forEach((button) => {
    const mistake = mistakes.find((item) => item.questionId === button.dataset.aiMistakeCoach);
    button.addEventListener('click', () => {
      if (!mistake) return;
      openAiAssistantWithContext(
        `اشرح لي لماذا أخطأت في السؤال "${mistake.prompt || 'السؤال الحالي'}" وكيف أتجنب نفس الخطأ في المرة القادمة.`,
        buildMistakesAiContext(mistake),
      );
    });
  });
}

function leitnerBoxLabel(box) {
  const safe = Math.max(0, Math.min(LEITNER_GRADUATE_BOX, box || 0));
  return `${safe}/${LEITNER_GRADUATE_BOX}`;
}

function renderMistakeItem(mistake) {
  const found = findQuestionById(mistake.questionId);
  const quiz = found?.quiz;
  const graduated = !!mistake.graduatedAt;
  const box = mistake.leitnerBox || 0;
  const dueInfo = state.reviewQueue[`question:${mistake.questionId}`];
  const dueText = dueInfo ? `مستحق: ${formatDueDate(dueInfo.dueAt)}` : '';

  return `
    <div class="mistake-item ${graduated ? 'graduated' : ''}">
      <div class="mistake-main">
        <div class="mistake-tags">
          <span class="queue-rating ${mistake.result === 'wrong' ? 'rating-low' : 'rating-medium'}">${escapeHtml(mistake.result || 'partial')}</span>
          <span class="leitner-badge box-${box}">${graduated ? '✓ متقن' : `Leitner ${leitnerBoxLabel(box)}`}</span>
        </div>
        <h2>${escapeHtml(mistake.prompt || 'سؤال غير معروف')}</h2>
        <p>${escapeHtml(mistake.userAnswer || 'لم تحفظ إجابة نصية.')}</p>
        <div class="queue-meta">${quiz ? escapeHtml(quiz.title) : 'اختبار غير معروف'}${dueText ? ' · ' + dueText : ''}</div>
      </div>
      <div class="queue-actions">
        ${graduated ? `
          <span class="mistake-graduated-note">تخرّج من الدفتر بعد ${LEITNER_GRADUATE_BOX} إجابات صحيحة متتابعة.</span>
        ` : `
          <div class="mistake-answer-row">
            <button class="mistake-wrong" data-mistake-answer="wrong" data-question-id="${mistake.questionId}">✗ ما زلت أخطئ</button>
            <button class="mistake-correct" data-mistake-answer="correct" data-question-id="${mistake.questionId}">✓ أجبت صح</button>
          </div>
          <button data-ai-mistake-coach="${mistake.questionId}">اشرح سبب الخطأ</button>
          ${quiz ? `<button data-retry-mistake="${mistake.questionId}">إعادة الاختبار</button>` : ''}
          ${quiz ? `<button data-open-mistake-source="${mistake.questionId}">فتح المصدر</button>` : ''}
        `}
      </div>
    </div>
  `;
}

function bindDashboardActions() {
  $content.querySelectorAll('[data-dashboard-action]').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.dashboardAction;
      if (action === 'continue') openLastOrFirst();
      if (action === 'review') showReviewQueue();
      if (action === 'cards') showFlashcards();
      if (action === 'quiz') showQuizHome();
      if (action === 'mistakes') openMistakesJournal();
    });
  });

  $content.querySelectorAll('[data-open-lesson]').forEach(button => {
    button.addEventListener('click', () => loadFile(button.dataset.openLesson));
  });

  const recallBtn = $content.querySelector('[data-start-daily-recall]');
  if (recallBtn) recallBtn.addEventListener('click', startDailyRecall);
}

function showFlashcards() {
  if (state.currentPath) {
    state.scrollPos[state.currentPath] = $content.scrollTop;
    store.set('scroll', state.scrollPos);
  }

  state.currentFileId = null;
  state.currentPath = null;
  $lesNav.classList.add('hidden');
  $btnDone.classList.add('hidden');
  $breadcrumb.textContent = 'البطاقات التعليمية';
  if ($contentMeta) $contentMeta.textContent = `${dueCards().length} بطاقة للمراجعة`;
  if ($readProgBar) $readProgBar.style.width = '0%';
  $sideTree.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));

  renderFlashcards();
}

function setFlashcardFilter(filter) {
  state.flashcardFilter = filter;
  store.set('flashcardFilter', filter);
  renderFlashcards();
}

function renderFlashcardTabs(activeFilter, counts) {
  return `
    <div class="flashcard-tabs">
      <button data-fc-filter="all" class="${activeFilter === 'all' ? 'active' : ''}">الكل (${counts.all})</button>
      <button data-fc-filter="term" class="${activeFilter === 'term' ? 'active' : ''}">مصطلحات (${counts.term})</button>
      <button data-fc-filter="cloze" class="${activeFilter === 'cloze' ? 'active' : ''}">جمل ناقصة (${counts.cloze})</button>
    </div>
  `;
}

function renderCardFace(card, revealed) {
  if (card.type === 'cloze') {
    const sentenceWithBlank = escapeHtml(card.front).replace('_____', '<span class="cloze-blank">_____</span>');
    return `
      <div class="flashcard-study-card cloze ${revealed ? 'revealed' : ''}">
        <div class="flashcard-meta">جملة ناقصة · ${escapeHtml(card.sectionTitle || card.category || '')}</div>
        <div class="flashcard-front cloze-front">${sentenceWithBlank}</div>
        <div class="flashcard-back ${revealed ? '' : 'hidden'}">
          <span class="cloze-answer-label">الكلمة المفقودة</span>
          <strong>${escapeHtml(card.back)}</strong>
          ${card.hint ? `<p>${escapeHtml(card.hint)}</p>` : ''}
        </div>
      </div>
    `;
  }
  return `
    <div class="flashcard-study-card ${revealed ? 'revealed' : ''}">
      <div class="flashcard-meta">${escapeHtml(card.category || 'Glossary')}</div>
      <div class="flashcard-front">${escapeHtml(card.front)}</div>
      <div class="flashcard-back ${revealed ? '' : 'hidden'}">
        <strong>${escapeHtml(card.back)}</strong>
        ${card.hint ? `<p>${escapeHtml(card.hint)}</p>` : ''}
      </div>
    </div>
  `;
}

function renderFlashcards(cardIndex = 0, revealed = false, chosenResult = null) {
  const filter = state.flashcardFilter;
  const cards = dueCards();
  const total = state.flashcards.length;
  const reviewed = Object.values(state.cardState).filter(card => card.lastReviewedAt).length;
  const counts = {
    all: dueCards('all').length,
    term: dueCards('term').length,
    cloze: dueCards('cloze').length,
  };
  const tabs = renderFlashcardTabs(filter, counts);

  if (!cards.length) {
    $content.innerHTML = `
      <div class="flashcards-view">
        <div class="queue-header">
          <div>
            <h1>البطاقات التعليمية</h1>
            <p>لا توجد بطاقات مستحقة في هذا التصنيف الآن.</p>
          </div>
          <div class="queue-count">0</div>
        </div>
        ${tabs}
        <div class="queue-summary">
          <div><strong>${total}</strong><span>إجمالي البطاقات</span></div>
          <div><strong>${reviewed}</strong><span>تمت مراجعتها</span></div>
        </div>
      </div>
    `;
    bindFlashcardTabs();
    return;
  }

  const index = Math.min(cardIndex, cards.length - 1);
  const card = cards[index];
  const cardState = getCardState(card.id);

  $content.innerHTML = `
    <div class="flashcards-view">
      <div class="queue-header">
        <div>
          <h1>البطاقات التعليمية</h1>
          <p>${card.type === 'cloze' ? 'املأ الفراغ من ذاكرتك، ثم اكشف الإجابة.' : 'راجع المصطلح، ثم اكشف الإجابة وسجل النتيجة.'}</p>
        </div>
        <div class="queue-count">${cards.length}</div>
      </div>

      ${tabs}

      <div class="queue-summary">
        <div><strong>${total}</strong><span>إجمالي البطاقات</span></div>
        <div><strong>${reviewed}</strong><span>تمت مراجعتها</span></div>
      </div>

      ${renderCardFace(card, revealed)}

      <div class="flashcard-actions">
        ${revealed ? `
          <div class="rating-row">
            <span class="step-label">كيف وجدتها؟</span>
            <div class="rating-buttons">
              <button data-card-result="again" class="${chosenResult === 'again' ? 'active' : ''}">إعادة اليوم</button>
              <button data-card-result="hard" class="${chosenResult === 'hard' ? 'active' : ''}">صعبة</button>
              <button data-card-result="easy" class="${chosenResult === 'easy' ? 'active' : ''}">سهلة</button>
            </div>
          </div>
          ${chosenResult ? `
            <div class="rating-row confidence-row">
              <span class="step-label">ما مدى ثقتك بالإجابة؟</span>
              <div class="confidence-buttons">
                <button data-confidence="low" title="غير متأكد">⭐</button>
                <button data-confidence="med" title="ثقة متوسطة">⭐⭐</button>
                <button data-confidence="high" title="متأكد تماماً">⭐⭐⭐</button>
              </div>
            </div>
          ` : ''}
        ` : `
          <button class="reveal-btn" data-reveal-card>كشف الإجابة</button>
        `}
      </div>

      <div class="flashcard-history">
        ${cardState.lastResult ? `آخر نتيجة: ${escapeHtml(cardState.lastResult)}` : 'بطاقة جديدة'}
      </div>
    </div>
  `;

  bindFlashcardTabs();

  const reveal = $content.querySelector('[data-reveal-card]');
  if (reveal) reveal.addEventListener('click', () => renderFlashcards(index, true));

  $content.querySelectorAll('[data-card-result]').forEach(button => {
    button.addEventListener('click', () => {
      renderFlashcards(index, true, button.dataset.cardResult);
    });
  });

  $content.querySelectorAll('[data-confidence]').forEach(button => {
    button.addEventListener('click', () => {
      const confidence = button.dataset.confidence;
      saveCardState(card.id, {
        lastResult: chosenResult,
        lastConfidence: confidence,
        lastReviewedAt: new Date().toISOString(),
        reviews: (cardState.reviews || 0) + 1,
      });
      scheduleCardReview(card.id, chosenResult, confidence);
      renderFlashcards(index, false);
    });
  });
}

function bindFlashcardTabs() {
  $content.querySelectorAll('[data-fc-filter]').forEach(btn => {
    btn.addEventListener('click', () => setFlashcardFilter(btn.dataset.fcFilter));
  });
}

function showQuizHome() {
  if (state.currentPath) {
    state.scrollPos[state.currentPath] = $content.scrollTop;
    store.set('scroll', state.scrollPos);
  }

  state.currentFileId = null;
  state.currentPath = null;
  state.currentQuizSession = null;
  $lesNav.classList.add('hidden');
  $btnDone.classList.add('hidden');
  $breadcrumb.textContent = 'الاختبارات';
  if ($contentMeta) $contentMeta.textContent = `${state.quizBank.length} اختبار`;
  if ($readProgBar) $readProgBar.style.width = '0%';
  $sideTree.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));

  renderQuizHome();
}

function renderQuizHome() {
  const totalQuestions = state.quizBank.reduce((sum, quiz) => sum + quiz.questionCount, 0);
  const attemptCount = Object.values(state.quizAttempts).flat().length;
  const mistakeCount = Object.keys(state.mistakes).length;

  $content.innerHTML = `
    <div class="quiz-view">
      <div class="queue-header">
        <div>
          <h1>الاختبارات</h1>
          <p>اختبارات كتابية ذاتية التصحيح. الهدف قياس الفهم لا اختيار إجابة عشوائية.</p>
        </div>
        <div class="queue-count">${state.quizBank.length}</div>
      </div>

      <div class="queue-summary">
        <div><strong>${totalQuestions}</strong><span>سؤال</span></div>
        <div><strong>${attemptCount}</strong><span>محاولة</span></div>
        <div><strong>${mistakeCount}</strong><span>أخطاء</span></div>
      </div>

      <div class="quiz-list">
        ${state.quizBank.map(quiz => renderQuizCard(quiz)).join('')}
      </div>
    </div>
  `;

  $content.querySelectorAll('[data-start-quiz]').forEach(button => {
    button.addEventListener('click', () => startQuiz(button.dataset.startQuiz));
  });
}

function renderQuizCard(quiz) {
  const attempts = state.quizAttempts[quiz.id] || [];
  const lastAttempt = attempts[attempts.length - 1];
  const lastScore = lastAttempt ? `${lastAttempt.correct}/${lastAttempt.total}` : 'لم يبدأ';

  return `
    <div class="quiz-card">
      <div>
        <h2>${escapeHtml(quiz.title)}</h2>
        <p>${escapeHtml(quiz.sectionTitle || '')}</p>
        <div class="queue-meta">${quiz.questionCount} سؤال · آخر نتيجة: ${lastScore}</div>
      </div>
      <button data-start-quiz="${quiz.id}">بدء الاختبار</button>
    </div>
  `;
}

function startQuiz(quizId) {
  const quiz = state.quizBank.find(item => item.id === quizId);
  if (!quiz) return;

  state.currentQuizSession = {
    id: `attempt-${Date.now()}`,
    quizId,
    questionIndex: 0,
    answers: {},
    startedAt: new Date().toISOString(),
  };

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const session = state.currentQuizSession;
  if (!session) return showQuizHome();

  const quiz = state.quizBank.find(item => item.id === session.quizId);
  if (!quiz) return showQuizHome();

  const index = session.questionIndex;
  const question = quiz.questions[index];
  if (!question) return finishQuiz();

  const saved = session.answers[question.id] || {};
  const progress = `${index + 1}/${quiz.questions.length}`;
  const quizAiActions = [
    {
      label: 'اشرح المطلوب',
      query: `اشرح لي ما الذي يطلبه هذا السؤال بالضبط دون أن تعطيني الحل الكامل: ${question.prompt}`,
      tier: 'light',
    },
    {
      label: 'راجع إجابتي',
      query: `راجع إجابتي الحالية على هذا السؤال، وقل لي هل أنا على المسار الصحيح وما الذي ينقصها دون أن تعطيني نموذج إجابة كامل. السؤال: ${question.prompt}`,
      tier: 'heavy',
    },
    {
      label: 'ماذا أراجع؟',
      query: `إلى أي مفهوم أو درس ينتمي هذا السؤال، وما الذي يجب أن أراجعه قبل إعادة المحاولة؟ السؤال: ${question.prompt}`,
      tier: 'light',
    },
  ];

  $breadcrumb.textContent = quiz.title;
  if ($contentMeta) $contentMeta.textContent = `سؤال ${progress}`;

  $content.innerHTML = `
    <div class="quiz-session">
      <div class="quiz-progress">
        <span>${progress}</span>
        <strong>${escapeHtml(question.section || '')}</strong>
      </div>

      <div class="quiz-question-card">
        <span class="queue-rating rating-medium">${escapeHtml(question.type)}</span>
        <h1>${escapeHtml(question.prompt)}</h1>
        <textarea data-quiz-answer placeholder="اكتب إجابتك هنا...">${escapeHtml(saved.answer || '')}</textarea>
      </div>

      <section class="quiz-ai-panel">
        <div class="study-aid-label">AI داخل الاختبار</div>
        <h3>استخدم الذكاء لفهم السؤال لا لتخمين الجواب</h3>
        <p>يمكنك تفسير المطلوب، مراجعة إجابتك الحالية، أو معرفة الدرس الذي يستحق المراجعة قبل الانتقال للسؤال التالي.</p>
        <div class="dashboard-ai-actions">
          ${quizAiActions.map((action, actionIndex) => `<button data-quiz-ai="${actionIndex}">${escapeHtml(action.label)}</button>`).join('')}
        </div>
      </section>

      <div class="quiz-self-grade">
        <button data-quiz-result="wrong" class="${saved.result === 'wrong' ? 'active' : ''}">خطأ / لم أعرف</button>
        <button data-quiz-result="partial" class="${saved.result === 'partial' ? 'active' : ''}">جزئي</button>
        <button data-quiz-result="correct" class="${saved.result === 'correct' ? 'active' : ''}">صحيح</button>
      </div>

      <div class="quiz-nav">
        <button data-quiz-prev ${index === 0 ? 'disabled' : ''}>السابق</button>
        <button data-quiz-next>${index === quiz.questions.length - 1 ? 'إنهاء' : 'التالي'}</button>
      </div>
    </div>
  `;

  $content.querySelectorAll('[data-quiz-result]').forEach(button => {
    button.addEventListener('click', () => {
      saveQuizAnswer(question.id, button.dataset.quizResult);
      renderQuizQuestion();
    });
  });

  $content.querySelectorAll('[data-quiz-ai]').forEach((button) => {
    button.addEventListener('click', () => {
      saveQuizAnswer(question.id);
      const latest = session.answers[question.id] || saved;
      const action = quizAiActions[Number(button.dataset.quizAi)];
      if (!action) return;
      openAiAssistantWithContext(action.query, {
        ...buildQuizQuestionAiContext(quiz, question, latest, progress),
        preferredModelTier: action.tier,
      });
    });
  });

  const prev = $content.querySelector('[data-quiz-prev]');
  if (prev) {
    prev.addEventListener('click', () => {
      saveQuizAnswer(question.id);
      session.questionIndex = Math.max(0, session.questionIndex - 1);
      renderQuizQuestion();
    });
  }

  const next = $content.querySelector('[data-quiz-next]');
  if (next) {
    next.addEventListener('click', () => {
      saveQuizAnswer(question.id);
      if (session.questionIndex >= quiz.questions.length - 1) finishQuiz();
      else {
        session.questionIndex += 1;
        renderQuizQuestion();
      }
    });
  }
}

function saveQuizAnswer(questionId, result = null) {
  const session = state.currentQuizSession;
  if (!session) return;
  const textarea = $content.querySelector('[data-quiz-answer]');
  const previous = session.answers[questionId] || {};
  session.answers[questionId] = {
    answer: textarea ? textarea.value : previous.answer || '',
    result: result || previous.result || 'partial',
    answeredAt: new Date().toISOString(),
  };
}

function finishQuiz() {
  const session = state.currentQuizSession;
  if (!session) return showQuizHome();
  const quiz = state.quizBank.find(item => item.id === session.quizId);
  if (!quiz) return showQuizHome();

  let correct = 0;
  let partial = 0;
  let wrong = 0;

  quiz.questions.forEach(question => {
    const answer = session.answers[question.id] || { result: 'wrong', answer: '' };
    if (answer.result === 'correct') correct++;
    else if (answer.result === 'partial') partial++;
    else wrong++;

    if (answer.result !== 'correct') {
      const existing = state.mistakes[question.id] || {};
      state.mistakes[question.id] = {
        ...existing,
        questionId: question.id,
        quizId: quiz.id,
        prompt: question.prompt,
        userAnswer: answer.answer,
        result: answer.result,
        sourceLesson: question.sourceId,
        mistakeCategory: question.type,
        leitnerBox: 0,
        consecutiveCorrect: 0,
        graduatedAt: null,
        lastReviewedAt: null,
        updatedAt: new Date().toISOString(),
      };
      scheduleQuestionReview(question.id, answer.result);
      recordConfusionFromMistake(question.prompt);
    }
  });

  const attempt = {
    id: session.id,
    quizId: quiz.id,
    startedAt: session.startedAt,
    completedAt: new Date().toISOString(),
    total: quiz.questions.length,
    correct,
    partial,
    wrong,
    answers: session.answers,
  };

  state.quizAttempts[quiz.id] = [...(state.quizAttempts[quiz.id] || []), attempt];
  store.set('quizAttempts', state.quizAttempts);
  store.set('mistakes', state.mistakes);
  state.currentQuizSession = null;
  updateWelcomeStats();

  renderQuizResult(quiz, attempt);
}

function renderQuizResult(quiz, attempt) {
  const pct = Math.round((attempt.correct / Math.max(1, attempt.total)) * 100);
  const quizResultAiActions = [
    {
      label: 'حلل هذه المحاولة',
      query: `حلل نتيجة هذا الاختبار وحدد لماذا وقعت في الخطأ أو الجزئي، وما الصورة الذهنية الناقصة عندي.`,
      tier: 'heavy',
    },
    {
      label: 'ابن خطة علاج',
      query: 'ابن لي خطة مراجعة علاجية قصيرة لهذا الاختبار: ما الذي أراجعه أولًا وبأي ترتيب؟',
      tier: 'heavy',
    },
  ];
  $content.innerHTML = `
    <div class="quiz-result">
      <div class="queue-header">
        <div>
          <h1>نتيجة الاختبار</h1>
          <p>${escapeHtml(quiz.title)}</p>
        </div>
        <div class="queue-count">${pct}%</div>
      </div>

      <div class="queue-summary">
        <div><strong>${attempt.correct}</strong><span>صحيح</span></div>
        <div><strong>${attempt.partial}</strong><span>جزئي</span></div>
        <div><strong>${attempt.wrong}</strong><span>خطأ</span></div>
      </div>

      <section class="quiz-ai-panel quiz-ai-panel-result">
        <div class="study-aid-label">AI بعد الاختبار</div>
        <h3>حوّل النتيجة إلى خطة مراجعة</h3>
        <p>بدل الاكتفاء بالنسبة النهائية، اطلب تحليل المحاولة أو خطة علاج مركزة على الأسئلة غير المتقنة.</p>
        <div class="dashboard-ai-actions">
          ${quizResultAiActions.map((action, index) => `<button data-quiz-result-ai="${index}">${escapeHtml(action.label)}</button>`).join('')}
        </div>
      </section>

      <div class="quiz-result-actions">
        <button data-retry-quiz="${quiz.id}">إعادة الاختبار</button>
        <button data-quiz-home>العودة للاختبارات</button>
        <button data-open-review-from-quiz>فتح المراجعة</button>
      </div>
    </div>
  `;

  $content.querySelector('[data-retry-quiz]')?.addEventListener('click', () => startQuiz(quiz.id));
  $content.querySelector('[data-quiz-home]')?.addEventListener('click', showQuizHome);
  $content.querySelector('[data-open-review-from-quiz]')?.addEventListener('click', showReviewQueue);
  $content.querySelectorAll('[data-quiz-result-ai]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = quizResultAiActions[Number(button.dataset.quizResultAi)];
      if (!action) return;
      openAiAssistantWithContext(action.query, {
        ...buildQuizResultAiContext(quiz, attempt),
        preferredModelTier: action.tier,
      });
    });
  });
}

function showReviewQueue() {
  if (state.currentPath) {
    state.scrollPos[state.currentPath] = $content.scrollTop;
    store.set('scroll', state.scrollPos);
  }

  state.currentFileId = null;
  state.currentPath = null;
  $lesNav.classList.add('hidden');
  $btnDone.classList.add('hidden');
  $breadcrumb.textContent = 'قائمة المراجعة';
  if ($contentMeta) $contentMeta.textContent = `${dueReviewItems().length} مستحق`;
  if ($readProgBar) $readProgBar.style.width = '0%';
  $sideTree.querySelectorAll('.tree-item').forEach(el => el.classList.remove('active'));

  renderReviewQueue();
}

/* Interleaving: ensure consecutive items come from different sections.
   Walks groups round-robin so back-to-back items rarely share a section. */
function reviewSectionKey(item) {
  if (item.file) return item.file.sectionTitle || item.file.sectionId || '__other';
  if (item.card) return item.card.sectionTitle || item.card.category || '__other';
  if (item.questionInfo?.quiz) return item.questionInfo.quiz.sectionTitle || item.questionInfo.quiz.sectionId || '__other';
  return '__other';
}

function interleaveBySection(items) {
  if (items.length < 3) return items;
  const groups = new Map();
  items.forEach(item => {
    const key = reviewSectionKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  const buckets = [...groups.values()];
  const result = [];
  while (result.length < items.length) {
    let added = false;
    for (const bucket of buckets) {
      const next = bucket.shift();
      if (next) { result.push(next); added = true; }
    }
    if (!added) break;
  }
  return result;
}

function toggleReviewInterleave() {
  state.reviewInterleave = !state.reviewInterleave;
  store.set('reviewInterleave', state.reviewInterleave);
  renderReviewQueue();
}

function renderReviewQueue() {
  let dueItems = dueReviewItems();
  if (state.reviewInterleave) dueItems = interleaveBySection(dueItems);
  const scheduledCount = Object.keys(state.reviewQueue).length;
  const sectionCount = new Set(dueItems.map(reviewSectionKey)).size;

  $content.innerHTML = `
    <div class="review-queue">
      <div class="queue-header">
        <div>
          <h1>قائمة المراجعة</h1>
          <p>${state.reviewInterleave ? 'الترتيب مخلوط بين الأقسام (interleaved) — أفضل لتثبيت الذاكرة طويلة المدى.' : 'الترتيب حسب أقدم استحقاق.'}</p>
        </div>
        <div class="queue-count">${dueItems.length}</div>
      </div>

      <div class="queue-summary">
        <div><strong>${dueItems.length}</strong><span>مستحق الآن</span></div>
        <div><strong>${scheduledCount}</strong><span>مجدول إجمالًا</span></div>
        <div><strong>${sectionCount}</strong><span>قسم مختلف</span></div>
      </div>

      <div class="interleave-toggle">
        <label>
          <input type="checkbox" data-interleave-toggle ${state.reviewInterleave ? 'checked' : ''}>
          <span>خلط الأقسام (Interleaved) — يقوي الاستدعاء</span>
        </label>
      </div>

      <div class="queue-list">
        ${dueItems.length ? dueItems.map(item => renderReviewQueueItem(item)).join('') : `
          <div class="empty-queue">
            <h2>لا توجد مراجعات مستحقة الآن</h2>
            <p>استمر في تقييم الدروس، وسيتم بناء قائمة المراجعة تلقائيًا.</p>
          </div>
        `}
      </div>
    </div>
  `;

  const toggle = $content.querySelector('[data-interleave-toggle]');
  if (toggle) toggle.addEventListener('change', toggleReviewInterleave);

  $content.querySelectorAll('[data-open-review]').forEach(button => {
    button.addEventListener('click', () => loadFile(button.dataset.openReview));
  });

  $content.querySelectorAll('[data-open-cards]').forEach(button => {
    button.addEventListener('click', showFlashcards);
  });

  $content.querySelectorAll('[data-start-quiz-from-review]').forEach(button => {
    button.addEventListener('click', () => startQuiz(button.dataset.startQuizFromReview));
  });

  $content.querySelectorAll('[data-complete-review]').forEach(button => {
    button.addEventListener('click', () => {
      completeReview(button.dataset.completeReview);
      renderReviewQueue();
      updateWelcomeStats();
    });
  });
}

function renderReviewQueueItem(item) {
  if (item.itemType === 'flashcard') return renderCardReviewQueueItem(item);
  if (item.itemType === 'quiz-question') return renderQuestionReviewQueueItem(item);

  const lessonState = getLessonState(item.sourceId);
  const rating = lessonState.selfRating || 'medium';
  const feynman = lessonState.feynman ? escapeHtml(lessonState.feynman.slice(0, 180)) : 'لا يوجد شرح محفوظ بعد.';

  return `
    <div class="queue-item">
      <div class="queue-item-main">
        <span class="queue-rating rating-${rating}">${rating}</span>
        <h2>${escapeHtml(item.file.title)}</h2>
        <p>${feynman}${lessonState.feynman && lessonState.feynman.length > 180 ? '...' : ''}</p>
        <div class="queue-meta">${escapeHtml(item.file.sectionTitle || '')} · مستحق: ${formatDueDate(item.dueAt)}</div>
      </div>
      <div class="queue-actions">
        <button data-open-review="${item.sourceId}">فتح الدرس</button>
        <button data-complete-review="${item.sourceId}">تمت المراجعة</button>
      </div>
    </div>
  `;
}

function renderQuestionReviewQueueItem(item) {
  const { quiz, question } = item.questionInfo;
  const mistake = state.mistakes[question.id] || {};

  return `
    <div class="queue-item">
      <div class="queue-item-main">
        <span class="queue-rating rating-low">quiz</span>
        <h2>${escapeHtml(question.prompt)}</h2>
        <p>${escapeHtml(mistake.userAnswer || 'لا توجد إجابة محفوظة.')}</p>
        <div class="queue-meta">${escapeHtml(quiz.title)} · مستحق: ${formatDueDate(item.dueAt)}</div>
      </div>
      <div class="queue-actions">
        <button data-start-quiz-from-review="${quiz.id}">إعادة الاختبار</button>
        <button data-complete-review="question:${question.id}">تمت المراجعة</button>
      </div>
    </div>
  `;
}

function renderCardReviewQueueItem(item) {
  const card = item.card;
  const cardState = getCardState(card.id);

  return `
    <div class="queue-item">
      <div class="queue-item-main">
        <span class="queue-rating rating-medium">card</span>
        <h2>${escapeHtml(card.front)}</h2>
        <p>${escapeHtml(card.back)} - ${escapeHtml(card.hint || '')}</p>
        <div class="queue-meta">${escapeHtml(card.category || 'Glossary')} · مستحق: ${formatDueDate(item.dueAt)} · ${cardState.reviews || 0} مراجعة</div>
      </div>
      <div class="queue-actions">
        <button data-open-cards>فتح البطاقات</button>
        <button data-complete-review="card:${card.id}">تمت المراجعة</button>
      </div>
    </div>
  `;
}

function completeReview(fileId) {
  const item = state.reviewQueue[fileId];
  if (!item) return;
  const currentInterval = Number(item.intervalDays || 1);
  const nextInterval = Math.min(30, Math.max(2, Math.round(currentInterval * 1.8)));
  state.reviewQueue[fileId] = {
    ...item,
    intervalDays: nextInterval,
    dueAt: daysFromNow(nextInterval),
    lastResult: 'reviewed',
    lastReviewedAt: new Date().toISOString(),
  };
  if (item.itemType === 'flashcard') {
    saveCardState(item.sourceId, { lastReviewedAt: new Date().toISOString(), lastResult: 'reviewed' });
  } else if (item.itemType === 'quiz-question') {
    state.mistakes[item.sourceId] = {
      ...(state.mistakes[item.sourceId] || {}),
      lastReviewedAt: new Date().toISOString(),
    };
    store.set('mistakes', state.mistakes);
  } else {
    saveLessonState(fileId, { lastReviewedAt: new Date().toISOString() });
  }
  store.set('reviewQueue', state.reviewQueue);
}

$btnReview?.addEventListener('click', showReviewQueue);
$btnCards?.addEventListener('click', showFlashcards);
$btnQuiz?.addEventListener('click', showQuizHome);
$btnSystems?.addEventListener('click', showSystemComparison);
$btnInterview?.addEventListener('click', showInterviewHome);
$btnDashboard?.addEventListener('click', showDashboard);
$btnAI?.addEventListener('click', () => {
  setAiContextDraft(null);
  renderAiAssistant();
});
$btnMistakes?.addEventListener('click', openMistakesJournal);
$('btn-cheatsheets')?.addEventListener('click', showCheatSheets);
$('btn-mindmap')?.addEventListener('click', showMindMap);
$('btn-compare')?.addEventListener('click', showComparePanel);
$('btn-scenarios')?.addEventListener('click', showScenarios);
$('btn-presleep')?.addEventListener('click', showPreSleepMode);
$('btn-two-pass')?.addEventListener('click', toggleTwoPass);

/* ─── Scenario Simulator ──────────────────────────────────── */
function showScenarios() {
  clearReaderContext('السيناريوهات التطبيقية', `${state.scenarios.length} سيناريو`);
  state.currentScenarioSession = null;
  renderScenariosList();
}

const PART_LABELS = {
  'part1': 'الجزء 1 — الأساسيات',
  'part2': 'الجزء 2 — البيانات الأساسية',
  'part3': 'الجزء 3 — التنفيذ',
  'part4': 'الجزء 4 — التكاليف',
  'part5': 'الجزء 5 — الجودة والتخطيط',
  'part6': 'الجزء 6 — الاستشارات',
  'cross-cutting': 'شامل — يعبر عدة أجزاء',
};

const TIMING_LABELS = {
  'discovery': '🔍 Discovery (قبل التنفيذ)',
  'implementation': '🔧 Implementation (إعداد)',
  'early-go-live': '🚀 First weeks after Go-Live',
  'operations': '⚙️ Operations (يومي)',
  'year-end': '📊 Year-End / Closing',
  'enhancement-request': '✨ Enhancement Request',
};

const TYPE_LABELS = {
  'problem-solving': '🔥 حل مشكلة',
  'customization-request': '🛠 طلب تخصيص',
  'discovery-mapping': '🗺 Discovery Mapping',
  'gap-analysis': '⚖ Gap Analysis',
  'training-issue': '👨‍🏫 تدريب',
  'data-issue': '🗃 بيانات',
  'reporting': '📈 تقارير',
  'integration': '🔌 تكامل',
  'change-management': '👥 Change Management',
};

function filterScenarios() {
  const f = state.scenarioFilters;
  return state.scenarios.filter(s => {
    if (f.part !== 'all' && s.partId !== f.part) return false;
    if (f.timing !== 'all' && s.timing !== f.timing) return false;
    if (f.type !== 'all' && s.scenarioType !== f.type) return false;
    return true;
  });
}

function setScenarioFilter(key, value) {
  state.scenarioFilters = { ...state.scenarioFilters, [key]: value };
  store.set('scenarioFilters', state.scenarioFilters);
  renderScenariosList();
}

function resetScenarioFilters() {
  state.scenarioFilters = { part: 'all', timing: 'all', type: 'all' };
  store.set('scenarioFilters', state.scenarioFilters);
  renderScenariosList();
}

function renderScenariosList() {
  if (!state.scenarios.length) {
    $content.innerHTML = `<div class="scenarios-view"><h1>السيناريوهات</h1><p class="empty-queue">لا توجد سيناريوهات بعد.</p></div>`;
    return;
  }

  const f = state.scenarioFilters;
  const filtered = filterScenarios();

  // Compute counts per facet so user sees what's available
  const partCounts = {};
  const timingCounts = {};
  const typeCounts = {};
  state.scenarios.forEach(s => {
    partCounts[s.partId] = (partCounts[s.partId] || 0) + 1;
    timingCounts[s.timing] = (timingCounts[s.timing] || 0) + 1;
    typeCounts[s.scenarioType] = (typeCounts[s.scenarioType] || 0) + 1;
  });

  // Group filtered scenarios by part
  const grouped = {};
  filtered.forEach(s => {
    if (!grouped[s.partId]) grouped[s.partId] = [];
    grouped[s.partId].push(s);
  });
  const partOrder = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6', 'cross-cutting'];

  // Overall progress stat
  const attempted = state.scenarios.filter(s => state.scenarioAttempts[s.id]).length;
  const perfectScores = state.scenarios.filter(s => {
    const a = state.scenarioAttempts[s.id];
    return a && a.correct === a.total;
  }).length;

  $content.innerHTML = `
    <div class="scenarios-view">
      <div class="queue-header">
        <div>
          <h1>السيناريوهات الاستشارية</h1>
          <p>${state.scenarios.length} حالة من واقع المصانع — مرتبطة بدروس الكتاب، مصنّفة حسب التوقيت ونوع الموقف.</p>
        </div>
        <div class="queue-count">${filtered.length}</div>
      </div>

      <div class="queue-summary">
        <div><strong>${state.scenarios.length}</strong><span>إجمالي السيناريوهات</span></div>
        <div><strong>${attempted}</strong><span>تمت محاولتها</span></div>
        <div><strong>${perfectScores}</strong><span>درجة كاملة</span></div>
      </div>

      <details class="scenario-filters" open>
        <summary>🎛 الفلاتر${(f.part!=='all'||f.timing!=='all'||f.type!=='all')?` <span class="filter-active-dot"></span>`:''}</summary>

        <div class="filter-group">
          <span class="filter-group-label">حسب الجزء:</span>
          <div class="filter-chips">
            <button data-scenario-filter="part" data-filter-value="all" class="${f.part==='all'?'active':''}">الكل (${state.scenarios.length})</button>
            ${partOrder.map(p => `
              <button data-scenario-filter="part" data-filter-value="${p}" class="${f.part===p?'active':''}">${escapeHtml(PART_LABELS[p] || p)} (${partCounts[p]||0})</button>
            `).join('')}
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-group-label">حسب التوقيت:</span>
          <div class="filter-chips">
            <button data-scenario-filter="timing" data-filter-value="all" class="${f.timing==='all'?'active':''}">الكل</button>
            ${Object.entries(TIMING_LABELS).map(([k, label]) => `
              <button data-scenario-filter="timing" data-filter-value="${k}" class="${f.timing===k?'active':''}">${escapeHtml(label)} (${timingCounts[k]||0})</button>
            `).join('')}
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-group-label">حسب نوع الموقف:</span>
          <div class="filter-chips">
            <button data-scenario-filter="type" data-filter-value="all" class="${f.type==='all'?'active':''}">الكل</button>
            ${Object.entries(TYPE_LABELS).map(([k, label]) => `
              <button data-scenario-filter="type" data-filter-value="${k}" class="${f.type===k?'active':''}">${escapeHtml(label)} (${typeCounts[k]||0})</button>
            `).join('')}
          </div>
        </div>

        ${(f.part!=='all'||f.timing!=='all'||f.type!=='all') ? `
          <button class="filter-reset" data-scenario-filter-reset>✕ إلغاء كل الفلاتر</button>
        ` : ''}
      </details>

      ${filtered.length === 0 ? `
        <div class="empty-queue scenarios-empty">
          <h2>لا توجد سيناريوهات مطابقة</h2>
          <p>جرّب تخفيف الفلاتر.</p>
        </div>
      ` : partOrder.filter(p => grouped[p]).map(p => `
        <div class="scenario-part-group">
          <h2 class="scenario-part-title">${escapeHtml(PART_LABELS[p] || p)} <span>${grouped[p].length}</span></h2>
          <div class="scenarios-list">
            ${grouped[p].map(sc => renderScenarioCard(sc)).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  $content.querySelectorAll('[data-start-scenario]').forEach(btn => {
    btn.addEventListener('click', () => startScenario(btn.dataset.startScenario));
  });
  $content.querySelectorAll('[data-scenario-filter]').forEach(btn => {
    btn.addEventListener('click', () => setScenarioFilter(btn.dataset.scenarioFilter, btn.dataset.filterValue));
  });
  $content.querySelector('[data-scenario-filter-reset]')?.addEventListener('click', resetScenarioFilters);
  $content.querySelectorAll('[data-open-linked-lesson]').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); loadFile(btn.dataset.openLinkedLesson); });
  });
}

function renderScenarioCard(sc) {
  const attempt = state.scenarioAttempts[sc.id];
  const lastScore = attempt ? `${attempt.correct}/${sc.steps.length}` : 'لم يُحاول';
  const scorePct = attempt ? Math.round((attempt.correct / attempt.total) * 100) : null;
  const scoreCls = scorePct === null ? '' : scorePct === 100 ? 'score-perfect' : scorePct >= 60 ? 'score-good' : 'score-low';

  return `
    <div class="scenario-card difficulty-${sc.difficulty}">
      <div class="scenario-card-main">
        <div class="scenario-meta">
          <span class="scenario-cat">${escapeHtml(sc.category)}</span>
          <span class="scenario-diff diff-${sc.difficulty}">${sc.difficulty === 'easy' ? 'سهل' : sc.difficulty === 'medium' ? 'متوسط' : 'صعب'}</span>
          <span class="scenario-timing">${escapeHtml(TIMING_LABELS[sc.timing] || sc.timing)}</span>
          <span class="scenario-type">${escapeHtml(TYPE_LABELS[sc.scenarioType] || sc.scenarioType)}</span>
        </div>
        <h3>${escapeHtml(sc.title)}</h3>
        ${sc.clientQuote ? `<blockquote class="scenario-quote">"${escapeHtml(sc.clientQuote)}"</blockquote>` : ''}
        <p>${escapeHtml(sc.context.slice(0, 200))}${sc.context.length > 200 ? '…' : ''}</p>
        ${sc.linkedLessons?.length ? `
          <div class="scenario-linked">
            <span class="linked-label">دروس مرتبطة:</span>
            ${sc.linkedLessons.map(lid => {
              const f = findById(lid);
              return f ? `<button class="linked-lesson-chip" data-open-linked-lesson="${lid}">${escapeHtml(f.title)}</button>` : '';
            }).join('')}
          </div>
        ` : ''}
        <div class="queue-meta">${sc.steps.length} قرارات · آخر نتيجة: <strong class="${scoreCls}">${lastScore}</strong></div>
      </div>
      <button data-start-scenario="${sc.id}">${attempt ? 'إعادة' : 'ابدأ'}</button>
    </div>
  `;
}

function startScenario(id) {
  const sc = state.scenarios.find(s => s.id === id);
  if (!sc) return;
  state.currentScenarioSession = {
    id: sc.id,
    stepIndex: 0,
    choices: [],
    startedAt: new Date().toISOString(),
  };
  renderScenarioStep();
}

function renderScenarioStep() {
  const session = state.currentScenarioSession;
  if (!session) return renderScenariosList();
  const sc = state.scenarios.find(s => s.id === session.id);
  if (!sc) return renderScenariosList();
  const step = sc.steps[session.stepIndex];
  if (!step) return finishScenario(sc, session);

  const choice = session.choices[session.stepIndex];
  const revealed = choice !== undefined;
  const correct = revealed && choice === step.correct;

  $content.innerHTML = `
    <div class="scenario-session">
      <div class="scenario-progress">
        <span>${session.stepIndex + 1} / ${sc.steps.length}</span>
        <strong>${escapeHtml(sc.title)}</strong>
      </div>
      ${session.stepIndex === 0 ? `
        <div class="scenario-meta-row">
          <span class="scenario-cat">${escapeHtml(sc.category)}</span>
          <span class="scenario-timing">${escapeHtml(TIMING_LABELS[sc.timing] || sc.timing)}</span>
          <span class="scenario-type">${escapeHtml(TYPE_LABELS[sc.scenarioType] || sc.scenarioType)}</span>
        </div>
        <div class="scenario-context">${escapeHtml(sc.context)}</div>
        ${sc.clientQuote ? `<blockquote class="scenario-quote scenario-quote-large">"${escapeHtml(sc.clientQuote)}"</blockquote>` : ''}
      ` : ''}
      <div class="scenario-prompt"><h2>${escapeHtml(step.prompt)}</h2></div>
      <div class="scenario-options">
        ${step.options.map((opt, i) => {
          let cls = '';
          if (revealed) {
            if (i === step.correct) cls = 'option-correct';
            else if (i === choice) cls = 'option-chosen-wrong';
            else cls = 'option-disabled';
          }
          return `<button data-scenario-choice="${i}" class="${cls}" ${revealed ? 'disabled' : ''}>${escapeHtml(opt)}</button>`;
        }).join('')}
      </div>
      ${revealed ? `
        <div class="scenario-explain ${correct ? 'correct' : 'wrong'}">
          <strong>${correct ? '✓ صحيح' : '✗ المطلوب كان: ' + escapeHtml(step.options[step.correct])}</strong>
          <p>${escapeHtml(step.explain)}</p>
        </div>
        <div class="scenario-nav">
          <button data-scenario-next>${session.stepIndex >= sc.steps.length - 1 ? 'إنهاء السيناريو' : 'التالي ←'}</button>
        </div>
      ` : ''}
    </div>
  `;

  $content.querySelectorAll('[data-scenario-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      session.choices[session.stepIndex] = Number(btn.dataset.scenarioChoice);
      renderScenarioStep();
    });
  });
  const next = $content.querySelector('[data-scenario-next]');
  if (next) next.addEventListener('click', () => {
    session.stepIndex += 1;
    renderScenarioStep();
  });
}

function finishScenario(sc, session) {
  const correct = sc.steps.reduce((acc, s, i) => acc + (session.choices[i] === s.correct ? 1 : 0), 0);
  state.scenarioAttempts[sc.id] = {
    correct,
    total: sc.steps.length,
    completedAt: new Date().toISOString(),
    choices: session.choices,
  };
  store.set('scenarioAttempts', state.scenarioAttempts);
  bumpDailyStreak();

  const pct = Math.round((correct / sc.steps.length) * 100);
  $content.innerHTML = `
    <div class="scenario-session scenario-done">
      <h1>اكتمل السيناريو</h1>
      <div class="scenario-score ${correct === sc.steps.length ? 'perfect' : pct >= 60 ? 'good' : 'low'}">
        <strong>${correct}/${sc.steps.length}</strong>
        <span>${pct}%</span>
      </div>
      <p>${correct === sc.steps.length ? 'تفكير استشاري متين 🔥' : pct >= 60 ? 'جيد، راجع الخطوات الخاطئة.' : 'الموضوع يحتاج تثبيتاً أكثر — راجع الجزء المرتبط.'}</p>
      ${sc.linkedLessons?.length ? `
        <div class="scenario-done-linked">
          <strong>راجع الدروس المرتبطة بهذا السيناريو:</strong>
          <div class="linked-list">
            ${sc.linkedLessons.map(lid => {
              const f = findById(lid);
              return f ? `<button class="linked-lesson-chip" data-open-linked-lesson="${lid}">${escapeHtml(f.title)}</button>` : '';
            }).join('')}
          </div>
        </div>
      ` : ''}
      <div class="scenario-done-actions">
        <button data-scenario-retry>إعادة</button>
        <button data-scenario-back>كل السيناريوهات</button>
      </div>
    </div>
  `;
  $content.querySelector('[data-scenario-retry]')?.addEventListener('click', () => startScenario(sc.id));
  $content.querySelector('[data-scenario-back]')?.addEventListener('click', () => { state.currentScenarioSession = null; renderScenariosList(); });
  $content.querySelectorAll('[data-open-linked-lesson]').forEach(btn => {
    btn.addEventListener('click', () => loadFile(btn.dataset.openLinkedLesson));
  });
}

/* ─── Teach-Back Panel (inside lesson reflection) ─────────── */
function renderTeachBackPanel(file) {
  const lessonId = file.id;
  const stored = state.teachBack[lessonId] || [];
  const lastEntry = stored[0];

  const panel = document.createElement('section');
  panel.className = 'teachback-panel';
  panel.innerHTML = `
    <div class="study-aid-label">🗣 جلسة تدريس</div>
    <h3>اشرح هذا الدرس كأنك تعلّمه</h3>
    <p>الاختبار الحقيقي للفهم: قدرتك على شرحه لشخص آخر. اختر جمهوراً واحداً وتدرّب.</p>
    <div class="teachback-roles">
      <label><input type="radio" name="tb-role" value="مستخدم جديد على النظام" checked> مستخدم جديد</label>
      <label><input type="radio" name="tb-role" value="مدير مالي غير تقني"> مدير مالي</label>
      <label><input type="radio" name="tb-role" value="مشغّل خط إنتاج"> مشغّل إنتاج</label>
      <label><input type="radio" name="tb-role" value="مدير المشروع"> مدير مشروع</label>
    </div>
    <textarea data-teachback-text placeholder="اشرح من ذاكرتك. لا تفتح نص الدرس..."></textarea>
    <div class="teachback-actions">
      <button data-teachback-record class="teachback-record">🎙️ ابدأ التسجيل</button>
      <span data-teachback-rec-status class="teachback-rec-status"></span>
      <button data-teachback-save class="teachback-save">حفظ وقياس التغطية</button>
    </div>
    ${lastEntry ? `
      <div class="teachback-last">
        <strong>آخر شرح (${escapeHtml(lastEntry.role || '')}):</strong>
        <span>${formatDueDate(lastEntry.at)} — تغطية: ${lastEntry.coverage?.pct ?? 0}%</span>
        <div class="teachback-last-audio" data-teachback-last-audio>${lastEntry.audioId ? 'جار تحميل التسجيل...' : 'لا يوجد تسجيل صوتي محفوظ مع آخر شرح'}</div>
      </div>
    ` : ''}
    <div data-teachback-result></div>
  `;

  // Recording
  let mediaRecorder = null;
  let chunks = [];
  let audioBlob = null;
  let audioBlobUrl = null;
  const recBtn = panel.querySelector('[data-teachback-record]');
  const recStatus = panel.querySelector('[data-teachback-rec-status]');

  recBtn.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      return;
    }
    if (!navigator.mediaDevices) {
      recStatus.textContent = 'التسجيل غير مدعوم في هذا المتصفح';
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.addEventListener('dataavailable', e => chunks.push(e.data));
      mediaRecorder.addEventListener('stop', () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        audioBlob = blob;
        if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
        audioBlobUrl = URL.createObjectURL(blob);
        recStatus.innerHTML = `تم التسجيل · <audio controls src="${audioBlobUrl}"></audio>`;
        recBtn.textContent = '🎙️ ابدأ التسجيل';
        stream.getTracks().forEach(t => t.stop());
      });
      mediaRecorder.start();
      recBtn.textContent = '⏹ إيقاف التسجيل';
      recStatus.textContent = 'تسجيل جارٍ...';
    } catch (err) {
      recStatus.textContent = 'تم رفض إذن الميكروفون';
    }
  });

  panel.querySelector('[data-teachback-save]').addEventListener('click', async () => {
    const text = panel.querySelector('[data-teachback-text]').value.trim();
    const role = panel.querySelector('input[name="tb-role"]:checked')?.value || '';
    if (!text) {
      panel.querySelector('[data-teachback-result]').innerHTML = '<div class="teachback-warn">اكتب الشرح أولاً.</div>';
      return;
    }

    let audioId = null;
    if (audioBlob) {
      audioId = await saveTeachBackAudioBlob(lessonId, audioBlob);
    }

    const coverage = computeBlurtCoverage(file, text);
    const entry = {
      role,
      text,
      audioId,
      coverage,
      at: new Date().toISOString(),
    };

    const previousEntries = state.teachBack[lessonId] || [];
    const nextEntries = [entry, ...previousEntries].slice(0, 5);
    const removedEntries = previousEntries.slice(4);
    state.teachBack[lessonId] = nextEntries;
    store.set('teachBack', state.teachBack);

    removedEntries.forEach((removedEntry) => {
      if (removedEntry?.audioId) {
        deleteTeachBackAudio(removedEntry.audioId);
      }
    });

    const msg = coverage.pct >= 70 ? 'شرح متين ✓' : coverage.pct >= 40 ? 'بداية جيدة، أعد المحاولة لتقوية التغطية.' : 'الشرح يحتاج تعزيز — راجع الدرس ثم أعد.';
    panel.querySelector('[data-teachback-result]').innerHTML = `
      <div class="teachback-coverage">
        <strong>${coverage.pct}%</strong> ${escapeHtml(msg)}
        <div class="teachback-save-note">${audioId ? 'تم حفظ التسجيل الصوتي داخل التطبيق مع هذا الشرح.' : 'تم حفظ الشرح النصي. إذا سجلت صوتًا قبل الحفظ فسيُخزن داخل التطبيق.'}</div>
        ${coverage.missed.length ? `
          <div class="teachback-missed">
            <span>مفاهيم لم تذكرها:</span>
            ${coverage.missed.slice(0, 10).map(t => `<span class="blurt-missed-chip">${escapeHtml(t)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;
  });

  if (lastEntry?.audioId) {
    hydrateTeachBackAudio(panel, lastEntry);
  }

  return panel;
}

/* ─── Confusion Pairs Detector ────────────────────────────── */
function termsInText(text) {
  if (!text || !state.glossaryTerms.length) return [];
  const lower = text.toLowerCase();
  const seen = new Set();
  const out = [];
  state.glossaryTerms.forEach(t => {
    [t.english, t.arabic, ...(t.aliases || [])]
      .map(v => String(v || '').trim())
      .filter(v => v.length >= 3)
      .forEach(v => {
        if (seen.has(t.id)) return;
        if (lower.includes(v.toLowerCase())) { seen.add(t.id); out.push(t); }
      });
  });
  return out;
}

function recordConfusionFromMistake(prompt) {
  const terms = termsInText(prompt);
  if (terms.length < 2) return;
  for (let i = 0; i < terms.length; i++) {
    for (let j = i + 1; j < terms.length; j++) {
      const [a, b] = [terms[i].id, terms[j].id].sort();
      const key = `${a}|${b}`;
      state.confusionPairs[key] = (state.confusionPairs[key] || 0) + 1;
    }
  }
  store.set('confusionPairs', state.confusionPairs);
}

function detectedConfusionPairs(minCount = 2) {
  return Object.entries(state.confusionPairs)
    .filter(([, count]) => count >= minCount)
    .map(([key, count]) => {
      const [aId, bId] = key.split('|');
      const a = state.glossaryTerms.find(t => t.id === aId);
      const b = state.glossaryTerms.find(t => t.id === bId);
      return a && b ? { a, b, count, key } : null;
    })
    .filter(Boolean)
    .sort((x, y) => y.count - x.count);
}

function renderConfusionSection() {
  const pairs = detectedConfusionPairs();
  if (!pairs.length) return '';
  return `
    <div class="confusion-section">
      <h2>🔀 خلطات مكتشفة</h2>
      <p>هذه الأزواج ظهرت في أسئلة أخطأت فيها — يبدو أنك تخلط بينها.</p>
      <div class="confusion-list">
        ${pairs.slice(0, 5).map(p => `
          <div class="confusion-pair">
            <div class="confusion-terms">
              <strong>${escapeHtml(p.a.arabic)}</strong>
              <span>↔</span>
              <strong>${escapeHtml(p.b.arabic)}</strong>
              <span class="confusion-count">${p.count}× خلط</span>
            </div>
            <button data-open-compare-pair="${p.a.id}|${p.b.id}">قارن في Compare ⚖️</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ─── Retention Heat-Map ──────────────────────────────────── */
function lessonRetention(lessonId) {
  const lessonState = state.lessonState[lessonId] || {};
  const base = lessonState.selfRating === 'high' ? 1.0
            : lessonState.selfRating === 'medium' ? 0.6
            : lessonState.selfRating === 'low' ? 0.25
            : 0;
  if (!base) return { score: 0, label: 'لم يُدرس' };

  const queueItem = state.reviewQueue[lessonId];
  const lastTouchIso = queueItem?.updatedAt || lessonState.updatedAt;
  const daysSince = lastTouchIso ? (Date.now() - Date.parse(lastTouchIso)) / 86400000 : 0;
  const score = base * Math.exp(-daysSince / 14);
  let label;
  if (score >= 0.7) label = 'قوي';
  else if (score >= 0.4) label = 'هشّ';
  else label = 'ينسى';
  return { score, label };
}

function renderRetentionHeatmap() {
  const sections = sourceSections().filter(s => s.files.some(f => f.trackable && (f.type === 'lesson' || !f.type)));
  if (!sections.length) return '';
  return `
    <section class="heatmap-section">
      <div class="section-title-row">
        <h2>🗺️ خريطة الحفظ</h2>
        <span>أخضر = قوي · أصفر = هشّ · أحمر = ينسى · رمادي = لم يُدرس</span>
      </div>
      <div class="heatmap-grid">
        ${sections.map(s => {
          const lessons = s.files.filter(f => f.trackable && (f.type === 'lesson' || !f.type));
          return `
            <div class="heatmap-row">
              <div class="heatmap-label">${escapeHtml(s.title)}</div>
              <div class="heatmap-cells">
                ${lessons.map(l => {
                  const r = lessonRetention(l.id);
                  const cls = r.score === 0 ? 'cell-none'
                            : r.score >= 0.7 ? 'cell-strong'
                            : r.score >= 0.4 ? 'cell-fragile'
                            : 'cell-fading';
                  return `<button class="heatmap-cell ${cls}" title="${escapeHtml(l.title)} — ${r.label}" data-open-lesson="${l.id}"></button>`;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

/* ─── Pre-Sleep Mode ──────────────────────────────────────── */
function showPreSleepMode() {
  clearReaderContext('وضع ما قبل النوم', 'مراجعة هادئة قبل النوم');
  document.body.classList.add('pre-sleep');

  // Pick 5 short summaries from cheatsheets (most-studied sections)
  const studiedLessons = allTrackable()
    .filter(item => state.lessonState[item.id]?.selfRating)
    .sort((a, b) => Date.parse(state.lessonState[b.id]?.updatedAt || 0) - Date.parse(state.lessonState[a.id]?.updatedAt || 0))
    .slice(0, 5);

  const summaries = studiedLessons.map(lesson => {
    const sheet = state.cheatSheets.find(s => s.lessons.some(l => l.id === lesson.id));
    const lessonSheet = sheet?.lessons.find(l => l.id === lesson.id);
    return {
      title: lesson.title,
      summary: lessonSheet?.summary || lessonSheet?.keyPoints?.[0]?.text || '',
    };
  }).filter(s => s.summary);

  const easyCards = state.flashcards
    .filter(c => {
      const cs = state.cardState[c.id];
      return cs?.lastResult === 'easy';
    })
    .slice(0, 5);

  $content.innerHTML = `
    <div class="presleep-view">
      <button class="presleep-exit" data-presleep-exit>✕ خروج</button>
      <div class="presleep-moon">🌙</div>
      <h1>مراجعة ما قبل النوم</h1>
      <p>تنفّس. هذه مراجعة هادئة — لا أزرار، لا اختبارات. فقط تثبيت قبل النوم.</p>

      <section>
        <h2>5 أفكار مفتاحية</h2>
        ${summaries.length ? summaries.map((s, i) => `
          <div class="presleep-summary">
            <span class="presleep-num">${i + 1}</span>
            <div>
              <strong>${escapeHtml(s.title)}</strong>
              <p>${escapeHtml(s.summary)}</p>
            </div>
          </div>
        `).join('') : `<p class="empty-queue">ادرس عدة دروس أولاً ليظهر ملخصها هنا.</p>`}
      </section>

      ${easyCards.length ? `
        <section>
          <h2>5 بطاقات تتقنها</h2>
          ${easyCards.map(c => `
            <div class="presleep-card">
              <span>${escapeHtml(c.front.slice(0, 80))}${c.front.length > 80 ? '...' : ''}</span>
              <strong>${escapeHtml(c.back)}</strong>
            </div>
          `).join('')}
        </section>
      ` : ''}

      <div class="presleep-footer">طابت ليلتك 💤</div>
    </div>
  `;
  $content.querySelector('[data-presleep-exit]').addEventListener('click', () => {
    document.body.classList.remove('pre-sleep');
    showDashboard();
  });
}

/* ─── Two-Pass Reading ────────────────────────────────────── */
function isTwoPassActive(fileId) {
  return !!state.twoPassLessons[fileId];
}

function applyTwoPass(file) {
  const article = $content;
  if (!isTwoPassActive(file.id)) {
    article.classList.remove('two-pass-mode');
    article.querySelectorAll('[data-two-pass-original]').forEach(p => {
      p.innerHTML = p.dataset.twoPassOriginal;
      delete p.dataset.twoPassOriginal;
    });
    return;
  }
  article.classList.add('two-pass-mode');
  // Truncate paragraphs to first sentence
  const paragraphs = article.querySelectorAll('p');
  paragraphs.forEach(p => {
    if (p.closest('.study-aids, .lesson-reflection, .why-prompt, .teachback-panel, .blurt-panel')) return;
    if (p.dataset.twoPassOriginal) return;
    const html = p.innerHTML;
    const text = p.textContent.trim();
    if (text.length < 80) return; // small paragraphs already concise
    const match = text.match(/^(.*?[\.\!\?؟])\s/);
    const firstSentence = match ? match[1] : text.slice(0, 90) + '…';
    p.dataset.twoPassOriginal = html;
    p.innerHTML = `<span class="two-pass-first">${escapeHtml(firstSentence)}</span> <span class="two-pass-hint">[…]</span>`;
  });
}

function toggleTwoPass() {
  if (!state.currentFileId) return;
  state.twoPassLessons[state.currentFileId] = !state.twoPassLessons[state.currentFileId];
  if (!state.twoPassLessons[state.currentFileId]) delete state.twoPassLessons[state.currentFileId];
  store.set('twoPassLessons', state.twoPassLessons);
  const file = findById(state.currentFileId);
  if (file) {
    applyTwoPass(file);
    updateTwoPassButton(file.id);
  }
}

function updateTwoPassButton(fileId) {
  const btn = $('btn-two-pass');
  if (!btn) return;
  if (isTwoPassActive(fileId)) {
    btn.classList.add('active');
    btn.textContent = '👁 إظهار الكل';
  } else {
    btn.classList.remove('active');
    btn.textContent = '👀 تمريرة';
  }
}

/* ─── 7-day Streak Calendar ───────────────────────────────── */
function renderStreakCalendar() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push(d);
  }
  const lastAt = state.dailyStreak?.lastAt;
  const streakDays = state.dailyStreak?.count || 0;
  // Mark days based on streak count and last-done date
  const lastDate = lastAt ? new Date(lastAt) : null;
  return `
    <section class="streak-calendar-section">
      <div class="section-title-row">
        <h2>🔥 آخر 7 أيام</h2>
        <span>إجمالي السلسلة: ${streakDays} ${streakDays === 1 ? 'يوم' : 'أيام'}</span>
      </div>
      <div class="streak-calendar">
        ${days.map(d => {
          let done = false;
          if (lastDate && streakDays > 0) {
            const diff = Math.floor((lastDate - d) / 86400000);
            done = diff >= 0 && diff < streakDays;
          }
          const isToday = d.toDateString() === now.toDateString();
          return `
            <div class="streak-day ${done ? 'done' : ''} ${isToday ? 'today' : ''}">
              <span class="streak-day-name">${['أحد','اثن','ثلا','أرب','خمي','جمع','سبت'][d.getDay()]}</span>
              <span class="streak-day-num">${d.getDate()}</span>
              <span class="streak-day-mark">${done ? '✓' : ''}</span>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

/* ─── Why-Prompts: inline elaborative interrogation ───────── */
const WHY_PROMPTS = [
  'لماذا هذا المفهوم مهم؟ ماذا يحدث لو غاب أو طُبّق خطأً؟',
  'كيف يرتبط هذا بما قرأته قبل قليل؟ أين ستراه في الواقع؟',
  'لو شرحت هذه الفكرة لزميل جديد بسطرين، ماذا ستقول؟',
  'ما المثال العملي الأقرب من تجربتك؟ وما الفرق الذي يصنعه هذا المفهوم في القرار؟',
  'ما الذي يجب أن تتذكره من هذه الفقرة بعد أسبوع؟',
];

function injectWhyPrompts(file) {
  if ((file.type || file.docType) !== 'lesson') return;
  const h2List = Array.from($content.querySelectorAll('h2'));
  if (h2List.length < 2) return;

  // Inject after every 2nd H2 (skipping the very first), to avoid noise.
  const targets = h2List.filter((_, i) => i > 0 && i % 2 === 1).slice(0, 3);
  const lessonState = getLessonState(file.id);
  const savedWhy = lessonState.whyAnswers || {};

  targets.forEach((h2, idx) => {
    const promptText = WHY_PROMPTS[idx % WHY_PROMPTS.length];
    const slot = `${file.id}-${idx}`;
    const card = document.createElement('aside');
    card.className = 'why-prompt';
    card.innerHTML = `
      <div class="why-header">
        <span class="why-icon">💡</span>
        <strong>توقف وفكّر — لماذا؟</strong>
      </div>
      <p class="why-text">${escapeHtml(promptText)}</p>
      <details class="why-details" ${savedWhy[slot] ? 'open' : ''}>
        <summary>اكتب إجابتك (يحفظ تلقائياً)</summary>
        <textarea data-why-slot="${slot}" placeholder="جملتان من ذاكرتك، لا بأس بالأخطاء.">${escapeHtml(savedWhy[slot] || '')}</textarea>
      </details>
    `;
    // Insert AFTER the heading and any directly-following sibling block
    const insertAfter = h2.nextElementSibling || h2;
    insertAfter.after(card);
  });

  // Auto-save on blur
  $content.querySelectorAll('[data-why-slot]').forEach(textarea => {
    textarea.addEventListener('blur', () => {
      const slot = textarea.dataset.whySlot;
      const map = { ...(getLessonState(file.id).whyAnswers || {}) };
      const val = textarea.value.trim();
      if (val) map[slot] = val;
      else delete map[slot];
      saveLessonState(file.id, { whyAnswers: map });
    });
  });
}

/* ─── Cheat Sheets screen ─────────────────────────────────── */
function showCheatSheets(sectionId = null) {
  clearReaderContext('ورقة المراجعة السريعة', `${state.cheatSheets.length} ورقة`);
  renderCheatSheetsHome(sectionId);
}

function renderCheatSheetsHome(activeSectionId) {
  if (!state.cheatSheets.length) {
    $content.innerHTML = `
      <div class="cheatsheets-view">
        <h1>ورقة المراجعة السريعة</h1>
        <p class="empty-queue">لم تُولَّد أوراق بعد. شغّل: <code>npm run study:cheatsheets</code></p>
      </div>
    `;
    return;
  }

  const active = activeSectionId
    ? state.cheatSheets.find(s => s.sectionId === activeSectionId)
    : state.cheatSheets[0];

  $content.innerHTML = `
    <div class="cheatsheets-view">
      <div class="cheatsheet-toolbar no-print">
        <div class="cheatsheet-tabs">
          ${state.cheatSheets.map(s => `
            <button data-sheet-id="${s.sectionId}" class="${s.sectionId === active.sectionId ? 'active' : ''}">
              ${s.badge ? `<span class="sheet-badge">${s.badge}</span>` : ''}
              ${escapeHtml(s.title)}
            </button>
          `).join('')}
        </div>
        <button class="cheatsheet-print" data-print-sheet>🖨️ طباعة</button>
      </div>
      <article class="cheatsheet" id="printable-sheet">
        ${renderCheatSheetHTML(active)}
      </article>
    </div>
  `;

  $content.querySelectorAll('[data-sheet-id]').forEach(btn => {
    btn.addEventListener('click', () => renderCheatSheetsHome(btn.dataset.sheetId));
  });
  $content.querySelector('[data-print-sheet]')?.addEventListener('click', () => window.print());
  $content.querySelector('[data-open-part-scenarios]')?.addEventListener('click', e => {
    showScenariosForPart(e.currentTarget.dataset.openPartScenarios);
  });
}

function showScenariosForPart(partId) {
  state.scenarioFilters = { part: partId, timing: 'all', type: 'all' };
  store.set('scenarioFilters', state.scenarioFilters);
  showScenarios();
}

function renderCheatSheetHTML(sheet) {
  const color = sheet.color || 'var(--primary)';
  const scenariosForPart = state.scenarios?.filter(s => s.partId === sheet.sectionId).length || 0;
  return `
    <header class="cheatsheet-header" style="border-right-color:${color}">
      <div>
        <h1>${escapeHtml(sheet.title)}</h1>
        <span>${sheet.lessonCount} دروس · ${sheet.terms.length} مصطلح · ${sheet.comparisons.length} مقارنة</span>
      </div>
      ${scenariosForPart > 0 ? `
        <button class="open-part-scenarios no-print" data-open-part-scenarios="${sheet.sectionId}">
          🎬 ${scenariosForPart} سيناريو لهذا الجزء
        </button>
      ` : ''}
    </header>

    <section class="cheatsheet-grid">
      <div class="cheatsheet-col">
        <h2>أهم النقاط</h2>
        ${sheet.lessons.map(lesson => `
          <div class="cheatsheet-lesson">
            <h3>${escapeHtml(lesson.title)}</h3>
            ${lesson.summary ? `<p class="cheatsheet-summary">${escapeHtml(lesson.summary)}</p>` : ''}
            ${lesson.keyPoints.length ? `
              <ul>
                ${lesson.keyPoints.map(kp => `<li>${escapeHtml(kp.text)}</li>`).join('')}
              </ul>
            ` : ''}
            ${lesson.subheadings.length ? `
              <div class="cheatsheet-subheads">${lesson.subheadings.map(sh => `<span>${escapeHtml(sh)}</span>`).join('')}</div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      <aside class="cheatsheet-side">
        ${sheet.terms.length ? `
          <h2>مصطلحات أساسية</h2>
          <dl class="cheatsheet-terms">
            ${sheet.terms.map(t => `
              <dt>${escapeHtml(t.ar)} <span>· ${escapeHtml(t.en)}</span></dt>
              ${t.def ? `<dd>${escapeHtml(t.def)}</dd>` : ''}
            `).join('')}
          </dl>
        ` : ''}

        ${sheet.comparisons.length ? `
          <h2>الأنظمة (Dynamics / Oracle / SAP)</h2>
          <table class="cheatsheet-compare">
            <thead><tr><th>المفهوم</th><th>D365</th><th>Oracle</th><th>SAP</th></tr></thead>
            <tbody>
              ${sheet.comparisons.map(r => `
                <tr>
                  <td><strong>${escapeHtml(r.concept || '')}</strong></td>
                  <td>${escapeHtml(r.dynamics || '—')}</td>
                  <td>${escapeHtml(r.oracle || '—')}</td>
                  <td>${escapeHtml(r.sap || '—')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </aside>
    </section>
  `;
}

/* ─── Concept Graph (Mind Map) ────────────────────────────── */
function showMindMap(focusAtomId = null) {
  clearReaderContext('خريطة المفاهيم', `${state.concepts.atoms.length} مفهوم`);
  renderMindMap(focusAtomId);
}

function neighborsOf(atomId) {
  return state.concepts.edges
    .filter(e => e.from === atomId || e.to === atomId)
    .map(e => ({
      atomId: e.from === atomId ? e.to : e.from,
      weight: e.weight,
      sources: e.sources,
    }))
    .sort((a, b) => b.weight - a.weight);
}

function findAtomById(id) {
  return state.concepts.atoms.find(a => a.id === id);
}

function renderMindMap(focusAtomId) {
  const atoms = state.concepts.atoms;
  if (!atoms.length) {
    $content.innerHTML = `
      <div class="mindmap-view">
        <h1>خريطة المفاهيم</h1>
        <p class="empty-queue">لم تُولَّد بيانات الخريطة بعد. شغّل: <code>npm run study:concepts</code></p>
      </div>
    `;
    return;
  }

  // Pick most-mentioned atom by default
  const focusId = focusAtomId
    || [...atoms].sort((a, b) => (b.mentions || 0) - (a.mentions || 0))[0]?.id;
  const focus = findAtomById(focusId);
  const neighbors = focus ? neighborsOf(focus.id).slice(0, 10) : [];

  const categories = [...new Set(atoms.map(a => a.category || 'أخرى'))];

  $content.innerHTML = `
    <div class="mindmap-view">
      <div class="mindmap-header">
        <div>
          <h1>خريطة المفاهيم</h1>
          <p>اختر مفهوماً لرؤية ما يرتبط به في الكتاب.</p>
        </div>
        <div class="mindmap-stats">
          <strong>${atoms.length}</strong> مفهوم · <strong>${state.concepts.edges.length}</strong> علاقة
        </div>
      </div>

      <div class="mindmap-search">
        <input type="search" data-mindmap-search placeholder="ابحث عن مفهوم..." autocomplete="off">
      </div>

      <div class="mindmap-canvas-wrap">
        ${renderMindMapSVG(focus, neighbors)}
      </div>

      <div class="mindmap-detail">
        <h2>${escapeHtml(focus?.arabic || '')} <span class="mindmap-detail-en">· ${escapeHtml(focus?.english || '')}</span></h2>
        <p class="mindmap-detail-def">${escapeHtml(focus?.definition || 'لا يوجد تعريف.')}</p>
        ${neighbors.length ? `
          <h3>المفاهيم المرتبطة (${neighbors.length})</h3>
          <div class="mindmap-neighbors">
            ${neighbors.map(n => {
              const a = findAtomById(n.atomId);
              return a ? `<button class="mindmap-neighbor" data-focus-atom="${a.id}" style="--w:${Math.min(1, n.weight / 10)}">
                <strong>${escapeHtml(a.arabic)}</strong>
                <span>${escapeHtml(a.english)}</span>
                <em>قوة: ${n.weight}</em>
              </button>` : '';
            }).join('')}
          </div>
        ` : '<p class="empty-queue">لا توجد علاقات مسجلة لهذا المفهوم.</p>'}
      </div>

      <div class="mindmap-categories">
        <h3>تصفّح حسب الفئة</h3>
        ${categories.map(cat => {
          const inCat = atoms.filter(a => (a.category || 'أخرى') === cat);
          return `
            <details class="mindmap-cat">
              <summary>${escapeHtml(cat)} (${inCat.length})</summary>
              <div class="mindmap-cat-list">
                ${inCat.map(a => `
                  <button class="mindmap-atom-chip ${a.id === focus?.id ? 'active' : ''}" data-focus-atom="${a.id}">
                    ${escapeHtml(a.arabic)} <span>${escapeHtml(a.english)}</span>
                  </button>
                `).join('')}
              </div>
            </details>
          `;
        }).join('')}
      </div>
    </div>
  `;

  $content.querySelectorAll('[data-focus-atom]').forEach(btn => {
    btn.addEventListener('click', () => renderMindMap(btn.dataset.focusAtom));
  });

  const search = $content.querySelector('[data-mindmap-search]');
  if (search) {
    search.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) return;
      const found = atoms.find(a =>
        (a.arabic || '').toLowerCase().includes(q) ||
        (a.english || '').toLowerCase().includes(q));
      if (found) renderMindMap(found.id);
    });
  }
}

function renderMindMapSVG(focus, neighbors) {
  if (!focus) return '';
  const W = 600, H = 400, cx = W / 2, cy = H / 2;
  const radius = Math.min(150, 80 + neighbors.length * 6);

  const nodes = neighbors.map((n, i) => {
    const angle = (i / Math.max(1, neighbors.length)) * Math.PI * 2 - Math.PI / 2;
    return {
      ...n,
      atom: findAtomById(n.atomId),
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });

  return `
    <svg viewBox="0 0 ${W} ${H}" class="mindmap-svg" preserveAspectRatio="xMidYMid meet">
      ${nodes.map(n => `
        <line x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}"
              stroke="var(--primary)" stroke-opacity="${Math.min(0.7, 0.15 + n.weight * 0.06)}"
              stroke-width="${Math.max(1, Math.min(4, n.weight / 2))}" />
      `).join('')}
      <circle cx="${cx}" cy="${cy}" r="46" fill="var(--primary)" />
      <text x="${cx}" y="${cy - 4}" text-anchor="middle" fill="#fff" font-size="13" font-weight="700" font-family="var(--font)">${escapeHtml(focus.arabic.slice(0, 14))}</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="#fff" font-size="10" opacity="0.85" font-family="var(--font)">${escapeHtml((focus.english || '').slice(0, 18))}</text>
      ${nodes.map(n => n.atom ? `
        <g class="mindmap-node" data-focus-atom="${n.atom.id}" style="cursor:pointer">
          <circle cx="${n.x}" cy="${n.y}" r="30" fill="var(--surface)" stroke="var(--primary)" stroke-width="1.5" />
          <text x="${n.x}" y="${n.y - 2}" text-anchor="middle" fill="var(--text)" font-size="10" font-weight="600" font-family="var(--font)">${escapeHtml(n.atom.arabic.slice(0, 10))}</text>
          <text x="${n.x}" y="${n.y + 10}" text-anchor="middle" fill="var(--text-muted)" font-size="8" font-family="var(--font)">${escapeHtml((n.atom.english || '').slice(0, 14))}</text>
        </g>
      ` : '').join('')}
    </svg>
  `;
}

/* ─── Compare Panel (two concepts side-by-side) ───────────── */
function showComparePanel(leftId = null, rightId = null) {
  clearReaderContext('مقارنة المفاهيم', 'اختر مفهومين للمقارنة');
  state.compareSelection = { left: leftId, right: rightId };
  renderComparePanel();
}

function renderComparePanel() {
  const atoms = state.concepts.atoms;
  if (!atoms.length) {
    $content.innerHTML = `<div class="compare-view"><h1>مقارنة المفاهيم</h1><p class="empty-queue">شغّل <code>npm run study:concepts</code> أولاً.</p></div>`;
    return;
  }

  const { left: leftId, right: rightId } = state.compareSelection || {};
  const left = leftId ? findAtomById(leftId) : null;
  const right = rightId ? findAtomById(rightId) : null;

  const sharedSources = left && right
    ? sharedEdgeSources(leftId, rightId)
    : [];

  const sharedSystemRows = left && right
    ? findSystemRowsForBoth(left, right)
    : [];

  $content.innerHTML = `
    <div class="compare-view">
      <div class="compare-header">
        <h1>قارن مفهومين جنباً إلى جنب</h1>
        <p>المقارنة تجبر الذهن على التمييز بدل الحفظ المنعزل — أقوى أداة ضد الخلط بين المفاهيم.</p>
      </div>

      <div class="compare-selectors">
        ${renderAtomSelect('left', leftId)}
        <div class="compare-vs">×</div>
        ${renderAtomSelect('right', rightId)}
      </div>

      ${left && right ? `
        <div class="compare-grid">
          ${renderCompareColumn(left, 'left')}
          ${renderCompareColumn(right, 'right')}
        </div>

        <div class="compare-shared">
          <h3>قواسم مشتركة</h3>
          <div class="compare-shared-row">
            <div>
              <strong>الدروس التي تذكرهما معاً:</strong>
              ${sharedSources.length ? `
                <ul>
                  ${sharedSources.slice(0, 6).map(s => {
                    const f = findById(s);
                    return f ? `<li><button data-open-from-compare="${s}">${escapeHtml(f.title)}</button></li>` : '';
                  }).join('')}
                </ul>
              ` : '<p class="empty-queue">لم تُذكر في نفس الجملة في الكتاب.</p>'}
            </div>
            <div>
              <strong>مقارنات النظم المشتركة:</strong>
              ${sharedSystemRows.length ? `
                <ul>${sharedSystemRows.slice(0, 4).map(r => `<li>${escapeHtml(r.concept)}</li>`).join('')}</ul>
              ` : '<p class="empty-queue">لا توجد مقارنة مشتركة في جداول الأنظمة.</p>'}
            </div>
          </div>
        </div>

        <div class="compare-reflection">
          <h3>اشرح الفرق الجوهري بكلماتك</h3>
          <textarea data-compare-reflection placeholder="ما الذي يميز ${escapeHtml(left.arabic)} عن ${escapeHtml(right.arabic)} فعلاً؟ متى تستخدم كل منهما؟"></textarea>
          <button data-save-compare-reflection>حفظ الملاحظة</button>
          <span data-compare-saved class="compare-saved-msg"></span>
        </div>
      ` : `
        <div class="empty-queue compare-empty">
          <p>اختر مفهومين من القوائم أعلاه لبدء المقارنة.</p>
        </div>
      `}
    </div>
  `;

  $content.querySelectorAll('[data-compare-side]').forEach(sel => {
    sel.addEventListener('change', () => {
      const side = sel.dataset.compareSide;
      const next = { ...state.compareSelection };
      next[side] = sel.value || null;
      state.compareSelection = next;
      renderComparePanel();
    });
  });

  $content.querySelectorAll('[data-open-from-compare]').forEach(btn => {
    btn.addEventListener('click', () => loadFile(btn.dataset.openFromCompare));
  });

  const saveBtn = $content.querySelector('[data-save-compare-reflection]');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const text = $content.querySelector('[data-compare-reflection]').value.trim();
      if (!text) return;
      const key = `compare:${leftId}|${rightId}`;
      const stash = store.get('compareNotes', {});
      stash[key] = { text, at: new Date().toISOString() };
      store.set('compareNotes', stash);
      const msg = $content.querySelector('[data-compare-saved]');
      msg.textContent = 'تم الحفظ ✓';
      setTimeout(() => { msg.textContent = ''; }, 1800);
    });
  }
}

function renderAtomSelect(side, currentId) {
  const atoms = [...state.concepts.atoms].sort((a, b) => (a.arabic || '').localeCompare(b.arabic || '', 'ar'));
  return `
    <select data-compare-side="${side}" class="compare-select">
      <option value="">— اختر مفهوماً —</option>
      ${atoms.map(a => `
        <option value="${a.id}" ${a.id === currentId ? 'selected' : ''}>
          ${escapeHtml(a.arabic)} · ${escapeHtml(a.english)}
        </option>
      `).join('')}
    </select>
  `;
}

function renderCompareColumn(atom, side) {
  const neighbors = neighborsOf(atom.id).slice(0, 5);
  return `
    <div class="compare-col compare-${side}">
      <div class="compare-col-head">
        <h2>${escapeHtml(atom.arabic)}</h2>
        <span>${escapeHtml(atom.english)}</span>
      </div>
      <dl>
        <dt>الفئة</dt>
        <dd>${escapeHtml(atom.category || '—')}</dd>
        <dt>التعريف</dt>
        <dd>${escapeHtml(atom.definition || '—')}</dd>
        <dt>الإشارات في الكتاب</dt>
        <dd>${atom.mentions || 0} جملة</dd>
        <dt>أهم 5 مفاهيم مرتبطة</dt>
        <dd>${neighbors.length ? neighbors.map(n => {
          const a = findAtomById(n.atomId);
          return a ? `<span class="compare-related">${escapeHtml(a.arabic)}</span>` : '';
        }).join(' · ') : '—'}</dd>
      </dl>
    </div>
  `;
}

function sharedEdgeSources(aId, bId) {
  const edge = state.concepts.edges.find(e =>
    (e.from === aId && e.to === bId) || (e.from === bId && e.to === aId));
  return edge ? edge.sources : [];
}

function findSystemRowsForBoth(left, right) {
  const variants = atom => [atom.arabic, atom.english].filter(Boolean).map(v => v.toLowerCase());
  const lvars = variants(left);
  const rvars = variants(right);
  const rows = [];
  state.systemComparisons.forEach(table => {
    (table.rows || []).forEach(row => {
      const text = [row.concept, row.dynamics, row.oracle, row.sap]
        .filter(Boolean).join(' ').toLowerCase();
      const hasL = lvars.some(v => text.includes(v));
      const hasR = rvars.some(v => text.includes(v));
      if (hasL && hasR) rows.push(row);
    });
  });
  return rows;
}

async function loadFile(fileId) {
  const file = findById(fileId);
  if (!file) return;

  // Save scroll of previous
  if (state.currentPath) {
    state.scrollPos[state.currentPath] = $content.scrollTop;
    store.set('scroll', state.scrollPos);
  }

  state.currentFileId = fileId;
  state.currentPath = file.path;
  store.set('last', fileId);
  updateNotesButton();

  setActiveInSidebar(fileId);
  updateDoneButton(fileId);
  updatePrevNext(fileId);
  updateBreadcrumb(fileId);
  updateContentMeta(file);
  syncReadingToolsLayout(fileId);

  // Update notes drawer if open
  if (!$noteDrw.classList.contains('hidden')) {
    showNotes(fileId);
  }

  // Show spinner
  $content.innerHTML = '<div class="loading-spinner">جار التحميل</div>';
  $lesNav.classList.remove('hidden');

  const url = contentBase() + encodePath(file.path);

  let text;
  if (state.contentCache[file.path]) {
    text = state.contentCache[file.path];
  } else {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      text = await res.text();
      state.contentCache[file.path] = text;
    } catch (err) {
      $content.innerHTML = `
        <div style="padding:2rem; text-align:center; color:var(--text-muted);">
          <p style="font-size:2rem;">⚠️</p>
          <p>تعذّر تحميل الملف</p>
          <p style="font-size:.8rem; margin-top:.5rem; direction:ltr;">${url}</p>
          <p style="font-size:.8rem; margin-top:.5rem;">تأكد من أن ملفات المحتوى موجودة في مجلد <strong>content/</strong></p>
        </div>`;
      return;
    }
  }

  // Render markdown
  $content.innerHTML = renderMarkdown(text);

  // Post-process Q&A spoilers
  processQA($content);
  applyHeadingAnchors(file);
  renderStudyAids(file);
  injectWhyPrompts(file);
  renderLessonReflection(file);
  applyGlossaryTooltips($content);
  applyTwoPass(file);
  updateTwoPassButton(file.id);

  // Restore scroll
  $content.scrollTop = state.scrollPos[file.path] || 0;
  updateReadingProgress();

  // On mobile: collapse sidebar after selection
  if (window.innerWidth <= 768) {
    setSidebar(false);
  }

  // Trigger background search indexing if not done
  if (!state.searchIndexReady) {
    scheduleSearchIndex();
  }
}

/* ─── Breadcrumb ───────────────────────────────────────────── */
function updateBreadcrumb(fileId) {
  const section = getSectionForItem(fileId);
  const file = findById(fileId);
  if (!section || !file) { $breadcrumb.textContent = ''; return; }
  $breadcrumb.textContent = `${section.title}  ›  ${file.title}`;
}

/* ─── Prev / Next navigation ───────────────────────────────── */
function updatePrevNext(fileId) {
  const idx = state.allItems.findIndex(f => f.id === fileId);
  $btnPrev.disabled = idx <= 0;
  $btnNext.disabled = idx >= state.allItems.length - 1;
}

$btnPrev.addEventListener('click', () => {
  const idx = state.allItems.findIndex(f => f.id === state.currentFileId);
  if (idx > 0) loadFile(state.allItems[idx - 1].id);
});

$btnNext.addEventListener('click', () => {
  const idx = state.allItems.findIndex(f => f.id === state.currentFileId);
  if (idx < state.allItems.length - 1) loadFile(state.allItems[idx + 1].id);
});

/* ─── Sidebar toggle ───────────────────────────────────────── */
function setSidebar(open) {
  state.sidebarOpen = open;
  $sidebar.classList.toggle('collapsed', !open);
  $main.classList.toggle('full-width', !open);
  store.set('sidebar', open);
}

$('btn-toggle-sidebar').addEventListener('click', () => setSidebar(!state.sidebarOpen));

function isMobileViewport() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function hasActiveReadingContext(fileId = state.currentFileId) {
  return !!findById(fileId);
}

function syncReadingToolsPlacement() {
  if (!$lessonTools) return;
  const target = isMobileViewport() ? $mobileReadingToolsSlot : $contentTopbar;
  if (!target || $lessonTools.parentElement === target) return;
  target.appendChild($lessonTools);
}

function updateReadingToolsVisibility(fileId = state.currentFileId) {
  const showTools = hasActiveReadingContext(fileId);
  if ($lessonTools) $lessonTools.classList.toggle('hidden', !showTools);
  if ($mobileReadingTools) $mobileReadingTools.classList.toggle('hidden', !showTools || !isMobileViewport());
}

function syncReadingToolsLayout(fileId = state.currentFileId) {
  syncReadingToolsPlacement();
  updateReadingToolsVisibility(fileId);
}

function setMobileTools(open) {
  document.body.classList.toggle('mobile-tools-open', !!open);
  if ($btnMobileTools) $btnMobileTools.setAttribute('aria-expanded', open ? 'true' : 'false');
}

$btnMobileTools?.addEventListener('click', event => {
  event.stopPropagation();
  setMobileTools(!document.body.classList.contains('mobile-tools-open'));
});

$topbarActions?.addEventListener('click', event => {
  if (!isMobileViewport()) return;
  if (event.target instanceof HTMLElement && event.target.closest('button')) {
    setMobileTools(false);
  }
});

document.addEventListener('click', event => {
  if (!isMobileViewport() || !document.body.classList.contains('mobile-tools-open')) return;
  const target = event.target;
  if (!(target instanceof Node)) return;
  if ($btnMobileTools?.contains(target) || $topbarActions?.contains(target)) return;
  setMobileTools(false);
});

window.addEventListener('resize', () => {
  if (!isMobileViewport()) setMobileTools(false);
  syncReadingToolsLayout();
});

/* ─── Dark mode ────────────────────────────────────────────── */
function setDark(on) {
  state.dark = on;
  document.body.classList.toggle('dark', on);
  document.body.classList.toggle('light', !on);
  $('btn-dark').textContent = on ? '☀️' : '🌙';
  store.set('dark', on);
}

$('btn-dark').addEventListener('click', () => setDark(!state.dark));

function setFontScale(value) {
  state.fontScale = Math.min(1.35, Math.max(0.85, Math.round(value * 100) / 100));
  document.documentElement.style.setProperty('--reader-scale', state.fontScale);
  store.set('fontScale', state.fontScale);
}

function setFocusMode(on) {
  state.focusMode = on;
  document.body.classList.toggle('focus-mode', on);
  if ($btnFocusMode) $btnFocusMode.classList.toggle('active', on);
  store.set('focusMode', on);
}

$btnFontSmaller?.addEventListener('click', () => setFontScale(state.fontScale - 0.05));
$btnFontLarger?.addEventListener('click', () => setFontScale(state.fontScale + 0.05));
$btnFocusMode?.addEventListener('click', () => setFocusMode(!state.focusMode));

/* ─── Notes ────────────────────────────────────────────────── */
const NOTE_TYPE_LABELS = {
  note: 'ملاحظة',
  question: 'سؤال',
};

const NOTE_STATUS_LABELS = {
  open: 'مفتوح',
  done: 'منتهي',
};

let notesViewState = {
  tab: 'create',
  scope: 'current',
  type: 'all',
  status: 'all',
  editingId: '',
  draftType: 'note',
  draftStatus: 'open',
  draftTitle: '',
  draftText: '',
  draftAudioId: '',
  draftAudioBlob: null,
  draftAudioUrl: '',
  draftAudioCleared: false,
  composerStatus: '',
  activeLessonId: '',
  isRecording: false,
  renderToken: 0,
};

let notesMediaRecorder = null;
let notesMediaStream = null;
let notesRecorderLessonId = '';

function persistNoteEntries() {
  state.noteEntries = normalizeNoteEntries(state.noteEntries).map((entry) => ({
    ...entry,
    lessonTitle: noteEntryLessonTitle(entry),
  }));
  store.set('noteEntries', state.noteEntries);
  updateNotesButton();
}

function noteEntryLessonTitle(entry) {
  return String(entry?.lessonTitle || findById(entry?.lessonId)?.title || 'درس غير معروف').trim();
}

function noteExcerpt(text, maxLength = 160) {
  const content = String(text || '').trim().replace(/\s+/g, ' ');
  if (!content) return '';
  return content.length > maxLength ? `${content.slice(0, maxLength).trim()}...` : content;
}

function openNoteEntriesCount(lessonId = '') {
  return state.noteEntries.filter((entry) => {
    if (normalizeNoteStatus(entry.status) !== 'open') return false;
    if (lessonId && entry.lessonId !== lessonId) return false;
    return true;
  }).length;
}

function updateNotesButton() {
  if (!$btnNotes) return;
  const countEl = $btnNotes.querySelector('[data-notes-count]');
  const currentLessonOpen = state.currentFileId ? openNoteEntriesCount(state.currentFileId) : 0;
  const totalOpen = openNoteEntriesCount();
  const visibleCount = state.currentFileId ? currentLessonOpen : totalOpen;
  if (countEl) {
    countEl.textContent = String(visibleCount);
    countEl.classList.toggle('has-items', visibleCount > 0);
  }
  $btnNotes.classList.toggle('active', !$noteDrw.classList.contains('hidden'));
  $btnNotes.classList.toggle('has-open-notes', totalOpen > 0);
  const title = state.currentFileId
    ? `دفتر الملاحظات والأسئلة • ${currentLessonOpen} مفتوح في هذا الدرس • ${totalOpen} إجمالاً`
    : `دفتر الملاحظات والأسئلة • ${totalOpen} عنصر مفتوح`;
  $btnNotes.title = title;
  $btnNotes.setAttribute('aria-label', title);
}

function noteSummaryLabel(entry) {
  const title = String(entry?.title || '').trim();
  if (title) return title;
  const excerpt = noteExcerpt(entry?.text || '', 72);
  return excerpt || (entry?.audioId ? 'تسجيل صوتي محفوظ' : 'عنصر بدون عنوان');
}

function formatNoteText(text) {
  const content = String(text || '').trim();
  if (!content) return '';
  return escapeHtml(content).replace(/\n/g, '<br>');
}

function lessonNoteEntries(lessonId) {
  return normalizeNoteEntries(state.noteEntries.filter((entry) => entry.lessonId === lessonId)).map((entry) => ({
    ...entry,
    lessonTitle: noteEntryLessonTitle(entry),
  }));
}

function summarizeLessonNotes(fileId, limit = 2) {
  const entries = lessonNoteEntries(fileId);
  const preferred = entries.filter((entry) => entry.status === 'open');
  const slice = (preferred.length ? preferred : entries).slice(0, limit);
  return slice.map((entry) => `${NOTE_TYPE_LABELS[entry.type]}: ${noteSummaryLabel(entry)}`).join(' | ');
}

function resetNoteDraft() {
  if (notesViewState.draftAudioUrl) {
    URL.revokeObjectURL(notesViewState.draftAudioUrl);
  }
  notesViewState = {
    ...notesViewState,
    tab: 'create',
    editingId: '',
    draftType: 'note',
    draftStatus: 'open',
    draftTitle: '',
    draftText: '',
    draftAudioId: '',
    draftAudioBlob: null,
    draftAudioUrl: '',
    draftAudioCleared: false,
  };
}

function loadNoteDraft(entry) {
  resetNoteDraft();
  notesViewState.tab = 'create';
  notesViewState.editingId = entry.id;
  notesViewState.draftType = normalizeNoteType(entry.type);
  notesViewState.draftStatus = normalizeNoteStatus(entry.status);
  notesViewState.draftTitle = String(entry.title || '');
  notesViewState.draftText = String(entry.text || '');
  notesViewState.draftAudioId = String(entry.audioId || '');
  notesViewState.composerStatus = 'يمكنك التعديل ثم الحفظ.';
}

function filteredNoteEntries(activeLessonId) {
  return normalizeNoteEntries(state.noteEntries)
    .map((entry) => ({
      ...entry,
      lessonTitle: noteEntryLessonTitle(entry),
    }))
    .filter((entry) => {
      if (notesViewState.scope === 'current' && activeLessonId && entry.lessonId !== activeLessonId) return false;
      if (notesViewState.scope === 'current' && !activeLessonId) return false;
      if (notesViewState.type !== 'all' && entry.type !== notesViewState.type) return false;
      if (notesViewState.status !== 'all' && entry.status !== notesViewState.status) return false;
      return true;
    });
}

function noteRecordingSupported() {
  return typeof navigator !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
    && typeof MediaRecorder !== 'undefined';
}

function stopNotesMediaStream() {
  if (!notesMediaStream) return;
  notesMediaStream.getTracks().forEach((track) => track.stop());
  notesMediaStream = null;
}

async function hydrateNoteAudioHost(host, audioId, token) {
  if (!host || !audioId) return;
  const audioUrl = await getNoteAudioUrl(audioId);
  if (!audioUrl || token !== notesViewState.renderToken) return;
  host.innerHTML = `
    <audio controls preload="metadata" src="${audioUrl}"></audio>
  `;
}

async function toggleNoteRecording(activeLessonId) {
  if (!noteRecordingSupported()) {
    notesViewState.composerStatus = 'تسجيل الصوت غير مدعوم على هذا الجهاز.';
    showNotes(activeLessonId);
    return;
  }

  if (notesMediaRecorder && notesMediaRecorder.state === 'recording') {
    notesMediaRecorder.stop();
    notesViewState.composerStatus = 'جار إنهاء التسجيل...';
    showNotes(activeLessonId);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    notesMediaStream = stream;
    notesRecorderLessonId = activeLessonId || state.currentFileId || '';
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    notesMediaRecorder = recorder;
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data?.size) chunks.push(event.data);
    });
    recorder.addEventListener('stop', () => {
      notesViewState.isRecording = false;
      stopNotesMediaStream();
      if (chunks.length) {
        if (notesViewState.draftAudioUrl) URL.revokeObjectURL(notesViewState.draftAudioUrl);
        notesViewState.draftAudioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        notesViewState.draftAudioUrl = URL.createObjectURL(notesViewState.draftAudioBlob);
        notesViewState.draftAudioId = '';
        notesViewState.draftAudioCleared = false;
        notesViewState.composerStatus = 'تم التقاط التسجيل. احفظ العنصر لتثبيته داخل التطبيق.';
      } else {
        notesViewState.composerStatus = 'لم يتم التقاط صوت واضح.';
      }
      notesMediaRecorder = null;
      showNotes(notesRecorderLessonId || state.currentFileId);
    });
    recorder.start();
    notesViewState.isRecording = true;
    notesViewState.composerStatus = 'جار التسجيل الآن...';
    showNotes(activeLessonId);
  } catch (error) {
    stopNotesMediaStream();
    notesMediaRecorder = null;
    notesViewState.isRecording = false;
    notesViewState.composerStatus = error instanceof Error ? error.message : 'تعذر الوصول إلى الميكروفون.';
    showNotes(activeLessonId);
  }
}

async function deleteNoteEntry(entryId) {
  const entry = state.noteEntries.find((item) => item.id === entryId);
  if (!entry) return;
  if (entry.audioId) {
    await deleteNoteAudio(entry.audioId);
  }
  state.noteEntries = state.noteEntries.filter((item) => item.id !== entryId);
  persistNoteEntries();
  if (notesViewState.editingId === entryId) resetNoteDraft();
  notesViewState.composerStatus = 'تم حذف العنصر.';
}

async function saveNoteDraft(activeLessonId) {
  const lessonId = activeLessonId || state.currentFileId || '';
  const lesson = findById(lessonId);
  if (!lessonId || !lesson) {
    notesViewState.composerStatus = 'افتح درسًا أولًا حتى تربط به الملاحظة أو السؤال.';
    showNotes(activeLessonId);
    return;
  }

  const title = String(notesViewState.draftTitle || '').trim();
  const text = String(notesViewState.draftText || '').trim();
  if (!title && !text && !notesViewState.draftAudioBlob && !notesViewState.draftAudioId) {
    notesViewState.composerStatus = 'اكتب نصًا أو سجّل صوتًا قبل الحفظ.';
    showNotes(activeLessonId);
    return;
  }

  const now = new Date().toISOString();
  const existingIndex = state.noteEntries.findIndex((entry) => entry.id === notesViewState.editingId);
  const existing = existingIndex >= 0 ? state.noteEntries[existingIndex] : null;
  const entryId = existing?.id || createClientId('note');
  let nextAudioId = notesViewState.draftAudioId || '';
  let existingAudioRemoved = false;

  if (notesViewState.draftAudioCleared && existing?.audioId) {
    await deleteNoteAudio(existing.audioId);
    existingAudioRemoved = true;
    nextAudioId = '';
  }

  if (notesViewState.draftAudioBlob) {
    if (existing?.audioId && !existingAudioRemoved) {
      await deleteNoteAudio(existing.audioId);
    }
    nextAudioId = await saveNoteAudioBlob(entryId, notesViewState.draftAudioBlob) || '';
  }

  const nextEntry = normalizeNoteEntry({
    id: entryId,
    lessonId,
    lessonTitle: lesson.title,
    type: notesViewState.draftType,
    status: notesViewState.draftStatus,
    title,
    text,
    audioId: nextAudioId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  });

  if (existingIndex >= 0) {
    state.noteEntries.splice(existingIndex, 1, nextEntry);
  } else {
    state.noteEntries.unshift(nextEntry);
  }

  persistNoteEntries();
  resetNoteDraft();
  notesViewState.composerStatus = existing ? 'تم تحديث العنصر.' : 'تم حفظ العنصر الجديد.';
  showNotes(lessonId);
}

function showNotes(fileId) {
  const activeLessonId = fileId || state.currentFileId || '';
  const file = findById(activeLessonId);
  notesViewState.activeLessonId = activeLessonId;
  if (!activeLessonId && notesViewState.scope === 'current') {
    notesViewState.scope = 'all';
  }

  const entries = filteredNoteEntries(activeLessonId);
  const currentLessonEntries = activeLessonId ? lessonNoteEntries(activeLessonId) : [];
  const totalOpenEntries = openNoteEntriesCount();
  const canAttachToCurrentLesson = !!file;
  const draftHasAudio = !!(notesViewState.draftAudioBlob || notesViewState.draftAudioId);
  const statusText = notesViewState.composerStatus || 'يمكنك حفظ نص أو تسجيل صوتي أو الاثنين معًا.';
  const currentTab = notesViewState.tab === 'history' ? 'history' : 'create';

  $noteFT.textContent = file
    ? `${file.title} • ${currentLessonEntries.length} عنصر`
    : `كل ملاحظاتك وأسئلتك • ${state.noteEntries.length} عنصر`;

  $noteBody.innerHTML = `
    <div class="notes-shell">
      <div class="notes-tabs" role="tablist" aria-label="أقسام دفتر الملاحظات">
        <button class="notes-tab ${currentTab === 'create' ? 'active' : ''}" data-notes-tab="create" role="tab" aria-selected="${currentTab === 'create' ? 'true' : 'false'}">
          <span>تسجيل جديد</span>
          <strong>${canAttachToCurrentLesson ? currentLessonEntries.length : state.noteEntries.length}</strong>
        </button>
        <button class="notes-tab ${currentTab === 'history' ? 'active' : ''}" data-notes-tab="history" role="tab" aria-selected="${currentTab === 'history' ? 'true' : 'false'}">
          <span>الرجوع إلى القديم</span>
          <strong>${entries.length}</strong>
        </button>
      </div>

      <div class="notes-panel">
        ${currentTab === 'create' ? `
          <section class="notes-panel-scroller">
            <div class="notes-summary-grid">
              <div class="notes-summary-card">
                <span>الدرس الحالي</span>
                <strong>${escapeHtml(file?.title || 'لم يتم فتح درس بعد')}</strong>
                <small>${canAttachToCurrentLesson ? `يمكنك ربط العنصر بهذا الدرس مباشرة.` : 'افتح درسًا أولًا ثم سجّل العنصر الجديد.'}</small>
              </div>
              <div class="notes-summary-card compact">
                <span>مفتوح في هذا الدرس</span>
                <strong>${canAttachToCurrentLesson ? currentLessonEntries.filter((entry) => entry.status === 'open').length : 0}</strong>
                <small>العناصر التي لم تُغلق بعد</small>
              </div>
              <div class="notes-summary-card compact">
                <span>المفتوح إجمالًا</span>
                <strong>${totalOpenEntries}</strong>
                <small>عبر كل الدروس</small>
              </div>
            </div>

            <section class="notes-composer">
              <div class="notes-composer-head">
                <div>
                  <h3>${notesViewState.editingId ? 'تعديل عنصر محفوظ' : 'إضافة ملاحظة أو سؤال جديد'}</h3>
                  <p>${canAttachToCurrentLesson ? `سيُربط هذا العنصر بالدرس الحالي: ${escapeHtml(file.title)}` : 'افتح درسًا حتى تتمكن من حفظ عنصر جديد مرتبط به.'}</p>
                </div>
                <div class="notes-composer-head-actions">
                  <button data-note-switch-history class="secondary">عرض القديم</button>
                  <button data-note-reset class="secondary">${notesViewState.editingId ? 'إلغاء التعديل' : 'تفريغ الحقول'}</button>
                </div>
              </div>

              <div class="notes-composer-grid">
                <label class="notes-field">
                  <span>النوع</span>
                  <select data-note-draft-type>
                    <option value="note" ${notesViewState.draftType === 'note' ? 'selected' : ''}>ملاحظة</option>
                    <option value="question" ${notesViewState.draftType === 'question' ? 'selected' : ''}>سؤال مؤقت</option>
                  </select>
                </label>
                <label class="notes-field">
                  <span>الحالة</span>
                  <select data-note-draft-status>
                    <option value="open" ${notesViewState.draftStatus === 'open' ? 'selected' : ''}>مفتوح</option>
                    <option value="done" ${notesViewState.draftStatus === 'done' ? 'selected' : ''}>منتهي</option>
                  </select>
                </label>
              </div>

              <label class="notes-field">
                <span>عنوان مختصر</span>
                <input type="text" data-note-draft-title placeholder="مثال: سؤال عن أمر الإنتاج أو ملاحظة من التطبيق" value="${escapeHtml(notesViewState.draftTitle)}">
              </label>

              <label class="notes-field">
                <span>النص</span>
                <textarea data-note-draft-text placeholder="اكتب ما تريد تذكره لاحقًا، أو السؤال الذي ستعود له فيما بعد...">${escapeHtml(notesViewState.draftText)}</textarea>
              </label>

              <div class="notes-recorder-row">
                <button data-note-record class="${notesViewState.isRecording ? 'recording' : ''}">${notesViewState.isRecording ? '⏹️ إيقاف التسجيل' : '🎙️ تسجيل صوتي'}</button>
                <button data-note-clear-audio class="secondary" ${draftHasAudio ? '' : 'disabled'}>حذف التسجيل</button>
                <div class="notes-composer-status">${escapeHtml(statusText)}</div>
              </div>

              <div class="notes-draft-audio" data-note-draft-audio>${draftHasAudio ? 'جار تجهيز معاينة التسجيل...' : 'لا يوجد تسجيل صوتي في هذه المسودة.'}</div>

              <div class="notes-composer-actions">
                <button data-note-save ${canAttachToCurrentLesson ? '' : 'disabled'}>${notesViewState.editingId ? 'حفظ التعديل' : 'حفظ العنصر'}</button>
                ${!noteRecordingSupported() ? '<span class="notes-support-note">التسجيل الصوتي غير مدعوم على هذا الجهاز، لكن الحفظ النصي متاح.</span>' : ''}
              </div>
            </section>
          </section>
        ` : `
          <section class="notes-panel-scroller">
            <div class="notes-toolbar-card">
              <div class="notes-toolbar-head">
                <div>
                  <h3>أرشيف الملاحظات والأسئلة</h3>
                  <p>استعرض كل ما سجلته سابقًا، ثم افتح الدرس الأصلي أو عدّل العنصر أو غيّر حالته.</p>
                </div>
                <button data-note-switch-create class="secondary">تسجيل جديد</button>
              </div>
              <div class="notes-toolbar">
                <label class="notes-field">
                  <span>العرض</span>
                  <select data-notes-scope>
                    <option value="current" ${notesViewState.scope === 'current' ? 'selected' : ''} ${file ? '' : 'disabled'}>هذا الدرس</option>
                    <option value="all" ${notesViewState.scope === 'all' ? 'selected' : ''}>كل الدروس</option>
                  </select>
                </label>
                <label class="notes-field">
                  <span>النوع</span>
                  <select data-notes-type>
                    <option value="all" ${notesViewState.type === 'all' ? 'selected' : ''}>الكل</option>
                    <option value="note" ${notesViewState.type === 'note' ? 'selected' : ''}>ملاحظات</option>
                    <option value="question" ${notesViewState.type === 'question' ? 'selected' : ''}>أسئلة</option>
                  </select>
                </label>
                <label class="notes-field">
                  <span>الحالة</span>
                  <select data-notes-status>
                    <option value="all" ${notesViewState.status === 'all' ? 'selected' : ''}>الكل</option>
                    <option value="open" ${notesViewState.status === 'open' ? 'selected' : ''}>مفتوحة</option>
                    <option value="done" ${notesViewState.status === 'done' ? 'selected' : ''}>منتهية</option>
                  </select>
                </label>
              </div>
            </div>

            <section class="notes-list-wrap">
              <div class="notes-list-head">
                <strong>العناصر المحفوظة</strong>
                <span>${entries.length} عنصر</span>
              </div>
              <div class="notes-list">
                ${entries.length ? entries.map((entry) => `
                  <article class="note-card ${entry.status === 'done' ? 'done' : ''}">
                    <div class="note-card-head">
                      <div class="note-card-badges">
                        <span class="note-badge type-${escapeHtml(entry.type)}">${NOTE_TYPE_LABELS[entry.type]}</span>
                        <span class="note-badge status-${escapeHtml(entry.status)}">${NOTE_STATUS_LABELS[entry.status]}</span>
                      </div>
                      <div class="note-card-actions">
                        <button data-note-toggle-status="${escapeHtml(entry.id)}" class="secondary">${entry.status === 'done' ? 'إعادة فتح' : 'وضعه منتهيًا'}</button>
                        <button data-note-edit="${escapeHtml(entry.id)}" class="secondary">تعديل</button>
                        <button data-note-delete="${escapeHtml(entry.id)}" class="secondary">حذف</button>
                      </div>
                    </div>
                    <h4>${escapeHtml(noteSummaryLabel(entry))}</h4>
                    <div class="note-card-meta">${escapeHtml(entry.lessonTitle)} • آخر تحديث ${escapeHtml(formatDueDate(entry.updatedAt))}</div>
                    ${entry.text ? `<div class="note-card-text">${formatNoteText(entry.text)}</div>` : '<div class="note-card-text muted">لا يوجد نص مكتوب لهذا العنصر.</div>'}
                    <div class="note-card-footer">
                      <button data-note-open-source="${escapeHtml(entry.lessonId)}" class="secondary">فتح الدرس</button>
                      <div class="note-card-audio" data-note-audio-host="${escapeHtml(entry.id)}">${entry.audioId ? 'جار تحميل التسجيل...' : 'لا يوجد تسجيل صوتي محفوظ.'}</div>
                    </div>
                  </article>
                `).join('') : '<div class="notes-empty">لا توجد عناصر تطابق الفلتر الحالي بعد.</div>'}
              </div>
            </section>
          </section>
        `}
      </div>
    </div>
  `;

  $noteDrw.classList.remove('hidden');
  updateNotesButton();

  const token = ++notesViewState.renderToken;
  const tabButtons = $noteBody.querySelectorAll('[data-notes-tab]');
  const scopeSelect = $noteBody.querySelector('[data-notes-scope]');
  const typeFilter = $noteBody.querySelector('[data-notes-type]');
  const statusFilter = $noteBody.querySelector('[data-notes-status]');
  const typeSelect = $noteBody.querySelector('[data-note-draft-type]');
  const statusSelect = $noteBody.querySelector('[data-note-draft-status]');
  const titleInput = $noteBody.querySelector('[data-note-draft-title]');
  const textArea = $noteBody.querySelector('[data-note-draft-text]');
  const draftAudioHost = $noteBody.querySelector('[data-note-draft-audio]');

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      notesViewState.tab = button.dataset.notesTab === 'history' ? 'history' : 'create';
      showNotes(activeLessonId);
    });
  });

  $noteBody.querySelector('[data-note-switch-history]')?.addEventListener('click', () => {
    notesViewState.tab = 'history';
    showNotes(activeLessonId);
  });

  $noteBody.querySelector('[data-note-switch-create]')?.addEventListener('click', () => {
    notesViewState.tab = 'create';
    showNotes(activeLessonId);
  });

  scopeSelect?.addEventListener('change', () => {
    notesViewState.scope = scopeSelect.value;
    showNotes(activeLessonId);
  });
  typeFilter?.addEventListener('change', () => {
    notesViewState.type = typeFilter.value;
    showNotes(activeLessonId);
  });
  statusFilter?.addEventListener('change', () => {
    notesViewState.status = statusFilter.value;
    showNotes(activeLessonId);
  });
  typeSelect?.addEventListener('change', () => {
    notesViewState.draftType = typeSelect.value;
  });
  statusSelect?.addEventListener('change', () => {
    notesViewState.draftStatus = statusSelect.value;
  });
  titleInput?.addEventListener('input', () => {
    notesViewState.draftTitle = titleInput.value;
  });
  textArea?.addEventListener('input', () => {
    notesViewState.draftText = textArea.value;
  });

  $noteBody.querySelector('[data-note-reset]')?.addEventListener('click', () => {
    resetNoteDraft();
    notesViewState.composerStatus = 'تم تفريغ الحقول.';
    showNotes(activeLessonId);
  });

  $noteBody.querySelector('[data-note-record]')?.addEventListener('click', async () => {
    await toggleNoteRecording(activeLessonId);
  });

  $noteBody.querySelector('[data-note-clear-audio]')?.addEventListener('click', () => {
    if (notesViewState.draftAudioUrl) {
      URL.revokeObjectURL(notesViewState.draftAudioUrl);
    }
    notesViewState.draftAudioBlob = null;
    notesViewState.draftAudioUrl = '';
    if (notesViewState.draftAudioId) {
      notesViewState.draftAudioCleared = true;
    }
    notesViewState.draftAudioId = '';
    notesViewState.composerStatus = 'تم حذف التسجيل من المسودة الحالية.';
    showNotes(activeLessonId);
  });

  $noteBody.querySelector('[data-note-save]')?.addEventListener('click', async () => {
    await saveNoteDraft(activeLessonId);
  });

  $noteBody.querySelectorAll('[data-note-edit]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = state.noteEntries.find((item) => item.id === button.dataset.noteEdit);
      if (!entry) return;
      loadNoteDraft(entry);
      showNotes(activeLessonId || entry.lessonId);
    });
  });

  $noteBody.querySelectorAll('[data-note-delete]').forEach((button) => {
    button.addEventListener('click', async () => {
      await deleteNoteEntry(button.dataset.noteDelete);
      showNotes(activeLessonId);
    });
  });

  $noteBody.querySelectorAll('[data-note-toggle-status]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = state.noteEntries.find((item) => item.id === button.dataset.noteToggleStatus);
      if (!entry) return;
      entry.status = entry.status === 'done' ? 'open' : 'done';
      entry.updatedAt = new Date().toISOString();
      entry.lessonTitle = noteEntryLessonTitle(entry);
      persistNoteEntries();
      notesViewState.composerStatus = entry.status === 'done' ? 'تم وضع العنصر كمنتهي.' : 'تمت إعادة فتح العنصر.';
      showNotes(activeLessonId);
    });
  });

  $noteBody.querySelectorAll('[data-note-open-source]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!button.dataset.noteOpenSource) return;
      loadFile(button.dataset.noteOpenSource);
    });
  });

  if (draftAudioHost) {
    if (notesViewState.draftAudioBlob && notesViewState.draftAudioUrl) {
      draftAudioHost.innerHTML = `<audio controls preload="metadata" src="${notesViewState.draftAudioUrl}"></audio>`;
    } else if (notesViewState.draftAudioId) {
      void hydrateNoteAudioHost(draftAudioHost, notesViewState.draftAudioId, token);
    }
  }

  entries.filter((entry) => entry.audioId).forEach((entry) => {
    const host = $noteBody.querySelector(`[data-note-audio-host="${CSS.escape(entry.id)}"]`);
    if (host) void hydrateNoteAudioHost(host, entry.audioId, token);
  });
}

$btnNotes.addEventListener('click', () => {
  if ($noteDrw.classList.contains('hidden')) {
    showNotes(state.currentFileId);
  } else {
    $noteDrw.classList.add('hidden');
    updateNotesButton();
  }
});

$('btn-close-notes').addEventListener('click', () => {
  if (notesMediaRecorder && notesMediaRecorder.state === 'recording') {
    notesMediaRecorder.stop();
  }
  $noteDrw.classList.add('hidden');
  updateNotesButton();
});

/* ─── Search ───────────────────────────────────────────────── */
function openSearch() {
  $srchOvl.classList.remove('hidden');
  setTimeout(() => $srchInp.focus(), 50);
  if (!state.searchIndexReady) buildSearchIndex();
}

function closeSearch() {
  $srchOvl.classList.add('hidden');
  $srchInp.value = '';
  $srchRes.innerHTML = '';
  $srchStat.textContent = '';
}

$('btn-search').addEventListener('click', openSearch);
$('btn-close-search').addEventListener('click', closeSearch);

$srchOvl.addEventListener('click', e => { if (e.target === $srchOvl) closeSearch(); });

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  if (e.key === 'Escape') { closeSearch(); $noteDrw.classList.add('hidden'); }
});

let searchTimer;
$srchInp.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => runSearch($srchInp.value.trim()), 200);
});

function scheduleSearchIndex() {
  setTimeout(buildSearchIndex, 2000);
}

let indexing = false;
async function buildSearchIndex() {
  if (indexing || state.searchIndexReady) return;
  indexing = true;
  $srchStat.textContent = 'جار تحميل محتوى البحث...';

  const items = state.allItems;
  let loaded = 0;

  for (const file of items) {
    if (state.contentCache[file.path]) { loaded++; continue; }
    try {
      const res = await fetch(contentBase() + encodePath(file.path));
      if (res.ok) {
        state.contentCache[file.path] = await res.text();
        loaded++;
      }
    } catch (_) {}
    // Small yield to not block UI
    if (loaded % 5 === 0) await new Promise(r => setTimeout(r, 10));
  }

  state.searchIndexReady = true;
  $srchStat.textContent = loaded > 0 ? `جاهز للبحث في ${loaded} ملف` : '';
  indexing = false;

  // Re-run search if user already typed something
  if ($srchInp.value.trim()) runSearch($srchInp.value.trim());
}

function runSearch(query) {
  if (!query || query.length < 2) {
    $srchRes.innerHTML = '';
    $srchStat.textContent = state.searchIndexReady ? 'اكتب للبحث في المحتوى' : 'جار تحميل محتوى البحث...';
    return;
  }

  const q = query.toLowerCase();
  const results = [];

  state.allItems.forEach(file => {
    const titleMatch = file.title.toLowerCase().includes(q);
    const content = state.contentCache[file.path] || '';
    const contentLower = content.toLowerCase();
    const contentIdx = contentLower.indexOf(q);

    if (titleMatch || contentIdx !== -1) {
      let excerpt = '';
      if (contentIdx !== -1) {
        const start = Math.max(0, contentIdx - 60);
        const end = Math.min(content.length, contentIdx + query.length + 80);
        let raw = content.slice(start, end).replace(/[#*`>\-_]/g, '').trim();
        // Highlight match
        const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        excerpt = raw.replace(re, m => `<mark>${m}</mark>`);
        if (start > 0) excerpt = '...' + excerpt;
        if (end < content.length) excerpt += '...';
      }

      results.push({ file, titleMatch, excerpt, score: (titleMatch ? 10 : 0) + (contentIdx !== -1 ? 1 : 0) });
    }
  });

  results.sort((a, b) => b.score - a.score);

  if (results.length === 0) {
    $srchRes.innerHTML = '<p style="padding:1rem; text-align:center; color:var(--text-muted);">لا نتائج</p>';
    $srchStat.textContent = `لا توجد نتائج لـ "${query}"`;
    return;
  }

  $srchStat.textContent = `${results.length} نتيجة لـ "${query}"`;

  $srchRes.innerHTML = results.slice(0, 30).map(r => `
    <div class="search-result-item" data-file-id="${r.file.id}">
      <div class="result-title">${r.file.title}</div>
      ${r.excerpt ? `<div class="result-excerpt">${r.excerpt}</div>` : ''}
    </div>
  `).join('');

  $srchRes.querySelectorAll('.search-result-item').forEach(el => {
    el.addEventListener('click', () => {
      loadFile(el.dataset.fileId);
      closeSearch();
    });
  });
}

function normalizeKnowledgeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u0610-\u061a\u064b-\u065f\u06d6-\u06ed]/g, '')
    .replace(/[؟،؛,:.!؟()\[\]{}"'`~\\/|*+=<>_-]/g, ' ')
    .replace(/(^|\s)و(?=[a-z])/g, '$1')
    .replace(/[^\u0600-\u06ffa-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCoreKnowledgeQuery(query) {
  const raw = String(query || '').trim();
  if (!raw) return '';

  let core = raw;
  KNOWLEDGE_QUERY_PREFIX_PATTERNS.forEach((pattern) => {
    core = core.replace(pattern, '').trim();
  });

  core = core.replace(/^\d+\s*[.)-]\s*/, '').trim();
  if (core === raw && /ما\s+الذي\s+يطلبه|دون\s+ا?ن\s+تعطيني\s+الحل|راجع\s+ا?جابت/i.test(raw)) {
    const colonIndex = raw.lastIndexOf(':');
    if (colonIndex !== -1 && colonIndex < raw.length - 1) {
      core = raw.slice(colonIndex + 1).trim();
    }
  }
  const lines = core.split(/\n+/).map(line => line.trim()).filter(Boolean);
  if (lines.length > 1) {
    core = lines[lines.length - 1];
  }

  return core || raw;
}

function cleanupKnowledgeEntity(value) {
  return normalizeKnowledgeText(
    String(value || '')
      .replace(/^[\s"'“”`]+|[\s"'“”`]+$/g, '')
      .replace(/^\d+\s*[.)-]\s*/, '')
      .replace(/[؟?!.,:;]+$/g, '')
  );
}

function extractComparisonTerms(coreQuery) {
  const raw = String(coreQuery || '').trim();
  if (!raw) return [];

  const patterns = [
    /(?:الفرق بين|قارن بين)\s+(.+?)\s+و\s*(.+?)(?:$|[؟?.!])/i,
    /(?:difference between|compare)\s+(.+?)\s+(?:and|vs)\s+(.+?)(?:$|[؟?.!])/i,
  ];

  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) {
      return [cleanupKnowledgeEntity(match[1]), cleanupKnowledgeEntity(match[2])].filter(Boolean);
    }
  }

  const normalized = normalizeKnowledgeText(raw);
  if (!normalized.includes('الفرق') && !normalized.includes('قارن') && !normalized.includes('compare') && !normalized.includes('vs')) {
    return [];
  }

  const plain = raw.replace(/[؟?.!]/g, ' ').trim();
  const parts = plain.split(/\s+(?:vs|and|و)\s*/i).map(cleanupKnowledgeEntity).filter(Boolean);
  return parts.length === 2 ? parts : [];
}

function extractKnowledgePhrases(coreQuery, comparisonTerms) {
  const phrases = [...comparisonTerms];
  const englishPhrases = String(coreQuery || '').match(/[A-Za-z]+(?:\s+[A-Za-z]+){1,2}/g) || [];
  englishPhrases.forEach((phrase) => {
    const cleaned = cleanupKnowledgeEntity(phrase);
    if (cleaned) phrases.push(cleaned);
  });
  return [...new Set(phrases.filter(Boolean))];
}

function tokenizeKnowledgeQuery(query) {
  return [...new Set(
    normalizeKnowledgeText(query)
      .split(' ')
      .map(token => token.trim())
      .flatMap((token) => {
        if (/^[وفبكل][a-z]{2,}$/i.test(token)) {
          return [token.slice(1), token];
        }
        return [token];
      })
      .filter(token => token.length >= 2 && !KNOWLEDGE_STOPWORDS.has(token))
  )];
}

function parseKnowledgeQuery(query) {
  const rawQuery = String(query || '').trim();
  const coreQuery = extractCoreKnowledgeQuery(rawQuery);
  const normalizedCore = normalizeKnowledgeText(coreQuery);
  const comparisonTerms = extractComparisonTerms(coreQuery);
  const phrases = extractKnowledgePhrases(coreQuery, comparisonTerms);

  return {
    rawQuery,
    coreQuery,
    normalizedCore,
    comparisonTerms,
    phrases,
    tokens: tokenizeKnowledgeQuery(coreQuery),
    explainIntent: rawQuery !== coreQuery || /ما الذي يطلبه|دون ان تعطيني الحل|بدون حل/i.test(rawQuery),
  };
}

function countKnowledgeHits(normalizedText, needle) {
  if (!normalizedText || !needle) return 0;
  return normalizedText.split(needle).length - 1;
}

function analyzeKnowledgeCoverage(normalizedText, queryInfo) {
  return {
    matchedTokens: queryInfo.tokens.filter(token => normalizedText.includes(token)),
    matchedPhrases: queryInfo.phrases.filter(phrase => normalizedText.includes(phrase)),
    matchedTerms: queryInfo.comparisonTerms.filter(term => normalizedText.includes(term)),
  };
}

function scoreNormalizedText(normalizedText, queryInfo) {
  const tokenScore = queryInfo.tokens.reduce((score, token) => {
    const hits = countKnowledgeHits(normalizedText, token);
    return score + Math.min(hits, 4);
  }, 0);

  const phraseScore = queryInfo.phrases.reduce((score, phrase) => {
    const hits = countKnowledgeHits(normalizedText, phrase);
    if (!hits) return score;
    return score + 8 + (Math.min(hits, 2) * 4);
  }, 0);

  const fullComparisonBonus = queryInfo.comparisonTerms.length >= 2
    && queryInfo.comparisonTerms.every(term => normalizedText.includes(term))
    ? 12
    : 0;

  return tokenScore + phraseScore + fullComparisonBonus;
}

function getKnowledgeContent(file) {
  return state.contentCache[file.path]
    || state.aiKnowledge?.knowledge?.contentBundle?.[file.id]
    || '';
}

function buildAssistantExcerpt(text, queryInfo) {
  const raw = String(text || '').replace(/[#*`>\-_]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!raw) return '';

  const normalized = normalizeKnowledgeText(raw);
  const token = [...queryInfo.phrases.flatMap(item => item.split(' ')), ...queryInfo.tokens].find(item => normalized.includes(item));
  if (!token) return raw.slice(0, 170);

  const lowerRaw = raw.toLowerCase();
  const position = lowerRaw.indexOf(token);
  if (position === -1) return raw.slice(0, 170);

  const start = Math.max(0, position - 70);
  const end = Math.min(raw.length, position + token.length + 110);
  let excerpt = raw.slice(start, end).trim();
  if (start > 0) excerpt = `...${excerpt}`;
  if (end < raw.length) excerpt = `${excerpt}...`;
  return excerpt;
}

function buildAssistantFileMatches(queryInfo) {
  return state.allItems
    .map(file => {
      const normalizedTitle = normalizeKnowledgeText(file.title);
      const normalizedSection = normalizeKnowledgeText(file.sectionTitle);
      const summaryText = file.summary || '';
      const normalizedSummary = normalizeKnowledgeText(summaryText);
      const content = getKnowledgeContent(file);
      const normalizedContent = normalizeKnowledgeText(content);
      const combined = [normalizedTitle, normalizedSection, normalizedSummary, normalizedContent].join(' ');
      const coverage = analyzeKnowledgeCoverage(combined, queryInfo);
      const titleScore = scoreNormalizedText(normalizedTitle, queryInfo) * 5;
      const sectionScore = scoreNormalizedText(normalizedSection, queryInfo) * 2;
      const summaryScore = scoreNormalizedText(normalizedSummary, queryInfo) * 3;
      const contentScore = scoreNormalizedText(normalizedContent, queryInfo);
      const score = titleScore + sectionScore + summaryScore + contentScore + (coverage.matchedTerms.length * 6) + (coverage.matchedPhrases.length * 6);
      return {
        file,
        score,
        coverage,
        excerpt: buildAssistantExcerpt(content || summaryText, queryInfo),
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

function buildAssistantGlossaryMatches(queryInfo) {
  return state.glossaryTerms
    .map(term => {
      const haystack = normalizeKnowledgeText([term.arabic, term.english, term.definition, ...(term.aliases || [])].join(' '));
      return { term, score: scoreNormalizedText(haystack, queryInfo) + (analyzeKnowledgeCoverage(haystack, queryInfo).matchedTerms.length * 8), coverage: analyzeKnowledgeCoverage(haystack, queryInfo) };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function buildAssistantComparisonMatches(queryInfo) {
  const rows = [];
  state.systemComparisons.forEach(table => {
    (table.rows || []).forEach(row => {
      const haystack = normalizeKnowledgeText([row.concept, row.dynamics, row.oracle, row.sap, row.note, table.title].join(' '));
      const coverage = analyzeKnowledgeCoverage(haystack, queryInfo);
      const score = scoreNormalizedText(haystack, queryInfo) + (coverage.matchedTerms.length * 8) + (coverage.matchedPhrases.length * 6);
      if (score > 0) {
        rows.push({ row, table, score, coverage });
      }
    });
  });

  return rows.sort((a, b) => b.score - a.score).slice(0, 2);
}

function buildAssistantScenarioMatches(queryInfo) {
  return (state.scenarios || [])
    .map((scenario) => {
      const haystack = normalizeKnowledgeText([
        scenario.title,
        scenario.summary,
        scenario.context,
        ...(scenario.steps || []).map(step => `${step.prompt || ''} ${step.explanation || ''}`),
      ].join(' '));
      return { scenario, score: scoreNormalizedText(haystack, queryInfo), coverage: analyzeKnowledgeCoverage(haystack, queryInfo) };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
}

function isStudyPlanQuery(query) {
  const normalized = normalizeKnowledgeText(query);
  return (
    (normalized.includes('ادرس') || normalized.includes('ابدا') || normalized.includes('ابدأ') || normalized.includes('اراجع'))
      && (normalized.includes('ماذا') || normalized.includes('الان') || normalized.includes('الآن') || normalized.includes('خط'))
  ) || /خطتي|الخطة|ماذا بعد|وش ادرس|شو ادرس/i.test(query);
}

function isComparisonQuery(query) {
  const normalized = normalizeKnowledgeText(query);
  return normalized.includes('قارن')
    || normalized.includes('مقارنه')
    || normalized.includes('الفرق')
    || normalized.includes('فرق')
    || normalized.includes('compare')
    || normalized.includes('vs');
}

function inferAssistantConfidence(queryInfo, evidenceGroups) {
  const allMatches = [
    ...evidenceGroups.fileMatches,
    ...evidenceGroups.glossaryMatches,
    ...evidenceGroups.comparisonMatches,
    ...evidenceGroups.scenarioMatches,
  ];

  const topScore = allMatches.length ? Math.max(...allMatches.map(item => item.score || 0)) : 0;
  const coveredTerms = new Set(allMatches.flatMap(item => item.coverage?.matchedTerms || []));
  const coveredPhrases = new Set(allMatches.flatMap(item => item.coverage?.matchedPhrases || []));

  if (queryInfo.comparisonTerms.length >= 2) {
    if (coveredTerms.size >= 2 && (topScore >= 18 || coveredPhrases.size >= 1)) return 'high';
    if (coveredTerms.size >= 1 && topScore >= 10) return 'medium';
    return 'low';
  }

  if (coveredPhrases.size >= 1 && topScore >= 12) return 'high';
  if (topScore >= 6) return 'medium';
  return 'low';
}

function buildAssistantEvidence(query) {
  const queryInfo = parseKnowledgeQuery(query);
  const fileMatches = buildAssistantFileMatches(queryInfo);
  const glossaryMatches = buildAssistantGlossaryMatches(queryInfo);
  const comparisonMatches = buildAssistantComparisonMatches(queryInfo);
  const scenarioMatches = buildAssistantScenarioMatches(queryInfo);
  const confidence = inferAssistantConfidence(queryInfo, { fileMatches, glossaryMatches, comparisonMatches, scenarioMatches });

  return {
    queryInfo,
    fileMatches,
    glossaryMatches,
    comparisonMatches,
    scenarioMatches,
    comparisonQuery: isComparisonQuery(queryInfo.coreQuery || query),
    confidence,
  };
}

function formatComparisonSystemLines(item) {
  if (!item) return [];
  return [
    `Dynamics 365: ${item.row.dynamics || '-'}`,
    `Oracle Fusion Cloud: ${item.row.oracle || '-'}`,
    `SAP S/4HANA: ${item.row.sap || '-'}`,
  ];
}

function buildComparisonIntentBullets(evidence) {
  const { queryInfo, comparisonMatches, glossaryMatches, fileMatches, scenarioMatches } = evidence;
  const bullets = [];
  const leadComparison = comparisonMatches[0] || null;
  const leadFile = fileMatches[0] || null;
  const matchingTerms = glossaryMatches
    .filter((item) => queryInfo.comparisonTerms.some((term) => {
      const title = normalizeKnowledgeText(`${item.term.arabic || ''} ${item.term.english || ''}`);
      return title.includes(term);
    }))
    .slice(0, 2);

  if (queryInfo.explainIntent && queryInfo.comparisonTerms.length >= 2) {
    bullets.push(`السؤال هنا لا يطلب الحل الكامل، بل يطلب منك ضبط الفرق المفهومي بين ${queryInfo.comparisonTerms[0]} و${queryInfo.comparisonTerms[1]}.`);
    bullets.push('أفضل زاوية للإجابة: عرّف كل مفهوم أولًا، ثم بيّن الفرق بين مستوى المنظومة أو الموديول ومستوى الكيان التنفيذي أو الأمر.');
  } else if (queryInfo.comparisonTerms.length >= 2) {
    bullets.push(`المحور الرئيسي هنا هو التفريق بين ${queryInfo.comparisonTerms[0]} و${queryInfo.comparisonTerms[1]} داخل دورة الإنتاج.`);
  }

  matchingTerms.forEach((item) => {
    const label = item.term.arabic || item.term.english;
    bullets.push(`${label}${item.term.english && item.term.arabic ? ` (${item.term.english})` : ''}: ${item.term.definition}`);
  });

  if (leadComparison) {
    bullets.push(`صف المقارنة من زاوية "${leadComparison.row.concept}" لأنها الأقرب للسؤال.`);
    bullets.push(...formatComparisonSystemLines(leadComparison));
  }

  if (leadFile) {
    bullets.push(`أفضل مرجع محلي تبدأ منه: ${leadFile.file.title}.`);
  }

  if (scenarioMatches[0]) {
    bullets.push(`وإذا أردت تثبيت الفهم، ارجع إلى سيناريو: ${scenarioMatches[0].scenario.title}.`);
  }

  return bullets.slice(0, 7);
}

function buildExplainIntentBullets(evidence) {
  const { queryInfo, fileMatches, glossaryMatches, comparisonMatches, scenarioMatches } = evidence;
  const bullets = [];
  const leadFile = fileMatches[0] || null;
  const leadGlossary = glossaryMatches[0] || null;

  bullets.push('السؤال يطلب منك تفسير المطلوب أو زاوية الحل، لا كتابة الحل النهائي كاملًا.');
  if (queryInfo.comparisonTerms.length >= 2) {
    bullets.push(`المطلوب هو توضيح الفرق بين ${queryInfo.comparisonTerms[0]} و${queryInfo.comparisonTerms[1]} من حيث الدور داخل دورة الإنتاج.`);
  }
  if (leadGlossary) {
    bullets.push(`ابدأ من تعريف ${leadGlossary.term.arabic || leadGlossary.term.english} ثم ابنِ عليه بقية الفرق.`);
  }
  if (comparisonMatches[0]) {
    bullets.push(`بعد التعريف، انقل المقارنة إلى مستوى "${comparisonMatches[0].row.concept}" لأنه الأقرب لتركيب السؤال.`);
  }
  if (leadFile) {
    bullets.push(`المرجع المحلي الأوضح لهذا السؤال هو: ${leadFile.file.title}.`);
  }
  if (scenarioMatches[0]) {
    bullets.push(`يمكنك اختبار فهمك سريعًا عبر سيناريو: ${scenarioMatches[0].scenario.title}.`);
  }

  return bullets.slice(0, 6);
}

function buildGenericAssistantBullets(evidence) {
  const { fileMatches, glossaryMatches, comparisonMatches, scenarioMatches, comparisonQuery } = evidence;
  const bullets = [];

  if (comparisonQuery && comparisonMatches[0]) {
    const item = comparisonMatches[0];
    bullets.push(`المقارنة الأقرب لسؤالك هي: ${item.row.concept}.`);
    bullets.push(...formatComparisonSystemLines(item));
  }

  if (fileMatches[0]) {
    const lead = fileMatches[0];
    bullets.push(`أقرب ملف لسؤالك هو: ${lead.file.title}.`);
    if (lead.file.summary) bullets.push(lead.file.summary);
    if (lead.excerpt) bullets.push(`مقتطف من المحتوى: ${lead.excerpt}`);
  }

  if (glossaryMatches[0]) {
    const term = glossaryMatches[0].term;
    bullets.push(`المصطلح الأقرب: ${term.arabic}${term.english ? ` (${term.english})` : ''} — ${term.definition}`);
  }

  if (!comparisonQuery && comparisonMatches[0]) {
    const item = comparisonMatches[0];
    bullets.push(`في مقارنة الأنظمة، مفهوم "${item.row.concept}" يظهر هكذا:`);
    bullets.push(...formatComparisonSystemLines(item));
  }

  if (scenarioMatches[0]) {
    bullets.push(`يوجد سيناريو مرتبط يمكن أن يثبت الفهم: ${scenarioMatches[0].scenario.title}.`);
  }

  return bullets;
}

function buildAssistantIntentBullets(evidence) {
  const { queryInfo, comparisonQuery } = evidence;

  if (queryInfo.explainIntent) {
    return queryInfo.comparisonTerms.length >= 2
      ? buildComparisonIntentBullets(evidence)
      : buildExplainIntentBullets(evidence);
  }

  if (comparisonQuery && queryInfo.comparisonTerms.length >= 2) {
    return buildComparisonIntentBullets(evidence);
  }

  return buildGenericAssistantBullets(evidence);
}

function buildStudyPlanResponse() {
  const nextLesson = firstIncompleteLesson();
  const dueReviews = dueReviewItems();
  const weakTopics = weakTopicStats();

  const highlights = [];
  if (nextLesson) {
    highlights.push(`ابدأ بالدرس التالي: ${nextLesson.title}`);
  }
  if (dueReviews.length) {
    highlights.push(`عندك ${dueReviews.length} عنصر مراجعة مستحق الآن.`);
  }
  if (weakTopics.length) {
    highlights.push(`أكثر مجال يحتاج تقوية حاليًا: ${weakTopics[0].label}.`);
  }

  const references = nextLesson ? [{ type: 'file', id: nextLesson.id, title: nextLesson.title, meta: nextLesson.sectionTitle }] : [];
  return {
    mode: 'plan',
    title: 'خطة دراسة مقترحة من حالتك الحالية',
    intro: highlights.length ? highlights[0] : 'ابدأ من لوحة الدراسة أو أول درس غير مكتمل.',
    bullets: highlights,
    references,
    actions: [
      nextLesson ? { type: 'open-file', id: nextLesson.id, label: 'افتح الدرس المقترح' } : null,
      dueReviews.length ? { type: 'review', label: 'افتح قائمة المراجعة' } : null,
      { type: 'dashboard', label: 'العودة إلى لوحة الدراسة' },
    ].filter(Boolean),
  };
}

function buildAssistantResponse(query) {
  const trimmed = String(query || '').trim();
  if (!trimmed) return null;

  if (isStudyPlanQuery(trimmed)) {
    return buildStudyPlanResponse();
  }

  const evidence = buildAssistantEvidence(trimmed);
  const { queryInfo, fileMatches, glossaryMatches, comparisonMatches, scenarioMatches, comparisonQuery, confidence } = evidence;
  if (!queryInfo.tokens.length && !queryInfo.phrases.length) {
    return {
      mode: 'empty',
      title: 'اكتب سؤالًا أو طلبًا أوضح',
      intro: 'مثال: ما الفرق بين BOM وRoute؟ أو ماذا أدرس الآن؟',
      bullets: [],
      references: [],
      actions: [],
    };
  }

  if (!fileMatches.length && !glossaryMatches.length && !comparisonMatches.length && !scenarioMatches.length) {
    const nextLesson = firstIncompleteLesson();
    return {
      mode: 'fallback',
      title: 'لم أجد جوابًا قويًا داخل ملفاتك الحالية',
      intro: 'جرّب صياغة السؤال بمصطلح ERP أو اسم مفهوم أو اسم عملية إنتاجية أدق.',
      bullets: nextLesson ? [`إذا كنت تريد الاستمرار بالدراسة، الدرس الأقرب الآن هو: ${nextLesson.title}`] : [],
      references: nextLesson ? [{ type: 'file', id: nextLesson.id, title: nextLesson.title, meta: nextLesson.sectionTitle }] : [],
      actions: nextLesson ? [{ type: 'open-file', id: nextLesson.id, label: 'افتح الدرس المقترح' }] : [],
    };
  }

  const bullets = buildAssistantIntentBullets(evidence);
  const references = [];

  if (comparisonMatches[0]) {
    const item = comparisonMatches[0];
    references.push({ type: 'file', id: item.table.sourceId, title: item.table.sourceTitle || item.table.title, meta: 'مقارنة أنظمة' });
  }

  if (glossaryMatches[0]) {
    const term = glossaryMatches[0].term;
    if (term.sourceId) {
      references.push({ type: 'file', id: term.sourceId, title: term.arabic || term.english, meta: 'قاموس / مرجع' });
    }
  }

  fileMatches.slice(0, 3).forEach((match) => {
    references.push({ type: 'file', id: match.file.id, title: match.file.title, meta: match.file.sectionTitle, excerpt: match.excerpt });
  });

  const seenRefs = new Set();
  const uniqueReferences = references.filter((ref) => {
    const key = `${ref.type}:${ref.id}:${ref.title}`;
    if (seenRefs.has(key)) return false;
    seenRefs.add(key);
    return true;
  }).slice(0, 4);

  const nextLesson = firstIncompleteLesson();
  return {
    mode: confidence === 'low' ? 'cautious-answer' : 'answer',
    title: confidence === 'low' ? 'أفضل إشارات محلية من ملفات الدراسة' : 'إجابة محلية من ملفات الدراسة',
    intro: confidence === 'low'
      ? 'وجدت شواهد محلية مرتبطة بالسؤال، لكنها ليست كافية وحدها لجواب محلي واثق 100%. '
      : 'هذه الإجابة مبنية على محتوى التطبيق المحلي، وليست من الويب.',
    bullets,
    references: uniqueReferences,
    evidence,
    actions: [
      uniqueReferences[0]?.type === 'file' ? { type: 'open-file', id: uniqueReferences[0].id, label: 'افتح المرجع الأول' } : null,
      nextLesson ? { type: 'open-file', id: nextLesson.id, label: 'ماذا أدرس الآن؟' } : null,
      { type: 'review', label: 'افتح المراجعة المستحقة' },
    ].filter(Boolean),
  };
}

function saveAiAssistantHistory(query, response) {
  const entry = {
    query,
    at: new Date().toISOString(),
    title: response?.title || '',
    intro: response?.intro || '',
  };
  state.aiAssistantHistory = [entry, ...(state.aiAssistantHistory || [])].slice(0, 8);
  store.set('aiAssistantHistory', state.aiAssistantHistory);
}

function normalizeAiContextPack(contextPack = null) {
  if (!contextPack) return null;

  const items = Array.isArray(contextPack.items)
    ? contextPack.items
        .map((item) => ({
          label: String(item?.label || '').trim(),
          value: String(item?.value || '').trim(),
        }))
        .filter((item) => item.label && item.value)
        .slice(0, 8)
    : [];

  return {
    title: String(contextPack.title || 'سياق إضافي').trim(),
    summary: String(contextPack.summary || '').trim(),
    details: String(contextPack.details || '').trim(),
    sourceLabel: String(contextPack.sourceLabel || '').trim(),
    preferredModelTier: normalizeAiModelTier(contextPack.preferredModelTier),
    items,
  };
}

function setAiContextDraft(nextContext = null) {
  state.aiContextDraft = normalizeAiContextPack(nextContext);
}

function getAiContextDraft() {
  return normalizeAiContextPack(state.aiContextDraft);
}

function buildLessonAiContext(file) {
  const note = summarizeLessonNotes(file.id, 3);
  const metadata = getLessonMetadata(file.id);
  return normalizeAiContextPack({
    title: `سياق الدرس الحالي: ${file.title}`,
    sourceLabel: 'الدرس الحالي',
    summary: file.summary || 'الطلب خرج من شاشة درس مفتوحة الآن.',
    details: metadata?.recallPrompts?.[0] || metadata?.preReadingPrompts?.[0] || '',
    items: [
      { label: 'اسم الدرس', value: file.title },
      { label: 'القسم', value: file.sectionTitle || 'بدون قسم' },
      note ? { label: 'ملاحظاتي وأسئلتي', value: note.slice(0, 220) } : null,
    ].filter(Boolean),
  });
}

function buildDashboardAiContext() {
  const dueReviews = dueReviewItems();
  const cards = dueCards();
  const mistakes = openMistakes();
  const weakTopics = weakTopicStats().slice(0, 3);
  const last = lastOpenedFile();

  return normalizeAiContextPack({
    title: 'سياق لوحة الدراسة',
    sourceLabel: 'لوحة الدراسة',
    summary: 'الطلب خرج من لوحة الدراسة ويريد الاستفادة من التقدم الحالي ونقاط الضعف والأخطاء المفتوحة.',
    details: last ? `آخر درس مفتوح: ${last.title}` : '',
    items: [
      { label: 'الدروس المنتهية', value: `${doneCount()}/${totalCount()}` },
      { label: 'المراجعات المستحقة', value: String(dueReviews.length) },
      { label: 'البطاقات المستحقة', value: String(cards.length) },
      { label: 'الأخطاء المفتوحة', value: String(mistakes.length) },
      weakTopics[0] ? { label: 'أضعف مجال', value: weakTopics[0].label } : null,
    ].filter(Boolean),
  });
}

function buildMistakesAiContext(focusMistake = null) {
  const open = openMistakes();
  const found = focusMistake ? findQuestionById(focusMistake.questionId) : null;
  return normalizeAiContextPack({
    title: focusMistake ? 'سياق خطأ محدد' : 'سياق دفتر الأخطاء',
    sourceLabel: 'دفتر الأخطاء',
    summary: focusMistake
      ? 'الطلب يركز على تفسير سؤال أخطأت فيه وكيف أتجنب تكرار الخطأ.'
      : 'الطلب يركز على تحليل نمط الأخطاء المفتوحة وبناء مراجعة علاجية.',
    details: focusMistake
      ? `نص السؤال: ${focusMistake.prompt || 'غير متاح'}\nإجابتي: ${focusMistake.userAnswer || 'غير محفوظة'}`
      : '',
    preferredModelTier: 'heavy',
    items: [
      { label: 'الأخطاء المفتوحة', value: String(open.length) },
      focusMistake?.result ? { label: 'نوع الخطأ', value: focusMistake.result } : null,
      found?.quiz?.title ? { label: 'الاختبار', value: found.quiz.title } : null,
      focusMistake?.sourceLesson ? { label: 'مصدر الدرس', value: findById(focusMistake.sourceLesson)?.title || focusMistake.sourceLesson } : null,
    ].filter(Boolean),
  });
}

function buildQuizQuestionAiContext(quiz, question, savedAnswer, progressText) {
  const lesson = findById(question.sourceId);
  return normalizeAiContextPack({
    title: `سياق سؤال اختبار: ${quiz.title}`,
    sourceLabel: 'سؤال الاختبار',
    summary: 'الطلب خرج من شاشة سؤال اختبار مفتوح الآن ويحتاج شرح المطلوب أو مراجعة الإجابة الحالية.',
    details: savedAnswer?.answer ? `الإجابة الحالية: ${savedAnswer.answer}` : '',
    items: [
      { label: 'الاختبار', value: quiz.title },
      { label: 'السؤال', value: progressText },
      { label: 'نوع السؤال', value: question.type || 'غير محدد' },
      lesson ? { label: 'الدرس المرتبط', value: lesson.title } : null,
      savedAnswer?.result ? { label: 'تقييمي الحالي', value: savedAnswer.result } : null,
    ].filter(Boolean),
  });
}

function buildQuizResultAiContext(quiz, attempt) {
  const weakPrompts = quiz.questions
    .filter((question) => (attempt.answers?.[question.id]?.result || 'wrong') !== 'correct')
    .slice(0, 4)
    .map((question) => question.prompt)
    .join(' | ');

  return normalizeAiContextPack({
    title: `سياق نتيجة اختبار: ${quiz.title}`,
    sourceLabel: 'نتيجة الاختبار',
    summary: 'الطلب خرج من شاشة نتيجة اختبار ويحتاج تحليلًا للمحاولة أو خطة مراجعة علاجية.',
    details: weakPrompts ? `الأسئلة غير المتقنة: ${weakPrompts}` : '',
    preferredModelTier: 'heavy',
    items: [
      { label: 'الاختبار', value: quiz.title },
      { label: 'الإجمالي', value: String(attempt.total || 0) },
      { label: 'صحيح', value: String(attempt.correct || 0) },
      { label: 'جزئي', value: String(attempt.partial || 0) },
      { label: 'خطأ', value: String(attempt.wrong || 0) },
    ],
  });
}

function openAiAssistantWithContext(query = '', contextPack = null) {
  setAiContextDraft(contextPack);
  state.aiConnectionStatus = null;
  const nextQuery = String(query || '').trim();
  if (nextQuery) runAiAssistantQuery(nextQuery);
  else renderAiAssistant();
}

function shouldShowInitialAiSetup() {
  const settings = getAiSettings();
  return !state.aiSetupDismissed && !settings.apiKey;
}

function dismissInitialAiSetup() {
  state.aiSetupDismissed = true;
  store.set('aiSetupDismissed', true);
}

function renderInitialAiSetupOverlay() {
  if (!shouldShowInitialAiSetup()) return;
  const existing = document.getElementById('ai-setup-overlay');
  if (existing) existing.remove();

  const settings = getAiSettings();
  const overlay = document.createElement('div');
  overlay.id = 'ai-setup-overlay';
  overlay.className = 'ai-setup-overlay';
  overlay.innerHTML = `
    <div class="ai-setup-modal">
      <div class="study-aid-label">إعداد أولي</div>
      <h2>فعّل الذكاء مباشرة من الهاتف</h2>
      <p>إذا أردت أن يعمل المساعد الخارجي والصوت العربي داخل الـ APK بدون كمبيوتر أو خادم منفصل، ضع مفتاح OpenAI هنا. سيُحفظ محليًا بشكل مشفّر على هذا الجهاز فقط.</p>
      <label class="ai-config-field">
        <span>مفتاح OpenAI</span>
        <input type="password" data-ai-setup-key placeholder="sk-..." value="${escapeHtml(settings.apiKey)}" autocomplete="off" spellcheck="false">
      </label>
      <label class="ai-config-field">
        <span>عنوان OpenAI</span>
        <input type="url" data-ai-setup-base-url placeholder="https://api.openai.com/v1" value="${escapeHtml(settings.openaiBaseUrl)}">
      </label>
      <label class="ai-config-toggle ai-config-toggle-inline">
        <input type="checkbox" data-ai-setup-cloud-enabled ${settings.cloudEnabled ? 'checked' : ''}>
        <span>فعّل OpenAI الخارجي مباشرة بعد الحفظ</span>
      </label>
      <div class="ai-setup-status" data-ai-setup-status>يمكنك التخطي الآن والرجوع لاحقًا من شاشة الذكاء.</div>
      <div class="ai-assistant-form-actions">
        <button type="button" data-ai-setup-save>حفظ وتفعيل</button>
        <button type="button" class="secondary" data-ai-setup-skip>لاحقًا</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const setStatus = (message, status = '') => {
    const node = overlay.querySelector('[data-ai-setup-status]');
    if (!node) return;
    node.className = `ai-setup-status${status ? ` ${status}` : ''}`;
    node.textContent = message;
  };

  overlay.querySelector('[data-ai-setup-skip]')?.addEventListener('click', () => {
    dismissInitialAiSetup();
    overlay.remove();
  });

  overlay.querySelector('[data-ai-setup-save]')?.addEventListener('click', async () => {
    const apiKey = String(overlay.querySelector('[data-ai-setup-key]')?.value || '').trim();
    const openaiBaseUrl = String(overlay.querySelector('[data-ai-setup-base-url]')?.value || '').trim();
    const cloudEnabled = !!overlay.querySelector('[data-ai-setup-cloud-enabled]')?.checked;

    if (!apiKey) {
      setStatus('اكتب مفتاح OpenAI أولًا.', 'error');
      return;
    }

    saveAiSettings({
      providerMode: 'direct',
      apiKey,
      openaiBaseUrl,
      cloudEnabled,
    });

    setStatus('جار فحص الاتصال المباشر...', 'loading');
    try {
      await fetchAiConnectionHealth(getAiSettings());
      dismissInitialAiSetup();
      state.aiConnectionStatus = {
        status: 'ok',
        message: 'تم حفظ مفتاح OpenAI بشكل مشفّر على هذا الجهاز، وأصبح الوضع المباشر جاهزًا.',
        networkUrls: [],
      };
      overlay.remove();
      if (state.currentPath === '__ai__') {
        renderAiAssistant();
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'تعذر التحقق من OpenAI مباشرة.', 'error');
    }
  });
}

function getAiSettings() {
  const runtimeDefaultServerUrl = normalizeAssistantServerUrl(getSuggestedAssistantServerUrl() || DEFAULT_AI_SETTINGS.serverUrl);
  return {
    ...DEFAULT_AI_SETTINGS,
    ...(state.aiSettings || {}),
    providerMode: normalizeAiProviderMode(state.aiSettings?.providerMode || DEFAULT_AI_SETTINGS.providerMode),
    serverUrl: normalizeAssistantServerUrl(state.aiSettings?.serverUrl || runtimeDefaultServerUrl),
    openaiBaseUrl: normalizeOpenAiBaseUrl(state.aiSettings?.openaiBaseUrl || DEFAULT_AI_SETTINGS.openaiBaseUrl),
    apiKey: String(state.aiSettings?.apiKey || '').trim(),
    preferredModelTier: normalizeAiModelTier(state.aiSettings?.preferredModelTier || DEFAULT_AI_SETTINGS.preferredModelTier),
  };
}

function saveAiSettings(nextSettings = {}) {
  const previous = getAiSettings();
  state.aiSettings = {
    ...previous,
    ...nextSettings,
    providerMode: normalizeAiProviderMode(nextSettings.providerMode ?? previous.providerMode),
    serverUrl: normalizeAssistantServerUrl(nextSettings.serverUrl ?? previous.serverUrl),
    openaiBaseUrl: normalizeOpenAiBaseUrl(nextSettings.openaiBaseUrl ?? previous.openaiBaseUrl),
    apiKey: String(nextSettings.apiKey ?? previous.apiKey ?? '').trim(),
    preferredModelTier: normalizeAiModelTier(nextSettings.preferredModelTier ?? previous.preferredModelTier),
  };
  store.set('aiSettings', sanitizeAiSettingsForStorage(state.aiSettings));
  void persistAiApiKeySecure(state.aiSettings.apiKey);
  return state.aiSettings;
}

function getAiActiveLesson() {
  const file = findById(state.currentFileId);
  if (!file) return null;

  return {
    id: file.id,
    title: file.title,
    sectionTitle: file.sectionTitle || '',
    summary: file.summary || '',
  };
}

function serializeLocalAssistantResponse(response) {
  if (!response) return null;
  return {
    title: response.title || '',
    intro: response.intro || '',
    bullets: response.bullets || [],
    references: (response.references || []).map((ref) => ({
      type: ref.type || '',
      id: ref.id || '',
      title: ref.title || '',
      meta: ref.meta || '',
      excerpt: ref.excerpt || '',
    })),
  };
}

function serializeLocalAssistantEvidence(response) {
  const evidence = response?.evidence;
  if (!evidence) return null;

  return {
    confidence: evidence.confidence || 'low',
    queryInfo: {
      rawQuery: evidence.queryInfo?.rawQuery || '',
      coreQuery: evidence.queryInfo?.coreQuery || '',
      comparisonTerms: evidence.queryInfo?.comparisonTerms || [],
      phrases: evidence.queryInfo?.phrases || [],
      explainIntent: !!evidence.queryInfo?.explainIntent,
    },
    files: (evidence.fileMatches || []).map((match) => ({
      title: match.file?.title || '',
      sectionTitle: match.file?.sectionTitle || '',
      summary: match.file?.summary || '',
      excerpt: match.excerpt || '',
      score: match.score || 0,
      matchedTerms: match.coverage?.matchedTerms || [],
      matchedPhrases: match.coverage?.matchedPhrases || [],
    })),
    glossary: (evidence.glossaryMatches || []).map((match) => ({
      arabic: match.term?.arabic || '',
      english: match.term?.english || '',
      definition: match.term?.definition || '',
      score: match.score || 0,
      matchedTerms: match.coverage?.matchedTerms || [],
    })),
    comparisons: (evidence.comparisonMatches || []).map((match) => ({
      concept: match.row?.concept || '',
      dynamics: match.row?.dynamics || '',
      oracle: match.row?.oracle || '',
      sap: match.row?.sap || '',
      note: match.row?.note || '',
      sourceTitle: match.table?.sourceTitle || match.table?.title || '',
      score: match.score || 0,
      matchedTerms: match.coverage?.matchedTerms || [],
      matchedPhrases: match.coverage?.matchedPhrases || [],
    })),
    scenarios: (evidence.scenarioMatches || []).map((match) => ({
      title: match.scenario?.title || '',
      summary: match.scenario?.summary || '',
      context: match.scenario?.context || '',
      score: match.score || 0,
    })),
  };
}

function mergeGroundedLocalResponse(localResponse, groundedLocalAnswer) {
  if (!localResponse || !groundedLocalAnswer || !Array.isArray(groundedLocalAnswer.bullets) || !groundedLocalAnswer.bullets.length) {
    return localResponse;
  }

  return {
    ...localResponse,
    title: groundedLocalAnswer.title || localResponse.title,
    intro: groundedLocalAnswer.intro || localResponse.intro,
    bullets: groundedLocalAnswer.bullets,
    groundedByAi: true,
    groundedConfidence: groundedLocalAnswer.confidence || localResponse.evidence?.confidence || 'medium',
  };
}

function buildRemoteAssistantPayload(query, localResponse, settings) {
  const contextPack = getAiContextDraft();
  return {
    query,
    includeWebSearch: !!settings.webEnabled,
    preferredModelTier: contextPack?.preferredModelTier || settings.preferredModelTier,
    localAnswer: serializeLocalAssistantResponse(localResponse),
    localEvidence: serializeLocalAssistantEvidence(localResponse),
    history: (state.aiAssistantHistory || []).slice(0, 4),
    activeLesson: getAiActiveLesson(),
    contextPack,
  };
}

async function fetchAiConnectionHealth(settings) {
  if (settings.providerMode === 'server') {
    const baseUrl = normalizeAssistantServerUrl(settings.serverUrl);
    if (!baseUrl) throw new Error('اكتب عنوان الخادم أولًا.');

    const res = await fetch(`${baseUrl}/health`);
    const payload = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(payload?.error || `تعذّر فحص الخادم (${res.status}).`);
    }
    return payload;
  }

  if (!settings.apiKey) throw new Error('اكتب مفتاح OpenAI أولًا.');
  const baseUrl = normalizeOpenAiBaseUrl(settings.openaiBaseUrl);
  const res = await fetch(`${baseUrl}/models`, {
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
    },
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(payload?.error?.message || `تعذّر فحص OpenAI مباشرة (${res.status}).`);
  }
  return {
    ok: true,
    keyConfigured: true,
    model: DIRECT_OPENAI_LIGHT_MODEL,
    heavyModel: DIRECT_OPENAI_HEAVY_MODEL,
    ttsModel: DIRECT_OPENAI_TTS_MODEL,
    ttsVoice: DIRECT_OPENAI_TTS_VOICE,
    ttsFormat: preferredLessonAudioFormat(),
    smartRouting: true,
    webSearchDefault: !!settings.webEnabled,
    networkUrls: [],
    directMode: true,
  };
}

async function requestDirectAssistant(query, localResponse) {
  const settings = getAiSettings();
  if (!settings.apiKey) throw new Error('ضع مفتاح OpenAI في إعدادات الذكاء أولًا.');

  const payload = buildRemoteAssistantPayload(query, localResponse, settings);
  const routing = resolveDirectModelRouting(payload, !!settings.webEnabled);
  const requestBody = {
    model: routing.model,
    input: [
      {
        role: 'system',
        content: [{
          type: 'input_text',
          text: 'أنت طبقة خارجية لمساعد دراسة ERP داخل تطبيق عربي. أعط جوابًا عربيًا واضحًا ومباشرًا. استخدم Markdown منظمًا: عناوين قصيرة، نقاط، وترقيم عند الحاجة. استخدم السياق المحلي المرسل كأرضية أولى دائمًا. إذا استخدمت الويب فلا تناقض السياق المحلي إلا إذا كان السياق المحلي غير كافٍ أو يحتاج تحديثًا، وعندها وضّح ذلك. لا تطلب من المستخدم مفتاح API ولا تذكر أسرارًا. لا تضع رموز استشهاد أو citations داخل النص مثل turn0search أو cite، واترك الروابط لقائمة المصادر فقط. اجعل الجواب مختصرًا وعمليًا.',
        }],
      },
      {
        role: 'user',
        content: [{
          type: 'input_text',
          text: buildRemoteAssistantPrompt(payload),
        }],
      },
    ],
  };

  if (settings.webEnabled) {
    requestBody.tools = [{ type: 'web_search' }];
  }

  const baseUrl = normalizeOpenAiBaseUrl(settings.openaiBaseUrl);
  const doRequest = async (includeWeb) => {
    const body = { ...requestBody };
    if (includeWeb) body.tools = [{ type: 'web_search' }];
    else delete body.tools;
    const res = await fetch(`${baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(result?.error?.message || `فشل طلب OpenAI مباشرة (${res.status}).`);
    }
    return {
      ok: true,
      provider: 'openai-direct',
      model: result.model || routing.model,
      modelTier: routing.modelTier,
      escalated: routing.escalated,
      routingReason: routing.reason,
      usedWebSearch: !!includeWeb,
      answer: extractOpenAiOutputText(result),
      sources: extractOpenAiSources(result),
      groundedLocalAnswer: null,
    };
  };

  try {
    return await doRequest(!!settings.webEnabled);
  } catch (error) {
    if (settings.webEnabled && shouldRetryWithoutWebSearch(error)) {
      const fallback = await doRequest(false);
      return {
        ...fallback,
        warning: 'المودل الحالي لم يقبل بحث الويب في هذا الطلب، لذلك أُعيدت الإجابة مباشرة بدون تصفح.',
      };
    }
    throw error;
  }
}

async function requestRemoteAssistant(query, localResponse) {
  const settings = getAiSettings();
  if (settings.providerMode === 'direct') {
    return requestDirectAssistant(query, localResponse);
  }

  const baseUrl = normalizeAssistantServerUrl(settings.serverUrl);
  if (!baseUrl) throw new Error('عنوان الخادم غير مضبوط.');
  const payload = buildRemoteAssistantPayload(query, localResponse, settings);

  const res = await fetch(`${baseUrl}/api/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error || `فشل طلب OpenAI (${res.status}).`);
  }

  return body;
}

async function runAiAssistantQuery(nextQuery) {
  const query = String(nextQuery || '').trim();
  const localResponse = buildAssistantResponse(query);
  const settings = getAiSettings();

  if (query && localResponse) {
    saveAiAssistantHistory(query, localResponse);
  }

  const remoteConfigured = settings.providerMode === 'direct'
    ? !!settings.apiKey
    : !!settings.serverUrl;
  const shouldCallRemote = !!(query && localResponse && settings.cloudEnabled && remoteConfigured);
  renderAiAssistant(query, localResponse, shouldCallRemote ? {
    status: 'loading',
    intro: settings.providerMode === 'direct'
      ? (settings.webEnabled
          ? 'جارٍ طلب OpenAI مباشرة من الهاتف مع السماح ببحث الويب إذا كان مدعومًا.'
          : 'جارٍ طلب OpenAI مباشرة من الهاتف مع الاعتماد على السياق المحلي فقط.')
      : (settings.webEnabled
          ? 'جارٍ طلب تعزيز خارجي من OpenAI مع السماح ببحث الويب إذا كان مدعومًا على الخادم.'
          : 'جارٍ طلب تعزيز خارجي من OpenAI مع الاعتماد على الملفات المحلية والسياق المرسل فقط.'),
  } : null);

  if (!shouldCallRemote) return;

  const requestToken = state.aiRequestToken + 1;
  state.aiRequestToken = requestToken;

  try {
    const remoteResponse = await requestRemoteAssistant(query, localResponse);
    if (state.aiRequestToken !== requestToken) return;
    renderAiAssistant(query, mergeGroundedLocalResponse(localResponse, remoteResponse.groundedLocalAnswer), { status: 'ready', ...remoteResponse });
  } catch (error) {
    if (state.aiRequestToken !== requestToken) return;
    renderAiAssistant(query, localResponse, {
      status: 'error',
      error: error instanceof Error ? error.message : 'تعذر الوصول إلى الخادم الخارجي.',
    });
  }
}

function renderAiAssistant(query = '', response = null, remoteResponse = null) {
  clearReaderContext('المساعد الذكي', 'محلي أولًا مع خيار تعزيز خارجي آمن');

  const historyItems = (state.aiAssistantHistory || []).slice(0, 4);
  const bundleCount = state.aiKnowledge?.summary?.contentFiles || Object.keys(state.aiKnowledge?.knowledge?.contentBundle || {}).length || 0;
  const settings = getAiSettings();
  const connectionStatus = state.aiConnectionStatus;
  const contextPack = getAiContextDraft();
  const usingDirectMode = settings.providerMode === 'direct';
  const suggestedServerUrls = [...new Set([
    getSuggestedAssistantServerUrl(),
    ...((connectionStatus?.networkUrls || []).map((url) => normalizeAssistantServerUrl(url))),
  ].filter(Boolean))];
  const referencesHtml = (response?.references || []).map((ref) => `
    <button class="ai-reference-item" data-ai-open-file="${escapeHtml(ref.id || '')}">
      <strong>${escapeHtml(ref.title)}</strong>
      <span>${escapeHtml(ref.meta || '')}</span>
      ${ref.excerpt ? `<small>${escapeHtml(ref.excerpt)}</small>` : ''}
    </button>
  `).join('');

  const actionsHtml = (response?.actions || []).map((action) => {
    if (action.type === 'open-file') {
      return `<button data-ai-action="open-file" data-file-id="${escapeHtml(action.id)}">${escapeHtml(action.label)}</button>`;
    }
    return `<button data-ai-action="${escapeHtml(action.type)}">${escapeHtml(action.label)}</button>`;
  }).join('');
  const localAnswerMetaHtml = response?.groundedByAi
    ? `<div class="ai-local-answer-meta">
        <span class="study-aid-label">صياغة محلية محسّنة</span>
        <span>من شواهد التطبيق فقط</span>
        <strong>${escapeHtml(response.groundedConfidence === 'high' ? 'ثقة عالية' : response.groundedConfidence === 'medium' ? 'ثقة متوسطة' : 'ثقة منخفضة')}</strong>
      </div>`
    : response?.evidence?.confidence
      ? `<div class="ai-local-answer-meta subtle">
          <span>ثقة الاسترجاع المحلي</span>
          <strong>${escapeHtml(response.evidence.confidence === 'high' ? 'عالية' : response.evidence.confidence === 'medium' ? 'متوسطة' : 'منخفضة')}</strong>
        </div>`
      : '';

  const connectionStatusHtml = connectionStatus
    ? `<div class="ai-connection-status ${escapeHtml(connectionStatus.status || '')}">${escapeHtml(connectionStatus.message || '')}</div>`
    : `<div class="ai-connection-status hint">${usingDirectMode ? 'في الوضع المباشر، ضع مفتاح OpenAI داخل التطبيق وسيُحفظ محليًا بشكل مشفّر على هذا الجهاز فقط.' : 'في وضع الخادم، ضع المفتاح على الخادم فقط، واكتب عنوانًا يمكن للهاتف الوصول إليه.'}</div>`;
  const networkSuggestionsHtml = !usingDirectMode && suggestedServerUrls.length
    ? `<div class="ai-network-suggestions">
        <span>عناوين جاهزة للخادم:</span>
        <div class="ai-network-suggestion-list">${suggestedServerUrls.map((url) => `
          <button type="button" class="secondary ai-inline-action" data-ai-use-server-url="${escapeHtml(url)}">${escapeHtml(url)}</button>
        `).join('')}</div>
      </div>`
    : '';

  const modelTierLabel = settings.preferredModelTier === 'heavy'
    ? 'إجباري قوي'
    : settings.preferredModelTier === 'light'
      ? 'إجباري خفيف'
      : 'ذكي تلقائي';

  let remoteBadge = settings.cloudEnabled
    ? (usingDirectMode
        ? (settings.webEnabled ? 'OpenAI مباشر + Web' : 'OpenAI مباشر')
        : (settings.webEnabled ? 'OpenAI + Web' : 'OpenAI فقط'))
    : 'محلي فقط';
  const contextItemsHtml = (contextPack?.items || []).map((item) => `
    <div class="ai-context-item">
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.value)}</span>
    </div>
  `).join('');
  const contextCardHtml = contextPack ? `
    <section class="ai-assistant-card ai-context-card">
      <div class="section-title-row">
        <h2>${escapeHtml(contextPack.sourceLabel || 'السياق الحالي')}</h2>
        <button type="button" class="secondary ai-inline-action" data-ai-clear-context>مسح السياق</button>
      </div>
      <p class="ai-context-summary">${escapeHtml(contextPack.summary || 'هناك سياق إضافي مرتبط بهذا السؤال.')}</p>
      ${contextPack.details ? `<p class="ai-context-details">${escapeHtml(contextPack.details)}</p>` : ''}
      ${contextItemsHtml ? `<div class="ai-context-grid">${contextItemsHtml}</div>` : ''}
    </section>
  ` : '';

  let remoteIntro = 'التعزيز الخارجي متوقف الآن. سيستمر المساعد المحلي في العمل من ملفاتك المضمّنة فقط.';
  let remoteBodyHtml = `<div class="ai-remote-note">${usingDirectMode ? 'فعّل OpenAI الخارجي وضع مفتاحك داخل التطبيق إذا أردت أن يعمل الذكاء مباشرة من الهاتف بدون خادم منفصل.' : 'فعّل OpenAI الخارجي واكتب عنوان الخادم إذا أردت دمج المساعد المحلي مع إجابة سحابية وبحث ويب.'}</div>`;
  let remoteWarningHtml = '';
  let remoteSourcesHtml = '';
  let remoteRoutingHtml = '';
  let remoteMetaHtml = '';

  if (remoteResponse?.status === 'loading') {
    remoteIntro = remoteResponse.intro || 'جارٍ طلب التعزيز الخارجي...';
    remoteBodyHtml = '<div class="ai-remote-note">انتظر لحظة حتى يعود الخادم بالإجابة الموحّدة.</div>';
  } else if (remoteResponse?.status === 'error') {
    remoteIntro = 'تعذر جلب التعزيز الخارجي حاليًا، لكن الجواب المحلي ما زال متاحًا في الأعلى.';
    remoteBodyHtml = `<div class="ai-remote-warning">${escapeHtml(remoteResponse.error || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم الخارجي.')}</div>`;
  } else if (remoteResponse?.status === 'ready') {
    if (remoteResponse.modelTier === 'heavy') {
      remoteBadge = `${remoteBadge} · ثقيل`;
    }
    remoteIntro = remoteResponse.usedWebSearch
      ? 'هذه طبقة خارجية من OpenAI مع بحث ويب عندما تكون النتيجة بحاجة إلى توسيع أو تحديث.'
      : 'هذه طبقة خارجية من OpenAI بدون استخدام بحث ويب في هذه الإجابة.';
    remoteBodyHtml = renderRemoteAssistantBody(remoteResponse.answer);
    remoteWarningHtml = remoteResponse.warning
      ? `<div class="ai-remote-warning">${escapeHtml(remoteResponse.warning)}</div>`
      : '';
    remoteMetaHtml = `<div class="ai-remote-meta-grid">
        <div class="ai-remote-meta-card">
          <span>المودل</span>
          <strong>${escapeHtml(remoteResponse.model || 'غير ظاهر')}</strong>
        </div>
        <div class="ai-remote-meta-card">
          <span>حالة التوجيه</span>
          <strong>${remoteResponse.escalated ? 'تصعيد إلى مودل أقوى' : 'المودل الاقتصادي كافٍ'}</strong>
        </div>
        <div class="ai-remote-meta-card">
          <span>طريقة الاستخدام</span>
          <strong>${remoteResponse.usedWebSearch ? 'OpenAI مع Web' : 'OpenAI بدون Web'}</strong>
        </div>
      </div>`;
    remoteRoutingHtml = remoteResponse.routingReason
      ? `<div class="ai-routing-meta"><strong>${escapeHtml(remoteResponse.routingReason)}</strong></div>`
      : '';
    remoteSourcesHtml = (remoteResponse.sources || []).length
      ? `<div class="ai-remote-sources-wrap">
          <div class="section-title-row"><h2>مصادر الويب</h2></div>
          <div class="ai-remote-sources">${(remoteResponse.sources || []).map((source) => `
          <a class="ai-web-source" href="${escapeHtml(source.url || '')}" target="_blank" rel="noreferrer">
            <strong>${escapeHtml(source.title || source.url || 'رابط خارجي')}</strong>
            <span>${escapeHtml(source.url || '')}</span>
          </a>
        `).join('')}</div>
        </div>`
      : '';
  }

  $content.innerHTML = `
    <div class="ai-assistant-view">
      <div class="ai-assistant-hero">
        <div>
          <div class="study-aid-label">مساعد هجين: محلي + خارجي</div>
          <h1>اسأل من ملفات الدراسة، ثم وسّع الجواب خارجيًا عند الحاجة</h1>
          <p>المسار الحالي يبدأ من محتوى التطبيق المضمّن أولًا، ويمكنه بعد ذلك طلب OpenAI مباشرة من الهاتف بمفتاح محفوظ محليًا، أو عبر خادم خارجي إذا أردت ذلك.</p>
        </div>
        <div class="ai-assistant-stats">
          <strong>${bundleCount}</strong>
          <span>ملف معرفة محلي</span>
        </div>
      </div>

      ${contextCardHtml}

      <form class="ai-assistant-form" data-ai-form>
        <textarea data-ai-query placeholder="مثال: ما الفرق بين BOM وRoute؟ أو ماذا أدرس الآن؟">${escapeHtml(query)}</textarea>
        <div class="ai-assistant-form-actions">
          <button type="submit">اسأل المساعد</button>
          <button type="button" class="secondary" data-ai-prompt="ماذا أدرس الآن؟">ماذا أدرس الآن؟</button>
          <button type="button" class="secondary" data-ai-prompt="ما الفرق بين BOM وRoute؟">BOM vs Route</button>
          <button type="button" class="secondary" data-ai-prompt="قارن أوامر الإنتاج بين Dynamics وSAP">قارن الأنظمة</button>
        </div>
      </form>

      <section class="ai-assistant-card ai-assistant-config">
        <div class="section-title-row">
          <h2>الربط الخارجي</h2>
        </div>
        <div class="ai-config-grid">
          <label class="ai-config-field">
            <span>وضع الاتصال</span>
            <select data-ai-provider-mode>
              <option value="direct" ${usingDirectMode ? 'selected' : ''}>مباشر من الهاتف</option>
              <option value="server" ${!usingDirectMode ? 'selected' : ''}>عبر خادم</option>
            </select>
          </label>
          <label class="ai-config-field">
            <span>مفتاح OpenAI</span>
            <input type="password" data-ai-api-key placeholder="sk-..." value="${escapeHtml(settings.apiKey)}" autocomplete="off" spellcheck="false">
          </label>
          <label class="ai-config-field">
            <span>عنوان OpenAI</span>
            <input type="url" data-ai-openai-base-url placeholder="https://api.openai.com/v1" value="${escapeHtml(settings.openaiBaseUrl)}">
          </label>
          <label class="ai-config-field">
            <span>عنوان الخادم (اختياري لوضع الخادم)</span>
            <input type="url" data-ai-server-url placeholder="https://assistant.example.com" value="${escapeHtml(settings.serverUrl)}">
          </label>
          <label class="ai-config-toggle">
            <input type="checkbox" data-ai-cloud-enabled ${settings.cloudEnabled ? 'checked' : ''}>
            <span>تفعيل OpenAI الخارجي</span>
          </label>
          <label class="ai-config-toggle">
            <input type="checkbox" data-ai-web-enabled ${settings.webEnabled ? 'checked' : ''}>
            <span>السماح ببحث الإنترنت</span>
          </label>
          <label class="ai-config-field">
            <span>توجيه المودل</span>
            <select data-ai-model-tier>
              <option value="auto" ${settings.preferredModelTier === 'auto' ? 'selected' : ''}>ذكي تلقائي</option>
              <option value="light" ${settings.preferredModelTier === 'light' ? 'selected' : ''}>خفيف دائمًا</option>
              <option value="heavy" ${settings.preferredModelTier === 'heavy' ? 'selected' : ''}>قوي دائمًا</option>
            </select>
          </label>
        </div>
        <div class="ai-assistant-form-actions">
          <button type="button" class="secondary" data-ai-save-settings>حفظ الإعدادات</button>
          <button type="button" class="secondary" data-ai-check-server>فحص الاتصال</button>
        </div>
        ${connectionStatusHtml}
        ${networkSuggestionsHtml}
      </section>

      <div class="ai-assistant-grid">
        <section class="ai-assistant-card ai-assistant-answer">
          <div class="section-title-row">
            <h2>${escapeHtml(response?.title || 'الجواب سيظهر هنا')}</h2>
          </div>
          ${localAnswerMetaHtml}
          <p class="ai-answer-intro">${escapeHtml(response?.intro || 'اكتب سؤالًا مرتبطًا بمحتوى الدراسة أو اطلب خطة دراسية من حالتك الحالية.')}</p>
          ${(response?.bullets || []).length ? `
            <div class="ai-answer-list">
              ${(response.bullets || []).map((bullet) => `<div class="ai-answer-point">${escapeHtml(bullet)}</div>`).join('')}
            </div>
          ` : ''}
          ${actionsHtml ? `<div class="ai-assistant-actions">${actionsHtml}</div>` : ''}
        </section>

        <section class="ai-assistant-card">
          <div class="section-title-row">
            <h2>المراجع المحلية</h2>
          </div>
          <div class="ai-reference-list">
            ${referencesHtml || '<div class="challenge-empty">اسأل سؤالًا لعرض المراجع الأكثر صلة وفتحها مباشرة.</div>'}
          </div>
        </section>
      </div>

      <section class="ai-assistant-card ai-remote-answer">
        <div class="section-title-row">
          <h2>التعزيز الخارجي</h2>
          <span class="study-aid-label">${escapeHtml(remoteBadge)}</span>
        </div>
        <p class="ai-answer-intro">${escapeHtml(remoteIntro)}</p>
        <div class="ai-route-hint">وضع التوجيه الحالي: ${escapeHtml(modelTierLabel)}</div>
        ${remoteMetaHtml}
        ${remoteRoutingHtml}
        ${remoteBodyHtml}
        ${remoteWarningHtml}
        ${remoteSourcesHtml}
      </section>

      <section class="ai-assistant-card ai-assistant-history">
        <div class="section-title-row">
          <h2>آخر الأسئلة</h2>
        </div>
        <div class="ai-history-list">
          ${historyItems.length ? historyItems.map((item) => `
            <button class="ai-history-item" data-ai-prompt="${escapeHtml(item.query)}">
              <strong>${escapeHtml(item.query)}</strong>
              <span>${escapeHtml(item.title || item.intro || '')}</span>
            </button>
          `).join('') : '<div class="challenge-empty">لا يوجد سجل بعد.</div>'}
        </div>
      </section>
    </div>
  `;

  $content.querySelector('[data-ai-form]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const nextQuery = $content.querySelector('[data-ai-query]')?.value.trim();
    runAiAssistantQuery(nextQuery);
  });

  $content.querySelectorAll('[data-ai-prompt]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextQuery = button.dataset.aiPrompt || '';
      runAiAssistantQuery(nextQuery);
    });
  });

  $content.querySelector('[data-ai-clear-context]')?.addEventListener('click', () => {
    setAiContextDraft(null);
    renderAiAssistant(query, response, remoteResponse);
  });

  $content.querySelectorAll('[data-ai-use-server-url]').forEach((button) => {
    button.addEventListener('click', () => {
      saveAiSettings({ serverUrl: button.dataset.aiUseServerUrl || settings.serverUrl });
      state.aiConnectionStatus = {
        ...(state.aiConnectionStatus || {}),
        status: 'saved',
        message: 'تم تعبئة عنوان الخادم المقترح. احفظ أو افحص الاتصال الآن.',
        networkUrls: connectionStatus?.networkUrls || [],
      };
      renderAiAssistant(query, response, remoteResponse);
    });
  });

  const readAiSettingsFromView = () => saveAiSettings({
    providerMode: $content.querySelector('[data-ai-provider-mode]')?.value || 'direct',
    apiKey: $content.querySelector('[data-ai-api-key]')?.value || '',
    openaiBaseUrl: $content.querySelector('[data-ai-openai-base-url]')?.value || DIRECT_OPENAI_BASE_URL,
    serverUrl: $content.querySelector('[data-ai-server-url]')?.value || '',
    cloudEnabled: !!$content.querySelector('[data-ai-cloud-enabled]')?.checked,
    webEnabled: !!$content.querySelector('[data-ai-web-enabled]')?.checked,
    preferredModelTier: $content.querySelector('[data-ai-model-tier]')?.value || 'auto',
  });

  $content.querySelector('[data-ai-save-settings]')?.addEventListener('click', () => {
    const nextSettings = readAiSettingsFromView();
    state.aiConnectionStatus = {
      status: 'saved',
      message: nextSettings.providerMode === 'direct'
        ? (nextSettings.apiKey
            ? `تم حفظ الإعدادات محليًا بشكل مشفّر على هذا الجهاز. الوضع الحالي: OpenAI مباشر. توجيه المودل: ${nextSettings.preferredModelTier}.`
            : 'تم حفظ الإعدادات، لكن مفتاح OpenAI ما يزال فارغًا.')
        : (nextSettings.serverUrl
            ? `تم حفظ الإعدادات محليًا. الوضع الحالي: عبر خادم. توجيه المودل: ${nextSettings.preferredModelTier}.`
            : 'تم حفظ الإعدادات، لكن عنوان الخادم ما يزال فارغًا.'),
    };
    renderAiAssistant(query, response, remoteResponse);
  });

  $content.querySelector('[data-ai-check-server]')?.addEventListener('click', async () => {
    const nextSettings = readAiSettingsFromView();
    if (nextSettings.providerMode === 'server' && !nextSettings.serverUrl) {
      state.aiConnectionStatus = {
        status: 'error',
        message: 'اكتب عنوان الخادم أولًا ثم أعد الفحص.',
      };
      renderAiAssistant(query, response, remoteResponse);
      return;
    }

    if (nextSettings.providerMode === 'direct' && !nextSettings.apiKey) {
      state.aiConnectionStatus = {
        status: 'error',
        message: 'اكتب مفتاح OpenAI أولًا ثم أعد الفحص.',
      };
      renderAiAssistant(query, response, remoteResponse);
      return;
    }

    state.aiConnectionStatus = {
      status: 'loading',
      message: nextSettings.providerMode === 'direct' ? 'جار فحص OpenAI مباشرة...' : 'جار فحص الخادم...',
    };
    renderAiAssistant(query, response, remoteResponse);

    try {
      const health = await fetchAiConnectionHealth(nextSettings);
      const parts = [nextSettings.providerMode === 'direct' ? 'OpenAI يجيب مباشرة بنجاح.' : 'الخادم يجيب بنجاح.'];
      parts.push(health.keyConfigured ? 'المفتاح مضبوط.' : 'المفتاح غير مضبوط بعد.');
      if (health.model) parts.push(`المودل الخفيف: ${health.model}.`);
      if (health.heavyModel) parts.push(`المودل الأقوى: ${health.heavyModel}.`);
      if (health.smartRouting) parts.push('التصعيد الذكي مفعل.');
      if (health.webSearchDefault) parts.push('بحث الويب مفعل افتراضيًا.');
      state.aiConnectionStatus = {
        status: 'ok',
        message: parts.join(' '),
        networkUrls: health.networkUrls || [],
      };
    } catch (error) {
      state.aiConnectionStatus = {
        status: 'error',
        message: error instanceof Error ? error.message : 'تعذر الوصول إلى الخادم.',
      };
    }

    renderAiAssistant(query, response, remoteResponse);
  });

  $content.querySelectorAll('[data-ai-open-file]').forEach((button) => {
    button.addEventListener('click', () => loadFile(button.dataset.aiOpenFile));
  });

  $content.querySelectorAll('[data-ai-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.dataset.aiAction;
      if (action === 'open-file') loadFile(button.dataset.fileId);
      else if (action === 'review') showReviewQueue();
      else if (action === 'dashboard') showDashboard();
    });
  });
}

/* ─── Welcome screen stats ─────────────────────────────────── */
function updateWelcomeStats() {
  const statsEl = $('welcome-stats');
  if (!statsEl) return;
  const done = doneCount();
  const total = totalCount();
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const due = dueReviewItems().length;
  const mistakes = Object.keys(state.mistakes).length;
  statsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-num">${done}</div>
      <div class="stat-label">منتهية</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${total - done}</div>
      <div class="stat-label">متبقية</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${pct}%</div>
      <div class="stat-label">مكتمل</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${due}</div>
      <div class="stat-label">مراجعة</div>
    </div>
    <div class="stat-card">
      <div class="stat-num">${mistakes}</div>
      <div class="stat-label">أخطاء</div>
    </div>
  `;
}

/* ─── Continue button ──────────────────────────────────────── */
$('btn-continue').addEventListener('click', () => {
  const lastId = store.get('last');
  if (lastId && findById(lastId)) {
    loadFile(lastId);
  } else {
    // Open first trackable item
    const first = state.allItems.find(f => f.trackable);
    if (first) loadFile(first.id);
  }
});

/* ─── Content bundle (for APK / offline) ───────────────────── */
async function fetchJsonOrNull(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (_) {
    return null;
  }
}

async function loadStudyData() {
  const [contentIndex, studyMetadata, domainConfig, glossary, flashcards, clozeBank, quizBank, systemComparisons, interviewBank, cheatSheets, concepts, aiKnowledge] = await Promise.all([
    fetchJsonOrNull('content-index.json'),
    fetchJsonOrNull('study-metadata.json'),
    fetchJsonOrNull('domain-config.json'),
    fetchJsonOrNull('glossary.json'),
    fetchJsonOrNull('flashcards.json'),
    fetchJsonOrNull('cloze-bank.json'),
    fetchJsonOrNull('quiz-bank.json'),
    fetchJsonOrNull('system-comparisons.json'),
    fetchJsonOrNull('interview-bank.json'),
    fetchJsonOrNull('cheatsheets.json'),
    fetchJsonOrNull('concepts.json'),
    fetchJsonOrNull('ai-knowledge-base.json'),
  ]);
  const scenariosData = await fetchJsonOrNull('scenarios.json');

  state.contentIndex = contentIndex;
  state.aiKnowledge = aiKnowledge;
  state.studyMetadata = studyMetadata;
  state.domainConfig = domainConfig;
  state.glossaryTerms = glossary?.terms || [];
  const termCards = (flashcards?.cards || []).map(c => ({ ...c, type: c.type || 'term' }));
  const clozeCards = (clozeBank?.cards || []).map(c => ({ ...c, type: 'cloze' }));
  state.flashcards = [...termCards, ...clozeCards];
  state.quizBank = quizBank?.quizzes || [];
  state.systemComparisons = systemComparisons?.tables || [];
  state.interviewBank = interviewBank?.questions || [];
  state.cheatSheets = cheatSheets?.sheets || [];
  state.concepts = concepts || { atoms: [], edges: [] };
  state.scenarios = scenariosData?.scenarios || [];

  if (domainConfig?.appTitle) {
    const title = $('book-title');
    if (title) title.textContent = domainConfig.appTitle;
    document.title = domainConfig.appTitle;
  }
}

async function loadContentBundle() {
  try {
    const res = await fetch('content-bundle.json');
    if (!res.ok) return;
    const bundle = await res.json();
    let count = 0;
    Object.keys(bundle).forEach(fileId => {
      const file = findById(fileId);
      if (file) { state.contentCache[file.path] = bundle[fileId]; count++; }
    });
    if (count > 0) {
      state.searchIndexReady = true;
      $srchStat.textContent = `جاهز للبحث في ${count} ملف`;
    }
  } catch (_) {}
}

/* ─── Init ─────────────────────────────────────────────────── */
async function init() {
  await hydrateAiSecureSettings();
  await loadStudyData();
  buildItemsList();
  syncReadingToolsLayout();
  setDark(state.dark);
  setFontScale(state.fontScale);
  setFocusMode(state.focusMode);
  setSidebar(state.sidebarOpen);
  renderSidebar();
  updateNotesButton();
  updateProgress();
  updateWelcomeStats();

  // Load bundle (APK mode or pre-built web mode)
  await loadContentBundle();

  // Auto-open last file
  const lastId = store.get('last');
  if (lastId && findById(lastId)) {
    loadFile(lastId);
  } else {
    showDashboard();
  }

  renderInitialAiSetupOverlay();
}

init();
