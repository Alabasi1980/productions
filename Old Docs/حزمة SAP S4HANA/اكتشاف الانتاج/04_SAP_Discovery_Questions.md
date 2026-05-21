# 04_SAP_Discovery_Questions.md
# أسئلة تحليل عميل الإنتاج في SAP S/4HANA Manufacturing / PP

## 1. مقدمة

هذا الملف يحوّل مفاهيم **SAP S/4HANA Manufacturing / PP** إلى أسئلة تحليل عملية تساعد الـ **Functional Consultant** أو **Business Analyst** على فهم دورة الإنتاج لدى العميل قبل التطبيق.

الهدف من الأسئلة ليس ملء نموذج فقط، بل كشف:

- طريقة الإنتاج الفعلية.
- طريقة التخطيط.
- دقة Master Data.
- طريقة إدارة BOM وRouting.
- وجود Production Version أو ما يعادلها.
- طريقة إنشاء وتنفيذ أوامر الإنتاج.
- طريقة صرف المواد.
- طريقة تسجيل العمل والوقت والهالك.
- طريقة استلام المنتج النهائي.
- طريقة احتساب WIP وVariance.
- طريقة Settlement والإغلاق المالي.
- التقارير المطلوبة.
- المخاطر قبل Go-Live.

---

## 2. طريقة استخدام هذا الملف

لا تُطرح كل الأسئلة دفعة واحدة. يتم اختيار الأسئلة حسب نوع العميل وحجم التعقيد وطبيعة الإنتاج.  
يجب أن يحضر في جلسات التحليل ممثلون من الإنتاج، التخطيط، المستودعات، المالية، محاسبة التكاليف، الجودة، والمشتريات عند الحاجة.

يجب تحويل كل إجابة إلى واحد أو أكثر من التالي:

- إعدادات نظام.
- متطلبات وظيفية.
- صلاحيات.
- تقارير.
- قيود تشغيلية.
- فجوات Master Data.
- متطلبات تطوير.
- سيناريوهات UAT.

| نوع الاجتماع | الأقسام المطلوبة | الهدف |
|---|---|---|
| فهم عام للإنتاج | الإنتاج، التخطيط، الإدارة | تحديد نوع التصنيع ودورة العمل العامة |
| Master Data | الإنتاج، الهندسة، التخطيط، المستودعات | مراجعة Material Master وBOM وRouting |
| تخطيط MRP | التخطيط، المشتريات، المستودعات | فهم مصادر الطلب وسياسات التخطيط |
| تنفيذ الإنتاج | الإنتاج، المستودعات، الجودة | فهم Release وGI وConfirmation وGR |
| تكلفة الإنتاج | محاسبة التكاليف، المالية، الإنتاج | فهم WIP وVariance وSettlement |
| التقارير والرقابة | الإدارة، الإنتاج، التخطيط، المالية | تحديد التقارير والقرارات المطلوبة |
| UAT / Go-Live | جميع الأطراف | اختبار الدورة كاملة قبل التشغيل |

---

## 3. أسئلة الفهم العام لطبيعة الإنتاج

| السؤال | الهدف من السؤال | أثر الإجابة على تصميم النظام |
|---|---|---|
| ماذا تنتجون؟ | فهم طبيعة المنتجات | تحديد نوع البيانات والتصنيع المطلوب |
| هل الإنتاج Discrete أم Process أم Repetitive أم Kanban؟ | تحديد نموذج التصنيع | اختيار Production Order أو Process Order أو REM أو Kanban |
| هل الإنتاج Make-to-Stock أم Make-to-Order؟ | فهم علاقة الطلب بالإنتاج | تحديد Strategy Group وسلوك MRP |
| هل يوجد Assemble-to-Order أو Engineer-to-Order؟ | كشف التعقيد في الطلبات | قد يتطلب ربطًا خاصًا بالطلبات أو المشاريع |
| هل توجد منتجات نهائية ومنتجات نصف مصنعة؟ | فهم مستويات BOM | تحديد Multi-Level BOM وMRP Explosion |
| هل يوجد إنتاج دفعات Batch؟ | معرفة الحاجة للتتبع | Batch Management وQuality |
| هل الإنتاج يتم لكل أمر أم بشكل متكرر على خط إنتاج؟ | تحديد كائن التكلفة | Production Order أو PCC |
| هل يوجد تصنيع داخلي وخارجي؟ | فهم Procurement Type | داخلي/خارجي/مختلط |
| هل توجد Co-products أو By-products؟ | كشف التصنيع العملياتي | Apportionment Structure وتوزيع تكلفة |
| هل يوجد أكثر من Plant؟ | فهم البنية التنظيمية | إعدادات Plant وMRP والتكلفة |
| هل توجد أكثر من Storage Location؟ | فهم المخزون | ضبط GI وGR ومواقع الإنتاج |
| هل توجد خطوط إنتاج متعددة؟ | فهم Routings وProduction Versions | بدائل Routing وLot Size Range |
| هل الإنتاج يعتمد على MRP أم طلبات يدوية؟ | تحديد مستوى التخطيط | Planned Orders أو إنشاء يدوي |
| هل توجد جودة أثناء أو بعد الإنتاج؟ | تحديد QM Integration | Inspection Type 03/04 |
| هل توجد تكلفة إنتاج تفصيلية حاليًا؟ | معرفة نضج Costing | تحديد الحاجة لـ WIP/Variance/Settlement |

---

## 4. أسئلة Material Master

| السؤال | لماذا مهم؟ | أثره على التخطيط/الإنتاج/التكلفة |
|---|---|---|
| ما أنواع المواد الموجودة؟ | تحديد Material Types | يؤثر على التصنيع والشراء والتخزين |
| ما المنتجات النهائية؟ | تحديد Finished Goods | أساس Production Order وGR |
| ما المواد الخام؟ | تحديد Raw Materials | أساس GI وBOM |
| ما المنتجات نصف المصنعة؟ | كشف Multi-Level BOM | قد تحتاج أوامر إنتاج داخلية |
| هل يوجد Material Type واضح لكل صنف؟ | منع خلط الأصناف | إعدادات خاطئة تؤثر على MRP والتكلفة |
| ما Base UoM لكل مادة؟ | دقة الكميات | خطأ UoM يسبب صرف وتكلفة خاطئة |
| هل توجد وحدات قياس بديلة؟ | التحويل بين الشراء والإنتاج | قد يؤثر على BOM وGI |
| هل MRP Views مكتملة؟ | أساس التخطيط | Planned Orders أو Purchase Requisitions |
| هل Work Scheduling View مكتملة؟ | جدولة وتنفيذ | Release وAuto GR والتسامحات |
| هل Quality Management View مستخدمة؟ | تحديد الفحص | Inspection Lots |
| هل Accounting View صحيحة؟ | تقييم مالي | Valuation وGL |
| هل Costing View صحيحة؟ | Standard Cost | Cost Estimate |
| هل يوجد MRP Type لكل صنف؟ | تحديد طريقة التخطيط | PD/VB/VV/ND |
| هل Procurement Type صحيح؟ | شراء أم تصنيع | يمنع قرار توريد خاطئ |
| هل Strategy Group محدد؟ | MTS/MTO | يحدد علاقة الطلب بالإنتاج |
| هل Production Storage Location محدد؟ | صرف واستلام | يوجه حركة المخزون |
| هل توجد Safety Stock؟ | حماية من النقص | يؤثر على Net Requirements |
| هل يوجد Backflush Indicator؟ | الصرف التلقائي | يؤثر على COGI والمخزون |
| هل Price Control مناسب؟ | تقييم المخزون | Standard أو Moving Average |
| هل Valuation Class صحيحة؟ | الحسابات المالية | GL صحيح |
| هل Costing Lot Size واضح؟ | تكلفة الوحدة | يؤثر على Standard Cost |
| هل With Quantity Structure مفعّل عند الحاجة؟ | استخدام BOM/Routing في التكلفة | Cost Estimate حقيقي |

