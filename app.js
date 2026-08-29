// ── Firebase ─────────────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArUjmk_oIaU8bTbQU8fEDfpdVm2cWQ-pQ",
  authDomain: "loid-mahjong-style.firebaseapp.com",
  projectId: "loid-mahjong-style",
  storageBucket: "loid-mahjong-style.firebasestorage.app",
  messagingSenderId: "35042337525",
  appId: "1:35042337525:web:82527e05ebca0834035bbc"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

function getSessionId() {
  let sid = sessionStorage.getItem('sid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('sid', sid);
  }
  return sid;
}

async function saveResult(typeName) {
  try {
    const ua = navigator.userAgent;
    const isMobile = /iPhone|Android|iPad/.test(ua);
    const isIOS = /iPhone|iPad/.test(ua);
    const isAndroid = /Android/.test(ua);
    const browserMatch = ua.match(/(Chrome|Safari|Firefox|Edge|OPR)\/[\d.]+/g) || [];
    await addDoc(collection(db, "results"), {
      type: typeName,
      ts: Date.now(),
      sid: getSessionId(),
      screen: `${screen.width}x${screen.height}`,
      lang: navigator.language || '',
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      referrer: document.referrer || '',
      device: isMobile ? (isIOS ? 'iOS' : isAndroid ? 'Android' : 'mobile') : 'desktop',
      browser: browserMatch.join(' ').slice(0, 80),
    });
  } catch(e) { console.warn("Firebase save failed", e); }
}

