# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> complete phrases never duplicate and drafts survive live controls, language and preferences
- Location: tests\homepage.spec.ts:135:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.check: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog').getByLabel('Higher contrast ? independent of theme', { exact: true })

```

# Page snapshot

```yaml
- generic [ref=f1e1]:
  - generic [ref=f1e2]:
    - link "Skip to main content" [ref=f1e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=f1e4]:
      - generic [ref=f1e5]:
        - link "PROHOR home" [ref=f1e6] [cursor=pointer]:
          - /url: /
          - generic [ref=f1e11]: PROHOR
          - generic [aria-hidden] [ref=f1e12]: "|"
          - generic [ref=f1e13]: প্রহর
        - navigation "Primary" [ref=f1e14]:
          - link "Why PROHOR" [ref=f1e15] [cursor=pointer]:
            - /url: "#why-prohor"
          - link "How it works" [ref=f1e16] [cursor=pointer]:
            - /url: "#how-it-works"
          - link "Features" [ref=f1e17] [cursor=pointer]:
            - /url: "#features"
          - link "Responsible AI" [ref=f1e18] [cursor=pointer]:
            - /url: "#responsible-ai"
        - generic [ref=f1e19]:
          - group "Homepage language" [ref=f1e21]:
            - button "Read this homepage in Bangla" [ref=f1e22] [cursor=pointer]: বাং
            - generic [aria-hidden] [ref=f1e23]: "|"
            - button "Read this homepage in English" [pressed] [ref=f1e24] [cursor=pointer]: EN
          - button "Adjust how you use PROHOR" [ref=f1e26] [cursor=pointer]
          - button "Sign in" [ref=f1e28] [cursor=pointer]
    - main [ref=f1e32]:
      - region "Maternal care, designed around every mother." [ref=f1e33]:
        - generic [ref=f1e34]:
          - generic [ref=f1e35]:
            - paragraph [ref=f1e36]:
              - generic [ref=f1e38]: Connected care. A more human experience.
            - heading "Maternal care, designed around every mother." [level=1] [ref=f1e39]:
              - generic [ref=f1e40]: Maternal care,
              - generic [ref=f1e41]: designed around
              - emphasis [ref=f1e42]: every mother.
            - paragraph [ref=f1e43]: আপনার যত্ন, আপনার মতো।
            - paragraph [ref=f1e44]: "PROHOR is one connected place for mothers in Bangladesh: keep mother and baby records, get Bangla answers with sources, understand your reports, notice your well-being, find care and reach real people, in the way that works for you."
            - generic [ref=f1e45]:
              - link "Explore PROHOR" [ref=f1e46] [cursor=pointer]:
                - /url: "#features"
              - link "See how it works" [ref=f1e50] [cursor=pointer]:
                - /url: "#how-it-works"
            - list "What you can do with PROHOR" [ref=f1e53]:
              - listitem [ref=f1e54]:
                - generic [ref=f1e58]: Mother & baby records
              - listitem [ref=f1e59]:
                - generic [ref=f1e62]: Bangla answers with sources
              - listitem [ref=f1e63]:
                - generic [ref=f1e68]: Reports explained
              - listitem [ref=f1e69]:
                - generic [ref=f1e76]: Well-being
              - listitem [ref=f1e77]:
                - generic [ref=f1e83]: Human support
            - paragraph [ref=f1e84]: Explore without an account.
          - generic [ref=f1e85]:
            - img "Illustration of the PROHOR app with sample answers, records and sharing controls" [ref=f1e86]:
              - generic [aria-hidden] [ref=f1e87]:
                - generic [ref=f1e93]: Sample data
                - generic [ref=f1e96]:
                  - generic [ref=f1e99]:
                    - strong [ref=f1e104]: PROHOR
                    - generic [ref=f1e105]: প্রহর
                  - generic [ref=f1e106]:
                    - generic [ref=f1e107]:
                      - generic [ref=f1e108]: YOUR CARE. YOUR WAY.
                      - paragraph [ref=f1e109]: আজ কী করতে চান?
                      - paragraph [ref=f1e110]: What would you like to do?
                      - generic [ref=f1e111]:
                        - generic [ref=f1e112]:
                          - strong [ref=f1e116]: Ask PROHOR
                          - generic [ref=f1e117]: প্রশ্ন করুন
                        - generic [ref=f1e118]:
                          - strong [ref=f1e122]: My Health
                          - generic [ref=f1e123]: আমার স্বাস্থ্য
                        - generic [ref=f1e124]:
                          - strong [ref=f1e132]: My Wellness
                          - generic [ref=f1e133]: আমার সুস্থতা
                        - generic [ref=f1e134]:
                          - strong [ref=f1e139]: Find Care
                          - generic [ref=f1e140]: সেবা খুঁজুন
                      - generic [ref=f1e141]: Your language. Your pace.
                      - paragraph [ref=f1e146]: Private by your choice
                    - generic [ref=f1e151]:
                      - generic [ref=f1e152]: BARTA · বার্তা
                      - paragraph [ref=f1e153]: আপনার ভাষায়, সূত্রসহ।
                      - paragraph [ref=f1e154]: Room for your questions.
                      - generic [ref=f1e155]:
                        - paragraph [ref=f1e158]: আমার পছন্দও কি গুরুত্বপূর্ণ?
                        - paragraph [ref=f1e159]: আপনার অভিজ্ঞতাও যত্নের অংশ।
                        - generic [ref=f1e160]: WHO · Antenatal care, 2016
                      - paragraph [ref=f1e167]: Sample educational answer. People provide clinical care.
                      - generic [ref=f1e168]: আপনার প্রশ্ন লিখুন
                    - generic [ref=f1e173]:
                      - generic [ref=f1e174]: JIBONREKHA · জীবনরেখা
                      - paragraph [ref=f1e175]: One journey. Two care stories.
                      - paragraph [ref=f1e176]: Your records, connected.
                      - generic [ref=f1e177]:
                        - strong [ref=f1e180]: Week 24
                        - generic [ref=f1e181]: Sample journey
                      - generic [ref=f1e182]:
                        - generic [ref=f1e188]:
                          - strong [ref=f1e189]: Mother
                          - generic [ref=f1e190]: Visit questions
                        - generic [ref=f1e196]:
                          - strong [ref=f1e197]: Baby
                          - generic [ref=f1e198]: Separate record
                      - generic [ref=f1e202]:
                        - text: Visit questions
                        - generic [ref=f1e203]: Recorded by you
                      - paragraph [ref=f1e206]: You choose what to share
                  - generic [ref=f1e211]:
                    - generic [ref=f1e212]: Home
                    - generic [ref=f1e216]: Ask
                    - generic [ref=f1e219]: Health
                    - generic [ref=f1e222]: Care
                - generic [ref=f1e232]:
                  - generic [ref=f1e233]:
                    - strong [ref=f1e236]: Barta
                    - generic [ref=f1e237]: বার্তা
                  - paragraph [ref=f1e238]: আমার পছন্দও কি গুরুত্বপূর্ণ?
                  - paragraph [ref=f1e239]: আপনার অভিজ্ঞতাও যত্নের অংশ।
                  - generic [ref=f1e240]: WHO · Antenatal care, 2016
                - generic [ref=f1e249]:
                  - strong [ref=f1e253]: Jibonrekha
                  - generic [ref=f1e254]:
                    - strong [ref=f1e255]: Week 24
                    - generic [ref=f1e256]: Your care story
                  - generic [ref=f1e257]:
                    - generic [ref=f1e263]:
                      - strong [ref=f1e264]: Mother
                      - generic [ref=f1e265]: Visit questions
                    - generic [ref=f1e271]:
                      - strong [ref=f1e272]: Baby
                      - generic [ref=f1e273]: Separate record
                - generic [ref=f1e276]:
                  - strong [ref=f1e283]: Bondhon
                  - generic [ref=f1e288]: Visit questions
                  - generic [ref=f1e293]: Selected reports
                  - generic [ref=f1e301]:
                    - text: "Diary & AI conversations:"
                    - strong [ref=f1e302]: Private
                - generic [ref=f1e305]:
                  - strong [ref=f1e308]: Adapt
                  - generic [ref=f1e309]:
                    - generic [ref=f1e310]: A
                    - generic [ref=f1e311]: A+
            - button "Pause animation" [ref=f1e316] [cursor=pointer]
      - region "The PROHOR product at a glance" [ref=f1e320]:
        - generic [ref=f1e321]:
          - generic [ref=f1e322]:
            - strong [ref=f1e323]: "8"
            - heading "connected modules" [level=2] [ref=f1e324]
            - paragraph [ref=f1e325]: Adapt, Barta, Shonket, Jibonrekha, Bujhi, Shusthota, Poth, Bondhon
          - generic [ref=f1e326]:
            - strong [ref=f1e327]: "24"
            - heading "planned capabilities" [level=2] [ref=f1e328]
            - link "One roadmap, honest status on each" [ref=f1e329] [cursor=pointer]:
              - /url: "#roadmap"
          - generic [ref=f1e333]:
            - strong [ref=f1e334]: "0"
            - heading "disability categories to choose" [level=2] [ref=f1e335]
            - paragraph [ref=f1e336]: Same care for every mother; preferences, not labels
          - generic [ref=f1e337]:
            - strong [ref=f1e338]: "2"
            - heading "records, 1 journey" [level=2] [ref=f1e339]
            - paragraph [ref=f1e340]: Mother and baby records stay separate on one timeline
      - region "Motherhood is a journey. Care shouldn’t feel like a puzzle." [ref=f1e341]:
        - generic [ref=f1e342]:
          - generic [ref=f1e343]:
            - paragraph [ref=f1e344]:
              - generic [ref=f1e346]: Why PROHOR
            - heading [level=2] [ref=f1e347]:
              - text: Motherhood is a journey.
              - emphasis [ref=f1e348]: Care shouldn’t feel like a puzzle.
            - list [ref=f1e349]:
              - listitem [ref=f1e350]:
                - generic [ref=f1e355]:
                  - heading "Less scattered. More connected." [level=3] [ref=f1e356]
                  - paragraph [ref=f1e357]: Keep records, questions and visits in the same story.
              - listitem [ref=f1e358]:
                - generic [ref=f1e361]:
                  - heading "Fewer barriers. More ways in." [level=3] [ref=f1e362]
                  - paragraph [ref=f1e363]: Language, small text and voice-only tasks shouldn’t stand between you and care.
              - listitem [ref=f1e364]:
                - generic [ref=f1e369]:
                  - heading "Beyond birth. Still about you." [level=3] [ref=f1e370]
                  - paragraph [ref=f1e371]: A baby’s beginning is another chapter in the mother’s care.
            - generic [ref=f1e372]:
              - paragraph [ref=f1e373]:
                - text: About 4,000 maternal deaths in Bangladesh in 2023; the maternal mortality ratio was 79% lower than in 2000.
                - link "UN estimates · WHO, UNICEF, UNFPA · 2025 (opens in a new tab)" [ref=f1e374] [cursor=pointer]:
                  - /url: https://www.unicef.org/bangladesh/en/press-releases/uncertainty-aid-commitments-threatens-bangladeshs-progress-maternal-health-unicef
                  - text: UN estimates · WHO, UNICEF, UNFPA · 2025
                  - generic [ref=f1e375]: (opens in a new tab)
              - paragraph [ref=f1e376]:
                - text: 1 in 3 women who died of maternal causes had sought care at three or more places.
                - link "BMMS 2016 · Journal of Global Health, 2023 (opens in a new tab)" [ref=f1e377] [cursor=pointer]:
                  - /url: https://pmc.ncbi.nlm.nih.gov/articles/PMC10248997/
                  - text: BMMS 2016 · Journal of Global Health, 2023
                  - generic [ref=f1e378]: (opens in a new tab)
          - generic [ref=f1e379]:
            - img "Image placeholder. The supplied mother photograph is missing." [ref=f1e381]
            - generic [ref=f1e387]: A report here.
            - generic [ref=f1e395]: A visit there.
            - generic [ref=f1e408]: Let the care hold the pieces.
      - region "One care. Your way." [ref=f1e411]:
        - generic [ref=f1e412]:
          - generic [ref=f1e413]:
            - generic [ref=f1e414]:
              - paragraph [ref=f1e415]:
                - generic [ref=f1e417]: Designed around difference
              - heading [level=2] [ref=f1e418]:
                - text: One care.
                - emphasis [ref=f1e419]: Your way.
            - paragraph [ref=f1e420]: The same visit question, in three presentations. Try a question. Your words stay with you as you explore.
          - region "Visit question presentations" [ref=f1e421]:
            - group "Touch & text" [ref=f1e422]:
              - generic [ref=f1e423]:
                - generic [ref=f1e424]: Touch & text
                - generic [ref=f1e425]: Sample data
              - generic [ref=f1e426]:
                - generic [ref=f1e429]: PROHOR
                - region "Touch & text screen" [ref=f1e438]:
                  - generic [ref=f1e439]:
                    - paragraph [ref=f1e443]: Your next visit
                    - heading "A question, in your words." [level=3] [ref=f1e444]
                  - generic [ref=f1e445]: What would you like to ask?
                  - textbox "What would you like to ask?" [ref=f1e446]: Synthetic visit question
                  - button "Review my question" [ref=f1e447] [cursor=pointer]
                  - paragraph [ref=f1e450]: Your words. Your choice.
            - group "Large text + high contrast" [ref=f1e457]:
              - generic [ref=f1e458]:
                - generic [ref=f1e459]: Large text + high contrast
                - generic [ref=f1e460]: Sample data
              - generic [ref=f1e461]:
                - generic [ref=f1e464]: PROHOR
                - region "Large text + high contrast screen" [ref=f1e473]:
                  - heading "A question, in your words." [level=3] [ref=f1e475]
                  - generic [ref=f1e476]: What would you like to ask?
                  - textbox "What would you like to ask?" [ref=f1e477]: Synthetic visit question
                  - button "Review my question" [ref=f1e478] [cursor=pointer]
            - group "Picture-and-text" [ref=f1e483]:
              - generic [ref=f1e484]:
                - generic [ref=f1e485]: Picture-and-text
                - generic [ref=f1e486]: Sample data
              - generic [ref=f1e487]:
                - generic [ref=f1e490]: PROHOR
                - region "Picture-and-text screen" [ref=f1e499]:
                  - generic [ref=f1e500]:
                    - paragraph [ref=f1e504]: Your next visit
                    - heading "A question, in your words." [level=3] [ref=f1e505]
                  - generic [ref=f1e506]: What would you like to ask?
                  - group "Picture-and-text sample phrases" [ref=f1e507]:
                    - button "About my visit" [ref=f1e508] [cursor=pointer]
                    - button "About my records" [ref=f1e513] [cursor=pointer]
                  - textbox "What would you like to ask?" [ref=f1e519]: Synthetic visit question
                  - button "Review my question" [ref=f1e520] [cursor=pointer]
                  - paragraph [ref=f1e523]: Your words. Your choice.
          - generic [ref=f1e530]:
            - paragraph [ref=f1e531]: Change the presentation. Keep your words, your choices and your place.
            - button "Adjust how you use PROHOR" [ref=f1e532] [cursor=pointer]
          - status [ref=f1e537]
      - region "Not just a tracker. A care companion." [ref=f1e538]:
        - generic [ref=f1e539]:
          - generic [ref=f1e540]:
            - generic [ref=f1e541]:
              - paragraph [ref=f1e542]:
                - generic [ref=f1e544]: Care that makes room for life
              - heading [level=2] [ref=f1e545]:
                - text: Not just a tracker.
                - emphasis [ref=f1e546]: A care companion.
            - paragraph [ref=f1e547]: Understanding, access, safety and human connection. Thoughtful tools for the moments between appointments, too.
          - generic [ref=f1e548]:
            - article [ref=f1e549]:
              - generic [ref=f1e554]:
                - text: Barta
                - generic [aria-hidden] [ref=f1e555]: ·
                - generic [ref=f1e556]: বার্তা
              - heading "A question deserves clarity." [level=3] [ref=f1e557]
              - paragraph [ref=f1e558]: Bangla explanations, with sources to open and read.
              - img "Sample data. A Bangla question and educational answer, WHO and CDC sources, and an explicit insufficient-evidence fallback. This is a product preview, not a live AI answer." [ref=f1e559]:
                - generic [ref=f1e560]: Sample data
                - generic [aria-hidden] [ref=f1e562]:
                  - generic [ref=f1e563]:
                    - paragraph [ref=f1e564]: আমার যত্নে আমার পছন্দও কি গুরুত্বপূর্ণ?
                    - generic [ref=f1e565]:
                      - generic [ref=f1e566]: Barta
                      - paragraph [ref=f1e569]: মায়ের শারীরিক ও মানসিক সুস্থতার পাশাপাশি তাঁর অভিজ্ঞতাও গর্ভকালীন যত্নের অংশ।
                  - generic [ref=f1e570]:
                    - link [ref=f1e571] [cursor=pointer]:
                      - /url: https://www.who.int/publications/i/item/9789241549912
                      - generic [ref=f1e574]: WHO · Antenatal care, 2016
                      - generic [ref=f1e578]: Opens in a new tab
                    - link [ref=f1e579] [cursor=pointer]:
                      - /url: https://www.cdc.gov/hearher/maternal-warning-signs/index.html
                      - generic [ref=f1e582]: CDC · Warning signs
                      - generic [ref=f1e586]: Opens in a new tab
                  - paragraph [ref=f1e587]:
                    - generic [ref=f1e590]: Not enough approved evidence? PROHOR says so and suggests asking a clinician.
            - article [ref=f1e591]:
              - generic [ref=f1e597]:
                - text: Shonket
                - generic [aria-hidden] [ref=f1e598]: ·
                - generic [ref=f1e599]: সংকেত
              - heading "Help beyond the chatbot." [level=3] [ref=f1e600]
              - paragraph [ref=f1e601]: Reviewed warning signs. A direct path to help.
              - img "Sample data. Reviewed-warning-signs layout with three CDC examples, a sample Call 999 button, and request tracking. Only Submitted is complete; Delivered, Acknowledged and Responded are pending. No care request has been sent." [ref=f1e602]:
                - generic [ref=f1e603]: Sample data
                - generic [aria-hidden] [ref=f1e605]:
                  - strong [ref=f1e606]: Warning signs, reviewed
                  - list [ref=f1e607]:
                    - listitem [ref=f1e608]:
                      - generic [ref=f1e612]: A severe headache that persists
                    - listitem [ref=f1e613]:
                      - generic [ref=f1e617]: Trouble breathing
                    - listitem [ref=f1e618]:
                      - generic [ref=f1e622]: Heavy bleeding
                  - generic [ref=f1e623]:
                    - link [ref=f1e624] [cursor=pointer]:
                      - /url: https://www.cdc.gov/hearher/maternal-warning-signs/index.html
                      - generic [ref=f1e627]: CDC · Warning signs
                      - generic [ref=f1e631]: Opens in a new tab
                    - button [ref=f1e632] [cursor=pointer]: Call 999
                  - list [ref=f1e638]:
                    - listitem [ref=f1e639]:
                      - generic [ref=f1e644]: Submitted
                      - generic [ref=f1e645]: Complete
                    - listitem [ref=f1e646]:
                      - generic [ref=f1e651]: Delivered
                      - generic [ref=f1e652]: Pending
                    - listitem [ref=f1e653]:
                      - generic [ref=f1e658]: Acknowledged
                      - generic [ref=f1e659]: Pending
                    - listitem [ref=f1e660]:
                      - generic [ref=f1e665]: Responded
                      - generic [ref=f1e666]: Pending
                  - paragraph [ref=f1e667]: A request is never shown as delivered until it is.
            - article [ref=f1e668]:
              - generic [ref=f1e672]:
                - text: Adapt
                - generic [aria-hidden] [ref=f1e673]: ·
                - generic [ref=f1e674]: অ্যাডাপ্ট
              - heading "Your preferences belong here." [level=3] [ref=f1e675]
              - paragraph [ref=f1e676]: Your text, theme and contrast. The same care.
              - group "Try Adapt locally" [ref=f1e677]:
                - generic [ref=f1e678]: Sample data
                - generic [ref=f1e680]:
                  - generic [ref=f1e681]: Text size
                  - group "Sample text size" [ref=f1e682]:
                    - button "A sample text size" [pressed] [ref=f1e683] [cursor=pointer]: A
                    - button "A+ sample text size" [ref=f1e684] [cursor=pointer]: A+
                    - button "A++ sample text size" [ref=f1e685] [cursor=pointer]: A++
                - generic [ref=f1e686]:
                  - paragraph [ref=f1e687]: আপনার যত্ন, আপনার মতো।
                  - paragraph [ref=f1e688]: Your care. Your way.
                - generic [ref=f1e689]:
                  - generic [ref=f1e690]: Theme
                  - group "Sample theme" [ref=f1e691]:
                    - button "Quiet Garden" [pressed] [ref=f1e692] [cursor=pointer]
                    - button "Original Rose" [ref=f1e695] [cursor=pointer]: R
                    - button "Morning Mist" [ref=f1e696] [cursor=pointer]: M
                - generic [ref=f1e697] [cursor=pointer]:
                  - generic [ref=f1e698]: Higher contrast
                  - switch "Higher contrast" [ref=f1e699]
                - group "Choose a sample phrase" [ref=f1e702]:
                  - button "I need help" [ref=f1e703] [cursor=pointer]
                  - button "I have a question" [ref=f1e710] [cursor=pointer]
                - generic [ref=f1e714]:
                  - button "Read aloud" [ref=f1e715] [cursor=pointer]
                  - generic [ref=f1e720]: Try it here only
                - status [ref=f1e721]: Page settings stay as you chose them.
            - article [ref=f1e722]:
              - generic [ref=f1e730]:
                - text: Bondhon
                - generic [aria-hidden] [ref=f1e731]: ·
                - generic [ref=f1e732]: বন্ধন
              - heading "Connection, with permission." [level=3] [ref=f1e733]
              - paragraph [ref=f1e734]: Choose the people and records before sharing.
              - img "Sample data. Mother to chosen supporter to provider. Visit questions selected, reports unselected. Diary and AI conversations stay private. A synthetic access log and Revoke access button illustrate consent; no records are shared." [ref=f1e735]:
                - generic [ref=f1e736]: Sample data
                - generic [aria-hidden] [ref=f1e738]:
                  - generic [ref=f1e739]:
                    - generic [ref=f1e740]: Mother
                    - generic [ref=f1e747]: Chosen supporter
                    - generic [ref=f1e756]: Provider
                  - generic [ref=f1e761]:
                    - generic [ref=f1e762]:
                      - generic [ref=f1e763]: Visit questions
                      - generic [ref=f1e767]: "On"
                    - generic [ref=f1e768]:
                      - generic [ref=f1e769]: Selected reports
                      - generic [ref=f1e773]: "Off"
                  - generic [ref=f1e774]:
                    - generic [ref=f1e779]: Diary & AI conversations
                    - generic [ref=f1e780]: Private
                  - paragraph [ref=f1e781]: Your review comes before sharing.
                  - paragraph [ref=f1e785]:
                    - generic [ref=f1e789]: "Access log: supporter viewed appointment, today"
                  - button [ref=f1e790] [cursor=pointer]: Revoke access
      - region "One app for the whole journey." [ref=f1e794]:
        - generic [ref=f1e795]:
          - generic [ref=f1e796]:
            - generic [ref=f1e797]:
              - paragraph [ref=f1e798]:
                - generic [ref=f1e800]: Eight modules, one shared foundation
              - heading [level=2] [ref=f1e801]:
                - text: One app for
                - emphasis [ref=f1e802]: the whole journey.
            - paragraph [ref=f1e803]: From a first question to the chapters after birth. Your preferences and permissions stay part of the same experience.
          - generic [ref=f1e808]:
            - strong [ref=f1e809]: One web app. Works in your browser on any phone.
            - paragraph [ref=f1e810]: Add to your home screen from your browser’s menu.
          - navigation "The eight PROHOR modules" [ref=f1e814]:
            - link "Adapt অ্যাডাপ্ট" [ref=f1e815] [cursor=pointer]:
              - /url: "#module-adapt"
              - generic [ref=f1e818]:
                - strong [ref=f1e819]: Adapt
                - generic [ref=f1e820]: অ্যাডাপ্ট
            - link "Barta বার্তা" [ref=f1e824] [cursor=pointer]:
              - /url: "#module-barta"
              - generic [ref=f1e828]:
                - strong [ref=f1e829]: Barta
                - generic [ref=f1e830]: বার্তা
            - link "Shonket সংকেত" [ref=f1e834] [cursor=pointer]:
              - /url: "#module-shonket"
              - generic [ref=f1e839]:
                - strong [ref=f1e840]: Shonket
                - generic [ref=f1e841]: সংকেত
            - link "Jibonrekha জীবনরেখা" [ref=f1e845] [cursor=pointer]:
              - /url: "#module-jibonrekha"
              - generic [ref=f1e849]:
                - strong [ref=f1e850]: Jibonrekha
                - generic [ref=f1e851]: জীবনরেখা
            - link "Bujhi বুঝি" [ref=f1e855] [cursor=pointer]:
              - /url: "#module-bujhi"
              - generic [ref=f1e861]:
                - strong [ref=f1e862]: Bujhi
                - generic [ref=f1e863]: বুঝি
            - link "Shusthota সুস্থতা" [ref=f1e867] [cursor=pointer]:
              - /url: "#module-shusthota"
              - generic [ref=f1e875]:
                - strong [ref=f1e876]: Shusthota
                - generic [ref=f1e877]: সুস্থতা
            - link "Poth পথ" [ref=f1e881] [cursor=pointer]:
              - /url: "#module-poth"
              - generic [ref=f1e886]:
                - strong [ref=f1e887]: Poth
                - generic [ref=f1e888]: পথ
            - link "Bondhon বন্ধন" [ref=f1e892] [cursor=pointer]:
              - /url: "#module-bondhon"
              - generic [ref=f1e899]:
                - strong [ref=f1e900]: Bondhon
                - generic [ref=f1e901]: বন্ধন
          - generic "Provider workspace concepts" [ref=f1e905]:
            - generic [ref=f1e906]: Request queue
            - generic [ref=f1e909]: Consented records
            - generic [ref=f1e912]: Preferred contact
            - generic [ref=f1e915]: Audit trail
          - region "One app for the whole journey." [ref=f1e918]:
            - article [ref=f1e919]:
              - group "Jibonrekha" [ref=f1e920]:
                - generic [ref=f1e921]:
                  - generic [ref=f1e922]: Jibonrekha
                  - generic [ref=f1e923]: Sample data
                - generic [ref=f1e924]:
                  - generic [ref=f1e927]: PROHOR
                  - region "Jibonrekha screen" [ref=f1e936]:
                    - generic [ref=f1e937]:
                      - paragraph [ref=f1e941]: Jibonrekha · জীবনরেখা
                      - heading "Your story stays together." [level=3] [ref=f1e942]
                    - generic [ref=f1e943]:
                      - generic [ref=f1e949]:
                        - generic [ref=f1e950]: Mother
                        - strong [ref=f1e951]: Week 24 · Nila’s journey
                        - paragraph [ref=f1e952]: Questions for the next visit
                      - generic [ref=f1e958]:
                        - generic [ref=f1e959]: Baby
                        - strong [ref=f1e960]: A story of their own
                        - paragraph [ref=f1e961]: A separate record, from the start
                      - generic [ref=f1e962]: Two records. One connected journey.
                    - generic [ref=f1e969]:
                      - strong [ref=f1e970]: Visit notes
                      - generic [ref=f1e971]: Recorded by you
              - paragraph [ref=f1e976]:
                - emphasis [ref=f1e977]: Two stories, held together.
              - paragraph [ref=f1e978]: দুটি গল্প, একসঙ্গে।
            - article [ref=f1e979]:
              - group "Bujhi" [ref=f1e980]:
                - generic [ref=f1e981]:
                  - generic [ref=f1e982]: Bujhi
                  - generic [ref=f1e983]: Sample data
                - generic [ref=f1e984]:
                  - generic [ref=f1e987]: PROHOR
                  - region "Bujhi screen" [ref=f1e996]:
                    - generic [ref=f1e997]:
                      - paragraph [ref=f1e1003]: Bujhi · বুঝি
                      - heading "Read. Review. Understand." [level=3] [ref=f1e1004]
                    - generic [ref=f1e1005]:
                      - strong [ref=f1e1009]: A report to understand
                      - generic [ref=f1e1010]: visit-report.pdf
                    - generic [ref=f1e1011]:
                      - generic [ref=f1e1012]: Document type
                      - strong [ref=f1e1013]: Visit report
                    - generic [ref=f1e1014]:
                      - generic [ref=f1e1015]: Record belongs to
                      - strong [ref=f1e1016]: Mother · review first
                    - list [ref=f1e1017]:
                      - listitem [ref=f1e1018]: Upload
                      - listitem [ref=f1e1022]: Review
                      - listitem [ref=f1e1026]: Confirm
              - paragraph [ref=f1e1031]:
                - emphasis [ref=f1e1032]: A little more understanding.
              - paragraph [ref=f1e1033]: আরও একটু বোঝাপড়া।
            - article [ref=f1e1034]:
              - group "Shusthota" [ref=f1e1035]:
                - generic [ref=f1e1036]:
                  - generic [ref=f1e1037]: Shusthota
                  - generic [ref=f1e1038]: Sample data
                - generic [ref=f1e1039]:
                  - generic [ref=f1e1042]: PROHOR
                  - region "Shusthota screen" [ref=f1e1051]:
                    - generic [ref=f1e1052]:
                      - paragraph [ref=f1e1060]: Shusthota · সুস্থতা
                      - heading "How are you, today?" [level=3] [ref=f1e1061]
                    - group "A moment for yourself" [ref=f1e1062]:
                      - generic [ref=f1e1064]:
                        - generic [ref=f1e1065] [cursor=pointer]:
                          - radio "Quiet" [checked] [ref=f1e1066]
                          - generic [ref=f1e1073]: Quiet
                          - text: ✓
                        - generic [ref=f1e1074] [cursor=pointer]:
                          - radio "Tired" [ref=f1e1075]
                          - generic [ref=f1e1078]: Tired
                        - generic [ref=f1e1079] [cursor=pointer]:
                          - radio "Unsure" [ref=f1e1080]
                          - generic [ref=f1e1083]: Unsure
                    - generic [ref=f1e1084]:
                      - heading "A little room to rest." [level=4] [ref=f1e1087]
                      - paragraph [ref=f1e1088]: Your pace. No score to keep.
                    - paragraph [ref=f1e1089]: Your diary is yours.
              - paragraph [ref=f1e1096]:
                - emphasis [ref=f1e1097]: Room for the person, too.
              - paragraph [ref=f1e1098]: মানুষটির জন্যও জায়গা।
            - article [ref=f1e1099]:
              - group "Poth" [ref=f1e1100]:
                - generic [ref=f1e1101]:
                  - generic [ref=f1e1102]: Poth
                  - generic [ref=f1e1103]: Sample data
                - generic [ref=f1e1104]:
                  - generic [ref=f1e1107]: PROHOR
                  - region "Poth screen" [ref=f1e1116]:
                    - generic [ref=f1e1117]:
                      - paragraph [ref=f1e1122]: Poth · পথ
                      - heading "A next step, closer." [level=3] [ref=f1e1123]
                    - generic [ref=f1e1124]: Find a facility
                    - textbox "Find a facility" [ref=f1e1129]:
                      - /placeholder: Search these examples
                    - generic [ref=f1e1130]:
                      - link "Dhaka Medical College Hospital Shahbag, Dhaka Opens DGHS in a new tab" [ref=f1e1131] [cursor=pointer]:
                        - /url: https://hrm.dghs.gov.bd/public/facility-registry/facilities/31/profile
                        - generic [ref=f1e1136]:
                          - strong [ref=f1e1137]: Dhaka Medical College Hospital
                          - generic [ref=f1e1138]: Shahbag, Dhaka
                        - generic [ref=f1e1142]: Opens DGHS in a new tab
                      - link "Sir Salimullah Medical College Mitford Hospital Kotwali, Dhaka Opens DGHS in a new tab" [ref=f1e1143] [cursor=pointer]:
                        - /url: https://hrm.dghs.gov.bd/public/facility-registry/facilities/52/profile
                        - generic [ref=f1e1148]:
                          - strong [ref=f1e1149]: Sir Salimullah Medical College Mitford Hospital
                          - generic [ref=f1e1150]: Kotwali, Dhaka
                        - generic [ref=f1e1154]: Opens DGHS in a new tab
                    - paragraph [ref=f1e1155]: "Source: DGHS facility registry"
              - paragraph [ref=f1e1160]:
                - emphasis [ref=f1e1161]: A clearer way forward.
              - paragraph [ref=f1e1162]: সামনের পথ আরও পরিষ্কার।
      - region "How one question becomes safe, shared support." [ref=f1e1163]:
        - generic [ref=f1e1165]:
          - generic [ref=f1e1166]:
            - paragraph [ref=f1e1167]:
              - generic [ref=f1e1169]: A thoughtful path through
            - generic [ref=f1e1170]: Sample data
          - generic [ref=f1e1171]:
            - heading [level=2] [ref=f1e1172]:
              - text: How one question becomes
              - emphasis [ref=f1e1173]: safe, shared support.
            - paragraph [ref=f1e1174]: The question starts with her. Evidence makes its limits clear. Permission shapes what reaches another person.
          - list [ref=f1e1177]:
            - listitem [ref=f1e1178]:
              - generic [ref=f1e1179]: Step 1
              - heading "She asks" [level=3] [ref=f1e1184]
              - paragraph [ref=f1e1185]: Her words are the starting point.
              - img "Sample illustration for step 1. She asks" [ref=f1e1186]:
                - generic [aria-hidden] [ref=f1e1187]:
                  - paragraph [ref=f1e1188]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - paragraph [ref=f1e1189]: How can I prepare for my next visit?
            - listitem [ref=f1e1190]:
              - generic [ref=f1e1191]: Step 2
              - heading "Evidence is found" [level=3] [ref=f1e1196]
              - paragraph [ref=f1e1197]: Sources, with their limits in view.
              - img "Sample illustration for step 2. Evidence is found" [ref=f1e1198]:
                - generic [aria-hidden] [ref=f1e1199]:
                  - link [ref=f1e1200] [cursor=pointer]:
                    - /url: https://www.who.int/publications/i/item/9789241549912
                    - generic [ref=f1e1203]: WHO · Antenatal care, 2016
                    - generic [ref=f1e1207]: Opens in a new tab
                  - generic [ref=f1e1208]: Not enough evidence
            - listitem [ref=f1e1211]:
              - generic [ref=f1e1212]: Step 3
              - heading "She chooses what to share" [level=3] [ref=f1e1219]
              - paragraph [ref=f1e1220]: Her review. Her recipient. Her say.
              - img "Sample illustration for step 3. She chooses what to share" [ref=f1e1221]:
                - generic [ref=f1e1223]:
                  - generic [ref=f1e1224]: My visit question
                  - generic [ref=f1e1227]: My diary stays private
            - listitem [ref=f1e1232]:
              - generic [ref=f1e1233]: Step 4
              - heading "A person follows up" [level=3] [ref=f1e1241]
              - paragraph [ref=f1e1242]: A clear handoff, with a human reply.
              - img "Sample illustration for step 4. A synthetic request from Nila is acknowledged. This is not a real provider response." [ref=f1e1243]:
                - generic [aria-hidden] [ref=f1e1244]:
                  - generic [ref=f1e1245]:
                    - generic [ref=f1e1250]: Request from Nila
                    - generic [ref=f1e1251]: Acknowledged
                  - paragraph [ref=f1e1255]: Only what she chose reaches them.
      - region "For the mother. For the people beside her." [ref=f1e1256]:
        - generic [ref=f1e1257]:
          - generic [ref=f1e1258]:
            - generic [ref=f1e1259]:
              - paragraph [ref=f1e1260]:
                - generic [ref=f1e1262]: Two windows, the same care story
              - heading [level=2] [ref=f1e1263]:
                - text: For the mother.
                - emphasis [ref=f1e1264]: For the people beside her.
            - paragraph [ref=f1e1265]: One shared foundation, with a different view for the person asking and the people preparing to support her.
          - generic [ref=f1e1266]:
            - article [ref=f1e1267]:
              - generic [ref=f1e1268]: For mothers
              - heading "A little more understood." [level=3] [ref=f1e1269]
              - paragraph [ref=f1e1270]: Your questions, records and preferences, with you at the centre.
              - list [ref=f1e1271]:
                - listitem [ref=f1e1272]: Explore in Bangla or English
                - listitem [ref=f1e1275]: Keep mother and baby records distinct
                - listitem [ref=f1e1278]: Choose the people you bring in
              - generic [ref=f1e1281]:
                - generic [ref=f1e1282]:
                  - generic [aria-hidden] [ref=f1e1283]: ● ● ●
                  - generic [ref=f1e1284]: PROHOR / My care
                  - generic [ref=f1e1285]: Sample data
                - generic [ref=f1e1286]:
                  - link "PROHOR home" [ref=f1e1287] [cursor=pointer]:
                    - /url: /
                    - generic [ref=f1e1292]: PROHOR
                    - generic [aria-hidden] [ref=f1e1293]: "|"
                    - generic [ref=f1e1294]: প্রহর
                  - heading "আজ একটু নিজের খোঁজ নিন।" [level=3] [ref=f1e1295]
                  - paragraph [ref=f1e1296]: Your care, in one place.
                  - generic [ref=f1e1297]:
                    - link "My care story" [ref=f1e1298] [cursor=pointer]:
                      - /url: "#module-jibonrekha"
                    - link "My questions" [ref=f1e1304] [cursor=pointer]:
                      - /url: "#module-barta"
                    - link "My preferences" [ref=f1e1310] [cursor=pointer]:
                      - /url: "#module-adapt"
                  - generic [ref=f1e1315]: Motherhood is part of your story. You are at the centre.
              - link "Explore your experience" [ref=f1e1319] [cursor=pointer]:
                - /url: "#your-way"
            - article [ref=f1e1323]:
              - generic [ref=f1e1324]: For care providers
              - heading "A little more context." [level=3] [ref=f1e1325]
              - paragraph [ref=f1e1326]: The story a mother chooses to share, with its source and her permission.
              - list [ref=f1e1327]:
                - listitem [ref=f1e1328]: See the question in her own words
                - listitem [ref=f1e1331]: Keep source and permission together
                - listitem [ref=f1e1334]: Prepare for a human conversation
              - generic [ref=f1e1337]:
                - generic [ref=f1e1338]:
                  - generic [aria-hidden] [ref=f1e1339]: ● ● ●
                  - generic [ref=f1e1340]: PROHOR / Care workspace
                  - generic [ref=f1e1341]: Sample data
                - generic [ref=f1e1342]:
                  - generic [ref=f1e1350]:
                    - text: Mother-led context
                    - heading "Prepare to listen." [level=3] [ref=f1e1351]
                  - generic [ref=f1e1352]:
                    - generic [ref=f1e1353]: Questions
                    - generic [ref=f1e1354]: Chosen records
                    - generic [ref=f1e1355]: Permissions
                  - generic [ref=f1e1359]:
                    - strong [ref=f1e1360]: Nila’s visit question
                    - paragraph [ref=f1e1361]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - list [ref=f1e1362]:
                    - listitem [ref=f1e1363]: Context from selected records
                    - listitem [ref=f1e1367]: Visible source for each note
                    - listitem [ref=f1e1370]: Access defined by the mother
              - link "Explore the care connection" [ref=f1e1375] [cursor=pointer]:
                - /url: "#module-bondhon"
      - region "AI helps explain. People provide care." [ref=f1e1379]:
        - generic [ref=f1e1380]:
          - generic [ref=f1e1381]:
            - generic [ref=f1e1382]:
              - paragraph [ref=f1e1383]:
                - generic [ref=f1e1385]: Thoughtful technology
              - heading [level=2] [ref=f1e1386]:
                - text: AI helps explain.
                - emphasis [ref=f1e1387]: People provide care.
            - paragraph [ref=f1e1388]: Useful technology starts with clear boundaries. Keep evidence, human oversight and your permission in the picture.
          - generic [ref=f1e1389]:
            - article [ref=f1e1390]:
              - heading "Evidence you can open." [level=3] [ref=f1e1394]
              - paragraph [ref=f1e1395]: Keep sources beside explanations. Say when the information does not cover the question.
              - generic [ref=f1e1396]:
                - generic [ref=f1e1397]: Evidence
                - generic [ref=f1e1398]: Human review
                - generic [ref=f1e1399]: No diagnosis
            - article [ref=f1e1400]:
              - heading "People keep the judgment." [level=3] [ref=f1e1407]
              - paragraph [ref=f1e1408]: AI helps explain information. Clinical decisions and real care belong with qualified people.
              - generic [ref=f1e1409]:
                - generic [ref=f1e1410]: Evidence
                - generic [ref=f1e1411]: Human review
                - generic [ref=f1e1412]: No diagnosis
            - article [ref=f1e1413]:
              - heading "Permission stays with you." [level=3] [ref=f1e1419]
              - paragraph [ref=f1e1420]: Choose the person, purpose and records. Diary and AI conversations stay outside default sharing.
              - generic [ref=f1e1421]:
                - generic [ref=f1e1422]: Evidence
                - generic [ref=f1e1423]: Human review
                - generic [ref=f1e1424]: No diagnosis
      - region "Built with care. By people who care." [ref=f1e1425]:
        - generic [ref=f1e1426]:
          - generic [ref=f1e1427]:
            - generic [ref=f1e1428]:
              - paragraph [ref=f1e1429]:
                - generic [ref=f1e1431]: The people behind PROHOR
              - heading [level=2] [ref=f1e1432]:
                - text: Built with care.
                - emphasis [ref=f1e1433]: By people who care.
            - paragraph [ref=f1e1434]: A shared effort across inclusive design, technology and the everyday details of maternal care.
          - generic [ref=f1e1435]:
            - article [ref=f1e1436]:
              - generic [aria-hidden] [ref=f1e1438]: O
              - heading "Omor" [level=3] [ref=f1e1439]
              - paragraph [ref=f1e1440]: Project lead and platform
            - article [ref=f1e1441]:
              - generic [aria-hidden] [ref=f1e1443]: I
              - heading "Iftee" [level=3] [ref=f1e1444]
              - paragraph [ref=f1e1445]: Inclusive UI and accessibility
            - article [ref=f1e1446]:
              - generic [aria-hidden] [ref=f1e1448]: I
              - heading "Ifty" [level=3] [ref=f1e1449]
              - paragraph [ref=f1e1450]: AI and retrieval
            - article [ref=f1e1451]:
              - generic [aria-hidden] [ref=f1e1453]: A
              - heading "Apubo" [level=3] [ref=f1e1454]
              - paragraph [ref=f1e1455]: Mother and baby records
            - article [ref=f1e1456]:
              - generic [aria-hidden] [ref=f1e1458]: S
              - heading "Samin" [level=3] [ref=f1e1459]
              - paragraph [ref=f1e1460]: Wellness and care navigation
      - region "What’s taking shape." [ref=f1e1461]:
        - generic [ref=f1e1462]:
          - generic [ref=f1e1463]:
            - generic [ref=f1e1464]:
              - paragraph [ref=f1e1465]:
                - generic [ref=f1e1467]: An ambitious vision. An honest view.
              - heading [level=2] [ref=f1e1468]:
                - emphasis [ref=f1e1469]: What’s taking shape.
            - paragraph [ref=f1e1470]: Local appearance controls are connected. Explore the full care vision and where each capability stands.
          - group "Filter capabilities by status" [ref=f1e1471]:
            - button "All 24" [pressed] [ref=f1e1472] [cursor=pointer]:
              - generic [ref=f1e1477]: All
              - generic [ref=f1e1478]: "24"
            - button "Working 0" [disabled] [ref=f1e1479]:
              - generic [ref=f1e1482]: Working
              - generic [ref=f1e1483]: "0"
            - button "Limited 1" [ref=f1e1484] [cursor=pointer]:
              - generic [ref=f1e1494]: Limited
              - generic [ref=f1e1495]: "1"
            - button "Simulated 0" [disabled] [ref=f1e1496]:
              - generic [ref=f1e1500]: Simulated
              - generic [ref=f1e1501]: "0"
            - button "Future 23" [ref=f1e1502] [cursor=pointer]:
              - generic [ref=f1e1506]: Future
              - generic [ref=f1e1507]: "23"
          - paragraph [ref=f1e1508]: Includes Working or Limited capabilities
          - generic [ref=f1e1509]:
            - tablist "Roadmap modules" [ref=f1e1510]:
              - tab "Adapt 1" [selected] [ref=f1e1511] [cursor=pointer]:
                - generic [ref=f1e1513]: Adapt
                - generic [ref=f1e1515]: "1"
              - tab "Barta 3" [ref=f1e1516] [cursor=pointer]:
                - generic [ref=f1e1519]: Barta
                - generic [ref=f1e1520]: "3"
              - tab "Shonket 2" [ref=f1e1521] [cursor=pointer]:
                - generic [ref=f1e1525]: Shonket
                - generic [ref=f1e1526]: "2"
              - tab "Jibonrekha 4" [ref=f1e1527] [cursor=pointer]:
                - generic [ref=f1e1530]: Jibonrekha
                - generic [ref=f1e1531]: "4"
              - tab "Bujhi 1" [ref=f1e1532] [cursor=pointer]:
                - generic [ref=f1e1537]: Bujhi
                - generic [ref=f1e1538]: "1"
              - tab "Shusthota 2" [ref=f1e1539] [cursor=pointer]:
                - generic [ref=f1e1546]: Shusthota
                - generic [ref=f1e1547]: "2"
              - tab "Poth 4" [ref=f1e1548] [cursor=pointer]:
                - generic [ref=f1e1552]: Poth
                - generic [ref=f1e1553]: "4"
              - tab "Bondhon 7" [ref=f1e1554] [cursor=pointer]:
                - generic [ref=f1e1560]: Bondhon
                - generic [ref=f1e1561]: "7"
            - tabpanel "Adapt 1" [ref=f1e1563]:
              - generic [ref=f1e1564]:
                - strong [ref=f1e1568]: Adapt
                - generic [ref=f1e1569]: 1 / 1
              - list [ref=f1e1570]:
                - listitem [ref=f1e1571]:
                  - generic "Capability 1" [ref=f1e1572]: "01"
                  - generic [ref=f1e1573]:
                    - heading "Universal Accessibility Profile" [level=3] [ref=f1e1574]
                    - paragraph [ref=f1e1575]: Local appearance and reading preferences.
                  - generic [ref=f1e1576]: Limited
          - status [ref=f1e1586]: "Adapt: 1 matching capabilities."
      - region "One care journey. Every mother’s way." [ref=f1e1587]:
        - generic [ref=f1e1590]:
          - paragraph [ref=f1e1591]:
            - generic [ref=f1e1593]: Your care. Your way.
          - heading [level=2] [ref=f1e1594]:
            - text: One care journey.
            - emphasis [ref=f1e1595]: Every mother’s way.
          - paragraph [ref=f1e1596]: A more connected future starts by making room for every mother.
          - generic [ref=f1e1597]:
            - button "Make PROHOR yours" [ref=f1e1598] [cursor=pointer]
            - link "Explore the journey" [ref=f1e1602] [cursor=pointer]:
              - /url: "#features"
          - paragraph [ref=f1e1605]: An educational product prototype; clinical services and provider delivery are not connected.
    - contentinfo [ref=f1e1606]:
      - generic [ref=f1e1607]:
        - generic [ref=f1e1608]:
          - generic [ref=f1e1609]:
            - link "PROHOR home" [ref=f1e1610] [cursor=pointer]:
              - /url: /
              - generic [ref=f1e1615]: PROHOR
              - generic [aria-hidden] [ref=f1e1616]: "|"
              - generic [ref=f1e1617]: প্রহর
            - paragraph [ref=f1e1618]: Your Care. Your Way.
            - paragraph [ref=f1e1619]: আপনার যত্ন, আপনার মতো।
            - button "Adjust how you use PROHOR" [ref=f1e1620] [cursor=pointer]
          - navigation "Modules" [ref=f1e1622]:
            - heading "Modules" [level=2] [ref=f1e1623]
            - list [ref=f1e1624]:
              - listitem [ref=f1e1625]:
                - link "Adapt" [ref=f1e1626] [cursor=pointer]:
                  - /url: "#module-adapt"
              - listitem [ref=f1e1627]:
                - link "Barta" [ref=f1e1628] [cursor=pointer]:
                  - /url: "#module-barta"
              - listitem [ref=f1e1629]:
                - link "Shonket" [ref=f1e1630] [cursor=pointer]:
                  - /url: "#module-shonket"
              - listitem [ref=f1e1631]:
                - link "Jibonrekha" [ref=f1e1632] [cursor=pointer]:
                  - /url: "#module-jibonrekha"
              - listitem [ref=f1e1633]:
                - link "Bujhi" [ref=f1e1634] [cursor=pointer]:
                  - /url: "#module-bujhi"
              - listitem [ref=f1e1635]:
                - link "Shusthota" [ref=f1e1636] [cursor=pointer]:
                  - /url: "#module-shusthota"
              - listitem [ref=f1e1637]:
                - link "Poth" [ref=f1e1638] [cursor=pointer]:
                  - /url: "#module-poth"
              - listitem [ref=f1e1639]:
                - link "Bondhon" [ref=f1e1640] [cursor=pointer]:
                  - /url: "#module-bondhon"
          - navigation "Explore" [ref=f1e1641]:
            - heading "Explore" [level=2] [ref=f1e1642]
            - list [ref=f1e1643]:
              - listitem [ref=f1e1644]:
                - link "Why PROHOR" [ref=f1e1645] [cursor=pointer]:
                  - /url: "#why-prohor"
              - listitem [ref=f1e1646]:
                - link "How it works" [ref=f1e1647] [cursor=pointer]:
                  - /url: "#how-it-works"
              - listitem [ref=f1e1648]:
                - link "Responsible AI" [ref=f1e1649] [cursor=pointer]:
                  - /url: "#responsible-ai"
              - listitem [ref=f1e1650]:
                - link "Roadmap" [ref=f1e1651] [cursor=pointer]:
                  - /url: "#roadmap"
          - navigation "Get started" [ref=f1e1652]:
            - heading "Get started" [level=2] [ref=f1e1653]
            - list [ref=f1e1654]:
              - listitem [ref=f1e1655]:
                - link "Explore PROHOR" [ref=f1e1656] [cursor=pointer]:
                  - /url: "#features"
              - listitem [ref=f1e1660]:
                - button "Sign in" [ref=f1e1661] [cursor=pointer]
        - generic [ref=f1e1665]:
          - generic [ref=f1e1666]: © 2026 PROHOR
          - paragraph [ref=f1e1667]: Prototype with sample data. Not a medical or emergency service. In an emergency, call 999.
          - button "Switch homepage language to Bangla" [ref=f1e1668] [cursor=pointer]:
            - generic [ref=f1e1669]: বাংলা
            - generic [aria-hidden] [ref=f1e1670]: /
            - generic [ref=f1e1671]: EN
    - dialog "Adjust how you use PROHOR" [ref=f1e1672]:
      - button "Close preferences" [ref=f1e1680] [cursor=pointer]
      - heading "Adjust how you use PROHOR" [level=2] [ref=f1e1684]
      - paragraph [ref=f1e1685]: Choose what works for you. Your care, privacy and place in the journey stay the same.
      - group "Appearance" [ref=f1e1686]:
        - generic [ref=f1e1688]:
          - generic [ref=f1e1689] [cursor=pointer]:
            - radio "Quiet Garden" [ref=f1e1690]
            - generic [ref=f1e1691]: Quiet Garden
          - generic [ref=f1e1692] [cursor=pointer]:
            - radio "Original Rose" [checked] [active] [ref=f1e1693]
            - generic [ref=f1e1694]: Original Rose
          - generic [ref=f1e1695] [cursor=pointer]:
            - radio "Morning Mist" [ref=f1e1696]
            - generic [ref=f1e1697]: Morning Mist
      - generic [ref=f1e1698] [cursor=pointer]:
        - checkbox "Higher contrast · independent of theme" [ref=f1e1699]
        - text: Higher contrast · independent of theme
      - group "Reading & layout" [ref=f1e1700]:
        - generic [ref=f1e1702]:
          - generic [ref=f1e1703]: Text size
          - combobox "Text size" [ref=f1e1704]:
            - option "Default" [selected]
            - option "Large"
            - option "Extra large"
        - generic [ref=f1e1705]:
          - generic [ref=f1e1706]: Typeface
          - combobox "Typeface" [ref=f1e1707]:
            - option "Default editorial" [selected]
            - option "Rubik"
            - option "Roboto Slab"
        - generic [ref=f1e1708]:
          - generic [ref=f1e1709]: Layout
          - combobox "Layout" [ref=f1e1710]:
            - option "Comfortable" [selected]
            - option "Compact"
            - option "Spacious"
        - generic [ref=f1e1711] [cursor=pointer]:
          - checkbox "Relaxed text spacing" [ref=f1e1712]
          - text: Relaxed text spacing
        - generic [ref=f1e1713] [cursor=pointer]:
          - checkbox "Reduce motion" [ref=f1e1714]
          - text: Reduce motion
      - generic [ref=f1e1715]:
        - generic [ref=f1e1716]: Homepage language
        - combobox "Homepage language" [ref=f1e1717]:
          - option "English" [selected]
          - option "বাংলা"
      - generic [ref=f1e1718]:
        - strong [ref=f1e1719]: Keyboard access is always on.
        - paragraph [ref=f1e1720]: Picture-and-text AAC, read-aloud and reviewed simpler wording are planned. The communication preview on this page is illustrative, not an active care tool.
      - status [ref=f1e1721]: Applied. These preferences stay on this browser when storage is available.
      - button "Restore default appearance" [ref=f1e1722] [cursor=pointer]
      - button "Done, keep exploring" [ref=f1e1723] [cursor=pointer]
  - alert [ref=f1e1726]
