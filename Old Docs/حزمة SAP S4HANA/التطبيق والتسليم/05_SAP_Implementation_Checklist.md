# 05_SAP_Implementation_Checklist.md
# قائمة تطبيق وتسليم نظام الإنتاج في SAP S/4HANA Manufacturing / PP

## 1. مقدمة

هذا الملف يحوّل دراسة **SAP S/4HANA Manufacturing / PP** إلى قائمة تنفيذية تساعد فريق ERP على تطبيق Module الإنتاج بطريقة منظمة وقابلة للتحقق.

الهدف من هذه الـ Checklist هو تقليل مخاطر:

- ضعف Material Master.
- BOM غير دقيقة.
- Routing لا يعكس الواقع.
- Work Center غير مربوط بالتكلفة.
- Production Version غير صحيحة.
- MRP ينتج أوامر خاطئة.
- Production Orders لا تمر بدورة صحيحة.
- Goods Issue أو Backflush غير مضبوط.
- Confirmation غير دقيق.
- Goods Receipt قبل الجودة أو قبل اكتمال العملية.
- WIP غير مراجع.
- Variance غير مفهومة.
- Settlement غير منفذ.
- TECO / CLSD يستخدمان بشكل خاطئ.
- التقارير غير كافية.
- UAT ضعيف أو غير شامل.

---

## 2. طريقة استخدام هذا الملف

يستخدم فريق التطبيق هذا الملف في مراحل متعددة:

| المرحلة | الهدف من استخدام الـ Checklist | الأطراف المطلوبة |
|---|---|---|
| قبل بدء التطبيق | تحديد جاهزية العميل ونطاق التصنيع | الإدارة، الإنتاج، التخطيط، فريق ERP |
| أثناء تحليل العميل | تحويل الواقع التشغيلي إلى متطلبات وإعدادات | الإنتاج، التخطيط، المستودعات، المالية، الجودة |
| أثناء إعداد Master Data | التأكد من صحة Material Master وBOM وRouting | Master Data، الإنتاج، التخطيط، محاسبة التكاليف |
| أثناء إعداد MRP | ضبط سياسات التخطيط ومخرجات MRP | التخطيط، المشتريات، المستودعات |
| أثناء إعداد التنفيذ | ضبط Production Orders وGI وConfirmation وGR | الإنتاج، المستودعات، الجودة |
| أثناء اختبار التكلفة | اختبار WIP وVariance وSettlement | محاسبة التكاليف، المالية، ERP |
| قبل Go-Live | قرار Go/No-Go | جميع الأطراف |
| بعد Go-Live | مراقبة أول تشغيل فعلي | الإنتاج، ERP، المالية، المستودعات |
| أول Period-End Closing | التحقق من الإغلاق المالي الكامل | المالية، CO، الإنتاج، ERP |

---

## 3. Checklist جاهزية العميل قبل تطبيق الإنتاج

| بند التحقق | لماذا مهم؟ | المسؤول | الخطر إذا لم يتحقق |
|---|---|---|---|
| دورة الإنتاج موثقة | لفهم التسلسل الحقيقي | الإنتاج / ERP | تطبيق نظام لا يعكس الواقع |
| نوع الإنتاج واضح: Discrete / Process / Repetitive / Kanban | لاختيار نموذج التنفيذ | الإنتاج | اختيار كائنات SAP خاطئة |
| استراتيجية الإنتاج واضحة: MTS / MTO / ATO / ETO | لتحديد علاقة الطلب بالإنتاج | التخطيط / المبيعات | تخطيط وإنتاج غير مناسب |
| المنتجات النهائية معروفة | لتحديد Finished Goods | الإنتاج / Master Data | نطاق غير واضح |
| المواد الخام معروفة | لبناء BOM وGI | المستودعات / الإنتاج | صرف مواد خاطئ |
| المنتجات نصف المصنعة معروفة | لبناء Multi-Level BOM | الإنتاج / التخطيط | MRP ناقص |
| BOM موثقة | أساس المواد والتكلفة | الهندسة / الإنتاج | تكلفة وصرف خاطئ |
| Routing أو Master Recipe موجودة | أساس العمليات والتكلفة | الإنتاج | عدم القدرة على الجدولة والتكلفة |
| Work Centers أو Resources معرفة | أساس التنفيذ والقدرة | الإنتاج | عمليات غير قابلة للتخطيط |
| Production Versions موجودة | ربط BOM وRouting | PP / CO | فشل MRP أو Cost Estimate |
| سياسة MRP واضحة | ضبط التخطيط | التخطيط | Planned Orders خاطئة |
| سياسة صرف المواد واضحة | ضبط GI | المستودعات / الإنتاج | WIP غير صحيح |
| سياسة Backflush واضحة | ضبط الصرف التلقائي | الإنتاج / المستودعات | COGI متكرر |
| سياسة Confirmation واضحة | ضبط تسجيل العمل والوقت | الإنتاج / CO | تكلفة فعلية غير دقيقة |
| سياسة GR واضحة | ضبط استلام المنتج النهائي | المستودعات | Finished Goods غير صحيح |
| سياسة الجودة واضحة | ضبط Inspection | الجودة | إتاحة منتج غير مفحوص |
| سياسة التكلفة واضحة | ضبط CO/FI | محاسبة التكاليف | أرقام غير مقبولة |
| سياسة WIP واضحة | ضبط الإنتاج تحت التشغيل | CO/FI | ميزانية غير دقيقة |
| سياسة Settlement واضحة | ضبط الإغلاق المالي | CO/FI | WIP/Variance عالق |
| المالية ومحاسبة التكاليف مشاركة | لقبول الأثر المالي | FI/CO | رفض النتائج بعد التطبيق |

---

## 4. Checklist إعداد Material Master

| البند | ما يجب التحقق منه | أثر الخطأ | القسم المسؤول |
|---|---|---|---|
| Material Type | صحيح لكل صنف | معالجة صنف غير مناسبة | Master Data |
| Base UoM | وحدة قياس صحيحة | كميات خاطئة | Master Data / مستودعات |
| MRP Views | مكتملة | فشل أو خطأ MRP | التخطيط |
| Work Scheduling View | مكتملة | خلل في التنفيذ أو Auto GR | الإنتاج |
| Quality Management View | مكتملة عند الحاجة | فشل Inspection | الجودة |
| Accounting View | صحيحة | تقييم مالي خاطئ | FI |
| Costing View | صحيحة | Standard Cost خاطئ | CO |
| MRP Type | مناسب لكل صنف | تخطيط خاطئ | التخطيط |
| MRP Controller | محدد | غياب مسؤولية | التخطيط |
| Lot Size | مناسب | دفعات غير عملية | التخطيط |
| Procurement Type | داخلي/خارجي/مختلط | شراء بدل تصنيع أو العكس | التخطيط / المشتريات |
| Special Procurement | مضبوط عند الحاجة | توريد خاص خاطئ | التخطيط |
| Strategy Group | صحيح | MTS/MTO خاطئ | التخطيط / المبيعات |
| Production Storage Location | محدد | GI/GR من موقع خاطئ | المستودعات |
| Safety Stock | محدد عند الحاجة | نقص أو فائض | التخطيط |
| Backflush Indicator | مضبوط عند الحاجة | صرف تلقائي خاطئ | الإنتاج |
| Individual / Collective Requirements | صحيح | خلط احتياجات | التخطيط |
| Repetitive Manufacturing Flag | مفعل عند الحاجة | REM لا يعمل | الإنتاج / PP |
| Valuation Class | صحيحة | GL خاطئ | FI |
| Price Control | مناسب | تقييم غير مناسب | FI/CO |
| Standard / Moving Average Price | صحيح | تكلفة وتقييم خاطئ | FI/CO |
| Costing Lot Size | واضح | تكلفة وحدة غير واقعية | CO |
| With Quantity Structure | مفعل عند الحاجة | Cost Estimate لا يستخدم BOM/Routing | CO |
| Costing Variant / Cost Component Structure | واضحة عند الحاجة | تحليل تكلفة ضعيف | CO |

