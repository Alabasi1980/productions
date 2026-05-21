# 06_Oracle_Reports_and_Controls.md
# تقارير ورقابة الإنتاج في Oracle Fusion Cloud Manufacturing


## 1. مقدمة

تقارير ورقابة الإنتاج في Oracle Manufacturing ليست مجرد مخرجات للطباعة، بل أدوات ضبط لدورة Work Order كاملة. التقرير الجيد يجب أن يجيب عن سؤال تشغيلي أو مالي واضح: هل أمر العمل جاهز؟ هل صُرفت المواد؟ هل سُجلت الموارد؟ هل اكتمل المنتج؟ هل بقي WIP؟ هل Cost Distributions جاهزة؟ وهل يمكن إغلاق الفترة دون تشويه مالي؟

يربط هذا الملف التقارير والرقابة بـ Work Orders، Dispatch List، Material Issue، Material Return، Resource Charging، Product Completion، Scrap / Rework / Reject، Quality / Exceptions، WIP، Cost Accounting، Cost Distributions، Variances، Work Order Close، Period Close، Pending Transactions، GL Transfer، Lot / Serial Traceability، وUAT / Go-Live.

> أي تقرير غير مذكور صراحة في المقال وتم اشتقاقه من منطق دورة Oracle وُسم بأنه: **تقرير مقترح بناءً على منطق المقال**.


## 2. خريطة التقارير حسب دورة Work Order

| مرحلة دورة Work Order | التقارير أو الرقابة المطلوبة | الهدف |
|---|---|---|
| قبل إنشاء Work Order | تقارير Items، Item Structure، Work Definition، Work Centers، Resources، Cost setup | التأكد من جاهزية البيانات الأساسية قبل التنفيذ. |
| Unreleased | Work Orders غير المفرج عنها، أوامر تحتاج استكمال بيانات | منع بقاء أوامر غير قابلة للتنفيذ. |
| Released | Dispatch List، جاهزية المواد، أوامر Released | توجيه المشغلين وبدء التنفيذ. |
| Material Issue | Component Issue، Material Usage، مقارنة المطلوب بالمصروف | ضبط الصرف والمخزون وWIP. |
| Resource Charging / Operation Execution | Resource Usage، Operations، Count Point، Operator Check-in | مراقبة التشغيل وتكلفة الموارد. |
| Material Return | Material Return، Lot/Serial Returns | عكس الصرف وتخفيض WIP. |
| Product Completion | Product Completion، Completion Subinventory، Partial Completion | متابعة إدخال المنتج النهائي للمخزون. |
| Quality / Exceptions | Production Exceptions، Quality Issues، Inspection، Rework، Reject | كشف عوائق الإنتاج والجودة. |
| Completed | Completed not Closed | منع تراكم أوامر مكتملة دون Close. |
| Work Order Close | Pending Transactions، WIP، Costing، Variances | ضمان جاهزية الإغلاق المالي. |
| Closed | Actual Cost، Variances، Cost Distributions | مراجعة التكلفة النهائية والانحرافات. |
| Period Close | Period Close Reports، Unclosed Work Orders، GL Transfer Status | حماية الفترة المالية من حركات ناقصة. |
| Post Go-Live | KPIs، Error Reports، Support Tickets | مراقبة الاستقرار والتحسين بعد التشغيل. |


## 3. تقارير Master Data

| التقرير | الهدف / ماذا يكشف | المستخدم | القرار الناتج / الأثر |
|---|---|---|---|
| Items Report | مراجعة الأصناف المستخدمة في الإنتاج. | ERP / الإنتاج / المخزون | هل الأصناف جاهزة للإنتاج والتكلفة؟ |
| Raw Materials Report | عرض المواد الخام القابلة للصرف. | المستودعات / محاسب التكاليف | هل المواد معرفة وقابلة للتكلفة والتتبع؟ |
| Finished Goods Report | عرض المنتجات النهائية. | الإنتاج / المالية | هل المنتج النهائي قابل للإكمال والتخزين؟ |
| Subassemblies Report | عرض المنتجات نصف المصنعة. | التخطيط / الإنتاج | هل تحتاج Work Definitions مستقلة أم Phantom؟ |
| Items without Item Structure | تقرير مقترح بناءً على منطق المقال؛ يكشف منتجات إنتاجية بلا هيكل مكونات. | ERP / Manufacturing Engineer | استكمال الهيكل قبل Work Definition. |
| Items without Costing Enabled | كشف أصناف لا تدخل التكلفة بشكل صحيح. | محاسب التكاليف | تصحيح إعدادات التكلفة قبل UAT. |
| Items without Inventory Asset Value | تقرير مقترح بناءً على منطق المقال؛ يكشف أصناف قد لا تظهر كأصل مخزني عند الحاجة. | المالية | منع فقدان قيمة مخزنية. |
| Lot / Serial Controlled Items | عرض الأصناف التي تحتاج تتبع Lot/Serial. | الجودة / المخزون | تفعيل التتبع قبل الصرف والإكمال. |
| UOM Report | مراجعة وحدات القياس للأصناف والموارد. | ERP / الإنتاج | منع أخطاء الكمية والتكلفة. |
| Inventory Organizations Report | عرض المنظمات المخزنية. | ERP | تأكيد ربط الإنتاج بالمنظمة الصحيحة. |
| Manufacturing Plants Report | التأكد من تعريف المصنع كManufacturing Plant. | ERP / الإنتاج | تفعيل الإنتاج على المنظمة الصحيحة. |
| Plant Parameters Review | مراجعة معاملات المصنع مثل Process Manufacturing وPrevent Issue of Expired Lots. | ERP / الإنتاج / المخزون | ضبط سلوك الإنتاج والصرف. |
| Subinventories / Locators Report | عرض مواقع الصرف والاستلام. | المستودعات | تأكيد Supply وCompletion locations. |
| Work Areas Report | مراجعة مناطق العمل. | الإنتاج | ضبط الهيكل التشغيلي للمصنع. |
| Work Centers Report | مراجعة مراكز العمل. | الإنتاج / التخطيط | ربط العمليات بمراكز صحيحة. |
| Resources Report | عرض موارد العمالة والمعدات. | الإنتاج / التكلفة | تأكيد قابلية التسجيل والتكلفة. |
| Resources without UOM | كشف موارد بوحدات قياس غير صالحة. | ERP | منع فشل الجدولة أو التكلفة. |
| Resources without Rate | تقرير مقترح بناءً على منطق المقال؛ كشف موارد بلا Rate. | محاسب التكاليف | استكمال Resource Cost. |
| Work Centers without Resources | كشف مراكز عمل بلا موارد. | الإنتاج | منع مسارات غير قابلة للتنفيذ. |
| Standard Operations Report | مراجعة العمليات القياسية. | Manufacturing Engineer | ضمان توحيد التعاريف. |


