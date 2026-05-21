# 10_Oracle_Functional_to_Technical_Design.md
# تحويل عمليات الإنتاج في Oracle إلى منطق نظام قابل للتنفيذ برمجيًا

## 1. مقدمة

هذا الملف يحوّل مفاهيم **Oracle Fusion Cloud Manufacturing** إلى منطق وظيفي يمكن شرحه لفريق البرمجة عند بناء أو تحسين Module إنتاج في نظام ERP محلي.

الهدف ليس كتابة كود، بل تحويل مفاهيم Oracle إلى تصميم وظيفي واضح يشرح:

- ما الذي يحدث عند كل خطوة.
- ما البيانات المطلوبة.
- ما الحركات التي يجب إنشاؤها.
- ما القيود التي يجب فرضها.
- ما الأثر على المخزون.
- ما الأثر على WIP.
- ما الأثر على التكلفة.
- ما الأثر على Cost Distributions.
- ما الأثر على المحاسبة.
- ما الحالات الاستثنائية التي يجب التعامل معها.

الفكرة الأساسية: الإنتاج في Oracle ليس شاشة Work Order فقط. هو دورة مترابطة تبدأ من **Work Definition**، تمر عبر **Work Order Execution**، وتنتج **Inventory Transactions**، ثم تُعالج عبر **Cost Accounting** لتكوين **Cost Distributions**، ثم تنتقل إلى **Subledger Accounting** و **General Ledger**.

---

## 2. الفرق بين الفهم الوظيفي والفهم التقني

### الفهم الوظيفي

المستخدم عادة يشرح العملية بهذه الطريقة:

> "أريد إنشاء أمر عمل، صرف مواد، تسجيل موارد، واستلام منتج."

هذا وصف صحيح، لكنه غير كافٍ للمبرمج.

### الفهم التقني/النظامي

المبرمج يحتاج أن يفهم ما يلي:

> "عند إنشاء Work Order يجب اختيار Work Definition صحيحة، نسخ Operations وOperation Items وOperation Resources، ضبط الحالة Unreleased، منع التنفيذ حتى Release، ثم عند Material Issue يتم إنشاء Inventory Transaction وزيادة WIP، وعند Product Completion يتم استلام المنتج النهائي بتكلفة مؤقتة، ثم عند Close يتم حساب التكلفة الفعلية والانحرافات وإغلاق WIP."

| ما يقوله العميل | ما يجب أن يفهمه المبرمج |
|---|---|
| نريد تعريف طريقة إنتاج المنتج | يجب إنشاء Work Definition تربط Item Structure مع Operations وResources وOutputs |
| نريد إنشاء أمر عمل | يجب إنشاء Work Order Header ونسخ مواد وعمليات وموارد من Work Definition |
| نريد صرف مواد | يجب إنشاء Material Issue Transaction وتخفيض المخزون وزيادة WIP |
| نريد تسجيل العمالة أو الآلة | يجب إنشاء Resource Charge Transaction وربطها بالعملية والأمر وزيادة WIP |
| نريد استلام المنتج النهائي | يجب إنشاء Product Completion Transaction وزيادة مخزون المنتج النهائي بتكلفة مؤقتة |
| نريد تسجيل هالك | يجب إنشاء Scrap Transaction وربطها بالأمر/العملية والتكلفة والجودة |
| نريد إغلاق الأمر | يجب حساب Actual Work Order Cost وإغلاق WIP وتوليد Variances ومنع التعديل |
| نريد معرفة تكلفة الأمر | يجب جمع Material Issue + Resource Charging + Scrap + Completion + Close Distributions |
| نريد الترحيل للمحاسبة | يجب تحويل Cost Distributions إلى Subledger Accounting ثم GL حسب الإعدادات |

---

## 3. الكيانات الرئيسية التي يحتاجها النظام

| الكيان | دوره في النظام | أهم البيانات المطلوبة | علاقته بالكيانات الأخرى | ملاحظات للمبرمج |
|---|---|---|---|---|
| Item | يمثل صنفًا داخل النظام | رقم الصنف، الوصف، UOM، خصائص التخزين والتكلفة | يدخل في Item Structure وWork Order | مفهوم عام ERP |
| Raw Material | مادة خام تُصرف للإنتاج | Item، UOM، Lot/Serial إن وجد، Costing Enabled | تستخدم كـ Component في Item Structure | تؤثر مباشرة على Material Issue وWIP |
| Subassembly | منتج نصف مصنع | Item، Work Definition إن كان ينتج داخليًا | قد يكون مكونًا في منتج أعلى | يمكن أن يكون مستقلًا أو Phantom |
| Finished Good / Assembly | المنتج النهائي المطلوب إنتاجه | Item، UOM، Completion Subinventory، Cost Profile | رأس Work Definition وWork Order | محور Product Completion |
| Item Structure | هيكل مكونات المنتج | Components، quantities، UOM، supply type | تستخدمه Work Definition | يقابل BOM وظيفيًا |
| Work Definition | قالب طريقة الإنتاج | Header، Operations، Items، Resources، Outputs، Versions | المصدر الرئيسي لإنشاء Work Order | خاص بمنطق Oracle ويجمع BOM + Routing + Resources |
| Work Definition Version | إصدار لطريقة الإنتاج | Effective Start/End Dates، Status، Priority | يحدد النسخة المستخدمة عند إنشاء Work Order | مهم تاريخيًا وتكلفيًا |
| Operation | خطوة إنتاج | رقم العملية، الوصف، Work Center، نوع العملية | جزء من Work Definition وWork Order | تؤثر على التنفيذ والموارد |
| Operation Item | مادة مرتبطة بعملية | Item، Quantity، Supply Type، Subinventory | تُصرف أثناء Material Issue | تحدد متى وكيف تصرف المادة |
| Operation Resource | مورد مرتبط بعملية | Resource، Usage، Rate، Charging Type | ينتج Resource Charging | يؤثر على WIP والتكلفة |
| Operation Output | مخرج عملية | Primary Output، Co-product، By-product | مهم في Process Manufacturing | خاص بالحالات العملياتية |
| Work Area | منطقة إنتاج | الاسم، المصنع | تحتوي Work Centers | تنظيمي وتشغيلي |
| Work Center | مركز عمل | Work Area، Resources، Shifts | يحتوي Resources وOperations | يؤثر على الجدولة والتنفيذ |
| Workstation | موقع فعلي داخل Work Center | موقع، Resource Instance | يستخدم في Operator Check-in | متقدم؛ يحتاج تحقق من الحاجة |
| Resource | مورد عمل أو آلة | نوع المورد، UOM، Rate، Work Center | يستخدم في Operation Resource | يؤثر على التكلفة والجدولة |
| Resource Instance | نسخة فعلية من مورد | رقم المورد الفعلي، Workstation | يستخدم للتتبع التفصيلي | متقدم |
| Standard Operation | عملية قياسية يعاد استخدامها | Operation details، Work Center، Resources | تُستخدم داخل Work Definitions | توحّد تعريف العمليات |
| Work Order | أمر العمل التنفيذي | Item، Quantity، Dates، Status، Work Definition | يحتوي Operations/Materials/Resources | محور الدورة التنفيذية |
| Work Order Header | رأس أمر العمل | رقم الأمر، الصنف، الكمية، الحالة، المصدر | يرتبط بجميع سطور الأمر | يجب حفظ Status History |
| Work Order Operation Lines | عمليات الأمر | Operation، sequence، status، quantities | منسوخة من Work Definition | أساس Execution |
| Work Order Material Lines | مواد الأمر | Component، quantity، supply type، issued qty | منسوخة من Operation Items | أساس Material Issue |
| Work Order Resource Lines | موارد الأمر | Resource، planned usage، actual usage | منسوخة من Operation Resources | أساس Resource Charging |
| Material Issue Transaction | حركة صرف مادة | Work Order، Item، Qty، Lot/Serial، Subinventory | تؤثر على Inventory وWIP | تولد Cost Accounting Event |
| Material Return Transaction | حركة إرجاع مادة | Original Issue، Qty، Lot/Serial | تعكس الصرف | تخفض WIP |
| Resource Charge Transaction | حركة تسجيل مورد | Resource، Usage، Rate، Operation | تؤثر على WIP | مصدر Resource Cost |
| Product Completion Transaction | حركة إكمال منتج | Qty، Subinventory، Lot/Serial | تزيد Finished Goods | تكلفتها مؤقتة قبل Close |
| Scrap Transaction | حركة هالك | Qty، reason، Operation، Item/Output | ترتبط بالجودة والتكلفة | قد تظهر كـ Scrap Variance |
| Rework Transaction | حركة إعادة تشغيل | Rework Work Order أو عملية إعادة معالجة | ترتبط بمنتج مرفوض | استنتاج وظيفي مبني على منطق المقال |
| Quality Issue / Production Exception | مشكلة جودة أو تنفيذ | Type، severity، Work Order، Operation، status | قد تمنع التنفيذ أو الإكمال | يجب ربطها بالتقارير |
| WIP Record | سجل تكلفة تحت التشغيل | Work Order، Materials، Resources، Adjustments | يزيد/ينخفض حسب الحركات | استنتاج وظيفي مبني على منطق المقال |
| Cost Accounting Event | حدث تكلفة | Transaction، event type، status | ينتج Cost Distribution | جسر بين التشغيل والتكلفة |
| Cost Distribution | توزيع تكلفة | Cost Element، amount، debit/credit concept | ينتقل إلى SLA/GL | لا يساوي الحركة التشغيلية |
| Variance Record | سجل انحراف | Type، amount، source، Work Order | يظهر عند Close غالبًا | مهم للتقارير والتحسين |
| Subledger Accounting Entry | قيد تفصيلي فرعي | Account، amount، source distribution | ينتج من Cost Distribution | تفاصيله تعتمد على SLA |
| GL Transfer Record | سجل ترحيل للأستاذ العام | SLA Entry، status، period | ينقل الأثر المالي | يحتاج مطابقة |
| Status History | تاريخ الحالات | From/To status، user، date، reason | مرتبط بـ Work Order | ضروري للتدقيق |
| Audit Log | سجل تدقيق | User، action، old/new values، timestamp | يغطي العمليات الحساسة | مطلوب للحوكمة |

