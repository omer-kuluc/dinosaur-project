# Design plan (frontend-design)

## Subject, audience, job
A digital natural history hall for Tyrannosaurus rex. Audience: curious, design-literate visitors. Job: make the animal feel engineered and ancient at once, and move the reader through time.

## Tokens
| Name | Hex | Role |
|---|---|---|
| Black | #000000 | deepest stage, the bite |
| Abyss | #122624 | default night, anatomy |
| Abyss deep | #0B1A18 | discovery stage |
| Moss | #1E451C | statement block |
| White | #FFFFFF | the measure of Sue, a daylight chapter |
| Amber | #C99A55 | numerals, depth readout, meteor. Under 2 percent of pixels |

Type: Bebas Neue for display only (tracking -2%), IBM Plex Sans for reading, IBM Plex Mono for catalogue lines. Two extremes, few middle sizes.

## Grid
12 / 8 / 4 columns. Every section places content by column lines; bleed is a deliberate exception (hero, bite, senses panel). Press G to see the grid.

## Layout, section by section
```
INTRO    [ 150 ................................ MILLION YEARS AGO ]
         [ ____runner____cactus________________ ground line ______ ]

HERO     [######## full-bleed sky plate + dinosaur layer ##########]
         [ T-REX: ENGINEERED                                        ]
         [ BY EVOLUTION                    built from bone, muscle.. ]

STATEMENT (solid moss)
         [      For sixty-six million years the ground kept     ]
         [      its secret ...                                  ]
         [                                   small note ->      ]

DISCOVERY
         [   FOUND IN HELL CREEK                                ]
         [   [############ image 83% width #############]       ]
         [   facts            |         body copy               ]

SENSES   [########## sticky |   55°                            ]
         [ ## image 1  ###  |   text                           ]
         [ ## depixelates ##|   SMELL / HEARING ...            ]

BITE     [############ full bleed, jaws open ##################]
         [ 35,000 N (giant)                        caption      ]

SUE (white)
         [ THE MEASURE OF SUE                                   ]
         [ 12.3 (giant)                   4 / 1.5 / 90          ]
         [ scale bars ------------------------------------------ ]

ANATOMY  [         B A L A N C E  (image inside letters)        ]
         [ -> zoom through, x-ray scan, caption                 ]

RELATIVES
         [ THE LINE NEVER   [#### image 6 ASCII ####]           ]
         [ ENDED            [#######################]           ]
```
Alignment: left aligned throughout; centered only for the Anatomy word.

## Principles
1. No composition twice. Every section changes scale, alignment or background.
2. Photography and flat color alternate like cuts in a film.
3. One peak (the bite). Everything before it is quieter.
4. Every image has its own reveal; the ASCII decode is saved for the first and last image.
5. Motion answers the story. If an animation cannot be justified in a sentence in BRIEF.md, it is cut.

## Review pass: what read as a default, and what changed
- **Label cards on every exhibit** (the previous build) read as a template kit. Removed: text now sits directly on the grid.
- **Alternating image left / text right** four times in a row. Replaced by seven distinct compositions.
- **Uppercase mono label above every heading.** Now only the catalogue line at the end of a chapter carries mono, and the hero has a single one.
- **Hero as a split layout.** Replaced by full bleed with real depth layers, which the reference's scale supports and the brief asked for.
- **White chapter** risked breaking the dark identity. Kept, but only once, for the data chapter, where daylight reads as "measured, factual" rather than decoration.
