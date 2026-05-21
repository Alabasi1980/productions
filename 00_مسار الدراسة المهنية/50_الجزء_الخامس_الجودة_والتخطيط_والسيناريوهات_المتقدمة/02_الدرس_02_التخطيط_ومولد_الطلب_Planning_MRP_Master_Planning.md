# الدرس 02: التخطيط ومولد الطلب Planning MRP Master Planning

## لماذا هذا الدرس مهم

لأن الإنتاج القوي لا يبدأ من أمر الإنتاج وحده، بل من منطق يولد هذا الأمر أصلًا. إذا لم تفهم Planning وMRP وMaster Planning، فسترى أوامر الإنتاج كأنها تظهر من فراغ، ولن تستطيع تفسير لماذا وُلد أمر معيّن، ولماذا تأخر آخر، ولماذا يوجد نقص أو فائض في المواد.

## الهدف من الدرس

بعد هذا الدرس يجب أن تكون قادرًا على:

- شرح دور Planning وMRP وMaster Planning في بيئة التصنيع.
- التمييز بين الطلب Demand وبين مقترح التوريد Supply proposal.
- فهم Planned Orders أو Planned Production Orders قبل تحويلها إلى أوامر تنفيذية.
- ربط التخطيط بالمواد والطاقة والوقت.

## الشرح المفاهيمي الأساسي

التخطيط Planning هو المنطقة التي يجيب فيها النظام عن السؤال التالي:

إذا كان عندي طلب متوقع أو فعلي، فما الذي يجب أن أشتريه أو أنتجه ومتى؟

### ما الذي يقرأه نظام التخطيط؟

عادة يقرأ:

- Demand من Forecast أو Sales Orders أو replenishment rules
- On-hand stock
- Open supply
- BOM explosion أو product structure
- Lead times
- Lot sizing
- Capacity considerations عند الحاجة

### ما الذي ينتجه؟

ينتج مقترحات مثل:

- Planned Order
- Planned Production Order
- Purchase Requisition
- Supply suggestion

هذه المخرجات ليست تنفيذًا بعد. هي توصيات مبنية على منطق التخطيط.

### لماذا هذا مهم؟

لأن الفصل بين Planning وExecution يمنع كثيرًا من الفوضى:

- لا تتحول كل حاجة مباشرة إلى أمر تنفيذي.
- توجد مساحة للمراجعة والتحقق.
- يمكن إعادة الجدولة rescheduling قبل الالتزام التشغيلي.
- يمكن اكتشاف مشاكل المواد والطاقة قبل نزولها للصالة.

## كيف يظهر المفهوم في الأنظمة الثلاثة

### Dynamics 365

في Dynamics يظهر هذا عبر Master Planning، الذي يولد Planned Production Orders وPlanned Purchase Orders وفق الطلب والتغطية Coverage والإصدارات النشطة والقيود الزمنية والطاقة عند الحاجة.

### Oracle Fusion Cloud

في Oracle يظهر التخطيط عبر Supply Chain Planning أو Min-Max logic أو مصادر أخرى تولد توصيات تتحول لاحقًا إلى Work Orders أو Supply decisions. وهنا يكون السؤال المهم: من أين يأتي Work Order Source؟

### SAP S/4HANA

في SAP يظهر المفهوم بوضوح شديد عبر MRP ثم Planned Orders ثم Conversion إلى Production Order أو Process Order أو Purchase Requisition. وهذه من أهم المناطق التي يجب أن يفهمها أي مستشار تصنيع في SAP.

## منظور المستشار Functional Consultant View

عند جمع المتطلبات، لا تسأل فقط: هل تستخدمون MRP؟

بل اسأل:

- ما مصادر الطلب: Forecast أم Sales Orders أم Min-Max أم تخطيط يدوي؟
- هل المقترحات تراجع قبل firming أو conversion؟
- هل يوجد فصل واضح بين المخطط Planner والمنفذ Scheduler أو Production supervisor؟
- هل التخطيط يأخذ المواد فقط أم المواد والطاقة معًا؟
- ما الرسائل أو الاستثناءات التخطيطية التي يجب مراقبتها؟

هذه الأسئلة مهمة لأن ضعف التخطيط لا يظهر فقط في شاشة التخطيط، بل يظهر لاحقًا في:

- أوامر غير ضرورية
- نقص مواد
- تأخير تنفيذ
- WIP غير مبرر
- Variances تبدو تنفيذية لكن أصلها تخطيطي

## الأخطاء الشائعة Common Mistakes

- اعتبار Planned Order أمرًا تنفيذيًا.
- تحويل كل المقترحات مباشرة دون مراجعة.
- إهمال أثر Lot Size وLead Time على الخطة.
- ربط التخطيط بالمواد فقط وإهمال الطاقة Capacity.
- تجاهل الاستثناءات التخطيطية exceptions حتى تصبح أزمة تنفيذ.

## المراجعة السريعة Quick Review

- Planning يجيب: ماذا ننتج أو نشتري ومتى.
- MRP أو Master Planning لا ينفذ، بل يقترح.
- Planned Orders هي جسر بين الطلب والتنفيذ.
- جودة التخطيط تؤثر مباشرة على جودة التنفيذ والتكلفة.

## مهمة الدرس Study Task

اكتب شرحًا موجزًا يوضح لماذا يجب على مدير الإنتاج أن يميز بين:

- Demand
- Planned Order
- Production Order

وما المخاطر إذا تعامل معها كلها كشيء واحد.