---

## 4. خريطة العلاقات بين الكيانات

العلاقات الأساسية في منطق Oracle:

- **Item** يرتبط بـ **Item Structure**.
- **Item Structure** تحتوي **Components**.
- **Work Definition** تستخدم Item Structure وتضيف Operations وResources وOutputs.
- **Work Definition Version** تحدد صلاحية طريقة الإنتاج.
- **Work Order** يستخدم Work Definition.
- **Work Order** يحتوي Operations وMaterials وResources منسوخة من Work Definition.
- **Material Issue** ينشئ حركة مخزون ويزيد WIP.
- **Resource Charging** يزيد WIP وتكلفة الأمر.
- **Product Completion** يستلم المنتج النهائي ويعالج تكلفة مؤقتة.
- **Work Order Close** يحسب الفعلي، يغلق WIP، وينتج Variances.
- **Cost Accounting** يحوّل الحركات إلى Cost Distributions.
- **Subledger Accounting** يحوّل Cost Distributions إلى قيود.
- **General Ledger** يستقبل القيود بعد Transfer.

```text
Item
→ Item Structure
→ Work Definition
→ Work Order
→ Material Issue
→ WIP
→ Resource Charging
→ Product Completion
→ Work Order Close
→ Cost Distributions / Variances
→ Subledger Accounting
→ General Ledger
```

| العلاقة | لماذا مهمة؟ | ماذا يحدث إذا كانت العلاقة غير واضحة؟ |
|---|---|---|
| Item → Item Structure | تحديد مكونات المنتج | صرف مواد ناقصة أو خاطئة |
| Item Structure → Work Definition | تحويل المكونات إلى طريقة إنتاج | Work Order لا يعكس طريقة التصنيع |
| Work Definition → Work Order | نسخ طريقة الإنتاج إلى التنفيذ | أمر عمل بلا عمليات أو مواد أو موارد صحيحة |
| Operation → Work Center / Resource | تحديد مكان ومن ينفذ العملية | تكلفة ووقت تنفيذ غير دقيقين |
| Work Order → Material Issue | ربط الصرف بالأمر | مخزون ناقص دون تكلفة صحيحة |
| Material Issue → WIP | تحويل المادة إلى إنتاج تحت التشغيل | WIP غير دقيق |
| Resource Charging → WIP | تحميل العمل أو الآلة على الأمر | تكلفة ناقصة إذا لم تسجل |
| Product Completion → Finished Goods | إدخال المنتج النهائي للمخزون | مخزون منتج تام غير صحيح |
| Work Order Close → Variances | إظهار الفرق بين المتوقع والفعلي | انحرافات غير محسوبة |
| Cost Distribution → SLA/GL | ربط التشغيل بالمالية | لا يمكن مطابقة الإنتاج مع المحاسبة |

---

## 5. Workflow حالات Work Order

```text
Unreleased
→ Released
→ On Hold / Released
→ Completed
→ Closed

Canceled: مسار إلغاء عند الحاجة قبل أو أثناء الدورة حسب القيود والسياسة.
Pending Approval: حالة اعتماد عند تفعيل E-Records/E-Signatures.
```

| الحالة | ما يسمح به | ما يمنع | الأثر على المخزون | الأثر على WIP/التكلفة | ملاحظات للمبرمج |
|---|---|---|---|---|---|
| Unreleased | المراجعة والتعديل حسب الصلاحيات | التنفيذ والصرف | لا أثر مباشر | لا WIP فعلي | لا تسمح بحركات تنفيذية |
| Released | الصرف، التنفيذ، Resource Charging، Product Completion | التعديلات الحرجة إلا بضوابط | تبدأ الحركات | يبدأ WIP مع الصرف/الموارد | يجب ظهوره في Dispatch List |
| On Hold | الإيقاف المؤقت والمتابعة | حركات تنفيذ جديدة حسب السياسة | لا أثر جديد غالبًا | يمنع تراكم غير مبرر | يستخدم عند مشكلة مواد/آلة/جودة |
| Pending Approval | انتظار اعتماد | التنفيذ قبل الاعتماد | لا أثر حتى الموافقة | لا أثر حتى الموافقة | يحتاج تحقق إضافي من المصدر الأصلي أو من نظام ناتج |
| Completed | مراجعة ما قبل الإغلاق | اعتباره مغلقًا ماليًا | المنتج قد يكون مكتملًا | التكلفة لم تحسم نهائيًا | Completed لا يساوي Closed |
| Closed | التقارير والمراجعة فقط | التعديل والحركات الجديدة | لا حركات جديدة | WIP مغلق والانحرافات محسوبة | حالة حوكمة نهائية |
| Canceled | الإلغاء وفق السياسة | الاستمرار بالتنفيذ | يعتمد على وجود حركات سابقة | يحتاج معالجة إذا وجدت حركات | يحتاج تحقق إضافي من المصدر الأصلي أو من نظام ناتج |

### قواعد انتقال الحالات

| من الحالة | إلى الحالة | شرط الانتقال | Validation المطلوب |
|---|---|---|---|
| Unreleased | Released | اكتمال البيانات وصلاحية المستخدم | Work Definition صالحة، Operations وMaterials موجودة |
| Unreleased | Canceled | عدم الحاجة للأمر | التأكد من عدم وجود حركات |
| Released | On Hold | وجود مشكلة تشغيلية أو جودة أو مواد | سبب الإيقاف وتوثيق المسؤول |
| On Hold | Released | حل سبب الإيقاف | إغلاق أو معالجة الاستثناء |
| Released | Completed | إكمال الكمية أو العملية الأخيرة حسب السياسة | Product Completion صحيح |
| Completed | Closed | جاهزية التكلفة وعدم وجود Pending Transactions | WIP، Cost Distributions، Exceptions، Variances |
| Released/On Hold | Canceled | سياسة الإلغاء تسمح | معالجة الحركات السابقة إن وجدت |
| Closed | أي حالة | غير مسموح عادة | لا تعديل بعد Closed |

---

## 6. عملية إعداد Work Definition — Functional Logic

### المدخلات

- Finished Good / Assembly.
- Item Structure.
- Operations.
- Operation Items.
- Operation Resources.
- Operation Outputs في Process Manufacturing.
- Work Centers.
- Resources.
- Completion Subinventory / Locator.
- Effective Start Date / End Date.
- Production Priority.
- Costing Priority.
- Work Method.

### المعالجات

- التحقق من وجود Item Structure.
- التحقق من أن Operations معرفة.
- التحقق من ربط Resources وWork Centers.
- التحقق من Supply Types.
- التحقق من Completion Subinventory.
- إنشاء Work Definition Version.
- تحديد Primary أو Alternate.
- حفظ صلاحية الاستخدام حسب التاريخ.
- ربطها بالتكلفة عبر Costing Priority.

### المخرجات

- Work Definition قابلة للاستخدام في إنشاء Work Orders.
- Operations / Items / Resources جاهزة للنسخ إلى Work Order.
- أساس للتكلفة وCost Rollup.