---

## 5. Checklist إعداد Plant / Storage Location / PSA

| بند التحقق | الهدف | أثره على المستودعات والإنتاج |
|---|---|---|
| Plant معرف ومربوط بالـ Company Code | ربط الإنتاج بالكيان المالي | إنتاج ومخزون ضمن نطاق صحيح |
| Storage Locations معرفة | ضبط مواقع المواد | GI/GR صحيح |
| مستودع المواد الخام واضح | مصدر الصرف | منع صرف من موقع خاطئ |
| مستودع المنتج التام واضح | وجهة GR | مخزون منتج تام صحيح |
| Production Storage Location واضح | موقع الإنتاج | تجهيز وصرف مضبوط |
| Issue Storage Location واضح في BOM عند الحاجة | تحديد مصدر المكونات | تقليل أخطاء الصرف |
| PSA معرفة عند الحاجة | تغذية الإنتاج | دعم Kanban/Staging |
| علاقة PSA بالـ Storage Location واضحة | ربط الأرض بالمخزون | منع ضياع المواد |
| مسؤول PSA محدد | حوكمة التجهيز | وضوح المسؤوليات |
| Pull List أو Material Staging واضح | تجهيز قبل الصرف | تقليل نقص المواد |
| Kanban Control Cycle يستخدم PSA عند الحاجة | دعم Pull Replenishment | تجديد مواد مضبوط |
| EWM / WM واضح إن كان مستخدمًا | تكامل المستودعات | حركات مستودعية منسقة |

---

## 6. Checklist إعداد BOM

| بند التحقق | نعم/لا | الملاحظات | الخطر إذا لم يتحقق |
|---|---|---|---|
| BOM موجودة لكل منتج مصنع |  |  | لا MRP أو Costing صحيح |
| BOM Header صحيح |  |  | هيكل غير مضبوط |
| Base Quantity صحيحة |  |  | كميات وتكلفة خاطئة |
| BOM Usage مناسب للإنتاج أو التكلفة |  |  | استخدام BOM غير مناسبة |
| BOM Status مناسب |  |  | استخدام غير معتمد |
| Plant محدد أو Group BOM واضح |  |  | غموض في الاستخدام |
| Validity Period صحيح |  |  | استخدام نسخة قديمة أو مستقبلية |
| Alternative BOM محددة عند الحاجة |  |  | بدائل غير مضبوطة |
| Component Materials صحيحة |  |  | صرف مواد خاطئة |
| Component Quantity صحيحة |  |  | تكلفة واستهلاك خاطئ |
| UoM صحيحة |  |  | فروقات كميات |
| Item Category صحيحة |  |  | سلوك مكون غير مناسب |
| Issue Storage Location صحيح |  |  | GI من موقع خاطئ |
| Backflush Indicator على المكونات مضبوط |  |  | COGI أو صرف خاطئ |
| Component Scrap محدد عند الحاجة |  |  | تكلفة ناقصة |
| Assembly Scrap محدد عند الحاجة |  |  | إنتاج وتكلفة غير دقيقة |
| Operation Scrap محدد عند الحاجة |  |  | Variance غير مفسرة |
| Operation Assignment موجود عند الحاجة |  |  | توقيت صرف خاطئ |
| Multi-Level BOM مفهوم |  |  | MRP ناقص |
| Phantom Items محددة عند الحاجة |  |  | أوامر أو مكونات غير صحيحة |
| Co-products وBy-products محددة |  |  | تكلفة مخرجات غير صحيحة |
| Apportionment Structure موجودة عند Co-products |  |  | توزيع تكلفة خاطئ |
| Change Master مستخدم عند الحاجة |  |  | غياب Audit |
| BOM Selection Method واضح |  |  | اختيار BOM خاطئة |

### أخطاء BOM التي يجب منعها قبل Go-Live

- BOM غير معتمدة.
- مكونات لا تطابق الواقع.
- Component Quantity غير دقيقة.
- Scrap غير محدد.
- Alternative BOM بدون Production Version.
- Validity Dates غير صحيحة.
- BOM صالحة للتكلفة وليست صالحة للإنتاج أو العكس.

---

## 7. Checklist إعداد Routing / Operations

| بند التحقق | الهدف | أثره على التنفيذ | أثره على التكلفة |
|---|---|---|---|
| Routing موجود لكل منتج يحتاج عمليات | تعريف طريقة التصنيع | تنفيذ واضح | Costing صحيح |
| Routing Header صحيح | ضبط الاستخدام والصلاحية | Routing صالح | تكلفة صحيحة |
| Validity Period صحيح | صلاحية زمنية | منع نسخة خاطئة | تكلفة تاريخية صحيحة |
| Operations معرفة | خطوات التصنيع | تنفيذ منظم | Activity Cost |
| Operation Number وتسلسل صحيح | ترتيب العمليات | منع خلط الخطوات | ربط تكلفة صحيح |
| Work Center مربوط بكل Operation | تحديد مكان التنفيذ | جدولة وطاقة | Cost Center |
| Control Key صحيح | ضبط confirmation/costing | تنفيذ مضبوط | دخول العملية في التكلفة |
| Standard Value Key مناسب | تفسير القيم | Setup/Machine/Labor | حساب activity |
| Setup Time محدد | وقت تهيئة | جدولة | تكلفة تهيئة |
| Machine Time محدد | وقت آلة | Capacity | Machine Cost |
| Labor Time محدد | وقت عمالة | موارد بشرية | Labor Cost |
| Processing Time واضح | مدة تشغيل | Lead time | يحتاج ضبط حسب الإعداد |
| Queue / Wait / Move Times معرفة | وقت انتظار ونقل | جدولة واقعية | غالبًا غير مباشر |
| Operation Quantity وBase Quantity صحيحة | حساب أزمنة | تنفيذ دقيق | تكلفة وحدة |
| Component Allocation مضبوط | ربط المواد بالعمليات | صرف في الوقت الصحيح | استهلاك مرتبط بالمرحلة |
| Operation Scrap محدد عند الحاجة | فاقد العملية | جودة | Variance |
| Alternative Routing موجودة عند الحاجة | بدائل تصنيع | مرونة | تكلفة بديلة |
| Rate Routing موجودة عند REM | إنتاج متكرر | REM | PCC |
| Routing مناسب للجدولة والتكلفة | تحقق مزدوج | تشغيل صحيح | Costing موثوق |

---

## 8. Checklist إعداد Work Centers / Cost Centers / Activity Types

