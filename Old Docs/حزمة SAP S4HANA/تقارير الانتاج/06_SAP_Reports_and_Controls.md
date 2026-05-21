# 06_SAP_Reports_and_Controls.md
# تقارير ورقابة الإنتاج في SAP S/4HANA Manufacturing / PP

## 1. مقدمة

التقارير والرقابة في **SAP S/4HANA Manufacturing / PP** ليست مجرد مخرجات للطباعة، بل أدوات عملية تساعد على متابعة الدورة الكاملة للإنتاج من التخطيط حتى الإغلاق المالي.

التقرير الجيد يجب أن يجيب عن سؤال تشغيلي أو مالي واضح، مثل:

- هل Master Data جاهزة؟
- هل MRP ينتج Planned Orders صحيحة؟
- هل Production Orders تمر بالحالات الصحيحة؟
- هل المواد جاهزة قبل التنفيذ؟
- هل Goods Issue تم بشكل صحيح؟
- هل Backflush فشل وظهر في COGI؟
- هل Confirmation يعكس ما حدث في الورشة؟
- هل Goods Receipt تم في الوقت الصحيح؟
- هل الجودة تمنع إتاحة المنتج غير المفحوص؟
- هل WIP منطقي؟
- هل Variance مفهومة؟
- هل Settlement تم قبل CLSD؟
- هل Universal Journal يعكس الأثر المالي للإنتاج؟

---

## 2. خريطة التقارير حسب دورة الإنتاج في SAP

| مرحلة دورة الإنتاج | التقارير أو الرقابة المطلوبة | الهدف |
|---|---|---|
| Master Data Readiness | تقارير Material Master وBOM وRouting وWork Center وProduction Version | التأكد من جاهزية بيانات الأساس |
| MRP | MD04، MRP Results، MRP Controller Worklist | مراجعة الطلب والعرض ومقترحات التخطيط |
| Planned Orders | Planned Orders Report، Firmed Planned Orders، Old Planned Orders | تحديد ما يجب تحويله أو مراجعته |
| Production Order Creation | Production Order Status Report، COOIS | متابعة الأوامر من الإنشاء |
| Release | Missing Parts List، Reservations Review، Release Status | التأكد من جاهزية الأمر للتنفيذ |
| Material Staging / Reservation | Pull List، Material Staging Report، Reservations Report | تجهيز المواد قبل الصرف |
| Goods Issue | GI Report، Movement 261/262، Material Consumption Report | ضبط صرف المواد وأثره على WIP |
| Backflush | Backflush Report، COGI، CO1P | مراقبة أخطاء الصرف والتكلفة |
| Confirmation | Confirmation Reports، Yield/Scrap/Activity Reports | قياس تنفيذ الورشة وتحميل الأنشطة |
| Goods Receipt | GR Report، Movement 101/102، DLV/PDLV | متابعة استلام المنتج النهائي |
| Quality Inspection | Inspection Lot Report، Usage Decision، Quality Stock | منع إتاحة منتج غير مفحوص |
| TECO | TECO Orders Report، TECO not Settled | التحقق من الإغلاق الفني |
| WIP Calculation | WIP Reports | متابعة الإنتاج تحت التشغيل |
| Variance Calculation | Variance Reports | تحليل الانحرافات |
| Settlement | Settlement Reports | نقل WIP/Variance ماليًا |
| CLSD | CLSD Orders Report | التحقق من الإغلاق النهائي |
| Period-End Closing | Period-End Closing Pack، COGI/CO1P، Production-to-FI Reconciliation | دعم الإغلاق المالي |
| Post Go-Live | Daily Exception Reports، COGI، CO1P، WIP/Variance | مراقبة التشغيل بعد الانطلاق |

---

## 3. تقارير Master Data

> التقارير التالية مقترحة بناءً على منطق المقال، ما لم يرد اسم التقرير صراحة.

| التقرير | ماذا يكشف؟ | من يستخدمه؟ | القرار الناتج |
|---|---|---|---|
| Material Master Completeness | المواد التي تنقصها بيانات أساسية | Master Data / PP | استكمال البيانات قبل MRP |
| مواد بدون MRP Views مكتملة | مواد لن تخطط بشكل صحيح | التخطيط | تصحيح MRP Type وController وLot Size |
| مواد بدون Work Scheduling View | نقص بيانات التنفيذ | الإنتاج | استكمال إعداد التنفيذ |
| مواد بدون Accounting / Costing Views | نقص التقييم والتكلفة | FI/CO | منع Go-Live قبل التصحيح |
| مواد ذات MRP Type غير مناسب | تخطيط خاطئ | التخطيط | تعديل MRP Type |
| مواد ذات Procurement Type غير مناسب | شراء بدل تصنيع أو العكس | التخطيط / المشتريات | تصحيح طريقة التوريد |
| مواد بدون Production Storage Location | GI/GR من موقع غير واضح | المستودعات | تحديد موقع الإنتاج |
| مواد ذات Valuation Class غير واضحة | خطر GL خاطئ | FI | مراجعة الحسابات |
| مواد ذات Price Control غير مناسب | تقييم غير ملائم | FI/CO | اعتماد S أو V |
| مواد بدون Standard Price عند الحاجة | تقييم ناقص | CO/FI | تنفيذ Cost Estimate |
| مواد بدون Costing Lot Size | تكلفة وحدة غير منطقية | CO | ضبط Costing View |
| مواد بدون With Quantity Structure عند الحاجة | Cost Estimate لا يستخدم BOM/Routing | CO | تفعيل عند الحاجة |
| مواد مفعّل لها Backflush | المواد التي تصرف تلقائيًا | الإنتاج / المستودعات | تقييم ملاءمة Backflush |
| مواد ذات Batch / Serial Control | مواد تتطلب تتبع | الجودة / المستودعات | ضبط التتبع والفحص |

---

## 4. تقارير BOM

