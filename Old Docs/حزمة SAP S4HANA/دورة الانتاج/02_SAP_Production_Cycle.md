# 02_SAP_Production_Cycle.md
# دورة الإنتاج الكاملة في SAP S/4HANA Manufacturing / PP

## 1. مقدمة

دورة الإنتاج في **SAP S/4HANA Manufacturing / PP** لا تبدأ من شاشة **Production Order** فقط، بل تبدأ من بيانات أساسية دقيقة، ثم تخطيط، ثم تحويل التخطيط إلى تنفيذ، ثم حركات مخزون، ثم تكلفة، ثم WIP وVariance وSettlement وإغلاق.

SAP يربط بين:

- **Master Data**
- **Demand**
- **MRP**
- **Planned Orders**
- **Production / Process Orders**
- **Goods Issue**
- **Confirmation**
- **Goods Receipt**
- **WIP**
- **Variance**
- **Settlement**
- **Universal Journal**
- **Period-End Closing**

القيمة الأساسية في SAP هي أن الإنتاج ليس حدثًا منفصلًا عن التخطيط أو المخزون أو التكلفة أو المالية. كل خطوة تشغيلية لها أثر مخزني وتكلفي ومالي، وكل خطأ في البيانات الأساسية يظهر لاحقًا في MRP أو GI أو Confirmation أو WIP أو Settlement.

---

## 2. النظرة العامة على دورة الإنتاج في SAP

```text
1. إعداد Master Data
2. إعداد Material Master
3. إعداد BOM
4. إعداد Routing / Work Center
5. إعداد Production Version
6. إدخال الطلب Demand
7. تشغيل MRP
8. إنشاء Planned Order
9. تحويل Planned Order إلى Production Order أو Process Order
10. Create Production Order
11. Release
12. Material Staging / Reservation
13. Goods Issue
14. Confirmation
15. Goods Receipt
16. Quality Inspection إن وجد
17. TECO
18. WIP Calculation
19. Variance Calculation
20. Settlement
21. Close — CLSD
22. Reporting / FI / Universal Journal
```

| المرحلة | الهدف | المخرجات الأساسية |
| --- | --- | --- |
| Master Data | تجهيز الأصناف، المصنع، المستودعات، BOM، Routing، Work Centers والتكلفة. | بيانات صالحة للتخطيط والتنفيذ والتكلفة. |
| Material Master | تعريف خصائص الصنف للتخطيط والتخزين والتكلفة والجودة. | MRP Views، Accounting، Costing، Work Scheduling. |
| BOM | تحديد مكونات المنتج وكمياتها. | Component Requirements وBOM Explosion. |
| Routing / Work Center | تحديد خطوات التصنيع ومراكز العمل والأنشطة. | Operations وActivity Quantities وScheduling. |
| Production Version | ربط BOM وRouting وLot Size وValidity. | طريقة إنتاج معتمدة للتخطيط والتكلفة والأمر. |
| Demand | إدخال الطلب من Forecast/PIR/Sales Orders/Dependent Requirements. | احتياجات تخطيطية. |
| MRP | تحويل الطلب إلى مقترحات إنتاج أو شراء. | Planned Orders وPurchase Requisitions. |
| Planned Order | كائن تخطيطي قابل للتعديل قبل التنفيذ. | اقتراح إنتاج قابل للتحويل. |
| Conversion | نقل التخطيط إلى التنفيذ. | Production Order أو Process Order. |
| Create Production Order | إنشاء كائن تنفيذ يجمع BOM/Routing Snapshot. | أمر بحالة CRTD. |
| Release | إطلاق الأمر للتنفيذ. | REL، Reservations، إمكانية GI/Confirmation/GR. |
| Material Staging / Reservation | تجهيز وحجز المواد. | Reservations وPull List ومواد جاهزة. |
| Goods Issue | صرف المواد للأمر. | Material Document وWIP/Order Cost. |
| Confirmation | تسجيل الكميات والوقت والهالك والأنشطة. | Confirmation Document وActual Activity Posting. |
| Goods Receipt | استلام المنتج النهائي. | Finished Goods Inventory وMaterial Document. |
| Quality Inspection | فحص أثناء الإنتاج أو عند GR. | Inspection Lot وUsage Decision. |
| TECO | إغلاق فني للأمر. | تحرير Reservations وتمهيد Settlement. |
| WIP Calculation | احتساب تكلفة الإنتاج غير المكتمل. | WIP في نهاية الفترة. |
| Variance Calculation | تحليل الفرق بين Target/Actual/Standard. | Variance Categories. |
| Settlement | نقل WIP أو Variance ماليًا. | FI/COPA/Universal Journal postings. |
| CLSD | إغلاق نهائي. | منع الحركات والتسويات اللاحقة. |
| Reporting | رقابة وتشغيل وتحليل مالي. | MD04، COOIS، Cost Analysis، WIP/Variance/Settlement Reports. |

---

## 3. مرحلة Master Data Readiness

| البيان الأساسي | دوره في دورة الإنتاج | أثر الخطأ فيه |
| --- | --- | --- |
| Material Master | المركز العصبي للتخطيط والتكلفة والمخزون والجودة. | MRP خاطئ، حسابات خاطئة، تكلفة غير دقيقة. |
| Plant | المصنع أو الموقع الذي تتم فيه إدارة الإنتاج والمخزون. | لا يمكن ضبط إنتاج أو تخزين صحيح. |
| Storage Location | موقع تخزين المواد أو المنتج النهائي داخل Plant. | صرف أو استلام من موقع خاطئ. |
| Work Center | المكان الذي تنفذ فيه العمليات ويحمل الطاقة والتكلفة. | جدولة وتكلفة عمليات خاطئة. |
| Cost Center | مصدر تكلفة الأنشطة المرتبطة بـ Work Center. | فشل تحميل Activity Cost. |
| Activity Type | يمثل نشاطًا مثل Machine أو Labor. | تكلفة الموارد لا تحتسب بدقة. |
| BOM | تحدد مكونات المنتج. | صرف مواد خاطئ وتكلفة معيارية خاطئة. |
| Routing | يحدد خطوات التصنيع والأزمنة والأنشطة. | جدولة وتكلفة عمل غير صحيحة. |
| Production Version | يربط BOM وRouting وLot Size. | MRP أو أمر الإنتاج يستخدم طريقة خاطئة أو يفشل. |
| Master Recipe | بديل Routing في Process Manufacturing. | فشل Process Order أو Phases غير صحيحة. |
| Resource | مورد في Process Manufacturing. | تكلفة وجدولة Process خاطئة. |
| Production Supply Area — PSA | منطقة تغذية المواد للخط أو Kanban. | تجهيز مواد غير مضبوط. |
| Batch | تتبع دفعات المواد أو المنتج. | فقدان Traceability وجودة غير مضبوطة. |
| Serial Number | تتبع وحدة منفردة. | فقدان تتبع الوحدات الحساسة. |