## 4. تقارير Item Structure / BOM

| التقرير | الهدف / ماذا يكشف | المستخدم | القرار الناتج / الأثر |
|---|---|---|---|
| Products with Item Structure | المنتجات التي لديها هياكل مكونات. | Manufacturing Engineer | جاهزية بناء Work Definition. |
| Products without Item Structure | منتجات إنتاجية بلا Item Structure. | ERP / الإنتاج | منع Work Definition ناقصة. |
| Unapproved Item Structures | هياكل تحتاج اعتماد. | الهندسة / الإنتاج | منع استخدام مكونات غير رسمية. |
| Recently Changed Item Structures | تغييرات حديثة قد تؤثر على Work Definitions. | Manufacturing Engineer / Cost Accountant | مراجعة التزامن والتكلفة. |
| Structures requiring Synchronization | هياكل تحتاج مزامنة مع Work Definitions. | ERP | منع اختلاف التنفيذ عن التصميم. |
| Subassemblies in Structure | وجود منتجات نصف مصنعة. | التخطيط | تحديد أمر مستقل أو Phantom. |
| Ad hoc Items | مكونات مضافة خارج Item Structure. | الهندسة / التكلفة | رقابة على المواد المؤثرة في التكلفة. |
| Phantom Components | مكونات Phantom. | الإنتاج | تفجير المكونات داخل الأمر. |
| Supplier Supply Components | مكونات يقدمها المورد. | المشتريات / الإنتاج | ضبط Outside Processing أو supplier supply. |
| Co-products / By-products | مخرجات متعددة في Process Manufacturing. | الإنتاج / التكلفة | تأثير على المخزون والتكلفة. |
| Mixed Supply Types | مكونات بأنواع Supply مختلفة. | المستودعات | تحديد توقيت وطريقة الصرف. |
| Components without Supply Type | مكونات بلا Supply Type واضح. | ERP | خطر صرف خاطئ أو مفقود. |
| Lot / Serial Components | مكونات تتطلب تتبع. | الجودة / المخزون | دعم Genealogy. |


## 5. تقارير Work Definitions

| التقرير | الهدف / ماذا يكشف | المستخدم | القرار الناتج / الأثر |
|---|---|---|---|
| Products with Work Definition | جاهزية المنتج لإنشاء Work Order. | الإنتاج | يمكن التنفيذ والتكلفة. |
| Products without Work Definition | منتجات غير جاهزة للتنفيذ. | ERP | منع إنشاء Work Orders ناقصة. |
| Primary Work Definitions | التعريف الأساسي لكل منتج. | التخطيط / الإنتاج | تحديد القالب الرئيسي. |
| Alternate Work Definitions | طرق تصنيع بديلة. | الإنتاج / التكلفة | تقييم أثر البدائل على التكلفة. |
| Work Definition Versions | الإصدارات وتواريخ السريان. | الهندسة | منع استخدام إصدار غير مناسب. |
| Expired Work Definitions | تعريفات منتهية الصلاحية. | ERP | منع أوامر بتعريف قديم. |
| Invalid Effective Dates | تواريخ سريان غير مناسبة. | ERP | تجنب خلط فترات الإنتاج والتكلفة. |
| Work Definitions without Operations | تعريف بلا عمليات. | الإنتاج | لا مسار تنفيذ. |
| Work Definitions without Operation Items | تعريف بلا مواد عمليات. | المستودعات / التكلفة | تكلفة مواد ناقصة. |
| Work Definitions without Operation Resources | تعريف بلا موارد. | الإنتاج / التكلفة | Resource Cost ناقص. |
| Missing Completion Subinventory / Locator | مكان استلام غير واضح. | المستودعات | تعطيل Product Completion. |
| Costing Priority Review | التعريف المستخدم للتكلفة. | محاسب التكاليف | تأثير مباشر على Cost Rollup. |
| Production Priority Review | أولوية الإنتاج. | الإنتاج | تحديد Primary/Alternate للتنفيذ. |
| Rework / Transform / Flow / Process Definitions | تعريفات متقدمة. | الإنتاج / الجودة | تحتاج رقابة خاصة. |
| Definitions impacted by Item Structure change | تعريفات متأثرة بتغيير المكونات. | ERP / الهندسة | تحديث قبل Go-Live. |


## 6. تقارير Operations / Work Centers / Resources

