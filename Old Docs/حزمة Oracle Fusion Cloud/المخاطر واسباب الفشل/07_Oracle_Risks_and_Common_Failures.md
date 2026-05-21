# 07_Oracle_Risks_and_Common_Failures.md
# مخاطر وفشل تطبيق نظام الإنتاج في Oracle Fusion Cloud Manufacturing

## 1. مقدمة

تطبيق الإنتاج في **Oracle Fusion Cloud Manufacturing** حساس لأنه لا يقتصر على شاشة Work Order، بل يربط بين التصميم، التنفيذ، المخزون، التكلفة، التوزيعات المحاسبية، والإغلاق المالي. أي خلل في طبقة من هذه الطبقات قد يظهر لاحقًا في صورة تكلفة غير دقيقة، WIP متضخم، Cost Distributions غير مفهومة، أو Period Close متعطل.

يعتمد Oracle على فصل واضح بين:

- **Work Definition**: تصميم طريقة الإنتاج.
- **Work Order Execution**: تنفيذ أمر العمل.
- **Inventory Transactions**: حركات المخزون الناتجة عن الإنتاج.
- **Cost Accounting**: تسعير الحركات وتوليد Cost Distributions.
- **Subledger / GL**: تحويل الأثر المحاسبي إلى قيود.
- **Work Order Close وPeriod Close**: إغلاق التكلفة والفترة.

فشل التطبيق غالبًا لا يظهر كخطأ شاشة فقط، بل يظهر في:

- Work Orders غير مغلقة.
- WIP غير دقيق.
- Cost Distributions غير مفهومة أو غير مرحلة.
- Variances عالية ومتكررة.
- Pending Transactions تمنع الإغلاق.
- Period Close غير مضبوط.
- تقارير لا يثق بها الإنتاج أو المالية.

---

## 2. خريطة المخاطر حسب دورة Oracle Manufacturing

| المرحلة | الخطر الرئيسي | الأثر المحتمل |
|---|---|---|
| Master Data | بيانات صنف أو مورد أو مصنع غير صحيحة | فشل Work Definition أو Costing أو التنفيذ |
| Item Structure | مكونات غير دقيقة أو Supply Type خاطئ | صرف مواد خاطئ وانحرافات تكلفة |
| Work Definition | قالب إنتاج غير مكتمل أو غير مطابق للواقع | Work Order خاطئ من البداية |
| Work Centers / Resources | موارد أو معدلات غير دقيقة | جدولة غير واقعية وتكلفة موارد خاطئة |
| Work Order Creation | اختيار Work Definition أو Version غير مناسب | تنفيذ وتكلفة مبنيان على أساس خاطئ |
| Work Order Statuses | سوء فهم Unreleased / Released / Completed / Closed | تنفيذ في توقيت خاطئ أو إغلاق غير مضبوط |
| Material Issue | صرف خطأ أو ناقص أو زائد | مخزون غير دقيق وWIP غير صحيح |
| Resource Charging | عدم تسجيل العمالة أو الآلات | تكلفة إنتاج ناقصة أو Variances غير مفسرة |
| Material Return | عدم عكس المرتجعات | WIP وتكلفة أعلى من الواقع |
| Product Completion | إكمال قبل جاهزية البيانات أو في مخزن خاطئ | مخزون تام غير دقيق وتكلفة مؤقتة غير مفهومة |
| Scrap / Rework / Reject | هالك أو رفض غير مسجل | تكلفة غير دقيقة وجودة غير مضبوطة |
| Quality / Exceptions | استثناءات مفتوحة أو غير مراجعة | تأخير إنتاج ومخاطر جودة |
| WIP | أوامر مفتوحة أو حركات غير مغلقة | WIP متضخم في الميزانية |
| Cost Accounting | Cost Processor أو Cost Profile غير مضبوط | Cost Distributions خاطئة أو ناقصة |
| Cost Distributions | عدم مراجعة التوزيعات | اختلاف بين الإنتاج والمالية |
| Variances | عدم تحليل الانحرافات | استمرار أخطاء Work Definition أو التنفيذ |
| Work Order Close | تأخير الإغلاق أو إغلاق خاطئ | تكلفة فعلية وانحرافات في فترة خاطئة |
| Period Close | إغلاق الفترة مع Pending Transactions أو WIP غير مراجع | تقارير مالية غير دقيقة |
| Reports | تقارير غير كافية أو لا تستخدم | الإدارة لا ترى المخاطر مبكرًا |
| UAT / Go-Live | اختبار شاشة بدل دورة كاملة | فشل بعد التشغيل وعودة إلى Excel |

---

## 3. مخاطر Master Data

| الخطر | سبب ظهوره | أثره على الإنتاج | أثره على المخزون | أثره المالي | طريقة الوقاية |
|---|---|---|---|---|---|
| Items غير مضبوطة | عدم تحديد خصائص الصنف الإنتاجية والمخزنية | صعوبة إنشاء Work Definition أو Work Order | حركات غير صحيحة للصنف | تكلفة غير دقيقة | مراجعة خصائص Items قبل التطبيق |
| Costing Enabled غير صحيح | عدم تفعيل الصنف للتكلفة عند الحاجة | الإنتاج يعمل دون تكلفة صحيحة | لا تظهر قيمة صحيحة للحركات | Cost Accounting لا يعكس الواقع | إشراك محاسب التكلفة في إعداد الأصناف |
| Inventory Asset Value غير صحيح | تصنيف الصنف كأصل أو مصروف بشكل خاطئ | يؤثر على قابلية تقييم المخزون | تقييم خاطئ للمخزون | حسابات مخزون أو مصروف خاطئة | مراجعة مالية لكل Item Group/Item |
| UOM غير صحيحة | وحدات قياس غير موحدة أو تحويلات ناقصة | كميات إنتاج وصرف خاطئة | نقص أو زيادة وهمية | تكلفة مضاعفة أو ناقصة | اعتماد UOM وتحويلاتها قبل Work Definition |
| Lot / Serial Control غير مضبوط | تجاهل متطلبات التتبع | صعوبة تتبع المواد والمنتج | Traceability ضعيف | ضعف مراجعة التكلفة حسب Lot/Serial | تحديد الأصناف التي تحتاج Lot/Serial مبكرًا |
| Inventory Organization غير صحيحة | ربط المصنع بمنظمة مخزون غير مناسبة | Work Orders في جهة خاطئة | حركات في منظمة غير صحيحة | Cost Organization قد لا تعكس المصنع | توثيق Inventory Organizations ومصانعها |
| Manufacturing Plant Parameters غير مضبوطة | إهمال Plant Parameters | سلوك إنتاج غير متوقع | صرف أو إكمال غير مضبوط | تأثير على Costing وExecution | مراجعة Plant Parameters مع الإنتاج والمالية |
| Subinventory / Locator غير واضح | عدم تحديد مواقع الصرف والإكمال | صعوبة تنفيذ Material Issue وCompletion | مواد ومنتجات في مواقع خاطئة | WIP وFinished Goods غير موثوقين | تحديد Supply وCompletion Subinventories |
| Work Areas غير معرفة | عدم تقسيم المصنع منطقيًا | صعوبة تنظيم Work Centers | لا أثر مباشر غالبًا | تقارير تشغيل ضعيفة | إعداد Work Areas قبل Work Centers |
| Work Centers غير معرفة | غياب مركز العمل للعملية | لا يمكن ربط العمليات بالموارد | لا أثر مباشر إلا عبر التنفيذ | تكلفة موارد غير قابلة للربط | إعداد Work Centers كاملة |
| Resources غير معرفة | عدم تعريف العمالة أو المعدات | لا يمكن تسجيل Resource Charging | لا أثر مخزني مباشر | تكلفة تشغيل ناقصة | تعريف Labor وEquipment Resources |
| Resource UOM غير صحيحة | UOM للمورد لا تناسب الاستخدام الزمني | فشل أو ضعف جدولة الموارد | لا أثر مباشر | تكلفة مورد خاطئة | ضبط Resource UOM قبل الربط بالمركز |
| Shifts / Calendars غير صحيحة | ساعات عمل غير واقعية | جدولة غير دقيقة | لا أثر مباشر | Resource Cost وCapacity مضللان | مراجعة Shifts/Calendars مع الإنتاج |
| Standard Operations غير واضحة | عدم توحيد العمليات | تكرار وتعريفات متضاربة | لا أثر مباشر | Costing غير متسق | إنشاء Standard Operations للعمليات المتكررة |
| Supply Type غير محدد أو غير صحيح | عدم فهم Push/Pull/Bulk/Phantom/Supplier | صرف مواد في توقيت خاطئ | نقص/زيادة مخزون | WIP وVariances خاطئة | مراجعة Supply Type لكل Component |