### علامات الخطر في Material Master

| علامة الخطر | ماذا تعني؟ | الأثر |
|---|---|---|
| MRP Type خاطئ | التخطيط غير مناسب | Planned Orders خاطئة |
| Procurement Type خاطئ | شراء بدل تصنيع أو العكس | دورة توريد خاطئة |
| Valuation Class خاطئ | الحسابات غير صحيحة | قيود GL خاطئة |
| Price Control غير مناسب | تقييم غير مطابق | Variance غير مفهومة |
| Costing View غير مكتملة | تكلفة غير معتمدة | Standard Cost ضعيف |
| Production Storage Location غير محدد | موقع الصرف غير واضح | GI/GR من أماكن خاطئة |

---

## 5. أسئلة Plant / Storage Location / PSA

| السؤال | الهدف | أثر الإجابة على الصرف والتخزين |
|---|---|---|
| كم Plant لدى العميل؟ | فهم البنية التنظيمية | إعداد الإنتاج والمخزون حسب الموقع |
| هل كل Plant يمثل مصنعًا أم موقع توزيع؟ | منع خلط الوظائف | يحدد هل الإنتاج ممكن في الموقع |
| ما Storage Locations المستخدمة؟ | فهم التخزين | ضبط GI وGR |
| هل توجد Storage Location للمواد الخام؟ | تحديد مصدر GI | صرف صحيح |
| هل توجد Storage Location للإنتاج؟ | تحديد إنتاج/تحت التشغيل | Material Staging |
| هل توجد Storage Location للمنتج التام؟ | تحديد GR | استلام صحيح |
| هل يوجد PSA؟ | دعم Kanban أو Staging | تجهيز مواد للخط |
| هل تستخدم PSA في Kanban أو Material Staging؟ | فهم التوريد الداخلي | Control Cycle أو Pull List |
| هل توجد علاقة واضحة بين PSA وStorage Location؟ | ربط الأرض بالمخزون | منع ضياع الحركة |
| هل يتم نقل المواد من مستودع مركزي إلى منطقة إنتاج؟ | فهم التحضير قبل الصرف | فرق بين staging وGI |
| هل توجد EWM / WM؟ | معرفة تعقيد المستودعات | تكامل مع الإنتاج |
| هل يوجد Pull List لتجهيز المواد؟ | تجهيز قبل التنفيذ | تقليل نقص المواد |

---

## 6. أسئلة BOM

| السؤال | الهدف | أثر الإجابة على MRP / Production Order / Costing |
|---|---|---|
| هل لكل منتج BOM موثقة؟ | التأكد من وجود مكونات | لا MRP أو Costing صحيح دون BOM |
| من المسؤول عن إعداد BOM؟ | تحديد الملكية | حوكمة البيانات |
| من يعتمد BOM؟ | منع تغييرات عشوائية | Audit |
| هل توجد BOM Header واضحة؟ | ضبط usage/status/validity | اختيار صحيح |
| ما Base Quantity؟ | ضبط نسب المكونات | تكلفة وكميات صحيحة |
| هل توجد BOM Usage مختلفة؟ | إنتاج/تكلفة/مبيعات | استخدام مناسب |
| هل توجد BOM Status؟ | Released أو تحت التطوير | منع استخدام غير معتمد |
| هل توجد Alternative BOMs؟ | بدائل تصنيع | تحتاج Production Version |
| هل توجد Validity Dates؟ | تاريخ سريان | تخطيط وتكلفة صحيحة |
| هل تستخدمون Change Master؟ | تتبع تغييرات | Audit Trail |
| هل توجد Component Quantities دقيقة؟ | دقة المواد | MRP وGI وCosting |
| هل توجد Issue Storage Location لكل مكوّن؟ | مصدر الصرف | GI صحيح |
| هل توجد Component Scrap؟ | فاقد المكونات | احتياج وتكلفة أعلى |
| هل توجد Assembly Scrap؟ | فاقد المنتج | كميات وتكلفة |
| هل توجد Operation Scrap؟ | فاقد عملية | Variance |
| هل يتم ربط المكونات بالعمليات؟ | Component Allocation | توقيت الصرف |
| هل توجد Multi-Level BOM؟ | منتجات نصف مصنعة | MRP متعدد المستويات |
| هل توجد Phantom Items؟ | تجميعات منطقية | Explosion مختلف |
| هل توجد Co-products أو By-products؟ | مخرجات مشتركة | توزيع تكلفة |
| هل تحتاجون Apportionment Structure؟ | توزيع co-product cost | تكلفة عادلة |
| هل توجد مكونات بديلة؟ | بدائل صرف | Variance أو substitution |
| هل توجد مكونات Batch / Serial؟ | تتبع | جودة وTraceability |
| هل BOM تُستخدم في الإنتاج والتكلفة أم لأغراض أخرى؟ | تحديد Usage | منع استخدام خاطئ |

### علامات الخطر في BOM

| علامة الخطر | ماذا تعني؟ | الإجراء |
|---|---|---|
| BOM غير موثقة | لا يوجد مصدر مواد معتمد | توثيق واعتماد |
| تغييرات بدون Change Master | غياب Audit | تطبيق حوكمة تغيير |
| Scrap غير محدد | تكلفة واستهلاك غير واقعي | قياس الفاقد |
| Alternative BOM دون Production Version | غموض اختيار | ربط البدائل |
| مكونات لا تطابق الواقع | GI وVariance خاطئة | مراجعة ميدانية |
| BOM للتكلفة وليست للإنتاج أو العكس | Usage غير مضبوط | مراجعة BOM Usage |

---

## 7. أسئلة Routing / Operations