| التقرير | ماذا يراقب؟ | أثره على التنفيذ | أثره على التكلفة |
|---|---|---|---|
| Operations by Work Definition | العمليات المرتبطة بكل تعريف عمل. | يوضح مسار التنفيذ. | يحدد مواضع Resource Cost. |
| Count Point Operations | العمليات الإلزامية التسجيل. | يمنع تجاوز مراحل حرجة. | يحسن اكتمال بيانات التنفيذ. |
| Auto-Transact Operations | العمليات التي تسجل تلقائيًا. | يقلل الإدخال اليدوي. | يحتاج ضبط حتى لا تُسجل تكلفة غير صحيحة. |
| Optional Operations | العمليات القابلة للتجاوز. | يعطي مرونة تشغيلية. | لا تظهر تكلفتها إذا لم تنفذ. |
| Work Centers by Work Area | توزيع مراكز العمل داخل المصنع. | يوضح مكان التنفيذ. | يربط الموارد بالتشغيل. |
| Resources by Work Center | الموارد المتاحة لكل مركز. | يحدد من/ما ينفذ العملية. | أساس Resource Charging. |
| Resources without Rate | موارد بلا تكلفة منشورة. | التنفيذ ممكن لكن التكلفة ناقصة. | WIP غير مكتمل. |
| Resources without UOM / Shift | موارد غير قابلة للجدولة أو التسجيل الصحيح. | جدولة غير موثوقة. | تكلفة غير دقيقة. |
| Utilization / Efficiency | معاملات استخدام وكفاءة الموارد. | يفسر زمن التشغيل. | يؤثر على التكلفة والكفاءة. |
| Workstation / Operator Check-in | حضور المشغلين على المحطات. | يراقب التنفيذ الفعلي. | يدعم Resource Usage. |
| Supplier / Outside Processing Operations | العمليات التي ينفذها مورد. | يربط التصنيع بالمشتريات. | يضيف تكلفة خارجية. |


## 7. تقارير Work Orders

| التقرير | الهدف | المستخدم | الخطر إذا لم يُراجع |
|---|---|---|---|
| Work Order Report | عرض أوامر العمل وبياناتها. | الإنتاج / ERP | فقدان السيطرة على الدورة. |
| Work Order Status Report | متابعة الحالات Unreleased, Released, On Hold, Completed, Closed, Canceled. | مشرف الإنتاج | أوامر عالقة دون قرار. |
| Open Work Orders | عرض الأوامر المفتوحة. | الإنتاج / المالية | WIP متضخم. |
| Unclosed Work Orders | أوامر مكتملة أو مفتوحة لم تغلق. | محاسب التكاليف | تكلفة وانحرافات في فترة خاطئة. |
| Late Work Orders | أوامر متأخرة. | مدير الإنتاج | تأخير طلبات أو تخطيط. |
| Released Not Executed | أوامر مفرج عنها دون حركة. | الإنتاج | مواد أو موارد غير جاهزة. |
| Completed Not Closed | أوامر مكتملة غير مغلقة. | المالية | أخطر تقرير قبل Period Close. |
| Work Orders by Source | يدوي، Planning، Orchestration، Min-Max، API/FBDI. | التخطيط / ERP | تتبع سبب الإنتاج. |
| Sales Order / Project Linked Work Orders | أوامر مرتبطة بطلب بيع أو مشروع. | المبيعات / المشاريع | تأخير عميل أو تكلفة مشروع. |
| Nonstandard / Rework / Transform | أوامر خاصة. | الجودة / التكلفة | تكلفة غير معيارية تحتاج رقابة. |


## 8. Dispatch List والرقابة التشغيلية اليومية

Dispatch List هي أداة تشغيلية تظهر للمشغلين أوامر العمل والعمليات الجاهزة للتنفيذ بعد Release. لا تعد تقريرًا ماليًا، لكنها رقابة يومية أساسية لأنها تمنع العمل على أوامر غير جاهزة وتربط المشغلين بالعمليات والموارد.

| عنصر الرقابة | ماذا يوضح؟ | القرار الناتج |
|---|---|---|
| أوامر Released | الأوامر الجاهزة للعمل. | بدء التنفيذ أو ترتيب الأولويات. |
| Operation المطلوبة | الخطوة التي يجب تنفيذها. | توجيه المشغل. |
| Work Center / Workstation | مكان التنفيذ. | توزيع العمل. |
| Resource / Operator | المورد أو المشغل المطلوب. | تخصيص الموارد. |
| الكمية المطلوبة أو المتبقية | حجم العمل اليومي. | تخطيط الإنتاج. |
| Exceptions | عوائق التنفيذ. | تصعيد أو On Hold. |


## 9. تقارير Material Issue / Component Issue

| التقرير | ماذا يكشف؟ | أثره على المخزون | أثره على WIP/التكلفة |
|---|---|---|---|
| Material Usage Report | كمية المواد المستخدمة فعليًا. | يخفض المخزون. | يكشف Material Usage Variance. |
| Component Issue Report | المواد المصروفة لكل Work Order. | يربط الصرف بالأمر. | يزيد WIP. |
| Required vs Issued | مقارنة المطلوب بالمصروف. | يكشف نقص/زيادة. | يفسر الانحرافات. |
| Push Supply Items | مواد تحتاج صرف يدوي. | تحتاج متابعة. | لا تدخل WIP إذا لم تصرف. |
| Operation Pull Items | مواد تصرف آليًا عند العملية. | حركة مرتبطة بالإكمال. | WIP يتأثر عند التنفيذ. |
| Assembly Pull Items | مواد تصرف عند Product Completion. | الصرف يتأخر حتى الإكمال. | التكلفة تظهر لاحقًا. |
| Bulk Items | مواد للعرض لا تصرف نظاميًا. | لا حركة رسمية. | لا تدخل WIP كصرف مباشر. |
| Phantom Items | تفجير مكونات Phantom. | المكونات تظهر داخل الأمر. | تؤثر على Material Cost. |
| Supplier Supply Items | مواد يقدمها المورد. | لا تصرف داخليًا بالطريقة المعتادة. | تحتاج ربط بتكلفة خارجية. |
| Expired Lot Attempts | محاولات صرف Lots منتهية. | يحمي المخزون. | يمنع إنتاج بمواد غير صالحة. |
| Lot/Serial Issue | تتبع الدفعات والسيريالات المصروفة. | يدعم Genealogy. | يدعم التحقيق والتكلفة حسب الدفعة. |


## 10. تقارير Material Return / Component Return

