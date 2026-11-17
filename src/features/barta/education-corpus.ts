import type { BartaCorpus } from "./approved-knowledge";
import { educationTopics, type EducationTopic } from "./education-topics";

const checkedAt = "2026-11-16T13:49:00.000Z";
const reviewDue = "2027-05-16";
const sharedSource = {
  publisher: "World Health Organization",
  language: "en",
  reviewedAt: checkedAt,
  reviewedByUserId: null,
  reviewStatus: "approved",
  selection: "project_education_reference",
  reviewDue,
  applicability: "General maternal and newborn education",
} as const;

const antenatal = {
  ...sharedSource,
  id: "b1826b55-6646-495c-bd98-7852311f67d0",
  version: "WHO/RHR/16.12",
  title: "WHO recommendations on antenatal care for a positive pregnancy experience: executive summary",
  url: "https://www.who.int/publications/i/item/WHO-RHR-16.12",
  publishedOn: "2016-11-25",
};

const breastfeeding = {
  ...sharedSource,
  id: "1e8ce8c4-b4be-409b-bcd8-96449ce3d027",
  version: "WHO Q&A, 2 October 2024",
  title: "Breastfeeding",
  url: "https://www.who.int/news-room/questions-and-answers/item/breastfeeding",
  publishedOn: "2024-10-02",
};

const postnatal = {
  ...sharedSource,
  id: "4a990fc4-75f9-4d72-8477-941decc1c8a6",
  version: "ISBN 9789240045989",
  title: "WHO recommendations on maternal and newborn care for a positive postnatal experience",
  url: "https://www.who.int/publications/i/item/9789240045989",
  publishedOn: "2022-03-30",
};

const newborn = {
  ...sharedSource,
  id: "cb6fe694-8f18-482f-b266-893aa18a09e3",
  version: "Second edition, 2025",
  title: "Essential newborn care course",
  url: "https://www.who.int/publications/b/80293",
  publishedOn: null,
  publicationYear: 2025,
};

const unicefBangladesh = {
  ...sharedSource,
  id: "be636c5b-e546-4cb2-9b39-28bbaee4e260",
  publisher: "UNICEF Bangladesh",
  title: "Your first trimester guide",
  url: "https://www.unicef.org/bangladesh/en/parenting-bd/your-first-trimester-guide",
  version: "Parenting in Bangladesh web edition, checked November 2026",
  publishedOn: null,
  applicability: "Pregnancy education for families in Bangladesh",
};

const dghsBangladesh = {
  ...sharedSource,
  id: "3f416649-0d3e-4da7-aa77-413c7ece0868",
  publisher: "Directorate General of Health Services, Bangladesh",
  title: "Operational Manual for Maternal and Newborn Health Service Accreditation Program",
  url: "https://hospitaldghs.gov.bd/wp-content/uploads/2023/05/MNH-Service-Accreditation-Manual_Clean_Cor-14-4-23.pdf",
  version: "DGHS public PDF, May 2023 posting",
  publishedOn: null,
  publicationYear: 2023,
  language: "bn",
  applicability: "Bangladesh maternal and newborn services",
} as const;

const whoPreeclampsia = {
  ...sharedSource,
  id: "158f826a-f75d-4bcc-9633-087a900c6905",
  title: "Pre-eclampsia",
  url: "https://www.who.int/news-room/fact-sheets/detail/pre-eclampsia",
  version: "WHO fact sheet, 6 October 2026",
  publishedOn: "2026-10-06",
};

const perinatalMentalHealth = {
  ...sharedSource,
  id: "2f50ca41-ab47-48b8-b577-835309290fab",
  title: "WHO guide for integration of perinatal mental health in maternal and child health services",
  url: "https://www.who.int/publications/i/item/9789240057142",
  version: "ISBN 9789240057142",
  publishedOn: "2022-09-19",
};

const childbirthPlanning = {
  ...sharedSource,
  id: "d1873065-5624-4976-a1fd-ed5d6897e31e",
  title: "Making plans for childbirth when pregnant",
  url: "https://www.who.int/tools/your-life-your-health/life-phase/pregnancy--birth-and-after-childbirth/making-plans-for-childbirth-when-pregnant",
  version: "WHO patient guidance, updated 30 September 2022",
  publishedOn: "2022-09-30",
};

const whoAntenatalSchedule = {
  ...sharedSource,
  id: "1e538920-93e9-41b1-90d1-b747ffc5d971",
  title: "New guidelines on antenatal care for a positive pregnancy experience",
  url: "https://www.who.int/news/item/07-11-2016-new-guidelines-on-antenatal-care-for-a-positive-pregnancy-experience",
  version: "WHO publication, 7 November 2016",
  publishedOn: "2016-11-07",
};

const unicefFoodSafety = {
  ...sharedSource,
  id: "72b008bf-b955-4cad-9a47-af647ebdb80d",
  publisher: "UNICEF Bangladesh",
  title: "What to avoid when pregnant",
  url: "https://www.unicef.org/bangladesh/en/parenting-bd/child-development/what-avoid-when-pregnant",
  version: "Parenting in Bangladesh web edition, checked November 2026",
  publishedOn: null,
  applicability: "Pregnancy education for families in Bangladesh",
};

const nhsMorningSickness = {
  ...sharedSource,
  id: "fde9296b-9635-4b51-ab98-9aaa7c0653b6",
  publisher: "NHS",
  title: "Vomiting and morning sickness",
  url: "https://www.nhs.uk/pregnancy/common-symptoms/vomiting-and-morning-sickness/",
  version: "NHS web edition, checked November 2026",
  publishedOn: null,
  applicability: "General education on mild pregnancy nausea",
};

const nhsPregnancyTest = {
  ...sharedSource, id: "d343893d-85a3-4579-8b99-310e118b9600", publisher: "NHS",
  title: "Doing a pregnancy test", url: "https://www.nhs.uk/pregnancy/trying-for-a-baby/doing-a-pregnancy-test/",
  version: "NHS web edition, checked November 2026", publishedOn: null,
};

const whoIronFolate = {
  ...sharedSource, id: "250ccfc7-c141-40a4-b268-7ae072ca3064",
  title: "Daily iron and folic acid supplementation during pregnancy",
  url: "https://www.who.int/tools/elena/interventions/daily-iron-pregnancy",
  version: "Updated 26 July 2024", publishedOn: "2024-07-26",
};

const nhsMovement = {
  ...sharedSource, id: "ee495c6b-660c-41c1-b169-77680ab9afc1", publisher: "NHS",
  title: "Your baby’s movements", url: "https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/",
  version: "NHS web edition, checked November 2026", publishedOn: null,
};

const nhsPeriodPain = {
  ...sharedSource, id: "5c6e42a1-f9f1-4ad3-b5f3-732cf53cfc7e", publisher: "NHS",
  title: "Period pain", url: "https://www.nhs.uk/symptoms/period-pain/",
  version: "NHS web edition, checked November 2026", publishedOn: null,
  applicability: "Self-care education for usual menstrual cramps",
};

const whoAntenatalHandbook = {
  ...sharedSource, id: "095e8db0-f3c3-4795-9c84-9edcdd2473f1",
  title: "WHO programme manager’s handbook: maternal care interventions",
  url: "https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/handbooks/programme-manager-s-handbook-mncah/recommendations-on-interventions-along-life-course/maternal",
  version: "WHO maternal-health interventions tables, checked November 2026", publishedOn: null,
};

const nhsMaternityNotes = {
  ...sharedSource, id: "3518c580-730c-4617-8591-83185adf43d4", publisher: "NHS",
  title: "Your antenatal care and appointments", url: "https://www.nhs.uk/pregnancy/your-pregnancy-care/your-antenatal-care-and-appointments/",
  version: "NHS web edition, checked November 2026", publishedOn: null,
};

const nhsPregnancyExercise = {
  ...sharedSource, id: "da6cc823-99fe-4a10-8e85-bde9326deb99", publisher: "NHS",
  title: "Exercise in pregnancy", url: "https://www.nhs.uk/pregnancy/keeping-well/exercise/",
  version: "NHS web edition, checked November 2026", publishedOn: null,
};

const whoBirthCompanion = {
  ...sharedSource, id: "f4747944-529b-48b4-b8f3-98e39efc15ec",
  title: "Every woman’s right to a companion of choice during childbirth",
  url: "https://www.who.int/news-room/detail/09-09-2020-every-woman-s-right-to-a-companion-of-choice-during-childbirth",
  version: "Published 9 September 2020", publishedOn: "2020-09-09",
};

const unicefBreastfeedingPosition = {
  ...sharedSource, id: "ebd69c63-921b-478e-ac29-678d3a4c6293", publisher: "UNICEF Bangladesh",
  title: "Common breastfeeding positions",
  url: "https://www.unicef.org/bangladesh/en/parenting-bd/food-nutrition/breastfeeding-positions",
  version: "Parenting in Bangladesh web edition, checked November 2026", publishedOn: null,
};

const nhsGestationalDiabetes = {
  ...sharedSource, id: "9a312f60-8556-4bf3-bebd-b94334c3fa63", publisher: "NHS",
  title: "Gestational diabetes", url: "https://www.nhs.uk/conditions/gestational-diabetes/",
  version: "NHS web edition, checked November 2026", publishedOn: null,
};

const whoCareAtHome = {
  ...sharedSource, id: "7b0dc5d6-ef28-5587-856b-3593fe1feda7", publisher: "World Health Organization",
  title: "Caring for a newborn",
  url: "https://www.who.int/tools/your-life-your-health/life-phase/newborns-and-children-under-5-years/caring-for-newborns",
  version: "Updated 2022-09-30",
  publishedOn: "2022-09-30",
};

const whoChildFood = {
  ...sharedSource, id: "d5ab8e30-cdae-56d1-adbf-008c206a8218", publisher: "World Health Organization",
  title: "Feeding an infant or young child",
  url: "https://www.who.int/tools/your-life-your-health/life-phase/newborns-and-children-under-5-years/feeding-an-infant-or-young-child",
  version: "Updated 2022-09-30",
  publishedOn: "2022-09-30",
};

const whoChildPlay = {
  ...sharedSource, id: "41a3d9dc-f191-5df4-9bfa-964b5fae3fe0", publisher: "World Health Organization",
  title: "Engaging and having fun with newborns and children under 5 years",
  url: "https://www.who.int/tools/your-life-your-health/life-phase/newborns-and-children-under-5-years/engaging-and-having-fun-with-newborns-and-children-under-5-years",
  version: "Updated 2022-09-30",
  publishedOn: "2022-09-30",
};

const whoSafeHome = {
  ...sharedSource, id: "1b313016-53ff-5738-9661-0cccdd6027cc", publisher: "World Health Organization",
  title: "Keeping newborns and children under 5 years clean and safe",
  url: "https://www.who.int/tools/your-life-your-health/life-phase/newborns-and-children-under-5-years/newborns-and-children-under-5-years-clean-and-safe",
  version: "Updated 2022-09-30",
  publishedOn: "2022-09-30",
};

const whoPostnatalVisits = {
  ...sharedSource, id: "7995939b-5b1a-5535-a770-1fb8dfab1958", publisher: "World Health Organization",
  title: "Getting the health services you need after childbirth",
  url: "https://www.who.int/tools/your-life-your-health/life-phase/pregnancy--birth-and-after-childbirth/getting-the-health-services-you-need-after-childbirth",
  version: "Updated 2022-09-30",
  publishedOn: "2022-09-30",
};

const whoEverydayWellbeing = {
  ...sharedSource, id: "d9182ad8-f70d-52a3-aab1-28e052fcd25e", publisher: "World Health Organization",
  title: "Keeping well during pregnancy and after childbirth",
  url: "https://www.who.int/tools/your-life-your-health/life-phase/pregnancy--birth-and-after-childbirth/keeping-well-during-pregnancy-and-after-childbirth",
  version: "Updated 2022-09-30",
  publishedOn: "2022-09-30",
};

const nhsBabySleep = {
  ...sharedSource, id: "8951eff2-774f-58f1-9adc-b25f5a06c7c1", publisher: "NHS",
  title: "Sudden infant death syndrome (SIDS)",
  url: "https://www.nhs.uk/baby/caring-for-a-newborn/sudden-infant-death-syndrome-sids/",
  version: "Web edition, project reference check",
  publishedOn: null,
};

const nhsDiaper = {
  ...sharedSource, id: "ce9b44ac-83a6-5074-ad82-a3efd01d88c1", publisher: "NHS",
  title: "How to change your baby’s nappy",
  url: "https://www.nhs.uk/baby/caring-for-a-newborn/how-to-change-your-babys-nappy/",
  version: "Web edition, project reference check",
  publishedOn: null,
};

const nhsBabyCrying = {
  ...sharedSource, id: "01c39b07-1af7-5d4a-b504-f04c3c309b2b", publisher: "NHS",
  title: "Soothing a crying baby",
  url: "https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/",
  version: "Web edition, project reference check",
  publishedOn: null,
};

const unicefFeedingAtWork = {
  ...sharedSource, id: "ea686838-cdde-56f1-984e-6d73f2a3aaf2", publisher: "UNICEF Bangladesh",
  title: "Breastfeeding when you return to work",
  url: "https://www.unicef.org/bangladesh/en/parenting-bd/food-nutrition/breastfeeding-workplace",
  version: "Web edition, project reference check",
  publishedOn: null,
};

const nhsPregnancySleep = {
  ...sharedSource, id: "ec8d444e-c0b3-5cdd-844f-588b77d849af", publisher: "NHS",
  title: "Tiredness and sleep problems in pregnancy",
  url: "https://www.nhs.uk/pregnancy/common-symptoms/tiredness/",
  version: "Web edition, project reference check",
  publishedOn: null,
};

