# 03_SAP_Production_Costing.md
# تكلفة الإنتاج والربط المالي في SAP S/4HANA Manufacturing / PP

## 1. مقدمة

تكلفة الإنتاج في **SAP S/4HANA Manufacturing / PP** ليست تكلفة مواد فقط، بل نتيجة تفاعل بين بيانات الأساس، التخطيط، التنفيذ، المخزون، التحكم بالتكاليف، والتسوية المالية.

العناصر المؤثرة في تكلفة الإنتاج تشمل:

- Material Master
- BOM
- Routing
- Work Center
- Cost Center
- Activity Types
- Production Version
- Production / Process Order
- Goods Issue
- Confirmation
- Goods Receipt
- WIP Calculation
- Variance Calculation
- Settlement
- Universal Journal

فهم التكلفة في SAP ضروري لأي Functional Consultant يعمل على PP أو Manufacturing؛ لأن SAP يربط الإنتاج مباشرة مع **CO** و **FI** من خلال أحداث تشغيلية ومحاسبية مترابطة.

---

## 2. الفكرة الأساسية لتكلفة الإنتاج في SAP

تكلفة الإنتاج في SAP تتحرك بهذا المنطق:

- **BOM** تحدد المواد التي تدخل في المنتج.
- **Routing** يحدد العمليات والوقت والموارد.
- **Work Center** يربط العملية بـ Cost Center وActivity Types.
- **KP26** تحدد أسعار الأنشطة.
- **Production Version** تحدد أي BOM وأي Routing سيتم استخدامهما.
- **Goods Issue** يحمل تكلفة المواد على الأمر.
- **Confirmation** يحمل تكلفة الأنشطة على الأمر.
- **Goods Receipt** يدخل المنتج النهائي إلى المخزون.
- **WIP** يظهر عندما تكون تكلفة الأمر غير مغلقة أو غير مسوّاة.
- **Variance** يظهر عند الفرق بين المخطط والفعلي.
- **Settlement** ينقل WIP أو Variance إلى FI/COPA.
- **Universal Journal** يعكس الأثر المالي في S/4HANA.

```text
Material Master
→ BOM
→ Routing
→ Work Center / Cost Center / Activity Type
→ Production Version
→ Production Order
→ Goods Issue
→ Confirmation
→ Goods Receipt
→ WIP / Variance
→ Settlement
→ Universal Journal / FI / CO
```

> لا يتم هنا اختراع قيود محاسبية تفصيلية. التطبيق التفصيلي يعتمد على إعدادات SAP CO/FI وUniversal Journal.

---

## 3. دور Material Master في تكلفة الإنتاج

| الحقل / View | أثره على تكلفة الإنتاج | أثر الخطأ فيه |
|---|---|---|
| Accounting Views | تحدد بيانات التقييم المالي مثل Valuation Class وPrice Control | قيود مالية أو تقييم مخزون خاطئ |
| Costing Views | تحدد بيانات Cost Estimate مثل Costing Lot Size وWith Quantity Structure | Standard Cost لا يعكس الإنتاج الحقيقي |
| Valuation Class | تربط الصنف بحسابات GL | الأثر المالي يذهب لحساب خاطئ |
| Price Control: Standard Price S | يعتمد على سعر معياري للتقييم والانحرافات | Variance مشوهة إذا السعر غير دقيق |
| Price Control: Moving Average V | يعتمد على متوسط متحرك يتغير مع الحركات | تحليل التكلفة يختلف عن Standard Costing |
| Standard Price | أساس تقييم المنتج في سيناريو Standard Cost | GR وVariance غير دقيقة |
| Moving Average Price | سعر يتغير مع الحركات | تقييم المخزون يتأثر بالحركات |
| Costing Lot Size | كمية أساس لاشتقاق تكلفة الوحدة | تكلفة وحدة غير واقعية |
| With Quantity Structure | يسمح للتكلفة باستخدام BOM وRouting | التكلفة لا تعتمد على المواد والعمليات الفعلية |
| Costing Variant | يضبط طريقة احتساب Standard Cost Estimate | نتائج تكلفة غير متسقة |
| Cost Component Structure | يقسم التكلفة إلى مواد وعمل وآلة وOverhead | تقارير تكلفة ضعيفة |
| Procurement Type | يحدد داخلي الإنتاج أو خارجي الشراء أو مختلط | الصنف قد يحسب كشراء بدل تصنيع أو العكس |
| Strategy Group | يربط التخطيط بـ MTS/MTO | تكلفة ومخزون قد ترتبط بطلب أو مخزون عام بشكل خاطئ |
| Repetitive Manufacturing Flag | يفعل منطق REM عند الحاجة | فشل PCC أو تكلفة period-based |
| Production Storage Location | يحدد موقع الصرف أو الإنتاج | GI من مخزن خاطئ وتكلفة/مخزون غير صحيح |

### لماذا خطأ Material Master قد يفسد تكلفة الإنتاج كاملة؟

لأن Material Master يغذي PP وMM وCO وFI. خطأ في Valuation Class يسبب أثرًا ماليًا خاطئًا، وخطأ في Price Control يغير طريقة تقييم المخزون، وخطأ في Costing Views يجعل Standard Cost Estimate غير موثوق.

---

## 4. دور BOM في تكلفة الإنتاج

