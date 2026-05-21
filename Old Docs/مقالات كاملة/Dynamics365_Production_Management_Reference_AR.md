# Microsoft Dynamics 365 Supply Chain Management
## دراسة شاملة لإدارة الإنتاج والتصنيع داخل ERP

> مرجع تدريبي مهني مبني بالكامل على وثائق Microsoft الرسمية (Microsoft Learn).
>
> المؤلَّف موجَّه إلى المستشارين الوظيفيين Functional Consultants والمحللين العاملين في تطبيق أنظمة ERP، خصوصًا من يرغب في فهم منطق نظام إنتاج عالمي بهدف بناء أو تطوير وحدة الإنتاج في نظام ERP محلي.

---

## 1. مقدمة

### ما هو Microsoft Dynamics 365 Supply Chain Management؟

Microsoft Dynamics 365 Supply Chain Management (يُختصر D365 SCM) هو منتج ERP متكامل لإدارة سلسلة التوريد ضمن عائلة Dynamics 365، يخدم بشكل خاص المؤسسات المتوسطة والكبيرة في الصناعات التحويلية والتوزيعية. النظام مبنيّ على فلسفة "وحدة منطق واحدة" تربط بيانات المنتجات والمخزون والمستودعات والإنتاج والتكلفة والمالية في مخزن بيانات مشترك، بحيث لا يكون الإنتاج كيانًا منعزلًا، بل جزءًا من شبكة عمليات محاسبية ولوجستية تنعكس فورًا على دفتر الأستاذ العام وقوائم المخزون.

### موقع Production Control داخل النظام

تشير وثائق Microsoft بوضوح إلى أن وحدة **Production control** ليست وحدة قائمة بذاتها، بل هي وحدة مرتبطة هيكليًا بعدد من الوحدات الأخرى داخل النظام. تنصّ الوثيقة الرسمية على أن "وحدة Production control مرتبطة بوحدات أخرى مثل Product information management وInventory management وGeneral ledger وWarehouse management وProject accounting وOrganization administration، وهذا التكامل يدعم تدفّق المعلومات اللازم لإتمام تصنيع المنتج النهائي".

بمعنى أوضح: أمر الإنتاج في D365 ليس "وثيقة" يقوم مسؤول الإنتاج بإنشائها، بل هو **عقدة معلوماتية** تتبادل البيانات مع:

- بيانات المنتج (Product information management) لجلب وصفة المنتج (BOM) ومراحل تصنيعه (Route).
- المخزون (Inventory management) لإجراء حركات الصرف والاستلام.
- المستودعات (Warehouse management) لإصدار أوامر السحب الفعلية ومسار حركة المواد داخل المستودع.
- المالية (General ledger) لإصدار قيود WIP وقيود التكلفة الفعلية والانحرافات.
- إدارة المشاريع (Project accounting) عند ربط الإنتاج بمشاريع زمنية.

### لماذا الإنتاج في ERP منظومة وليس أمرًا واحدًا؟

في الأنظمة البسيطة، قد يقتصر "الإنتاج" على شاشتين: شاشة لصرف المواد وشاشة لاستلام المنتج النهائي. هذا النموذج كافٍ في الورش الصغيرة، لكنه لا يجيب على الأسئلة الصعبة: ما هي قيمة المواد قيد التشغيل لحظة إقفال السنة؟ ما الفرق بين التكلفة المتوقعة والفعلية لكل أمر إنتاج؟ من أين جاءت كل ساعة عمل في تكلفة المنتج النهائي؟

نظام مثل Dynamics 365 يحاول الإجابة على هذه الأسئلة من خلال بناء **دورة حياة كاملة لأمر الإنتاج** تمر بحالات معرفة (Created, Estimated, Scheduled, Released, Started, Reported as finished, Ended)، وكل حالة تُولّد حركات مخزون وقيودًا محاسبية. وتنص الوثيقة الرسمية على أن "عملية الإنتاج تتأثر عادةً بأساليب محاسبة التكاليف وتقييم المخزون التي تُختار لكل عملية إنتاج. ويدعم Supply Chain Management كلًا من التكلفة الفعلية (FIFO وLIFO وMoving average وPeriodic weighted average) والتكلفة المعيارية Standard cost".

### لماذا دراسة هذا النظام؟

دراسة نظام Dynamics 365 ليست تدريبًا على الزر الأخضر والزر الأحمر، بل تدريب على **منهجية تفكير**. عندما تفهم كيف تربط Microsoft بين BOM والتكلفة، وبين الجدولة والطاقة الإنتاجية، وبين WIP وحركات الأستاذ العام، تكتسب نموذجًا ذهنيًا قابلًا للتطبيق في أي نظام ERP آخر — حتى لو كان النظام المحلي الذي تعمل عليه أبسط بكثير. الفائدة هنا ليست النسخ الحرفي، بل **اكتساب المعجم والمنطق**.

**المصادر الرسمية لهذا القسم:**
- Production process overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview

---

## 2. فلسفة Microsoft في إدارة الإنتاج

تنطلق Microsoft من قاعدة فلسفية صريحة: **الإنتاج لا يقف بمفرده**. كل حدث في عملية الإنتاج له انعكاس على وحدة أخرى داخل النظام. لتوضيح هذه الفكرة، يستحسن تخيّل النظام كمنظومة من حلقات متشابكة:

| الوحدة | الدور في عملية الإنتاج |
|---|---|
| Product information management | يحتفظ بتعريف المنتج (Released product) وقوائم BOM وFormula وRoute وVersion. |
| Inventory management | يستقبل حركات صرف المواد واستلام المنتج النهائي ويحدّث On-hand inventory. |
| Warehouse management | يصدر أوامر السحب (Picking work) والوضع (Put-away)، ويتعامل مع الموقع الفعلي للمواد. |
| Production control | يدير دورة حياة أمر الإنتاج (Created → Ended) ويُنفّذ الجدولة والتقدم. |
| Cost management | يحسب BOM calculation وWIP والـ Variances ويقفل أمر الإنتاج ماليًا. |
| General ledger | يستقبل قيود الإنتاج التلقائية (Picking list voucher، Report as finished voucher، End journal voucher). |
| Project accounting | يربط أوامر إنتاج بمشاريع زمنية (مثلًا منتج Engineer-to-Order). |
| Master planning | يولّد Planned production orders بناءً على الطلب ويُثبّتها (Firming) لتصبح أوامر إنتاج فعلية. |
| Organization administration | يحوي بيانات التقويم (Calendars) وقوالب العمل (Working time templates) وموارد التشغيل (Resources). |

### الفرق بين النظام البسيط ونظام Dynamics

في نظام بسيط:
1. صرف مواد خام.
2. استلام منتج نهائي.
3. الفرق هو "تكلفة الإنتاج".

في Dynamics 365، تمرّ نفس العملية بثماني إلى عشر مراحل صريحة، كل مرحلة لها:
- وثيقة (Journal) خاصة بها (Picking list journal، Route card journal، Job card journal، Report as finished journal، End journal).
- قيد محاسبي مؤقت (Physical posting) أو نهائي (Financial posting).
- أثر على المخزون (On order → Picked → Consumed → Received).
- تكلفة مقدّرة (Estimated) ثم فعلية (Actual) ثم انحراف (Variance).

هذا التعقيد ليس "تعقيدًا تقنيًا"، بل **تعقيد محاسبي مقصود**؛ لأن النظام يحاول أن يجيب على سؤال إدارة المالية: ما قيمة المخزون والـ WIP في أي لحظة؟ ومن أين أتى كل فلس من تكلفة المنتج النهائي؟

**المصادر الرسمية لهذا القسم:**
- Production process overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview
- Production setup requirements — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-set-up-requirements

---

## 3. أنواع التصنيع التي يدعمها النظام

من أهم نقاط التفوّق في D365 SCM أنه لا يفرض نموذج تصنيع واحدًا، بل يدعم ما تسمّيه Microsoft **Mixed Mode Manufacturing** — أي القدرة على استخدام أكثر من نوع أمر إنتاج داخل نفس المنشأة، بل في دورة حياة المنتج الواحد.

تشرح الوثيقة الرسمية أنواع الأوامر التالية:

### 3.1 Discrete Manufacturing (التصنيع المنفصل)

النوع الكلاسيكي للأوامر، ويُستخدم لتصنيع منتج محدد أو نسخة منتج (Variant) بكمية معينة في تاريخ معين. تعتمد على **BOM** (قائمة مكونات المنتج) و**Route** (مراحل التصنيع). الأمر يحمل اسم **Production order**.

**أمثلة عملية:** صناعة الأثاث، الأجهزة الكهربائية، السيارات، الإلكترونيات، أي صناعة يمكن فيها عدّ الوحدات المُنتجة (قطعة، طاولة، جهاز).

### 3.2 Process Manufacturing (التصنيع المتسلسل/الكيميائي)

تنصّ الوثيقة على أن **Batch order** هو "نوع الأمر المستخدم في الصناعات العملياتية والصناعات المنفصلة عندما يكون تحويل التصنيع مبنيًا على وصفة (Formula)، أو حيث يمكن أن تكون منتجات مشتركة Co-products ومنتجات ثانوية By-products منتجات نهائية إلى جانب أو بدلًا من المنتج الأساسي". تستخدم Batch orders قوائم من نوع **Formula** ومسارات Routes.

**ميزات إضافية:**
- استخدام **Formula** بدلًا من BOM، وتحوي وصفات بكميات نسبية (مثلًا 30% من المنتج النهائي).
- ميزة **Co-products** و**By-products** التي تتيح أن ينتج الأمر الواحد أكثر من مخرَج.
- ميزة **Batch attributes** التي تسمح بتسجيل خصائص لكل دفعة (مثل النسبة الفعالة لمادة كيميائية، أو محتوى الدهون في الحليب).
- ميزة **Batch balancing**: حساب الكمية المطلوب صرفها من مادة فعالة بناءً على تركيز الدفعة المتاحة، بحيث يضبط النظام تلقائيًا الكمية لمطابقة المواصفات.

**أمثلة عملية:** صناعة الأغذية والمشروبات، الأدوية، الكيماويات، الدهانات، مستحضرات التجميل.

### 3.3 Lean Manufacturing (التصنيع الرشيق)

النموذج المستوحى من نظام Toyota للإنتاج. تنص الوثيقة الرسمية على أن **Kanbans** "تُستخدم للإشارة إلى عمليات التصنيع الرشيق المتكررة المبنية على Production flows وKanban rules وBOMs".

الفلسفة:
- إنشاء **Production flow** كهيكل من الأنشطة (Activities) المتسلسلة أو المتفرّعة.
- استخدام **Kanban rules** كقواعد سحب (Pull) بدلًا من قواعد دفع (Push).
- استخدام **Backflush costing** لتقييم المواد قيد التشغيل دوريًا بدلًا من تقييمها لكل أمر إنتاج على حدة.
- إلغاء فكرة BOM متعدد المستويات للمنتجات نصف المصنعة، ودمج كل شيء في تدفق إنتاجي واحد.

**أمثلة عملية:** خطوط التجميع المتكررة، إنتاج المكوّنات السيارات، خطوط التغليف.

### 3.4 Project / Engineer to Order

يستخدم لمشاريع التصنيع التي تتطلب مرحلة هندسية أولًا (Engineering phase). المشروع يدمج المنتجات والخدمات بجدول وميزانية، ويمكن أن يُنفَّذ عبر أي من الأوامر الأخرى (Production order، Batch order، Kanban).

**أمثلة عملية:** صناعة المعدّات الثقيلة، السفن، الطائرات، المنشآت الصناعية، المشاريع الإنشائية.

### 3.5 مبادئ التصنيع المرتبطة بالطلب

بصرف النظر عن نوع الأمر، تذكر الوثيقة أربعة مبادئ تصنيع:

| المبدأ | الوصف |
|---|---|
| Make to Stock (MTS) | الإنتاج للمخزون بناءً على توقّعات أو حد أدنى للمخزون. |
| Make to Order (MTO) | منتجات قياسية لكنها لا تُصنَّع إلا عند ورود طلب. |
| Configure to Order (CTO) | نسخ المنتج تُحدَّد لحظة دخول الطلب من خلال نموذج تكوين. |
| Engineer to Order (ETO) | يبدأ بمرحلة هندسية لتصميم منتج خاص بالطلب. |

### أثر نوع التصنيع على تصميم النظام

