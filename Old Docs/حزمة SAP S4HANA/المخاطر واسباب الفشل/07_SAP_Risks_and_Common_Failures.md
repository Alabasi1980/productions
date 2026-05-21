# 07_SAP_Risks_and_Common_Failures.md
# مخاطر وفشل تطبيق نظام الإنتاج في SAP S/4HANA Manufacturing / PP

## 1. مقدمة

تطبيق الإنتاج في **SAP S/4HANA Manufacturing / PP** حساس لأنه لا يربط شاشة إنتاج فقط، بل يربط منظومة كاملة تشمل التخطيط MRP، البيانات الأساسية Master Data، BOM وRouting، Production Version، تنفيذ Production Order، حركات المخزون GI / GR، Confirmation، الجودة، WIP، Variance، Settlement، Universal Journal، وPeriod-End Closing.

فشل الإنتاج في SAP لا يظهر غالبًا كخطأ شاشة فقط، بل يظهر على شكل مؤشرات تشغيلية ومالية مثل: MRP ينتج أوامر خاطئة، Production Orders بحالات غير مضبوطة، COGI Errors كثيرة، CO1P Pending Postings، WIP غير دقيق، Variance عالية وغير مفسرة، Settlement غير منفذ، TECO / CLSD يستخدمان بشكل خاطئ، والمالية لا تثق بأرقام الإنتاج.

هذا الملف يحول دراسة SAP Manufacturing / PP إلى مرجع عملي لفهم المخاطر، أسبابها، أثرها، وطريقة الوقاية منها.

---

## 2. خريطة المخاطر حسب دورة SAP Manufacturing

| المرحلة | الخطر الرئيسي | الأثر المحتمل |
|---|---|---|
| Master Data | بيانات غير مكتملة أو غير محكومة | فشل التخطيط والتنفيذ والتكلفة |
| Material Master | MRP / Accounting / Costing Views غير صحيحة | أوامر خاطئة وتقييم مالي غير موثوق |
| BOM | مكونات أو كميات أو صلاحيات خاطئة | MRP وصرف وتكلفة خاطئة |
| Routing | عمليات أو أزمنة أو Work Centers غير دقيقة | جدولة وتكلفة Activity خاطئة |
| Work Centers / Cost Centers / Activity Types | ربط تكلفة ناقص أو Activity Rates غير محدثة | Actual Cost وVariance غير دقيقة |
| Production Version | غياب أو ربط خاطئ بين BOM وRouting | MRP وCosting وOrder Creation خاطئة |
| MRP | MRP Type أو Strategy أو BOM/PV خاطئة | Planned Orders غير منطقية |
| Planned Orders | أوامر قديمة أو غير محولة أو مثبتة خطأ | تخطيط غير قابل للتنفيذ |
| Production / Process Order Creation | إنشاء أمر من Master Data خاطئة | Snapshot غير صحيح |
| Release | إطلاق أمر قبل الجاهزية | توقف إنتاج أو صرف خاطئ |
| Material Staging / Reservations | مواد غير مجهزة أو محجوزة خطأ | تأخير ونقص |
| Goods Issue | صرف خاطئ أو زائد أو ناقص | مخزون وWIP وتكلفة خاطئة |
| Backflush | صرف تلقائي غير مراقب | COGI ومخزون غير دقيق |
| Confirmation | تسجيل وقت أو كمية أو Scrap خطأ | Activity Cost وVariance خاطئة |
| Goods Receipt | استلام مبكر أو خاطئ | Finished Goods وWIP غير صحيحين |
| Quality | فحص غير مضبوط | إتاحة منتج غير مفحوص |
| TECO | استخدامه كإغلاق مالي | Settlement ناقص |
| WIP Calculation | WIP غير محسوب أو غير مراجع | ميزانية غير دقيقة |
| Variance Calculation | Variance غير محسوبة أو غير مفسرة | ضعف تحسين BOM/Routing |
| Settlement | تسوية غير منفذة أو خاطئة | WIP/Variance عالق |
| CLSD | إغلاق نهائي قبل المعالجة | منع التصحيح |
| Universal Journal / FI / CO | عدم مطابقة الإنتاج والمالية | فقدان الثقة بالأرقام |
| Period-End Closing | إغلاق دون معالجة COGI/CO1P/WIP | تأخير وأرقام خاطئة |
| Reports | تقارير لا تقود إلى قرار | ضعف رقابة |
| UAT / Go-Live | اختبار غير كامل أو Go-Live مبكر | فشل تشغيل فعلي |

---

## 3. مخاطر Master Data العامة

| الخطر | سبب ظهوره | أثره على الإنتاج | أثره على المخزون | أثره المالي | طريقة الوقاية |
|---|---|---|---|---|---|
| Master Data غير مكتملة | عدم وجود checklist قبل التطبيق | أوامر غير صحيحة | مواقع وكميات خاطئة | تكلفة غير دقيقة | مراجعة جاهزية البيانات |
| Plant غير صحيح | إعداد تنظيمي خاطئ | إنتاج في موقع غير مناسب | أرصدة في Plant خطأ | FI/CO غير مطابق | اعتماد Plant structure |
| Storage Location غير واضح | عدم تحديد مواقع التخزين | تأخير في التنفيذ | GI/GR من مواقع خاطئة | تقييم مخزون خاطئ | توثيق مواقع التخزين |
| Production Storage Location غير محدد | نقص Material Master أو BOM | صرف غير منضبط | مواد تخرج من موقع غير صحيح | WIP غير دقيق | تحديد الموقع قبل Go-Live |
| PSA غير معرفة | عدم ضبط Material Staging أو Kanban | نقص على الخط | ضعف تغذية الإنتاج | أثر غير مباشر | تعريف PSA عند الحاجة |
| Batch / Serial غير مضبوط | عدم تفعيل التتبع | ضعف Traceability | دفعات غير قابلة للتتبع | أثر جودة وتكلفة | ضبط Batch/Serial |
| بيانات غير متزامنة بين الإنتاج والمستودعات والمالية | كل قسم يعمل بمعزل | تنفيذ لا يعكس الواقع | مخزون غير موثوق | FI/CO غير مقبول | ورش مشتركة بين PP/MM/FI/CO |
| تغييرات غير محكومة في البيانات الأساسية | عدم استخدام حوكمة تغيير | تغييرات تفاجئ الإنتاج | صرف خاطئ | Cost Estimate غير مستقر | Change governance |
| عدم وجود مسؤول واضح لاعتماد البيانات | غياب ownership | تأخير وفوضى | بيانات متضاربة | أرقام غير معتمدة | تحديد Data Owner |
| الاعتماد على Excel بدل البيانات الرسمية | ضعف ثقة بالنظام | تشغيل خارج SAP | أرصدة غير محدثة | مالية لا تطابق | منع التشغيل الموازي غير المنضبط |

---

## 4. مخاطر Material Master