| عنصر BOM | أثره على التكلفة | المخاطر |
|---|---|---|
| BOM Header | يضبط الاستخدام، الحالة، الصلاحية، والكمية الأساس | استخدام BOM غير صالحة للتكلفة أو الإنتاج |
| BOM Item | كل مكون يدخل في تكلفة المادة | مكون ناقص أو زائد يغير Standard Cost |
| Component Quantity | تحدد كمية المادة الداخلة في المنتج | صرف وتكلفة مواد خاطئة |
| Base Quantity | أساس احتساب كميات المكونات | تكلفة وحدة مشوهة |
| Component Scrap | يزيد الكمية المطلوبة للمكون | تجاهله يخفض التكلفة نظريًا ويظهر Variance لاحقًا |
| Assembly Scrap | يرفع الاحتياج على مستوى المنتج الأم | تقدير كميات وتكلفة غير دقيق |
| Phantom Items | يفجر مكونات الـ Phantom بدل إنشاء أمر مستقل | هيكل تكلفة غير مفهوم إذا لم يضبط |
| Co-products | تحتاج توزيع تكلفة عبر Apportionment Structure | تكلفة المنتجات المشتركة غير عادلة |
| By-products | قد تخفض تكلفة المنتج الأساسي | عدم تسجيلها يشوه تكلفة العملية |
| Alternative BOM | تغير مكونات المنتج حسب طريقة الإنتاج أو الكمية | اختيار بديل خاطئ يغير التكلفة |
| Validity Dates | تحدد أي BOM أو component صالح للتكلفة | تكلفة مبنية على مكونات قديمة أو مستقبلية |
| Change Master | يحفظ Audit Trail للتغييرات | غياب التتبع يضعف الرقابة على التكلفة |
| BOM Usage | يفرق بين BOM للتصنيع أو التكلفة | استخدام BOM غير مناسبة في Cost Estimate |
| BOM Selection Method | يحدد كيف تختار SAP الـ BOM | اختيار BOM خاطئة في MRP أو Costing |

### إذا كانت BOM خاطئة، ما الذي يتأثر؟

- Standard Cost.
- Inventory Valuation.
- WIP.
- Variance.
- Cost of Goods Sold.
- Settlement.

---

## 5. دور Routing وWork Centers في تكلفة الإنتاج

```text
Routing Operation
→ Work Center
→ Cost Center
→ Activity Type
→ Activity Rate in KP26
→ Activity Quantity
→ Operation Cost
→ Production Order Cost
```

| العنصر | دوره في حساب التكلفة | أثر الخطأ |
|---|---|---|
| Routing | مصدر العمليات والأزمنة التي تدخل في التكلفة | تكلفة أنشطة غير مطابقة للواقع |
| Operation | كل عملية قد تحمل Setup/Machine/Labor | تحليل تكلفة ناقص أو زائد |
| Work Center | يربط العملية بمركز العمل والطاقة والتكلفة | فشل تحميل تكلفة النشاط إذا الربط ناقص |
| Cost Center | مصدر مالي لتكلفة النشاط | لا يمكن تحميل Activity Cost بشكل صحيح |
| Activity Type | يمثل نشاطًا مثل Labor أو Machine أو Setup | نوع تكلفة غير صحيح أو غير موجود |
| Standard Values | كميات/أزمنة معيارية للأنشطة | Planned/Standard Cost خاطئة |
| Setup Time | وقت تجهيز غالبًا مستقل عن الكمية | Lot Size Variance أو تكلفة ثابتة غير دقيقة |
| Machine Time | زمن آلة مرتبط بالكمية | تكلفة آلة غير صحيحة |
| Labor Time | زمن عمالة | تكلفة عمالة غير صحيحة |
| Queue / Wait / Move Times | تؤثر على الجدولة، وقد لا تدخل التكلفة إلا إذا فُعّل ذلك | قد تخلط مع تكلفة تشغيل |
| Control Key | يضبط هل العملية تؤكد أو تُكلف أو تُجدول أو تكون خارجية | عملية لا تدخل التكلفة أو تدخل خطأ |
| Operation Quantity | كمية العملية | حساب Activity Quantity غير دقيق |
| Base Quantity | أساس حساب الأزمنة والكميات | تكلفة وحدة مشوهة |

---

## 6. Cost Center وActivity Type وKP26

| المفهوم | الشرح | أثره على تكلفة الإنتاج |
|---|---|---|
| Cost Center | وحدة تجمع تكلفة داخلية مثل قسم إنتاج أو مركز آلة | مصدر تحميل تكلفة Work Center |
| Activity Type | يصنف النشاط الذي يقدمه Cost Center مثل Setup أو Machine أو Labor | يحول وقت أو كمية النشاط إلى تكلفة |
| KP26 | مكان تسعير Activity Types لكل Cost Center | بدون سعر صحيح تصبح تكلفة النشاط صفر أو خاطئة |
| Secondary Cost Element | عنصر تكلفة داخلي يستخدم في تحميل النشاط | ينقل تكلفة النشاط من Cost Center إلى Production Order |
| Work Center Assignment | ربط Work Center بـ Cost Center | بدونه لا يوجد مصدر مالي للأنشطة |
| Activity Rate | سعر النشاط | الكمية × السعر = تكلفة العملية |
| Activity Quantity | الوقت أو الكمية المسجلة في Routing/Confirmation | تحدد مقدار التكلفة المحملة |
| Actual Activity Posting | تحميل فعلي للنشاط عند Confirmation | يزيد تكلفة Production Order |
| عدم تحديث Activity Rate | السعر قديم أو صفر | تكلفة الأمر غير دقيقة |
| Activity Type غير معرف | لا يوجد نوع نشاط للتحميل | فشل أو نقص في تكلفة العملية |

### لماذا KP26 نقطة حرجة في تكلفة SAP؟

Routing يعطي الكمية أو الزمن، أما KP26 يعطي السعر. إذا كانت أسعار KP26 غير محدثة، فإن تكلفة Confirmation قد تكون صفرية أو غير واقعية، فتظهر Variance غير مفهومة أو تكلفة إنتاج غير موثوقة.

---

## 7. Production Version وأثرها على التكلفة

| عنصر Production Version | أثره على التكلفة |
|---|---|
| BOM Alternative | يحدد مكونات التكلفة المادية |
| Routing / Master Recipe | يحدد تكلفة العمليات والموارد |
| Lot Size Range | يؤثر على اختيار طريقة الإنتاج المناسبة للكمية |
| Validity Period | يضمن أن التكلفة مبنية على نسخة فعالة |
| Production Line في REM | يربط التكلفة بـ PCC/خط الإنتاج عند الحاجة |
| Use in Cost Estimate | يحدد Quantity Structure للتكلفة |
| Use in MRP | يجعل Planned Orders مبنية على طريقة صحيحة |
| Use in Order Creation | ينقل BOM/Routing Snapshot إلى الأمر |

