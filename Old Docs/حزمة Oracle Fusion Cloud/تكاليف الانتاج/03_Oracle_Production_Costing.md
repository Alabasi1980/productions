# 03_Oracle_Production_Costing.md
# تكلفة الإنتاج والربط المالي في Oracle Fusion Cloud Manufacturing

## 1. مقدمة

تكلفة الإنتاج في Oracle Fusion Cloud Manufacturing ليست رقمًا واحدًا ولا نتيجة صرف مواد فقط. هي نتيجة مترابطة بين **Work Definition** التي تحدد طريقة الإنتاج، و**Work Order** الذي يمثل التنفيذ، وحركات **Material Issue** و**Resource Charging** و**Product Completion** و**Scrap**، ثم معالجة هذه الحركات داخل **Cost Accounting** وصولًا إلى **Cost Distributions** و**Variances** عند **Work Order Close**.

الفكرة الأساسية في Oracle أن الإنتاج لا يرحّل مباشرة إلى الأستاذ العام. هناك فصل واضح بين:

| الطبقة | معناها |
|---|---|
| Manufacturing Execution | تنفيذ الإنتاج: صرف مواد، تسجيل موارد، إكمال منتج، هالك |
| Inventory Transaction | الأثر المخزني الناتج عن التنفيذ |
| Cost Accounting | تسعير الحركات وحساب WIP والتكلفة والانحرافات |
| Cost Distribution | التوزيع المحاسبي التفصيلي للحركة بعد تسعيرها |
| Subledger Accounting | تحويل التوزيعات إلى قيود محاسبية حسب قواعد SLA |
| General Ledger | دفتر الأستاذ العام بعد الترحيل |

هذا الفصل مهم جدًا للمستشار الوظيفي؛ لأن خطأ في Work Definition أو Supply Type أو Resource Rate لا يظهر فقط في شاشة الإنتاج، بل يظهر في WIP، تكلفة المنتج، الانحرافات، وتقارير الإقفال.

---

## 2. الفكرة الأساسية لتكلفة الإنتاج في Oracle

الفكرة العامة كما يعرضها المقال:

1. يتم تعريف طريقة الإنتاج في **Work Definition**.
2. يُنشأ **Work Order** من Work Definition.
3. تُصرف المواد إلى الأمر عبر **Material Issue**.
4. صرف المواد يزيد **WIP**.
5. تُسجّل العمالة أو الآلات عبر **Resource Charging**.
6. تسجيل الموارد يزيد **WIP**.
7. عند **Product Completion** يدخل المنتج النهائي المخزون بتكلفة تقديرية أو مؤقتة.
8. عند **Work Order Close** تُحسب التكلفة الفعلية وتُسوّى WIP وتظهر الانحرافات.
9. **Cost Accounting** هو المسؤول عن تسعير الحركات وإنشاء Cost Distributions.
10. **Subledger Accounting** يحوّل Cost Distributions إلى قيود قابلة للترحيل إلى **General Ledger**.

```text
Work Definition
→ Work Order
→ Material Issue
→ WIP
→ Resource Charging
→ Product Completion
→ Finished Goods Inventory
→ Work Order Close
→ Cost Distributions / Variances
→ Subledger Accounting
→ General Ledger
```

| المرحلة | الفكرة التكلفية | الأثر |
|---|---|---|
| Work Definition | تعريف المواد والعمليات والموارد | أساس حساب التكلفة |
| Work Order | تطبيق Work Definition على كمية محددة | يصبح الأمر Cost Object |
| Material Issue | صرف مكونات للطلب | يزيد WIP ويخفض مخزون المواد |
| Resource Charging | تسجيل عمالة أو آلة | يزيد WIP بتكلفة المورد |
| Product Completion | إيداع المنتج النهائي | يزيد مخزون المنتج النهائي ويخفض WIP بتكلفة مؤقتة |
| Work Order Close | إغلاق التكلفة | يحسب الفعلي والانحرافات ويسوّي WIP |
| Cost Distributions | توزيع أثر الحركات | أساس الترحيل المحاسبي |
| SLA / GL | ترحيل محاسبي | يظهر الأثر في الدفاتر |

---

## 3. دور Work Definition في تكلفة الإنتاج

**Work Definition** في Oracle ليست BOM فقط، بل كيان يجمع هيكل المنتج، العمليات، الموارد، المخرجات، الأولويات، الإصدارات، وتفاصيل الإكمال. لذلك فهي أساس تكلفة الإنتاج.

| عنصر Work Definition | أثره على التكلفة |
|---|---|
| المنتج النهائي | يحدد الصنف الذي سيتم تقييم تكلفة إنتاجه |
| Item Structure / BOM | يحدد المواد التي تدخل في التكلفة |
| Operation Items | يحدد في أي عملية تُستهلك المواد |
| Operations | تحدد مراحل الإنتاج التي يمكن تسجيلها ومحاسبتها |
| Operation Resources | تحدد الموارد التي يمكن تحميل تكلفتها على WIP |
| Operation Outputs | في Process Manufacturing تحدد المخرجات الأساسية والمشتركة والثانوية |
| Completion Subinventory / Locator | يحدد أين يدخل المنتج النهائي عند الإكمال، ما يؤثر على حركة المخزون والتقييم |
| Primary Work Definition | تستخدم عادة كتعريف أساسي للتخطيط والإنتاج |
| Alternate Work Definition | تمثل مسارًا أو مواد أو موارد بديلة وقد تؤثر على التكلفة |
| Work Definition Version | يضمن أن التكلفة والحركات مرتبطة بإصدار صحيح في تاريخ صحيح |
| Effective Start / End Date | يمنع استخدام تعريف غير صالح زمنيًا |
| Production Priority | توجه اختيار Work Definition للإنتاج |
| Costing Priority | توجه اختيار Work Definition لأغراض Cost Rollup |
| Operation Yield | يؤثر على حساب الفاقد المتوقع والتكلفة |
| Serial Tracking | يفرض تتبعًا أدق للمواد والموارد والمنتج النهائي عند الحاجة |

### لماذا لا تكفي BOM وحدها لفهم تكلفة Oracle؟

في أنظمة بسيطة، تكلفة المنتج قد تُفهم من BOM فقط: مواد × أسعار. في Oracle هذا غير كافٍ؛ لأن تكلفة الإنتاج تشمل:

- مواد من Item Structure.
- عمليات من Work Definition.
- موارد من Work Centers.
- Resource Rates من Cost Scenario.
- Overhead على مستوى المصنع أو مركز العمل.
- Scrap وOperation Yield.
- Product Completion بتكلفة مؤقتة قبل الإغلاق.
- Variances عند Work Order Close.