| الخطر | كيف يظهر؟ | أثره على MRP | أثره على Production Order | أثره المالي | طريقة الوقاية |
|---|---|---|---|---|---|
| Material Type خاطئ | صنف خام كمنتج أو العكس | تخطيط غير مناسب | أمر غير صحيح | تقييم خاطئ | مراجعة أنواع المواد |
| Base UoM غير صحيح | كميات غير منطقية | احتياجات خاطئة | صرف أو إنتاج خاطئ | تكلفة وحدة خاطئة | اعتماد UoM |
| MRP Views غير مكتملة | MRP لا يعمل | لا Planned Orders أو خاطئة | لا أوامر صحيحة | أثر غير مباشر | استكمال MRP Views |
| Work Scheduling View غير مكتملة | نقص إعداد التنفيذ | تواريخ غير دقيقة | Release/Auto GR غير مضبوط | أثر غير مباشر | مراجعة Work Scheduling |
| QM View غير مضبوطة | لا Inspection عند الحاجة | لا أثر مباشر | جودة غير مفعلة | منتج غير مفحوص | ضبط QM View |
| Accounting View غير صحيحة | Valuation ناقص | لا أثر مباشر | تقييم غير صحيح | GL خاطئ | اعتماد FI |
| Costing View غير صحيحة | Cost Estimate غير صحيح | لا أثر مباشر | Planned Cost خاطئة | Standard Cost غير موثوق | اعتماد CO |
| MRP Type خاطئ | PD/VB/VV/ND غير مناسب | توصيات خاطئة | أمر غير مناسب | مخزون وتكلفة | مراجعة التخطيط |
| Procurement Type خاطئ | شراء بدل تصنيع أو العكس | Supply Proposal خطأ | لا Production Order عند الحاجة | تكلفة توريد خاطئة | مراجعة Procurement |
| Strategy Group غير مناسب | MTS/MTO خاطئ | طلب غير صحيح | أمر لا يرتبط بالطلب الصحيح | مخزون أو تكلفة طلب خاطئة | تحديد استراتيجية |
| Production Storage Location غير محدد | GI/GR بلا موقع واضح | لا أثر مباشر | صرف غير مضبوط | WIP ومخزون خاطئ | تحديد الموقع |
| Backflush Indicator غير مضبوط | صرف تلقائي غير مناسب | لا أثر مباشر | COGI | تكلفة ناقصة أو خاطئة | مراجعة Backflush |
| Repetitive Manufacturing Flag غير مفعّل عند الحاجة | REM لا يعمل | لا RSQ مناسب | تنفيذ غير مناسب | PCC غير مستخدم | ضبط REM flag |
| Valuation Class خاطئة | حسابات غير صحيحة | لا أثر مباشر | لا أثر تشغيلي | GL خاطئ | FI validation |
| Price Control غير مناسب | S أو V غير مناسب | لا أثر مباشر | تفسير GR مختلف | Variance أو valuation غير متوقع | سياسة تقييم |
| Standard Price غير محدث | تكلفة قديمة | لا أثر مباشر | Planned/GR غير منطقي | Variance عالية | تحديث Standard Cost |
| Moving Average Price غير مفهوم | تقييم يتحرك | لا أثر مباشر | مستخدمون لا يفهمون الأثر | تحليل مالي خاطئ | تدريب FI/CO |
| Costing Lot Size غير صحيح | تكلفة وحدة غير واقعية | لا أثر مباشر | Planned Cost غير مناسب | Lot Size Variance | ضبط Costing Lot Size |
| With Quantity Structure غير مفعل عند الحاجة | Cost لا يستخدم BOM/Routing | لا أثر مباشر | Planned Cost ناقصة | Standard Cost غير صحيح | تفعيل عند الحاجة |

### أعراض فشل Material Master بعد Go-Live

- MRP لا ينتج توصيات صحيحة.
- أوامر إنتاج خاطئة.
- مواد لا تُصرف من الموقع الصحيح.
- تكلفة المنتج غير منطقية.
- أخطاء تقييم مخزون.
- COGI متكرر.
- المستخدمون يعودون إلى Excel.

---

## 5. مخاطر BOM

| الخطر | كيف يظهر؟ | أثره على MRP | أثره على الصرف | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|---|
| BOM غير موجودة | منتج بلا مكونات | لا Dependent Requirements | لا مكونات للصرف | لا Cost Rollup | إنشاء BOM |
| BOM غير موثقة | معرفة الموظفين فقط | تخطيط غير موثوق | صرف يدوي عشوائي | تكلفة غير موثوقة | توثيق واعتماد |
| BOM Status غير مناسب | BOM غير released | MRP قد لا يستخدمها | أمر غير صحيح | Costing غير معتمد | ضبط status |
| BOM Usage غير مناسب | BOM تكلفة بدل إنتاج أو العكس | Explosion خاطئ | Components خطأ | Cost Estimate خطأ | مراجعة Usage |
| Base Quantity غير صحيحة | نسب مكونات خاطئة | احتياجات خاطئة | صرف خاطئ | تكلفة وحدة خاطئة | اعتماد الكمية |
| Component Quantity خاطئة | مكونات زائدة/ناقصة | طلب مواد خطأ | GI خطأ | Variance | مراجعة BOM |
| UoM خاطئة | تحويلات خطأ | احتياجات غير منطقية | صرف غير صحيح | تكلفة خاطئة | ضبط UoM |
| Alternative BOM غير مضبوطة | بدائل بلا اختيار | MRP يختار خطأ | مواد خطأ | تكلفة بديلة خاطئة | ربط بـ PV |
| Validity Dates غير صحيحة | نسخة قديمة/مستقبلية | تخطيط غير صحيح | أمر غير صحيح | تكلفة تاريخية خاطئة | مراجعة الصلاحية |
| Component Scrap غير معرف | فاقد غير محسوب | احتياج ناقص | صرف زائد لاحقًا | Variance | تعريف Scrap |
| Assembly Scrap غير معرف | فاقد المنتج غير محسوب | طلب أقل من اللازم | إنتاج ناقص | Target Cost خطأ | قياس الفاقد |
| Operation Scrap غير معرف | فاقد مرحلة غير محسوب | غير مباشر | استهلاك مرحلة خاطئ | Variance | ضبط على العملية |
| Phantom Item غير مفهوم | تجميع غير مفسر | Explosion غير متوقع | مكونات تظهر مباشرة | Cost Rollup مختلف | تدريب وضبط |
| Co-products / By-products غير مضبوطة | مخرجات مشتركة غير معروفة | Process غير صحيح | GR غير واضح | توزيع تكلفة خاطئ | Apportionment |
| Apportionment Structure غير موجودة | Co-products بلا توزيع | لا أثر مباشر | لا أثر مباشر | تكلفة غير عادلة | إعدادها عند الحاجة |
| Issue Storage Location غير صحيح | مصدر صرف خطأ | لا أثر مباشر | GI من موقع خطأ | WIP/مخزون خاطئ | مراجعة BOM items |
| Operation Assignment غير موجود | مكونات بلا مرحلة | توقيت احتياج خاطئ | صرف في وقت غير مناسب | استهلاك غير مرتبط | Component Allocation |
| Change Master غير مستخدم | تغييرات بلا أثر رسمي | MRP مفاجئ | مكونات تتغير دون ضبط | Cost Estimate غير مستقر | حوكمة تغيير |
| BOM المستخدمة في التكلفة تختلف عن الواقع | تكلفة نظرية | MRP قد يكون صحيحًا أو خاطئًا | تنفيذ يخالف التكلفة | Variance مستمرة | مواءمة BOM التشغيلية والتكلفة |

### لماذا BOM الخاطئة في SAP أخطر من مجرد خطأ مواد؟

BOM الخاطئة تؤثر على MRP وPlanned Orders وProduction Orders وGI وStandard Cost وWIP وVariance وSettlement. إذا كان أصل المكونات أو الكميات أو صلاحيات الاستخدام خاطئًا، فإن النظام سينتج دورة متكاملة لكنها مبنية على بيانات غير صحيحة.

---

## 6. مخاطر Routing / Operations

| الخطر | أثره على التنفيذ | أثره على الجدولة | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| Routing غير موجود | لا توجد خطوات تنفيذ | لا Scheduling | لا Activity Cost | إعداد Routing |
| Routing لا يعكس الواقع | الورشة تعمل بخلاف النظام | تواريخ غير واقعية | Variance | مراجعة ميدانية |
| Operations ناقصة | مراحل غير مسجلة | Lead Time ناقص | تكلفة ناقصة | توثيق العمليات |
| Operation Sequence غير صحيح | ترتيب تنفيذ خاطئ | جدولة خطأ | تكلفة مرحلة خطأ | مراجعة التسلسل |
| Work Center غير صحيح | تنفيذ في مركز خطأ | Capacity خطأ | Cost Center خطأ | اعتماد Work Center |
| Control Key غير مناسب | Confirmation/Costing خاطئ | سلوك العملية خاطئ | عملية لا تكلف أو تكلف خطأ | مراجعة Control Key |
| Standard Values غير دقيقة | وقت تنفيذ غير منطقي | Lead Time خطأ | Activity Cost خطأ | قياس الوقت |
| Setup Time غير دقيق | تهيئة غير واقعية | جدولة خطأ | Lot Size Variance | تحديث الوقت |
| Machine Time غير دقيق | حمل آلة خطأ | Capacity خطأ | Resource Usage Variance | مراجعة الإنتاج |
| Labor Time غير دقيق | عمالة غير محسوبة | تخطيط موارد خطأ | Labor Cost خطأ | قياس وتدريب |
| Queue / Wait / Move غير واقعية | انتظار ونقل غير صحيح | تواريخ خاطئة | أثر غير مباشر | مراجعة أرضية |
| Component Allocation غير مضبوط | صرف في مرحلة خطأ | توقيت خطأ | استهلاك غير مرتبط | ربط المكونات |
| Operation Scrap غير معرف | فاقد مرحلة غير مرئي | كميات خطأ | Scrap Variance | تعريف Scrap |
| Alternative Routing غير موثقة | بدائل غير واضحة | تخطيط غير ثابت | تكلفة غير مفسرة | ربط بـ PV |
| Routing المستخدم في التكلفة يختلف عن التنفيذ | تكلفة نظرية | لا يعكس الواقع | Variance مستمرة | مواءمة التكلفة والتنفيذ |
| Confirmation على عملية غير صحيحة | بيانات ورشة خاطئة | تقدم غير صحيح | Activity Cost خاطئة | تدريب وضوابط |