async function fetchStats() {
  try {
    const snap = await getDocs(collection(db, "results"));
    const counts = {};
    snap.forEach(doc => {
      const t = doc.data().type;
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  } catch(e) { return {}; }
}

// ── データ定義 ──────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    text: "リーチをかけるタイミングは？",
    choices: [
      { text: "テンパイしたらすぐリーチ！スピードが命", axes: { speed: 2, attack: 1 } },
      { text: "待ちや打点を確認してから慎重に判断する", axes: { logic: 2, defense: 1 } },
      { text: "高打点が見込めるときだけリーチする", axes: { highScore: 2, attack: 1 } },
      { text: "リーチせずダマで相手を惑わすことも多い", axes: { flexible: 2, attack: 1 } },
    ]
  },
  {
    text: "相手がリーチをかけてきた。あなたは？",
    choices: [
      { text: "自分もテンパイなら迷わず突っ張る", axes: { attack: 2, gamble: 1 } },
      { text: "現物と安牌で徹底的にベタオリする", axes: { defense: 3 } },
      { text: "打点や状況次第で攻守を使い分ける", axes: { flexible: 2, attack: 1 } },
      { text: "「なんか来そう」という直感で判断する", axes: { intuition: 2, gamble: 1 } },
    ]
  },
  {
    text: "役牌が重なった。次の行動は？",
    choices: [
      { text: "役牌だけで満足せず、上乗せを狙う", axes: { highScore: 2, attack: 1 } },
      { text: "さっさと鳴いてスピード重視で上がる", axes: { speed: 2, attack: 1 } },
      { text: "鳴くかどうか点数状況を計算してから決める", axes: { logic: 2, defense: 1 } },
      { text: "ピンフやタンヤオも見えているなら鳴かない", axes: { highScore: 2, speed: 1 } },
    ]
  },
  {
    text: "終盤（残り10巡程度）、まだテンパイしていない。",
    choices: [
      { text: "多少無理してでもテンパイを目指す", axes: { attack: 2, gamble: 1 } },
      { text: "ノーテン罰符より安全に守りに徹する", axes: { defense: 3 } },
      { text: "テンパイとオリ、どちらが得かを計算する", axes: { flexible: 2, logic: 1 } },
      { text: "流れを感じて直感で判断する", axes: { intuition: 2, gamble: 1 } },
    ]
  },
  {
    text: "どんな手役が好き？",
    choices: [
      { text: "タンヤオやピンフなど、早くて確実な役", axes: { speed: 3 } },
      { text: "ハネ満・役満！大物手こそ麻雀の醍醐味", axes: { highScore: 2, gamble: 1 } },
      { text: "チャンタや混一色など、個性的な役が好き", axes: { highScore: 1, intuition: 2 } },
      { text: "どんな役でも、状況に合った最善手を選ぶ", axes: { flexible: 2, speed: 1 } },
    ]
  },
  {
    text: "麻雀で一番大切だと思うことは？",
    choices: [
      { text: "とにかく振り込まないこと", axes: { defense: 3 } },
      { text: "攻め続けて主導権を握ること", axes: { attack: 3 } },
      { text: "損得を考えて、長い目で見てプラスになる選択を積み重ねること", axes: { logic: 3 } },
      { text: "大物手を和了すること", axes: { highScore: 3 } },
    ]
  },
  {
    text: "点数が大幅にリードされていて、自分が4着目（最下位）。どうする？",
    choices: [
      { text: "逆転を狙って高打点一本に絞る", axes: { highScore: 2, gamble: 2 } },
      { text: "少しずつ点数を稼いで地道に追いかける", axes: { speed: 2, defense: 1 } },
      { text: "流れや気配を感じて、ここだと思ったら大きく張る", axes: { intuition: 2, gamble: 1 } },
      { text: "まず2着以内を確保しつつ、チャンスを見て逆転を狙う", axes: { flexible: 2, defense: 1 } },
    ]
  },
  {
    text: "鳴きについてどう考えている？",
    choices: [
      { text: "積極的に鳴いてスピードを上げる派", axes: { speed: 2, attack: 1 } },
      { text: "なるべく鳴かず、手役を大きくしたい", axes: { highScore: 3 } },
      { text: "鳴きの損得を状況で判断する", axes: { logic: 2, defense: 1 } },
      { text: "相手の表情や流れ次第で鳴くかを決める", axes: { intuition: 3 } },
    ]
  },
  {
    text: "麻雀の「流れ」についてどう思う？",
    choices: [
      { text: "絶対にある！流れに乗ることが大事", axes: { intuition: 3, gamble: 1 } },
      { text: "ない。確率と期待値だけが正義", axes: { logic: 3 } },
      { text: "よくわからないけど気にするときもある", axes: { gamble: 1, speed: 1 } },
      { text: "流れより読みと観察が重要", axes: { logic: 2, attack: 1 } },
    ]
  },
  {
    text: "麻雀仲間にどう思われたい？",
    choices: [
      { text: "「あいつは怖い、振り込みたくない」", axes: { attack: 2, highScore: 1 } },
      { text: "「あいつには絶対振り込まない」", axes: { defense: 3 } },
      { text: "「読めない、何考えてるかわからない」", axes: { flexible: 3, intuition: 1 } },
      { text: "「毎局安定してる、崩れない」", axes: { speed: 2, defense: 2 } },
    ]
  },
  {
    text: "チャンス手（役満に見える配牌）を引いた。",
    choices: [
      { text: "一直線に狙う！チャンスは逃さない", axes: { highScore: 3, gamble: 2 } },
      { text: "狙いつつも受け入れを広く保つ", axes: { flexible: 3, logic: 1 } },
      { text: "確率を計算して現実的な手に変える", axes: { logic: 2, flexible: 1 } },
      { text: "「これは来る」という直感で決める", axes: { intuition: 3, gamble: 1 } },
    ]
  },
  {
    text: "理想の麻雀スタイルは？",
    choices: [
      { text: "圧倒的な攻撃力で相手を押しつぶしたい", axes: { attack: 2, highScore: 1, gamble: 1 } },
      { text: "絶対に振り込まない鉄壁の守りを誇りたい", axes: { defense: 3, logic: 1 } },
      { text: "数字と理論で最善の一打を打ち続けたい", axes: { logic: 3, flexible: 1 } },
      { text: "直感と感性で誰も真似できない麻雀をしたい", axes: { intuition: 3, gamble: 1 } },
    ]
  },
  // ── メンタル質問 ──
  {
    text: "放銃（振り込み）した直後、次の局のあなたは？",
    choices: [
      { text: "すぐ気持ちを切り替えて、何事もなかったように打つ", mental: { resilience: 3 } },
      { text: "「取り返すぞ」と逆に燃えてくる", mental: { passion: 3 } },
      { text: "少し引きずるが、数局で戻れる", mental: { adaptive: 2, tilt: 1 } },
      { text: "かなり引きずって、しばらく手が鈍る", mental: { tilt: 3 } },
    ]
  },
  {
    text: "大事な半荘の開局前、あなたの心境は？",
    choices: [
      { text: "特に何も感じない。いつも通り打つだけ", mental: { resilience: 3 } },
      { text: "緊張するが、それが集中力に変わる", mental: { pressure: 2, passion: 1 } },
      { text: "少しドキドキするが楽しみの方が大きい", mental: { adaptive: 2, passion: 1 } },
      { text: "緊張で手が震えることもある", mental: { pressure: 3 } },
    ]
  },
  {
    text: "ツかない時間が続いている。どう対処する？",
    choices: [
      { text: "「確率の偏りだ」と論理で割り切る", mental: { resilience: 2, tilt: -1 } },
      { text: "「ここを乗り越えれば来る」と信じて耐える", mental: { passion: 2, adaptive: 1 } },
      { text: "打ち方を少し変えてみる", mental: { adaptive: 3 } },
      { text: "気持ちが沈んで打牌が雑になってしまう", mental: { tilt: 3 } },
    ]
  },
  {
    text: "オーラス、逆転されてラス確定が見えてきた。心境は？",
    choices: [
      { text: "「負けは負け」と冷静に受け入れる", mental: { resilience: 3 } },
      { text: "最後まで諦めず逆転の一手を探す", mental: { passion: 3 } },
      { text: "悔しいが、次のゲームへの糧にしようと思う", mental: { adaptive: 3 } },
      { text: "悔しさで頭が真っ白になる", mental: { tilt: 2, pressure: 1 } },
    ]
  },
  {
    text: "相手にアガられ続けて全然アガれない。どう感じる？",
    choices: [
      { text: "「順番が来るまで待てばいい」と気にしない", mental: { resilience: 3 } },
      { text: "「絶対次は取る」と闘志が湧いてくる", mental: { passion: 3 } },
      { text: "焦りつつも冷静さを保とうと意識する", mental: { adaptive: 2, pressure: 1 } },
      { text: "じわじわと焦りが積み重なって判断が鈍る", mental: { tilt: 2, pressure: 2 } },
    ]
  },
  {
    text: "自分のミスで負けたとき、試合後の行動は？",
    choices: [
      { text: "すぐ頭から消して次の準備をする", mental: { resilience: 3 } },
      { text: "ミスを徹底的に振り返って次に活かす", mental: { adaptive: 3 } },
      { text: "悔しくて、しばらくミスを引きずる", mental: { tilt: 2, pressure: 1 } },
      { text: "悔しさをバネにもっと練習しようと燃える", mental: { passion: 3 } },
    ]
  },
];

