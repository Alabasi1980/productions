# 10_SAP_Functional_to_Technical_Design.md
# تحويل عمليات الإنتاج في SAP إلى منطق نظام قابل للتنفيذ برمجيًا

## 1. مقدمة

هذا الملف يحوّل مفاهيم **SAP S/4HANA Manufacturing / PP** إلى منطق وظيفي يمكن شرحه لفريق البرمجة عند بناء أو تحسين Module إنتاج داخل نظام ERP محلي.

الهدف ليس كتابة كود، بل توضيح ما يجب أن يحدث في النظام عند كل خطوة إنتاجية:

- ما البيانات المطلوبة.
- ما شروط السماح أو المنع.
- ما الحركة التي يجب إنشاؤها.
- ما أثر العملية على التخطيط.
- ما أثرها على المخزون.
- ما أثرها على WIP.
- ما أثرها على التكلفة.
- ما أثرها على Settlement.
- ما أثرها على المالية.
- ما الحالات الاستثنائية التي يجب التعامل معها.
- ما الأخطاء التي يجب أن تظهر للمستخدم أو لفريق الدعم.
- ما التقارير والـAudit المطلوبين لضمان الرقابة.

```text
Material Master
→ BOM
→ Routing / Work Center
→ Production Version
→ MRP
→ Planned Order
→ Production / Process Order
→ Release
→ Goods Issue
→ Confirmation
→ Goods Receipt
→ TECO
→ WIP / Variance
→ Settlement
→ CLSD
→ Universal Journal / FI / CO
```

> عند تحويل هذا المنطق إلى نظام محلي مثل ناتج، لا يجب نسخ تعقيد SAP كاملًا، بل أخذ المنطق المؤسسي وتبسيطه حسب حجم العميل.

---

## 2. الفرق بين الفهم الوظيفي والفهم التقني

| ما يقوله العميل | ما يجب أن يفهمه المبرمج |
|---|---|
| أريد إنتاج صنف | يجب وجود Material Master صالح للإنتاج، وBOM، وRouting، وProduction Version أو بديل واضح |
| أريد صرف مواد | يجب إنشاء Goods Issue مرتبطة بأمر إنتاج وبمكونات الأمر وموقع تخزين وحركة 261 |
| أريد تسجيل الإنتاج | يجب إنشاء Confirmation مع Yield/Scrap/Activity Quantities وقد ينتج عنها Backflush أو Auto GR |
| أريد استلام المنتج النهائي | يجب إنشاء Goods Receipt بحركة 101 وزيادة Finished Goods وربما Quality Stock |
| أريد إغلاق الأمر | يجب التمييز بين TECO الفني وSettlement المالي وCLSD النهائي |
| أريد معرفة تكلفة المنتج | يجب ربط BOM بالمواد وRouting بالأنشطة وWork Center بـCost Center وActivity Type وRate |
| أريد تخطيط الإنتاج | يجب وجود MRP يقرأ Demand وStock وBOM وProduction Version وينتج Planned Orders |
| أريد معالجة أخطاء الصرف التلقائي | يجب وجود COGI-like Error Record وسجل إعادة معالجة |
| أريد تقارير مالية | يجب ربط GI/Confirmation/GR/Settlement بأثر FI/CO أو Universal Journal-like |

الفهم الوظيفي يصف ما يريده المستخدم.  
الفهم التقني يحدد الكيانات، الحالات، القيود، الحركات، الآثار، والأخطاء.

---

## 3. الكيانات الرئيسية التي يحتاجها النظام

| الكيان | دوره في النظام | أهم البيانات المطلوبة | علاقته بالكيانات الأخرى | ملاحظات للمبرمج |
|---|---|---|---|---|
| Material | يمثل الصنف | Code، Name، UoM، Type | يدخل في BOM وOrders وInventory | كيان أساسي |
| Material Master | يحدد سلوك المادة | MRP Type، Procurement Type، Strategy، Costing، Accounting | يؤثر على MRP وGI وGR وCosting | لا يكفي تعريف اسم الصنف فقط |
| Plant | موقع إنتاج/مخزون | Code، Company، Calendar | يحتوي Storage Locations وMaterials | أساسي في SAP |
| Storage Location | موقع تخزين | Plant، Type، Status | يستخدم في GI/GR | يجب ضبط source/destination |
| Production Storage Location | موقع الإنتاج | Material، Plant، Location | يستخدم كافتراضي للصرف/الإنتاج | غيابه يسبب أخطاء GI/GR |
| PSA | منطقة تغذية إنتاج | Plant، Storage، Work Center | تستخدم في Kanban/Staging | قد تؤجل في نظام محلي |
| BOM | قائمة مكونات المنتج | Header، Items، Base Qty، Usage، Validity | ترتبط بـMaterial وProduction Version | أساس MRP والتكلفة |
| BOM Header | رأس BOM | Product، Plant، Usage، Status، Validity | يحتوي BOM Items | يجب حفظ الحالة والصلاحية |
| BOM Item | مكون داخل BOM | Component، Qty، UoM، Scrap، Issue Location | يصبح Order Component | أساس GI |
| Routing | خطوات تصنيع | Product، Operations، Validity | يرتبط بـProduction Version | أساس الجدولة والتكلفة |
| Routing Operation | خطوة إنتاج | Sequence، Work Center، Times، Control Key | تصبح Order Operation | أساس Confirmation |
| Work Center | مركز عمل | Code، Capacity، Calendar، Cost Center | مرتبط بـOperations | يربط التشغيل بالتكلفة |
| Cost Center | مركز تكلفة | Code، Validity، Currency | يستقبل/يوفر تكلفة الأنشطة | مطلوب لتكلفة الموارد |
| Activity Type | نوع نشاط | Labor/Machine/Setup | مرتبط بـCost Center وWork Center | يحدد نوع التكلفة |
| Activity Rate | سعر النشاط | Rate، Period، Cost Center، Activity Type | يستخدم في Activity Cost | شبيه KP26 |
| Production Version | ربط BOM وRouting | Material، BOM Alt، Routing، Lot Range، Validity | يستخدم في MRP وCosting وOrder | حلقة الربط الأهم |
| Planned Order | أمر مخطط | Material، Qty، Date، PV | يتحول إلى Production Order | ليس تنفيذًا |
| Production Order | أمر إنتاج | Material، Qty، Plant، Dates، Status | يحتوي Components/Operations/Transactions | مركز التنفيذ |
| Process Order | أمر عمليات | Recipe، Phases، Batch | بديل في Process Manufacturing | يحتاج تحقق إضافي حسب النظام |
| Order Component | مكون داخل الأمر | Component، Required Qty، Issued Qty | منسوخ من BOM | أساس GI |
| Order Operation | عملية داخل الأمر | Operation، Work Center، Times | منسوخة من Routing | أساس Confirmation |
| Reservation | حجز مواد | Order، Component، Qty، Location | قبل GI | لا تعني صرفًا |
| GI Transaction | صرف مواد | Order، Component، Qty، 261/262 | يخفض المخزون ويرفع WIP | يجب أن يكون قابلًا للعكس |
| GR Transaction | استلام منتج | Order، Material، Qty، 101/102 | يزيد FG ويؤثر على WIP | قد يدخل Quality Stock |
| Confirmation | تأكيد إنتاج | Order، Operation، Yield، Scrap، Activities | يؤثر على الحالة والتكلفة | قد يولد Backflush/Auto GR |
| Inspection Lot | دفعة فحص | Order/GR، Material، Qty | QM | قد يمنع الإتاحة |
| WIP Record | إنتاج تحت التشغيل | Order/PCC، Amount، Period | من GI/Confirmation/GR | مطلوب للإغلاق |
| Variance Record | انحراف | Type، Amount، Reason | بعد المقارنة | أساس التحليل |
| Settlement Rule | قاعدة تسوية | Receiver، Percentage، Validity | قبل Settlement | لا Settlement دون Rule |
| Settlement Transaction | تسوية | Order، WIP، Variance، Receiver | ينتج أثر مالي | مرحلة مالية حاسمة |
| COGI Error Record | خطأ حركة مواد | Order، Component، Reason | من Backflush/GI | يجب ألا يختفي |
| CO1P Pending Posting | تكلفة/حركة معلقة | Order، Cost Object، Reason | قبل Period-End | يحتاج تحقق إضافي من المصدر الأصلي أو من نظام ناتج |
| Universal Journal Entry | قيد مالي موحد | Event، Amount، Account، Object | من GI/GR/Settlement | لا تخترع قيود تفصيلية |
| Status History | سجل الحالات | From، To، User، Date | لكل أمر | ضروري للرقابة |
| Audit Log | سجل تدقيق | Entity، Before/After، User | لكل تعديل حساس | إلزامي في ERP جاد |