---

## 7. مخاطر Work Centers / Cost Centers / Activity Types

| الخطر | أثره التشغيلي | أثره على Confirmation | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| Work Center غير معرف | لا تنفيذ منظم | لا عملية صحيحة | لا تكلفة مركز | إنشاء Work Centers |
| Work Center لا يمثل الواقع | تنفيذ وهمي | تسجيل غير دقيق | Cost غير موثوق | مراجعة ميدانية |
| Work Center غير مربوط بـ Cost Center | يعمل تشغيليًا فقط | Confirmation بلا cost صحيح | Activity Cost مفقودة | ربط CO |
| Cost Center غير صحيح | تكلفة على مركز خطأ | Activity إلى مركز خطأ | تقارير CO خاطئة | اعتماد CO |
| Activity Types غير معرفة | لا تصنيف نشاط | لا Activity Quantity مفيدة | لا Labor/Machine Cost | إعداد Activity Types |
| Activity Rates غير محدثة في KP26 | لا أثر تشغيلي مباشر | Confirmation يحمل سعرًا خاطئًا | تكلفة صفرية أو خاطئة | تحديث KP26 |
| Standard Value Key غير مناسب | قيم غير مفهومة | Setup/Machine/Labor خطأ | Cost Component خطأ | مراجعة SVK |
| Formulas غير صحيحة | حساب أزمنة خطأ | Activity Quantity خطأ | تكلفة عملية خطأ | اختبار الصيغ |
| Capacity غير واقعية | Overload غير مرئي | لا أثر مباشر | أثر غير مباشر | مراجعة الطاقة |
| Calendar / Shifts غير صحيحة | جدولة غير واقعية | تواريخ Confirmation قد لا تعكس | أثر غير مباشر | ضبط التقويم |
| Work Center صالح للتنفيذ لكنه غير صالح للتكلفة | ينتج لكن لا يكلف | Confirmation يعمل جزئيًا | تكلفة ناقصة | اختبار cost integration |
| Work Center صالح للتكلفة لكنه غير صالح للجدولة | تكلفة موجودة | Confirmation يعمل | Scheduling ضعيف | اختبار scheduling |
| Activity Posting ينتج تكلفة خاطئة | لا يظهر للمشغل | Confirmation ظاهريًا صحيح | CO خاطئ | مقارنة Planned/Actual |
| Resource Usage Variance متكرر | أداء غير مستقر | Actual أكبر/أقل | Variance عالية | مراجعة Routing/KP26 |

### لماذا Work Center بدون Cost Center خطر مالي؟

لأن Work Center قد يسمح بتنفيذ العملية، لكن بدون ربطه بـ Cost Center وActivity Types وأسعار KP26 لن يتم تحميل تكلفة الموارد بشكل صحيح. النتيجة: إنتاج يبدو مكتملًا تشغيليًا، لكن تكلفة العمل أو الآلة ناقصة أو خاطئة.

---

## 8. مخاطر Production Version

| الخطر | أثره على MRP | أثره على Production Order | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| عدم وجود Production Version | فشل أو غموض MRP | أمر بلا اختيار صحيح | Cost Estimate ناقص | إنشاء PV |
| PV منتهية الصلاحية | اختيار غير صالح | أمر خاطئ | تكلفة غير صالحة | مراجعة Validity |
| Lot Size Range غير مناسب | تخطيط ببديل غير مناسب | أمر لطريقة خطأ | تكلفة دفعة خطأ | ضبط Range |
| ربط BOM خاطئة مع Routing صحيح | مكونات خاطئة | Snapshot مواد خطأ | Material Cost خطأ | اعتماد الربط |
| ربط Routing خاطئ مع BOM صحيحة | عمليات خاطئة | Snapshot عمليات خطأ | Activity Cost خطأ | مراجعة الربط |
| PV مختلفة بين MRP وCost Estimate وOrder Creation | نتائج متضاربة | أمر لا يطابق التخطيط | Variance غير مفسرة | توحيد أو توثيق |
| أكثر من PV بدون سياسة اختيار | اختيار عشوائي | أمر غير ثابت | تكلفة غير متوقعة | Selection policy |
| PV غير معتمدة | استخدام غير محكوم | أمر غير موثوق | Costing غير معتمد | Workflow اعتماد |
| PV لا تعكس الواقع | تخطيط نظري | تنفيذ يخالف النظام | Variance | مراجعة ميدانية |
| PV تسبب Planned Orders أو Production Orders خاطئة | مخرجات غير صحيحة | تنفيذ خطأ | تكلفة خطأ | اختبار MRP/Order |
| Cost Estimate يستخدم PV غير مناسبة | لا أثر مباشر على MRP | لا أثر مباشر على الأمر | Standard Cost خاطئ | مراجعة Cost Estimate |

### لماذا Production Version هي نقطة ربط حرجة بين الهندسة والإنتاج والتكلفة؟

لأنها تحدد عمليًا: أي BOM، أي Routing أو Master Recipe، لأي كمية، وفي أي فترة. لذلك هي نقطة الربط بين الهندسة التي تعرف المكونات، والإنتاج الذي يعرف العمليات، والتكلفة التي تسعّر المنتج.

---

## 9. مخاطر MRP

| الخطر | سبب ظهوره | أثره على التخطيط | أثره على الإنتاج | طريقة الوقاية |
|---|---|---|---|---|
| MRP Type غير مناسب | Material Master خاطئ | توصيات غير صحيحة | أوامر غير مناسبة | مراجعة MRP Types |
| MRP Controller غير محدد | غياب مسؤولية | لا متابعة | تأخير تحويل | تحديد controller |
| Lot Size Rule غير مناسبة | سياسة كمية خاطئة | دفعات غير عملية | تكلفة/طاقة غير مناسبة | مراجعة lot size |
| Safety Stock غير صحيح | رقم غير واقعي | نقص أو فائض | توقف أو تراكم | مراجعة مخزون |
| Strategy Group خاطئ | MTS/MTO خطأ | طلب غير صحيح | أوامر لا تخدم الطلب | ضبط strategy |
| PIR غير دقيقة | forecast ضعيف | إنتاج زائد/ناقص | مخزون غير مناسب | مراجعة forecast |
| Sales Order Demand غير مفهوم | MTO غير واضح | Planned Orders خاطئة | ربط طلب خطأ | تدريب |
| Dependent Requirements خاطئة بسبب BOM | BOM خطأ | مواد خطأ | نقص مواد | تصحيح BOM |
| Planned Orders كثيرة وغير مراجعة | لا worklist | فوضى تخطيط | تأخير | MD04 ومتابعة |
| Purchase Requisitions غير مطلوبة | Procurement خطأ | شراء زائد | فائض مواد | مراجعة procurement |
| MRP لا يرى مخزونًا صحيحًا | مخزون غير دقيق | توصيات خاطئة | نقص/فائض | تنظيف المخزون |
| MRP ينتج توصيات بسبب PV خاطئة | PV خطأ | أوامر خطأ | تنفيذ غير مناسب | اختبار PV |
| MD04 لا يراجع | ضعف متابعة | قرارات متأخرة | توقف | استخدام يومي |
| Exception Messages لا تعالج | مشاكل مهملة | توصيات غير صالحة | تأخير | Worklist |
| Firming Indicator غير مستخدم أو خطأ | تثبيت ضعيف أو زائد | MRP يغير أو لا يغير | فوضى | سياسة Firming |

---

## 10. مخاطر Planned Orders

| الخطر | أثره على التخطيط | أثره على التنفيذ | طريقة الوقاية |
|---|---|---|---|
| Planned Orders قديمة | بيانات تخطيط غير نظيفة | تحويل متأخر | مراجعة دورية |
| Planned Orders غير محولة | طلب بلا تنفيذ | نقص إنتاج | Worklist |
| Planned Orders Firmed دون مبرر | MRP لا يعدلها | تواريخ/كميات قديمة | مراجعة firming |
| Planned Orders بكمية خاطئة | تخطيط خطأ | أمر خطأ | مراجعة MD04 |
| Planned Orders بتواريخ غير واقعية | جدولة ضعيفة | تأخير | Scheduling review |
| Planned Orders تعتمد على BOM/PV خاطئة | تخطيط خاطئ | أمر خاطئ | Master Data validation |
| تحويل قبل مراجعة المواد | قرار مستعجل | Release يفشل | Missing Parts |
| تحويل إلى نوع أمر غير مناسب | Process/Discrete خطأ | تنفيذ خاطئ | قواعد تحويل |
| عدم فهم الفرق بين Planned وProduction Order | خلط تخطيط وتنفيذ | توقعات خاطئة | تدريب |
| الاعتماد على Planned Order كأنه أمر تنفيذي | لا حركات فعلية | لا GI/GR | توعية |

