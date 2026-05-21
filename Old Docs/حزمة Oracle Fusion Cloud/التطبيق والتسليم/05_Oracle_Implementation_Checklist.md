# 05_Oracle_Implementation_Checklist.md
# قائمة تطبيق وتسليم نظام الإنتاج في Oracle Fusion Cloud Manufacturing

## 1. مقدمة

هذا الملف يحوّل دراسة **Oracle Fusion Cloud Manufacturing** إلى قائمة تنفيذية تساعد فريق ERP على تطبيق وتسليم Module الإنتاج بطريقة منظمة. الهدف ليس إعادة شرح النظام، بل تحويل المفاهيم إلى نقاط تحقق عملية قبل وأثناء وبعد التطبيق.

الـ Checklist تقلل مخاطر:

- ضعف Master Data.
- Item Structures غير دقيقة.
- Work Definitions غير مضبوطة.
- Work Orders غير محكومة بالحالات.
- Supply Types خاطئة.
- Material Issue غير صحيح.
- Product Completion بتكلفة غير مفهومة.
- WIP غير مراقب.
- Cost Accounting غير واضح.
- Cost Distributions غير مراجعة.
- Work Order Close متأخر أو غير منتظم.
- Period Close غير مضبوط.
- تقارير غير كافية.
- UAT ضعيف أو غير شامل.

> ملاحظة منهجية: أي بند وارد هنا مستخرج من المقال أو مبني كـ **استنتاج وظيفي مبني على منطق المقال** عندما يكون الغرض تحويل المفهوم إلى بند تنفيذ.

---

## 2. طريقة استخدام هذا الملف

يُستخدم هذا الملف كأداة عمل في كل مرحلة من مراحل التطبيق. لا يُستخدم كقائمة قراءة فقط، بل كمرجع توقيع واعتماد بين الإنتاج، المستودعات، المالية، محاسبة التكاليف، الجودة، التخطيط، وفريق ERP.

| المرحلة | الهدف من استخدام الـ Checklist | الأطراف المطلوبة |
|---|---|---|
| قبل بدء التطبيق | تحديد جاهزية العميل وفهم هل يمتلك دورة إنتاج قابلة للنمذجة | الإدارة، الإنتاج، التخطيط، ERP |
| أثناء تحليل العميل | تحويل الواقع التشغيلي إلى إعدادات ومتطلبات واضحة | الإنتاج، المستودعات، المالية، محاسبة التكاليف، الجودة |
| أثناء إعداد النظام | التأكد من أن Master Data وWork Definitions وCost Accounting جاهزة | ERP، الإنتاج، المستودعات، Cost Accountant |
| أثناء اختبار السيناريوهات | اختبار دورة Work Order كاملة وليس شاشة واحدة | المستخدمون الرئيسيون، ERP، المالية، الجودة |
| قبل Go-Live | قرار Go/No-Go مبني على جاهزية حقيقية | الإدارة، ERP، الإنتاج، المستودعات، المالية |
| بعد Go-Live | مراقبة أول أوامر العمل وأول Cost Distributions | الدعم، ERP، الإنتاج، محاسبة التكاليف |
| أثناء أول Period Close | التأكد من إغلاق Work Orders، WIP، Cost Distributions، وGL Transfer | المالية، Cost Accountant، ERP، الإنتاج |

---

## 3. Checklist جاهزية العميل قبل تطبيق الإنتاج

| بند التحقق | لماذا مهم؟ | المسؤول | الخطر إذا لم يتحقق |
|---|---|---|---|
| هل لدى العميل دورة إنتاج موثقة؟ | Oracle يعتمد على دورة واضحة من Work Definition إلى Close | الإنتاج / ERP | تطبيق النظام كشاشات دون منطق تشغيلي |
| هل المنتجات النهائية معروفة؟ | Work Order يجب أن ينتج Assembly محدد | الإنتاج / PIM | أوامر عمل غير قابلة للتكلفة أو التتبع |
| هل المواد الخام معروفة؟ | Material Issue يعتمد على مكونات واضحة | المستودعات / الإنتاج | صرف مواد خاطئة أو نقص مخزون |
| هل توجد Subassemblies؟ | قد تحتاج Work Definitions مستقلة أو Phantom | الإنتاج / الهندسة | تضخم أو نقص في أوامر العمل والمواد |
| هل توجد Item Structures موثقة؟ | هي أساس Operation Items داخل Work Definition | PIM / الإنتاج | Work Definition غير صحيحة |
| هل توجد Work Definitions؟ | Oracle لا يبدأ تنفيذًا مؤسسيًا بدون قالب إنتاج واضح | Manufacturing Engineer | Work Orders ناقصة العمليات أو الموارد |
| هل توجد Operations واضحة؟ | تحدد التنفيذ، Count Point، Auto-Transact، Optional | الإنتاج | تعذر قياس التقدم والتكلفة |
| هل توجد Work Centers وResources؟ | ضرورية للتنفيذ والجدولة وتكلفة الموارد | الإنتاج / الصيانة | Resource Charging غير دقيق |
| هل المستودعات وSubinventories واضحة؟ | الصرف والإكمال يحتاجان Supply وCompletion Subinventory | المستودعات | حركات مخزون غير صحيحة |
| هل طريقة التكلفة معروفة؟ | Cost Profile وCost Method تؤثر على كل الحركة | Cost Accountant | تكلفة غير قابلة للاعتماد |
| هل المالية ومحاسبة التكاليف مشاركة؟ | Cost Accounting وSLA وGL جزء من الدورة | المالية | فجوة بين الإنتاج والقيود |
| هل توجد سياسة WIP؟ | WIP هو الرابط بين التنفيذ والتكلفة | المالية / Cost Accountant | WIP متضخم أو غير مفسر |
| هل توجد سياسة Work Order Close؟ | Close يحسم التكلفة والانحرافات | الإنتاج / التكلفة | Variances في فترة خاطئة |
| هل توجد سياسة Scrap / Rework / Reject؟ | الهالك والجودة يؤثران على التكلفة والمخزون | الجودة / الإنتاج | تحميل تكلفة غير صحيح |
| هل توجد سياسة Quality / Inspection؟ | Inspection وExceptions تؤثر على الإتاحة والتشغيل | الجودة | منتج غير مقبول يدخل المخزون |
| هل توجد سياسة Period Close؟ | يجب تسوية أوامر العمل والحركات قبل الإقفال | المالية | إقفال مالي غير دقيق |

---

## 4. Checklist إعداد Master Data

