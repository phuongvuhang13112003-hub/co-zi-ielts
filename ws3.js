// More speaking, paraphrase, writing and mock tests (original practice material)
[
["Weather","What's the weather like where you live?","Do you prefer hot or cold weather?","Does the weather affect your mood?","Has the weather in your area changed in recent years?"],
["Plants & trees","Do you have any plants at home?","Are there many trees in your neighbourhood?","Did you plant anything when you were a child?","Why do people like having plants indoors?"],
["Animals","What's your favourite animal?","Did you have a pet as a child?","Are there any animals that are special in your country?","Would you like to work with animals?"],
["Rivers & lakes","Is there a river or lake near your home?","Do you enjoy spending time near water?","Did you swim in rivers when you were young?","Are rivers in your country clean?"],
["Recycling","Do you recycle at home?","Is recycling common in your city?","What things are difficult to recycle?","Should recycling be compulsory?"],
["Hometown","Where is your hometown?","What do you like most about it?","How has it changed since you were a child?","Would you like to live there in the future?"],
["Festivals","What is the most important festival in your country?","How do you usually celebrate Tết?","Do you prefer traditional or modern festivals?","Have festivals changed in recent years?"],
["Science","Did you like science at school?","Which science subject interests you most?","Do you watch science programmes?","How can science be made more interesting for children?"],
["Museums","Do you like visiting museums?","When was the last time you went to one?","Are museums popular in your country?","Should museums be free?"],
["Time management","How do you organise your time?","Do you use a planner or an app?","Are you usually on time?","What do you do when you have too much to do?"],
["Songs","Do you sing?","What songs did you like as a child?","Do you prefer songs in English or Vietnamese?","Can songs help people learn a language?"],
["Stories","Did your parents tell you stories?","What kind of stories do you like?","Do you prefer reading stories or watching films?","Do children today read fewer stories?"],
["Walking","Do you walk a lot?","Where do you like to walk?","Is your city good for walking?","Did you walk to school when you were a child?"],
["Hobbies","What do you do in your free time?","Did you have the same hobbies as a child?","Is there a hobby you'd like to try?","Do you think hobbies should be useful?"],
["Online learning","Have you ever taken an online course?","What are the advantages of studying online?","Do you find it easy to concentrate online?","Will online learning replace classrooms?"]
].forEach(p => window.SPEAKING.p1.push({ t: p[0], q: p.slice(1) }));

[
["Describe a natural place you visited that impressed you.",["where it was","when you went there","what you saw","and explain why it impressed you"],["Why do people enjoy natural places?","How can tourism harm natural areas?","Should some natural areas be closed to visitors?"]],
["Describe a wild animal you find interesting.",["what the animal is","where it lives","how you learned about it","and explain why you find it interesting"],["Why are some animals endangered?","Should zoos exist?","Who should pay for wildlife conservation?"]],
["Describe an environmental problem in your area.",["what the problem is","what causes it","how it affects people","and explain what could be done about it"],["Is the government or the individual more responsible for the environment?","Are young people more environmentally aware than older people?","Can technology solve environmental problems?"]],
["Describe a project you worked on with other people.",["what the project was","who you worked with","what you did","and explain how you felt about the result"],["What makes a good team member?","Is teamwork more important at school or at work?","Do people work better alone or in groups?"]],
["Describe a song that has special meaning for you.",["what the song is","when you first heard it","what it is about","and explain why it is meaningful to you"],["Why do people like listening to music?","Should children learn music at school?","How has technology changed the way we listen to music?"]],
["Describe a story or fable you heard as a child.",["what the story was","who told it to you","what happened in it","and explain what lesson it taught"],["Why do parents tell children stories?","Are traditional stories still relevant today?","Do films have the same value as books for children?"]],
["Describe a historical place you have visited.",["where it is","when you visited it","what you learned there","and explain how you felt about it"],["Why is it important to preserve historical buildings?","Should historic sites charge entrance fees?","How can young people be encouraged to learn history?"]],
["Describe a person who cares about nature.",["who the person is","how you know them","what they do","and explain why you admire them"],["Do celebrities influence people's attitudes to the environment?","What can schools do to teach environmental responsibility?","Is it expensive to live a green lifestyle?"]],
["Describe a time you learned something new outdoors.",["what you learned","where you were","who taught you","and explain why it was memorable"],["Do children spend enough time outdoors?","Is outdoor learning better than classroom learning?","Why are many people afraid of the outdoors?"]],
["Describe a scientific discovery that interests you.",["what the discovery is","who made it","how you learned about it","and explain why it interests you"],["Should governments fund scientific research?","Is science taught well in schools?","Can science solve all problems?"]],
["Describe a festival you enjoy.",["what the festival is","when it takes place","what people do","and explain why you enjoy it"],["Why are festivals important?","Have festivals become too commercial?","Should traditional festivals be modernised?"]],
["Describe a book that you would recommend to a friend.",["what the book is","what it is about","why you read it","and explain why you would recommend it"],["Do people read less than in the past?","What are the benefits of reading fiction?","Should classics be taught in schools?"]],
["Describe a goal you hope to achieve in the next few years.",["what the goal is","why you chose it","what you are doing to achieve it","and explain how you will feel when you achieve it"],["Is it important to set goals?","Do young people have realistic goals?","Should parents set goals for their children?"]],
["Describe a time you had to make a difficult decision.",["what the decision was","when you made it","what you chose","and explain why it was difficult"],["Do people make better decisions alone or with advice?","Should young people make their own decisions?","How does social media influence decisions?"]],
["Describe an interesting talk or lecture you attended.",["what the topic was","who gave it","what you learned","and explain why it was interesting"],["Are lectures an effective way to learn?","How can speakers keep the audience's attention?","Will online talks replace face-to-face events?"]],
["Describe a place in your country you would recommend to foreign visitors.",["where it is","how you know about it","what visitors can do there","and explain why you would recommend it"],["What attracts tourists to your country?","How does tourism affect local people?","Should tourists learn about local customs before travelling?"]],
["Describe a time you saved energy or water.",["what you did","when and where it was","why you did it","and explain how you felt about it"],["Why do people waste energy?","Should energy be more expensive to reduce consumption?","What can governments do to promote renewable energy?"]],
["Describe a piece of advice you received that helped you.",["what the advice was","who gave it","when you received it","and explain how it helped you"],["Do young people listen to advice from older people?","Is it better to get advice from friends or professionals?","Is online advice reliable?"]],
["Describe an exam you prepared for.",["what the exam was","how you prepared","how you felt before it","and explain what the result was"],["Are exams the best way to assess students?","Do students today face more pressure than before?","Should schools reduce the number of exams?"]],
["Describe a garden or park you like.",["where it is","what it looks like","what people do there","and explain why you like it"],["Why are green spaces important in cities?","Should new buildings include green areas?","Do people use parks less than in the past?"]]
].forEach(p => window.SPEAKING.p2.push({ t: p[0], b: p[1], p3: p[2] }));