### Production Version كضابط تكلفة وليس فقط ضابط إنتاج

Production Version تحدد أي BOM وأي Routing سيتم تسعيرهما. إذا اختيرت Production Version خاطئة، تصبح Standard Cost خاطئة، ثم تظهر فروقات في GI وConfirmation وGR وSettlement.

---

## 8. Standard Cost Estimate

| عنصر Standard Cost Estimate | مصدره | أثره |
|---|---|---|
| BOM Materials | BOM | تكلفة المواد |
| Routing Activities | Routing وWork Center | تكلفة العمل والآلة والتهيئة |
| Activity Rates | Cost Center + Activity Type + KP26 | تسعير الأنشطة |
| Overhead | Overhead Costing Sheet إن ورد | إضافة تكاليف غير مباشرة |
| Cost Rollup | BOM متعددة المستويات | يجمع تكلفة كل المستويات |
| Cost Component Split | Cost Component Structure | يفصل التكلفة إلى مكونات تحليلية |
| Costing Variant | إعداد التكلفة | يضبط طريقة حساب التكلفة |
| Valuation Variant | مصادر الأسعار | يحدد من أين تأتي أسعار المواد والأنشطة |
| Costing Type | نوع التكلفة | يحتاج تحقق إضافي من المصدر الأصلي |
| Costing Lot Size | Material Master Costing View | يؤثر على تكلفة الوحدة |
| Standard Price | نتيجة اعتماد التكلفة | يدخل في تقييم المنتج النهائي |

```text
BOM Materials
+ Routing Activities
+ Overhead
→ Cost Rollup
→ Cost Component Split
→ Standard Cost Estimate
→ Standard Price
```

---

## 9. Cost Component Split

| Cost Component | مصدره المحتمل | فائدته في التحليل |
|---|---|---|
| Material | BOM وMaterial Prices | معرفة وزن المواد في تكلفة المنتج |
| Labor | Routing / Activity Type | تحليل تكلفة العمالة |
| Machine | Routing / Activity Type | تحليل تكلفة الآلات |
| Setup | Standard Values وActivity Type | تمييز تكلفة التهيئة |
| Overhead | Overhead Costing Sheet | تحليل التكاليف غير المباشرة |
| Subcontract / External Operation | Control Key أو عمليات خارجية إن وجدت | يحتاج تحقق إضافي من المصدر الأصلي |
| Scrap | Scrap settings أو actual scrap | تحليل فاقد الإنتاج |
| Other | حسب إعداد SAP | يحتاج تحقق إضافي من المصدر الأصلي |

Cost Component Split يفيد الإدارة لأنه لا يعطي رقم تكلفة واحد فقط، بل يوضح مصدر التكلفة: مواد، عمل، آلة، Overhead، أو غيرها.

---

## 10. Planned Cost vs Actual Cost

| البند | Planned Cost | Actual Cost |
|---|---|---|
| المصدر | BOM + Routing + Production Version + Standard Values | GI + Confirmation + GR adjustments وربما حركات أخرى |
| متى تظهر؟ | عند إنشاء أو Release أمر الإنتاج | أثناء التنفيذ الفعلي |
| علاقتها بالأمر | تمثل التوقع قبل التنفيذ | تمثل ما حدث فعليًا على الأمر |
| أثرها على WIP | مرجع للمقارنة أو target | تدخل في WIP عند GI وConfirmation |
| أثرها على Variance | تقارن مع الفعلي أو target | مصدر الانحرافات عند الاختلاف |
| المخاطر | إذا كانت Master Data خاطئة تصبح planned cost غير مفيدة | إذا كان التنفيذ أو التسجيل خاطئًا تصبح actual cost غير موثوقة |

---

## 11. Product Cost by Order

Product Cost by Order يستخدم عندما تكون تكلفة كل Production Order أو Process Order مهمة بحد ذاتها، وهو مناسب خصوصًا للتصنيع المنفصل والعمليات التي تحتاج تتبع أمر.

| الحدث | أثره على تكلفة الأمر |
|---|---|
| Create / Release | إنشاء Planned Cost بناءً على BOM/Routing |
| Goods Issue | تحميل تكلفة المواد على الأمر |
| Confirmation | تحميل تكلفة الأنشطة مثل Labor وMachine |
| Goods Receipt | إدخال المنتج النهائي وتخفيض/مقابلة تكلفة الأمر |
| WIP Calculation | إظهار تكلفة غير مكتملة إذا لم يغلق الأمر |
| Variance Calculation | إظهار الفرق بين Target/Actual |
| TECO | يمهد لحساب الانحراف والتسوية |
| Settlement | ينقل WIP أو Variance إلى FI/COPA أو المستقبل المناسب |
| CLSD | إغلاق نهائي يمنع حركات أو تسويات لاحقة |

---

## 12. Product Cost by Period وProduct Cost Collector

| البند | Product Cost by Order | Product Cost by Period / PCC |
|---|---|---|
| كائن التكلفة | Production Order أو Process Order | Product Cost Collector |
| متى يستخدم؟ | Discrete أو Process مع تتبع أمر | REM أو إنتاج متكرر |
| WIP | على مستوى الأمر | Period-based WIP على PCC |
| Variance | عند DLV/TECO أو نهاية الفترة | Period-based Variance |
| Settlement | تسوية الأمر | تسوية PCC |
| المخاطر | أوامر مفتوحة كثيرة | PCC غير مضبوط أو Backflush غير دقيق |

PCC يجمع بيانات الكميات والاستهلاك والأنشطة على فترة، وهذا مناسب للإنتاج المتكرر حيث لا تكون كل دفعة أمرًا مستقلًا.

---

## 13. Goods Issue وأثره على التكلفة