---

## 4. مخاطر Item Structure / BOM

| الخطر | كيف يظهر؟ | أثره التشغيلي | أثره على التكلفة | كيف نكتشفه؟ | كيف نمنعه؟ |
|---|---|---|---|---|---|
| Item Structure غير موثقة | اعتماد شفهي أو Excel غير معتمد | Work Definition لا تستند لهيكل موثوق | Cost Rollup غير موثوق | اختلاف الصرف عن الواقع | اعتماد Item Structure رسمي |
| مكونات ناقصة | مواد لا تظهر في Work Order | العامل يصرف يدويًا أو يتجاوز النظام | تكلفة المنتج أقل من الواقع | Material Usage Variance أو شكاوى الإنتاج | مراجعة المكونات مع الإنتاج والمستودعات |
| مكونات زائدة | مواد تظهر ولا تستخدم فعليًا | صرف غير مطلوب أو تعديل يدوي | تكلفة أعلى أو WIP غير صحيح | مواد مرتجعة أو Variances | مراجعة Item Structure قبل Go-Live |
| كميات خاطئة | استهلاك أعلى/أقل من الواقع | نقص أو فائض مواد | Usage Variance متكرر | مقارنة المخطط بالمصروف | اختبار UAT بكميات حقيقية |
| UOM خاطئة | كغ/غرام أو ساعة/دقيقة غير مضبوطة | كميات غير منطقية | تكلفة مضاعفة أو ناقصة | تقارير صرف غير منطقية | اعتماد UOM والتحويلات |
| عدم وضوح Subassemblies | نصف مصنع يعامل كمادة عادية أو العكس | Work Orders فرعية غير واضحة | تكلفة متعددة المستويات غير دقيقة | أسئلة الإنتاج عن مراحل وسيطة | تحديد Subassemblies مبكرًا |
| Ad hoc Items غير مضبوطة | إضافة مواد خارج الهيكل بصلاحيات واسعة | فوضى في الصرف | Substitution/Usage Variance | مراجعة المواد غير الموجودة في Structure | ضبط صلاحية Ad hoc |
| Supply Type خاطئ للمكونات | Pull بدل Push أو Bulk بدل Issue | صرف تلقائي/يدوي غير متوقع | WIP غير صحيح | تقرير Supply Types | مراجعة Supply Type مع التشغيل |
| Phantom غير مفهوم | تفجير مكونات دون أمر مستقل | المستخدم لا يرى نصف المصنع كأمر | Costing يتبع التفجير لا الأمر الفرعي | اختلاف توقع المستخدم مع النظام | تدريب وتوثيق Phantom |
| Supplier Supply غير مضبوط | مواد أو عمليات من المورد غير واضحة | تأخير أو نقص عند التنفيذ | تكلفة Outside/Supplier غير دقيقة | أوامر لا تكتمل بسبب المورد | توثيق Supplier Supply |
| Co-products / By-products غير معرفة | Process Output غير مكتمل | مخرجات لا تدخل المخزون | توزيع تكلفة غير صحيح | Product Completion ناقص | تعريف Operation Outputs |
| تغييرات Item Structure لا تصل إلى Work Definitions | تغيير المكونات دون Synchronization | Work Order يستخدم تعريفًا قديمًا | Costing مبني على قديم | مقارنة تاريخ التغيير والتعريف | آلية إشعار ومزامنة |
| عدم إشعار Manufacturing Engineer أو Cost Accountant | تغيير فني لا يصل للتكلفة | تطبيق تعريف غير معتمد | Cost Rollup غير محدث | فجوات بين الهندسة والتكلفة | تفعيل مسؤولية الإشعار |
| صلاحيات التعديل غير مضبوطة | أي مستخدم يغير المكونات | فقدان السيطرة | تكلفة غير مستقرة | Audit Log | صلاحيات واعتمادات واضحة |

### أعراض فشل Item Structure بعد Go-Live

| العرض | ماذا يعني؟ | التصرف المطلوب |
|---|---|---|
| صرف مواد لا تعكس الواقع | Item Structure غير دقيقة أو Supply Type خاطئ | مراجعة Structure مع الإنتاج |
| تكلفة غير منطقية | كميات أو UOM أو Costing غير صحيحة | مراجعة Cost Rollup وComponents |
| Work Definitions لا تتطابق مع الواقع | لم تتم مزامنة التغييرات | مراجعة Synchronization |
| كثرة التعديلات اليدوية | ضعف التعريف الأساسي | تجميد التعديل وإعادة اعتماد Structure |
| Variances متكررة | فرق دائم بين المخطط والفعلي | تحليل Material Usage/Substitution |

---

## 5. مخاطر Work Definition

| الخطر | أثره على Work Order | أثره على التكلفة | أثره على التنفيذ | طريقة الوقاية |
|---|---|---|---|---|
| غياب Work Definition | لا يوجد قالب صحيح لإنشاء Work Order | لا يمكن بناء Cost Rollup موثوق | التشغيل يبدأ بلا عمليات/موارد واضحة | لا Go-Live قبل اعتماد Work Definitions |
| Work Definition غير مكتملة | Work Order ناقص مواد أو عمليات | تكلفة ناقصة | توقف أو تعديل يدوي | Checklist اعتماد Work Definition |
| Work Definition Version غير صحيحة | استخدام تعريف غير مناسب للتاريخ | تكلفة تاريخية خاطئة | تنفيذ بطريقة قديمة أو مستقبلية | ضبط Effective Dates |
| Primary Work Definition غير واضحة | Planning أو التنفيذ يختار تعريفًا خاطئًا | Cost Rollup قد يستخدم غير المناسب | ارتباك في البدائل | تحديد Primary بوضوح |
| Alternate Work Definition غير مضبوطة | بدائل غير حاكمة | تكلفة مختلفة دون سبب | تشغيل غير موحد | ضبط أسباب استخدام البدائل |
| Costing Priority غير مناسبة | Cost Rollup يستخدم تعريفًا غير مناسب | تكلفة معيارية خاطئة | لا أثر مباشر على التشغيل | مراجعة Costing Priority مع المالية |
| Production Priority غير مناسبة | التخطيط يستخدم تعريفًا غير مناسب | أثر غير مباشر على التكلفة | أوامر على خط/طريقة غير مناسبة | مراجعة Production Priority |
| Effective Dates غير صحيحة | تعريف غير ساري أو منتهي | تكلفة غير صحيحة للفترة | منع أو اختيار خاطئ | اختبار تواريخ السريان |
| Operations غير معرفة | Work Order بلا مراحل | لا Resource Cost | لا يمكن تتبع التنفيذ | تعريف Operations كاملة |
| Operation Items غير صحيحة | صرف مواد خاطئ | WIP وMaterial Cost خاطئة | مواد ناقصة/زائدة | مراجعة Operation Items |
| Operation Resources غير صحيحة | لا يتم تحميل مورد صحيح | Resource Cost خاطئة | جدولة وتنفيذ ضعيفان | مراجعة Resources لكل Operation |
| Operation Outputs غير معرفة في Process | مخرجات ناقصة | توزيع تكلفة ناقص | Product Completion غير مكتمل | ضبط Outputs في Process |
| Completion Subinventory / Locator غير صحيح | المنتج يذهب لموقع خاطئ | Finished Goods Valuation مضلل | المستودع لا يجد المنتج | مراجعة مواقع الإكمال |
| Rework / Transform Work Definitions غير واضحة | معالجة العيوب خارج النظام | تكلفة إعادة التشغيل ضائعة | Rework غير محكوم | تعريف Rework/Transform عند الحاجة |
| Work Definition لا تعكس الواقع | Work Order نظري فقط | Variances عالية | المستخدمون يلتفون على النظام | Walkthrough ميداني قبل الاعتماد |
| Work Definition لا تعكس نموذج التكلفة | موارد أو Overhead غير ممثلة | تكلفة غير كاملة | لا يظهر كامل جهد التصنيع | إشراك Cost Accountant |
| Serial Tracking غير مضبوط | تتبع ناقص | صعوبة تحليل تكلفة/جودة حسب Serial | عدم امتثال في الصناعات الحساسة | ضبط Serial Tracking عند الحاجة |