| بند التحقق | لماذا مهم؟ | أثر الخطأ | المسؤول |
|---|---|---|---|
| Work Centers معرفة | مكان تنفيذ العمليات | لا جدولة ولا تكلفة | الإنتاج |
| Work Center يمثل موقعًا فعليًا واضحًا | واقعية التشغيل | نموذج وهمي | الإنتاج |
| Usage صحيح | استخدام مناسب | Routing غير مناسب | PP |
| Standard Value Key صحيح | تفسير الأزمنة | Activity Cost خاطئة | PP/CO |
| Default Values صحيحة | تسهيل العمليات | إدخالات خاطئة | PP |
| Capacities معرفة | تخطيط الطاقة | Overload غير مرئي | التخطيط |
| Scheduling Formulas صحيحة | حساب التواريخ | جدولة خاطئة | PP |
| Work Center مرتبط بـ Cost Center | تحميل التكلفة | لا Activity Cost | CO |
| Cost Center صحيح للفترة | صلاحية مالية | تكلفة خاطئة | CO |
| Activity Types معرفة | تصنيف النشاط | Labor/Machine غير واضح | CO |
| Activity Rates محدثة في KP26 | تسعير النشاط | تكلفة صفرية أو خاطئة | CO |
| Secondary Cost Elements واضحة إن وردت | تحميل داخلي | يحتاج تحقق إضافي من المصدر الأصلي | CO |
| Setup / Machine / Labor Activities معرفة | فصل التكلفة | Cost Component ضعيف | CO |
| الصيغ الحسابية تعمل | حساب وقت/تكلفة | نتائج خاطئة | PP/CO |
| Work Center صالح للتكلفة والجدولة | تكامل | خلل في التخطيط أو CO | PP/CO |
| لا توجد Work Centers بدون Cost Center عند الحاجة للتكلفة | منع فجوة | تكلفة ناقصة | CO |
| لا توجد Activity Types بدون Rate | منع تكلفة صفرية | Variance خاطئة | CO |

### Checklist خاص بمحاسبة التكاليف قبل اعتماد Work Centers

| بند خاص بـ CO | تم/لم يتم | الملاحظة |
|---|---|---|
| كل Work Center المستخدم في التكلفة مربوط بـ Cost Center |  |  |
| Activity Types معرفة لكل Setup/Machine/Labor مطلوب |  |  |
| KP26 محدث للفترة |  |  |
| Cost Center صالح للفترة |  |  |
| Cost Component Split يعكس الأنشطة |  |  |
| اختبار Confirmation يحمّل Actual Activity Posting |  |  |

---

## 9. Checklist إعداد Production Version

| بند التحقق | الهدف | أثره على MRP | أثره على التكلفة |
|---|---|---|---|
| Production Version موجودة لكل منتج مصنع | منع الغموض | MRP يعمل | Cost Estimate صحيح |
| تربط BOM Alternative صحيحة | اختيار المكونات | Planned Orders صحيحة | Material Cost صحيح |
| تربط Routing / Master Recipe صحيحة | اختيار العمليات | تواريخ صحيحة | Activity Cost صحيح |
| Lot Size Range صحيح | اختيار حسب الكمية | تخطيط مناسب | تكلفة ملائمة للدفعة |
| Valid From / Valid To صحيحان | صلاحية | لا يستخدم نسخة منتهية | تكلفة بتاريخ صحيح |
| مستخدمة في MRP | تخطيط | توليد أوامر صحيح | غير مباشر |
| مستخدمة في Cost Estimate | تكلفة | غير مباشر | Standard Cost صحيح |
| مستخدمة في Order Creation | تنفيذ | أمر صحيح | Snapshot صحيح |
| غير منتهية | صلاحية | منع فشل | منع تكلفة خاطئة |
| معتمدة من الإنتاج والتكلفة | حوكمة | تخطيط مقبول | تكلفة مقبولة |
| أكثر من Production Version موثقة عند الحاجة | بدائل | اختيار واضح | مقارنة تكلفة |
| طريقة اختيار Production Version واضحة | منع عشوائية | MRP مستقر | Costing مستقر |
| Production Version في Material Master صحيحة | ربط أساسي | MRP/Costing | Cost Estimate |

### أخطاء Production Version التي تسبب فشل MRP أو تكلفة خاطئة

- لا توجد Production Version للمنتج.
- Production Version منتهية.
- تربط BOM خاطئة.
- تربط Routing خاطئ.
- Lot Size Range غير مناسب.
- Cost Estimate يستخدم نسخة مختلفة عن الإنتاج.
- MRP يستخدم نسخة لا تعكس الواقع.

---

## 10. Checklist إعداد MRP

| بند التحقق | الهدف | الخطر إذا لم يتحقق |
|---|---|---|
| MRP Type صحيح | تحديد طريقة التخطيط | لا تخطيط أو تخطيط خاطئ |
| MRP Controller محدد | مسؤولية | Planned Orders غير مراجعة |
| Lot Size Procedure مناسب | كميات مناسبة | دفعات غير عملية |
| Safety Stock محدد عند الحاجة | حماية من النقص | توقف إنتاج |
| Reorder Point واضح عند VB | تخطيط نقطة إعادة الطلب | نقص أو فائض |
| Forecast أو PIR موجود عند الحاجة | MTS | لا طلب مخطط |
| Strategy Group صحيح | MTS/MTO | ربط طلب خاطئ |
| MRP Area واضحة عند الحاجة | نطاق تخطيط | خلط مواقع |
| MRP Live أو Classic MRP واضح | طريقة التشغيل | نتائج غير متوقعة |
| Sources of Demand واضحة | معرفة الطلب | Planned Orders خاطئة |
| Sources of Supply واضحة | معرفة العرض | قرارات خاطئة |
| Dependent Requirements تعمل من BOM Explosion | تخطيط مكونات | نقص مواد |
| Production Version متاحة لـ MRP | اختيار طريقة | فشل MRP |
| MD04 مستخدمة للمراجعة | رقابة | أخطاء لا تظهر |
| Planned Orders تظهر بشكل صحيح | مخرجات إنتاج | لا تنفيذ لاحق |
| Purchase Requisitions تظهر للأصناف الخارجية | توريد خارجي | شراء غير مولد |
| Firming Indicator يستخدم عند الحاجة | تثبيت | MRP يغير قرارات مهمة |
| MRP لا يعدل أوامر تنفيذية بعد التحويل | فصل التخطيط عن التنفيذ | خلط المسؤوليات |

---

## 11. Checklist Planned Orders وتحويلها

| بند التحقق | الهدف | المسؤول | ملاحظات |
|---|---|---|---|
| Planned Orders يتم إنشاؤها من MRP | تخطيط إنتاج | التخطيط |  |
| البيانات الأساسية في Planned Order صحيحة | دقة التحويل | التخطيط |  |
| Basic Start / End Dates صحيحة | جدولة | التخطيط |  |
| Production Version تظهر أو تستخدم عند الحاجة | ربط BOM/Routing | PP |  |
| MRP Controller يراجع Planned Orders | حوكمة | التخطيط |  |
| Firming Indicator يستخدم عند الحاجة | تثبيت | التخطيط |  |
| التحويل إلى Production Order واضح | تنفيذ Discrete | الإنتاج |  |
| التحويل إلى Process Order واضح | تنفيذ Process | الإنتاج |  |
| التحويل إلى Purchase Requisition واضح | شراء خارجي | المشتريات |  |
| التحويل الجماعي أو الفردي واضح | كفاءة | التخطيط |  |
| Planned Orders القديمة تراجع | تنظيف | التخطيط |  |
| المستخدمون يفرقون بين Planned Order وProduction Order | فصل التخطيط عن التنفيذ | ERP |  |

---

## 12. Checklist إعداد Production / Process Orders