| حركة GI | الأثر المخزني | الأثر على WIP | الأثر المالي |
|---|---|---|---|
| 261 Goods Issue | ينقص مخزون المواد الخام | يزيد WIP أو تكلفة الأمر | ينتج أثرًا ماليًا حسب Valuation/Universal Journal |
| 262 Reversal | يزيد مخزون المادة | يخفض WIP أو يعكس تكلفة الصرف | يعكس الأثر المالي |
| Manual Issue | صرف يدوي مضبوط بالمستخدم | يزيد تكلفة الأمر عند الترحيل | يعتمد على دقة الإدخال |
| Backflush | صرف تلقائي عند Confirmation أو GR | يزيد WIP تلقائيًا | قد يفشل ويظهر في COGI |
| Batch / Serial Issue | يحفظ تتبع الدفعة أو الوحدة | يربط التكلفة بالتتبع | مهم للجودة والرقابة |

| الحالة | أثرها على التكلفة |
|---|---|
| صرف مطابق لـ BOM | تكلفة مواد متوقعة ومنضبطة |
| صرف زائد | يزيد Actual Cost وقد ينتج Input Quantity Variance |
| صرف ناقص | يخفض actual material cost ظاهريًا وقد يخفي نقص تنفيذ |
| صرف مادة بديلة | قد ينتج Variance أو يحتاج تفسير |
| فشل Backflush | COGI يظهر وحركة المواد لا تكتمل؛ WIP والتكلفة غير موثوقين حتى المعالجة |
| مرتجع 262 | يعكس جزءًا من تكلفة المواد ويخفض WIP |

---

## 14. Confirmation وأثره على التكلفة

| البيان المسجل في Confirmation | أثره على التكلفة |
|---|---|
| Activity Quantities | تضرب في Activity Rates لتحميل تكلفة العمل/الآلة على الأمر |
| Setup Time | يعطي تكلفة تهيئة قد تكون ثابتة نسبيًا |
| Machine Time | يحمل تكلفة الآلة |
| Labor Time | يحمل تكلفة العمالة |
| Yield Quantity | تحدد الكمية الجيدة وقد تؤثر على DLV/GR |
| Scrap Quantity | تؤدي إلى Scrap Variance أو تحليل جودة |
| Rework Quantity | تكشف تكلفة إعادة تشغيل محتملة |
| Personnel Number | يدعم تحليل من نفذ العمل |
| Posting Date | يحدد الفترة المالية |
| Reason for Variance | يفسر الفروقات |
| Automatic Goods Issue | قد يفعل Backflush |
| Auto Goods Receipt | قد يدخل المنتج النهائي تلقائيًا |
| Actual Activity Posting | يحمل تكلفة النشاط على الأمر |

### لماذا Confirmation هو جسر الورشة إلى التكلفة؟

لأن ما يحدث على أرض المصنع لا يدخل التكلفة بمجرد حدوثه فعليًا، بل عند تسجيله. إذا سجّل المستخدم وقتًا خاطئًا أو كمية Scrap غير صحيحة أو لم يسجل Activity Quantities، فإن تكلفة الأمر والانحرافات والتقارير ستعكس بيانات خاطئة.

---

## 15. Goods Receipt وأثره على التكلفة

| البند | أثره عند GR |
|---|---|
| Movement Type 101 | يزيد Finished Goods Inventory |
| Movement Type 102 | يعكس الاستلام |
| Finished Goods Inventory | يزداد بقيمة المنتج المستلم |
| WIP | ينخفض أو تتم مقابلته بقيمة المنتج المستلم |
| Standard Price | في سيناريو Standard Cost يتم تقييم الاستلام بالسعر المعياري |
| Moving Average | يتأثر تقييم المخزون حسب المتوسط المتحرك |
| Auto GR | يدخل المنتج تلقائيًا عند Confirmation إذا كان مفعّلًا |
| Quality Inspection | قد يضع المنتج في Quality Inspection Stock |
| PDLV | استلام جزئي، ويبقى جزء من الأمر مفتوحًا |
| DLV | استلام نهائي، ويمهد لـ TECO/Variance/Settlement |

| Price Control | أثر GR على التقييم |
|---|---|
| Standard Price S | المنتج النهائي يُقيّم وفق Standard Price، والفروقات تظهر لاحقًا كـ Variance |
| Moving Average V | التقييم يتأثر بمتوسط السعر المتحرك؛ التفاصيل تعتمد على إعدادات SAP |

---

## 16. WIP في SAP

```text
GI
→ Increase WIP

Confirmation
→ Add Activity Cost

GR
→ Reduce WIP / Increase Finished Goods

Period-End
→ WIP Calculation
→ Settlement
→ FI / Universal Journal
```

| الحدث | أثره على WIP | أثره المالي |
|---|---|---|
| Goods Issue | يزيد WIP بقيمة المواد المصروفة | تحميل Material Cost على الأمر |
| Confirmation | يزيد WIP بقيمة الأنشطة | Activity Allocation / Actual Activity Posting |
| Goods Receipt | يخفض WIP أو يقابله بزيادة Finished Goods | إدخال المنتج النهائي |
| TECO / DLV | قد يلغي WIP ويمهد لVariance | الانتقال نحو التسوية |
| WIP Calculation | يحسب WIP في Period-End | WIP قد يظهر كأصل في الميزانية |
| Settlement | ينقل WIP أو يلغي أثره حسب الحالة | FI/COPA/Universal Journal |
| Orders مفتوحة | تراكم WIP غير مبرر | ميزانية غير واقعية وإغلاق فترة متأخر |

- WIP at Actual Cost يرتبط بـ Product Cost by Order.
- WIP at Target Cost ورد في سياق Product Cost by Period.
- التفاصيل التطبيقية تحتاج تحقق إضافي من المصدر الأصلي عند إعداد النظام.

---

## 17. Variance في SAP