لذلك، **BOM تحدد جزء المواد فقط**، بينما Work Definition تحدد منطق التصنيع الكامل الذي تعتمد عليه التكلفة.

---

## 4. مكونات تكلفة الإنتاج في Oracle

### 4.1 Material Cost

تكلفة المواد تأتي من المكونات المرتبطة بـ Work Definition / Item Structure، وتظهر فعليًا عند صرف المواد إلى Work Order.

العوامل المؤثرة:

- كمية المادة في Operation Item.
- كمية Work Order.
- Supply Type.
- Material Issue الفعلي.
- Component Return.
- استخدام مادة بديلة خارج Work Definition.
- Lot / Serial عند الحاجة للتتبع، خصوصًا عند ربط المكونات بالمنتج النهائي.

### 4.2 Resource Cost

تكلفة الموارد تأتي من تسجيل استخدام العمالة أو الآلات. في Oracle تُسعّر Resource Transactions بناءً على Resource Cost المنشور إلى Cost Accounting ضمن Cost Scenario.

العوامل المؤثرة:

- Resource Usage.
- Resource Rate.
- Manual أو Automatic Resource Charging.
- Check-in / Check-out في Workstation عند استخدامه.
- Utilization وEfficiency للموارد في الجدولة والتقدير.

### 4.3 Overhead Cost

المقال يذكر نوعين رئيسيين:

| نوع Overhead | الأساس |
|---|---|
| Plant Overhead | يُمتص على أساس تكلفة المواد، Fixed أو Percentage |
| Work Center Overhead | يُمتص على أساس معدل ثابت أو نسبة من تكلفة المورد في مركز العمل |

Overhead Rates تكون **Date-effective** ويمكن تعريفها حسب Inventory Organization أو Item Category أو Item. وتُطبّق فقط إذا تم **Cost Rollup** للمنتج.

### 4.4 Scrap Cost

الهالك يظهر كـ Scrap Transaction أو Estimated Scrap بناءً على Operation Yield. يمكن أن:

- يُحمّل على تكلفة المنتج الجيد إذا كان Operation Scrap Accounting = Include in Inventory.
- يُرحّل كمصروف إذا كان Operation Scrap Accounting = Expense.
- يُعاد احتسابه عند Work Order Close.
- ينتج WIP Scrap Cost Adjustment إذا تغيرت قيمة الهالك بين التسجيل والإغلاق.

### 4.5 Product Completion Cost

عند Product Completion، لا تكون تكلفة المنتج نهائية دائمًا. المقال يذكر أن كل Product Completions تُسعّر بتكلفة تقديرية كـ **Provisional Completions**، وتُحسب التكلفة الفعلية عند Work Order Close.

| مكوّن التكلفة | مصدره في Oracle | متى يظهر؟ | أثره على WIP | أثره المحاسبي |
|---|---|---|---|---|
| Material Cost | Operation Items / Item Structure | عند Material Issue | يزيد WIP | يُنشئ Cost Distribution بعد التسعير |
| Resource Cost | Resource Usage × Resource Rate | عند Resource Charging | يزيد WIP | يُمتص كتكلفة مورد |
| Overhead Cost | Plant / Work Center Overhead Rates | عند تطبيق قواعد التكلفة | يزيد WIP أو تكلفة المنتج حسب القاعدة | يعتمد على Cost Accounting |
| Scrap Cost | Scrap Transaction / Operation Yield | عند الهالك أو الإغلاق | يخفض أو يعيد توزيع WIP حسب السياسة | قد يظهر كمصروف أو ضمن تكلفة المنتج |
| Product Completion Cost | Provisional Completion Option | عند إكمال المنتج | يخفض WIP مبدئيًا | يرفع Finished Goods Inventory بتكلفة تقديرية |
| Actual Work Order Cost | الحركات الفعلية عند Close | عند الإغلاق | يسوّي WIP | ينتج Adjustments أو Variances |

---

## 5. Cost Accounting في Oracle

**Cost Accounting** هو الطبقة التي تفصل بين تنفيذ الإنتاج والترحيل المحاسبي. Manufacturing ينتج أحداثًا وحركات، لكن Cost Accounting هو الذي يلتقطها، يسعّرها، ويحوّلها إلى Cost Distributions.

### لماذا لا يرحّل Manufacturing مباشرة إلى General Ledger؟

لأن Oracle يفصل بين:

- الحركة التشغيلية: ماذا فعل العامل أو المخزن؟
- الحركة المخزنية: ما الذي زاد أو نقص في المخزون؟
- الحدث التكلفي: ما قيمة الحركة؟
- التوزيع المحاسبي: كيف تُترجم القيمة إلى حسابات؟
- القيد النهائي: كيف يظهر في GL عبر Subledger Accounting؟

هذا يمنع الخلط بين التنفيذ والمحاسبة ويعطي المحاسب فرصة لمراجعة Cost Distributions وPeriod Close.

| المفهوم | الشرح | دوره في دورة التكلفة |
|---|---|---|
| Cost Accounting | طبقة تسعير وتحليل تكلفة الحركات | تحول الحركات إلى أثر مالي قابل للمراجعة |
| Cost Processor | المعالج الذي يسعر الحركات ويحسب الانحرافات والتسويات | أساس إنتاج Cost Distributions |
| Cost Accounting Event | حدث تكلفة ناتج عن حركة إنتاج أو مخزون | يربط التنفيذ بالتكلفة |
| Cost Distribution | توزيع محاسبي تفصيلي للحركة المسعّرة | أساس Subledger Accounting |
| Subledger Accounting | طبقة تكوين القيود بناءً على قواعد محاسبية | تحول Cost Distributions إلى Accounting Entries |
| General Ledger | دفتر الأستاذ العام | يستقبل القيود بعد SLA |
| Transfer Transactions to Costing | عملية نقل الحركات إلى Cost Accounting | بدونها تبقى الحركات غير مسعّرة |
| Create Cost Accounting Distributions | عملية إنشاء التوزيعات | تنتج أثر التكلفة والقيود المفهومية |

```text
Manufacturing Transaction
→ Inventory Transaction
→ Cost Accounting Event
→ Cost Distribution
→ Subledger Accounting
→ General Ledger
```

---

## 6. Inventory Transactions وعلاقتها بالتكلفة

كل حدث إنتاجي مهم في Oracle له حركة مخزون أو أثر تكلفة مرتبط به.