| التقرير | ماذا يكشف؟ | أثره على المخزون | أثره على WIP |
|---|---|---|---|
| Material Return Report | المواد المرجعة من Work Order. | يزيد الرصيد. | يخفض WIP. |
| Returns by Work Order | ربط المرتجع بالأمر. | يمنع إرجاع غير مرتبط. | يصحح تكلفة الأمر. |
| Issued vs Returned | صافي الاستهلاك. | يعكس الاستخدام الفعلي. | يدعم Actual Cost. |
| Returns after Completion | مواد زائدة بعد الإكمال. | تصحيح مخزني. | قد يشير إلى Work Definition غير دقيقة. |
| Return after Close Attempts | محاولات بعد الإغلاق. | يحتاج تحقق إضافي من المصدر الأصلي. | قد تتطلب إعادة فتح أو تسوية. |
| Damaged Returns | مواد تالفة لا تعود كمخزون صالح. | يحمي المخزون. | قد تتحول إلى Scrap. |
| Lot/Serial Returns | تتبع الدفعة المرجعة. | يحافظ على Genealogy. | عكس تكلفة صحيح. |


## 11. تقارير Resource Charging / Operation Execution

| التقرير | الهدف | أثره على تكلفة الإنتاج |
|---|---|---|
| Resource Usage Report | عرض استخدام الموارد حسب الأمر أو العملية. | أساس Resource Cost. |
| Resource Charging Report | متابعة تحميل الموارد على WIP. | يزيد WIP. |
| Planned vs Actual Resource Usage | مقارنة المخطط بالفعلي. | يكشف Resource Usage / Efficiency Variance. |
| Manual Resource Charging | رقابة على الإدخالات اليدوية. | يقلل أخطاء العمالة والآلات. |
| Automatic Resource Charging | رقابة على التسجيل الآلي. | يضمن أن الأتمتة صحيحة. |
| Operator Check-in / Check-out | تتبع حضور المشغلين. | يدعم احتساب الوقت. |
| Completed / Incomplete Operations | متابعة تقدم العمليات. | يحدد الجاهزية للإكمال. |
| Count Point Not Recorded | عمليات إلزامية غير مسجلة. | تكلفة وتنفيذ غير مكتملين. |
| Optional Operations Skipped | عمليات اختيارية تم تجاوزها. | لا يجب تحميل تكلفتها. |
| Resource Exceptions | مشاكل موارد. | تفسر التأخير والتكلفة. |
| Resource Cost by Operation | تكلفة المورد لكل عملية. | يكشف العملية المكلفة. |


## 12. تقارير Product Completion

| التقرير | ماذا يوضح؟ | من يستخدمه؟ | القرار الناتج |
|---|---|---|---|
| Product Completion Report | الكميات المكتملة والمستلمة. | الإنتاج / المستودعات | هل دخل المنتج النهائي؟ |
| Completion by Work Order | ربط الإكمال بالأمر. | الإنتاج / التكلفة | هل وصل الأمر إلى Completed؟ |
| Completion Subinventory / Locator | مكان الاستلام. | المستودعات | هل دخل الموقع الصحيح؟ |
| Completed Quantity | الكمية المكتملة. | الإنتاج | هل تساوي المطلوب؟ |
| Partial Completion | الإكمال الجزئي. | التخطيط | هل يبقى الأمر مفتوحًا؟ |
| Undercompletion Tolerance | السماح بإكمال أقل من المخطط. | الإنتاج / التخطيط | هل يعتبر الأمر مكتملًا؟ |
| Provisional Completion Cost | التكلفة المؤقتة قبل Close. | محاسب التكاليف | هل التكلفة النهائية لم تحسم؟ |
| Completed Not Closed | منتجات مكتملة وأوامر غير مغلقة. | المالية | ضرورة Close. |
| Primary Output / Co-products / By-products | مخرجات Process Manufacturing. | الإنتاج / التكلفة | مراجعة المخزون والتكلفة للمخرجات. |


## 13. تقارير Quality / Exceptions

| التقرير | ماذا يكشف؟ | أثره على الإنتاج | أثره على التكلفة |
|---|---|---|---|
| Production Exceptions Report | مشاكل تعيق Work Order. | توقف أو تأخير. | تكلفة إضافية محتملة. |
| Material Exceptions | نقص أو مشكلة مواد. | يمنع العمليات. | بدائل أو تأخير. |
| Resource Exceptions | عطل آلة أو غياب عامل. | يوقف المركز أو المورد. | يؤثر على الكفاءة. |
| Quality Issues | مشاكل جودة. | قد تمنع الإتاحة. | Scrap أو Rework. |
| Inspection Report | نتائج الفحص. | قبول/رفض المنتج. | يحدد الصالح وغير الصالح. |
| Rework Report | منتجات تعاد معالجتها. | يعيد دورة العمل. | تكلفة إضافية. |
| Reject Report | منتجات مرفوضة. | نقص في المقبول. | قد تتحول إلى Scrap. |
| Maintenance Exceptions | أعطال معدات. | تؤثر على التوفر. | تكلفة توقف. |
| Open Exceptions | مشاكل غير محلولة. | خطر استمرار التعطيل. | تكلفة غير مضبوطة. |


## 14. تقارير Scrap / Rework / Reject

| التقرير | ماذا يكشف؟ | أثره على المخزون | أثره على التكلفة |
|---|---|---|---|
| Scrap Report | كمية وقيمة الهالك. | يخفض المنتج الصالح أو WIP. | تكلفة هالك أو امتصاص. |
| Scrap Transactions | حركات الهالك. | يربط الهالك بالعملية. | يدخل Cost Accounting. |
| Scrap by Work Order | الهالك لكل أمر. | يحدد أوامر ضعيفة. | يدعم Variance Analysis. |
| Scrap by Material | مواد تسبب هالكًا. | يوضح جودة المواد. | يكشف Material/Yield issues. |
| Scrap by Operation | العمليات التي تولد فاقدًا. | يوضح موقع المشكلة. | يكشف مشاكل عملية أو مورد. |
| Scrap Variance | فرق الهالك عن المتوقع. | — | يحدد انحراف الهالك. |
| Rework Work Orders | أوامر إعادة التشغيل. | قد تعيد المنتج للمسار. | تكلفة إضافية. |
| Rejects | المنتجات المرفوضة. | لا تدخل كمخزون صالح. | Scrap أو Rework. |
| Scrap قابل للبيع | يحتاج تحقق إضافي من المصدر الأصلي. | قد يدخل كمخزون خردة. | يحتاج سياسة مالية. |