const nhsPregnancyHeartburn = {
  ...sharedSource, id: "f520b08f-9d2b-5ac5-b230-664fe58669c0", publisher: "NHS",
  title: "Indigestion and heartburn in pregnancy",
  url: "https://www.nhs.uk/pregnancy/common-symptoms/indigestion-and-heartburn/",
  version: "Web edition, project reference check",
  publishedOn: null,
};

const nhsPregnancyBackache = {
  ...sharedSource, id: "7c4e6aeb-c4c3-5a2c-ac47-c878fa84f0d9", publisher: "NHS",
  title: "Back pain in pregnancy",
  url: "https://www.nhs.uk/pregnancy/common-symptoms/back-pain/",
  version: "Web edition, project reference check",
  publishedOn: null,
};

const nhsPregnancyTravel = {
  ...sharedSource, id: "3a303bb9-9826-5e24-9b1f-f7c02e350624", publisher: "NHS",
  title: "Travelling in pregnancy",
  url: "https://www.nhs.uk/pregnancy/keeping-well/travelling/",
  version: "Web edition, project reference check",
  publishedOn: null,
};

const nhsPregnancyConstipation = {
  ...sharedSource, id: "cd04fc81-2b34-582d-bb81-a19ae04adc75", publisher: "NHS",
  title: "Common health problems in pregnancy",
  url: "https://www.nhs.uk/pregnancy/common-symptoms/common-health-problems/",
  version: "Web edition, project reference check",
  publishedOn: null,
};

type Passage = BartaCorpus["passages"][number];
type LocalizedPassage = Pick<Passage, "chunkId" | "text" | "questions">;

function pair(
  source: Pick<BartaCorpus["sources"][number], "id" | "version">,
  metadata: Pick<Passage, "translationGroup" | "locator" | "page" | "stage" | "audience"> & { topic: EducationTopic },
  translations: Record<"en" | "bn", LocalizedPassage>,
): Passage[] {
  return (["en", "bn"] as const).map((language) => ({
    ...metadata,
    ...translations[language],
    questions: [educationTopics[metadata.topic][language], ...translations[language].questions],
    language,
    sourceId: source.id,
    sourceVersion: source.version,
    reviewStatus: "approved",
    reviewBasis: "project_reference_check",
    reviewedByUserId: null,
    reviewedAt: checkedAt,
    reviewDue,
    reuseBasis: "Original bilingual educational paraphrase with attribution and a link to the public source.",
  }));
}

const accessSource_adjustments = { ...sharedSource, id: "272480ad-759c-4c51-add9-b4ec79b242b9", publisher: "NHS England", title: "Reasonable adjustments", url: "https://www.england.nhs.uk/learning-disabilities/improving-health/reasonable-adjustments/", version: "Web edition, accessibility reference check", publishedOn: null };
const accessSource_information = { ...sharedSource, id: "d2b5a888-bedf-4f1b-aa70-0a48258e4e12", publisher: "NHS England", title: "Accessible Information Standard", url: "https://www.england.nhs.uk/long-read/accessible-information-standard-requirements-dapb1605/", version: "Web edition, accessibility reference check", publishedOn: null };
const accessSource_formats = { ...sharedSource, id: "76027419-dd12-47eb-a7a8-8c3e4047dc28", publisher: "NHS England", title: "Accessible information and communication formats", url: "https://www.england.nhs.uk/accessible-information-standard/why-its-important/", version: "Web edition, accessibility reference check", publishedOn: null };
const accessSource_maternity = { ...sharedSource, id: "a5072fe3-7aca-4fa1-a9b1-183a41563b09", publisher: "Birthrights", title: "Disability and long-term health conditions and maternity care", url: "https://birthrights.org.uk/factsheets/disability-and-long-term-health-conditions-and-maternity-care/", version: "Web edition, accessibility reference check", publishedOn: null };