| نوع الانحراف | السبب | ماذا يكشف؟ | من يراجعه؟ | الإجراء المحتمل |
|---|---|---|---|---|
| Input Quantity Variance | استهلاك كمية مواد مختلفة | BOM غير دقيقة أو صرف زائد/ناقص | الإنتاج ومحاسب التكاليف | مراجعة BOM والاستهلاك |
| Input Price Variance | سعر مادة مختلف | تقييم أو أسعار شراء مختلفة | CO والمشتريات | مراجعة الأسعار وValuation |
| Resource Usage Variance | استخدام موارد أكثر أو أقل | Routing أو تنفيذ غير دقيق | الإنتاج وCO | مراجعة Routing وConfirmation |
| Resource Price Variance | Activity Rate مختلف | KP26 أو Cost Center Rate غير مناسب | CO | تحديث أسعار الأنشطة |
| Scrap Variance | هالك مختلف عن المتوقع | مشكلة جودة أو عملية | الجودة والإنتاج | تحليل أسباب Scrap |
| Lot Size Variance | حجم دفعة مختلف عن أساس التكلفة | تكلفة ثابتة موزعة على كمية مختلفة | CO والإنتاج | مراجعة Lot Size وCosting Lot Size |
| Remaining Variance | فرق متبقٍ غير مصنف | حاجة لتحليل أعمق | CO | تحليل تفصيلي |
| Material Substitution Variance | استخدام مادة بديلة | استنتاج وظيفي مبني على منطق المقال | الإنتاج وCO | مراجعة سياسة البدائل |

### الانحرافات ليست مشكلة محاسبية فقط

Variance تكشف مشاكل في BOM أو Routing أو Activity Rates أو Scrap أو Confirmation. لذلك يجب أن تراجع مع الإنتاج والجودة والمحاسبة، لا مع المالية فقط.

---

## 18. Settlement في SAP

| المفهوم | الشرح | الأثر المالي |
|---|---|---|
| Settlement | تسوية تكلفة أمر أو PCC | ينقل WIP أو Variance ماليًا |
| لماذا لا يكفي Goods Receipt؟ | GR يدخل المنتج لكنه لا يحسم كل الفروقات | تبقى Variance أو WIP |
| لماذا لا يكفي TECO؟ | TECO إغلاق فني وليس تسوية مالية | لا ينقل الأثر النهائي وحده |
| Settlement Rule | قاعدة تحدد أين تسوى التكلفة | تحدد المستقبل المالي |
| Settlement Receiver | المستقبل مثل Material أو COPA أو GL حسب الإعداد | تحديد أين يظهر الأثر |
| Settlement Profile | إعداد يضبط آلية التسوية | يحدد المسموح والمطلوب |
| عدم تنفيذ Settlement | يبقي WIP أو Variance على الأمر | تشويه القوائم والتقارير |
| Period-End Closing | مرحلة تنفيذ WIP/Variance/Settlement | إغلاق مالي صحيح |
| Universal Journal | يعكس التسوية في S/4HANA | يربط CO وFI |
| Product Cost by Order | Settlement على مستوى الأمر | مناسب للأوامر المنفردة |
| Product Cost by Period / PCC | Settlement على مستوى PCC والفترة | مناسب لـ REM |

### لماذا Settlement هو الحدث المالي الحاسم في SAP؟

لأن GI وConfirmation وGR تسجل أحداثًا مهمة، لكن Settlement هو الذي ينقل النتيجة النهائية للتكلفة والانحرافات إلى المالية أو COPA.

---

## 19. TECO وCLSD وأثرهما المالي

| البند | TECO | CLSD |
|---|---|---|
| الغرض | إغلاق فني للأمر | إغلاق نهائي |
| الأثر التشغيلي | ينهي التنفيذ ويفرج الحجوزات المتبقية | يمنع الحركات والتعديلات |
| الأثر المالي | يمهد لـ Variance/Settlement | لا يسمح بتسويات لاحقة عادة |
| هل يسمح بحركات لاحقة؟ | غالبًا يقيّد الحركات التنفيذية | لا |
| العلاقة بـ Settlement | يسمح أو يمهد للتسوية | يجب أن يأتي بعد المعالجة والتسوية |
| الخطر | TECO مبكر يخفي احتياجات أو يمنع استكمال | CLSD قبل Settlement أو COGI/CO1P يغلق أخطاء |

---

## 20. Event-Based Production Cost Posting

Event-Based Production Cost Posting في S/4HANA Cloud ينشئ قيود WIP عند حدوث الأحداث مثل GI أو Confirmation، بدل الانتظار الكامل لـ Period-End التقليدي. وهو افتراضي في Cloud، ومتاح في On-Premise / Private Cloud مع Universal Parallel Accounting — UPA حسب ما ورد.

| البند | Event-Based | Period-End Traditional |
|---|---|---|
| توقيت الاعتراف | عند حدوث GI أو Confirmation أو إكمال الأمر | في نهاية الفترة |
| WIP | ينشأ مباشرة عند الأحداث | يحسب في Period-End |
| Variance | قد تحسب فور إكمال الأمر | تحسب في نهاية الفترة أو بعد DLV/TECO حسب السيناريو |
| Universal Journal | يعكس القيود مبكرًا | يعكسها بعد حسابات نهاية الفترة |
| التعقيد | يسهل Period Close لكنه يحتاج إعداد وفهم | أكثر تقليدية ومألوفة |

تفاصيل التفعيل والإعداد التفصيلي تحتاج تحقق إضافي من المصدر الأصلي.

---

## 21. Universal Journal والربط المالي

| الحدث | الأثر المالي المفهومي | أين يظهر؟ |
|---|---|---|
| Goods Issue | خروج Raw Material وتحميل تكلفة على أمر/WIP | Universal Journal / FI / CO حسب الإعداد |
| Confirmation | تحميل Activity Cost مثل Labor أو Machine | Universal Journal مع أبعاد CO |
| Goods Receipt | زيادة Finished Goods Inventory وتخفيض/مقابلة WIP | Universal Journal |
| WIP Calculation | إثبات WIP كأصل أو قيمة تحت التشغيل | FI/Universal Journal عند الترحيل |
| Variance Calculation | تحديد فروقات الأداء والتكلفة | CO ثم Settlement |
| Settlement | نقل WIP أو Variance إلى Settlement Receiver أو COPA/FI | Universal Journal |
| CLSD | حالة نهائية لا تولد بالضرورة قيدًا بذاتها | تأثيرها حوكمي وإقفالي |