| الخطوة | التحقق المطلوب | المخرجات | ملاحظات للمبرمج |
|---|---|---|---|
| اختيار المنتج | Item موجود وقابل للإنتاج | Work Definition Header | لا تبدأ دون صنف واضح |
| ربط Item Structure | وجود مكونات ووحدات وكميات | Operation Items | إذا تغير الهيكل لاحقًا يجب التعامل مع التزامن |
| تعريف Operations | تسلسل عمليات واضح | Operation lines | لا تعتمد على نص حر فقط |
| ربط Work Centers | كل عملية لها مركز عمل | Work Center reference | ضروري للتنفيذ والموارد |
| ربط Resources | Resource UOM وRate عند الحاجة | Operation Resources | تكلفة الموارد تعتمد عليها |
| تحديد Outputs | Primary/Co/By-products عند Process | Operation Outputs | خاص بالحالات العملياتية |
| تحديد Completion Location | Subinventory / Locator | مكان استلام المنتج | يؤثر على المخزون |
| تحديد Version | Effective dates | نسخة صالحة | يمنع استخدام تعريف قديم أو مستقبلي |
| تحديد Priorities | Production / Costing Priority | اختيار مناسب للتخطيط والتكلفة | مهم عند وجود أكثر من تعريف |

### Edge Cases

| الحالة | المعالجة المطلوبة |
|---|---|
| لا توجد Item Structure | منع الاعتماد أو وضع تحذير حرج |
| Work Definition بدون Operations | لا تصلح للتنفيذ |
| Operation بدون Resource | قد تصلح إذا لا تُحسب الموارد؛ وإلا تحذير حرج |
| Resource بدون Rate | التكلفة ناقصة؛ يحتاج تحقق قبل Costing |
| Completion Subinventory غير معرف | منع Product Completion أو طلب إعداد |
| أكثر من Work Definition لنفس المنتج | تطبيق Primary/Alternate وPriority |
| Effective Date غير مناسب | منع الاستخدام في Work Order بتاريخ خارج الصلاحية |
| Item Structure تغيرت بعد اعتماد Work Definition | يحتاج مزامنة أو إشعار للمسؤول |

---

## 7. عملية إنشاء Work Order — Functional Logic

### المدخلات

- Item / Finished Good.
- Quantity.
- Start Date أو Completion Date.
- Inventory Organization / Manufacturing Plant.
- Work Definition.
- Source:
  - Manual.
  - Supply Chain Planning.
  - Order Management / Orchestration.
  - Min-Max Planning.
  - REST API / FBDI.
- Project أو Sales Order إن وجد.

### المعالجات

- التحقق أن المنتج قابل للإنتاج.
- التحقق من وجود Work Definition فعالة.
- نسخ Operations من Work Definition.
- نسخ Operation Items.
- نسخ Operation Resources.
- إنشاء Work Order Header.
- ضبط الحالة Unreleased.
- إنشاء أساس Cost Object أو سجل قابل لاستقبال الحركات.
- إنشاء Status History.

### المخرجات

- Work Order.
- Work Order Operations.
- Work Order Material Lines.
- Work Order Resource Lines.
- أمر جاهز للـ Release.

| الخطوة | التحقق المطلوب | المخرجات | ملاحظات للمبرمج |
|---|---|---|---|
| إدخال الصنف والكمية | الصنف قابل للإنتاج والكمية موجبة | Work Order Header | لا تقبل كمية صفر أو سالبة |
| تحديد المصنع | Inventory Organization / Plant صحيح | ربط الأمر بالموقع | يؤثر على المخزون والتكلفة |
| اختيار Work Definition | صالحة حسب التاريخ والأولوية | مصدر نسخ البيانات | عند تعدد التعاريف يجب سياسة اختيار |
| نسخ Operations | وجود عمليات صالحة | Work Order Operations | النسخ يحفظ تاريخية الأمر |
| نسخ Materials | وجود Operation Items | Material Lines | يجب حفظ الكميات وسلوك Supply Type |
| نسخ Resources | وجود Operation Resources | Resource Lines | أساس Resource Charging |
| ضبط الحالة | Unreleased | Status History | يمنع التنفيذ قبل Release |

### Edge Cases

| الحالة | المعالجة |
|---|---|
| المنتج لا يملك Work Definition | منع إنشاء الأمر أو إنشاء Nonstandard حسب السياسة |
| Work Definition منتهية الصلاحية | منع أو طلب اختيار نسخة أخرى |
| الكمية صفر أو سالبة | رفض الإدخال |
| أكثر من Work Definition صالحة | تطبيق Primary/Alternate/Priority |
| Work Definition مرتبطة بتكلفة مختلفة عن الإنتاج | إظهار تنبيه لمحاسبة التكلفة |
| Work Order من Sales Order أو Project | حفظ الرابط لمتطلبات الحجز والتتبع |
| Work Order ملغى قبل Release | السماح بالإلغاء إذا لا توجد حركات |

---

## 8. عملية Release Work Order

### المطلوب من النظام

- تغيير الحالة من Unreleased إلى Released.
- إتاحة Work Order للتنفيذ.
- إظهاره في Dispatch List.
- السماح بـ Material Issue وResource Charging.
- التحقق من جاهزية البيانات.
- التحقق من توفر المواد إن كان ذلك مطلوبًا.
- التعامل مع Pending Approval إن كانت E-Records/E-Signatures مفعلة.

| الخطوة | ما يحدث | المخرجات |
|---|---|---|
| طلب Release | المستخدم يطلب إطلاق الأمر | عملية انتقال حالة |
| التحقق من البيانات | Work Definition، مواد، عمليات، موارد | قبول أو رفض |
| التحقق من الصلاحية | المستخدم مخول | Audit Log |
| تحديث الحالة | Unreleased → Released | Status History |
| إظهار الأمر | يظهر في Dispatch List | جاهز للتنفيذ |

### Business Rules

- لا Release بدون Work Definition صالحة.
- لا Release إذا توجد أخطاء حرجة في Operations أو Materials.
- لا Release إذا الصلاحية غير موجودة.
- قد يتطلب Release موافقة.
- وجود On-hand مناسب للمواد مطلوب تشغيليًا عند التنفيذ.

### Edge Cases

| الحالة | المعالجة |
|---|---|
| Release بدون توفر مواد | السماح أو المنع حسب السياسة، مع تحذير واضح |
| Release ثم On Hold | حفظ السبب ومنع التنفيذ |
| Release ثم Cancel | التحقق من الحركات قبل الإلغاء |
| Release لأمر غير مكتمل البيانات | منع |
| Pending Approval يعطل التنفيذ | لا يسمح بحركات حتى الاعتماد |

---

## 9. عملية On Hold

On Hold تستخدم لإيقاف أمر العمل مؤقتًا عند وجود مشكلة تشغيلية أو جودة أو مواد أو مورد.

| الحالة | المنطق | الأثر |
|---|---|---|
| On Hold بسبب نقص مواد | إيقاف التنفيذ حتى توفر المادة | يمنع حركات غير مضبوطة |
| On Hold بسبب جودة | انتظار نتيجة Inspection أو Quality Issue | قد يمنع Product Completion أو الإتاحة |
| On Hold بسبب آلة | Resource/Maintenance Exception | يؤثر على التنفيذ والجدولة |
| العودة إلى Released | بعد معالجة السبب | استئناف التنفيذ |

### Edge Cases

| الحالة | ملاحظة |
|---|---|
| On Hold بعد صرف مواد | WIP يبقى مفتوحًا ويحتاج متابعة |
| On Hold بعد Product Completion جزئي | يجب تمييز الكمية المكتملة والمتبقية |
| On Hold بسبب Quality Issue | قد يمنع الإكمال أو الإتاحة |
| On Hold بسبب نقص مواد | يجب ربطه بـ Material Exception |
| On Hold بسبب مشكلة آلة | يجب ربطه بـ Resource/Maintenance Exception |

---

## 10. عملية Material Issue / Component Issue

### المدخلات

- Work Order.
- Operation.
- Component Item.
- Quantity.
- Supply Type.
- Supply Subinventory.
- Supply Locator.
- Lot / Serial إن وجد.
- المستخدم.

### المعالجات

- التحقق من حالة Work Order.
- التحقق من أن الأمر Released.
- التحقق من أن المادة ضمن Operation Items أو مسموح بها.
- التحقق من Supply Type.
- التحقق من توفر الكمية.
- التحقق من Lot / Serial عند الحاجة.
- منع صرف Expired Lots إذا الإعداد مفعل.
- تخفيض مخزون المادة.
- إنشاء Inventory Transaction.
- إنشاء أو تحفيز Cost Accounting Event.
- زيادة WIP.
- تسجيل الرابط مع Work Order وOperation.

### المخرجات

- Material Issue Transaction.
- Inventory Movement.
- WIP Impact.
- Cost Accounting Event.
- Cost Distribution لاحقًا أو حسب المعالجة.
- Potential Variance إذا اختلفت الكمية أو المادة.

| الخطوة | التحقق | الأثر المخزني | الأثر على WIP/التكلفة |
|---|---|---|---|
| اختيار الأمر | Work Order = Released | لا أثر بعد | لا أثر |
| اختيار المادة | ضمن Operation Items أو مسموح بها | لا أثر بعد | قد تؤثر على Substitution Variance |
| تحديد الكمية | كمية موجبة ومسموحة | لا أثر بعد | كمية مختلفة قد تنتج Usage Variance |
| تحديد Supply Type | Push/Pull/Bulk/Phantom/Supplier | يحدد آلية الصرف | يحدد توقيت التكلفة |
| تحديد Subinventory/Lot | توفر الكمية وصحة Lot/Serial | تخفيض مخزون المادة | زيادة WIP |
| ترحيل الصرف | إنشاء Inventory Transaction | نقص المخزون | Cost Accounting Event |
| المعالجة التكلفية | تسعير الحركة | لا أثر مخزني جديد | Cost Distribution |