| البند | ما يجب التحقق منه | أثر الخطأ | القسم المسؤول |
|---|---|---|---|
| Items | تعريف الأصناف المنتجة والمستهلكة بدقة | أمر عمل أو صرف غير صحيح | PIM / الإنتاج |
| Raw Materials | وجود المواد الخام مع UOM وCosting وLot/Serial عند الحاجة | نقص أو صرف خاطئ | المستودعات / PIM |
| Semi-Finished Goods / Subassemblies | تحديد هل تُنتج كأوامر مستقلة أو Phantom | تضارب في التخطيط والتنفيذ | الإنتاج |
| Finished Goods / Assembly | تعريف المنتج النهائي كصنف قابل للإنتاج | Product Completion غير صحيح | PIM / الإنتاج |
| Ad hoc Items | تحديد إن كان مسموحًا إضافتها وصلاحياتها | إدخال مكونات خارج الهيكل بلا ضبط | الإنتاج / ERP |
| UOM | توحيد وحدات الأصناف والموارد | أخطاء كمية وتكلفة | PIM / الإنتاج |
| Inventory Organization | تحديد المنظمات التي تعمل كمصانع | حركات في منظمة خاطئة | ERP / المستودعات |
| Manufacturing Plant | تفعيل المنظمة كمصنع عبر Plant Parameters | عدم عمل Manufacturing على المنظمة | ERP |
| Plant Parameters | ضبط Process Manufacturing، Work Method، Expired Lots، Manual Completion | سلوك غير مطابق للتشغيل | ERP / الإنتاج |
| Subinventories | تحديد مستودعات المواد وWIP والمنتج التام | صرف/استلام في موقع خاطئ | المستودعات |
| Locators | تحديد الرفوف/المواقع إن كانت المنظمة Locator-Controlled | ضعف التتبع الموقعي | المستودعات |
| Work Areas | إعداد مناطق العمل على الأقل | عدم تنظيم Work Centers | الإنتاج |
| Work Centers | ربط العمليات بمراكز إنتاج صحيحة | جدولة وتكلفة غير دقيقة | الإنتاج |
| Workstations | تعريف مواقع تشغيل دقيقة عند الحاجة | ضعف Check-in/تتبع الموارد | الإنتاج |
| Resources | تعريف Labor وEquipment مع UOM صحيحة | Resource Charging غير صحيح | الإنتاج / التكلفة |
| Resource Instances | تحديد الآلات أو الأشخاص الفعليين عند الحاجة | ضعف تتبع الاستخدام | الإنتاج |
| Labor Resources | تعريف العمالة كمورد تكلفة أو تنفيذ | تجاهل تكلفة العمالة | الإنتاج / التكلفة |
| Equipment Resources | تعريف الآلات كمورد | تجاهل تكلفة المعدات | الإنتاج / الصيانة |
| Standard Operations | إنشاء عمليات قياسية قابلة لإعادة الاستخدام | تكرار وتعريفات غير متسقة | Manufacturing Engineer |
| Shifts / Calendars | ضبط أوقات العمل والطاقة | جدولة غير واقعية | الإنتاج / التخطيط |
| Lot Control | تفعيل تتبع الدُفعات عند الحاجة | ضعف Traceability | الجودة / المستودعات |
| Serial Control | تفعيل Serial عند الحاجة | فقدان تتبع المنتجات المنظمة | الجودة / PIM |
| Costing Enabled | التأكد أن الصنف يدخل التكلفة عند الحاجة | حركات غير مسعّرة | محاسبة التكاليف |
| Inventory Asset Value | تحديد هل الصنف Asset أم Expense | تقييم مخزون خاطئ | المالية / PIM |
| Supply Type | Push/Operation Pull/Assembly Pull/Bulk/Phantom/Supplier لكل مكون | صرف تلقائي أو يدوي خاطئ | الإنتاج / المستودعات |

---

## 5. Checklist إعداد Item Structure / BOM

| بند التحقق | نعم/لا | الملاحظات | الخطر إذا لم يتحقق |
|---|---|---|---|
| Item Structure موجودة لكل منتج يحتاج إنتاج |  |  | لا يمكن بناء Work Definition صحيحة |
| المكونات معرفة |  |  | صرف مواد ناقصة أو خاطئة |
| الكميات ووحدات القياس صحيحة |  |  | Material Usage Variance أو تكلفة خاطئة |
| المنتجات نصف المصنعة واضحة |  |  | تضارب بين Work Order مستقل وPhantom |
| المواد البديلة واضحة إن وجدت |  |  | Material Substitution Variance غير مفسرة |
| Ad hoc Items محددة إن وجدت |  |  | إضافة مكونات بلا حوكمة |
| Supply Type لكل مكون واضح |  |  | Backflush أو Push بطريقة خاطئة |
| Phantom Components محددة عند الحاجة |  |  | تضخم أو نقص أوامر العمل |
| Supplier Supply محدد عند وجود مواد من المورد |  |  | فشل Outside Processing / Supplier Supply |
| Co-products وBy-products محددة في Process Manufacturing |  |  | مخرجات غير مسجلة أو تكلفة غير موزعة |
| التغييرات على Item Structure لها آلية إشعار |  |  | Work Definitions قديمة |
| Item Structure Synchronization مع Work Definitions مفهومة |  |  | اختلاف بين التصميم والتنفيذ |
| المسؤول عن اعتماد Item Structure واضح |  |  | تغييرات غير محكومة |
| صلاحيات تعديل Item Structure واضحة |  |  | مخاطر مالية وتشغيلية بعد Go-Live |

### أخطاء Item Structure التي يجب منعها قبل Go-Live

| الخطأ | أثره | الإجراء الوقائي |
|---|---|---|
| مكونات ناقصة | نقص في الصرف وتكلفة أقل من الواقع | مراجعة هندسية ومخزنية للهيكل |
| كميات غير صحيحة | انحرافات Usage متكررة | اختبار UAT بمنتجات حقيقية |
| Supply Type غير مضبوط | صرف آلي أو يدوي في توقيت خاطئ | اعتماد Supply Type لكل Component |
| عدم مزامنة التغييرات | Work Definition لا تعكس آخر هيكل | آلية إشعار ومراجعة |
| عدم وضوح Phantom | أوامر غير لازمة أو مواد غير مضافة | قرار وظيفي لكل Subassembly |

---

## 6. Checklist إعداد Work Definitions