| بند التحقق | ما يجب ضبطه؟ | المسؤول | الملاحظات |
|---|---|---|---|
| طريقة إنشاء Production Order محددة | من Planned Order أو يدوي | الإنتاج / التخطيط |  |
| الإنشاء من Planned Order يعمل | Conversion | التخطيط |  |
| الإنشاء اليدوي مضبوط بالصلاحيات | منع فوضى | الإنتاج |  |
| الإنشاء من Sales Order في MTO واضح | ربط MTO | المبيعات / التخطيط |  |
| النظام ينسخ BOM وRouting عند إنشاء الأمر | Snapshot | PP |  |
| Snapshot للأمر مفهوم | منع سوء فهم | ERP / الإنتاج |  |
| Production Version المختارة صحيحة | ربط BOM/Routing | PP / CO |  |
| Order Quantity صحيحة | كمية تنفيذ | الإنتاج |  |
| Basic Dates صحيحة | جدولة | التخطيط |  |
| Scheduling يعمل | تواريخ وعمليات | PP |  |
| Reservations تتولد عند Release | مواد | المستودعات |  |
| Shop Papers / Print جاهزة إذا مطلوبة | تشغيل الورشة | الإنتاج |  |
| Process Order يستخدم Master Recipe عند الحاجة | Process | الإنتاج |  |
| Nonstandard / Rework Orders مضبوطة عند الحاجة | حالات خاصة | الإنتاج / CO | يحتاج تحقق إضافي من المصدر الأصلي |
| صلاحيات تعديل Components أو Operations واضحة | حوكمة | ERP |  |

---

## 13. Checklist حالات Production Order

| الحالة | المسموح | الممنوع | الصلاحية | ملاحظات |
|---|---|---|---|---|
| CRTD | مراجعة وتعديل | GI/Confirmation/GR | الإنتاج / PP | أمر منشأ فقط |
| REL | GI/Confirmation/GR/Print | تنفيذ قبل Release | الإنتاج | بداية التنفيذ |
| PCNF | استكمال التنفيذ | اعتباره مكتملًا | الإنتاج | تأكيد جزئي |
| CNF | GR/TECO حسب الحالة | تأكيد غير منضبط | الإنتاج | تأكيد نهائي |
| PDLV | استلام باقي الكمية | اعتبار التسليم كاملًا | المستودعات | GR جزئي |
| DLV | TECO/Settlement | GR إضافي إلا بسماحية | المستودعات / الإنتاج | GR نهائي |
| TECO | Settlement ومراجعة | حركات تنفيذ إضافية غالبًا | الإنتاج / CO | إغلاق فني |
| CLSD | عرض وتقارير | حركات وتسويات لاحقة | CO/FI | إغلاق نهائي |
| User Status | ضوابط إضافية | حسب الإعداد | ERP | عند الحاجة |
| System Status | التحكم النظامي | تغيير تعريفه | SAP | أساس الدورة |

| من الحالة | إلى الحالة | شرط الانتقال | Validation المطلوب |
|---|---|---|---|
| CRTD | REL | اكتمال البيانات | BOM/Routing/PV/Materials |
| REL | PCNF | تأكيد جزئي | Confirmation صحيح |
| REL/PCNF | CNF | تأكيد نهائي | كميات وأنشطة صحيحة |
| REL/PCNF/CNF | PDLV | GR جزئي | Movement 101 |
| PDLV | DLV | GR كامل | كمية مستلمة |
| DLV/CNF | TECO | انتهاء التنفيذ | مراجعة GI/Confirmation/GR |
| TECO | Settlement | جاهزية مالية | WIP/Variance/COGI/CO1P |
| Settlement | CLSD | إغلاق كامل | لا أخطاء مفتوحة |

---

## 14. Checklist Release

| بند التحقق | الهدف | الخطر إذا لم يتحقق |
|---|---|---|
| Release يدوي أو تلقائي واضح | تحديد التحكم | إطلاق غير مقصود |
| Release لا يتم قبل اكتمال البيانات | منع تنفيذ خاطئ | أوامر غير جاهزة |
| المواد المطلوبة معروفة | جاهزية | توقف إنتاج |
| Missing Parts مراجعة | منع نقص | تعطيل الورشة |
| Reservations تتولد | حجز مواد | استهلاك متضارب |
| Inspection Lot 03 يتولد عند الحاجة | جودة أثناء الإنتاج | غياب فحص |
| Lead Time Scheduling يعمل | تواريخ صحيحة | تأخير |
| Print Shop Papers جاهزة إن مطلوبة | توجيه الورشة | تنفيذ غير موثق |
| الصلاحيات مضبوطة | حوكمة | Release غير مصرح |
| Release لا يتم إذا توجد أخطاء حرجة | منع مخاطر | تنفيذ غير صحيح |
| Release لا يعني أن المواد صرفت فعليًا | توعية | خلط Staging وGI |

---

## 15. Checklist Material Staging / Reservations

| بند التحقق | أثره على التنفيذ | الخطر |
|---|---|---|
| Reservations تتولد بشكل صحيح | حجز مواد للأمر | استخدام نفس المخزون لأكثر من أمر |
| Production Storage Location واضح | موقع إنتاج | ضياع المواد |
| Issue Storage Location صحيح | مصدر الصرف | GI خاطئ |
| Pull List تعمل عند الحاجة | تجهيز مواد | نقص على الخط |
| PSA معرفة | تغذية إنتاج | Kanban/Staging غير مضبوط |
| Material Staging واضح | تحضير قبل الصرف | خلط تجهيز باستهلاك |
| EWM / WM متكامل إن كان مستخدمًا | حركات مستودع صحيحة | ازدواجية أو فشل |
| Missing Parts List متاحة | كشف النقص | توقف إنتاج |
| Warehouse مسؤول عن التجهيز | مسؤولية | تأخير |
| لا يتم الخلط بين تجهيز المواد وصرفها فعليًا | ضبط مالي | WIP خاطئ |

---

## 16. Checklist Goods Issue / Material Consumption

| بند التحقق | أثره المخزني | أثره على WIP/التكلفة | الخطر |
|---|---|---|---|
| Movement Type 261 للصرف | ينقص المواد | يزيد WIP | صرف غير موثق |
| Movement Type 262 للمرتجع | يزيد المواد | يخفض WIP | عدم تصحيح |
| الصرف اليدوي واضح | تحكم يدوي | دقة أعلى | إدخال خاطئ |
| Backflush واضح | صرف تلقائي | WIP تلقائي | COGI |
| الصرف بناءً على Reservation | ارتباط بالأمر | تكلفة صحيحة | صرف عشوائي |
| Storage Location صحيح | موقع صحيح | تكلفة ومخزون صحيح | أرصدة خاطئة |
| Batch / Serial مضبوط | تتبع | تكلفة/جودة | فقدان Traceability |
| Valuation Class صحيحة | GL صحيح | أثر مالي صحيح | حساب خاطئ |
| Price Control مفهوم | تقييم | Standard/Moving | Variance غير مفهومة |
| GI يزيد WIP | لا ينطبق | تكلفة تحت التشغيل | تجاهل WIP |
| GI يحمل تكلفة المواد على الأمر | لا ينطبق | Material Cost | تكلفة ناقصة |
| صرف زائد يراجع | نقص زائد | Variance | استهلاك مبالغ |
| صرف ناقص يراجع | نقص أقل | Variance | إنتاج غير مكتمل |
| مادة بديلة مضبوطة | مادة مختلفة | Variance | تكلفة غير مفسرة |
| COGI يراجع يوميًا | حركات فاشلة | WIP ناقص | إغلاق خاطئ |
| CO1P يراجع | Pending Cost | تكلفة معلقة | Period-End متعطل |
| تدريب معالجة أخطاء الصرف | تصحيح | تكلفة صحيحة | تراكم أخطاء |

---

## 17. Checklist Backflush