### لماذا Work Definition هي نقطة الفشل أو النجاح الأولى في Oracle؟

لأنها ليست BOM فقط؛ بل تجمع **Item Structure + Operations + Resources + Outputs + Priorities + Versions**. أي Work Order يُنشأ منها يرث منطق الإنتاج والتكلفة. إذا كانت Work Definition خاطئة، فإن الأخطاء ستنتقل إلى الصرف، الإكمال، WIP، Cost Distributions، Variances، وPeriod Close.

---

## 6. مخاطر Work Centers / Resources / Operations

| الخطر | أثره على التنفيذ | أثره على التكلفة | أثره على التقارير | طريقة الوقاية |
|---|---|---|---|---|
| Work Center غير صحيح | العملية تنسب لمركز غير واقعي | Overhead أو Resource Cost غير دقيقة | تقارير المركز مضللة | مراجعة ميدانية لمراكز العمل |
| Resource غير معرف | لا يمكن تسجيل الاستخدام | تكلفة ناقصة | Resource Usage Report ناقص | تعريف Labor/Equipment |
| Resource Rate غير دقيق | لا يظهر أثناء التشغيل مباشرة | تكلفة مورد خاطئة | Variance أو Cost Report مضلل | اعتماد Resource Rates |
| Resource UOM غير صحيحة | صعوبة التسجيل أو الجدولة | Usage × Rate خاطئ | تقارير الوقت غير منطقية | ضبط UOM الزمنية |
| Resource لا ينتمي إلى Work Center صحيح | تسجيل على مركز خاطئ | تكلفة موزعة خطأ | استخدام مورد مضلل | ربط الموارد بالمراكز |
| Utilization / Efficiency غير واقعية | مدة تشغيل غير واقعية | تكلفة أو جدولة مضللة | تقارير Capacity خاطئة | مراجعة مع الإنتاج |
| Shifts / Calendars غير صحيحة | جدولة غير واقعية | أثر غير مباشر على التكلفة | Capacity Reports خاطئة | اعتماد Calendars |
| Count Point Operations غير مضبوطة | عمليات إلزامية قد لا تسجل | تكلفة تشغيل ناقصة | Operations Completion غير موثوق | تحديد Count Points |
| Auto-Transact Operations تسبب تسجيلًا غير مفهوم | النظام يكمل عمليات تلقائيًا | تكلفة قد تظهر دون إدخال واضح | يصعب تفسير التقارير | تدريب المستخدمين وتوثيقها |
| Optional Operations تستخدم بطريقة خاطئة | تجاوز عمليات مهمة | تكلفة وجودة ناقصة | عمليات متجاوزة دائمًا | ضبط Optional فقط للعمليات غير الحرجة |
| Supplier Operations غير واضحة | توقف في Outside Processing | تكلفة خدمة خارجية غير دقيقة | تقارير Supplier Operations ناقصة | توثيق المورد والعملية |
| Operator Check-in/out غير مستخدم رغم الحاجة | وقت العامل غير دقيق | Resource Cost أقل/أكثر | Productivity Reports ضعيفة | تفعيل عند الحاجة والتدريب |
| Resource Charging غير دقيق | لا يعكس التنفيذ | WIP وتكلفة غير دقيقة | Variance غير مفسر | قواعد تسجيل واضحة |
| Maintenance-related Exceptions غير مربوطة | أعطال لا تظهر على الإنتاج | تكلفة توقف غير مرئية | تقارير Exceptions ناقصة | ربط Maintenance عند الحاجة |

---

## 7. مخاطر Work Orders

| الخطر | متى يظهر؟ | أثره على دورة العمل | أثره المالي | طريقة التحكم |
|---|---|---|---|---|
| إنشاء Work Order بدون Work Definition صحيحة | عند الإنشاء اليدوي أو الآلي | أمر ناقص أو خاطئ | Cost Object غير موثوق | Validation على Work Definition |
| اختيار Work Definition خاطئة | عند تعدد البدائل | تنفيذ بطريقة غير مناسبة | تكلفة مختلفة | ضبط Primary/Alternate |
| اختيار Version غير مناسب | عند وجود تواريخ سريان | تنفيذ بتعريف غير ساري | تكلفة تاريخية خاطئة | تحقق من Effective Date |
| تعديل Work Order بعد الإنشاء بدون ضوابط | أثناء التنفيذ | اختلاف عن القالب المعتمد | Variances أو تكلفة غير مفسرة | صلاحيات وAudit |
| Nonstandard Work Orders بدون حوكمة | حالات خاصة كثيرة | تشغيل خارج النموذج | تكلفة صعبة التحليل | سياسة Nonstandard واضحة |
| Rework / Transform Work Orders غير مفهومة | عند العيوب أو التحويل | إعادة تشغيل غير محكومة | تكلفة Rework ناقصة | تعريف عمليات Rework/Transform |
| Orderless Manufacturing دون ضوابط | إنتاج سريع أو Flow | ضعف التتبع | تكلفة أقل تفصيلًا | استخدامه فقط عند ملاءمته |
| Work Orders مرتبطة بطلبات بيع أو مشاريع بلا وضوح | Back-to-Back أو Project | حجز أو توريد خاطئ | تكلفة مشروع/طلب غير دقيقة | ربط الطلبات بوضوح |
| Work Orders لا تصل إلى Release | أوامر منشأة فقط | لا يبدأ التنفيذ | لا تتراكم تكلفة لكن التخطيط يتأثر | متابعة Unreleased |
| Work Orders لا تصل إلى Close | بعد Completed | دورة غير مكتملة | WIP وVariances غير محسومة | تقرير Unclosed Orders |
| Work Orders تبقى Completed بدون Close | بعد Product Completion | المستخدم يظنها منتهية | تكلفة فعلية مؤجلة | سياسة Close منتظمة |
| Work Orders تلغى رغم وجود حركات | عند أخطاء تشغيل | حركات تحتاج معالجة | WIP أو مخزون معلق | منع الإلغاء أو طلب مراجعة حركات |

---

## 8. مخاطر Work Order Statuses

