# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> 320–1440px reflow includes 200% Bangla, spacious layout and relaxed spacing
- Location: tests\homepage.spec.ts:161:1

# Error details

```
Error: Bangla 200% at 320px

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "মূল বিষয়বস্তুতে যান" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "প্রহর প্রথম পাতা" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e11]: PROHOR
          - generic [aria-hidden] [ref=e12]: "|"
          - generic [ref=e13]: প্রহর
        - generic [ref=e14]:
          - button "প্রহর ব্যবহারের ধরন বদলান" [ref=e16] [cursor=pointer]
          - button "নেভিগেশন খুলুন" [ref=e18] [cursor=pointer]
    - main [ref=e20]:
      - region "মাতৃত্বের যত্ন, প্রতিটি মায়ের মতো করে।" [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]:
            - paragraph [ref=e24]:
              - generic [ref=e26]: সংযুক্ত যত্ন। আরও মানবিক অভিজ্ঞতা।
            - heading [level=1] [ref=e27]:
              - text: মাতৃত্বের যত্ন,
              - emphasis [ref=e28]: প্রতিটি মায়ের মতো করে।
            - paragraph [ref=e29]: আপনার যত্ন, আপনার মতো।
            - paragraph [ref=e30]: "বাংলাদেশের মায়েদের জন্য প্রহর একটি সংযুক্ত জায়গা: মা ও শিশুর রেকর্ড রাখুন, সূত্রসহ বাংলায় উত্তর পান, রিপোর্ট বুঝুন, নিজের ভালো থাকার খোঁজ নিন, সেবা খুঁজুন ও মানুষের সহায়তা নিন—আপনার উপযোগী উপায়ে।"
            - generic [ref=e31]:
              - link "প্রহর ঘুরে দেখুন" [ref=e32] [cursor=pointer]:
                - /url: "#features"
              - link "কীভাবে কাজ করে দেখুন" [ref=e36] [cursor=pointer]:
                - /url: "#how-it-works"
            - list "প্রহরে কী করতে পারবেন" [ref=e39]:
              - listitem [ref=e40]:
                - generic [ref=e44]: মা ও শিশুর রেকর্ড
              - listitem [ref=e45]:
                - generic [ref=e48]: সূত্রসহ বাংলায় উত্তর
              - listitem [ref=e49]:
                - generic [ref=e54]: রিপোর্টের ব্যাখ্যা
              - listitem [ref=e55]:
                - generic [ref=e62]: ভালো থাকা
              - listitem [ref=e63]:
                - generic [ref=e69]: মানুষের সহায়তা
            - paragraph [ref=e70]: অ্যাকাউন্ট ছাড়াই ঘুরে দেখুন।
          - generic [ref=e71]:
            - img "নমুনা উত্তর, রেকর্ড ও শেয়ার করার নিয়ন্ত্রণসহ প্রহর অ্যাপের চিত্র" [ref=e72]:
              - generic [aria-hidden] [ref=e73]:
                - generic [ref=e79]: Sample data
                - generic [ref=e82]:
                  - generic [ref=e85]:
                    - strong [ref=e90]: PROHOR
                    - generic [ref=e91]: প্রহর
                  - generic [ref=e92]:
                    - generic [ref=e93]:
                      - generic [ref=e94]: YOUR CARE. YOUR WAY.
                      - paragraph [ref=e95]: আজ কী করতে চান?
                      - paragraph [ref=e96]: What would you like to do?
                      - generic [ref=e97]:
                        - generic [ref=e98]:
                          - strong [ref=e102]: Ask PROHOR
                          - generic [ref=e103]: প্রশ্ন করুন
                        - generic [ref=e104]:
                          - strong [ref=e108]: My Health
                          - generic [ref=e109]: আমার স্বাস্থ্য
                        - generic [ref=e110]:
                          - strong [ref=e118]: My Wellness
                          - generic [ref=e119]: আমার সুস্থতা
                        - generic [ref=e120]:
                          - strong [ref=e125]: Find Care
                          - generic [ref=e126]: সেবা খুঁজুন
                      - generic [ref=e127]: Your language. Your pace.
                      - paragraph [ref=e132]: Private by your choice
                    - generic [ref=e137]:
                      - generic [ref=e138]: BARTA · বার্তা
                      - paragraph [ref=e139]: আপনার ভাষায়, সূত্রসহ।
                      - paragraph [ref=e140]: Room for your questions.
                      - generic [ref=e141]:
                        - paragraph [ref=e144]: আমার পছন্দও কি গুরুত্বপূর্ণ?
                        - paragraph [ref=e145]: আপনার অভিজ্ঞতাও যত্নের অংশ।
                        - generic [ref=e146]: WHO · Antenatal care, 2016
                      - paragraph [ref=e153]: Sample educational answer. People provide clinical care.
                      - generic [ref=e154]: আপনার প্রশ্ন লিখুন
                    - generic [ref=e159]:
                      - generic [ref=e160]: JIBONREKHA · জীবনরেখা
                      - paragraph [ref=e161]: One journey. Two care stories.
                      - paragraph [ref=e162]: Your records, connected.
                      - generic [ref=e163]:
                        - strong [ref=e166]: Week 24
                        - generic [ref=e167]: Sample journey
                      - generic [ref=e168]:
                        - generic [ref=e174]:
                          - strong [ref=e175]: Mother
                          - generic [ref=e176]: Visit questions
                        - generic [ref=e182]:
                          - strong [ref=e183]: Baby
                          - generic [ref=e184]: Separate record
                      - generic [ref=e188]:
                        - text: Visit questions
                        - generic [ref=e189]: Recorded by you
                      - paragraph [ref=e192]: You choose what to share
                  - generic [ref=e197]:
                    - generic [ref=e198]: Home
                    - generic [ref=e202]: Ask
                    - generic [ref=e205]: Health
                    - generic [ref=e208]: Care
                - generic [ref=e218]:
                  - generic [ref=e219]:
                    - strong [ref=e222]: Barta
                    - generic [ref=e223]: বার্তা
                  - paragraph [ref=e224]: আমার পছন্দও কি গুরুত্বপূর্ণ?
                  - paragraph [ref=e225]: আপনার অভিজ্ঞতাও যত্নের অংশ।
                  - generic [ref=e226]: WHO · Antenatal care, 2016
                - generic [ref=e235]:
                  - strong [ref=e239]: Jibonrekha
                  - generic [ref=e240]:
                    - strong [ref=e241]: Week 24
                    - generic [ref=e242]: Your care story
                  - generic [ref=e243]:
                    - generic [ref=e249]:
                      - strong [ref=e250]: Mother
                      - generic [ref=e251]: Visit questions
                    - generic [ref=e257]:
                      - strong [ref=e258]: Baby
                      - generic [ref=e259]: Separate record
            - button "অ্যানিমেশন থামান" [ref=e260] [cursor=pointer]
      - region "এক নজরে প্রহর" [ref=e264]:
        - generic [ref=e265]:
          - generic [ref=e266]:
            - strong [ref=e267]: "8"
            - heading "সংযুক্ত মডিউল" [level=2] [ref=e268]
            - paragraph [ref=e269]: অ্যাডাপ্ট, বার্তা, সংকেত, জীবনরেখা, বুঝি, সুস্থতা, পথ, বন্ধন
          - generic [ref=e270]:
            - strong [ref=e271]: "24"
            - heading "পরিকল্পিত সুবিধা" [level=2] [ref=e272]
            - link "এক পরিকল্পনায় প্রতিটির স্পষ্ট অবস্থান" [ref=e273] [cursor=pointer]:
              - /url: "#roadmap"
          - generic [ref=e277]:
            - strong [ref=e278]: "0"
            - heading "বেছে নেওয়ার অক্ষমতার শ্রেণি" [level=2] [ref=e279]
            - paragraph [ref=e280]: প্রতিটি মায়ের জন্য একই যত্ন; পরিচয়ের শ্রেণি নয়, নিজের পছন্দ
          - generic [ref=e281]:
            - strong [ref=e282]: "2"
            - heading "রেকর্ড, ১ যাত্রা" [level=2] [ref=e283]
            - paragraph [ref=e284]: এক সময়রেখায় মা ও শিশুর রেকর্ড থাকে আলাদা
      - region "মাতৃত্ব একটি যাত্রা। যত্ন যেন ধাঁধা না হয়।" [ref=e285]:
        - generic [ref=e286]:
          - generic [ref=e287]:
            - paragraph [ref=e288]:
              - generic [ref=e290]: কেন প্রহর
            - heading [level=2] [ref=e291]:
              - text: মাতৃত্ব একটি যাত্রা।
              - emphasis [ref=e292]: যত্ন যেন ধাঁধা না হয়।
            - list [ref=e293]:
              - listitem [ref=e294]:
                - generic [ref=e299]:
                  - heading "ছড়ানো কমুক। সংযোগ বাড়ুক।" [level=3] [ref=e300]
                  - paragraph [ref=e301]: রেকর্ড, প্রশ্ন ও সাক্ষাৎ থাকুক একই গল্পে।
              - listitem [ref=e302]:
                - generic [ref=e305]:
                  - heading "বাধা কমুক। পথ বাড়ুক।" [level=3] [ref=e306]
                  - paragraph [ref=e307]: ভাষা, ছোট লেখা ও শুধু কণ্ঠের কাজ যেন যত্নের পথে বাধা না হয়।
              - listitem [ref=e308]:
                - generic [ref=e313]:
                  - heading "জন্মের পরেও। আপনার জন্যও।" [level=3] [ref=e314]
                  - paragraph [ref=e315]: শিশুর শুরু মায়ের যত্নেরও আরেক অধ্যায়।
            - generic [ref=e316]:
              - paragraph [ref=e317]:
                - text: ২০২৩ সালে বাংলাদেশে আনুমানিক ৪,০০০ মাতৃমৃত্যু; ২০০০ সালের তুলনায় মাতৃমৃত্যুর অনুপাত ৭৯% কম।
                - link "জাতিসংঘের হিসাব · বিশ্ব স্বাস্থ্য সংস্থা, ইউনিসেফ, ইউএনএফপিএ · ২০২৫ (opens in a new tab)" [ref=e318] [cursor=pointer]:
                  - /url: https://www.unicef.org/bangladesh/en/press-releases/uncertainty-aid-commitments-threatens-bangladeshs-progress-maternal-health-unicef
                  - text: জাতিসংঘের হিসাব · বিশ্ব স্বাস্থ্য সংস্থা, ইউনিসেফ, ইউএনএফপিএ · ২০২৫
                  - generic [ref=e319]: (opens in a new tab)
              - paragraph [ref=e320]:
                - text: মাতৃমৃত্যুর শিকার প্রতি ৩ জন নারীর ১ জন তিন বা তার বেশি স্থানে সেবা চেয়েছিলেন।
                - link "BMMS 2016 · Journal of Global Health, 2023 (opens in a new tab)" [ref=e321] [cursor=pointer]:
                  - /url: https://pmc.ncbi.nlm.nih.gov/articles/PMC10248997/
                  - text: BMMS 2016 · Journal of Global Health, 2023
                  - generic [ref=e322]: (opens in a new tab)
          - generic [ref=e323]:
            - img "ছবির স্থানধারক। নির্ধারিত মায়ের ছবিটি পাওয়া যায়নি।" [ref=e325]
            - generic [ref=e331]: এখানে একটি রিপোর্ট।
            - generic [ref=e339]: ওখানে একটি সাক্ষাৎ।
            - generic [ref=e352]: যত্নই রাখুক সব একসঙ্গে।
      - region "একই যত্ন। আপনার মতো।" [ref=e355]:
        - generic [ref=e356]:
          - generic [ref=e357]:
            - generic [ref=e358]:
              - paragraph [ref=e359]:
                - generic [ref=e361]: ভিন্ন পছন্দের কথা ভেবে
              - heading [level=2] [ref=e362]:
                - text: একই যত্ন।
                - emphasis [ref=e363]: আপনার মতো।
            - paragraph [ref=e364]: সাক্ষাতের একই প্রশ্নের তিনটি উপস্থাপনা। প্রশ্ন লিখে দেখুন। উপস্থাপনা বদলালেও আপনার লেখা থাকবে।
          - region "সাক্ষাতের প্রশ্নের উপস্থাপনা" [ref=e365]:
            - group "স্পর্শ ও লেখা" [ref=e366]:
              - generic [ref=e367]:
                - generic [ref=e368]: স্পর্শ ও লেখা
                - generic [ref=e369]: Sample data
              - region "স্পর্শ ও লেখা পর্দা" [ref=e381]:
                - generic [ref=e382]:
                  - paragraph [ref=e383]: আপনার পরের সাক্ষাৎ
                  - heading "আপনার ভাষায় একটি প্রশ্ন।" [level=3] [ref=e384]
                - generic [ref=e385]: আপনি কী জানতে চান?
                - textbox "আপনি কী জানতে চান?" [ref=e386]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                - paragraph [ref=e387]: How can I prepare for my next visit?
                - button "আমার প্রশ্ন দেখুন" [ref=e388] [cursor=pointer]
                - paragraph [ref=e391]: আপনার কথা। আপনার পছন্দ।
            - group "বড় লেখা ও বেশি কনট্রাস্ট" [ref=e398]:
              - generic [ref=e399]:
                - generic [ref=e400]: বড় লেখা ও বেশি কনট্রাস্ট
                - generic [ref=e401]: Sample data
              - region "বড় লেখা ও বেশি কনট্রাস্ট পর্দা" [ref=e413]:
                - heading "আপনার ভাষায় একটি প্রশ্ন।" [level=3] [ref=e415]
                - generic [ref=e416]: আপনি কী জানতে চান?
                - textbox "আপনি কী জানতে চান?" [ref=e417]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                - paragraph [ref=e418]: How can I prepare for my next visit?
                - button "আমার প্রশ্ন দেখুন" [ref=e419] [cursor=pointer]
            - group "ছবি ও লেখা" [ref=e424]:
              - generic [ref=e425]:
                - generic [ref=e426]: ছবি ও লেখা
                - generic [ref=e427]: Sample data
              - region "ছবি ও লেখা পর্দা" [ref=e439]:
                - generic [ref=e440]:
                  - paragraph [ref=e441]: আপনার পরের সাক্ষাৎ
                  - heading "আপনার ভাষায় একটি প্রশ্ন।" [level=3] [ref=e442]
                - generic [ref=e443]: আপনি কী জানতে চান?
                - group "ছবি ও লেখার নমুনা বাক্যাংশ" [ref=e444]:
                  - button "আমার সাক্ষাৎ নিয়ে" [ref=e445] [cursor=pointer]
                  - button "আমার রেকর্ড নিয়ে" [ref=e450] [cursor=pointer]
                - textbox "আপনি কী জানতে চান?" [ref=e456]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                - paragraph [ref=e457]: How can I prepare for my next visit?
                - button "আমার প্রশ্ন দেখুন" [ref=e458] [cursor=pointer]
                - paragraph [ref=e461]: আপনার কথা। আপনার পছন্দ।
          - generic [ref=e468]:
            - paragraph [ref=e469]: উপস্থাপনা বদলান। আপনার কথা, পছন্দ ও অবস্থান থাকুক একই।
            - button "প্রহর ব্যবহারের ধরন বদলান" [ref=e470] [cursor=pointer]
          - status [ref=e475]
      - region "শুধু ট্র্যাকার নয়। যত্নের সঙ্গী।" [ref=e476]:
        - generic [ref=e477]:
          - generic [ref=e478]:
            - generic [ref=e479]:
              - paragraph [ref=e480]:
                - generic [ref=e482]: জীবনের কথা ভেবে যত্ন
              - heading [level=2] [ref=e483]:
                - text: শুধু ট্র্যাকার নয়।
                - emphasis [ref=e484]: যত্নের সঙ্গী।
            - paragraph [ref=e485]: বোঝাপড়া, ব্যবহারযোগ্যতা, সুরক্ষা ও মানুষের সংযোগ। সাক্ষাতের মাঝের সময়ের জন্যও বিবেচনাপূর্ণ উপায়।
          - generic [ref=e486]:
            - article [ref=e487]:
              - generic [ref=e492]:
                - text: Barta
                - generic [aria-hidden] [ref=e493]: ·
                - generic [ref=e494]: বার্তা
              - heading "প্রশ্নের পাশে থাকুক স্পষ্টতা।" [level=3] [ref=e495]
              - paragraph [ref=e496]: বাংলায় ব্যাখ্যার সঙ্গে খুলে পড়ার মতো সূত্র।
              - img "Sample data. বাংলা প্রশ্ন ও শিক্ষামূলক উত্তর, বিশ্ব স্বাস্থ্য সংস্থা ও সিডিসির সূত্র এবং প্রমাণ অপর্যাপ্ত হলে তার স্পষ্ট বার্তা। এটি পণ্যের নমুনা, সরাসরি এআই উত্তর নয়।" [ref=e497]:
                - generic [ref=e498]: Sample data
                - generic [aria-hidden] [ref=e500]:
                  - generic [ref=e501]:
                    - paragraph [ref=e502]: আমার যত্নে আমার পছন্দও কি গুরুত্বপূর্ণ?
                    - generic [ref=e503]:
                      - generic [ref=e504]: Barta
                      - paragraph [ref=e507]: মায়ের শারীরিক ও মানসিক সুস্থতার পাশাপাশি তাঁর অভিজ্ঞতাও গর্ভকালীন যত্নের অংশ।
                  - generic [ref=e508]:
                    - link [ref=e509] [cursor=pointer]:
                      - /url: https://www.who.int/publications/i/item/9789241549912
                      - generic [ref=e512]: WHO · Antenatal care, 2016
                      - generic [ref=e516]: Opens in a new tab
                    - link [ref=e517] [cursor=pointer]:
                      - /url: https://www.cdc.gov/hearher/maternal-warning-signs/index.html
                      - generic [ref=e520]: CDC · Warning signs
                      - generic [ref=e524]: Opens in a new tab
                  - paragraph [ref=e525]:
                    - generic [ref=e528]: অনুমোদিত প্রমাণ যথেষ্ট নয়? প্রহর তা জানায় এবং চিকিৎসকের কাছে জানতে পরামর্শ দেয়।
            - article [ref=e529]:
              - generic [ref=e535]:
                - text: Shonket
                - generic [aria-hidden] [ref=e536]: ·
                - generic [ref=e537]: সংকেত
              - heading "চ্যাটবটের বাইরেও সহায়তা।" [level=3] [ref=e538]
              - paragraph [ref=e539]: পর্যালোচিত সতর্কসংকেত। সহায়তার সরাসরি পথ।
              - img "Sample data. সিডিসির তিনটি সতর্কসংকেতের নমুনা, কল ৯৯৯ বোতাম ও অনুরোধের অগ্রগতি। শুধু জমা হয়েছে ধাপটি সম্পূর্ণ; পৌঁছানো, প্রাপ্তি স্বীকার ও উত্তর অপেক্ষমাণ। কোনো অনুরোধ পাঠানো হয়নি।" [ref=e540]:
                - generic [ref=e541]: Sample data
                - generic [aria-hidden] [ref=e543]:
                  - strong [ref=e544]: পর্যালোচিত সতর্কসংকেত
                  - list [ref=e545]:
                    - listitem [ref=e546]:
                      - generic [ref=e550]: তীব্র মাথাব্যথা যা কমছে না
                    - listitem [ref=e551]:
                      - generic [ref=e555]: শ্বাস নিতে কষ্ট
                    - listitem [ref=e556]:
                      - generic [ref=e560]: অতিরিক্ত রক্তপাত
                  - generic [ref=e561]:
                    - link [ref=e562] [cursor=pointer]:
                      - /url: https://www.cdc.gov/hearher/maternal-warning-signs/index.html
                      - generic [ref=e565]: CDC · Warning signs
                      - generic [ref=e569]: Opens in a new tab
                    - button [ref=e570] [cursor=pointer]: কল ৯৯৯
                  - list [ref=e576]:
                    - listitem [ref=e577]:
                      - generic [ref=e582]: জমা হয়েছে
                      - generic [ref=e583]: সম্পূর্ণ
                    - listitem [ref=e584]:
                      - generic [ref=e589]: পৌঁছেছে
                      - generic [ref=e590]: অপেক্ষমাণ
                    - listitem [ref=e591]:
                      - generic [ref=e596]: প্রাপ্তি স্বীকার
                      - generic [ref=e597]: অপেক্ষমাণ
                    - listitem [ref=e598]:
                      - generic [ref=e603]: উত্তর এসেছে
                      - generic [ref=e604]: অপেক্ষমাণ
                  - paragraph [ref=e605]: সত্যি না পৌঁছানো পর্যন্ত অনুরোধ পৌঁছেছে দেখানো হয় না।
            - article [ref=e606]:
              - generic [ref=e610]:
                - text: Adapt
                - generic [aria-hidden] [ref=e611]: ·
                - generic [ref=e612]: অ্যাডাপ্ট
              - heading "এখানে জায়গা আছে আপনার পছন্দের।" [level=3] [ref=e613]
              - paragraph [ref=e614]: নিজের লেখার আকার, থিম ও কনট্রাস্ট। যত্ন একই।
              - group "এখানেই অ্যাডাপ্ট চেষ্টা করুন" [ref=e615]:
                - generic [ref=e616]: Sample data
                - generic [ref=e618]:
                  - generic [ref=e619]: লেখার আকার
                  - group "নমুনা লেখার আকার" [ref=e620]:
                    - button "A নমুনা লেখার আকার" [pressed] [ref=e621] [cursor=pointer]: A
                    - button "A+ নমুনা লেখার আকার" [ref=e622] [cursor=pointer]: A+
                    - button "A++ নমুনা লেখার আকার" [ref=e623] [cursor=pointer]: A++
                - generic [ref=e624]:
                  - paragraph [ref=e625]: আপনার যত্ন, আপনার মতো।
                  - paragraph [ref=e626]: Your care. Your way.
                - generic [ref=e627]:
                  - generic [ref=e628]: থিম
                  - group "নমুনা থিম" [ref=e629]:
                    - button "Quiet Garden" [pressed] [ref=e630] [cursor=pointer]
                    - button "Original Rose" [ref=e633] [cursor=pointer]: R
                    - button "Morning Mist" [ref=e634] [cursor=pointer]: M
                - generic [ref=e635] [cursor=pointer]:
                  - generic [ref=e636]: বেশি কনট্রাস্ট
                  - switch "বেশি কনট্রাস্ট" [ref=e637]
                - group "নমুনা বাক্য বাছুন" [ref=e640]:
                  - button "আমার সাহায্য দরকার" [ref=e641] [cursor=pointer]
                  - button "আমার একটি প্রশ্ন আছে" [ref=e648] [cursor=pointer]
                - generic [ref=e652]:
                  - button "পড়ে শোনান" [ref=e653] [cursor=pointer]
                  - generic [ref=e658]: শুধু এই নমুনায়
                - status [ref=e659]: পাতার সেটিংস আপনার পছন্দমতোই থাকবে।
            - article [ref=e660]:
              - generic [ref=e668]:
                - text: Bondhon
                - generic [aria-hidden] [ref=e669]: ·
                - generic [ref=e670]: বন্ধন
              - heading "অনুমতি নিয়েই সংযোগ।" [level=3] [ref=e671]
              - paragraph [ref=e672]: শেয়ারের আগে মানুষ ও রেকর্ড বেছে নিন।
              - img "Sample data. মা থেকে বাছাই করা সহায়ক, তারপর সেবাদাতা। সাক্ষাতের প্রশ্ন বাছা, রিপোর্ট বাছা নয়। ডায়েরি ও এআই কথোপকথন ব্যক্তিগত। নমুনা কার্যকলাপ ও অনুমতি প্রত্যাহারের বোতাম সম্মতির ধারণা দেখায়; কোনো রেকর্ড শেয়ার হয় না।" [ref=e673]:
                - generic [ref=e674]: Sample data
                - generic [aria-hidden] [ref=e676]:
                  - generic [ref=e677]:
                    - generic [ref=e678]: মা
                    - generic [ref=e685]: বাছাই করা সহায়ক
                    - generic [ref=e694]: সেবাদাতা
                  - generic [ref=e699]:
                    - generic [ref=e700]:
                      - generic [ref=e701]: সাক্ষাতের প্রশ্ন
                      - generic [ref=e705]: চালু
                    - generic [ref=e706]:
                      - generic [ref=e707]: বাছাই করা রিপোর্ট
                      - generic [ref=e711]: বন্ধ
                  - generic [ref=e712]:
                    - generic [ref=e717]: ডায়েরি ও এআই কথোপকথন
                    - generic [ref=e718]: ব্যক্তিগত
                  - paragraph [ref=e719]: শেয়ারের আগে আপনার পর্যালোচনা।
                  - paragraph [ref=e723]:
                    - generic [ref=e727]: "কার্যকলাপ: সহায়ক আজ সাক্ষাতের তথ্য দেখেছেন"
                  - button [ref=e728] [cursor=pointer]: অনুমতি প্রত্যাহার
      - region "এক অ্যাপ, পুরো যাত্রার জন্য।" [ref=e732]:
        - generic [ref=e733]:
          - generic [ref=e734]:
            - generic [ref=e735]:
              - paragraph [ref=e736]:
                - generic [ref=e738]: আট মডিউল, একই ভিত্তি
              - heading [level=2] [ref=e739]:
                - text: এক অ্যাপ,
                - emphasis [ref=e740]: পুরো যাত্রার জন্য।
            - paragraph [ref=e741]: প্রথম প্রশ্ন থেকে জন্মের পরের অধ্যায়। আপনার পছন্দ ও অনুমতি থাকুক একই অভিজ্ঞতার অংশ।
          - generic [ref=e746]:
            - strong [ref=e747]: একটি ওয়েব অ্যাপ। ফোনের ব্রাউজারেই ব্যবহার করুন।
            - paragraph [ref=e748]: ব্রাউজারের মেনু থেকে হোম স্ক্রিনে যোগ করুন।
          - navigation "প্রহরের আটটি মডিউল" [ref=e749]:
            - link "Adapt অ্যাডাপ্ট" [ref=e750] [cursor=pointer]:
              - /url: "#module-adapt"
              - generic [ref=e753]:
                - strong [ref=e754]: Adapt
                - generic [ref=e755]: অ্যাডাপ্ট
            - link "Barta বার্তা" [ref=e756] [cursor=pointer]:
              - /url: "#module-barta"
              - generic [ref=e760]:
                - strong [ref=e761]: Barta
                - generic [ref=e762]: বার্তা
            - link "Shonket সংকেত" [ref=e763] [cursor=pointer]:
              - /url: "#module-shonket"
              - generic [ref=e768]:
                - strong [ref=e769]: Shonket
                - generic [ref=e770]: সংকেত
            - link "Jibonrekha জীবনরেখা" [ref=e771] [cursor=pointer]:
              - /url: "#module-jibonrekha"
              - generic [ref=e775]:
                - strong [ref=e776]: Jibonrekha
                - generic [ref=e777]: জীবনরেখা
            - link "Bujhi বুঝি" [ref=e778] [cursor=pointer]:
              - /url: "#module-bujhi"
              - generic [ref=e784]:
                - strong [ref=e785]: Bujhi
                - generic [ref=e786]: বুঝি
            - link "Shusthota সুস্থতা" [ref=e787] [cursor=pointer]:
              - /url: "#module-shusthota"
              - generic [ref=e795]:
                - strong [ref=e796]: Shusthota
                - generic [ref=e797]: সুস্থতা
            - link "Poth পথ" [ref=e798] [cursor=pointer]:
              - /url: "#module-poth"
              - generic [ref=e803]:
                - strong [ref=e804]: Poth
                - generic [ref=e805]: পথ
            - link "Bondhon বন্ধন" [ref=e806] [cursor=pointer]:
              - /url: "#module-bondhon"
              - generic [ref=e813]:
                - strong [ref=e814]: Bondhon
                - generic [ref=e815]: বন্ধন
          - generic "সেবাদাতার কর্মক্ষেত্রের ধারণা" [ref=e816]:
            - generic [ref=e817]: অনুরোধের তালিকা
            - generic [ref=e820]: সম্মতিসহ রেকর্ড
            - generic [ref=e823]: পছন্দের যোগাযোগ
            - generic [ref=e826]: কার্যকলাপের ইতিহাস
          - region "এক অ্যাপ, পুরো যাত্রার জন্য।" [ref=e829]:
            - article [ref=e830]:
              - group "Jibonrekha" [ref=e831]:
                - generic [ref=e832]:
                  - generic [ref=e833]: Jibonrekha
                  - generic [ref=e834]: Sample data
                - region "Jibonrekha পর্দা" [ref=e846]:
                  - generic [ref=e847]:
                    - paragraph [ref=e848]: Jibonrekha · জীবনরেখা
                    - heading "যত্নের গল্প একসঙ্গে।" [level=3] [ref=e849]
                  - generic [ref=e850]:
                    - generic [ref=e856]:
                      - generic [ref=e857]: মা
                      - strong [ref=e858]: ২৪তম সপ্তাহ · নীলার যাত্রা
                      - paragraph [ref=e859]: পরের সাক্ষাতের প্রশ্ন
                    - generic [ref=e865]:
                      - generic [ref=e866]: শিশু
                      - strong [ref=e867]: তার নিজের গল্প
                      - paragraph [ref=e868]: শুরু থেকেই আলাদা রেকর্ড
                    - generic [ref=e869]: দুটি রেকর্ড। এক ধারাবাহিক যাত্রা।
                  - generic [ref=e873]:
                    - strong [ref=e874]: সাক্ষাতের নোট
                    - generic [ref=e875]: আপনার লেখা
              - paragraph [ref=e878]:
                - emphasis [ref=e879]: Two stories, held together.
              - paragraph [ref=e880]: দুটি গল্প, একসঙ্গে।
            - article [ref=e881]:
              - group "Bujhi" [ref=e882]:
                - generic [ref=e883]:
                  - generic [ref=e884]: Bujhi
                  - generic [ref=e885]: Sample data
                - region "Bujhi পর্দা" [ref=e897]:
                  - generic [ref=e898]:
                    - paragraph [ref=e899]: Bujhi · বুঝি
                    - heading "পড়ুন। যাচাই করুন। বুঝুন।" [level=3] [ref=e900]
                  - generic [ref=e901]:
                    - strong [ref=e905]: বোঝার জন্য একটি রিপোর্ট
                    - generic [ref=e906]: visit-report.pdf
                  - generic [ref=e907]:
                    - generic [ref=e908]: নথির ধরন
                    - strong [ref=e909]: সাক্ষাতের রিপোর্ট
                  - generic [ref=e910]:
                    - generic [ref=e911]: রেকর্ডটি যাঁর
                    - strong [ref=e912]: মা · আগে যাচাই করুন
                  - list [ref=e913]:
                    - listitem [ref=e914]: আপলোড
                    - listitem [ref=e918]: যাচাই
                    - listitem [ref=e922]: নিশ্চিত
              - paragraph [ref=e927]:
                - emphasis [ref=e928]: A little more understanding.
              - paragraph [ref=e929]: আরও একটু বোঝাপড়া।
            - article [ref=e930]:
              - group "Shusthota" [ref=e931]:
                - generic [ref=e932]:
                  - generic [ref=e933]: Shusthota
                  - generic [ref=e934]: Sample data
                - region "Shusthota পর্দা" [ref=e946]:
                  - generic [ref=e947]:
                    - paragraph [ref=e948]: Shusthota · সুস্থতা
                    - heading "আজ আপনি কেমন আছেন?" [level=3] [ref=e949]
                  - group "নিজের জন্য একটু সময়" [ref=e950]:
                    - generic [ref=e952]:
                      - generic [ref=e953] [cursor=pointer]:
                        - radio "শান্ত" [checked] [ref=e954]
                        - generic [ref=e961]: শান্ত
                        - text: ✓
                      - generic [ref=e962] [cursor=pointer]:
                        - radio "ক্লান্ত" [ref=e963]
                        - generic [ref=e966]: ক্লান্ত
                      - generic [ref=e967] [cursor=pointer]:
                        - radio "অনিশ্চিত" [ref=e968]
                        - generic [ref=e971]: অনিশ্চিত
                  - generic [ref=e972]:
                    - heading "বিশ্রামের জন্য একটু জায়গা।" [level=4] [ref=e975]
                    - paragraph [ref=e976]: আপনার গতি। কোনো স্কোরের চাপ নেই।
                  - paragraph [ref=e977]: আপনার ডায়েরি আপনারই।
              - paragraph [ref=e984]:
                - emphasis [ref=e985]: Room for the person, too.
              - paragraph [ref=e986]: মানুষটির জন্যও জায়গা।
            - article [ref=e987]:
              - group "Poth" [ref=e988]:
                - generic [ref=e989]:
                  - generic [ref=e990]: Poth
                  - generic [ref=e991]: Sample data
                - region "Poth পর্দা" [ref=e1003]:
                  - generic [ref=e1004]:
                    - paragraph [ref=e1005]: Poth · পথ
                    - heading "পরের ধাপের খোঁজ।" [level=3] [ref=e1006]
                  - generic [ref=e1007]: প্রতিষ্ঠান খুঁজুন
                  - textbox "প্রতিষ্ঠান খুঁজুন" [ref=e1012]:
                    - /placeholder: এই উদাহরণগুলো খুঁজুন
                  - generic [ref=e1013]:
                    - link "ঢাকা মেডিকেল কলেজ হাসপাতাল Shahbag, Dhaka Opens DGHS in a new tab" [ref=e1014] [cursor=pointer]:
                      - /url: https://hrm.dghs.gov.bd/public/facility-registry/facilities/31/profile
                      - generic [ref=e1015]:
                        - strong [ref=e1016]: ঢাকা মেডিকেল কলেজ হাসপাতাল
                        - generic [ref=e1017]: Shahbag, Dhaka
                      - generic [ref=e1018]: Opens DGHS in a new tab
                    - link "স্যার সলিমুল্লাহ মেডিকেল কলেজ মিটফোর্ড হাসপাতাল Kotwali, Dhaka Opens DGHS in a new tab" [ref=e1019] [cursor=pointer]:
                      - /url: https://hrm.dghs.gov.bd/public/facility-registry/facilities/52/profile
                      - generic [ref=e1020]:
                        - strong [ref=e1021]: স্যার সলিমুল্লাহ মেডিকেল কলেজ মিটফোর্ড হাসপাতাল
                        - generic [ref=e1022]: Kotwali, Dhaka
                      - generic [ref=e1023]: Opens DGHS in a new tab
                  - paragraph [ref=e1024]: "সূত্র: স্বাস্থ্য অধিদপ্তরের তালিকা"
              - paragraph [ref=e1029]:
                - emphasis [ref=e1030]: A clearer way forward.
              - paragraph [ref=e1031]: সামনের পথ আরও পরিষ্কার।
      - region "একটি প্রশ্ন থেকে নিরাপদ, সম্মতিসহ সহায়তার পথে।" [ref=e1032]:
        - generic [ref=e1034]:
          - generic [ref=e1035]:
            - paragraph [ref=e1036]:
              - generic [ref=e1038]: ভেবেচিন্তে একটি পথ
            - generic [ref=e1039]: Sample data
          - generic [ref=e1040]:
            - heading [level=2] [ref=e1041]:
              - text: একটি প্রশ্ন থেকে
              - emphasis [ref=e1042]: নিরাপদ, সম্মতিসহ সহায়তার পথে।
            - paragraph [ref=e1043]: প্রশ্ন শুরু হয় তাঁর কথা থেকে। প্রমাণের সীমা স্পষ্ট থাকে। অন্য মানুষের কাছে কী পৌঁছাবে, তা নির্ধারণ করে অনুমতি।
          - list [ref=e1045]:
            - listitem [ref=e1046]:
              - generic [ref=e1047]: ধাপ 1
              - heading "তিনি প্রশ্ন করেন" [level=3] [ref=e1052]
              - paragraph [ref=e1053]: তাঁর কথাই শুরুর জায়গা।
              - img "ধাপ 1-এর নমুনা। তিনি প্রশ্ন করেন" [ref=e1054]:
                - generic [aria-hidden] [ref=e1055]:
                  - paragraph [ref=e1056]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - paragraph [ref=e1057]: How can I prepare for my next visit?
            - listitem [ref=e1058]:
              - generic [ref=e1059]: ধাপ 2
              - heading "সূত্র খুঁজে দেখা হয়" [level=3] [ref=e1064]
              - paragraph [ref=e1065]: সূত্রের সঙ্গে তার সীমাও স্পষ্ট।
              - img "ধাপ 2-এর নমুনা। সূত্র খুঁজে দেখা হয়" [ref=e1066]:
                - generic [aria-hidden] [ref=e1067]:
                  - link [ref=e1068] [cursor=pointer]:
                    - /url: https://www.who.int/publications/i/item/9789241549912
                    - generic [ref=e1071]: WHO · Antenatal care, 2016
                    - generic [ref=e1075]: Opens in a new tab
                  - generic [ref=e1076]: যথেষ্ট প্রমাণ নেই
            - listitem [ref=e1079]:
              - generic [ref=e1080]: ধাপ 3
              - heading "কী শেয়ার করবেন, তিনি বাছেন" [level=3] [ref=e1087]
              - paragraph [ref=e1088]: তাঁর পর্যালোচনা, প্রাপক ও সিদ্ধান্ত।
              - img "ধাপ 3-এর নমুনা। কী শেয়ার করবেন, তিনি বাছেন" [ref=e1089]:
                - generic [ref=e1091]:
                  - generic [ref=e1092]: আমার সাক্ষাতের প্রশ্ন
                  - generic [ref=e1095]: আমার ডায়েরি ব্যক্তিগত
            - listitem [ref=e1100]:
              - generic [ref=e1101]: ধাপ 4
              - heading "একজন মানুষ সাড়া দেন" [level=3] [ref=e1109]
              - paragraph [ref=e1110]: স্পষ্ট হস্তান্তর, মানুষের সাড়া।
              - img "ধাপ 4-এর নমুনা। নীলার কাল্পনিক অনুরোধের প্রাপ্তি স্বীকার দেখানো হয়েছে। এটি প্রকৃত সেবাদাতার উত্তর নয়।" [ref=e1111]:
                - generic [aria-hidden] [ref=e1112]:
                  - generic [ref=e1113]:
                    - generic [ref=e1118]: নীলার অনুরোধ
                    - generic [ref=e1119]: প্রাপ্তি স্বীকার
                  - paragraph [ref=e1123]: শুধু তাঁর বাছাই করা তথ্যই পৌঁছায়।
      - region "মায়ের জন্য। তাঁর পাশে থাকা মানুষের জন্য।" [ref=e1124]:
        - generic [ref=e1125]:
          - generic [ref=e1126]:
            - generic [ref=e1127]:
              - paragraph [ref=e1128]:
                - generic [ref=e1130]: দুটি জানালা, একই যত্নের গল্প
              - heading [level=2] [ref=e1131]:
                - text: মায়ের জন্য।
                - emphasis [ref=e1132]: তাঁর পাশে থাকা মানুষের জন্য।
            - paragraph [ref=e1133]: একই ভিত্তিতে প্রশ্ন করা মানুষ ও তাঁর সহায়তার প্রস্তুতি নেওয়া মানুষের জন্য আলাদা উপস্থাপনা।
          - generic [ref=e1134]:
            - article [ref=e1135]:
              - generic [ref=e1136]: মায়েদের জন্য
              - heading "আরও একটু বোঝাপড়া।" [level=3] [ref=e1137]
              - paragraph [ref=e1138]: আপনার প্রশ্ন, রেকর্ড ও পছন্দের কেন্দ্রে থাকুন আপনি।
              - list [ref=e1139]:
                - listitem [ref=e1140]: বাংলা বা ইংরেজিতে ঘুরে দেখুন
                - listitem [ref=e1143]: মা ও শিশুর রেকর্ড আলাদা রাখুন
                - listitem [ref=e1146]: কাকে যুক্ত করবেন, নিজে বেছে নিন
              - generic [ref=e1149]:
                - generic [ref=e1150]:
                  - generic [aria-hidden] [ref=e1151]: ● ● ●
                  - generic [ref=e1152]: PROHOR / My care
                  - generic [ref=e1153]: Sample data
                - generic [ref=e1154]:
                  - link "প্রহর প্রথম পাতা" [ref=e1155] [cursor=pointer]:
                    - /url: /
                    - generic [ref=e1156]: PROHOR
                    - generic [aria-hidden] [ref=e1157]: "|"
                    - generic [ref=e1158]: প্রহর
                  - heading "আজ একটু নিজের খোঁজ নিন।" [level=3] [ref=e1159]
                  - paragraph [ref=e1160]: আপনার যত্ন, এক জায়গায়।
                  - generic [ref=e1161]:
                    - link "আমার যত্নের গল্প" [ref=e1162] [cursor=pointer]:
                      - /url: "#module-jibonrekha"
                    - link "আমার প্রশ্ন" [ref=e1168] [cursor=pointer]:
                      - /url: "#module-barta"
                    - link "আমার পছন্দ" [ref=e1174] [cursor=pointer]:
                      - /url: "#module-adapt"
                  - generic [ref=e1179]: মাতৃত্ব আপনার গল্পের অংশ। কেন্দ্রে আছেন আপনি।
              - link "আপনার অভিজ্ঞতা দেখুন" [ref=e1183] [cursor=pointer]:
                - /url: "#your-way"
            - article [ref=e1187]:
              - generic [ref=e1188]: সেবাদাতাদের জন্য
              - heading "আরও একটু প্রাসঙ্গিক তথ্য।" [level=3] [ref=e1189]
              - paragraph [ref=e1190]: মায়ের বাছাই করা গল্প, তার সূত্র ও তাঁর অনুমতি।
              - list [ref=e1191]:
                - listitem [ref=e1192]: তাঁর নিজের ভাষায় প্রশ্নটি দেখুন
                - listitem [ref=e1195]: সূত্র ও অনুমতি একসঙ্গে রাখুন
                - listitem [ref=e1198]: মানুষের সঙ্গে কথোপকথনের প্রস্তুতি নিন
              - generic [ref=e1201]:
                - generic [ref=e1202]:
                  - generic [aria-hidden] [ref=e1203]: ● ● ●
                  - generic [ref=e1204]: PROHOR / Care workspace
                  - generic [ref=e1205]: Sample data
                - generic [ref=e1206]:
                  - generic [ref=e1214]:
                    - text: মায়ের বাছাই করা তথ্য
                    - heading "শোনার প্রস্তুতি নিন।" [level=3] [ref=e1215]
                  - generic [ref=e1216]:
                    - generic [ref=e1217]: প্রশ্ন
                    - generic [ref=e1218]: বাছাই করা রেকর্ড
                    - generic [ref=e1219]: অনুমতি
                  - generic [ref=e1223]:
                    - strong [ref=e1224]: নীলার সাক্ষাতের প্রশ্ন
                    - paragraph [ref=e1225]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - list [ref=e1226]:
                    - listitem [ref=e1227]: বাছাই করা রেকর্ডের তথ্য
                    - listitem [ref=e1231]: প্রতিটি নোটের দৃশ্যমান সূত্র
                    - listitem [ref=e1234]: মায়ের নির্ধারিত প্রবেশাধিকার
              - link "যত্নের সংযোগ দেখুন" [ref=e1239] [cursor=pointer]:
                - /url: "#module-bondhon"
      - region "এআই বুঝতে সাহায্য করে। মানুষই যত্ন দেন।" [ref=e1243]:
        - generic [ref=e1244]:
          - generic [ref=e1245]:
            - generic [ref=e1246]:
              - paragraph [ref=e1247]:
                - generic [ref=e1249]: বিবেচনাপূর্ণ প্রযুক্তি
              - heading [level=2] [ref=e1250]:
                - text: এআই বুঝতে সাহায্য করে।
                - emphasis [ref=e1251]: মানুষই যত্ন দেন।
            - paragraph [ref=e1252]: উপকারী প্রযুক্তির শুরু স্পষ্ট সীমায়। সঙ্গে থাকুক প্রমাণ, মানুষের তত্ত্বাবধান ও আপনার অনুমতি।
          - generic [ref=e1253]:
            - article [ref=e1254]:
              - heading "খুলে পড়ার মতো প্রমাণ।" [level=3] [ref=e1258]
              - paragraph [ref=e1259]: ব্যাখ্যার পাশে সূত্র থাকুক। উত্তর দেওয়ার মতো তথ্য না থাকলে সেটিও স্পষ্ট হোক।
              - generic [ref=e1260]:
                - generic [ref=e1261]: প্রমাণ
                - generic [ref=e1262]: মানুষের পর্যালোচনা
                - generic [ref=e1263]: রোগ নির্ণয় নয়
            - article [ref=e1264]:
              - heading "বিচারবোধ থাকুক মানুষের।" [level=3] [ref=e1271]
              - paragraph [ref=e1272]: এআই তথ্য বুঝতে সাহায্য করে। চিকিৎসার সিদ্ধান্ত ও প্রকৃত যত্ন যোগ্য মানুষের কাজ।
              - generic [ref=e1273]:
                - generic [ref=e1274]: প্রমাণ
                - generic [ref=e1275]: মানুষের পর্যালোচনা
                - generic [ref=e1276]: রোগ নির্ণয় নয়
            - article [ref=e1277]:
              - heading "অনুমতি থাকুক আপনারই।" [level=3] [ref=e1283]
              - paragraph [ref=e1284]: প্রাপক, উদ্দেশ্য ও রেকর্ড বেছে নিন। ডায়েরি ও এআই কথোপকথন স্বাভাবিকভাবে শেয়ার হবে না।
              - generic [ref=e1285]:
                - generic [ref=e1286]: প্রমাণ
                - generic [ref=e1287]: মানুষের পর্যালোচনা
                - generic [ref=e1288]: রোগ নির্ণয় নয়
      - region "যত্ন নিয়ে গড়া। যত্নশীল মানুষের হাতে।" [ref=e1289]:
        - generic [ref=e1290]:
          - generic [ref=e1291]:
            - generic [ref=e1292]:
              - paragraph [ref=e1293]:
                - generic [ref=e1295]: প্রহরের পেছনের মানুষ
              - heading [level=2] [ref=e1296]:
                - text: যত্ন নিয়ে গড়া।
                - emphasis [ref=e1297]: যত্নশীল মানুষের হাতে।
            - paragraph [ref=e1298]: সবার জন্য নকশা, প্রযুক্তি ও মাতৃযত্নের দৈনন্দিন খুঁটিনাটি নিয়ে একটি সম্মিলিত প্রচেষ্টা।
          - generic [ref=e1299]:
            - article [ref=e1300]:
              - generic [aria-hidden] [ref=e1302]: O
              - heading "Omor" [level=3] [ref=e1303]
              - paragraph [ref=e1304]: প্রকল্প পরিচালনা ও প্ল্যাটফর্ম
            - article [ref=e1305]:
              - generic [aria-hidden] [ref=e1307]: I
              - heading "Iftee" [level=3] [ref=e1308]
              - paragraph [ref=e1309]: সবার জন্য ইউআই ও প্রবেশগম্যতা
            - article [ref=e1310]:
              - generic [aria-hidden] [ref=e1312]: I
              - heading "Ifty" [level=3] [ref=e1313]
              - paragraph [ref=e1314]: এআই ও তথ্য অনুসন্ধান
            - article [ref=e1315]:
              - generic [aria-hidden] [ref=e1317]: A
              - heading "Apubo" [level=3] [ref=e1318]
              - paragraph [ref=e1319]: মা ও শিশুর রেকর্ড
            - article [ref=e1320]:
              - generic [aria-hidden] [ref=e1322]: S
              - heading "Samin" [level=3] [ref=e1323]
              - paragraph [ref=e1324]: ভালো থাকা ও সেবার পথনির্দেশ
      - region "যা গড়ে উঠছে।" [ref=e1325]:
        - generic [ref=e1326]:
          - generic [ref=e1327]:
            - generic [ref=e1328]:
              - paragraph [ref=e1329]:
                - generic [ref=e1331]: বড় স্বপ্ন। স্পষ্ট বাস্তবতা।
              - heading [level=2] [ref=e1332]:
                - emphasis [ref=e1333]: যা গড়ে উঠছে।
            - paragraph [ref=e1334]: এই ব্রাউজারের ব্যবহার-পছন্দের নিয়ন্ত্রণ কাজ করে। যত্নের পূর্ণ পরিকল্পনা এবং প্রতিটি সুবিধার অবস্থান দেখুন।
          - group "অবস্থান অনুযায়ী সুবিধা বাছাই" [ref=e1335]:
            - button "সব 24" [pressed] [ref=e1336] [cursor=pointer]:
              - generic [ref=e1341]: সব
              - generic [ref=e1342]: "24"
            - button "চলমান 0" [disabled] [ref=e1343]:
              - generic [ref=e1346]: চলমান
              - generic [ref=e1347]: "0"
            - button "সীমিত 1" [ref=e1348] [cursor=pointer]:
              - generic [ref=e1358]: সীমিত
              - generic [ref=e1359]: "1"
            - button "নমুনা 0" [disabled] [ref=e1360]:
              - generic [ref=e1364]: নমুনা
              - generic [ref=e1365]: "0"
            - button "ভবিষ্যৎ 23" [ref=e1366] [cursor=pointer]:
              - generic [ref=e1370]: ভবিষ্যৎ
              - generic [ref=e1371]: "23"
          - paragraph [ref=e1372]: চলমান বা সীমিত সুবিধা আছে
          - generic [ref=e1373]:
            - tablist "পরিকল্পনার মডিউল" [ref=e1374]:
              - tab "Adapt 1" [selected] [ref=e1375] [cursor=pointer]:
                - generic [ref=e1377]: Adapt
                - generic [ref=e1379]: "1"
              - tab "Barta 3" [ref=e1380] [cursor=pointer]:
                - generic [ref=e1383]: Barta
                - generic [ref=e1384]: "3"
              - tab "Shonket 2" [ref=e1385] [cursor=pointer]:
                - generic [ref=e1389]: Shonket
                - generic [ref=e1390]: "2"
              - tab "Jibonrekha 4" [ref=e1391] [cursor=pointer]:
                - generic [ref=e1394]: Jibonrekha
                - generic [ref=e1395]: "4"
              - tab "Bujhi 1" [ref=e1396] [cursor=pointer]:
                - generic [ref=e1401]: Bujhi
                - generic [ref=e1402]: "1"
              - tab "Shusthota 2" [ref=e1403] [cursor=pointer]:
                - generic [ref=e1410]: Shusthota
                - generic [ref=e1411]: "2"
              - tab "Poth 4" [ref=e1412] [cursor=pointer]:
                - generic [ref=e1416]: Poth
                - generic [ref=e1417]: "4"
              - tab "Bondhon 7" [ref=e1418] [cursor=pointer]:
                - generic [ref=e1424]: Bondhon
                - generic [ref=e1425]: "7"
            - tabpanel "Adapt 1" [ref=e1427]:
              - generic [ref=e1428]:
                - strong [ref=e1432]: Adapt
                - generic [ref=e1433]: 1 / 1
              - list [ref=e1434]:
                - listitem [ref=e1435]:
                  - generic "সুবিধা 1" [ref=e1436]: "01"
                  - generic [ref=e1437]:
                    - heading "সবার জন্য ব্যবহার-পছন্দের প্রোফাইল" [level=3] [ref=e1438]
                    - paragraph [ref=e1439]: এই ব্রাউজারে চেহারা ও পড়ার পছন্দ।
                  - generic [ref=e1440]: সীমিত
          - status [ref=e1450]: "Adapt: 1টি মিল থাকা সুবিধা।"
      - region "এক যত্নের যাত্রা। প্রতিটি মায়ের মতো।" [ref=e1451]:
        - generic [ref=e1454]:
          - paragraph [ref=e1455]:
            - generic [ref=e1457]: আপনার যত্ন। আপনার মতো।
          - heading [level=2] [ref=e1458]:
            - text: এক যত্নের যাত্রা।
            - emphasis [ref=e1459]: প্রতিটি মায়ের মতো।
          - paragraph [ref=e1460]: আরও সংযুক্ত ভবিষ্যতের শুরু প্রতিটি মায়ের জন্য জায়গা করে দিয়ে।
          - generic [ref=e1461]:
            - button "প্রহরকে আপনার মতো করুন" [ref=e1462] [cursor=pointer]
            - link "যাত্রাটি ঘুরে দেখুন" [ref=e1466] [cursor=pointer]:
              - /url: "#features"
          - paragraph [ref=e1469]: শিক্ষামূলক পণ্যের প্রোটোটাইপ; চিকিৎসাসেবা ও সেবাদাতার কাছে তথ্য পাঠানোর সংযোগ নেই।
    - contentinfo [ref=e1470]:
      - generic [ref=e1471]:
        - generic [ref=e1472]:
          - generic [ref=e1473]:
            - link "প্রহর প্রথম পাতা" [ref=e1474] [cursor=pointer]:
              - /url: /
              - generic [ref=e1475]: PROHOR
              - generic [aria-hidden] [ref=e1476]: "|"
              - generic [ref=e1477]: প্রহর
            - paragraph [ref=e1478]: Your Care. Your Way.
            - paragraph [ref=e1479]: আপনার যত্ন, আপনার মতো।
            - button "প্রহর ব্যবহারের ধরন বদলান" [ref=e1480] [cursor=pointer]
          - navigation "মডিউল" [ref=e1482]:
            - heading "মডিউল" [level=2] [ref=e1483]
            - list [ref=e1484]:
              - listitem [ref=e1485]:
                - link "Adapt" [ref=e1486] [cursor=pointer]:
                  - /url: "#module-adapt"
              - listitem [ref=e1487]:
                - link "Barta" [ref=e1488] [cursor=pointer]:
                  - /url: "#module-barta"
              - listitem [ref=e1489]:
                - link "Shonket" [ref=e1490] [cursor=pointer]:
                  - /url: "#module-shonket"
              - listitem [ref=e1491]:
                - link "Jibonrekha" [ref=e1492] [cursor=pointer]:
                  - /url: "#module-jibonrekha"
              - listitem [ref=e1493]:
                - link "Bujhi" [ref=e1494] [cursor=pointer]:
                  - /url: "#module-bujhi"
              - listitem [ref=e1495]:
                - link "Shusthota" [ref=e1496] [cursor=pointer]:
                  - /url: "#module-shusthota"
              - listitem [ref=e1497]:
                - link "Poth" [ref=e1498] [cursor=pointer]:
                  - /url: "#module-poth"
              - listitem [ref=e1499]:
                - link "Bondhon" [ref=e1500] [cursor=pointer]:
                  - /url: "#module-bondhon"
          - navigation "ঘুরে দেখুন" [ref=e1501]:
            - heading "ঘুরে দেখুন" [level=2] [ref=e1502]
            - list [ref=e1503]:
              - listitem [ref=e1504]:
                - link "কেন প্রহর" [ref=e1505] [cursor=pointer]:
                  - /url: "#why-prohor"
              - listitem [ref=e1506]:
                - link "কীভাবে কাজ করে" [ref=e1507] [cursor=pointer]:
                  - /url: "#how-it-works"
              - listitem [ref=e1508]:
                - link "দায়িত্বশীল এআই" [ref=e1509] [cursor=pointer]:
                  - /url: "#responsible-ai"
              - listitem [ref=e1510]:
                - link "পরিকল্পনা" [ref=e1511] [cursor=pointer]:
                  - /url: "#roadmap"
          - navigation "শুরু করুন" [ref=e1512]:
            - heading "শুরু করুন" [level=2] [ref=e1513]
            - list [ref=e1514]:
              - listitem [ref=e1515]:
                - link "প্রহর ঘুরে দেখুন" [ref=e1516] [cursor=pointer]:
                  - /url: "#features"
              - listitem [ref=e1520]:
                - button "সাইন ইন" [ref=e1521] [cursor=pointer]
        - generic [ref=e1525]:
          - generic [ref=e1526]: © 2026 PROHOR
          - paragraph [ref=e1527]: নমুনা তথ্যসহ প্রোটোটাইপ। চিকিৎসা বা জরুরি সেবা নয়। জরুরি অবস্থায় ৯৯৯-এ কল করুন।
          - button "প্রথম পাতার ভাষা ইংরেজি করুন" [ref=e1528] [cursor=pointer]:
            - generic [ref=e1529]: বাংলা
            - generic [aria-hidden] [ref=e1530]: /
            - generic [ref=e1531]: EN
  - alert [ref=e1532]
```