---

## 4. خريطة العلاقات بين الكيانات

```text
Material Master
→ BOM + Routing
→ Production Version
→ MRP
→ Planned Order
→ Production Order
→ Release
→ Reservation / Material Staging
→ Goods Issue
→ Confirmation
→ Goods Receipt
→ TECO
→ WIP / Variance
→ Settlement
→ CLSD
→ Universal Journal / FI / CO
```

| العلاقة | لماذا مهمة؟ | ماذا يحدث إذا كانت العلاقة غير واضحة؟ |
|---|---|---|
| Material Master ↔ MRP | يحدد هل المادة تخطط وكيف | MRP ينتج أوامر خاطئة أو لا ينتج شيئًا |
| Material ↔ BOM | يحدد مكونات المنتج | صرف مواد خاطئ وتكلفة خاطئة |
| BOM ↔ Routing | يربط المواد بالعمليات | توقيت صرف غير واضح |
| Operation ↔ Work Center | يحدد مكان التنفيذ | لا جدولة ولا تكلفة نشاط صحيحة |
| Work Center ↔ Cost Center | يربط التشغيل بالتكلفة | Activity Cost ناقصة |
| Production Version ↔ BOM/Routing | يمنع اختيارًا عشوائيًا | MRP/Cost/Order غير متسق |
| Planned Order ↔ Production Order | يفصل التخطيط عن التنفيذ | MRP قد يتدخل في أمر تنفيذي |
| Production Order ↔ Components/Operations | يحفظ Snapshot للتنفيذ | تغيرات Master Data تربك الأمر |
| Release ↔ GI/Confirmation/GR | يسمح بالتنفيذ | حركات قبل الجاهزية |
| GI ↔ WIP/Cost | يصرف مواد ويزيد تكلفة الأمر | WIP غير صحيح |
| Confirmation ↔ Activity Cost | يسجل وقت/كمية/هالك | تكلفة فعلية غير موثوقة |
| GR ↔ Finished Goods/WIP | يستلم المنتج ويؤثر على WIP | مخزون منتج غير صحيح |
| TECO ↔ Settlement | ينهي فنيًا ويمهد ماليًا | خلط الإغلاق الفني بالمالي |
| Settlement ↔ Universal Journal | ينقل WIP/Variance ماليًا | مالية لا تطابق الإنتاج |

---

## 5. Workflow حالات Production Order

```text
CRTD → REL → PCNF / CNF → PDLV / DLV → TECO → Settlement → CLSD
```

| الحالة | ما يسمح به | ما يمنع | الأثر على المخزون | الأثر على WIP/التكلفة | ملاحظات للمبرمج |
|---|---|---|---|---|---|
| CRTD | مراجعة وتعديل | GI/Confirmation/GR عادة | لا أثر فعلي | Planned Cost فقط | أمر منشأ فقط |
| REL | GI وConfirmation وGR | التنفيذ قبلها | Reservations وGI لاحقًا | بداية actual postings | Release يفتح التنفيذ |
| PCNF | استكمال العمليات | اعتبار الأمر مكتملًا | قد توجد GI/GR جزئية | تكلفة جزئية | Partial Confirmation |
| CNF | GR وTECO حسب الحالة | تأكيدات غير منضبطة | لا يعني GR بالضرورة | Activity Cost مكتملة | Final Confirmation |
| PDLV | استلام باقي الكمية | الإغلاق الكامل | FG جزئي | WIP متبقٍ | Partial Delivery |
| DLV | TECO/Settlement | GR إضافي دون سياسة | FG مكتمل | تمهيد Variance | Delivered لا يعني ماليًا مغلق |
| TECO | Settlement ومراجعة | تنفيذ طبيعي إضافي غالبًا | تحرير Reservations | تمهيد WIP/Variance | إغلاق فني |
| CLSD | عرض فقط | حركات وتسويات جوهرية | لا حركات | نهاية مالية/وظيفية | إغلاق نهائي |

| من الحالة | إلى الحالة | شرط الانتقال | Validation المطلوب |
|---|---|---|---|
| CRTD | REL | اكتمال بيانات الأمر | Material/BOM/Routing/PV/Qty/Plant |
| REL | PCNF | Confirmation جزئي | Order Released، Operation صالحة |
| REL/PCNF | CNF | Confirmation نهائي | Yield/Scrap/Activities صحيحة |
| REL/PCNF/CNF | PDLV | GR جزئي | Quantity received < required |
| PDLV/CNF | DLV | GR كامل | Quantity received complete |
| DLV/CNF | TECO | انتهاء التنفيذ | لا أخطاء حرجة أو قرار إداري |
| TECO | Settlement | جاهزية مالية | WIP/Variance/Rule/COGI/CO1P |
| Settlement | CLSD | تسوية ومعالجة الأخطاء | لا WIP غير مفسر ولا أخطاء حرجة |

---

## 6. عملية إعداد Material Master — Functional Logic

| الخطوة | التحقق المطلوب | المخرجات | ملاحظات للمبرمج |
|---|---|---|---|
| تعريف المادة | Code وType وUoM | Material صالح | لا يسمح بتكرار الكود |
| ربط المادة بـPlant | Plant موجود | Plant-specific data | SAP يعتمد على Plant |
| ضبط MRP | MRP Type وController وLot Size | مادة قابلة للتخطيط | ND تعني عدم التخطيط |
| ضبط Procurement | داخلي/خارجي/مختلط | قرار إنتاج أو شراء | يؤثر على مخرجات MRP |
| ضبط Strategy | MTS/MTO | علاقة الطلب بالإنتاج | مهم للمبيعات |
| ضبط Storage | Production Storage Location | مصدر/وجهة افتراضية | يمنع GI/GR خاطئ |
| ضبط Backflush | نعم/لا | صرف تلقائي محتمل | لا يفعل افتراضيًا لكل المواد |
| ضبط Batch/Serial | مطلوب/غير مطلوب | Traceability | يلزم في GI/GR |
| ضبط Accounting | Valuation Class/Price Control | تقييم مالي | FI/CO تعتمد عليه |
| ضبط Costing | Costing View/Quantity Structure | Standard Cost | مهم للتكلفة |

### Edge Cases

| الحالة | التصرف المطلوب |
|---|---|
| Material بدون MRP View | منع التخطيط أو إصدار تحذير |
| Material بدون Accounting View | منع الحركات المالية أو التحذير |
| Material بدون Costing View | منع Standard Cost أو التحذير |
| Procurement Type غير صحيح | MRP قد ينتج PR بدل Planned Order |
| Price Control غير مناسب | يحتاج مراجعة FI/CO |
| Valuation Class خاطئة | خطر GL خاطئ |
| Backflush مفعل لمادة لا يناسبها | تحذير أو موافقة |
| Production Storage Location غير محدد | منع GI/GR الافتراضي |
| Batch مطلوب لكن غير مضبوط | منع GI/GR حتى إدخال Batch |

---

## 7. عملية إعداد BOM — Functional Logic

