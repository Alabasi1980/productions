const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');

loadEnvFile('.env');
loadEnvFile('.env.local');

const PORT = Number(process.env.PORT || 8787);
const OPENAI_BASE_URL = String(process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const DEFAULT_MODEL = String(process.env.OPENAI_MODEL || 'gpt-5.4-nano').trim();
const HEAVY_MODEL = String(process.env.OPENAI_HEAVY_MODEL || 'gpt-5.4-mini').trim();
const DEFAULT_TTS_MODEL = String(process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts').trim();
const DEFAULT_TTS_VOICE = String(process.env.OPENAI_TTS_VOICE || 'alloy').trim();
const DEFAULT_TTS_FORMAT = String(process.env.OPENAI_TTS_FORMAT || 'opus').trim().toLowerCase();
const SMART_MODEL_ROUTING = parseBoolean(process.env.OPENAI_SMART_ROUTING, true);
const DEFAULT_WEB_SEARCH = parseBoolean(process.env.OPENAI_WEB_SEARCH, true);
const MAX_TTS_CHARS = Number(process.env.OPENAI_TTS_MAX_CHARS || 4000);
const SUPPORTED_TTS_FORMATS = new Set(['opus', 'mp3', 'aac']);

const HEAVY_QUERY_PATTERNS = [
  /قارن.*(بتفصيل|تفصيلي|تفصيلاً|بعمق)/i,
  /(حلل|تحليل|فسر|اشرح لي لماذا|جذر|جذور|سبب|أسباب)/i,
  /(خطة|خارطة|roadmap|implementation|rollout|uat|go-live|تصميم|معمارية|architecture)/i,
  /(سيناريو|استثناء|انحراف|variance|kpi|تكلفة|تكاليف|تسوية|mrp|capacity)/i,
  /(oracle|sap|dynamics|odoo).*(oracle|sap|dynamics|odoo)/i,
  /(مقارنة|مقارن|اختلافات|trade-?off|best practice|gap analysis)/i,
];

function loadEnvFile(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return;

  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function parseBoolean(value, fallback = false) {
  if (value == null || value === '') return fallback;
  return !/^(false|0|no|off)$/i.test(String(value).trim());
}

function getNetworkUrls() {
  const urls = new Set();
  const interfaces = os.networkInterfaces();

  Object.values(interfaces).forEach((items) => {
    (items || []).forEach((item) => {
      if (!item || item.internal || item.family !== 'IPv4') return;
      urls.add(`http://${item.address}:${PORT}`);
    });
  });

  return [...urls].slice(0, 6);
}

function applyCommonHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'X-TTS-Model, X-TTS-Voice, X-TTS-Format, X-Audio-Bytes');
}

function applyJsonHeaders(res) {
  applyCommonHeaders(res);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

function sendJson(res, statusCode, payload) {
  applyJsonHeaders(res);
  res.writeHead(statusCode);
  res.end(JSON.stringify(payload));
}

function sendBinary(res, statusCode, payload, contentType, extraHeaders = {}) {
  applyCommonHeaders(res);
  res.setHeader('Content-Type', contentType);
  Object.entries(extraHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.writeHead(statusCode);
  res.end(payload);
}

function resolveTtsFormat(value) {
  const normalized = String(value || DEFAULT_TTS_FORMAT).trim().toLowerCase();
  return SUPPORTED_TTS_FORMATS.has(normalized) ? normalized : DEFAULT_TTS_FORMAT;
}

function getTtsContentType(format) {
  if (format === 'opus') return 'audio/ogg; codecs=opus';
  if (format === 'aac') return 'audio/aac';
  return 'audio/mpeg';
}

async function readJsonBody(req) {
  const chunks = [];
  let totalLength = 0;

  for await (const chunk of req) {
    const piece = Buffer.from(chunk);
    totalLength += piece.length;
    if (totalLength > 2 * 1024 * 1024) {
      throw new Error('الطلب أكبر من الحد المسموح.');
    }
    chunks.push(piece);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function buildPrompt(body) {
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

function buildGroundedLocalPrompt(body) {
  const evidence = body.localEvidence || {};
  const queryInfo = evidence.queryInfo || {};
  const filesText = Array.isArray(evidence.files)
    ? evidence.files
        .slice(0, 4)
        .map((item, index) => `${index + 1}. ${item.title || ''} | ${item.sectionTitle || ''} | ${item.summary || ''} | مقتطف: ${item.excerpt || ''}`)
        .join('\n')
    : '';
  const glossaryText = Array.isArray(evidence.glossary)
    ? evidence.glossary
        .slice(0, 4)
        .map((item, index) => `${index + 1}. ${item.arabic || ''} ${item.english ? `(${item.english})` : ''} => ${item.definition || ''}`)
        .join('\n')
    : '';
  const comparisonsText = Array.isArray(evidence.comparisons)
    ? evidence.comparisons
        .slice(0, 3)
        .map((item, index) => `${index + 1}. ${item.concept || ''} | Dynamics: ${item.dynamics || '-'} | Oracle: ${item.oracle || '-'} | SAP: ${item.sap || '-'} | ملاحظة: ${item.note || ''}`)
        .join('\n')
    : '';
  const scenariosText = Array.isArray(evidence.scenarios)
    ? evidence.scenarios
        .slice(0, 2)
        .map((item, index) => `${index + 1}. ${item.title || ''} | ${item.summary || ''} | ${item.context || ''}`)
        .join('\n')
    : '';

  return [
    'مهمة هذا الطلب: صياغة إجابة محلية فقط من الشواهد التالية بدون أي معرفة خارجية.',
    `سؤال المستخدم الأصلي: ${body.query || ''}`,
    `جوهر السؤال بعد التنظيف: ${queryInfo.coreQuery || body.query || ''}`,
    `هل السؤال يطلب شرح المطلوب فقط؟ ${queryInfo.explainIntent ? 'نعم' : 'لا'}`,
    `مستوى الثقة الأولي من الاسترجاع: ${evidence.confidence || 'low'}`,
    queryInfo.comparisonTerms?.length ? `المفاهيم الأساسية: ${queryInfo.comparisonTerms.join(' | ')}` : '',
    queryInfo.phrases?.length ? `العبارات الأساسية: ${queryInfo.phrases.join(' | ')}` : '',
    filesText ? ['', 'ملفات محلية مرشحة:', filesText] : [],
    glossaryText ? ['', 'مصطلحات من القاموس:', glossaryText] : [],
    comparisonsText ? ['', 'صفوف مقارنة أنظمة:', comparisonsText] : [],
    scenariosText ? ['', 'سيناريوهات مرتبطة:', scenariosText] : [],
    '',
    'أعد JSON صالحًا فقط بهذا الشكل تمامًا:',
    '{"title":"...","intro":"...","bullets":["..."],"confidence":"high|medium|low"}',
    'القواعد:',
    '1. استخدم فقط المعلومات الموجودة أعلاه.',
    '2. إذا كان السؤال يطلب شرح المطلوب فقط فلا تعطِ الحل الكامل، بل وضح ماذا يطلب السؤال وكيف يضبط الطالب زاوية الفهم.',
    '3. إذا كانت الشواهد غير كافية فقل ذلك بوضوح واجعل confidence منخفضًا.',
    '4. اكتب intro سطرًا واحدًا قصيرًا، و3 إلى 5 bullets عملية.',
    '5. لا تذكر الويب ولا OpenAI ولا أي مصدر خارجي.',
  ].flat().filter(Boolean).join('\n');
}

function resolveModelRouting(body, includeWebSearch) {
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

  if (preferredTier === 'light' || !SMART_MODEL_ROUTING || !HEAVY_MODEL || HEAVY_MODEL === DEFAULT_MODEL) {
    return {
      model: DEFAULT_MODEL,
      modelTier: 'light',
      escalated: false,
      reason: preferredTier === 'light' ? 'تم طلب المودل الخفيف صراحة.' : 'المودل الخفيف هو الافتراضي الحالي.',
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
    model: shouldEscalate ? HEAVY_MODEL : DEFAULT_MODEL,
    modelTier: shouldEscalate ? 'heavy' : 'light',
    escalated: shouldEscalate,
    reason: shouldEscalate
      ? reasons[0] || 'تم التصعيد تلقائيًا بسبب ثقل الطلب.'
      : 'المودل الخفيف كافٍ لهذا النوع من الأسئلة.',
  };
}

function extractOutputText(payload) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === 'output_text' && content.text) {
        parts.push(content.text);
      }
    }
  }
  return parts.join('\n\n').trim();
}

function parseJsonText(text) {
  const cleaned = String(text || '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  if (!cleaned) return null;
  return JSON.parse(cleaned);
}

function extractSources(payload) {
  const sources = [];
  const seen = new Set();

  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      for (const annotation of content.annotations || []) {
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

async function callGroundedLocalAI(body) {
  if (!process.env.OPENAI_API_KEY || !body.localEvidence) {
    return null;
  }

  const requestBody = {
    model: DEFAULT_MODEL,
    max_output_tokens: 700,
    input: [
      {
        role: 'system',
        content: [{
          type: 'input_text',
          text: 'أنت طبقة صياغة محلية grounded لمساعد دراسة ERP عربي. لا تستخدم أي معرفة خارج الشواهد المرسلة. أعد JSON فقط دون Markdown أو شرح إضافي.',
        }],
      },
      {
        role: 'user',
        content: [{
          type: 'input_text',
          text: buildGroundedLocalPrompt(body),
        }],
      },
    ],
  };

  const res = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(payload?.error?.message || `Grounded local request failed with status ${res.status}.`);
    error.statusCode = res.status;
    throw error;
  }

  const parsed = parseJsonText(extractOutputText(payload));
  if (!parsed || !Array.isArray(parsed.bullets) || !parsed.bullets.length) {
    return null;
  }

  return {
    title: String(parsed.title || 'إجابة محلية مدعومة بالذكاء').trim(),
    intro: String(parsed.intro || '').trim(),
    bullets: parsed.bullets.map((item) => String(item || '').trim()).filter(Boolean).slice(0, 5),
    confidence: ['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'medium',
    model: payload.model || DEFAULT_MODEL,
  };
}

async function callOpenAISpeech(body) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY غير مضبوط على الخادم.');
    error.statusCode = 503;
    throw error;
  }

  const inputText = String(body.text || '').trim();
  if (!inputText) {
    const error = new Error('نص الدرس فارغ.');
    error.statusCode = 400;
    throw error;
  }

  if (inputText.length > MAX_TTS_CHARS) {
    const error = new Error(`نص القراءة أطول من الحد المسموح (${MAX_TTS_CHARS} حرف). اختر قسمًا أصغر.`);
    error.statusCode = 400;
    throw error;
  }

  const requestBody = {
    model: DEFAULT_TTS_MODEL,
    voice: String(body.voice || DEFAULT_TTS_VOICE).trim() || DEFAULT_TTS_VOICE,
    input: inputText,
    format: resolveTtsFormat(body.format),
    instructions: 'اقرأ النص بالعربية الفصحى الواضحة، بوتيرة تعليمية هادئة ومناسبة للمذاكرة، وتجنب تهجئة الرموز الإنجليزية حرفًا حرفًا إلا إذا كانت ضرورية.',
  };

  const res = await fetch(`${OPENAI_BASE_URL}/audio/speech`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  const buffer = Buffer.from(await res.arrayBuffer());
  if (!res.ok) {
    let message = `OpenAI speech request failed with status ${res.status}.`;
    try {
      const payload = JSON.parse(buffer.toString('utf8'));
      message = payload?.error?.message || message;
    } catch {
      // keep fallback message
    }
    const error = new Error(message);
    error.statusCode = res.status;
    throw error;
  }

  return {
    audio: buffer,
    model: DEFAULT_TTS_MODEL,
    voice: requestBody.voice,
    format: requestBody.format,
    contentType: getTtsContentType(requestBody.format),
  };
}

async function callOpenAI(body, includeWebSearch, routing) {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY غير مضبوط على الخادم.');
    error.statusCode = 503;
    throw error;
  }

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
          text: buildPrompt(body),
        }],
      },
    ],
  };

  if (includeWebSearch) {
    requestBody.tools = [{ type: 'web_search' }];
  }

  const res = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(payload?.error?.message || `OpenAI request failed with status ${res.status}.`);
    error.statusCode = res.status;
    throw error;
  }

  return {
    ok: true,
    provider: 'openai',
    model: payload.model || routing.model,
    modelTier: routing.modelTier,
    escalated: routing.escalated,
    routingReason: routing.reason,
    usedWebSearch: !!includeWebSearch,
    answer: extractOutputText(payload),
    sources: extractSources(payload),
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    applyCommonHeaders(res);
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, {
      ok: true,
      keyConfigured: !!process.env.OPENAI_API_KEY,
      model: DEFAULT_MODEL || null,
      heavyModel: HEAVY_MODEL || null,
      ttsModel: DEFAULT_TTS_MODEL || null,
      ttsVoice: DEFAULT_TTS_VOICE || null,
      ttsFormat: DEFAULT_TTS_FORMAT || null,
      smartRouting: SMART_MODEL_ROUTING,
      webSearchDefault: DEFAULT_WEB_SEARCH,
      networkUrls: getNetworkUrls(),
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/lesson-audio') {
    try {
      const body = await readJsonBody(req);
      const result = await callOpenAISpeech(body);
      sendBinary(res, 200, result.audio, result.contentType, {
        'X-TTS-Model': result.model,
        'X-TTS-Voice': result.voice,
        'X-TTS-Format': result.format,
        'X-Audio-Bytes': String(result.audio.length || 0),
        'Cache-Control': 'no-store',
      });
      return;
    } catch (error) {
      sendJson(res, error.statusCode || 500, {
        error: error.message || 'تعذر توليد الصوت العربي.',
      });
      return;
    }
  }

  if (req.method === 'POST' && url.pathname === '/api/assistant') {
    try {
      const body = await readJsonBody(req);
      if (!String(body.query || '').trim()) {
        sendJson(res, 400, { error: 'السؤال فارغ.' });
        return;
      }

      const wantsWebSearch = body.includeWebSearch == null
        ? DEFAULT_WEB_SEARCH
        : !!body.includeWebSearch;
      const routing = resolveModelRouting(body, wantsWebSearch);
      let groundedLocalAnswer = null;

      if (body.localEvidence) {
        try {
          groundedLocalAnswer = await callGroundedLocalAI(body);
        } catch (error) {
          console.warn('Grounded local synthesis failed:', error.message || error);
        }
      }

      try {
        const result = await callOpenAI(body, wantsWebSearch, routing);
        sendJson(res, 200, { ...result, groundedLocalAnswer });
        return;
      } catch (error) {
        if (wantsWebSearch && shouldRetryWithoutWebSearch(error)) {
          const fallback = await callOpenAI(body, false, routing);
          sendJson(res, 200, {
            ...fallback,
            groundedLocalAnswer,
            warning: 'الخادم أو المودل الحالي لم يقبل أداة بحث الويب، لذلك أُعيدت الإجابة سحابيًا فقط بدون تصفح مباشر.',
          });
          return;
        }

        sendJson(res, error.statusCode || 500, {
          error: error.message || 'تعذر تنفيذ طلب OpenAI.',
        });
        return;
      }
    } catch (error) {
      sendJson(res, 400, {
        error: error.message || 'تعذر قراءة الطلب.',
      });
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Assistant server listening on http://127.0.0.1:${PORT}`);
  console.log(`OpenAI light model: ${DEFAULT_MODEL || 'not configured'}`);
  console.log(`OpenAI heavy model: ${HEAVY_MODEL || 'not configured'}`);
});