| الحركة | الأثر المخزني | أثر WIP | أثر Cost Accounting | ملاحظات |
|---|---|---|---|---|
| Material Issue | ينقص Supply Subinventory للمواد | يزيد WIP | يتم تسعير WIP Material Issue | يرتبط بـ Supply Type وLot/Serial عند الحاجة |
| Material Return | يزيد مخزون المواد | يخفض WIP | يعكس حركة الصرف الأصلية | يجب ربطه بالحركة أو الأمر الصحيح |
| Product Completion | يزيد Finished Goods Inventory | يخفض WIP بتكلفة تقديرية | يُسعّر كـ Provisional Completion | الفعلي يحسم عند Close |
| Product Return | يعكس Product Completion | يعيد الأثر إلى WIP أو يعكس الإكمال | يحتاج تحقق إضافي من المصدر الأصلي | مذكور كنوع حركة، تفاصيله تحتاج تحقق |
| Scrap | يخفض WIP أو يعيد توزيع التكلفة | يعتمد على سياسة Scrap | يُسعّر كحدث Scrap أو عند Close | قد يكون Expense أو Include in Inventory |
| Resource Charging | لا يغير المخزون مباشرة | يزيد WIP | يسعر Usage × Rate | أثره مالي/تكلفي لا مخزني مباشر |
| WIP Adjustment | تسوية WIP | يزيد أو يخفض WIP حسب الحالة | يظهر عند Close أو تعديلات التكلفة | يحتاج تحقق إضافي من المصدر الأصلي |
| Lot / Serial Transactions | لا تغير المنطق المالي وحدها | تعزز التتبع | تربط الكلفة بالدفعات أو السيريالات عند الحاجة | مهمة للتتبع والجودة |

---

## 7. Work in Process — WIP

**WIP** في Oracle هو قيمة المنتجات تحت التشغيل. يمثل تكلفة المواد والموارد والأوفرهيد والهالك التقديري التي تم تحميلها على Work Order قبل تحويلها بالكامل إلى Finished Goods أو تسويتها عند Close.

### كيف يزيد WIP؟

- Material Issue.
- Resource Charging.
- Overhead Absorption.
- Estimated Scrap Absorption عند وجود Operation Yield.

### كيف ينخفض WIP؟

- Material Return.
- Resource Reversal.
- Product Completion.
- Scrap Expense حسب السياسة.
- Work Order Close.

```text
Material Issue
→ Increase WIP

Resource Charging
→ Increase WIP

Product Completion
→ Move cost toward Finished Goods

Work Order Close
→ Finalize actual cost / Clear WIP / Calculate Variances
```

| الحدث | أثره على WIP | أثره المالي |
|---|---|---|
| Material Issue | يزيد WIP بقيمة المواد | انخفاض Raw Material Inventory كمفهوم |
| Resource Charging | يزيد WIP بقيمة الاستخدام | امتصاص تكلفة الموارد |
| Overhead Absorption | يزيد WIP أو تكلفة المنتج حسب القاعدة | امتصاص تكلفة غير مباشرة |
| Estimated Scrap | يزيد WIP مقابل Estimated Scrap Absorption | المقال يذكر Debit WIP / Credit Estimated Scrap Absorption |
| Material Return | يخفض WIP | يعكس جزءًا من الصرف |
| Product Completion | يخفض WIP مؤقتًا | يزيد Finished Goods Inventory بتكلفة تقديرية |
| Scrap Expense | يخفض WIP | يذهب إلى Expense حسب السياسة |
| Work Order Close | يسوي WIP | يحسب Actual / Variances / Adjustments |

### مخاطر WIP غير المراجع

| الخطر | الأثر |
|---|---|
| أوامر عمل مفتوحة لفترة طويلة | WIP متضخم وغير واضح |
| Product Completion دون Close | تكلفة المنتج النهائي تبقى تقديرية |
| حركات معلقة | تمنع Close أو تؤخر التكلفة |
| Material Issue دون Completion | WIP يزيد دون تحويل إلى منتج |
| تأخير Close إلى فترة لاحقة | التكلفة والانحرافات تظهر في فترة غير فترة الإكمال |

---

## 8. Product Completion Cost

**Product Completion** هو إدخال المنتج النهائي إلى المخزون بعد إكمال كمية من Work Order. في Oracle يتم ذلك عادة عند العملية الأخيرة، إلى **Completion Subinventory / Locator** المحدد في Work Definition أو Operation Output في Process Manufacturing.

### لماذا التكلفة تقديرية قبل Close؟

حسب المقال: كل Product Completion يُسعّر بتكلفة تقديرية كـ **Provisional Completion Cost**، ثم يتم حساب التكلفة الفعلية عند Work Order Close. السبب أن كل عناصر التكلفة الفعلية قد لا تكون اكتملت وقت الإكمال، مثل:

- مواد إضافية أو مرتجعات.
- Resource Charging لاحق.
- Scrap.
- Adjustments.
- Variances.
- حركات تكلفة معلقة.

| البند | قبل Close | بعد Close |
|---|---|---|
| تكلفة Product Completion | Provisional / Estimated | Actual أو Adjusted |
| WIP | قد يبقى رصيد مفتوح | يُسوّى أو يُغلق |
| Finished Goods Inventory | يزيد بتكلفة تقديرية | يُعدّل إذا لزم |
| Variances | غير نهائية | تظهر عند Close خاصة في Standard Cost |
| Product Cost Adjustment | غير محسوم | يظهر في Actual / Average عند الفرق |
| Period Accuracy | معرضة للتشوه إذا تأخر Close | تصبح أوضح بعد الإغلاق |

### الإنتاج الجزئي وUndercompletion

- Oracle يدعم Product Completion جزئيًا على دفعات.
- كل دفعة Product Completion مستقلة وتُسعّر مؤقتًا.
- Undercompletion Tolerance يسمح بإغلاق أمر بكمية أقل ضمن تسامح محدد.
- يحتاج المستشار إلى ضبط سياسة العميل: متى نقبل إغلاق أمر ناقص؟ ومن يوافق؟

---

## 9. Work Order Close والتكلفة الفعلية

**Work Order Close** هو الحدث الأهم في تكلفة الإنتاج. هو ليس إجراءً إداريًا فقط، بل حدث تكلفة ومحاسبة.

### لماذا هو حدث مالي؟

عند Close:

1. يتأكد Cost Processor أن كل الحركات الخاصة بالأمر عولجت.
2. تُحسب التكلفة الفعلية لأمر العمل.
3. تُسوّى WIP.
4. تظهر Variances في Standard Cost.
5. تظهر Product Cost Adjustments في Actual / Perpetual Average.
6. تُعاد معالجة Scrap Cost.
7. يُمنع التعديل على الأمر بعد Closed.