---

## 11. مخاطر Production / Process Orders

| الخطر | متى يظهر؟ | أثره على دورة العمل | أثره المالي | طريقة التحكم |
|---|---|---|---|---|
| إنشاء Order بدون Master Data صحيحة | عند conversion/create | Snapshot خطأ | Planned/Actual خطأ | Data validation |
| اختيار PV خاطئة | عند إنشاء الأمر | BOM/Routing خطأ | Cost خطأ | مراجعة PV |
| عدم فهم Snapshot | بعد تغيير BOM/Routing | المستخدم يظن الأمر تغير | تكلفة لا تتطابق | تدريب |
| تعديل Components بلا ضوابط | أثناء التنفيذ | صرف غير محكوم | Variance | صلاحيات |
| تعديل Operations بلا ضوابط | أثناء التنفيذ | Confirmation خطأ | Activity Cost خطأ | Approval |
| أوامر يدوية خارج MRP | تخطيط bypass | فوضى | WIP غير متوقع | حوكمة |
| Nonstandard Orders بلا حوكمة | حالات خاصة | غير متحكم | يحتاج تحقق إضافي | سياسة |
| Rework Orders غير مفهومة | إعادة عمل | تكلفة إضافية | Variance | تدريب |
| Process Orders بلا Master Recipe | Process | Phases خطأ | Cost خطأ | Master Recipe |
| أوامر مفتوحة طويلًا | بعد التنفيذ | WIP مفتوح | ميزانية خاطئة | Aging report |
| DLV بلا TECO | بعد GR | إغلاق فني ناقص | Settlement متأخر | متابعة DLV |
| TECO بلا Settlement | Period-End | إغلاق مالي ناقص | WIP/Variance عالق | Settlement report |
| Closed قبل معالجة الأخطاء | قبل التصحيح | لا حركات | أخطاء مالية | CLSD controls |
| صلاحيات تعديل مفتوحة | أي وقت | تغييرات غير محكومة | Audit ضعيف | Role design |

---

## 12. مخاطر حالات Production Order

| الحالة / الخطر | ماذا يعني؟ | أثره | كيف نمنعه؟ |
|---|---|---|---|
| CRTD يبقى طويلًا | أمر منشأ بلا Release | تأخير | تقرير CRTD |
| REL دون جاهزية مواد | أمر جاهز ظاهريًا | توقف وCOGI | Missing Parts |
| PCNF متكرر | تأكيد جزئي بلا متابعة | WIP مفتوح | متابعة PCNF |
| CNF دون GR | تنفيذ بلا استلام | WIP مفتوح | GR follow-up |
| PDLV / DLV لا تقود إلى TECO | استلام بلا إغلاق فني | Settlement متأخر | TECO policy |
| TECO يستخدم كإغلاق نهائي | سوء فهم | Settlement ناقص | تدريب |
| CLSD قبل Settlement | إغلاق مبكر | منع تصحيح | شرط Settlement |
| User Status غير مضبوط | حالة إضافية بلا حوكمة | تضارب | Status profile |
| السماح بحركات في حالة غير مناسبة | ضبط ضعيف | مخزون وتكلفة خطأ | Validation |
| عدم منع التعديل بعد CLSD | ضعف إغلاق | Audit ضعيف | Authorization |
| عدم فهم System vs User Status | خلط | تشغيل خاطئ | تدريب |

---

## 13. مخاطر Release

| الخطر | أثره التشغيلي | أثره على المخزون | أثره على الجودة | طريقة الوقاية |
|---|---|---|---|---|
| Release قبل جاهزية المواد | توقف | Reservations بلا توفر | لا أثر مباشر | Missing Parts |
| Release قبل BOM/Routing | أمر ناقص | مواد/عمليات خطأ | لا أثر مباشر | Validation |
| Release قبل اعتماد PV | طريقة إنتاج غير معتمدة | صرف خطأ | لا أثر مباشر | PV approval |
| Release تلقائي دون رقابة | أوامر غير جاهزة | حجز غير مبرر | Inspection غير متوقع | ضبط profile |
| Release دون Missing Parts Check | نقص على الخط | لا مواد | لا أثر مباشر | تقرير نقص |
| Release يولد Inspection Lot غير متوقع | مفاجأة للمستخدم | قد يحجز مخزون | فحص غير مخطط | تدريب QM |
| Release دون قدرة إنتاجية | Overload | لا أثر مباشر | لا أثر مباشر | Capacity check |
| Release دون فهم أن الصرف لم يتم | سوء فهم | يظن المواد خرجت | لا أثر | تدريب |
| صلاحيات مفتوحة | أي مستخدم يطلق | فوضى | فحوص غير مضبوطة | Role design |

---

## 14. مخاطر Material Staging / Reservations

| الخطر | أثره على المستودعات | أثره على الإنتاج | طريقة الوقاية |
|---|---|---|---|
| Reservations لا تتولد | لا حجز مواد | نقص | تحقق Release |
| Reservations لمواد خاطئة | تجهيز خطأ | توقف | مراجعة BOM |
| مواد محجوزة وغير متوفرة | نقص | تأخير | Missing Parts |
| Pull List لا يستخدم | تجهيز يدوي | فوضى | تدريب |
| PSA غير محددة | لا منطقة تغذية | نقص على الخط | تعريف PSA |
| Material Staging غير واضح | خلط عمليات | تأخير | توثيق |
| الخلط بين تجهيز وصرف | مخزون لم يخرج فعليًا | WIP خطأ | تدريب |
| عدم نقل المواد لمنطقة الإنتاج | مواد غير جاهزة | توقف | Staging process |
| EWM/WM غير متكامل | حركات معلقة | فشل تجهيز | يحتاج تحقق إضافي |
| Missing Parts لا تراجع | نقص مفاجئ | توقف | إجراء يومي |

---

## 15. مخاطر Goods Issue / Material Consumption

| الخطر | كيف يظهر؟ | أثره على المخزون | أثره على WIP | أثره المالي | طريقة الوقاية |
|---|---|---|---|---|---|
| GI على أمر خاطئ | اختيار Order خطأ | نقص مواد غير مبرر | WIP لأمر خطأ | Cost Object خطأ | Barcode/validation |
| GI قبل الوقت المناسب | صرف مبكر | مخزون أقل | WIP مبكر | فترة خاطئة | سياسة صرف |
| GI بكمية أكبر من BOM | صرف زائد | نقص زائد | WIP زائد | Variance | حدود وتحذير |
| GI بكمية أقل من BOM | صرف ناقص | مخزون أعلى | WIP ناقص | تكلفة ناقصة | مقارنة BOM |
| GI لمادة بديلة بلا توثيق | مادة مختلفة | Traceability ضعيف | WIP مختلف | Variance | سياسة بدائل |
| Issue Storage Location خاطئ | موقع خطأ | أرصدة خاطئة | WIP من مصدر خطأ | valuation أثر | مراجعة BOM |
| Batch / Serial غير صحيح | دفعة خطأ | تتبع خاطئ | WIP غير موثوق | جودة/تكلفة | Batch validation |
| Movement 261 يستخدم خطأ | صرف غير صحيح | نقص خاطئ | WIP خاطئ | FI/CO | تدريب |
| Movement 262 يستخدم خطأ | عكس غير صحيح | زيادة خاطئة | WIP منخفض خطأ | FI/CO | صلاحيات |
| مواد صُرفت ولم يتم Confirmation | GI بلا تنفيذ | نقص | WIP مفتوح | تكلفة عالقة | تقرير متابعة |
| مواد صُرفت ولم يتم GR | إنتاج غير مستلم | نقص مواد | WIP مرتفع | Period-End | متابعة GR |
| الصرف لا ينعكس على WIP | إعداد/تكلفة خطأ | قد يكون صحيحًا مخزنيًا | WIP ناقص | FI/CO خطأ | اختبار CO |
| Valuation/Price Control أثره غير متوقع | إعداد مالي | تقييم مخزون | WIP Value | Variance | FI/CO review |

