# 09_SAP_Executive_Summary.md
# الملخص التنفيذي لإدارة الإنتاج في SAP S/4HANA Manufacturing / PP

## 1. الهدف من هذا الملخص

هذا الملف يقدم ملخصًا تنفيذيًا مركزًا لأهم ما يجب فهمه من دراسة **SAP S/4HANA Manufacturing / PP**.

الهدف ليس شرح كل تفصيل، بل إعطاء صورة واضحة وسريعة عن فلسفة SAP في إدارة الإنتاج، وكيف يربط بين:

- بيانات المنتج.
- التخطيط.
- أوامر الإنتاج.
- حركات المخزون.
- تنفيذ الورشة.
- الجودة.
- WIP.
- الانحرافات.
- التسوية المالية.
- Universal Journal.
- الدروس القابلة للاستفادة في ERP محلي مثل ناتج.

هذا الملف مناسب للمراجعة قبل اجتماع عميل، أو قبل تحليل قسم إنتاج، أو قبل مقارنة نظام محلي مع نموذج SAP.

---

## 2. فلسفة SAP في إدارة الإنتاج

SAP لا يتعامل مع الإنتاج كأمر تصنيع مستقل، بل كمنظومة مترابطة تبدأ من **Master Data** وتنتهي بالتكلفة والمالية.

الفكرة الأساسية:

```text
Material Master
→ BOM
→ Routing / Work Center
→ Production Version
→ Demand
→ MRP
→ Planned Order
→ Production / Process Order
→ Goods Issue
→ Confirmation
→ Goods Receipt
→ WIP / Variance
→ Settlement
→ Universal Journal
```

المبادئ المهمة:

| المبدأ | معناه العملي |
|---|---|
| الإنتاج ليس شاشة واحدة | لا يكفي إنشاء أمر إنتاج؛ يجب ربطه بالمواد والعمليات والمخزون والتكلفة |
| التخطيط منفصل عن التنفيذ | Planned Order كائن تخطيطي، أما Production Order فهو كائن تنفيذي |
| Master Data هي الأساس | أي خطأ في Material Master أو BOM أو Routing يظهر لاحقًا في MRP أو التكلفة |
| Production Version هي نقطة الربط | تربط BOM وRouting وتحدد طريقة الإنتاج المستخدمة |
| كل حركة إنتاج لها أثر | GI وConfirmation وGR تؤثر على المخزون وWIP والتكلفة |
| الإغلاق المالي جزء من الإنتاج | WIP وVariance وSettlement ليست أمورًا مالية منفصلة عن التشغيل |

---

## 3. Material Master

**Material Master** هو السجل المركزي للصنف. في SAP لا يكفي تعريف اسم المادة، بل يجب ضبط بيانات التخطيط، التخزين، الجودة، التقييم، والتكلفة.

| محور Material Master | أهميته |
|---|---|
| MRP Views | تحدد كيف يتم تخطيط الصنف |
| Work Scheduling View | تؤثر على التنفيذ والجدولة |
| Quality Management View | تحدد هل توجد فحوصات مرتبطة بالصنف |
| Accounting View | تحدد تقييم المخزون والحسابات |
| Costing View | تؤثر على Standard Cost وCost Estimate |
| Procurement Type | يحدد هل الصنف يُصنع أم يُشترى |
| Strategy Group | يحدد MTS أو MTO |
| Price Control | يحدد Standard Price أو Moving Average |

الخلاصة:  
أي ضعف في Material Master يجعل MRP والتكلفة والمخزون غير موثوقين.

---

## 4. BOM

**BOM** تحدد مكونات المنتج وكمياتها. وهي أساس:

- MRP Explosion.
- Material Requirements.
- Goods Issue.
- Standard Cost.
- Material Usage Variance.