### أثر Close على الفترة المحاسبية

المقال يوضح أن عدم إغلاق أوامر العمل قد يؤدي إلى إنشاء Product Cost Adjustments أو Variances في فترة مختلفة عن فترة Product Completion. هذا خطر مالي مهم؛ لأن تكلفة المنتج قد تظهر في فترة ومبيعاته أو إكماله في فترة أخرى، مما يشوه الهامش.

### Checklist قبل إغلاق Work Order

| بند التحقق | لماذا مهم للتكلفة؟ | الخطر إذا لم يتحقق |
|---|---|---|
| المواد المصروفة | لضمان أن WIP يعكس الاستهلاك الحقيقي | تكلفة ناقصة أو زائدة |
| المرتجعات | لإزالة المواد الزائدة من WIP | WIP متضخم |
| الموارد المسجلة | لضمان تحميل العمالة والآلات | تكلفة تشغيل ناقصة |
| العمليات المكتملة | للتأكد من أن التنفيذ اكتمل فعليًا | Close قبل اكتمال التشغيل |
| المنتج المكتمل | لمطابقة الكمية المنتجة مع الأمر | انحراف Yield أو Quantity غير مفهوم |
| الهالك | لضبط Scrap Cost | تحميل خاطئ على المنتج أو المصروف |
| الجودة | لمنع إغلاق أمر عليه Reject/Rework غير محسوم | تكلفة غير نهائية |
| الحركات المعلقة | Oracle لا يغلق إذا توجد Pending Transactions | فشل Close أو تأخير Period Close |
| WIP | لمراجعة الرصيد قبل التسوية | WIP غير منطقي |
| Cost Distributions | للتأكد من أن الحركات سُعّرت | أرقام مالية غير مكتملة |
| Period | لضمان تطابق فترة Completion وClose قدر الإمكان | انحرافات في فترة خاطئة |
| الصلاحيات | لأن Close نقطة حوكمة | إغلاق خاطئ أو غير معتمد |

---

## 10. Cost Distributions

**Cost Distribution** هو التمثيل التكلفي/المحاسبي للحركة بعد تسعيرها. لا يساوي الحركة التشغيلية نفسها؛ فالعامل قد يسجل Material Issue، لكن Cost Distribution هو ما ينتجه Cost Accounting بعد تسعير هذا الصرف وتوزيعه على عناصر التكلفة.

### لماذا مهم؟

- يربط Work Order بالحركة المالية.
- يسمح بتتبع الأثر من GL إلى Cost Distribution إلى Work Order.
- يكشف إن كانت الحركات غير مسعّرة أو معلقة.
- يدعم Period Close ومراجعة WIP.
- يغذي Subledger Accounting.

| الحدث | نوع Cost Distribution المتوقع كمفهوم | لماذا مهم؟ |
|---|---|---|
| Material Issue | توزيع تكلفة مواد إلى WIP | يثبت أثر صرف المواد |
| Material Return | عكس توزيع الصرف | يزيل تكلفة مواد زائدة |
| Resource Charging | توزيع Resource Cost إلى WIP | يثبت تكلفة العمالة/الآلة |
| Resource Reversal | عكس تكلفة المورد | يصحح تسجيل موارد خاطئ |
| Product Completion | توزيع تكلفة تقديرية إلى Finished Goods | يثبت إدخال المنتج النهائي |
| Product Return | عكس Product Completion | يحتاج تحقق إضافي من المصدر الأصلي |
| Scrap | توزيع تكلفة الهالك حسب السياسة | يقرر هل الهالك Expense أم ضمن المنتج |
| Work Order Close | Variances أو Adjustments | يحسم التكلفة النهائية |
| WIP Adjustment | تسوية رصيد WIP | مهم عند تغير التكاليف أو الإغلاق |

إذا احتاج العميل إلى قيود تفصيلية لكل Distribution، فهذا يعتمد على إعدادات Oracle Cost Accounting وSubledger Accounting، ويحتاج تحقق إضافي من المصدر الأصلي.

---

## 11. Cost Methods / Cost Profiles / Cost Books

| المفهوم | الشرح | أثره على تكلفة الإنتاج |
|---|---|---|
| Standard Cost | تكلفة محددة مسبقًا عبر Cost Rollup | الفروق تظهر كـ Variances |
| Perpetual Average / Average Cost | متوسط متحرك أو دائم حسب الحركات | التكلفة تتغير مع الحركات وتظهر Product Cost Adjustments |
| Actual Cost | تكلفة فعلية/طبقية للحركات | يعكس تكلفة الحركات الفعلية ويتطلب معالجة دقيقة |
| Periodic Average | متوسط الفترة بشكل تكراري | يحتاج تحقق إضافي من المصدر الأصلي |
| Cost Method | طريقة تقييم التكلفة | تحدد كيف تُسعّر الحركات والانحرافات |
| Cost Profile | يحدد Cost Method وValuation Structure وProvisional Completion Option وScrap Accounting | من أهم إعدادات تكلفة الصنف |
| Cost Organization | كيان محاسبي للتكلفة يضم منظمات مخزون | يحدد نطاق حساب التكلفة |
| Cost Book | سجل تكلفة مثل Primary أو Secondary أو Statutory | يسمح بأكثر من منظور تكلفة |
| Cost Element | عنصر تكلفة مثل Material / Resource / Overhead | يبني تفصيل تكلفة المنتج |
| Cost Component Group | مجموعة Cost Components تُنسق إلى Cost Element | ينظم تفصيل عناصر التكلفة |
| Valuation Unit | مستوى تفصيل التقييم | قد يكون على مستوى صنف أو Lot أو Subinventory حسب الإعداد |
| Cost Scenario | حاوية Resource Rates وOverhead Rates للـ Standard Cost | أساس Cost Rollup |
| Cost Rollup | تجميع تكلفة المواد والموارد والأوفرهيد | ينتج Standard Cost أو تكلفة مخططة |
| Provisional Completion Option | خيار تسعير Product Completion قبل Close | يؤثر على تكلفة Finished Goods المؤقتة |

### مقارنة مختصرة

| البند | Standard Cost | Average Cost | Actual Cost |
|---|---|---|---|
| الفكرة | تكلفة محددة مسبقًا | متوسط يتأثر بالحركات | تكلفة فعلية للحركات |
| متى يناسب؟ | عندما تكون طريقة الإنتاج مستقرة والتكلفة معيارية | يحتاج تحقق إضافي من المصدر الأصلي | عندما يراد تتبع التكلفة الفعلية بدقة |
| أثره على Variances | ينتج Variances عند Close | غالبًا تظهر Adjustments بدل Variances القياسية | تظهر Product Cost Adjustments بدل Variances القياسية |
| المخاطر | Standard غير محدث ينتج انحرافات غير واقعية | يحتاج تحقق إضافي من المصدر الأصلي | تعقيد أعلى وحساسية للحركات غير المكتملة |