---

## 16. مخاطر Backflush وCOGI / CO1P

| الخطر | أثره على التنفيذ | أثره على المخزون | أثره على التكلفة | الإجراء الوقائي |
|---|---|---|---|---|
| Backflush على مواد غير مناسبة | صرف بلا رقابة | نقص غير مفسر | تكلفة غير موثوقة | تحديد نطاق |
| فشل Backflush بسبب نقص مخزون | تأكيد ظاهري | GI لم يتم | WIP ناقص | مراجعة الرصيد |
| فشل بسبب Batch غير محدد | توقف معالجة | دفعة غير مصروفة | تكلفة ناقصة | Batch rules |
| فشل بسبب Storage Location | حركة تفشل | مخزون لا يتحدث | WIP ناقص | مراجعة المواقع |
| فشل بسبب Material Master | إعداد ناقص | GI يفشل | تكلفة ناقصة | Master Data |
| فشل بسبب Routing / Work Center | توقيت/عملية خطأ | GI قد يفشل | Activity/GI error | اختبار |
| المستخدمون لا يراجعون COGI | أخطاء تتراكم | مخزون خاطئ | تكلفة ناقصة | تقرير يومي |
| COGI مفتوحة | GI فاشل | أرصدة غير دقيقة | WIP ناقص | تصحيح يومي |
| CO1P لا تعالج | تكلفة معلقة | لا أثر مخزني مباشر | Period-End ناقص | مراجعة CO |
| الإنتاج يظن العملية تمت | ثقة خاطئة | النظام لا يعكس الواقع | Cost ناقص | تدريب |
| الاعتماد على Backflush دون رقابة | أتمتة خطرة | أخطاء خفية | تكلفة خفية | Dashboard |

### لماذا COGI وCO1P علامات خطر مبكرة بعد Go-Live؟

لأنها تكشف مبكرًا أن الحركات التلقائية أو التكاليف لم تترحل كما يتوقع المستخدمون. كثرتها بعد Go-Live تعني غالبًا أن Master Data أو المخزون أو Backflush أو التدريب غير جاهز.

---

## 17. مخاطر Confirmation

| الخطر | أثره التشغيلي | أثره على WIP | أثره على Variance | طريقة الوقاية |
|---|---|---|---|---|
| عدم تسجيل Confirmation | لا تقدم رسمي | WIP بلا تقدم | Activity missing | تدريب |
| Confirmation على Operation خاطئة | تقدم خطأ | WIP في مرحلة خطأ | Resource variance | Operation validation |
| Header بدل Operation رغم الحاجة | تفاصيل ناقصة | WIP أقل تفصيلاً | تحليل ضعيف | تحديد policy |
| PCNF يبقى مفتوحًا | تنفيذ ناقص | WIP مستمر | variance لاحقة | متابعة PCNF |
| Final قبل اكتمال العمل | إكمال وهمي | WIP يتحرك خطأ | Variance | موافقة مشرف |
| Yield غير صحيح | كمية إنتاج خاطئة | WIP/GR خطأ | Yield/variance | تحقق كمية |
| Scrap غير مسجل | فاقد مخفي | WIP غير صحيح | Scrap variance ناقصة | تسجيل scrap |
| Rework غير مسجل | إعادة عمل مخفية | تكلفة ناقصة | variance غير مفسرة | Rework policy |
| Activity Quantities غير دقيقة | موارد خطأ | WIP خطأ | Usage variance | تدريب |
| Machine Time مبالغ | تقدم غير واقعي | WIP أعلى | Resource Usage | مراجعة |
| Labor Time غير مسجل | تكلفة ناقصة | WIP ناقص | Labor variance | إلزام إدخال |
| Setup Time غير مسجل | تكلفة تهيئة ناقصة | WIP ناقص | Lot size أثر | إدخال setup |
| Posting Date خاطئ | فترة خطأ | WIP في فترة خطأ | Closing error | ضوابط تاريخ |
| Reason for Variance غير مستخدم | تفسير مفقود | لا أثر مباشر | تحليل ضعيف | إلزام أسباب |
| Confirmation يحرك Backflush خاطئ | GI خاطئ | WIP ناقص/زائد | Variance | اختبار |
| Confirmation يحرك Auto GR مبكرًا | استلام مبكر | WIP ينخفض مبكرًا | variance | ضبط Auto GR |
| إلغاء Confirmation دون أثر واضح | تصحيح فوضوي | WIP يتغير | variance | صلاحيات |
| Actual Activity Posting خاطئ | تنفيذ ظاهري صحيح | WIP خطأ | Resource variance | اختبار CO |

### Confirmation الخاطئ يعني تكلفة خاطئة حتى لو كان الإنتاج الفعلي صحيحًا

إذا كان الإنتاج على أرض الواقع صحيحًا لكن Confirmation غير دقيق، فإن النظام سيحمّل وقتًا أو كمية أو Scrap أو نشاطًا غير صحيح. النتيجة: WIP وVariance وSettlement غير موثوقة.

---

## 18. مخاطر Goods Receipt

| الخطر | أثره على المخزون | أثره على WIP | أثره على الجودة | طريقة الوقاية |
|---|---|---|---|---|
| GR قبل اكتمال الإنتاج | FG وهمي | WIP ينخفض مبكرًا | منتج غير مكتمل | Validation |
| GR قبل الجودة | مخزون متاح خطأ | WIP ينخفض | خطر جودة | QM Stock |
| Auto GR غير مناسب | استلام تلقائي | WIP يتحرك تلقائيًا | قد يتجاوز الفحص | مراجعة profile |
| GR بكمية خاطئة | FG خاطئ | WIP خاطئ | أثر جودة | مقارنة Confirmation |
| GR في Storage Location خطأ | مخزون في مكان خطأ | لا أثر مباشر | إتاحة خطأ | Default location |
| Batch/Serial غير صحيح | تتبع خاطئ | لا أثر مباشر | Traceability خاطئة | Batch/Serial check |
| Movement 101 خطأ | GR خاطئ | WIP خطأ | لا أثر مباشر | تدريب |
| Movement 102 خطأ | عكس خاطئ | WIP يعاد خطأ | لا أثر مباشر | صلاحيات |
| GR جزئي لا يتابع | PDLV عالق | WIP متبقٍ | لا أثر | متابعة PDLV |
| PDLV/DLV لا تراجع | حالة غير مفهومة | WIP/TECO | لا أثر | Status report |
| GR لا يطابق Confirmation | استلام لا يعكس التنفيذ | WIP غير منطقي | لا أثر | Reconciliation |
| المنتج يدخل قبل الصلاحية | FG غير صالح | WIP ينخفض | خطر عميل | QM |
| المستخدم لا يفهم أثر GR على WIP | قرار خاطئ | WIP | لا أثر | تدريب |

---

## 19. مخاطر Quality Management

| الخطر | أثره على الجودة | أثره على المخزون | أثره على العميل | طريقة الوقاية |
|---|---|---|---|---|
| QM غير مفعل رغم الحاجة | لا فحص | منتج متاح | منتج غير مطابق | QM scope |
| Inspection Type 03 غير مضبوط | لا فحص أثناء الإنتاج | لا أثر مباشر | عيوب متأخرة | إعداد |
| Inspection Type 04 غير مضبوط | لا فحص عند GR | FG متاح | خطر تسليم | إعداد |
| Inspection Lot لا يتولد | لا دورة فحص | لا Quality Stock | خطر جودة | اختبار |
| Inspection Lot يتولد ولا يعالج | فحص عالق | مخزون محجوز | تأخير تسليم | UD process |
| Usage Decision لا يتم | قرار ناقص | Quality Stock عالق | تأخير | متابعة |
| المنتج يبقى في Quality Stock | مخزون غير متاح | حجز | تأخير | تقرير مفتوح |
| المنتج يصبح متاحًا قبل الفحص | ضعف ضبط | بيع/استخدام مبكر | خطر كبير | QM control |
| Batch/Serial Traceability غير مضبوطة | لا تتبع | دفعات غير واضحة | استدعاء صعب | Batch/Serial |
| الجودة غير مرتبطة بالهالك أو الرفض | فشل تحليل | Scrap غير مفسر | جودة ضعيفة | ربط QM/Scrap |
| Auto GR قبل الرقابة | تجاوز فحص | FG متاح | خطر جودة | منع Auto GR |
| الإنتاج وQM لا ينسقان | تعارض | مخزون عالق | تأخير | إجراءات مشتركة |