| الخطر | ماذا يعني؟ | أثره | كيف نمنعه؟ |
|---|---|---|---|
| Unreleased لفترة طويلة | أمر غير جاهز أو مهمل | تخطيط غير موثوق | متابعة أوامر Unreleased |
| Released بدون جاهزية مواد | أمر متاح للتنفيذ لكن المواد غير كافية | توقف صالة الإنتاج | تحقق On-hand قبل التنفيذ |
| Released بدون استعداد الموارد | أمر جاهز نظريًا | تأخير ومشاكل Scheduling | مراجعة Resources/Shifts |
| On Hold لا يستخدم عند مشكلة | استمرار تنفيذ أمر به مشكلة | أخطاء ومخزون خاطئ | سياسة On Hold واضحة |
| Pending Approval غير مفهوم | توقيع/اعتماد غير مكتمل | تأخير Release | تدريب وتحديد المسؤول |
| Completed يفهم خطأ كـ Closed | المستخدم يظن التكلفة نهائية | WIP وتكلفة غير مغلقة | تدريب على الفرق بينهما |
| Closed قبل مراجعة التكلفة | إغلاق مبكر | Variances أو تكلفة خاطئة | Checklist Close |
| Canceled بدون مراجعة الحركات | إلغاء مع آثار قائمة | مخزون/WIP معلق | Validation قبل Cancel |
| السماح بحركات في حالة غير مناسبة | تنفيذ على أمر غير صالح | فوضى تشغيلية | قواعد حالة صارمة |
| السماح بالتعديل بعد Close | كسر الحوكمة | أرقام مالية غير مستقرة | منع تعديل Closed |

---

## 9. مخاطر Supply Types

| الخطر | أثره على الصرف | أثره على المخزون | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| Push بدل Pull أو العكس | صرف يدوي بدل تلقائي أو العكس | نقص أو صرف زائد | WIP غير مطابق | مراجعة Supply Type لكل مكون |
| Operation Pull يسبب صرفًا تلقائيًا غير متوقع | Backflush عند العملية | مخزون ينقص دون إدراك المستخدم | Cost يظهر تلقائيًا | تدريب على Pull |
| Assembly Pull غير مفهوم | صرف عند إكمال المنتج | مواد تخصم عند Completion | تكلفة مرتبطة بالإكمال | توثيق Assembly Pull |
| Bulk يعرض المكون دون صرف حقيقي | المستخدم يتوقع صرفًا لكنه لا يحدث | مخزون لا يتغير | لا يدخل WIP | استخدام Bulk بحذر |
| Phantom يفجر المكونات بطريقة لا يفهمها المستخدم | لا يظهر كأمر مستقل | مكونات تصرف مباشرة | تكلفة تدخل الأمر الأعلى | توضيح Phantom |
| Supplier Supply لا يعكس مسؤولية المورد | مواد/خدمة عند المورد | قد لا تخصم من مخزون داخلي | تكلفة خارجية غير مضبوطة | ضبط Supplier Operations |
| Supply Subinventory غير صحيح | صرف من مخزن خاطئ | مخزون مواقع خاطئ | WIP بقيمة صحيحة لكن مصدر خاطئ | مراجعة مواقع الصرف |
| Supply Locator غير صحيح | صرف من رف/موقع خاطئ | اختلاف فعلي/نظامي | أثر مخزني تفصيلي | ضبط Locators |
| Prevent Issue of Expired Lots غير مفعل عند الحاجة | صرف Lots منتهية | مخاطر جودة ومخزون | تكلفة منتج مرفوض | تفعيل المنع عند الحاجة |
| Supply Type لا يتوافق مع الواقع | النظام لا يعكس الصالة | تعديلات يدوية كثيرة | Variances متكررة | جلسة تحليل للصرف الفعلي |

---

## 10. مخاطر Material Issue / Component Issue

| الخطر | كيف يظهر؟ | أثره على المخزون | أثره على WIP | أثره على Cost Accounting | طريقة الوقاية |
|---|---|---|---|---|---|
| صرف مواد غير صحيحة | Component خارج التعريف | نقص/زيادة لصنف خاطئ | WIP مشوه | Substitution Variance أو تكلفة خطأ | ربط الصرف بـ Work Definition |
| صرف كمية أقل | إنتاج لا يكتمل أو تكلفة ناقصة | مخزون أعلى من الواقع المستهلك | WIP أقل | Usage Variance | مقارنة المطلوب بالمصروف |
| صرف كمية أكثر | هدر أو سوء ضبط | مخزون أقل من الواقع | WIP أعلى | Usage Variance | صلاحية وسبب للصرف الزائد |
| صرف مادة غير موجودة في Item Structure | بديل غير موثق | مخزون مادة بديلة ينقص | WIP لا يطابق القالب | Substitution Variance | سياسة Substitute |
| صرف Lot منتهي | عدم منع Expired Lots | مخاطر جودة | WIP بمواد غير صالحة | تكلفة قد تذهب للهالك | تفعيل Prevent Expired Lots |
| عدم تسجيل Lot / Serial | إدخال ناقص | Traceability مفقود | تكلفة لا يمكن تحليلها بالتتبع | ضعف Genealogy | إلزام Lot/Serial |
| صرف من Subinventory خاطئ | اختيار موقع غير صحيح | أرصدة مواقع خاطئة | لا يغير إجمالي WIP غالبًا | Cost حسب موقع قد يتأثر | Defaults وValidation |
| صرف على Work Order خاطئ | خطأ مستخدم | مخزون خرج لطلب خاطئ | WIP لأمر خاطئ | Cost Distribution خاطئ | Scanning/Validation |
| الصرف التلقائي بدون فهم | Backflush غير مفهوم | خصم مفاجئ | WIP مفاجئ | صعوبة تفسير التكلفة | تدريب المستخدمين |
| عدم مطابقة المصروف مع Work Definition | تعديلات متكررة | تقارير غير موثوقة | WIP غير دقيق | Variances | تقرير Material Usage |
| الصرف بدون موافقة | صلاحيات واسعة | مخزون ينقص بلا رقابة | WIP غير محكوم | تكلفة غير معتمدة | صلاحيات واعتماد |
| Material Issue لا يظهر في Cost Accounting | إعدادات Costing أو Transfer ناقصة | مخزون تغير دون تكلفة | WIP غير محدث ماليًا | Cost Distributions ناقصة | مراجعة Transfer/Cost Processor |

---

## 11. مخاطر Material Return / Component Return

| الخطر | أثره على المخزون | أثره على WIP | أثره المالي | طريقة الوقاية |
|---|---|---|---|---|
| عدم تسجيل المرتجعات | مخزون أقل من الواقع | WIP أعلى من الواقع | تكلفة أمر مبالغ بها | إلزام تسجيل Return |
| إرجاع أكثر من المصروف | مخزون يزيد خطأ | WIP ينخفض خطأ | تكلفة سالبة أو مشوهة | Validation على الكمية المصروفة |
| إرجاع Lot / Serial خطأ | Traceability خاطئ | WIP لا يطابق الأصل | Costing غير دقيق | التحقق من Lot الأصلي |
| إرجاع مواد تالفة كأنها صالحة | مخزون متاح غير صالح | WIP ينخفض خطأ | خسائر جودة لاحقة | حالة للمادة التالفة |
| الإرجاع بعد Product Completion بدون سياسة | تعديل بعد الإنجاز | WIP يتغير بعد Completion | تكلفة غير مستقرة | سياسة زمنية للإرجاع |
| محاولة الإرجاع بعد Close | لا يجب تعديل أمر مغلق | كسر الإغلاق | أرقام مالية تتغير | منع أو مسار تصحيح رسمي |
| عدم عكس أثر الإرجاع على WIP | مخزون يرجع دون WIP | WIP مبالغ | تكلفة لا تنخفض | تكامل Return مع Costing |
| عدم ظهور الإرجاع في Cost Accounting | Cost Distribution ناقصة | WIP مالي غير صحيح | GL لا يطابق | مراجعة Cost Processor |

---

## 12. مخاطر Resource Charging / Operation Execution