اختيار نوع التصنيع ليس قرارًا فنيًا فقط، بل قرار **تصميم محاسبي وتشغيلي**:
- التصنيع المنفصل: تكلفة لكل أمر إنتاج، انحرافات لكل أمر.
- التصنيع العملياتي: تكلفة موزّعة على المنتج الأساسي والمنتجات المشتركة وفقًا لقواعد توزيع التكلفة (Cost distribution).
- التصنيع الرشيق: تكلفة WIP على مستوى Production flow وليس على مستوى أمر إنتاج فردي.

**المصادر الرسمية لهذا القسم:**
- Production process overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview
- Lean manufacturing overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/lean-manufacturing-overview
- Modeling a lean organization — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/lean-manufacturing-modeling-lean-organization
- Configure and use process manufacturing (training) — https://learn.microsoft.com/en-us/training/paths/configure-use-process-manufacturing-dyn365-supply-chain-mgmt/
- Configure and use lean manufacturing (training) — https://learn.microsoft.com/en-us/training/paths/configure-use-lean-manufacturing-dyn365-supply-chain-mgmt/

---

## 4. بيانات الإنتاج الأساسية (Master Data)

تذكر وثيقة "Production setup requirements" أن أي تطبيق Production control يجب أن يسبقه إعداد بيانات أساسية في وحدات أخرى، وأن هذه البيانات يجب أن تُهيَّأ بالترتيب التالي:

1. إعداد بيانات الشركة العامة.
2. إعداد General ledger.
3. تعريف مجموعات الأصناف (Item groups).
4. تعريف الحسابات المحاسبية لمجموعات الأصناف.
5. إعداد جدول الأصناف في Inventory management.
6. إنشاء BOMs وBOM versions في Product information management.

ثم، داخل Organization administration، تأتي إعدادات التقويم والموارد:

1. **Working time templates** — تحديد ساعات العمل المتاحة للجدولة.
2. **Calendars** — تحديد الأيام المتاحة في السنة.
3. **Resource groups** — تجميع الموارد للحصول على نظرة على الطاقة الفائضة.
4. **Resources** — تعريف الموارد الفعلية المستخدمة في الإنتاج.

سنفصّل العناصر الأساسية:

### 4.1 Released Products (الأصناف المعتمَدة للإنتاج)

في Dynamics 365 ثمة فرق بين **Product** و**Released product**. Product هو تعريف عام، أما Released product فهو نسخة المنتج المعتمَدة للاستخدام داخل شركة قانونية محددة. عند الإنتاج، نحن نتعامل دائمًا مع Released product.

تشمل بيانات الصنف المعتمَد للإنتاج:
- مجموعة الصنف (Item group) — تحدد الحسابات المحاسبية.
- مجموعة نموذج الصنف (Item model group) — تحدد طريقة تقييم المخزون (FIFO/LIFO/Standard cost/Moving average).
- أبعاد التتبع (Tracking dimensions): Batch، Serial.
- أبعاد التخزين (Storage dimensions): Site، Warehouse، Location.
- نوع المنتج: Item أو Service.
- النوع الإنتاجي: Production (BOM)، Formula، Planning item، Vendor.

### 4.2 المواد الخام والوسيطة والنهائية

النظام لا يفرّق محاسبيًا بشكل صارم بين المادة الخام (Raw material) والمنتج نصف المصنّع (Semi-finished) والمنتج النهائي (Finished). كلها أصناف في جدول الأصناف، والفرق يكمن في:
- مجموعة الصنف التي تحدد حسابات المخزون.
- وجود BOM يجعل الصنف "Manufactured" بدل "Purchased".
- استخدامه في أمر إنتاج (سيكون Output) أو في BOM لصنف آخر (سيكون Input).

هذا يعني أن منتجًا نصف مصنّعًا يمكن أن:
- يُصنَّع داخليًا عبر أمر إنتاج منفصل (BOM متعدد المستويات).
- أو يُمثَّل كـ **Phantom** ضمن BOM المنتج النهائي بحيث يُفجَّر عند إنشاء أمر الإنتاج إلى مكوّناته الأساسية.
- أو يُمثَّل كـ **Pegged supply** بحيث يُولّد أمر إنتاج فرعي مرتبط بالأمر الأب.

### 4.3 Units of Measure (وحدات القياس)

كل صنف مرتبط بوحدة مخزون (Inventory unit). يمكن إضافة وحدات أخرى للشراء والبيع والإنتاج مع معاملات تحويل. مثلًا: مادة خام بـ كيلو في المخزون، لكنها تُصرف في الإنتاج بـ غرام، أو منتج جاهز يُخزَّن بالقطعة لكن يُباع بالكرتون.

### 4.4 Warehouses and Locations

كل أمر إنتاج يرتبط بموقع جغرافي (Site)، ولكل صرف وكل استلام يرتبط بمستودع (Warehouse) وموقع داخل المستودع (Location). هذه التفاصيل ليست تجميلية، بل تؤثر فعليًا على:
- الحركات المخزنية.
- أوامر السحب التي يصدرها النظام للعاملين.
- التكلفة عندما تختلف من موقع لآخر.

### 4.5 أخطاء شائعة في إعداد Master Data

من واقع الوثائق وأخطاء التطبيقات الموثقة:

| الخطأ | الأثر |
|---|---|
| إعداد Item group خاطئ | حركات الإنتاج تذهب لحسابات محاسبية خاطئة، يصبح إصلاحها مكلفًا جدًا بعد الترحيل. |
| عدم تفعيل Item model group بشكل صحيح | عدم تسجيل حركات Physical/Financial، وعدم احتساب التكلفة. |
| BOM غير معتمَد (Unapproved) | لا يمكن استخدام BOM في أمر الإنتاج. |
| Route version غير مفعَّل (Not activated) | لا يلتقط أمر الإنتاج المراحل الصحيحة. |
| تقويم مورد بلا ساعات عمل صحيحة | فشل الجدولة برسالة "Not enough capacity". |

**المصادر الرسمية لهذا القسم:**
- Production setup requirements — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-set-up-requirements
- Bills of materials and formulas — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/bill-of-material-bom
- Get started with production control (training) — https://learn.microsoft.com/en-us/training/modules/get-started-production-control-dyn365-supply-chain-mgmt/

---

## 5. Bill of Materials — BOM بعمق

قائمة المواد (BOM) هي الكيان المركزي في أي نظام إنتاج. تعرّفها Microsoft بدقة: "BOM تُعرّف المكونات المطلوبة لإنتاج منتج. هذه المكونات قد تكون مواد خام أو منتجات نصف مصنعة أو مكونات. في بعض الحالات، يمكن أن تُذكَر الخدمات في BOM. لكن BOMs عادةً تصف الموارد المادية المطلوبة. عند دمج BOM مع Route أو Production flow الذي يصف العمليات والموارد المطلوبة، تشكّل BOM الأساس لحساب التكلفة المتوقعة للمنتج".

### 5.1 مكوّنات BOM

تتألف BOM من:
- **BOM ID** و**BOM name**.
- **BOM lines** التي تصف المكونات.
- **BOM versions** التي تحدد المنتج والفترة التي تصلح فيها هذه القائمة.

سطر BOM يحمل خصائص أهمها:
- الصنف (Item).
- الكمية والوحدة.
- نسبة الهالك الثابت والمتغيّر (Constant scrap / Variable scrap).
- نوع السطر (Line type).

### 5.2 أنواع أسطر BOM

تذكر الوثيقة أربعة أنواع لأسطر BOM:

| النوع | الاستخدام |
|---|---|
| **Item** | للمواد أو الخدمات المُستهلَكة مباشرةً، بدون تفجير أو توريد مرتبط. |
| **Phantom** | لتفجير BOM فرعية ضمن أمر الإنتاج. الـ Phantom لا يظهر كأمر إنتاج منفصل، بل تُدمج مكوّناته في الأمر الأب. مفيد لتبسيط الهندسة. |
| **Pegged supply** | لإنشاء أمر إنتاج فرعي أو أمر شراء مرتبط بشكل صارم بالأمر الأب. تخصَّص الكميات تلقائيًا للأمر المُستهلِك. |
| **Vendor** | عندما يستعين الإنتاج بمقاول من الباطن، فيُنشَأ أمر شراء أو أمر إنتاج فرعي للمقاول. |

### 5.3 BOM Versions وأهمية الاعتماد والتفعيل

تنصّ الوثيقة على أن "قبل استخدام BOM version في التخطيط أو التصنيع، يجب اعتمادها (Approved). عند اعتماد BOM version، يمكن أيضًا اعتماد BOM المرتبطة، حسب اختيار المستخدم وصلاحياته. لا يمكن اعتماد BOM version إلا إذا كانت BOM نفسها معتمَدة".

وتنصّ أيضًا على أن "لتعيين BOM أو Formula كنسخة افتراضية تُستخدَم في Master planning أو لإنشاء أوامر الإنتاج، يجب **تفعيل** (Activate) النسخة. عند التفعيل، يتحقّق النظام من تفرّد النسخة ضمن قيود المكان والوقت والكمية".

ينتج عن ذلك ثلاث حالات لـ BOM version:
1. **غير معتمَدة (Unapproved)** — لا تصلح للاستخدام.
2. **معتمَدة لكن غير مفعّلة (Approved, not Active)** — يمكن استخدامها يدويًا في أوامر إنتاج محددة كبديل (Alternative).
3. **معتمَدة ومفعّلة (Approved & Active)** — هي القائمة الافتراضية للمنتج في حدود قيود معينة.

### 5.4 أنواع BOM حسب الغرض

من أعمق ما تذكره وثيقة Microsoft تمييزها بين عدة أنواع من BOM:

| نوع BOM | الغرض |
|---|---|
| **Sketching / Draft BOM** | تقدير أوّلي مرحلة التصميم؛ لا تُستخدَم عادةً في ERP. |
| **Engineering BOM** | تصميمية، تنظّم المنتج إلى وحدات هندسية لتبسيط التصميم. قد تتطلب تحويلًا لتكون قابلة للإنتاج. |
| **Planning BOM** | تخدم تخطيط احتياجات المواد؛ قد تمثّل خليطًا متوقّعًا من المكونات في فترة. |
| **Production BOM** | القائمة الفعلية المستخدَمة في الإنتاج، تأخذ في الحسبان الموارد الفعلية. |
| **Costing BOM** | لحساب التكلفة المتوقّعة للمنتج، خصوصًا في Standard cost؛ يمكن أن تستخدم خليطًا تمثيليًا لتقليل الانحرافات. |

> **ملاحظة عملية:** في التطبيقات البسيطة قد تكون Planning BOM وProduction BOM وCosting BOM **قائمة واحدة**. لكن في البيئات ذات التعديلات الهندسية المتكررة، يصبح الفصل بينها ضرورة.

### 5.5 Formulas و Co-products و By-products

في التصنيع العملياتي، تستبدل **Formula** قائمة BOM. الفرق ليس شكليًا فقط:

- **Formula** تصف وصفة المنتج بكميات نسبية يمكن أن تُحسَب بناءً على الـ Yield (نسبة الناتج).
- **Formula version** ترتبط بـ **Co-products** (منتجات مشتركة) و**By-products** (منتجات ثانوية).
- تتضمن قواعد توزيع التكلفة (Cost distribution): كيف توزَّع التكلفة الإجمالية على المنتج الأساسي والمنتجات المشتركة والثانوية.

مثال: عند تكرير النفط، تخرج عدة منتجات من نفس البرميل. التكلفة الإجمالية تُوزَّع وفقًا لقيمة كل مخرَج أو وزنه أو نسبته.

### 5.6 الهالك (Scrap) في BOM

يدعم Dynamics 365 نوعين من الهالك في أسطر BOM:
- **Constant scrap (هالك ثابت):** كمية ثابتة بصرف النظر عن حجم الأمر. مثال: تُهدر قطعة قماش لاختبار الطباعة في كل أمر مهما كانت كميته.
- **Variable scrap (هالك متغيّر):** نسبة مئوية من الكمية المطلوبة. مثال: 5% من المادة الخام تُهدَر في القص.

معادلة الحساب التي توثّقها Microsoft:
```
Purchased material = (Required raw material × [1 + Variable scrap]) + Constant scrap
```

كذلك يمكن تعريف Scrap على مستوى Route operation (نسبة فاقد لكل عملية)، وعلى مستوى Resource (إذا كانت آلة محددة تُنتج هدرًا أعلى).

### 5.7 أثر خطأ BOM على الإنتاج والتكلفة

BOM الخاطئة هي السبب الأول لفشل أنظمة الإنتاج. الأخطاء الشائعة وأثرها:

| الخطأ | الأثر التشغيلي | الأثر المحاسبي |
|---|---|---|
| نسيان مكوّن في BOM | لا يُصرَف من المخزون، عجز في الكمية المخزونية الحقيقية | تكلفة المنتج المُسجَّلة أقل من الواقع، ربح متضخّم |
| تضمين مكوّن غير مطلوب | فائض في صرف المواد | تكلفة المنتج أكبر من الواقع، ربح منخفض |
| كمية BOM خاطئة | نقص أو فائض حقيقي | فروقات (Variances) كبيرة عند إقفال الأمر |
| وحدة قياس خاطئة | صرف بالمضاعفات أو الكسور | إجمالي التكلفة قد يخرج عن أي منطق |
| نسيان الهالك | عجز في المواد عند الإنتاج الفعلي | انحرافات سالبة متكررة |

### 5.8 أسئلة تحليلية يجب طرحها على العميل عند توثيق BOM

من واقع التحليل النظري لمنطق Microsoft، تظهر مجموعة أسئلة لا غنى عنها قبل بناء BOM لأي منتج:

1. هل مكوّنات المنتج ثابتة لكل عميل ولكل فترة؟
2. هل توجد مكوّنات بديلة (Alternative) يمكن استخدامها عند نفاد الأصلية؟
3. هل تختلف الوصفة باختلاف الموقع أو حجم الإنتاج؟
4. هل توجد منتجات نصف مصنعة، وهل تُنتَج بأوامر إنتاج مستقلة أم تُمثَّل كـ Phantom؟
5. ما نسبة الهالك المتوقّع لكل مكوّن؟ وهل هو ثابت أم متغيّر؟
6. هل توجد منتجات مشتركة (Co-products) أو ثانوية (By-products) ينبغي تتبّعها؟
7. من يعتمد BOM رسميًا في الشركة؟ هندسة المنتج؟ الإنتاج؟ الجودة؟
8. كم مرة تتغير وصفة المنتج خلال السنة؟
9. هل توجد عمليات تصنيع خارجية (Subcontracting)؟
10. هل تختلف الوصفة عند تصنيع كميات صغيرة عن كميات كبيرة؟

**المصادر الرسمية لهذا القسم:**
- Bills of materials and formulas — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/bill-of-material-bom
- Formulas and formula versions — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/formulas-versions
- Set up scrap to calculate raw material requirements — https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/scrap-calculations

---

## 6. Routes و Operations و Resources

إذا كانت BOM تجيب على سؤال "**ماذا** يدخل في المنتج؟"، فإن Route يجيب على سؤال "**كيف** يُصنَع المنتج؟". تذكر الوثيقة الرسمية أن "Route تُعرّف عملية إنتاج منتج أو نسخة منتج. تصف كل خطوة (Operation) في عملية الإنتاج والترتيب الذي يجب أن تُنفَّذ به هذه الخطوات. لكل خطوة، تُعرّف Route الموارد المطلوبة وأوقات الإعداد والتشغيل وكيف يجب حساب التكلفة".

### 6.1 العناصر الأربعة لـ Route

تعرّف Microsoft Route عبر أربعة عناصر مترابطة:

| العنصر | الدور |
|---|---|
| **Route** | يحدد هيكل عملية الإنتاج، أي ترتيب العمليات. |
| **Operation** | يُمثّل خطوة محددة في Route (مثل "تجميع" أو "دهان"). نفس الـ Operation يمكن أن تُستخدَم في عدة Routes. |
| **Operation relation** | يربط بين Operation وخصائصها العملية: أوقات الإعداد والتشغيل، فئات التكلفة، متطلبات الموارد. |
| **Route version** | يحدد أي Route تُستخدَم لإنتاج منتج محدد، مع قيود الموقع والكمية والفترة. |

### 6.2 أنواع Routes

تميّز الوثيقة بين:
- **Simple route:** تسلسلي، بنقطة بداية واحدة. النظام يولّد أرقام العمليات (10, 20, 30...) تلقائيًا.
- **Route network:** يحوي نقاط بداية متعددة وعمليات يمكن تشغيلها بالتوازي. يتطلّب تفعيل خيار "Route networks" في إعدادات Production control.

كذلك توجد **Parallel operations**: عملية تتطلب موارد متعددة في نفس الوقت (مثلًا آلة + عامل + أداة). تُحدَّد بنفس رقم العملية ولكن بعلامة أساسية (Primary) وثانوية (Secondary).

### 6.3 Operations Resources (موارد التشغيل)

تذكر الوثيقة عدة أنواع للموارد، وكلها قابلة للجدولة:
- **Machine** — آلة.
- **Human resource** — عامل أو فني.
- **Tool** — أداة.
- **Location** — موقع فعلي (مثلًا منطقة تجميع).
- **Facility** — مبنى أو منشأة.
- **Vendor** — مورد خارجي (Subcontractor).

كل مورد يرتبط بـ **Calendar** يحدّد طاقته الإنتاجية بالساعات. الموارد تُجمَّع في **Resource groups** للحصول على نظرة على الطاقة الكلية.

### 6.4 Capabilities (القدرات) — Resource-Independent Routing

ميزة قوية في النظام: بدلًا من ربط العملية بمورد محدد، يمكن ربطها بـ **Capability** (قدرة) — مثل "قدرة على القص بضغط 20 طن". النظام لحظة الجدولة يبحث عن أي مورد متاح يلبّي القدرة. هذا يُتيح:
- مرونة في تخصيص الموارد.
- صيانة أقل عند تغيير الموارد.
- إعادة استخدام نفس Route عبر مواقع مختلفة (Site-independent routes).

### 6.5 أوقات Operation

كل سطر في Route يحوي أوقاتًا متعدّدة:
- **Setup time** — وقت تهيئة الآلة (مرة واحدة لكل أمر، ليس لكل وحدة).
- **Run time** — وقت تشغيل لكل وحدة منتجة.
- **Queue time** — وقت الانتظار قبل بدء العملية.
- **Wait time** — وقت الانتظار بعد العملية.
- **Transport time** — وقت النقل إلى العملية التالية.

مجموع هذه الأوقات يحدد:
- موعد بدء العملية ونهايتها (الجدولة).
- تكلفة العمل (إذا كانت Cost categories مفعّلة).
- الفترة التي يحجز فيها المورد طاقة إنتاجية.

### 6.6 Cost Categories و Route Groups

كل Operation ترتبط بـ Cost categories تحدد تكلفة الإعداد والتشغيل. **Route group** يحدد لكل عملية ما إذا كان وقت الإعداد ووقت التشغيل والكمية ستُحتسَب ماليًا وتُسجَّل في الأستاذ العام. إذا أُغلِق هذا الخيار، لن يُولِّد Job/Route card journal قيدًا محاسبيًا.

### 6.7 مثال عملي

لنفترض منتجًا يمر بأربع عمليات:

| رقم | العملية | المورد | وقت الإعداد | وقت التشغيل (للوحدة) |
|---|---|---|---|---|
| 10 | قص | ماكينة القص-1 | 30 دقيقة | 2 دقيقة |
| 20 | تجميع | فريق التجميع | 15 دقيقة | 5 دقائق |
| 30 | دهان | كابينة الدهان | 45 دقيقة | 3 دقائق |
| 40 | فحص جودة | فاحص الجودة | — | 1 دقيقة |

لإنتاج 100 وحدة، الوقت الإجمالي = (30+15+45+0) إعداد + 100 × (2+5+3+1) تشغيل = 90 دقيقة إعداد + 1100 دقيقة تشغيل = 1190 دقيقة ≈ 19.8 ساعة.

عند ربط كل عملية بـ Cost category لها سعر/ساعة، يستطيع النظام حساب **تكلفة التشغيل** كجزء من تكلفة المنتج، وكل عملية ستولّد قيدًا محاسبيًا منفصلًا (Route card journal).

### 6.8 أثر Routes على التكلفة

في Standard cost، تنعكس كل ساعة من Route على التكلفة المعيارية للمنتج. وأي اختلاف بين الوقت المعياري والوقت الفعلي المُسجَّل في **Job card journal** أو **Route card journal** سيظهر كـ **Production quantity variance** عند إقفال أمر الإنتاج.

**المصادر الرسمية لهذا القسم:**
- Routes and operations — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/routes-operations
- Operations resources — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/operations-resources
- Operations scheduling — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/operations-scheduling

---

## 7. دورة حياة أمر الإنتاج (Production Order Lifecycle)

دورة حياة أمر الإنتاج في Dynamics 365 موثّقة بدقة عبر سلسلة من الحالات (Statuses). الحالة ليست تجميلية، بل تحدد ما يمكن وما لا يمكن فعله بالأمر، وتُولّد حركات مخزنية ومحاسبية. الحالات التي تذكرها Microsoft:

### 7.1 Created (تم الإنشاء)

تُنشأ أوامر الإنتاج بثلاث طرق:
- يدويًا من Production control > All production orders.
- تلقائيًا عبر Master planning (تثبيت Planned production order).
- مباشرة من سطر طلب بيع، أو من أمر إنتاج علوي (Pegged supply).

في هذه الحالة، يكون الأمر مجرد طلب لم يُحسَب بعد. لم تُحجَز موارد، ولم تُحتسَب تكلفة، ولا توجد حركات مخزون.

### 7.2 Estimated (تم التقدير)

هذه واحدة من أهم الحالات لأنها تُولّد حركات مخزنية تقديرية:
- **حركات مخزون للمواد الخام** بحالة **On order** (مطلوب).
- **حركة استلام للمنتج النهائي** (والمنتجات المشتركة والثانوية إن وجدت).
- إذا كانت BOM تحوي **Pegged supply lines**، تُنشأ أوامر شراء أو إنتاج فرعية تلقائيًا.
- يُحسَب **Estimated cost** للأمر بناءً على BOM وRoute والأسعار النشطة.

> هذه أول لحظة يتغيّر فيها وضع المخزون. لا توجد قيود محاسبية بعد، لكن النظام يعرف الآن أن هناك مواد مطلوبة ومنتجًا متوقّعًا.

### 7.3 Scheduled (تمت الجدولة)

تُحجَز طاقة الموارد بناءً على Route. توجد طريقتان للجدولة:

| الطريقة | الوصف |
|---|---|
| **Operations scheduling** | جدولة عامة، تعطي تواريخ بداية ونهاية لكل عملية، تُستخدَم للتخطيط طويل المدى. |
| **Job scheduling** | جدولة تفصيلية، تكسر كل عملية إلى Jobs (إعداد، تشغيل، انتظار، نقل)، تُستخدَم للجدولة قصيرة المدى. |

يمكن الجدولة:
- **بطاقة لا نهائية (Infinite capacity)** — تجاهل القيود.
- **بطاقة نهائية (Finite capacity)** — احترام طاقة الموارد المحجوزة سابقًا.

اتجاه الجدولة قد يكون **Forward** (من تاريخ بداية) أو **Backward** (من تاريخ تسليم).

### 7.4 Released (تم الإفراج)

تنصّ الوثيقة: "Released production order هو أمر مُعتمَد للإنتاج. تشير هذه الحالة إلى أن الأمر متاح للتنفيذ في صالة الإنتاج وللمعالجة في المستودع". في هذه الحالة:
- يُصبح الأمر مرئيًا لعمّال الصالة.
- تُولَّد **Warehouse work** لسحب المواد الخام (إذا كان Warehouse management مُفعَّلًا).
- يمكن طباعة **Pick list**, **Job card**, **Route card**.
- تتحوّل أسطر BOM في الأمر إلى **Picked** عند اكتمال الإعداد.

### 7.5 Started (تم البدء)

عند بدء الأمر:
- يمكن تسجيل **استهلاك المواد** (Picking list journal).
- يمكن تسجيل **استهلاك الموارد** (Route card / Job card journal).
- النظام يمكن أن يُهيّأ لـ **Preflushing / Forward flushing / Autoconsumption**: حيث يُسجَّل الاستهلاك تلقائيًا عند البدء بناءً على BOM وRoute.

عند تسجيل Picking list journal، تنشأ:
- حركة مخزون **Deducted (مَخصومة)** للمواد الخام.
- قيد محاسبي للـ WIP إذا كان WIP accounting مُفعَّلًا:
  - دائن: Estimated cost of materials consumed
  - مدين: Estimated cost of materials consumed, WIP

### 7.6 Reported as Finished (تم الإبلاغ كمنجز)

تنصّ الوثيقة: "عند الإبلاغ عن أمر إنتاج كمنجز، تُحدَّث كمية المنتجات النهائية المنجزة في المخزون عبر Report as finished journal". في هذه الحالة:
- يدخل المنتج النهائي إلى المخزون بحالة **Received** (مادي وليس مالي بعد).
- يُولَّد قيد:
  - مدين: Estimated manufactured cost (مخزون منتج نهائي)
  - دائن: Estimated manufactured cost, WIP