// 12タイプ定義
const TYPES = [
  {
    id: "swordsman",
    name: "天衣無縫の剣士",
    icon: "⚔️",
    tagline: "打点こそすべて。跳満・役満を引き寄せる天才肌の攻撃者",
    axes: { attack: 5, highScore: 5, gamble: 4, speed: 2, defense: 1, logic: 2, intuition: 3, flexible: 2 },
    strength: "大物手を和了したときの爆発力は他の追随を許さない。一発逆転も夢じゃない",
    weakness: "高打点を追いすぎて和了率が下がることも。守りが薄い場面で失点することがある",
    advice: "「安牌を1〜2枚常に抱える」習慣をつけると、攻撃力を落とさず放銃率が激減する。また満貫以上を確信した局面だけ勝負し、それ以外は早和了に切り替える二段構えを意識すると、爆発力がさらに際立つ。",
    good: "stardust",
    bad: "guardian",
    players: [
      { name: "松ヶ瀬隆弥", note: "高打点を積極的に狙うMリーグ屈指の攻撃型雀士" },
      { name: "岡田紗佳", note: "大物手への嗅覚と大胆な仕掛けが魅力のモデル雀士" },
    ],
  },
  {
    id: "guardian",
    name: "鉄壁の守護者",
    icon: "🛡️",
    tagline: "振り込みゼロが誇り。守りの職人として静かに勝利を積み上げる",
    axes: { attack: 1, highScore: 2, gamble: 1, speed: 2, defense: 5, logic: 4, intuition: 2, flexible: 3 },
    strength: "失点が極めて少なく、長期戦では必ず上位に食い込む安定感",
    weakness: "攻めが弱いため、点棒が伸びにくい。大きなリードを作るのが苦手",
    advice: "「ラス回避最優先」から「2着を積極的に取りに行く」意識にシフトしてみよう。オーラスでトップとの点差が縮まる局面では、タンヤオ・ピンフで軽く攻める練習を。守備力はそのままに、攻撃の引き出しが1つ増えるだけで成績が大きく変わる。",
    good: "calculator",
    bad: "dreamer",
    players: [
      { name: "松本吉弘", note: "「ベタオリの美学」とも称される鉄壁の守備力を持つMリーガー" },
      { name: "二階堂瑠美", note: "丁寧な手組みと確実な守備で長期成績を安定させるプロ" },
    ],
  },
  {
    id: "stardust",
    name: "スピードスター",
    icon: "⚡",
    tagline: "最速テンパイ、最速和了。誰よりも早く、誰よりも多く上がる",
    axes: { attack: 4, highScore: 2, gamble: 2, speed: 5, defense: 2, logic: 3, intuition: 2, flexible: 4 },
    strength: "和了率が高く、積み上げが得意。場をコントロールする力がある",
    weakness: "打点が低い手が多くなり、満貫以上の大物手を出しにくい",
    advice: "スピードを維持しながら「ドラをもう1枚引き入れる余地がないか」を毎回1秒考える習慣を。タンヤオリーチにドラが乗るだけで打点は倍になる。また序盤にピンフ+タンヤオ+両面の形を目指すと、速度と打点を両立した理想形に近づく。",
    good: "swordsman",
    bad: "dreamer",
    players: [
      { name: "茅森早香", note: "スピード重視の手組みと高い和了率でMリーグトップクラスの安定感" },
      { name: "高宮まり", note: "軽快な仕掛けと早いテンパイで場の主導権を握るスタイル" },
    ],
  },
  {
    id: "calculator",
    name: "算盤侍",
    icon: "🧮",
    tagline: "すべてを数字で語る。期待値と確率を武器に冷静に最善手を打つ",
    axes: { attack: 1, highScore: 1, gamble: 1, speed: 2, defense: 3, logic: 6, intuition: 1, flexible: 2 },
    strength: "安定感抜群。ミスが少なく長期的に勝率が高い",
    weakness: "計算に時間がかかり、直感的な判断が必要な局面で後手に回ることがある",
    advice: "「計算が正しい」と「勝てる」は別物。相手の表情・打牌リズム・河の偏りなど、数字に現れない情報を意識的に観察してみよう。また、たまって「期待値マイナスでも勝負する局」を意図的に作ると、相手に読まれにくい予測不能な雀士に進化できる。",
    good: "guardian",
    bad: "wanderer",
    players: [
      { name: "小林剛", note: "「デジタル麻雀」の代名詞。データと確率で最善手を導くプロ雀士" },
      { name: "鈴木たろう", note: "論理的な手組みと緻密な押し引きでMリーグを長年牽引" },
    ],
  },
  {
    id: "dreamer",
    name: "孤高の夢想家",
    icon: "🌙",
    tagline: "役満か、捨てるか。大物手以外はいらない。夢を追い続けるロマン派",
    axes: { attack: 3, highScore: 5, gamble: 5, speed: 1, defense: 1, logic: 1, intuition: 4, flexible: 1 },
    strength: "役満を和了したときのインパクトは格別。一発逆転劇の主人公になれる",
    weakness: "和了率が極端に低く、振り込みリスクも高い。実戦での勝率は課題",
    advice: "夢を捨てる必要はない。ただ「役満へのルートが2つ以上見えない手牌は切り替える」基準を持つだけで放銃率が劇的に下がる。また国士・字一色など守備しながら狙える役満を得意にすると、ロマンと生存率を両立できる本物の夢想家になれる。",
    good: "wanderer",
    bad: "calculator",
    players: [
      { name: "近藤誠一", note: "「麻雀の詩人」と呼ばれる独自の美学を持つロマン派の第一人者" },
      { name: "前原雄大", note: "役満・跳満を積極的に狙うロマンあふれるスタイルの重鎮プロ" },
    ],
  },
  {
    id: "wanderer",
    name: "無敵の流れ師",
    icon: "🌊",
    tagline: "流れを感じ、波に乗る。直感と博打心で常識を超えた麻雀を打つ",
    axes: { attack: 3, highScore: 4, gamble: 5, speed: 2, defense: 1, logic: 1, intuition: 5, flexible: 2 },
    strength: "流れに乗ったときは誰も止められない爆発力を発揮する",
    weakness: "流れがないときは判断がぶれやすい。再現性が低い",
    advice: "「流れが悪い局」の判断基準を作ろう。例えば「2局連続で放銃したら次は守備モード」といったシンプルなルールを自分の中に持つだけで、流れを活かしながら沈みすぎを防げる。直感の精度を上げるには、和了後に「なぜその牌を切ったか」を振り返る習慣が効く。",
    good: "dreamer",
    bad: "calculator",
    players: [
      { name: "萩原聖人", note: "俳優業の傍ら「流れ」を重視するアナログ麻雀で知られる強豪" },
      { name: "藤田晋", note: "AbemaTV社長にしてMリーグ創設者。直感とメンタルの強さが武器" },
    ],
  },
  {
    id: "craftsman",
    name: "堅実なる職人",
    icon: "🔨",
    tagline: "地道に、着実に。小さな積み上げを繰り返して気づけばトップにいる",
    axes: { attack: 2, highScore: 2, gamble: 1, speed: 5, defense: 5, logic: 3, intuition: 1, flexible: 2 },
    strength: "安定して勝てる。大崩れしないので長期的な成績が良い",
    weakness: "華がなく、爆発力不足。逆転が必要な局面での打開が難しい",
    advice: "「この局だけは大物手を狙う」と決めた局を毎半荘1回作ってみよう。普段の堅実さがあるからこそ、1回の爆発が際立って相手の意表を突ける。また混一色やチャンタなど、手順が決まっていて迷いにくい高打点役を1つ得意にすると、逆転力が一気に上がる。",
    good: "calculator",
    bad: "dreamer",
    players: [
      { name: "瀬戸熊直樹", note: "「ミスをしない」ことで有名。着実な積み上げで多くのタイトルを獲得" },
      { name: "滝沢和典", note: "丁寧な手組みと安定したスコアでチームを支える職人気質のMリーガー" },
    ],
  },
  {
    id: "strategist",
    name: "千変万化の策士",
    icon: "🎭",
    tagline: "相手を読み、状況を読む。毎局変幻自在のスタイルで相手を翻弄する",
    axes: { attack: 3, highScore: 2, gamble: 2, speed: 3, defense: 3, logic: 2, intuition: 2, flexible: 6 },
    strength: "相手と状況への適応力が高い。誰が相手でも渡り合える器用さがある",
    weakness: "器用貧乏になることも。どの局面でも「最強」とは言い切れない",
    advice: "「この相手にはこの戦略」という引き出しをあと2〜3個増やそう。特定の相手に対して「攻撃特化モード」「完全守備モード」を意図的に切り替える練習をすると、器用さが本物の武器に変わる。また「今日は全局ダマテン縛り」など縛りプレイで個性を磨くのも効果的。",
    good: "guardian",
    bad: "wanderer",
    players: [
      { name: "多井隆晴", note: "状況判断と戦略の幅広さでMリーグMVP獲得。「最強位」の称号も持つ" },
      { name: "丸山奏子", note: "柔軟な対応力と読みの深さで相手を翻弄するMリーグの策士" },
    ],
  },
  {
    id: "ghost",
    name: "幽玄の読み師",
    icon: "👁️",
    tagline: "相手の手牌が見える。鋭い読みで危険牌を回避し、急所を突く",
    axes: { attack: 2, highScore: 2, gamble: 1, speed: 2, defense: 4, logic: 4, intuition: 5, flexible: 3 },
    strength: "相手の危険牌を察知する嗅覚が鋭く、ズバリ刺さる待ちを選べる",
    weakness: "読みへの依存が強く、読みが外れると立て直しに時間がかかる",
    advice: "読みが外れたときのリカバリー手順を事前に決めておこう。「読みミスと気づいたら即ベタオリ」のラインを明確にするだけで、外れたときのダメージが激減する。また読みの精度を上げるには捨て牌だけでなく「鳴きのタイミング」「打牌スピード」も記録する観察眼を磨こう。",
    good: "craftsman",
    bad: "dreamer",
    players: [
      { name: "魚谷侑未", note: "「牌の声が聞こえる」と称される鋭い読みと守備力を持つ女流エース" },
      { name: "園田賢", note: "相手の捨て牌と仕草から手牌を透視するような読みの深さで知られる" },
    ],
  },
  {
    id: "berserker",
    name: "猛火の突撃手",
    icon: "🔥",
    tagline: "攻めて、攻めて、攻め続ける。守りを知らない純粋な攻撃の化身",
    axes: { attack: 5, highScore: 3, gamble: 4, speed: 4, defense: 1, logic: 1, intuition: 3, flexible: 1 },
    strength: "手数の多さで圧倒する。相手を常に守りに回らせるプレッシャーがある",
    weakness: "守りがほぼゼロ。放銃率が高く、一局で大量失点するリスクが常にある",
    advice: "「攻める条件を1つ絞る」だけで爆発力を維持しながら放銃率が半減する。例えば「リャンメン待ち以外はリーチしない」など、待ちの形に基準を設けよう。攻撃本能はそのままに、そこに少しだけ選球眼が加わると、恐れられる雀士から手がつけられない雀士へ進化する。",
    good: "stardust",
    bad: "guardian",
    players: [
      { name: "佐々木寿人", note: "「攻撃は最大の防御」を体現するMリーグ屈指の攻撃型プロ" },
      { name: "黒沢咲", note: "果敢な攻めと高い放銃覚悟で知られる攻撃的なMリーガー" },
    ],
  },
  {
    id: "philosopher",
    name: "深淵の哲学者",
    icon: "🌌",
    tagline: "勝ち負けより、美しい麻雀を。一打一打に深い思想がある求道者",
    axes: { attack: 2, highScore: 4, gamble: 3, speed: 1, defense: 3, logic: 3, intuition: 4, flexible: 2 },
    strength: "「なぜその牌を切るか」を常に考え、独自の境地に達した打牌センスがある",
    weakness: "こだわりが強く、状況よりも「美学」を優先してしまうことがある",
    advice: "美学を持ちながら「結果もついてくる打ち方」を探してみよう。自分の美しい手順が同時に期待値的にも正しかった局を記録していくと、独自理論が洗練されていく。また美しさの定義を「形」から「相手を翻弄する一手」へ広げると、個性がさらに磨かれる。",
    good: "dreamer",
    bad: "stardust",
    players: [
      { name: "土田浩翔", note: "「牌効率よりも流れ・気」を重視する独自哲学を持つ麻雀界の思想家" },
      { name: "古川孝次", note: "長年にわたり麻雀の美学と向き合い続けるプロ連盟の重鎮雀士" },
    ],
  },
  {
    id: "trickster",
    name: "神出鬼没の奇術師",
    icon: "🃏",
    tagline: "相手の裏をかくのが快感。常識外れの選択で相手の読みを狂わせる",
    axes: { attack: 4, highScore: 2, gamble: 5, speed: 3, defense: 1, logic: 1, intuition: 3, flexible: 5 },
    strength: "予測不能な打ち方で相手を翻弄。心理戦に持ち込んで優位に立てる",
    weakness: "奇策が裏目に出ることも。一貫性がないため安定した成績を出しにくい",
    advice: "奇策には「本命」と「フェイク」の使い分けが大事。全局奇策では慣れられてしまう。2〜3局は普通に打って相手に「読めた」と思わせ、ここぞという局で奇策を繰り出すと効果が10倍になる。また「この奇策はなぜ有効か」を言語化できるようになると、直感が理論に変わる。",
    good: "wanderer",
    bad: "calculator",
    players: [
      { name: "内川幸太郎", note: "常識を超えた仕掛けと予測不能な選択でMリーグを沸かせるトリッキーな雀士" },
      { name: "仲林圭", note: "奇抜な鳴きと変則的な待ち選択で相手の読みを狂わせるMリーガー" },
    ],
  },
];