# Test source

```ts
  65  |   await expect(page.getByRole("tabpanel").locator(".story-capability-number")).toHaveText(["04", "23"]);
  66  |   await page.keyboard.press("End");
  67  |   await expect(page.getByRole("tab", { name: "Bondhon 7", exact: true })).toBeFocused();
  68  |   await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(7);
  69  |   await filters.getByRole("button", { name: "Limited 1", exact: true }).click();
  70  |   await expect(page.getByRole("tab", { name: "Adapt 1", exact: true })).toHaveAttribute("aria-selected", "true");
  71  |   await page.getByRole("tab", { name: "Bondhon 7", exact: true }).click();
  72  |   await expect(filters.getByRole("button", { name: "All 24", exact: true })).toHaveAttribute("aria-pressed", "true");
  73  |   await page.setViewportSize({ width: 390, height: 844 });
  74  |   await expect(page.getByRole("tablist")).toHaveAttribute("aria-orientation", "horizontal");
  75  |   await page.getByRole("tab", { name: "Bondhon 7", exact: true }).focus(); await page.keyboard.press("Home"); await page.keyboard.press("ArrowRight");
  76  |   await expect(page.getByRole("tab", { name: "Barta 3", exact: true })).toBeFocused();
  77  |   await page.keyboard.press("Tab"); await expect(page.getByRole("tabpanel")).toBeFocused();
  78  | });
  79  | 
  80  | test("refined lines, compact cards, matching phones and footer navigation", async ({ page }) => {
  81  |   await page.setViewportSize({ width: 1440, height: 1050 }); await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  82  |   const before = await page.locator(".story-problem-copy").boundingBox(); const visual = await page.locator(".story-problem-visual").boundingBox(); expect(before!.x).toBeLessThan(visual!.x);
  83  |   await expect(page.locator(".section-eyebrow")).toHaveCount(11);
  84  |   await expect(page.locator(".section-eyebrow-line[aria-hidden=true]")).toHaveCount(11);
  85  |   await expect(page.locator(".upgrade-product-strip")).toHaveCSS("border-top-width", "1px");
  86  |   await expect(page.locator(".upgrade-product-strip")).toHaveCSS("border-bottom-width", "1px");
  87  |   await expect(page.locator(".upgrade-product-grid > div").nth(1)).toHaveCSS("border-left-width", "1px");
  88  |   for (const selector of [".story-visit-phones", ".upgrade-showcase-phones"]) {
  89  |     const boxes = await page.locator(`${selector} .story-phone`).evaluateAll(elements => elements.map(element => { const box = element.getBoundingClientRect(); return { width: box.width, height: box.height, top: box.top }; }));
  90  |     expect(Math.max(...boxes.map(box => box.width))).toBeLessThanOrEqual(261); expect(Math.max(...boxes.map(box => box.height))-Math.min(...boxes.map(box => box.height))).toBeLessThan(1); expect(Math.max(...boxes.map(box => box.top))-Math.min(...boxes.map(box => box.top))).toBeLessThan(1);
  91  |     expect(Math.abs(boxes[0].height / boxes[0].width - 19 / 9)).toBeLessThan(.01);
  92  |   }
  93  |   const cards = await page.locator(".care-bento > article").evaluateAll(elements => elements.map(element => element.getBoundingClientRect().height)); expect(Math.max(...cards) - Math.min(...cards)).toBeLessThan(1);
  94  |   expect(await page.locator('.care-bento [lang="bn"]').evaluateAll(elements => elements.every(element => getComputedStyle(element).fontFamily.includes("Noto Sans Bengali")))).toBe(true);
  95  |   await expect(page.locator("footer nav")).toHaveCount(3); await expect(page.locator(".refined-footer-modules a")).toHaveCount(8);
  96  |   await page.locator("footer").getByRole("button", { name: "Switch homepage language to Bangla", exact: true }).click(); await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  97  |   await page.setViewportSize({ width: 390, height: 844 });
  98  |   await expect(page.locator(".upgrade-product-grid > div").nth(1)).toHaveCSS("border-top-width", "1px");
  99  |   await expect(page.locator(".upgrade-product-grid > div").nth(1)).toHaveCSS("border-left-width", "0px");
  100 |   const positions = await page.locator(".story-problem-grid > div").evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top)); expect(positions[0]).toBeLessThan(positions[1]);
  101 |   for (const selector of [".story-visit-phones", ".upgrade-showcase-phones"]) expect(await page.locator(selector).evaluate(element => element.scrollWidth > element.clientWidth && getComputedStyle(element).scrollSnapType === "x mandatory")).toBe(true);
  102 | });
  103 | 
  104 | test("Default has real Fraunces italic and three desktop lines; other presets keep their roles", async ({ page }) => {
  105 |   await page.setViewportSize({ width: 1440, height: 1050 }); await page.goto("/"); await page.evaluate(() => document.fonts.ready);
  106 |   const heading = page.locator("h1");
  107 |   await openPreferences(page); await page.keyboard.press("Escape");
  108 |   expect(await heading.evaluate(element => getComputedStyle(element).fontFamily)).toContain("Fraunces");
  109 |   await expect(heading.locator("em")).toHaveCSS("font-style", "italic");
  110 |   const size = await heading.evaluate(element => ({ height: element.getBoundingClientRect().height, line: parseFloat(getComputedStyle(element).lineHeight), scroll: element.scrollWidth, width: element.clientWidth }));
  111 |   expect(Math.abs(size.height - size.line * 3)).toBeLessThan(2); expect(size.scroll).toBeLessThanOrEqual(size.width + 1);
  112 |   expect(await page.locator(".story-hero-description").evaluate(element => getComputedStyle(element).fontFamily)).toContain("Manrope");
  113 |   for (const font of ["rubik", "google-sans", "noto-serif", "roboto-slab"]) { await page.evaluate(value => { document.documentElement.dataset.font = value; }, font); expect(await heading.evaluate(element => getComputedStyle(element).fontFamily)).not.toContain("Fraunces"); }
  114 |   await page.evaluate(() => { document.documentElement.dataset.font = "default"; });
  115 |   await page.getByRole("button", { name: "Read this homepage in Bangla" }).click();
  116 |   await expect(heading.locator("em")).toHaveCSS("font-style", "normal");
  117 |   expect(await heading.evaluate(element => getComputedStyle(element).fontFamily)).toContain("Noto Serif Bengali");
  118 | });
  119 | 
  120 | test("keyboard completes the question and restores visible modal focus", async ({ page }) => {
  121 |   await page.goto("/"); await page.keyboard.press("Tab");
  122 |   await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  123 |   await page.keyboard.press("Enter"); await expect(page.locator("main")).toBeFocused();
  124 |   for (let step = 0; step < 25 && !(await page.locator("#visit-question-touch").evaluate(el => el === document.activeElement)); step++) await page.keyboard.press("Tab");
  125 |   await expect(page.locator("#visit-question-touch")).toBeFocused();
  126 |   await page.keyboard.press("Control+A"); await page.keyboard.type("A synthetic visit question"); await page.keyboard.press("Tab"); await page.keyboard.press("Enter");
  127 |   await expect(page.locator(".story-question-review")).toHaveCount(3);
  128 |   await expect(page.getByRole("status").filter({ hasText: "Nothing was sent" })).toBeVisible();
  129 |   const trigger = page.locator(".story-adapt-bottom button"); await trigger.focus(); await page.keyboard.press("Enter");
  130 |   const dialog = page.getByRole("dialog"); await expect(dialog).toBeVisible(); await expect(dialog.getByRole("button", { name: "Close preferences" })).toBeFocused();
  131 |   await page.keyboard.press("Shift+Tab"); expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
  132 |   await page.keyboard.press("Escape"); await expect(trigger).toBeFocused(); expect(await trigger.evaluate(el => getComputedStyle(el).outlineStyle)).toBe("solid");
  133 | });
  134 | 
  135 | test("complete phrases never duplicate and drafts survive live controls, language and preferences", async ({ page }) => {
  136 |   const calls: string[] = []; page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); }); await page.goto("/");
  137 |   const input = page.locator("#visit-question-touch"); const original = await input.inputValue();
  138 |   await page.getByRole("button", { name: "About my visit", exact: true }).click(); await page.getByRole("button", { name: "About my visit", exact: true }).click();
  139 |   await expect(input).toHaveValue(original); await expect(page.locator(".story-question-gloss")).toHaveText(Array(3).fill("How can I prepare for my next visit?"));
  140 |   await input.fill("Synthetic visit question");
  141 |   await page.locator("#module-adapt").getByRole("button", { name: "Original Rose", exact: true }).click();
  142 |   await page.locator("#module-adapt").getByRole("switch", { name: "Higher contrast", exact: true }).check();
  143 |   await expect(page.locator("html")).toHaveAttribute("data-theme", "quiet-garden"); await expect(page.locator("html")).not.toHaveAttribute("data-contrast", "more");
  144 |   await page.reload(); await expect(page.locator("html")).toHaveAttribute("lang", "en");
  145 |   await input.fill("Synthetic visit question");
  146 |   const dialog = await openPreferences(page); await dialog.getByRole("radio", { name: "Original Rose", exact: true }).check(); await dialog.getByLabel("Higher contrast ? independent of theme", { exact: true }).check(); await dialog.getByLabel("Text size", { exact: true }).selectOption("extra-large"); await dialog.getByLabel("Typeface", { exact: true }).selectOption("rubik"); await dialog.getByLabel("Layout", { exact: true }).selectOption("spacious"); await dialog.getByLabel("Relaxed text spacing", { exact: true }).check(); await dialog.getByLabel("Reduce motion", { exact: true }).check(); await dialog.getByRole("button", { name: "Done, keep exploring" }).click();
  147 |   await page.getByRole("button", { name: "Read this homepage in Bangla" }).click(); await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  148 |   for (const id of ["touch", "larger", "picture"]) await expect(page.locator(`#visit-question-${id}`)).toHaveValue("Synthetic visit question"); expect(calls).toEqual([]);
  149 |   await page.reload(); for (const [attribute, value] of [["data-theme", "original-rose"], ["data-contrast", "more"], ["data-font", "rubik"], ["data-layout", "spacious"], ["lang", "bn"]]) await expect(page.locator("html")).toHaveAttribute(attribute, value); await expect(input).toHaveValue(original);
  150 | });
  151 | 
  152 | test("facility filtering, check-in and consent stay local and truthful", async ({ page }) => {
  153 |   const calls: string[] = []; page.on("request", request => { if (request.url().includes("/api/")) calls.push(request.url()); }); await page.goto("/");
  154 |   const search = page.getByLabel("Find a facility", { exact: true }); await search.fill("Mitford"); await expect(page.locator(".story-facility-list > a")).toHaveCount(1); await expect(page.locator(".story-facility-list > a")).toHaveAttribute("href", /facilities\/52\/profile/);
  155 |   await search.fill("no example matches"); await expect(page.getByRole("status").filter({ hasText: "No match in these examples" })).toBeVisible();
  156 |   await page.getByRole("radio", { name: "Tired", exact: true }).check(); await expect(page.getByRole("radio", { name: "Tired", exact: true })).toBeChecked();
  157 |   const consent = page.locator("#module-bondhon"); await expect(consent.getByRole("img")).toHaveAccessibleName(/Sample data/); await expect(consent.getByRole("checkbox")).toHaveCount(0);
  158 |   await expect(page.locator(".care-call")).toHaveCount(1); await expect(page.locator(".care-call")).toHaveJSProperty("disabled", false); expect(calls).toEqual([]);
  159 | });
  160 | 
  161 | test("320–1440px reflow includes 200% Bangla, spacious layout and relaxed spacing", async ({ page }) => {
  162 |   await page.goto("/");
  163 |   for (const width of widths) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `English at ${width}px`).toBe(true); }
  164 |   await page.getByRole("button", { name: "Read this homepage in Bangla" }).click(); await page.evaluate(() => { document.documentElement.dataset.layout = "spacious"; document.documentElement.dataset.textSpacing = "relaxed"; document.documentElement.style.fontSize = "200%"; });