| الخطوة | التحقق المطلوب | الأثر على MRP | الأثر على التكلفة |
|---|---|---|---|
| إنشاء BOM Header | Product/Plant/Usage/Status | يتيح Explosion | يتيح Cost Rollup |
| إضافة Components | كل Component موجود | Dependent Requirements | Material Cost |
| ضبط الكميات | Quantity/UoM صحيحة | احتياجات دقيقة | تكلفة دقيقة |
| ضبط الصلاحية | Valid From/To | نسخة صحيحة | Cost بتاريخ صحيح |
| ضبط البدائل | Alternative BOM | اختيار حسب PV | تكلفة بديلة |
| ضبط Scrap | Component/Assembly/Operation | احتياج أعلى | تكلفة أعلى |
| ربط العمليات | Component Allocation | توقيت الحاجة | تحليل أدق |
| اعتماد BOM | Status Released | MRP موثوق | Costing موثوق |

### Edge Cases

| الحالة | التصرف المطلوب |
|---|---|
| BOM غير موجودة | منع إنشاء أمر إنتاج أو التحذير حسب السياسة |
| BOM غير صالحة حسب التاريخ | منع الاستخدام أو اختيار نسخة أخرى |
| Component Quantity خاطئة | تظهر كVariance لاحقًا؛ يجب Validation |
| UoM غير متوافقة | منع الحفظ أو طلب Conversion |
| Alternative BOM دون Production Version | منع الغموض |
| Component غير موجود في المخزون | يظهر في Missing Parts وليس بالضرورة يمنع BOM |
| Phantom Item | تفجير مكوناته دون أمر مستقل |
| Co-product أو By-product | يحتاج منطق Process وتوزيع تكلفة |
| Scrap غير معرف رغم وجود هالك | يظهر لاحقًا كVariance |

---

## 8. عملية إعداد Routing / Work Center — Functional Logic

```text
Operation → Work Center → Cost Center → Activity Type → Activity Rate → Planned / Actual Activity Cost
```

| الخطوة | التحقق | الأثر التشغيلي | الأثر المالي |
|---|---|---|---|
| إنشاء Routing | Product وValidity | طريقة تصنيع | أساس التكلفة |
| إضافة Operations | Sequence واضح | تنفيذ مرتب | Activity Cost |
| ربط Work Center | لكل عملية | مكان تنفيذ | مصدر تكلفة |
| ضبط Control Key | Confirmation/Costing/Scheduling | سلوك العملية | دخول/خروج من التكلفة |
| ضبط Standard Values | Setup/Machine/Labor | جدولة | Planned Cost |
| ربط Cost Center | Work Center ↔ Cost Center | لا أثر مباشر | Activity Cost |
| ضبط Activity Types | Labor/Machine/Setup | تسجيل الأنشطة | Cost Component |
| ضبط Activity Rates | Rate لكل Activity | لا أثر مباشر | تكلفة الموارد |
| ضبط Capacity/Calendar | قدرة وجدولة | Scheduling | أثر غير مباشر |

### Edge Cases

| الحالة | التصرف المطلوب |
|---|---|
| Operation بدون Work Center | منع Routing أو منع Release |
| Work Center بدون Cost Center | تحذير مالي أو منع Costing |
| Activity Type بدون Rate | تكلفة صفرية/خاطئة؛ تحذير CO |
| Standard Values غير منطقية | تنبيه أو Approval |
| Routing لا يعكس الواقع | يظهر في Resource Usage Variance |
| Component Allocation غير موجود | مسموح لكن يقلل دقة توقيت الصرف |
| Work Center لا يملك Capacity مناسبة | تحذير Scheduling |

---

## 9. عملية Production Version — Functional Logic

| الخطوة | التحقق المطلوب | المخرجات | ملاحظات للمبرمج |
|---|---|---|---|
| اختيار Material | مادة قابلة للإنتاج | PV مرتبطة بالمادة | لا PV لصنف مشتَرى فقط إلا بسياسة |
| اختيار BOM | BOM صالحة | ربط مواد | يجب مطابقة Plant/Validity |
| اختيار Routing | Routing صالح | ربط عمليات | يجب مطابقة Plant/Validity |
| ضبط Lot Size | From/To | اختيار حسب الكمية | يمنع استخدام نسخة غير مناسبة |
| ضبط Validity | From/To dates | صلاحية زمنية | مهم في MRP وCost |
| اعتماد النسخة | Status/Approval | طريقة إنتاج معتمدة | Audit مطلوب |

### Business Rules

- لا يتم اختيار BOM/Routing عشوائيًا عند وجود أكثر من بديل.
- Production Version يجب أن تكون صالحة للتاريخ والكمية.
- إذا كانت Production Version منتهية يجب منع استخدامها أو التحذير.
- يجب تسجيل أي تغيير عليها في Audit Log.
- إذا وجدت أكثر من Production Version صالحة دون أولوية واضحة، يجب إظهار خطأ أو طلب اختيار.

### Edge Cases

| الحالة | التصرف المطلوب |
|---|---|
| لا توجد Production Version | منع MRP/Order Creation أو استخدام سياسة بديلة واضحة |
| Production Version منتهية | منع أو تحذير |
| Lot Size خارج النطاق | اختيار نسخة أخرى أو منع |
| BOM صحيحة مع Routing خاطئ | يظهر Cost/Execution mismatch |
| PV مختلفة بين التكلفة والتنفيذ | Variance غير مفهوم |
| أكثر من PV صالحة دون أولوية | خطأ اختيار |

---

## 10. عملية MRP — Functional Logic

| الخطوة | المنطق | المخرجات |
|---|---|---|
| قراءة الطلب | Sales/PIR/Forecast/Dependent | Gross Requirements |
| قراءة العرض | Stock/Open Orders/POs | Available Supply |
| حساب Net Requirements | الطلب - العرض + Safety | صافي الاحتياج |
| BOM Explosion | تفجير المكونات | Dependent Requirements |
| تحديد نوع التوريد | Procurement Type | Planned Order أو PR |
| تطبيق Lot Size | قواعد الدفعة | Qty نهائية |
| اختيار PV | حسب التاريخ والكمية | طريقة إنتاج |
| إنشاء النتائج | Planned Orders/PRs/Exceptions | قائمة تخطيط |

### Business Rules

- MRP لا يصلح دون Master Data صحيحة.
- MRP يجب ألا يعدل أوامر تنفيذية بعد تحويلها إلا حسب سياسة واضحة.
- Planned Order كائن تخطيطي وليس تنفيذًا فعليًا.
- MRP يجب أن يكشف نقص المواد.
- MRP Type = ND يعني عدم التخطيط.

### Edge Cases

| الحالة | الأثر |
|---|---|
| MRP Type = ND لمادة تحتاج تخطيط | لا Planned Order |
| BOM خاطئة | Dependent Requirements خاطئة |
| Production Version غير موجودة | فشل أو اختيار غير واضح |
| Safety Stock غير منطقي | فائض أو نقص |
| Planned Orders قديمة | تخطيط غير نظيف |
| Procurement Type خطأ | PR بدل Planned Order أو العكس |

---

## 11. عملية Planned Order Conversion

| التحويل | متى يحدث؟ | المخرجات | أثره |
|---|---|---|---|
| Planned Order → Production Order | مادة مصنعة Discrete | Production Order | خروج من التخطيط إلى التنفيذ |
| Planned Order → Process Order | تصنيع عملياتي | Process Order | استخدام Master Recipe/Phases |
| Planned Order → Purchase Requisition | مادة خارجية | PR | يذهب للمشتريات |
| Planned Order → RSQ/PCC | REM | Run Schedule Quantity | تكلفة فترة |

### Business Rules

- لا تحويل دون مراجعة الكمية والتاريخ.
- إذا كان Planned Order مثبتًا Firmed يجب احترام ذلك.
- بعد التحويل لا يعامل كعنصر تخطيطي حر مثل السابق.
- يجب تسجيل سجل تحويل.

### Edge Cases