| التقرير/الرقابة | ماذا يكشف؟ | أثره على MRP | أثره على التكلفة |
|---|---|---|---|
| المنتجات التي لها BOM | المنتجات الجاهزة للتخطيط | يمكن تفجير الاحتياجات | Cost Rollup ممكن |
| المنتجات بدون BOM | فجوات خطيرة | MRP لا ينتج Dependent Requirements | Cost Estimate ناقص |
| BOM Header Report | بيانات الرأس والاستخدام والحالة | اختيار BOM صحيح | تكلفة صحيحة |
| BOM Status Report | BOM معتمدة أو غير معتمدة | منع استخدام غير صالح | منع تكلفة غير معتمدة |
| BOM Usage Report | Production / Costing / غيرها | استخدام مناسب | منع خلط التكلفة والتنفيذ |
| Alternative BOMs | بدائل مواد | تحتاج اختيار واضح | تكلفة بديلة |
| BOM Validity Dates | صلاحية زمنية | منع استخدام قديم | تكلفة بتاريخ صحيح |
| BOMs المنتهية أو غير الصالحة | BOM غير قابلة للاستخدام | فشل MRP | فشل Costing |
| BOMs التي تحتوي Component Scrap | فاقد المكونات | احتياج أعلى | Material Cost أعلى |
| BOMs التي تحتوي Assembly Scrap | فاقد المنتج | كميات أعلى | Target Cost مختلف |
| BOMs التي تحتوي Phantom Items | تجميعات منطقية | Explosion مختلف | Cost Rollup مختلف |
| BOMs التي تحتوي Co-products / By-products | مخرجات مشتركة | Process Manufacturing | Apportionment مطلوب |
| BOMs بمكونات بدون Issue Storage Location | مصدر صرف غير محدد | GI قد يفشل | WIP غير دقيق |
| BOMs بمكونات Batch / Serial | تتبع مطلوب | تخطيط دفعات | جودة وتكلفة |
| BOMs التي تغيرت عبر Change Master | تغييرات هندسية | صلاحية وتاريخ | Audit تكلفة |
| Multi-Level BOM Report | هيكل متعدد المستويات | MRP لكل المستويات | Cost Rollup كامل |
| Costed Multilevel BOM Report | تقرير تكلفة متعدد المستويات | غير مباشر | تحليل تكلفة عميق |

### مؤشرات خطر في تقارير BOM

| مؤشر الخطر | ماذا يعني؟ | الإجراء |
|---|---|---|
| منتج إنتاجي بدون BOM | لا يمكن تخطيطه أو تكلفته | إنشاء BOM واعتمادها |
| BOM غير صالحة للتاريخ | استخدام نسخة خطأ | تصحيح Validity |
| BOM لا تحتوي Scrap رغم وجود فاقد فعلي | التكلفة والاحتياج ناقصان | تحديث Scrap |
| Alternative BOM بدون Production Version واضحة | غموض اختيار | ربطها بـ Production Version |
| مكونات لا تطابق الواقع | صرف وانحرافات خاطئة | مراجعة ميدانية |
| BOM تغيرت دون ضبط كافٍ | ضعف Audit | استخدام Change Master عند الحاجة |

---

## 5. تقارير Routing / Operations / Work Centers

| التقرير | ماذا يراقب؟ | أثره على الجدولة | أثره على التكلفة |
|---|---|---|---|
| المنتجات بدون Routing | منتجات بلا عمليات | لا Scheduling | لا Activity Cost |
| Routing Header Report | صلاحية واستخدام Routing | Routing صحيح | Costing صحيح |
| Operations Report | تسلسل العمليات | Lead Time | Activity Cost |
| Operations بدون Work Center | عملية بلا موقع تنفيذ | فشل الجدولة | لا Cost Center |
| Operations بدون Control Key صحيح | سلوك عملية غير مضبوط | Confirmation/Scheduling خاطئ | Costing خاطئ |
| Operations بدون Standard Values | لا أزمنة | جدولة ضعيفة | تكلفة ناقصة |
| Operations بدون Setup / Machine / Labor Time | نقص قيم التشغيل | Lead Time غير دقيق | Activity Cost ناقصة |
| Operations بدون Component Allocation | مواد غير مرتبطة بمرحلة | توقيت صرف غير واضح | استهلاك غير دقيق |
| Operations ذات Operation Scrap | فاقد عملية | كميات مرحلة | Variance |
| Work Centers Report | جميع مراكز العمل | Capacity | Cost Center |
| Work Centers بدون Cost Center | فجوة تكلفة | لا أثر مباشر | لا Activity Cost |
| Work Centers بدون Activity Types | نشاط غير معرف | لا أثر مباشر | لا تحميل تكلفة |
| Work Centers بدون Capacity / Calendar | طاقة غير معروفة | جدولة غير واقعية | أثر غير مباشر |
| Work Centers بدون Scheduling Formula | حساب توقيت ناقص | تواريخ غير دقيقة | قد يؤثر على activity |
| Activity Types غير مسعرة | نشاط بدون Rate | لا أثر مباشر | تكلفة صفرية أو خاطئة |
| KP26 Activity Rates Review | مراجعة أسعار النشاط | لا أثر مباشر | دقة Activity Cost |
| Capacity Load Report | حمل الطاقة | قرار إعادة جدولة | أثر غير مباشر |

### لماذا تقارير Work Center مهمة قبل اختبار التكلفة؟

لأن تكلفة العمليات في SAP تعتمد على العلاقة بين **Routing Operation → Work Center → Cost Center → Activity Type → Activity Rate**.  
أي Work Center غير مربوط بالتكلفة أو Activity Type غير مسعّر سيؤدي إلى تكلفة إنتاج ناقصة أو Variance غير مفسرة.

---

## 6. تقارير Production Version

| التقرير | ماذا يكشف؟ | أثره على MRP | أثره على Costing / Order Creation |
|---|---|---|---|
| المنتجات بدون Production Version | فجوة حرجة | فشل أو غموض MRP | Cost Estimate أو Order خطأ |
| Production Versions الفعالة | النسخ الصالحة | اختيار صحيح | Costing صحيح |
| Production Versions المنتهية | نسخ غير صالحة | MRP قد يفشل | تكلفة غير صالحة |
| Production Versions حسب Lot Size Range | صلاحية الكمية | تخطيط حسب الدفعة | تكلفة مناسبة للكمية |
| PV تربط BOM/Routing خاطئ | ربط غير صحيح | Planned Orders خطأ | Snapshot وتكلفة خاطئة |
| PV المستخدمة في MRP | أي نسخة يستخدمها التخطيط | تحديد طريقة الإنتاج | غير مباشر |
| PV المستخدمة في Cost Estimate | أي نسخة تسعّر | غير مباشر | Standard Cost |
| PV المستخدمة في Production Orders | نسخة التنفيذ | أمر صحيح | تكلفة تنفيذ |
| أكثر من PV لنفس المنتج | بدائل متعددة | تحتاج Selection | مقارنة تكلفة |
| Production Version Selection Issues | مشاكل اختيار | Planned Orders خاطئة | Costing/Order خاطئ |

### علامات خطر في Production Version

| علامة الخطر | الأثر | الإجراء |
|---|---|---|
| غياب Production Version | فشل MRP أو Costing | إنشاء واعتماد |
| Production Version منتهية | استخدام غير صالح | تحديث الصلاحية |
| BOM صحيحة مع Routing خاطئ | تكلفة وتنفيذ خاطئ | مراجعة الربط |
| Lot Size Range غير مناسب | طريقة إنتاج غير ملائمة | تصحيح المدى |
| استخدام PV مختلفة في التكلفة والتنفيذ دون فهم | Variance غير مفهومة | توحيد أو توثيق السبب |

---

## 7. تقارير MRP والتخطيط