تُستخدَم تكلفة Standard cost في القيد. إذا كان خيار "Use estimated cost price" مفعّلًا، تُستخدَم التكلفة المُقدَّرة من الأمر بدلًا من Standard cost.

كذلك يمكن استخدام خيار **Back-flushing**: إذا لم تكن المواد قد سُجّلت يدويًا في Picking list journal، يقوم النظام تلقائيًا بصرفها لحظة الإبلاغ عن المنتج كمنجز.

في كثير من الحالات يُولَّد **Quality order** بعد الإبلاغ كمنجز إذا كانت قواعد الجودة مُفعَّلة، ويتحوّل المخزون إلى حالة "Unavailable" حتى تنتهي الجودة.

### 7.7 Ended (تم الإغلاق)

هذه الحالة المالية النهائية. تنصّ الوثيقة بدقة: "قبل إنهاء أمر الإنتاج، تُحتسب التكاليف الفعلية للكمية المُنتَجة. تُعكَس كل التكاليف المُقدَّرة للمواد والعمل والمصاريف غير المباشرة وتُستبدَل بتكاليف فعلية. تكلفة المنتج النهائي الإجمالية تُحمَّل (Debit) على حساب Manufactured cost وتُسجَّل (Credit) على حساب Manufactured cost, WIP".

عند الإغلاق:
- تُعكَس كل القيود التقديرية (Estimated).
- تُسجَّل القيود الفعلية (Actual).
- تُحتسَب **Variances** (الانحرافات) بين Standard cost والتكلفة الفعلية.
- تتحوّل حالة الأمر إلى **Ended** ولا يمكن إضافة أي تكلفة جديدة عليه.

### 7.8 الفرق بين أمر مفتوح وأمر مغلق

| الجانب | أمر مفتوح | أمر مُغلَق |
|---|---|---|
| تعديل BOM/Route | ممكن قبل البدء | غير ممكن |
| تسجيل صرف إضافي | ممكن | غير ممكن |
| تسجيل ساعات عمل | ممكن | غير ممكن |
| القيود المحاسبية | تقديرية | فعلية + انحرافات |
| المخزون | في حركات Physical | في حركات Financial |

### 7.9 جدول حالات الأمر مع أثرها

| الحالة | حركات مخزون | قيود محاسبية | يمكن التراجع؟ |
|---|---|---|---|
| Created | لا | لا | نعم |
| Estimated | On order للمواد + Receipt للمنتج | لا | نعم (Reset) |
| Scheduled | لا تغيير | لا | نعم |
| Released | تتحوّل إلى Reserved جسديًا | لا | نعم |
| Started | يمكن أن يحدث Preflush | إذا كان WIP مُفعَّل: قيود WIP تقديرية | جزئيًا |
| Reported as Finished | المنتج → Received | قيود WIP تقديرية للمنتج النهائي | بإلغاء RAF |
| Ended | المنتج → Financial | عكس التقدير + قيود فعلية + Variances | لا |

**المصادر الرسمية لهذا القسم:**
- Production order lifecycle overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/create-production-orders
- Production process overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview
- Release production orders — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/release-production-orders
- Report production orders as finished — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/report-production-orders-as-finished
- Production posting (Finance) — https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/production-posting

---

## 8. صرف المواد واستهلاكها (Material Consumption)

صرف المواد هو الفعل الأكثر تكرارًا في عملية الإنتاج، ولذلك خصّصت Microsoft له آليات متعددة.

### 8.1 الأدوات الرسمية للصرف

تذكر الوثائق آليات متعددة:

| الأداة | الاستخدام |
|---|---|
| **Picking list journal** | اليومية الرسمية لتسجيل صرف المواد إلى الإنتاج. |
| **Manufacturing execution terminal (MES)** | شاشة صالة الإنتاج لتسجيل البدء والإيقاف والاستهلاك. |
| **Production journals** (Journals > Picking list) | الواجهة المحاسبية اليدوية. |
| **Mobile scanning** | عبر تطبيق Warehouse Management. |
| **Auto-consumption / Preflushing** | تسجيل تلقائي عند بدء الأمر بناءً على BOM. |
| **Back-flushing** | تسجيل تلقائي لحظة الإبلاغ عن المنتج كمنجز. |

### 8.2 العلاقة بين BOM والصرف الفعلي

الكمية المتوقّع صرفها تُحدَّد بناءً على BOM وكمية الأمر. لكن الكمية **الفعلية** المُسجَّلة في Picking list journal قد تختلف:
- إذا صُرفت كمية أكبر: ستظهر كـ **Production quantity variance** أو **Substitution variance** عند الإقفال.
- إذا صُرفت كمية أقل: نفس النوع من الانحرافات لكن باتجاه معاكس.
- إذا صُرف صنف بديل (غير المذكور في BOM): يُسجَّل كـ **Production substitution variance**.

تذكر وثيقة "Common sources of production variances" أن من المصادر النموذجية لـ Production quantity variance: "صرف مكوّن أكثر أو أقل من المطلوب. الإبلاغ عن وقت أكثر أو أقل لعملية. استلام كمية أكبر أو أقل من المطلوب من المنتج الأب".

### 8.3 الصرف اليدوي مقابل التلقائي

| الصرف اليدوي | الصرف التلقائي |
|---|---|
| المستخدم يُنشئ Picking list journal ويرحّله | النظام ينشئه ويرحّله بناءً على إعداد |
| يتيح التحقق قبل الترحيل | أسرع وأقل خطأً بشريًا |
| مناسب لمواد ثمينة أو حساسة | مناسب لمواد قياسية وعمليات متكررة |
| يتطلّب وعيًا من العامل بالكمية | لا يكتشف فروقات الواقع إلا في Variance |

ضبط إعداد الصرف يكون عبر حقل **Automatic BOM consumption** في إعدادات Production control وأمر الإنتاج، وله ثلاث قيم:
- **Never** — لا صرف تلقائي.
- **Flushing principle** — احترم إعداد كل سطر BOM (يدوي، عند البدء، عند الإبلاغ).
- **Always** — صرف تلقائي بصرف النظر عن الإعدادات الفردية.

### 8.4 المرتجعات من الإنتاج

إذا أُرجعت مواد من الإنتاج إلى المخزون، تُسجَّل بـ Picking list journal بكميات سالبة أو عبر إنشاء سطر إرجاع. هذا يخفّض WIP ويُعيد المواد إلى مخزون متاح.

### 8.5 أثر الصرف على المخزون

عند ترحيل Picking list journal:
- حركة المخزون: المخزون المتاح يقل بالكمية المصروفة.
- نوع الحركة: Issued (مَصروف).
- في حالة استخدام Batch/Serial dimensions: يجب اختيار الـ Batch/Serial المُصرَّف.

### 8.6 أثر الصرف على WIP

تنصّ الوثيقة بوضوح: "قيمة المواد الخام التي قيد التشغيل (WIP) تُرحَّل إلى حسابات Estimated cost of materials consumed وEstimated cost of materials consumed, WIP. عملية Picking list في أمر الإنتاج هي تحديث مادي (Physical update) للحركات المخزنية المرتبطة بالأمر. عند إغلاق الأمر، تُعكَس الحركات المادية وتُحدَّث الحركات ماليًا (Financial update)".

بعبارة أوضح: عند الصرف:
- مدين: حساب WIP (مادة قيد التشغيل) — قيمة تقديرية
- دائن: حساب مخزون المواد الخام — قيمة تقديرية

عند الإقفال، هذه القيود تُعكَس وتُستبدَل بقيم فعلية.

**المصادر الرسمية لهذا القسم:**
- Production posting (Finance) — https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/production-posting
- Production posting (Cost management) — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/production-posting
- Common sources of production variances — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/common-sources-of-production-variances

---

## 9. استلام المنتج النهائي (Report as Finished)

عملية **Report as Finished** (يُختصر RAF) هي عملية حسّاسة تجمع بين التحديث المخزني والمحاسبي.

### 9.1 معنى Report as Finished

تنصّ الوثيقة: "عند الإبلاغ عن أمر إنتاج كمنجز، تُحدَّث كمية المنتجات النهائية المنجزة في المخزون عبر Report as finished journal. هذه الكمية تشمل أيضًا كمية المنتجات المشتركة والثانوية ذات الصلة".

### 9.2 آليات تنفيذ RAF

تشير الوثيقة إلى أن RAF يمكن تنفيذه عبر:
- التحديث القياسي لأمر الإنتاج (Production order update).
- يومية Route card / Job card عبر علامة "End job".
- يومية Report as finished مباشرة.
- شاشة Manufacturing execution interface في الصالة.

### 9.3 الإنتاج الجزئي

ميزة مهمة: يمكن الإبلاغ عن جزء من الكمية كمنجز، مع ترك الباقي مفتوحًا. مثال: أمر بـ 100 وحدة، الإبلاغ عن 60 منجزة + 5 معيبة، ويبقى 35 وحدة "Remain" لإنتاج لاحق.

في كل عملية إبلاغ:
- **Good quantity** — الكمية السليمة.
- **Error quantity** — الكمية المعيبة (يُتحكَّم في معالجتها عبر "Scrap method").

### 9.4 خياران لمعالجة الكمية المعيبة

تنصّ الوثيقة على وجود خيارين:
1. **توزيع قيمة Error quantity على Good quantity** — أي تحميل المنتج السليم تكلفة المعيب (هالك طبيعي).
2. **ترحيل قيمة Error quantity إلى حساب Scrap منفصل** — معاملته كمصروف صناعي مستقل.

الخيار يُحدَّد في Production control parameters > Standard update > Scrap method.

### 9.5 خيار Deferred Posting

أضافت Microsoft ميزة "Deferred posting": عند الإبلاغ عن المنتج كمنجز، يصبح متاحًا مخزنيًا فورًا، لكن القيود المحاسبية تُؤجَّل وتُعالج لاحقًا عبر Message processor batch job. هذا يحسّن أداء النظام في خطوط الإنتاج عالية الحركة.

### 9.6 أثر RAF على المخزون والـ WIP

عند ترحيل Report as finished journal:
- حركة مخزون: المنتج النهائي → Received (مادي).
- قيد محاسبي (إذا كان WIP مفعّلًا):
  - مدين: Estimated manufactured cost (مخزون منتج نهائي) — بقيمة تقديرية
  - دائن: Estimated manufactured cost, WIP — بنفس القيمة

هذه القيود تُعكَس عند إغلاق الأمر وتُستبدَل بقيم فعلية:
- مدين: Manufactured cost
- دائن: Manufactured cost, WIP

### 9.7 التطابق بين الكمية المنتَجة والمواد المصروفة

من الناحية المحاسبية، الفارق بين قيمة المواد المصروفة + ساعات العمل + المصاريف غير المباشرة من جهة، وقيمة المنتج المُستلَم من جهة أخرى، هو ما يُحسَب كـ **Variance** عند الإقفال. هذا الفارق يخبر إدارة الإنتاج بكفاءة العملية الإنتاجية.

**المصادر الرسمية لهذا القسم:**
- Report production orders as finished — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/report-production-orders-as-finished
- Make finished goods physically available before posting to journals — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/deferred-posting
- Production posting (Finance) — https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/production-posting

---

## 10. إغلاق أمر الإنتاج (Ending the Production Order)

إغلاق أمر الإنتاج (تحويل حالته إلى **Ended**) ليس مجرّد إجراء إداري، بل **حدث محاسبي حاسم**.

### 10.1 ماذا يحدث عند الإغلاق؟

تنصّ الوثيقة: "قبل إنهاء أمر الإنتاج، تُحتسَب التكاليف الفعلية للكمية المنتَجة. تُعكَس جميع التكاليف المُقدَّرة للمواد والعمالة والمصاريف غير المباشرة وتُستبدَل بتكاليف فعلية".

أي أن:
1. كل القيود التي رُحِّلت كـ "Estimated" (تقديرية) تُعكَس.
2. تُسجَّل قيود "Actual" (فعلية) بدلًا منها.
3. الفرق بين Standard cost والتكلفة الفعلية يُحوَّل إلى حسابات Variance المحددة.

### 10.2 ما يجب التحقق منه قبل الإغلاق