| الحالة | التصرف المطلوب |
|---|---|
| تحويل Planned Order خاطئ | إلغاء/تصحيح حسب السياسة |
| تحويل قبل مراجعة المواد | تحذير Missing Parts |
| تحويل إلى نوع أمر غير مناسب | منع حسب Procurement/Manufacturing Type |
| Planned Order قديم | تحذير Aging |
| Firming Indicator غير مفهوم | توعية وValidation |

---

## 12. عملية إنشاء Production Order — Functional Logic

| الخطوة | التحقق المطلوب | المخرجات | ملاحظات للمبرمج |
|---|---|---|---|
| التحقق من المادة | Material قابل للإنتاج | قبول الطلب | Procurement Type مهم |
| اختيار PV | صالحة للتاريخ والكمية | BOM/Routing محددان | لا اختيار عشوائي |
| نسخ BOM | BOM Items → Order Components | Components Snapshot | لا يتغير تلقائيًا بعد تعديل BOM |
| نسخ Routing | Operations → Order Operations | Operations Snapshot | لا يتغير تلقائيًا بعد تعديل Routing |
| إنشاء Reservations | حسب Components | Reserved Qty | قد تتفعل عند Release حسب السياسة |
| حساب Planned Cost | BOM/Routing/Rates | Planned Cost | يحتاج CO |
| ضبط الحالة | CRTD | Order Created | بداية Status History |
| Audit | المستخدم والتاريخ | سجل تدقيق | مهم جدًا |

### Business Rules

- لا إنشاء أمر صالح دون Material قابل للإنتاج.
- إذا كانت Production Version مطلوبة يجب اختيارها.
- يجب حفظ نسخة الأمر من BOM/Routing حتى لو تغيرت البيانات الأساسية لاحقًا.
- تعديل Components أو Operations بعد الإنشاء يحتاج صلاحية.
- Quantity صفر أو سالبة غير مسموحة.

### Edge Cases

| الحالة | التصرف |
|---|---|
| Material بدون BOM | منع أو أمر خاص بصلاحية |
| Material بدون Routing | منع إذا التكلفة/العمليات مطلوبة |
| PV غير صالحة | منع الإنشاء |
| BOM تغيرت بعد إنشاء الأمر | لا تغير Snapshot إلا بإجراء واضح |
| أمر يدوي خارج MRP | يحتاج صلاحية وسبب |
| MTO مرتبط بـSales Order | حفظ Demand Link |

---

## 13. عملية Release Production Order

| الخطوة | ما يحدث | المخرجات |
|---|---|---|
| تغيير الحالة | CRTD → REL | أمر قابل للتنفيذ |
| تفعيل التنفيذ | السماح GI/Confirmation/GR | Controls مفتوحة |
| مراجعة المواد | Missing Parts | تحذيرات أو منع |
| Reservations | إنشاء/تفعيل | مواد محجوزة |
| QM | قد ينشأ Inspection Lot 03 | فحص أثناء الإنتاج |
| Documents | Shop Papers إن وجدت | وثائق تشغيل |
| Audit | حفظ User/Date | Status History |

### Business Rules

- لا Release إذا توجد أخطاء حرجة في BOM/Routing/Production Version.
- لا Release دون صلاحية.
- Release لا يعني أن المواد صُرفت.
- Missing Parts يجب أن تظهر كتقرير أو تحذير.
- إذا QM مفعّل، قد ينتج Inspection Lot.

### Edge Cases

| الحالة | التصرف |
|---|---|
| Release دون توفر مواد | السماح مع تحذير أو منع حسب السياسة |
| Release تلقائي دون مراجعة | يحتاج ضبط صلاحيات |
| Release ثم تعديل الأمر | يحتاج صلاحية وAudit |
| Release لأمر غير مكتمل البيانات | منع |
| Release ثم TECO مبكر | يحتاج سبب |

---

## 14. عملية Material Staging / Reservation

| الخطوة | الأثر على المستودع | الأثر على الإنتاج |
|---|---|---|
| إنشاء Reservation | حجز كمية | يقلل تضارب الاستخدام |
| تحديد Source Location | مصدر الصرف | وضوح المسؤولية |
| Pull List / Staging | تجهيز مواد | تقليل توقف |
| Missing Parts | كشف نقص | قرار تأجيل/تعجيل |
| PSA | تغذية خط | Kanban/Staging |

### Edge Cases

| الحالة | التصرف |
|---|---|
| مواد محجوزة وغير متوفرة | Missing Parts |
| Storage Location خاطئ | منع أو تحذير |
| PSA غير محددة | تحذير عند استخدامها |
| تجهيز مواد دون صرف | لا يؤثر WIP |
| حجز مواد لأمر لن يتم تنفيذه | تحرير عند TECO/Cancel |

---

## 15. عملية Goods Issue — Material Consumption

| الخطوة | التحقق | الأثر المخزني | الأثر على WIP/التكلفة |
|---|---|---|---|
| فحص الحالة | Order = REL أو سياسة تسمح | لا حركة قبل السماح | منع تكلفة خاطئة |
| فحص المكون | ضمن Components أو مسموح | يحدد المادة | يربط التكلفة بالأمر |
| فحص الكمية | >0 ومتاحة | يخفض المخزون | يزيد Actual Material Cost |
| فحص Batch/Serial | إلزامي عند الحاجة | Traceability | جودة/تكلفة |
| تنفيذ 261 | صرف | Raw Material ↓ | WIP/Order Cost ↑ |
| تنفيذ 262 | عكس صرف | Raw Material ↑ | WIP/Order Cost ↓ |
| إنشاء مستند | Material Document | Audit | FI/CO impact |
| تحديث الاستهلاك | Issued Qty | متابعة | Variance لاحقًا |

### Business Rules

- لا GI على أمر غير Released إلا بسياسة واضحة.
- لا GI بعد CLSD.
- الصرف الزائد يحتاج صلاحية أو سبب.
- الصرف لمادة بديلة يحتاج توثيق.
- 262 يجب أن يعكس صرفًا سابقًا.
- Batch / Serial إلزامي إذا المادة تتطلب ذلك.

### Edge Cases

| الحالة | المعالجة |
|---|---|
| صرف أقل من BOM | يسمح حسب السياسة ويظهر في Variance |
| صرف أكثر من BOM | صلاحية/سبب |
| صرف مادة بديلة | Substitute record |
| صرف من Storage Location خطأ | منع أو تحذير قوي |
| Batch غير صالح | منع |
| GI ثم TECO | يجب ظهور WIP/Settlement |
| GI ثم إلغاء الأمر | عكس أو معالجة |
| 262 أكثر من المصروف | منع |
| GI ناجح مخزنيًا لكن التكلفة معلقة | CO1P-like pending |

---

## 16. عملية Backflush وError Handling

| الحالة | ما يحدث | الأثر | الإجراء |
|---|---|---|---|
| Backflush ناجح | GI تلقائي | مخزون ↓ وWIP ↑ | تسجيل الحركة |
| نقص مخزون | فشل GI | تكلفة ناقصة | إنشاء COGI-like Error |
| Batch غير محدد | فشل GI | Traceability ناقص | طلب Batch |
| Storage خطأ | فشل GI | لا حركة | تصحيح Master Data |
| GI نجح والتكلفة معلقة | مخزون صحيح وتكلفة ناقصة | CO impact ناقص | CO1P-like |
| المستخدم لا يرى الخطأ | خطر | أمر يبدو مكتملًا | Dashboard أخطاء |

### Business Rules

- لا Backflush دون إعداد واضح.
- لا يستخدم Backflush على كل المواد افتراضيًا.
- فشل Backflush يجب ألا يختفي.
- يجب وجود تقرير أخطاء يومي.
- يجب فصل فشل الحركة المخزنية عن فشل التكلفة إذا دعمه النظام.

---

## 17. عملية Confirmation