| التقرير/الأداة | ماذا يوضح؟ | من يستخدمه؟ | القرار الناتج |
|---|---|---|---|
| Stock / Requirements List — MD04 | الطلب والعرض والمخزون والأوامر | MRP Controller | إنتاج/شراء/تعديل |
| MRP Results | نتائج تشغيل MRP | التخطيط | قبول أو تصحيح النتائج |
| Planned Orders Report | أوامر الإنتاج المخططة | التخطيط | تحويل أو تعديل |
| Purchase Requisitions Report | طلبات شراء للأصناف الخارجية | المشتريات | متابعة شراء |
| MRP Exception Messages | مشاكل تخطيط | التخطيط | تصحيح بيانات أو توقيت |
| مواد بدون MRP Type صحيح | فجوات تخطيط | Master Data / التخطيط | تصحيح Material Master |
| مواد MRP Type = ND رغم الحاجة | مواد غير مخططة | التخطيط | تغيير MRP Type |
| مواد تحت Reorder Point | نقص محتمل | التخطيط / المستودعات | إنشاء توريد |
| مواد Safety Stock غير محقق | خطر نقص | التخطيط | تعجيل توريد |
| Dependent Requirements Report | احتياجات ناتجة من BOM | التخطيط | تخطيط مكونات |
| Open Planned Orders | أوامر مخططة مفتوحة | التخطيط | تحويل أو حذف |
| Firmed Planned Orders | أوامر مثبتة | التخطيط | حماية من تعديل MRP |
| Planned Orders القديمة | أوامر لم تتحول | التخطيط | تنظيف |
| MRP Controller Worklist | مهام المخطط | MRP Controller | ترتيب الأولويات |
| Missing Parts List | مواد ناقصة قبل التنفيذ | الإنتاج / المستودعات | منع Release أو التنفيذ |

### قرارات يمكن اتخاذها من MD04

- هل نحتاج إنتاجًا جديدًا؟
- هل نحتاج شراء مكونات؟
- هل يوجد نقص مواد؟
- هل Planned Orders قديمة؟
- هل يوجد Supply كافٍ؟
- هل يجب تثبيت Planned Order؟
- هل يجب إعادة جدولة أمر؟

---

## 8. تقارير Planned Orders

| التقرير | ماذا يكشف؟ | أثره على التخطيط | الإجراء المطلوب |
|---|---|---|---|
| Planned Orders حسب المادة | احتياجات منتج محدد | تخطيط منتج | تحويل أو تعديل |
| Planned Orders حسب Plant | عبء تخطيط المصنع | توزيع إنتاج | مراجعة الطاقة |
| Planned Orders حسب MRP Controller | مسؤولية | متابعة | Action list |
| Planned Orders غير المحولة | أوامر عالقة | تأخير إنتاج | تحويل أو حذف |
| Planned Orders القديمة | قرارات غير منفذة | تخطيط غير نظيف | تنظيف |
| Planned Orders ذات Firming Indicator | أوامر مثبتة | MRP لا يغيرها | مراجعة التثبيت |
| Planned Orders من Sales Orders في MTO | طلبات عملاء | إنتاج خاص | تحويل موجه |
| Planned Orders من PIR في MTS | توقعات | إنتاج للتخزين | مراجعة forecast |
| Planned Orders إلى Purchase Requisition | توريد خارجي | شراء | متابعة مشتريات |
| Planned Orders إلى Process Orders أو RSQ | Process/REM | نموذج تصنيع | تحويل مناسب |

---

## 9. تقارير Production Orders

| التقرير | الهدف | المستخدم | الخطر إذا لم يُراجع |
|---|---|---|---|
| Production Order Status Report | متابعة الحالات | الإنتاج | أوامر عالقة |
| Order Information System — COOIS | تحليل أوامر الإنتاج | الإنتاج / CO | ضعف رؤية التنفيذ |
| Orders حسب CRTD | أوامر منشأة فقط | الإنتاج | أوامر لم تطلق |
| Orders حسب REL | أوامر جاهزة | الإنتاج | أوامر بلا تنفيذ |
| Orders حسب PCNF | تأكيد جزئي | الإنتاج | تقدم غير مكتمل |
| Orders حسب CNF | تأكيد نهائي | الإنتاج | GR أو TECO ناقص |
| Orders حسب PDLV | استلام جزئي | المستودعات | أوامر غير مكتملة |
| Orders حسب DLV | استلام كامل | الإنتاج / CO | TECO مفقود |
| Orders حسب TECO | إغلاق فني | CO | Settlement مفقود |
| Orders حسب CLSD | إغلاق نهائي | CO/FI | تحقق نهائي |
| Created غير Released | عائق قبل التنفيذ | الإنتاج | تراكم |
| Released ولم تنفذ | توقف أو نقص | الإنتاج / المستودعات | WIP/تأخير |
| Partially Confirmed | تنفيذ جزئي | الإنتاج | تأخير |
| Confirmed ولم تستلم بالكامل | GR ناقص | المستودعات | WIP مفتوح |
| Delivered ولم تعمل TECO | إغلاق فني ناقص | الإنتاج / CO | Settlement متأخر |
| TECO ولم تعمل Settlement | إغلاق مالي ناقص | CO | WIP/Variance عالق |
| أوامر لم تغلق CLSD | إغلاق نهائي ناقص | CO/FI | إعادة فتح غير مبررة |
| أوامر قديمة مفتوحة | تراكم | الإدارة | WIP غير حقيقي |
| Nonstandard / Rework Orders | حالات خاصة | الإنتاج / CO | يحتاج تحقق إضافي من المصدر الأصلي |
| Process Orders | أوامر عمليات | الإنتاج | متابعة Process |
| MTO Orders | أوامر مرتبطة بالعميل | التخطيط / المبيعات | تتبع طلب العميل |

---

## 10. تقارير Material Staging / Reservations

| التقرير | ماذا يوضح؟ | من يستخدمه؟ | القرار الناتج |
|---|---|---|---|
| Reservations Report | المواد المحجوزة للأوامر | المستودعات | تجهيز أو صرف |
| Material Staging Report | مواد يجب تجهيزها | المستودعات / الإنتاج | نقل للخط |
| Pull List | قائمة سحب مواد | المستودعات | تجهيز قبل التنفيذ |
| Missing Parts List | المواد الناقصة | الإنتاج / المستودعات | تأجيل Release أو تعجيل توريد |
| Production Storage Location Review | مواقع الإنتاج | Master Data / مستودعات | تصحيح مواقع |
| Issue Storage Location Review | مواقع صرف المكونات | المستودعات | تصحيح BOM |
| مواد محجوزة ولم تصرف | حجز بلا GI | المستودعات | صرف أو تحرير |
| مواد محجوزة وغير متوفرة | نقص مخزون | التخطيط / المستودعات | شراء أو إنتاج |
| مواد يجب نقلها إلى PSA | متطلبات تغذية خط | المستودعات | Material Staging |
| Kanban / PSA Materials | مواد PSA/Kanban | الإنتاج | تجديد |
| EWM / WM Staging Status | حالة مستودعات متقدمة | المستودعات | يحتاج تحقق إضافي من المصدر الأصلي |