| بند التحقق | الهدف | أثره على Work Order | أثره على التكلفة |
|---|---|---|---|
| Work Definition موجودة لكل منتج يحتاج إنتاج | إنشاء قالب تنفيذ واضح | نسخ Operations/Items/Resources | أساس Cost Rollup |
| Primary Work Definition محددة | تحديد الطريقة الافتراضية | إنشاء أمر صحيح | تكلفة قياسية افتراضية |
| Alternate Work Definitions محددة عند الحاجة | دعم خط/مواد/تتابع بديل | اختيار طريقة إنتاج بديلة | قد تختلف تكلفة البديل |
| Work Definition Version صحيحة | التحكم بالتغييرات عبر الزمن | استخدام الإصدار الصحيح | إعادة تسعير تاريخي منطقي |
| Effective Start/End Date صحيحة | منع استخدام نسخة خارج صلاحيتها | اختيار مناسب حسب التاريخ | تكلفة مناسبة للفترة |
| Production Priority محددة | تخطيط الإنتاج | يستخدمها التخطيط | أثر غير مباشر |
| Costing Priority محددة | تحديد تعريف التكلفة | قد يختلف عن الإنتاج | أساس Cost Rollup |
| Header مكتمل | تعريف الصنف وWork Method والوجهة | أمر عمل قابل للتنفيذ | يحدد Completion Subinventory |
| Operations معرفة | تسلسل التنفيذ | عمليات قابلة للتسجيل | تكلفة موارد لكل عملية |
| Operation Items صحيحة | مواد كل عملية | صرف مواد دقيق | تكلفة Material Cost صحيحة |
| Operation Resources صحيحة | موارد كل عملية | Resource Charging دقيق | Resource Cost صحيح |
| Operation Outputs في Process | تسجيل المخرجات المتعددة | Completion على مستوى Output | تكلفة Process أدق |
| Completion Subinventory / Locator واضح | تحديد مكان المنتج النهائي | استلام صحيح | Inventory Valuation صحيح |
| Work Method صحيح | Discrete / Process / Flow | سلوك تنفيذ صحيح | Costing مناسب للنوع |
| Rework / Transform Work Definitions عند الحاجة | دعم إصلاح/تحويل المنتجات | أوامر خاصة صحيحة | تكلفة Rework/Transform قابلة للتتبع |
| Serial Tracking مضبوط | تتبع من عملية محددة | إلزام إدخال Serial | Traceability للتكلفة والجودة |
| التزامن مع Item Structure مفهوم | منع التباين بين BOM وWork Definition | أمر مطابق للتصميم | Cost Rollup دقيق |
| المسؤول عن إنشاء واعتماد Work Definition واضح | حوكمة | منع تعديل عشوائي | منع تكلفة غير معتمدة |

### Checklist اعتماد Work Definition قبل استخدامها في الإنتاج

| بند الاعتماد | تم/لم يتم | ملاحظات |
|---|---|---|
| مطابقة Item Structure |  |  |
| مراجعة Operations |  |  |
| مراجعة Work Centers |  |  |
| مراجعة Resources وRates |  |  |
| مراجعة Completion Subinventory |  |  |
| مراجعة Supply Types |  |  |
| مراجعة Costing Priority |  |  |
| اختبار إنشاء Work Order منها |  |  |
| اعتماد الإنتاج |  |  |
| اعتماد محاسبة التكاليف |  |  |

---

## 7. Checklist إعداد Operations / Work Centers / Resources

| بند التحقق | الهدف | أثره على التنفيذ | أثره على التكلفة |
|---|---|---|---|
| Operations معرفة | تحديد خطوات الإنتاج | تنفيذ منظم | تكلفة حسب العملية |
| Operation Sequence صحيحة | ترتيب العمليات | منع تجاوز خاطئ | يربط الصرف والموارد بالتوقيت |
| Count Point Operations محددة | عمليات إلزامية التسجيل | منع إخفاء تقدم حرج | تكلفة أكثر دقة |
| Auto-Transact Operations مفهومة | تقليل الإدخال اليدوي | إكمال تلقائي | خطر تكلفة إذا أسيء الضبط |
| Optional Operations مفهومة | دعم عمليات يمكن تجاوزها | مرونة تشغيلية | لا تُحتسب إن لم تنفذ |
| Work Areas معرفة | تنظيم المصنع | ربط مراكز العمل | أثر غير مباشر |
| Work Centers معرفة | موقع تنفيذ العملية | Dispatch/Execution واضح | Work Center Overhead عند الحاجة |
| Workstations معرفة عند الحاجة | تتبع تشغيل أدق | Operator Check-in | تكلفة/تشغيل أدق عند الحاجة |
| Resources مربوطة بـ Work Centers | إتاحة الموارد للعملية | Resource Charging ممكن | Resource Cost صحيح |
| Resource Instances معرفة | تتبع آلة/عامل فعلي | Traceability | تحليل استخدام أدق |
| Labor / Equipment Resources مميزة | تصنيف الموارد | معرفة نوع الاستخدام | Cost Elements أدق |
| Resource UOM صحيحة | قياس الوقت/الاستخدام | تسجيل صحيح | تكلفة Usage × Rate صحيحة |
| Shifts / Calendars معرفة | تحديد التوفر | جدولة واقعية | تأثير على مدة الإنتاج |
| Utilization وEfficiency مضبوطة | ضبط الطاقة الفعلية | مدد واقعية | تكلفة زمنية أو تحليل أداء |
| Resource Rates واضحة | تسعير الموارد | لا تؤثر مباشرة على التنفيذ | WIP/Resource Cost صحيح |
| Manual/Automatic Resource Charging محدد | تحديد طريقة التسجيل | تقليل أخطاء الإدخال | تجنب WIP ناقص أو زائد |
| Operator Check-in/out واضح | تتبع العامل/المحطة | تسجيل فعلي | يحتاج تحقق إضافي من المصدر الأصلي إذا أريد تفصيل محاسبي |
| Supplier Operations معرفة | دعم Outside Processing | عمليات مورد واضحة | Outside Processing Cost |

---

## 8. Checklist إعداد Work Orders

| بند التحقق | ما يجب ضبطه؟ | المسؤول | الملاحظات |
|---|---|---|---|
| طريقة إنشاء Work Order | يدوي/تخطيط/Orchestration/Min-Max/API | الإنتاج / التخطيط / ERP |  |
| مصدر يدوي | صلاحيات وشاشة Manage Work Orders | الإنتاج |  |
| Supply Chain Planning | تحويل Planned Orders إلى Work Orders | التخطيط |  |
| Order Management / Orchestration | Back-to-Back وCTO | المبيعات / التخطيط |  |
| Min-Max Planning | تجديد مخزون تلقائي | التخطيط / المستودعات |  |
| REST API / FBDI | تحميل أو تكامل | ERP / تقنية |  |
| أنواع Work Orders | Standard/Nonstandard/Rework/Transform/Orderless | الإنتاج |  |
| علاقة Work Order بـ Work Definition | النسخ من القالب الصحيح | الإنتاج / ERP |  |
| نسخ Operations/Items/Resources | اختبار النسخ فعليًا | ERP |  |
| Work Order Reservations | ربط الطلبات عند الحاجة | التخطيط / المبيعات |  |
| Dispatch List | ظهور الأمر للمشغلين | الإنتاج |  |
| علاقة Sales Order أو Project | تحديد Back-to-Back / Project-specific | التخطيط / المالية |  |
| صلاحيات الإنشاء والتعديل | ضبط حسب الدور | ERP / الأمن |  |
| سياسة الإلغاء | متى يسمح وماذا يحدث للحركات | الإنتاج / المالية | يحتاج تحقق إضافي من المصدر الأصلي لتفاصيل الحركات بعد الإلغاء |

---

## 9. Checklist حالات Work Order