---

## 4. مرحلة Material Master

**Material Master** هو المركز العصبي في SAP لأنه يحدد كيف يخطط النظام للصنف، هل يصنع أو يشترى، كيف يخزن، كيف يقيم ماليًا، كيف تدخل جودته، وكيف تُحتسب تكلفته.

| View / Field | أثره على الإنتاج | أثره على التكلفة/المالية |
| --- | --- | --- |
| MRP Type | يحدد هل الصنف يُخطط بـ MRP أو Reorder Point أو لا يخطط. | أوامر مخططة خاطئة تؤثر على المخزون والتكلفة. |
| MRP Controller | يحدد المسؤول عن متابعة التخطيط. | ضعف المتابعة يؤدي إلى نقص أو فائض. |
| Lot Size | يحدد كميات الإنتاج أو الشراء. | حجم دفعة خاطئ يسبب Lot Size Variance أو تكلفة غير واقعية. |
| Procurement Type | يحدد هل الصنف داخلي الإنتاج أو خارجي الشراء أو مختلط. | قد يتم شراء صنف يجب إنتاجه أو العكس. |
| Special Procurement | يحدد توريد خاص مثل Phantom أو نقل أو Subcontracting. | مسار توريد خاطئ يؤثر على التكلفة. |
| Strategy Group | يحدد MTS أو MTO أو استراتيجيات أخرى. | يربط الطلب بالإنتاج والمخزون بطريقة صحيحة. |
| Production Storage Location | يحدد موقع الصرف/الإنتاج الافتراضي. | GI من مخزن خاطئ يؤثر على الأرصدة. |
| Safety Stock | يدخل في حساب صافي الاحتياج. | حماية من نقص الإنتاج أو فائض مخزون. |
| Backflush Indicator | يفعل الصرف التلقائي. | إذا كان خاطئًا تظهر COGI أو استهلاك غير صحيح. |
| Work Scheduling | يضبط Production Scheduler وProfile والتسامحات. | قد يفعل Auto Release أو Auto GR حسب الإعداد. |
| Quality Management View | يفعل Inspection Types. | يحدد هل المنتج يدخل Inspection Stock. |
| Valuation Class | يربط الصنف بحسابات GL. | خطأه يرسل القيود لحسابات خاطئة. |
| Price Control | S Standard أو V Moving Average. | يحدد تقييم المخزون وحساب الانحرافات. |
| Standard Price | سعر معياري للتقييم. | أساس Standard Cost وVariance. |
| Moving Average Price | سعر متوسط متحرك. | يتغير مع الحركات ويؤثر على التقييم. |
| Costing Lot Size | كمية أساس للتكلفة. | تؤثر على تكلفة الوحدة. |
| With Quantity Structure | استخدام BOM/Routing في Cost Estimate. | بدونه لا تعكس التكلفة هيكل الإنتاج الحقيقي. |

### مخاطر ضعف Material Master قبل تشغيل MRP أو Production Order

- MRP Type خاطئ يؤدي إلى عدم توليد Planned Orders أو توليدها بشكل غير مناسب.
- Procurement Type خاطئ يجعل النظام يشتري مادة يجب إنتاجها.
- Valuation Class خاطئ يوجه القيود المالية إلى GL غير صحيح.
- Price Control غير مناسب يسبب تقييمًا لا يتوافق مع منهج التكلفة.
- Backflush مفعل دون ضبط المخزون يؤدي إلى أخطاء COGI.
- Costing Views غير مكتملة تعني Standard Cost غير موثوق.

---

## 5. مرحلة BOM

BOM تحدد **ماذا يدخل في المنتج**. يستخدمها MRP لتفجير احتياجات المكونات، ويستخدمها Production Order كجزء من Snapshot التنفيذ، وتستخدمها Product Costing في Cost Rollup.

| مفهوم BOM | أثره على MRP | أثره على Production Order | أثره على التكلفة |
| --- | --- | --- | --- |
| BOM Header | يحدد صلاحية واستخدام BOM. | يحدد بطاقة المكونات التي ستُنسخ. | يؤثر على Cost Estimate. |
| BOM Item | ينتج Dependent Requirements. | يصبح Component في الأمر. | يدخل Material Cost. |
| Base Quantity | يضبط نسب المكونات. | يحدد الكميات المطلوبة. | يؤثر على تكلفة الوحدة. |
| BOM Usage | يفرق بين Production/Costing/Sales. | يضمن استخدام BOM الصحيحة. | Costing قد يستخدم Usage خاص. |
| Alternative BOM | اختيار بديل حسب Production Version. | يغير مكونات الأمر. | يغير التكلفة. |
| Validity Dates | يحدد تاريخ فعالية المكونات. | يمنع استخدام مكونات قديمة. | يحفظ دقة التكلفة التاريخية. |
| Change Master | يدير التغييرات المستقبلية. | يحافظ على Audit. | يربط التغيير بأثر تكلفة. |
| Component Scrap | يزيد احتياج المكونات. | يزيد الكمية المصروفة نظريًا. | يزيد Material Cost. |
| Assembly Scrap | يزيد احتياج الصنف الأم. | يؤثر على كميات الإنتاج. | يؤثر على التكلفة المستهدفة. |
| Operation Scrap | يرتبط بعملية معينة. | يؤثر على كميات المرحلة. | يؤثر على Variance. |
| Phantom Item | يفجر مكوناته دون أمر مستقل. | يظهر كمكونات مباشرة. | يغير هيكل Cost Rollup. |
| Co-products | خاصة أكثر بـ Process. | تظهر كمخرجات مشتركة. | تحتاج Apportionment Structure. |
| By-products | مخرجات جانبية. | تظهر في العملية. | قد تخفض تكلفة المنتج الرئيسي. |
| Multi-Level BOM | MRP يفجر كل المستويات. | قد يولد أوامر subassemblies. | Cost Rollup متعدد المستويات. |
| BOM Selection Method | يحدد اختيار BOM. | يرتبط بـ Production Version. | يؤثر على تكلفة المنتج. |

### لماذا BOM الخاطئة تعني تكلفة خاطئة ومخزونًا خاطئًا؟

لأن BOM هي مصدر مكونات الإنتاج. إذا كانت الكمية أو الوحدة أو تاريخ السريان أو المكون خطأ، فإن MRP سيولد احتياجات خطأ، وProduction Order سيصرف مواد خطأ، وStandard Cost سيحسب تكلفة خطأ، ثم تظهر الانحرافات لاحقًا وكأنها مشكلة تنفيذ بينما أصلها بيانات أساسية.

