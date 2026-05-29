# خطة تطوير التطبيق: من "قراءة + اختبار" إلى "بناء معرفة دائمة"

> هذه الخطة بناء على ملف [Ideas.md](Ideas.md) مع توسيع وترتيب وأفكار جديدة لم ترد فيه.
> الهدف الجوهري لم يتغير: **فهم متقن + حفظ طويل + استرجاع وقت الحاجة + متعة**.

---

## 1) الفلسفة الجديدة للتطبيق

التطبيق الحالي مبني حول: `درس → اختبار → درجة`.
نريد تحويله إلى دورة من خمس مراحل لكل وحدة معرفية:

```
افهم  →  اختصر  →  استرجع  →  طبّق  →  راجع لاحقاً (متباعد)
```

كل ميزة جديدة يجب أن تخدم خانة من هذه الخمس، وإلا فهي زينة.

**القواعد الذهبية التي ستقود التصميم:**

1. **Active Recall أولاً، القراءة ثانياً.** لا يُسمح بفتح درس مرتين متتاليتين بدون "brain dump" بينهما.
2. **التباعد والتداخل** (Spaced + Interleaved) ليس خياراً — هو الافتراضي.
3. **Why قبل What.** كل مفهوم له سطر "لماذا نحتاجه؟ ماذا يفسد لو غاب؟"
4. **اختبر نفسك على الفراغ، لا على التعرف.** Cloze + Free recall، لا اختيار من متعدد فقط.
5. **قِس الحفظ، لا التقدم.** نسبة "ما تتذكره الآن" أهم من نسبة "ما قرأته".

---

## 2) ما يوجد فعلاً (لا نعيد بناءه)

| المنطقة | الحالة | ملاحظة |
|---|---|---|
| تصفح المنهج Markdown + Progress | ✅ ممتاز | يُبنى عليه |
| Glossary tooltips | ✅ | يُبنى عليه (سنضيف Cloze منه) |
| Feynman Box + 3-rating | ⚠️ موجود لكن سطحي | يحتاج تطوير لِ Free Recall + Scoring |
| Spaced Review Queue | ⚠️ بدائي (today/2/5/10) | يُستبدل بـ SM-2 light |
| Flashcards (56 من القاموس) | ⚠️ مصطلح ↔ معنى فقط | نوّع الأنواع (5 على الأقل) |
| Quiz bank (179 سؤال) | ⚠️ كتابي ذاتي التصحيح | نضيف Cloze + Scenario MCQ |
| System Comparisons | ✅ | يُربط بخريطة المفاهيم |
| Interview Simulator | ✅ | يُستخدم كنمط "Teach-back" |
| Mistakes Journal | ✅ | نوسعه لـ "Confusion Journal" |
| Notes drawer + Search + Dark | ✅ | كما هو |

---

## 3) الأفكار الجديدة (وكيف تتجاوز Ideas.md)

أفكار `Ideas.md` ممتازة كقائمة، لكنها بحاجة إلى ترتيب أولوية + ميزات لم يذكرها. هذه المضافات:

### 3.1 ميزات لم ترد في Ideas.md