| الخطوة | الأثر التشغيلي | أثر WIP | أثر التكلفة |
|---|---|---|---|
| فحص الحالة | لا تأكيد قبل REL | لا أثر | منع cost خاطئ |
| فحص العملية | Operation صحيحة | يربط WIP بالمرحلة | Activity Cost |
| تسجيل Yield | تقدم إنتاج | قد يقود GR | مقارنة خطة/فعلي |
| تسجيل Scrap | هالك | قد يبقى WIP/Variance | Scrap Variance |
| تسجيل Activities | وقت/موارد | WIP ↑ | Activity Cost ↑ |
| Final/Partial | PCNF/CNF | يحدد التقدم | يؤثر على الإغلاق |
| Backflush | GI تلقائي محتمل | WIP ↑ | Material Cost |
| Auto GR | GR محتمل | WIP ↓ | FG ↑ |

### Business Rules

- لا Confirmation قبل Release.
- Confirmation يكون على Operation أو Order حسب السياسة.
- Final Confirmation يغلق العملية أو الأمر وظيفيًا.
- Reason for Variance مطلوب عند تجاوز حد معين إذا كان النظام يدعم ذلك.
- Scrap Quantity يجب أن تظهر في التقارير والتكلفة.
- Activity Quantity لا يجب أن تكون سالبة.
- إلغاء Confirmation يجب أن يعكس آثاره حسب السياسة.

### Edge Cases

| الحالة | التصرف |
|---|---|
| Confirmation بكمية صفر | منع أو سبب إلزامي |
| Confirmation زائد عن الكمية | صلاحية/تحذير |
| Scrap دون سبب | طلب سبب |
| Rework دون أمر أو معالجة | يحتاج تحقق إضافي من المصدر الأصلي أو من نظام ناتج |
| Backflush يفشل | COGI-like |
| Auto GR قبل الجودة | منع أو Quality Stock |
| Posting Date خاطئ | تحذير Period |
| Cancel بعد GI/GR | عكس متسلسل أو سياسة واضحة |

---

## 18. عملية Goods Receipt من الإنتاج

| الخطوة | الأثر المخزني | أثر WIP | أثر التكلفة |
|---|---|---|---|
| فحص الأمر | لا GR على أمر غير صالح | لا أثر | منع |
| فحص الكمية | GR كمية صحيحة | لا زيادة خاطئة | تقييم صحيح |
| تنفيذ 101 | Finished Goods ↑ | WIP ↓/يقابل | FG valuation |
| تنفيذ 102 | Finished Goods ↓ | WIP يعود/يعكس | عكس |
| Quality | Quality Stock عند الحاجة | لا إتاحة مباشرة | أثر جودة |
| Status | PDLV/DLV | متابعة | تمهيد TECO |
| FI/CO | Universal impact | Cost impact | حسب الإعداد |

### Business Rules

- لا GR على أمر غير صالح.
- GR لا يعني أن الأمر مغلق ماليًا.
- GR مع QM قد يدخل Quality Inspection Stock وليس Available Stock.
- 102 يجب أن يعكس 101 سابقًا.
- Batch / Serial إلزامي عند الحاجة.
- Auto GR يجب أن يستخدم بحذر.

### Edge Cases

| الحالة | التصرف |
|---|---|
| GR جزئي | PDLV |
| GR أكبر من كمية الأمر | صلاحية/تحذير |
| GR قبل Confirmation | منع أو سياسة واضحة |
| GR قبل الجودة | Quality Stock |
| GR في Storage Location خطأ | منع/تصحيح |
| Batch / Serial مفقود | منع |
| 102 بعد Settlement | يحتاج تحقق إضافي |
| Auto GR غير مناسب | إلغاء التفعيل أو ضوابط |

---

## 19. عملية Quality Integration

| نقطة الجودة | متى تحدث؟ | أثرها على المخزون | أثرها على الإنتاج |
|---|---|---|---|
| Inspection Type 03 | عند Release/أثناء الإنتاج | لا يتيح منتجًا بالضرورة | فحص مبكر |
| Inspection Type 04 | عند GR | Quality Inspection Stock | يمنع الإتاحة |
| Usage Decision | بعد الفحص | Accept/Reject/Rework | قرار نهائي |
| Batch Traceability | GI/GR | تتبع دفعات | Recall/Quality |
| Serial Traceability | GI/GR | تتبع وحدات | رقابة دقيقة |
| Reject/Rework | بعد فشل جودة | مخزون/هالك | إعادة معالجة |

### Business Rules

- المنتج تحت الفحص لا يصبح متاحًا إلا بعد Usage Decision إذا كانت السياسة تتطلب ذلك.
- Auto GR لا يجب أن يتجاوز الجودة.
- Batch / Serial يجب أن يدعم التتبع.
- Reject / Rework يجب ألا يختفي دون أثر.

---

## 20. عملية TECO — Technical Completion

| البند | ما يحدث عند TECO | ملاحظات للمبرمج |
|---|---|---|
| الحالة | Order يصبح Technically Completed | ليست نهاية مالية |
| Reservations | تحرير أو تقليل المتبقي | حسب السياسة |
| التنفيذ | منع/تقليل الحركات الطبيعية | يحتاج Rules |
| WIP/Variance | تمهيد للحسابات | ليس Settlement |
| Audit | تسجيل User/Date/Reason | إلزامي |

### Business Rules

- TECO لا يعني CLSD.
- TECO لا يعني أن Settlement تم.
- لا TECO قبل معالجة أخطاء حرجة مثل COGI/CO1P.
- TECO يحتاج صلاحية.
- TECO يجب أن يظهر في Status History.

---

## 21. منطق WIP في النظام

| الحدث | هل يزيد WIP؟ | هل يخفض WIP؟ | ملاحظة للمبرمج |
|---|---|---|---|
| Goods Issue | نعم | لا | Material Cost على الأمر |
| Confirmation | نعم | لا | Activity Cost |
| Goods Receipt | لا | نعم/يقابل | Finished Goods يدخل |
| WIP Calculation | يحسب/يثبت | حسب الحالة | Period-End |
| Variance Calculation | لا مباشرة | لا مباشرة | يحلل الفرق |
| Settlement | يسوي/ينقل | نعم | أثر مالي |
| CLSD | لا | لا | يجب أن يكون WIP محسومًا |

### Edge Cases

| الحالة | التصرف |
|---|---|
| WIP مفتوح بعد TECO | يظهر في تقرير |
| WIP بعد Settlement | تحقيق |
| WIP بدون GR | أمر مفتوح |
| WIP بسبب GI فقط دون Confirmation | متابعة إنتاج |
| WIP بسبب Confirmation دون GR | متابعة GR |
| WIP على Orders قديمة | Aging |
| WIP لا يطابق المالية | Reconciliation |

---

## 22. منطق Variance

| نوع الانحراف | شرط ظهوره | البيانات المطلوبة | ملاحظة للمبرمج |
|---|---|---|---|
| Input Quantity Variance | استهلاك مواد يختلف عن BOM | BOM Qty، GI Qty | يكشف صرف زائد/ناقص |
| Input Price Variance | سعر فعلي مختلف | Standard/Actual Price | يعتمد على valuation |
| Resource Usage Variance | وقت/نشاط فعلي مختلف | Routing Values، Confirmation | يكشف فرق تشغيل |
| Resource Price Variance | Activity Rate مختلف | Rate planned/actual | KP26-like |
| Scrap Variance | Scrap مختلف | Planned/Actual Scrap | يرتبط بالجودة |
| Lot Size Variance | كمية إنتاج تختلف عن Costing Lot | Order Qty، Costing Lot | تكلفة ثابتة |
| Remaining Variance | فرق غير مصنف | كل بيانات التكلفة | يحتاج تحليل |

### Business Rules

- Variance لا تظهر بوضوح دون Planned / Standard Cost وActual Cost.
- Confirmation وGI وGR تؤثر على Variance.
- Reason for Variance يجب أن يسجل عند الحاجة.
- Variance يجب أن تكون قابلة للتقرير والتحليل.

---

## 23. منطق Settlement