---

## 6. مرحلة Routing / Work Center / Operations

Routing يحدد **كيف يُصنع المنتج**. يتكون من Operations مرتبطة بـ Work Centers. وكل Work Center يرتبط بـ Cost Center وActivity Types، وتستخدم الأسعار المسجلة مثل KP26 لتحويل الزمن أو النشاط إلى تكلفة.

| العنصر | دوره التشغيلي | أثره على الجدولة | أثره على التكلفة |
| --- | --- | --- | --- |
| Routing | يمثل خطوات تصنيع المنتج. | أساس Lead Time Scheduling. | مصدر Activity Quantities. |
| Operation | خطوة عمل داخل Routing. | لها زمن وتسلسل. | تحمل Setup/Machine/Labor. |
| Work Center | مكان تنفيذ العملية. | يحمل Capacity وCalendar. | مرتبط بـ Cost Center. |
| Control Key | يضبط هل العملية تؤكد أو تسعر أو خارجية. | يؤثر على تنفيذ وجدولة العملية. | يحدد هل تدخل في التكلفة. |
| Standard Values | قيم مثل Setup/Machine/Labor. | تحسب مدة العملية. | تتحول إلى Activity Quantities. |
| Setup Time | وقت التهيئة. | يزيد lead time. | يدخل تكلفة إذا مربوطًا بنشاط. |
| Machine Time | وقت الآلة. | يدخل الجدولة. | يضرب في Activity Rate. |
| Labor Time | وقت العمالة. | يدخل التخطيط للموارد. | يضرب في Labor Rate. |
| Queue / Wait / Move | أزمنة انتظار ونقل. | تؤثر على تواريخ العمليات. | غالبًا غير مكلفة إلا بإعداد. |
| Component Allocation | يربط BOM Component بعملية. | يحدد وقت الحاجة. | يربط الاستهلاك بالمرحلة. |
| Activity Type | نوع نشاط مثل آلة أو عمالة. | غير مباشر. | مصدر تكلفة النشاط. |
| Cost Center | مركز تكلفة مرتبط بـ Work Center. | غير مباشر. | مصدر Activity Rates. |
| KP26 | تسعير Activity Types. | لا يؤثر على الجدولة. | إذا غير محدث تصبح التكلفة صفر أو خاطئة. |

```text
Routing Operation
→ Work Center
→ Cost Center
→ Activity Type
→ Activity Rate
→ Production Order Cost
```

---

## 7. مرحلة Production Version

**Production Version** هي الربط الحاسم بين **BOM + Routing / Master Recipe + Lot Size Range + Validity Period**. في SAP S/4HANA أصبحت Production Version إلزامية لأنها تمنع الغموض في طريقة الإنتاج.

| عنصر Production Version | دوره | أثر الخطأ فيه |
| --- | --- | --- |
| BOM Alternative | يحدد أي BOM تستخدم. | مواد خاطئة في MRP والأمر والتكلفة. |
| Routing / Master Recipe | يحدد طريقة التصنيع. | خطوات أو موارد خاطئة. |
| Lot Size Range | يحدد مدى الكميات المناسبة. | طريقة إنتاج غير مناسبة لكمية الأمر. |
| Valid From / Valid To | يضبط السريان الزمني. | استخدام نسخة قديمة أو غير فعالة. |
| Production Line | مهم في REM. | فشل ربط المنتج بخط الإنتاج. |
| Use in MRP | MRP يختار BOM/Routing عبرها. | Planned Orders غير دقيقة. |
| Use in Cost Estimate | Cost Estimate يستخدمها لاختيار Quantity Structure. | Standard Cost خاطئ. |
| Use in Order Creation | الأمر يأخذ Snapshot بناءً عليها. | أمر تنفيذ لا يعكس الواقع. |

### Production Version كعقد بين الهندسة والإنتاج والتكلفة

Production Version هي العقد الذي يقول: لهذا المنتج، بهذه الكمية، في هذه الفترة، نستخدم هذه BOM وهذا Routing أو Master Recipe. لذلك هي ليست حقلًا شكليًا؛ غيابها يعني غياب الربط المنضبط بين الهندسة والإنتاج والتكلفة.

---

## 8. مرحلة Demand

| مصدر الطلب | متى يستخدم؟ | أثره على MRP |
| --- | --- | --- |
| Sales Orders | عند وجود طلبات عملاء فعلية. | تولد Demand، خصوصًا في MTO. |
| Planned Independent Requirements — PIR | عند التخطيط بالتنبؤ. | تولد احتياجات MTS. |
| Forecasts | للتخطيط المستقبلي. | تؤثر على Planned Orders. |
| Reservations | احتياجات داخلية أو مرتبطة بأوامر. | تدخل في حساب الطلب. |
| Dependent Requirements | مكونات ناتجة من BOM Explosion. | تولد احتياج المواد الخام. |
| MTO Demand | طلب إنتاج خاص بأمر بيع. | ينشئ Planned Order مرتبط بالطلب. |
| MTS Demand | طلب للتخزين. | ينتج أوامر لتغطية المخزون. |
| Strategy 10 | Net Requirements Planning. | MTS تقليدي. |
| Strategy 20 | Make-to-Order. | إنتاج لكل أمر بيع. |
| Strategy 40 | Planning with Final Assembly. | تخطيط مع إمكانية استهلاك PIR بأوامر البيع. |
| Strategy 50 | Planning Without Final Assembly. | إنتاج subassemblies مسبقًا والتجميع النهائي بعد الطلب. |

### الفرق بين الاستراتيجيات

- **Make-to-Stock**: إنتاج للتخزين ثم البيع من المخزون.
- **Make-to-Order**: إنتاج بعد أمر بيع، وقد يكون له Sales Order Stock.
- **Planning with Final Assembly**: تخطيط للمنتج النهائي مع تداخل الطلب الفعلي.
- **Planning Without Final Assembly**: إنتاج المكونات أو التجميعات الوسطية للتخزين وتأجيل النهائي.

---

## 9. مرحلة MRP

MRP يقرأ الطلب والعرض ثم يقرر ماذا يجب إنتاجه أو شراؤه ومتى.