### Business Rules

- لا صرف على Work Order غير Released.
- لا صرف بعد Closed.
- لا صرف من Subinventory غير مسموح.
- لا صرف Lot منتهي إذا المنع مفعل.
- لا صرف مادة غير مرتبطة بالأمر إلا بصلاحية أو كـ Ad hoc.
- الصرف اليدوي أو الآلي يعتمد على Supply Type.
- Bulk لا يعني صرفًا فعليًا.
- Supplier Supply يعني مسؤولية المورد.

### Edge Cases

| الحالة | الأثر المتوقع |
|---|---|
| صرف أقل من المطلوب | Potential Material Usage Variance |
| صرف أكثر من المطلوب | WIP أعلى وانحراف استخدام |
| صرف مادة بديلة | Material Substitution Variance |
| صرف مادة غير موجودة | يحتاج صلاحية وتوثيق |
| صرف Lot خطأ | مشكلة تتبع وجودة |
| صرف ثم On Hold | WIP مفتوح يحتاج متابعة |
| صرف ثم Cancel | يحتاج معالجة عكسية |
| فشل Cost Accounting Event | يظهر في Pending/Errors |
| نفاد الكمية | لا يتم الصرف أو يظهر Exception |
| Phantom Components | تفجير المكونات وفق Work Definition |
| Operation Pull أو Assembly Pull | الصرف يحدث تلقائيًا حسب الحدث |

---

## 11. عملية Material Return / Component Return

### المدخلات

- Work Order.
- Component Item.
- Original Issue Transaction إن وجد.
- Quantity.
- Lot / Serial.
- Subinventory / Locator.
- سبب الإرجاع.

### المعالجات

- التحقق من وجود صرف سابق.
- التحقق أن الكمية المرجعة لا تتجاوز المصروفة.
- زيادة مخزون المادة.
- تخفيض WIP أو عكس جزء من التكلفة.
- إنشاء Inventory Transaction عكسية.
- إنشاء Cost Accounting Event.
- ربط الإرجاع بـ Work Order.

### المخرجات

- Material Return Transaction.
- Inventory Increase.
- WIP Reduction.
- Cost Distribution عكسية أو تصحيحية.

| الحالة | الأثر المخزني | الأثر على WIP | Validation |
|---|---|---|---|
| إرجاع صحيح | زيادة مخزون المادة | تخفيض WIP | لا يتجاوز المصروف |
| إرجاع جزئي | زيادة جزئية | تخفيض جزئي | مرتبط بصرف سابق |
| إرجاع Lot/Serial | إعادة نفس Lot/Serial | عكس تكلفة مرتبطة | يجب مطابقة التتبع |
| إرجاع مادة تالفة | يحتاج سياسة | قد لا تعود للمخزون الصالح | يحتاج سبب |
| إرجاع بعد Close | غالبًا غير مسموح أو يحتاج تصحيح | يحتاج تحقق إضافي | يحتاج تحقق إضافي من المصدر الأصلي أو من نظام ناتج |

### Edge Cases

- إرجاع أكثر من المصروف.
- إرجاع بعد Product Completion.
- إرجاع بعد Close.
- إرجاع Lot مختلف.
- إرجاع مادة تالفة.
- إرجاع لمستودع خاطئ.

---

## 12. عملية Resource Charging

### المدخلات

- Work Order.
- Operation.
- Resource.
- Resource Usage.
- Resource Rate.
- Manual أو Automatic.
- Operator Check-in / Check-out إن وجد.
- المستخدم.

### المعالجات

- التحقق من وجود Operation.
- التحقق من أن Resource مرتبط بـ Work Center.
- تسجيل الاستخدام الفعلي أو التلقائي.
- احتساب تكلفة المورد.
- زيادة WIP بقيمة الموارد.
- إنشاء Cost Accounting Event.
- حفظ الفرق بين الاستخدام المخطط والفعلي.
- دعم Variance لاحقًا.

### المخرجات

- Resource Charge Transaction.
- WIP Impact.
- Cost Distribution لاحقًا.
- Potential Resource Usage / Rate Variance.

| الخطوة | الأثر التشغيلي | أثر WIP | أثر التكلفة |
|---|---|---|---|
| اختيار العملية | يحدد موقع التنفيذ | لا أثر بعد | لا أثر |
| اختيار المورد | يحدد عامل/آلة | لا أثر بعد | Rate مطلوب للتكلفة |
| تسجيل الاستخدام | يثبت العمل الفعلي | يزيد WIP | Resource Cost |
| معالجة التكلفة | لا تغير التشغيل | يثبت قيمة WIP | Cost Distribution |
| مقارنة المخطط بالفعلي | رقابة تشغيلية | لا أثر مباشر | Variance محتمل |

### Business Rules

- لا تسجيل موارد على Work Order غير Released.
- لا تسجيل Resource غير معرف.
- لا تسجيل Resource Usage سلبي.
- Manual Charging يحتاج إدخال مستخدم.
- Automatic Charging يحتاج إعداد واضح.
- اختلاف Resource عن المخطط يحتاج ضبط أو صلاحية.

### Edge Cases

| الحالة | الأثر |
|---|---|
| Resource بدون Rate | تكلفة الموارد غير مكتملة |
| Resource Usage صفر | قد يعني عدم تنفيذ أو خطأ إدخال |
| استخدام مورد خاطئ | Resource Substitution/Usage issue |
| Check-in بدون Check-out | استخدام غير محسوم |
| Operation skipped | تكلفة أو تنفيذ ناقص |
| Auto-Transact يخفي خطأ | يحتاج تقرير رقابي |
| Maintenance Exception | يوقف أو يؤخر التشغيل |

---

## 13. عملية Execute Operations

| نوع العملية | ماذا يحدث في النظام؟ | ملاحظات للمبرمج |
|---|---|---|
| Count Point Operation | يجب تسجيلها صراحة | لا تسمح بتجاوزها إذا إلزامية |
| Auto-Transact Operation | تسجل تلقائيًا عند حدث لاحق | يجب توضيح متى يحدث الترحيل التلقائي |
| Optional Operation | يمكن تجاوزها | يجب أن لا تولد تكلفة إذا لم تنفذ |
| Operation Completion | تسجيل إنجاز العملية | قد يؤدي إلى Backflush أو Resource Charging |
| Last Operation Completion | قد يؤدي إلى Completed | يجب ربطها بالكمية المكتملة |

### Business Rules

- لا يمكن تجاوز Count Point إذا كان إلزاميًا.
- Auto-Transact يتم تلقائيًا حسب المنطق.
- Optional يمكن تجاوزه حسب السياسة.
- العملية الأخيرة قد تؤدي إلى Completed بعد إكمال الكمية.

### Edge Cases

- عملية لم تكتمل.
- عملية تم تجاوزها.
- عملية غير مرتبة.
- إعادة تشغيل Operation.
- إكمال عملية بكمية أقل.
- إكمال عملية مع Scrap أو Reject.

---

## 14. عملية Product Completion

### المدخلات

- Work Order.
- Finished Good / Assembly.
- Completed Quantity.
- Completion Subinventory.
- Completion Locator.
- Lot / Serial للمنتج النهائي إن وجد.
- Operation Output في Process Manufacturing.
- Co-products / By-products إن وجدت.
- المستخدم.

### المعالجات

- التحقق من حالة Work Order.
- التحقق من أن الأمر Released.
- التحقق من العمليات المطلوبة.
- استلام المنتج النهائي في المخزون.
- إنشاء Product Completion Transaction.
- إنشاء Inventory Transaction للمنتج النهائي.
- تسجيل تكلفة مؤقتة / تقديرية قبل Close.
- التأثير على WIP.
- التعامل مع الإنتاج الجزئي.
- التعامل مع Undercompletion Tolerance.
- تحديث الحالة إلى Completed إذا اكتملت الكمية حسب الشروط.
- إنشاء Cost Accounting Event.

### المخرجات

- Finished Goods Inventory Increase.
- Product Completion Record.
- Provisional Completion Cost.
- WIP Impact.
- Work Order Status Update.
- Cost Distribution لاحقًا.

| الخطوة | الأثر المخزني | الأثر على WIP | الأثر على التكلفة |
|---|---|---|---|
| التحقق من الأمر | لا أثر | لا أثر | لا أثر |
| تحديد الكمية | لا أثر | لا أثر | يحدد تكلفة مؤقتة |
| تحديد Completion Location | مكان الاستلام | لا أثر | لا أثر |
| ترحيل Completion | زيادة Finished Goods | نقل/تخفيف WIP | Provisional Completion Cost |
| معالجة التكلفة | لا أثر جديد | يثبت أو يعدل | Cost Distribution |
| تحديث الحالة | لا أثر | لا أثر | قد يصبح Completed |