| السؤال | الهدف | أثر الإجابة على التنفيذ والجدولة والتكلفة |
|---|---|---|
| هل لكل منتج Routing واضح؟ | تحديد خطوات التصنيع | لا جدولة أو تكلفة عمليات دون Routing |
| ما العمليات الرئيسية؟ | فهم الواقع التشغيلي | تصميم Operations |
| هل العمليات متسلسلة أم متفرعة؟ | تحديد التعقيد | Scheduling |
| هل يوجد Operation Number لكل خطوة؟ | ترتيب العمليات | تنفيذ واضح |
| هل كل Operation مربوطة بـ Work Center؟ | موقع التنفيذ | تكلفة وطاقة |
| هل يوجد Control Key لكل Operation؟ | تحديد سلوك العملية | Confirmation/Costing/Scheduling |
| هل تحددون Setup Time؟ | تكلفة تهيئة | Activity Cost |
| هل تحددون Machine Time؟ | تكلفة آلة | Activity Cost |
| هل تحددون Labor Time؟ | تكلفة عمالة | Activity Cost |
| هل توجد Queue / Wait / Move Times؟ | جدولة دقيقة | Lead Time |
| هل يتم ربط المكونات بالعمليات؟ | توقيت الصرف | Component Allocation |
| هل يوجد Operation Scrap؟ | فاقد العملية | Variance |
| هل تختلف العمليات حسب الكمية أو خط الإنتاج؟ | بدائل Routing | Production Version |
| هل توجد Alternative Routings؟ | بدائل تصنيع | Costing وMRP |
| هل توجد Rate Routing للإنتاج المتكرر؟ | REM | PCC وPeriod Cost |
| هل يتم Confirmation على مستوى Operation أم الأمر ككل؟ | دقة التسجيل | تكلفة وتقارير |

---

## 8. أسئلة Work Centers / Cost Centers / Activity Types

| السؤال | الهدف | أثر الإجابة على التكلفة |
|---|---|---|
| ما Work Centers المستخدمة؟ | تحديد مواقع التنفيذ | ربط العمليات |
| هل كل Work Center يمثل موقعًا فعليًا؟ | واقعية النموذج | تجنب مراكز وهمية |
| هل لكل Work Center Cost Center؟ | تحميل التكلفة | Activity Cost |
| هل Cost Center صحيح ومحدث؟ | دقة CO | تكلفة صحيحة |
| هل توجد Activity Types؟ | تصنيف الأنشطة | Labor/Machine/Setup |
| ما الأنشطة المستخدمة؟ | تحديد عناصر التكلفة | Cost Component |
| هل Activity Types مسعّرة في KP26؟ | تسعير الأنشطة | Activity × Rate |
| هل Activity Rates محدثة؟ | دقة التكلفة | منع تكلفة صفرية |
| هل توجد Standard Value Key؟ | تفسير القيم | Setup/Machine/Labor |
| هل توجد Formulas؟ | حساب الوقت والتكلفة | Scheduling/Costing |
| هل توجد Capacities؟ | تخطيط الطاقة | Capacity Load |
| هل توجد Calendars أو Shifts؟ | جدولة واقعية | Lead Time |
| هل يوجد Scheduling داخل Work Center؟ | مواعيد العمليات | تخطيط الإنتاج |
| هل Work Center صالح للجدولة والتكلفة؟ | استخدام مزدوج | دقة التنفيذ والتكلفة |
| هل هناك Work Centers بدون Costing؟ | كشف فجوة | تكلفة ناقصة |

### أسئلة حرجة لمحاسبة التكاليف حول Work Center

- هل Activity Rates معتمدة ومحدثة؟
- هل كل Work Center مربوط بـ Cost Center صحيح؟
- هل Setup وMachine وLabor تُحمّل كلها؟
- هل توجد Work Centers لا يجب أن تدخل في التكلفة؟
- هل يتم تحديث KP26 دوريًا؟
- هل Cost Component Split يعكس هذه الأنشطة؟

---

## 9. أسئلة Production Version

| السؤال | الهدف | أثر الإجابة على MRP / Order / Costing |
|---|---|---|
| هل توجد Production Version لكل منتج مصنع؟ | منع الغموض | MRP/Order/Costing صحيح |
| هل Production Version إلزامية في النظام المستخدم؟ | فهم S/4HANA | تجنب فشل MRP |
| هل تربط BOM محددة مع Routing محدد؟ | ضبط طريقة الإنتاج | تكلفة دقيقة |
| هل توجد Lot Size Range؟ | اختيار حسب الكمية | طريقة إنتاج مناسبة |
| هل توجد Valid From / Valid To؟ | صلاحية زمنية | Audit |
| هل توجد أكثر من Production Version لنفس المنتج؟ | بدائل | اختيار واضح |
| كيف يختار MRP Production Version؟ | تخطيط | Planned Orders صحيحة |
| كيف يختار Cost Estimate Production Version؟ | تكلفة | Standard Cost صحيح |
| كيف يختار Production Order Production Version؟ | تنفيذ | Snapshot صحيح |
| هل Production Version تمثل طريقة إنتاج مختلفة؟ | فهم البدائل | تصميم واضح |
| هل توجد Production Version للإنتاج المتكرر؟ | REM | ربط Production Line |
| هل Production Version منتهية أو غير صحيحة تسبب فشل MRP أو الأمر؟ | كشف مشاكل | معالجة Master Data |
| من يعتمد Production Version؟ | حوكمة | منع تغيير عشوائي |
| هل تغييرات BOM/Routing تنعكس على Production Version؟ | اتساق | منع انفصال البيانات |

### أسئلة لا يجوز تجاوزها بخصوص Production Version

- ما BOM المستخدمة؟
- ما Routing أو Master Recipe المستخدمة؟
- لأي كمية؟
- لأي فترة؟
- من يعتمدها؟
- هل تستخدم للتخطيط والتكلفة والأمر بنفس المنطق؟

---

## 10. أسئلة MRP والتخطيط

| السؤال | الهدف | أثر الإجابة على التخطيط |
|---|---|---|
| هل يستخدم العميل MRP؟ | تحديد نضج التخطيط | Planned Orders |
| هل يستخدم MRP Live أم Classic MRP؟ | معرفة التقنية | طريقة التشغيل |
| ما MRP Type المستخدم؟ | تحديد المنطق | PD/VB/VV/ND |
| هل تستخدمون PD أو VB أو VV أو ND؟ | تصنيف المواد | تخطيط مناسب |
| من هو MRP Controller؟ | مسؤولية | متابعة MD04 |
| هل توجد Safety Stock؟ | حماية من النقص | Net Requirements |
| هل توجد Lot Size Rules؟ | كميات التخطيط | دفعات مناسبة |
| هل توجد Forecasts؟ | طلب مستقبلي | PIR أو forecast planning |
| هل توجد PIR؟ | MTS | طلب مستقل |
| هل الطلب يأتي من Sales Orders؟ | MTO | ربط طلب بإنتاج |
| هل توجد Dependent Requirements من BOM Explosion؟ | مواد مكونات | تخطيط خامات |
| هل توجد Open Purchase Orders أو Open Production Orders؟ | العرض المتاح | صافي الاحتياج |
| هل تستخدمون MD04؟ | متابعة MRP | قرارات يومية |
| هل توجد Firming Indicator؟ | تثبيت Planned Orders | منع تغيير MRP |
| هل MRP ينتج Planned Orders أم Purchase Requisitions؟ | تصنيع أم شراء | توريد صحيح |
| هل MRP يغطي كل النباتات أو MRP Areas؟ | نطاق التخطيط | توزيع الطلب |
| هل توجد مشاكل نقص مواد متكررة؟ | كشف فشل التخطيط | تحسين MRP/Master Data |

---

## 11. أسئلة Planned Orders