تنبيه: الحسابات التفصيلية تعتمد على إعدادات SAP CO/FI وUniversal Journal.

---

## 22. Process Order Costing

| البعد | Production Order Costing | Process Order Costing |
|---|---|---|
| بيانات التصنيع | BOM + Routing | BOM + Master Recipe |
| وحدة التنفيذ | Operation | Operation + Phase |
| مورد التنفيذ | Work Center | Resource |
| التأكيد | Operation/Header Confirmation | غالبًا على Phase |
| Batch Management | اختياري حسب الصنف | مركزي وشائع في الصناعات العملياتية |
| Co-products / By-products | أقل شيوعًا | مهم ويحتاج Apportionment Structure |
| GI | صرف مكونات للأمر | صرف مواد للـ Process Order/Phase |
| Confirmation | تحميل أنشطة | تحميل أنشطة على Phase/Resource |
| GR | استلام المنتج النهائي | استلام المنتج والمنتجات المشتركة أو الجانبية |
| الجودة | Inspection Lots عند الحاجة | مهمة في الأغذية/الأدوية/الكيماويات |
| التكلفة | على الأمر | على الأمر مع تعقيد batch/co-products |

---

## 23. Repetitive Manufacturing Costing

| العنصر | أثره على تكلفة REM |
|---|---|
| Product Cost Collector | يجمع تكلفة المنتج/الخط على فترة |
| Run Schedule Quantity | يمثل كمية تشغيل بدل أمر تقليدي |
| Backflush | يصرف المواد تلقائيًا عند التسجيل |
| Auto GR | يدخل المنتج النهائي تلقائيًا |
| Reporting Points | تسجل تقدم مراحل محددة |
| Period-Based WIP | WIP يحسب على PCC/الفترة |
| Period-Based Variance | Variance تحسب على PCC/الفترة |
| Settlement على PCC | ينقل WIP/Variance ماليًا حسب الفترة |

---

## 24. Kanban Costing

| البند | Kanban |
|---|---|
| كائن التنفيذ | Control Cycle / Container |
| الفلسفة | تجديد حسب الاستهلاك الفعلي |
| الأثر على المخزون | تحريك مواد بين PSA والمصدر أو تجديدها |
| WIP | لا يوجد عادةً WIP مثل Production Order حسب جدول المقارنة في المقال |
| التكلفة | أبسط من تكلفة الأمر، والتفاصيل تحتاج تحقق إضافي من المصدر الأصلي |
| متى يستخدم؟ | مواد منخفضة القيمة عالية التداول |
| المخاطر | ضعف ضبط Control Cycle يؤدي إلى نقص أو فائض مواد |

تفاصيل التكلفة المالية الدقيقة لـ Kanban تحتاج تحقق إضافي من المصدر الأصلي.

---

## 25. Period-End Closing في الإنتاج

| بند المراجعة | لماذا مهم؟ | أثر الإهمال |
|---|---|---|
| WIP Calculation | إثبات قيمة الإنتاج غير المكتمل | ميزانية غير دقيقة |
| Variance Calculation | تحليل الفرق بين الفعلي والمستهدف | أداء مخفي |
| Settlement | نقل WIP/Variance ماليًا | تكلفة تبقى على الأمر |
| COGI | أخطاء Backflush وحركات مواد فاشلة | مخزون وتكلفة غير مكتملة |
| CO1P | تكاليف أو حركات معلقة | تأخير الإغلاق |
| Orders غير مغلقة | تراكم WIP | Asset غير حقيقي |
| Confirmations خاطئة | تكلفة أنشطة غير صحيحة | Variance مشوهة |
| GR غير مكتمل | أوامر لا تصل DLV | WIP مفتوح |
| TECO | يمهد للتسوية | أوامر تبقى نشطة |
| CLSD | إغلاق نهائي بعد المعالجة | إغلاق مبكر يمنع التصحيح |
| Production-to-FI Reconciliation | مطابقة الإنتاج مع المالية | عدم ثقة في الأرقام |

---

## 26. تقارير التكلفة والرقابة

| التقرير | المستخدم | فائدته | القرار الناتج |
|---|---|---|---|
| Order Cost Display | محاسب التكاليف / الإنتاج | عرض تكلفة الأمر | هل تكلفة الأمر منطقية؟ |
| Cost Analysis | محاسب التكاليف | تحليل planned/actual/variance | تحديد سبب الفروقات |
| WIP Report | CO/FI | متابعة الإنتاج غير المكتمل | هل WIP مبرر؟ |
| Variance Report | CO والإدارة | تحليل الانحرافات | تحسين BOM/Routing/Execution |
| Settlement Report | CO/FI | التحقق من التسوية | هل تم نقل الأثر المالي؟ |
| COGI | الإنتاج/المخازن/ERP | أخطاء Backflush | ما الحركات التي يجب تصحيحها؟ |
| CO1P | Cost Accountant / ERP | Pending Costs أو Postprocessing | ما الذي يمنع الإغلاق؟ |
| Production Order Status Report | الإنتاج وCO | حالات الأوامر | ما الأوامر التي تحتاج TECO/Close؟ |
| Production-to-FI Reconciliation | المالية وCO | مطابقة الإنتاج مع المالية | هل Universal Journal يعكس التشغيل؟ |
| Cost Component Split Report | الإدارة وCO | تفصيل مكونات التكلفة | أين ترتفع تكلفة المنتج؟ |
| Product Cost Collector Report | CO/REM | متابعة PCC | هل تكلفة الفترة منطقية؟ |
| COOIS | الإنتاج وCO | قائمة أوامر الإنتاج وتحليلها | متابعة أوامر وتكاليف وحالات |

---

## 27. مثال رقمي مبسط لتكلفة الإنتاج

المقال لا يقدم مثالًا رقميًا تفصيليًا كافيًا، لذلك المثال التالي **مثال توضيحي مستنتج وظيفيًا من منطق المقال وليس رقمًا رسميًا من SAP**.