---

## 11. تقارير Goods Issue / Material Consumption

| التقرير | ماذا يكشف؟ | أثره على المخزون | أثره على WIP/التكلفة |
|---|---|---|---|
| Goods Issue Report | جميع حركات الصرف | نقص مواد | زيادة WIP |
| Material Consumption Report | الاستهلاك الفعلي | حركة مخزون | Actual Material Cost |
| Movement Type 261 Report | صرف للأوامر | نقص Raw Material | تحميل أمر |
| Movement Type 262 Report | عكس الصرف | زيادة Raw Material | خفض WIP |
| Actual Consumption vs BOM Requirement | الفرق بين المخطط والفعلي | استهلاك زائد/ناقص | Variance |
| صرف زائد عن BOM | استهلاك غير طبيعي | نقص مخزون | Input Quantity Variance |
| صرف ناقص عن BOM | إنتاج مع مواد ناقصة | مخزون أعلى ظاهريًا | تكلفة ناقصة |
| صرف مواد بديلة | استخدام غير مخطط | Traceability | Variance محتمل |
| صرف على أمر خاطئ | GI خاطئ | أرصدة خاطئة | تكلفة أمر خاطئة |
| مواد مصروفة ولم يتم Confirmation | تنفيذ غير مؤكد | مواد مستهلكة | WIP مفتوح |
| مواد مصروفة ولم يتم GR | إنتاج لم يستلم | WIP مرتفع | إغلاق ناقص |
| Batch / Serial Issue Report | دفعات/أرقام مصروفة | Traceability | جودة وتكلفة |
| Material Document Report | مستندات الحركة | Audit | أثر مالي |
| Inventory Valuation Impact | أثر التقييم | قيمة المخزون | FI/CO |
| WIP Impact Report | أثر GI على WIP | غير مباشر | تقرير مقترح بناءً على منطق المقال |

### قرارات يمكن اتخاذها من تقارير Goods Issue

- هل تم صرف المواد الصحيحة؟
- هل الصرف مطابق لـ BOM؟
- هل توجد مواد بديلة؟
- هل هناك صرف زائد يحتاج تحقيق؟
- هل تم عكس الصرف الخاطئ بـ 262؟
- هل WIP الناتج عن GI مبرر؟

---

## 12. تقارير Backflush وCOGI / CO1P

| التقرير/الأداة | ماذا يكشف؟ | الأثر | الإجراء المطلوب |
|---|---|---|---|
| Backflush Materials Report | المواد التي تصرف تلقائيًا | مخاطر صرف تلقائي | مراجعة الملاءمة |
| Backflush Error Report | أخطاء الصرف التلقائي | GI غير مكتمل | تصحيح |
| COGI — Failed Material Movements | حركات مواد فاشلة | مخزون وWIP غير صحيح | معالجة يومية |
| CO1P — Pending Cost Postings | تكاليف/حركات معلقة | تكلفة غير مكتملة | معالجة قبل Period-End |
| فشل Backflush بسبب نقص مخزون | رصيد غير كافٍ | GI فشل | توفير/تصحيح رصيد |
| فشل Backflush بسبب Batch غير محدد | تتبع ناقص | GI فشل | تحديد Batch |
| فشل Backflush بسبب Storage Location خاطئ | موقع خطأ | GI فشل | تصحيح Master Data |
| فشل Backflush بسبب إعدادات غير صحيحة | إعداد ناقص | فشل حركات | تصحيح إعداد |
| مواد Backflush لم تترحل | صرف غير فعلي | WIP ناقص | إعادة معالجة |
| تقارير أخطاء Backflush اليومية | مراقبة تشغيل | منع تراكم | إجراء يومي |

### لماذا COGI وCO1P من أهم تقارير الرقابة اليومية بعد Go-Live؟

لأن Backflush قد يعطي المستخدم انطباعًا أن الصرف تم، بينما الحركة قد تفشل وتبقى في COGI.  
وCO1P يكشف تكاليف أو حركات معلقة قد تمنع إغلاق فترة صحيح. تجاهل هذين التقريرين يؤدي إلى مخزون غير دقيق وتكلفة غير مكتملة.

---

## 13. تقارير Confirmation

| التقرير | ماذا يوضح؟ | أثره على الإنتاج | أثره على التكلفة |
|---|---|---|---|
| Confirmation Report | كل التأكيدات | تقدم التنفيذ | Actual Cost |
| Operation Confirmation Report | تأكيدات العمليات | تفاصيل ورشة | Activity Cost |
| Order Header Confirmation Report | تأكيد على مستوى الأمر | تبسيط | تفاصيل أقل |
| Partial Confirmation Report | PCNF | تقدم جزئي | تكلفة جزئية |
| Final Confirmation Report | CNF | إكمال | إغلاق عملية |
| PCNF Orders | أوامر جزئية | متابعة | WIP |
| CNF Orders | أوامر مؤكدة | GR/TECO | Variance |
| Yield Quantity Report | كمية جيدة | إنتاج فعلي | مقارنة بالمخطط |
| Scrap Quantity Report | هالك | جودة | Scrap Variance |
| Rework Quantity Report | إعادة تشغيل | مشاكل ورشة | تكلفة إضافية |
| Activity Quantities Report | ساعات/أنشطة | استخدام موارد | Activity Cost |
| Machine Time Report | وقت آلة | حمل آلة | Resource Usage |
| Labor Time Report | وقت عمالة | إنتاجية | Labor Cost |
| Setup Time Report | وقت تهيئة | تهيئة | Lot Size أثر |
| Personnel Confirmation Report | من نفذ | مسؤولية | تحليل أداء |
| Posting Date Review | تاريخ الترحيل | فترة | Period Accuracy |
| Reason for Variance Report | أسباب فروقات | تحسين | تحليل Variance |
| Canceled Confirmation Report | تأكيدات ملغاة | تصحيح | تقرير مقترح بناءً على منطق المقال |
| Confirmation Errors | أخطاء تأكيد | عوائق | تصحيح |

### كيف تكشف تقارير Confirmation مشاكل الورشة؟

- Scrap مرتفع يعني مشكلة جودة أو عملية.
- Machine Time أعلى من المخطط يعني Routing غير دقيق أو ضعف أداء.
- Labor Time غير منطقي يعني خطأ تسجيل أو إنتاجية ضعيفة.
- Yield أقل من المتوقع يعني فاقد أو توقف.
- Confirmation بدون Activity Quantities يعني تكلفة موارد ناقصة.

---

## 14. تقارير Goods Receipt