## 15. تقارير WIP

WIP في Oracle هو قيمة الإنتاج تحت التشغيل. يزيد عند Material Issue وResource Charging وOverhead Absorption، وينخفض عند Material Return وProduct Completion وScrap Expense حسب السياسة، ويُسوّى عند Work Order Close.

| تقرير WIP | الهدف | المستخدم | القرار الناتج |
|---|---|---|---|
| WIP Report | عرض قيمة WIP الحالية. | محاسب التكاليف | هل WIP منطقي؟ |
| WIP by Work Order | تتبع WIP لكل أمر. | المالية | أي أمر يسبب WIP مرتفع؟ |
| WIP by Item | WIP حسب المنتج. | الإنتاج / المالية | تحليل تكلفة المنتج تحت التشغيل. |
| WIP by Plant | WIP حسب المصنع/المنظمة. | المدير المالي | مقارنة المصانع. |
| WIP by Cost Element | مواد/موارد/Overhead. | محاسب التكاليف | معرفة مكونات WIP. |
| Open WIP at Period End | WIP المفتوح نهاية الفترة. | المالية | قرار إغلاق أو تسوية. |
| WIP from Material Issue | أثر الصرف على WIP. | المخزون / التكلفة | هل الصرف مبرر؟ |
| WIP from Resource Charging | أثر الموارد على WIP. | الإنتاج / التكلفة | هل الموارد مسجلة؟ |
| WIP before Close | جاهزية الإغلاق. | محاسب التكاليف | هل يمكن Close؟ |
| WIP after Close | التأكد من التسوية. | المالية | هل صُفر WIP للأمر؟ |
| WIP Adjustments | تسويات WIP. | المالية | مراجعة فروقات. |


## 16. تقارير Cost Accounting

| التقرير | ماذا يعرض؟ | من يستخدمه؟ | القرار الناتج |
|---|---|---|---|
| Cost Accounting Review | حالة معالجة التكلفة. | محاسب التكاليف | هل الحركات مسعّرة؟ |
| Cost Processor Status | حالة Cost Processor. | ERP / المالية | هل توجد أخطاء معالجة؟ |
| Cost Accounting Events | أحداث التكلفة من الإنتاج. | المالية | هل كل حدث انتقل للتكلفة؟ |
| Cost Distribution Report | التوزيعات الناتجة عن الأحداث. | محاسب التكاليف | هل التوزيع صحيح؟ |
| Work Order Cost Report | تكلفة الأمر. | الإنتاج / المالية | هل تكلفة الأمر مقبولة؟ |
| Material Cost Report | تكلفة المواد. | التكلفة | تحليل استهلاك المواد. |
| Resource Cost Report | تكلفة الموارد. | الإنتاج / التكلفة | تحليل العمالة والآلات. |
| Overhead Cost Report | يحتاج تحقق إضافي من المصدر الأصلي. | المالية | مراجعة الأوفرهيد. |
| Product Completion Cost Report | تكلفة الإكمال المؤقتة/النهائية. | المالية | فهم أثر Close. |
| Actual Work Order Cost | التكلفة الفعلية بعد Close. | المالية | اعتماد التكلفة النهائية. |
| Standard vs Actual | مقارنة المعياري بالفعلي. | الإدارة | تحليل الانحراف. |
| Cost Scenario / Rollup | سيناريو التكلفة والتجميع. | محاسب التكاليف | هل التكلفة المعيارية جاهزة؟ |
| Cost Elements / Cost Book / Cost Profile | إعدادات التكلفة الأساسية. | المالية | صحة منهج التقييم. |

### أسئلة يجب أن يجيب عنها تقرير تكلفة Work Order
- ما تكلفة المواد؟
- ما تكلفة الموارد؟
- هل يوجد Overhead؟
- هل يوجد Scrap؟
- هل تكلفة Product Completion مؤقتة أم نهائية؟
- هل تم Close؟
- هل ظهرت Variances؟
- هل بقي WIP؟
- هل Cost Distributions جاهزة؟


## 17. تقارير Cost Distributions وSubledger

| التقرير/الرقابة | الهدف المالي | المستخدم | الخطر إذا لم يُراجع |
|---|---|---|---|
| Cost Distribution Report | عرض توزيعات التكلفة. | محاسب التكاليف | ترحيل خاطئ أو ناقص. |
| Distributions by Work Order | ربط التكلفة بالأمر. | المالية | عدم تتبع GL إلى Work Order. |
| Distributions by Material Issue | مراجعة أثر الصرف. | المالية / المخزون | مواد بلا تكلفة صحيحة. |
| Distributions by Resource Charging | مراجعة تكلفة الموارد. | المالية / الإنتاج | تكلفة موارد ناقصة. |
| Distributions by Product Completion | أثر المنتج النهائي. | المالية | قيمة Finished Goods غير دقيقة. |
| Distributions by Scrap | تكلفة الهالك. | الجودة / المالية | هالك غير ظاهر. |
| Distributions by Close | انحرافات وإغلاق WIP. | محاسب التكاليف | Close غير مكتمل ماليًا. |
| Subledger Accounting Review | مراجعة القيود قبل GL. | المالية | أخطاء SLA. |
| Transfer to GL Status | حالة الترحيل. | المالية | عدم تطابق GL. |
| Untransferred Distributions | توزيعات غير مرحلة. | المالية | GL ناقص. |
| Error Distributions | توزيعات بها أخطاء. | ERP / المالية | تعطيل Period Close. |
| Production-to-GL Reconciliation | مطابقة الإنتاج مع GL. | المدير المالي | عدم الثقة بالأرقام. |


## 18. تقارير Variances