| الخطر | أثره التشغيلي | أثره على WIP | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| عدم تسجيل الموارد | لا يظهر جهد العمل | WIP أقل | تكلفة ناقصة | تدريب وتحديد إلزامية التسجيل |
| تسجيل موارد خاطئة | موارد لا تعكس الواقع | WIP على مورد خطأ | Resource Variance | Validation Resource-Operation |
| Resource Usage غير دقيق | ساعات/استخدام خاطئ | WIP زائد أو ناقص | Resource Usage Variance | حدود وتحليل استثناءات |
| Resource Rate خاطئ | التشغيل يبدو صحيحًا | WIP بقيمة خطأ | Resource Rate Variance | اعتماد Resource Rates |
| Manual Charging ينسى المستخدم إدخاله | تكلفة لا تسجل | WIP ناقص | تكلفة ناقصة | Reminders/Reports |
| Automatic Charging يسجل بدون فهم | Cost يظهر تلقائيًا | WIP يزيد تلقائيًا | صعوبة تفسير التكلفة | توثيق الإعداد |
| Operator Check-in/out غير مستخدم رغم الحاجة | ضعف تتبع العامل | WIP غير دقيق حسب العمالة | تكلفة عمالة غير دقيقة | تطبيق Check-in عند الحاجة |
| العمليات لا تسجل بالترتيب | تقدم غير منطقي | قد يؤثر على Backflush | تكلفة حسب توقيت خاطئ | ضبط Operation Sequence |
| Count Point غير منفذة | عملية إلزامية ناقصة | WIP/Progress غير مكتمل | تكلفة ناقصة | منع تجاوز Count Point |
| Auto-Transact تخفي أخطاء | عمليات تكتمل آليًا | WIP قد يزيد دون إدراك | Cost غير مفهوم | مراجعة Auto-Transact |
| Optional Operations تتجاوز بلا ضبط | عمليات جودة/فحص قد تضيع | WIP لا يشملها | تكلفة ناقصة | تحديد Optional بحذر |
| Resource Exceptions لا تسجل | أعطال غير مرئية | أثر غير مباشر | تكلفة توقف غير محللة | تفعيل Exceptions |
| Maintenance Exceptions لا تظهر | أعطال آلات خارج النظام | تأخير غير مفسر | تكلفة توقف مخفية | ربط Maintenance عند الحاجة |

---

## 13. مخاطر Product Completion

| الخطر | أثره على المخزون | أثره على WIP | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| Completion قبل اكتمال العمليات | Finished Goods مبكر | WIP ينخفض قبل اكتمال الواقع | تكلفة مؤقتة مضللة | Validate Count Points |
| Completion قبل صرف المواد | منتج تام دون استهلاك مواد | WIP ناقص | تكلفة ناقصة حتى التصحيح | تحقق من Material Issue |
| Completion بكمية خاطئة | مخزون تام زائد/ناقص | WIP غير متوازن | تكلفة وحدة غير دقيقة | مراجعة الكمية والتسامح |
| Completion في Subinventory خاطئ | المنتج في موقع خاطئ | لا يغيّر WIP بالضرورة | تقييم موقع خاطئ | ضبط Completion Subinventory |
| Completion Cost مؤقتة لا يفهمها المستخدم | يظن التكلفة نهائية | WIP قد يبقى | قرارات تسعير خاطئة | تدريب على Provisional Cost |
| الإنتاج الجزئي غير مفهوم | أوامر تبقى مفتوحة | WIP جزئي | تكلفة غير نهائية | سياسة Partial Completion |
| Undercompletion Tolerance غير مضبوط | إغلاق بكميات أقل دون فهم | WIP/Variance | Batch/Yield/Close Variance | ضبط التسامح |
| Outputs غير صحيحة | Co/By-products ناقصة | WIP لا يوزع صحيحًا | تكلفة Outputs خاطئة | مراجعة Process Outputs |
| Completion دون Quality عند الحاجة | مخزون متاح غير مفحوص | WIP ينخفض | تكلفة منتج قد يرفض لاحقًا | ربط Quality/Inspection |
| Completed تفهم كنهاية مالية | لا يتم Close | WIP وتكلفة غير محسومة | Variances مؤجلة | تدريب على الفرق Completed/Closed |

---

## 14. مخاطر Scrap / Rework / Reject

| الخطر | أثره على الجودة | أثره على المخزون | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| عدم تسجيل Scrap | جودة لا تعكس الواقع | مخزون قد يبقى وهميًا | تكلفة سليمة مبالغ بها أو ناقصة | إلزام Scrap Transaction |
| Scrap بدون سبب | صعوبة تحليل الجذور | خروج كمية دون تفسير | Scrap Variance غير قابل للتحليل | أسباب هالك إلزامية |
| Scrap لا يظهر في التكلفة | لا يرى أثر الجودة | مخزون فقط يتأثر | تكلفة ناقصة | ربط Scrap بـ Cost Accounting |
| Scrap Variance غير مفهوم | الإدارة لا تعرف السبب | لا أثر مباشر | استمرار الانحرافات | تدريب Cost Accountant |
| Rework غير مضبوط | إصلاح خارج النظام | مخزون معاد تشغيله غير واضح | تكلفة Rework ضائعة | Rework Work Orders |
| Reject لا يؤثر بشكل صحيح | مرفوض قد يصبح متاحًا | مخزون غير صالح | خسارة غير ظاهرة | سياسة Reject واضحة |
| الهالك الطبيعي وغير الطبيعي غير مفصول | خلط بين المتوقع وغير المتوقع | صعوبة مراقبة الجودة | تكلفة المنتج أو المصروف غير واضح | تعريف سياسة Scrap |
| الهالك القابل للبيع كخردة غير واضح | يحتاج تحقق إضافي من المصدر الأصلي | يحتاج تحقق إضافي | يحتاج تحقق إضافي | توثيق متطلب العميل |
| Scrap بعد Close أو دون صلاحية | تعديل بعد الإغلاق | كسر الحوكمة | تكلفة بعد الإغلاق | منع أو مسار تصحيح |

---

## 15. مخاطر Quality / Exceptions

| الخطر | أثره على الجودة | أثره على التشغيل | أثره على التكلفة | طريقة الوقاية |
|---|---|---|---|---|
| Quality Issues لا تسجل | عيوب غير موثقة | استمرار الإنتاج الخاطئ | Rework/Scrap غير محسوب | ربط Quality بالعملية |
| Inspection غير مطبقة | منتج غير مفحوص | مخاطر تسليم | تكلفة رفض لاحق | تحديد Inspection Operations |
| Production Exceptions لا تراجع | مشاكل صالة مستمرة | تعطيل غير محلل | تكلفة توقف مخفية | تقرير Exceptions مفتوحة |
| Material Exceptions لا تعالج | نقص مواد متكرر | توقف أو بدائل غير معتمدة | Variances | متابعة Material Exceptions |
| Resource Exceptions لا تعالج | أعطال/غياب غير مغطى | تأخير | Resource Usage مشوه | متابعة Resource Exceptions |
| Exceptions تبقى مفتوحة | مشاكل غير مغلقة | أوامر معلقة | Period Close يتأثر | SLA لإغلاق Exceptions |
| Maintenance Integration غير مفعلة عند الحاجة | أعطال آلات خارج التصنيع | تأخير غير واضح | تكلفة توقف غير مرئية | ربط Maintenance |
| المنتج يصبح متاحًا قبل الفحص | خطر جودة | بيع/استخدام منتج غير صالح | تكلفة مرتجعات أو Rework | منع الإتاحة قبل Quality |
| الاستثناءات لا تؤثر على القرار | تسجيل شكلي فقط | لا توقف ولا علاج | تكلفة لا تتحسن | ربط Exception بإجراء |
| الاستثناءات لا تظهر في التقارير | الإدارة لا تراها | فشل رقابي | لا تحليل للتكلفة | تقرير Production Exceptions |

---

## 16. مخاطر WIP

