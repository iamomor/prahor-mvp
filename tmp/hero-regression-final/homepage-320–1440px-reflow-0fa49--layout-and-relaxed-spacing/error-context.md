# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.ts >> 320–1440px reflow includes 200% Bangla, spacious layout and relaxed spacing
- Location: tests\homepage.spec.ts:161:1

# Error details

```
Error: English at 320px

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Skip to main content" [ref=e3] [cursor=pointer]:
      - /url: "#main-content"
    - banner [ref=e4]:
      - generic [ref=e5]:
        - link "PROHOR home" [ref=e6] [cursor=pointer]:
          - /url: /
          - generic [ref=e11]: PROHOR
          - generic [aria-hidden] [ref=e12]: "|"
          - generic [ref=e13]: প্রহর
        - generic [ref=e14]:
          - button "Adjust how you use PROHOR" [ref=e16] [cursor=pointer]
          - button "Open navigation" [ref=e18] [cursor=pointer]
    - main [ref=e20]:
      - region "Maternal care, designed around every mother." [ref=e21]:
        - generic [ref=e22]:
          - generic [ref=e23]:
            - paragraph [ref=e24]:
              - generic [ref=e26]: Connected care. A more human experience.
            - heading "Maternal care, designed around every mother." [level=1] [ref=e27]:
              - generic [ref=e28]: Maternal care,
              - generic [ref=e29]: designed around
              - emphasis [ref=e30]: every mother.
            - paragraph [ref=e31]: আপনার যত্ন, আপনার মতো।
            - paragraph [ref=e32]: "PROHOR is one connected place for mothers in Bangladesh: keep mother and baby records, get Bangla answers with sources, understand your reports, notice your well-being, find care and reach real people, in the way that works for you."
            - generic [ref=e33]:
              - link "Explore PROHOR" [ref=e34] [cursor=pointer]:
                - /url: "#features"
              - link "See how it works" [ref=e38] [cursor=pointer]:
                - /url: "#how-it-works"
            - list "What you can do with PROHOR" [ref=e41]:
              - listitem [ref=e42]:
                - generic [ref=e46]: Mother & baby records
              - listitem [ref=e47]:
                - generic [ref=e50]: Bangla answers with sources
              - listitem [ref=e51]:
                - generic [ref=e56]: Reports explained
              - listitem [ref=e57]:
                - generic [ref=e64]: Well-being
              - listitem [ref=e65]:
                - generic [ref=e71]: Human support
            - paragraph [ref=e72]: Explore without an account.
          - generic [ref=e73]:
            - img "Illustration of the PROHOR app with sample answers, records and sharing controls" [ref=e74]:
              - generic [aria-hidden] [ref=e75]:
                - generic [ref=e81]: Sample data
                - generic [ref=e84]:
                  - generic [ref=e87]:
                    - strong [ref=e92]: PROHOR
                    - generic [ref=e93]: প্রহর
                  - generic [ref=e94]:
                    - generic [ref=e95]:
                      - generic [ref=e96]: YOUR CARE. YOUR WAY.
                      - paragraph [ref=e97]: আজ কী করতে চান?
                      - paragraph [ref=e98]: What would you like to do?
                      - generic [ref=e99]:
                        - generic [ref=e100]:
                          - strong [ref=e104]: Ask PROHOR
                          - generic [ref=e105]: প্রশ্ন করুন
                        - generic [ref=e106]:
                          - strong [ref=e110]: My Health
                          - generic [ref=e111]: আমার স্বাস্থ্য
                        - generic [ref=e112]:
                          - strong [ref=e120]: My Wellness
                          - generic [ref=e121]: আমার সুস্থতা
                        - generic [ref=e122]:
                          - strong [ref=e127]: Find Care
                          - generic [ref=e128]: সেবা খুঁজুন
                      - generic [ref=e129]: Your language. Your pace.
                      - paragraph [ref=e134]: Private by your choice
                    - generic [ref=e139]:
                      - generic [ref=e140]: BARTA · বার্তা
                      - paragraph [ref=e141]: আপনার ভাষায়, সূত্রসহ।
                      - paragraph [ref=e142]: Room for your questions.
                      - generic [ref=e143]:
                        - paragraph [ref=e146]: আমার পছন্দও কি গুরুত্বপূর্ণ?
                        - paragraph [ref=e147]: আপনার অভিজ্ঞতাও যত্নের অংশ।
                        - generic [ref=e148]: WHO · Antenatal care, 2016
                      - paragraph [ref=e155]: Sample educational answer. People provide clinical care.
                      - generic [ref=e156]: আপনার প্রশ্ন লিখুন
                    - generic [ref=e161]:
                      - generic [ref=e162]: JIBONREKHA · জীবনরেখা
                      - paragraph [ref=e163]: One journey. Two care stories.
                      - paragraph [ref=e164]: Your records, connected.
                      - generic [ref=e165]:
                        - strong [ref=e168]: Week 24
                        - generic [ref=e169]: Sample journey
                      - generic [ref=e170]:
                        - generic [ref=e176]:
                          - strong [ref=e177]: Mother
                          - generic [ref=e178]: Visit questions
                        - generic [ref=e184]:
                          - strong [ref=e185]: Baby
                          - generic [ref=e186]: Separate record
                      - generic [ref=e190]:
                        - text: Visit questions
                        - generic [ref=e191]: Recorded by you
                      - paragraph [ref=e194]: You choose what to share
                  - generic [ref=e199]:
                    - generic [ref=e200]: Home
                    - generic [ref=e204]: Ask
                    - generic [ref=e207]: Health
                    - generic [ref=e210]: Care
                - generic [ref=e220]:
                  - generic [ref=e221]:
                    - strong [ref=e224]: Barta
                    - generic [ref=e225]: বার্তা
                  - paragraph [ref=e226]: আমার পছন্দও কি গুরুত্বপূর্ণ?
                  - paragraph [ref=e227]: আপনার অভিজ্ঞতাও যত্নের অংশ।
                  - generic [ref=e228]: WHO · Antenatal care, 2016
                - generic [ref=e237]:
                  - strong [ref=e241]: Jibonrekha
                  - generic [ref=e242]:
                    - strong [ref=e243]: Week 24
                    - generic [ref=e244]: Your care story
                  - generic [ref=e245]:
                    - generic [ref=e251]:
                      - strong [ref=e252]: Mother
                      - generic [ref=e253]: Visit questions
                    - generic [ref=e259]:
                      - strong [ref=e260]: Baby
                      - generic [ref=e261]: Separate record
            - button "Pause animation" [ref=e262] [cursor=pointer]
      - region "The PROHOR product at a glance" [ref=e266]:
        - generic [ref=e267]:
          - generic [ref=e268]:
            - strong [ref=e269]: "8"
            - heading "connected modules" [level=2] [ref=e270]
            - paragraph [ref=e271]: Adapt, Barta, Shonket, Jibonrekha, Bujhi, Shusthota, Poth, Bondhon
          - generic [ref=e272]:
            - strong [ref=e273]: "24"
            - heading "planned capabilities" [level=2] [ref=e274]
            - link "One roadmap, honest status on each" [ref=e275] [cursor=pointer]:
              - /url: "#roadmap"
          - generic [ref=e279]:
            - strong [ref=e280]: "0"
            - heading "disability categories to choose" [level=2] [ref=e281]
            - paragraph [ref=e282]: Same care for every mother; preferences, not labels
          - generic [ref=e283]:
            - strong [ref=e284]: "2"
            - heading "records, 1 journey" [level=2] [ref=e285]
            - paragraph [ref=e286]: Mother and baby records stay separate on one timeline
      - region "Motherhood is a journey. Care shouldn’t feel like a puzzle." [ref=e287]:
        - generic [ref=e288]:
          - generic [ref=e289]:
            - paragraph [ref=e290]:
              - generic [ref=e292]: Why PROHOR
            - heading [level=2] [ref=e293]:
              - text: Motherhood is a journey.
              - emphasis [ref=e294]: Care shouldn’t feel like a puzzle.
            - list [ref=e295]:
              - listitem [ref=e296]:
                - generic [ref=e301]:
                  - heading "Less scattered. More connected." [level=3] [ref=e302]
                  - paragraph [ref=e303]: Keep records, questions and visits in the same story.
              - listitem [ref=e304]:
                - generic [ref=e307]:
                  - heading "Fewer barriers. More ways in." [level=3] [ref=e308]
                  - paragraph [ref=e309]: Language, small text and voice-only tasks shouldn’t stand between you and care.
              - listitem [ref=e310]:
                - generic [ref=e315]:
                  - heading "Beyond birth. Still about you." [level=3] [ref=e316]
                  - paragraph [ref=e317]: A baby’s beginning is another chapter in the mother’s care.
            - generic [ref=e318]:
              - paragraph [ref=e319]:
                - text: About 4,000 maternal deaths in Bangladesh in 2023; the maternal mortality ratio was 79% lower than in 2000.
                - link "UN estimates · WHO, UNICEF, UNFPA · 2025 (opens in a new tab)" [ref=e320] [cursor=pointer]:
                  - /url: https://www.unicef.org/bangladesh/en/press-releases/uncertainty-aid-commitments-threatens-bangladeshs-progress-maternal-health-unicef
                  - text: UN estimates · WHO, UNICEF, UNFPA · 2025
                  - generic [ref=e321]: (opens in a new tab)
              - paragraph [ref=e322]:
                - text: 1 in 3 women who died of maternal causes had sought care at three or more places.
                - link "BMMS 2016 · Journal of Global Health, 2023 (opens in a new tab)" [ref=e323] [cursor=pointer]:
                  - /url: https://pmc.ncbi.nlm.nih.gov/articles/PMC10248997/
                  - text: BMMS 2016 · Journal of Global Health, 2023
                  - generic [ref=e324]: (opens in a new tab)
          - generic [ref=e325]:
            - img "Image placeholder. The supplied mother photograph is missing." [ref=e327]
            - generic [ref=e333]: A report here.
            - generic [ref=e341]: A visit there.
            - generic [ref=e354]: Let the care hold the pieces.
      - region "One care. Your way." [ref=e357]:
        - generic [ref=e358]:
          - generic [ref=e359]:
            - generic [ref=e360]:
              - paragraph [ref=e361]:
                - generic [ref=e363]: Designed around difference
              - heading [level=2] [ref=e364]:
                - text: One care.
                - emphasis [ref=e365]: Your way.
            - paragraph [ref=e366]: The same visit question, in three presentations. Try a question. Your words stay with you as you explore.
          - region "Visit question presentations" [ref=e367]:
            - group "Touch & text" [ref=e368]:
              - generic [ref=e369]:
                - generic [ref=e370]: Touch & text
                - generic [ref=e371]: Sample data
              - generic [ref=e372]:
                - generic [ref=e375]: PROHOR
                - region "Touch & text screen" [ref=e384]:
                  - generic [ref=e385]:
                    - paragraph [ref=e389]: Your next visit
                    - heading "A question, in your words." [level=3] [ref=e390]
                  - generic [ref=e391]: What would you like to ask?
                  - textbox "What would you like to ask?" [ref=e392]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - paragraph [ref=e393]: How can I prepare for my next visit?
                  - button "Review my question" [ref=e394] [cursor=pointer]
                  - paragraph [ref=e397]: Your words. Your choice.
            - group "Large text + high contrast" [ref=e404]:
              - generic [ref=e405]:
                - generic [ref=e406]: Large text + high contrast
                - generic [ref=e407]: Sample data
              - generic [ref=e408]:
                - generic [ref=e411]: PROHOR
                - region "Large text + high contrast screen" [ref=e420]:
                  - heading "A question, in your words." [level=3] [ref=e422]
                  - generic [ref=e423]: What would you like to ask?
                  - textbox "What would you like to ask?" [ref=e424]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - paragraph [ref=e425]: How can I prepare for my next visit?
                  - button "Review my question" [ref=e426] [cursor=pointer]
            - group "Picture-and-text" [ref=e431]:
              - generic [ref=e432]:
                - generic [ref=e433]: Picture-and-text
                - generic [ref=e434]: Sample data
              - generic [ref=e435]:
                - generic [ref=e438]: PROHOR
                - region "Picture-and-text screen" [ref=e447]:
                  - generic [ref=e448]:
                    - paragraph [ref=e452]: Your next visit
                    - heading "A question, in your words." [level=3] [ref=e453]
                  - generic [ref=e454]: What would you like to ask?
                  - group "Picture-and-text sample phrases" [ref=e455]:
                    - button "About my visit" [ref=e456] [cursor=pointer]
                    - button "About my records" [ref=e461] [cursor=pointer]
                  - textbox "What would you like to ask?" [ref=e467]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - paragraph [ref=e468]: How can I prepare for my next visit?
                  - button "Review my question" [ref=e469] [cursor=pointer]
                  - paragraph [ref=e472]: Your words. Your choice.
          - generic [ref=e479]:
            - paragraph [ref=e480]: Change the presentation. Keep your words, your choices and your place.
            - button "Adjust how you use PROHOR" [ref=e481] [cursor=pointer]
          - status [ref=e486]
      - region "Not just a tracker. A care companion." [ref=e487]:
        - generic [ref=e488]:
          - generic [ref=e489]:
            - generic [ref=e490]:
              - paragraph [ref=e491]:
                - generic [ref=e493]: Care that makes room for life
              - heading [level=2] [ref=e494]:
                - text: Not just a tracker.
                - emphasis [ref=e495]: A care companion.
            - paragraph [ref=e496]: Understanding, access, safety and human connection. Thoughtful tools for the moments between appointments, too.
          - generic [ref=e497]:
            - article [ref=e498]:
              - generic [ref=e503]:
                - text: Barta
                - generic [aria-hidden] [ref=e504]: ·
                - generic [ref=e505]: বার্তা
              - heading "A question deserves clarity." [level=3] [ref=e506]
              - paragraph [ref=e507]: Bangla explanations, with sources to open and read.
              - img "Sample data. A Bangla question and educational answer, WHO and CDC sources, and an explicit insufficient-evidence fallback. This is a product preview, not a live AI answer." [ref=e508]:
                - generic [ref=e509]: Sample data
                - generic [aria-hidden] [ref=e511]:
                  - generic [ref=e512]:
                    - paragraph [ref=e513]: আমার যত্নে আমার পছন্দও কি গুরুত্বপূর্ণ?
                    - generic [ref=e514]:
                      - generic [ref=e515]: Barta
                      - paragraph [ref=e518]: মায়ের শারীরিক ও মানসিক সুস্থতার পাশাপাশি তাঁর অভিজ্ঞতাও গর্ভকালীন যত্নের অংশ।
                  - generic [ref=e519]:
                    - link [ref=e520] [cursor=pointer]:
                      - /url: https://www.who.int/publications/i/item/9789241549912
                      - generic [ref=e523]: WHO · Antenatal care, 2016
                      - generic [ref=e527]: Opens in a new tab
                    - link [ref=e528] [cursor=pointer]:
                      - /url: https://www.cdc.gov/hearher/maternal-warning-signs/index.html
                      - generic [ref=e531]: CDC · Warning signs
                      - generic [ref=e535]: Opens in a new tab
                  - paragraph [ref=e536]:
                    - generic [ref=e539]: Not enough approved evidence? PROHOR says so and suggests asking a clinician.
            - article [ref=e540]:
              - generic [ref=e546]:
                - text: Shonket
                - generic [aria-hidden] [ref=e547]: ·
                - generic [ref=e548]: সংকেত
              - heading "Help beyond the chatbot." [level=3] [ref=e549]
              - paragraph [ref=e550]: Reviewed warning signs. A direct path to help.
              - img "Sample data. Reviewed-warning-signs layout with three CDC examples, a sample Call 999 button, and request tracking. Only Submitted is complete; Delivered, Acknowledged and Responded are pending. No care request has been sent." [ref=e551]:
                - generic [ref=e552]: Sample data
                - generic [aria-hidden] [ref=e554]:
                  - strong [ref=e555]: Warning signs, reviewed
                  - list [ref=e556]:
                    - listitem [ref=e557]:
                      - generic [ref=e561]: A severe headache that persists
                    - listitem [ref=e562]:
                      - generic [ref=e566]: Trouble breathing
                    - listitem [ref=e567]:
                      - generic [ref=e571]: Heavy bleeding
                  - generic [ref=e572]:
                    - link [ref=e573] [cursor=pointer]:
                      - /url: https://www.cdc.gov/hearher/maternal-warning-signs/index.html
                      - generic [ref=e576]: CDC · Warning signs
                      - generic [ref=e580]: Opens in a new tab
                    - button [ref=e581] [cursor=pointer]: Call 999
                  - list [ref=e587]:
                    - listitem [ref=e588]:
                      - generic [ref=e593]: Submitted
                      - generic [ref=e594]: Complete
                    - listitem [ref=e595]:
                      - generic [ref=e600]: Delivered
                      - generic [ref=e601]: Pending
                    - listitem [ref=e602]:
                      - generic [ref=e607]: Acknowledged
                      - generic [ref=e608]: Pending
                    - listitem [ref=e609]:
                      - generic [ref=e614]: Responded
                      - generic [ref=e615]: Pending
                  - paragraph [ref=e616]: A request is never shown as delivered until it is.
            - article [ref=e617]:
              - generic [ref=e621]:
                - text: Adapt
                - generic [aria-hidden] [ref=e622]: ·
                - generic [ref=e623]: অ্যাডাপ্ট
              - heading "Your preferences belong here." [level=3] [ref=e624]
              - paragraph [ref=e625]: Your text, theme and contrast. The same care.
              - group "Try Adapt locally" [ref=e626]:
                - generic [ref=e627]: Sample data
                - generic [ref=e629]:
                  - generic [ref=e630]: Text size
                  - group "Sample text size" [ref=e631]:
                    - button "A sample text size" [pressed] [ref=e632] [cursor=pointer]: A
                    - button "A+ sample text size" [ref=e633] [cursor=pointer]: A+
                    - button "A++ sample text size" [ref=e634] [cursor=pointer]: A++
                - generic [ref=e635]:
                  - paragraph [ref=e636]: আপনার যত্ন, আপনার মতো।
                  - paragraph [ref=e637]: Your care. Your way.
                - generic [ref=e638]:
                  - generic [ref=e639]: Theme
                  - group "Sample theme" [ref=e640]:
                    - button "Quiet Garden" [pressed] [ref=e641] [cursor=pointer]
                    - button "Original Rose" [ref=e644] [cursor=pointer]: R
                    - button "Morning Mist" [ref=e645] [cursor=pointer]: M
                - generic [ref=e646] [cursor=pointer]:
                  - generic [ref=e647]: Higher contrast
                  - switch "Higher contrast" [ref=e648]
                - group "Choose a sample phrase" [ref=e651]:
                  - button "I need help" [ref=e652] [cursor=pointer]
                  - button "I have a question" [ref=e659] [cursor=pointer]
                - generic [ref=e663]:
                  - button "Read aloud" [ref=e664] [cursor=pointer]
                  - generic [ref=e669]: Try it here only
                - status [ref=e670]: Page settings stay as you chose them.
            - article [ref=e671]:
              - generic [ref=e679]:
                - text: Bondhon
                - generic [aria-hidden] [ref=e680]: ·
                - generic [ref=e681]: বন্ধন
              - heading "Connection, with permission." [level=3] [ref=e682]
              - paragraph [ref=e683]: Choose the people and records before sharing.
              - img "Sample data. Mother to chosen supporter to provider. Visit questions selected, reports unselected. Diary and AI conversations stay private. A synthetic access log and Revoke access button illustrate consent; no records are shared." [ref=e684]:
                - generic [ref=e685]: Sample data
                - generic [aria-hidden] [ref=e687]:
                  - generic [ref=e688]:
                    - generic [ref=e689]: Mother
                    - generic [ref=e696]: Chosen supporter
                    - generic [ref=e705]: Provider
                  - generic [ref=e710]:
                    - generic [ref=e711]:
                      - generic [ref=e712]: Visit questions
                      - generic [ref=e716]: "On"
                    - generic [ref=e717]:
                      - generic [ref=e718]: Selected reports
                      - generic [ref=e722]: "Off"
                  - generic [ref=e723]:
                    - generic [ref=e728]: Diary & AI conversations
                    - generic [ref=e729]: Private
                  - paragraph [ref=e730]: Your review comes before sharing.
                  - paragraph [ref=e734]:
                    - generic [ref=e738]: "Access log: supporter viewed appointment, today"
                  - button [ref=e739] [cursor=pointer]: Revoke access
      - region "One app for the whole journey." [ref=e743]:
        - generic [ref=e744]:
          - generic [ref=e745]:
            - generic [ref=e746]:
              - paragraph [ref=e747]:
                - generic [ref=e749]: Eight modules, one shared foundation
              - heading [level=2] [ref=e750]:
                - text: One app for
                - emphasis [ref=e751]: the whole journey.
            - paragraph [ref=e752]: From a first question to the chapters after birth. Your preferences and permissions stay part of the same experience.
          - generic [ref=e757]:
            - strong [ref=e758]: One web app. Works in your browser on any phone.
            - paragraph [ref=e759]: Add to your home screen from your browser’s menu.
          - navigation "The eight PROHOR modules" [ref=e760]:
            - link "Adapt অ্যাডাপ্ট" [ref=e761] [cursor=pointer]:
              - /url: "#module-adapt"
              - generic [ref=e764]:
                - strong [ref=e765]: Adapt
                - generic [ref=e766]: অ্যাডাপ্ট
            - link "Barta বার্তা" [ref=e767] [cursor=pointer]:
              - /url: "#module-barta"
              - generic [ref=e771]:
                - strong [ref=e772]: Barta
                - generic [ref=e773]: বার্তা
            - link "Shonket সংকেত" [ref=e774] [cursor=pointer]:
              - /url: "#module-shonket"
              - generic [ref=e779]:
                - strong [ref=e780]: Shonket
                - generic [ref=e781]: সংকেত
            - link "Jibonrekha জীবনরেখা" [ref=e782] [cursor=pointer]:
              - /url: "#module-jibonrekha"
              - generic [ref=e786]:
                - strong [ref=e787]: Jibonrekha
                - generic [ref=e788]: জীবনরেখা
            - link "Bujhi বুঝি" [ref=e789] [cursor=pointer]:
              - /url: "#module-bujhi"
              - generic [ref=e795]:
                - strong [ref=e796]: Bujhi
                - generic [ref=e797]: বুঝি
            - link "Shusthota সুস্থতা" [ref=e798] [cursor=pointer]:
              - /url: "#module-shusthota"
              - generic [ref=e806]:
                - strong [ref=e807]: Shusthota
                - generic [ref=e808]: সুস্থতা
            - link "Poth পথ" [ref=e809] [cursor=pointer]:
              - /url: "#module-poth"
              - generic [ref=e814]:
                - strong [ref=e815]: Poth
                - generic [ref=e816]: পথ
            - link "Bondhon বন্ধন" [ref=e817] [cursor=pointer]:
              - /url: "#module-bondhon"
              - generic [ref=e824]:
                - strong [ref=e825]: Bondhon
                - generic [ref=e826]: বন্ধন
          - generic "Provider workspace concepts" [ref=e827]:
            - generic [ref=e828]: Request queue
            - generic [ref=e831]: Consented records
            - generic [ref=e834]: Preferred contact
            - generic [ref=e837]: Audit trail
          - region "One app for the whole journey." [ref=e840]:
            - article [ref=e841]:
              - group "Jibonrekha" [ref=e842]:
                - generic [ref=e843]:
                  - generic [ref=e844]: Jibonrekha
                  - generic [ref=e845]: Sample data
                - generic [ref=e846]:
                  - generic [ref=e849]: PROHOR
                  - region "Jibonrekha screen" [ref=e858]:
                    - generic [ref=e859]:
                      - paragraph [ref=e863]: Jibonrekha · জীবনরেখা
                      - heading "Your story stays together." [level=3] [ref=e864]
                    - generic [ref=e865]:
                      - generic [ref=e871]:
                        - generic [ref=e872]: Mother
                        - strong [ref=e873]: Week 24 · Nila’s journey
                        - paragraph [ref=e874]: Questions for the next visit
                      - generic [ref=e880]:
                        - generic [ref=e881]: Baby
                        - strong [ref=e882]: A story of their own
                        - paragraph [ref=e883]: A separate record, from the start
                      - generic [ref=e884]: Two records. One connected journey.
                    - generic [ref=e891]:
                      - strong [ref=e892]: Visit notes
                      - generic [ref=e893]: Recorded by you
              - paragraph [ref=e898]:
                - emphasis [ref=e899]: Two stories, held together.
              - paragraph [ref=e900]: দুটি গল্প, একসঙ্গে।
            - article [ref=e901]:
              - group "Bujhi" [ref=e902]:
                - generic [ref=e903]:
                  - generic [ref=e904]: Bujhi
                  - generic [ref=e905]: Sample data
                - generic [ref=e906]:
                  - generic [ref=e909]: PROHOR
                  - region "Bujhi screen" [ref=e918]:
                    - generic [ref=e919]:
                      - paragraph [ref=e925]: Bujhi · বুঝি
                      - heading "Read. Review. Understand." [level=3] [ref=e926]
                    - generic [ref=e927]:
                      - strong [ref=e931]: A report to understand
                      - generic [ref=e932]: visit-report.pdf
                    - generic [ref=e933]:
                      - generic [ref=e934]: Document type
                      - strong [ref=e935]: Visit report
                    - generic [ref=e936]:
                      - generic [ref=e937]: Record belongs to
                      - strong [ref=e938]: Mother · review first
                    - list [ref=e939]:
                      - listitem [ref=e940]: Upload
                      - listitem [ref=e944]: Review
                      - listitem [ref=e948]: Confirm
              - paragraph [ref=e953]:
                - emphasis [ref=e954]: A little more understanding.
              - paragraph [ref=e955]: আরও একটু বোঝাপড়া।
            - article [ref=e956]:
              - group "Shusthota" [ref=e957]:
                - generic [ref=e958]:
                  - generic [ref=e959]: Shusthota
                  - generic [ref=e960]: Sample data
                - generic [ref=e961]:
                  - generic [ref=e964]: PROHOR
                  - region "Shusthota screen" [ref=e973]:
                    - generic [ref=e974]:
                      - paragraph [ref=e982]: Shusthota · সুস্থতা
                      - heading "How are you, today?" [level=3] [ref=e983]
                    - group "A moment for yourself" [ref=e984]:
                      - generic [ref=e986]:
                        - generic [ref=e987] [cursor=pointer]:
                          - radio "Quiet" [checked] [ref=e988]
                          - generic [ref=e995]: Quiet
                          - text: ✓
                        - generic [ref=e996] [cursor=pointer]:
                          - radio "Tired" [ref=e997]
                          - generic [ref=e1000]: Tired
                        - generic [ref=e1001] [cursor=pointer]:
                          - radio "Unsure" [ref=e1002]
                          - generic [ref=e1005]: Unsure
                    - generic [ref=e1006]:
                      - heading "A little room to rest." [level=4] [ref=e1009]
                      - paragraph [ref=e1010]: Your pace. No score to keep.
                    - paragraph [ref=e1011]: Your diary is yours.
              - paragraph [ref=e1018]:
                - emphasis [ref=e1019]: Room for the person, too.
              - paragraph [ref=e1020]: মানুষটির জন্যও জায়গা।
            - article [ref=e1021]:
              - group "Poth" [ref=e1022]:
                - generic [ref=e1023]:
                  - generic [ref=e1024]: Poth
                  - generic [ref=e1025]: Sample data
                - generic [ref=e1026]:
                  - generic [ref=e1029]: PROHOR
                  - region "Poth screen" [ref=e1038]:
                    - generic [ref=e1039]:
                      - paragraph [ref=e1044]: Poth · পথ
                      - heading "A next step, closer." [level=3] [ref=e1045]
                    - generic [ref=e1046]: Find a facility
                    - textbox "Find a facility" [ref=e1051]:
                      - /placeholder: Search these examples
                    - generic [ref=e1052]:
                      - link "Dhaka Medical College Hospital Shahbag, Dhaka Opens DGHS in a new tab" [ref=e1053] [cursor=pointer]:
                        - /url: https://hrm.dghs.gov.bd/public/facility-registry/facilities/31/profile
                        - generic [ref=e1058]:
                          - strong [ref=e1059]: Dhaka Medical College Hospital
                          - generic [ref=e1060]: Shahbag, Dhaka
                        - generic [ref=e1064]: Opens DGHS in a new tab
                      - link "Sir Salimullah Medical College Mitford Hospital Kotwali, Dhaka Opens DGHS in a new tab" [ref=e1065] [cursor=pointer]:
                        - /url: https://hrm.dghs.gov.bd/public/facility-registry/facilities/52/profile
                        - generic [ref=e1070]:
                          - strong [ref=e1071]: Sir Salimullah Medical College Mitford Hospital
                          - generic [ref=e1072]: Kotwali, Dhaka
                        - generic [ref=e1076]: Opens DGHS in a new tab
                    - paragraph [ref=e1077]: "Source: DGHS facility registry"
              - paragraph [ref=e1082]:
                - emphasis [ref=e1083]: A clearer way forward.
              - paragraph [ref=e1084]: সামনের পথ আরও পরিষ্কার।
      - region "How one question becomes safe, shared support." [ref=e1085]:
        - generic [ref=e1087]:
          - generic [ref=e1088]:
            - paragraph [ref=e1089]:
              - generic [ref=e1091]: A thoughtful path through
            - generic [ref=e1092]: Sample data
          - generic [ref=e1093]:
            - heading [level=2] [ref=e1094]:
              - text: How one question becomes
              - emphasis [ref=e1095]: safe, shared support.
            - paragraph [ref=e1096]: The question starts with her. Evidence makes its limits clear. Permission shapes what reaches another person.
          - list [ref=e1098]:
            - listitem [ref=e1099]:
              - generic [ref=e1100]: Step 1
              - heading "She asks" [level=3] [ref=e1105]
              - paragraph [ref=e1106]: Her words are the starting point.
              - img "Sample illustration for step 1. She asks" [ref=e1107]:
                - generic [aria-hidden] [ref=e1108]:
                  - paragraph [ref=e1109]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - paragraph [ref=e1110]: How can I prepare for my next visit?
            - listitem [ref=e1111]:
              - generic [ref=e1112]: Step 2
              - heading "Evidence is found" [level=3] [ref=e1117]
              - paragraph [ref=e1118]: Sources, with their limits in view.
              - img "Sample illustration for step 2. Evidence is found" [ref=e1119]:
                - generic [aria-hidden] [ref=e1120]:
                  - link [ref=e1121] [cursor=pointer]:
                    - /url: https://www.who.int/publications/i/item/9789241549912
                    - generic [ref=e1124]: WHO · Antenatal care, 2016
                    - generic [ref=e1128]: Opens in a new tab
                  - generic [ref=e1129]: Not enough evidence
            - listitem [ref=e1132]:
              - generic [ref=e1133]: Step 3
              - heading "She chooses what to share" [level=3] [ref=e1140]
              - paragraph [ref=e1141]: Her review. Her recipient. Her say.
              - img "Sample illustration for step 3. She chooses what to share" [ref=e1142]:
                - generic [ref=e1144]:
                  - generic [ref=e1145]: My visit question
                  - generic [ref=e1148]: My diary stays private
            - listitem [ref=e1153]:
              - generic [ref=e1154]: Step 4
              - heading "A person follows up" [level=3] [ref=e1162]
              - paragraph [ref=e1163]: A clear handoff, with a human reply.
              - img "Sample illustration for step 4. A synthetic request from Nila is acknowledged. This is not a real provider response." [ref=e1164]:
                - generic [aria-hidden] [ref=e1165]:
                  - generic [ref=e1166]:
                    - generic [ref=e1171]: Request from Nila
                    - generic [ref=e1172]: Acknowledged
                  - paragraph [ref=e1176]: Only what she chose reaches them.
      - region "For the mother. For the people beside her." [ref=e1177]:
        - generic [ref=e1178]:
          - generic [ref=e1179]:
            - generic [ref=e1180]:
              - paragraph [ref=e1181]:
                - generic [ref=e1183]: Two windows, the same care story
              - heading [level=2] [ref=e1184]:
                - text: For the mother.
                - emphasis [ref=e1185]: For the people beside her.
            - paragraph [ref=e1186]: One shared foundation, with a different view for the person asking and the people preparing to support her.
          - generic [ref=e1187]:
            - article [ref=e1188]:
              - generic [ref=e1189]: For mothers
              - heading "A little more understood." [level=3] [ref=e1190]
              - paragraph [ref=e1191]: Your questions, records and preferences, with you at the centre.
              - list [ref=e1192]:
                - listitem [ref=e1193]: Explore in Bangla or English
                - listitem [ref=e1196]: Keep mother and baby records distinct
                - listitem [ref=e1199]: Choose the people you bring in
              - generic [ref=e1202]:
                - generic [ref=e1203]:
                  - generic [aria-hidden] [ref=e1204]: ● ● ●
                  - generic [ref=e1205]: PROHOR / My care
                  - generic [ref=e1206]: Sample data
                - generic [ref=e1207]:
                  - link "PROHOR home" [ref=e1208] [cursor=pointer]:
                    - /url: /
                    - generic [ref=e1209]: PROHOR
                    - generic [aria-hidden] [ref=e1210]: "|"
                    - generic [ref=e1211]: প্রহর
                  - heading "আজ একটু নিজের খোঁজ নিন।" [level=3] [ref=e1212]
                  - paragraph [ref=e1213]: Your care, in one place.
                  - generic [ref=e1214]:
                    - link "My care story" [ref=e1215] [cursor=pointer]:
                      - /url: "#module-jibonrekha"
                    - link "My questions" [ref=e1221] [cursor=pointer]:
                      - /url: "#module-barta"
                    - link "My preferences" [ref=e1227] [cursor=pointer]:
                      - /url: "#module-adapt"
                  - generic [ref=e1232]: Motherhood is part of your story. You are at the centre.
              - link "Explore your experience" [ref=e1236] [cursor=pointer]:
                - /url: "#your-way"
            - article [ref=e1240]:
              - generic [ref=e1241]: For care providers
              - heading "A little more context." [level=3] [ref=e1242]
              - paragraph [ref=e1243]: The story a mother chooses to share, with its source and her permission.
              - list [ref=e1244]:
                - listitem [ref=e1245]: See the question in her own words
                - listitem [ref=e1248]: Keep source and permission together
                - listitem [ref=e1251]: Prepare for a human conversation
              - generic [ref=e1254]:
                - generic [ref=e1255]:
                  - generic [aria-hidden] [ref=e1256]: ● ● ●
                  - generic [ref=e1257]: PROHOR / Care workspace
                  - generic [ref=e1258]: Sample data
                - generic [ref=e1259]:
                  - generic [ref=e1267]:
                    - text: Mother-led context
                    - heading "Prepare to listen." [level=3] [ref=e1268]
                  - generic [ref=e1269]:
                    - generic [ref=e1270]: Questions
                    - generic [ref=e1271]: Chosen records
                    - generic [ref=e1272]: Permissions
                  - generic [ref=e1276]:
                    - strong [ref=e1277]: Nila’s visit question
                    - paragraph [ref=e1278]: আমার পরের সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?
                  - list [ref=e1279]:
                    - listitem [ref=e1280]: Context from selected records
                    - listitem [ref=e1284]: Visible source for each note
                    - listitem [ref=e1287]: Access defined by the mother
              - link "Explore the care connection" [ref=e1292] [cursor=pointer]:
                - /url: "#module-bondhon"
      - region "AI helps explain. People provide care." [ref=e1296]:
        - generic [ref=e1297]:
          - generic [ref=e1298]:
            - generic [ref=e1299]:
              - paragraph [ref=e1300]:
                - generic [ref=e1302]: Thoughtful technology
              - heading [level=2] [ref=e1303]:
                - text: AI helps explain.
                - emphasis [ref=e1304]: People provide care.
            - paragraph [ref=e1305]: Useful technology starts with clear boundaries. Keep evidence, human oversight and your permission in the picture.
          - generic [ref=e1306]:
            - article [ref=e1307]:
              - heading "Evidence you can open." [level=3] [ref=e1311]
              - paragraph [ref=e1312]: Keep sources beside explanations. Say when the information does not cover the question.
              - generic [ref=e1313]:
                - generic [ref=e1314]: Evidence
                - generic [ref=e1315]: Human review
                - generic [ref=e1316]: No diagnosis
            - article [ref=e1317]:
              - heading "People keep the judgment." [level=3] [ref=e1324]
              - paragraph [ref=e1325]: AI helps explain information. Clinical decisions and real care belong with qualified people.
              - generic [ref=e1326]:
                - generic [ref=e1327]: Evidence
                - generic [ref=e1328]: Human review
                - generic [ref=e1329]: No diagnosis
            - article [ref=e1330]:
              - heading "Permission stays with you." [level=3] [ref=e1336]
              - paragraph [ref=e1337]: Choose the person, purpose and records. Diary and AI conversations stay outside default sharing.
              - generic [ref=e1338]:
                - generic [ref=e1339]: Evidence
                - generic [ref=e1340]: Human review
                - generic [ref=e1341]: No diagnosis
      - region "Built with care. By people who care." [ref=e1342]:
        - generic [ref=e1343]:
          - generic [ref=e1344]:
            - generic [ref=e1345]:
              - paragraph [ref=e1346]:
                - generic [ref=e1348]: The people behind PROHOR
              - heading [level=2] [ref=e1349]:
                - text: Built with care.
                - emphasis [ref=e1350]: By people who care.
            - paragraph [ref=e1351]: A shared effort across inclusive design, technology and the everyday details of maternal care.
          - generic [ref=e1352]:
            - article [ref=e1353]:
              - generic [aria-hidden] [ref=e1355]: O
              - heading "Omor" [level=3] [ref=e1356]
              - paragraph [ref=e1357]: Project lead and platform
            - article [ref=e1358]:
              - generic [aria-hidden] [ref=e1360]: I
              - heading "Iftee" [level=3] [ref=e1361]
              - paragraph [ref=e1362]: Inclusive UI and accessibility
            - article [ref=e1363]:
              - generic [aria-hidden] [ref=e1365]: I
              - heading "Ifty" [level=3] [ref=e1366]
              - paragraph [ref=e1367]: AI and retrieval
            - article [ref=e1368]:
              - generic [aria-hidden] [ref=e1370]: A
              - heading "Apubo" [level=3] [ref=e1371]
              - paragraph [ref=e1372]: Mother and baby records
            - article [ref=e1373]:
              - generic [aria-hidden] [ref=e1375]: S
              - heading "Samin" [level=3] [ref=e1376]
              - paragraph [ref=e1377]: Wellness and care navigation
      - region "What’s taking shape." [ref=e1378]:
        - generic [ref=e1379]:
          - generic [ref=e1380]:
            - generic [ref=e1381]:
              - paragraph [ref=e1382]:
                - generic [ref=e1384]: An ambitious vision. An honest view.
              - heading [level=2] [ref=e1385]:
                - emphasis [ref=e1386]: What’s taking shape.
            - paragraph [ref=e1387]: Local appearance controls are connected. Explore the full care vision and where each capability stands.
          - group "Filter capabilities by status" [ref=e1388]:
            - button "All 24" [pressed] [ref=e1389] [cursor=pointer]:
              - generic [ref=e1394]: All
              - generic [ref=e1395]: "24"
            - button "Working 0" [disabled] [ref=e1396]:
              - generic [ref=e1399]: Working
              - generic [ref=e1400]: "0"
            - button "Limited 1" [ref=e1401] [cursor=pointer]:
              - generic [ref=e1411]: Limited
              - generic [ref=e1412]: "1"
            - button "Simulated 0" [disabled] [ref=e1413]:
              - generic [ref=e1417]: Simulated
              - generic [ref=e1418]: "0"
            - button "Future 23" [ref=e1419] [cursor=pointer]:
              - generic [ref=e1423]: Future
              - generic [ref=e1424]: "23"
          - paragraph [ref=e1425]: Includes Working or Limited capabilities
          - generic [ref=e1426]:
            - tablist "Roadmap modules" [ref=e1427]:
              - tab "Adapt 1" [selected] [ref=e1428] [cursor=pointer]:
                - generic [ref=e1430]: Adapt
                - generic [ref=e1432]: "1"
              - tab "Barta 3" [ref=e1433] [cursor=pointer]:
                - generic [ref=e1436]: Barta
                - generic [ref=e1437]: "3"
              - tab "Shonket 2" [ref=e1438] [cursor=pointer]:
                - generic [ref=e1442]: Shonket
                - generic [ref=e1443]: "2"
              - tab "Jibonrekha 4" [ref=e1444] [cursor=pointer]:
                - generic [ref=e1447]: Jibonrekha
                - generic [ref=e1448]: "4"
              - tab "Bujhi 1" [ref=e1449] [cursor=pointer]:
                - generic [ref=e1454]: Bujhi
                - generic [ref=e1455]: "1"
              - tab "Shusthota 2" [ref=e1456] [cursor=pointer]:
                - generic [ref=e1463]: Shusthota
                - generic [ref=e1464]: "2"
              - tab "Poth 4" [ref=e1465] [cursor=pointer]:
                - generic [ref=e1469]: Poth
                - generic [ref=e1470]: "4"
              - tab "Bondhon 7" [ref=e1471] [cursor=pointer]:
                - generic [ref=e1477]: Bondhon
                - generic [ref=e1478]: "7"
            - tabpanel "Adapt 1" [ref=e1480]:
              - generic [ref=e1481]:
                - strong [ref=e1485]: Adapt
                - generic [ref=e1486]: 1 / 1
              - list [ref=e1487]:
                - listitem [ref=e1488]:
                  - generic "Capability 1" [ref=e1489]: "01"
                  - generic [ref=e1490]:
                    - heading "Universal Accessibility Profile" [level=3] [ref=e1491]
                    - paragraph [ref=e1492]: Local appearance and reading preferences.
                  - generic [ref=e1493]: Limited
          - status [ref=e1503]: "Adapt: 1 matching capabilities."
      - region "One care journey. Every mother’s way." [ref=e1504]:
        - generic [ref=e1507]:
          - paragraph [ref=e1508]:
            - generic [ref=e1510]: Your care. Your way.
          - heading [level=2] [ref=e1511]:
            - text: One care journey.
            - emphasis [ref=e1512]: Every mother’s way.
          - paragraph [ref=e1513]: A more connected future starts by making room for every mother.
          - generic [ref=e1514]:
            - button "Make PROHOR yours" [ref=e1515] [cursor=pointer]
            - link "Explore the journey" [ref=e1519] [cursor=pointer]:
              - /url: "#features"
          - paragraph [ref=e1522]: An educational product prototype; clinical services and provider delivery are not connected.
    - contentinfo [ref=e1523]:
      - generic [ref=e1524]:
        - generic [ref=e1525]:
          - generic [ref=e1526]:
            - link "PROHOR home" [ref=e1527] [cursor=pointer]:
              - /url: /
              - generic [ref=e1528]: PROHOR
              - generic [aria-hidden] [ref=e1529]: "|"
              - generic [ref=e1530]: প্রহর
            - paragraph [ref=e1531]: Your Care. Your Way.
            - paragraph [ref=e1532]: আপনার যত্ন, আপনার মতো।
            - button "Adjust how you use PROHOR" [ref=e1533] [cursor=pointer]
          - navigation "Modules" [ref=e1535]:
            - heading "Modules" [level=2] [ref=e1536]
            - list [ref=e1537]:
              - listitem [ref=e1538]:
                - link "Adapt" [ref=e1539] [cursor=pointer]:
                  - /url: "#module-adapt"
              - listitem [ref=e1540]:
                - link "Barta" [ref=e1541] [cursor=pointer]:
                  - /url: "#module-barta"
              - listitem [ref=e1542]:
                - link "Shonket" [ref=e1543] [cursor=pointer]:
                  - /url: "#module-shonket"
              - listitem [ref=e1544]:
                - link "Jibonrekha" [ref=e1545] [cursor=pointer]:
                  - /url: "#module-jibonrekha"
              - listitem [ref=e1546]:
                - link "Bujhi" [ref=e1547] [cursor=pointer]:
                  - /url: "#module-bujhi"
              - listitem [ref=e1548]:
                - link "Shusthota" [ref=e1549] [cursor=pointer]:
                  - /url: "#module-shusthota"
              - listitem [ref=e1550]:
                - link "Poth" [ref=e1551] [cursor=pointer]:
                  - /url: "#module-poth"
              - listitem [ref=e1552]:
                - link "Bondhon" [ref=e1553] [cursor=pointer]:
                  - /url: "#module-bondhon"
          - navigation "Explore" [ref=e1554]:
            - heading "Explore" [level=2] [ref=e1555]
            - list [ref=e1556]:
              - listitem [ref=e1557]:
                - link "Why PROHOR" [ref=e1558] [cursor=pointer]:
                  - /url: "#why-prohor"
              - listitem [ref=e1559]:
                - link "How it works" [ref=e1560] [cursor=pointer]:
                  - /url: "#how-it-works"
              - listitem [ref=e1561]:
                - link "Responsible AI" [ref=e1562] [cursor=pointer]:
                  - /url: "#responsible-ai"
              - listitem [ref=e1563]:
                - link "Roadmap" [ref=e1564] [cursor=pointer]:
                  - /url: "#roadmap"
          - navigation "Get started" [ref=e1565]:
            - heading "Get started" [level=2] [ref=e1566]
            - list [ref=e1567]:
              - listitem [ref=e1568]:
                - link "Explore PROHOR" [ref=e1569] [cursor=pointer]:
                  - /url: "#features"
              - listitem [ref=e1573]:
                - button "Sign in" [ref=e1574] [cursor=pointer]
        - generic [ref=e1578]:
          - generic [ref=e1579]: © 2026 PROHOR
          - paragraph [ref=e1580]: Prototype with sample data. Not a medical or emergency service. In an emergency, call 999.
          - button "Switch homepage language to Bangla" [ref=e1581] [cursor=pointer]:
            - generic [ref=e1582]: বাংলা
            - generic [aria-hidden] [ref=e1583]: /
            - generic [ref=e1584]: EN
  - alert [ref=e1585]
```

# Test source

```ts
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
> 163 |   for (const width of widths) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `English at ${width}px`).toBe(true); }
      |                                                                                                                                                                                                    ^ Error: English at 320px
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