### Business Rules

- لا Product Completion قبل Release.
- لا Product Completion بعد Closed.
- Completion Quantity يجب ألا تخالف السياسة.
- المنتج يدخل في Completion Subinventory صحيح.
- المنتج المتتبع يحتاج Lot / Serial.
- Product Completion لا يعني أن التكلفة نهائية.
- Completed لا يساوي Closed.

### Edge Cases

| الحالة | الملاحظة |
|---|---|
| إكمال جزئي | يبقى الأمر مفتوحًا |
| إكمال كمية أقل من المخطط | Undercompletion policy |
| إكمال كمية أكبر من المخطط | يحتاج سماحية أو منع |
| Product Completion بدون Material Issue كامل | WIP/Variance محتمل |
| Product Completion بدون Resource Charging | تكلفة ناقصة |
| Completion في Locator خاطئ | مخزون غير صحيح |
| Co-product أو By-product | خاص بـ Process Manufacturing |
| Quality / Inspection قبل الإتاحة | يجب منع أو تقييد المخزون حسب السياسة |

---

## 15. عملية Scrap / Rework / Reject

### Scrap

- يسجل عندما توجد كمية هالكة مرتبطة بعملية أو منتج.
- يرتبط بـ Work Order أو Operation.
- قد يؤثر على المخزون والتكلفة.
- قد ينتج Cost Accounting Event.
- قد يظهر كـ Scrap Variance.

### Rework

- قد يتم عبر Rework Work Order.
- يرتبط بمنتج مرفوض أو يحتاج إصلاح.
- له تكلفة إضافية.

### Reject

- يعالج المنتج المرفوض.
- قد يمنع الإتاحة.
- يرتبط بالجودة.

| الحالة | المنطق الوظيفي | الأثر على المخزون | الأثر على WIP/التكلفة |
|---|---|---|---|
| Scrap أثناء العملية | تسجيل كمية هالكة | قد لا تدخل كمخزون صالح | يؤثر على WIP/Cost Accounting |
| Scrap بعد Completion | منتج مكتمل مرفوض | يحتاج إخراج أو تصنيف | قد يظهر كتكلفة أو انحراف |
| Rework | إعادة تشغيل منتج | قد يعاد إلى دورة إنتاج | تكلفة إضافية |
| Reject | رفض منتج | يمنع الإتاحة | قد يقود إلى Scrap أو Rework |

### Business Rules

- لا Scrap بدون سبب.
- Scrap بعد Close يحتاج منع أو إجراء تصحيحي خاص.
- Rework يجب أن يرتبط بأمر أو عملية.
- Reject يجب أن يظهر في الجودة أو المخزون حسب السياسة.
- الهالك يجب ألا يختفي بدون أثر تكلفة أو تقرير.

### Edge Cases

- المنتج مرفوض بالكامل.
- جزء مقبول وجزء مرفوض.
- هالك قابل للبيع كخردة.
- إعادة تشغيل بعد Product Completion.
- Scrap قبل/بعد Product Completion.
- Scrap مع Lot / Serial.

---

## 16. عملية Quality / Production Exceptions

| الاستثناء | متى يظهر؟ | أثره التشغيلي | أثره على النظام |
|---|---|---|---|
| Production Exception | مشكلة في سير الإنتاج | قد يوقف أو يؤخر الأمر | يظهر في تقارير الاستثناءات |
| Material Exception | نقص أو مشكلة في مادة | يمنع أو يؤخر الصرف/التنفيذ | يرتبط بـ Work Order/Component |
| Resource Exception | آلة أو عامل غير متاح | يؤخر Operation | قد يرتبط بالصيانة |
| Quality Issue | مشكلة جودة | قد تمنع Product Completion أو الإتاحة | يحتاج Inspection/Disposition |
| Inspection | فحص منتج أو عملية | يتحكم بقبول/رفض | يؤثر على المخزون والجودة |
| Maintenance-related Exception | عطل آلة أو مورد | يوقف أو يؤخر التنفيذ | يجب ربطه بـ Resource |

### Business Rules

- الاستثناء يجب أن يكون مرتبطًا بكيان واضح: Work Order / Operation / Material / Resource.
- الاستثناء المفتوح يجب أن يمنع أو يحذر حسب السياسة.
- Quality Issue قد تمنع إتاحة المخزون.
- Maintenance Exception قد تؤثر على Resource Availability.

### Edge Cases

- Exception مفتوح عند Close.
- Quality Failed بعد Product Completion.
- Resource Down أثناء تنفيذ العملية.
- Material Shortage بعد Release.
- Inspection غير مكتمل.

---

## 17. عملية Work Order Close

### ماذا يجب أن يحدث عند Close؟

- التحقق من عدم وجود Pending Transactions.
- التحقق من اكتمال أو معالجة Product Completion.
- التحقق من Material Issue وMaterial Return.
- التحقق من Resource Charging.
- التحقق من Scrap / Rework / Reject.
- التحقق من Exceptions المفتوحة.
- حساب Actual Work Order Cost.
- إغلاق WIP.
- إنشاء Variances.
- إنشاء أو استكمال Cost Distributions.
- منع التعديل بعد Close.
- تحديث الحالة إلى Closed.
- تسجيل Status History وAudit Log.

| التحقق قبل الإغلاق | لماذا مهم؟ | ماذا يحدث إذا فشل؟ |
|---|---|---|
| Pending Transactions | تمنع تكلفة صحيحة | لا يمكن إغلاق موثوق |
| Material Issue | يؤثر على WIP والتكلفة | تكلفة مواد ناقصة أو زائدة |
| Material Return | يعكس الصرف الزائد | WIP أعلى من الواقع |
| Resource Charging | يؤثر على تكلفة العمل/الآلة | تكلفة ناقصة |
| Product Completion | يحدد المنتج المكتمل | مخزون غير مكتمل أو خاطئ |
| Scrap / Rework / Reject | يؤثر على الهالك والجودة | Variance غير مفسر |
| Exceptions | قد تمنع الإغلاق | إغلاق مع مشاكل مفتوحة |
| WIP | يجب تسويته | WIP يبقى مفتوحًا |
| Cost Distributions | أساس المحاسبة | اختلاف مع المالية |
| Period | تاريخ الإغلاق مهم | تشويه تكلفة الفترة |
| صلاحية المستخدم | حوكمة | إغلاق غير معتمد |

### Business Rules

- لا Close مع Pending Transactions.
- لا Close بدون صلاحية.
- لا Close إذا توجد Exceptions حرجة مفتوحة.
- لا Close إذا WIP غير مفهوم أو يحتاج مراجعة.
- لا تعديل بعد Closed.
- Completed لا يكفي ماليًا دون Close.

### Edge Cases

- Close بكمية إنتاج أقل من المخطط.
- Close مع مواد مصروفة ولم يتم Product Completion.
- Close مع Product Completion دون كل الموارد.
- Close في فترة محاسبية لاحقة.
- Close ثم اكتشاف خطأ.
- Close لأمر جزئي.
- Cancel بعد حركات.

---

## 18. منطق WIP في النظام

### WIP يزيد عند

- Material Issue.
- Resource Charging.
- Overhead إن ورد في المقال.

### WIP ينخفض أو يُسوّى عند

- Product Completion.
- Work Order Close.
- Material Return جزئيًا.

### المطلوب من النظام

- حفظ WIP على مستوى Work Order.
- حفظ مكونات WIP: Materials / Resources / Overhead إن وجد.
- إمكانية عرض WIP المفتوح.
- إمكانية عرض WIP حسب Item / Plant / Period.
- إغلاق WIP عند Close.
- كشف Work Orders ذات WIP مفتوح لفترة طويلة.
- دعم WIP Adjustments إذا ورد أو يحتاج تحقق إضافي.

| الحدث | هل يزيد WIP؟ | هل يخفض WIP؟ | ملاحظة للمبرمج |
|---|---|---|---|
| Material Issue | نعم | لا | يزيد WIP بقيمة المواد |
| Material Return | لا | نعم | عكس جزئي للصرف |
| Resource Charging | نعم | لا | يزيد WIP بقيمة المورد |
| Product Completion | لا | نعم/ينقل | ينقل التكلفة نحو المنتج النهائي |
| Scrap | يعتمد على السياسة | قد يخفض أو يعيد تصنيف | يحتاج تحقق حسب السياسة |
| Work Order Close | لا | نعم | يغلق WIP ويحسب الفعلي |
| WIP Adjustment | قد يزيد أو يخفض | قد يزيد أو يخفض | يحتاج تحقق إضافي |

### Edge Cases

- WIP سلبي.
- WIP مفتوح بعد Close.
- WIP بدون Work Order.
- Material Issue بدون Product Completion.
- Product Completion بدون Close.
- Resource Charging غير دقيق.
- WIP نهاية الفترة.