| عنصر BOM | أثره |
|---|---|
| Component Quantity | تحدد كمية المادة المطلوبة |
| Base Quantity | تؤثر على نسب الكميات |
| BOM Usage | يحدد هل BOM للإنتاج أو التكلفة أو غيرها |
| Alternative BOM | تمثل بدائل تصنيع |
| Validity Dates | تمنع استخدام نسخة قديمة أو مستقبلية |
| Scrap | يرفع الاحتياج والتكلفة |
| Phantom Items | تغير طريقة تفجير المكونات |
| Co-products / By-products | مهمة في Process Manufacturing |

الخطر الأكبر:  
BOM الخاطئة تجعل النظام يخطط مواد خاطئة، يصرف مواد خاطئة، ويحسب تكلفة خاطئة.

---

## 5. Routing وWork Center

**Routing** يحدد خطوات التصنيع.  
**Work Center** يحدد أين تتم العملية، ويربطها بالطاقة والتكلفة.

```text
Routing Operation
→ Work Center
→ Cost Center
→ Activity Type
→ Activity Rate
→ Operation Cost
```

| المفهوم | دوره |
|---|---|
| Operation | خطوة إنتاج |
| Work Center | مكان أو وحدة تنفيذ العملية |
| Control Key | يحدد هل العملية تُجدول أو تؤكد أو تدخل التكلفة |
| Standard Values | أزمنة مثل Setup وMachine وLabor |
| Cost Center | مصدر تحميل التكلفة |
| Activity Type | نوع النشاط مثل عمالة أو آلة |
| KP26 | تسعير Activity Types |

الخلاصة:  
Routing وWork Center ليسا مجرد وصف تشغيلي، بل مصدر تكلفة العمالة والآلة والتهيئة.

---

## 6. Production Version

**Production Version** من أهم مفاهيم SAP S/4HANA.  
هي الرابط بين:

- BOM محددة.
- Routing أو Master Recipe محدد.
- Lot Size Range.
- Validity Period.

| لماذا هي مهمة؟ | السبب |
|---|---|
| في MRP | تحدد أي BOM/Routing يستخدم التخطيط |
| في Cost Estimate | تحدد Quantity Structure للتكلفة |
| في Production Order | تحدد Snapshot التنفيذ |
| في الحوكمة | تمنع الغموض بين بدائل الإنتاج |

الخلاصة:  
Production Version هي العقد بين الهندسة والإنتاج والتكلفة. غيابها أو خطؤها يسبب MRP خاطئًا وتكلفة غير دقيقة.

---

## 7. MRP وPlanned Orders

**MRP** يحول الطلب إلى مقترحات إنتاج أو شراء.

مصادر الطلب قد تشمل:

- Sales Orders.
- Planned Independent Requirements.
- Forecast.
- Dependent Requirements من BOM.
- Reservations.

مخرجات MRP:

| المخرج | معناه |
|---|---|
| Planned Order | اقتراح إنتاج داخلي |
| Purchase Requisition | اقتراح شراء |
| Dependent Requirements | احتياجات مكونات |
| MRP Exceptions | رسائل تنبيه تخطيطية |

**Planned Order** ليس أمر تنفيذ.  
هو كائن تخطيطي قابل للتعديل أو الحذف أو إعادة الجدولة. عند تحويله يصبح Production Order أو Process Order أو Purchase Requisition.

---

## 8. Production Order / Process Order

**Production Order** يستخدم غالبًا في Discrete Manufacturing.  
**Process Order** يستخدم في Process Manufacturing، ويعتمد على Master Recipe وPhases وResources.

| المقارنة | Production Order | Process Order |
|---|---|---|
| نوع التصنيع | Discrete | Process / Batch |
| بيانات التصنيع | BOM + Routing | BOM + Master Recipe |
| وحدة التنفيذ | Operation | Operation + Phase |
| المورد | Work Center | Resource |
| Batch / Co-products | ممكن | أكثر مركزية |
| التكلفة | على الأمر | على الأمر مع تعقيد Process |

حالات Production Order المهمة:

| الحالة | المعنى |
|---|---|
| CRTD | Created |
| REL | Released |
| PCNF | Partially Confirmed |
| CNF | Confirmed |
| PDLV | Partially Delivered |
| DLV | Delivered |
| TECO | Technically Completed |
| CLSD | Closed |

الخلاصة:  
حالات الأمر في SAP ليست وصفًا فقط؛ هي ضوابط تحدد ما يسمح وما يمنع.

---

## 9. Goods Issue

**Goods Issue** هو صرف المواد من المخزون إلى أمر الإنتاج.

| الحركة | المعنى |
|---|---|
| 261 | صرف مواد لأمر إنتاج |
| 262 | عكس الصرف |

أثر GI:

- ينقص مخزون المواد الخام.
- يزيد WIP أو تكلفة الأمر.
- يؤثر على Cost Accounting.
- قد ينتج Variance إذا كانت الكمية مختلفة عن BOM.

Backflush هو صرف تلقائي للمواد عند Confirmation أو GR.  
الخطر فيه أن الحركة قد تفشل وتظهر في **COGI**، لذلك يحتاج رقابة يومية.

---

## 10. Confirmation

**Confirmation** هو تسجيل ما حدث فعليًا في الورشة.

ما يمكن تسجيله:

- Yield Quantity.
- Scrap Quantity.
- Rework Quantity.
- Machine Time.
- Labor Time.
- Setup Time.
- Activity Quantities.
- Reason for Variance.

أثر Confirmation:

| الجانب | الأثر |
|---|---|
| التشغيل | يوضح تقدم الإنتاج |
| التكلفة | يحمل Activity Cost على الأمر |
| WIP | يزيد WIP بقيمة الأنشطة |
| Variance | يكشف اختلاف الوقت أو الكمية أو الهالك |
| Backflush | قد يطلق GI تلقائيًا |
| Auto GR | قد يستلم المنتج تلقائيًا إذا كان مفعّلًا |

الخطر:  
إذا كان Confirmation غير دقيق، تصبح Actual Cost وVariance غير موثوقة حتى لو كان الإنتاج الفعلي صحيحًا.

---

## 11. Goods Receipt

**Goods Receipt** هو استلام المنتج النهائي من الإنتاج إلى المخزون.

| الحركة | المعنى |
|---|---|
| 101 | استلام منتج |
| 102 | عكس الاستلام |

أثر GR:

- يزيد Finished Goods Inventory.
- يخفض أو يقابل WIP.
- يؤثر على تقييم المخزون.
- قد ينشئ Inspection Lot إذا كانت الجودة مفعلة.

PDLV تعني استلامًا جزئيًا.  
DLV تعني استلامًا كاملًا.

GR ليس نهاية مالية للدورة؛ ما يزال WIP وVariance وSettlement جزءًا مهمًا من الإغلاق.

---

## 12. Quality

يتكامل SAP Manufacturing مع QM من خلال Inspection Lots.

| نوع الفحص | المعنى |
|---|---|
| Inspection Type 03 | فحص أثناء الإنتاج |
| Inspection Type 04 | فحص عند Goods Receipt |

مفاهيم مهمة:

- Quality Inspection Stock.
- Usage Decision.
- Batch Traceability.
- Serial Traceability.
- Scrap / Reject.

الخلاصة:  
إذا كان المنتج يحتاج فحصًا، يجب ألا يصبح متاحًا للاستخدام أو البيع قبل قرار الجودة.

---

## 13. WIP

**WIP** هو قيمة الإنتاج تحت التشغيل.

يتأثر بـ:

| الحدث | أثره على WIP |
|---|---|
| Goods Issue | يزيد WIP بقيمة المواد |
| Confirmation | يزيد WIP بقيمة الأنشطة |
| Goods Receipt | يخفض أو يقابل WIP |
| WIP Calculation | يثبت WIP في Period-End |
| Settlement | ينقل أو يسوي WIP ماليًا |

