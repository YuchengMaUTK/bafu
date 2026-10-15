// Original bilingual fortune slips and folded-cookie illustration.
const COOKIE_ART_SVG="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"320\" height=\"300\" viewBox=\"0 0 320 300\"><g stroke=\"#9c6233\" stroke-width=\"2.5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M 37 193 L 88 100 Q 98 90 111 104 L 149 143 L 140 153 L 149 166 L 136 173 L 141 187 L 121 221 Z\" fill=\"#f4cb84\"/><path d=\"M 37 193 C 60 141 82 108 104 106 L 127 128 C 93 119 72 155 52 201 Z\" fill=\"#ddb06c\"/><path d=\"M 43 183 C 64 139 83 113 102 113 L 116 126\" fill=\"none\" stroke=\"#fff0c8\" stroke-width=\"2\"/><path d=\"M 52 191 C 74 147 91 132 120 133\" fill=\"none\" stroke=\"#a6733d\" stroke-width=\"2\"/><path d=\"M 149 143 L 140 153 L 149 166 L 136 173 L 141 187 L 121 221\" fill=\"none\" stroke=\"#b17c40\" stroke-width=\"4\"/></g><g stroke=\"#9c6233\" stroke-width=\"2.5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"><path d=\"M 178 136 L 222 96 Q 231 88 237 106 L 283 203 L 219 221 L 212 190 L 202 182 L 209 169 L 196 160 L 203 148 Z\" fill=\"#f4cb84\"/><path d=\"M 188 131 L 223 107 C 244 126 258 158 274 201 L 255 209 C 242 167 219 138 198 143 Z\" fill=\"#ddb06c\"/><path d=\"M 201 130 L 220 117 C 238 137 251 163 265 198\" fill=\"none\" stroke=\"#fff0c8\" stroke-width=\"2\"/><path d=\"M 201 144 C 222 151 240 180 248 205\" fill=\"none\" stroke=\"#a6733d\" stroke-width=\"2\"/><path d=\"M 178 136 L 203 148 L 196 160 L 209 169 L 202 182 L 212 190 L 219 221\" fill=\"none\" stroke=\"#b17c40\" stroke-width=\"4\"/></g><g fill=\"#e6b673\" stroke=\"#a46b36\" stroke-width=\"1\"><path d=\"M 157 184 L 164 179 L 169 187 L 162 191 Z\"/><path d=\"M 149 207 L 153 203 L 157 209 Z\"/></g><g class=\"cookie-front-paper\"><path d=\"M 37 231 L 273 225 L 278 267 L 44 274 Z\" fill=\"#fffdf5\" stroke=\"#bda98c\" stroke-width=\"1.5\"/><text x=\"160\" y=\"249\" text-anchor=\"middle\" font-family=\"Georgia,serif\" font-size=\"11\" letter-spacing=\"1\" fill=\"#8d6842\" transform=\"rotate(-2 160 249)\">YOUR LITTLE FORTUNE</text><path d=\"M 109 262 L 218 259\" stroke=\"#d3bda1\" stroke-width=\"1\"/></g></svg>";
const COOKIE_FORTUNES=[
  {
    "name": "幸运饼干",
    "quote": "A small beginning can open a great door.",
    "translation": "小小的开始，也能打开一扇大门。",
    "title": "小步开场",
    "reading": "把今天的起点做小一点，行动会比等待完美条件更容易。",
    "action": "为一件拖延的小事投入五分钟。"
  },
  {
    "name": "幸运饼干",
    "quote": "Good company makes an ordinary day golden.",
    "translation": "好的陪伴，能让普通的一天发光。",
    "title": "相伴好运",
    "reading": "留意今天可以分享的时刻，也许一次短短的问候就能带来连接。",
    "action": "向一个想念的人发一句真诚的问候。"
  },
  {
    "name": "幸运饼干",
    "quote": "The right question is a kind of good fortune.",
    "translation": "问对一个问题，也是一种好运。",
    "title": "好奇来访",
    "reading": "遇到不确定的事，先把问题问清楚，比急着猜答案更有帮助。",
    "action": "向一个可靠的人提出具体问题。"
  },
  {
    "name": "幸运饼干",
    "quote": "Your next bright idea may arrive on a walk.",
    "translation": "下一个好点子，也许就在散步路上。",
    "title": "灵感在路上",
    "reading": "给注意力一点松动的空间，新的想法可能从熟悉的日常里出现。",
    "action": "走一小段路，留意一个平时没注意的细节。"
  },
  {
    "name": "幸运饼干",
    "quote": "Leave room in your day for a pleasant surprise.",
    "translation": "给今天留一点位置，装下惊喜。",
    "title": "给惊喜留位",
    "reading": "安排不必填得毫无缝隙。空白可以留给休息、回应和临时的小快乐。",
    "action": "为今天留一个十分钟的空档。"
  },
  {
    "name": "幸运饼干",
    "quote": "What you nurture quietly will find its season.",
    "translation": "你安静照顾的事，会有自己的花期。",
    "title": "耐心开花",
    "reading": "持续的投入值得被看见，不必用别人的进度衡量自己的过程。",
    "action": "完成一个正在培养的小习惯。"
  },
  {
    "name": "幸运饼干",
    "quote": "A generous word can travel farther than you think.",
    "translation": "一句善意的话，可以走得比你想象的更远。",
    "title": "善意传递",
    "reading": "今天的连接也许从一次认真感谢、鼓励或清楚回应开始。",
    "action": "向一个帮过你的人表达具体感谢。"
  },
  {
    "name": "幸运饼干",
    "quote": "Today is a fine day to trust your own voice.",
    "translation": "今天，很适合相信自己的声音。",
    "title": "勇敢表达",
    "reading": "你的想法值得被听见。表达不要求赢得所有认同，先讲清楚自己的位置。",
    "action": "在一次沟通中说出真实的需求。"
  },
  {
    "name": "幸运饼干",
    "quote": "A change of route may reveal a better view.",
    "translation": "换一条路，也许会看到更好的风景。",
    "title": "转角有风景",
    "reading": "当原计划卡住，可以先变一变方法。调整路径不等于放弃目的。",
    "action": "为一个任务尝试一种不同的小办法。"
  },
  {
    "name": "幸运饼干",
    "quote": "Your most useful treasure may already be nearby.",
    "translation": "最有用的宝藏，可能已经在你身边。",
    "title": "珍惜已有",
    "reading": "看看现有的能力、工具和关系，今天也许不需要从零开始。",
    "action": "用一个已有资源推进一件小事。"
  },
  {
    "name": "幸运饼干",
    "quote": "Make time for the thing that makes you light up.",
    "translation": "给让你眼睛发亮的事，留一点时间。",
    "title": "热爱补给",
    "reading": "不必等所有待办都结束，才允许自己拥有一小段喜欢的时间。",
    "action": "为一件喜欢的事安排十五分钟。"
  },
  {
    "name": "幸运饼干",
    "quote": "One clear step is worth a pocketful of worry.",
    "translation": "一个清楚的步骤，胜过一口袋担心。",
    "title": "下一步就好",
    "reading": "把大问题暂时缩成下一步。具体的行动能帮助你获得更多现实信息。",
    "action": "写下并完成一个最小的下一步。"
  },
  {
    "name": "幸运饼干",
    "quote": "A little order can make space for a little joy.",
    "translation": "一点秩序，能为快乐腾出一点空间。",
    "title": "轻松整理",
    "reading": "整理不必变成大工程。让眼前的一处空间舒服一些，就能让今天轻一点。",
    "action": "整理桌面或包里的一个小角落。"
  },
  {
    "name": "幸运饼干",
    "quote": "Listen well, and a new possibility may appear.",
    "translation": "认真听一听，新的可能就会出现。",
    "title": "倾听有礼",
    "reading": "对话不只交换答案，也可以让彼此看见此前没注意过的需要。",
    "action": "在一次交谈中先听完对方的想法。"
  },
  {
    "name": "幸运饼干",
    "quote": "A finished little task deserves a little celebration.",
    "translation": "完成一件小事，也值得小小庆祝。",
    "title": "收下成就",
    "reading": "进步不需要总是巨大。一个收尾、一次兑现，同样值得被认真算进去。",
    "action": "完成一件拖延的小事，再给自己一点奖励。"
  },
  {
    "name": "幸运饼干",
    "quote": "Carry curiosity; it is lighter than certainty.",
    "translation": "带上好奇心，它比确定答案更轻。",
    "title": "轻装探索",
    "reading": "允许自己通过尝试了解世界。小而可控的探索，往往比反复预演更有意思。",
    "action": "做一个风险可控的两分钟小实验。"
  }
];
COOKIE_FORTUNES.forEach(cookie=>cookie.svg=COOKIE_ART_SVG);
function getCookie(date=currentDay){return COOKIE_FORTUNES[drawIndex('cookie',date)];}
function cookieDetails(date=currentDay,cookie=getCookie(date)){return `<div class="cookie-result">${loreImage(cookie,'cookie-face')}<span class="result-source">美式幸运饼干 · FORTUNE COOKIE</span><div class="fortune-slip"><span class="slip-label">YOUR LITTLE FORTUNE</span><blockquote lang="en">${cookie.quote}</blockquote><p>${cookie.translation}</p></div><h2>${cookie.title}</h2><p class="dialog-muted">${cookie.reading}</p><div class="action-tip"><strong>把这句话带进今天</strong>${cookie.action}</div><p class="lore-source">幸运饼干是美式中餐馆常见的餐后小仪式，折叠饼干里藏着一张签条。英文签条、中文翻译与解读为本站原创，非传统中国签文。<a href="https://en.wikipedia.org/wiki/Fortune_cookie" target="_blank" rel="noopener noreferrer">了解幸运饼干背景</a></p></div>`;}
function cookieRitualArt(){return `<div class="cookie-break cookie-opened"><svg xmlns="http://www.w3.org/2000/svg" width="320" height="300" viewBox="0 0 320 300"><g class="opened-half-left"><g stroke="#9c6233" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M 37 193 L 88 100 Q 98 90 111 104 L 149 143 L 140 153 L 149 166 L 136 173 L 141 187 L 121 221 Z" fill="#f4cb84"/><path d="M 37 193 C 60 141 82 108 104 106 L 127 128 C 93 119 72 155 52 201 Z" fill="#ddb06c"/><path d="M 43 183 C 64 139 83 113 102 113 L 116 126" fill="none" stroke="#fff0c8" stroke-width="2"/><path d="M 52 191 C 74 147 91 132 120 133" fill="none" stroke="#a6733d" stroke-width="2"/><path d="M 149 143 L 140 153 L 149 166 L 136 173 L 141 187 L 121 221" fill="none" stroke="#b17c40" stroke-width="4"/></g></g><g class="opened-half-right"><g stroke="#9c6233" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><path d="M 178 136 L 222 96 Q 231 88 237 106 L 283 203 L 219 221 L 212 190 L 202 182 L 209 169 L 196 160 L 203 148 Z" fill="#f4cb84"/><path d="M 188 131 L 223 107 C 244 126 258 158 274 201 L 255 209 C 242 167 219 138 198 143 Z" fill="#ddb06c"/><path d="M 201 130 L 220 117 C 238 137 251 163 265 198" fill="none" stroke="#fff0c8" stroke-width="2"/><path d="M 201 144 C 222 151 240 180 248 205" fill="none" stroke="#a6733d" stroke-width="2"/><path d="M 178 136 L 203 148 L 196 160 L 209 169 L 202 182 L 212 190 L 219 221" fill="none" stroke="#b17c40" stroke-width="4"/></g></g><g fill="#e6b673" stroke="#a46b36" stroke-width="1"><path d="M 157 184 L 164 179 L 169 187 L 162 191 Z"/><path d="M 149 207 L 153 203 L 157 209 Z"/></g><g class="cookie-front-paper"><path d="M 37 231 L 273 225 L 278 267 L 44 274 Z" fill="#fffdf5" stroke="#bda98c" stroke-width="1.5"/><text x="160" y="249" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="1" fill="#8d6842" transform="rotate(-2 160 249)">YOUR LITTLE FORTUNE</text><path d="M 109 262 L 218 259" stroke="#d3bda1" stroke-width="1"/></g></svg></div>`;}