---

## 19. منطق Cost Accounting

### مصادر التكلفة

- Material Cost.
- Resource Cost.
- Overhead Cost إن ورد.
- Scrap Cost.
- Product Completion Cost.
- Actual Work Order Cost.

### كائنات أو مفاهيم التكلفة

- Cost Organization.
- Cost Book.
- Cost Element.
- Cost Method.
- Cost Profile.
- Valuation Unit.
- Cost Scenario.
- Cost Rollup.
- Cost Processor.
- Cost Accounting Event.
- Cost Distribution.

| المفهوم | دوره | ملاحظة للمبرمج |
|---|---|---|
| Cost Organization | نطاق محاسبة التكلفة | يؤثر على أين تُحتسب التكلفة |
| Cost Book | سجل تكلفة | قد يوجد أكثر من كتاب تكلفة |
| Cost Element | عنصر تكلفة | مواد، موارد، Overhead... |
| Cost Method | طريقة التكلفة | Standard / Average / Actual |
| Cost Profile | يحدد قواعد تكلفة الصنف | مهم لـ Product Completion |
| Valuation Unit | مستوى التقييم | يؤثر على دقة التكلفة |
| Cost Scenario | إعداد معدلات/سيناريوهات | مهم لـ Standard Cost |
| Cost Rollup | تجميع تكلفة المنتج | يعتمد على Work Definition |
| Cost Processor | معالج التكلفة | يحول الحركات إلى تكاليف |
| Cost Accounting Event | حدث قابل للتكلفة | يأتي من Manufacturing/Inventory |
| Cost Distribution | نتيجة مالية تحليلية | تنتقل إلى SLA/GL |

### Business Rules

- لا تكلفة موثوقة بدون Work Definition صحيحة.
- لا Resource Cost بدون Resource Usage وRate.
- لا Actual Work Order Cost بدون Close.
- لا GL موثوق بدون Cost Distributions صحيحة.
- يجب عدم الخلط بين Manufacturing Transaction وCost Distribution.

### Edge Cases

- Cost Processor لم يعمل.
- Cost Distribution failed.
- Material بدون تكلفة.
- Resource بدون Rate.
- Product Completion Cost مؤقتة.
- Cost Method غير مناسب.

---

## 20. منطق Variances

| نوع الانحراف | شرط ظهوره | البيانات المطلوبة | ملاحظة للمبرمج |
|---|---|---|---|
| Material Rate Variance | اختلاف سعر المادة | Standard/Actual material cost | يظهر غالبًا مع Standard Cost |
| Material Usage Variance | اختلاف كمية الصرف | Required vs issued qty | يكشف سوء Item Structure أو التنفيذ |
| Material Substitution Variance | استخدام مادة بديلة | Planned item vs issued item | يحتاج ربط البدائل |
| Resource Rate Variance | اختلاف معدل المورد | Planned rate vs actual/published rate | يعتمد على Resource Rate |
| Resource Usage Variance | اختلاف استخدام المورد | Planned usage vs actual usage | يكشف ضعف التسجيل أو التشغيل |
| Yield Variance | اختلاف الناتج/الفاقد | Expected yield vs actual output | مرتبط بـ Operation Yield |
| Job Close Variance | فرق متبقٍ عند الإغلاق | All cost components | يظهر عند Close |
| Scrap Variance | اختلاف الهالك | Expected/actual scrap | يحتاج Scrap Transaction |

---

## 21. منطق Cost Distributions وSubledger / GL

### المطلوب فهمه

- Manufacturing Execution ينتج أحداثًا تشغيلية.
- Inventory Transactions تنتج حركات مخزون.
- Cost Accounting يعالج الأحداث.
- Cost Distributions تمثل الأثر المالي التحليلي.
- Subledger Accounting يحولها إلى قيود.
- General Ledger يستقبل القيود بعد Transfer.
- Work Order Close يجهز جزءًا مهمًا من الانحرافات والتسوية.

| العملية | الأثر المالي المفهومي | هل هو تشغيلي أم Cost Distribution؟ | ملاحظة |
|---|---|---|---|
| Material Issue | Raw Material إلى WIP كمفهوم | يبدأ تشغيليًا ثم Cost Distribution | الحسابات التفصيلية تعتمد على SLA |
| Material Return | عكس أثر الصرف | Cost Distribution عكسية/تصحيحية | يحتاج ربط بالحركة الأصلية |
| Resource Charging | تحميل مورد على WIP | Cost Distribution | يعتمد على Resource Rate |
| Product Completion | WIP إلى Finished Goods كمفهوم | Cost Distribution | تكلفة مؤقتة قبل Close |
| Scrap | أثر هالك على WIP/Expense حسب السياسة | Cost Distribution | يحتاج تحقق حسب السياسة |
| Work Order Close | Actual Cost وVariances وإغلاق WIP | Cost Distribution | الحدث المالي الحاسم |
| Transfer to GL | نقل القيود للأستاذ العام | Subledger/GL | ليس من Manufacturing مباشرة |

إذا لم تكن القيود التفصيلية كافية في المقال، لا تُخترع.  
**يحتاج تحقق إضافي من المصدر الأصلي أو من نظام ناتج**.

---

## 22. منطق Period Close

### قبل Period Close يجب مراجعة

- Unclosed Work Orders.
- Completed but not Closed Work Orders.
- Pending Transactions.
- Open WIP.
- Cost Distributions غير معالجة أو غير مرحلة.
- Variances غير مراجعة.
- Transfer to GL.
- Production-to-GL Reconciliation.

| بند مراجعة Period Close | لماذا مهم؟ | أثر إهماله |
|---|---|---|
| Unclosed Work Orders | تمنع حسم التكلفة | WIP مفتوح |
| Completed not Closed | المنتج مكتمل لكن التكلفة غير نهائية | تشويه الفترة |
| Pending Transactions | تمنع تسعير/ترحيل صحيح | أخطاء Period Close |
| Open WIP | يؤثر على الميزانية | أرقام غير موثوقة |
| Cost Distributions | أساس المالية | عدم مطابقة GL |
| Variances | تشرح فروقات التكلفة | فروقات غير مفهومة |
| Transfer to GL | نهاية الترحيل | أرقام غير مكتملة في GL |
| Production-to-GL Reconciliation | مطابقة الإنتاج والمالية | عدم ثقة بالإنتاج |

### Business Rules

- لا Period Close موثوق بدون مراجعة الإنتاج.
- لا يجب ترك Work Orders مكتملة دون Close لفترات طويلة.
- يجب التعامل مع Pending Transactions قبل الإغلاق.
- يجب أن تكون المالية طرفًا في الإغلاق.

---

## 23. الصلاحيات والضوابط

| الصلاحية | لماذا تحتاج ضبط؟ | المخاطر إذا كانت مفتوحة |
|---|---|---|
| إنشاء Work Definition | يؤثر على كل أوامر الإنتاج | تعريفات خاطئة |
| تعديل Work Definition | يغير طريقة الإنتاج | تكلفة وصرف غير مستقر |
| اعتماد Work Definition | حوكمة | استخدام تعريف غير معتمد |
| إنشاء Work Order | بدء دورة إنتاج | أوامر غير مبررة |
| تعديل Work Order | يؤثر على التنفيذ | تغيير غير مضبوط |
| Release Work Order | يسمح بالتنفيذ | إطلاق قبل الجاهزية |
| On Hold | يوقف التنفيذ | إساءة الإيقاف أو عدم استخدامه |
| Cancel Work Order | يلغي أمرًا | إلغاء مع حركات |
| Material Issue | يؤثر على المخزون وWIP | صرف غير مصرح |
| Material Return | يعكس المخزون وWIP | إرجاع غير صحيح |
| Resource Charging | يؤثر على التكلفة | تكلفة موارد خاطئة |
| Product Completion | يزيد Finished Goods | إدخال منتج غير مكتمل |
| Scrap | يؤثر على الجودة والتكلفة | هالك غير مبرر |
| Rework | يعيد تشغيل منتج | تكاليف إضافية غير مضبوطة |
| Quality Issue / Exception | يؤثر على التنفيذ والإتاحة | تجاهل مشاكل جودة |
| Work Order Close | يحسم التكلفة | إغلاق خاطئ أو مبكر |
| مشاهدة التكلفة | بيانات حساسة | كشف غير مصرح |
| مراجعة Cost Distributions | رقابة مالية | أخطاء غير مكتشفة |
| Period Close | إغلاق مالي | إقفال غير صحيح |
| Transfer to GL | ترحيل نهائي | قيود غير مراجعة |

---

## 24. سجل التدقيق Audit Trail