| عنصر MRP | الشرح | أثره على الإنتاج |
| --- | --- | --- |
| Demand | PIR، Sales Orders، Reservations، Dependent Requirements. | يحدد الحاجة للإنتاج. |
| Stock | المخزون الحالي. | يقلل الحاجة إذا متوفر. |
| Open Purchase Orders | طلبات شراء مفتوحة. | تغطي مكونات أو مواد. |
| Open Planned Orders | مقترحات إنتاج/شراء مخططة. | تدخل كعرض مخطط. |
| Open Production Orders | أوامر إنتاج قائمة. | تعتبر عرضًا قادمًا. |
| Dependent Requirements | احتياجات المكونات من BOM Explosion. | تولد طلبًا للمواد. |
| Planned Orders | مخرجات للإنتاج الداخلي. | تتحول إلى أوامر تنفيذ. |
| Purchase Requisitions | مخرجات للأصناف الخارجية. | تذهب للمشتريات. |
| Schedule Lines | توريد مجدول. | يحتاج تحقق إضافي من المصدر الأصلي. |
| MRP Live | تشغيل MRP على HANA مباشرة. | أداء سريع ومخرجات تخطيط. |
| Classic MRP | تشغيل تقليدي. | نفس الهدف مع اختلافات تنفيذية. |
| MD04 | Stock/Requirements List. | أداة رقابة يومية للمخطط. |
| Net Requirements Calculation | صافي الطلب بعد خصم العرض. | قلب قرار MRP. |
| Safety Stock | مخزون أمان. | يحمي الإنتاج من النقص. |
| MRP Controller | مسؤول المتابعة. | يراجع ويقرر التحويل. |

### مخاطر تشغيل MRP ببيانات أساسية خاطئة

- BOM خاطئة تؤدي إلى Dependent Requirements خاطئة.
- Production Version خاطئة تمنع اختيار BOM/Routing الصحيح.
- MRP Type خاطئ يمنع التخطيط أو يخطط بطريقة غير مناسبة.
- Procurement Type خاطئ يحول الإنتاج إلى شراء أو العكس.
- Safety Stock غير منطقي ينتج فائضًا أو نقصًا.
- Lot Size خاطئ ينتج دفعات غير قابلة للتنفيذ.

---

## 10. مرحلة Planned Order

Planned Order هو كائن تخطيطي مؤقت. يمكن تعديله أو حذفه أو إعادة جدولته من MRP قبل التحويل.

| البند | Planned Order |
| --- | --- |
| الطبيعة | كائن تخطيطي مؤقت. |
| البيانات | Material، Quantity، Dates، MRP Area، Production Version. |
| Firming Indicator | يثبت الأمر حتى لا يعدله MRP. |
| لماذا يعدله MRP؟ | لأنه لا يزال ضمن التخطيط وليس التنفيذ. |
| متى يتحول؟ | عندما يقرر المخطط بدء التنفيذ. |
| إلى ماذا يتحول؟ | Production Order، Process Order، Purchase Requisition، Run Schedule Quantity. |

| البعد | Planned Order | Production Order |
| --- | --- | --- |
| الغرض | اقتراح تخطيطي. | تنفيذ فعلي. |
| هل يغيره MRP؟ | نعم، ما لم يكن Firmed. | لا بعد التحويل. |
| التكلفة | تقديرية. | Actual Cost تتجمع عليه. |
| التنفيذ | لا تنفيذ فعلي. | GI/Confirmation/GR بعد Release. |
| المخزون | لا حركات فعلية. | Reservations وMaterial Documents. |

---

## 11. تحويل Planned Order إلى Production / Process Order

Conversion هي نقطة فصل التخطيط عن التنفيذ. عند التحويل يخرج الكائن من سلطة MRP ويدخل في دورة تنفيذية محكومة بالحالات والصلاحيات والتكلفة.

| التحويل | النتيجة | متى يستخدم؟ |
| --- | --- | --- |
| Planned Order → Production Order | أمر إنتاج Discrete. | منتجات منفصلة قابلة للعد. |
| Planned Order → Process Order | أمر عمليات. | صناعات دفعات/كيميائية/غذائية/دوائية. |
| Planned Order → Purchase Requisition | طلب شراء. | عندما يكون Procurement Type خارجيًا. |
| Planned Order → Run Schedule Quantity | كمية تشغيل REM. | الإنتاج المتكرر. |

في **MTO** قد يرتبط الأمر بأمر بيع أو Sales Order Stock، لذلك يصبح تتبع التكلفة والمخزون أكثر خصوصية.

---

## 12. Create Production Order

Production Order هو النسخة التنفيذية التي تحتوي معلومات الكمية والتواريخ وBOM وRouting ومعلومات إضافية. عند الإنشاء ينقل SAP BOM وRouting إلى الأمر كـ **Snapshot**، فلا يتأثر الأمر تلقائيًا بتغييرات لاحقة على Master Data.

| الأثر | ماذا يحدث عند إنشاء Production Order؟ |
| --- | --- |
| التخطيط | يخرج الطلب من مرحلة Planned Order إلى التنفيذ. |
| التنفيذ | ينشأ أمر بحالة CRTD قابل للمراجعة. |
| المخزون | لا توجد GI/GR بعد، لكن قد تتجه الأمور إلى Reservations لاحقًا. |
| التكلفة | تظهر Planned Cost مبنية على BOM/Routing. |
| المالية | لا أثر FI نهائي عند الإنشاء فقط. |
| المخاطر | Production Version خاطئة تعني BOM/Routing خاطئين في الأمر. |

---

## 13. حالات Production Order

| الحالة | المعنى | ما يسمح به؟ | ما يمنع؟ | الأثر المخزني/المالي |
| --- | --- | --- | --- | --- |
| CRTD — Created | الأمر منشأ. | مراجعة وتعديل. | GI/Confirmation/GR. | لا أثر فعلي. |
| REL — Released | جاهز للتنفيذ. | GI، Confirmation، GR، طباعة. | تنفيذ قبلها. | Reservations وحركات فعلية. |
| PCNF — Partially Confirmed | تأكيد جزئي. | استكمال التنفيذ. | اعتباره منتهيًا. | تكلفة أنشطة جزئية. |
| CNF — Confirmed | تأكيد نهائي. | GR/TECO. | تأكيد غير مبرر. | تكلفة أنشطة مكتملة. |
| PDLV — Partially Delivered | استلام جزئي. | استلام الباقي. | اعتباره Delivered بالكامل. | Finished Goods جزئي. |
| DLV — Delivered | استلام كامل. | TECO/Settlement. | GR إضافي إلا بسماحية. | Finished Goods كامل. |
| TECO — Technically Completed | إغلاق فني. | Settlement. | حركات تنفيذ إضافية غالبًا. | تحرير Reservations وتمهيد التسوية. |
| CLSD — Closed | إغلاق نهائي. | عرض وتقارير. | حركات أو Re-settlement. | نهاية مالية. |
| User Status | حالات إضافية يحددها العميل. | ضوابط إضافية. | حسب Status Profile. | رقابة داخلية. |
| System Status | حالات SAP النظامية. | تتحكم بالعمليات. | لا يمكن تغيير تعريفها. | أساس دورة الأمر. |