---

## 20. مخاطر Process Manufacturing

| الخطر | أثره على التصنيع العملياتي | أثره على الجودة | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| Production Order بدل Process Order رغم الحاجة | نموذج خطأ | تتبع ضعيف | تكلفة غير ملائمة | اختيار صحيح |
| Master Recipe غير موجودة | لا وصفة | جودة غير ثابتة | Costing خطأ | إعداد recipe |
| Operations / Phases غير واضحة | تنفيذ غير منظم | نقاط فحص ناقصة | Activity خاطئة | تعريف phases |
| Resources غير معرفة | لا مورد | لا أثر مباشر | تكلفة ناقصة | Resource setup |
| Batch Management غير مضبوط | Traceability ضعيفة | خطر جودة | تكلفة batch غير واضحة | Batch setup |
| Batch Determination غير صحيح | دفعات غير مناسبة | جودة | أثر مخزون | Rules |
| Co-products / By-products غير مضبوطة | مخرجات غير واضحة | لا أثر مباشر | توزيع تكلفة خطأ | Apportionment |
| Apportionment غير موجودة | توزيع ناقص | لا أثر | تكلفة غير عادلة | إعداد |
| PI Sheets / Instructions غير مفهومة | تنفيذ غير منظم | ضعف امتثال | يحتاج تحقق إضافي | تدريب |
| Quality Integration ضعيفة | فحص ناقص | مخاطر عالية | Scrap غير مفهوم | QM integration |
| Confirmation على Phase غير مضبوط | تقدم خاطئ | Quality phase | Activity cost خطأ | تدريب |
| تكلفة Process Order لا تعكس الواقع | تنفيذ نظري | لا أثر مباشر | Variance | مراجعة recipe |

---

## 21. مخاطر Repetitive Manufacturing

| الخطر | أثره على التنفيذ | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|
| REM لعميل غير مناسب | فقدان تتبع أمر | PCC غير ملائم | تقييم النموذج |
| عدم وجود PCC | تنفيذ بلا cost object مناسب | WIP/Variance ناقص | إعداد PCC |
| Backflush غير مضبوط | صرف تلقائي خطأ | COGI/WIP | ضبط |
| Auto GR غير مضبوط | استلام تلقائي | WIP/FG خطأ | اختبار |
| Reporting Points غير معرفة | تقدم ضعيف | تحليل ناقص | إعداد |
| RSQ غير مفهومة | تنفيذ خطأ | تكلفة غير واضحة | تدريب |
| Period-Based Costing غير مفهوم | خلط مع Order Cost | Settlement خطأ | تدريب CO |
| WIP على PCC لا يراجع | WIP عالق | ميزانية خطأ | WIP reports |
| Variance على PCC لا تراجع | تحسين مفقود | Variance عالقة | Variance reports |
| Settlement على PCC غير منفذ | إغلاق ناقص | أثر مالي عالق | Period-End |
| المستخدم يتوقع Order لكل دفعة | سوء توقع | رفض النظام | تدريب |

---

## 22. مخاطر Kanban

| الخطر | أثره على المخزون | أثره على الإنتاج | طريقة الوقاية |
|---|---|---|---|
| Kanban لمواد غير مناسبة | نقص/فائض | توقف | تحديد النطاق |
| Control Cycle غير صحيح | تجديد خاطئ | مواد غير متاحة | ضبط cycle |
| PSA غير معرفة | منطقة تغذية غائبة | نقص على الخط | إعداد PSA |
| Container Quantity غير مناسبة | مخزون زائد/ناقص | تذبذب | حساب الكمية |
| عدد Containers غير مناسب | عدم توازن | توقف أو فائض | مراجعة |
| Container Status لا يحدث | Replenishment لا يعمل | نقص | تدريب |
| Trigger لا يعمل | لا تجديد | توقف | اختبار |
| عدم فهم Full/Empty/In Process/Wait | تشغيل خاطئ | نقص | تدريب |
| Kanban دون ضبط مخزون | أرصدة خاطئة | توقف | مراقبة |
| Kanban لا يظهر نقص مبكرًا | نقص مفاجئ | توقف | Shortage report |

---

## 23. مخاطر WIP

| الخطر | كيف يظهر في التقارير؟ | أثره على الميزانية | طريقة السيطرة |
|---|---|---|---|
| عدم فهم WIP | لا أحد يراجع WIP | أرقام غير دقيقة | تدريب FI/CO/PP |
| WIP يزيد مع GI ولا يتابع | WIP متضخم | أصل/تكلفة عالقة | WIP report |
| Activity Cost تدخل WIP دون مراجعة | WIP بسبب Confirmation | تكلفة موارد مشوهة | Activity review |
| GR لا يخفض WIP كما المتوقع | WIP بعد DLV | ميزانية خطأ | GR/WIP reconciliation |
| WIP Calculation لا ينفذ | لا WIP نهاية الفترة | أرقام ناقصة | Period-End checklist |
| WIP على Orders مفتوحة قديمة | Aging | تضخم | تنظيف orders |
| WIP على TECO غير مسواة | TECO not settled | WIP عالق | Settlement |
| WIP لا يظهر بدقة في الميزانية | FI mismatch | قوائم غير موثوقة | FI/CO reconciliation |
| WIP لا يراجع من المالية | مسؤولية غائبة | قبول ضعيف | Ownership |
| WIP يبقى بسبب Settlement غير منفذ | Settlement report | أرقام عالقة | تسوية |
| WIP على PCC غير مفهوم | REM reports | Period cost خطأ | تدريب REM |

---

## 24. مخاطر Variance

| نوع الخطر | ماذا يعني؟ | الإجراء التصحيحي |
|---|---|---|
| Input Quantity Variance مرتفع | استهلاك مواد لا يطابق BOM | مراجعة BOM وGI |
| Input Price Variance غير مفسر | أسعار مواد أو valuation مختلفة | مراجعة FI/شراء |
| Resource Usage Variance متكرر | أوقات أو Activity غير صحيحة | مراجعة Routing/Confirmation |
| Resource Price Variance بسبب KP26 | Activity Rates غير دقيقة | تحديث KP26 |
| Scrap Variance مرتفع | هالك أكبر من المتوقع | مراجعة جودة/عملية |
| Lot Size Variance | كمية الإنتاج لا تناسب أساس التكلفة | مراجعة lot size |
| Remaining Variance غير مفهوم | فرق غير مصنف | تحليل CO |
| Variance لا تراجع | فرص تحسين ضائعة | اجتماع شهري |
| Variance لا تحسن BOM | خطأ يتكرر | Update BOM |
| Variance لا تحسن Routing | Activity خاطئة مستمرة | Update Routing |
| Variance لا تحدث Rates | KP26 قديم | Rate review |
| الإدارة تعتبرها محاسبية فقط | ضعف تحسين تشغيلي | ربط CO بالإنتاج |

---

## 25. مخاطر Settlement

| الخطر | أثره المالي | أثره على Period-End | طريقة الوقاية |
|---|---|---|---|
| Settlement غير منفذ | WIP/Variance عالق | إغلاق ناقص | Settlement checklist |
| Settlement Rule غير موجودة | لا يعرف النظام أين يسوي | خطأ إغلاق | إعداد rule |
| Settlement Receiver غير صحيح | أثر مالي في مكان خطأ | FI/COPA خطأ | مراجعة receiver |
| Settlement Profile غير مناسب | سلوك تسوية خاطئ | أخطاء | مراجعة profile |
| WIP لا ينتقل أو لا يسوى | ميزانية خاطئة | WIP عالق | WIP/Settlement report |
| Variance لا تنتقل إلى FI/COPA | P&L/تحليل ناقص | إغلاق ناقص | Settlement test |
| TECO Orders بلا Settlement | إغلاق فني فقط | Period-End متأخر | تقرير TECO |
| Settlement Errors لا تعالج | تسوية فاشلة | إغلاق يفشل | معالجة errors |
| Settlement في فترة خاطئة | Period mismatch | أرقام فترة خطأ | Posting date controls |
| Settlement لا يطابق توقعات المالية | عدم ثقة | رفض الإغلاق | FI/CO participation |
| المستخدم يظن GR يكفي | سوء فهم | لا Settlement | تدريب |
| المستخدم يظن TECO يكفي | سوء فهم | لا تسوية | تدريب |

### لماذا Settlement هو نقطة الفشل المالية الأكثر خطورة في SAP Production؟