| العملية | ما يجب تسجيله في Audit Log؟ |
|---|---|
| إنشاء Work Definition | المستخدم، الوقت، المنتج، النسخة |
| تعديل Item Structure | القيم قبل/بعد، السبب، المستخدم |
| إنشاء Work Order | المصدر، المستخدم، الكمية، Work Definition |
| تعديل Work Order | الحقول المعدلة، القيم قبل/بعد |
| Release | المستخدم، التاريخ، الحالة السابقة واللاحقة |
| Material Issue | item، qty، lot/serial، subinventory، المستخدم |
| Material Return | الحركة الأصلية، qty، السبب |
| Resource Charging | resource، usage، operation، المستخدم |
| Product Completion | qty، subinventory، lot/serial |
| Scrap | qty، reason، operation، المستخدم |
| Quality Issue | type، severity، status، linked entity |
| Close | user، date، WIP، variances، distributions |
| أي تعديل حساس | القيم قبل/بعد والسبب |

---

## 25. أسئلة يجب أن يطرحها المبرمج على الـ Functional Consultant

| المجال | سؤال المبرمج | الإجابة المطلوبة من الـ Functional |
|---|---|---|
| Work Definition | هل يجب نسخ Work Definition إلى Work Order أم قراءتها مباشرة؟ | سياسة النسخ والتاريخية |
| Work Definition | ماذا يحدث إذا تغيرت Work Definition بعد إنشاء Work Order؟ | هل يؤثر على الأوامر المفتوحة؟ |
| Work Definition | هل يسمح بتعديل Operations داخل Work Order؟ | الصلاحيات والقيود |
| Material Issue | متى يسمح بالصرف؟ | حالات الأمر المسموحة |
| Material Issue | هل الصرف يدوي أم تلقائي؟ | Supply Types المطلوبة |
| Material Issue | هل يسمح بصرف مادة غير موجودة في Item Structure؟ | سياسة Ad hoc/Substitution |
| Material Issue | كيف نعالج Supply Types؟ | منطق Push/Pull/Bulk/Phantom/Supplier |
| Resource Charging | هل الموارد تسجل يدويًا أم تلقائيًا؟ | طريقة التسجيل |
| Resource Charging | هل Resource Rate تؤثر على التكلفة؟ | مصدر المعدلات |
| Resource Charging | ماذا نفعل إذا لم يسجل المستخدم المورد؟ | Validation أو تقرير نقص |
| Product Completion | هل يسمح بالإنتاج الجزئي؟ | حدود partial/under/over completion |
| Product Completion | هل يسمح بإكمال أكثر من الكمية؟ | سياسة السماحية |
| Product Completion | كيف نعالج Co-products وBy-products؟ | هل مطلوبة الآن؟ |
| Product Completion | هل Product Completion يحتاج Quality؟ | هل يمنع الإتاحة؟ |
| Costing | متى نحسب التكلفة؟ | Estimate/Completion/Close حسب السياسة |
| Costing | هل Product Completion Cost مؤقتة؟ | نعم/لا وكيف تظهر |
| Costing | متى نحسب Actual Cost؟ | عند Close |
| Costing | هل نحتاج Cost Distributions؟ | مستوى التفصيل المطلوب |
| Close | ما شروط Close؟ | Checklist الإغلاق |
| Close | ماذا نفعل إذا اكتشفنا خطأ بعد Close؟ | Reopen أو تصحيح |
| Close | هل يمكن Reopen أم يحتاج إجراء تصحيحي؟ | سياسة النظام المحلي |

---

## 26. سيناريوهات اختبار وظيفية للمبرمجين

| رقم | السيناريو | الخطوات | النتيجة المتوقعة | ملاحظات |
|---:|---|---|---|---|
| 1 | إنشاء Work Definition صحيحة | Item + Structure + Operations + Resources | Work Definition صالحة | تشمل Version |
| 2 | إنشاء Work Definition بدون Operation | حفظ تعريف ناقص | النظام يمنع أو يحذر | حسب السياسة |
| 3 | إنشاء Work Order من Work Definition | اختيار item/qty/date | نسخ operations/materials/resources | الحالة Unreleased |
| 4 | إنشاء Work Order بدون Work Definition | اختيار item لا يملك تعريف | رفض أو Nonstandard حسب السياسة | يجب ضبط |
| 5 | Release ناجح | Work Order مكتمل البيانات | الحالة Released | يظهر في Dispatch List |
| 6 | Release مع نقص بيانات | حذف resource أو material | منع Release | خطأ واضح |
| 7 | Material Issue لصنف Push | صرف يدوي | نقص مخزون + زيادة WIP | Cost Event |
| 8 | Operation Pull أو Assembly Pull | إكمال عملية/منتج | صرف تلقائي | تحقق من التوقيت |
| 9 | Material Issue مع Lot منتهي | اختيار expired lot | منع إذا الإعداد مفعل | Traceability |
| 10 | Material Return | إرجاع جزء من المصروف | زيادة مخزون + خفض WIP | لا يتجاوز المصروف |
| 11 | Resource Charging يدوي | إدخال usage | WIP يزيد | Cost Event |
| 12 | Resource Charging تلقائي | إعداد automatic | تسجيل تلقائي | يحتاج مراجعة |
| 13 | Product Completion جزئي | إكمال جزء من الكمية | مخزون يزيد جزئيًا | الأمر لا يغلق |
| 14 | Product Completion كامل | إكمال الكمية | الحالة Completed | ليس Closed |
| 15 | Product Completion مع Lot / Serial | إدخال lot/serial | تتبع صحيح | إلزامي إن كان الصنف متتبعًا |
| 16 | Scrap Transaction | تسجيل هالك | أثر تكلفة/جودة | يظهر في تقرير |
| 17 | Quality Issue | تسجيل مشكلة جودة | Exception مفتوح | قد يمنع الإتاحة |
| 18 | Work Order On Hold | وضع Released على hold | يمنع التنفيذ | السبب محفوظ |
| 19 | Work Order Close ناجح | لا pending + completed | Closed + variances | WIP مغلق |
| 20 | Close مع Pending Transactions | محاولة close | رفض | رسالة واضحة |
| 21 | Close مع WIP مفتوح غير مفسر | وجود WIP abnormal | منع أو تحذير | حسب السياسة |
| 22 | ظهور Material Usage Variance | صرف أكثر/أقل | variance report | عند Close |
| 23 | ظهور Resource Usage Variance | usage مختلف | variance report | عند Close |
| 24 | Cost Distribution generated | تنفيذ cost processor | distributions جاهزة | مرتبطة بالحركات |
| 25 | Transfer to GL | ترحيل SLA/GL | قيود مرحلة | يحتاج مراجعة |
| 26 | Period Close Review | مراجعة pending/unclosed/WIP | قرار close | تقرير |
| 27 | منع التعديل بعد Close | محاولة تعديل closed WO | رفض | Audit |

---

## 27. نموذج User Story للمطورين

| User Story | Acceptance Criteria |
|---|---|
| كمستخدم هندسة إنتاج، أريد إنشاء Work Definition لمنتج، بحيث أحدد العمليات والمواد والموارد وموقع الإكمال. | يمكن ربط Item Structure؛ لا يسمح باعتماد تعريف بلا Operations؛ يتم حفظ Version وEffective Dates. |
| كمشرف إنتاج، أريد إنشاء Work Order بناءً على منتج وكمية، بحيث يقوم النظام بجلب Work Definition النشطة ونسخ العمليات والمواد والموارد. | الأمر ينشأ بحالة Unreleased؛ يتم نسخ السطور؛ يظهر خطأ إذا لا يوجد Work Definition. |
| كمشرف إنتاج، أريد Release Work Order حتى يصبح جاهزًا للتنفيذ. | لا يتم Release إذا البيانات ناقصة؛ يظهر الأمر في Dispatch List؛ يسجل Status History. |
| كمستخدم مستودع، أريد صرف مواد إلى Work Order. | لا يسمح بالصرف إلا لأمر Released؛ ينقص المخزون؛ يزيد WIP؛ يحفظ Lot/Serial عند الحاجة. |
| كمستخدم مستودع، أريد إرجاع مواد زائدة من Work Order. | لا تتجاوز الكمية المرجعة المصروفة؛ يزيد المخزون؛ ينخفض WIP. |
| كمشغل إنتاج، أريد تسجيل Resource Charging لعملية. | يسجل resource usage؛ يزيد WIP؛ يظهر في تكلفة الأمر. |
| كمشرف إنتاج، أريد تسجيل Product Completion. | يزيد مخزون المنتج النهائي؛ يسجل تكلفة مؤقتة؛ يدعم الإكمال الجزئي. |
| كمشرف جودة، أريد تسجيل Scrap أو Reject. | يحفظ السبب والكمية؛ يرتبط بالأمر أو العملية؛ يظهر في التقارير. |
| كمشرف جودة، أريد تسجيل Quality Exception. | يرتبط بـ Work Order/Operation؛ له حالة؛ قد يمنع الإكمال أو الإتاحة حسب السياسة. |
| كمحاسب تكاليف، أريد إغلاق Work Order. | لا يسمح مع Pending Transactions؛ يحسب التكلفة الفعلية؛ يغلق WIP؛ يولد Variances. |
| كمحاسب تكاليف، أريد عرض WIP للأوامر المفتوحة. | يظهر WIP حسب Work Order وItem وPeriod؛ يميز مواد وموارد إن أمكن. |
| كمحاسب تكاليف، أريد عرض Cost Distributions. | تظهر حسب الحركة والأمر؛ يمكن مراجعتها قبل GL Transfer. |
| كمدير إنتاج، أريد عرض Variances. | تظهر حسب النوع والمصدر؛ تدعم تحسين Work Definition والتنفيذ. |
| كمدير مالي، أريد تقرير تكلفة Work Order. | يعرض مواد، موارد، هالك، WIP، تكلفة فعلية، وانحرافات. |
| كمحاسب، أريد Period Close Review. | يعرض Unclosed Work Orders وPending Transactions وOpen WIP وGL Transfer status. |