| التقرير | ماذا يوضح؟ | أثره على المخزون | أثره على WIP/التكلفة |
|---|---|---|---|
| Goods Receipt Report | استلامات الإنتاج | زيادة Finished Goods | خفض WIP |
| Movement Type 101 Report | GR | دخول المنتج | تقييم مخزون |
| Movement Type 102 Report | إلغاء GR | نقص المنتج | عكس أثر |
| Finished Goods Receipt Report | المنتج النهائي المستلم | FG Inventory | تكلفة المنتج |
| Partial Delivery Report — PDLV | استلام جزئي | جزء من المنتج | WIP متبقٍ |
| Delivered Orders Report — DLV | استلام كامل | FG كامل | جاهز TECO |
| Auto Goods Receipt Report | GR تلقائي | مخزون تلقائي | خطر قبل الجودة |
| GR by Production Order | استلام حسب الأمر | تتبع | ربط WIP |
| GR by Batch / Serial | دفعات/أرقام | Traceability | جودة |
| GR قبل الجودة أو مع Quality Stock | استلام مرتبط بالفحص | Quality Stock | منع إتاحة |
| GR Cancellations | إلغاءات 102 | تصحيح | عكس تكلفة |
| GR مقابل Confirmations | هل الاستلام مطابق للتأكيد | دقة تنفيذ | WIP |
| GR مقابل Planned Quantity | مقارنة بالخطة | PDLV/DLV | Variance |
| Finished Goods Inventory Impact | أثر المنتج النهائي | تقييم | FI/CO |

---

## 15. تقارير Quality Management داخل الإنتاج

| التقرير | ماذا يكشف؟ | أثره على الإنتاج | أثره على المخزون |
|---|---|---|---|
| Inspection Lot Report | دفعات الفحص | متابعة الجودة | مخزون تحت الفحص |
| Inspection Type 03 Report | فحص أثناء الإنتاج | مشاكل مبكرة | قبل GR |
| Inspection Type 04 Report | فحص عند GR | قبول المنتج | Quality Stock |
| Quality Inspection Stock Report | مخزون غير متاح | منع استخدام | حجز مخزون |
| Usage Decision Report | قبول/رفض | قرار جودة | نقل مخزون |
| Inspection Lots المفتوحة | فحوص غير منتهية | تأخير | مخزون محجوز |
| Inspection Lots المغلقة | فحوص مكتملة | قبول | إتاحة |
| المنتجات بلا Usage Decision | قرار ناقص | منع إتاحة | مخزون عالق |
| Batch Quality Report | جودة حسب Batch | Traceability | تتبع |
| Serial Quality Report | جودة حسب Serial | تتبع وحدة | جودة |
| Reject / Rework Quality Report | رفض/إعادة عمل | تحسين | تقرير مقترح بناءً على منطق المقال |
| جودة مرتبطة بـ GR | فحص عند الاستلام | قبول | إتاحة أو رفض |

---

## 16. تقارير Process Orders

| التقرير | ماذا يوضح؟ | متى يصبح مهمًا؟ |
|---|---|---|
| Process Order Status Report | حالات أوامر العمليات | عند Process Manufacturing |
| Master Recipe Usage Report | أي وصفة تستخدم | عند وجود Master Recipe |
| Operations / Phases Report | مراحل العملية | عند Confirmation على Phase |
| Resource Usage Report | استخدام Resources | عند تحميل تكلفة الموارد |
| Batch Determination Report | اختيار دفعات | عند Batch |
| Batch Where-Used List | تتبع الدفعات | جودة واستدعاء |
| Co-products / By-products Report | المخرجات المشتركة | عند وجود Co-products |
| Apportionment Structure Review | توزيع التكلفة | عند Co-products |
| PI Sheet / Process Instructions Status | حالة تعليمات التشغيل | يحتاج تحقق إضافي من المصدر الأصلي |
| Quality Integration Report | ربط الجودة | صناعات منظمة |

---

## 17. تقارير Repetitive Manufacturing

| التقرير | ماذا يكشف؟ | أثره على التنفيذ والتكلفة |
|---|---|---|
| Run Schedule Quantity Report | كميات تشغيل REM | تنفيذ متكرر |
| Product Cost Collector Report | تكلفة PCC | WIP/Variance على فترة |
| Backflush Report | صرف تلقائي | مخزون وتكلفة |
| Auto GR Report | استلام تلقائي | FG |
| Reporting Points Report | نقاط تقدم | رقابة مرحلة |
| WIP by PCC | WIP حسب PCC | Period-End |
| Variance by PCC | فروقات PCC | تحسين |
| Period-Based Costing Report | تكلفة الفترة | Settlement |
| Production Line Output Report | إنتاج الخط | أداء |

---

## 18. تقارير Kanban

| التقرير | ماذا يوضح؟ | القرار الناتج |
|---|---|---|
| Control Cycle Report | علاقة PSA بالمصدر | تصحيح دورة التجديد |
| Kanban Board | حالة Kanban | تقرير مقترح بناءً على منطق المقال |
| Container Status Report | حالة الحاويات | متابعة التجديد |
| Empty Containers | حاويات فارغة | بدء Replenishment |
| Full Containers | مواد جاهزة | لا إجراء |
| In Process Containers | تجديد جارٍ | متابعة |
| Wait Containers | انتظار | يحتاج تحقق إضافي من المصدر الأصلي |
| Replenishment Status | حالة التوريد | تصعيد أو انتظار |
| PSA Stock Report | مخزون منطقة الإنتاج | منع نقص |
| Kanban Shortage Report | نقص Kanban | تجديد عاجل |

---

## 19. تقارير WIP

| تقرير WIP | الهدف | المستخدم | القرار الناتج |
|---|---|---|---|
| WIP Report | متابعة الإنتاج تحت التشغيل | CO/FI | هل WIP مبرر؟ |
| WIP by Production Order | WIP لكل أمر | CO | تسوية أو متابعة |
| WIP by Process Order | WIP لأوامر العمليات | CO | مراجعة Process |
| WIP by PCC | WIP في REM | CO | Period Settlement |
| WIP by Plant | WIP حسب المصنع | الإدارة | مقارنة مصانع |
| WIP by Material | WIP حسب المنتج | CO/Production | تحليل مواد |
| WIP at Actual Cost | WIP فعلي | CO/FI | يحتاج تحقق إضافي من المصدر الأصلي |
| WIP at Target Cost | WIP مستهدف | CO/FI | يحتاج تحقق إضافي من المصدر الأصلي |
| WIP before Settlement | WIP قبل التسوية | CO | هل نعمل Settlement؟ |
| WIP after Settlement | WIP بعد التسوية | FI/CO | هل بقي WIP؟ |
| WIP for Open Orders | أوامر مفتوحة | الإنتاج / CO | متابعة أو TECO |
| WIP for TECO Orders not Settled | أوامر TECO بلا تسوية | CO | تنفيذ Settlement |
| Orders with abnormal WIP | WIP غير طبيعي | CO/الإنتاج | تحقيق |
| WIP at Period-End | WIP نهاية الفترة | FI | إغلاق مالي |