| الحالة | المسموح | الممنوع | الصلاحية | ملاحظات |
|---|---|---|---|---|
| Unreleased | التعديل والتحضير | تنفيذ الحركات | Production Supervisor | لا صرف ولا Resource Charging |
| Released | الصرف والتنفيذ والإكمال | التعديل غير المنضبط | Production Supervisor | يظهر في Dispatch List |
| On Hold | الإيقاف المؤقت | الحركات | Production Supervisor | يستخدم عند مشكلة تشغيلية |
| Pending Approval | انتظار توقيع/موافقة | التنفيذ حتى الاعتماد | صاحب الموافقة | عند E-Records/E-Signatures |
| Completed | مراجعة قبل الإغلاق | استمرار التنفيذ إلا إذا أعيد فتح/تعديل حسب النظام | الإنتاج / التكلفة | قبل Closed |
| Closed | لا تعديل | كل الحركات | Cost Accountant / Supervisor | يولد Variances/Adjustments |
| Canceled | إنهاء الأمر | التعديل | صلاحية خاصة | يحتاج تحقق إضافي من المصدر الأصلي لتفاصيل القيود |

### جدول انتقال الحالات

| من الحالة | إلى الحالة | شرط الانتقال | Validation المطلوب |
|---|---|---|---|
| Unreleased | Released | جاهزية Work Order | Work Definition، مواد، تواريخ، صلاحية |
| Unreleased | Canceled | قرار إلغاء قبل التنفيذ | لا توجد حركات أو سياسة واضحة |
| Released | On Hold | مشكلة توقف التنفيذ | سبب الإيقاف ومسؤول المعالجة |
| On Hold | Released | حل سبب التوقف | إزالة سبب التعليق |
| Released | Completed | إكمال العملية الأخيرة/الكمية | Product Completion مطابق |
| Completed | Closed | جاهزية التكلفة وعدم وجود Pending Transactions | مراجعة WIP وCost Distributions |
| Released | Canceled | قرار إلغاء أثناء التنفيذ | مراجعة الحركات والمخزون والتكلفة |

---

## 10. Checklist Material Issue / Component Issue

| بند التحقق | أثره المخزني | أثره على WIP/التكلفة | الخطر |
|---|---|---|---|
| طريقة الصرف محددة | توقيت حركة المواد واضح | WIP في الوقت الصحيح | صرف عشوائي |
| Push Supply مضبوط | صرف يدوي من Supply Subinventory | WIP عند الصرف | نسيان الصرف |
| Operation Pull مضبوط | صرف تلقائي عند إكمال العملية | WIP تلقائي | صرف دون وعي المستخدم |
| Assembly Pull مضبوط | صرف عند Product Completion | WIP عند الإكمال | فروقات إذا لم يكتمل المنتج |
| Bulk مضبوط | لا صرف نظامي | لا يدخل WIP بالحركة | اعتقاد خاطئ بأنه يصرف |
| Phantom مضبوط | تفجير مكونات phantom | تكلفة المكونات لا phantom | تضخم أو نقص مواد |
| Supplier Supply مضبوط | المادة من المورد | حسب Outside Processing | صرف داخلي غير لازم |
| Supply Subinventory محدد | نقص مخزون من المستودع الصحيح | تكلفة المصدر الصحيح | مخزون خاطئ |
| Supply Locator محدد | حركة موقعية دقيقة | أثر تقييم حسب الإعداد | ضياع تتبع الموقع |
| Prevent Issue of Expired Lots | يمنع صرف Lot منتهي | يمنع تكلفة مادة غير صالحة | مخاطر جودة |
| Lot / Serial عند الصرف | Traceability | ربط تكلفة/جودة | فقدان Genealogy |
| Component Issue يزيد WIP | نقص مواد وزيادة WIP | أساس Cost Accounting | WIP غير دقيق |
| الصرف اليدوي أو الآلي واضح | سلوك المستخدم واضح | منع تكرار/نقص الصرف | Double issue أو عدم صرف |
| السماح بأكثر/أقل واضح | رقابة على الاستهلاك | Variance مفهوم | انحرافات غير مفسرة |
| صرف البدائل واضح | حركة بديلة موثقة | Substitution Variance | استبدال غير محكوم |
| صلاحيات الصرف واضحة | ضبط الحركة | منع أثر مالي خاطئ | صرف غير معتمد |
| علاقة المستودعات بالصرف واضحة | دور المستودع محدد | تكلفة ومخزون صحيحان | تضارب مسؤوليات |

---

## 11. Checklist Material Return / Component Return

| بند التحقق | أثره المخزني | أثره على WIP | الخطر إذا لم يتحقق |
|---|---|---|---|
| آلية إرجاع المواد واضحة | زيادة مخزون المادة | تخفيض WIP | بقاء WIP زائد |
| الإرجاع مرتبط بـ Work Order | تتبع الحركة | عكس تكلفة الأمر | إرجاع غير مرتبط |
| الكمية المرجعة لا تتجاوز المصروف | منع رصيد غير منطقي | منع WIP سلبي | تشويه المخزون |
| Lot / Serial مضبوط | تتبع نفس المادة | عكس صحيح | فقدان Traceability |
| أثر الإرجاع على Cost Accounting واضح | حركة عكسية | Distribution عكسي | تكلفة غير مصححة |
| صلاحيات الإرجاع واضحة | منع سوء الاستخدام | رقابة مالية | تلاعب أو أخطاء |
| معالجة المواد التالفة واضحة | لا تعاد كمخزون صالح | حسب سياسة Scrap/Reject | إعادة مادة غير صالحة |
| الإرجاع بعد Product Completion أو Close مضبوط | منع تناقض | قد يحتاج تصحيح | يحتاج تحقق إضافي من المصدر الأصلي |

---

## 12. Checklist Resource Charging / Operation Execution

| بند التحقق | لماذا مهم؟ | أثره على التكلفة |
|---|---|---|
| Count Point Operations تعمل كما يجب | لا تُتجاوز العمليات الحرجة | Resource/Operation Cost أدق |
| Auto-Transact Operations مفهومة | تبسيط تسجيل العمليات | قد تسجل تكلفة تلقائيًا حسب الإعداد |
| Optional Operations مفهومة | مرونة في التنفيذ | لا تُحمّل تكلفة إذا لم تُسجل |
| Resource Usage يسجل | معرفة الاستهلاك الفعلي | WIP يزيد بقيمة Resource Usage × Rate |
| Resource Charging Manual/Automatic محدد | منع نقص أو تكرار التسجيل | تكلفة مورد صحيحة |
| Resource Rates واضحة | تسعير المورد | Cost Processor يستخدم المعدلات المنشورة |
| Operator Check-in/out مضبوط | تتبع فعلي للمشغل/المحطة | يحتاج تحقق إضافي من المصدر الأصلي للتفصيل المالي |
| ساعات العمالة أو الآلات تسجل عند الحاجة | تكلفة العمالة والآلة | Resource Cost قابل للتحليل |
| Resource Exceptions واضحة | معالجة عطل آلة/عامل | منع انحرافات غير مفسرة |
| Maintenance-related Exceptions واضحة | ربط الأعطال بالصيانة | قد تؤثر على وقت/تكلفة الإنتاج |
| مقارنة المخطط بالفعلي ممكنة | رقابة أداء | Resource Efficiency/Usage Variance |
| أثر Resource Charging على WIP واضح | وعي مالي | WIP لا يقتصر على المواد |
| أثره على Cost Accounting واضح | ربط التشغيل بالتكلفة | Cost Distributions صحيحة |