| # | الميزة | لماذا قوية |
|---|---|---|
| A1 | **Blurt Mode** قبل القراءة | يفتح صفحة بيضاء ويطلب: "اكتب كل ما تعرفه عن هذا الموضوع قبل أن تقرأه". يحوّل القراءة من سلبية إلى نشطة فوراً |
| A2 | **Two-Pass Reading**: تصفّح سريع + قراءة بإرشاد | في التمريرة الأولى يخفي التطبيق التفاصيل ويظهر فقط العناوين والأسئلة المفتاحية. في الثانية يكشف |
| A3 | **Why-prompts مدمجة في النص** | حقن تلقائي لسؤال "لماذا؟" بعد كل فقرة رئيسية (يُولّد من الميتاداتا أو من H2/H3) |
| A4 | **Confusion Pairs Detector** | بدل دفتر أخطاء عام، التطبيق يلاحظ المفاهيم التي تخلط بينها (مثل WIP vs Finished Goods) ويبني تمارين تمييز محددة |
| A5 | **Retention Heat-Map للمنهج** | بدل "70% منجز"، خريطة شجرية تتلوّن: أخضر = محفوظ بثقة، أصفر = هش، أحمر = ينسى. تتحدث تلقائياً من نتائج المراجعة |
| A6 | **Smart Re-Quiz Loop (Leitner)** | السؤال الخاطئ لا يُحذف من الـqueue حتى يُجاب صحيحاً 3 مرات على فترات متباعدة (1 يوم، 4 أيام، 10 أيام) |
| A7 | **Daily 3-Minute Recall** | تحدي يومي ثابت (1 بطاقة + 1 مفهوم + 1 علاقة) يفتح من شعار التطبيق مباشرة |
| A8 | **Pre-Sleep Mode (5/5)** | وضع ليلي خاص: 5 ملخصات أسطر + 5 بطاقات سهلة. مصمم للتوحيد قبل النوم |
| A9 | **Teach-Back Recording** | "اشرح هذا المفهوم لمدير مالي / لمشغّل / لمستخدم جديد" — يسجل صوت اختيارياً (Web Audio API) + يقارن الكلمات المفتاحية |
| A10 | **Confidence-Weighted Scoring** | بعد كل إجابة، يسأل: ما مدى ثقتك (1-3)؟ التطبيق يستخدم الثقة لتعديل فترة المراجعة (إجابة صحيحة بثقة منخفضة = تعود قريباً) |
| A11 | **Concept Atoms + Edges** | كل مفهوم له ذرة (atom) في graph، والعلاقات (edges) تُولّد تمارين: "اربط Production Order بـ ..." |
| A12 | **Spaced Cloze من الـGlossary** | بدل بطاقات تعريف فقط، التطبيق يحقن كلمة القاموس داخل جملة من الدرس ويحذفها → fill-in-the-blank تلقائي |
| A13 | **Cheat Sheet مولّد لكل جزء** | صفحة A4 قابلة للطباعة، تُبنى آلياً من H2/H3 + تعريفات + ملخص الـ5 أسطر |
| A14 | **Interleaved Review (mixing)** | الـreview queue ترتب الأسئلة من 3 أجزاء مختلفة على الأقل في الجلسة الواحدة، لا كل أسئلة الجزء معاً |
| A15 | **Streak ذكي للاسترجاع** | streak لا يُحسب من فتح التطبيق، بل من الإجابة على Daily Recall. هذا يكافئ السلوك الصحيح |

### 3.2 الأفكار من Ideas.md التي نوافق عليها ونرتّبها

أهم 7 من قائمته → كلها داخلة في الخطة، لكن بأسماء وتنفيذ محدد:

- Feynman محسّن → **Free Recall Box** (A2 + سطر تقييم تلقائي بالكلمات المفتاحية)
- Spaced Flashcards → **SM-2 Light** (انظر القسم 4.2)
- Concept Links / Mind Map → **Concept Graph** (A11 + شاشة خريطة)
- Daily Recall Session → **A7**
- Compare Two Concepts → **Compare Panel** (شاشة جديدة)
- Scenario Practice → **Scenario Simulator** (انظر 4.5)
- Weak Memory / Confusion Journal → **A4**

### 3.3 ما نؤجله من Ideas.md (ليس الآن)

- شرح صوتي (TTS): جيد لكنه يتطلب توليد ملفات صوتية أو TTS متصفّح (جودة محدودة بالعربية).
- البطاقات الذهنية المرئية ثلاثية الأبعاد: ميزة "wow" لكن جهدها كبير مقابل القيمة.
- Timeline view: غير حرج للمحتوى الحالي (دورة الإنتاج خطية بطبيعتها وموجودة في الدروس).