| الخطر | كيف يظهر في التقارير؟ | أثره على الميزانية | طريقة السيطرة |
|---|---|---|---|
| عدم فهم WIP | المستخدم لا يفسر WIP Report | أصول غير مفهومة | تدريب المالية والإنتاج |
| WIP يزيد بسبب Material Issue ولا يغلق | أوامر Released/Completed غير Closed | تضخم WIP | Close منتظم |
| WIP يزيد بسبب Resource Charging غير دقيق | Resource Cost عالية/ناقصة | WIP غير حقيقي | مراجعة Resource Usage |
| Product Completion لا يخفف WIP بشكل مفهوم | WIP يبقى بعد Completion | مخزون/WIP غير متوازن | مراجعة Product Completion Cost |
| Work Order Close لا يتم | Unclosed Work Orders | WIP مفتوح | سياسة Close شهرية/يومية |
| WIP مفتوح نهاية الفترة | Open WIP Report | تشويه الفترة | Period Close Checklist |
| WIP لا يطابق الواقع | فرق بين الإنتاج والمالية | ميزانية غير موثوقة | WIP Reconciliation |
| WIP Adjustments غير مضبوطة | Adjustments كثيرة | أرقام غير مستقرة | مراجعة Cost Adjustments |
| المالية لا تراجع WIP | لا توجد موافقة مالية | خطر GL غير مطابق | إشراك Cost Accountant |
| Work Orders مفتوحة لفترات طويلة | Aging للأوامر | WIP متضخم | تقرير Aging/Unclosed |

---

## 17. مخاطر Cost Accounting

| الخطر | أثره المالي | أثره على قرار الإدارة | طريقة الوقاية |
|---|---|---|---|
| Cost Accounting غير مفهوم | الأرقام لا تُفسر | قرارات مبنية على تشغيل فقط | تدريب الفريق |
| Cost Processor لا يعمل أو لا يراجع | حركات غير مسعرة | تكلفة ناقصة | متابعة Scheduled Processes |
| Cost Organization غير صحيحة | تكلفة في كيان خاطئ | تقارير مالية خاطئة | إعداد Cost Org بعناية |
| Cost Book غير صحيح | أرقام تكلفة في كتاب غير مناسب | مقارنة خاطئة | مراجعة Cost Books |
| Cost Method غير مناسب | Variances أو Actual Cost غير مناسب | سوء تقييم هامش الربح | اختيار Method مع المالية |
| Cost Profile غير مضبوط | Provisional/Valuation خاطئة | تكلفة غير مستقرة | مراجعة Cost Profiles |
| Cost Elements غير واضحة | تفاصيل التكلفة غير مفهومة | لا يمكن تحليل مواد/موارد/Overhead | تعريف Cost Elements |
| Valuation Unit غير واضحة | مستوى تقييم خاطئ | تحليل غير كافٍ أو زائد | تحديد Valuation Structure |
| Material Cost غير دقيق | تكلفة مواد خاطئة | سعر بيع أو ربحية خاطئة | مراجعة Item Costs |
| Resource Cost غير دقيق | تكلفة تشغيل خاطئة | تقييم كفاءة غير صحيح | مراجعة Resource Rates |
| Overhead غير واضح | تكلفة غير كاملة | هامش غير واقعي | يحتاج تحقق إضافي حسب سياسة العميل |
| Product Completion Cost مؤقتة لا تفهم | اعتماد رقم غير نهائي | قرار مخزون/بيع خاطئ | تدريب على Provisional Completion |
| Actual Work Order Cost لا يحسب بسبب عدم Close | تكلفة فعلية مؤجلة | هامش فترة خاطئ | Close منتظم |
| المالية غير مشاركة | إعدادات فنية فقط | رفض الأرقام لاحقًا | إشراك المالية من البداية |
| الاعتماد على التشغيل دون Cost Accounting | شاشات تعمل لكن أرقام لا | نظام غير موثوق | اختبار Costing end-to-end |

---

## 18. مخاطر Cost Distributions وSubledger / GL

| الخطر | أثره المحاسبي | كيف نكتشفه؟ | طريقة الوقاية |
|---|---|---|---|
| Cost Distributions غير مراجعة | قيود قد تكون خاطئة | Cost Distribution Report | مراجعة دورية |
| Cost Distributions غير مرحلة | GL لا يعكس الإنتاج | Transfer to GL Status | متابعة Subledger/GL Transfer |
| Distributions لا تعكس الحدث التشغيلي | اختلاف تشغيل/مالية | مقارنة Movement مع Distribution | Reconciliation |
| Subledger Accounting غير مفهوم | الفريق لا يعرف مصدر القيد | أسئلة مالية بلا جواب | تدريب SLA مفهومي |
| Transfer to GL غير منفذ | دفتر الأستاذ ناقص | GL Transfer Report | جدول إقفال واضح |
| اختلاف الإنتاج عن GL | فقدان الثقة بالأرقام | Production-to-GL Reconciliation | مطابقة شهرية |
| حسابات غير صحيحة | قيود لحسابات خاطئة | Trial Balance/Distribution | مراجعة Account Rules |
| Distributions بها أخطاء | قيود معلقة | Error Reports | معالجة قبل Period Close |
| Cost Accountant لا يراجع قبل Period Close | أخطاء تنتقل للفترة | إغلاق مع مشاكل | اعتماد مالي قبل الإقفال |
| الاعتماد على تقارير تشغيلية دون مطابقة مالية | إدارة ترى رقمًا والمالية رقمًا | اختلاف WIP/Inventory | ربط التقارير المالية والتشغيلية |

---

## 19. مخاطر Variances

| نوع الخطر | ماذا يعني؟ | الإجراء التصحيحي |
|---|---|---|
| Material Rate Variance مرتفع | سعر المادة الفعلي مختلف عن المستخدم في التكلفة | مراجعة أسعار المواد وCost Rollup |
| Material Usage Variance متكرر | الكمية المصروفة تختلف عن Work Definition | مراجعة Item Structure وعمليات الصرف |
| Material Substitution Variance غير مفسر | استخدام بدائل أو مواد خارج التعريف | ضبط Substitute/Ad hoc |
| Resource Rate Variance | معدل المورد لا يطابق المعتمد | تحديث Resource Rates |
| Resource Usage Variance | استخدام الموارد الفعلي لا يطابق المخطط | مراجعة Operations وResource Usage |
| Yield Variance | الإنتاج أو الهالك لا يطابق Yield | مراجعة Operation Yield وScrap |
| Job Close Variance | فرق متبقٍ عند الإغلاق | تحليل شامل للأمر قبل Close |
| Scrap Variance | الهالك أعلى/أقل من المتوقع | مراجعة أسباب Scrap والجودة |
| الانحرافات لا تراجع | المشكلة تتكرر | اجتماع دوري لتحليل Variances |
| الانحرافات لا تستخدم لتحسين Work Definition | الأرقام تتحول لتقرير فقط | تحديث Work Definition بناءً على التحليل |
| الإدارة لا تفهم دلالة الانحرافات | قرارات غير صحيحة | تبسيط تقارير الانحرافات |
| الانحرافات تظهر متأخرة عند Close | اكتشاف المشكلة بعد الفترة | مراقبة أثناء التنفيذ وليس فقط بعد Close |

---

## 20. مخاطر Work Order Close

| الخطر | أثره المالي | أثره التشغيلي | طريقة الوقاية |
|---|---|---|---|
| عدم إغلاق Work Orders | WIP مفتوح وتكلفة فعلية غير محسومة | أوامر تبقى نشطة | سياسة Close منتظمة |
| تأخير الإغلاق | Variances في فترة لاحقة | صعوبة تحليل الأداء | Close قبل Period Close |
| Close قبل مراجعة المواد | Costing غير دقيق | مواد ناقصة/زائدة غير معالجة | Checklist Material Review |
| Close قبل مراجعة الموارد | Resource Cost ناقصة/زائدة | عمليات غير مكتملة | Checklist Resource Review |
| Close مع Exceptions مفتوحة | تكلفة رغم وجود مشكلة | مشاكل غير محلولة | منع Close أو تحذير |
| Close مع Pending Transactions | الإغلاق قد يفشل أو ينتج تكلفة ناقصة | توقف الإقفال | تقرير Pending Transactions |
| Close في فترة مختلفة عن Completion | تكلفة وهامش في فترة خاطئة | تحليل فترة مضلل | سياسة Backdate/Period Review |
| Close بدون مراجعة WIP | WIP غير متوازن | أرقام غير موثوقة | WIP Reconciliation |
| Close بدون مراجعة Cost Distributions | قيود خاطئة | GL قد لا يطابق | Cost Accountant Review |
| Close يولد Variances غير مفهومة | مفاجآت مالية | فقدان الثقة | تحليل قبل الإغلاق |
| عدم منع التعديل بعد Close | كسر الحوكمة | تاريخ الأمر غير مستقر | صلاحيات صارمة |