| نوع الانحراف | ماذا يكشف؟ | المسؤول عن مراجعته | الإجراء المتوقع |
|---|---|---|---|
| Material Rate Variance | فرق سعر المادة في Rollup عن حركة الصرف. | محاسب التكاليف | مراجعة أسعار المواد. |
| Material Usage Variance | فرق الكمية الفعلية عن Work Definition. | الإنتاج / التكلفة | مراجعة الاستهلاك أو التعريف. |
| Material Substitution Variance | استخدام صنف خارج Work Definition أو عدم استخدام صنف موجود. | الإنتاج / المخزون | ضبط البدائل والصلاحيات. |
| Resource Rate Variance | فرق معدل المورد. | محاسب التكاليف | مراجعة Resource Rates. |
| Resource Usage Variance | اختلاف استخدام الموارد. | الإنتاج | تحليل الكفاءة. |
| Yield Variance | اختلاف الإنتاج الفعلي عن المتوقع. | الإنتاج / الجودة | مراجعة الفاقد والجودة. |
| Job Close Variance | فرق متبقٍ عند الإغلاق. | محاسب التكاليف | تحليل أسباب غير مصنفة. |
| Scrap Variance | اختلاف الهالك عن المتوقع. | الجودة / المالية | مراجعة أسباب الهالك. |
| Standard Cost Variance | فرق بين المعياري والفعلي. | المالية | تحديث معايير أو معالجة تشغيل. |
| Actual vs Standard | مقارنة عامة. | الإدارة | تقييم كفاءة الإنتاج. |
| Target vs Actual | تقرير مقترح بناءً على منطق المقال. | الإنتاج | قياس الالتزام بالخطة. |


## 19. تقارير Work Order Close

| تقرير Close | قبل/بعد Close | الهدف | من يعتمد؟ |
|---|---|---|---|
| Work Orders الجاهزة للإغلاق | قبل | تحديد الأوامر Completed القابلة للإغلاق. | الإنتاج / التكلفة |
| Work Orders التي لديها حركات معلقة | قبل | منع فشل الإغلاق. | ERP / المالية |
| Work Orders التي لديها WIP مفتوح | قبل | مراجعة WIP قبل التسوية. | محاسب التكاليف |
| Work Orders التي لديها Product Completion ولم تُغلق | قبل | منع تأخير التكلفة الفعلية. | المالية |
| Work Orders التي لديها Exceptions مفتوحة | قبل | منع إغلاق أمر بمشكلة غير محلولة. | الإنتاج / الجودة |
| Work Orders التي لديها Pending Costing | قبل | التأكد من معالجة التكلفة. | محاسب التكاليف |
| Work Orders التي لم تُسجل مواردها | قبل | منع تكلفة ناقصة. | الإنتاج |
| Work Orders التي لم تُسجل موادها بالكامل | قبل | منع تكلفة أو WIP غير دقيق. | المستودعات / الإنتاج |
| التكلفة الفعلية | بعد | اعتماد Actual Work Order Cost. | المالية |
| الانحرافات | بعد | تحليل الفرق بين المعياري والفعلي. | الإدارة / المالية |
| إغلاق WIP | بعد | التأكد من تسوية WIP. | محاسب التكاليف |
| Cost Distributions الناتجة | بعد | مراجعة التوزيعات قبل SLA/GL. | المالية |


## 20. تقارير Period Close

| التقرير | ماذا يؤكد؟ | المسؤول | الخطر إذا لم يُراجع |
|---|---|---|---|
| Period Close Reports | جاهزية الفترة للإغلاق. | المالية | إقفال بأرقام ناقصة. |
| Pending Transactions | عدم وجود حركات معلقة. | ERP / المالية | فشل تكلفة أو إغلاق. |
| Unclosed Work Orders | أوامر لم تغلق. | محاسب التكاليف | WIP وتكلفة في فترة خاطئة. |
| Open WIP | WIP مفتوح نهاية الفترة. | المدير المالي | ميزانية غير دقيقة. |
| Cost Distributions غير المرحلة | توزيعات لم تصل للمحاسبة. | المالية | GL ناقص. |
| Variances غير مراجعة | فروقات لم تفسر. | محاسب التكاليف | قرارات إدارية ضعيفة. |
| Work Orders مغلقة في فترة مختلفة | اختلاف توقيت الإكمال والإغلاق. | المالية | هامش ربح غير دقيق. |
| Transfer to GL Status | حالة الترحيل للأستاذ العام. | المالية | عدم مطابقة. |
| Cost Accounting Errors | أخطاء المعالجة. | ERP / المالية | توقف الإقفال. |
| Inventory Valuation Review | قيمة المخزون. | المالية | تقييم مخزون غير صحيح. |
| WIP Reconciliation | مطابقة WIP. | محاسب التكاليف | فرق بين WIP والتقارير. |
| Production-to-GL Reconciliation | مطابقة الإنتاج مع GL. | المدير المالي | عدم ثقة بالأرقام. |


## 21. تقارير Lot / Serial Traceability

| التقرير | ماذا يوضح؟ | متى يصبح ضروريًا؟ |
|---|---|---|
| Lot Traceability | تتبع الدفعات من المواد إلى المنتج. | الصناعات التي تحتاج Recall أو امتثال. |
| Serial Traceability | تتبع الأرقام التسلسلية. | المنتجات المنظمة أو عالية القيمة. |
| Genealogy | شجرة العلاقة بين مكونات المنتج والمنتج النهائي. | تحليل أسباب العيوب والاستدعاءات. |
| المواد المصروفة حسب Lot | أي دفعة استخدمت في أي أمر. | عند مشكلة جودة في مادة. |
| المنتجات المكتملة حسب Lot / Serial | أي منتج خرج من أي دفعات. | عند التفتيش أو الضمان. |
| Raw Material to Finished Good Trace | تتبع أمامي. | عند اكتشاف مادة معيبة. |
| Finished Good to Raw Material Trace | تتبع عكسي. | عند شكوى عميل أو فشل جودة. |
| Traceability للجودة أو الاستدعاءات | دعم Recall Management. | الصناعات الغذائية/الدوائية/الطبية/الإلكترونية. |


## 22. تقارير UAT وGo-Live