```

# Test source

```ts
  46  | });
  47  | 
  48  | test("roadmap totals, filters, shared mapping and ARIA keyboard tabs", async ({ page }) => {
  49  |   await page.goto("/");
  50  |   const filters = page.getByRole("group", { name: "Filter capabilities by status" });
  51  |   await expect(filters.locator("button")).toHaveText(["All24", "Working0", "Limited1", "Simulated0", "Future23"]);
  52  |   await expect(filters.getByRole("button", { name: "Working 0", exact: true })).toHaveAttribute("aria-disabled", "true");
  53  |   await expect(filters.getByRole("button", { name: "Simulated 0", exact: true })).toHaveAttribute("aria-disabled", "true");
  54  |   await filters.getByRole("button", { name: "Working 0", exact: true }).focus(); await page.keyboard.press("Enter");
  55  |   await expect(filters.getByRole("button", { name: "All 24", exact: true })).toHaveAttribute("aria-pressed", "true");
  56  |   await filters.getByRole("button", { name: "Future 23", exact: true }).click();
  57  |   await expect(page.getByRole("tab", { name: "Bondhon 7", exact: true })).toHaveAttribute("aria-selected", "true");
  58  |   await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(7);
  59  |   const adapt = page.getByRole("tab", { name: "Adapt 1", exact: true });
  60  |   await adapt.focus(); await page.keyboard.press("ArrowDown");
  61  |   await expect(page.getByRole("tab", { name: "Barta 3", exact: true })).toBeFocused();
  62  |   await expect(page.getByRole("tabpanel").locator("li")).toHaveCount(3);
  63  |   await page.keyboard.press("ArrowDown");
  64  |   await expect(page.getByRole("tabpanel").locator(".roadmap-panel-heading strong")).toHaveText("Shonket + Bondhon");
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
> 146 |   const dialog = await openPreferences(page); await dialog.getByRole("radio", { name: "Original Rose", exact: true }).check(); await dialog.getByLabel("Higher contrast ? independent of theme", { exact: true }).check(); await dialog.getByLabel("Text size", { exact: true }).selectOption("extra-large"); await dialog.getByLabel("Typeface", { exact: true }).selectOption("rubik"); await dialog.getByLabel("Layout", { exact: true }).selectOption("spacious"); await dialog.getByLabel("Relaxed text spacing", { exact: true }).check(); await dialog.getByLabel("Reduce motion", { exact: true }).check(); await dialog.getByRole("button", { name: "Done, keep exploring" }).click();
      |                                                                                                                                                                                                                   ^ Error: locator.check: Test timeout of 30000ms exceeded.
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
  165 |   for (const width of widths) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Bangla 200% at ${width}px`).toBe(true); expect(await page.locator(".story-phone-body,.upgrade-mini-ui,.upgrade-product-grid,.home-nav").evaluateAll(elements => elements.filter(el => el.scrollWidth > el.clientWidth + 1).map(el => el.className)), `Content at ${width}px`).toEqual([]); expect(await page.locator(".story-phone-body").evaluateAll(elements => Math.min(...elements.map(element => element.clientHeight))), `Usable screen area at ${width}px`).toBeGreaterThan(160); }
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