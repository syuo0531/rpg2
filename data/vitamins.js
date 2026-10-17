/* 元のビタミン一覧表から整理した13種類の学習用データ */
window.VITAMIN_DATA = [
  {
    id:'b1', name:'ビタミンB₁', alias:'チアミン', code:'B1', group:'water',
    role:'糖質代謝（ピルビン酸からアセチルCoAへの酸化的脱炭酸）',
    deficiency:'脚気、運動・知覚麻痺、最大酸素摂取量低下、エネルギー代謝障害',
    excess:null,
    roleShort:'糖質代謝・ピルビン酸の酸化的脱炭酸',
    deficiencyShort:'脚気・運動／知覚麻痺',
    roleHint:'ピルビン酸→アセチルCoA',
    deficiencyHint:'脚気',
    mnemonic:'「B₁＝糖質のエネルギー変換→脚気」'
  },
  {
    id:'b2', name:'ビタミンB₂', alias:'リボフラビン', code:'B2', group:'water',
    role:'ミトコンドリアでのエネルギー代謝、筋収縮・神経筋機能に関連',
    deficiency:'口角炎、口内炎、舌炎、咽頭炎、エネルギー代謝障害',
    excess:null,
    roleShort:'ミトコンドリアでのエネルギー代謝',
    deficiencyShort:'口角炎・口内炎・舌炎',
    roleHint:'ミトコンドリア・エネルギー代謝',
    deficiencyHint:'口角炎・舌炎',
    mnemonic:'「B₂＝口（口角・口内）に症状」'
  },
  {
    id:'b6', name:'ビタミンB₆', alias:'ピリドキシン', code:'B6', group:'water',
    role:'アミノ酸代謝、たんぱく質合成、神経伝達物質の産生',
    deficiency:'皮膚炎、貧血、痙攣、食欲不振、倦怠感、嘔吐',
    excess:'感覚神経障害',
    roleShort:'アミノ酸代謝・神経伝達物質の産生',
    deficiencyShort:'皮膚炎・貧血・痙攣',
    excessShort:'感覚神経障害',
    roleHint:'アミノ酸代謝・神経伝達物質',
    deficiencyHint:'皮膚炎・痙攣',
    mnemonic:'「B₆＝アミノ酸・神経／過剰は感覚神経障害」'
  },
  {
    id:'b12', name:'ビタミンB₁₂', alias:'シアノコバラミン', code:'B12', group:'water',
    role:'核酸代謝、造血機能、たんぱく質代謝',
    deficiency:'巨赤芽球性貧血（悪性貧血）',
    excess:null,
    roleShort:'核酸代謝・造血機能',
    deficiencyShort:'巨赤芽球性貧血（悪性貧血）',
    roleHint:'造血・核酸代謝',
    deficiencyHint:'悪性貧血',
    mnemonic:'「B₁₂＝血をつくる→巨赤芽球性貧血」'
  },
  {
    id:'b3', name:'ナイアシン', alias:'ビタミンB₃', code:'B3', group:'water',
    role:'解糖過程の補酵素、組織呼吸、脂肪合成、酸化還元反応',
    deficiency:'ペラグラ（皮膚炎）、下痢、頭痛、不安、幻覚',
    excess:'消化不良、下痢、便秘、肝機能低下、劇症肝炎',
    roleShort:'酸化還元反応・解糖系の補酵素',
    deficiencyShort:'ペラグラ（皮膚炎）・下痢',
    excessShort:'消化不良・肝機能低下',
    roleHint:'酸化還元・解糖過程の補酵素',
    deficiencyHint:'ペラグラ',
    mnemonic:'「ナイアシン＝ペラグラ」'
  },
  {
    id:'b5', name:'パントテン酸', alias:'ビタミンB₅', code:'B5', group:'water',
    role:'アセチルCoAの構成成分、糖質・脂質代謝',
    deficiency:'通常の食生活では欠乏症はみられない',
    excess:null,
    roleShort:'アセチルCoAの構成成分',
    deficiencyShort:'通常の食生活で欠乏はまれ',
    roleHint:'CoAの構成成分',
    deficiencyHint:null,
    mnemonic:'「パントテン酸＝CoAを構成」'
  },
  {
    id:'b9', name:'葉酸', alias:'ビタミンB₉', code:'B9', group:'water',
    role:'アミノ酸代謝、核酸合成',
    deficiency:'巨赤芽球性貧血',
    excess:'神経障害、発熱、蕁麻疹、紅斑',
    roleShort:'アミノ酸代謝・核酸合成',
    deficiencyShort:'巨赤芽球性貧血',
    excessShort:'神経障害・発熱・蕁麻疹',
    roleHint:'核酸合成',
    deficiencyHint:null,
    mnemonic:'「葉酸＝核酸合成→巨赤芽球性貧血」'
  },
  {
    id:'b7', name:'ビオチン', alias:'ビタミンB₇', code:'B7', group:'water',
    role:'二酸化炭素固定の補酵素、糖質・脂質代謝',
    deficiency:'通常の食生活では欠乏症はみられない',
    excess:null,
    roleShort:'二酸化炭素固定の補酵素',
    deficiencyShort:'通常の食生活で欠乏はまれ',
    roleHint:'二酸化炭素固定',
    deficiencyHint:null,
    mnemonic:'「ビオチン＝CO₂固定の補酵素」'
  },
  {
    id:'c', name:'ビタミンC', alias:'アスコルビン酸', code:'C', group:'water',
    role:'コラーゲン合成、抗酸化作用、カルニチン合成、非ヘム鉄の吸収に関与',
    deficiency:'壊血病、出血傾向、結合組織形成障害、筋力低下、倦怠感',
    excess:null,
    roleShort:'コラーゲン合成・抗酸化作用',
    deficiencyShort:'壊血病・出血傾向',
    roleHint:'コラーゲン合成・鉄吸収',
    deficiencyHint:'壊血病',
    mnemonic:'「C＝コラーゲン→壊血病」'
  },
  {
    id:'a', name:'ビタミンA', alias:'レチノール', code:'A', group:'fat',
    role:'明暗への順応、成長促進',
    deficiency:null,
    excess:'頭痛、頭蓋内圧上昇、皮膚の落屑、脱毛、筋肉痛、肝障害',
    roleShort:'明暗への順応・成長促進',
    excessShort:'頭痛・脱毛・肝障害',
    roleHint:'明暗への順応',
    deficiencyHint:null,
    mnemonic:'「A＝明暗への順応（目）」'
  },
  {
    id:'d', name:'ビタミンD', alias:'カルシフェロール', code:'D', group:'fat',
    role:'小腸と腎臓でのカルシウム・リンの吸収促進および骨形成',
    deficiency:'カルシウムなどの栄養不足とともに骨密度低下に関与',
    excess:'高カルシウム血症、腎障害、軟組織の石灰化',
    roleShort:'カルシウム・リン吸収促進・骨形成',
    deficiencyShort:'骨密度低下に関与',
    excessShort:'高カルシウム血症・腎障害',
    roleHint:'カルシウム・リン吸収',
    deficiencyHint:'骨密度低下',
    mnemonic:'「D＝骨・Ca吸収／過剰は高Ca血症」'
  },
  {
    id:'e', name:'ビタミンE', alias:'α-トコフェロール', code:'E', group:'fat',
    role:'抗酸化作用、細胞膜の保護、赤血球の溶血防止',
    deficiency:null,
    excess:'出血',
    roleShort:'抗酸化作用・細胞膜の保護',
    excessShort:'出血',
    roleHint:'抗酸化・細胞膜の保護',
    deficiencyHint:null,
    mnemonic:'「E＝抗酸化／過剰は出血」'
  },
  {
    id:'k', name:'ビタミンK', alias:'フィロキノン', code:'K', group:'fat',
    role:'血液凝固の活性化、骨形成の促進',
    deficiency:null,
    excess:null,
    roleShort:'血液凝固の活性化・骨形成',
    roleHint:'血液凝固',
    deficiencyHint:null,
    mnemonic:'「K＝血液凝固（Koagulation）」'
  }
];