| الخطوة | التحقق | الأثر المالي | ملاحظات |
|---|---|---|---|
| جاهزية الأمر | Status وErrors | لا أثر بعد | تحقق COGI/CO1P |
| قراءة WIP | WIP Record | تحديد قيمة التسوية | حسب الفترة |
| قراءة Variance | Variance Record | فروقات | يجب تفسيرها |
| Rule | Settlement Rule | تحديد Receiver | لا Settlement دونها |
| Posting | إنشاء أثر FI/CO | Universal Journal | لا تفصيل حسابات غير مؤكد |
| Update | Settlement Status | إغلاق مالي جزئي/كامل | Audit |

### Business Rules

- لا Settlement بدون Rule واضحة.
- لا Settlement إذا توجد أخطاء COGI / CO1P حرجة.
- TECO قد يكون شرطًا أو مؤشرًا للتسوية حسب السياسة.
- Settlement لا يعني CLSD تلقائيًا.
- يجب تسجيل Settlement في Audit / Status History.
- المالية يجب أن تراجع نتائج Settlement.

---

## 24. عملية CLSD — Final Close

| البند | ما يحدث عند CLSD |
|---|---|
| Status | الأمر يصبح مغلقًا نهائيًا |
| Transactions | منع الحركات أو التعديلات الجوهرية |
| Settlement | يفترض أن تمت أو عولجت |
| Errors | لا COGI/CO1P حرجة |
| Audit | حفظ User/Date/Reason |
| Reports | يظهر كأمر مغلق |

### Business Rules

- لا CLSD قبل معالجة COGI/CO1P.
- لا CLSD قبل Settlement عند الحاجة.
- لا CLSD مع WIP غير مفسر.
- لا CLSD دون صلاحية.
- CLSD يجب أن يكون قابلًا للتدقيق.

---

## 25. منطق COGI / CO1P أو بديل محلي لمعالجة الأخطاء

| نوع الخطأ | متى يظهر؟ | أثره | كيف يعالج؟ |
|---|---|---|---|
| COGI-like: نقص مخزون | Backflush/GI تلقائي | لا GI فعلي | توفير رصيد وإعادة معالجة |
| COGI-like: Batch مفقود | مادة Batch-controlled | حركة فاشلة | إدخال Batch |
| COGI-like: Storage خطأ | موقع غير صالح | حركة فاشلة | تصحيح Master Data |
| COGI-like: UoM/Qty خطأ | كمية غير قابلة | حركة فاشلة | تعديل Qty/UoM |
| CO1P-like: Cost pending | تكلفة لم تترحل | FI/CO ناقص | إعادة ترحيل |
| CO1P-like: Posting error | خطأ محاسبي | Period-End يتأثر | مراجعة CO/FI |

### Business Rules

- أي عملية تلقائية فاشلة يجب ألا تختفي.
- لا يعتبر الأمر مكتملًا إذا توجد أخطاء حرجة.
- يجب منع Period-End أو Close إذا توجد أخطاء معلقة حرجة.
- يجب ربط الخطأ بالأمر والحركة الأصلية.

---

## 26. منطق Universal Journal / FI / CO

| العملية | الأثر المالي المفهومي | هل هو تشغيلي أم مالي؟ | ملاحظة |
|---|---|---|---|
| Goods Issue | Raw Material ↓ وWIP/Order Cost ↑ | تشغيلي ومالي | حسب valuation |
| Confirmation | Activity Cost على الأمر | تشغيلي ومالي | من Activity Posting |
| Goods Receipt | Finished Goods ↑ وWIP ↓/يقابل | تشغيلي ومالي | حسب Price Control |
| WIP Calculation | إثبات WIP | مالي | Period-End |
| Variance Calculation | تحديد فروقات | تحليلي/مالي | قبل Settlement |
| Settlement | نقل WIP/Variance | مالي | حدث حاسم |
| CLSD | إغلاق حالة | وظيفي | ليس قيدًا بالضرورة |

لا تخترع حسابات تفصيلية غير مذكورة. إذا لم تكن القيود التفصيلية كافية: **يحتاج تحقق إضافي من المصدر الأصلي أو من نظام ناتج**.

---

## 27. منطق Process Order

| المفهوم | الفرق عن Production Order | أثره على التصميم |
|---|---|---|
| Master Recipe | بديل Routing | يحتاج كيان Recipe |
| Phases | تفاصيل داخل Operation | Confirmation على Phase |
| Resources | بديل Work Center | تكلفة وجدولة |
| Material List | مواد مرتبطة بالPhase | GI حسب مرحلة |
| Batch Management | أكثر أهمية | Traceability |
| Batch Determination | اختيار دفعات | يحتاج Rules |
| Co-products | مخرجات مشتركة | توزيع تكلفة |
| By-products | مخرجات جانبية | أثر تكلفة |
| Apportionment Structure | توزيع تكلفة Co-products | يحتاج تحقق إضافي |
| PI Sheet | تعليمات تنفيذ | يحتاج تحقق إضافي |
| Control Recipe | تكامل تحكم | يحتاج تحقق إضافي |

---

## 28. منطق Repetitive Manufacturing / PCC

| المفهوم | منطق النظام | هل هو أساسي أم متقدم؟ |
|---|---|---|
| Run Schedule Quantity | كمية تشغيل بدل أمر تقليدي | متقدم |
| Production Line | خط إنتاج متكرر | متقدم |
| PCC | كائن تكلفة للفترة | متقدم |
| Backflush | صرف تلقائي مكثف | متوسط/متقدم |
| Auto GR | استلام تلقائي | متوسط |
| Reporting Points | نقاط تقدم | متقدم |
| Period-Based Costing | تكلفة حسب فترة | متقدم |
| WIP by PCC | WIP على PCC | متقدم |
| Variance by PCC | فروقات على PCC | متقدم |
| Settlement by PCC | تسوية فترة | متقدم |

REM ليس مناسبًا لكل العملاء. يمكن تأجيله في نظام محلي إذا لم يكن لدى العملاء إنتاج متكرر فعلي.

---

## 29. منطق Kanban

| الحالة | ماذا تعني؟ | الإجراء الناتج |
|---|---|---|
| Empty | الحاوية فارغة | بدء Replenishment |
| Full | الحاوية ممتلئة | المادة جاهزة |
| In Process | التجديد جارٍ | متابعة |
| Wait | انتظار | يحتاج تحقق إضافي |
| Control Cycle | تعريف مسار التزويد | ربط PSA بالمصدر |
| PSA | منطقة تغذية | موقع استهلاك |
| Container | كمية Kanban | وحدة تحكم |
| Replenishment Strategy | طريقة التزويد | شراء/إنتاج/نقل |

Kanban نموذج Pull وليس بديلًا لكل الإنتاج. مناسب لمواد متكررة أو خطوط إنتاج محددة، ويمكن تأجيله كنموذج متقدم.

---

## 30. الصلاحيات والضوابط

| الصلاحية | لماذا تحتاج ضبط؟ | المخاطر إذا كانت مفتوحة |
|---|---|---|
| إنشاء/تعديل Material Master | يؤثر على MRP/Cost/Inventory | مواد غير مضبوطة |
| اعتماد/تعديل BOM | يغير المواد والكميات | صرف وتكلفة خاطئة |
| اعتماد/تعديل Routing | يغير العمليات والتكلفة | Activity Cost خاطئة |
| إنشاء/تعديل Production Version | يربط BOM/Routing | اختيار خاطئ |
| تشغيل MRP | يولد أوامر | فوضى تخطيط |
| تحويل Planned Order | يدخل التنفيذ | أوامر غير جاهزة |
| إنشاء Production Order | مركز التنفيذ | أوامر خارج التخطيط |
| Release | يفتح الحركات | تنفيذ غير جاهز |
| تعديل Components/Operations | يغير الصرف والتكلفة | عبث في الأمر |
| Goods Issue / Receipt | يؤثر على المخزون | أرصدة خاطئة |
| Confirmation / Cancel | يؤثر على التنفيذ والتكلفة | تكلفة خاطئة |
| معالجة COGI/CO1P | يصحح أخطاء | أخطاء مخفية |
| TECO / Settlement / CLSD | إغلاق فني/مالي/نهائي | إغلاق خاطئ |
| مشاهدة WIP/Variance/Cost | بيانات حساسة | كشف غير مصرح |