export const bartaEducationCorpus: BartaCorpus = {
  sources: [accessSource_adjustments, accessSource_information, accessSource_formats, accessSource_maternity, antenatal, breastfeeding, postnatal, newborn, unicefBangladesh, dghsBangladesh, whoPreeclampsia, perinatalMentalHealth, childbirthPlanning, whoAntenatalSchedule, unicefFoodSafety, nhsMorningSickness, nhsPregnancyTest, whoIronFolate, nhsMovement, nhsPeriodPain, whoAntenatalHandbook, nhsMaternityNotes, nhsPregnancyExercise, whoBirthCompanion, unicefBreastfeedingPosition, nhsGestationalDiabetes,
    whoCareAtHome, whoChildFood, whoChildPlay, whoSafeHome, whoPostnatalVisits, whoEverydayWellbeing, nhsBabySleep, nhsDiaper, nhsBabyCrying, unicefFeedingAtWork,
    nhsPregnancySleep, nhsPregnancyHeartburn, nhsPregnancyBackache, nhsPregnancyTravel, nhsPregnancyConstipation,
  ],
  passages: [
    ...pair(accessSource_adjustments, {
      topic: "accessVisit", stage: "pregnancy", audience: "mother", locator: "Reasonable adjustments", translationGroup: "bf0f6df6-7a93-4ab0-ac74-f97bb0ffcbf6",
    }, {
      en: { chunkId: "aa13df6d-f95e-4c85-a2b5-69f93463ee3d", questions: ["How do I ask for accessibility support for a pregnancy appointment?","Can I request an accessible pregnancy checkup?"], text: "Call or message the clinic before your appointment. Describe what would make the visit accessible for you and ask whom to contact when you arrive. You can ask for extra time, a quieter waiting area, an accessible entrance or communication support. Ask the clinic to confirm what it can arrange." },
      bn: { chunkId: "245ad7b6-da6b-49b8-aaf9-f94f99b268d9", questions: ["চেকআপে প্রতিবন্ধিতার জন্য সহায়তা কীভাবে চাইব?","pregnancy checkup e disability support kivabe chaibo?"], text: "চেকআপের আগে ক্লিনিকে ফোন বা বার্তা দিন। কোন সহায়তা থাকলে চেকআপে যেতে ও কথা বলতে সুবিধা হবে তা জানান। পৌঁছালে কার সঙ্গে যোগাযোগ করবেন, জেনে নিন। বেশি সময়, শান্ত অপেক্ষার জায়গা, চলাচলের উপযোগী প্রবেশপথ বা যোগাযোগের সহায়তা চাইতে পারেন। ক্লিনিক কী ব্যবস্থা করতে পারবে, আগে নিশ্চিত করুন।" },
    }),
    ...pair(accessSource_maternity, {
      topic: "accessWheelchair", stage: "pregnancy", audience: "mother", locator: "Disability and long-term health conditions and maternity care", translationGroup: "4f090310-17dd-420e-a86c-5fd4b56f158f",
    }, {
      en: { chunkId: "49a0b6df-a6dd-4484-a821-7611c211d346", questions: ["Can I ask for a wheelchair-accessible exam room?","What transfer support can I ask about at a maternity visit?"], text: "Ask about step-free entry, accessible toilets and room to use your wheelchair. If you need help getting onto an examination bed, ask about suitable equipment and trained staff. Tell the team how you prefer to transfer and ask them to discuss the plan with you before the examination." },
      bn: { chunkId: "7e71bdf1-eb72-438a-abf9-edc4fae9d72b", questions: ["হুইলচেয়ার থেকে পরীক্ষার খাটে উঠতে কীভাবে সহায়তা চাইব?","wheelchair niye pregnancy checkup e ki ki jiggesh korbo?"], text: "ধাপ ছাড়া প্রবেশপথ, ব্যবহারযোগ্য শৌচাগার এবং হুইলচেয়ার ঘোরানোর জায়গা আছে কি না জিজ্ঞেস করুন। পরীক্ষার খাটে উঠতে সহায়তা লাগলে উপযুক্ত সরঞ্জাম ও প্রশিক্ষিত কর্মী পাওয়া যাবে কি না জানতে চান। কীভাবে স্থান বদলাতে আপনার সুবিধা হয়, তা জানান এবং পরীক্ষার আগে পরিকল্পনাটি আপনার সঙ্গে আলোচনা করতে বলুন।" },
    }),
    ...pair(accessSource_information, {
      topic: "accessHearing", stage: "pregnancy", audience: "mother", locator: "Accessible Information Standard", translationGroup: "92eae64e-6cf9-4664-ab43-449bd07366c8",
    }, {
      en: { chunkId: "68a00c3a-5843-41fe-a9ae-6070b0c05ca2", questions: ["Can I request a sign-language interpreter for my pregnancy visit?","How can a Deaf mother get maternity instructions?"], text: "Tell the clinic how you prefer to communicate. Ask in advance about an interpreter in the sign language you use, text communication or other support that works for you. If you lip-read, ask for good lighting and for staff to face you when speaking. Ask how the clinic can send you results and follow-up instructions in an accessible format." },
      bn: { chunkId: "38929991-9d32-4096-ad49-df50d4494e04", questions: ["গর্ভকালীন চেকআপে ইশারা ভাষার দোভাষী চাইতে পারি কি?","deaf mother pregnancy appointment e interpreter kivabe chaibe?"], text: "আপনি কীভাবে যোগাযোগ করতে স্বাচ্ছন্দ্য বোধ করেন, ক্লিনিককে জানান। আপনি যে ইশারা ভাষা ব্যবহার করেন তার দোভাষী, লিখিত বার্তা বা অন্য উপযোগী সহায়তা পাওয়া যাবে কি না আগে জেনে নিন। ঠোঁট দেখে বুঝলে পর্যাপ্ত আলো ও কথা বলার সময় আপনার দিকে মুখ করে থাকতে বলুন। পরীক্ষার ফল ও পরের নির্দেশনা আপনার ব্যবহারযোগ্য মাধ্যমে চেয়ে নিন।" },
    }),
    ...pair(accessSource_formats, {
      topic: "accessVision", stage: "pregnancy", audience: "mother", locator: "Accessible information and communication formats", translationGroup: "117fa7fd-fbed-45f3-a666-f58cf106b225",
    }, {
      en: { chunkId: "d133d7ec-8fe6-409c-a14e-062799352c6c", questions: ["Can my maternity instructions be sent as screen-reader-friendly text?","Can I ask for large-print pregnancy information?"], text: "Ask for instructions in a format you use, such as screen-reader-friendly text, large print, Braille or audio. Ask staff to explain information they would normally point to or show on a screen. Before leaving, confirm how you will receive results and the next appointment details." },
      bn: { chunkId: "27894986-8bbb-4067-a4f5-d0541ac16c0d", questions: ["গর্ভকালীন নির্দেশনা স্ক্রিন রিডারে পড়ার মতো করে চাইতে পারি কি?","low vision pregnancy information digital text kivabe pabo?"], text: "আপনার ব্যবহারযোগ্য মাধ্যমে নির্দেশনা চান, যেমন স্ক্রিন রিডারে পড়া যায় এমন লেখা, বড় অক্ষর, ব্রেইল বা অডিও। কর্মীরা সাধারণত স্ক্রিনে দেখান বা আঙুল দিয়ে বোঝান এমন তথ্য মুখে বুঝিয়ে বলতে বলুন। ফিরবার আগে ফলাফল ও পরের সাক্ষাতের তথ্য কীভাবে পাবেন, নিশ্চিত করুন।" },
    }),
    ...pair(accessSource_information, {
      topic: "accessEasyRead", stage: "pregnancy", audience: "mother", locator: "Accessible Information Standard", translationGroup: "413f2a60-31d6-4895-a4a0-f7dd3f06bf5b",
    }, {
      en: { chunkId: "65500101-e793-41b6-a7f0-954ad266a497", questions: ["Can I get an Easy Read maternity summary?","Can the midwife explain the visit in simpler words?"], text: "Ask for short explanations in plain language, one point at a time. If pictures or Easy Read information help you, ask for those. You can ask for more time to ask questions and for a short summary to take home. Tell the team when you need something explained again." },
      bn: { chunkId: "49d16835-bcec-40ae-a01d-fbcd2f2d84fd", questions: ["মাতৃসেবার নির্দেশনা সহজ ভাষায় পাওয়া যাবে কি?","midwife ke sohoj vashay bujhiye bolte kivabe bolbo?"], text: "সহজ ভাষায় ছোট করে একবারে একটি বিষয় বোঝাতে বলুন। ছবি বা সহজপাঠ্য নির্দেশনা কাজে লাগলে তা চাইতে পারেন। প্রশ্নের জন্য একটু বেশি সময় এবং বাড়িতে নিয়ে যাওয়ার জন্য সংক্ষিপ্ত নির্দেশনা চান। কোনো বিষয় আবার বোঝানোর প্রয়োজন হলে সেবাদানকারী দলকে জানান।" },
    }),
    ...pair(accessSource_information, {
      topic: "accessCommunication", stage: "pregnancy", audience: "mother", locator: "Accessible Information Standard", translationGroup: "756cbbce-faa4-4128-a799-212a5d3f966c",
    }, {
      en: { chunkId: "d0a85069-fd3d-4e89-ad26-42b7e09d837d", questions: ["Can I use a communication board at an antenatal appointment?","Can I bring my AAC device to a maternity checkup?"], text: "Tell the clinic which methods work for you, such as writing, a communication board or a speech-generating device. You can bring your device or a short note about how you communicate. Ask staff to speak to you directly, allow enough time, and check with you that they understood correctly." },
      bn: { chunkId: "f45f7a26-6bb3-467e-a980-ebcc248d2090", questions: ["গর্ভকালীন চেকআপে যোগাযোগ বোর্ড ব্যবহার করতে পারি কি?","kotha bolte oshubidha hole antenatal visit e ki korbo?"], text: "লেখা, যোগাযোগ বোর্ড বা কথা শোনায় এমন সহায়ক যন্ত্রের মধ্যে কোনটি আপনার কাজে আসে, ক্লিনিককে জানান। যন্ত্রটি বা কীভাবে যোগাযোগ করেন তার ছোট একটি নোট সঙ্গে নিতে পারেন। কর্মীদের সরাসরি আপনার সঙ্গে কথা বলতে, সময় দিতে এবং তাঁরা ঠিক বুঝেছেন কি না আপনার কাছে যাচাই করতে বলুন।" },
    }),
    ...pair(accessSource_maternity, {
      topic: "accessSensory", stage: "pregnancy", audience: "mother", locator: "Disability and long-term health conditions and maternity care", translationGroup: "88f5e594-3ef1-47a3-aff7-c3b46e7a4296",
    }, {
      en: { chunkId: "04aef1a3-e5c3-4c2d-a91e-8e6f2878bbeb", questions: ["Can I ask for a quieter maternity waiting room?","How can I plan for sensory overload during labour?"], text: "Explain which sounds, lighting or unexpected changes are difficult for you. Ask about a quieter place to wait, advance explanations or the ability to take a break. For labour, discuss what staff should explain before touching you and what options are available if the room becomes overwhelming." },
      bn: { chunkId: "a2437590-a299-4a04-aa50-0969abd0952f", questions: ["গর্ভকালীন চেকআপে শান্ত অপেক্ষার জায়গা চাইতে পারি কি?","labour e alo ba shobde osubidha hole ki support chaibo?"], text: "কোন শব্দ, আলো বা হঠাৎ পরিবর্তনে আপনার অসুবিধা হয়, তা জানান। শান্ত জায়গায় অপেক্ষা, আগে থেকে ধাপগুলো বুঝিয়ে বলা বা একটু বিরতি নেওয়ার সুযোগ চাইতে পারেন। প্রসবের আগে আলোচনা করুন, স্পর্শ করার আগে কর্মীরা কীভাবে জানাবেন এবং ঘরের পরিবেশে বেশি অস্বস্তি হলে কী করা যাবে।" },
    }),
    ...pair(accessSource_maternity, {
      topic: "accessBirthPlan", stage: "pregnancy", audience: "mother", locator: "Disability and long-term health conditions and maternity care", translationGroup: "8004a00d-faf3-4ae0-ab02-7257abf2b1a7",
    }, {
      en: { chunkId: "8347a264-c558-4878-a275-099f1bfff7dc", questions: ["What disability accommodations can I put in my birth plan?","How do I tell the labour team about my access needs?"], text: "Tell your maternity team early what support you need. Write down your communication preferences, mobility or transfer support, and any equipment or room access you need. Ask the team to record this where staff caring for you can see it, and discuss an alternative if your birth plans change." },
      bn: { chunkId: "c2510569-322e-4c6d-a0e5-e38edfbed334", questions: ["প্রসব পরিকল্পনায় প্রতিবন্ধিতা সম্পর্কিত প্রয়োজন কীভাবে জানাব?","birth plan e disability support kivabe likhbo?"], text: "সেবাদানকারী দলকে আগেভাগে জানান কোন সহায়তা দরকার। আপনার পছন্দের যোগাযোগের পদ্ধতি, চলাফেরা বা স্থান বদলের সহায়তা, সরঞ্জাম এবং ঘরে ঢোকার প্রয়োজন লিখে রাখুন। আপনার সেবায় থাকবেন এমন কর্মীরা যাতে তা পড়তে পারেন সেভাবে নথিভুক্ত করতে বলুন। পরিকল্পনা বদলালে বিকল্প কী হবে, তা আলোচনা করুন।" },
    }),
    ...pair(accessSource_information, {
      topic: "accessConsent", stage: "pregnancy", audience: "mother", locator: "Accessible Information Standard", translationGroup: "c7627ba3-2638-4d7e-ac03-3185e80f14c1",
    }, {
      en: { chunkId: "f607d4fe-71be-4c1c-a665-a3443f9d6f17", questions: ["Can I have a supporter and make my own care choices?","How should staff include me in decisions if I use a communication device?"], text: "Ask the care team to address you directly, explain the options in a format you understand, and give you time to respond. Tell them what kind of help you want from an interpreter, advocate or support person. Tell the team how you want to ask questions or communicate a decision." },
      bn: { chunkId: "484f53fe-9787-4ad1-a63c-02e433220529", questions: ["সহায়তাকারী সঙ্গে থাকলেও আমি নিজের সেবার সিদ্ধান্ত কীভাবে জানাব?","support person thakle nijer care decision kivabe janabo?"], text: "সেবাদানকারী দলকে বলুন যেন তারা সরাসরি আপনার সঙ্গে কথা বলে, আপনার বোঝার মতো করে বিকল্পগুলো বুঝিয়ে দেয় এবং উত্তর দেওয়ার সময় দেয়। দোভাষী, অধিকার সহায়ক বা সঙ্গে থাকা ব্যক্তির কাছ থেকে কী ধরনের সহায়তা চান তা জানান। কীভাবে প্রশ্ন করবেন বা সিদ্ধান্ত জানাবেন, সেটিও দলকে বলুন।" },
    }),
    ...pair(accessSource_maternity, {
      topic: "accessAfterBirth", stage: "after_birth", audience: "mother", locator: "Disability and long-term health conditions and maternity care", translationGroup: "772549bb-d0f4-4c4f-a5ff-5f93a977a79c",
    }, {
      en: { chunkId: "2a9ab508-f7ff-4b0f-ad20-9ba7d121d5b5", questions: ["How can I plan accessible postnatal care after discharge?","What extra support can I ask about on the postnatal ward?"], text: "Talk with the maternity team before going home about the help and equipment you use. Ask about accessible follow-up visits, how to contact the team, and whether occupational therapy or another support service can help you plan. Ask for discharge instructions in your preferred format and confirm whom to contact if your needs change." },
      bn: { chunkId: "e3345eec-c1a9-4e8f-acf0-f5c748aa8335", questions: ["ছাড়পত্রের পর আমার প্রয়োজন অনুযায়ী প্রসবোত্তর সেবার পরিকল্পনা কীভাবে করব?","delivery er por bari jawar age ki disability support chaibo?"], text: "বাড়ি যাওয়ার আগে আপনি যে সহায়তা ও সরঞ্জাম ব্যবহার করেন, তা নিয়ে মাতৃসেবা দলের সঙ্গে কথা বলুন। পরের চেকআপ কীভাবে আপনার জন্য ব্যবহারযোগ্য হবে, দলের সঙ্গে কীভাবে যোগাযোগ করবেন এবং অকুপেশনাল থেরাপি বা অন্য সহায়তা পাওয়া যাবে কি না জেনে নিন। বাড়ি ফেরার নির্দেশনা আপনার পছন্দের মাধ্যমে চেয়ে নিন। প্রয়োজন বদলালে কার সঙ্গে যোগাযোগ করবেন, নিশ্চিত করুন।" },
    }),
    ...pair(accessSource_maternity, {
      topic: "accessSupportPerson", stage: "pregnancy", audience: "mother", locator: "Disability and long-term health conditions and maternity care", translationGroup: "39c003c7-eec2-4942-a623-a2f9e3c82cb6",
    }, {
      en: { chunkId: "20ed01d5-4aba-4ae7-a832-dbb6c4440e18", questions: ["Can I bring someone I trust to help at my maternity visit?","Can my support person help explain my needs during labour?"], text: "Tell the maternity team who you would like to support you and what you want them to help with. Ask in advance what the service can arrange during visits, labour and after birth. Discuss how you want staff to communicate directly with you and any information you prefer to discuss privately." },
      bn: { chunkId: "08fc2726-941b-46e0-ab1e-644f0cec2440", questions: ["মাতৃসেবা নিতে গেলে বিশ্বস্ত কাউকে সঙ্গে নিতে চাইতে পারি কি?","pregnancy visit e trusted support person niye jete parbo?"], text: "কাকে সঙ্গে চান এবং তিনি কোন কাজে সাহায্য করবেন, তা সেবাদানকারী দলকে জানান। চেকআপ, প্রসব ও প্রসবের পর কেন্দ্র কী ব্যবস্থা করতে পারবে, আগে জেনে নিন। কর্মীরা সরাসরি আপনার সঙ্গে কীভাবে কথা বলবেন এবং কোন বিষয় একান্তে আলোচনা করতে চান, তা জানিয়ে রাখুন।" },
    }),
    ...pair(accessSource_formats, {
      topic: "accessFollowUp", stage: "after_birth", audience: "mother", locator: "Accessible information and communication formats", translationGroup: "7dc803df-9c8e-4709-a4e1-6e14ff32272d",
    }, {
      en: { chunkId: "129a84f9-65f8-4d09-a04e-d8b912de93c7", questions: ["Can I ask the clinic to text instead of calling me?","How can I ask for accessible appointment reminders?"], text: "Tell the clinic which way of contacting you works best, such as a text message or accessible email. Ask them to record your preference and explain how to contact them if you miss a message. Before leaving, confirm how you will receive results and appointment changes." },
      bn: { chunkId: "11e868fd-d6c5-48ed-a8ee-c6865d161564", questions: ["ক্লিনিককে ফোনের বদলে এসএমএস করতে বলতে পারি কি?","postnatal reminder phone er bodole SMS kivabe chaibo?"], text: "ক্লিনিককে জানান কোন মাধ্যমে যোগাযোগে আপনার সুবিধা, যেমন এসএমএস বা ব্যবহারযোগ্য ইমেইল। আপনার পছন্দ নথিতে রাখতে বলুন এবং বার্তা না পেলে কীভাবে যোগাযোগ করবেন তা জেনে নিন। বের হওয়ার আগে পরীক্ষার ফল এবং চেকআপের সময় বদলালে খবর কীভাবে পাবেন, নিশ্চিত করুন।" },
    }),
    ...pair(nhsPregnancySleep, {
      topic: "pregnancySleep", stage: "pregnancy", audience: "mother", locator: "Sleep positions and insomnia in pregnancy",
      translationGroup: "de4f2903-798d-5c10-8fb0-a30f90f5146f",
    }, {
      en: {
        chunkId: "523f610d-3b76-5692-97c0-1147df8b2e57",
        questions: ["What sleeping positions are recommended during pregnancy?", "How can I sleep more comfortably while pregnant?"],
        text: "Set aside time to rest and accept help with daily tasks when you can. In later pregnancy, go to sleep on your side, either left or right. If you wake up on your back, turn onto your side and settle again. Pillows between the knees or supporting the bump may help with comfort. If poor sleep is persistent or comes with low mood or a loss of interest in daily life, tell your midwife or doctor.",
      },
      bn: {
        chunkId: "f40da60d-01b3-563b-9424-f54fe78e1ee4",
        questions: ["গর্ভাবস্থায় কীভাবে শুলে ঘুমাতে সুবিধা হয়?", "pregnancy te kon pashe ghumabo?", "pregnancy te rate ghum hoy na"],
        text: "বিশ্রামের সময় রাখুন এবং সম্ভব হলে দৈনন্দিন কাজে অন্যের সাহায্য নিন। গর্ভাবস্থার পরের দিকে ঘুমাতে যাওয়ার সময় বাঁ বা ডান কাতে শুয়ে পড়ুন। চিত হয়ে ঘুম থেকে উঠলে আবার কাত হয়ে শুয়ে পড়ুন। হাঁটুর মাঝে বা পেটের নিচে বালিশ দিলে আরাম হতে পারে। দীর্ঘদিন ঘুমের সমস্যা থাকলে, অথবা সঙ্গে মন খারাপ বা দৈনন্দিন কাজে আগ্রহ কমে গেলে, ধাত্রী বা চিকিৎসককে জানান।",
      },
    }),
    ...pair(nhsPregnancyHeartburn, {
      topic: "pregnancyHeartburn", stage: "pregnancy", audience: "mother", locator: "Eating and drinking habits for indigestion and heartburn",
      translationGroup: "847d304e-64d5-5aee-a677-2d3d05100292",
    }, {
      en: {
        chunkId: "39080de9-5943-5ff8-8fa4-e1a97aa7722c",
        questions: ["What can help mild pregnancy heartburn?", "What food habits can ease reflux in pregnancy?"],
        text: "Try smaller meals spread through the day. Sit upright while you eat and afterward, and leave time between your last meal and bedtime. Cutting back on foods or drinks that bring on symptoms, such as very spicy food or caffeinated drinks, can help. If symptoms keep coming back or you are considering a medicine, ask a pharmacist, midwife or doctor and tell them you are pregnant.",
      },
      bn: {
        chunkId: "a6ae2fca-e6af-59f6-abfb-cd8db0b25f1f",
        questions: ["গর্ভাবস্থায় হালকা বুক জ্বালাপোড়া হলে কী করা যায়?", "pregnancy te buk jala hole ki korbo?"],
        text: "দিনজুড়ে অল্প অল্প করে কয়েকবার খাবার খেতে পারেন। খাওয়ার সময় ও পরে সোজা হয়ে বসুন এবং রাতের শেষ খাবার ও ঘুমের মাঝে কিছু সময় রাখুন। খুব ঝাল খাবার বা ক্যাফেইনযুক্ত পানীয়ের মতো যেসব জিনিসে সমস্যা বাড়ে, সেগুলো কমিয়ে দেখতে পারেন। সমস্যা বারবার হলে বা ওষুধের কথা ভাবলে, গর্ভাবস্থার কথা জানিয়ে ফার্মাসিস্ট, ধাত্রী বা চিকিৎসকের পরামর্শ নিন।",
      },
    }),
    ...pair(nhsPregnancyBackache, {
      topic: "pregnancyBackache", stage: "pregnancy", audience: "mother", locator: "Avoiding and easing back pain; when to get help",
      translationGroup: "8477d156-1e9a-573f-815e-90bbf39c4f83",
    }, {
      en: {
        chunkId: "578ac2fd-ce2a-5c00-bad1-26f413890f68",
        questions: ["Is back pain common during pregnancy?", "How can I lift things more comfortably during pregnancy?"],
        text: "Give your back support when sitting, avoid lifting heavy objects, and keep your back straight while bending your knees to pick up a light object. Turn by moving your feet instead of twisting at the waist. Make time for breaks and ask for help with heavy tasks. If the pain is severe, occurs in the second or third trimester, or comes with fever, bleeding or pain while passing urine, contact a health professional urgently.",
      },
      bn: {
        chunkId: "5739ad3e-2fcc-5d42-bf4e-9fb57e6f6deb",
        questions: ["গর্ভাবস্থায় হালকা কোমর ব্যথা হলে কী করতে পারি?", "pregnancy te komor betha hole ki korbo?"],
        text: "বসার সময় পিঠে ঠেকনা দিন ও ভারী জিনিস তোলা এড়িয়ে চলুন। হালকা জিনিস তুলতে পিঠ সোজা রেখে হাঁটু ভাঁজ করুন। কোমর মোচড় না দিয়ে পা সরিয়ে ঘুরুন। মাঝে বিশ্রাম নিন ও ভারী কাজে সাহায্য চান। ব্যথা খুব বেশি হলে, গর্ভাবস্থার দ্বিতীয় বা তৃতীয় ত্রৈমাসিকে হলে, অথবা সঙ্গে জ্বর, রক্তপাত বা প্রস্রাবে ব্যথা থাকলে দ্রুত স্বাস্থ্যকর্মীর সঙ্গে যোগাযোগ করুন।",
      },
    }),
    ...pair(nhsPregnancyTravel, {
      topic: "pregnancyTravel", stage: "pregnancy", audience: "mother", locator: "Car travel and planning ahead",
      translationGroup: "58b29ca7-81b5-59af-83d4-60c3918126ae",
    }, {
      en: {
        chunkId: "81194bb7-90d1-5127-bcdb-e79bdd350857",
        questions: ["How should I wear a seat belt during pregnancy?", "What precautions help on a long car journey in pregnancy?"],
        text: "If a long road journey cannot be avoided, plan regular stops to get out and move around. Keep water available and, if possible, travel with someone. Wear the lap belt low across your pelvis below the bump, with the diagonal strap between your breasts. If you have a pregnancy complication or are unsure whether the trip is right for you, discuss it with your maternity team before leaving.",
      },
      bn: {
        chunkId: "087ad1ab-08c3-580f-bcec-ab90d6ff2dd5",
        questions: ["গর্ভাবস্থায় গাড়িতে সিটবেল্ট কীভাবে পরব?", "pregnancy te gari te dure gele ki prostuti nibo?"],
        text: "দীর্ঘ সড়কযাত্রা এড়ানো না গেলে, মাঝে নিয়মিত থেমে নেমে একটু হাঁটার পরিকল্পনা করুন। কাছে পানি রাখুন এবং সম্ভব হলে কাউকে সঙ্গে নিন। সিটবেল্টের নিচের অংশ পেটের নিচে শ্রোণির ওপর এবং তির্যক অংশ দুই স্তনের মাঝ দিয়ে রাখুন। গর্ভাবস্থায় কোনো জটিলতা থাকলে বা যাত্রাটি আপনার জন্য উপযুক্ত কি না বুঝতে না পারলে, যাওয়ার আগে সেবাদানকারী দলের সঙ্গে কথা বলুন।",
      },
    }),
    ...pair(nhsPregnancyConstipation, {
      topic: "pregnancyConstipation", stage: "pregnancy", audience: "mother", locator: "Constipation in pregnancy",
      translationGroup: "c91cd26b-9cea-5209-ab84-9f57d22c204e",
    }, {
      en: {
        chunkId: "33da842a-2baf-5a5b-ab7f-d9262ee32afb",
        questions: ["What can help mild constipation in pregnancy?", "What foods contain fibre for a pregnant person with constipation?"],
        text: "Include fibre-rich foods such as vegetables, fruit, beans and whole grains. Drink water regularly and stay active within the advice of your maternity team. If the problem persists, ask a health worker what is appropriate in pregnancy. If you think prescribed iron is making it worse, ask about alternatives before changing or stopping it.",
      },
      bn: {
        chunkId: "dd2cf6f4-ecd0-58c5-a239-9b8bb1d63e4b",
        questions: ["গর্ভাবস্থায় হালকা কোষ্ঠকাঠিন্যে কী করা যায়?", "pregnancy te koshthokathinno hole ki korbo?"],
        text: "সবজি, ফল, ডাল ও গোটা শস্যের মতো আঁশযুক্ত খাবার রাখুন। নিয়মিত পানি পান করুন এবং সেবাদানকারী দলের পরামর্শ অনুযায়ী সক্রিয় থাকুন। সমস্যা চলতে থাকলে গর্ভাবস্থায় কী করা উপযুক্ত, স্বাস্থ্যকর্মীকে জিজ্ঞেস করুন। চিকিৎসকের দেওয়া আয়রনে সমস্যা বাড়ছে মনে হলে তা বদলানো বা বন্ধ করার আগে বিকল্প নিয়ে কথা বলুন।",
      },
    }),
    ...pair(nhsBabySleep, {
      topic: "babySleep", stage: "after_birth", audience: "newborn", locator: "How to reduce the risk of sudden infant death syndrome",
      translationGroup: "67c3a23b-f7d1-5dcb-88e4-6751996a950b",
    }, {
      en: {
        chunkId: "9ff66837-63dd-5921-a969-063bde0b3818",
        questions: ["How should a baby sleep safely?", "Can a baby sleep with a pillow?", "What is a safe sleeping position for a newborn?", "Should newborns sleep on their backs?", "Can I leave stuffed toys in my baby's cot?"],
        text: "For naps and night sleep, put your baby down on their back on a firm, flat mattress. Use a separate cot in the room where you sleep for at least the first six months. Keep the cot clear of pillows, stuffed toys, cot bumpers and loose blankets that could cover the face. Keep the sleeping space smoke-free, and never fall asleep with your baby on a sofa or armchair.",
      },
      bn: {
        chunkId: "a8584a2e-90be-51ab-a392-942ed604156a",
        questions: ["বাচ্চাকে কীভাবে ঘুম পাড়াব?", "শিশুকে চিত করে ঘুম পাড়ানো উচিত কি?", "baby ke kivabe ghum parabo?", "bacchar ghum er jayga kemon hobe?", "শিশুর খাটে নরম খেলনা রাখা নিরাপদ কি?", "baby ke chit kore ghum parabo?"],
        text: "দিনে ও রাতে ঘুমের সময় শিশুকে চিত করে শক্ত ও সমতল গদিতে শোয়ান। অন্তত প্রথম ছয় মাস নিজের ঘরেই শিশুর জন্য আলাদা খাট রাখুন। মুখ ঢেকে যেতে পারে এমন বালিশ, নরম খেলনা, খাটের পাশের প্যাড বা আলগা কম্বল খাটে রাখবেন না। ঘুমের জায়গা ধোঁয়ামুক্ত রাখুন এবং শিশুকে নিয়ে সোফা বা আরামকেদারায় ঘুমিয়ে পড়বেন না।",
      },
    }),
    ...pair(whoCareAtHome, {
      topic: "babyBath", stage: "after_birth", audience: "newborn", locator: "Tips and information: bathing and warmth",
      translationGroup: "72a0d192-d4fa-5ad5-bdcc-3697325aad6c",
    }, {
      en: {
        chunkId: "bf70c796-a1e0-509a-86b0-06bc116f0297",
        questions: ["How long should I wait before bathing a newborn?", "When is the first newborn bath?", "How many hours after birth can I give the first bath?", "Can I wait before giving my newborn their first bath?"],
        text: "After birth, the care team can dry and clean the baby without a bath. WHO advises waiting at least 24 hours before the first bath so the baby can stay warm. Before that first bath, ask your midwife or health worker to show you how to keep the baby warm and support them while washing.",
      },
      bn: {
        chunkId: "22aa6a71-bf0c-5353-8a08-aae3bcd14591",
        questions: ["নবজাতককে কখন প্রথম গোসল দেওয়া যাবে?", "nobojatok ke kokhon prothom gosol debo?", "baby first gosol kokhon?", "জন্মের কত ঘণ্টা পরে প্রথম গোসল দেওয়া যায়?", "birth er kotokkhon por first gosol dibo?"],
        text: "জন্মের পর সেবাদানকারী দল গোসল ছাড়াই শিশুকে মুছে শুকনো ও পরিষ্কার করতে পারেন। শিশুকে উষ্ণ রাখতে বিশ্ব স্বাস্থ্য সংস্থা প্রথম গোসলের আগে অন্তত ২৪ ঘণ্টা অপেক্ষার পরামর্শ দেয়। প্রথম গোসলের আগে কীভাবে শিশুকে উষ্ণ রাখবেন ও ধোয়ার সময় ধরে রাখবেন, তা ধাত্রী বা স্বাস্থ্যকর্মীর কাছে দেখিয়ে নিতে পারেন।",
      },
    }),
    ...pair(whoCareAtHome, {
      topic: "cordCare", stage: "after_birth", audience: "newborn", locator: "Tips and information: umbilical cord",
      translationGroup: "938c16fc-bf2f-5c4f-ae65-1c168fb9dce2",
    }, {
      en: {
        chunkId: "5f6d50b9-a0a7-5ba2-a810-8d43527b35aa",
        questions: ["How do I care for the umbilical cord?", "Should I put ointment on the newborn cord?", "How do I keep the cord stump dry?", "Should I use cream on my baby's cord stump?"],
        text: "Keep the remaining piece of cord dry. Wash your hands with soap and clean water before handling the baby. For routine care, leave the cord uncovered by creams, oils or home remedies. If your maternity team gave a specific instruction, ask them to explain what to use and when.",
      },
      bn: {
        chunkId: "367ffb34-7b53-509b-a7de-6b416b4a864c",
        questions: ["নাভির যত্ন কীভাবে নেব?", "শিশুর নাভিতে তেল দেব কি?", "nabhir jotno kivabe nibo?", "baby nabhi te oil debo?", "নাভির গোড়া শুকনো রাখব কীভাবে?", "baby r nabhi shukna kivabe rakhbo?"],
        text: "নাভির সঙ্গে লেগে থাকা শুকাতে থাকা অংশটি শুকনো রাখুন। শিশুকে ধরার আগে সাবান ও পরিষ্কার পানি দিয়ে হাত ধুয়ে নিন। সাধারণ যত্নে নাভিতে ক্রিম, তেল বা ঘরোয়া কিছু লাগাবেন না। সেবাদানকারী দল বিশেষ কোনো নির্দেশনা দিয়ে থাকলে, কী ব্যবহার করবেন ও কখন করবেন, তা তাঁদের কাছে জেনে নিন।",
      },
    }),
    ...pair(nhsDiaper, {
      topic: "diaper", stage: "after_birth", audience: "newborn", locator: "When, where and how to change a nappy",
      translationGroup: "34a818a9-920b-5d6e-98f9-bb88ca257175",
    }, {
      en: {
        chunkId: "7b612b40-bb10-5213-b45e-fa2952529e72",
        questions: ["How do I change a nappy?", "How often should I change a wet diaper?", "How to clean baby during a diaper change?", "What do I need for a diaper change?", "How do I wipe my baby during a nappy change?"],
        text: "Change a wet or dirty diaper promptly. Wash your hands and set out a clean diaper, warm water and cotton wool or gentle baby wipes, and a towel. A mat on the floor avoids falls. Clean the folds gently and dry the skin before putting on the fresh diaper. For a girl, wipe from front to back. Wash your hands again afterward. If you use a raised changing table, stay with the baby throughout.",
      },
      bn: {
        chunkId: "76565af0-388e-574c-87cf-e084f3fcff17",
        questions: ["ডায়াপার বদলানোর নিয়ম কী?", "বাচ্চার ডায়াপার কখন বদলাব?", "baby diaper kivabe change korbo?", "ডায়াপার বদলানোর সময় শিশুকে কীভাবে মুছব?", "diaper bodlanor somoy baby ke kivabe clean korbo?"],
        text: "ভেজা বা ময়লা ডায়াপার যত তাড়াতাড়ি সম্ভব বদলে দিন। হাত ধুয়ে পরিষ্কার ডায়াপার, কুসুম গরম পানি ও তুলা অথবা মৃদু বেবি ওয়াইপ এবং তোয়ালে কাছে রাখুন। মেঝেতে মাদুর পেতে নিলে পড়ে যাওয়ার ঝুঁকি কমে। ত্বকের ভাঁজগুলো আলতো করে পরিষ্কার ও শুকিয়ে নতুন ডায়াপার পরান। মেয়েশিশুকে সামনে থেকে পেছনে মুছুন। কাজ শেষে আবার হাত ধুয়ে নিন। উঁচু টেবিলে বদলালে শিশুর পাশ থেকে সরবেন না।",
      },
    }),
    ...pair(whoChildFood, {
      topic: "solidFood", stage: "after_birth", audience: "newborn", locator: "Tips and information: foods from six months",
      translationGroup: "7dc2e4a4-e349-536b-bfc9-3f2e45855046",
    }, {
      en: {
        chunkId: "97ec5ab3-b5f4-53f0-a6c9-bf37361578f1",
        questions: ["What complementary foods after 6 months?", "When can a baby start solid food?", "What can I feed a baby at six months?", "When can I give foods alongside breast milk?", "Is six months the time to start complementary feeding?"],
        text: "At around six months, begin giving small amounts of food that are easy for the baby to eat while continuing to breastfeed. Offer small spoonfuls slowly. As the baby gets older, widen the variety and gradually change the texture. Depending on what is available, examples include vegetables, fruit, egg and fish prepared to suit the baby. Encourage eating patiently and stop when the child shows they have had enough.",
      },
      bn: {
        chunkId: "1fe745b6-fda7-5b4b-aee1-8fc31ee58540",
        questions: ["ছয় মাসের পর কী খাবার দেব?", "বাচ্চাকে বাড়তি খাবার কখন দেব?", "choy mas er por ki khabar debo?", "baby solid food kokhon shuru korbo?", "বুকের দুধের পাশাপাশি খাবার কখন শুরু করব?", "buker dudh er sathe onno khabar kokhon dibo?"],
        text: "প্রায় ছয় মাসে বুকের দুধ চালিয়ে যাওয়ার পাশাপাশি অল্প করে শিশুর খাওয়ার উপযোগী খাবার শুরু করুন। চামচে অল্প করে ধীরে খাওয়ান। শিশু বড় হলে ধীরে ধীরে খাবারের ধরন ও ঘনত্ব বদলান এবং বৈচিত্র্য বাড়ান। যা পাওয়া যায়, সে অনুযায়ী শিশুর উপযোগী করে সবজি, ফল, ডিম ও মাছ দিতে পারেন। ধৈর্য ধরে উৎসাহ দিন এবং শিশু আর খেতে না চাইলে থামুন।",
      },
    }),
    ...pair(whoChildPlay, {
      topic: "babyPlay", stage: "after_birth", audience: "newborn", locator: "Tips and information: interaction and play",
      translationGroup: "c0c449d5-b043-5a53-aa10-8572339e04f6",
    }, {
      en: {
        chunkId: "9e67848e-10c2-5125-a2ce-c9fc2bcfdd1c",
        questions: ["How to play with a newborn?", "How can I help my baby learn during the day?"],
        text: "Give the baby your attention when they are awake. Talk to them as you dress or change them and pause so they can respond with sounds or movements. Make time for simple play together in a safe area. Keep sharp objects, hot surfaces and deep water out of reach. For children under two, choose time interacting with people rather than sitting in front of a screen.",
      },
      bn: {
        chunkId: "fae467fb-47a1-525c-9069-c9be467b3c1e",
        questions: ["শিশুর সঙ্গে কীভাবে খেলব?", "নবজাতকের সঙ্গে কথা বলা কি ভালো?", "baby r sathe kivabe khelbo?"],
        text: "শিশু জেগে থাকলে তার দিকে মন দিন। কাপড় বা ডায়াপার বদলানোর সময় কথা বলুন এবং মাঝে থামুন, যাতে সে শব্দ বা নড়াচড়া দিয়ে সাড়া দিতে পারে। নিরাপদ জায়গায় একসঙ্গে সহজ খেলাধুলার সময় রাখুন। ধারালো জিনিস, গরম জায়গা ও গভীর পানি শিশুর নাগালের বাইরে রাখুন। দুই বছরের কম বয়সে পর্দার সামনে বসিয়ে রাখার বদলে মানুষের সঙ্গে সময় কাটানোর সুযোগ দিন।",
      },
    }),
    ...pair(whoSafeHome, {
      topic: "homeSafety", stage: "after_birth", audience: "newborn", locator: "Tips and information: preventing infection and injury at home",
      translationGroup: "7dfc7e8e-0089-5f63-87de-6af00d5c7f3d",
    }, {
      en: {
        chunkId: "1215fc7d-552d-575f-afd1-a7a9d4796eb3",
        questions: ["How do I keep smoke away from my baby?", "How can I make my home safer for my baby?", "How to childproof a home?"],
        text: "Keep tobacco, cooking and heating smoke away from the rooms the baby uses. Wash hands before preparing food and after using the toilet, and use safe water and clean utensils. Store medicines, cleaning liquids and other hazardous products where children cannot reach them. Prevent access to open wells, ponds and other bodies of water around the home.",
      },
      bn: {
        chunkId: "c7e88a66-456e-53d9-bdae-8d759d5d5242",
        questions: ["বাচ্চার জন্য ঘর কীভাবে নিরাপদ রাখব?", "শিশুর কাছে ধোঁয়া আসা কীভাবে আটকাব?", "baby r jonno ghor safe kivabe rakhbo?"],
        text: "শিশু যে ঘরে থাকে সেখানে তামাক, রান্না ও ঘর গরম করার ধোঁয়া ঢুকতে দেবেন না। খাবার তৈরি করার আগে ও শৌচাগার ব্যবহারের পরে হাত ধুয়ে নিন এবং নিরাপদ পানি ও পরিষ্কার বাসন ব্যবহার করুন। ওষুধ, পরিষ্কার করার তরল ও ক্ষতিকর জিনিস শিশুর নাগালের বাইরে রাখুন। বাড়ির আশপাশের খোলা কুয়া, পুকুর বা অন্য জলাশয়ে শিশু যেন যেতে না পারে, সে ব্যবস্থা করুন।",
      },
    }),
    ...pair(breastfeeding, {
      topic: "babyWater", stage: "after_birth", audience: "newborn", locator: "Should I give my baby water on hot days?",
      translationGroup: "17e40935-e9fc-5668-8019-d7e9bb93b9c4",
    }, {
      en: {
        chunkId: "3cc5ab22-0348-5c88-86d5-6d7f843b22b7",
        questions: ["Can I give water to a breastfed baby in hot weather?", "Do breastfed babies need water when it is hot?", "Does my exclusively breastfed four-month-old need water on hot days?", "Does hot weather change whether a breastfed baby under six months needs water?"],
        text: "A breastfed baby under six months generally gets the water they need from breast milk, even in hot weather. If the baby shows hunger or thirst cues, you can offer the breast more often. This guidance is for routine feeding.",
      },
      bn: {
        chunkId: "0745d96a-4d5e-5f5c-a2f1-54926038e020",
        questions: ["গরমে বুকের দুধ খাওয়া শিশুকে পানি দেব কি?", "gorome breastfed baby ke pani debo?", "buker dudh khawa baby ke pani dibo?", "গরমে চার মাসের শুধু বুকের দুধ খাওয়া শিশুকে পানি দিতে হবে কি?", "4 masher buker dudh khawa baby ke gorome pani dibo?"],
        text: "গরমের দিনেও ছয় মাসের কম বয়সী বুকের দুধ খাওয়া শিশু সাধারণত বুকের দুধ থেকেই প্রয়োজনীয় পানি পায়। শিশু ক্ষুধা বা তৃষ্ণার ইঙ্গিত দিলে আরও ঘন ঘন বুকের দুধ দিতে পারেন। এটি সাধারণ খাওয়ানোর নির্দেশনা।",
      },
    }),
    ...pair(unicefFeedingAtWork, {
      topic: "feedingAtWork", stage: "after_birth", audience: "mother_and_newborn", locator: "Plan ahead, breastfeeding support at work, and expressing milk",
      translationGroup: "15fe3466-2678-5644-9af1-a0e2693a4dca",
    }, {
      en: {
        chunkId: "a139a316-c1c9-5894-a544-c159edc9e610",
        questions: ["How can a working mother keep breastfeeding?", "How can I express milk while working?", "How can I plan to pump breast milk at work?", "How do I continue breastfeeding after returning to my job?"],
        text: "Before returning, decide whether someone can bring the baby to you or whether you will need to express milk. Ask your workplace about private space, breaks and a way to keep the milk cool. Practise expressing in advance and plan with the caregiver how to label the milk and offer it safely. Ask a health worker for local storage guidance, especially if keeping the milk cool is difficult.",
      },
      bn: {
        chunkId: "792b2cd1-05b7-575f-a9db-8f4ea2e3a7e1",
        questions: ["কর্মজীবী মা কীভাবে বুকের দুধ চালিয়ে যাবে?", "kaj e gele dudh kivabe chaliye jabo?", "kormojibi ma kivabe buker dudh chaliye jabe?", "কাজে ফিরে কীভাবে বুকের দুধ খাওয়ানো চালিয়ে যাব?", "office e fire buker dudh kivabe chalu rakhbo?"],
        text: "কাজে ফেরার আগে ঠিক করুন, কেউ শিশুকে আপনার কাছে নিয়ে আসতে পারবেন কি না, নাকি আপনাকে দুধ বের করে রাখতে হবে। কর্মস্থলে ব্যক্তিগত জায়গা, বিরতি ও দুধ ঠান্ডা রাখার ব্যবস্থা আছে কি না জেনে নিন। আগে থেকে দুধ বের করার অনুশীলন করুন এবং যিনি শিশুর যত্ন নেবেন, তাঁর সঙ্গে দুধে তারিখ-সময় লেখা ও নিরাপদে খাওয়ানোর পরিকল্পনা করুন। দুধ ঠান্ডা রাখা কঠিন হলে স্থানীয় সংরক্ষণ নির্দেশনা স্বাস্থ্যকর্মীর কাছে জেনে নিন।",
      },
    }),
    ...pair(nhsBabyCrying, {
      topic: "babyCrying", stage: "after_birth", audience: "newborn", locator: "Common reasons for crying, ways to comfort and getting help",
      translationGroup: "b908e580-9d32-5c55-8822-ead49de964b7",
    }, {
      en: {
        chunkId: "f0fc4a2b-8c8d-59d6-bd15-24f33dd16712",
        questions: ["What are common reasons babies cry?", "How can I settle a crying baby?", "How to soothe a crying baby?", "What can a caregiver do when the baby cries?"],
        text: "First check whether the baby is hungry, tired, too hot or too cold, or needs a fresh diaper. A cuddle or gentle rocking may help. Never shake a baby. If the crying sounds very different, cannot be settled or comes with signs of illness, get medical advice. If the baby has trouble breathing or is unresponsive, seek emergency help immediately.",
      },
      bn: {
        chunkId: "b32f6eff-46b9-5f5e-b8de-3c3fae28f879",
        questions: ["শিশু কাঁদলে সাধারণত কী দেখি?", "baby kandle ki ki dekhbo?", "baccha kandle kivabe shanto korbo?"],
        text: "প্রথমে দেখুন শিশুর ক্ষুধা বা ক্লান্তি আছে কি না, গরম বা ঠান্ডা লাগছে কি না, কিংবা ডায়াপার বদলানো দরকার কি না। কোলে নেওয়া বা আলতো করে দোলানো কাজে লাগতে পারে। শিশুকে কখনো ঝাঁকাবেন না। কান্না স্বাভাবিকের চেয়ে খুব আলাদা হলে, কোনোভাবেই শান্ত না হলে বা অসুস্থতার লক্ষণ থাকলে স্বাস্থ্যকর্মীর পরামর্শ নিন। শ্বাস নিতে কষ্ট হলে বা শিশু সাড়া না দিলে সঙ্গে সঙ্গে জরুরি সাহায্য নিন।",
      },
    }),
    ...pair(whoPostnatalVisits, {
      topic: "postnatalVisits", stage: "after_birth", audience: "mother_and_newborn", locator: "Tips and information: timing of care and keeping records",
      translationGroup: "213d12c2-91d6-598c-936e-2cff2ef210bb",
    }, {
      en: {
        chunkId: "1c58faf9-818d-554a-b80e-ff67f98f3806",
        questions: ["When should mother and baby have a checkup after birth?", "How many visits after childbirth?", "When do I take my baby for a checkup after birth?", "What should I write down before leaving my postnatal checkup?", "What is the postnatal checkup schedule?", "When should we plan a routine visit after delivery?"],
        text: "WHO recommends a check by a health worker in the first 24 hours after birth, whether the birth happened at home or in a facility. It also recommends at least three further contacts during the first six weeks. Before leaving, write down when the mother and baby should each be seen next, where to go, and whom to contact between check-ups. Ask the health worker which warning signs need a prompt visit and where you can get feeding or family-planning support. Keep the mother’s and baby’s health and vaccination records together and bring them to appointments.",
      },
      bn: {
        chunkId: "2406a699-58d8-56db-b409-e63884e3347c",
        questions: ["প্রসবের পর মা ও শিশুর চেকআপ কখন?", "deliveryr por checkup kokhon korbo?", "delivery er pore ma o bacchar checkup kobe?", "প্রসবের পরের চেকআপের আগে কী লিখে রাখব?", "বাচ্চা জন্মের পরে নিয়মিত চেকআপ কবে করব?", "delivery er por routine checkup kobe korbo?"],
        text: "বাড়িতে বা সেবাকেন্দ্রে যেখানেই জন্ম হোক, বিশ্ব স্বাস্থ্য সংস্থা জন্মের প্রথম ২৪ ঘণ্টার মধ্যে স্বাস্থ্যকর্মীর কাছে চেকআপের পরামর্শ দেয়। প্রথম ছয় সপ্তাহে এরপর অন্তত আরও তিনবার যোগাযোগের পরামর্শও দেয়। সেবা নিয়ে বের হওয়ার আগে মা ও শিশুর পরের চেকআপের তারিখ, কোথায় যাবেন এবং মাঝখানে কার সঙ্গে যোগাযোগ করবেন, তা লিখে রাখুন। কোন লক্ষণ দেখা দিলে দ্রুত স্বাস্থ্যকেন্দ্রে যেতে হবে এবং খাওয়ানো বা পরিবার পরিকল্পনায় কোথায় সহায়তা পাবেন, তা স্বাস্থ্যকর্মীকে জিজ্ঞেস করুন। মা ও শিশুর স্বাস্থ্য ও টিকার নথি একসঙ্গে রাখুন এবং চেকআপে সঙ্গে নিন।",
      },
    }),
    ...pair(whoEverydayWellbeing, {
      topic: "everydayWellbeing", stage: "pregnancy", audience: "mother", locator: "Tips and information: everyday physical and emotional well-being",
      translationGroup: "1d0cd98d-355c-5a19-b611-cc8a768f1183",
    }, {
      en: {
        chunkId: "9ef3d06d-c7c4-5625-9d17-a1b0f19f85a6",
        questions: ["How can I look after myself during pregnancy and after birth?", "Can I ask for help avoiding tobacco in pregnancy?"],
        text: "Ask a health worker which kinds of physical activity suit your situation and for help avoiding tobacco, alcohol or other drugs. Talk about worries or low mood with someone you trust, such as a family member, friend or health worker. If you feel very sad, anxious, exhausted or unable to cope, ask a health worker for support. Learn when your routine visits are due and where to go if you need urgent care.",
      },
      bn: {
        chunkId: "72c7624e-34f0-5d29-934b-7918a1ce6e67",
        questions: ["গর্ভাবস্থায় বা প্রসবের পরে নিজের যত্ন কীভাবে নেব?", "pregnancy te nijer jotno kivabe nebo?", "jorda paan pregnancy te khotikor?"],
        text: "কোন ধরনের শারীরিক কাজ আপনার জন্য উপযুক্ত এবং তামাক, অ্যালকোহল বা অন্য মাদক এড়াতে কীভাবে সাহায্য পাবেন, তা স্বাস্থ্যকর্মীর কাছে জেনে নিন। দুশ্চিন্তা বা মন খারাপের কথা পরিবারের কেউ, বন্ধু বা স্বাস্থ্যকর্মীর মতো বিশ্বস্ত কাউকে বলুন। খুব মন খারাপ, উদ্বেগ, ক্লান্তি বা সামলাতে না পারার অনুভূতি হলে স্বাস্থ্যকর্মীর সাহায্য নিন। নিয়মিত চেকআপ কখন এবং জরুরি সেবা কোথায় পাবেন, তা আগে থেকে জেনে রাখুন।",
      },
    }),
    ...pair(whoCareAtHome, {
      topic: "babyHygiene", stage: "after_birth", audience: "newborn", locator: "Tips and information: hands, skin and cord",
      translationGroup: "3f058dca-c905-5349-8878-9b329a094f16",
    }, {
      en: {
        chunkId: "4bf89a8a-6614-5a97-bc17-e23913e11062",
        questions: ["How do I keep my newborn clean?", "What hygiene matters when handling a newborn?", "Should I wash my hands before holding a newborn?", "What should visitors do before touching a newborn?"],
        text: "Wash hands with soap and clean water before handling the newborn, and ask other caregivers to do the same. Keep the baby dry and clean when handling them and keep the cord area dry. Wait at least 24 hours after birth for the first bath. Ask the maternity team to show you routine cleaning and how to keep the baby warm while you do it.",
      },
      bn: {
        chunkId: "92e87642-7cd1-5c7a-a2ef-ccafcb7ed718",
        questions: ["নবজাতককে কীভাবে পরিষ্কার রাখব?", "newborn ke clean rakhbo kivabe?", "নবজাতককে কোলে নেওয়ার আগে হাত ধোয়া দরকার কি?", "newborn kole neyar age hat dhute hobe?"],
        text: "নবজাতককে ধরার আগে সাবান ও পরিষ্কার পানি দিয়ে হাত ধুয়ে নিন এবং অন্য যাঁরা যত্ন নেন তাঁদেরও একই কাজ করতে বলুন। শিশুকে ধরার ও পরিষ্কার করার সময় শুকনো ও পরিষ্কার রাখুন এবং নাভির জায়গা শুকনো রাখুন। জন্মের অন্তত ২৪ ঘণ্টা পরে প্রথম গোসল দিন। সাধারণ পরিষ্কার-পরিচ্ছন্নতার যত্ন এবং সেই সময় শিশুকে উষ্ণ রাখার উপায় সেবাদানকারী দলের কাছে দেখে নিন।",
      },
    }),
    ...pair(nhsMaternityNotes, {
      topic: "ancCard", stage: "pregnancy", audience: "mother", locator: "Your maternity notes",
      translationGroup: "157b496c-e67b-4989-aa07-a50b62d41d96",
    }, {
      en: {
        chunkId: "2bc801cc-318a-42a7-bf7a-e600a61a3f5c",
        questions: ["How should I use my maternity notes?"],
        text: "Your antenatal record helps you and your health team keep track of appointments, test results and contact details. Ask your clinic how to access the record and bring your card or notes to each visit. Before leaving, check where your next appointment is recorded and who to contact if you have concerns.",
      },
      bn: {
        chunkId: "3686ab5c-f89a-457c-8bd4-8845e667a29f",
        questions: ["anc card kivabe use korbo?", "গর্ভকালীন সেবার কার্ডে কী থাকে?"],
        text: "গর্ভকালীন সেবার কার্ডে চেকআপ, পরীক্ষার ফল ও যোগাযোগের তথ্য লিখে রাখা হয়। তথ্য কোথায় পাবেন, তা সেবাকেন্দ্রে জেনে নিন এবং প্রতিবার চেকআপে কার্ডটি সঙ্গে নিন। ফেরার আগে পরের চেকআপের সময় কোথায় লেখা আছে ও সমস্যা হলে কার সঙ্গে যোগাযোগ করবেন, তা দেখে নিন।",
      },
    }),
    ...pair(whoAntenatalHandbook, {
      topic: "bloodPressureCheck", stage: "pregnancy", audience: "mother", locator: "WHO recommendations for antenatal care interventions",
      translationGroup: "08006932-748c-46e3-84df-45b12bf63a73",
    }, {
      en: {
        chunkId: "9cea9abc-77eb-45b5-a514-0db47daa1a8f",
        questions: ["Why is blood pressure checked?", "Why do they check my blood pressure at ANC?"],
        text: "Checking blood pressure at antenatal appointments helps your care team spot problems related to high blood pressure. They may also check for protein in your urine as part of screening for pre-eclampsia. Ask what your readings mean and what follow-up the team recommends for you.",
      },
      bn: {
        chunkId: "f7724c05-14a3-4ad2-bc2f-45f9d2db37f3",
        questions: ["রক্তচাপ কেন পরীক্ষা করা হয়?", "bp keno check kore?"],
        text: "গর্ভকালীন চেকআপে রক্তচাপ মাপলে উচ্চ রক্তচাপজনিত সমস্যা শনাক্ত করতে সুবিধা হয়। প্রি-এক্ল্যাম্পসিয়ার লক্ষণ খুঁজতে প্রস্রাবে প্রোটিন আছে কি না, তাও পরীক্ষা করা হতে পারে। আপনার রক্তচাপের ফলের অর্থ ও পরের পদক্ষেপ সেবা দলের কাছে জেনে নিন।",
      },
    }),
    ...pair(nhsPregnancyExercise, {
      topic: "exercise", stage: "pregnancy", audience: "mother", locator: "Getting started and how to exercise safely",
      translationGroup: "ccb4cc0e-b30d-4180-9dd8-56cb56b70da1",
    }, {
      en: {
        chunkId: "c60c159b-5396-4639-90b0-80e6fb030913",
        questions: ["Is exercise or walking okay?", "Is walking okay during pregnancy?"],
        text: "Walking is one way to stay active in pregnancy if it is comfortable for you. If you are new to exercise, start slowly and drink water. Keep the effort at a level where you can still talk, and stop if you feel unwell. If you have a health condition or your care team has restricted activity, ask them what is suitable for you.",
      },
      bn: {
        chunkId: "c48d0411-5fc4-4a96-845a-c7a0e5cd729a",
        questions: ["pregnancy te exercise ba hata ki thik?", "pregnancy te exercise kora jabe?"],
        text: "আরামবোধ করলে গর্ভাবস্থায় সক্রিয় থাকার একটি উপায় হলো হাঁটা। আগে ব্যায়াম না করলে অল্প করে শুরু করুন এবং পানি পান করুন। ব্যায়ামের সময় যেন কথা বলতে পারেন, ততটুকু পরিশ্রম করুন। অসুস্থ লাগলে থামুন। আগে থেকে কোনো স্বাস্থ্যসমস্যা থাকলে বা ব্যায়ামে নিষেধ থাকলে কী করা যাবে তা সেবা দলের কাছে জেনে নিন।",
      },
    }),
    ...pair(whoBirthCompanion, {
      topic: "birthCompanion", stage: "pregnancy", audience: "mother", locator: "Companion of choice during labour and childbirth",
      translationGroup: "cdcfcd8d-a5c2-450b-b9bf-ca65f2e161aa",
    }, {
      en: {
        chunkId: "88f208d4-c4f2-4608-bd4b-73970b728388",
        questions: ["Can I have a birth companion?"],
        text: "WHO supports having a companion you choose during labour and birth. This could be a trusted partner, friend or family member. They can offer reassurance and help you communicate your preferences to staff. Ask your chosen facility in advance how to arrange for your companion.",
      },
      bn: {
        chunkId: "e0238aba-e06f-4011-9c0c-a222a1a45672",
        questions: ["prosober shomoy shonge ke thakte parbe?", "ami ki birth companion rakhte parbo?"],
        text: "বিশ্ব স্বাস্থ্য সংস্থা প্রসবের সময় আপনার পছন্দের একজন সঙ্গী রাখার পক্ষে। তিনি আপনার বিশ্বস্ত সঙ্গী, বন্ধু বা পরিবারের কেউ হতে পারেন। তিনি আপনাকে সাহস দিতে এবং আপনার পছন্দের কথা স্বাস্থ্যকর্মীদের জানাতে সাহায্য করতে পারেন। কীভাবে সঙ্গী রাখার ব্যবস্থা করবেন, তা প্রসবের আগেই সেবাকেন্দ্রে জেনে নিন।",
      },
    }),
    ...pair(unicefBreastfeedingPosition, {
      topic: "breastfeedingPosition", stage: "after_birth", audience: "newborn", locator: "Breastfeeding tips and signs of good positioning",
      translationGroup: "f913c9a4-89d2-4473-a18d-050f7446121d",
    }, {
      en: {
        chunkId: "6346fea0-da42-409d-b9fe-4a13b508e90a",
        questions: ["How do I breastfeed correctly?", "What is a good position for breastfeeding?"],
        text: "Hold your baby close with their head and body in a straight line. Support their body and bring them toward the breast with their nose near the nipple. A comfortable latch usually has a wide-open mouth and the chin close to the breast. If feeding hurts or attaching is difficult, ask a health worker or lactation specialist to watch a feed and help.",
      },
      bn: {
        chunkId: "15dfb4a5-822c-4be7-aa1c-cb695d2a05a3",
        questions: ["সঠিকভাবে বুকের দুধ খাওয়াব কীভাবে?", "baby ke thikmoto dudh khawabo kivabe?"],
        text: "শিশুকে কাছে ধরুন, যেন মাথা ও শরীর সোজা থাকে। শরীর ধরে শিশুর নাক স্তনের বোঁটার কাছে আনুন। আরাম করে দুধ ধরতে পারলে সাধারণত শিশুর মুখ বেশ খোলা থাকে এবং থুতনি স্তনের কাছে থাকে। ব্যথা হলে বা শিশু ঠিকমতো দুধ ধরতে না পারলে একজন স্বাস্থ্যকর্মী বা বুকের দুধ খাওয়ানোর পরামর্শদাতাকে খাওয়ানোটি দেখে সাহায্য করতে বলুন।",
      },
    }),
    ...pair(nhsGestationalDiabetes, {
      topic: "glucoseCheck", stage: "pregnancy", audience: "mother", locator: "Screening for gestational diabetes",
      translationGroup: "786c7ce3-796d-4601-a115-5704e43d981c",
    }, {
      en: {
        chunkId: "40a02a7e-3337-4624-89dd-77618d1051ec",
        questions: ["What happens in an OGTT?", "What is the test for gestational diabetes?"],
        text: "An oral glucose tolerance test checks how your body handles sugar during pregnancy. A health worker takes a blood sample, gives you a glucose drink, and takes another sample later. Ask your clinic whether you need the test, when to come, and how to prepare.",
      },
      bn: {
        chunkId: "0b5505da-505e-4261-97bb-91e09a36fc65",
        questions: ["ogtt mane ki?", "গর্ভাবস্থায় সুগার পরীক্ষা কীভাবে হয়?"],
        text: "গ্লুকোজ টলারেন্স টেস্টে দেখা হয় গর্ভাবস্থায় আপনার শরীর রক্তের চিনি কীভাবে সামলায়। একজন স্বাস্থ্যকর্মী রক্তের নমুনা নেন, গ্লুকোজ মেশানো পানীয় দেন, তারপর আবার রক্তের নমুনা নেন। পরীক্ষা দরকার কি না, কখন যাবেন ও কীভাবে প্রস্তুতি নেবেন, তা সেবাকেন্দ্রে জেনে নিন।",
      },
    }),
    ...pair(nhsPeriodPain, {
      topic: "periodCare", audience: "mother", locator: "How you can ease period pain",
      translationGroup: "de8e8401-5080-49fa-89e3-85cbc02feab7",
    }, {
      en: {
        chunkId: "dc30528b-b88c-4002-ac2e-dceb6c54ac87",
        questions: ["How can I ease my usual period pain?", "What can I do for my usual period cramps?"],
        text: "For your usual period cramps, try a warm shower or gentle movement, such as walking. You can also put a heat pad or hot water bottle wrapped in a towel on your lower belly. If the pain is much worse than usual or your periods change, ask a health professional.",
      },
      bn: {
        chunkId: "2a5385b0-b44b-44c6-9c25-fd3aa4fb5e16",
        questions: ["স্বাভাবিক সময়ের মাসিকের ব্যথা কমানোর উপায় কী?", "নিয়মিত মাসিকের ব্যথায় কী করব?"],
        text: "স্বাভাবিক সময়ের মাসিকের ব্যথায় গরম পানিতে গোসল বা হালকা হাঁটাহাঁটি করে দেখতে পারেন। তোয়ালে দিয়ে মোড়ানো গরম পানির বোতল বা হিট প্যাড তলপেটে রাখলেও আরাম হতে পারে। ব্যথা আগের তুলনায় অনেক বেড়ে গেলে বা মাসিকের ধরন বদলালে স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন।",
      },
    }),
    ...pair(nhsPregnancyTest, {
      topic: "pregnancyTest", audience: "mother", locator: "When you can do a pregnancy test",
      translationGroup: "eae5747b-8424-46f2-aeb4-647d4838442c",
    }, {
      en: {
        chunkId: "55737d13-e02e-4474-9aaa-9753b5fbd42f",
        questions: ["How do I know if I'm pregnant?", "Could I be pregnant?"],
        text: "A urine pregnancy test can help you check. Most home tests are reliable from the first day your period is late. Follow the directions on the kit. If you test negative and your period still hasn’t come, repeat the test after a few days or ask a health professional.",
      },
      bn: {
        chunkId: "829b38aa-18bf-4ff1-b2e0-e8c3d315f259",
        questions: ["আমি কি গর্ভবতী?", "গর্ভবতী কি না বুঝব কীভাবে?", "pregnant kina kivabe bujhbo?", "ami ki pregnant?"],
        text: "প্রস্রাবের গর্ভধারণ পরীক্ষা করে জানতে পারেন। মাসিক হওয়ার কথা ছিল যে দিন, সে দিন থেকে বেশির ভাগ ঘরোয়া পরীক্ষা নির্ভরযোগ্য। কিটের নির্দেশনা মেনে পরীক্ষা করুন। ফল নেগেটিভ হলেও মাসিক না এলে কয়েক দিন পরে আবার পরীক্ষা করুন, অথবা স্বাস্থ্যকর্মীর সঙ্গে কথা বলুন।",
      },
    }),
    ...pair(whoIronFolate, {
      topic: "ironFolate", stage: "pregnancy", audience: "mother", locator: "Overview and WHO recommendations",
      translationGroup: "4325974e-1106-4442-9df8-65213611ca00",
    }, {
      en: {
        chunkId: "49218cb4-02aa-4b32-81f8-7bd46cfeee14",
        questions: ["Why are iron and folic acid important in pregnancy?"],
        text: "Pregnancy increases the need for iron and folic acid. WHO recommends them as part of antenatal care. The supplements can reduce the chance of iron deficiency and anaemia. Ask your antenatal team what to take and how to take it.",
      },
      bn: {
        chunkId: "ffa04a65-801d-4c20-8249-27cb37396082",
        questions: ["iron ar folic acid keno dorkar?"],
        text: "গর্ভাবস্থায় আয়রন ও ফলিক অ্যাসিডের প্রয়োজন বাড়ে। বিশ্ব স্বাস্থ্য সংস্থা গর্ভকালীন সেবার অংশ হিসেবে এগুলো নেওয়ার পরামর্শ দেয়। এগুলো আয়রনের ঘাটতি ও রক্তস্বল্পতার ঝুঁকি কমাতে পারে। কী নিতে হবে ও কীভাবে নিতে হবে, তা আপনার গর্ভকালীন সেবা দলের কাছে জেনে নিন।",
      },
    }),
    ...pair(nhsMovement, {
      topic: "fetalMovement", stage: "pregnancy", audience: "mother", locator: "When you’ll feel your baby move and urgent advice",
      translationGroup: "60d27c87-cf96-41b9-8ac0-fa6deb5d6a32",
    }, {
      en: {
        chunkId: "521269c7-6a64-43b1-be61-fa139a3b408e",
        questions: ["When will I feel the baby move?"],
        text: "Most people first notice their baby moving between 16 and 24 weeks. In a first pregnancy it may be after 20 weeks. If you haven't felt movement by 24 weeks, tell your maternity team. If movements slow, stop or change from their usual pattern, contact maternity care immediately.",
      },
      bn: {
        chunkId: "a38c860b-30ce-478e-894c-2893bc63da0c",
        questions: ["baccha kobe nora chora shuru kore?"],
        text: "বেশির ভাগ মানুষ ১৬ থেকে ২৪ সপ্তাহের মধ্যে প্রথম শিশুর নড়াচড়া টের পান। প্রথম গর্ভাবস্থায় ২০ সপ্তাহের পরেও টের পেতে পারেন। ২৪ সপ্তাহেও নড়াচড়া না টের পেলে মাতৃসেবা দলকে জানান। স্বাভাবিকের চেয়ে নড়াচড়া কমে গেলে, বন্ধ হলে বা ধরন বদলালে এখনই মাতৃসেবা কেন্দ্রে যোগাযোগ করুন।",
      },
    }),
    ...pair(whoAntenatalSchedule, {
      topic: "firstCheckup", stage: "pregnancy", audience: "mother", locator: "WHO antenatal care model",
      translationGroup: "2fc08ca9-d924-48e7-817a-f72a262ab88e",
    }, {
      en: {
        chunkId: "d3c1cbff-9eea-4188-a4aa-4ab204ac65a5",
        questions: ["How many antenatal check-ups should I have?", "When should I have my first check-up?", "When is the first antenatal appointment?", "How many antenatal chekup should I have?"],
        text: "WHO recommends starting antenatal care within the first 12 weeks and having at least eight contacts with a health worker during pregnancy. The first visit gives you a chance to ask questions and plan later care. Ask your maternity team which appointments to arrange for your situation.",
      },
      bn: {
        chunkId: "bea85817-0508-4315-84f1-cfba212e9719",
        questions: ["গর্ভাবস্থায় কতবার চেকআপ করাতে হবে?", "প্রথম চেকআপ কখন করা উচিত?", "pregnancy te koybar checkup korate hobe?", "prothom checkup kokhon kora uchit?"],
        text: "বিশ্ব স্বাস্থ্য সংস্থা প্রথম ১২ সপ্তাহের মধ্যে গর্ভকালীন সেবা শুরু করতে এবং গর্ভাবস্থায় অন্তত আটবার স্বাস্থ্যকর্মীর সঙ্গে যোগাযোগ করতে বলে। প্রথম সাক্ষাতে প্রশ্ন করতে ও পরের সেবার পরিকল্পনা করতে পারেন। আপনার জন্য কোন সময়ে চেকআপ দরকার, তা মাতৃসেবা দলের কাছে জেনে নিন।",
      },
    }),
    ...pair(whoAntenatalSchedule, {
      topic: "ultrasound", stage: "pregnancy", audience: "mother", locator: "Antenatal care recommendations",
      translationGroup: "dbe89e44-babc-4e83-9694-b5f89bf0da48",
    }, {
      en: {
        chunkId: "322b1711-4f3e-4267-947d-1b90818dd774",
        questions: ["When is an ultrasound done?", "Why is an ultrasound performed?", "When is an ultrasond done?"],
        text: "An early ultrasound can help estimate how far along the pregnancy is and check whether there is more than one baby. WHO recommends one ultrasound before 24 weeks. Your maternity team can explain what to arrange for your care.",
      },
      bn: {
        chunkId: "704d585a-4c67-4d0f-a79b-3541f6f8ef45",
        questions: ["আল্ট্রাসাউন্ড কখন করানো হয়?", "আল্ট্রাসাউন্ড কেন করা হয়?", "ultrasound keno kora hoy?", "ultrasound kokhon kora hoy?", "altrasound kokhon kora hoy?"],
        text: "শুরুর দিকের আল্ট্রাসাউন্ডে গর্ভাবস্থা কত সপ্তাহ চলছে এবং একাধিক শিশু আছে কি না, তা বোঝা যায়। বিশ্ব স্বাস্থ্য সংস্থা ২৪ সপ্তাহের আগে একটি আল্ট্রাসাউন্ডের পরামর্শ দেয়। আপনার জন্য কী ব্যবস্থা দরকার, তা মাতৃসেবা দলের কাছে জেনে নিন।",
      },
    }),
    ...pair(unicefFoodSafety, {
      topic: "foodSafety", stage: "pregnancy", audience: "mother", locator: "Foods to avoid during pregnancy and food safety tips",
      translationGroup: "362fd7a6-482a-4463-9460-204500d85eb8",
    }, {
      en: {
        chunkId: "767e92f4-4c7a-4e32-a44d-b50291ad123f",
        questions: ["What foods should I avoid?", "Can I eat eggs during pregnancy?", "What should I avoid eating during pregnancy?"],
        text: "During pregnancy, avoid raw or undercooked eggs and meat, raw fish, and unpasteurized milk. Choose well-cooked foods. Wash your hands with soap and wash fruit and vegetables before eating. These steps lower your chances of getting sick from food.",
      },
      bn: {
        chunkId: "2fa57214-aecc-4b9b-9cf5-ecd2b0582b8e",
        questions: ["কোন খাবার এড়িয়ে চলব?", "গর্ভাবস্থায় ডিম খাওয়া যাবে?", "kon khabar ereye cholbo?", "pregnancy te dim khawa jabe?"],
        text: "গর্ভাবস্থায় কাঁচা বা আধাসেদ্ধ ডিম ও মাংস, কাঁচা মাছ এবং পাস্তুরিত নয় এমন দুধ এড়িয়ে চলুন। ভালোভাবে রান্না করা খাবার বেছে নিন। খাওয়ার আগে সাবান দিয়ে হাত ধুয়ে নিন এবং ফল ও শাকসবজি ভালো করে ধুয়ে নিন। এসব অভ্যাস খাবার থেকে অসুস্থ হওয়ার ঝুঁকি কমায়।",
      },
    }),
    ...pair(nhsMorningSickness, {
      topic: "morningSickness", stage: "pregnancy", audience: "mother", locator: "Things you can try yourself and when to seek help",
      translationGroup: "71780168-784f-4071-bbe4-64efb872eb70",
    }, {
      en: {
        chunkId: "5f229068-cf9b-48cf-9a55-55f504031c45",
        questions: ["What can I do about morning sickness?", "How can I ease mild pregnancy nausea?", "What helps with morning sickness?"],
        text: "For mild nausea during pregnancy, try small portions of plain foods such as rice or bread, more often. Sip water regularly and avoid smells or foods that make you feel worse. If symptoms are severe or you cannot keep fluids down, seek medical help.",
      },
      bn: {
        chunkId: "f87cbe47-a758-42bf-b409-36b216fe7cb0",
        questions: ["সকালে বমি বমি ভাব হলে কী করব?", "গর্ভাবস্থায় হালকা বমি বমি ভাব কমাব কীভাবে?", "shokale bomi bomi bhab hole ki korbo?", "shokale bomi bomi vat hole ki korbo?"],
        text: "গর্ভাবস্থায় হালকা বমি বমি ভাব হলে ভাত বা রুটির মতো সাধারণ খাবার অল্প অল্প করে কয়েকবার খেয়ে দেখুন। নিয়মিত অল্প অল্প করে পানি পান করুন এবং যে গন্ধ বা খাবারে অস্বস্তি বাড়ে তা এড়িয়ে চলুন। উপসর্গ তীব্র হলে বা পানি পেটে রাখতে না পারলে চিকিৎসা নিন।",
      },
    }),
    ...pair(unicefBangladesh, {
      topic: "pregnancyBasics", stage: "pregnancy", audience: "mother", locator: "Explore stages of pregnancy",
      translationGroup: "95ef802b-8898-4ee2-b99b-f850a0c14c2f",
    }, {
      en: {
        chunkId: "b43a365a-5a09-4503-af14-d3ce3d66058d",
        questions: ["What are pregnancy trimesters?", "What are the three trimesters?", "What does trimester mean in pregnancy?", "How many trimesters are in pregnancy?"],
        text: "Pregnancy is usually described in three stages called trimesters. They are the first, second and third trimesters.",
      },
      bn: {
        chunkId: "35d5e2ff-88f1-4228-9246-e5b5e9d641ee",
        questions: ["গর্ভাবস্থায় ট্রাইমেস্টার মানে কী?", "গর্ভাবস্থার তিনটি ট্রাইমেস্টার কী?", "pregnancy er 3 ta trimester ki?", "গর্ভাবস্থার কয়টি ধাপ?", "pregnancy trimester mane ki?", "pregnancy te koyta trimester?"],
        text: "গর্ভাবস্থাকে সাধারণত তিনটি ধাপে ভাগ করে বোঝানো হয়। এই ধাপগুলোর নাম প্রথম, দ্বিতীয় ও তৃতীয় ট্রাইমেস্টার।",
      },
    }),
    ...pair(dghsBangladesh, {
      topic: "balancedMeals", stage: "pregnancy", audience: "mother", locator: "Maternal nutrition poster",
      page: 113, translationGroup: "74269f9f-23eb-456b-86f8-c47362c2d15f",
    }, {
      en: {
        chunkId: "da1faefa-8a70-41ad-8f8c-156ffdc7e239",
        questions: ["What should I eat during pregnancy?", "What foods can I eat in pregnancy?", "What foods should I eat in pregnancy?", "My wife is pregnant, what should she eat?", "What counts as balanced pregnancy meals?"],
        text: "Choose a variety of foods during pregnancy. Rice or roti, lentils, vegetables and fruit are examples. Fish or eggs can also be part of meals. Drink safe water.",
      },
      bn: {
        chunkId: "df5b438f-5e4c-4dd8-b914-aa9455feb224",
        questions: ["গর্ভাবস্থায় কী খাওয়া উচিত?", "গর্ভাবস্থায় কী কী খাবার খাওয়া উচিত?", "pregnancy te ki ki khabo?", "গর্ভাবস্থায় কী খাব?", "pregnancy te ki ki khawa uchit?", "pregnancy te ki khabo?", "gorbhobosthay ki khawa uchit?"],
        text: "গর্ভাবস্থায় নানা ধরনের খাবার খান। ভাত বা রুটি, ডাল, শাকসবজি ও ফল এর উদাহরণ। খাবারে মাছ বা ডিমও রাখতে পারেন। নিরাপদ পানি পান করুন।",
      },
    }),
    ...pair(whoPreeclampsia, {
      topic: "warningSigns", stage: "pregnancy", audience: "mother", locator: "Symptoms",
      translationGroup: "1ebf86d0-0979-4b4b-99e8-0e9d992f0153",
    }, {
      en: {
        chunkId: "ccd032f3-d041-49db-8c2c-e4ee251f2986",
        questions: ["What are some warning signs of pre-eclampsia?", "What are the symptoms of preeclampsia?", "Which pregnancy symptoms should not be ignored?"],
        text: "A very bad headache, changes in vision or pain high in the belly can be warning signs during pregnancy. Seek medical help promptly if you have concerning symptoms.",
      },
      bn: {
        chunkId: "4a1448a6-ee49-4ec3-a0f3-3da5c0ff73ef",
        questions: ["প্রি-এক্ল্যাম্পসিয়ার লক্ষণ কী?", "গর্ভাবস্থার কিছু বিপদের লক্ষণ কী?", "pregnancy te bipoder lokkhon ki?"],
        text: "গর্ভাবস্থায় তীব্র মাথাব্যথা, দৃষ্টিতে পরিবর্তন বা পেটের ওপরের দিকে ব্যথা সতর্কতার লক্ষণ হতে পারে। এমন উদ্বেগজনক লক্ষণ হলে দ্রুত চিকিৎসা নিন।",
      },
    }),
    ...pair(whoPreeclampsia, {
      topic: "maternalHealth", stage: "pregnancy", audience: "mother", locator: "Overview",
      translationGroup: "cc147e43-b8ec-4a33-a13e-08a25bb5f78f",
    }, {
      en: {
        chunkId: "8c65072f-8a7a-4701-adb9-1b0f9ecd9f87",
        questions: ["What does preeclampsia mean?", "What is preeclampsia?", "What does the term pre-eclampsia mean?"],
        text: "Pre-eclampsia is a condition involving high blood pressure during pregnancy. It can affect both the pregnant person and the baby. Finding it early and getting care matters.",
      },
      bn: {
        chunkId: "ab6d66e1-b5f0-4762-bae7-98fceb9bffd6",
        questions: ["প্রি এক্ল্যাম্পসিয়া বলতে কী বোঝায়?", "preeclampsia mane ki?", "pre eclampsia ki?"],
        text: "প্রি-এক্ল্যাম্পসিয়া হলো গর্ভাবস্থায় উচ্চ রক্তচাপের সঙ্গে সম্পর্কিত একটি সমস্যা। এতে গর্ভবতী ব্যক্তি ও শিশু দুজনেরই ঝুঁকি হতে পারে। তাই দ্রুত শনাক্ত করে চিকিৎসা নেওয়া জরুরি।",
      },
    }),
    ...pair(perinatalMentalHealth, {
      topic: "mentalWellbeing", audience: "mother", locator: "Overview",
      translationGroup: "b1f11b60-6032-41db-a384-12843080e5ab",
    }, {
      en: {
        chunkId: "1ce87124-71f2-49ea-ab75-37202ec4bdd2",
        questions: ["Can I talk to a health worker about my mood during pregnancy?", "Can I bring up emotional concerns in maternity care?"],
        text: "You can bring up emotional difficulties with a health worker during pregnancy or after birth. WHO encourages maternity services to make space for these conversations and respond with care and respect.",
      },
      bn: {
        chunkId: "b1c4a62b-71b9-4f57-8c75-25e214e2bc1f",
        questions: ["গর্ভাবস্থায় মানসিক স্বাস্থ্য নিয়ে কথা বলা যায় কি?", "pregnancy te moner kotha health worker ke bola jay?"],
        text: "গর্ভাবস্থায় বা প্রসবের পরে মনের কষ্ট নিয়ে স্বাস্থ্যকর্মীর সঙ্গে কথা বলতে পারেন। বিশ্ব স্বাস্থ্য সংস্থা মাতৃসেবা কেন্দ্রে সহানুভূতি ও সম্মানের সঙ্গে এমন কথা শোনার সুযোগ রাখতে বলে।",
      },
    }),
    ...pair(childbirthPlanning, {
      topic: "birthPlan", stage: "pregnancy", audience: "mother", locator: "Tips and information",
      translationGroup: "70ed648b-6d31-4beb-a7cd-24cb9b66a0bc",
    }, {
      en: {
        chunkId: "3a195fa5-514f-44a2-a0d0-f48a56f94d09",
        questions: ["What goes in a birth plan?", "How can I plan for childbirth?", "What should I plan before giving birth?"],
        text: "Write down where you plan to give birth and how you will get there. Include how to reach the health workers and who can come with you or help.",
      },
      bn: {
        chunkId: "2e68370e-057b-4e13-9133-d78ef77c9992",
        questions: ["প্রসব পরিকল্পনায় কী রাখব?", "deliveryr age ki prostuti nibo?", "baccha howar age ki prostuti nibo?"],
        text: "কোথায় প্রসবের পরিকল্পনা করছেন এবং সেখানে কীভাবে যাবেন, তা লিখে রাখুন। স্বাস্থ্যকর্মীদের সঙ্গে যোগাযোগের উপায় এবং কে সঙ্গে যাবেন বা সাহায্য করবেন, তাও লিখুন।",
      },
    }),
    ...pair(whoAntenatalHandbook, {
      topic: "ancVisits", stage: "pregnancy", audience: "mother", locator: "WHO recommendations for antenatal care interventions",
      translationGroup: "3514e8f4-5a55-49e8-810c-772c78186eba",
    }, {
      en: {
        chunkId: "5fb06b54-29aa-424c-968f-bcea163c636a",
        questions: ["What happens during antenatal care?", "Why are ANC visits important?", "What are antenatal appointments for?", "What are ANC visits for?", "What happens at an antenatal appointment?"],
        text: "Antenatal visits are a chance to ask questions and get support during pregnancy. At the first visit, the care team can confirm the pregnancy and offer routine blood tests. At later visits, they can check your blood pressure and weight and monitor the baby’s growth. Depending on the stage of pregnancy, they may talk about food, warning signs and plans for birth. Before leaving, ask which checks you need, what the results mean and when to come back.",
      },
      bn: {
        chunkId: "b1452c85-a9ee-4409-9f63-af1517f03e4f",
        questions: ["গর্ভকালীন চেকআপে কী হয়?", "ANC ভিজিটে কী হয়?", "গর্ভকালীন সেবা কেন জরুরি?", "anc visit e ki hoy?", "gorbokalin checkup e ki hoy?"],
        text: "গর্ভকালীন চেকআপে প্রশ্ন করতে ও সহায়তা পেতে পারেন। প্রথম সাক্ষাতে সেবা দল গর্ভধারণ নিশ্চিত করতে ও নিয়মিত রক্ত পরীক্ষার প্রস্তাব দিতে পারে। পরের সাক্ষাৎগুলোতে রক্তচাপ ও ওজন দেখা এবং শিশুর বৃদ্ধি পর্যবেক্ষণ করা হতে পারে। গর্ভাবস্থার ধাপ অনুযায়ী স্বাস্থ্যকর খাবার, বিপদের লক্ষণ ও প্রসবের পরিকল্পনা নিয়ে কথা হতে পারে। ফেরার আগে জেনে নিন আপনার কোন পরীক্ষা দরকার, ফলের অর্থ কী ও আবার কখন আসবেন।",
      },
    }),
    ...pair(antenatal, {
      topic: "nutrition", stage: "pregnancy", audience: "mother", locator: "Table 1, recommendation A.1.1", page: 3,
      translationGroup: "989a2649-d6fb-4f54-a079-f46f8400d57c",
    }, {
      en: {
        chunkId: "089fc74c-53c4-404a-9268-fcf317841932",
        questions: ["Does ANC include nutrition advice?", "Can I ask about healthy eating at an ANC visit?", "Do antenatal visits cover healthy eating?"],
        text: "WHO recommends talking with a health worker about healthy eating and staying active as part of routine pregnancy care.",
      },
      bn: {
        chunkId: "eb43f5f3-e53d-4e92-90bb-0987112d9889",
        questions: ["ANC ভিজিটে খাবার নিয়ে জিজ্ঞেস করা যায়?", "গর্ভকালীন সেবায় পুষ্টি নিয়ে কথা বলা হয় কি?", "anc visit e khabar niye jiggesh kora jay?"],
        text: "বিশ্ব স্বাস্থ্য সংস্থা বলছে, নিয়মিত গর্ভকালীন সেবায় স্বাস্থ্যকর খাবার ও শারীরিকভাবে সক্রিয় থাকা নিয়ে স্বাস্থ্যকর্মীর সঙ্গে কথা বলা উচিত।",
      },
    }),
    ...pair(breastfeeding, {
      topic: "breastfeeding", stage: "after_birth", audience: "newborn", locator: "WHO breastfeeding Q&A: exclusively breastfeeding, hot days, milk supply and starting foods",
      translationGroup: "65ae1657-b757-47a3-ab00-a82c2eb4b60c",
    }, {
      en: {
        chunkId: "52ac151f-159b-4537-ac06-c18ef32f1d74",
        questions: ["What is exclusive breastfeeding?", "What does exclusively breastfeeding mean?", "What does feeding only breast milk mean?"],
        text: "Exclusive breastfeeding means feeding a baby breast milk without other foods or drinks. WHO recommends it for the first six months. In everyday practice, offer the breast when your baby shows signs of hunger, during the day and at night. For an exclusively breastfed baby under six months, extra water is unnecessary even in hot weather. If you are unsure that your baby is getting enough milk, ask a trained health worker to check how the baby attaches and how they are growing. At around six months, start offering suitable foods alongside breast milk.",
      },
      bn: {
        chunkId: "b1c0ab8d-03ad-4adf-959f-1ab5e777c529",
        questions: ["একচেটিয়া বুকের দুধ খাওয়ানো কী?", "শুধু বুকের দুধ দেওয়া মানে কী?", "shudhu buker dudh khaowano mane ki?", "exclusive breastfeeding mane ki?"],
        text: "শুধু বুকের দুধ খাওয়ানোর অর্থ শিশুকে অন্য খাবার বা পানীয় ছাড়াই বুকের দুধ দেওয়া। বিশ্ব স্বাস্থ্য সংস্থা প্রথম ছয় মাস এভাবে খাওয়ানোর পরামর্শ দেয়। প্রতিদিনের যত্নে শিশু ক্ষুধার ইঙ্গিত দিলে দিনে ও রাতে বুকের দুধ দিন। শুধু বুকের দুধ খাওয়া ছয় মাসের কম বয়সী শিশুকে গরমেও আলাদা পানি দেওয়ার প্রয়োজন হয় না। শিশু পর্যাপ্ত দুধ পাচ্ছে কি না বুঝতে না পারলে, সে কীভাবে স্তন ধরছে এবং তার বৃদ্ধি কেমন, তা স্বাস্থ্যকর্মীকে দেখে দিতে বলুন। প্রায় ছয় মাসে বুকের দুধের পাশাপাশি উপযোগী খাবার শুরু করুন।",
      },
    }),
    ...pair(postnatal, {
      topic: "postnatal", stage: "after_birth", audience: "mother_and_newborn", locator: "Overview",
      translationGroup: "66bf7427-a0e8-4572-bb50-80888dcfa51e",
    }, {
      en: {
        chunkId: "07e4ddd7-06b5-4f5b-8bb3-ab2edbb049bb",
        questions: ["What does postnatal care mean?", "Who is postnatal care for?", "What is care after childbirth called?", "What is care after birth?"],
        text: "Postnatal care is health care and support after childbirth for both the person who gave birth and the newborn. It can be given at a health facility or in the community. In the first weeks, ask your care team about recovery, emotional well-being, feeding support and when the baby and you should be seen again. Find out who to contact if a concern comes up between visits.",
      },
      bn: {
        chunkId: "95833c18-92de-420e-b046-adacb585ba0e",
        questions: ["প্রসব-পরবর্তী সেবা কী?", "প্রসবের পরের সেবা কাদের জন্য?", "postnatal care mane ki?", "deliveryr porer sheba ki?"],
        text: "প্রসবের পরের সেবা হলো যিনি সন্তান জন্ম দিয়েছেন এবং নবজাতক, দুজনেরই স্বাস্থ্যসেবা ও সহায়তা। এই সেবা স্বাস্থ্যকেন্দ্রে বা স্থানীয় পর্যায়ে দেওয়া যায়। প্রথম কয়েক সপ্তাহে নিজের সুস্থ হয়ে ওঠা, মানসিক অবস্থা ও শিশুকে খাওয়ানোর সহায়তা নিয়ে কথা বলুন। মা ও শিশুর পরের চেকআপ কবে এবং মাঝখানে সমস্যা হলে কোথায় যোগাযোগ করবেন, তা জেনে নিন।",
      },
    }),
    ...pair(newborn, {
      topic: "newborn", stage: "after_birth", audience: "newborn", locator: "Overview",
      translationGroup: "8804b94f-1513-4ff7-9c34-a2e56bc2b501",
    }, {
      en: {
        chunkId: "52c7e800-08dd-4e02-8f35-668ec6a2ce79",
        questions: ["What does routine newborn care include?", "What does essential newborn care include?", "What is basic newborn care?"],
        text: "Essential newborn care starts at birth and continues through the newborn period. It includes checks by the care team, keeping the baby warm, supporting breast milk feeding and preventing infection. Ask your care team to demonstrate practical steps you can repeat at home and to tell you when the baby needs prompt help. You can also ask about the first bath, caring for the cord or keeping the baby clean.",
      },
      bn: {
        chunkId: "3a730cce-6dfb-4f04-9bea-4d7fead127db",
        questions: ["নবজাতকের মৌলিক যত্নে কী থাকে?", "নবজাতকের সাধারণ যত্ন কী?", "nobojatoker moulik jotno ki?", "newborn care e ki thake?"],
        text: "নবজাতকের মৌলিক যত্ন জন্মের সময় শুরু হয় এবং নবজাতককাল জুড়ে চলে। এর মধ্যে আছে সেবাদানকারী দলের পরীক্ষা, শিশুকে উষ্ণ রাখা, বুকের দুধ খাওয়াতে সহায়তা করা ও সংক্রমণ প্রতিরোধ। বাড়িতে করার মতো কাজগুলো দেখিয়ে দিতে এবং কখন দ্রুত সাহায্য নিতে হবে তা জানাতে স্বাস্থ্যকর্মীকে বলুন। প্রথম গোসল, নাভির যত্ন বা শিশুকে পরিষ্কার রাখার বিষয়েও জিজ্ঞেস করতে পারেন।",
      },
    }),
  ],
};
