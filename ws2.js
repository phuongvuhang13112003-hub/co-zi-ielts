// Extra Writing & Speaking material (original prompts in IELTS style)
(function () {
const T2 = [
// [level, type, title, prompt]
["B1","Opinion","Homework","Some people think homework should be banned in primary schools. Do you agree or disagree?"],
["B1","Opinion","School uniforms","Students should be required to wear school uniforms. To what extent do you agree or disagree?"],
["B1","Advantages/Disadvantages","Living in a big city","What are the advantages and disadvantages of living in a big city?"],
["B1","Opinion","Learning online","Online learning is better than learning in a classroom. Do you agree or disagree?"],
["B1","Problem/Solution","Plastic waste","Plastic waste is a growing problem in many countries. What problems does it cause, and what can be done about it?"],
["B1","Discussion","Team or individual sports","Some people believe children should play team sports, while others think individual sports are better. Discuss both views and give your opinion."],
["B1","Opinion","Fast food","Fast food is becoming more popular. Is this a positive or negative development?"],
["B1","Advantages/Disadvantages","Studying abroad","More and more students choose to study abroad. Do the advantages outweigh the disadvantages?"],
["B2","Agree/Disagree","Free university","University education should be free for everyone. To what extent do you agree or disagree?"],
["B2","Discussion","Roads or public transport","Some believe governments should spend money on roads, while others think public transport should be the priority. Discuss both views and give your opinion."],
["B2","Problem/Solution","Older people and exercise","Doctors recommend that older people exercise regularly, but many do not. Why is this, and what can be done to encourage them?"],
["B2","Agree/Disagree","Children and screens","Children who spend a lot of time on video games and TV are harming their mental health. To what extent do you agree or disagree?"],
["B2","Two-part question","Working abroad","Many people now move to another country for work. Why do they do this? Is it a positive or negative trend?"],
["B2","Advantages/Disadvantages","Online shopping","Online shopping is replacing traditional shops. Do the advantages outweigh the disadvantages?"],
["B2","Discussion","Arts funding","Some think governments should fund the arts, while others believe the money should go to healthcare and education. Discuss both views and give your opinion."],
["B2","Problem/Solution","Rural to urban migration","Many young people are leaving the countryside to live in cities. What problems does this cause, and how can they be solved?"],
["B2","Agree/Disagree","Celebrities as role models","Celebrities have too much influence on young people. To what extent do you agree or disagree?"],
["B2","Opinion","Zoos","Zoos are cruel and should be closed. To what extent do you agree or disagree?"],
["B2","Discussion","Exams vs continuous assessment","Some believe exams are the best way to assess students, while others prefer continuous assessment. Discuss both views."],
["B2","Problem/Solution","Obesity in children","Childhood obesity is increasing in many countries. What are the causes, and what solutions can you suggest?"],
["B2","Agree/Disagree","Advertising to children","Advertising aimed at children should be banned. To what extent do you agree or disagree?"],
["B2","Two-part question","Ageing population","In many countries the proportion of older people is increasing. What problems does this cause? How can societies prepare?"],
["B2","Advantages/Disadvantages","Gap year","Some students take a year off between school and university. What are the advantages and disadvantages?"],
["B2","Agree/Disagree","Space exploration","Governments spend too much money on space exploration. To what extent do you agree or disagree?"],
["B2","Discussion","Competition or cooperation","Some people think children should learn to compete, while others believe they should learn to cooperate. Discuss both views."],
["B2","Problem/Solution","Noise in cities","Noise pollution is a serious problem in modern cities. What causes it, and how can it be reduced?"],
["B2","Opinion","Mobile phones at school","Mobile phones should be banned in schools. Do you agree or disagree?"],
["B2","Agree/Disagree","Crime and punishment","Longer prison sentences are the best way to reduce crime. To what extent do you agree or disagree?"],
["B2","Advantages/Disadvantages","Tourism in remote areas","Tourists are increasingly visiting remote natural areas. Do the advantages outweigh the disadvantages?"],
["B2","Discussion","Parents or schools","Some people say parents should teach children to be good members of society; others say schools should. Discuss both views."],
["C1","Agree/Disagree","Technology and isolation","Modern technology has made people more isolated than ever. To what extent do you agree or disagree?"],
["C1","Two-part question","Fake news","Fake news is spreading rapidly online. Why is this happening, and what can be done to address it?"],
["C1","Discussion","Economic growth vs environment","Some argue economic growth is essential, while others believe it damages the environment. Discuss both views and give your opinion."],
["C1","Agree/Disagree","Universal basic income","Governments should pay every citizen a basic income regardless of whether they work. To what extent do you agree or disagree?"],
["C1","Problem/Solution","Housing costs","Housing in many cities is becoming unaffordable for young people. What are the causes, and what measures could solve this?"],
["C1","Agree/Disagree","Individual vs government action on climate","Individuals can do little to tackle climate change; only governments and companies can make a difference. To what extent do you agree or disagree?"],
["C1","Two-part question","Disappearing languages","Many minority languages are disappearing. Why is this happening? Should we try to preserve them?"],
["C1","Discussion","Genetic engineering","Some believe genetic engineering of humans should be allowed to prevent disease, while others think it is unethical. Discuss both views."],
["C1","Agree/Disagree","Happiness and wealth","Money is the most important factor in achieving happiness. To what extent do you agree or disagree?"],
["C1","Problem/Solution","Misuse of antibiotics","The overuse of antibiotics is creating drug-resistant bacteria. What are the causes, and how can the problem be addressed?"],
["C1","Advantages/Disadvantages","Artificial intelligence in healthcare","Artificial intelligence is increasingly used to diagnose illnesses. Do the advantages outweigh the disadvantages?"],
["C1","Agree/Disagree","Unpaid internships","Unpaid internships exploit young people and should be made illegal. To what extent do you agree or disagree?"],
["C1","Discussion","History in schools","Some think history is a waste of time for students, while others believe it is essential. Discuss both views."],
["C1","Two-part question","Overtourism","Some popular destinations now limit the number of tourists. Why is this happening? Is it a good idea?"],
["C1","Agree/Disagree","Surveillance cameras","Surveillance cameras in public places make society safer. To what extent do you agree or disagree?"],
["C1","Problem/Solution","Loneliness","Loneliness is becoming a serious problem, especially among older people. What are the causes and solutions?"],
["C1","Agree/Disagree","Fast fashion","Governments should tax clothing companies for the waste they produce. To what extent do you agree or disagree?"],
["C1","Discussion","Specialist or general knowledge","Some say it is better to have specialist knowledge of one subject, while others prefer broad general knowledge. Discuss both views."],
["C1","Two-part question","Remote work","Many people now work from home. How does this affect cities? Is this a positive development?"],
["C1","Agree/Disagree","Wildlife conservation funding","Protecting wild animals in their natural habitat is more important than keeping them in zoos. To what extent do you agree or disagree?"]
];
T2.forEach((t, i) => window.WRITING.push({ id: 'w2x' + i, task: 2, lvl: t[0], type: t[1], title: t[2], prompt: t[3] + ' Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.' }));
const T1 = [
["B2","Coffee and tea consumption (line)","The graph shows average daily cups of coffee and tea consumed per person in a country from 2000 to 2020.",{type:"line",unit:"",cats:["2000","2005","2010","2015","2020"],series:[["Coffee",[0.8,1.1,1.5,1.9,2.4]],["Tea",[2.6,2.4,2.1,1.9,1.7]]]}],
["B2","Transport to work (bar)","The chart shows how people travelled to work in a city in 2005 and 2025.",{type:"bar",unit:"%",cats:["Car","Bus","Motorbike","Bicycle","Walking"],series:[["2005",[20,15,45,12,8]],["2025",[32,22,30,6,10]]]}],
["B2","University graduates by field (table)","The table shows the number of university graduates (thousands) in four fields in 2010, 2015 and 2020.",{type:"table",unit:"",cats:["2010","2015","2020"],series:[["Business",[42,55,61]],["Engineering",[30,34,45]],["Medicine",[12,14,15]],["Arts",[25,21,18]]]}],
["B2","Recycling rates (bar)","The chart shows the percentage of household waste recycled in five countries in 2022.",{type:"bar",unit:"%",cats:["A","B","C","D","E"],series:[["Recycled",[62,48,35,22,10]]]}],
["C1","Electricity sources (line)","The graph shows the share of electricity generated from coal, gas and renewables in a country from 2000 to 2030 (projected).",{type:"line",unit:"%",cats:["2000","2010","2020","2030*"],series:[["Coal",[55,48,35,18]],["Gas",[30,32,30,27]],["Renewables",[5,10,25,50]]]}],
["B2","Making paper from recycled material (process)","The diagram shows how recycled paper is produced.",{type:"process",steps:["Used paper collected from homes and offices","Sorted by type and grade","Soaked in water and chemicals to make pulp","Ink removed (de-inking)","Pulp cleaned and bleached","Pressed and dried on heated rollers","Rolled into new paper and delivered"]}],
["C1","Life cycle of a frog (process)","The diagram shows the life cycle of a frog.",{type:"process",steps:["Adult frog lays eggs (spawn) in water","Eggs hatch into tadpoles after about 1–3 weeks","Tadpoles breathe through gills and grow back legs","Front legs develop; tail begins to shrink","Young frog (froglet) leaves the water","Adult frog after 12–16 weeks"]}],
["B2","Internet use by activity (table)","The table shows the percentage of internet users doing five online activities in 2015 and 2025.",{type:"table",unit:"%",cats:["2015","2025"],series:[["Social media",[60,85]],["Online shopping",[35,72]],["Video streaming",[40,80]],["Online banking",[25,65]],["E-learning",[10,38]]]}]
];
T1.forEach((t, i) => window.WRITING.push({ id: 'w1x' + i, task: 1, lvl: t[0], title: t[1], prompt: t[2] + ' Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.', chart: t[3] }));

const P1 = [
["Home","Do you live in a house or a flat?","What is your favourite room?","Would you like to change anything about your home?","Do you plan to live there for a long time?"],
["Neighbours","Do you know your neighbours?","How often do you talk to them?","Are neighbours important?","Have you ever helped a neighbour?"],
["Music","What kind of music do you like?","When do you usually listen to music?","Did you learn a musical instrument as a child?","Has your taste in music changed?"],
["Reading","Do you like reading?","What kind of books do you read?","Do you prefer paper books or e-books?","Did you read a lot as a child?"],
["Sport","Do you like sport?","What sport is popular in your country?","Did you do sport at school?","Do you prefer watching or playing sport?"],
["Shopping","Do you enjoy shopping?","Do you prefer shopping online or in shops?","What was the last thing you bought?","Do you think people buy too much?"],
["Travel","Do you like travelling?","Where did you go on your last holiday?","Do you prefer travelling alone or with others?","Where would you like to visit in the future?"],
["Mornings","Are you a morning person?","What do you usually do in the morning?","Do you have breakfast every day?","Is your morning routine different at weekends?"],
["Friends","Do you have many friends?","How do you usually spend time with friends?","Is it easy to make friends where you live?","Do you prefer a few close friends or many friends?"],
["Weather & seasons","What's your favourite season?","Do you prefer hot or cold weather?","Does the weather affect what you do?","Has the weather changed in your area?"],
["Photos","Do you like taking photos?","What do you usually take photos of?","Do you keep old photos?","Do you like being in photos?"],
["Transport","How do you usually travel around?","Is public transport good where you live?","Do you like cycling?","Would you like to have a car?"],
["Clothes","What kind of clothes do you like wearing?","Do you care about fashion?","Do you wear different clothes at weekends?","Where do you usually buy clothes?"],
["Cooking","Do you like cooking?","Who cooks in your family?","What dish can you cook well?","Do you think children should learn to cook?"],
["Social media","Which social media do you use?","How much time do you spend on it?","Do you post often?","Is social media good for teenagers?"],
["Holidays & festivals","What is the most important festival in your country?","What do you do during Tet?","Do you prefer traditional or modern celebrations?","Have festivals changed since you were a child?"],
["Plants & nature","Do you have any plants at home?","Do you like spending time in nature?","Is there a park near your home?","Did you play outside a lot as a child?"],
["Hobbies","What do you do in your free time?","Have you ever taken up a new hobby?","Do you prefer indoor or outdoor activities?","Is it important to have a hobby?"],
["Languages","How many languages can you speak?","Why are you learning English?","What is difficult about learning English?","Would you like to learn another language?"],
["Handwriting","Do you write by hand often?","Is your handwriting easy to read?","Do you think handwriting is still important?","Did you practise handwriting at school?"],
["Sleep","How many hours do you usually sleep?","Do you take naps?","What do you do if you can't sleep?","Do you think people get enough sleep?"],
["Daily routine","What is your daily routine like?","Which part of the day do you like most?","Do you have the same routine every day?","Would you like to change your routine?"],
["Hometown changes","Has your hometown changed recently?","What new buildings have appeared?","Do you like these changes?","Will young people stay in your hometown?"],
["Mobile apps","Which apps do you use most?","Do you pay for any apps?","Have you ever deleted an app?","What new app would you like to have?"]
];
P1.forEach(p => window.SPEAKING.p1.push({ t: p[0], q: p.slice(1) }));
const P2 = [
["Describe a person who taught you a new skill.",["who the person was","what skill they taught you","how they taught you","and explain how you felt about learning it"],["Is it better to learn from family or from professionals?","What skills should children learn at school?","Do older people find it hard to learn new technology?"]],
["Describe a book you read that you found useful.",["what the book was","when you read it","what it was about","and explain why it was useful"],["Do young people read less than before?","Are e-books better than paper books?","Should schools encourage reading for pleasure?"]],
["Describe a time you used technology to solve a problem.",["what the problem was","what technology you used","how it helped","and explain how you felt"],["Do people rely too much on technology?","How has AI changed daily life?","Will technology create more jobs or destroy them?"]],
["Describe a city you would like to visit.",["which city it is","how you know about it","what you would do there","and explain why you want to visit it"],["Why do people like visiting big cities?","What problems does tourism cause in cities?","Should historic buildings be protected?"]],
["Describe a time you were very busy.",["when it was","what you had to do","how you managed","and explain how you felt"],["Are people busier today than in the past?","How can people manage stress?","Should employers limit working hours?"]],
["Describe a park or garden you enjoy visiting.",["where it is","what it looks like","what you do there","and explain why you like it"],["Why are parks important in cities?","Should governments build more green spaces?","Do children spend enough time outdoors?"]],
["Describe an important decision you made.",["what the decision was","when you made it","how you made it","and explain why it was important"],["Do young people make decisions differently from older people?","Should parents decide for their children?","What decisions are hardest to make?"]],
["Describe a traditional festival in your country.",["what it is called","when it takes place","what people do","and explain why it is important"],["Are traditional festivals losing their meaning?","How do festivals help the economy?","Should children learn about traditions at school?"]],
["Describe a piece of good news you received.",["what the news was","when you heard it","how you heard it","and explain how you felt"],["Do people prefer good news or bad news?","How do people get news today?","Should newspapers report more positive stories?"]],
["Describe a time you helped someone.",["who you helped","what the situation was","how you helped","and explain how you felt"],["Why do people volunteer?","Are people less helpful than in the past?","Should schools require community service?"]],
["Describe a sports event you watched.",["what it was","where you watched it","who you watched it with","and explain why it was memorable"],["Why do people enjoy watching sport?","Are professional athletes paid too much?","Should sport be compulsory at school?"]],
["Describe a teacher you remember well.",["who the teacher was","what subject they taught","what they were like","and explain why you remember them"],["What makes a good teacher?","Will online lessons replace teachers?","Should teachers be paid more?"]],
["Describe a habit you want to develop.",["what the habit is","why you want to develop it","how you will develop it","and explain how it will help you"],["Why is it difficult to change habits?","Do parents influence children's habits?","What bad habits are common among young people?"]],
["Describe a place you visited that was very crowded.",["where it was","when you went","why it was crowded","and explain how you felt"],["Why do people like crowded places?","How can cities reduce overcrowding?","Will cities become more crowded in the future?"]],
["Describe a gift you gave someone.",["what the gift was","who you gave it to","why you chose it","and explain how the person felt"],["Is it better to give money or a gift?","Do people spend too much on gifts?","How has gift-giving changed?"]],
["Describe an advertisement you remember.",["what it was for","where you saw it","what it showed","and explain why you remember it"],["How does advertising influence people?","Should advertising aimed at children be banned?","Is online advertising more effective than TV advertising?"]],
["Describe a time you learned something from a mistake.",["what the mistake was","when it happened","what you learned","and explain how it changed you"],["Is it important to make mistakes?","How should parents respond to children's mistakes?","Do people learn more from success or failure?"]],
["Describe a building you think is beautiful.",["where it is","what it looks like","what it is used for","and explain why you think it is beautiful"],["Should old buildings be preserved or replaced?","What makes a city attractive?","Do modern buildings have character?"]],
["Describe a person who is good at their job.",["who the person is","what their job is","how you know them","and explain why they are good at it"],["What makes people successful at work?","Is job satisfaction more important than salary?","Will robots replace skilled workers?"]],
["Describe an environmental problem in your area.",["what the problem is","what causes it","how it affects people","and explain what could be done"],["Who is responsible for protecting the environment?","Can individuals make a difference?","Should polluters pay higher taxes?"]],
["Describe a film you enjoyed.",["what it was","when you watched it","what it was about","and explain why you enjoyed it"],["Do people prefer cinema or streaming?","Should films be censored?","Can films teach us about other cultures?"]],
["Describe a trip you took by public transport.",["where you went","what transport you used","what happened","and explain how you felt"],["How can public transport be improved?","Should public transport be free?","Will people stop using cars in the future?"]],
["Describe a goal you hope to achieve.",["what the goal is","why it is important","how you plan to achieve it","and explain how you will feel when you achieve it"],["Is it important to set goals?","Should children have long-term goals?","Why do some people give up on their goals?"]],
["Describe a time you spent with an older relative.",["who it was","what you did together","what you talked about","and explain what you learned"],["How can young and old people understand each other?","Should elderly people live with their families?","What can older people teach young people?"]],
["Describe an animal you find interesting.",["what animal it is","where you saw it","what it is like","and explain why you find it interesting"],["Why should we protect wild animals?","Are zoos good for animals?","Should people keep exotic pets?"]],
["Describe a skill you learned online.",["what the skill was","how you learned it","how long it took","and explain how useful it is"],["Is online learning effective?","What are the disadvantages of learning online?","Will universities move fully online?"]],
["Describe a time you had to wait for something.",["what you were waiting for","how long you waited","what you did while waiting","and explain how you felt"],["Are people more impatient today?","How does technology affect patience?","Should children be taught to wait?"]],
["Describe a meal you remember well.",["what you ate","where you had it","who you were with","and explain why you remember it"],["How has food culture changed?","Is fast food a problem?","Should schools teach cooking?"]],
["Describe a change you would like to make in your city.",["what the change is","why it is needed","how it could be done","and explain how it would help people"],["Who should decide how cities change?","What makes a city good to live in?","Should more money be spent on public spaces?"]],
["Describe a time you felt proud of yourself.",["when it was","what you did","who was with you","and explain why you felt proud"],["Should parents praise children often?","Is competition good for young people?","What achievements are most valued in your culture?"]],
["Describe a website or app you use often.",["what it is","what you use it for","how often you use it","and explain why you like it"],["Do apps make people lazy?","How can people protect their privacy online?","Should children's app use be limited?"]],
["Describe a quiet place you like to go.",["where it is","how often you go there","what you do there","and explain why you like it"],["Why do people need quiet places?","Are cities becoming too noisy?","How can people find peace in busy lives?"]],
["Describe a time you tried a new food.",["what the food was","where you tried it","what it tasted like","and explain whether you liked it"],["Are people more willing to try new foods today?","How does tourism affect local food?","Should traditional food be protected?"]],
["Describe a famous person you would like to meet.",["who the person is","how you know about them","what you would ask them","and explain why you want to meet them"],["Are celebrities good role models?","Why do people follow celebrities online?","Should famous people have privacy?"]]
];
P2.forEach(p => window.SPEAKING.p2.push({ t: p[0], b: p[1], p3: p[2] }));
// Build more mocks automatically from the bank
const byLv = l => window.READINGS.filter(r => r.lvl === l).map(r => r.id);
const pairs = [["r7","r11"],["r8","r12"],["r9","r13"],["r10","r14"],["r19","r15"],["r20","r16"],["r17","r23"],["r21","r24"],["r22","r25"],["r26","r27"],["r28","r29"],["r18","r30"]];
const lpairs = [["l5","l10"],["l6","l11"],["l7","l12"],["l8","l13"],["l9","l14"],["l5","l15"],["l6","l16"],["l12","l17"],["l13","l18"],["l14","l19"],["l15","l20"],["l16","l17"]];
const w1 = window.WRITING.filter(w => w.task === 1).map(w => w.id), w2 = window.WRITING.filter(w => w.task === 2 && w.id.startsWith('w2x')).map(w => w.id);
pairs.forEach((p, i) => { const lv = window.READINGS.find(r => r.id === p[1]).lvl; window.MOCKS.push({ id: 'm' + (i + 4), title: 'IELTS Mock ' + (i + 4), lvl: lv, L: lpairs[i], R: p, W: [w1[i % w1.length], w2[(i * 4 + 9) % w2.length]], S: { p1: 6 + i, p2: 6 + i } }); });
})();