### لماذا الحالات ليست شكلية في SAP؟

لأنها تحدد ما هو مسموح وممنوع: قبل REL لا تنفيذ، بعد CLSD لا حركات ولا تسويات لاحقة. لذلك الحالة في SAP هي أداة حوكمة وليست وصفًا فقط.

---

## 14. Release

Release يحول الأمر من التخطيط إلى التنفيذ. بعد REL يمكن تنفيذ GI وConfirmation وGR وطباعة أوراق الورشة، وقد يتولد Inspection Lot نوع 03 إذا كانت الجودة مفعلة.

| الأثر | ماذا يحدث عند Release؟ |
| --- | --- |
| التشغيل | الأمر يصبح قابلًا للتنفيذ. |
| المخزون | تولد Reservations للمكونات. |
| WIP | لا يزيد WIP بمجرد Release، لكنه يفتح الطريق لـ GI وConfirmation. |
| التكلفة | Planned Cost تصبح أساس مقارنة التنفيذ. |
| الجودة | قد يتولد Inspection Lot أثناء الإنتاج. |
| المخاطر | Release دون مواد أو Routing صحيح يؤدي إلى توقف أو أخطاء تنفيذ. |

---

## 15. Material Staging / Reservation

| المفهوم | الهدف | أثره على التنفيذ |
| --- | --- | --- |
| Reservation | حجز مكونات للأمر. | يقلل احتمال استخدام نفس المخزون لأمر آخر. |
| Material Staging | تجهيز المواد للخط. | يمنع توقف الإنتاج بسبب نقص تجهيز. |
| Pull List | قائمة سحب مواد. | توجه المستودع لتغذية الإنتاج. |
| PSA | منطقة تزويد إنتاج. | تربط المستودع بالخط أو Kanban. |
| EWM / WM | دعم مستودعي متقدم. | يدعم staging وGR وbackflush حسب السيناريو. |
| تجهيز المواد | نقل/تحضير قبل الصرف. | لا يعني استهلاكًا فعليًا. |
| الصرف الفعلي | GI. | ينقص المخزون ويزيد WIP. |

---

## 16. Goods Issue — Material Consumption

GI هو صرف المواد إلى أمر الإنتاج. الحركة الافتراضية للصرف هي **Movement Type 261**، والعكس هو **262**.

| حالة الصرف | أثرها المحتمل |
| --- | --- |
| صرف مطابق لـ BOM | ينقص المواد ويزيد WIP بشكل متوقع. |
| صرف زائد | يزيد WIP وقد ينتج Input Quantity Variance. |
| صرف ناقص | قد يعيق الإنتاج أو يخفض التكلفة ظاهريًا. |
| صرف مادة بديلة | قد يظهر Variance أو يحتاج ضبط بدائل. |
| Backflush فشل | يظهر في COGI ويجب معالجته. |
| مرتجع مواد 262 | يعكس جزءًا من الصرف ويخفض WIP. |

| الحركة | الأثر المخزني | الأثر على WIP | الأثر المالي |
| --- | --- | --- | --- |
| 261 GI | ينقص Raw Material. | يزيد WIP/Order Cost. | قيد FI/CO حسب valuation. |
| 262 Reversal | يزيد Raw Material. | يخفض WIP. | يعكس الأثر. |
| Backflush | صرف تلقائي. | يزيد WIP تلقائيًا. | قد يفشل ويظهر في COGI. |
| Manual Issue | صرف يدوي. | يزيد WIP عند الترحيل. | أكثر تحكمًا لكنه يحتاج انضباط. |
| COGI | حركات فاشلة غير مرحلة. | WIP غير مكتمل. | يجب تنظيفها قبل الإغلاق. |
| CO1P | معالجة Postprocessing. | تصحيح حركات/تأكيدات. | يدعم الإغلاق الصحيح. |

GI يتأثر بـ **Valuation Class** و **Price Control** لأنهما يحددان الحسابات وطريقة تقييم المواد.

---

## 17. Confirmation

Confirmation يسجل ما حدث فعليًا في الورشة: الكمية الجيدة، الهالك، إعادة التشغيل، أوقات العمالة والآلة، تاريخ الترحيل، وسبب الانحراف.

| نوع Confirmation | متى يستخدم؟ | أثره |
| --- | --- | --- |
| Operation Confirmation | عند تسجيل عملية محددة. | يعطي دقة في التكلفة والتقدم. |
| Order Header Confirmation | عند تسجيل الأمر ككل. | أبسط لكن أقل تفصيلًا. |
| Partial Confirmation | عند تنفيذ جزء من الكمية. | ينتج PCNF. |
| Final Confirmation | عند إكمال العملية أو الأمر. | ينتج CNF وقد يفعل عمليات تلقائية. |
| Milestone Confirmation | عند نقطة رئيسية تفترض إكمال السابق. | يبسط التأكيد المرحلي. |
| Progress Confirmation | عند تسجيل تقدم نسبي. | يحتاج تحقق إضافي من المصدر الأصلي. |

| البيان المسجل | أثره على التكلفة/التقارير |
| --- | --- |
| Yield Quantity | يؤثر على الكمية المنتجة والتقارير. |
| Scrap Quantity | يدخل في Scrap Variance وتحليل الجودة. |
| Rework Quantity | يكشف إعادة تشغيل وتكلفة إضافية محتملة. |
| Activity Quantities | تضرب في Activity Rates وتحمل على الأمر. |
| Personnel Number | يدعم الرقابة وتحليل الأداء. |
| Posting Date | يحدد الفترة المالية. |
| Reason for Variance | يدعم تفسير الانحراف. |
| Auto Goods Receipt | قد يستلم المنتج تلقائيًا. |
| Automatic Goods Issue | قد يفعل Backflush. |
| Actual Activity Posting | يحمل تكلفة الموارد الفعلية. |

### مخاطر Confirmation الخاطئ

- تحميل تكلفة عمل أو آلة غير صحيحة.
- تفعيل Backflush أو Auto GR في وقت غير مناسب.
- تسجيل Scrap أو Yield خطأ.
- صعوبة إلغاء التصحيح إذا دخلت الحركات في الإغلاق.

---

## 18. Goods Receipt من الإنتاج

GR هو استلام المنتج النهائي من أمر الإنتاج. الحركة الأساسية هي **Movement Type 101**، والعكس **102**.

| الأثر | ماذا يحدث عند GR؟ |
| --- | --- |
| المخزون | يزيد Finished Goods Inventory. |
| WIP | يخفض WIP أو يخصم من أمر الإنتاج بقيمة المنتج المستلم. |
| التكلفة | في Standard Price يعتمد على Standard Cost؛ Moving Average يتأثر بطريقة التقييم. |
| الجودة | قد يتولد Inspection Lot نوع 04 ويدخل المنتج Quality Inspection Stock. |
| المالية | ينشأ Material Document وقيد مالي في Universal Journal حسب الإعداد. |