| السؤال | الهدف | أثر الإجابة على دورة التخطيط والتنفيذ |
|---|---|---|
| هل يتم إنشاء Planned Orders من MRP؟ | فهم مصدر التخطيط | تشغيل MRP صحيح |
| من يراجع Planned Orders؟ | تحديد المسؤول | MRP Controller |
| هل Planned Order يتم تعديله قبل التحويل؟ | مرونة التخطيط | Firming أو تعديل |
| هل يستخدم Firming Indicator؟ | تثبيت القرار | منع MRP من التغيير |
| متى يتم تحويل Planned Order؟ | نقطة بدء التنفيذ | تحويل إلى Order |
| هل يتحول إلى Production Order أم Process Order؟ | نوع التصنيع | Discrete/Process |
| هل يتحول إلى Purchase Requisition؟ | شراء | Procurement Type |
| هل يوجد تحويل جماعي؟ | كفاءة التشغيل | إجراءات CO40/CO41 كمفهوم |
| هل يتم تتبع سبب إنشاء Planned Order؟ | تحليل الطلب | Demand source |
| هل توجد Planned Orders قديمة أو غير محولة؟ | تنظيف التخطيط | منع فوضى |
| هل يفرق العميل بين Planned Order وProduction Order؟ | نضج العمليات | فصل التخطيط عن التنفيذ |

---

## 12. أسئلة Production / Process Orders

| السؤال | الهدف | أثر الإجابة على دورة العمل |
|---|---|---|
| من ينشئ Production Order؟ | تحديد المسؤولية | صلاحيات |
| هل ينشأ من Planned Order أم يدويًا؟ | مصدر الأمر | ضبط التخطيط |
| هل يستخدم العميل Process Order؟ | نوع التصنيع | Master Recipe/Batch |
| هل توجد Master Recipe؟ | Process Manufacturing | Phases/Resources |
| هل يتم إنشاء الأمر من Sales Order في MTO؟ | ربط الطلب | Sales Order Stock |
| هل النظام ينسخ BOM وRouting عند إنشاء الأمر؟ | Snapshot | استقلال الأمر |
| هل المستخدمون يفهمون Snapshot للأمر؟ | منع سوء فهم | تغييرات لاحقة لا تؤثر تلقائيًا |
| هل يتم تعديل مكونات الأمر بعد الإنشاء؟ | مرونة التنفيذ | صلاحيات ومخاطر |
| هل يتم تعديل Routing داخل الأمر؟ | تغيير العمليات | Cost/Scheduling |
| هل توجد صلاحيات واضحة للتعديل؟ | حوكمة | منع عبث |
| هل توجد Nonstandard Orders؟ | حالات خاصة | يحتاج تحقق إضافي من المصدر الأصلي |
| هل توجد Rework Orders؟ | إعادة تشغيل | تكلفة إضافية |
| هل توجد أوامر قديمة مفتوحة؟ | WIP | Period-End |
| هل توجد علاقة بين الأمر والجودة أو المشروع أو أمر البيع؟ | تكامل | MTO/QM/PS |

---

## 13. أسئلة حالات Production Order

| السؤال | الهدف | أثر الإجابة على الضوابط والصلاحيات |
|---|---|---|
| هل يفهم المستخدمون CRTD؟ | أمر منشأ فقط | منع التنفيذ قبل REL |
| هل يفهمون REL؟ | جاهز للتنفيذ | السماح GI/Confirmation/GR |
| متى يستخدم PCNF؟ | تأكيد جزئي | متابعة تقدم |
| متى يستخدم CNF؟ | تأكيد نهائي | إكمال العمليات |
| متى يظهر PDLV؟ | استلام جزئي | GR جزئي |
| متى يظهر DLV؟ | استلام كامل | تمهيد TECO |
| متى يتم TECO؟ | إغلاق فني | Settlement |
| متى يتم CLSD؟ | إغلاق نهائي | منع حركات |
| هل توجد User Status إضافية؟ | ضبط داخلي | صلاحيات إضافية |
| ما الذي يسمح به كل Status؟ | قواعد العمل | ضوابط |
| هل يمكن GI قبل REL؟ | منع خطأ | لا يجب السماح |
| هل يمكن Confirmation قبل REL؟ | منع خطأ | لا يجب السماح |
| هل يمكن GR قبل REL؟ | منع خطأ | لا يجب السماح |
| هل يمكن التعديل بعد TECO؟ | سياسة | يحتاج ضبط |
| هل يمكن التسوية بعد TECO؟ | CO | نعم كمنطق عام حسب المقال |
| هل يمكن Re-settlement بعد CLSD؟ | إغلاق نهائي | لا حسب المقال |
| من يملك صلاحية TECO وCLSD؟ | حوكمة | إنتاج/تكاليف |

---

## 14. أسئلة Release

| السؤال | الهدف | أثر الإجابة على التنفيذ |
|---|---|---|
| من يملك صلاحية Release؟ | صلاحيات | منع إطلاق غير جاهز |
| هل Release يتم يدويًا أم تلقائيًا؟ | طريقة التشغيل | Control |
| هل يتم Release عند إنشاء الأمر؟ | أتمتة | مخاطر |
| هل يتحقق المستخدم من توفر المواد قبل Release؟ | جاهزية | Missing Parts |
| هل يتم إنشاء Reservations عند Release؟ | حجز مكونات | مخزون |
| هل يتم إنشاء Inspection Lot 03 عند Release؟ | جودة أثناء الإنتاج | QM |
| هل تتم طباعة Shop Papers؟ | تشغيل الورشة | وثائق |
| هل يتم Lead Time Scheduling عند Release؟ | مواعيد | جدولة |
| ماذا يحدث إذا تم Release دون توفر مواد؟ | خطر | توقف إنتاج |
| هل توجد سياسة لإيقاف الأمر أو إعادته؟ | معالجة مشاكل | User Status/TECO حسب الحاجة |

---

## 15. أسئلة Material Staging / Reservation

| السؤال | الهدف | أثر الإجابة على المستودعات والإنتاج |
|---|---|---|
| هل يتم تجهيز المواد قبل الصرف؟ | Staging | منع توقف |
| هل توجد Reservations؟ | حجز مواد | عدم استخدام نفس المخزون |
| هل يستخدم العميل Pull List؟ | تجهيز مواد | كفاءة المستودع |
| هل توجد PSA؟ | منطقة تغذية | Kanban/Staging |
| هل يتم نقل المواد من مستودع مركزي إلى مستودع إنتاج؟ | مسار داخلي | ضبط مواقع |
| هل يوجد Kanban؟ | Pull | Control Cycle |
| هل يستخدم EWM / WM؟ | مستودعات متقدمة | تكامل حركات |
| من مسؤول تجهيز المواد؟ | مسؤولية | Warehouse/Production |
| هل تظهر Missing Parts قبل التنفيذ؟ | كشف نقص | تقليل توقف |
| هل توجد مشكلة استخدام نفس المخزون لأكثر من أمر؟ | تضارب | Reservations |
| هل يوجد تقرير للمواد الناقصة؟ | رقابة | Missing Parts List |

---

## 16. أسئلة Goods Issue / Material Consumption