---

## 21. مخاطر Period Close

| الخطر | أثره على الفترة المالية | الإجراء الوقائي |
|---|---|---|
| Period Close قبل إغلاق Work Orders | WIP وانحرافات تنتقل لفترة لاحقة | Unclosed Work Orders Report |
| Period Close مع Pending Transactions | تكلفة غير مكتملة | معالجة Pending قبل الإغلاق |
| Period Close مع WIP غير مراجع | ميزانية غير دقيقة | WIP Reconciliation |
| Period Close مع Cost Distributions غير مرحلة | GL لا يعكس الإنتاج | Transfer to GL Review |
| Period Close دون Variance Review | أخطاء تشغيل لا تُكتشف | Variance Analysis قبل الإقفال |
| إغلاق فترة قبل Transfer to GL | Subledger منفصل عن GL | جدولة SLA/GL Transfer |
| Work Orders مغلقة في فترة لاحقة | تشويه تكلفة الفترة | سياسة إغلاق حسب الفترة |
| عدم تنسيق الإنتاج مع المالية | إقفال متأخر أو مرفوض | Calendar إقفال مشترك |

---

## 22. مخاطر التقارير والرقابة

| الخطر | أثره على الإدارة | كيف نعالجه؟ |
|---|---|---|
| غياب Work Order Status Report | لا يعرفون أين تقف الأوامر | تقرير حالة يومي/أسبوعي |
| غياب WIP Report | WIP غير مراقب | WIP Report حسب أمر وفترة |
| غياب Cost Distribution Report | لا يمكن تتبع القيود | تقرير توزيع التكلفة |
| غياب Variance Report | لا تظهر أسباب فروقات التكلفة | تقرير Variance دوري |
| غياب Pending Transactions Report | Period Close يتعطل فجأة | تقرير قبل الإقفال |
| غياب Unclosed Work Orders Report | أوامر مفتوحة تتراكم | Aging Report |
| تقارير موجودة لكن لا يستخدمها أحد | رقابة شكلية | تحديد مالك لكل تقرير |
| التقارير لا تجيب على قرارات الإدارة | أرقام كثيرة بلا قرار | ربط كل تقرير بسؤال إداري |
| اختلاف تقارير الإنتاج عن المالية | فقدان الثقة | Reconciliation Reports |
| عدم وجود Dashboard تشغيلية | المشاكل تظهر متأخرة | لوحة يومية للأوامر والاستثناءات |
| عدم وجود تقارير تحذيرية قبل Period Close | أخطاء نهاية الشهر | Period Close Controls |

---

## 23. مخاطر UAT

| الخطر في UAT | ماذا قد يحدث بعد Go-Live؟ | طريقة الوقاية |
|---|---|---|
| اختبار شاشة فقط وليس دورة كاملة | الشاشات تعمل لكن الدورة تفشل | UAT من Work Definition إلى Period Close |
| عدم اختبار Work Definition | أوامر خاطئة | اختبار أكثر من منتج |
| عدم اختبار Work Order Lifecycle | حالات غير مفهومة | سيناريو Status Workflow |
| عدم اختبار Material Issue | صرف خاطئ | اختبار Push/Pull/Phantom/Supplier |
| عدم اختبار Resource Charging | تكلفة ناقصة | اختبار Manual/Automatic |
| عدم اختبار Product Completion | مخزون تام خاطئ | اختبار Completion جزئي وكامل |
| عدم اختبار Material Return | WIP لا يعكس المرتجعات | سيناريو Return |
| عدم اختبار Scrap | هالك غير محسوب | سيناريو Scrap/Rework |
| عدم اختبار Quality / Exceptions | جودة خارج النظام | سيناريو Exception/Inspection |
| عدم اختبار WIP | ميزانية غير موثوقة | WIP Report في UAT |
| عدم اختبار Cost Distributions | GL لا يطابق | اختبار Cost Accounting |
| عدم اختبار Variances | فروقات غير مفهومة | سيناريو Variance مقصود |
| عدم اختبار Work Order Close | تكلفة لا تغلق | Close كامل في UAT |
| عدم اختبار Period Close | فشل نهاية الشهر | UAT لإغلاق فترة |
| عدم اختبار GL Transfer | قيود لا تصل GL | SLA/Transfer Test |
| عدم مشاركة المالية | رفض الأرقام لاحقًا | توقيع المالية على UAT |
| عدم مشاركة المستودعات | صرف واستلام خاطئ | إشراك المستودعات |
| عدم اختبار سيناريوهات العميل الحقيقية | Go-Live غير واقعي | بيانات حقيقية قدر الإمكان |

---

## 24. مخاطر Go-Live وما بعد التشغيل

| الخطر | أثره بعد التشغيل | الإجراء الوقائي |
|---|---|---|
| التشغيل قبل جاهزية Master Data | أخطاء متسلسلة | Go/No-Go Master Data |
| التشغيل بدون Work Definitions معتمدة | أوامر خاطئة | اعتماد Work Definitions |
| التشغيل بدون Cost Accounting واضح | أرقام غير موثوقة | اختبار Costing قبل Go-Live |
| التشغيل بدون تدريب كافٍ | أخطاء تشغيلية | تدريب حسب الدور |
| التشغيل بدون خطة دعم | توقف المستخدمين | Support Plan |
| التشغيل دون مراقبة أول Work Orders | أخطاء لا تكتشف مبكرًا | Hypercare يومي |
| التشغيل دون مراجعة WIP | تضخم WIP | WIP Review أسبوعي |
| التشغيل دون مراجعة Cost Distributions | GL لا يطابق | مراجعة مالية مبكرة |
| التشغيل دون مراجعة Variances | أخطاء تعريف مستمرة | Variance Meeting |
| التشغيل دون اختبار Period Close | نهاية شهر فاشلة | Mock Period Close |
| المستخدمون يرجعون إلى Excel | النظام يفقد القيمة | متابعة ومنع مسارات خارجية |
| الفرق لا يميز تدريب/إعدادات/تطوير | حلول خاطئة | تصنيف التذاكر |

---

## 25. علامات الخطر المبكرة بعد Go-Live

| علامة الخطر | ماذا تعني؟ | التصرف السريع |
|---|---|---|
| Work Orders كثيرة Released أو Completed دون Close | ضعف متابعة الإغلاق | تقرير يومي وإجبار المراجعة |
| WIP يتراكم | أوامر لا تغلق أو حركات معلقة | WIP Reconciliation |
| Cost Distributions غير مفهومة | فريق المالية غير جاهز | جلسة Cost Accounting عاجلة |
| Variances عالية | Work Definition أو تنفيذ غير دقيق | تحليل Variance حسب السبب |
| المالية لا تعتمد أرقام الإنتاج | فجوة مالية/تشغيلية | مطابقة Cost Distribution مع GL |
| المستودعات تقول إن المخزون غير صحيح | Material Issue/Completion خطأ | جرد عينة وتحليل حركات |
| الإنتاج يقول إن النظام لا يعكس الواقع | Work Definition أو Supply Types غير صحيحة | مراجعة ميدانية |
| Pending Transactions كثيرة | عمليات Costing/Inventory معلقة | معالجة السبب فورًا |
| Exceptions مفتوحة كثيرة | مشاكل تشغيل غير مغلقة | تعيين مالك لكل Exception |
| تذاكر متكررة حول نفس المشكلة | تدريب أو إعداد خاطئ | Root Cause Analysis |
| العودة إلى Excel | فقدان الثقة بالنظام | إغلاق المسار اليدوي تدريجيًا |
| تأخير Period Close بسبب الإنتاج | تطبيق غير جاهز ماليًا | خطة إغلاق مشتركة |