---

## 12. Standard Cost vs Actual Cost في Oracle

### Standard Cost

في Standard Cost، يتم تحديد تكلفة معيارية مسبقًا عبر Cost Rollup. عند التنفيذ الفعلي، يقارن Oracle ما حدث فعليًا بما يفترضه Work Definition وStandard Cost.

ينتج عن ذلك:

- Material Rate Variance.
- Material Usage Variance.
- Material Substitution Variance.
- Resource Rate Variance.
- Resource Efficiency / Usage Variance.
- Yield Variance.
- Job Close Variance.

هذا المنهج يحتاج Work Definition دقيقة، مواد صحيحة، Resource Rates صحيحة، وOverhead Rates مضبوطة.

### Actual Cost

في Actual Cost، يتم الاعتماد على تكلفة الحركات الفعلية. المقال يذكر أن Product Completion يكون مؤقتًا قبل Close، ثم تُحسب التكلفة الفعلية عند Work Order Close وتظهر Product Cost Adjustments إذا لزم.

| البند | Standard Cost | Actual Cost |
|---|---|---|
| مصدر التكلفة | Cost Rollup / Standard Cost | الحركات الفعلية والمعالجة عند Close |
| توقيت الحساب | قبل التنفيذ كمعيار، ثم مقارنة عند Close | يتضح فعليًا عند Close |
| علاقة WIP | WIP يقارن بالمعيار عند الإغلاق | WIP يُسوّى إلى التكلفة الفعلية |
| علاقة Variances | تظهر Variances واضحة | تظهر Adjustments أكثر من Variances القياسية |
| المخاطر | معيار غير دقيق = Variances مضللة | حركات ناقصة أو Close متأخر = تكلفة غير نهائية |

---

## 13. Variances في Oracle

الانحرافات في Oracle تظهر خصوصًا في Standard Cost عند إغلاق Work Order. هي ليست مشكلة محاسبية فقط، بل أداة لكشف خلل في التعريف أو التنفيذ.

| نوع الانحراف | السبب | ماذا يكشف؟ | من يراجعه؟ | الإجراء المحتمل |
|---|---|---|---|---|
| Material Rate Variance | السعر المستخدم في Rollup يختلف عن سعر حركة الصرف | مشكلة أسعار مواد أو Cost Rollup | محاسب التكلفة | مراجعة Standard Cost أو أسعار الشراء |
| Material Usage Variance | الكمية الفعلية تختلف عن كمية Work Definition | استهلاك زائد/ناقص أو BOM غير دقيقة | الإنتاج + التكلفة | مراجعة Work Definition والصرف |
| Material Substitution Variance | استخدام صنف خارج Work Definition أو عدم استخدام صنف موجود | بدائل غير مضبوطة أو صرف خاطئ | الإنتاج + المستودعات | ضبط البدائل والصلاحيات |
| Resource Rate Variance | معدل المورد في Rollup يختلف عن معدل الحركة | Resource Rate غير محدث | محاسب التكلفة | تحديث Cost Scenario / Resource Rates |
| Resource Substitution Variance | استخدام مورد غير معرف أو إغفال مورد | تنفيذ مختلف عن Work Definition | الإنتاج | ضبط الموارد أو Work Definition |
| Resource Efficiency Variance | الاستخدام الفعلي يختلف عن المحدد | وقت تشغيل زائد/ناقص | الإنتاج + التكلفة | تحليل الكفاءة والتشغيل |
| Yield Variance | الإنتاج الفعلي يختلف عن المتوقع بناءً على Operation Yield | فاقد أو جودة أو إنتاج غير مطابق | الإنتاج + الجودة | مراجعة Yield وScrap |
| Batch Size Variance | اختلاف كمية الأمر للأصناف/الموارد Fixed Usage | تكلفة ثابتة موزعة على حجم مختلف | التكلفة + التخطيط | مراجعة أحجام الدُفعات |
| Job Close Variance | فرق متبقٍ غير مصنف أو في حالات Standard Cost اليدوي | فرق يحتاج تحليل | محاسب التكلفة | تحليل تفاصيل الأمر |
| Scrap Variance | اختلاف الهالك المسجل/المعاد احتسابه | سياسة هالك أو جودة | الجودة + التكلفة | مراجعة Scrap Method وYield |

### الانحرافات ليست مشكلة محاسبية فقط

الانحرافات تكشف مشاكل في:

- Work Definition غير دقيقة.
- Supply Type غير مضبوط.
- مواد بديلة غير مسموحة.
- Resource Rates غير محدثة.
- تسجيل موارد غير حقيقي.
- Operation Yield غير واقعي.
- Scrap غير مسجل بدقة.
- Close متأخر أو حركات معلقة.

---

## 14. Scrap وتأثيره على التكلفة

**Scrap** هو كمية تالفة أو مرفوضة لا يمكن استخدامها كمنتج جيد. في Oracle قد يظهر الهالك كـ Scrap Transaction أو Estimated Scrap بناءً على Operation Yield.

| نوع/حالة الهالك | الأثر التشغيلي | أثر WIP | أثر التكلفة |
|---|---|---|---|
| Scrap Transaction | تسجيل هالك فعلي في عملية | يخفض أو يعيد توزيع WIP حسب السياسة | قد يذهب إلى Expense أو يُحمّل على المنتج |
| Estimated Scrap | ناتج عن Operation Yield | يدبّن WIP ويقابل Estimated Scrap Absorption | يمتص الفاقد المتوقع في تكلفة الإنتاج |
| Scrap Expense | هالك يعامل كمصروف | يخفض WIP | لا يثقل تكلفة المنتج الجيد |
| Include in Inventory | هالك يُحمّل على المنتج الجيد | يبقى ضمن تكلفة المنتج | يزيد تكلفة الوحدات الجيدة |
| Rework | إصلاح منتج مرفوض | ينشئ تكلفة إضافية | له Work Order منفصل عند الحاجة |
| Reject | كمية مرفوضة | تتحول إلى Scrap أو Rework حسب القرار | تؤثر على التكلفة والجودة |

التفاصيل الدقيقة للحسابات تعتمد على **Operation Scrap Valuation** و**Operation Scrap Accounting** داخل Cost Profile، وتحتاج تحقق إضافي من المصدر الأصلي عند التطبيق العملي.