### لماذا يحتاجه محاسب التكلفة والمدير المالي؟

محاسب التكلفة يحتاج WIP لفهم أين بقيت التكلفة داخل أوامر الإنتاج.  
المدير المالي يحتاجه لأن WIP يؤثر على القوائم المالية والإغلاق.  
عدم مراجعته يؤدي إلى أرقام غير دقيقة وتضخم أو نقص في قيمة الإنتاج تحت التشغيل.

---

## 20. تقارير Variance

| نوع الانحراف | ماذا يكشف؟ | المسؤول عن مراجعته | الإجراء المتوقع |
|---|---|---|---|
| Input Quantity Variance | استهلاك كمية أكثر أو أقل | الإنتاج / CO | مراجعة BOM أو GI |
| Input Price Variance | فرق سعر المواد | CO / المشتريات | مراجعة الأسعار |
| Resource Usage Variance | استخدام مورد مختلف | الإنتاج / CO | مراجعة Routing/Confirmation |
| Resource Price Variance | Activity Rate غير مناسب | CO | تحديث KP26 |
| Scrap Variance | هالك زائد | الجودة / الإنتاج | تحليل Scrap |
| Lot Size Variance | فرق بسبب حجم الدفعة | CO / التخطيط | مراجعة Lot Size |
| Remaining Variance | فرق غير مصنف | CO | تحليل تفصيلي |
| Variance by Order | فروقات الأمر | CO | تحقيق أمر |
| Variance by Material | فروقات المنتج | CO/الإنتاج | تحسين المنتج |
| Variance by Work Center | فروقات مركز العمل | الإنتاج | تحسين العمليات |
| Variance by Cost Center | أثر مالي حسب المركز | CO | مراجعة التكاليف |
| Variance by PCC | REM | CO | تحسين PCC |
| Reason for Variance Report | أسباب مسجلة | الإنتاج/CO | تحسين البيانات |

---

## 21. تقارير Settlement

| التقرير | الهدف المالي | المستخدم | الخطر إذا لم يُراجع |
|---|---|---|---|
| Settlement Report | التحقق من التسوية | CO/FI | WIP/Variance عالق |
| Orders Ready for Settlement | أوامر جاهزة | CO | تأخير مالي |
| TECO Orders not Settled | أوامر مغلقة فنيًا بلا تسوية | CO | أرقام عالقة |
| Settlement Errors | أخطاء التسوية | CO/FI | إغلاق فاشل |
| Settlement Rule Report | قواعد التسوية | CO | Receiver خاطئ |
| Settlement Receiver Report | مستقبل التكلفة | CO/FI | أثر مالي خاطئ |
| Settlement Profile Review | إعداد التسوية | CO | سلوك غير صحيح |
| WIP Settled | WIP تم تسويته | FI/CO | مراجعة أثر |
| Variance Settled | Variance تم تسويتها | CO | تحليل |
| Settlement to FI | ترحيل مالي | FI | مطابقة |
| Settlement to COPA | ربحية | CO | يحتاج تحقق إضافي من المصدر الأصلي |
| Settlement by Period | تسوية فترة | FI/CO | إغلاق |
| Orders Closed without Settlement | أوامر مغلقة بلا تسوية | CO/FI | تقرير مقترح بناءً على منطق المقال |

### تقارير يجب مراجعتها قبل CLSD

- TECO Orders not Settled.
- Settlement Errors.
- COGI Open Errors.
- CO1P Pending Cost Postings.
- WIP before Settlement.
- Production-to-FI Reconciliation.
- Orders Closed without proper settlement.

---

## 22. تقارير TECO / CLSD

| التقرير | ماذا يكشف؟ | الإجراء المطلوب |
|---|---|---|
| TECO Orders Report | أوامر مغلقة فنيًا | مراجعة Settlement |
| Orders TECO but not Settled | إغلاق فني بلا تسوية | تنفيذ Settlement |
| Orders TECO with Open COGI | أخطاء صرف مفتوحة | معالجة COGI |
| Orders TECO with Open CO1P | تكاليف معلقة | معالجة CO1P |
| Orders TECO with remaining WIP | WIP متبقٍ | تحقيق وتسوية |
| CLSD Orders Report | أوامر مغلقة نهائيًا | مراجعة نهائية |
| Orders Closed without proper settlement | إغلاق خاطئ | تقرير مقترح بناءً على منطق المقال |
| Orders not TECO despite delivery | DLV بلا TECO | تنفيذ TECO |
| Orders not CLSD despite settlement | Settlement بلا إغلاق | تنفيذ CLSD |
| Old Open Orders | أوامر قديمة | تنظيف |

---

## 23. تقارير Period-End Closing

| التقرير | ماذا يؤكد؟ | المسؤول | الخطر إذا لم يُراجع |
|---|---|---|---|
| Period-End Closing Report | جاهزية الإغلاق | FI/CO | إغلاق ناقص |
| Open Production Orders | أوامر مفتوحة | الإنتاج/CO | WIP متضخم |
| TECO not Settled | تسوية ناقصة | CO | أرقام عالقة |
| WIP Calculation Report | WIP محسوب | CO/FI | ميزانية خاطئة |
| Variance Calculation Report | فروقات محسوبة | CO | أداء غير محلل |
| Settlement Report | تسوية منفذة | CO/FI | WIP/Variance عالق |
| COGI Open Errors | GI فاشل | ERP/مستودعات | مخزون خاطئ |
| CO1P Pending Cost Postings | تكاليف معلقة | CO | تكلفة ناقصة |
| Production-to-FI Reconciliation | مطابقة | FI/CO | عدم ثقة |
| Universal Journal Review | أثر مالي | FI | قيود ناقصة |
| Orders with GR but no Settlement | استلام بلا تسوية | CO | إغلاق ناقص |
| Orders with GI but no GR | صرف بلا استلام | الإنتاج/CO | WIP |
| Orders with Confirmation but no GR | تنفيذ بلا استلام | الإنتاج | WIP |
| Cost Analysis before Closing | مراجعة تكلفة | CO | Variance غير مفهومة |
| WIP / Variance / Settlement Summary | ملخص مالي | الإدارة | قرار إغلاق |

---

## 24. تقارير Universal Journal / FI / CO

| التقرير/الرقابة | الهدف المالي | المستخدم | ملاحظات |
|---|---|---|---|
| Universal Journal postings from Production | رؤية الأثر المالي للإنتاج | FI/CO | استخدم مفاهيم عامة فقط |
| FI postings from Goods Issue | أثر صرف المواد | FI | لا تخترع قيود تفصيلية |
| FI postings from Goods Receipt | أثر استلام المنتج | FI | حسب الإعداد |
| Activity Allocation postings | تحميل الأنشطة | CO | من Confirmation |
| Settlement postings | نقل WIP/Variance | FI/CO | حاسم |
| WIP postings | قيمة تحت التشغيل | FI/CO | نهاية الفترة |
| Variance postings | الفروقات | CO/FI | بعد calculation/settlement |
| Production-to-FI Reconciliation | مطابقة إنتاج ومالية | FI/CO | ضروري قبل الإغلاق |
| CO/FI reconciliation | مطابقة CO وFI | FI/CO | S/4HANA عبر Universal Journal |
| COPA postings | ربحية | CO | يحتاج تحقق إضافي من المصدر الأصلي |
| Cost Object Controlling Review | مراجعة كائنات التكلفة | CO | Order أو PCC |