PDLV تعني استلامًا جزئيًا، وDLV تعني استلامًا نهائيًا. Auto GR قد يحدث مع Confirmation إذا كان مفعّلًا.

---

## 19. Quality Management داخل دورة الإنتاج

| نقطة الجودة | متى تحدث؟ | أثرها على الإنتاج والمخزون |
| --- | --- | --- |
| Inspection Lot | عند Release أو GR حسب Inspection Type. | يفتح دورة فحص رسمية. |
| Inspection Type 03 | أثناء الإنتاج. | يراقب الجودة قبل اكتمال الأمر. |
| Inspection Type 04 | عند GR. | يدخل المنتج إلى Quality Inspection Stock. |
| Quality Inspection Stock | بعد GR عندما يلزم فحص. | يمنع إتاحة المنتج حتى القرار. |
| Usage Decision | بعد نتائج الفحص. | ينقل المخزون إلى متاح أو مرفوض. |
| Batch Traceability | عند وجود Batch. | يدعم تتبع المواد والمنتج. |
| Scrap / Reject | عند فشل الجودة. | يؤثر على الكمية والتكلفة والانحرافات. |

---

## 20. TECO — Technical Completion

TECO هو إغلاق فني للأمر، يستخدم عندما ينتهي التنفيذ أو لا يراد استكمال الكميات. يحرر Reservations المتبقية ويمهد للتسوية.

| البند | TECO |
| --- | --- |
| المعنى | إغلاق فني وليس إغلاقًا ماليًا نهائيًا. |
| متى يستخدم؟ | بعد انتهاء التنفيذ أو إيقاف الأمر فنيًا. |
| أثره على Reservations | يلغي/يحرر المتبقي. |
| هل يسمح بحركات إضافية؟ | غالبًا لا يسمح بحركات تنفيذية إضافية؛ التفاصيل حسب الإعداد. |
| لماذا يتيح Settlement؟ | لأنه يعلن انتهاء التنفيذ فنيًا. |
| المخاطر | TECO مبكر قد يلغي احتياجات أو يحجب بيانات لازمة. |

| البعد | TECO | CLSD |
| --- | --- | --- |
| الطبيعة | إغلاق فني. | إغلاق نهائي. |
| الهدف | إنهاء التنفيذ وتمهيد التسوية. | منع أي نشاط لاحق. |
| Settlement | يسمح/يمهد لها. | لا يسمح بتسوية لاحقة. |
| الحركات | تُقيّد غالبًا. | ممنوعة. |
| المخاطر | مبكرًا يربك التنفيذ. | قبل التسوية يسبب إغلاقًا خاطئًا. |

---

## 21. WIP Calculation

WIP هو قيمة الإنتاج غير المكتمل. يظهر عندما تكون هناك تكاليف مواد أو أنشطة على الأمر ولم يتم إغلاق أو تسوية الدورة بالكامل.

```text
GI
→ Increase WIP

Confirmation
→ Add Activity Cost

GR
→ Reduce WIP / Increase Finished Goods

Period-End
→ WIP Calculation / Variance / Settlement
```

| الحدث | أثره على WIP | أثره المالي |
| --- | --- | --- |
| GI | يزيد WIP بقيمة المواد. | تحميل مواد على الأمر. |
| Confirmation | يزيد WIP بقيمة الأنشطة. | Activity Allocation. |
| GR | يخفض WIP أو ينقل القيمة للمنتج النهائي. | زيادة Finished Goods. |
| TECO | يمهد لحساب الانحرافات والتسوية. | لا يكفي وحده ماليًا. |
| WIP Calculation | يثبت قيمة WIP في نهاية الفترة. | يعرض أصل/قيمة تحت التشغيل. |
| Settlement | ينقل WIP/Variance إلى المستقبل المالي. | أثر FI/COPA. |
| أوامر مفتوحة | تبقي WIP مفتوحًا. | تشوه الميزانية إذا لم تُراجع. |

WIP at Actual Cost وWIP at Target Cost وردا كمفاهيم؛ تفاصيل تطبيقهما تحتاج تحقق إضافي من المصدر الأصلي إذا أريد إعداد فعلي.

---

## 22. Variance Calculation

Variance هو الفرق بين التكلفة المستهدفة أو المعيارية والتكلفة الفعلية. يظهر غالبًا بعد اكتمال أو TECO أو في نهاية الفترة.

| نوع الانحراف | السبب | ماذا يكشف؟ | من يراجعه؟ |
| --- | --- | --- | --- |
| Input Quantity Variance | كمية مواد أو مدخلات مختلفة. | BOM أو استهلاك غير دقيق. | الإنتاج ومحاسب التكاليف. |
| Input Price Variance | سعر مدخلات مختلف. | تغير أسعار أو تقييم. | المشتريات/CO. |
| Resource Usage Variance | استخدام موارد أكثر/أقل. | Routing أو تنفيذ غير دقيق. | الإنتاج/CO. |
| Resource Price Variance | معدل نشاط مختلف. | KP26 أو Activity Rate غير مناسب. | CO. |
| Scrap Variance | هالك مختلف. | جودة أو عملية غير مستقرة. | الجودة والإنتاج. |
| Lot Size Variance | دفعة فعلية تختلف عن أساس التكلفة. | تأثير التكاليف الثابتة. | CO والإنتاج. |
| Remaining Variance | فرق متبقٍ غير مصنف. | حاجة لتحليل أعمق. | CO. |

الانحرافات تكشف مشاكل في BOM أو Routing أو أسعار أو Scrap أو Confirmation. لذلك لا تُعامل كأرقام مالية فقط، بل كأداة تحسين تشغيلية.

---

## 23. Settlement

Settlement هي عملية نقل WIP أو Variance أو تكلفة الأمر إلى المستقبل المالي المناسب مثل FI أو COPA أو Material، حسب Settlement Rule/Profile.

| البند | الشرح | الأثر المالي |
| --- | --- | --- |
| Settlement | تسوية تكلفة أمر الإنتاج أو PCC. | تنقل WIP/Variance ماليًا. |
| لماذا لا يكفي TECO؟ | TECO فني، وليس ترحيلًا ماليًا كاملًا. | تبقى تكلفة غير مسواة. |
| لماذا لا يكفي GR؟ | GR يستلم المنتج لكنه لا يغلق كل الفروقات. | تبقى Variances/WIP. |
| Settlement Rule | تحدد مستقبل التسوية. | توجه الأثر المالي. |
| Settlement Receiver | الجهة المستقبلة للتكلفة. | Material أو COPA أو GL حسب الإعداد. |
| Settlement Profile | إعداد يضبط قواعد التسوية. | يحدد المسموح والمطلوب. |
| عدم تنفيذ Settlement | يبقي WIP أو Variance على الأمر. | تشويه القوائم والتقارير. |
| Product Cost by Order | تسوية على أمر. | مناسب لـ Discrete/Process. |
| Product Cost by Period | تسوية على فترة/PCC. | مناسب لـ REM. |