| المطلوب | لماذا |
|---|---|
| كل ساعات العمل مُسجَّلة | لئلا تظهر ساعات لاحقة كانحراف. |
| كل المواد المصروفة مُسجَّلة | لئلا تُحسَب تكلفة المنتج ناقصة. |
| الكمية النهائية المُبلَّغ عنها = الكمية المخطّطة (أو ضمن هامش مقبول) | لتجنّب Lot size variance غير المبرَّر. |
| المخزون المتاح من المواد المُصروفة كافٍ | للتأكد من أن النظام لن يفشل في تسجيل آخر صرف. |
| تسعير Standard cost للمواد محدَّث | لئلا تظهر انحرافات سعرية مزيّفة. |

### 10.3 أثر الإغلاق على Variances

تنصّ الوثيقة أن الانحرافات تعكس "مقارنة بين الأنشطة الإنتاجية المُبلَّغ عنها وحساب التكلفة المعيارية للمنتج المُنتَج. الانحرافات لا تعكس مقارنة بتكاليف الأمر التقديرية".

أي أن الانحرافات تُقاس مقابل **Standard cost**، وليس مقابل التقديرات الأولية. هذا فرق دقيق:
- التقديرات (Estimated) قد تختلف عن Standard cost إذا تغيّرت Cost categories بين الإنشاء والإغلاق.
- الانحرافات تُقارن دائمًا بـ Standard cost الرسمي.

### 10.4 لماذا الإغلاق ضروري ماليًا وتشغيليًا؟

- **ماليًا:** لا تُسجَّل التكلفة الفعلية ولا الانحرافات إلا عند الإغلاق. أوامر إنتاج تُترَك مفتوحة تظل تكلفتها معلَّقة وتشوّش تقارير المخزون.
- **تشغيليًا:** الأمر المفتوح يحجز موارد ومواد ويظهر كأمر "نشط" مما يربك تخطيط الإنتاج.
- **WIP محاسبيًا:** أوامر مفتوحة كثيرة = WIP متضخّم في الميزانية.

### 10.5 إعادة فتح أمر إنتاج

عند الإغلاق لا يمكن التراجع بسهولة. في بعض النسخ (Business Central) يمكن استخدام "Reopen action" مرة واحدة فقط للتصحيح، لكن في D365 SCM يكون التصحيح عادةً عبر قيود تسوية يدوية وليس عبر إعادة فتح.

**المصادر الرسمية لهذا القسم:**
- Production posting (Finance) — https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/production-posting
- Production order cost analysis — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/production-order-cost-analysis
- Common sources of production variances — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/common-sources-of-production-variances

---

## 11. تكلفة الإنتاج في Dynamics 365

هذا القسم هو القلب المالي لأي نظام إنتاج. سنبني الفهم من المفهوم الأبسط إلى الأعقد.

### 11.1 مفهوم تكلفة الإنتاج

تكلفة المنتج النهائي في Dynamics 365 تتكوّن من:
1. **تكلفة المواد** (Material cost) — من BOM.
2. **تكلفة العمل/الموارد** (Labor / Resource cost) — من Route وOperations وCost categories.
3. **التكاليف غير المباشرة** (Indirect costs / Overhead) — من Costing sheet (نسبة أو إضافة).
4. **تكلفة الهالك** (Scrap cost) — من إعدادات Scrap.

### 11.2 BOM Calculation

تذكر وثيقة BOM calculations أن "BOM calculations هي عمليتا Cost roll-up وSales price calculation، وتُطلَق من صفحة Calculations". تتيح الصفحة:
- حساب تكلفة المنتج المصنَّع وتوليد سجل تكلفة الصنف ضمن Costing version.
- حساب سعر البيع المُقترَح وتوليد سجل سعر بيع.

عند تنفيذ BOM calculation:
- يجلب النظام BOM وRoute النشطين (أو معتمَدَين بديلين).
- يحسب تكلفة المواد بضرب الكمية × التكلفة من Costing version.
- يحسب تكلفة Route بضرب Setup + Run time × Cost categories.
- يضيف Overhead حسب Costing sheet.
- ينتج: Cost record (تقديري Pending أو فعّال Active) ضمن Costing version.

### 11.3 Costing Versions

**Costing version** هو حاوية للتكاليف المعيارية أو المخططة. تذكر الوثيقة:
- **Standard cost costing version:** يحوي مجموعة من سجلات Standard cost للأصناف وعمليات التصنيع.
- **Planned cost costing version:** يحوي تكاليف مخطّطة، يُستخدَم عادةً لمحاكاة تأثير تغيّر التكاليف.

كل سجل تكلفة (Cost record) في Costing version له:
- حالة (Pending → Active).
- تاريخ سريان (Effective date).
- موقع (Site).

عند تفعيل سجل تكلفة، يصبح هو الأساس لتقدير تكاليف أوامر الإنتاج وتقييم حركات المخزون.

### 11.4 Standard Cost vs Actual Cost

| الجانب | Standard Cost | Actual Cost (FIFO/LIFO/Average) |
|---|---|---|
| تقييم المخزون | بسعر معياري ثابت | بالتكلفة الفعلية للحركة |
| الانحرافات | تظهر بشكل صريح وتُسجَّل في حسابات Variance | لا توجد انحرافات صريحة، التكلفة الفعلية تُمتص في المخزون |
| الاستقرار | تكلفة ثابتة للمنتج خلال الفترة | تكلفة المنتج تتغيّر مع كل حركة |
| المناسب لـ | الصناعات ذات وصفات ثابتة وعمليات قياسية | الصناعات ذات تقلّبات كبيرة في أسعار المواد |
| تعقيد الإعداد | عالٍ (يتطلب Costing version كاملة) | أقل تعقيدًا في الإعداد |

تنصّ Microsoft أن Lean manufacturing تعتمد على **Backflush costing** كمبدأ، وهي طريقة هجينة تستخدم Standard cost ثم تسوّي الفروقات دوريًا.

### 11.5 Estimated vs Actual Cost في أمر الإنتاج

كل أمر إنتاج يمر بنوعين من التكلفة:
1. **Estimated cost** — يُحسَب لحظة "Estimate" بناءً على BOM وRoute والأسعار النشطة.
2. **Actual cost** — يُحسَب عند الإقفال بناءً على ما سُجِّل فعليًا (مواد مصروفة، ساعات عمل).

الفرق بين الاثنين قد ينشأ من:
- صرف مواد أكثر/أقل.
- ساعات تشغيل أكثر/أقل.
- تغيّر أسعار المواد بعد الإنشاء.

### 11.6 الأنواع الأربعة لـ Production Variances

توثّق وثيقة "Production order cost analysis" أربعة أنواع رسمية للانحرافات:

| النوع | المعنى | سبب نموذجي |
|---|---|---|
| **Lot size variance** | فرق بسبب حجم الدفعة | الكمية الفعلية المُنتَجة تختلف عن الكمية القياسية، وتغطية التكاليف الثابتة (Setup) موزَّعة بشكل مختلف. |
| **Production quantity variance** | فرق بسبب كميات الاستهلاك أو الإنتاج | صرف أكثر/أقل من BOM، ساعات أكثر/أقل من Route، استلام أكثر/أقل من المخطّط. |
| **Production price variance** | فرق بسبب السعر | السعر الفعلي للمادة أو لساعة العمل يختلف عن Standard cost. |
| **Production substitution variance** | فرق بسبب الاستبدال | استخدام صنف لم يكن في BOM، أو Cost category مختلفة عن المعيارية. |

تذكر Microsoft بدقة في "Common sources of production variances":
- مصادر **Lot size variance**: الكمية الجيدة المُنتَجة تختلف عن كمية الحساب القياسي، أو قيمة التكاليف الثابتة في الأمر تختلف عن المُستخدَمة في Standard cost.
- مصادر **Production price variance**: Cost category المُبلَّغ عنها تختلف عن المُستخدَمة في Standard cost، أو التكلفة النشطة لـ Cost category تختلف.
- مصادر **Production quantity variance**: صرف مكوّن بأكثر/أقل، الإبلاغ عن وقت بأكثر/أقل، استلام كمية بأكثر/أقل.
- مصادر **Production substitution variance**: إصدار مكوّن غير موجود في Production BOM.

### 11.7 WIP (Work in Process)

WIP هو الجسر المحاسبي بين الإنتاج والمالية. حساب WIP في الميزانية يُمثّل:
- قيمة المواد المصروفة لكن لم تنتهِ كمنتج بعد.
- قيمة ساعات العمل المُسجَّلة لكن لم تنتهِ كمنتج بعد.
- قيمة المصاريف غير المباشرة المُحمَّلة لكن لم تنتهِ كمنتج بعد.

تذكر الوثيقة وجود حسابين رئيسيين:
- **Estimated cost of materials consumed, WIP** — للمواد قيد التشغيل (تقديري).
- **Cost of materials consumed, WIP** — للمواد قيد التشغيل (فعلي).
- وحسابات مقابلة للـ Manufactured cost.

دورة WIP تعمل كالتالي:
1. عند صرف مادة → WIP يزداد (مدين)، مخزون المواد ينقص (دائن).
2. عند استلام منتج نهائي → WIP يقل (دائن)، مخزون منتج نهائي يزداد (مدين).
3. عند إقفال الأمر → القيود التقديرية تُعكَس، وتُسجَّل القيود الفعلية، والفروقات تذهب إلى حسابات الانحرافات.

### 11.8 Cost Groups

**Cost group** يصنّف عناصر التكلفة، ويُستخدَم في:
- تقسيم تكلفة المنتج النهائي إلى فئات (مواد، عمالة، Overhead).
- تطبيق ربح مختلف لكل فئة عند حساب سعر البيع (Profit setting).
- عرض الانحرافات مفصَّلة حسب الفئة.

### 11.9 مثال رقمي مبسَّط

لنفترض منتجًا "X" بالمواصفات التالية:

**BOM:**
- 2 كغ مادة A بـ 10 دينار/كغ = 20 دينار
- 1 لتر مادة B بـ 5 دينار/لتر = 5 دينار
- هالك متغيّر 10% على المادة A = 0.2 كغ × 10 = 2 دينار

**Route:**
- إعداد 30 دقيقة × 0.5 دينار/دقيقة = 15 دينار/أمر
- تشغيل 5 دقائق × 0.5 دينار/دقيقة = 2.5 دينار/وحدة

**Overhead:**
- 20% على تكلفة العمل = 0.5 × 2.5 = 0.5 دينار/وحدة (لتكلفة التشغيل) + 3 دينار/أمر (لتكلفة الإعداد)

**Standard cost للوحدة (لأمر بـ 100 وحدة):**
- مواد: 20 + 5 + 2 = 27 دينار
- تشغيل: 2.5 + 0.5 = 3 دينار
- إعداد (موزَّع): (15 + 3) ÷ 100 = 0.18 دينار
- **الإجمالي: 30.18 دينار/وحدة**

**لو حدث في الإنتاج الفعلي:**
- صُرف 2.3 كغ من A بدل 2.2 (10% هالك مدمج) → فرق +1 دينار في المواد لكل وحدة → Production quantity variance.
- وقت التشغيل الفعلي 6 دقائق بدل 5 → 3 دينار/وحدة فعلي بدل 2.5 → Production quantity variance.
- سعر المادة A لحظة الصرف 11 دينار/كغ بدل 10 → Production price variance.

عند إقفال الأمر، النظام سيُسجِّل التكلفة الفعلية ويُولِّد قيدًا للانحرافات (الفرق بين Standard 30.18 والتكلفة الفعلية المُحتسَبة).

**المصادر الرسمية لهذا القسم:**
- BOM calculations — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/bom-calculations
- Costing versions overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/costing-versions
- Production order cost analysis — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/production-order-cost-analysis
- Common sources of production variances — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/common-sources-of-production-variances
- Inventory costing FAQ — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/inventory-costing-faq
- Standard cost conversion overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/standard-cost-conversion-overview
- Backflush costing — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/backflush-costing

---

## 12. العلاقة المالية والمحاسبية

تخصّص Microsoft وثيقة كاملة بعنوان "Production order posting" تشرح كيف ترتبط دورة الإنتاج بدفتر الأستاذ العام. سنبني الفهم بناءً على ما توثّقه الوثيقة.

### 12.1 شراء المواد

عند شراء المادة الخام (خارج وحدة Production مباشرةً، عبر وحدة Procurement):
- يدخل المخزون بقيمته (مدين: مخزون مواد).
- يُسجَّل التزام أو دفع (دائن: موردون أو نقدية).

### 12.2 صرف المواد إلى الإنتاج

عند ترحيل **Picking list journal**:
- مدين: **Estimated cost of materials consumed, WIP** (حساب WIP للمواد)
- دائن: **Estimated cost of materials consumed** (يخفّض مخزون المواد)