---

## 4) التصميم التقني للميزات الجوهرية

### 4.1 Blurt Mode (A1)

- زر جديد في `lesson-tools`: **"ابدأ بالاسترجاع"** يفتح overlay قبل عرض النص.
- يخفي محتوى الدرس ويعرض: `textarea` كبير + عداد كلمات + عنوان الدرس فقط.
- بعد الحفظ: يفتح الدرس مع تمييز الكلمات المفتاحية التي ذكرها/فاتته.
- بيانات: تُضاف إلى `lessonState[id].blurts[]`.

### 4.2 SM-2 Light (يستبدل scheduleReview الحالي)

استبدال [app.js:312-318](app.js#L312) `reviewIntervalForRating`:

```js
// بدل: again→1, hard→2, medium→5, easy→10 (ثابت)
// نستخدم EF (ease factor) + repetition count + confidence
function nextInterval(prev, rating, confidence) {
  let ef = prev.ef ?? 2.5;
  let reps = prev.reps ?? 0;
  if (rating === 'again') { reps = 0; ef = Math.max(1.3, ef - 0.2); }
  else {
    reps += 1;
    const q = rating === 'easy' ? 5 : rating === 'medium' ? 4 : 3;
    ef = Math.max(1.3, ef + 0.1 - (5-q)*(0.08 + (5-q)*0.02));
  }
  let interval = reps <= 1 ? 1 : reps === 2 ? 3 : Math.round(prev.interval * ef);
  if (confidence === 'low') interval = Math.max(1, Math.round(interval * 0.6));
  return { ef, reps, interval };
}
```

ينطبق على lessons + cards + questions بنفس الدالة.

### 4.3 Cloze Auto-Generation (A12)

- مدخل جديد في `build-study-data.js`: لكل مصطلح في `glossary.json`، يبحث عن أول جملة في الدرس المصدر تحتوي المصطلح ويحفظ:
  ```json
  { "id": "cloze-001", "sentence": "المخزون الذي ___ التصنيع ولم يكتمل بعد", "answer": "دخل", "termId": "g-013", "sourceId": "p3-3" }
  ```
- ملف ناتج: `cloze-bank.json`.
- يُعرض كنوع جديد داخل شاشة Cards.

### 4.4 Concept Graph (A11) + Compare Panel

- ملف جديد `concepts.json` فيه atoms + edges:
  ```json
  {
    "atoms": [{"id":"production-order","label":"Production Order","sectionId":"part3"}],
    "edges": [{"from":"production-order","to":"material-issue","relation":"يسبق"}]
  }
  ```
- شاشتان جديدتان: **Mind Map** (D3.js أو Cytoscape، خفيف) و**Compare** (يختار مفهومين → جدول مقارنة + سؤال "ما الفرق الجوهري؟").

### 4.5 Scenario Simulator (نمط Application)

- ملف `scenarios.json` فيه سيناريوهات قصيرة:
  ```json
  {
    "id": "sc-001",
    "title": "مشكلة في تكلفة منتج",
    "context": "أنت مستشار في مصنع لاحظت أن تكلفة المنتج X مرتفعة 30% عن المعياري...",
    "steps": [
      {"prompt": "ما أول تقرير ستفتحه؟", "options":[...], "correct":1, "explain":"..."},
      ...
    ]
  }
  ```
- شاشة جديدة `Scenarios` تعرضها بنمط "choose-your-next-step".

### 4.6 Confusion Pairs (A4)

- خوارزمية: عند كل خطأ، نخزّن `mistakes[qid] = {wrongAnswer, correctAnswer, conceptIds}`.
- إذا تكرر الخطأ بين مفهومين (مثلاً WIP و Finished Goods) ≥ 3 مرات → نضيف تمرين **discrimination drill** تلقائياً: 5 جمل، اختر المفهوم الصحيح لكل جملة.

### 4.7 Retention Heat-Map (A5)

- بديل/إضافة لشاشة Dashboard.
- خوارزمية اللون لكل وحدة:
  - `retentionScore = (آخر تقييم) * exp(-أيام منذ آخر مراجعة / 7)`
  - أخضر ≥ 0.75، أصفر ≥ 0.4، أحمر < 0.4، رمادي = لم يُدرس.

---

## 5) ترتيب التنفيذ (موجات قصيرة قابلة للشحن)

### الموجة 1 — أسس المعرفة النشطة (1-2 يوم لكل بند)
1. ⭐ SM-2 Light (4.2) — يحسّن كل شيء تلقائياً.
2. ⭐ Blurt Mode (A1) — أعلى ROI، تغيير سلوك واحد.
3. Daily 3-Min Recall (A7) — يربط المستخدم يومياً.
4. Smart Re-Quiz Leitner (A6) — يحول الأخطاء إلى تعلم.

### الموجة 2 — أنواع البطاقات والتمارين
5. Cloze auto-gen (4.3, A12)
6. Confidence-weighted scoring (A10)
7. Interleaved Review queue (A14)

### الموجة 3 — الفهم العميق
8. Concept Graph + Compare Panel (4.4)
9. Why-prompts المدمجة (A3)
10. Cheat sheet المولّد (A13)

### الموجة 4 — التطبيق والمحاكاة
11. Scenario Simulator (4.5)
12. Teach-Back Recording (A9)
13. Confusion Pairs Detector (A4)

### الموجة 5 — التحفيز والتغليف
14. Retention Heat-Map (A5)
15. Pre-Sleep Mode (A8)
16. Smart Streak (A15)
17. Two-Pass Reading (A2)

> ابدأ بالموجة 1 وحدها. خمسة أيام عمل قد تحقق 50% من الفرق المطلوب.

---

## 6) تغييرات schema/state المطلوبة (نظرة سريعة)

في [app.js:10-40](app.js#L10-L40) `state` يضاف:

```js
blurts: store.get('blurts', {}),          // {fileId: [{text, at, coverage}]}
confidence: store.get('confidence', {}),  // {targetId: 'low|med|high'}
confusionPairs: store.get('confusionPairs', {}), // {"WIP|FG": 3}
dailyStreak: store.get('streak', {count:0, lastAt:null}),
retentionScores: store.get('retention', {}),     // {fileId: 0.0-1.0}
```

ملفات بيانات جديدة في الجذر:
- `cloze-bank.json`
- `concepts.json` (atoms + edges)
- `scenarios.json`

سكريبت `build-study-data.js` يُوسَّع ليولّد الثلاثة من المحتوى الموجود.

---

## 7) معيار النجاح (كيف نعرف أننا حققنا الهدف)

نقيس على نفسنا قبل وبعد:
- ⏱ زمن استرجاع مفهوم من الذاكرة بدون فتح الدرس
- 🔁 نسبة الأسئلة المُجابة صحيحاً بعد 7 أيام من أول دراسة
- 🧠 عدد الجلسات اليومية القصيرة (3 دقائق) خلال أسبوع
- 🗣 القدرة على شرح مفهوم بصوت عالٍ في < 60 ثانية بدون تردد

إذا تحركت هذه الأربعة، التطبيق نجح. الباقي تفاصيل.

---

## 8) ما لا نفعله

- لا نضيف Gamification صاخب (شارات/مستويات/أصوات). يشتت من الجوهر.
- لا نضيف AI tutor الآن — يحتاج خادم/تكلفة. ممكن لاحقاً كميزة اختيارية.
- لا نعيد كتابة التطبيق بـ React/Vue. الـvanilla JS الحالي ممتاز ومتوافق مع PWA.
- لا نمس بنية المحتوى Markdown. كل التطوير في طبقة التطبيق + ملفات بيانات مولَّدة.