| بند التحقق | لماذا مهم؟ | الخطر إذا لم يتحقق |
|---|---|---|
| Backflush مفعل فقط للمواد المناسبة | ليس كل مادة تصلح | صرف خاطئ |
| مضبوط في Material Master عند الحاجة | مصدر إعداد | عدم صرف أو صرف زائد |
| مضبوط في Routing Operation عند الحاجة | توقيت الصرف | COGI |
| مضبوط في Work Center عند الحاجة | يحتاج تحقق إضافي من المصدر الأصلي | إعداد غير واضح |
| لا يستخدم على مواد عالية القيمة دون رقابة | ضبط مالي | فقدان تحكم |
| Batch / Serial مع Backflush مفهوم | تتبع | أخطاء دفعات |
| المخزون كافٍ قبل Confirmation | منع فشل | COGI |
| COGI يراجع بعد Backflush | تصحيح | حركات عالقة |
| CO1P يراجع عند Pending Cost Postings | إغلاق | تكاليف معلقة |
| سياسة تصحيح الأخطاء واضحة | حوكمة | فوضى تصحيح |

---

## 18. Checklist Confirmation

| بند التحقق | لماذا مهم؟ | أثره على التكلفة والانحرافات |
|---|---|---|
| Operation Confirmation محدد | دقة تشغيل | تكلفة عملية |
| Order Header Confirmation محدد | تبسيط | تفاصيل أقل |
| Partial Confirmation مدعوم | تقدم جزئي | PCNF |
| Final Confirmation مدعوم | إكمال | CNF |
| Milestone Confirmation عند الحاجة | تبسيط مراحل | تسجيل تلقائي محتمل |
| Progress Confirmation عند الحاجة | يحتاج تحقق إضافي من المصدر الأصلي | أثر غير محدد |
| Yield Quantity تسجل | كمية جيدة | تقارير وGR |
| Scrap Quantity تسجل | هالك | Scrap Variance |
| Rework Quantity تسجل | إعادة تشغيل | تكلفة إضافية |
| Activity Quantities تسجل | موارد | Activity Cost |
| Setup Time يسجل عند الحاجة | تهيئة | تكلفة ثابتة |
| Machine Time يسجل | آلة | Resource Usage |
| Labor Time يسجل | عمالة | Activity Cost |
| Personnel Number يسجل عند الحاجة | مسؤولية | تحليل أداء |
| Posting Date صحيح | فترة مالية | قيود فترة خاطئة |
| Reason for Variance يسجل | تفسير | تحليل الانحراف |
| Confirmation يحرك Backflush عند الحاجة | صرف تلقائي | GI/WIP |
| Confirmation يحرك Auto GR عند الحاجة | استلام تلقائي | Finished Goods |
| Actual Activity Posting يعمل | تكلفة فعلية | CO |
| إلغاء Confirmation مضبوط | تصحيح | أثر عكسي |
| Confirmation بعد TECO مضبوط | منع أخطاء | حركات بعد الإغلاق |

---

## 19. Checklist Goods Receipt من الإنتاج

| بند التحقق | الهدف | الخطر إذا لم يتحقق |
|---|---|---|
| Movement Type 101 للاستلام | GR صحيح | عدم دخول المنتج |
| Movement Type 102 للإلغاء | عكس GR | تصحيح غير مضبوط |
| GR يدوي أو Auto GR واضح | طريقة | استلام خاطئ |
| Finished Goods Storage Location صحيح | وجهة | مخزون خاطئ |
| Batch / Serial عند الاستلام مضبوط | تتبع | جودة ضعيفة |
| GR جزئي مدعوم | PDLV | متابعة ناقصة |
| PDLV / DLV مفهومة | حالات | إغلاق خاطئ |
| GR يخفض WIP | أثر تكلفة | WIP مبالغ |
| GR يزيد Finished Goods Inventory | مخزون | تقييم خاطئ |
| التقييم حسب Standard أو Moving Average مفهوم | مالية | Variance غير مفهومة |
| Inspection Lot 04 عند الحاجة | جودة | لا فحص |
| Quality Inspection Stock عند الحاجة | منع إتاحة | منتج غير مفحوص |
| Auto GR لا يحدث قبل الجودة عند الخطر | ضبط | إتاحة مبكرة |
| إلغاء GR مضبوط | تصحيح | قيد ومخزون خاطئ |

---

## 20. Checklist Quality Management داخل الإنتاج

| بند التحقق | أثره على الجودة | أثره على المخزون |
|---|---|---|
| QM مطلوب أو غير مطلوب | تحديد النطاق | ضبط Inspection |
| Inspection Type 03 | فحص أثناء الإنتاج | قبل GR |
| Inspection Type 04 | فحص عند GR | Quality Inspection Stock |
| Inspection Lot عند Release | رقابة تشغيلية | لا أثر مباشر |
| Inspection Lot عند GR | فحص منتج نهائي | مخزون تحت الفحص |
| Quality Inspection Stock يعمل | منع الإتاحة | مخزون غير متاح |
| Usage Decision واضح | قبول/رفض | نقل مخزون |
| المنتج لا يتاح قبل الفحص | جودة | منع استخدام خاطئ |
| Batch / Serial مرتبط بالجودة | Traceability | تتبع |
| Batch Where-Used List متاحة | تتبع دفعات | تحقيقات |
| جودة الإنتاج مرتبطة بالهالك أو الرفض | تحليل | Scrap/Reject |
| المسؤوليات واضحة | حوكمة | منع تأخير |

---

## 21. Checklist Process Manufacturing / Process Orders

| بند التحقق | لماذا مهم؟ | الخطر إذا لم يتحقق |
|---|---|---|
| Process Order مطلوب أو لا | اختيار النموذج | استخدام Production Order خطأ |
| Master Recipe موجودة | طريقة تصنيع Process | لا عمليات صحيحة |
| Operations وPhases معرفة | تنفيذ تفصيلي | Confirmation خاطئ |
| Resources معرفة | بديل Work Center | تكلفة وجدولة خاطئة |
| Primary Resource صحيح | مورد رئيسي | تحميل خاطئ |
| Secondary Resources عند الحاجة | موارد مساعدة | تكلفة ناقصة |
| Material List مربوطة بالـ Phase | GI صحيح | صرف بمرحلة خاطئة |
| Batch Management مفعل | تتبع | فقدان Traceability |
| Batch Determination واضح | اختيار دفعات | جودة |
| Co-products / By-products معرفة | مخرجات متعددة | تكلفة خاطئة |
| Apportionment Structure موجودة | توزيع تكلفة | تكلفة غير عادلة |
| PI Sheets أو Process Instructions محددة | تنفيذ | يحتاج تحقق إضافي من المصدر الأصلي |
| Control Recipe محدد | تكامل تحكم | يحتاج تحقق إضافي من المصدر الأصلي |
| Quality Integration قوية | صناعات منظمة | مخاطر جودة |
| Confirmation على Phase واضح | تكلفة دقيقة | Activity Cost خاطئ |

---

## 22. Checklist Repetitive Manufacturing