---

## 13. Checklist Product Completion

| بند التحقق | الهدف | الخطر إذا لم يتحقق |
|---|---|---|
| طريقة Product Completion واضحة | تحديد لحظة استلام المنتج | استلام مبكر أو متأخر |
| المسؤول عن Product Completion واضح | ضبط الصلاحية | كميات غير معتمدة |
| Completion Subinventory / Locator واضح | استلام في المكان الصحيح | مخزون منتج تام خاطئ |
| في Process، Operation Output واضح | تسجيل المخرجات على مستوى العملية | فقدان Co/By-products |
| Primary Output واضح | تحديد المنتج الأساسي | تكلفة ومخزون غير واضحين |
| Co-products وBy-products واضحة | تسجيل المخرجات الثانوية | تكلفة غير موزعة أو مفقودة |
| الإنتاج الجزئي مدعوم أو غير مطلوب | دعم الواقع التشغيلي | إجبار المستخدم على إغلاق غير واقعي |
| Undercompletion Tolerance واضح | قبول الإغلاق بكمية أقل | إغلاق غير منضبط |
| المنتج يدخل المخزون الصحيح | Finished Goods Inventory صحيح | إتاحة مخزون خاطئة |
| Product Completion Cost تقديرية قبل Close مفهومة | منع سوء تفسير التكلفة | اعتبار تكلفة مؤقتة نهائية |
| أثر Product Completion على WIP واضح | تخفيض/نقل WIP | WIP متضخم |
| أثره على Cost Accounting واضح | Distribution للإكمال | تكلفة غير مسعّرة |
| الانتقال إلى Completed مفهوم | معرفة نهاية التنفيذ | ترك أوامر في Released |
| الجودة قبل الإتاحة واضحة عند الحاجة | منع بيع غير مقبول | مخاطر جودة وRecall |

---

## 14. Checklist الجودة والاستثناءات

| بند التحقق | أثره على التشغيل | أثره على الجودة | المسؤول |
|---|---|---|---|
| Quality Management مطلوب أو غير مطلوب | تحديد نطاق التطبيق | ضبط Inspection | الجودة / ERP |
| Inspection محدد متى يحدث | نقطة فحص واضحة | منع إتاحة منتج غير مقبول | الجودة |
| Production Exceptions معرفة | تسجيل مشاكل الصالة | تحليل أسباب التأخير | الإنتاج |
| Material Exceptions معرفة | معالجة نقص المواد | منع توقف مخفي | المستودعات / الإنتاج |
| Resource Exceptions معرفة | معالجة عطل آلة/غياب عامل | منع تسجيل غير واقعي | الإنتاج / الصيانة |
| Quality Issues معرفة | توثيق مشاكل الجودة | قرار Reject/Rework/Scrap | الجودة |
| Rework واضح | إصلاح المنتج | تقليل هالك | الجودة / الإنتاج |
| Reject واضح | رفض منتج غير مطابق | منع دخوله كمقبول | الجودة |
| Maintenance Integration واضحة | معالجة أعطال الموارد | تقليل توقفات | الصيانة |
| الاستثناءات مرتبطة بـ Work Order | تتبع الأثر | تحليل تكلفة وتأخير | الإنتاج / ERP |
| من يعالج كل استثناء واضح | سرعة قرار | مسؤولية واضحة | الإدارة |
| أثر الاستثناء على التكلفة واضح | فهم Variances | ربط التشغيل بالتكلفة | Cost Accountant |

---

## 15. Checklist Scrap / Rework / Reject

| بند التحقق | أثره على المخزون | أثره على التكلفة | المسؤول |
|---|---|---|---|
| سياسة Scrap واضحة | منع اختفاء كميات | Scrap Cost أو تحميل على المنتج | الإنتاج / الجودة / التكلفة |
| أسباب Scrap معرفة | تحليل الهالك | تفسير الانحرافات | الجودة |
| Scrap Transaction واضحة | حركة WIP Scrap | Cost Distribution للهالك | الإنتاج / التكلفة |
| Scrap يؤثر على WIP / Cost Accounting | تخفيض أو إعادة توزيع | تكلفة صحيحة | Cost Accountant |
| Scrap Variance مفهوم | لا أثر مباشر على المخزون فقط | تحليل فرق الهالك | Cost Accountant |
| Rework Work Order أو Flow واضح | إعادة تشغيل منتج | تكلفة Rework منفصلة | الإنتاج / الجودة |
| Reject واضح | منع قبول غير مطابق | قرار Scrap/Rework | الجودة |
| الهالك الطبيعي وغير الطبيعي مفهوم | تصنيف القرار | يحتاج تحقق إضافي من المصدر الأصلي إذا أريد تفصيل Oracle | الجودة / التكلفة |
| الهالك القابل للبيع كخردة واضح | معالجة مخزون خردة | يحتاج تحقق إضافي من المصدر الأصلي | المالية / الجودة |
| صلاحيات تسجيل الهالك واضحة | منع التلاعب | حماية التكلفة | ERP / الإدارة |

---

## 16. Checklist تكلفة الإنتاج Cost Accounting

| بند التحقق | لماذا مهم؟ | أثره المالي | المسؤول |
|---|---|---|---|
| Cost Accounting مفعّل ومفهوم | طبقة التسعير الرسمية | لا تكلفة دون معالجة | Cost Accountant / ERP |
| Cost Processor واضح | يسعّر الحركات | Cost Distributions | Cost Accountant |
| Cost Organization معرفة | نطاق التكلفة | تقييم صحيح | المالية |
| Cost Book معرف | سجل التكلفة | تقارير مالية صحيحة | المالية |
| Cost Elements واضحة | تصنيف Material/Resource/Overhead | تحليل التكلفة | Cost Accountant |
| Cost Profile معرف | يحدد Cost Method وValuation | تسعير الحركات | Cost Accountant |
| Cost Method محدد | Standard/Average/Actual | طريقة قياس التكلفة | المالية |
| Valuation Unit واضحة | مستوى التقييم | تكلفة حسب Lot/Subinventory/Item | المالية |
| Cost Scenario واضح | أسعار الموارد والـOverhead | Standard Cost/Rollup | Cost Accountant |
| Cost Rollup جاهز عند الحاجة | حساب تكلفة المنتج | Standard/Overhead | Cost Accountant |
| Material Cost صحيح | أساس التكلفة | WIP وFG صحيحان | محاسبة التكاليف |
| Resource Cost صحيح | تكلفة العمالة/الآلة | WIP صحيح | محاسبة التكاليف |
| Overhead واضح أو يحتاج تحقق | تحميل تكاليف غير مباشرة | تكلفة منتج أدق | المالية |
| Product Completion Cost مفهومة كتقديرية | لا تعتبر نهائية قبل Close | منع قرارات خاطئة | المالية / الإنتاج |
| Actual Work Order Cost عند Close | حسم التكلفة | Variances/Adjustments | Cost Accountant |
| Cost Distributions مفهومة | أساس SLA/GL | تتبع مالي | المالية |
| Variances مفهومة | تفسير الفروق | تحسين Work Definition | الإنتاج / التكلفة |
| المالية وافقت على سياسة التكلفة | حوكمة | منع رفض الأرقام | CFO / Cost Accountant |