لأن GR وTECO قد يعطيان انطباعًا أن الدورة انتهت، لكن ماليًا لا تكتمل الدورة دون Settlement عندما تكون مطلوبة. Settlement هو الذي ينقل WIP أو Variance إلى المستقبل المالي المناسب ويجعل أرقام الإنتاج قابلة للمطابقة مع FI/CO.

---

## 26. مخاطر TECO / CLSD

| الخطر | هل يتعلق بـ TECO أم CLSD؟ | الأثر | طريقة الوقاية |
|---|---|---|---|
| TECO مبكر | TECO | يمنع أو يقيد تنفيذًا مطلوبًا | مراجعة قبل TECO |
| TECO قبل COGI | TECO | أخطاء صرف عالقة | COGI zero check |
| TECO قبل Confirmation النهائي | TECO | تكلفة نشاط ناقصة | Confirmation check |
| TECO قبل GR النهائي | TECO | WIP عالق | GR check |
| TECO قبل الجودة | TECO | منتج غير مفحوص | QM check |
| TECO يفهم كإغلاق مالي | TECO | Settlement ناقص | تدريب |
| CLSD قبل Settlement | CLSD | منع تسوية أو تصحيح | Settlement شرط |
| CLSD قبل CO1P | CLSD | تكاليف معلقة | CO1P check |
| CLSD قبل WIP review | CLSD | WIP غير محسوم | WIP check |
| CLSD يمنع تصحيحات مطلوبة | CLSD | إغلاق مبكر | Approval |
| CLSD دون موافقة مالية | CLSD | عدم ثقة | FI/CO approval |
| لا سياسة صلاحيات | TECO/CLSD | فوضى | Role design |

---

## 27. مخاطر Universal Journal / FI / CO

| الخطر | أثره المحاسبي | كيف نكتشفه؟ | طريقة الوقاية |
|---|---|---|---|
| عدم فهم علاقة الإنتاج بـ FI/CO | تفسير مالي خاطئ | أسئلة المستخدمين | تدريب مشترك |
| Production postings لا تظهر كما يتوقع المستخدم | عدم ثقة | Universal Journal review | FI/CO design |
| GI/GR/Confirmation/Settlement لا تفهم ماليًا | قرارات خاطئة | Reconciliation | ورشة FI/CO |
| Universal Journal لا يطابق تقارير الإنتاج | mismatch | Production-to-FI report | مطابقة دورية |
| CO/FI reconciliation غير منفذ | أرقام متضاربة | نهاية الفترة | إجراء إغلاق |
| COPA لا يستقبل كما متوقع | ربحية ناقصة | COPA review | يحتاج تحقق إضافي |
| محاسب التكلفة غير مشارك | تكلفة مرفوضة | UAT feedback | إشراك CO |
| التركيز على PP فقط | نظام يعمل بلا مالية | Period-End fails | فريق متكامل |
| Period-End أرقامه غير موثوقة | إغلاق متأخر | Closing reports | معالجة مبكرة |

---

## 28. مخاطر Period-End Closing

| الخطر | أثره على الفترة المالية | الإجراء الوقائي |
|---|---|---|
| Closing بدون مراجعة Production Orders | أوامر عالقة | Open Orders report |
| COGI مفتوحة | مخزون وتكلفة ناقصة | معالجة COGI |
| CO1P مفتوحة | Cost pending | معالجة CO1P |
| WIP غير محسوب | ميزانية ناقصة | WIP calculation |
| Variance غير محسوبة | فروقات غير ظاهرة | Variance calculation |
| Settlement غير منفذ | WIP/Variance عالق | Settlement |
| TECO Orders غير مسواة | إغلاق ناقص | TECO not settled |
| Orders مفتوحة قديمة | WIP متضخم | Aging cleanup |
| CLSD قبل المعالجة | منع التصحيح | CLSD controls |
| FI لا يطابق الإنتاج | عدم ثقة | Reconciliation |
| المالية لا تراجع التشغيل | أرقام غير مفهومة | FI/CO involvement |
| الإغلاق يتأخر بسبب الإنتاج | تأخير مالي | Daily controls |

---

## 29. مخاطر التقارير والرقابة

| الخطر | أثره على الإدارة | كيف نعالجه؟ |
|---|---|---|
| MD04 لا يراجع | تخطيط غير مراقب | Worklist يومية |
| COOIS لا يستخدم | أوامر غير مرئية | تدريب |
| Missing Parts لا تراجع | توقف مفاجئ | Check قبل Release |
| COGI لا يراجع يوميًا | أخطاء مخزون | مسؤولية يومية |
| CO1P لا يراجع | تكاليف معلقة | مسؤولية CO |
| Confirmation Reports لا تراجع | بيانات ورشة خاطئة | مشرف إنتاج |
| WIP Report لا يراجع | ميزانية غير دقيقة | FI/CO |
| Variance Report لا يراجع | تحسين مفقود | لجنة شهرية |
| Settlement Report لا يراجع | إغلاق مالي ناقص | CO |
| Production-to-FI Reconciliation غير موجود | عدم مطابقة | إنشاء تقرير |
| تقارير بلا مسؤول | لا قرار | تعيين owner |
| التقارير لا تقود إلى قرار | تقارير شكلية | ربط KPI بإجراء |
| اختلاف الإنتاج والمالية | عدم ثقة | Reconciliation |

---

## 30. مخاطر UAT

| الخطر في UAT | ماذا قد يحدث بعد Go-Live؟ | طريقة الوقاية |
|---|---|---|
| اختبار شاشة فقط | دورة تفشل | End-to-End UAT |
| عدم اختبار Material Master | MRP/Costing أخطاء | Data scenarios |
| عدم اختبار BOM | GI/Cost خطأ | BOM scenarios |
| عدم اختبار Routing | Confirmation/Cost خطأ | Operation scenarios |
| عدم اختبار Production Version | MRP/Order خطأ | PV scenarios |
| عدم اختبار MRP | Planned Orders خطأ | MRP run |
| عدم اختبار Conversion | تخطيط لا يتحول | Conversion test |
| عدم اختبار Release | أوامر لا تبدأ | Release test |
| عدم اختبار GI | مخزون خطأ | 261/262 test |
| عدم اختبار Backflush | COGI بعد التشغيل | Backflush test |
| عدم اختبار COGI | فريق لا يعرف التصحيح | Error simulation |
| عدم اختبار CO1P | Closing يفشل | Pending test |
| عدم اختبار Confirmation | Activity Cost خطأ | Confirmation test |
| عدم اختبار GR | Finished Goods خطأ | 101/102 test |
| عدم اختبار QM | منتج غير مفحوص | Inspection test |
| عدم اختبار WIP | ميزانية خطأ | WIP test |
| عدم اختبار Variance | فروقات غير مفهومة | Variance test |
| عدم اختبار Settlement | FI ناقص | Settlement test |
| عدم اختبار TECO/CLSD | إغلاق خاطئ | Closing status test |
| عدم اختبار Universal Journal | FI mismatch | FI/CO validation |
| عدم مشاركة المالية | رفض النتائج | FI/CO sign-off |
| عدم مشاركة المستودعات | GI/GR مشاكل | Warehouse UAT |
| عدم اختبار سيناريوهات حقيقية | النظام لا يعكس الواقع | Real cases |

---

## 31. مخاطر Go-Live وما بعد التشغيل

| الخطر | أثره بعد التشغيل | الإجراء الوقائي |
|---|---|---|
| التشغيل قبل جاهزية Material Master | أخطاء شاملة | Go/No-Go data |
| التشغيل بدون BOM/Routing معتمدة | أوامر خاطئة | Master Data sign-off |
| التشغيل بدون PV صحيحة | MRP/Costing خطأ | PV validation |
| التشغيل بدون تدريب COGI/CO1P | أخطاء عالقة | تدريب ودليل |
| التشغيل بدون مراجعة يومية | تراكم مشاكل | Daily dashboard |
| التشغيل بدون مشاركة المالية | أرقام مرفوضة | FI/CO support |
| التشغيل بدون مراقبة أول MRP | توصيات خاطئة | First run review |
| التشغيل بدون مراقبة أول GI/Confirmation/GR | أخطاء تنفيذ | Floor support |
| التشغيل بدون تجربة Settlement | Period-End فاشل | Mock closing |
| التشغيل بدون Go/No-Go واضح | قرار غير مهني | Formal approval |
| الرجوع إلى Excel | فشل تبني | منع وتدريب |
| عدم تمييز تدريب/إعداد/تطوير | حلول خاطئة | Issue classification |

---

## 32. علامات الخطر المبكرة بعد Go-Live