الخطر:  
أوامر مفتوحة لفترة طويلة أو GI دون GR أو Confirmation غير مكتمل قد يؤدي إلى WIP غير منطقي.

---

## 14. Variance

**Variance** هي الفروقات بين المخطط أو المستهدف والفعلي.

| نوع الانحراف | ماذا يكشف؟ |
|---|---|
| Input Quantity Variance | استهلاك مواد مختلف عن BOM |
| Input Price Variance | سعر مادة مختلف |
| Resource Usage Variance | وقت أو نشاط مختلف عن Routing |
| Resource Price Variance | Activity Rate غير مناسب |
| Scrap Variance | هالك أعلى أو أقل من المتوقع |
| Lot Size Variance | أثر حجم الدفعة |
| Remaining Variance | فرق غير مصنف بوضوح |

الخلاصة:  
Variance ليست تقريرًا محاسبيًا فقط؛ هي أداة لتحسين BOM وRouting وKP26 والتنفيذ والجودة.

---

## 15. Settlement

**Settlement** هو الحدث المالي الذي ينقل WIP أو Variance إلى المستقبل المالي المناسب، مثل FI أو COPA أو Material حسب الإعداد.

| المفهوم | المعنى |
|---|---|
| Settlement Rule | تحدد أين تُسوّى التكلفة |
| Settlement Receiver | الجهة المستقبلة للتسوية |
| Settlement Profile | إعداد قواعد التسوية |
| Period-End Closing | وقت تنفيذ WIP/Variance/Settlement |
| Universal Journal | مكان ظهور الأثر المالي في S/4HANA |

الخلاصة:  
TECO وGR لا يكفيان ماليًا. Settlement هو المرحلة التي تحسم أثر تكلفة الإنتاج.

---

## 16. TECO وCLSD

| الحالة | المعنى | الخطر |
|---|---|---|
| TECO | إغلاق فني للأمر | استخدامه كإغلاق مالي خطأ |
| CLSD | إغلاق نهائي | تنفيذه قبل Settlement أو معالجة COGI/CO1P خطر |

TECO ينهي التنفيذ فنيًا ويمهد للتسوية.  
CLSD يجب أن يأتي بعد معالجة الأخطاء، WIP، Variance، Settlement، والتأكد من عدم وجود حركات أو تكاليف معلقة.

---

## 17. Universal Journal

في SAP S/4HANA، **Universal Journal** يمثل نقطة تجميع الأثر المالي والتحليلي.

الأحداث التي قد تنعكس ماليًا:

- Goods Issue.
- Confirmation / Activity Allocation.
- Goods Receipt.
- WIP Calculation.
- Variance Calculation.
- Settlement.

التفاصيل المحاسبية الدقيقة تعتمد على إعدادات SAP CO/FI وUniversal Journal.  
إذا كانت نقطة غير مشروحة في المقال بما يكفي: **يحتاج تحقق إضافي من المصدر الأصلي**.

---

## 18. Repetitive Manufacturing

**Repetitive Manufacturing — REM** مناسب للإنتاج المتكرر بكميات كبيرة وخطوط مستقرة.

| المفهوم | المعنى |
|---|---|
| Run Schedule Quantity | كمية تشغيل في REM |
| Product Cost Collector — PCC | كائن تكلفة للإنتاج المتكرر |
| Backflush | صرف تلقائي للمواد |
| Auto GR | استلام تلقائي |
| Reporting Points | نقاط تسجيل تقدم |

الفرق الجوهري:  
في Production Order التقليدي، التكلفة على الأمر.  
في REM، التكلفة غالبًا على **Product Cost Collector** والفترة.

---

## 19. Kanban

**Kanban** في SAP هو نظام Pull Replenishment يعتمد على الاستهلاك الفعلي.