هذا قيد **تقديري Physical** (لاحظ كلمة Estimated في الأسماء). يُعكَس عند الإقفال.

### 12.3 ساعات التشغيل (Time consumption)

عند ترحيل **Route card / Job card journal**:
- مدين: حساب Resources WIP (تقديري)
- دائن: حساب امتصاص Manufacturing cost absorbed (تقديري)

### 12.4 المصاريف غير المباشرة (Indirect costs)

تذكر الوثيقة: "عند معالجة حركات أمر الإنتاج، يمكنك إعداد المصاريف غير المباشرة لالتقاط Overhead أو رسوم إضافية في دفتر الأستاذ. الحركات المادية للمصاريف غير المباشرة تُسجَّل في المخزون عند ترحيل Picking list journal أو Report as finished journal. الحركات المالية تُسجَّل عند ترحيل End journal".

أي أن Overhead يُحمَّل تلقائيًا بناءً على إعداد **Costing sheet**.

### 12.5 استلام المنتج النهائي

عند ترحيل **Report as finished journal**:
- مدين: **Estimated manufactured cost** (مخزون منتج نهائي بقيمة تقديرية)
- دائن: **Estimated manufactured cost, WIP** (يخفّض WIP بقيمة تقديرية)

### 12.6 إغلاق الأمر (End)

عند ترحيل **End journal**:
1. تُعكَس كل القيود التقديرية أعلاه.
2. تُسجَّل قيود فعلية:
   - مدين: **Cost of materials consumed, WIP** (فعلي)
   - دائن: **Cost of materials consumed** (فعلي)
   - مدين: **Manufactured cost** (فعلي)
   - دائن: **Manufactured cost, WIP** (فعلي)
3. أي فرق بين Standard cost والتكلفة الفعلية يُسجَّل في حسابات **Variance**.

### 12.7 جدول الحسابات النموذجية

تُقدّم Microsoft جدولًا للحسابات الافتراضية في وثيقة Production posting:

| نوع الترحيل | الحساب المقترَح | الوصف |
|---|---|---|
| Estimated cost of materials consumed | 140100 - Materials Inventory | يُستخدَم عند ترحيل Picking list. عكس Estimated cost of materials consumed, WIP. |
| Estimated cost of materials consumed, WIP | 150150 - Production WIP - Materials | WIP المواد في الميزانية. |
| Estimated manufactured cost | 140200 - Finished Goods Inventory | يُستخدَم عند RAF. مخزون منتج نهائي تقديريًا. |
| Estimated manufactured cost, WIP | 150150 - Production WIP - Materials | يقابل الـ Receipt للمنتج. |
| Cost of materials consumed | 140100 - Materials Inventory | تكلفة المواد الفعلية عند الإقفال. |
| Cost of materials consumed, WIP | 150150 - Production WIP - Materials | تقابل التكلفة الفعلية. |
| Manufactured cost | 140200 - Finished Goods Inventory | تكلفة المنتج النهائي الفعلية. |
| Manufactured cost, WIP | 150150 - Production WIP - Materials | تقابل تكلفة المنتج الفعلية. |

> **ملاحظة من Microsoft:** "الحسابات المقترَحة والأسماء هي اقتراحات. نوصي بالعمل مع المحاسب لتحديد أفضل تكوين لاحتياجات العمل".

### 12.8 ثلاث مستويات لـ Ledger posting

تنصّ الوثيقة أن حقل **Ledger posting** في Production control parameters له ثلاث قيم:

| المستوى | المصدر | الاستخدام |
|---|---|---|
| **Item and resource** | الحساب يأتي من المورد أو مجموعة الموارد على عملية Route | تحليل دقيق جدًا، أنسب للشركات التي تحلّل تكلفة كل مورد على حدة (Make vs Buy). |
| **Item and category** | الحساب يأتي من Cost category لكل سطر Route | تحليل متوسط، أنسب للشركات التي تركّز على كفاءة العملية ومدّتها. |
| **Production group** | الحساب يأتي من Production group | تحليل مُجمَّع، أنسب عندما تتعدد الخطوط بنفس النوع من المعدّات. |

### 12.9 WIP محاسبيًا

WIP في الميزانية يُمثّل الأصول قيد التحويل. يدخل WIP عند الصرف ويخرج عند الاستلام. الإقفال يُسوّي الفروقات. أوامر إنتاج كثيرة مفتوحة = WIP متضخّم في الميزانية = إشارة للمالية بأن هناك تأخّر في إقفال أوامر.

### 12.10 تقارير وقيود يحتاجها المحاسب

- **WIP Statement** (Cost management > Workspaces > Cost administration > Production WIP statement) — يُظهر قيمة WIP الحالية لأي أمر.
- **Production variance report** — يعرض الانحرافات الأربعة لكل أمر مُغلَق.
- **Cost estimates and costings report** — يقارن التكلفة التقديرية بالفعلية.
- **Production posting page** — تُظهر كل الحركات المحاسبية لأمر معين.

> **تنبيه مهم:** التفاصيل الفعلية لأرقام الحسابات وآلية الترحيل تعتمد على إعدادات النظام (Inventory posting profile وProduction groups وItem model groups). ما عرضناه هنا هو المنطق العام بناءً على وثائق Microsoft، والتطبيق الفعلي قد يختلف حسب التكوين.

**المصادر الرسمية لهذا القسم:**
- Production posting (Finance) — https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/production-posting
- Production posting (Cost management) — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/production-posting
- Track production costs business process — https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/plan-to-produce-track-production-costs-overview

---

## 13. التخطيط والجدولة (Planning & Scheduling)

التخطيط والجدولة في Dynamics 365 يُغطَّيان عبر عدة طبقات.

### 13.1 Master Planning

تنصّ الوثيقة الرسمية: "Master planning module يحدّد احتياجات التوريد (المواد) والطاقة (الموارد) التي ستلبّي الطلب الحالي (Net requirements)".

يولّد Master planning **Planned production orders** بناءً على:
- طلبات بيع.
- توقّعات (Forecast).
- إعادة تعبئة المخزون الأدنى.
- حركة من Item coverage.

ثم يأتي دور المخطّط (Planner) بتثبيت (Firming) هذه الأوامر المخطّطة لتتحوّل إلى Production orders فعلية بحالة Created.

### 13.2 Operations Scheduling

تذكر الوثيقة: "Operations scheduling تحجز طاقة على مجموعات الموارد بناءً على أوقات العمليات المعرَّفة في Production route. مجموع الطاقة المتاحة على الموارد المعنية يحدد طاقة مجموعة الموارد. حجوزات الطاقة الموجودة تُعتبَر طاقة غير متاحة. إذا لم تكن هناك طاقة متاحة، يمكن أن تتأخّر أوامر الإنتاج أو حتى تتوقّف".

ميزات Operations scheduling:
- التحكّم بطريقة التخطيط (Forward أو Backward).
- تحسين استخدام الموارد بناءً على طاقتها.
- تجاهل بعض الأوقات (Queue، Setup، Process، Overlap، Transport) عند الحاجة.

### 13.3 Job Scheduling

أكثر تفصيلًا من Operations scheduling. كل عملية تُكسَر إلى **Jobs** فردية بأوقات محددة وموارد محددة. تُستخدَم Job scheduling عادةً للجدولة قصيرة المدى (يوم/أسبوع).

### 13.4 Infinite vs Finite Capacity

| الطريقة | المعنى | المتى تُستخدَم |
|---|---|---|
| **Infinite capacity** | لا تأخذ في الحسبان الطاقة الفعلية للموارد، تعتبرها لا نهائية | للتخطيط الأوّلي وفحص الجدوى. |
| **Finite capacity** | تحترم الطاقة المُحجَّزة فعليًا، وتؤخّر الأمر إذا لم تتوفّر طاقة | للتخطيط الواقعي والتنفيذي. |

لتفعيل Finite capacity، يجب تفعيلها على مستوى:
- Master planning parameters globally.
- Master plan معيّن.
- كل مورد على حدة (Operation FastTab > Finite capacity = Yes).

### 13.5 Resource Capacity

كل مورد يرتبط بـ Calendar يحدّد الساعات المتاحة. الطاقة المتاحة لمجموعة موارد = مجموع طاقة الأعضاء × Efficiency percentage.

**Efficiency percentage** على المورد يُعدِّل الإنتاجية الفعلية. مثال: مورد بطاقة 8 ساعات/يوم وكفاءة 90% = 7.2 ساعة فعلية متاحة.

### 13.6 Make to Stock vs Make to Order

| Make to Stock (MTS) | Make to Order (MTO) |
|---|---|
| الإنتاج بناءً على توقّع | الإنتاج بناءً على طلب فعلي |
| منتجات قياسية، طلب مستقر | منتجات قابلة للتعديل، طلب متذبذب |
| مخزون منتج نهائي مرتفع | مخزون منتج نهائي منخفض |
| سرعة تسليم عالية | مدّة تسليم أطول لكن مرونة أعلى |
| في النظام: Master planning يولّد أوامر بناءً على Forecast | في النظام: أمر مبيعات يولّد Pegged production order |

### 13.7 Capacity Time Fence

ميزة مهمة في Master planning: **Capacity time fence** يحدد عدد الأيام في المستقبل التي سيأخذ فيها Master planning في الحسبان طاقة الموارد. خارج هذا الإطار، يُستخدَم Lead time العادي للصنف. هذا يحسّن أداء التخطيط.

**المصادر الرسمية لهذا القسم:**
- Master planning home page — https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-planning-home-page
- Master plans overview — https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-plans
- Operations scheduling — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/operations-scheduling
- Finite capacity planning and scheduling — https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/finite-capacity

---

## 14. الجودة، الهالك، والانحرافات

### 14.1 الهالك (Scrap)

ذكرنا في القسم 5 آليات الهالك في BOM. لكن الوثيقة الرسمية تُشير إلى أن الهالك يمكن تعريفه في عدّة مواقع:

| الموقع | الاستخدام |
|---|---|
| **Item card** | نسبة هالك عامة للمنتج النهائي. |
| **BOM/Formula line** | هالك ثابت أو متغيّر لمكوّن معيّن. |
| **Route operation** | نسبة هالك لعملية معيّنة. |
| **Resource** | هالك متوقَّع لآلة معيّنة. |

### 14.2 الفرق بين الهالك الطبيعي والهالك غير الطبيعي (كمفهوم محاسبي)

> **ملاحظة:** هذا التمييز مفهوم محاسبي عام وليس صريحًا في وثائق Microsoft، لكنه يُطبَّق في النظام عبر إعداد Scrap method.

- **هالك طبيعي (Normal scrap):** هالك متوقّع ومدرَج في تكلفة المنتج المعيارية. يُوزَّع تلقائيًا على Good quantity.
- **هالك غير طبيعي (Abnormal scrap):** هالك زائد عن المتوقّع، يُعامَل كمصروف مستقل عبر "Scrap account" (يحدَّد في Production control parameters > Standard update > Scrap method).

### 14.3 Quality Orders

تذكر الوثيقة أنه "بعد استلام المنتج، يمكن أن يُولِّد النظام Quality order تلقائيًا بناءً على إعدادات اختبارات الجودة وقواعد الجودة للمنتج. لأن Quality order يمكن أن يُحدّث حالة المخزون أو خصائص الدفعة، فإن تقييم الجودة عملية إلزامية في كثير من الصناعات".

عند توليد Quality order:
- المخزون يكون **Received** لكن **Unavailable** (مَحجوز للجودة).
- بعد الفحص، المخزون يصبح متاحًا أو يُرفَض.

### 14.4 Rework (إعادة التصنيع)

في حالات معينة، يمكن إنشاء **Rework production order** لإعادة تصنيع منتجات معيبة. تُتيح Microsoft "Split a batch order into two or more batch orders and to create rework batch orders".

### 14.5 الانحرافات وأثرها على تقييم الأداء

أُتمَّت تغطية الانحرافات الأربعة في القسم 11. ما يبقى إضافته هنا هو **الاستخدام الإداري**:
- **Production quantity variance المرتفع** = مشاكل في عملية الإنتاج أو في BOM.
- **Production price variance المرتفع** = أسعار المواد فعلية تختلف عن المعيارية = إشارة لتحديث Standard cost.
- **Substitution variance المتكرر** = الموردون يبيعون أصنافًا بديلة، أو BOM غير محدَّثة.
- **Lot size variance** = أحجام الإنتاج الفعلية لا تطابق المخطّطة = مراجعة سياسة الحجم الأمثل.