---

## 28. نموذج Functional Requirement Specification

| الحقل | الوصف |
|---|---|
| رقم المتطلب | معرف فريد مثل PROD-FR-001 |
| اسم المتطلب | اسم مختصر |
| الوصف الوظيفي | ماذا يجب أن يفعل النظام؟ |
| المستخدمون | الأدوار المعنية |
| المدخلات | البيانات المطلوبة |
| المعالجة | منطق النظام |
| المخرجات | السجلات والحركات والتقارير |
| Business Rules | قواعد العمل |
| Validations | شروط التحقق |
| Exceptions | الحالات الاستثنائية |
| Inventory Impact | أثر المخزون |
| WIP Impact | أثر WIP |
| Costing Impact | أثر التكلفة |
| Cost Distribution Impact | أثر التوزيعات |
| Reports | التقارير ذات العلاقة |
| Audit | ما يجب تسجيله |
| Priority | حرجة / عالية / متوسطة / منخفضة |

### مثال مكتمل: Material Issue against Work Order

| الحقل | القيمة |
|---|---|
| رقم المتطلب | PROD-FR-010 |
| اسم المتطلب | Material Issue against Work Order |
| الوصف الوظيفي | تمكين المستخدم من صرف مادة إلى Work Order في حالة Released وربط الصرف بالأمر والعملية |
| المستخدمون | موظف مستودع، مشرف إنتاج |
| المدخلات | Work Order، Operation، Item، Quantity، Subinventory، Locator، Lot/Serial، User |
| المعالجة | التحقق من الحالة، التحقق من المادة والكمية والتوفر، تخفيض المخزون، إنشاء حركة صرف، زيادة WIP، تحفيز Cost Accounting Event |
| المخرجات | Material Issue Transaction، Inventory Transaction، WIP Impact، Cost Accounting Event |
| Business Rules | لا صرف على Unreleased أو Closed؛ Bulk لا يصرف فعليًا؛ Lot/Serial إلزامي عند الحاجة |
| Validations | كمية موجبة، توفر مخزون، Lot غير منتهي إذا المنع مفعل |
| Exceptions | نقص مخزون، Lot خطأ، مادة غير مرتبطة، فشل Cost Accounting |
| Inventory Impact | تخفيض Raw Material/Subinventory |
| WIP Impact | زيادة WIP |
| Costing Impact | إضافة Material Cost للأمر |
| Cost Distribution Impact | إنشاء توزيع تكلفة لاحقًا حسب Cost Processor |
| Reports | Material Usage Report، WIP Report، Cost Distribution Report |
| Audit | المستخدم، الوقت، الكمية، المادة، Lot/Serial، القيم قبل/بعد |
| Priority | حرجة |

---

## 29. الحد الأدنى المطلوب لنظام ERP محلي

| الميزة | هل هي حد أدنى أم متقدمة؟ | لماذا؟ |
|---|---|---|
| تعريف منتج | حد أدنى | لا يوجد إنتاج دون صنف |
| Item Structure / BOM | حد أدنى | تحدد المواد |
| Work Order | حد أدنى | يمثل تنفيذ الإنتاج |
| Work Order Status Workflow | حد أدنى | يمنع الحركات الخاطئة |
| Material Issue | حد أدنى | يربط الإنتاج بالمخزون |
| Material Return | حد أدنى مهم | يعكس الصرف الزائد |
| Product Completion | حد أدنى | يدخل المنتج النهائي |
| إنتاج جزئي | حد أدنى مهم | أغلب المصانع تحتاجه |
| Scrap | حد أدنى مهم | لا إنتاج بلا هالك |
| Basic WIP أو بديل واضح | حد أدنى مالي | يمنع ضياع تكلفة تحت التشغيل |
| Basic Costing | حد أدنى | يحتاج العميل تكلفة المنتج |
| Work Order Close | حد أدنى | يحسم التكلفة والدورة |
| Work Order Cost Report | حد أدنى | رقابة تكلفة |
| Open Work Orders Report | حد أدنى | منع تراكم الأوامر |
| Material Usage Report | حد أدنى | رقابة مواد |
| Audit Log | حد أدنى | حوكمة العمليات الحساسة |

---

## 30. ميزات متقدمة يمكن تأجيلها

| الميزة | لماذا متقدمة؟ | متى تصبح ضرورية؟ |
|---|---|---|
| Full Oracle-style Work Definition | يجمع مواد وعمليات وموارد ومخرجات بإصدارات | مصانع متوسطة/كبيرة |
| Complex Alternate Work Definitions | إدارة طرق إنتاج متعددة | تعدد خطوط أو مصانع |
| Full Cost Distributions | طبقة مالية تحليلية متقدمة | عند تكامل مالي عميق |
| Full Subledger Automation | يحتاج إعداد محاسبي متقدم | عند ربط كامل مع GL |
| Advanced Period Close Automation | يحتاج عمليات مالية ناضجة | شركات كبيرة |
| Co-products / By-products | خاص بالتصنيع العملياتي | صناعات غذائية/كيماوية |
| Contract Manufacturing | تصنيع تعاقدي | شركات تعتمد موردين مصنعين |
| Outside Processing | عمليات خارجية | عند وجود خدمات تصنيع خارجية |
| Orderless Manufacturing | إنتاج بلا أمر | خطوط تدفق/Lean |
| Advanced Genealogy | تتبع كامل | صناعات منظمة أو حساسة |
| Advanced Quality | فحوصات واستثناءات متقدمة | شركات ذات رقابة جودة عالية |
| Advanced Variance Analysis | تحليل فروقات عميق | عند استخدام Standard Cost |
| Full Resource Capacity Model | جدولة وطاقات | عند تعقيد الموارد |
| Operator Check-in / Check-out | تتبع عمال تفصيلي | مصانع تحتاج MES-like control |

---

## 31. أخطاء يجب منعها عند شرح المتطلب للمبرمج

| الخطأ | النتيجة |
|---|---|
| شرح العملية كأنها شاشة فقط | نظام يعمل ظاهريًا ويفشل في الواقع |
| تجاهل حالة Work Order | حركات في وقت غير مناسب |
| تجاهل أثر المخزون | أرصدة غير صحيحة |
| تجاهل WIP | تكلفة تحت التشغيل غير مفهومة |
| تجاهل Cost Accounting | تكلفة لا تطابق المالية |
| عدم شرح أن Product Completion ليس التكلفة النهائية | قرارات مالية خاطئة |
| عدم ذكر Work Order Close | أوامر مفتوحة وتكلفة غير محسومة |
| عدم تحديد الحالات الاستثنائية | فشل عند أول حالة غير طبيعية |
| عدم تحديد الصلاحيات | عمليات حساسة مفتوحة للجميع |
| عدم تحديد هل العملية قابلة للتراجع | تصحيحات عشوائية |
| عدم تحديد التقارير المطلوبة | عدم قدرة على الرقابة |
| عدم إشراك المالية في التكلفة | رفض الأرقام بعد التشغيل |
| الخلط بين Manufacturing Transaction وCost Distribution | سوء تصميم الربط المالي |
| الخلط بين Completed وClosed | فهم خاطئ لنهاية الدورة |

---

## 32. ملخص تنفيذي للمبرمجين

- الإنتاج ليس شاشة Work Order فقط.
- Work Definition هي قالب الإنتاج.
- Work Order هو التنفيذ.
- الحالة تتحكم بما يسمح وما يمنع.
- Material Issue ينقص المخزون ويزيد WIP.
- Resource Charging يزيد WIP وتكلفة الأمر.
- Product Completion يدخل المنتج النهائي لكنه لا يحسم التكلفة النهائية.
- Work Order Close يحسب الفعلي، يغلق WIP، وينتج Variances.
- Cost Accounting يحوّل الأحداث إلى Cost Distributions.
- Subledger / GL هي نهاية الأثر المالي.
- Edge Cases أهم من السيناريو الطبيعي.
- لا يمكن بناء نظام إنتاج صحيح دون Business Rules وValidations وAudit وReports.