| بند التحقق | أثره على التنفيذ | أثره على التكلفة |
|---|---|---|
| REM مناسب للعميل | تبسيط التنفيذ | Period Cost |
| Run Schedule Quantities تعمل | إنتاج متكرر | PCC |
| Production Line محدد | خط ثابت | Production Version |
| Rate Routing موجود | تشغيل REM | Activity Cost |
| Product Cost Collector موجود | لا أمر لكل دفعة | WIP/Variance |
| Backflush مضبوط | صرف تلقائي | تكلفة مواد |
| Auto GR مضبوط | استلام تلقائي | Finished Goods |
| Reporting Points عند الحاجة | تقدم | تحليل |
| Period-Based Costing مفهوم | فترة | Settlement |
| WIP على PCC مفهوم | تحت التشغيل | ميزانية |
| Variance على PCC مفهوم | فروقات | تحسين |
| Settlement على PCC واضح | إغلاق | FI/CO |
| الفرق عن Production Order مفهوم | تدريب | منع خلط |

---

## 23. Checklist Kanban

| بند التحقق | الهدف | الخطر |
|---|---|---|
| Kanban مناسب | اختيار Pull | تطبيق غير مناسب |
| PSA معرفة | تغذية | Control Cycle ناقص |
| Control Cycle موجود | ربط مصدر ووجهة | لا تجديد |
| Container Quantity محددة | كمية | نقص/فائض |
| عدد Containers محدد | مستوى مخزون | عدم توازن |
| حالات Full / Empty / In Process / Wait مفهومة | تشغيل | فوضى |
| Replenishment Strategy واضحة | توريد | مصدر خاطئ |
| Trigger عند Empty يعمل | تجديد | نقص |
| المواد مناسبة لـ Kanban | نطاق | مخاطر على مواد حساسة |
| لا يستخدم لمواد عالية المخاطر دون رقابة | حوكمة | فقدان تحكم |

---

## 24. Checklist تكلفة الإنتاج Product Cost Controlling

| بند التحقق | لماذا مهم؟ | أثره المالي | المسؤول |
|---|---|---|---|
| Product Cost by Order محدد | تكلفة الأمر | WIP/Variance على Order | CO |
| Product Cost by Period / PCC محدد | REM | WIP/Variance على PCC | CO |
| Standard Cost Estimate منفذ | تقييم | Standard Price | CO |
| Cost Rollup صحيح | BOM متعددة | تكلفة المنتج | CO |
| Cost Component Split مفهوم | تحليل | مواد/عمل/آلة | CO |
| Costing Variant صحيح | منهج | نتائج تكلفة | CO |
| Valuation Variant صحيح | مصادر أسعار | تقييم | CO/FI |
| Costing Type واضح | نوع احتساب | يحتاج تحقق إضافي | CO |
| Quantity Structure صحيحة | BOM/Routing/PV | تكلفة واقعية | PP/CO |
| Cost Element واضح | تصنيف | تحليل CO | CO |
| Activity Allocation يعمل | تحميل موارد | Actual Cost | CO |
| Overhead Costing Sheet عند الحاجة | تكاليف غير مباشرة | Overhead | CO |
| Planned Cost يظهر | مرجع | مقارنة | CO |
| Actual Cost يتجمع | تنفيذ | WIP/Variance | CO |
| WIP Calculation واضح | تحت التشغيل | ميزانية | CO/FI |
| Variance Calculation واضح | فروقات | تحسين | CO |
| Settlement Procedure واضح | تسوية | FI/COPA | CO/FI |
| Result Analysis عند الحاجة | تحليل | يحتاج تحقق إضافي | CO |
| Event-Based Production Cost Posting مفهوم | توقيت | Universal Journal | CO/FI |
| Universal Journal يعكس الأثر المالي | FI/CO | مطابقة | FI |
| المالية وافقت على سياسة التكلفة | قبول | منع اعتراض | FI/CO |

---

## 25. Checklist WIP

| بند التحقق | الأثر المالي | ملاحظات المحاسبة |
|---|---|---|
| WIP مفهوم | تحديد تحت التشغيل | يجب شرحه للإنتاج والمالية |
| WIP يزيد عند GI | Material Cost | مرتبط بالمواد |
| WIP يزيد عند Confirmation | Activity Cost | مرتبط بالموارد |
| WIP ينخفض عند GR | Finished Goods | حسب التقييم |
| WIP Calculation في Period-End | ميزانية | إجراء إغلاق |
| WIP at Actual Cost مفهوم | Actual WIP | يحتاج إعداد |
| WIP at Target Cost مفهوم | Target WIP | يحتاج تحقق إضافي من المصدر الأصلي |
| WIP على Order أو PCC واضح | كائن تكلفة | حسب السيناريو |
| WIP Report موجود | رقابة | متابعة شهرية |
| أوامر مفتوحة تراجع | منع تراكم | CO/Production |
| WIP لا يبقى دون Settlement | تسوية | منع أرقام عالقة |
| المالية تراجع WIP | اعتماد | FI/CO |

---

## 26. Checklist Variance

| نوع الانحراف | هل تمت مراجعته؟ | من يراجعه؟ | القرار المطلوب |
|---|---|---|---|
| Input Quantity Variance |  | الإنتاج / CO | مراجعة BOM أو GI |
| Input Price Variance |  | CO / المشتريات | مراجعة الأسعار |
| Resource Usage Variance |  | الإنتاج / CO | مراجعة Routing |
| Resource Price Variance |  | CO | مراجعة KP26 |
| Scrap Variance |  | الجودة / الإنتاج | مراجعة الهالك |
| Lot Size Variance |  | CO / التخطيط | مراجعة Lot Size |
| Remaining Variance |  | CO | تحليل تفصيلي |
| Reason for Variance في Confirmation |  | الإنتاج | تحسين التفسير |
| Variance لتحسين BOM |  | الهندسة | تحديث BOM |
| Variance لتحسين Routing |  | الإنتاج | تحديث Routing |
| Variance لتحسين Activity Rates |  | CO | تحديث KP26 |
| حدود الانحراف المقبولة |  | الإدارة / CO | سياسات مراقبة |

---

## 27. Checklist Settlement / Period-End Closing

| بند التحقق | لماذا مهم؟ | الخطر إذا لم يتحقق |
|---|---|---|
| Settlement Procedure واضح | نقل الأثر المالي | WIP/Variance عالق |
| Settlement Rule موجودة | تحديد المستقبل | تسوية خاطئة |
| Settlement Receiver واضح | Material/COPA/FI | أثر مالي خاطئ |
| Settlement Profile واضح | ضبط التسوية | أخطاء Period-End |
| WIP Calculation قبل Settlement عند الحاجة | ترتيب | WIP غير صحيح |
| Variance Calculation يتم | تحليل | فروقات غير معروفة |
| Settlement إلى FI / COPA واضح | تكامل مالي | غياب الربحية |
| Universal Journal يعكس الأثر | مطابقة | FI/CO غير متطابق |
| TECO قبل Settlement عند الحاجة | إغلاق فني | أوامر نشطة |
| CLSD لا يتم قبل Settlement | منع إغلاق مبكر | لا تصحيح |
| COGI Errors معالجة | حركات مواد | مخزون خاطئ |
| CO1P معالجة | تكاليف معلقة | إغلاق ناقص |
| Orders المفتوحة مراجعة | WIP | تراكم |
| Orders TECO غير المسواة مراجعة | تسوية | أرقام عالقة |
| Production-to-FI Reconciliation متاحة | ثقة | عدم مطابقة |
| Period-End Closing مختبر | جاهزية | فشل أول إغلاق |
| المالية مسؤولة عن الاعتماد | حوكمة | رفض النتائج |

---

## 28. Checklist TECO / CLSD