| السؤال | الهدف | أثر الإجابة على المخزون/WIP/التكلفة |
|---|---|---|
| متى يتم Goods Issue؟ | توقيت الصرف | WIP |
| هل GI يدوي أم Backflush؟ | طريقة الصرف | COGI/دقة |
| هل يستخدم Movement Type 261؟ | حركة صرف | مخزون/WIP |
| هل يستخدم Movement Type 262 للمرتجعات؟ | عكس الصرف | تصحيح WIP |
| هل الصرف يتم بناءً على Reservation؟ | ضبط | منع صرف عشوائي |
| هل الصرف من Production Storage Location؟ | موقع | أرصدة |
| هل يوجد Issue Storage Location في BOM؟ | مصدر المكون | دقة GI |
| هل يوجد Batch / Serial عند الصرف؟ | تتبع | جودة |
| هل يسمح بصرف كمية أكبر من BOM؟ | تجاوز | Variance |
| هل يسمح بصرف كمية أقل؟ | نقص | تنفيذ/Variance |
| هل يتم صرف مواد بديلة؟ | بدائل | Costing |
| هل يتم تعديل مكونات الأمر قبل الصرف؟ | مرونة | Audit |
| هل توجد COGI Errors؟ | أخطاء حركات | إغلاق |
| هل توجد CO1P Pending Cost Postings؟ | تكاليف معلقة | Period-End |
| من يراجع COGI وCO1P؟ | مسؤولية | تنظيف |
| ما أثر GI على WIP؟ | تكلفة | WIP يزيد |
| ما أثر GI على المالية؟ | FI/CO | Universal Journal حسب الإعداد |

---

## 17. أسئلة Backflush

| السؤال | الهدف | أثر الإجابة على التنفيذ والمخزون |
|---|---|---|
| هل يستخدم العميل Backflush؟ | معرفة الأتمتة | صرف تلقائي |
| على أي مواد؟ | تحديد النطاق | ليست كل المواد مناسبة |
| هل Backflush مفعّل من Material Master؟ | مصدر الإعداد | ضبط |
| هل Backflush مفعّل من Routing Operation؟ | مصدر الإعداد | توقيت الصرف |
| هل Backflush مفعّل من Work Center؟ | مصدر الإعداد | يحتاج تحقق إضافي من المصدر الأصلي |
| هل Backflush مناسب لقيمة المادة وطبيعة العملية؟ | تقييم المخاطر | منع أخطاء |
| هل فشل Backflush يظهر في COGI؟ | مراقبة | معالجة |
| هل المستخدمون يراجعون COGI؟ | حوكمة | منع تراكم |
| هل يوجد نقص مخزون متكرر بسبب Backflush؟ | كشف مشكلة | MRP/مخزون |
| هل يوجد Batch غير محدد يسبب أخطاء؟ | Traceability | COGI |
| هل Backflush مناسب لكل المواد أم لبعضها فقط؟ | سياسة | تصميم أفضل |

---

## 18. أسئلة Confirmation

| السؤال | الهدف | أثر الإجابة على التكلفة والانحرافات |
|---|---|---|
| هل يتم تسجيل Confirmation؟ | وجود حدث ورشة | Actual Cost |
| هل يتم على Operation أم Order Header؟ | مستوى الدقة | تقارير/تكلفة |
| هل يستخدم CO11N أو CO15 كمفهوم؟ | أدوات العمل | تدريب |
| هل يوجد Partial Confirmation؟ | تقدم جزئي | PCNF |
| هل يوجد Final Confirmation؟ | إكمال | CNF |
| هل يوجد Milestone Confirmation؟ | تبسيط | إكمال مراحل |
| هل يتم تسجيل Yield Quantity؟ | كمية جيدة | GR/تقارير |
| هل يتم تسجيل Scrap Quantity؟ | هالك | Scrap Variance |
| هل يتم تسجيل Rework Quantity؟ | إعادة تشغيل | تكلفة إضافية |
| هل يتم تسجيل Activity Quantities؟ | موارد | Activity Cost |
| هل يتم تسجيل Machine Time؟ | آلة | Resource Usage |
| هل يتم تسجيل Labor Time؟ | عمالة | Activity Cost |
| هل يتم تسجيل Setup Time؟ | تهيئة | تكلفة ثابتة |
| هل يتم تسجيل Personnel Number؟ | مسؤولية | أداء |
| هل يتم تسجيل Reason for Variance؟ | تفسير | تحليل |
| هل Confirmation يحرك Backflush؟ | صرف تلقائي | مخزون/WIP |
| هل Confirmation يحرك Auto GR؟ | استلام تلقائي | مخزون |
| هل Confirmation يحمّل Actual Activity Posting؟ | تكلفة فعلية | CO |
| كيف يتم إلغاء Confirmation؟ | تصحيح | CO13 كمفهوم |
| هل توجد أخطاء متكررة في Confirmation؟ | مخاطر | تدريب وضوابط |

---

## 19. أسئلة Goods Receipt

| السؤال | الهدف | أثر الإجابة على المخزون والجودة والتكلفة |
|---|---|---|
| متى يتم Goods Receipt؟ | توقيت الاستلام | Finished Goods |
| هل يستخدم Movement Type 101؟ | حركة GR | مخزون |
| هل يستخدم Movement Type 102 للإلغاء؟ | عكس GR | تصحيح |
| هل GR يدوي أم Auto GR؟ | طريقة | جودة ومخزون |
| هل المنتج يدخل Finished Goods Inventory؟ | موقع نهائي | تقييم |
| هل يوجد Storage Location محدد؟ | مكان الاستلام | أرصدة |
| هل يوجد Batch / Serial عند الاستلام؟ | تتبع | جودة |
| هل يوجد GR جزئي؟ | Partial Delivery | PDLV |
| هل تظهر حالات PDLV / DLV؟ | متابعة | إكمال |
| هل GR يخفض WIP؟ | تكلفة | WIP |
| هل المنتج يُقيّم Standard Price أم Moving Average؟ | تقييم | مالية |
| هل Auto GR يحدث قبل اكتمال الجودة؟ | خطر | مخزون غير مفحوص |
| هل يوجد Inspection Lot 04 عند GR؟ | فحص نهائي | QM |
| هل يدخل المنتج Quality Inspection Stock؟ | إتاحة | منع بيع/استخدام |

---

## 20. أسئلة Quality Management

| السؤال | الهدف | أثر الإجابة على الإنتاج والمخزون |
|---|---|---|
| هل يستخدم العميل QM؟ | تكامل الجودة | Inspection |
| هل يوجد Inspection Type 03 أثناء الإنتاج؟ | فحص أثناء التنفيذ | Release/Order |
| هل يوجد Inspection Type 04 عند GR؟ | فحص الاستلام | Quality Stock |
| هل يتم إنشاء Inspection Lot عند Release؟ | جودة أثناء الإنتاج | رقابة |
| هل يتم إنشاء Inspection Lot عند GR؟ | جودة المنتج النهائي | إتاحة |
| هل يوجد Quality Inspection Stock؟ | مخزون تحت الفحص | منع الإتاحة |
| هل يتم Usage Decision؟ | قبول/رفض | نقل مخزون |
| هل الفحص يمنع إتاحة المخزون؟ | حوكمة | منع منتجات غير مفحوصة |
| هل توجد Batch Management؟ | تتبع دفعات | Quality |
| هل توجد Serial Numbers؟ | تتبع وحدات | Quality |
| هل الجودة مرتبطة بالهالك أو الرفض؟ | Scrap/Reject | Variance |
| هل توجد مشاكل Auto GR قبل الجودة؟ | خطر | تصميم ضبط |