---

## 17. Checklist WIP والربط المالي

| بند التحقق | الأثر المالي | ملاحظات المحاسبة |
|---|---|---|
| WIP مفهوم ومطلوب | أصل تحت التشغيل | يجب شرحه للمالية والإنتاج |
| Material Issue يزيد WIP | مواد خام تتحول إلى WIP | يعتمد على Cost Accounting |
| Resource Charging يزيد WIP | موارد تمتص في الإنتاج | يتطلب Resource Rates |
| Product Completion ينقل/يخفف WIP | Finished Goods مقابل WIP | التكلفة تقديرية قبل Close |
| Work Order Close يغلق WIP | تسوية الأمر | لا يترك رصيد غير مفسر |
| WIP Report متاح أو مطلوب | رقابة شهرية | تقرير أساسي قبل Period Close |
| WIP المفتوح نهاية الفترة يراجع | دقة الميزانية | يمنع تضخم WIP |
| WIP Adjustments مفهومة إن وجدت | تسويات | تحتاج Cost Accountant |
| المالية تراجع WIP | اعتماد مالي | لا يكفي الإنتاج وحده |
| أوامر العمل المفتوحة تراقب | منع WIP طويل | Unclosed Work Orders Report مطلوب |
| WIP لا يبقى مفتوحًا بسبب تأخير Close | دقة الفترة | خطر هامش ربح خاطئ |

---

## 18. Checklist Cost Distributions وSubledger / GL

| بند التحقق | الهدف المالي | ملاحظات المحاسبة |
|---|---|---|
| Cost Distributions تنشأ من أحداث الإنتاج | تحويل التشغيل إلى تكلفة | أساس SLA |
| مرتبطة بـ Material Issue | تسعير صرف المواد | Raw Material/WIP كمفهوم |
| مرتبطة بـ Resource Charging | تسعير الموارد | Resource Absorption كمفهوم |
| مرتبطة بـ Product Completion | تسعير المنتج التام | Provisional قبل Close |
| مرتبطة بـ Scrap | أثر الهالك | حسب سياسة Scrap |
| مرتبطة بـ Work Order Close | Variances/Adjustments | حدث محاسبي حاسم |
| Subledger Accounting واضح | توليد القيود | الحسابات التفصيلية تعتمد على SLA |
| Transfer to GL واضح | نقل للأستاذ العام | يجب اختباره |
| الحسابات المحاسبية مفهومة | مطابقة GL | لا تخترع قيود دون إعداد Oracle |
| محاسب التكلفة يراجع قبل Period Close | منع أخطاء إقفال | دور إلزامي |
| Pending Transactions تراجع | منع حركات غير مسعّرة | شرط قبل Close/Period Close |
| مطابقة الإنتاج مع GL ممكنة | Audit Trail مالي | من Cost Distribution إلى GL |

---

## 19. Checklist Variances

| نوع الانحراف | هل تمت مراجعته؟ | من يراجعه؟ | القرار المطلوب |
|---|---|---|---|
| Material Rate Variance |  | Cost Accountant | مراجعة أسعار المواد/Cost Rollup |
| Material Usage Variance |  | الإنتاج / التكلفة | مراجعة الكميات وWork Definition |
| Material Substitution Variance |  | الإنتاج / المستودعات | ضبط البدائل والصلاحيات |
| Resource Rate Variance |  | التكلفة | مراجعة Resource Rates |
| Resource Usage Variance |  | الإنتاج | مراجعة كفاءة العمليات |
| Yield Variance |  | الإنتاج / الجودة | مراجعة Operation Yield والهالك |
| Job Close Variance |  | Cost Accountant | تحليل فرق متبقٍ غير مصنف |
| Scrap Variance |  | الجودة / التكلفة | مراجعة سياسة Scrap |
| Standard Cost Variance |  | المالية | مراجعة Standard Cost |
| Actual vs Standard |  | الإدارة / التكلفة | قرار تحسين أو تحديث تكلفة |
| حدود الانحراف المقبولة |  | الإدارة | تحديد Thresholds |
| استخدام الانحرافات لتحسين Work Definition |  | Manufacturing Engineer | تعديل التعريف بعد اعتماد |

---

## 20. Checklist Period Close

| بند التحقق | لماذا مهم؟ | الخطر إذا لم يتحقق |
|---|---|---|
| سياسة Period Close واضحة | تنسيق الإنتاج والتكلفة والمالية | إقفال غير منظم |
| Work Orders المفتوحة مراجعة | كشف WIP مفتوح | WIP متضخم |
| Work Orders التي يجب إغلاقها مغلقة | نقل التكلفة للفترة الصحيحة | Variances في فترة لاحقة |
| Pending Transactions مراجعة | منع حركات غير مسعّرة | Close يفشل أو GL غير مكتمل |
| Cost Distributions مراجعة | التأكد من التسعير | قيود ناقصة أو خاطئة |
| WIP مراجعة | دقة الميزانية | أصول غير مفسرة |
| Variances مراجعة | تحليل الانحرافات | مشاكل تشغيلية غير معالجة |
| Subledger Accounting منفذ | توليد القيود | لا أثر في GL |
| Transfer to GL منفذ | الإقفال المالي | فجوة بين Subledger وGL |
| أثر Close في فترة لاحقة مفهوم | منع mismatch | تكلفة ومبيعات في فترات مختلفة |
| مسؤوليات الإنتاج والمالية واضحة | حوكمة | اتهامات متبادلة عند الإقفال |

---

## 21. Checklist التقارير والرقابة

| التقرير | المستخدم | الغرض | هل مطلوب قبل Go-Live؟ |
|---|---|---|---|
| Work Order Report | الإنتاج | متابعة أوامر العمل | نعم |
| Work Order Status Report | الإنتاج / الإدارة | حالات Unreleased/Released/Completed/Closed | نعم |
| Work Order Cost Report | Cost Accountant | تكلفة الأمر | نعم |
| Cost Distribution Report | المالية | مراجعة التوزيعات | نعم |
| WIP Report | المالية / التكلفة | WIP المفتوح | نعم |
| Production Exceptions Report | الإنتاج / الجودة | المشاكل والاستثناءات | حسب النطاق |
| Material Usage Report | الإنتاج / المستودعات | مقارنة المواد | نعم |
| Resource Usage Report | الإنتاج / التكلفة | استخدام الموارد | إذا الموارد تدخل التكلفة |
| Variance Report | الإدارة / التكلفة | تحليل الانحرافات | نعم إذا Standard Cost |
| Lot / Serial Traceability Report | الجودة | Genealogy وتتبع | حسب نوع الصناعة |
| Period Close Reports | المالية | الإقفال | نعم |
| Pending Transactions Report | ERP / المالية | حركات معلقة | نعم |
| Unclosed Work Orders Report | الإنتاج / المالية | أوامر مفتوحة | نعم |
| Dispatch List | المشغلون | تنفيذ يومي | نعم عند استخدامه |
| Cost Accounting Review | Cost Accountant | مراجعة شاملة للتكلفة | نعم |