window.PARAPHRASE.push(
["Pollution is getting worse.","Pollution levels are rising / deteriorating."],["Animals are disappearing.","Many species are facing extinction / are in decline."],
["We cut down too many trees.","Deforestation is occurring at an alarming rate."],["The weather is becoming more extreme.","Extreme weather events are becoming more frequent and intense."],
["People should use less energy.","Individuals ought to reduce their energy consumption."],["Cars produce a lot of smoke.","Vehicles are a major source of emissions."],
["This is a big problem.","This is a pressing / serious issue."],["Many people agree that…","There is a broad consensus that…"],
["Some people disagree.","This view is not universally shared."],["It costs a lot of money.","It is prohibitively expensive / It entails considerable expense."],
["The government should do something.","Authorities should take decisive action."],["This has good and bad points.","This has both merits and drawbacks."],
["Young people","The younger generation / adolescents"],["Old people","The elderly / senior citizens"],
["Very important","Crucial / vital / of paramount importance"],["Because of","Owing to / as a result of / due to"],
["Help the economy","Boost / stimulate economic growth"],["More and more","An increasing number of / a growing proportion of"],
["In my opinion","From my perspective / I would argue that"],["Protect nature","Conserve natural habitats / safeguard biodiversity"]
);

[
["B2","Opinion","Wildlife protection","Some people believe that it is pointless to spend money protecting endangered animals when there are many human problems to solve. To what extent do you agree or disagree?"],
["B2","Discussion","Plastic","Some people think that plastic bags should be banned completely, while others believe this is unnecessary. Discuss both views and give your own opinion."],
["C1","Problem-solution","Urban heat","Many cities are becoming hotter because of climate change and urban development. What problems does this cause, and what measures could be taken?"],
["B2","Advantages-disadvantages","Eco-tourism","Eco-tourism is becoming increasingly popular. Do the advantages of this type of tourism outweigh the disadvantages?"],
["C1","Opinion","Individual vs government","Some argue that individuals can do little to protect the environment and that only governments and large companies can make a difference. To what extent do you agree or disagree?"],
["B2","Two-part","Reading classics","Fewer young people read classic literature today. Why is this the case? Is it a positive or negative development?"],
["B2","Discussion","Music education","Some people think music should be a compulsory subject at school, while others think it is a waste of time. Discuss both views and give your opinion."],
["C1","Opinion","Science funding","Governments should spend more money on scientific research than on arts and culture. To what extent do you agree or disagree?"],
["B2","Problem-solution","Food waste","A large amount of food is wasted in many countries. What are the causes of this, and what solutions can you suggest?"],
["C1","Advantages-disadvantages","Standardised tests","Many universities rely on standardised tests to select students. Do the advantages of this outweigh the disadvantages?"]
].forEach((t, i) => window.WRITING.push({ id: 'w2y' + i, task: 2, lvl: t[0], type: t[1], title: t[2], prompt: t[3] + ' Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.' }));

// Mock tests 16–30: new combinations of the passage bank, new writing prompts, new speaking sets
(function () {
  const R = [["r1","r20"],["r2","r21"],["r3","r22"],["r4","r23"],["r5","r24"],["r6","r25"],["r7","r26"],["r8","r27"],["r9","r28"],["r10","r29"],["r11","r30"],["r12","r17"],["r13","r18"],["r14","r19"],["r15","r16"]];
  const Lp = [["l1","l11"],["l2","l12"],["l3","l13"],["l4","l14"],["l1","l15"],["l2","l16"],["l3","l17"],["l4","l18"],["l5","l19"],["l6","l20"],["l7","l15"],["l8","l16"],["l9","l17"],["l10","l18"],["l11","l19"]];
  const w1 = window.WRITING.filter(w => w.task === 1).map(w => w.id), w2 = window.WRITING.filter(w => w.task === 2 && w.id.startsWith('w2y')).map(w => w.id), w2b = window.WRITING.filter(w => w.task === 2 && w.id.startsWith('w2x')).map(w => w.id);
  R.forEach((p, i) => { const r = window.READINGS.find(x => x.id === p[1]); window.MOCKS.push({ id: 'm' + (16 + i), title: 'IELTS Mock ' + (16 + i), lvl: r ? r.lvl : 'B2', L: Lp[i], R: p, W: [w1[(i + 3) % w1.length], i < w2.length ? w2[i] : w2b[(i * 7 + 2) % w2b.length]], S: { p1: 30 + i, p2: 40 + i } }); });
})();