---

## 21. أسئلة Process Manufacturing

| السؤال | الهدف | أثر الإجابة على تصميم النظام |
|---|---|---|
| هل العميل يعمل في صناعة غذائية أو دوائية أو كيميائية؟ | تحديد Process | Process Order |
| هل يحتاج Process Order بدل Production Order؟ | نوع التنفيذ | Master Recipe |
| هل توجد Master Recipe؟ | بيانات التصنيع | Operations/Phases |
| هل توجد Operations وPhases؟ | تفصيل العمليات | Confirmation |
| هل توجد Resources بدل Work Centers؟ | Process Resources | Costing |
| هل توجد Primary وSecondary Resources؟ | موارد العملية | تكلفة وجدولة |
| هل توجد Material List على Phase؟ | صرف مواد | GI |
| هل يتم Confirmation على Phase؟ | دقة | Activity Cost |
| هل يوجد Batch Management إلزامي؟ | تتبع | Quality |
| هل توجد Batch Determination؟ | اختيار الدفعات | جودة |
| هل توجد Co-products وBy-products؟ | مخرجات مشتركة | Apportionment |
| هل توجد Apportionment Structure؟ | توزيع تكلفة | Costing |
| هل توجد PI Sheets أو Process Instructions؟ | تنفيذ ورشة | يحتاج تحقق إضافي |
| هل يوجد Control Recipe؟ | تكامل أنظمة التحكم | يحتاج تحقق إضافي |
| هل توجد Quality Integration قوية؟ | صناعات منظمة | QM |

---

## 22. أسئلة Repetitive Manufacturing

| السؤال | الهدف | أثر الإجابة على التكلفة والتنفيذ |
|---|---|---|
| هل الإنتاج متكرر وبكميات كبيرة؟ | تحديد REM | PCC |
| هل يوجد خط إنتاج ثابت؟ | Production Line | Production Version |
| هل يحتاج العميل Production Order لكل دفعة أم Period-Based؟ | كائن تكلفة | Order أو PCC |
| هل يستخدم Run Schedule Quantities؟ | تنفيذ REM | تخطيط |
| هل يحتاج Product Cost Collector؟ | تكلفة الفترة | WIP/Variance |
| هل يستخدم Backflush كعملية أساسية؟ | صرف تلقائي | COGI |
| هل يستخدم Auto GR؟ | استلام تلقائي | مخزون |
| هل توجد Reporting Points؟ | تقدم مراحل | رقابة |
| هل التكلفة تجمع على فترة بدل أمر؟ | Product Cost by Period | Settlement |
| هل WIP وVariance تراجع على PCC؟ | رقابة مالية | Period-End |
| هل REM مناسب أم Production Order أفضل؟ | اختيار النموذج | تقليل التعقيد |

---

## 23. أسئلة Kanban

| السؤال | الهدف | أثر الإجابة على التخطيط والمخزون |
|---|---|---|
| هل توجد مواد منخفضة القيمة عالية الاستهلاك؟ | ملاءمة Kanban | Pull Replenishment |
| هل يريد العميل Pull Replenishment؟ | فلسفة التزويد | Control Cycle |
| هل توجد PSA واضحة؟ | منطقة تغذية | Kanban |
| هل توجد Containers؟ | كميات تجديد | حالات Kanban |
| هل توجد Control Cycles؟ | ربط PSA بالمصدر | تجديد |
| ما حجم كل حاوية؟ | كمية | مخزون |
| ما عدد الحاويات؟ | مستوى مخزون | توازن |
| ما مصدر التجديد؟ | داخلي/خارجي/نقل | استراتيجية |
| هل يتم تغيير حالة الحاوية إلى Empty وFull؟ | Trigger | تجديد |
| هل Kanban مناسب لبعض المواد فقط؟ | نطاق | منع تعميم خاطئ |

---

## 24. أسئلة WIP

| السؤال | الهدف | أثر الإجابة على المالية |
|---|---|---|
| هل يحتاج العميل متابعة WIP؟ | تحديد الحاجة | ميزانية |
| هل WIP يزيد عند GI؟ | فهم التدفق | تكلفة تحت التشغيل |
| هل Activity Cost تدخل WIP من Confirmation؟ | تكلفة موارد | CO |
| هل GR يخفض WIP؟ | إكمال | Finished Goods |
| هل WIP يحسب في نهاية الفترة؟ | Period-End | تقارير مالية |
| هل WIP على Order أم PCC؟ | كائن تكلفة | Order/REM |
| هل WIP يظهر في الميزانية؟ | أثر مالي | FI |
| من يراجع WIP؟ | مسؤولية | CO/FI |
| هل توجد أوامر مفتوحة تسبب WIP غير حقيقي؟ | خطر | تنظيف |
| هل يتم Settlement دوريًا؟ | تسوية | إغلاق |
| هل يوجد WIP Report؟ | رقابة | متابعة |

---

## 25. أسئلة Variance

| السؤال | الهدف | القرار الناتج |
|---|---|---|
| هل يريد العميل تحليل الانحرافات؟ | مستوى تكلفة | تفعيل تقارير |
| هل توجد Input Quantity Variance؟ | استهلاك مواد | مراجعة BOM/GI |
| هل توجد Input Price Variance؟ | أسعار | مراجعة Valuation/شراء |
| هل توجد Resource Usage Variance؟ | وقت/موارد | مراجعة Routing |
| هل توجد Resource Price Variance؟ | أسعار نشاط | مراجعة KP26 |
| هل توجد Scrap Variance؟ | هالك | مراجعة جودة |
| هل توجد Lot Size Variance؟ | حجم دفعة | مراجعة lot size |
| هل توجد Remaining Variance؟ | فرق غير مصنف | تحليل CO |
| من يراجع Variance؟ | مسؤولية | اجتماع دوري |
| هل تستخدم Variance لتحسين BOM؟ | تحسين بيانات | Engineering |
| هل تستخدم Variance لتحسين Routing؟ | تحسين عمليات | Production |
| هل تستخدم Variance لتحديث Activity Rates؟ | تكلفة | CO |
| هل توجد Reason for Variance في Confirmation؟ | تفسير | تقارير |

---

## 26. أسئلة Settlement وPeriod-End Closing