---

## 15. العلاقة بين Production Exceptions والتكلفة

الاستثناءات ليست حركات تكلفة دائمًا بحد ذاتها، لكنها تؤثر على التكلفة لأنها تسبب توقفًا، هالكًا، إعادة عمل، أو استخدام موارد إضافية.

| الاستثناء | أثره المحتمل على التكلفة | ملاحظة |
|---|---|---|
| Resource Exception | توقف آلة أو غياب عامل قد يزيد وقت التشغيل أو يؤخر Completion | قد يظهر كـ Resource Efficiency Variance |
| Material Exception | نقص مواد قد يؤخر الأمر أو يسبب بدائل | قد يظهر كـ Material Substitution أو Usage Variance |
| Production Exception | مشكلة عامة في Shop Floor | أثرها يعتمد على نوع المشكلة |
| Quality Issue | رفض أو فحص أو إعادة عمل | يؤثر على Scrap / Rework Cost |
| Maintenance-related Exception | عطل آلة يحتاج صيانة | قد يزيد توقف الموارد |
| Rework | تكلفة إضافية لإصلاح المنتج | قد يحتاج Work Order مستقل |
| Reject | كمية مرفوضة | قد تتحول إلى Scrap أو Rework |

استنتاج وظيفي مبني على منطق المقال: يجب ربط الاستثناءات بتقارير التكلفة، حتى لو لم تكن كل Exception تنتج Cost Distribution مباشرة.

---

## 16. العلاقة المالية والمحاسبية

> تنبيه: لا يجب اختراع قيود تفصيلية غير مذكورة. الحسابات النهائية تعتمد على إعدادات Oracle Cost Accounting وSubledger Accounting.

### 16.1 عند Material Issue

- ينخفض مخزون المواد كمفهوم.
- يزيد WIP بقيمة المواد المصروفة.
- Cost Accounting يسعر الحركة وينتج Cost Distribution.

### 16.2 عند Resource Charging

- لا يوجد أثر مخزني مباشر.
- يزيد WIP بتكلفة المورد.
- تكلفة المورد تأتي من Resource Rate المنشور.

### 16.3 عند Product Completion

- يزيد Finished Goods Inventory.
- ينخفض WIP بتكلفة تقديرية.
- التكلفة ليست نهائية قبل Close.

### 16.4 عند Scrap

- إما يذهب كمصروف.
- أو يُحمّل ضمن تكلفة المنتج الجيد.
- يعتمد على Operation Scrap Accounting.

### 16.5 عند Work Order Close

- تُحسب التكلفة الفعلية.
- يُغلق WIP.
- تظهر Variances أو Product Cost Adjustments.
- تُجهز Cost Distributions النهائية.

### 16.6 عند Subledger Accounting / GL Transfer

- Cost Distributions تُحوّل إلى قيود محاسبية عبر SLA.
- ثم تُرحّل إلى General Ledger.

| المرحلة | المدين كمفهوم | الدائن كمفهوم | ملاحظة |
|---|---|---|---|
| Material Issue | WIP | Raw Material Inventory | الحساب التفصيلي يعتمد على Cost Accounting/SLA |
| Resource Charging | WIP | Resource Absorption | مفهوم مستند للمقال |
| Overhead Absorption | WIP / Product Cost | Overhead Absorption / Expense Pool | يحتاج تحقق إضافي من المصدر الأصلي |
| Estimated Scrap | WIP | Estimated Scrap Absorption | مذكور صراحة كمفهوم في المقال |
| Product Completion | Finished Goods Inventory | WIP | بتكلفة تقديرية قبل Close |
| Scrap Expense | Scrap Expense | WIP | إذا كانت سياسة Scrap = Expense |
| Work Order Close — Standard | Variances | WIP أو حسابات مقابلة حسب SLA | لا تُخترع تفاصيل |
| Work Order Close — Actual/Average | Product Cost Adjustments | WIP / Inventory حسب الإعداد | يعتمد على Cost Method |
| GL Transfer | GL Accounts | GL Accounts | ينتج عبر SLA وليس مباشرة من Manufacturing |

---

## 17. Period Close والتكلفة

**Period Close** مرتبط مباشرة بجودة تكلفة الإنتاج. إذا بقيت أوامر عمل غير مغلقة أو حركات معلقة، قد تظهر الانحرافات أو Product Cost Adjustments في فترة غير فترة الإكمال.

| المشكلة | أثرها على Period Close | الإجراء المطلوب |
|---|---|---|
| Work Orders غير مغلقة | Variances أو Adjustments تظهر في فترة لاحقة | مراجعة Unclosed Work Orders |
| Pending Transactions | تمنع أو تؤخر Close | معالجة الحركات المعلقة |
| Product Completion في فترة وClose في فترة أخرى | هامش الفترة قد يتشوه | إغلاق الأوامر قريبًا من تاريخ الحركة |
| WIP مفتوح | رصيد أصول غير محسوم | مراجعة WIP Report |
| Cost Distributions غير مكتملة | أرقام GL غير مكتملة | تشغيل ومراجعة Cost Accounting Processes |
| SLA / GL Transfer غير منفذ | التكلفة لا تظهر في GL | تنفيذ Transfer / Accounting حسب الإعداد |

دور محاسب التكلفة هنا حاسم: مراجعة أوامر العمل، WIP، Pending Transactions، Cost Distributions، والانحرافات قبل الإقفال.

---

## 18. تقارير التكلفة والرقابة

| التقرير | المستخدم | فائدته | القرار الناتج |
|---|---|---|---|
| Work Order Cost Report | محاسب التكلفة / الإنتاج | تحليل تكلفة أمر العمل | هل التكلفة منطقية؟ |
| Cost Distribution Report | المحاسبة | تتبع التوزيعات من الحركة إلى الحساب | هل التوزيع صحيح؟ |
| WIP Report | محاسب التكلفة / المدير المالي | متابعة WIP المفتوح | هل توجد أوامر تحتاج Close؟ |
| Variance Report | محاسب التكلفة / مدير الإنتاج | تحليل الانحرافات | هل المشكلة مواد، موارد، Yield، أو أسعار؟ |
| Period Close Reports | المالية | التحقق قبل إقفال الفترة | هل الفترة جاهزة للإقفال؟ |
| Pending Transactions | التكلفة / الدعم | كشف الحركات غير المعالجة | ما الذي يمنع Close؟ |
| Unclosed Work Orders | الإنتاج / التكلفة | متابعة أوامر مكتملة غير مغلقة | ما الذي يجب إغلاقه؟ |
| Cost Accounting Review | محاسب التكلفة | مراجعة معالجة التكلفة | هل Cost Processor أنتج النتائج؟ |
| Material Usage Report | الإنتاج / التكلفة | مقارنة استهلاك المواد | هل Work Definition أو الصرف صحيح؟ |
| Resource Usage Report | الإنتاج / التكلفة | مقارنة استخدام الموارد | هل الكفاءة أو الوقت واقعي؟ |
| Lot / Serial Traceability Report | الجودة / التكلفة عند الحاجة | تتبع المواد والمنتج | تحليل تكلفة/جودة دفعة معينة |