| علامة الخطر | ماذا تعني؟ | التصرف السريع |
|---|---|---|
| COGI Errors كثيرة | Backflush أو Master Data أو مخزون غير جاهز | فريق تصحيح يومي |
| CO1P كثيرة | تكاليف معلقة | مراجعة CO |
| Orders كثيرة في CRTD/REL دون حركة | تنفيذ لا يتحرك | فحص Release/materials |
| Confirmations غير دقيقة | بيانات ورشة ضعيفة | تدريب ومراجعة |
| GR لا يطابق الإنتاج | استلام غير مضبوط | Reconciliation |
| WIP يتضخم | Orders أو Settlement عالق | WIP cleanup |
| Variance عالية | BOM/Routing/Execution خطأ | Root cause |
| Settlement يتأخر | FI/CO غير جاهز | Closing support |
| TECO عشوائي | سوء فهم | ضبط صلاحيات |
| CLSD دون مراجعة | إغلاق خطر | Approval |
| المالية لا تعتمد الأرقام | CO/FI mismatch | Reconciliation |
| المستودعات تقول المخزون غير صحيح | GI/GR/Backflush خطأ | Inventory check |
| الإنتاج يقول النظام لا يعكس الواقع | Master Data/Process gap | Field review |
| MRP توصياته غير منطقية | MRP/BOM/PV خطأ | MD04 review |
| العودة إلى Excel | ضعف تبني | إدارة تغيير |
| تأخير Period-End بسبب الإنتاج | دورة غير ناضجة | Daily closing controls |

---

## 33. مصفوفة تقييم المخاطر

| الخطر | الاحتمالية | الأثر | الأولوية | الإجراء المطلوب |
|---|---|---|---|---|
| Material Master غير مكتمل | عالي | عالي | حرجة | Data readiness |
| BOM خاطئة | عالي | عالي | حرجة | اعتماد BOM |
| Routing لا يعكس الواقع | متوسط | عالي | عالية | مراجعة ميدانية |
| Work Center بلا Cost Center | متوسط | عالي | عالية | ربط CO |
| KP26 غير محدث | متوسط | عالي | عالية | تحديث rates |
| Production Version غير موجودة | عالي | عالي | حرجة | PV setup |
| PV تربط BOM/Routing خطأ | متوسط | عالي | حرجة | PV validation |
| MRP Type خاطئ | متوسط | عالي | عالية | مراجعة MRP |
| Strategy Group خاطئ | متوسط | عالي | عالية | ضبط MTS/MTO |
| Planned Orders قديمة | عالي | متوسط | عالية | Worklist |
| Conversion قبل مراجعة المواد | متوسط | عالي | عالية | Missing parts |
| Order Snapshot غير مفهوم | متوسط | متوسط | متوسطة | تدريب |
| Release قبل جاهزية المواد | عالي | عالي | حرجة | Release checklist |
| Reservations خاطئة | متوسط | متوسط | متوسطة | BOM/material review |
| GI على أمر خاطئ | متوسط | عالي | عالية | validation |
| Backflush بلا رقابة | عالي | عالي | حرجة | COGI daily |
| COGI مفتوحة | عالي | عالي | حرجة | daily correction |
| CO1P مفتوحة | متوسط | عالي | عالية | CO review |
| Confirmation خاطئ | عالي | عالي | حرجة | training + controls |
| Scrap غير مسجل | متوسط | متوسط | متوسطة | scrap process |
| Auto GR غير مناسب | متوسط | عالي | عالية | profile review |
| GR قبل الجودة | متوسط | عالي | عالية | QM control |
| QM غير مفعل عند الحاجة | متوسط | عالي | عالية | QM setup |
| WIP لا يراجع | عالي | عالي | حرجة | WIP report |
| Variance لا تراجع | عالي | متوسط | عالية | monthly review |
| Settlement غير منفذ | متوسط | عالي | حرجة | closing checklist |
| TECO كإغلاق مالي | متوسط | عالي | عالية | training |
| CLSD قبل Settlement | منخفض | عالي | عالية | authorization |
| Universal Journal لا يطابق | متوسط | عالي | حرجة | reconciliation |
| UAT ليس end-to-end | متوسط | عالي | حرجة | full cycle UAT |

---

## 34. كيفية الوقاية من فشل تطبيق الإنتاج في SAP

| التوصية | لماذا مهمة؟ | متى تطبق؟ |
|---|---|---|
| لا تبدأ بدون Material Master صحيحة | كل الدورة تعتمد عليها | قبل MRP |
| لا تطبق الإنتاج بدون BOM وRouting معتمدة | أساس المواد والعمليات | قبل UAT |
| لا تتجاهل Production Version | تربط التخطيط والتنفيذ والتكلفة | قبل Costing/MRP |
| لا تستخدم Backflush دون رقابة يومية | يمنع COGI متراكم | Go-Live وبعده |
| لا تعتبر Confirmation إجراءً شكليًا | يحمل Activity Cost | أثناء التدريب |
| لا تعتبر GR نهاية مالية | لا يكفي للتسوية | تدريب FI/CO |
| لا تعتبر TECO إغلاقًا ماليًا | TECO فني | تدريب |
| لا تعمل CLSD قبل Settlement | يمنع التصحيح | Period-End |
| لا تنفذ Period-End دون معالجة COGI/CO1P | يمنع أرقام ناقصة | كل إغلاق |
| لا تطبق التكلفة دون مشاركة CO/FI | قبول الأرقام | من البداية |
| لا Go-Live بدون UAT كامل | يمنع مفاجآت | قبل التشغيل |
| راقب أول شهر تشغيل يوميًا | اكتشاف مبكر | بعد Go-Live |
| افصل مشاكل التدريب عن الإعدادات والتطوير | علاج صحيح | خلال الدعم |

---

## 35. ماذا نستفيد من SAP في نظام ERP محلي مثل ناتج؟

| الخطر المستفاد من SAP | كيف نحوله إلى ضابط في نظام محلي؟ |
|---|---|
| Master Data غير مكتملة | شاشة جاهزية بيانات قبل التشغيل |
| BOM خاطئة | اعتماد BOM مع تاريخ سريان |
| Routing غير واقعي | مراجعة عمليات وربط بمراكز عمل |
| Work Center بلا تكلفة | ربط مركز العمل بمركز تكلفة أو Rate |
| Production Version مفقودة | مفهوم مبسط يربط BOM + Route + Validity |
| MRP خاطئ | شاشة طلب/عرض مع أسباب واضحة |
| Planned Order كأمر تنفيذي | فصل التخطيط عن أمر العمل |
| Release قبل جاهزية مواد | Check مواد قبل release |
| GI خاطئ | قيود صرف حسب الأمر والموقع |
| Backflush بلا رقابة | تقرير أخطاء صرف تلقائي مثل COGI |
| Pending cost postings | تقرير تكاليف معلقة مثل CO1P |
| Confirmation خاطئ | قيود إدخال Yield/Scrap/Time |
| GR مبكر | ربط GR بالكمية والجودة |
| WIP غير مفهوم | تقرير WIP حسب الأمر |
| Variance لا تراجع | تقرير فروقات مواد وموارد |
| Settlement غير منفذ | خطوة إغلاق تكلفة الأمر |
| TECO/CLSD غير واضحين | فصل إغلاق فني عن مالي |
| FI لا يطابق الإنتاج | تقرير مطابقة إنتاج/مالية |
| UAT ناقص | سيناريو اختبار كامل من MRP إلى الإغلاق |

---

## 36. ملخص تنفيذي

فشل نظام الإنتاج في SAP غالبًا لا يكون بسبب شاشة **Production Order** فقط، بل بسبب **Master Data وProduction Version والتكلفة والإغلاق**.

- Material Master وBOM وRouting هي أساس النجاح.
- Production Version نقطة ربط حرجة بين التخطيط والتنفيذ والتكلفة.
- Backflush دون مراقبة ينتج COGI وCO1P ومشاكل مخزون وتكلفة.
- Confirmation الخاطئ يفسد Activity Cost وVariance.
- GR ليس نهاية مالية.
- TECO ليس إغلاقًا ماليًا.
- Settlement هو الحدث المالي الحاسم.
- Period-End Closing يكشف جودة تطبيق الإنتاج فعليًا.
- UAT يجب أن يغطي دورة كاملة من MRP حتى Settlement وUniversal Journal.
- تطبيق الإنتاج يحتاج تعاون PP وMM وQM وCO وFI، وليس فريق الإنتاج فقط.