---

## 22. Checklist UAT لاختبار دورة إنتاج كاملة

| خطوة الاختبار | النتيجة المتوقعة | القسم المعتمد | تم/لم يتم |
|---|---|---|---|
| 1. إعداد Item | صنف قابل للإنتاج والتكلفة | PIM / الإنتاج |  |
| 2. إعداد Item Structure | مكونات وكميات صحيحة | الإنتاج / PIM |  |
| 3. إعداد Work Area / Work Center / Resource | موارد قابلة للاستخدام | الإنتاج |  |
| 4. إعداد Work Definition | قالب كامل مع Operations/Items/Resources | Manufacturing Engineer |  |
| 5. إنشاء Work Order | أمر Unreleased بنسخ صحيح | الإنتاج |  |
| 6. Release | أمر يظهر للتنفيذ | الإنتاج |  |
| 7. Material Issue | نقص مخزون وزيادة WIP | المستودعات / التكلفة |  |
| 8. Resource Charging | تسجيل استخدام وزيادة WIP | الإنتاج / التكلفة |  |
| 9. Material Return | زيادة مخزون وتخفيض WIP | المستودعات |  |
| 10. Product Completion | دخول منتج تام بتكلفة تقديرية | الإنتاج / المستودعات |  |
| 11. Scrap | تسجيل هالك وأثر تكلفة | الجودة / التكلفة |  |
| 12. Quality / Exception | تسجيل وفحص ومعالجة | الجودة |  |
| 13. Work Order Close | إغلاق WIP واحتساب Variances | التكلفة / المالية |  |
| 14. Cost Distributions | توزيعات ناتجة | Cost Accountant |  |
| 15. Variances | ظهور الفروقات عند الحاجة | التكلفة / الإنتاج |  |
| 16. WIP | تقرير WIP صحيح | المالية |  |
| 17. Period Close | لا حركات معلقة مؤثرة | المالية |  |
| 18. GL Transfer | أثر مالي منتقل | المالية |  |
| 19. Reports | تقارير قابلة للاستخدام | جميع الأقسام |  |

---

## 23. Checklist ما قبل Go-Live

| البند | الحالة | الملاحظات | قرار Go/No-Go |
|---|---|---|---|
| Master Data جاهزة |  |  |  |
| Item Structures معتمدة |  |  |  |
| Work Definitions جاهزة |  |  |  |
| Work Centers وResources جاهزة |  |  |  |
| Supply Types صحيحة |  |  |  |
| Subinventories جاهزة |  |  |  |
| صلاحيات Work Order جاهزة |  |  |  |
| تكلفة الإنتاج معتمدة |  |  |  |
| WIP مفهوم |  |  |  |
| Cost Accounting جاهز |  |  |  |
| Cost Distributions مختبرة |  |  |  |
| Period Close مختبر |  |  |  |
| التقارير جاهزة |  |  |  |
| UAT مكتمل |  |  |  |
| المستخدمون مدربون |  |  |  |
| خطة دعم ما بعد التشغيل جاهزة |  |  |  |
| طريقة معالجة الأخطاء واضحة |  |  |  |
| مسؤوليات الأقسام واضحة |  |  |  |

---

## 24. Checklist ما بعد Go-Live

| البند | متى تتم مراجعته؟ | المسؤول | الإجراء |
|---|---|---|---|
| مراجعة أول Work Orders | يوميًا أول أسبوع | الإنتاج / ERP | تصحيح إعدادات أو تدريب |
| مراجعة أول Release | أول أوامر | الإنتاج | التأكد من الصلاحيات والحالة |
| مراجعة أول Material Issue | أول صرف | المستودعات / التكلفة | مطابقة المخزون وWIP |
| مراجعة أول Resource Charging | أول تشغيل | الإنتاج / التكلفة | مطابقة Usage وRates |
| مراجعة أول Product Completion | أول إكمال | الإنتاج / المستودعات | تحقق Completion Subinventory |
| مراجعة أول Work Order Close | أول إغلاق | Cost Accountant | مراجعة Variances وWIP |
| مراجعة WIP | أسبوعيًا ثم شهريًا | المالية | كشف أوامر مفتوحة |
| مراجعة Cost Distributions | دوريًا | Cost Accountant | تأكيد التسعير |
| مراجعة Variances | بعد Close | الإنتاج / التكلفة | تحليل الأسباب |
| مراجعة Period Close | أول شهر | المالية / ERP | ضمان الإقفال |
| مراجعة Pending Transactions | يوميًا أول فترة | ERP / المالية | معالجة مبكرة |
| مراجعة التقارير | أول شهر | الإدارة / ERP | تعديل التقارير إن لزم |
| مراجعة أخطاء المستخدمين | مستمر | الدعم | تدريب إضافي |
| تعديل Work Definitions إذا ظهرت أخطاء | بعد اعتماد | Manufacturing Engineer | لا تعديل عشوائي |
| تدريب إضافي عند الحاجة | فور ظهور نمط خطأ | ERP | تقليل التذاكر |

---

## 25. أهم مخاطر فشل تطبيق الإنتاج في Oracle

| الخطر | أثره | كيف نمنعه؟ |
|---|---|---|
| Item Structure غير دقيقة | صرف وتكلفة خاطئة | اعتماد هندسي ومراجعة UAT |
| Work Definition غير صحيحة | Work Orders خاطئة | Checklist اعتماد Work Definition |
| Supply Type خاطئ | صرف في توقيت أو طريقة غير صحيحة | مراجعة Push/Pull/Bulk/Phantom/Supplier |
| Costing Enabled غير مضبوط | حركات غير مسعّرة | مراجعة PIM/Costing |
| Resource Rates غير دقيقة | WIP وتكلفة موارد خاطئة | اعتماد Cost Scenario/Rates |
| عدم تسجيل Resource Charging | تكلفة ناقصة | تدريب وضوابط |
| Product Completion قبل اكتمال البيانات | منتج تام بتكلفة غير مفهومة | Validations وUAT |
| Work Order Close غير منتظم | WIP متضخم وانحرافات بفترة خاطئة | سياسة Close واضحة |
| WIP غير مراجع | ميزانية غير دقيقة | WIP Report شهري |
| Cost Distributions غير مفهومة | GL لا يطابق التشغيل | إشراك Cost Accountant |
| Period Close بدون تسوية الإنتاج | تكلفة فترة خاطئة | Period Close Checklist |
| Pending Transactions | تعطل الإغلاق والتكلفة | تقرير يومي/شهري |
| المالية غير مشاركة | رفض الأرقام بعد Go-Live | مشاركة من التحليل |
| UAT غير شامل | فشل أول تشغيل | اختبار دورة كاملة |
| تقارير غير كافية | لا رقابة بعد التشغيل | تقارير قبل Go-Live |
| تكلفة دقيقة بدون بيانات دقيقة | توقعات غير واقعية | توضيح متطلبات التسجيل |