---

## 31. سجل التدقيق Audit Trail

| العملية | ما يجب تسجيله في Audit Log؟ |
|---|---|
| Material Master | من أنشأ/عدل، القيم قبل/بعد، التاريخ |
| BOM | المكونات والكميات قبل/بعد، السبب |
| Routing | العمليات والأزمنة قبل/بعد |
| Production Version | BOM/Routing/Lot/Validity قبل/بعد |
| MRP Run | المستخدم، التاريخ، النطاق، النتائج |
| Planned Order Conversion | من حول، إلى ماذا، متى |
| Production Order Creation | المصدر، المادة، الكمية، PV |
| Release | المستخدم، التاريخ، الحالة السابقة/الجديدة |
| تعديل Components/Operations | التغيير والسبب |
| Goods Issue / Receipt | المستخدم، المادة، الكمية، الحركة |
| Confirmation / Cancel | الكمية، الوقت، الهالك، المستخدم، العكس |
| COGI/CO1P Processing | الخطأ، المعالجة، المستخدم |
| TECO / Settlement / CLSD | المستخدم، الفترة/السبب/المخرجات |

---

## 32. أسئلة يجب أن يطرحها المبرمج على الـFunctional Consultant

| المجال | سؤال المبرمج | الإجابة المطلوبة من الـFunctional |
|---|---|---|
| Material Master | ما الحقول التي تتحكم بالإنتاج؟ | قائمة الحقول والسياسات |
| BOM | هل ننسخ BOM إلى الأمر؟ | نعم كSnapshot |
| Routing | هل Confirmation على العملية أم الأمر؟ | سياسة التسجيل |
| Production Version | كيف نختار BOM/Route؟ | PV بتاريخ وكمية |
| MRP | هل نحتاج Planned Orders وMD04-like view؟ | حسب نطاق التخطيط |
| GI | متى يتم الصرف؟ وماذا إذا فشل؟ | يدوي/Backflush/COGI-like |
| Confirmation | هل يحرك Backflush أو GR؟ | حسب الإعداد |
| GR | هل الاستلام يدوي أم تلقائي؟ | سياسة |
| Quality | هل الجودة تمنع الإتاحة؟ | QM settings |
| Costing | متى نحسب WIP وVariance؟ | Period-End أو event-based |
| Settlement | هل نحتاج Settlement؟ | نعم لنظام جاد |
| Closing | ما الفرق بين TECO وCLSD؟ | فني vs نهائي |
| Corrections | ماذا بعد خطأ بعد CLSD؟ | سياسة Reopen/Adjustment |

---

## 33. سيناريوهات اختبار وظيفية للمبرمجين

| رقم | السيناريو | النتيجة المتوقعة |
|---:|---|---|
| 1 | Material Master مكتمل | المادة جاهزة |
| 2 | Material ناقص Costing View | تحذير/منع |
| 3 | BOM صحيحة | BOM صالحة |
| 4 | BOM بدون Component Qty | منع |
| 5 | Routing صحيح | Routing صالح |
| 6 | Work Center بدون Cost Center | تحذير/منع |
| 7 | Production Version صحيحة | صالحة |
| 8 | Production Version منتهية | منع/تحذير |
| 9 | MRP ينتج Planned Order | Planned Order |
| 10 | Planned Order يتحول إلى Production Order | Order CRTD |
| 11 | Order يحتفظ Snapshot | لا يتغير تلقائيًا |
| 12 | Release ناجح | REL |
| 13 | Release مع Missing Parts | تحذير/منع |
| 14 | Reservation / Staging | Reservations |
| 15 | Goods Issue 261 | مخزون ↓ وWIP ↑ |
| 16 | Goods Issue بكمية زائدة | سبب/صلاحية |
| 17 | Goods Issue عكسي 262 | مخزون ↑ |
| 18 | Backflush ناجح | GI تلقائي |
| 19 | Backflush فاشل | COGI-like |
| 20 | Confirmation جزئي | PCNF |
| 21 | Confirmation نهائي | CNF |
| 22 | Confirmation مع Scrap | Scrap Report |
| 23 | Confirmation يحرك Backflush | GI تلقائي |
| 24 | GR 101 | FG ↑ |
| 25 | GR جزئي | PDLV |
| 26 | GR إلى Quality Stock | لا available |
| 27 | Usage Decision | Stock available |
| 28 | TECO ناجح | TECO |
| 29 | TECO مع أخطاء مفتوحة | منع/تحذير |
| 30 | WIP Calculation | WIP report |
| 31 | Variance Calculation | Variance report |
| 32 | Settlement ناجح | Settled |
| 33 | Settlement فاشل بسبب Receiver | Error |
| 34 | CLSD ناجح | Closed |
| 35 | منع التعديل بعد CLSD | منع |
| 36 | Production-to-FI reconciliation | مطابق |

---

## 34. نموذج User Story للمطورين

| User Story | Acceptance Criteria |
|---|---|
| كمستخدم Master Data، أريد إعداد Material Master للإنتاج | لا يسمح بالحفظ دون الحقول الأساسية |
| كمستخدم إنتاج، أريد إعداد BOM | يجب إدخال Components وكميات ووحدات وصلاحية |
| كمستخدم إنتاج، أريد إعداد Routing | يجب ربط كل Operation بـWork Center |
| كمستخدم PP، أريد إعداد Production Version | يجب التحقق من التاريخ والكمية وعدم وجود غموض |
| كمخطط، أريد تشغيل MRP | يجب حساب Net Requirements وإظهار Exceptions |
| كمخطط، أريد تحويل Planned Order | يجب إنشاء Order Snapshot وتسجيل التحويل |
| كمشرف إنتاج، أريد Release للأمر | يجب فتح GI/Confirmation/GR وتسجيل الحالة |
| كمستودع، أريد صرف مواد للأمر | يجب تخفيض المخزون وتحميل تكلفة |
| كمستخدم إنتاج، أريد Backflush | يجب إنشاء GI تلقائي أو Error واضح |
| كدعم ERP، أريد معالجة COGI-like Errors | يجب عرض السبب وإعادة المعالجة |
| كمشغل، أريد Confirmation | يجب تسجيل Yield/Scrap/Activities |
| كمستودع، أريد GR للمنتج النهائي | يجب زيادة FG وتحديث PDLV/DLV |
| كفني جودة، أريد Usage Decision | يجب منع الإتاحة قبل القرار |
| كمشرف، أريد TECO | يجب إنهاء فنيًا دون اعتبارها تسوية |
| كمحاسب تكلفة، أريد WIP Calculation | يجب إظهار WIP حسب Order/Period |
| كمحاسب تكلفة، أريد Variance Calculation | يجب إظهار أنواع الانحراف |
| كمحاسب، أريد Settlement | يجب نقل WIP/Variance حسب Rule |
| كمدير مالي، أريد CLSD | يجب ألا يتم قبل Settlement والأخطاء |
| كمحاسب تكلفة، أريد Production Cost Report | يجب عرض Planned/Actual/WIP/Variance |

---

## 35. نموذج Functional Requirement Specification

| الحقل | الوصف |
|---|---|
| رقم المتطلب | رقم فريد |
| اسم المتطلب | اسم واضح |
| الوصف الوظيفي | ماذا يريد المستخدم؟ |
| المستخدمون | الأدوار المعنية |
| المدخلات | البيانات المطلوبة |
| المعالجة | ما يحدث داخل النظام |
| المخرجات | سجلات/حركات/تقارير |
| Business Rules | القواعد |
| Validations | التحققات |
| Exceptions | الحالات الاستثنائية |
| Planning Impact | أثر التخطيط |
| Inventory Impact | أثر المخزون |
| WIP Impact | أثر WIP |
| Costing Impact | أثر التكلفة |
| Settlement Impact | أثر التسوية |
| Financial Impact | أثر المالية |
| Reports | التقارير |
| Audit | ما يسجل |
| Priority | الأولوية |

