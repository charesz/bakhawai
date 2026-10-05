// ---------------------------------------------------------------------------
// LEARN CONTENT: everything the Learn screen shows lives in this file.
//
// HOW TO EDIT
//  - Change the words inside the quotes. You don't need to touch any screen code.
//  - draft: true      shows an orange DRAFT tag while SHOW_DRAFT_MARKERS is true.
//                     Set it to false once you've checked the text against DENR / BFAR sources.
//  - editorNote       a note to yourself (only shown while SHOW_DRAFT_MARKERS is true).
//  - sources          references listed under the section. Always shown.
//
// BEFORE THE FINAL APK: set SHOW_DRAFT_MARKERS to false.
// ---------------------------------------------------------------------------

export const SHOW_DRAFT_MARKERS = true;

export type LearnTopicId = 'mangroves' | 'how-to' | 'tips';

export type Block =
  | { type: 'text'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'table'; header: string[]; rows: string[][] };

export interface LearnSection {
  title: string;
  draft: boolean;
  editorNote?: string;
  sources?: string[];
  body: Block[];
}

export interface LearnTopic {
  id: LearnTopicId;
  label: string;
  sections: LearnSection[];
}

export const LEARN_TOPICS: LearnTopic[] = [
  // =========================================================================
  // TAB 1: MANGROVES
  // =========================================================================
  {
    id: 'mangroves',
    label: 'Mangroves',
    sections: [
      {
        title: 'What are mangroves?',
        draft: true,
        editorNote:
          'NOTE: DRAFT. General description written by Claude, not copied from a source. Replace or confirm it with a definition from a DENR publication (for example a DENR-ERDB mangrove manual) and add the citation.',
        sources: [],
        body: [
          {
            type: 'text',
            text:
              'Mangroves are salt-tolerant trees and shrubs that grow along tropical coasts, in the zone that is flooded and drained by the tides. They form a living barrier between the land and the sea.',
          },
        ],
      },
      {
        title: 'Why do mangroves matter?',
        draft: true,
        editorNote:
          'NOTE: DRAFT. These are widely stated benefits but none is cited yet. Add a BFAR source for the fisheries point, and a DENR source for shoreline protection and carbon.',
        sources: [],
        body: [
          {
            type: 'bullets',
            items: [
              'Shoreline protection: roots and trunks slow waves and help protect coastal communities during storms.',
              'Fisheries: they shelter young fish, crabs, and shrimp, which supports local fishing.',
              'Climate: they store carbon in their trees and soil.',
            ],
          },
        ],
      },
      {
        title: 'Why site matching matters',
        draft: true,
        editorNote:
          'NOTE: DRAFT. The 10–20% survival figure comes from the abstract of the 2008 review. Check it in the full paper before keeping it, confirm the author details of the citation, and look for newer DENR figures.',
        sources: [
          'Primavera, J.H. & Esteban, J.M.A. (2008). A review of mangrove rehabilitation in the Philippines: successes, failures and future prospects. Wetlands Ecology and Management, 16.',
          'Primavera, J.H. (2012). Paradigm shifts in mangrove rehabilitation in Southeast Asia: Focus on the Philippines. Proceedings of the 1st ASEAN Congress on Mangrove Research and Development. DENR-ERDB, Manila.',
        ],
        body: [
          {
            type: 'text',
            text:
              'Many mangrove planting projects in the Philippines have had poor long-term survival. A review of Philippine projects reported survival that was generally low, at about 10–20%, and traced it mainly to two causes: choosing the wrong species and choosing the wrong site.',
          },
          {
            type: 'bullets',
            items: [
              'Rhizophora planted on exposed or sandy shorelines, where Avicennia and Sonneratia naturally grow.',
              'Planting in the lower intertidal zone instead of the middle to upper intertidal zone.',
            ],
          },
          { type: 'text', text: 'Bakhaw AI helps you check a site before you plant.' },
        ],
      },
      {
        title: 'Which species fit which zone?',
        draft: true,
        editorNote:
          'NOTE: DRAFT. Simplified from a Forest Foundation Philippines document, not directly from DENR. Confirm or replace it with the DENR-ERDB mangrove rehabilitation manual and BFAR guidance. Keep it consistent with your species table in Phase 7.',
        sources: [
          'Forest Foundation Philippines. Mangrove Management (site-species suitability table). forestfoundation.ph',
        ],
        body: [
          {
            type: 'table',
            header: ['Zone', 'Soil', 'Suitable species'],
            rows: [
              ['Downstream / estuary', 'Muddy', 'Sonneratia alba (Pagatpat)'],
              ['Seaward', 'Muddy', 'Sonneratia alba (Pagatpat)'],
              ['Seaward', 'Sandy / coralline', 'Avicennia (Bungalon / Piapi), Rhizophora stylosa'],
              ['Landward', 'Muddy', 'Rhizophora (Bakauan / Bakhaw)'],
            ],
          },
          {
            type: 'text',
            text: 'Where Sonneratia or Avicennia already grow naturally, planting Rhizophora is discouraged.',
          },
        ],
      },
      {
        title: 'What the sensor measures',
        draft: true,
        editorNote:
          'NOTE: DRAFT. This explains how the app works, so it is not a source claim. When your species table has EC and pH ranges, add them here and cite where they came from.',
        sources: [],
        body: [
          {
            type: 'text',
            text:
              'Bakhaw AI reads two soil values with the sensor. EC (electrical conductivity) shows how salty the soil is. pH shows how acidic or alkaline it is. The app combines them with the location’s elevation, slope, and distance to the river and the coast.',
          },
        ],
      },
    ],
  },
 // =========================================================================
// TAB 2: HOW TO USE
// Simple PLANT workflow for quick in-app reference.
// =========================================================================

{
  id: 'how-to',
  label: 'How to use',
  sections: [
    {
      title: "Let's PLANT It! 🌱",
      draft: false,
      body: [
        {
          type: 'text',
          text:
            'Follow five simple steps to assess your mangrove site.',
        },
        {
          type: 'bullets',
          items: [
            'Pair the Device',
            'Locate & Scan',
            'Assess',
            'Narrow the Choices',
            'Track the Results',
          ],
        },
      ],
    },

    {
      title: 'Pair the Device',
      draft: false,
      body: [
        {
          type: 'text',
          text: 'Connect your sensor and collect your soil data.',
        },
        {
          type: 'steps',
          items: [
            'Connect the sensor using USB-C.',
            'Check that the device is connected.',
            'Take a soil reading and check the pH and EC values.',
          ],
        },
      ],
    },

    {
      title: 'Locate & Scan',
      draft: false,
      body: [
        {
          type: 'text',
          text: 'Identify your site and review its location data.',
        },
        {
          type: 'steps',
          items: [
            'Pin your site on the map or enter the location.',
            'Tap Confirm Location.',
            'Review the environmental and sensor readings.',
            'Tap Scan Site.',
          ],
        },
      ],
    },

    {
      title: 'Assess',
      draft: false,
      body: [
        {
          type: 'text',
          text: 'Understand your site assessment.',
        },
        {
          type: 'bullets',
          items: [
            'Check the Suitability Score.',
            'Review the sensor and environmental information.',
            'Read the Ecological Synopsis.',
          ],
        },
      ],
    },

    {
      title: 'Narrow the Choices',
      draft: false,
      body: [
        {
          type: 'text',
          text: 'Compare the species identified for your site.',
        },
        {
          type: 'bullets',
          items: [
            'Review the Top 3 Recommended Species.',
            'Check the Cautionary Species.',
            'Consider the results alongside your site conditions.',
          ],
        },
      ],
    },

    {
      title: 'Track the Results',
      draft: false,
      body: [
        {
          type: 'text',
          text: 'Document your assessment and keep your results.',
        },
        {
          type: 'steps',
          items: [
            'Tap Generate Report.',
            'Export the report as a PDF or tap Done.',
            'Find saved assessments in Records History.',
          ],
        },
      ],
    },

    {
      title: 'Good to know',
      draft: false,
      body: [
        {
          type: 'text',
          text:
            'Bakhaw AI is a decision-support tool. Use its results together with field observations and guidance from relevant environmental experts and authorities.',
        },
      ],
    },
  ],
},
  // =========================================================================
  // TAB 3: FIELD TIPS
  // =========================================================================
  {
    id: 'tips',
    label: 'Field tips',
    sections: [
      {
        title: 'Taking a good reading',
        draft: true,
        editorNote:
          'NOTE: DRAFT. Based on how soil probes generally work and on your own tests (the readings wobble). Replace with the manufacturer’s instructions and your own validation results.',
        body: [
          {
            type: 'bullets',
            items: [
              'Push the probe in until the metal part is fully covered by soil.',
              'Avoid stones, shells, and roots in the spot you choose.',
              'Keep the probe still and wait until the numbers settle before you scan.',
              'Take the reading where you plan to plant. On a large site, check 2 or 3 spots.',
              'Very dry soil can give low or unstable readings.',
            ],
          },
        ],
      },
      {
        title: 'Caring for the probe',
        draft: true,
        editorNote: 'NOTE: DRAFT. Check against the manufacturer’s care instructions.',
        body: [
          {
            type: 'bullets',
            items: [
              'Rinse the probe with clean water and dry it after each site, especially after salty mud.',
              'Don’t bend or twist the probe.',
              'Unplug the cable gently and store the probe clean and dry.',
            ],
          },
        ],
      },
      {
        title: 'Know the limits',
        draft: true,
        editorNote:
          'NOTE: DRAFT. After your seawater-strength test, write the sensor’s real EC limit here. Also mention your pH buffer test result.',
        body: [
          {
            type: 'text',
            text:
              'Soil readings change with moisture and with the tide. Salty mud can give very high EC values, so use the result as guidance and not as the only basis for a planting decision.',
          },
        ],
      },
    ],
  },
  
];