| السؤال | الهدف | أثر الإجابة على الإغلاق المالي |
|---|---|---|
| هل يتم Settlement؟ | حسم الأثر المالي | نقل WIP/Variance |
| متى يتم Settlement؟ | توقيت | Period-End |
| من ينفذه؟ | مسؤولية | CO/FI |
| هل توجد Settlement Rule؟ | مستقبل التسوية | توجيه مالي |
| هل يوجد Settlement Receiver؟ | جهة الاستقبال | Material/COPA/FI |
| هل يوجد Settlement Profile؟ | إعداد | ضوابط |
| هل يتم Settlement إلى FI أو COPA؟ | تحليل مالي | Universal Journal |
| هل يتم WIP Calculation قبل Settlement؟ | ترتيب | دقة |
| هل يتم Variance Calculation؟ | فروقات | تحليل |
| هل توجد أوامر TECO ولم تتم تسويتها؟ | خطر | WIP/Variance عالق |
| هل توجد أوامر CLSD قبل التسوية؟ | خطأ | منع التصحيح |
| هل توجد COGI Errors مفتوحة؟ | حركات معلقة | إغلاق غير صحيح |
| هل توجد CO1P Pending Cost Postings؟ | تكلفة معلقة | إغلاق غير مكتمل |
| هل تتم مراجعة Period-End Closing؟ | حوكمة | إغلاق صحيح |
| هل Universal Journal يعكس الأثر؟ | مطابقة | FI/CO |
| هل توجد Production-to-FI Reconciliation؟ | تحقق | ثقة مالية |

---

## 27. أسئلة التقارير والرقابة

| التقرير المطلوب | المستخدم | القرار الذي يساعد عليه |
|---|---|---|
| MD04 | MRP Controller | ماذا ننتج أو نشتري؟ |
| Production Order Status Report | الإنتاج | ما حالة الأوامر؟ |
| COOIS | الإنتاج/CO | متابعة أوامر الإنتاج |
| Missing Parts List | المستودعات/الإنتاج | هل المواد جاهزة؟ |
| Dispatch List | الورشة | ماذا ينفذ اليوم؟ |
| Capacity Load Report | التخطيط | هل الطاقة كافية؟ |
| COGI Report | ERP/المستودعات | ما أخطاء Backflush؟ |
| CO1P Report | CO/ERP | ما التكاليف أو الحركات المعلقة؟ |
| Cost Analysis | CO | لماذا التكلفة مختلفة؟ |
| Order Cost Display | CO/الإنتاج | ما تكلفة الأمر؟ |
| WIP Report | FI/CO | ما قيمة الإنتاج تحت التشغيل؟ |
| Variance Report | الإدارة/CO | ما أسباب الانحراف؟ |
| Settlement Report | FI/CO | هل تمت التسوية؟ |
| Batch Where-Used List | الجودة | أين استخدمت الدفعة؟ |
| Inspection Lot Report | الجودة | ما حالة الفحص؟ |
| Production-to-FI Reconciliation | المالية | هل الإنتاج مطابق للمالية؟ |

---

## 28. أسئلة UAT وGo-Live

| سيناريو الاختبار | لماذا مهم؟ | من يعتمد؟ |
|---|---|---|
| Material Master | أساس كل الدورة | PP/FI/CO |
| BOM | مكونات وتكلفة | Engineering/PP |
| Routing | عمليات وتكلفة | Production/CO |
| Production Version | ربط BOM/Routing | PP/CO |
| MRP | تخطيط | Planning |
| Planned Order Conversion | فصل التخطيط عن التنفيذ | Planning/Production |
| Release | بدء التنفيذ | Production |
| Reservations | حجز مواد | Warehouse |
| Goods Issue | صرف مواد | Warehouse/CO |
| Backflush | صرف تلقائي | Production/Warehouse |
| Confirmation | وقت وكمية وهالك | Production/CO |
| Goods Receipt | منتج نهائي | Warehouse/QM |
| Quality Inspection | فحص | Quality |
| TECO | إغلاق فني | Production |
| WIP Calculation | تكلفة تحت التشغيل | CO/FI |
| Variance Calculation | فروقات | CO |
| Settlement | أثر مالي | FI/CO |
| CLSD | إغلاق نهائي | CO |
| COGI / CO1P | أخطاء معلقة | ERP/CO |
| سيناريوهات العميل الحقيقية | واقعية التطبيق | جميع الأطراف |

---

## 29. نموذج أسئلة مختصر للاجتماع الأول

| الأولوية | السؤال | لماذا مهم؟ |
|---|---|---|
| 1 | ما نوع الإنتاج لديكم؟ | تحديد Discrete/Process/REM/Kanban |
| 2 | هل الإنتاج MTS أم MTO؟ | تحديد Strategy |
| 3 | هل لديكم Material Master منظم؟ | أساس النظام |
| 4 | هل لكل منتج BOM؟ | المواد والتكلفة |
| 5 | هل لكل منتج Routing؟ | العمليات والتكلفة |
| 6 | هل توجد Work Centers؟ | التنفيذ والطاقة |
| 7 | هل Work Centers مربوطة بـ Cost Centers؟ | تكلفة |
| 8 | هل Activity Rates محدثة؟ | KP26 |
| 9 | هل توجد Production Versions؟ | ربط BOM/Routing |
| 10 | هل تستخدمون MRP؟ | تخطيط |
| 11 | من يراجع Planned Orders؟ | مسؤولية |
| 12 | من يحول Planned Orders إلى Orders؟ | فصل التخطيط والتنفيذ |
| 13 | من ينشئ Production Orders؟ | مسؤولية |
| 14 | متى يتم Release؟ | بدء التنفيذ |
| 15 | هل توجد Reservations؟ | حجز مواد |
| 16 | كيف يتم GI؟ | مخزون/WIP |
| 17 | هل تستخدمون Backflush؟ | مخاطر COGI |
| 18 | كيف يتم Confirmation؟ | تكلفة أنشطة |
| 19 | هل تسجلون Scrap؟ | جودة/Variance |
| 20 | كيف يتم GR؟ | Finished Goods |
| 21 | هل يوجد Auto GR؟ | جودة ومخزون |
| 22 | هل يوجد Batch/Serial؟ | Traceability |
| 23 | هل تستخدمون QM؟ | Inspection |
| 24 | هل تتابعون WIP؟ | مالية |
| 25 | هل تحسبون Variance؟ | تحليل |
| 26 | هل يتم Settlement؟ | إغلاق مالي |
| 27 | من ينفذ Period-End Closing؟ | مسؤولية |
| 28 | هل تراجعون COGI/CO1P؟ | أخطاء معلقة |
| 29 | ما أهم التقارير المطلوبة؟ | رقابة |
| 30 | ما أكبر مشكلة حالية في الإنتاج؟ | أولوية التطبيق |

---

## 30. نموذج أسئلة متقدم للاجتماعات التفصيلية

### Master Data
1. هل كل الأصناف لها Material Type؟
2. هل Base UoM صحيح؟
3. هل MRP Views مكتملة؟
4. هل Accounting Views صحيحة؟
5. هل Costing Views مكتملة؟

### BOM
6. هل BOM معتمدة؟
7. هل توجد Alternative BOMs؟
8. هل توجد Validity Dates؟
9. هل توجد Scrap Percentages؟
10. هل توجد Phantom Items؟

### Routing
11. هل Routing يعكس الواقع؟
12. هل كل Operation لها Work Center؟
13. هل توجد Setup/Machine/Labor Times؟
14. هل توجد Component Allocation؟
15. هل توجد Alternative Routings؟

### Work Centers
16. هل Work Center مربوط بـ Cost Center؟
17. هل Activity Types موجودة؟
18. هل KP26 محدثة؟
19. هل توجد Capacity؟
20. هل توجد Shifts؟