---

## 26. مصفوفة تقييم المخاطر

| الخطر | الاحتمالية | الأثر | الأولوية | الإجراء المطلوب |
|---|---|---|---|---|
| Work Definition غير صحيحة | عالي | عالي | حرجة | اعتماد Work Definition قبل Go-Live |
| Item Structure غير دقيقة | عالي | عالي | حرجة | مراجعة المكونات والكميات |
| Supply Type خاطئ | عالي | عالي | حرجة | تحليل الصرف لكل مكون |
| Work Orders لا تغلق | عالي | عالي | حرجة | سياسة Close وتقارير Unclosed |
| WIP متضخم | متوسط | عالي | حرجة | WIP Reconciliation دوري |
| Cost Accounting غير مفهوم | متوسط | عالي | حرجة | إشراك المالية والتدريب |
| Cost Distributions غير مرحلة | متوسط | عالي | حرجة | متابعة SLA/GL Transfer |
| Pending Transactions | متوسط | عالي | عالية | تقرير يومي قبل الإقفال |
| Resource Rates غير دقيقة | متوسط | متوسط | عالية | اعتماد معدلات الموارد |
| Resource Charging غير مسجل | عالي | متوسط | عالية | إلزام أو أتمتة التسجيل |
| Product Completion بتكلفة مؤقتة غير مفهومة | متوسط | متوسط | عالية | تدريب المستخدمين والمالية |
| Completed يفهم كـ Closed | عالي | متوسط | عالية | تدريب على الحالات |
| Period Close دون مراجعة الإنتاج | متوسط | عالي | حرجة | Checklist إقفال فترة |
| Variances لا تراجع | عالي | متوسط | عالية | اجتماع Variance دوري |
| Material Issue لا يطابق Work Definition | عالي | عالي | حرجة | تقرير Material Usage |
| Lot/Serial غير مضبوط | متوسط | عالي | عالية | إلزام التتبع عند الحاجة |
| Quality Exceptions لا تغلق | متوسط | متوسط | متوسطة | مسؤولية واضحة للاستثناءات |
| UAT غير شامل | متوسط | عالي | حرجة | اختبار دورة كاملة |
| Go-Live دون تدريب | متوسط | متوسط | عالية | تدريب حسب الدور |
| العودة إلى Excel | متوسط | عالي | حرجة | دعم سريع وثقة بالتقارير |
| Nonstandard Orders دون حوكمة | متوسط | متوسط | متوسطة | سياسة Nonstandard |
| Scrap غير مسجل | متوسط | متوسط | عالية | إلزام أسباب Scrap |
| GL لا يطابق الإنتاج | متوسط | عالي | حرجة | Reconciliation شهري |
| Work Centers غير دقيقة | متوسط | متوسط | متوسطة | مراجعة ميدانية |
| Reports لا يستخدمها أحد | عالي | متوسط | عالية | تحديد مالك وقرار لكل تقرير |

---

## 27. كيفية الوقاية من فشل تطبيق الإنتاج

| التوصية | لماذا مهمة؟ | متى تطبق؟ |
|---|---|---|
| لا تبدأ بدون Master Data صحيحة | كل الدورة تعتمد عليها | قبل التحليل التفصيلي والإعداد |
| لا تطبق الإنتاج بدون Item Structure واضحة | تمنع صرف وتكلفة خاطئة | قبل Work Definition |
| لا تطبق الإنتاج بدون Work Definition معتمدة | هي القالب المركزي | قبل إنشاء Work Orders |
| لا تفعل Cost Accounting بدون مشاركة المالية | الأرقام ستُرفض لاحقًا | من بداية التصميم |
| لا تستخدم Supply Types قبل فهمها | تؤثر مباشرة على الصرف وWIP | أثناء تصميم Item Structure |
| لا تعتمد Product Completion دون فهم التكلفة المؤقتة | يمنع سوء تفسير تكلفة المنتج | أثناء التدريب وUAT |
| لا تترك Work Orders بدون Close | يمنع WIP متضخم | يوميًا/أسبوعيًا/شهريًا |
| لا تنفذ Period Close دون مراجعة الإنتاج | يحمي الفترة المالية | نهاية كل فترة |
| لا يتم Go-Live بدون UAT لدورة كاملة | يمنع فشل حقيقي بعد التشغيل | قبل قرار Go/No-Go |
| راقب أول شهر تشغيل يوميًا | تظهر الأخطاء مبكرًا | بعد Go-Live |
| افصل مشاكل التدريب عن الإعدادات عن التطوير | لتجنب حلول خاطئة | خلال الدعم والتذاكر |

---

## 28. ماذا نستفيد من Oracle في نظام ERP محلي مثل ناتج؟

| الخطر المستفاد من Oracle | كيف نحوله إلى ضابط في نظام محلي؟ |
|---|---|
| Work Definition غير صحيحة | إنشاء شاشة/وثيقة اعتماد لطريقة الإنتاج قبل استخدام الأمر |
| Item Structure غير دقيقة | تقرير أصناف إنتاجية بدون BOM/Structure أو بدون اعتماد |
| Supply Type خاطئ | ضبط طريقة صرف لكل مادة: يدوي/تلقائي/عند الإكمال |
| Work Orders لا تغلق | تقرير أوامر مفتوحة وتنبيه قبل نهاية الفترة |
| WIP غير مراجع | تقرير WIP حسب أمر إنتاج ومطابقة مع المالية |
| Cost Distributions غير مفهومة | توفير سجل تكلفة لكل حركة إنتاج ولو بشكل مبسط |
| Product Completion قبل مراجعة البيانات | Validation قبل الاستلام النهائي |
| Resource Charging غير مسجل | خيار تفعيل/تعطيل تكلفة الموارد حسب العميل |
| Variances لا تراجع | تقرير فرق مخطط/فعلي للمواد والموارد |
| Period Close دون إنتاج | Checklist إغلاق شهري للإنتاج قبل المالية |
| Quality Exceptions مفتوحة | قائمة استثناءات إنتاج وجودة مرتبطة بالأمر |
| UAT ناقص | سيناريو اختبار كامل من تعريف المنتج حتى الإغلاق |

---

## 29. ملخص تنفيذي

فشل نظام الإنتاج في Oracle غالبًا لا يكون بسبب شاشة Work Order، بل بسبب ضعف **Item Structure** و **Work Definition** و **Cost Accounting** و **Work Order Close**. هذه العناصر تمثل العمود الفقري للنظام؛ فإذا كانت غير مضبوطة ستظهر النتائج في WIP متضخم، Variances عالية، Cost Distributions غير مفهومة، وتأخير في Period Close.

أهم نقاط الانتباه:

- **Item Structure وWork Definition** هما أساس النجاح.
- **Supply Types** مصدر أخطاء كبير إذا لم تُفهم بدقة.
- **Product Completion** ليس نهاية مالية؛ التكلفة غالبًا تظل مؤقتة حتى Work Order Close.
- **Work Order Close** هو الحدث المالي الحاسم الذي يغلق WIP ويظهر الانحرافات.
- **Cost Accounting وCost Distributions** هما جسر الإنتاج إلى المالية.
- **UAT** يجب أن يغطي دورة كاملة من Work Definition حتى Period Close، لا شاشة واحدة.
- **التقارير والانحرافات** تكشف الفشل مبكرًا إذا تمت مراجعتها فعليًا.
- تطبيق الإنتاج يحتاج تعاون الإنتاج، المستودعات، المالية، محاسبة التكاليف، الجودة، والتخطيط، وليس فريق ERP فقط.