تنبيه: لا يتم هنا اختراع قيود تفصيلية غير مذكورة. يتم الاكتفاء بالمفاهيم العامة: GI، GR، Activity Allocation، WIP، Variance، Settlement، Universal Journal.

---

## 25. تقارير Batch / Serial Traceability

| التقرير | ماذا يوضح؟ | متى يصبح ضروريًا؟ |
|---|---|---|
| Batch Where-Used List | أين استخدمت الدفعة | عند Batch Management |
| Batch Genealogy | مسار الدفعة | تقرير مقترح بناءً على منطق المقال |
| Serial Number Report | تتبع الرقم التسلسلي | عند Serial Control |
| Batch Issue Report | دفعات مصروفة | GI متتبع |
| Batch Receipt Report | دفعات مستلمة | GR متتبع |
| Raw Material to FG Trace | ربط خام بمنتج | جودة واستدعاء |
| FG to Raw Material Trace | ربط منتج بمدخلاته | تحقيقات |
| Batch Quality Report | جودة الدفعة | QM |
| Batch Recall Support Report | دعم الاستدعاء | تقرير مقترح بناءً على منطق المقال |

---

## 26. تقارير UAT وGo-Live

| تقرير الاختبار | الهدف | قرار Go/No-Go |
|---|---|---|
| تقرير اختبار Material Master | جاهزية البيانات | No-Go إذا ناقص |
| تقرير اختبار BOM | صحة المكونات | No-Go إذا BOM خاطئة |
| تقرير اختبار Routing | صحة العمليات | No-Go إذا لا Cost/Scheduling |
| تقرير اختبار Work Center / Cost Center / Activity Type | تكلفة الموارد | No-Go إذا KP26 ناقصة |
| تقرير اختبار Production Version | ربط BOM/Routing | No-Go إذا PV خاطئة |
| تقرير اختبار MRP | صحة Planned Orders | Go إذا النتائج منطقية |
| تقرير اختبار Planned Order Conversion | تحويل للتنفيذ | Go إذا التحويل صحيح |
| تقرير اختبار Production Order Lifecycle | حالات الأمر | Go إذا cycle كامل |
| تقرير اختبار Goods Issue | صرف مواد | No-Go إذا 261/262 تفشل |
| تقرير اختبار Backflush / COGI | صرف تلقائي | No-Go إذا COGI غير مفهوم |
| تقرير اختبار Confirmation | نشاط وكمية | No-Go إذا Cost ناقصة |
| تقرير اختبار Goods Receipt | استلام منتج | Go إذا 101/102 صحيح |
| تقرير اختبار Quality | فحص | حسب الحاجة |
| تقرير اختبار WIP | تحت التشغيل | No-Go إذا غير مفهوم |
| تقرير اختبار Variance | فروقات | Go إذا مفهومة |
| تقرير اختبار Settlement | تسوية | No-Go إذا تفشل |
| تقرير اختبار TECO / CLSD | إغلاق | Go إذا policy واضحة |
| تقرير اختبار Universal Journal | أثر مالي | No-Go إذا FI غير مطابق |
| قائمة الفجوات قبل Go-Live | مشاكل مفتوحة | Go/No-Go |
| تقرير Go/No-Go | قرار نهائي | اعتماد الإدارة |

---

## 27. خريطة التقارير حسب المستخدم

| المستخدم | أهم التقارير له | لماذا يحتاجها؟ |
|---|---|---|
| Production Planner | MD04، Planned Orders، Capacity Load | اتخاذ قرارات التخطيط |
| MRP Controller | MD04، MRP Results، Exception Messages | متابعة الطلب والعرض |
| Production Supervisor | Production Order Status، Dispatch List، Confirmation | متابعة التنفيذ |
| Warehouse Clerk | Reservations، Pull List، GI، COGI | تجهيز وصرف المواد |
| Production Operator | Dispatch List، Confirmation | تنفيذ وتسجيل العمل |
| Quality Engineer | Inspection Lot، Usage Decision، Batch Quality | ضبط الجودة |
| Cost Accountant | Order Cost، WIP، Variance، Settlement، CO1P | إغلاق التكلفة |
| Financial Accountant | Universal Journal، FI postings، Reconciliation | مطابقة مالية |
| Production Manager | COOIS، Order Status، Yield/Scrap | إدارة الإنتاج |
| Plant Manager | KPIs، WIP، Variance، Open Orders | قرارات إدارية |
| ERP Consultant | COGI، CO1P، Master Data Gaps، UAT Reports | دعم التطبيق |
| Support Team | Error Reports، COGI، CO1P | دعم ما بعد التشغيل |
| Development Team | Gap Reports، Custom Report Needs | تطوير عند وجود فجوات |

---

## 28. خريطة التقارير حسب القرار

| القرار | التقرير المطلوب | ماذا نبحث فيه؟ |
|---|---|---|
| هل نشغل MRP؟ | Material Master Completeness، BOM/PV Reports | جاهزية البيانات |
| هل نحول Planned Order؟ | Planned Orders Report، MD04 | الطلب والكمية والتاريخ |
| هل نعمل Release للأمر؟ | Missing Parts List، Reservations | جاهزية المواد |
| هل المواد جاهزة؟ | Pull List، Staging، Missing Parts | توفر وتجهيز |
| هل نستخدم Backflush؟ | Backflush Materials، COGI History | ملاءمة وخطر |
| لماذا ظهر COGI؟ | COGI | نقص مخزون أو Batch أو Storage |
| هل Confirmation صحيح؟ | Confirmation Reports | Yield/Scrap/Activity |
| هل نستلم المنتج النهائي؟ | GR vs Confirmation | اكتمال التنفيذ |
| هل الجودة تسمح بالإتاحة؟ | Usage Decision، Quality Stock | قرار فحص |
| هل نعمل TECO؟ | DLV Orders، COGI/CO1P | انتهاء التنفيذ |
| هل نحسب WIP؟ | Open Orders، WIP Report | إنتاج غير مكتمل |
| لماذا ظهرت Variance؟ | Variance Report | مواد أو موارد أو Scrap |
| هل نعمل Settlement؟ | WIP/Variance/Settlement Ready | جاهزية مالية |
| هل نعمل CLSD؟ | Settlement Report، Open Errors | لا أخطاء عالقة |
| هل Period-End جاهز؟ | Closing Pack | COGI/CO1P/WIP/Variance |
| هل يوجد خلل مالي بين الإنتاج وFI؟ | Production-to-FI Reconciliation | مطابقة Universal Journal |