### مثال: Goods Issue against Production Order

| الحقل | القيمة |
|---|---|
| رقم المتطلب | PROD-FR-015 |
| اسم المتطلب | Goods Issue against Production Order |
| الوصف الوظيفي | صرف مواد خام أو مكونات إلى أمر إنتاج |
| المستخدمون | Warehouse Clerk، Production Supervisor |
| المدخلات | Production Order، Component، Qty، Storage Location، Batch/Serial، Posting Date |
| المعالجة | التحقق من الحالة، الكمية، المخزون، Batch/Serial، ثم إنشاء حركة 261 |
| المخرجات | GI Transaction، Material Document، تخفيض مخزون، Actual Material Cost |
| Business Rules | لا GI قبل REL، لا GI بعد CLSD، 262 يعكس صرف سابق |
| Validations | الكمية > 0، المادة ضمن Components، الرصيد كافٍ، Batch مطلوب |
| Exceptions | نقص مخزون، Storage خطأ، Batch مفقود، Qty زائدة |
| Planning Impact | يقلل Stock المتاح |
| Inventory Impact | Raw Material ↓ |
| WIP Impact | WIP ↑ |
| Costing Impact | Actual Material Cost ↑ |
| Settlement Impact | يدخل لاحقًا في WIP/Variance/Settlement |
| Financial Impact | FI/CO impact حسب الإعداد |
| Reports | GI Report، Consumption Report، Variance Report |
| Audit | User، Date، Qty، Before/After Stock |
| Priority | حرجة |

---

## 36. الحد الأدنى المطلوب لنظام ERP محلي

| الميزة | هل هي حد أدنى أم متقدمة؟ | لماذا؟ |
|---|---|---|
| تعريف مادة / صنف | حد أدنى | أساس كل العمليات |
| BOM | حد أدنى | يحدد المواد |
| Route أو مراحل إنتاج بسيطة | حد أدنى | يحدد خطوات العمل |
| Production Order | حد أدنى | كائن التنفيذ |
| Status Workflow | حد أدنى | يمنع الفوضى |
| Material Reservation | حد أدنى/متوسط | يجهز المواد |
| Goods Issue | حد أدنى | صرف مخزون |
| Goods Receipt | حد أدنى | استلام منتج |
| Confirmation | حد أدنى | تسجيل التنفيذ |
| Scrap | حد أدنى | هالك |
| Basic WIP | حد أدنى للعملاء المتوسطين | إنتاج تحت التشغيل |
| Basic Costing | حد أدنى | تكلفة المنتج |
| Variance بسيط | متوسط | تحسين الأداء |
| Close Cost | حد أدنى | إنهاء تكلفة الأمر |
| Production Reports | حد أدنى | رقابة |
| Error Transactions Report | حد أدنى | منع أخطاء مخفية |
| Audit Log | حد أدنى | حوكمة |
| Batch/Serial | متقدم حسب القطاع | تتبع |
| Quality Inspection | متقدم/أساسي حسب القطاع | جودة |
| Settlement متقدم مفصل | متقدم | يحتاج FI/CO |
| Universal Journal-like | متقدم | تكامل مالي عميق |

---

## 37. ميزات متقدمة يمكن تأجيلها

| الميزة | لماذا متقدمة؟ | متى تصبح ضرورية؟ |
|---|---|---|
| Full SAP-like Production Version | يحتاج بدائل وصلاحيات وربط عميق | عند تعدد BOM/Routes |
| Full MRP Live | تعقيد تخطيط | عند كثرة المواد والطلبات |
| PP/DS | تخطيط تفصيلي محدود الطاقة | عند مصانع معقدة |
| Full Process Order with PI Sheets | صناعات منظمة | أغذية/دواء/كيماويات |
| Full REM / PCC | تكلفة فترة | إنتاج متكرر كبير |
| Kanban | Pull specialized | خطوط متكررة |
| Full Event-Based Costing | أثر مالي لحظي | شركات ناضجة ماليًا |
| Full Universal Journal Integration | ربط FI/CO متقدم | ERP مالي كبير |
| Full COPA Settlement | ربحية متقدمة | شركات تحتاج ربحية تفصيلية |
| Advanced Capacity Planning | جدولة معقدة | ازدحام موارد |
| Advanced Batch Genealogy | تتبع متقدم | صناعات حساسة |
| Advanced QM Integration | جودة عميقة | قطاعات منظمة |
| Full Activity Rate Model مثل KP26 | تكلفة موارد دقيقة | شركات تستخدم Cost Centers |
| Advanced Variance Categories | تحليل تفصيلي | محاسبة تكلفة ناضجة |

---

## 38. أخطاء يجب منعها عند شرح المتطلب للمبرمج

| الخطأ | النتيجة |
|---|---|
| شرح العملية كأنها شاشة فقط | نظام بلا منطق |
| تجاهل Material Master | MRP/Cost/Inventory خاطئ |
| تجاهل BOM/Routing Snapshot | الأوامر تتغير بشكل غير مفهوم |
| تجاهل Production Version أو بديلها | اختيار BOM/Route عشوائي |
| الخلط بين التخطيط والتنفيذ | MRP يؤثر على التنفيذ |
| الخلط بين Planned Order وProduction Order | Workflow خاطئ |
| تجاهل Status Workflow | حركات في أوقات خاطئة |
| تجاهل أثر المخزون | أرصدة غير دقيقة |
| تجاهل WIP | تكلفة غير مكتملة |
| تجاهل Confirmation | لا Actual Activity Cost |
| اعتبار GR نهاية مالية | Settlement مفقود |
| اعتبار TECO نهاية مالية | إغلاق خاطئ |
| تجاهل Settlement | WIP/Variance عالق |
| تجاهل COGI/CO1P | أخطاء مخفية |
| تجاهل التقارير | لا رقابة |
| تجاهل Audit | لا حوكمة |
| عدم إشراك المالية | أرقام مرفوضة لاحقًا |

---

## 39. ملخص تنفيذي للمبرمجين

الإنتاج في SAP ليس شاشة **Production Order** فقط.

منطق النظام الصحيح:

1. **Material Master** يحدد سلوك المادة في التخطيط والمخزون والتكلفة.
2. **BOM** تحدد المواد المطلوبة.
3. **Routing** يحدد العمليات.
4. **Work Center** يربط التشغيل بالتكلفة والطاقة.
5. **Production Version** تربط BOM وRouting وتمنع الغموض.
6. **MRP** ينتج Planned Orders.
7. **Planned Order** كائن تخطيطي وليس تنفيذًا.
8. **Production Order** هو كائن التنفيذ والتكلفة.
9. **Release** يفتح الباب للحركات.
10. **Goods Issue** ينقص المخزون ويزيد WIP.
11. **Confirmation** يسجل العمل والكمية والهالك والأنشطة.
12. **Goods Receipt** يدخل المنتج النهائي.
13. **Quality** قد تمنع الإتاحة حتى Usage Decision.
14. **TECO** إغلاق فني، وليس ماليًا.
15. **WIP وVariance** تحتاج مراجعة.
16. **Settlement** هو الحدث المالي الحاسم.
17. **CLSD** إغلاق نهائي.
18. أي عملية تلقائية فاشلة يجب أن تظهر في تقرير أخطاء.
19. لا يمكن بناء نظام إنتاج صحيح دون Business Rules وValidations وAudit وReports.

القاعدة العملية للمبرمج:

> لا تنفذ شاشة إنتاج قبل أن تفهم: الكيان، الحالة، الحركة، الأثر المخزني، الأثر على WIP، الأثر على التكلفة، الأثر المالي، وطريقة الرجوع أو معالجة الخطأ.