const TYPE_BY_ID = Object.fromEntries(TYPES.map(t => [t.id, t]));

// ── メンタルタイプ定義 ──────────────────────────────────────────────────────
const MENTAL_TYPES = [
  {
    id: "iron",
    icon: "🧱",
    name: "鉄壁メンタル",
    desc: "振り込んでも動じない。どんな局面も平常心を保てる安定型。長期戦で真価を発揮する。",
    axes: { resilience: 5, tilt: 0, pressure: 1, adaptive: 3, passion: 2 },
  },
  {
    id: "wave",
    icon: "🌊",
    name: "波乱万丈型",
    desc: "感情の波が激しく、乗ってるときは最強。ただし崩れると立て直しに時間がかかる。",
    axes: { resilience: 1, tilt: 4, pressure: 2, adaptive: 2, passion: 3 },
  },
  {
    id: "ice",
    icon: "🧊",
    name: "冷静分析型",
    desc: "感情より論理。ミスをデータとして処理し、淡々と立て直す。動揺が表に出にくい。",
    axes: { resilience: 3, tilt: 0, pressure: 1, adaptive: 4, passion: 1 },
  },
  {
    id: "fire",
    icon: "🔥",
    name: "闘志燃焼型",
    desc: "ピンチほど燃える。逆境で真価を発揮する逆転の申し子。劣勢こそが本番。",
    axes: { resilience: 2, tilt: 1, pressure: 2, adaptive: 2, passion: 5 },
  },
  {
    id: "reed",
    icon: "🌀",
    name: "揺れる葦型",
    desc: "繊細で周囲の影響を受けやすい。ただし環境適応力が高く、仲間の存在で力を発揮する。",
    axes: { resilience: 1, tilt: 3, pressure: 4, adaptive: 4, passion: 2 },
  },
];