| تقرير الاختبار | الهدف | قرار Go/No-Go |
|---|---|---|
| اختبار Work Definition | التأكد من صحة القالب الإنتاجي. | لا Go إذا التعريف ناقص. |
| اختبار Work Order Lifecycle | تجربة الدورة كاملة. | لا Go إذا الحالات غير مضبوطة. |
| اختبار Material Issue | اختبار الصرف وWIP. | لا Go إذا الصرف لا يطابق المطلوب. |
| اختبار Resource Charging | اختبار الموارد والتكلفة. | لا Go إذا Resource Cost لا يظهر. |
| اختبار Product Completion | اختبار إدخال المنتج النهائي. | لا Go إذا Completion غير صحيح. |
| اختبار Material Return | اختبار عكس الصرف. | لا Go إذا WIP لا يتعدل. |
| اختبار Scrap | اختبار أثر الهالك. | لا Go إذا Scrap لا يظهر. |
| اختبار Quality / Exceptions | اختبار مشاكل الجودة والاستثناءات. | لا Go إذا الرقابة لا تعمل. |
| اختبار WIP | متابعة WIP عبر الدورة. | لا Go إذا WIP غير قابل للمراجعة. |
| اختبار Cost Distributions | مراجعة التوزيعات. | لا Go إذا التوزيعات مفقودة. |
| اختبار Variances | ظهور الانحرافات عند Close. | لا Go إذا الانحرافات غير مفهومة. |
| اختبار Work Order Close | إغلاق الأمر وتصفية WIP. | لا Go إذا الإغلاق يفشل. |
| اختبار Period Close | اختبار نهاية الفترة. | لا Go إذا Pending/Unclosed غير معالجة. |
| اختبار Transfer to GL | التأكد من الترحيل. | لا Go إذا GL لا يستلم. |
| قائمة الفجوات قبل Go-Live | تحديد النواقص. | Go/No-Go حسب شدة الفجوات. |


## 23. خريطة التقارير حسب المستخدم

| المستخدم | أهم التقارير له | لماذا يحتاجها؟ |
|---|---|---|
| مدير الإنتاج | Work Order Status، Dispatch List، Exceptions، Product Completion | متابعة التنفيذ والاختناقات. |
| مشرف الإنتاج | Dispatch List، Operations، Resource Usage، Exceptions | توجيه المشغلين وحل مشاكل الصالة. |
| مدير المستودعات | Material Issue، Material Return، Lot/Serial، Subinventory | ضبط الصرف والاستلام والتتبع. |
| موظف المستودع | Component Issue، Supply Subinventory، Material Return | تنفيذ الحركات بدقة. |
| محاسب التكاليف | WIP، Work Order Cost، Cost Distributions، Variances، Close | ضبط التكلفة والإغلاق. |
| المدير المالي | WIP، Period Close، GL Transfer، Reconciliation | ضمان صحة القوائم المالية. |
| مسؤول الجودة | Inspection، Reject، Rework، Scrap، Genealogy | ضبط الجودة والاستدعاءات. |
| المخطط | Work Orders by Source، Released/Unreleased، Completion | متابعة التنفيذ مقابل الخطة. |
| مستشار ERP | Master Data، Work Definition، UAT، Gap Reports | ضبط التطبيق ومتابعة الجاهزية. |
| فريق الدعم | Pending Transactions، Errors، Exceptions | معالجة الأعطال بعد التشغيل. |
| فريق البرمجة | Gap Reports، تقارير مفقودة | تطوير التقارير أو التحسينات. |


## 24. خريطة التقارير حسب القرار

| القرار | التقرير المطلوب | ماذا نبحث فيه؟ |
|---|---|---|
| هل نطلق Work Order؟ | Readiness، Material Availability، Work Definition | جاهزية التعريف والمواد. |
| هل المواد جاهزة؟ | Material Requirements، On-hand | توفر المكونات. |
| هل نوقف الأمر On Hold؟ | Exceptions، Resource Availability | وجود عائق حقيقي. |
| هل تم صرف المواد بشكل صحيح؟ | Material Usage، Component Issue | مقارنة المطلوب بالمصروف. |
| هل الموارد سُجلت؟ | Resource Charging، Resource Usage | وجود عمالة/معدات مسجلة. |
| هل المنتج اكتمل؟ | Product Completion | الكمية ومكان الاستلام. |
| هل الجودة تمنع الإتاحة؟ | Inspection، Quality Issues | قبول/رفض المنتج. |
| هل نغلق Work Order؟ | Pre-Close، Pending Transactions، WIP | جاهزية التكلفة والإغلاق. |
| لماذا زادت التكلفة؟ | Work Order Cost، Variance Report | مادة/مورد/هالك/إغلاق. |
| لماذا زاد WIP؟ | WIP، Unclosed Work Orders | أوامر مفتوحة أو Completion ناقص. |
| لماذا ظهرت Variance؟ | Variance Report | Rate/Usage/Substitution/Yield/Job Close. |
| هل Period Close جاهز؟ | Period Close، Pending Transactions، GL Transfer | عدم وجود عوائق مالية. |
| هل Cost Distributions جاهزة للترحيل؟ | Cost Distribution، SLA Review | أخطاء أو توزيعات غير مرحلة. |
| هل نحتاج تدريب إضافي؟ | User Errors، Incorrect Transactions | تكرار أخطاء تشغيلية. |
| هل نحتاج تعديلًا في النظام؟ | Gap Report | فجوة لا تحل بالتدريب أو الإعداد. |


## 25. مؤشرات أداء رئيسية KPIs مستنتجة من المقال