| بند التحقق | TECO | CLSD | ملاحظات |
|---|---|---|---|
| متى يستخدم؟ | عند اكتمال التنفيذ فنيًا | بعد التسوية والمعالجة | لا يخلط بينهما |
| من يملك الصلاحية؟ | الإنتاج / CO | CO/FI | يجب ضبط الصلاحيات |
| ماذا يحدث للـ Reservations؟ | تحرير المتبقي | لا حركات | مهم للتخطيط |
| هل يسمح بالتسوية؟ | نعم/يمهد لها | لا Re-settlement عادة | حسب المقال |
| أوامر TECO دون Settlement | يجب مراجعتها | غير مقبول | تقرير مطلوب |
| هل يمنع الحركات؟ | غالبًا يقيّد | يمنع | تحقق من الإعداد |
| هل تم Settlement قبل CLSD؟ | لا ينطبق | يجب | شرط Go-Live |
| هل تم حل COGI / CO1P قبل CLSD؟ | يجب قبل الإغلاق النهائي | يجب | منع أخطاء عالقة |
| هل تم اعتماد المالية قبل CLSD؟ | مفضل | مطلوب | حوكمة |

---

## 29. Checklist التقارير والرقابة

| التقرير | المستخدم | الغرض | هل مطلوب قبل Go-Live؟ |
|---|---|---|---|
| MD04 | التخطيط | مراجعة الطلب والعرض | نعم |
| COOIS | الإنتاج / CO | متابعة أوامر الإنتاج | نعم |
| Production Order Status Report | الإنتاج | متابعة الحالات | نعم |
| Missing Parts List | المستودعات / الإنتاج | كشف نقص المواد | نعم |
| Dispatch List | الورشة | توجيه العمل | حسب الحاجة |
| Capacity Load Report | التخطيط | متابعة الطاقة | حسب الحاجة |
| COGI | الإنتاج / المستودعات | أخطاء Backflush | نعم |
| CO1P | CO / ERP | Pending Cost Postings | نعم |
| Order Cost Display | CO | تكلفة الأمر | نعم |
| Cost Analysis | CO / الإدارة | تحليل التكلفة | نعم |
| WIP Report | FI/CO | WIP | نعم |
| Variance Report | CO / الإنتاج | الانحرافات | نعم |
| Settlement Report | FI/CO | التسوية | نعم |
| Batch Where-Used List | الجودة | تتبع دفعات | عند Batch |
| Inspection Lot Report | الجودة | متابعة الفحص | عند QM |
| Production-to-FI Reconciliation | FI/CO | مطابقة مالية | نعم |
| Product Cost Collector Reports | CO | REM | عند REM |
| Kanban Board / Control Cycle Reports | الإنتاج | Kanban | عند Kanban |

---

## 30. Checklist UAT لاختبار دورة إنتاج كاملة

| خطوة الاختبار | النتيجة المتوقعة | القسم المعتمد | تم/لم يتم |
|---|---|---|---|
| إعداد Material Master | بيانات صحيحة ومكتملة | PP/FI/CO |  |
| إعداد BOM | مكونات وكميات صحيحة | الإنتاج / الهندسة |  |
| إعداد Routing | عمليات وWork Centers | الإنتاج |  |
| إعداد Work Center وCost Center وActivity Type | Activity Cost يعمل | CO |  |
| إعداد Production Version | BOM/Routing مربوطان | PP/CO |  |
| تنفيذ MRP | Planned Orders صحيحة | التخطيط |  |
| إنشاء Planned Order | تواريخ وكمية صحيحة | التخطيط |  |
| تحويل Planned Order إلى Production Order | Order صحيح | الإنتاج |  |
| Release | حالة REL وReservations | الإنتاج |  |
| Material Staging / Reservation | مواد جاهزة | المستودعات |  |
| Goods Issue | 261 وصرف صحيح | المستودعات / CO |  |
| Backflush | صرف تلقائي أو COGI عند الفشل | الإنتاج / المستودعات |  |
| Confirmation | Yield/Scrap/Activity | الإنتاج / CO |  |
| Goods Receipt | 101 وزيادة FG | المستودعات |  |
| Quality Inspection | Inspection Lot / UD | الجودة |  |
| TECO | إغلاق فني | الإنتاج / CO |  |
| WIP Calculation | WIP صحيح | CO/FI |  |
| Variance Calculation | Variance ظاهرة | CO |  |
| Settlement | أثر مالي منتقل | FI/CO |  |
| CLSD | إغلاق نهائي | CO/FI |  |
| معالجة COGI | لا أخطاء عالقة | ERP |  |
| معالجة CO1P | لا تكاليف عالقة | CO |  |
| مراجعة Universal Journal / FI | FI/CO مطابق | FI |  |
| التقارير | تقارير تعمل | الإدارة |  |

---

## 31. Checklist ما قبل Go-Live

| البند | الحالة | الملاحظات | قرار Go/No-Go |
|---|---|---|---|
| Material Master جاهز |  |  |  |
| BOMs معتمدة |  |  |  |
| Routings جاهزة |  |  |  |
| Work Centers جاهزة |  |  |  |
| Cost Centers وActivity Rates جاهزة |  |  |  |
| Production Versions صحيحة |  |  |  |
| MRP مختبر |  |  |  |
| Production Order Cycle مختبرة |  |  |  |
| GI / Backflush مختبر |  |  |  |
| Confirmation مختبر |  |  |  |
| GR مختبر |  |  |  |
| QM مختبر عند الحاجة |  |  |  |
| WIP مفهوم |  |  |  |
| Variance مفهوم |  |  |  |
| Settlement مختبر |  |  |  |
| TECO / CLSD Policy واضحة |  |  |  |
| COGI / CO1P Monitoring جاهز |  |  |  |
| التقارير جاهزة |  |  |  |
| UAT مكتمل |  |  |  |
| المستخدمون مدربون |  |  |  |
| المالية شاركت واعتمدت السيناريو |  |  |  |
| خطة دعم ما بعد التشغيل جاهزة |  |  |  |

---

## 32. Checklist ما بعد Go-Live

| البند | متى تتم مراجعته؟ | المسؤول | الإجراء |
|---|---|---|---|
| أول MRP Run | اليوم الأول/الدورة الأولى | التخطيط | مقارنة MD04 |
| أول Planned Orders | بعد MRP | التخطيط | مراجعة الكميات والتواريخ |
| أول Production Orders | عند الإنشاء | الإنتاج | التحقق من BOM/Routing |
| أول Release | قبل التنفيذ | الإنتاج | مراجعة Reservations |
| أول GI | أثناء التنفيذ | المستودعات | مراجعة 261 |
| أول Backflush | بعد Confirmation | ERP/المستودعات | مراجعة COGI |
| COGI يوميًا | يوميًا | ERP/المستودعات | تصحيح |
| CO1P يوميًا | يوميًا | CO | تصحيح |
| أول Confirmations | أثناء التشغيل | الإنتاج / CO | مراجعة Activity |
| أول GR | عند الاستلام | المستودعات | مراجعة 101 |
| أول Quality Inspection | عند الفحص | الجودة | Usage Decision |
| أول TECO | عند انتهاء أمر | الإنتاج / CO | مراجعة قبل التسوية |
| أول WIP Calculation | أول Period-End | CO/FI | مراجعة WIP |
| أول Variance Calculation | أول Period-End | CO | تحليل |
| أول Settlement | أول Period-End | FI/CO | تحقق |
| أول CLSD | بعد التسوية | CO/FI | اعتماد |
| Universal Journal / FI | بعد الحركات | FI | مطابقة |
| تقارير الإنتاج والتكلفة | أسبوعيًا/شهريًا | الإدارة | قرارات |
| تدريب إضافي | عند تكرار الأخطاء | ERP | معالجة فجوات |

---