---

## 19. مثال رقمي مبسط لتكلفة الإنتاج

المقال يحتوي مثالًا رقميًا مبسطًا لتكلفة منتج "X". فيما يلي إعادة تنظيمه فقط.

### معطيات الأمر

| العنصر | الكمية | التكلفة | الإجمالي |
|---|---:|---:|---:|
| مادة A | 2 كغ × 100 وحدة | 5 لكل كغ | 1,000 |
| مادة B | 1 لتر × 100 وحدة | 8 لكل لتر | 800 |
| عملية القص — آلة | 0.2 ساعة × 100 وحدة | 30 للساعة | 600 |
| عملية التجميع — عامل | 0.3 ساعة × 100 وحدة | 20 للساعة | 600 |
| Work Center Overhead | 50% من تكلفة مورد التجميع | — | 300 |
| Plant Overhead | 5% من تكلفة المواد | — | 90 |
| **الإجمالي** | — | — | **3,390** |
| **تكلفة الوحدة** | 100 وحدة | — | **33.90** |

### الأحداث

| الحدث | الأثر |
|---|---|
| Material Issue | يزيد WIP بقيمة المواد 1,800 |
| Resource Charging | يزيد WIP بقيمة الموارد 1,200 |
| Overhead | يضيف 390 إلى تكلفة الأمر |
| Product Completion | يدخل المنتج النهائي بتكلفة تقديرية |
| Work Order Close | يحسب التكلفة النهائية والانحرافات |

### الانحرافات المحتملة

| الفرق | نوع الانحراف المحتمل |
|---|---|
| Standard المرحّل = 33 وتكلفة الوحدة المحسوبة = 33.90 | Variance إجمالي 90 |
| صرف كمية مواد أكثر من Work Definition | Material Usage Variance |
| استخدام سعر مادة مختلف عن Rollup | Material Rate Variance |
| استخدام مورد أو وقت مختلف | Resource Variance |
| إنتاج فعلي مختلف عن المتوقع بسبب Yield | Yield Variance |

---

## 20. أسئلة تحليل العميل المتعلقة بتكلفة الإنتاج في Oracle

| المجال | السؤال | لماذا مهم؟ | أثر الإجابة على التصميم |
|---|---|---|---|
| سياسة التكلفة | هل تستخدمون Standard Cost أم Actual Cost أم Average؟ | يحدد طريقة التقييم والانحرافات | اختيار Cost Method وCost Profile |
| سياسة التكلفة | من يعتمد تكلفة المنتج؟ | التكلفة قرار مالي لا تشغيلي فقط | تحديد الصلاحيات |
| سياسة التكلفة | متى يتم تحديث التكلفة؟ | لتجنب أسعار قديمة | ضبط Cost Rollup وEffective Dates |
| Work Definition | هل طريقة الإنتاج ثابتة؟ | يحدد الحاجة لـ Primary/Alternate | تصميم Work Definitions |
| Work Definition | هل توجد Alternate Work Definitions؟ | قد تختلف التكلفة حسب المسار | ضبط Production/Costing Priority |
| Work Definition | هل تختلف Work Definition للتكلفة عن الإنتاج؟ | المقال يذكر Costing Priority | ضبط Cost Rollup |
| المواد | هل المواد لها تكلفة صحيحة؟ | مواد بدون تكلفة تشوه WIP | مراجعة Costing Enabled / Cost Profile |
| المواد | هل يوجد Lot / Serial؟ | مهم للتتبع وربط الدفعات | ضبط التتبع والحركات |
| المواد | هل توجد مواد بديلة؟ | تسبب Substitution Variance | ضبط قواعد البدائل |
| المواد | هل Supply Type مختلف لكل مادة؟ | يحدد توقيت الصرف | Push / Pull / Bulk / Phantom |
| الموارد | هل يتم تسجيل العمالة؟ | تؤثر على Resource Cost | تحديد Resource Charging |
| الموارد | هل يتم تسجيل الآلات؟ | تكلفة آلة قد تدخل المنتج | تعريف Resource Rates |
| الموارد | هل التسجيل يدوي أم تلقائي؟ | يؤثر على دقة التكلفة | ضبط Manual/Automatic |
| WIP | هل تريدون متابعة WIP؟ | WIP مركز تكلفة الإنتاج | تقارير وسياسات Close |
| WIP | هل توجد أوامر عمل مفتوحة نهاية الشهر؟ | خطر على Period Close | مراجعة Unclosed Orders |
| Product Completion | هل المنتج يدخل المخزون قبل Close؟ | Oracle يدعم Provisional Cost | قبول التكلفة المؤقتة |
| Close | متى تغلقون أوامر العمل؟ | يحسم التكلفة | سياسة Close |
| Close | من يغلق؟ | نقطة حوكمة مالية | صلاحيات |
| Variances | هل تريدون تحليل الانحرافات؟ | يحسن الإنتاج والتكلفة | تقارير Variance |

---

## 21. Checklist لتطبيق تكلفة الإنتاج في Oracle