| العنصر | الكمية | التكلفة | الإجمالي |
|---|---:|---:|---:|
| مادة خام A من BOM | 10 وحدات | 2 | 20 |
| مادة خام B من BOM | 5 وحدات | 3 | 15 |
| Machine Activity من Routing | 2 ساعة | 8 | 16 |
| Labor Activity من Routing | 3 ساعات | 5 | 15 |
| Overhead | يحتاج إعداد | يحتاج تحقق | يحتاج تحقق إضافي من المصدر الأصلي |
| الإجمالي التوضيحي |  |  | 66 |

| الحدث | الأثر |
|---|---|
| Goods Issue | صرف A وB وزيادة WIP بتكلفة المواد |
| Confirmation | إضافة تكلفة Machine وLabor إلى الأمر |
| Goods Receipt | إدخال المنتج النهائي وتقليل WIP |
| Variance | إذا كانت الكميات أو الساعات الفعلية مختلفة عن المخطط تظهر فروقات |
| Settlement | نقل WIP أو Variance ماليًا |

| الفرق | نوع الانحراف المحتمل |
|---|---|
| استهلاك 12 وحدة بدل 10 من A | Input Quantity Variance |
| سعر A تغير من 2 إلى 2.5 | Input Price Variance |
| استخدام 4 ساعات Labor بدل 3 | Resource Usage Variance |
| سعر Labor في KP26 غير محدث | Resource Price Variance |
| Scrap أعلى من المتوقع | Scrap Variance |
| إنتاج كمية أقل من أساس التكلفة | Lot Size / Remaining Variance حسب الحالة |

---

## 28. أسئلة تحليل العميل المتعلقة بتكلفة الإنتاج في SAP

| المجال | السؤال | لماذا مهم؟ | أثر الإجابة على التصميم |
|---|---|---|---|
| سياسة التكلفة | هل تستخدمون Standard Price أم Moving Average؟ | يحدد طريقة تقييم المخزون | اختيار Price Control وتفسير Variance |
| سياسة التكلفة | هل لديكم Standard Cost Estimate؟ | أساس تقييم المنتج | إعداد Product Cost Planning |
| سياسة التكلفة | من يعتمد تكلفة المنتج؟ | حوكمة | Workflow اعتماد التكلفة |
| سياسة التكلفة | متى يتم تحديث الأسعار؟ | دقة التكلفة | جدولة تحديث KP26/Standard Cost |
| Master Data | هل Material Master مكتمل؟ | أساس كل التكلفة | Checklist بيانات |
| Master Data | هل Valuation Class صحيحة؟ | الحسابات المالية | FI/CO mapping |
| Master Data | هل Costing Views مكتملة؟ | Standard Cost | Costing setup |
| BOM / Routing | هل BOM دقيقة؟ | Material Cost | اعتماد BOM |
| BOM / Routing | هل Routing يعكس الواقع؟ | Activity Cost | مراجعة العمليات |
| BOM / Routing | هل Work Center مربوط بـ Cost Center؟ | تحميل النشاط | إعداد Cost Centers |
| BOM / Routing | هل Activity Types مسعّرة في KP26؟ | تكلفة الموارد | تحديث Rates |
| Production Version | هل توجد Production Version لكل منتج؟ | اختيار BOM/Routing | إلزامية قبل MRP/Costing |
| Production Version | هل تحدد BOM/Routing الصحيحين؟ | دقة التكلفة | Audit |
| Execution | هل يتم GI يدويًا أم Backflush؟ | أثر على COGI والدقة | تصميم الصرف |
| Execution | هل يتم Confirmation لكل عملية؟ | دقة Activity Cost | تصميم التسجيل |
| Execution | هل يوجد Auto GR؟ | أثر على الجودة والمخزون | ضبط Work Scheduling/QM |
| WIP / Variance | هل تراجعون WIP؟ | الميزانية | تقارير WIP |
| WIP / Variance | هل تحسبون Variance؟ | تحسين الأداء | Variance Reports |
| WIP / Variance | من يراجع الانحرافات؟ | مسؤولية التحسين | اجتماع CO/Production |
| Settlement / Closing | هل يتم Settlement شهريًا؟ | نهاية الأثر المالي | Period-End Procedure |
| Settlement / Closing | متى يتم TECO؟ | إغلاق فني | سياسة حالات |
| Settlement / Closing | متى يتم CLSD؟ | إغلاق نهائي | منع الإغلاق المبكر |
| Settlement / Closing | كيف تتم معالجة COGI وCO1P؟ | منع أخطاء معلقة | تقارير وتحكم يومي |

---

## 29. Checklist لتطبيق تكلفة الإنتاج في SAP

| نقطة التحقق | لماذا مهمة؟ | المسؤول | الخطر إذا لم تتحقق |
|---|---|---|---|
| Material Master مكتمل | أساس التخطيط والتكلفة | Master Data / PP | تكلفة ومخزون خاطئ |
| Accounting Views صحيحة | تقييم وحسابات | FI/CO | قيود خاطئة |
| Costing Views صحيحة | Standard Cost | CO | تكلفة غير دقيقة |
| Valuation Class صحيحة | ربط GL | FI | حسابات خاطئة |
| Price Control مناسب | طريقة التقييم | FI/CO | Variance غير مفهومة |
| BOM معتمدة وصحيحة | Material Cost | Engineering/PP | صرف وتكلفة خاطئة |
| Routing صحيح | Activity Cost | Production Engineering | تكلفة عمليات خاطئة |
| Work Centers مربوطة بـ Cost Centers | تحميل الأنشطة | PP/CO | فشل تكلفة النشاط |
| Activity Types معرفة | تصنيف النشاط | CO | تكلفة ناقصة |
| Activity Rates محدثة في KP26 | تسعير النشاط | CO | تكلفة صفرية أو خاطئة |
| Production Version صحيحة | اختيار BOM/Routing | PP | MRP/Costing خاطئ |
| Standard Cost Estimate منفذ | سعر معياري | CO | تقييم مخزون غير معتمد |
| Cost Component Split مفهوم | تحليل تكلفة | CO/Management | عدم فهم مصدر التكلفة |
| GI مختبر | صرف مواد | Warehouse/PP | WIP غير صحيح |
| Confirmation مختبر | تحميل أنشطة | Production | Actual Cost غير صحيح |
| GR مختبر | استلام المنتج | Warehouse/QM | Finished Goods غير صحيح |
| Backflush مختبر | صرف تلقائي | PP/Warehouse | COGI |
| COGI/CO1P مراجعة | منع حركات معلقة | ERP/CO | إغلاق فترة متأخر |
| WIP Calculation مفهوم | قيمة تحت التشغيل | CO/FI | ميزانية مشوهة |
| Variance Calculation مفهوم | تحليل الأداء | CO/Production | فروقات غير مفسرة |
| Settlement Procedure واضح | نقل الأثر المالي | CO/FI | WIP/Variance عالق |
| TECO/CLSD Policy واضحة | حوكمة الإغلاق | Production/CO | إغلاق مبكر أو متأخر |
| Period-End Closing مختبر | إغلاق مالي | FI/CO | فشل إغلاق |
| المالية وافقت على السيناريو | قبول الأرقام | FI/CO | رفض النتائج بعد التشغيل |