| المفهوم | المعنى |
|---|---|
| Control Cycle | تعريف دورة التزويد |
| PSA | منطقة تغذية الإنتاج |
| Container | حاوية Kanban |
| Empty | إشارة بدء التجديد |
| Full | مادة جاهزة |
| In Process | التجديد جارٍ |

Kanban مناسب أكثر للمواد عالية التكرار ومنخفضة التعقيد، وليس لكل مواد الإنتاج.

تفاصيل التكلفة المالية الدقيقة لـ Kanban: **يحتاج تحقق إضافي من المصدر الأصلي**.

---

## 20. أهم نقاط الرقابة

| نقطة الرقابة | لماذا مهمة؟ |
|---|---|
| Material Master Completeness | منع فشل MRP والتكلفة |
| BOM / Routing Readiness | ضمان تخطيط وتنفيذ وتكلفة صحيحة |
| Production Version Review | منع اختيار BOM/Routing خاطئ |
| MD04 | مراجعة الطلب والعرض |
| Missing Parts List | منع Release دون مواد |
| COGI | كشف أخطاء Backflush |
| CO1P | كشف تكاليف أو حركات معلقة |
| Confirmation Reports | مراجعة كميات وأوقات الورشة |
| WIP Report | متابعة الإنتاج تحت التشغيل |
| Variance Report | تحليل الفروقات |
| Settlement Report | ضمان التسوية المالية |
| Production-to-FI Reconciliation | مطابقة الإنتاج مع المالية |

---

## 21. الدروس المستفادة لنظام ERP محلي مثل ناتج

| درس من SAP | تطبيقه في ERP محلي |
|---|---|
| فصل التخطيط عن التنفيذ | Planned Order منفصل عن Work/Production Order |
| ربط BOM وRoute بطريقة معتمدة | مفهوم مبسط شبيه Production Version |
| عدم اختزال الإنتاج في صرف واستلام | فصل GI وConfirmation وGR |
| ربط مراكز العمل بالتكلفة | دعم تكلفة العمالة والآلة عند الحاجة |
| معالجة أخطاء الصرف التلقائي | تقرير أخطاء شبيه COGI |
| عدم تجاهل WIP | تقرير WIP حسب أمر الإنتاج |
| تحليل Variance | فروقات مواد وموارد وهالك |
| وجود Settlement أو Close Cost | إغلاق تكلفة أمر الإنتاج |
| فصل الإغلاق الفني عن النهائي | TECO/CLSD أو بديل مبسط |
| ربط الإنتاج بالمالية | مطابقة Production-to-FI |

ليس المطلوب نسخ SAP حرفيًا، بل أخذ منطقه المؤسسي وتبسيطه بما يناسب العميل المحلي.

---

## 22. خلاصة تنفيذية نهائية

SAP Manufacturing / PP يقدم نموذجًا ناضجًا لإدارة الإنتاج لأنه يربط كل مرحلة بما قبلها وما بعدها.

أهم ما يجب فهمه:

1. لا إنتاج صحيح دون Material Master صحيح.
2. لا تخطيط صحيح دون BOM وRouting وProduction Version.
3. Planned Order تخطيط، وليس تنفيذ.
4. Production Order هو مركز التنفيذ والتكلفة.
5. GI يصرف المواد ويزيد WIP.
6. Confirmation يسجل الورشة ويحمل Activity Cost.
7. GR يستلم المنتج لكنه لا يغلق الدورة ماليًا.
8. Quality تمنع إتاحة منتج غير مفحوص عند الحاجة.
9. WIP وVariance يكشفان جودة التنفيذ والبيانات.
10. Settlement يحسم الأثر المالي.
11. TECO إغلاق فني، وCLSD إغلاق نهائي.
12. Universal Journal يربط الإنتاج بالمالية.
13. COGI وCO1P مؤشرات خطر مهمة بعد التشغيل.
14. أي ERP محلي جاد يجب أن يدعم الحد الأدنى من هذه العلاقات، حتى لو بصورة أبسط من SAP.