تذكر الوثيقة الرسمية "Develop production processes": "تتبّع التكاليف الفعلية يمكن أن يشير إلى بيانات غير دقيقة في BOMs وRoutes. مثلًا، انحراف متكرّر على خطوة Route لمنتج قد يعني أن Route نفسها يجب تعديلها لتكون مدّتها صحيحة".

**المصادر الرسمية لهذا القسم:**
- Set up scrap to calculate raw material requirements — https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/scrap-calculations
- Production process overview (Quality assessment section) — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview
- Common sources of production variances — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/common-sources-of-production-variances
- Develop production processes — https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/plan-to-produce-track-production-costs-overview

---

## 15. التقارير والرقابة

من واقع وثائق Microsoft وأساسيات نظام إنتاج محترف، يجب أن يوفّر النظام عائلة من التقارير، نستعرضها مع المستفيد من كل تقرير:

### 15.1 جدول التقارير الأساسية

| التقرير | المحتوى | المستفيد الرئيسي |
|---|---|---|
| **All Production Orders** | جميع الأوامر بحالاتها (Created, Released, Started, RAF, Ended) | مدير الإنتاج، فريق ERP |
| **Materials in Process** | حركات Picking list لكل أمر نشط بكمية وقيمة | مدير المستودعات، مراقب التكلفة |
| **Work in Process (WIP)** | ساعات العمل المُسجَّلة لكل أمر، Good/Error quantity، تكلفة الموارد | مراقب التكلفة، مدير الإنتاج |
| **Indirect costs in Process** | Overhead المُحمَّلة على كل أمر نشط | المحاسب |
| **Cost estimates and costings** | مقارنة بين التكلفة التقديرية والفعلية، عرض تفصيلي حسب المكوّن والعملية | مراقب التكلفة |
| **Production WIP Statement** | قيمة WIP الحالية لأمر معيّن | المحاسب، المالية |
| **Production Variance Report** | الانحرافات الأربعة لكل أمر مُغلَق | مراقب التكلفة، المالية |
| **Resource Capacity / Load** | كفاءة الموارد، الطاقة المُستخدَمة مقابل المتاحة | مدير الإنتاج، التخطيط |
| **Cost Comparison** | تكلفة Active vs Estimated vs Realized لكل أمر | مراقب التكلفة |
| **Cost management Power BI** | لوحات تحليلية لـ Inventory turnover، WIP، Std. cost variance | الإدارة العليا، المالية |

### 15.2 من يحتاج ماذا؟

**مدير الإنتاج:**
- تقرير حالة كل أمر يومي.
- تقرير كفاءة الموارد.
- تقرير الكميات المُنتَجة مقابل المخطّطة.

**مدير المستودعات:**
- تقرير حركات الصرف لأوامر الإنتاج.
- تقرير الكميات المُحجَزة (Reserved).
- تقرير المرتجعات من الإنتاج.

**المحاسب:**
- تقرير WIP في نهاية كل فترة.
- تقرير الانحرافات.
- تقرير قيود الإنتاج (Production posting).
- تقرير مقارنة التكلفة الفعلية بالمعيارية.

**الإدارة العليا:**
- لوحة كفاءة الإنتاج (OEE, OTIF).
- لوحة هامش ربح المنتج (يتطلب تكلفة دقيقة).
- لوحة الانحرافات الكبيرة شهريًا.
- لوحة Cycle time و Lead time.

**فريق ERP:**
- تقرير أوامر معلّقة (Open production orders).
- تقرير الأمر بلا BOM/Route صحيح.
- تقرير الأخطاء في Picking list / RAF.

**المصادر الرسمية لهذا القسم:**
- Production order cost analysis — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/production-order-cost-analysis
- View current WIP status on a production order — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/tasks/view-current-wip-status-production-order
- Compare active, estimated, and realized costs — https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/tasks/compare-active-estimated-realized-costs
- Cost management Power BI content — https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/analytics/cost-management-content-pack

---

## 16. نقاط القوة في Microsoft Dynamics 365 Production

من دراسة وثائق Microsoft، يمكن استخراج نقاط القوة الجوهرية:

### 16.1 الترابط مع المخزون والمالية

كل حدث في الإنتاج له انعكاس مباشر على المخزون والمالية. لا توجد "بيانات يدوية" يحتاج المحاسب إدخالها لاحقًا. هذا الترابط يُقلّل الأخطاء البشرية ويسرّع الإقفال الدوري.

### 16.2 وضوح دورة حياة أمر الإنتاج

كل حالة معرَّفة بدقة، ولكل حالة آثار محددة على المخزون والمالية. هذا الوضوح يُعطي قابلية تتبّع عالية (Traceability) ويُسهّل تحليل أي مشكلة.

### 16.3 قوة BOM

نظام BOM في Dynamics ليس مجرد قائمة، بل إطار كامل يشمل:
- Versions بقيود زمنية وموقعية.
- Line types متعدّدة (Item، Phantom، Pegged supply، Vendor).
- Scrap بصيغتين (Constant، Variable).
- بدائل (Alternative BOMs).
- اعتماد وتفعيل منفصلَين.

### 16.4 نموذج التكلفة المتقدّم

النظام يدعم:
- Standard cost كامل مع 4 أنواع انحراف.
- Actual costs (FIFO، LIFO، Weighted average، Moving average).
- Backflush costing للـ Lean.
- BOM calculations مع cost rollup وsales price calculation.
- Costing versions للمحاكاة قبل التطبيق.

### 16.5 التخطيط والجدولة

- Master planning للمواد والطاقة.
- Operations scheduling وJob scheduling.
- Finite / Infinite capacity.
- Capability-based scheduling للمرونة.

### 16.6 دعم أنماط تصنيع متعدّدة في نفس البيئة

Mixed mode manufacturing يسمح لشركة واحدة باستخدام Discrete + Process + Lean في نفس الوقت. هذا يدعم نموذج الأعمال المعقّد دون الحاجة لأنظمة منفصلة.

### 16.7 الرقابة على مراحل الإنتاج

- Approvals وElectronic signatures لـ BOM وRoute.
- Quality orders تلقائية.
- Tracking dimensions (Batch, Serial) لتتبّع كل وحدة.
- Lot size variance وProduction quantity variance تُكشف الفروقات تلقائيًا.

---

## 17. التعقيد والمخاطر

نظام بهذه القوة يأتي بثمن. من واجب أي مستشار وظيفي أن يفهم نقاط الضعف والمخاطر.

### 17.1 أين يصبح النظام معقّدًا؟

- **عدد الإعدادات الهائل:** Production control parameters وحدها تحوي عشرات الخيارات. خيارات الترحيل (Ledger posting) وخيارات الصرف التلقائي وخيارات الجدولة كلها تتفاعل.
- **Item model groups وItem groups:** الخلط بينهما خطر شائع. الأول يحدّد طريقة التقييم (Standard / FIFO)، الثاني يحدّد الحسابات.
- **Inventory posting profile:** أي خطأ هنا يعني قيودًا محاسبية في حسابات خاطئة.
- **Costing versions:** إدارة Pending وActive ودورة التفعيل تتطلب فهمًا عميقًا.
- **Master planning:** بناء Coverage groups وTime fences وPlans يتطلب خبرة.

### 17.2 لماذا يحتاج العميل إلى بيانات دقيقة قبل التطبيق؟

النظام يفترض أن البيانات الواردة دقيقة. إذا كانت:
- BOM ناقصة → تكلفة المنتج خاطئة.
- Route غير صحيحة → الجدولة عبثية وتكلفة العمالة خاطئة.
- Standard cost غير محدَّثة → انحرافات هائلة عند الإقفال.
- Cost groups غير منطقية → التقارير عديمة الفائدة.

### 17.3 خطورة ضعف BOM

BOM الخاطئة هي السبب الأول لفشل أنظمة الإنتاج. إذا كان العميل لا يستطيع تقديم BOM دقيقة لكل منتج، فهذا إشارة حمراء، ومن الأفضل تأجيل تطبيق الإنتاج حتى يتم توثيق BOM ومراجعتها.

### 17.4 خطورة عدم فهم التكلفة

عملاء كثيرون يطلبون "نظام إنتاج" دون أن يكون لديهم إجابة عن:
- هل نريد Standard cost أم Actual cost؟
- كيف نُحمّل العمالة على المنتج؟
- هل لدينا Overhead نريد تضمينه؟

دون إجابات واضحة، أي تطبيق سينتج تقارير لا تعكس الواقع.

### 17.5 خطورة عدم إغلاق أوامر الإنتاج

أوامر مفتوحة كثيرة = WIP متضخّم، تكلفة مُعلَّقة، انحرافات غير مُكتشَفة. يجب وضع سياسة إقفال شهري أو أسبوعي مع مسؤول واضح.

### 17.6 خطورة تطبيق نموذج متقدّم على عميل غير جاهز

- Process manufacturing على عميل لا يفهم Co-products → فوضى.
- Lean manufacturing على عميل بدون Production flows واضحة → الكنبان بلا معنى.
- Engineer-to-Order على عميل بدون إدارة مشاريع → ربكة.

**القاعدة الذهبية:** نضج العميل يحدّد النموذج المناسب، وليس العكس.

---

## 18. أسئلة تحليل العميل المستخرجة من دراسة Dynamics

هذه القائمة مُستخرَجة من المنطق الذي يفرضه Dynamics 365 على عملية الإنتاج. يمكن استخدامها مع أي عميل إنتاج، حتى لو كان النظام المُطبَّق محليًا.

### 18.1 معلومات عامة

1. ما الذي تنتجونه بالضبط؟ منتج واحد أم عائلة منتجات؟
2. هل الإنتاج للتخزين (Make to Stock) أم حسب الطلب (Make to Order)؟
3. كم مصنعًا أو خط إنتاج لديكم؟
4. هل توجد مواقع جغرافية متعدّدة (Sites)؟
5. ما متوسط حجم أمر الإنتاج (وحدات/يوم)؟
6. ما عدد أوامر الإنتاج المتزامنة في أي وقت؟
7. ما متوسط مدّة إنتاج المنتج (Lead time)؟

### 18.2 المنتجات و BOM

8. هل لكل منتج وصفة (BOM) موثَّقة ومعتمَدة من قسم الهندسة؟
9. هل تختلف الوصفة من عميل لآخر؟
10. هل توجد مواد بديلة (Alternatives) قابلة للاستخدام؟
11. هل يوجد هالك متوقع لكل مادة؟ وهل هو ثابت أم متغيّر؟
12. هل توجد منتجات نصف مصنعة؟ هل تُنتَج بأوامر إنتاج مستقلة؟
13. هل توجد منتجات مشتركة (Co-products) أو ثانوية (By-products)؟
14. هل تُعدَّل BOM بعد إنشاء الأمر؟
15. كم مرة في السنة تُحدَّث BOM؟ ومن يعتمدها؟

### 18.3 Routes والموارد

16. ما المراحل التي يمرّ بها المنتج من البدء إلى التسليم؟
17. ما الموارد المستخدَمة في كل مرحلة (آلات، عاملون، أدوات)؟
18. هل تُسجَّل ساعات العمالة فعليًا؟
19. هل توجد عمليات بالتوازي؟ هل توجد عمليات اختيارية؟
20. ما طاقة كل مورد يوميًا؟
21. هل توجد عمليات تصنيع خارجية (Subcontracting)؟

### 18.4 أوامر الإنتاج

22. من ينشئ أمر الإنتاج؟ المخطّط؟ مدير الإنتاج؟ تلقائي عبر MRP؟
23. من يعتمد الأمر؟ هل توجد دورة موافقات؟
24. هل يوجد إنتاج جزئي (RAF متعدّد لنفس الأمر)؟
25. هل يتم تعديل الأمر بعد البدء (تغيير الكمية، تغيير المواد)؟
26. ما متوسط الفترة من Created إلى Ended؟
27. هل توجد أوامر إعادة تصنيع (Rework)؟

### 18.5 المخزون

28. متى يتم صرف المواد فعليًا؟ عند البدء؟ أثناء التشغيل؟ عند الانتهاء؟
29. هل يوجد مستودع مخصّص للإنتاج (Production input warehouse)؟
30. هل توجد مرتجعات من الإنتاج إلى المستودع؟
31. هل تستخدمون Batch numbers أو Serial numbers؟
32. هل يوجد فاقد طبيعي بين الصرف والاستهلاك الفعلي؟

### 18.6 التكلفة