## 33. أهم مخاطر فشل تطبيق الإنتاج في SAP

| الخطر | أثره | كيف نمنعه؟ |
|---|---|---|
| Material Master غير مكتمل | MRP وتكلفة خاطئة | Data readiness |
| MRP Type خاطئ | Planned Orders خاطئة | مراجعة التخطيط |
| BOM خاطئة | صرف وتكلفة خاطئة | اعتماد BOM |
| Routing خاطئ | تكلفة وجدولة خاطئة | مراجعة عمليات |
| Production Version غير صحيحة | MRP/Costing خاطئ | PV checklist |
| Work Center بدون Cost Center | Activity Cost مفقودة | ربط CO |
| Activity Rates غير محدثة | تكلفة موارد خاطئة | KP26 |
| MRP ينتج توصيات خاطئة | إنتاج/شراء خاطئ | مراجعة MD04 |
| Backflush يفشل | COGI | مراقبة يومية |
| COGI غير معالج | مخزون غير صحيح | مسؤولية واضحة |
| CO1P غير معالج | تكلفة معلقة | Period-End checklist |
| Confirmation خاطئ | Actual Cost خاطئة | تدريب وضبط |
| Auto GR قبل الجودة | منتج غير مفحوص | QM controls |
| TECO مبكر | إغلاق فني خاطئ | صلاحيات |
| Settlement غير منفذ | WIP/Variance عالق | CO closing |
| CLSD قبل التسوية | منع التصحيح | شرط اعتماد |
| WIP غير مراجع | ميزانية غير دقيقة | WIP Report |
| Variance غير مفهوم | تحسين مفقود | تحليل شهري |
| المالية غير مشاركة | رفض الأرقام | إشراك FI/CO |
| UAT لا يغطي دورة كاملة | فشل Go-Live | End-to-end UAT |

---

## 34. نموذج مختصر لقائمة تطبيق الإنتاج

| رقم | بند التحقق | نعم/لا | ملاحظات |
|---:|---|---|---|
| 1 | Material Master مكتمل |  |  |
| 2 | MRP Views مكتملة |  |  |
| 3 | Accounting Views صحيحة |  |  |
| 4 | Costing Views صحيحة |  |  |
| 5 | Valuation Class صحيحة |  |  |
| 6 | Price Control مناسب |  |  |
| 7 | BOM موجودة لكل منتج |  |  |
| 8 | BOM معتمدة |  |  |
| 9 | Component Quantities صحيحة |  |  |
| 10 | BOM Validity صحيحة |  |  |
| 11 | Routing موجود |  |  |
| 12 | Operations صحيحة |  |  |
| 13 | Work Centers معرفة |  |  |
| 14 | Work Centers مربوطة بـ Cost Centers |  |  |
| 15 | Activity Types معرفة |  |  |
| 16 | KP26 محدثة |  |  |
| 17 | Production Version موجودة |  |  |
| 18 | Production Version تربط BOM/Routing |  |  |
| 19 | MRP يعمل |  |  |
| 20 | MD04 مراجع |  |  |
| 21 | Planned Orders صحيحة |  |  |
| 22 | Conversion يعمل |  |  |
| 23 | Production Order Creation يعمل |  |  |
| 24 | Release يعمل |  |  |
| 25 | Reservations تتولد |  |  |
| 26 | Material Staging واضح |  |  |
| 27 | GI 261 مختبر |  |  |
| 28 | GI 262 مختبر |  |  |
| 29 | Backflush مختبر |  |  |
| 30 | COGI مراقب |  |  |
| 31 | CO1P مراقب |  |  |
| 32 | Confirmation مختبر |  |  |
| 33 | Activity Posting يعمل |  |  |
| 34 | Scrap يسجل عند الحاجة |  |  |
| 35 | GR 101 مختبر |  |  |
| 36 | GR 102 مختبر |  |  |
| 37 | QM مختبر |  |  |
| 38 | Inspection Lot يعمل |  |  |
| 39 | TECO Policy واضحة |  |  |
| 40 | WIP Calculation مختبر |  |  |
| 41 | Variance Calculation مختبر |  |  |
| 42 | Settlement مختبر |  |  |
| 43 | CLSD Policy واضحة |  |  |
| 44 | Universal Journal مطابق |  |  |
| 45 | Reports جاهزة |  |  |
| 46 | UAT End-to-End مكتمل |  |  |
| 47 | المستخدمون مدربون |  |  |
| 48 | المالية اعتمدت السيناريو |  |  |
| 49 | خطة دعم Go-Live جاهزة |  |  |
| 50 | قرار Go/No-Go موثق |  |  |

---

## 35. الدروس المستفادة لنظام ERP محلي مثل ناتج

| بند من SAP | كيف نستفيد منه في ERP محلي؟ | الأولوية |
|---|---|---|
| Material Master | فصل بيانات التخطيط والتكلفة والمخزون | حرجة |
| BOM | مكونات وكميات وسريان واعتماد | حرجة |
| Routing | عمليات ومراكز عمل | عالية |
| Work Center + Cost Center | ربط التشغيل بالتكلفة | عالية |
| Activity Rates | تكلفة عمالة/آلة | متوسطة إلى عالية |
| Production Version | ربط BOM وRoute دون تعقيد SAP كامل | عالية |
| MRP | تخطيط احتياجات | حسب حجم العميل |
| Planned Order vs Production Order | فصل التخطيط عن التنفيذ | عالية |
| GI / Confirmation / GR | أحداث منفصلة واضحة | حرجة |
| Backflush | خيار وليس إجبارًا | متوسطة |
| COGI / CO1P | تقارير أخطاء حركات وتكاليف معلقة | عالية |
| WIP | متابعة إنتاج تحت التشغيل | عالية |
| Variance | تحليل فروقات | متوسطة إلى عالية |
| Settlement | إغلاق تكلفة الأمر | حرجة |
| TECO / CLSD | فصل الإغلاق الفني والنهائي | عالية |
| UAT كامل | اختبار دورة من التخطيط للمالية | حرجة |

### تمييز نوع المشكلة

| نوع المشكلة | مثال | طريقة التعامل |
|---|---|---|
| مشكلة إعدادات | Production Version خاطئة | تصحيح Configuration/Master Data |
| مشكلة تدريب | Confirmation خاطئ | تدريب وإجراءات |
| مشكلة تطوير | تقرير غير موجود | تطوير أو تقرير مخصص |
| مشكلة تشغيلية | مواد غير جاهزة | تحسين Staging / MRP |
| مشكلة مالية | Settlement غير منفذ | Period-End Procedure |

---

## 36. ملخص تنفيذي

تطبيق الإنتاج في SAP لا ينجح بمجرد تشغيل **Production Order**.  
النجاح يعتمد على جاهزية:

- Material Master.
- BOM.
- Routing.
- Work Centers.
- Cost Centers.
- Activity Types.
- Production Version.
- MRP.
- GI / Backflush.
- Confirmation.
- GR.
- Quality.
- WIP.
- Variance.
- Settlement.
- TECO / CLSD.
- Reports.
- UAT.

يجب أن يغطي UAT دورة كاملة من **MRP حتى Settlement**.  
لا يجب تنفيذ Go-Live قبل اعتماد الإنتاج والمستودعات والمالية.  
COGI وCO1P وSettlement من أهم نقاط الرقابة.  
TECO وCLSD يجب أن يكونا مفهومين بوضوح.  
Checklist التطبيق هي أداة لتقليل المخاطر وتحويل المعرفة النظرية إلى تنفيذ قابل للقياس.