---

## 29. مؤشرات أداء رئيسية KPIs مستنتجة من المقال

| KPI | طريقة الفهم | لماذا مهم؟ |
|---|---|---|
| عدد Production Orders حسب الحالة | CRTD/REL/PCNF/CNF/DLV/TECO/CLSD | متابعة صحة الدورة |
| نسبة Orders Released | Released / Total | جاهزية التنفيذ |
| نسبة Orders Confirmed | Confirmed / Released | تقدم الورشة |
| نسبة Orders Delivered | DLV / Released | اكتمال الاستلام |
| نسبة Orders TECO | TECO / Delivered | الإغلاق الفني |
| نسبة Orders Settled | Settled / TECO | الإغلاق المالي |
| قيمة WIP المفتوحة | WIP غير مسوى | خطر مالي |
| عدد COGI Errors | أخطاء حركة مواد | جودة Backflush |
| عدد CO1P Pending Postings | تكاليف معلقة | جاهزية الإغلاق |
| نسبة Backflush Errors | أخطاء / Backflush | جودة الصرف التلقائي |
| Input Quantity Variance | فرق استهلاك مواد | دقة BOM/GI |
| Resource Usage Variance | فرق استخدام موارد | دقة Routing/Confirmation |
| Scrap Variance | فرق الهالك | جودة العملية |
| مدة دورة Production Order | من Creation إلى DLV/TECO | كفاءة التنفيذ |
| متوسط وقت من DLV إلى TECO | تأخير الإغلاق الفني | انضباط |
| متوسط وقت من TECO إلى Settlement | تأخير مالي | Period-End |
| عدد Orders مفتوحة قديمة | Aging | WIP غير حقيقي |
| دقة BOM | فروقات مواد | جودة بيانات |
| دقة Routing | فروقات موارد | جودة عمليات |
| دقة Production Version | أخطاء PV | ربط Master Data |

---

## 30. علامات الخطر في التقارير

| علامة الخطر | ماذا تعني؟ | الإجراء المقترح |
|---|---|---|
| Planned Orders قديمة وغير محولة | قرارات تخطيط غير منفذة | مراجعة MRP Controller |
| Orders كثيرة في CRTD | أوامر لم تطلق | فحص سبب عدم Release |
| Orders كثيرة في REL دون Confirmation | تنفيذ متوقف | Missing Parts / الورشة |
| COGI Errors كثيرة | Backflush فاشل | تصحيح يومي |
| CO1P كثيرة | تكاليف معلقة | معالجة قبل Period-End |
| Confirmation ناقص أو غير دقيق | Actual Cost خاطئة | تدريب وضبط |
| GR قبل الجودة | منتج غير مفحوص | تفعيل QM controls |
| Orders DLV ولم تعمل TECO | إغلاق فني ناقص | تنفيذ TECO |
| Orders TECO ولم تعمل Settlement | إغلاق مالي ناقص | Settlement |
| WIP متضخم | أوامر مفتوحة أو تسوية ناقصة | تنظيف وتحليل |
| Variance عالية ومتكررة | BOM/Routing/Execution خاطئ | تحليل جذري |
| Settlement غير منفذ | أثر مالي عالق | Period-End procedure |
| CLSD قبل معالجة الأخطاء | إغلاق خاطئ | منع صلاحيات |
| FI لا يطابق تقارير الإنتاج | خلل مطابقة | Reconciliation |
| المستخدمون لا يعتمدون على التقارير | ضعف تشغيل | تدريب وحوكمة |

---

## 31. ماذا نستفيد من SAP في نظام ERP محلي مثل ناتج؟

| التقرير / المفهوم في SAP | هل يجب دعمه في نظام محلي؟ | الأولوية |
|---|---|---|
| Material Master Completeness | نعم | حرجة |
| BOM Readiness Report | نعم | حرجة |
| Routing Readiness Report | نعم | عالية |
| Work Center Costing Report | نعم عند وجود تكلفة موارد | عالية |
| Production Version أو بديل مبسط | نعم | عالية |
| MD04 أو شاشة طلب/عرض مبسطة | نعم حسب الحاجة | عالية |
| Planned Orders Report | نعم إذا يوجد MRP | عالية |
| Production Order Status Report | نعم | حرجة |
| Reservations / Missing Parts | نعم | عالية |
| Goods Issue Report | نعم | حرجة |
| Backflush Error Report | نعم عند Backflush | عالية |
| COGI-like Report | نعم كفكرة أخطاء حركات | عالية |
| CO1P-like Report | نعم كفكرة تكاليف معلقة | متوسطة إلى عالية |
| Confirmation Report | نعم | حرجة |
| Goods Receipt Report | نعم | حرجة |
| Quality Inspection Report | حسب القطاع | عالية عند الجودة |
| WIP Report | نعم للعملاء المتوسطين والكبار | عالية |
| Variance Report | نعم تدريجيًا | متوسطة إلى عالية |
| Settlement Report | نعم | حرجة |
| TECO/CLSD Reports | نعم أو بديل Status واضح | عالية |
| Production-to-FI Reconciliation | نعم عند التكامل المالي | حرجة |
| UAT Reports | نعم | حرجة |
| Dashboard إنتاج عملي | نعم | عالية |

### Dashboard إنتاج عملي في ERP محلي

يمكن أن يبدأ Dashboard عملي بالآتي:

- أوامر حسب الحالة.
- مواد ناقصة.
- أوامر بلا صرف.
- أوامر بلا Confirmation.
- أوامر بلا GR.
- أخطاء صرف تلقائي.
- WIP مفتوح.
- Variance مرتفعة.
- أوامر جاهزة للإغلاق.
- أوامر مغلقة فنيًا ولم تغلق ماليًا.

---

## 32. ملخص تنفيذي

التقارير في SAP Manufacturing أداة رقابة لا مجرد مخرجات.  
**MD04 وMRP Reports** تكشف جاهزية التخطيط.  
**Production Order Status Reports** تكشف أين يقف التنفيذ.  
**COGI وCO1P** من أهم أدوات مراقبة أخطاء Backflush والتكلفة.  
**Confirmation Reports** تكشف دقة بيانات الورشة.  
**WIP وVariance وSettlement Reports** هي قلب الرقابة المالية.  
**Period-End Reports** تحمي المالية من أرقام غير دقيقة.  

عند تقييم أي ERP محلي، يجب التأكد أن تقارير الإنتاج تغطي:

- التخطيط.
- التنفيذ.
- المخزون.
- الجودة.
- التكلفة.
- WIP.
- الانحرافات.
- التسوية.
- المطابقة المالية.

بدون هذه التقارير، سيبدو النظام وكأنه يعمل من ناحية الشاشات، لكنه لن يكون قابلًا للرقابة أو الإغلاق المالي الصحيح.