> 165 |   for (const width of widths) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Bangla 200% at ${width}px`).toBe(true); expect(await page.locator(".story-phone-body,.upgrade-mini-ui,.upgrade-product-grid,.home-nav").evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.className)), `Content at ${width}px`).toEqual([]); expect(await page.locator(".story-phone-body").evaluateAll(elements => Math.min(...elements.map(element => element.clientHeight))), `Usable screen area at ${width}px`).toBeGreaterThan(160); }
      |                                                                                                                                                                                                        ^ Error: Bangla 200% at 320px
  166 |   await page.setViewportSize({ width: 768, height: 900 }); await page.locator("main").focus();
  167 |   for (let step = 0; step < 22; step++) { await page.keyboard.press("Tab"); await page.evaluate(() => new Promise(requestAnimationFrame)); expect(await page.evaluate(() => { const el = document.activeElement!; const header = document.querySelector("header")!; return document.querySelector("main")!.contains(el) && getComputedStyle(header).position === "sticky" && el.getBoundingClientRect().top < header.getBoundingClientRect().bottom - 1; }), `Focus at step ${step}`).toBe(false); }
  168 | });
  169 | 
  170 | test("axe checks all themes, independent contrast, Bangla and both dialogs", async ({ page }) => {
  171 |   test.setTimeout(90000); await page.goto("/");
  172 |   for (const theme of themes) for (const contrast of ["normal", "more"]) { await page.evaluate(({ theme, contrast }) => { document.documentElement.dataset.theme = theme; document.documentElement.dataset.contrast = contrast; }, { theme, contrast }); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations, `${theme} ${contrast}`).toEqual([]); for (const ratio of await darkHeadingContrast(page)) expect(ratio, `4.5:1 floor for large accent text in ${theme} ${contrast}`).toBeGreaterThanOrEqual(4.5); }
  173 |   await openPreferences(page); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]); await page.keyboard.press("Escape"); await page.getByRole("button", { name: "Sign in", exact: true }).first().click(); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]); await page.keyboard.press("Escape"); await page.getByRole("button", { name: "Read this homepage in Bangla" }).click(); expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze()).violations).toEqual([]);
  174 | });
  175 | 
  176 | test("mobile menu, offline feedback, reduced motion and forced colors stay usable", async ({ page, context }) => {
  177 |   const errors: string[] = []; page.on("pageerror", error => errors.push(error.message)); await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/");
  178 |   await page.getByRole("button", { name: "Open navigation" }).click(); await page.getByRole("navigation", { name: "Mobile primary" }).getByRole("link", { name: "Features", exact: true }).click(); await expect(page.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
  179 |   await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" }); await expect(page.locator(".home-button").first()).toHaveCSS("transition-duration", "0s"); await expect(await openPreferences(page)).toBeVisible(); await page.keyboard.press("Escape");
  180 |   await context.setOffline(true); await expect(page.getByRole("status").filter({ hasText: "You’re offline" })).toBeVisible(); await context.setOffline(false); await expect(page.locator(".home-offline")).toHaveCount(0); expect(errors).toEqual([]);
  181 | });
  182 | 
```