function calcMentalScores(answers) {
  const s = { resilience: 0, tilt: 0, pressure: 0, adaptive: 0, passion: 0 };
  for (const a of answers) {
    if (!a.mental) continue;
    for (const [k, v] of Object.entries(a.mental)) {
      s[k] = (s[k] || 0) + v;
    }
  }
  return s;
}

function findMentalType(mentalScores) {
  let best = null, bestDist = Infinity;
  for (const mt of MENTAL_TYPES) {
    let dist = 0;
    for (const k of Object.keys(mentalScores)) {
      const diff = (mentalScores[k] || 0) - (mt.axes[k] || 0);
      dist += diff * diff;
    }
    if (dist < bestDist) { bestDist = dist; best = mt; }
  }
  return best;
}

const AXIS_LABELS = {
  attack: "攻撃",
  highScore: "高打点",
  gamble: "勝負",
  speed: "速度",
  defense: "守備",
  logic: "論理",
  intuition: "直感",
  flexible: "柔軟",
};

// ── スコア計算 ──────────────────────────────────────────────────────────────

function calcScores(answers) {
  const scores = { attack: 0, highScore: 0, gamble: 0, speed: 0, defense: 0, logic: 0, intuition: 0, flexible: 0 };
  for (const a of answers) {
    for (const [axis, val] of Object.entries(a)) {
      scores[axis] = (scores[axis] || 0) + val;
    }
  }
  return scores;
}

function rankTypes(scores) {
  return TYPES.map(type => {
    let dist = 0;
    for (const axis of Object.keys(scores)) {
      const diff = (scores[axis] || 0) - (type.axes[axis] || 0);
      dist += diff * diff;
    }
    return { type, dist };
  }).sort((a, b) => a.dist - b.dist);
}

function findType(scores) {
  return rankTypes(scores)[0].type;
}

// ── レーダーチャート ─────────────────────────────────────────────────────────

function drawRadar(canvas, scores) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2;
  const r = Math.min(W, H) * 0.38;
  const axes = Object.keys(AXIS_LABELS);
  const N = axes.length;
  const gold = '#c9a84c', goldLight = '#e8c96a';

  ctx.clearRect(0, 0, W, H);

  for (let g = 1; g <= 5; g++) {
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
      const rr = r * g / 5;
      const x = cx + rr * Math.cos(angle), y = cy + rr * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(58,48,32,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = 0; i < N; i++) {
    const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    ctx.strokeStyle = 'rgba(58,48,32,0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const maxVal = 10;
  ctx.beginPath();
  for (let i = 0; i < N; i++) {
    const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
    const val = Math.min(scores[axes[i]] || 0, maxVal) / maxVal;
    const x = cx + r * val * Math.cos(angle), y = cy + r * val * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(201,168,76,0.18)';
  ctx.fill();
  ctx.strokeStyle = gold;
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < N; i++) {
    const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
    const val = Math.min(scores[axes[i]] || 0, maxVal) / maxVal;
    const x = cx + r * val * Math.cos(angle), y = cy + r * val * Math.sin(angle);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = goldLight;
    ctx.fill();
  }

  ctx.fillStyle = '#9a8a78';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < N; i++) {
    const angle = (Math.PI * 2 * i / N) - Math.PI / 2;
    const lr = r + 22;
    const x = cx + lr * Math.cos(angle), y = cy + lr * Math.sin(angle);
    ctx.fillText(AXIS_LABELS[axes[i]], x, y);
  }
}

// ── タイプ一覧 ───────────────────────────────────────────────────────────────