---

## 26. نموذج مختصر لقائمة تطبيق الإنتاج

| رقم | بند التحقق | نعم/لا | ملاحظات |
|---:|---|---|---|
| 1 | Items معرفة |  |  |
| 2 | Costing Enabled مضبوط |  |  |
| 3 | Inventory Asset Value مضبوط |  |  |
| 4 | Item Structures جاهزة |  |  |
| 5 | Supply Types معتمدة |  |  |
| 6 | Work Areas معرفة |  |  |
| 7 | Work Centers معرفة |  |  |
| 8 | Resources معرفة |  |  |
| 9 | Resource Rates جاهزة |  |  |
| 10 | Standard Operations جاهزة |  |  |
| 11 | Work Definitions جاهزة |  |  |
| 12 | Primary Work Definition محددة |  |  |
| 13 | Work Definition Versions صحيحة |  |  |
| 14 | Completion Subinventory محدد |  |  |
| 15 | Work Order creation مختبر |  |  |
| 16 | Release مختبر |  |  |
| 17 | Material Issue مختبر |  |  |
| 18 | Material Return مختبر |  |  |
| 19 | Resource Charging مختبر |  |  |
| 20 | Product Completion مختبر |  |  |
| 21 | Partial completion مختبر |  |  |
| 22 | Scrap مختبر |  |  |
| 23 | Rework/Reject واضح |  |  |
| 24 | Quality/Inspection واضح |  |  |
| 25 | Work Order Close مختبر |  |  |
| 26 | WIP Report جاهز |  |  |
| 27 | Cost Accounting Processes جاهزة |  |  |
| 28 | Cost Distributions مختبرة |  |  |
| 29 | Variance Report جاهز |  |  |
| 30 | Pending Transactions Report جاهز |  |  |
| 31 | Period Close مختبر |  |  |
| 32 | Transfer to GL مختبر |  |  |
| 33 | Dispatch List جاهزة |  |  |
| 34 | Lot/Serial Traceability مختبر عند الحاجة |  |  |
| 35 | صلاحيات المستخدمين مضبوطة |  |  |
| 36 | UAT مكتمل |  |  |
| 37 | التقارير معتمدة |  |  |
| 38 | المالية اعتمدت السيناريو |  |  |
| 39 | خطة دعم Go-Live جاهزة |  |  |
| 40 | قرار Go/No-Go موثق |  |  |

---

## 27. الدروس المستفادة لنظام ERP محلي مثل ناتج

| بند من Oracle | كيف نستفيد منه في ERP محلي؟ | الأولوية |
|---|---|---|
| فصل Item Structure عن Work Order | عدم إنشاء أمر إنتاج بلا تعريف مواد واضح | حرجة |
| Work Definition | وجود قالب إنتاج يضم المواد والعمليات والموارد | حرجة |
| Work Order Status | حالات واضحة تمنع الحركات الخاطئة | حرجة |
| Supply Type | تحديد يدوي/تلقائي/Phantom/Bulk | عالية |
| Material Issue to WIP | ربط صرف المواد بتكلفة الأمر | حرجة |
| Resource Charging | إضافة تكلفة موارد عند الحاجة | متوسطة/عالية |
| Product Completion provisional | فهم أن الاستلام قد يكون قبل التكلفة النهائية | عالية |
| Work Order Close | حدث مالي وتشغيلي إلزامي | حرجة |
| Cost Distributions | وجود سجل تكلفة يربط الحركة بالمالية | عالية |
| Variances | تحليل الفروق وتحسين التعريفات | متوسطة/عالية |
| Period Close | مراجعة الإنتاج قبل الإقفال المالي | عالية |
| Pending Transactions | تقرير حركات معلقة | عالية |
| UAT كامل | اختبار دورة لا شاشة | حرجة |
| Reports | الرقابة لا تقل أهمية عن الإدخال | عالية |
| التفريق بين إعداد/تدريب/تطوير | يمنع طلب تطوير غير ضروري | عالية |

### الحد الأدنى لنظام ERP محلي

- تعريف منتج ومواد.
- Item Structure أو BOM.
- قالب إنتاج أو Work Definition مبسط.
- Work Order بحالات واضحة.
- صرف مواد مرتبط بالمخزون.
- استلام منتج تام.
- تكلفة أساسية وWIP أو بديل واضح.
- إغلاق أمر إنتاج.
- تقارير أوامر مفتوحة، مواد، تكلفة، WIP.

### بنود متقدمة يمكن تأجيلها حسب حجم العميل

- Operator Check-in/out.
- Advanced Scheduling.
- Complex Cost Books.
- Full Lot/Serial Genealogy.
- Advanced Process Manufacturing outputs.
- Full SLA automation.
- Advanced Variance analytics.

---

## 28. ملخص تنفيذي

تطبيق الإنتاج في Oracle لا ينجح بمجرد تشغيل شاشة **Work Order**. النجاح يعتمد على سلسلة مترابطة تبدأ من **Master Data** و**Item Structure** و**Work Definition**، ثم تنتقل إلى **Work Order Execution**، **Material Issue**، **Resource Charging**، **Product Completion**، ثم **Cost Accounting** و**Work Order Close** و**Period Close**.

أخطر نقطة في التطبيق أن يرى الفريق الإنتاج كعملية تشغيلية فقط، بينما Oracle يعامله كمنظومة تشغيل ومخزون وتكلفة ومحاسبة. لذلك يجب إشراك الإنتاج والمستودعات والمالية ومحاسبة التكاليف والجودة من بداية المشروع، لا عند Go-Live.

يجب أن يغطي UAT دورة Work Order كاملة: إعداد Item، Item Structure، Work Definition، Work Order، Release، Material Issue، Resource Charging، Product Completion، Scrap/Quality، Close، Cost Distributions، Variances، WIP، Period Close، وGL Transfer.

لا يجب تنفيذ Go-Live قبل اعتماد:

- Master Data.
- Item Structures.
- Work Definitions.
- Supply Types.
- Cost Accounting.
- WIP.
- Work Order Close.
- Period Close.
- التقارير.
- صلاحيات المستخدمين.

قائمة التطبيق هذه ليست وثيقة نظرية؛ هي أداة لتقليل المخاطر وتحويل دراسة Oracle Manufacturing إلى تنفيذ قابل للتسليم والرقابة.