---

## 30. أخطاء ومخاطر تكلفة الإنتاج

| الخطر | أثره المالي | كيف نمنعه؟ |
|---|---|---|
| Material Master خاطئ | تكلفة ومخزون وحسابات خاطئة | مراجعة Master Data قبل التشغيل |
| Valuation Class خاطئ | GL خاطئ | اعتماد FI |
| Price Control غير مناسب | تقييم غير متوافق | سياسة تكلفة واضحة |
| BOM خاطئة | Standard Cost وWIP وVariance خاطئة | اعتماد هندسي |
| Routing خاطئ | تكلفة نشاط خاطئة | مراجعة العمليات |
| Production Version خاطئة | اختيار BOM/Routing غير مناسب | فحص PV لكل منتج |
| Work Center بدون Cost Center | لا تحميل تكلفة نشاط | ربط Work Center بـ CO |
| Activity Rate غير محدث في KP26 | تكلفة موارد غير دقيقة | تحديث دوري |
| Standard Cost Estimate غير صحيح | تقييم مخزون غير موثوق | مراجعة Cost Rollup |
| GI زائد أو ناقص | WIP وVariance غير صحيحة | ضبط الصرف |
| Backflush يفشل | حركات معلقة | تنظيف COGI |
| COGI غير معالج | مخزون وتكلفة غير مكتملة | متابعة يومية |
| CO1P غير معالج | تكاليف معلقة | إجراء إغلاق |
| Confirmation خاطئ | Activity Cost خاطئة | تدريب ومراجعة |
| Auto GR قبل الجودة | Finished Goods غير مفحوص | ضبط QM |
| WIP غير محسوب | ميزانية غير دقيقة | Period-End checklist |
| Variance غير مراجع | أداء مخفي | تحليل شهري |
| Settlement غير منفذ | WIP/Variance عالق | إجراء Settlement دوري |
| CLSD قبل المعالجة | منع التصحيح | Checklist قبل CLSD |
| Period-End Closing ضعيف | تأخير أو أرقام غير موثوقة | مسؤوليات واضحة وتقارير |

---

## 31. ماذا نستفيد من SAP في نظام ERP محلي مثل ناتج؟

| درس من SAP | كيف يمكن تطبيقه في ERP محلي؟ | الأولوية |
|---|---|---|
| لا يكفي صرف مواد واستلام منتج | يجب تسجيل أحداث منفصلة: GI، Confirmation، GR، Close | حرجة |
| وجود تكلفة معيارية أو مخططة | بناء Planned Cost من BOM وRoute | عالية |
| ربط BOM بالتكلفة | كل مكون له كمية وسعر وأثر | حرجة |
| ربط Route/Work Center بتكلفة تشغيل | إذا العميل يحتاج تكلفة عمالة/آلة | عالية |
| وجود WIP أو بديل واضح | عدم إغلاق التكلفة فور الصرف | عالية |
| الفرق بين Planned وActual | مقارنة التنفيذ بالخطة | عالية |
| وجود Variance | تحليل فروقات مواد وموارد وهالك | متوسطة إلى عالية |
| Settlement أو إغلاق تكلفة الأمر | إجراء يحسم WIP/Variance | حرجة |
| تقارير أخطاء مثل COGI/CO1P | قائمة حركات فاشلة أو معلقة | عالية |
| عدم فرض تعقيد SAP كاملًا | تطبيق تدريجي حسب حجم العميل | حرجة |
| البدء بتكلفة بسيطة ثم التدرج | BOM Cost أولًا ثم Activity Cost ثم WIP/Variance | عملية |

---

## 32. ملخص تنفيذي

تكلفة الإنتاج في SAP تعتمد على **Material Master وBOM وRouting وProduction Version** قبل أن تعتمد على أوامر الإنتاج نفسها.

- **Standard Cost Estimate** هو أساس تقييم المنتج في كثير من السيناريوهات.
- **BOM** تحدد تكلفة المواد.
- **Routing** يحدد تكلفة العمليات.
- **Work Center + Cost Center + Activity Type + KP26** تحدد تكلفة الموارد.
- **Goods Issue** يحمل تكلفة المواد على الأمر.
- **Confirmation** يحمل تكلفة الأنشطة.
- **Goods Receipt** يدخل المنتج النهائي ويخفض WIP.
- **WIP** و **Variance** لا يكتملان دون Period-End وSettlement في السيناريو التقليدي.
- **Settlement** هو الحدث الذي ينقل الأثر المالي النهائي.
- **Universal Journal** يربط FI وCO في S/4HANA.
- أخطر مناطق الفشل: Master Data، Activity Rates، Production Version، Backflush، Confirmation، Settlement.
- فهم تكلفة SAP يعطي مستشار ERP نموذجًا قويًا لتصميم تكلفة إنتاج في أي نظام محلي، بشرط عدم نسخ تعقيد SAP حرفيًا دون حاجة.