function renderTypeList() {
  return `
    <div class="type-list-section">
      <div class="type-list-header">
        <div class="ornament">── ◆ ──</div>
        <h2 class="type-list-title">12タイプ 一覧</h2>
        <p class="type-list-sub">タップして詳細を見る</p>
      </div>
      <div class="type-list">
        ${TYPES.map(t => `
          <div class="type-card" onclick="toggleTypeDetail('${t.id}')">
            <div class="type-card-header">
              <span class="type-card-icon">${t.icon}</span>
              <div class="type-card-info">
                <div class="type-card-name">${t.name}</div>
                <div class="type-card-tagline">${t.tagline}</div>
              </div>
              <span class="type-card-arrow" id="arrow-${t.id}">▶</span>
            </div>
            <div class="type-card-detail" id="detail-${t.id}" style="display:none">
              <div class="type-detail-grid">
                <div class="type-detail-item strength">
                  <span class="detail-label">💪 強み</span>
                  <span class="detail-text">${t.strength}</span>
                </div>
                <div class="type-detail-item weakness">
                  <span class="detail-label">⚠️ 弱み</span>
                  <span class="detail-text">${t.weakness}</span>
                </div>
              </div>
              <div class="type-detail-advice">
                <span class="detail-label">🎯 さらに上を目指すには</span>
                <span class="detail-text">${t.advice}</span>
              </div>
              <div class="type-detail-compat">
                <span class="compat-tag good-tag">相性◎ ${TYPE_BY_ID[t.good].icon} ${TYPE_BY_ID[t.good].name}</span>
                <span class="compat-tag bad-tag">苦手 ${TYPE_BY_ID[t.bad].icon} ${TYPE_BY_ID[t.bad].name}</span>
              </div>
              <div class="type-detail-players">
                <span class="detail-label">🀄 似たスタイルのプロ</span>
                <div class="type-detail-players-list">
                  ${t.players.map(p => `<span class="type-player-chip" title="${p.note}">${p.name}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function toggleTypeDetail(id) {
  const detail = document.getElementById('detail-' + id);
  const arrow = document.getElementById('arrow-' + id);
  if (!detail) return;
  const open = detail.style.display !== 'none';
  detail.style.display = open ? 'none' : 'block';
  arrow.textContent = open ? '▶' : '▼';
  arrow.style.color = open ? '' : 'var(--gold)';
}

// ── レンダリング ─────────────────────────────────────────────────────────────

const app = document.getElementById('app');

async function renderStart() {
  app.innerHTML = `
    <div class="screen-start">
      <div class="hero-visual">
        <div class="hero-icon-ring">
          ${['⚔️','🛡️','⚡','🧮','🌙','🌊','🔨','🎭','👁️','🔥','🌌','🃏'].map((icon, i) => `
            <span class="icon-ring-item" style="--i:${i};--dur:${(2.2+i*0.31).toFixed(2)}s;--delay:${(i*-0.47).toFixed(2)}s;--amp:${(5+i%4*2)}px">
              ${icon}
              <span class="icon-sparkle"></span>
            </span>`).join('')}
        </div>
        <div class="hero-fan">
          <!-- 白（左端） -->
          <div class="fan-tile fan-tile--p1">
            <svg viewBox="0 0 56 76" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="tg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfaf3"/><stop offset="100%" stop-color="#f0e8d0"/></linearGradient></defs>
              <rect x="1.5" y="1.5" width="53" height="73" rx="5" fill="url(#tg1)" stroke="#c8b98a" stroke-width="1.2"/>
              <rect x="6" y="6" width="44" height="64" rx="3" fill="none" stroke="#d4c8a0" stroke-width="1.2"/>
            </svg>
          </div>
          <!-- 北 -->
          <div class="fan-tile fan-tile--p2">
            <svg viewBox="0 0 56 76" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="tg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfaf3"/><stop offset="100%" stop-color="#f0e8d0"/></linearGradient></defs>
              <rect x="1.5" y="1.5" width="53" height="73" rx="5" fill="url(#tg2)" stroke="#c8b98a" stroke-width="1.2"/>
              <rect x="4" y="4" width="48" height="68" rx="3.5" fill="none" stroke="#e2d4b0" stroke-width="0.7" opacity="0.5"/>
              <text x="28" y="52" text-anchor="middle" font-size="32" font-family="serif" fill="#1a3a6a" font-weight="bold">北</text>
            </svg>
          </div>
          <!-- 西 -->
          <div class="fan-tile fan-tile--p3">
            <svg viewBox="0 0 56 76" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="tg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfaf3"/><stop offset="100%" stop-color="#f0e8d0"/></linearGradient></defs>
              <rect x="1.5" y="1.5" width="53" height="73" rx="5" fill="url(#tg3)" stroke="#c8b98a" stroke-width="1.2"/>
              <rect x="4" y="4" width="48" height="68" rx="3.5" fill="none" stroke="#e2d4b0" stroke-width="0.7" opacity="0.5"/>
              <text x="28" y="52" text-anchor="middle" font-size="32" font-family="serif" fill="#1a3a6a" font-weight="bold">西</text>
            </svg>
          </div>
          <!-- 發 -->
          <div class="fan-tile fan-tile--p4">
            <svg viewBox="0 0 56 76" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="tg4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfaf3"/><stop offset="100%" stop-color="#f0e8d0"/></linearGradient></defs>
              <rect x="1.5" y="1.5" width="53" height="73" rx="5" fill="url(#tg4)" stroke="#c8b98a" stroke-width="1.2"/>
              <rect x="4" y="4" width="48" height="68" rx="3.5" fill="none" stroke="#e2d4b0" stroke-width="0.7" opacity="0.5"/>
              <text x="28" y="52" text-anchor="middle" font-size="34" font-family="serif" fill="#1a7a1a" font-weight="bold">發</text>
            </svg>
          </div>
          <!-- 中（センター） -->
          <div class="fan-tile fan-tile--center">
            <svg viewBox="0 0 56 76" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="tgC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#f5edd8"/></linearGradient>
                <filter id="glowC"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
              <rect x="1.5" y="1.5" width="53" height="73" rx="5" fill="url(#tgC)" stroke="#d4a84c" stroke-width="1.8"/>
              <rect x="4" y="4" width="48" height="68" rx="3.5" fill="none" stroke="#e8c96a" stroke-width="1" opacity="0.6"/>
              <text x="28" y="53" text-anchor="middle" font-size="36" font-family="serif" fill="#c0392b" font-weight="bold" filter="url(#glowC)">中</text>
            </svg>
          </div>
          <!-- 東 -->
          <div class="fan-tile fan-tile--p5">
            <svg viewBox="0 0 56 76" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="tg5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfaf3"/><stop offset="100%" stop-color="#f0e8d0"/></linearGradient></defs>
              <rect x="1.5" y="1.5" width="53" height="73" rx="5" fill="url(#tg5)" stroke="#c8b98a" stroke-width="1.2"/>
              <rect x="4" y="4" width="48" height="68" rx="3.5" fill="none" stroke="#e2d4b0" stroke-width="0.7" opacity="0.5"/>
              <text x="28" y="52" text-anchor="middle" font-size="32" font-family="serif" fill="#1a3a6a" font-weight="bold">東</text>
            </svg>
          </div>
          <!-- 南 -->
          <div class="fan-tile fan-tile--p6">
            <svg viewBox="0 0 56 76" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="tg6" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfaf3"/><stop offset="100%" stop-color="#f0e8d0"/></linearGradient></defs>
              <rect x="1.5" y="1.5" width="53" height="73" rx="5" fill="url(#tg6)" stroke="#c8b98a" stroke-width="1.2"/>
              <rect x="4" y="4" width="48" height="68" rx="3.5" fill="none" stroke="#e2d4b0" stroke-width="0.7" opacity="0.5"/>
              <text x="28" y="52" text-anchor="middle" font-size="32" font-family="serif" fill="#1a3a6a" font-weight="bold">南</text>
            </svg>
          </div>
          <!-- 白（右端） -->
          <div class="fan-tile fan-tile--p7">
            <svg viewBox="0 0 56 76" xmlns="http://www.w3.org/2000/svg">
              <defs><linearGradient id="tg7" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fdfaf3"/><stop offset="100%" stop-color="#f0e8d0"/></linearGradient></defs>
              <rect x="1.5" y="1.5" width="53" height="73" rx="5" fill="url(#tg7)" stroke="#c8b98a" stroke-width="1.2"/>
              <rect x="6" y="6" width="44" height="64" rx="3" fill="none" stroke="#d4c8a0" stroke-width="1.2"/>
            </svg>
          </div>
        </div>
        <div class="hero-floor-glow"></div>
      </div>
      <div class="ornament">── ◆ ──</div>
      <h1><span class="h1-sub">ロイド式</span><br>麻雀スタイル診断</h1>
      <p>自分の麻雀スタイル、意外と知らないもの。<br>12問でチェックして、強くなるヒントまでもらっちゃおう🀄</p>
      <button class="btn-start" onclick="startQuiz()">診断スタート</button>
      ${(() => {
        try {
          const last = JSON.parse(localStorage.getItem('lastResult') || 'null');
          if (!last || !TYPE_BY_ID[last.typeId]) return '';
          const t = TYPE_BY_ID[last.typeId];
          return `<button class="btn-last-result" onclick="showLastResult()">${t.icon} 前回の結果を見る <span class="btn-last-name">${t.name}</span></button>`;
        } catch(e) { return ''; }
      })()}
      <div class="ornament">── ◆ ──</div>
    </div>
    <div id="stats-section" class="stats-section">
      <div class="stats-loading">統計を読み込み中…</div>
    </div>
    ${renderTypeList()}
    <div class="site-footer">
      <div class="footer-version">Version 1.1 · Created on 2026/8/29 by ロイド<br>修正内容：診断ロジックの偏りを修正</div>
    </div>
  `;

  // 統計を非同期で読み込んで更新
  fetchStats().then(counts => {
    const el = document.getElementById('stats-section');
    if (!el) return;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) { el.innerHTML = ''; return; }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    el.innerHTML = `
      <div class="stats-title">みんなの診断結果ランキング</div>
      <div class="stats-total">これまで ${total} 人が診断</div>
      <div class="stats-bars">
        ${sorted.map(([id, cnt], i) => {
          const t = TYPE_BY_ID[id];
          if (!t) return '';
          const pct = Math.round(cnt / total * 100);
          return `<div class="stats-row">
            <span class="stats-rank">${i + 1}</span>
            <span class="stats-icon">${t.icon}</span>
            <span class="stats-name">${t.name}</span>
            <div class="stats-bar-bg"><div class="stats-bar-fill" style="width:${pct}%"></div></div>
            <span class="stats-pct">${pct}%</span>
          </div>`;
        }).join('')}
      </div>
    `;
  });
}

let currentQ = 0;
let answers = [];

function shareToX(typeName, typeId) {
  const url = 'https://loid1017.github.io/mahjong-style/';
  const text = `麻雀スタイル診断をやってみました！\n私のタイプは「${typeName}」でした🀄\n#麻雀 #麻雀好きと繋がりたい #麻雀スタイル診断`;
  window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(url), '_blank');
}

function showLastResult() {
  try {
    const last = JSON.parse(localStorage.getItem('lastResult') || 'null');
    if (!last || !TYPE_BY_ID[last.typeId]) return;
    const mentalType = last.mentalTypeId ? MENTAL_TYPES.find(m => m.id === last.mentalTypeId) : null;
    renderResult(TYPE_BY_ID[last.typeId], last.scores, mentalType);
  } catch(e) {}
}

function startQuiz() {
  currentQ = 0;
  answers = [];
  window.scrollTo(0, 0);
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const pct = (currentQ / QUESTIONS.length) * 100;
  app.innerHTML = `
    <div class="screen-quiz">
      <div class="quiz-top">
        <div class="progress-label">Q${currentQ + 1} / ${QUESTIONS.length}</div>
        ${currentQ > 0 ? `<button class="btn-back" onclick="goBack()">◀ 前の質問</button>` : '<span></span>'}
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" style="width:${pct}%"></div>
      </div>
      <div class="question-card">
        <div class="question-num">QUESTION ${currentQ + 1}</div>
        <div class="question-text">${q.text}</div>
      </div>
      <div class="choices">
        ${q.choices.map((c, i) => `
          <button class="choice-btn" onclick="selectChoice(${i})">
            <span class="choice-label">${['A','B','C','D'][i]}</span>${c.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function goBack() {
  if (currentQ > 0) {
    currentQ--;
    answers.pop();
    renderQuestion();
  }
}

function selectChoice(idx) {
  const axes = QUESTIONS[currentQ].choices[idx].axes;
  answers.push(axes);

  const btns = document.querySelectorAll('.choice-btn');
  btns[idx].classList.add('selected');

  setTimeout(() => {
    currentQ++;
    if (currentQ < QUESTIONS.length) {
      renderQuestion();
    } else {
      showLoading();
    }
  }, 300);
}

function showLoading() {
  app.innerHTML = `
    <div class="screen-loading">
      <div class="tiles-spin">
        <span class="tile-spin">🀇</span>
        <span class="tile-spin">🀙</span>
        <span class="tile-spin">🀀</span>
      </div>
      <p>あなたのスタイルを分析中…</p>
    </div>
  `;
  setTimeout(() => {
    const scores = calcScores(answers);
    const ranked = rankTypes(scores);
    const type = ranked[0].type;
    const mentalScores = calcMentalScores(answers);
    const mentalType = findMentalType(mentalScores);
    renderResult(type, scores, mentalType, ranked);
  }, 1800);
}

async function renderResult(type, scores, mentalType, ranked) {
  if (!ranked) ranked = rankTypes(scores);
  saveResult(type.id);
  try {
    localStorage.setItem('lastResult', JSON.stringify({ typeId: type.id, scores, mentalTypeId: mentalType?.id }));
  } catch(e) {};
  const goodType = TYPE_BY_ID[type.good];
  const badType = TYPE_BY_ID[type.bad];
  const axes = Object.keys(AXIS_LABELS);
  const maxVal = 10;

  app.innerHTML = `
    <div class="screen-result">
      <div class="result-header">
        <div class="result-label">あなたのスタイルは</div>
        <div class="result-icon">${type.icon}</div>
        <div class="result-name">${type.name}</div>
        <div class="result-tagline">${type.tagline}</div>
      </div>

      <div class="radar-wrap">
        <div class="radar-title">スタイル分析チャート</div>
        <canvas id="radarCanvas" width="300" height="300"></canvas>
        <div class="axis-legend">
          ${axes.map(a => `
            <div class="axis-row">
              <span class="axis-label">${AXIS_LABELS[a]}</span>
              <div class="axis-bar-bg">
                <div class="axis-bar-fill" style="width:${Math.min(scores[a]||0, maxVal)/maxVal*100}%"></div>
              </div>
              <span class="axis-val">${Math.min(scores[a]||0, maxVal)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="sw-grid">
        <div class="sw-card strength">
          <h3>💪 強み</h3>
          <p>${type.strength}</p>
        </div>
        <div class="sw-card weakness">
          <h3>⚠️ 弱み</h3>
          <p>${type.weakness}</p>
        </div>
      </div>

      <div class="advice-card">
        <h3>🎯 さらに上を目指すには</h3>
        <p>${type.advice}</p>
      </div>

      <div class="compat-card">
        <h3>🤝 相性</h3>
        <div class="compat-row">
          <div class="compat-item good">
            <div class="icon">${goodType.icon}</div>
            <div class="name">${goodType.name}</div>
            <div class="tag">相性が良い</div>
          </div>
          <div class="compat-item bad">
            <div class="icon">${badType.icon}</div>
            <div class="name">${badType.name}</div>
            <div class="tag">苦手なタイプ</div>
          </div>
        </div>
      </div>

      ${mentalType ? `
      <div class="mental-card">
        <div class="mental-card-label">🧠 メンタルタイプ診断</div>
        <div class="mental-card-main">
          <span class="mental-icon">${mentalType.icon}</span>
          <span class="mental-name">${mentalType.name}</span>
        </div>
        <div class="mental-desc">${mentalType.desc}</div>
      </div>` : ''}

      <div class="players-card">
        <h3>🀄 似たスタイルのプロ雀士</h3>
        <div class="players-list">
          ${type.players.map(p => `
            <div class="player-item">
              <span class="player-name">${p.name}</span>
              <span class="player-note">${p.note}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="ranking-card">
        <div class="ranking-title">📊 あなたのタイプ適合ランキング</div>
        <div class="ranking-list">
          ${ranked.map((r, i) => {
            const maxDist = ranked[ranked.length - 1].dist || 1;
            const pct = Math.round((1 - r.dist / (maxDist + 1)) * 100);
            return `
            <div class="ranking-item${i === 0 ? ' ranking-top' : ''}">
              <span class="ranking-num">${i + 1}</span>
              <span class="ranking-icon">${r.type.icon}</span>
              <span class="ranking-name">${r.type.name}</span>
              <div class="ranking-bar-wrap">
                <div class="ranking-bar-fill" style="width:${pct}%"></div>
              </div>
              <span class="ranking-pct">${pct}%</span>
            </div>`;
          }).join('')}
        </div>
      </div>

      <button class="btn-share-x" onclick="shareToX('${type.name}', '${type.id}')">𝕏 結果をポストする</button>
      <button class="btn-retry" onclick="renderStart()">もう一度診断する</button>
    </div>
  `;

  requestAnimationFrame(() => {
    const canvas = document.getElementById('radarCanvas');
    if (canvas) drawRadar(canvas, scores);
  });
}

// ── テーマ切り替え ────────────────────────────────────────────────────────────
function initThemeSwitcher() {
  if (document.querySelector('.theme-switcher')) return;
  const themes = [
    { id: 'default',  label: '和' },
    { id: 'forest',   label: 'B' },
    { id: 'offwhite', label: 'C' },
    { id: 'sky',      label: 'D' },
  ];
  const saved = localStorage.getItem('theme') || 'default';
  if (saved !== 'default') document.documentElement.setAttribute('data-theme', saved);

  const wrap = document.createElement('div');
  wrap.className = 'theme-switcher';
  themes.forEach(t => {
    const btn = document.createElement('button');
    btn.className = `theme-btn theme-btn--${t.id}${saved === t.id ? ' active' : ''}`;
    btn.title = t.label;
    btn.onclick = () => {
      if (t.id === 'default') document.documentElement.removeAttribute('data-theme');
      else document.documentElement.setAttribute('data-theme', t.id);
      localStorage.setItem('theme', t.id);
      wrap.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
    wrap.appendChild(btn);
  });
  document.body.appendChild(wrap);
}

// ── 初期化 ──────────────────────────────────────────────────────────────────
window.startQuiz = startQuiz;
window.showLastResult = showLastResult;
window.shareToX = shareToX;
window.goBack = goBack;
window.renderStart = renderStart;
window.selectChoice = selectChoice;
window.toggleTypeDetail = toggleTypeDetail;
renderStart();
document.addEventListener('DOMContentLoaded', initThemeSwitcher);
// DOMがすでに読み込み済みの場合にも対応
if (document.readyState !== 'loading') initThemeSwitcher();