| نقطة التحقق | لماذا مهمة؟ | المسؤول | الخطر إذا لم تتحقق |
|---|---|---|---|
| Items معرفة بشكل صحيح | أساس الحركات والتكلفة | PIM / Inventory | صنف غير قابل للتكلفة أو التتبع |
| Costing Enabled صحيح | يسمح بتسعير الصنف | Cost Accountant | حركات غير مسعرة |
| Inventory Asset Value صحيح | يحدد معاملة الصنف كأصل/مصروف | المالية | تقييم مخزون خاطئ |
| Work Definition جاهزة | أساس الإنتاج والتكلفة | Manufacturing Engineer | تكلفة غير مكتملة |
| Operations واضحة | تضبط التنفيذ والموارد | الإنتاج | صعوبة حساب Resource Cost |
| Resources معرفة | أساس Resource Charging | الإنتاج / التكلفة | تكلفة تشغيل ناقصة |
| Resource Rates واضحة | تسعير الموارد | Cost Accountant | Resource Variance غير منطقي |
| Supply Types صحيحة | تضبط توقيت الصرف | الإنتاج / المخازن | صرف خاطئ أو مفقود |
| Cost Method محدد | يحدد طريقة التقييم | المالية | معالجة تكلفة غير مناسبة |
| Cost Profile جاهز | يحدد منهج التكلفة والتقييم والهالك | Cost Accountant | Provisional Cost أو Scrap خاطئ |
| Cost Book محدد | سجل التكلفة | المالية | تقارير غير مكتملة |
| Cost Elements واضحة | تفصيل تكلفة المنتج | Cost Accountant | تحليل ضعيف |
| WIP سياسة واضحة | متابعة الإنتاج تحت التشغيل | المالية | WIP متضخم |
| Cost Accounting Processes واضحة | معالجة الحركات | Cost Accountant / IT | حركات غير مسعّرة |
| Product Completion منضبط | إدخال المنتج للمخزون | الإنتاج / المخازن | تكلفة تقديرية غير مفهومة |
| Work Order Close سياسة واضحة | حسم التكلفة | الإنتاج + التكلفة | Variances في فترة خاطئة |
| Variances معرفة | تحليل الفروق | Cost Accountant | لا يتم تحسين الإنتاج |
| Period Close Procedure واضح | إقفال مالي صحيح | المالية | تكلفة فترة غير دقيقة |
| تقارير التكلفة متفق عليها | رقابة ومتابعة | الإدارة / المالية | قرارات دون بيانات |
| UAT يشمل دورة تكلفة كاملة | اختبار واقعي | ERP Team | فشل بعد Go-Live |
| المالية وافقت على السيناريو | قبول محاسبي | CFO / Cost Accountant | رفض النتائج بعد التشغيل |

---

## 22. أخطاء ومخاطر تكلفة الإنتاج

| الخطر | أثره المالي | كيف نمنعه؟ |
|---|---|---|
| Work Definition خاطئة | تكلفة مواد/موارد غير صحيحة | اعتماد Work Definition ومراجعتها |
| Costing Priority غير مناسب | Cost Rollup على تعريف غير مناسب | مراجعة Primary/Alternate وCosting Priority |
| Supply Type خاطئ | صرف في توقيت خاطئ أو عدم صرف | اختبار Push/Pull/Bulk/Phantom |
| مواد بدون تكلفة | WIP أو Product Cost ناقص | مراجعة Costing Enabled وCost Profile |
| Resource Rates غير دقيقة | Resource Variances أو تكلفة خاطئة | تحديث Cost Scenario ونشر الأسعار |
| عدم تسجيل الموارد | تكلفة تشغيل ناقصة | ضبط Resource Charging |
| عدم تسجيل المرتجعات | WIP متضخم | إجراء Material Return عند الحاجة |
| Product Completion قبل اكتمال البيانات | Finished Goods بتكلفة مؤقتة مضللة | ضبط سياسة Completion وClose |
| تأخير Work Order Close | Variances/Adjustments في فترة خاطئة | متابعة Unclosed Work Orders |
| WIP غير دقيق | ميزانية غير موثوقة | WIP Report ومراجعة شهرية |
| Cost Distributions غير مراجعة | قيود غير صحيحة أو ناقصة | مراجعة Cost Accounting |
| Period Close قبل تسوية الإنتاج | تشوه تكلفة الفترة | Period Close Checklist |
| Variances لا تُراجع | تكرار أخطاء الإنتاج | Variance Review Meeting |
| SLA / GL Transfer غير مفهوم | عدم تطابق التكلفة مع GL | إشراك المالية |
| حركات معلقة تمنع الإغلاق | تعطيل Close وPeriod Close | Pending Transactions Report |

---

## 23. ماذا نستفيد من Oracle في نظام ERP محلي مثل ناتج؟

| درس من Oracle | كيف يمكن تطبيقه في ERP محلي؟ | الأولوية |
|---|---|---|
| لا يكفي صرف مواد واستلام منتج | بناء دورة إنتاج كاملة من تعريف إلى إغلاق | حرجة |
| فصل تعريف الإنتاج عن التنفيذ | BOM/Route أو Work Definition منفصلة عن Work Order | حرجة |
| وجود WIP أو بديل واضح | تسجيل قيمة تحت التشغيل أو تقرير بديل | عالية |
| ربط Material Issue بتكلفة الأمر | كل صرف يجب أن يرتبط بأمر إنتاج | حرجة |
| ربط Resource Usage بالتكلفة عند الحاجة | تسجيل ساعات/آلات للعملاء المتقدمين | متوسطة/عالية |
| Product Completion قد يكون تقديريًا | السماح بتكلفة مؤقتة ثم تسوية عند الإغلاق | عالية |
| Work Order Close ضروري | لا تترك أوامر مفتوحة بلا تسوية | حرجة |
| الفرق بين المتوقع والفعلي | تقارير Variance ولو مبسطة | عالية |
| Cost Distribution أو ما يعادلها | سجل تكلفة تفصيلي للحركات | عالية |
| إشراك المالية في التصميم | اعتماد القيود والمنطق قبل Go-Live | حرجة |
| لا تفرض Oracle كاملًا على عميل صغير | طبّق الحد الأدنى ثم التوسع | عالية |

---

## 24. ملخص تنفيذي

تكلفة الإنتاج في Oracle تعتمد على **Work Definition** و**Work Order Execution** معًا. المواد والموارد والهالك والأوفرهيد لا تصبح تكلفة موثوقة بمجرد إدخالها في شاشة، بل تمر عبر حركات مخزون وCost Accounting وCost Distributions.

أهم القواعد:

- **Material Issue** يزيد WIP ويخفض مخزون المواد.
- **Resource Charging** يزيد WIP بتكلفة العمالة أو الآلات.
- **Product Completion** يدخل المنتج النهائي بتكلفة تقديرية أو مؤقتة.
- **Work Order Close** يحسب التكلفة الفعلية، يغلق WIP، ويظهر Variances أو Adjustments.
- **Cost Accounting** هو الطبقة التي تحول أحداث الإنتاج إلى Cost Distributions.
- **Subledger Accounting وGeneral Ledger** هما نهاية الرحلة المحاسبية، وليس بداية العملية.
- أخطر مناطق الفشل: Work Definition، Supply Type، WIP، Work Order Close، Period Close، وCost Distributions.
- فهم تكلفة Oracle يعطي مستشار ERP نموذجًا قويًا لتصميم تكلفة إنتاج في أي نظام محلي، بشرط عدم نسخ التعقيد بالكامل إلا عند الحاجة.