| KPI | طريقة الفهم | لماذا مهم؟ |
|---|---|---|
| عدد Work Orders حسب الحالة | توزيع الأوامر على الحالات. | يكشف تراكم أوامر. |
| نسبة Work Orders المغلقة | Closed ÷ Completed. | يقيس انضباط الإغلاق. |
| Completed not Closed | أوامر مكتملة غير مغلقة. | خطر مالي مباشر. |
| قيمة WIP المفتوحة | WIP لأوامر لم تغلق. | يؤثر على الميزانية. |
| عدد Pending Transactions | حركات غير معالجة. | خطر على Period Close. |
| Cost Distributions غير المرحلة | توزيعات لم تصل GL. | خطر مطابقة مالية. |
| Material Usage Variance % | فرق استخدام المواد. | يقيس دقة Work Definition والصرف. |
| Resource Usage Variance % | فرق استخدام الموارد. | يقيس كفاءة التشغيل. |
| Scrap % | الهالك مقابل الإنتاج. | يقيس جودة العملية. |
| Open Production Exceptions | استثناءات غير محلولة. | يقيس صحة التشغيل. |
| Work Order Cycle Time | من الإنشاء إلى الإغلاق. | يقيس كفاءة الدورة. |
| Average Close Lag | وقت الإغلاق بعد Product Completion. | يقيس الانضباط المالي. |
| Rework Rate | أوامر Rework ÷ إجمالي الأوامر. | يقيس مشاكل الجودة. |
| Work Definition Accuracy | مقارنة المطلوب بالفعلي. | يكشف جودة التصميم الإنتاجي. |
| Resource Rate Accuracy | الفرق بين المخطط والفعلي. | يحسن Costing. |


## 26. علامات الخطر في التقارير

| علامة الخطر | ماذا تعني؟ | الإجراء المقترح |
|---|---|---|
| Work Orders كثيرة في Released لفترة طويلة | تنفيذ متأخر أو مواد/موارد غير جاهزة. | مراجعة Dispatch List وExceptions. |
| Completed لكنها غير Closed | تكلفة فعلية مؤجلة. | إلزام سياسة إغلاق دورية. |
| WIP متضخم | أوامر مفتوحة أو Close غير منتظم. | مراجعة WIP حسب Work Order. |
| Pending Transactions كثيرة | الحركات لا تصل للتكلفة. | معالجة الأخطاء قبل Period Close. |
| Cost Distributions غير مرحلة | SLA/GL غير مكتمل. | مراجعة Subledger وTransfer to GL. |
| Variances عالية ومتكررة | Work Definition أو الأسعار أو التنفيذ غير دقيق. | تحليل السبب وتصحيح التعريفات أو Rates. |
| Resource Usage غير مسجل | تكلفة الموارد ناقصة. | تدريب وضبط Resource Charging. |
| Material Issue لا يطابق Work Definition | صرف خاطئ أو Item Structure غير دقيق. | مراجعة Supply Type والصلاحيات. |
| Product Completion بدون Close | المنتج دخل بتكلفة مؤقتة. | إغلاق الأوامر المكتملة. |
| Exceptions مفتوحة لفترة طويلة | مشاكل إنتاج لا تُحل. | تصعيد للمسؤولين. |
| Scrap مرتفع | مشكلة جودة أو تشغيل. | تحليل Scrap حسب Operation/Material. |
| GL لا يطابق تقارير الإنتاج | خلل في Cost Distributions/SLA/Transfer. | Reconciliation مالي. |
| المستخدمون لا يعتمدون على التقارير | التقارير لا تخدم القرار أو غير موثوقة. | مراجعة المتطلبات والتدريب. |


## 27. ماذا نستفيد من Oracle في نظام ERP محلي مثل ناتج؟

| التقرير / المفهوم في Oracle | هل يجب دعمه في نظام محلي؟ | الأولوية |
|---|---|---|
| Work Order Status Report | نعم، أساسي. | حرجة |
| Open / Unclosed Work Orders | نعم، أساسي. | حرجة |
| Material Issue Report | نعم، أساسي. | حرجة |
| Material Return Report | نعم، مهم. | عالية |
| Product Completion Report | نعم، أساسي. | حرجة |
| WIP Report | نعم إذا يوجد ربط مالي أو تكلفة إنتاج. | عالية |
| Work Order Cost Report | نعم، أساسي للتكلفة. | حرجة |
| Cost Distribution أو ما يعادلها | مهم عند وجود ربط محاسبي. | عالية |
| Variance Report | مهم للتحسين. | عالية |
| Scrap Report | مهم لمعظم بيئات الإنتاج. | عالية |
| Production Exceptions Report | مفيد للرقابة. | متوسطة |
| Resource Usage Report | مهم إذا تكلفة الموارد تدخل المنتج. | متوسطة/عالية |
| Period Close Reports | لا يجوز تجاهلها في نظام مالي متكامل. | حرجة |
| Pending Transactions Report | مهم لمنع أخطاء الإغلاق. | عالية |
| Lot / Serial Traceability | حسب طبيعة الصناعة. | متوسطة/حرجة |
| Dashboard إنتاج عملي | ضروري للإدارة. | عالية |

الحد الأدنى في نظام محلي يجب أن يغطي: أوامر العمل حسب الحالة، صرف المواد، إرجاع المواد، إكمال المنتج، الأوامر المفتوحة، تكلفة الأمر، WIP إن وجد، والانحرافات الأساسية. أما التتبع المتقدم، Outside Processing، وCost Distributions التفصيلية فيمكن تطبيقها تدريجيًا حسب حجم العميل.


## 28. ملخص تنفيذي

التقارير في Oracle Manufacturing أداة رقابة وليست مجرد مخرجات. **Work Order Status Reports** تكشف أين يقف الإنتاج، و**Material / Resource Reports** تكشف دقة التنفيذ، و**WIP / Cost Distribution Reports** تمثل قلب الرقابة المالية، و**Variance Reports** تكشف مشاكل Work Definition أو الأسعار أو التنفيذ، بينما **Period Close Reports** تحمي المالية من أرقام غير دقيقة.

عند تقييم أي ERP محلي، يجب التأكد أن تقارير الإنتاج تغطي التشغيل، المخزون، التكلفة، والمحاسبة. وجود الشاشات وحده لا يكفي؛ إذا لم توجد تقارير تكشف الأوامر المفتوحة، WIP، الحركات المعلقة، الانحرافات، وتطابق الإنتاج مع GL، فلن يعطي Module الإنتاج قيمة مؤسسية حقيقية.