---

## 24. Close — CLSD

CLSD هو الإغلاق النهائي. بعده لا يسمح بالحركات أو التسويات اللاحقة. لا يجب تنفيذه قبل معالجة الأخطاء، احتساب WIP/Variance، وتنفيذ Settlement.

| البند | CLSD |
| --- | --- |
| المعنى | إغلاق نهائي للأمر. |
| متى يستخدم؟ | بعد اكتمال التسويات والمعالجات. |
| ماذا يمنع؟ | الحركات، التعديلات، Re-settlement. |
| الفرق عن Settlement | Settlement عملية مالية؛ CLSD حالة نهائية. |
| الخطر | CLSD قبل التسوية أو قبل COGI/CO1P يؤدي إلى إغلاق خاطئ. |

---

## 25. Repetitive Manufacturing Cycle

REM يستخدم عندما يكون الإنتاج متكررًا ومستقرًا على خط إنتاج. بدل تتبع كل أمر، تُجمع التكلفة غالبًا على **Product Cost Collector** حسب الفترة.

| البعد | Repetitive Manufacturing | Production Order |
| --- | --- | --- |
| كائن التنفيذ | Run Schedule Quantity / Backflush. | Production Order. |
| كائن التكلفة | Product Cost Collector. | Production Order. |
| التكلفة | Period-Based Costing. | Product Cost by Order. |
| الصرف | Backflush مكثف. | Manual أو Backflush. |
| الاستلام | Auto GR شائع. | GR يدوي أو تلقائي. |
| Reporting Points | تسجل تقدم مراحل. | Operations Confirmations. |
| WIP/Variance | على PCC والفترة. | على الأمر. |

---

## 26. Process Order Cycle

Process Order يستخدم في الصناعات العملياتية ويعتمد على Master Recipe وResources وPhases وBatch Management.

| البعد | Production Order | Process Order |
| --- | --- | --- |
| نوع الصناعة | Discrete. | Process. |
| بيانات التصنيع | BOM + Routing. | BOM + Master Recipe. |
| مركز التنفيذ | Work Center. | Resource. |
| وحدة التنفيذ | Operation. | Operation + Phase. |
| Batch | اختياري. | شبه أساسي في الصناعات العملياتية. |
| Co/By-products | أقل شيوعًا. | طبيعي ومهم. |
| التأكيد | على Operation أو Header. | غالبًا على Phase. |
| الجودة | مدعومة. | مركزية في الأغذية/الأدوية/الكيماويات. |

---

## 27. Kanban Cycle

Kanban في SAP هو نظام Pull Replenishment يعتمد على Control Cycle بين PSA ومصدر التزويد، ويستخدم حالات الحاوية مثل Full وEmpty وIn Process وWait.

| البند | Kanban | Production Order |
| --- | --- | --- |
| الفلسفة | Pull عند الاستهلاك. | تنفيذ أمر مخطط. |
| الكائن | Control Cycle / Container. | Production Order. |
| التخطيط | تجديد بسيط ومرئي. | MRP وأوامر. |
| متى يصلح؟ | مواد منخفضة القيمة عالية التداول. | منتجات إنتاجية تتطلب تتبع تكلفة. |
| التكلفة | أبسط غالبًا. | تفصيل WIP/Variance/Settlement. |
| PSA | محوري. | قد يستخدم في Staging. |

---

## 28. العلاقة الكاملة بين المراحل والمخزون والتكلفة

| المرحلة | أثر التخطيط | أثر المخزون | أثر WIP | أثر CO | أثر FI / Universal Journal | هل يمكن التراجع؟ |
| --- | --- | --- | --- | --- | --- | --- |
| Master Data | أساس التخطيط. | يحدد مواقع ووحدات. | غير مباشر. | أساس التكلفة. | أساس الحسابات. | نعم بضوابط قبل التنفيذ. |
| MRP | ينتج مقترحات. | لا حركة فعلية. | لا أثر. | تقديري. | لا قيد. | نعم. |
| Planned Order | كائن تخطيطي. | لا حركة. | لا أثر. | تقديري. | لا قيد. | نعم قبل التحويل. |
| Production Order Creation | يدخل التنفيذ. | قد يمهد Reservations. | لا WIP فعلي. | Planned Cost. | لا قيد مباشر. | نعم قبل الحركات. |
| Release | ينهي التخطيط للأمر. | Reservations. | لا يزيد WIP وحده. | جاهزية للتكلفة. | لا قيد مباشر غالبًا. | يمكن بتقييد. |
| Reservation | تخصيص مواد. | حجز لا صرف. | لا أثر. | لا actual. | لا قيد. | نعم. |
| Goods Issue | تنفيذ استهلاك. | ينقص المواد. | يزيد WIP. | Actual Material Cost. | قيد FI/CO. | نعم بعكس 262. |
| Confirmation | تقدم التنفيذ. | قد يفعل GI/GR. | يزيد بأنشطة. | Activity Cost. | قيد حسب الإعداد. | نعم بإلغاء مثل CO13 بضوابط. |
| Goods Receipt | إكمال منتج. | يزيد Finished Goods. | يخفض WIP. | Credit/Relief للأمر. | قيد مخزون. | نعم بعكس 102. |
| Quality Inspection | قرار إتاحة. | قد يحجز في Inspection Stock. | غير مباشر. | Scrap/Reject محتمل. | حسب القرار. | نعم حسب الجودة. |
| TECO | إنهاء فني. | تحرير Reservations. | يمهد WIP/Variance. | يسمح Period-End. | لا قيد مباشر بالضرورة. | قد يعاد فتحه حسب الصلاحيات. |
| WIP Calculation | نهاية فترة. | لا حركة مخزون. | يثبت WIP. | CO Period-End. | قد ينتج أثر مالي. | يعاد بحساب period. |
| Variance Calculation | تحليل. | لا حركة. | يفسر الفروقات. | Variance Categories. | يمهد Settlement. | يعاد قبل settlement. |
| Settlement | إغلاق مالي. | لا حركة مخزون. | ينقل WIP/Variance. | يسوي الأمر. | FI/COPA/Universal Journal. | يعتمد على الحالة. |
| CLSD | نهاية. | لا حركات. | مغلق. | لا تسوية لاحقة. | نهائي. | لا عادة. |