33. هل تريدون تكلفة معيارية (Standard) أم فعلية (Actual)؟ ولماذا؟
34. هل العمالة تدخل في تكلفة المنتج؟ كيف تُحتسَب؟
35. هل المصاريف الصناعية غير المباشرة (Overhead) تدخل في التكلفة؟ ما طريقة التحميل؟
36. هل تريدون تتبّع WIP محاسبيًا؟
37. هل تريدون قيود محاسبية تلقائية لكل مرحلة من الإنتاج؟
38. ما تكلفة كل ساعة عمالة في كل قسم؟
39. هل تُحدَّث Standard cost سنويًا، شهريًا، أم عند الحاجة؟
40. هل توجد تكلفة مختلفة لنفس المنتج في مواقع مختلفة؟

### 18.7 الجودة والهالك

41. هل توجد دورة فحص جودة بعد الإنتاج؟
42. ما النسبة المتوقّعة للهالك؟
43. كيف تتعاملون مع الهالك ماليًا؟ (يُحمَّل على المنتج أم يُسجَّل كمصروف؟)
44. هل توجد أوامر إعادة تصنيع للمنتجات المعيبة؟

### 18.8 التخطيط

45. كيف يتم تخطيط الإنتاج حاليًا؟ يدويًا؟ Excel؟ نظام آخر؟
46. هل توجد قيود طاقة (Finite capacity) يجب احترامها؟
47. هل يوجد توقّع طلب (Forecast)؟ ومن يديره؟
48. ما المدّة الزمنية للتخطيط (أسبوعي، شهري، ربع سنوي)؟

### 18.9 التقارير

49. ما أهم تقارير الإنتاج التي تحتاجونها يوميًا؟
50. هل تريدون تقرير تكلفة أمر إنتاج تفصيلي؟
51. هل تريدون تقرير انحرافات؟ مَن يستخدمه؟
52. هل تريدون لوحة كفاءة الإنتاج (OEE)؟
53. هل تحتاجون إلى تقارير تتبّع (Traceability) لكل دفعة من المنتج؟

---

## 19. ماذا يمكن أن نستفيد من Dynamics في تطوير أو تقييم نظام ERP محلي؟

هذا القسم لمستشار يعمل في شركة ERP محلية ويريد رفع جودة قسم الإنتاج لديه. الفكرة ليست النسخ، بل **استخراج الدروس**.

### 19.1 بناء دورة أمر إنتاج واضحة

تعلَّم من Dynamics: لا تكتفِ بحالتَين (مفتوح/مغلق). بل أنشئ:
- Created → Estimated → Released → Started → Reported as Finished → Ended.
- كل حالة لها أثرها على المخزون والمالية.
- كل حالة محدّدة بصلاحيات وإجراءات.

### 19.2 فصل مراحل الإنتاج

- مرحلة التقدير منفصلة عن مرحلة الجدولة.
- مرحلة الجدولة منفصلة عن مرحلة الإفراج.
- مرحلة الصرف منفصلة عن مرحلة الاستلام.
- مرحلة الاستلام منفصلة عن مرحلة الإقفال.

هذا الفصل يُتيح أن يقوم بكل مرحلة شخص مختلف، ويُسهّل التتبّع.

### 19.3 توثيق BOM بشكل صحيح

- BOM ID وBOM version منفصلَين.
- اعتماد (Approval) منفصل عن التفعيل (Activation).
- دعم Scrap (ثابت ومتغيّر).
- دعم Phantoms للمنتجات نصف المصنّعة الافتراضية.
- ربط BOM بـ Item version (تاريخ صلاحية).

### 19.4 ربط الإنتاج بالمخزون بقوة

- كل عملية صرف تُولّد حركة مخزون بمستندها.
- كل عملية استلام تُولّد حركة مخزون بمستندها.
- لا يوجد "تعديل مخزون يدوي" بدون مستند.
- استخدام Item model group لتحديد طريقة تقييم المخزون.

### 19.5 ربط الإنتاج بالتكلفة

- كل حركة في الإنتاج لها أثر محاسبي مباشر.
- WIP محاسبيًا في الميزانية، وليس مجرّد مصطلح.
- التفريق بين Estimated وActual.
- حساب Variance لإظهار الفروقات.

### 19.6 بناء تقارير WIP والانحرافات

- تقرير WIP يوميًا (ليس فقط في الإقفال).
- تقرير انحرافات لكل أمر مُغلَق.
- مقارنة Estimated وActual للأوامر النشطة (قبل الإقفال) لتوقّع الانحرافات.

### 19.7 تصميم أسئلة تحليل للعميل

استخدم القائمة في القسم 18 كنقطة بداية. تجنّب البدء بـ "النظام يدعم..." وابدأ بـ "كيف تعملون اليوم؟".

### 19.8 منع الخلط بين الدعم والتطوير

- الدعم: مساعدة المستخدم على استخدام ميزات موجودة.
- التطوير: بناء ميزات جديدة لم تكن موجودة.
- اطلب توثيقًا لكل طلب تطوير، وارفض الخلط في الفواتير.

### 19.9 تحسين تسليم Module الإنتاج

- ابدأ بـ "Day in the Life" لكل دور (مخطّط، مشرف إنتاج، عامل، محاسب تكلفة).
- بَيِّن دورة كاملة قبل تطبيق التفاصيل.
- اطلب من العميل تشغيل أمر إنتاج تجريبي (UAT) من البداية إلى الإقفال قبل Go-Live.
- وثِّق Standard cost وOverhead وScrap policy رسميًا، ووقِّع العميل عليها.

---

## 20. خلاصة تنفيذية

### أهم ما يميّز Dynamics في الإنتاج

نظام Dynamics 365 ليس "نظام إنتاج" فحسب، بل **نظام إنتاج متكامل محاسبيًا**. كل حركة إنتاجية تُولّد قيدًا محاسبيًا تلقائيًا. كل أمر له تكلفة تقديرية وفعلية وانحراف. كل مادة تُتتبَّع من الشراء إلى البيع. هذا التكامل هو ما يجعله ERP حقيقيًا، لا مجرّد نظام تشغيل.

### أهم درس متعلّق بالتكلفة

التكلفة في الإنتاج ليست رقمًا واحدًا، بل **سيرورة من التقدير إلى الفعلي**. الفرق بين الاثنين هو **الانحراف**، والانحراف هو الجوهرة الإدارية التي تخبر الشركة بمدى كفاءة الإنتاج. أي نظام إنتاج لا يحسب الانحراف هو نظام تشغيلي وليس نظامًا محاسبيًا.

### أهم درس متعلّق بالمخزون

المخزون في الإنتاج يمر بحالات: متاح → On order (مطلوب) → Reserved (مَحجوز) → Picked (مَسحوب) → Consumed (مُستهلَك) → جزء من منتج جديد. كل حالة لها قيد محاسبي. النظام الجيد يُظهر هذه الحالات بوضوح، ويُولّد التقارير المناسبة لكل لحظة. النظام السيء يظهر فقط "هذا متوفر، هذا غير متوفر".

### أهم درس متعلّق بالعميل

العميل لا يطلب "نظام إنتاج". العميل يطلب الإجابة عن أسئلة: كم تكلفة هذا المنتج؟ كم ربحي منه؟ هل خطّ الإنتاج يعمل بكفاءة؟ هل توجد هدر في مكان معيّن؟ النظام الجيد يجيب على هذه الأسئلة، لا أن يُرغم العميل على فهم لغته. **فهم سؤال العميل أهم من فهم النظام**.

### كيف يستفيد العامل في ERP من هذه الدراسة؟

- **معجم احترافي:** BOM، Route، Operation، Resource، WIP، Variance، Estimated، Actual، Costing version، Picking list journal، Report as finished، Backflush — هذه ليست مصطلحات Dynamics فقط، بل لغة عالمية للإنتاج.
- **نموذج ذهني:** فهم كيف تُولِّد كل عملية إنتاجية حدثًا محاسبيًا يجعلك تتعامل مع أي نظام بفهم أعمق.
- **منهجية تحليل:** قائمة الأسئلة في القسم 18 قابلة للاستخدام في أي مشروع.
- **معايير جودة:** عند تقييم أي نظام إنتاج محلي، يمكنك مقارنته بـ Dynamics من حيث: دورة حياة الأمر، دقة BOM، حساب التكلفة، WIP، الانحرافات، التقارير. النقص في أيٍّ من هذه يكشف نقاط التحسين.

**الفائدة الحقيقية ليست أن تتقن Dynamics، بل أن تكتسب التفكير المهني للمستشار الوظيفي في الإنتاج.**

---

## المصادر الرسمية المستخدَمة (Microsoft Learn)

كل الروابط أدناه هي روابط رسمية من learn.microsoft.com تخصّ Dynamics 365 Supply Chain Management وFinance، وتم استخدامها كأساس لهذه الدراسة.

### وثائق Production Control

1. Production process overview
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-process-overview

2. Production setup requirements
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-set-up-requirements

3. Bills of materials and formulas
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/bill-of-material-bom

4. Formulas and formula versions
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/formulas-versions

5. Routes and operations
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/routes-operations

6. Operations resources
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/operations-resources

7. Operations scheduling
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/operations-scheduling

8. Production order lifecycle overview
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/create-production-orders

9. Release production orders
   https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/release-production-orders

10. Report production orders as finished
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/report-production-orders-as-finished

11. Make finished goods physically available before posting to journals (Deferred posting)
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/deferred-posting

12. Lean manufacturing overview
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/lean-manufacturing-overview

13. Modeling a lean organization
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/lean-manufacturing-modeling-lean-organization

14. Kanban job scheduling for lean manufacturing
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/lean-manufacturing-kanban-job-scheduling

15. Visual scheduling for lean manufacturing
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/visual-scheduling-lean-manufacturing

16. Batch balancing
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/batch-balancing

17. Register and track batch/serial numbers for finished products and their components (Tracked components)
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/tracked-components

### وثائق Cost Management

18. BOM calculations
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/bom-calculations

19. Costing versions overview
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/costing-versions

20. Production order cost analysis
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/production-order-cost-analysis

21. Production posting (Cost management)
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/production-posting

22. Common sources of production variances
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/common-sources-of-production-variances

23. Backflush costing
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/backflush-costing

24. Standard cost conversion overview
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/standard-cost-conversion-overview

25. Inventory costing FAQ
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/inventory-costing-faq

26. View current WIP status on a production order
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/tasks/view-current-wip-status-production-order

27. Compare active, estimated, and realized costs on a production order
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/cost-management/tasks/compare-active-estimated-realized-costs

### وثائق Master Planning

28. Master planning home page
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-planning-home-page

29. Master plans overview
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/master-plans

30. Finite capacity planning and scheduling
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/planning-optimization/finite-capacity

31. Set up scrap to calculate raw material requirements
    https://learn.microsoft.com/en-us/dynamics365/supply-chain/master-planning/scrap-calculations

### وثائق Finance / General Ledger

32. Production order posting (Finance)
    https://learn.microsoft.com/en-us/dynamics365/finance/general-ledger/production-posting

### وثائق Business Process Guidance

33. Develop production processes / Track production costs
    https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/plan-to-produce-track-production-costs-overview

34. Develop production strategies
    https://learn.microsoft.com/en-us/dynamics365/guidance/business-processes/plan-to-produce-define-production-strategies

### وحدات التدريب الرسمية (Microsoft Learn Training)

35. Get started with production control in Dynamics 365 Supply Chain Management
    https://learn.microsoft.com/en-us/training/modules/get-started-production-control-dyn365-supply-chain-mgmt/

36. Set up and use production control for discrete manufacturing
    https://learn.microsoft.com/en-us/training/modules/set-up-use-production-control-discrete-manufacturing/

37. Configure and use process manufacturing
    https://learn.microsoft.com/en-us/training/paths/configure-use-process-manufacturing-dyn365-supply-chain-mgmt/

38. Configure and use lean manufacturing
    https://learn.microsoft.com/en-us/training/paths/configure-use-lean-manufacturing-dyn365-supply-chain-mgmt/

39. Work with capacity planning and scheduling in Dynamics 365 Supply Chain Management
    https://learn.microsoft.com/en-us/training/modules/work-capacity-planning-scheduling-discrete-dyn365-supply-chain-mgmt/

### Analytics & Reporting

40. Cost management Power BI content
    https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/analytics/cost-management-content-pack

---

> **ملاحظة ختامية:** كل ما ورد في هذه الدراسة من قيود محاسبية وحسابات وآليات صرف واستلام هو من وثائق Microsoft الرسمية، ويبقى التطبيق التفصيلي على أرض الواقع مرتبطًا بإعدادات النظام لكل عميل (Inventory posting profile، Item model group، Production groups، Costing version، Costing sheet). الدراسة وثيقة مرجعية للفهم المفاهيمي، وليست بديلًا عن دليل التطبيق الفني.