### Production Version
21. هل لكل منتج Production Version؟
22. هل تربط BOM وRouting؟
23. هل لها Validity؟
24. هل لها Lot Size Range؟
25. من يعتمدها؟

### MRP
26. هل يستخدم MRP Live؟
27. ما MRP Types؟
28. هل يوجد Safety Stock؟
29. هل تستخدمون MD04؟
30. هل توجد Firmed Planned Orders؟

### Production Orders
31. هل الأوامر من MRP أم يدويًا؟
32. هل توجد Process Orders؟
33. هل توجد Rework Orders؟
34. هل يتم تعديل الأمر بعد الإنشاء؟
35. هل الأوامر القديمة تُغلق؟

### Goods Issue
36. هل GI يدوي أم Backflush؟
37. هل يوجد 261؟
38. هل يوجد 262؟
39. هل Batch/Serial مطلوب؟
40. هل COGI مراقب؟

### Confirmation
41. هل Confirmation على Operation؟
42. هل يسجل Yield؟
43. هل يسجل Scrap؟
44. هل يسجل Activity Quantities؟
45. هل يوجد إلغاء Confirmation؟

### Goods Receipt
46. هل GR يدوي أم Auto؟
47. هل يستخدم 101؟
48. هل يستخدم 102؟
49. هل يوجد Quality Stock؟
50. هل يوجد PDLV/DLV؟

### Quality
51. هل Inspection Type 03 مستخدم؟
52. هل Inspection Type 04 مستخدم؟
53. هل Usage Decision مطلوب؟
54. هل Batch Where-Used مطلوب؟
55. هل الجودة تمنع الإتاحة؟

### Costing
56. هل Standard Cost مستخدم؟
57. هل Moving Average مستخدم؟
58. هل Cost Component Split مطلوب؟
59. هل Product Cost by Order أم Period؟
60. هل PCC مطلوب؟

### WIP
61. هل WIP يحسب؟
62. هل WIP على Order أم PCC؟
63. من يراجعه؟
64. هل توجد أوامر WIP قديمة؟
65. هل WIP يظهر في FI؟

### Variance
66. هل Variance تحسب؟
67. هل Material Variance تراجع؟
68. هل Resource Variance تراجع؟
69. هل Scrap Variance تراجع؟
70. هل Reason for Variance يسجل؟

### Settlement
71. هل توجد Settlement Rule؟
72. هل Settlement Receiver واضح؟
73. هل Settlement Profile موجود؟
74. هل Settlement شهري؟
75. هل COPA مستخدم؟

### Reports
76. هل MD04 مطلوب؟
77. هل COOIS مطلوب؟
78. هل Cost Analysis مطلوب؟
79. هل WIP/Variance Reports مطلوبة؟
80. هل Production-to-FI Reconciliation مطلوب؟

### UAT
81. هل تم اختبار دورة كاملة؟
82. هل اختبرت COGI؟
83. هل اختبر Settlement؟
84. هل شاركت المالية؟
85. هل شاركت الجودة؟

---

## 31. علامات الخطر أثناء التحليل

| علامة الخطر | ماذا تعني؟ | الإجراء المقترح |
|---|---|---|
| Material Master غير مكتمل | النظام لن يخطط أو يكلف بدقة | Master Data cleanup |
| BOM غير دقيقة | صرف وتكلفة خاطئة | مراجعة هندسية |
| Routing لا يعكس الواقع | تكلفة أنشطة خاطئة | دراسة ورشة |
| Production Version غير موجودة | غموض BOM/Routing | إنشاء واعتماد |
| Work Center غير مربوط بـ Cost Center | لا تكلفة موارد | ربط CO |
| Activity Rates غير محدثة | تكلفة صفرية أو خاطئة | تحديث KP26 |
| العميل لا يفرق بين Planned Order وProduction Order | خلط تخطيط وتنفيذ | تدريب |
| Backflush مستخدم بلا مراجعة | COGI ومخزون خاطئ | سياسة Backflush |
| COGI غير مراقب | حركات فاشلة | تقرير يومي |
| Confirmation غير دقيق | Actual Cost خاطئة | تدريب وضوابط |
| GR يتم قبل الجودة | مخزون غير مفحوص | QM/Inspection Stock |
| TECO يستخدم خطأ | إغلاق فني مبكر | صلاحيات |
| Settlement غير مفهوم | إغلاق مالي ناقص | ورشة CO/FI |
| WIP غير مراجع | ميزانية غير دقيقة | WIP Report |
| Variance لا تستخدم للتحسين | تكرار الأخطاء | اجتماع شهري |
| المالية غير مشاركة | رفض الأرقام لاحقًا | إشراك FI/CO |
| التقارير المطلوبة غير محددة | رقابة ضعيفة | Report Catalogue |

---

## 32. مخرجات جلسة التحليل المطلوبة

| المخرج | الهدف منه | من يعتمده؟ |
|---|---|---|
| خريطة دورة الإنتاج | توثيق الواقع | الإنتاج والإدارة |
| قائمة المنتجات | تحديد النطاق | الإنتاج |
| Material Master gaps | تنظيف البيانات | Master Data / FI / CO |
| BOMs | مكونات المنتجات | الهندسة/الإنتاج |
| Routings | خطوات التصنيع | الإنتاج |
| Work Centers | مراكز التنفيذ | الإنتاج/CO |
| Production Versions | ربط BOM/Routing | PP/CO |
| MRP policy | سياسة التخطيط | التخطيط |
| Production Order lifecycle | حالات وتنفيذ | الإنتاج |
| GI policy | الصرف | المستودعات |
| Backflush policy | الصرف التلقائي | الإنتاج/المستودعات |
| Confirmation policy | تسجيل العمل | الإنتاج/CO |
| GR policy | الاستلام | المستودعات/الجودة |
| Quality policy | الفحص | الجودة |
| Costing policy | التكلفة | CO/FI |
| WIP policy | تحت التشغيل | CO/FI |
| Variance policy | الانحرافات | CO/الإنتاج |
| Settlement policy | التسوية | CO/FI |
| قائمة التقارير | الرقابة | الإدارة |
| قائمة الفجوات | خطة المعالجة | فريق المشروع |
| متطلبات التطوير | ما لا يغطيه النظام | IT/ERP |
| خطة UAT | اختبار التشغيل | جميع الأطراف |

---

## 33. ملخص تنفيذي

أسئلة التحليل هي أداة لاكتشاف الواقع التشغيلي والمالي، وليست مجرد نموذج مقابلة.  
نجاح SAP Manufacturing يعتمد على دقة **Material Master وBOM وRouting وProduction Version** قبل الوصول إلى التنفيذ.

لا يجب تطبيق الإنتاج قبل وضوح:

- MRP.
- Production Order Lifecycle.
- GI.
- Confirmation.
- GR.
- Quality.
- Costing.
- WIP.
- Variance.
- Settlement.
- Period-End Closing.

Costing وWIP وSettlement يجب أن تُناقش مع المالية منذ البداية.  
Confirmation وBackflush وGR من أخطر نقاط التنفيذ لأنها تربط الورشة بالمخزون والتكلفة.  
كل إجابة من العميل يجب أن تتحول إلى إعداد، تقرير، صلاحية، متطلب تطوير، أو سيناريو اختبار واضح.