---

## 29. أهم المخاطر في دورة SAP Production

| الخطر | أثره | كيف نتحكم به؟ |
| --- | --- | --- |
| Material Master خاطئ | MRP وتكلفة ومخزون خاطئ. | Checklist قبل MRP وGo-Live. |
| Production Version خاطئة | BOM/Routing غير مناسب. | اعتماد PV لكل منتج. |
| BOM خاطئة | صرف وتكلفة خاطئة. | اعتماد هندسي وتواريخ سريان. |
| Routing خاطئ | جدولة وتكلفة أنشطة خاطئة. | مراجعة العمليات وWork Centers. |
| Work Center بدون Cost Center | فشل تحميل تكلفة الأنشطة. | ربط Cost Center وActivity Types. |
| Activity Rate غير محدث في KP26 | تكلفة موارد صفر أو خاطئة. | مراجعة دورية من CO. |
| MRP ينتج أوامر خاطئة | فائض/نقص. | تنظيف Master Data وMD04 review. |
| Backflush يفشل ويظهر في COGI | مخزون وتكلفة غير مكتملة. | تنظيف COGI يوميًا. |
| Confirmation خاطئ | تكلفة وزمن وهالك غير صحيح. | تدريب وضوابط وإلغاء منظم. |
| Auto GR قبل الجودة | إتاحة منتج غير مفحوص. | ضبط QM وInspection Stock. |
| TECO مبكر | تحرير Reservations أو منع متابعة لازمة. | صلاحيات ومراجعة قبل TECO. |
| Settlement غير منفذ | WIP/Variance يبقى على الأمر. | إجراءات Period-End. |
| WIP يبقى على الأمر | ميزانية غير دقيقة. | تقرير أوامر مفتوحة وWIP. |
| Variance غير مراجع | تكرار أخطاء BOM/Routing/Execution. | اجتماع دوري CO + Production. |
| CLSD قبل التسوية | إغلاق يمنع التصحيح المالي. | Checklist قبل CLSD. |

---

## 30. أسئلة تحليل العميل المستخرجة من دورة SAP

| المرحلة | السؤال | لماذا مهم؟ |
| --- | --- | --- |
| Master Data | هل Material Master مكتمل لكل منتج ومكون؟ | لأن MRP والتكلفة يعتمدان عليه. |
| Master Data | هل BOM معتمدة وبها تواريخ سريان؟ | لتجنب مكونات خاطئة. |
| Master Data | هل Routing صحيح ومربوط بـ Work Centers؟ | لجدولة وتكلفة سليمة. |
| Master Data | هل Production Version موجودة لكل منتج؟ | لربط BOM وRouting. |
| Planning | هل الإنتاج MTS أم MTO؟ | يحدد Strategy Group وسلوك MRP. |
| Planning | هل يستخدم العميل MRP؟ | يحدد دورة التخطيط. |
| Planning | ما مصادر الطلب؟ | Sales/PIR/Forecast/Reservations. |
| Execution | من ينشئ الأمر؟ | تحديد المسؤولية. |
| Execution | من يقوم بـ Release؟ | صلاحيات وحوكمة. |
| Execution | متى يتم GI؟ | يدوي أم Backflush. |
| Execution | هل يستخدم Backflush؟ | لتوقع COGI ومخاطر المخزون. |
| Execution | من يقوم بـ Confirmation؟ | مصدر actual activity. |
| Execution | هل يوجد Auto GR؟ | أثر على المخزون والجودة. |
| Quality | هل يوجد فحص أثناء الإنتاج أو بعده؟ | Inspection 03/04. |
| Quality | هل يوجد Batch / Serial؟ | Traceability. |
| Costing | هل التكلفة على Order أم Period؟ | Product Cost by Order/Period. |
| Costing | هل يتم حساب WIP؟ | ضروري للأوامر المفتوحة. |
| Costing | هل يتم Settlement؟ | نهاية الأثر المالي. |
| Costing | من يراجع Variance؟ | تحسين التكلفة والتنفيذ. |
| Closing | متى يتم TECO؟ | إغلاق فني. |
| Closing | متى يتم Settlement؟ | نهاية مالية. |
| Closing | متى يتم CLSD؟ | منع الحركات النهائية. |
| Closing | كيف تتم معالجة COGI / CO1P؟ | منع أخطاء معلقة قبل الإغلاق. |

---

## 31. دروس مستفادة لنظام ERP محلي مثل ناتج

- ضرورة فصل التخطيط عن التنفيذ: Planned Order ليس Production Order.
- وجود مفهوم يعادل **Production Version** مهم لربط BOM وRoute ومنع الغموض.
- حالات أمر الإنتاج يجب أن تكون واضحة وتتحكم بما يسمح وما يمنع.
- **GI / Confirmation / GR** يجب أن تكون أحداثًا منفصلة لا شاشة واحدة.
- Backflush مفيد كخيار، لكنه خطر إذا فُعل بلا ضبط مخزون.
- WIP ليس رفاهية في العملاء المتوسطين والكبار.
- Variance يجب أن يكون أداة تحسين، لا مجرد رقم محاسبي.
- Settlement أو إغلاق تكلفة الأمر ضروري لإغلاق الدورة.
- تقارير تحذيرية مثل COGI/CO1P ضرورية لفشل الحركات التلقائية.
- لا يجب نسخ SAP حرفيًا للعميل المتوسط؛ المطلوب أخذ المبادئ وتبسيطها.

---

## 32. ملخص تنفيذي

دورة SAP Production تبدأ من **Master Data وMRP** ولا تبدأ من Production Order فقط.  
**Production Version** تربط BOM وRouting وتمنع الغموض.  
**Planned Order** كائن تخطيطي، أما **Production Order** فهو كائن تنفيذي لا يغيره MRP بعد التحويل.

عند **Release** يصبح الأمر قابلًا لـ:

- Goods Issue
- Confirmation
- Goods Receipt
- Print Shop Papers
- Quality Inspection عند التفعيل

**GI** يزيد WIP بمواد مصروفة.  
**Confirmation** يحمّل الأنشطة والوقت والهالك.  
**GR** يدخل المنتج النهائي ويخفض WIP.  
**TECO** إغلاق فني وليس ماليًا نهائيًا.  
**Settlement** ينقل WIP/Variance إلى المالية.  
**CLSD** يغلق الأمر نهائيًا.

نجاح الدورة يعتمد على:

- Material Master صحيح.
- BOM معتمدة.
- Routing مضبوط.
- Work Centers مرتبطة بـ Cost Centers.
- Activity Rates محدثة.
- Production Version واضحة.
- معالجة COGI/CO1P.
- مراجعة WIP وVariance.
- تنفيذ Settlement قبل CLSD.
