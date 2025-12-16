import React, { useState } from 'react';
import { ArrowLeft, Eye, Search, Heart, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BodyLanguageGuide = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('positive');
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'positive', label: 'Attraction', icon: '💚', color: 'emerald' },
    { id: 'neutral', label: 'Uncertain', icon: '💛', color: 'amber' },
    { id: 'negative', label: 'Disinterest', icon: '❤️‍🩹', color: 'red' },
    { id: 'deception', label: 'Lie Detector', icon: '🔍', color: 'cyan' },
  ];

  const bodyLanguageSignals = {
    positive: [
      {
        id: 'eye_contact',
        emoji: '👀',
        title: 'Prolonged Eye Contact',
        shortDesc: 'They hold your gaze',
        meaning: 'Strong interest and attraction. When someone maintains eye contact longer than usual, they\'re signaling they want to connect with you.',
        whatToDo: 'Hold their gaze back with a slight smile. Break eye contact slowly by looking down (submissive/flirty) rather than to the side (dismissive).',
        intensity: 'high'
      },
      {
        id: 'leaning_in',
        emoji: '↗️',
        title: 'Leaning In',
        shortDesc: 'They move closer to you',
        meaning: 'They want to be in your space. This is a subconscious way of showing they\'re comfortable and interested in what you have to say.',
        whatToDo: 'Mirror their energy. Lean in slightly when sharing something interesting. Create moments of closeness.',
        intensity: 'high'
      },
      {
        id: 'touching',
        emoji: '✋',
        title: 'Light Touching',
        shortDesc: 'Arm, shoulder, hand touches',
        meaning: 'Physical touch is a strong indicator of attraction. They\'re testing the waters and want to create a physical connection.',
        whatToDo: 'Reciprocate with natural, confident touches. A light touch on the arm when making a point works well.',
        intensity: 'high'
      },
      {
        id: 'hair_play',
        emoji: '💇',
        title: 'Playing with Hair',
        shortDesc: 'Twirling, touching their hair',
        meaning: 'Self-grooming behavior that signals they want to look good for you. Often subconscious and indicates attraction.',
        whatToDo: 'Take it as a green light. They\'re invested in the interaction. Compliment something specific about them.',
        intensity: 'medium'
      },
      {
        id: 'mirroring',
        emoji: '🪞',
        title: 'Mirroring Your Movements',
        shortDesc: 'Copying your gestures/posture',
        meaning: 'Subconscious imitation shows rapport and connection. When someone mirrors you, they\'re in sync with you mentally.',
        whatToDo: 'Test it by changing your posture and see if they follow. Use this connection to deepen the conversation.',
        intensity: 'high'
      },
      {
        id: 'laughing',
        emoji: '😄',
        title: 'Laughing at Your Jokes',
        shortDesc: 'Even when you\'re not that funny',
        meaning: 'Genuine laughter (especially at mediocre jokes) is a strong attraction signal. They want you to feel good.',
        whatToDo: 'Keep the playful energy going. Don\'t try too hard to be funny - stay relaxed and confident.',
        intensity: 'medium'
      },
      {
        id: 'lip_looking',
        emoji: '👄',
        title: 'Looking at Your Lips',
        shortDesc: 'Eyes drift to your mouth',
        meaning: 'Classic sign they\'re thinking about kissing you. The triangle gaze (eyes → lips → eyes) is a strong signal.',
        whatToDo: 'If you notice this multiple times, the moment is right. Move closer, lower your voice, and go for it.',
        intensity: 'high'
      },
      {
        id: 'open_body',
        emoji: '🧍',
        title: 'Open Body Language',
        shortDesc: 'Facing you, arms uncrossed',
        meaning: 'They\'re receptive and comfortable. An open stance facing directly toward you shows full attention and interest.',
        whatToDo: 'Match their openness. Face them directly and keep your body language relaxed and inviting.',
        intensity: 'medium'
      },
      {
        id: 'feet_pointing',
        emoji: '👟',
        title: 'Feet Pointing Toward You',
        shortDesc: 'Their feet face your direction',
        meaning: 'People unconsciously point their feet toward what interests them. Even if they\'re looking elsewhere, feet don\'t lie.',
        whatToDo: 'A subtle but reliable signal. If their feet point at you, they want to stay in the conversation.',
        intensity: 'medium'
      },
      {
        id: 'preening',
        emoji: '✨',
        title: 'Self-Grooming',
        shortDesc: 'Adjusting clothes, checking appearance',
        meaning: 'They care about how they look to you. Straightening clothes, fixing hair, or checking their reflection near you is attraction.',
        whatToDo: 'They\'re investing effort. Return the energy by being present and attentive.',
        intensity: 'medium'
      },
      {
        id: 'dilated_pupils',
        emoji: '🔮',
        title: 'Dilated Pupils',
        shortDesc: 'Bigger, darker eyes when looking at you',
        meaning: 'Pupils naturally dilate when we see something we like. This is completely involuntary and a genuine sign of attraction.',
        whatToDo: 'Hard to notice in dim lighting, but in good light it\'s a reliable indicator. Maintain gentle eye contact.',
        intensity: 'high'
      },
      {
        id: 'raised_eyebrows',
        emoji: '😮',
        title: 'Eyebrow Flash',
        shortDesc: 'Quick eyebrow raise when seeing you',
        meaning: 'A quick raise of the eyebrows (1/5 of a second) when first seeing you is a universal sign of recognition and interest.',
        whatToDo: 'Return the eyebrow flash with a warm smile. It\'s an invitation to approach or engage.',
        intensity: 'medium'
      },
      {
        id: 'head_tilt',
        emoji: '🤔',
        title: 'Head Tilting',
        shortDesc: 'Tilts head while listening to you',
        meaning: 'Exposing the neck is a vulnerability signal showing trust and interest. They\'re fully engaged with what you\'re saying.',
        whatToDo: 'Keep talking - they\'re genuinely interested. Share something personal to deepen the connection.',
        intensity: 'medium'
      },
      {
        id: 'wrist_exposure',
        emoji: '🤲',
        title: 'Showing Wrists/Palms',
        shortDesc: 'Open palms, exposed wrists',
        meaning: 'Exposing vulnerable areas (wrists, palms, neck) signals trust and openness. It\'s a subconscious invitation.',
        whatToDo: 'Mirror this openness. Use open hand gestures when speaking.',
        intensity: 'medium'
      },
      {
        id: 'lingering',
        emoji: '⏰',
        title: 'Finding Excuses to Stay',
        shortDesc: 'Prolongs conversation unnecessarily',
        meaning: 'When someone keeps finding reasons to continue talking or hang around, they don\'t want the interaction to end.',
        whatToDo: 'Escalate - suggest moving somewhere together or exchange numbers. They\'re waiting for you to make a move.',
        intensity: 'high'
      },
      {
        id: 'remembering',
        emoji: '🧠',
        title: 'Remembers Small Details',
        shortDesc: 'Recalls things you mentioned before',
        meaning: 'When someone remembers minor details from past conversations, they\'ve been thinking about you. Major interest signal.',
        whatToDo: 'Acknowledge it: "You remembered that?" with a smile. It shows you noticed their investment.',
        intensity: 'high'
      },
      {
        id: 'initiating',
        emoji: '📲',
        title: 'Initiates Contact',
        shortDesc: 'Texts/calls first, starts conversations',
        meaning: 'Consistent initiation shows they\'re thinking about you and want your attention. Actions speak louder than words.',
        whatToDo: 'Reciprocate but don\'t overdo it. Let them chase a bit while staying engaged.',
        intensity: 'high'
      },
      {
        id: 'nervous_laugh',
        emoji: '😅',
        title: 'Nervous Laughter',
        shortDesc: 'Giggly, laughs at nothing',
        meaning: 'Nervous laughter often means they\'re attracted but anxious. They want to impress you but feel flustered.',
        whatToDo: 'Be warm and reassuring. Slow down your energy to help them relax.',
        intensity: 'medium'
      },
      {
        id: 'proximity',
        emoji: '📍',
        title: 'Staying in Your Orbit',
        shortDesc: 'Always ends up near you',
        meaning: 'Even in a group, they position themselves close to you. This is territorial behavior showing preference.',
        whatToDo: 'Acknowledge their presence. Start a side conversation or include them directly.',
        intensity: 'high'
      },
      {
        id: 'blushing',
        emoji: '😊',
        title: 'Blushing',
        shortDesc: 'Face/neck turns red around you',
        meaning: 'Blushing is an involuntary physical response to attraction or excitement. They can\'t hide this one.',
        whatToDo: 'Don\'t point it out - it\'ll embarrass them. Just enjoy knowing you have an effect on them.',
        intensity: 'high'
      },
      {
        id: 'object_play',
        emoji: '🍷',
        title: 'Playing with Objects',
        shortDesc: 'Stroking glass, playing with jewelry',
        meaning: 'Tactile stimulation is often a subconscious outlet for attraction energy. Stroking a wine glass stem is classic.',
        whatToDo: 'Match their energy. This is a sign they\'re in a sensual headspace.',
        intensity: 'medium'
      }
    ],
    neutral: [
      {
        id: 'nervous_energy',
        emoji: '😰',
        title: 'Nervous Energy',
        shortDesc: 'Fidgeting, restless movements',
        meaning: 'Could be attraction (butterflies) or discomfort. Context matters. If they\'re staying in the conversation, it\'s likely good nervousness.',
        whatToDo: 'Make them comfortable. Slow down your energy, speak calmly, and give them space to relax.',
        intensity: 'medium'
      },
      {
        id: 'mixed_signals',
        emoji: '🔄',
        title: 'Hot and Cold',
        shortDesc: 'Engaged then distant',
        meaning: 'They might be unsure, testing you, or processing their feelings. Don\'t panic - inconsistency isn\'t always rejection.',
        whatToDo: 'Stay grounded and confident. Don\'t chase their validation. Let them come to you.',
        intensity: 'medium'
      },
      {
        id: 'polite_smile',
        emoji: '🙂',
        title: 'Polite Smile Only',
        shortDesc: 'Smiles but no eye crinkles',
        meaning: 'A polite smile doesn\'t engage the eyes (Duchenne smile). They\'re being friendly but may not be attracted yet.',
        whatToDo: 'Build more rapport. Try to get a genuine laugh or reaction before escalating.',
        intensity: 'low'
      },
      {
        id: 'short_answers',
        emoji: '💬',
        title: 'Short Responses',
        shortDesc: 'Brief answers, no follow-up',
        meaning: 'They might be shy, distracted, or uninterested. If combined with other positive signals, it could just be their style.',
        whatToDo: 'Ask open-ended questions. If they consistently don\'t engage, consider gracefully moving on.',
        intensity: 'medium'
      },
      {
        id: 'checking_phone',
        emoji: '📱',
        title: 'Quick Phone Checks',
        shortDesc: 'Occasional glances at phone',
        meaning: 'Modern habit, not always a red flag. If they quickly put it away, they\'re choosing you over distractions.',
        whatToDo: 'Don\'t call it out. If it becomes constant, re-engage with something interesting or give them an out.',
        intensity: 'low'
      },
      {
        id: 'group_attention',
        emoji: '👥',
        title: 'Focused on the Group',
        shortDesc: 'Talks to everyone equally',
        meaning: 'They\'re being social but not showing you special attention yet. You need to differentiate yourself.',
        whatToDo: 'Create a moment of private connection - a side comment, inside joke, or one-on-one conversation.',
        intensity: 'low'
      },
      {
        id: 'testing_you',
        emoji: '🧪',
        title: 'Testing You',
        shortDesc: 'Playful challenges or light teasing',
        meaning: 'They\'re testing your confidence and how you handle pressure. This is often a sign of interest, not rejection.',
        whatToDo: 'Pass the test by staying cool and playful. Don\'t get defensive. Tease back with a smile.',
        intensity: 'medium'
      },
      {
        id: 'mentioning_others',
        emoji: '💭',
        title: 'Mentioning Other People',
        shortDesc: 'Brings up friends, exes, or others',
        meaning: 'Could be gauging your reaction (jealousy test) or genuinely just being conversational. Context matters.',
        whatToDo: 'Stay unbothered. If it\'s a test, showing jealousy fails it. Be curious but not threatened.',
        intensity: 'medium'
      },
      {
        id: 'delayed_response',
        emoji: '⏳',
        title: 'Slow to Respond',
        shortDesc: 'Takes time to reply to messages',
        meaning: 'Could mean busy, playing it cool, or low interest. Look at the quality of response, not just timing.',
        whatToDo: 'Match their energy. Don\'t double text. If responses are engaged when they come, you\'re fine.',
        intensity: 'low'
      },
      {
        id: 'formal_distance',
        emoji: '🤝',
        title: 'Polite but Distant',
        shortDesc: 'Friendly but keeps professional distance',
        meaning: 'They might be interested but cautious, or genuinely just being polite. Need more signals to know.',
        whatToDo: 'Try to get past the surface. Ask deeper questions and share something personal first.',
        intensity: 'medium'
      },
      {
        id: 'fidgeting',
        emoji: '🔄',
        title: 'Constant Fidgeting',
        shortDesc: 'Can\'t sit still, touches face/hair',
        meaning: 'High energy that could be excitement OR anxiety. If they\'re staying engaged, it\'s usually attraction.',
        whatToDo: 'Ground them with calm, confident energy. Your stillness will help them relax.',
        intensity: 'medium'
      },
      {
        id: 'breaking_eye',
        emoji: '👁️‍🗨️',
        title: 'Breaking Eye Contact Down',
        shortDesc: 'Looks away downward',
        meaning: 'Looking down when breaking eye contact is submissive/flirty. Looking to the side is more neutral.',
        whatToDo: 'If they look down, it\'s often a positive sign of attraction. They\'re feeling the tension too.',
        intensity: 'medium'
      }
    ],
    negative: [
      {
        id: 'crossed_arms',
        emoji: '🙅',
        title: 'Crossed Arms',
        shortDesc: 'Defensive, closed posture',
        meaning: 'Creates a barrier between you. They may feel uncomfortable, defensive, or simply cold. Context is key.',
        whatToDo: 'Don\'t pressure. Take a step back emotionally. Give them a reason to open up or exit gracefully.',
        intensity: 'medium'
      },
      {
        id: 'leaning_away',
        emoji: '↙️',
        title: 'Leaning Away',
        shortDesc: 'Creating physical distance',
        meaning: 'They\'re trying to increase space between you. A clear sign of discomfort or disinterest.',
        whatToDo: 'Respect their space. Don\'t chase. Either re-establish comfort from a distance or wrap up the interaction.',
        intensity: 'high'
      },
      {
        id: 'looking_around',
        emoji: '👁️',
        title: 'Scanning the Room',
        shortDesc: 'Eyes wandering, not focused',
        meaning: 'They\'re looking for something more interesting or an escape route. You don\'t have their full attention.',
        whatToDo: 'Re-engage with a pattern interrupt - change topics dramatically or suggest moving somewhere.',
        intensity: 'high'
      },
      {
        id: 'minimal_response',
        emoji: '😐',
        title: 'One-Word Answers',
        shortDesc: '"Yeah" "Cool" "Nice"',
        meaning: 'They\'re not investing in the conversation. This is their way of being polite while signaling disinterest.',
        whatToDo: 'Time to exit with grace. "I should get back to my friends, nice meeting you" keeps your dignity intact.',
        intensity: 'high'
      },
      {
        id: 'checking_time',
        emoji: '⌚',
        title: 'Checking the Time',
        shortDesc: 'Looking at watch/phone for time',
        meaning: 'They\'re counting down to leave. Even if they have somewhere to be, interested people don\'t remind themselves.',
        whatToDo: 'Acknowledge it: "I won\'t keep you" - this shows social awareness and gives them a graceful exit.',
        intensity: 'high'
      },
      {
        id: 'turning_away',
        emoji: '↪️',
        title: 'Body Angled Away',
        shortDesc: 'Shoulders/torso facing elsewhere',
        meaning: 'Their body wants to leave even if they\'re still talking. Feet and torso point where they want to go.',
        whatToDo: 'Read the room. Wrap up the conversation before they have to. Leave them with a positive last impression.',
        intensity: 'medium'
      },
      {
        id: 'fake_busy',
        emoji: '📋',
        title: 'Suddenly Busy',
        shortDesc: '"I have to go find my friend"',
        meaning: 'A polite escape. They\'re manufacturing a reason to leave the conversation.',
        whatToDo: 'Let them go gracefully: "Of course, nice talking to you." Never make them feel trapped.',
        intensity: 'high'
      },
      {
        id: 'avoiding_touch',
        emoji: '🚫',
        title: 'Avoiding Physical Contact',
        shortDesc: 'Pulling away from touches',
        meaning: 'Clear boundary. They don\'t want physical escalation with you.',
        whatToDo: 'Respect it immediately. Don\'t try again. Either reset to friendly conversation or exit.',
        intensity: 'high'
      },
      {
        id: 'barrier_objects',
        emoji: '🛡️',
        title: 'Creating Barriers',
        shortDesc: 'Holding bag/drink between you',
        meaning: 'Placing objects between you creates a physical barrier. It\'s a subconscious protection mechanism.',
        whatToDo: 'Don\'t push through barriers. Step back and rebuild comfort before trying to close distance.',
        intensity: 'medium'
      },
      {
        id: 'yawning',
        emoji: '🥱',
        title: 'Yawning',
        shortDesc: 'Repeated yawning during conversation',
        meaning: 'Either genuinely tired or bored. If combined with other negative signals, they\'re not engaged.',
        whatToDo: 'Change the energy. Suggest moving, switch topics drastically, or give them an out.',
        intensity: 'medium'
      },
      {
        id: 'friend_rescue',
        emoji: '🆘',
        title: 'Friend Rescue',
        shortDesc: 'Friend pulls them away',
        meaning: 'Either pre-arranged escape signal or their friend read the situation. They wanted out.',
        whatToDo: 'Let them go gracefully. Never try to pull them back or interrupt the friend.',
        intensity: 'high'
      },
      {
        id: 'tight_lips',
        emoji: '😶',
        title: 'Tight-Lipped Smile',
        shortDesc: 'Smile with lips pressed together',
        meaning: 'A closed-mouth smile is often forced politeness, not genuine warmth. It doesn\'t reach the eyes.',
        whatToDo: 'Work on getting a genuine reaction. If you can\'t, they may not be feeling it.',
        intensity: 'medium'
      },
      {
        id: 'hands_pockets',
        emoji: '🧥',
        title: 'Hands in Pockets',
        shortDesc: 'Both hands hidden in pockets',
        meaning: 'Hiding hands is a low-confidence or closed-off signal. They\'re not fully open to the interaction.',
        whatToDo: 'Try to get them engaged with a question or activity that requires using their hands.',
        intensity: 'low'
      },
      {
        id: 'mono_answers',
        emoji: '💤',
        title: 'No Follow-Up Questions',
        shortDesc: 'Answers but never asks about you',
        meaning: 'One-sided conversation means low investment. Interested people want to know more about you.',
        whatToDo: 'Stop carrying the conversation. If they don\'t pick up the slack, move on.',
        intensity: 'high'
      },
      {
        id: 'stiff_posture',
        emoji: '🗿',
        title: 'Stiff Body Language',
        shortDesc: 'Rigid, tense posture',
        meaning: 'Tension in the body often means discomfort. They\'re not relaxed around you.',
        whatToDo: 'Try to lighten the mood. If they stay tense, they may not feel comfortable.',
        intensity: 'medium'
      },
      {
        id: 'blank_stare',
        emoji: '😑',
        title: 'Glazed Eyes',
        shortDesc: 'Looking at you but not really seeing',
        meaning: 'They\'ve mentally checked out. Their mind is elsewhere even if they\'re facing you.',
        whatToDo: 'Ask "where did you just go?" to re-engage, or accept you\'ve lost them.',
        intensity: 'high'
      },
      {
        id: 'excessive_politeness',
        emoji: '🎭',
        title: 'Overly Formal',
        shortDesc: '"That\'s nice" "How interesting"',
        meaning: 'Rehearsed politeness without genuine engagement. They\'re being nice to end the interaction.',
        whatToDo: 'Read the room. Genuine interest feels warm, not scripted. Exit with dignity.',
        intensity: 'medium'
      },
      {
        id: 'backing_up',
        emoji: '🚶',
        title: 'Walking Backward',
        shortDesc: 'Slowly backing away while talking',
        meaning: 'Their body is literally moving toward the exit. They\'re done with the conversation.',
        whatToDo: 'Don\'t follow them. Say something like "I\'ll let you go" and end on your terms.',
        intensity: 'high'
      },
      {
        id: 'sighing',
        emoji: '😤',
        title: 'Heavy Sighing',
        shortDesc: 'Audible sighs during conversation',
        meaning: 'Frustration, boredom, or impatience. They\'re not enjoying the interaction.',
        whatToDo: 'Wrap it up. You can\'t force chemistry. Exit and preserve your value.',
        intensity: 'high'
      }
    ],
    deception: [
      {
        id: 'touching_face',
        emoji: '🤔',
        title: 'Touching Face/Nose',
        shortDesc: 'Frequent face touching while talking',
        meaning: 'Anxiety causes blood to rush to the face. Touching the nose, mouth, or ears while speaking can indicate deception.',
        whatToDo: 'Ask follow-up questions. Liars often struggle with details. "Tell me more about that..."',
        intensity: 'high'
      },
      {
        id: 'eye_direction',
        emoji: '👁️',
        title: 'Eyes Moving Up-Right',
        shortDesc: 'Looking up and to their right',
        meaning: 'For most right-handed people, looking up-right indicates constructing/imagining (potential lie) vs up-left (remembering truth).',
        whatToDo: 'Note: This varies by person. Establish their baseline first by asking truthful questions.',
        intensity: 'medium'
      },
      {
        id: 'over_detail',
        emoji: '📖',
        title: 'Too Much Detail',
        shortDesc: 'Overly elaborate explanations',
        meaning: 'Liars often over-explain to seem credible. Truth-tellers give simpler, direct answers.',
        whatToDo: 'Interrupt and ask them to summarize. Liars struggle to condense their fabricated stories.',
        intensity: 'high'
      },
      {
        id: 'covering_mouth',
        emoji: '🤐',
        title: 'Covering Mouth',
        shortDesc: 'Hand over mouth while speaking',
        meaning: 'Subconscious attempt to "block" the lie from coming out. A classic deception tell.',
        whatToDo: 'Watch for this combined with other signals. One sign isn\'t proof - look for clusters.',
        intensity: 'high'
      },
      {
        id: 'story_changes',
        emoji: '🔀',
        title: 'Story Inconsistencies',
        shortDesc: 'Details change when retold',
        meaning: 'Truth is easy to repeat consistently. Lies require mental effort and often have shifting details.',
        whatToDo: 'Ask them to tell the story backward. Liars struggle with reverse chronology.',
        intensity: 'high'
      },
      {
        id: 'throat_clearing',
        emoji: '😮‍💨',
        title: 'Throat Clearing/Swallowing',
        shortDesc: 'Frequent swallowing or clearing throat',
        meaning: 'Stress causes dry mouth. Excessive swallowing or throat clearing can indicate anxiety from lying.',
        whatToDo: 'Stay calm and keep asking questions. The more they talk, the more tells they show.',
        intensity: 'medium'
      },
      {
        id: 'speech_pause',
        emoji: '⏸️',
        title: 'Unusual Pauses',
        shortDesc: 'Long pauses before answering',
        meaning: 'Truth flows naturally. Fabricating requires thinking time. Watch for unnatural delays on simple questions.',
        whatToDo: 'Ask unexpected questions. Liars prepare for anticipated questions but stumble on surprises.',
        intensity: 'medium'
      },
      {
        id: 'defensive',
        emoji: '🛡️',
        title: 'Getting Defensive',
        shortDesc: 'Angry or hostile when questioned',
        meaning: 'Innocent people clarify. Guilty people deflect with anger. "Why would you even ask that?" is a red flag.',
        whatToDo: 'Stay calm and curious. Don\'t accuse - just ask open questions and observe.',
        intensity: 'high'
      },
      {
        id: 'fidget_increase',
        emoji: '🔄',
        title: 'Increased Fidgeting',
        shortDesc: 'Restlessness when certain topics come up',
        meaning: 'Watch for sudden changes in fidgeting level when specific subjects are mentioned.',
        whatToDo: 'Note which topics trigger anxiety. Circle back to those topics later.',
        intensity: 'medium'
      },
      {
        id: 'fake_smile',
        emoji: '😬',
        title: 'Forced Smile',
        shortDesc: 'Smile doesn\'t reach the eyes',
        meaning: 'Real smiles (Duchenne) crinkle the eyes. Fake smiles only use the mouth. They\'re masking their true feelings.',
        whatToDo: 'Look for eye crinkles. No crinkles = the smile is performative, not genuine.',
        intensity: 'medium'
      },
      {
        id: 'distancing_language',
        emoji: '📏',
        title: 'Distancing Language',
        shortDesc: '"That woman" instead of names',
        meaning: 'Liars subconsciously distance themselves from the lie by avoiding personal pronouns and names.',
        whatToDo: 'Notice if they suddenly become formal or vague about people/places they should know well.',
        intensity: 'high'
      },
      {
        id: 'no_contractions',
        emoji: '📝',
        title: 'Formal Speech',
        shortDesc: '"I did not" vs "I didn\'t"',
        meaning: 'When lying, people often avoid contractions and speak more formally. "I did NOT do that" vs casual "I didn\'t."',
        whatToDo: 'Compare to their normal speech pattern. Sudden formality on specific topics is suspicious.',
        intensity: 'medium'
      },
      {
        id: 'anchor_point',
        emoji: '⚓',
        title: 'Physical Anchoring',
        shortDesc: 'Gripping chair, table, or objects',
        meaning: 'Holding onto objects provides a sense of security when feeling anxious about deception.',
        whatToDo: 'White knuckles or tight grips during certain topics reveal stress points.',
        intensity: 'medium'
      },
      {
        id: 'blink_rate',
        emoji: '👁️‍🗨️',
        title: 'Changed Blink Rate',
        shortDesc: 'Blinking more or less than usual',
        meaning: 'Stress affects blink rate. Watch for changes from their baseline - either rapid blinking or forced staring.',
        whatToDo: 'Establish normal blink rate first with casual conversation, then compare.',
        intensity: 'low'
      },
      {
        id: 'grooming_gesture',
        emoji: '👔',
        title: 'Self-Soothing Gestures',
        shortDesc: 'Adjusting collar, rubbing neck',
        meaning: 'Neck touching, collar pulling, or rubbing the back of the neck indicates discomfort and potential deception.',
        whatToDo: 'The neck is vulnerable - touching it reveals they feel exposed or threatened.',
        intensity: 'high'
      },
      {
        id: 'pitch_change',
        emoji: '🎵',
        title: 'Voice Pitch Changes',
        shortDesc: 'Voice gets higher or strained',
        meaning: 'Stress tightens vocal cords, raising pitch. Listen for voice changes on sensitive topics.',
        whatToDo: 'Compare their voice on neutral topics vs suspicious ones. The difference is telling.',
        intensity: 'medium'
      },
      {
        id: 'micro_expressions',
        emoji: '⚡',
        title: 'Micro-Expressions',
        shortDesc: 'Brief flashes of true emotion',
        meaning: 'Real emotions flash across the face for 1/25th of a second before being masked. Fear, disgust, or contempt.',
        whatToDo: 'Hard to catch in real-time. Trust your gut if something "felt off" - you may have caught one.',
        intensity: 'high'
      },
      {
        id: 'direction_changes',
        emoji: '↔️',
        title: 'Shifting Position',
        shortDesc: 'Constant repositioning in seat',
        meaning: 'Discomfort from lying manifests physically. Constant shifting is the body trying to "escape."',
        whatToDo: 'Note when the shifting increases. Those are likely the topics they\'re being dishonest about.',
        intensity: 'medium'
      }
    ]
  };

  const filteredSignals = bodyLanguageSignals[selectedCategory].filter(signal =>
    signal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    signal.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'high': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'low': return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'positive': return 'emerald';
      case 'neutral': return 'amber';
      case 'negative': return 'red';
      default: return 'slate';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-black text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/50">
        <div className="flex items-center gap-3 px-5 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-slate-800/50 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-violet-400" />
              Body Language Guide
            </h1>
            <p className="text-xs text-slate-500">Learn to read the signs</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search signals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 px-5 pb-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-1 py-2 px-2 rounded-xl text-[10px] font-medium transition-all flex items-center justify-center gap-1 ${
                selectedCategory === cat.id
                  ? cat.id === 'positive' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : cat.id === 'neutral'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : cat.id === 'deception'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/30 hover:bg-slate-700/50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      <div className="px-5 py-4 space-y-3">
        {filteredSignals.map(signal => (
          <button
            key={signal.id}
            onClick={() => setSelectedSignal(signal)}
            className={`w-full p-4 rounded-2xl border transition-all text-left ${
              selectedCategory === 'positive'
                ? 'bg-slate-800/40 border-emerald-500/20 hover:border-emerald-500/40'
                : selectedCategory === 'neutral'
                  ? 'bg-slate-800/40 border-amber-500/20 hover:border-amber-500/40'
                  : selectedCategory === 'deception'
                    ? 'bg-slate-800/40 border-cyan-500/20 hover:border-cyan-500/40'
                    : 'bg-slate-800/40 border-red-500/20 hover:border-red-500/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                selectedCategory === 'positive'
                  ? 'bg-emerald-500/20'
                  : selectedCategory === 'neutral'
                    ? 'bg-amber-500/20'
                    : selectedCategory === 'deception'
                      ? 'bg-cyan-500/20'
                      : 'bg-red-500/20'
              }`}>
                {signal.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white text-sm">{signal.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getIntensityColor(signal.intensity)}`}>
                    {signal.intensity}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{signal.shortDesc}</p>
              </div>
              <div className="text-slate-600">→</div>
            </div>
          </button>
        ))}
      </div>

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSignal(null)}
          />
          <div className={`relative w-full max-w-lg bg-slate-900 rounded-t-3xl border-t ${
            selectedCategory === 'positive'
              ? 'border-emerald-500/30'
              : selectedCategory === 'neutral'
                ? 'border-amber-500/30'
                : selectedCategory === 'deception'
                  ? 'border-cyan-500/30'
                  : 'border-red-500/30'
          } p-6 pb-10 max-h-[80vh] overflow-y-auto`}>
            {/* Close button */}
            <button
              onClick={() => setSelectedSignal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                selectedCategory === 'positive'
                  ? 'bg-emerald-500/20'
                  : selectedCategory === 'neutral'
                    ? 'bg-amber-500/20'
                    : selectedCategory === 'deception'
                      ? 'bg-cyan-500/20'
                      : 'bg-red-500/20'
              }`}>
                {selectedSignal.emoji}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedSignal.title}</h2>
                <p className="text-sm text-slate-400">{selectedSignal.shortDesc}</p>
              </div>
            </div>

            {/* Meaning */}
            <div className="mb-5">
              <h3 className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                selectedCategory === 'positive'
                  ? 'text-emerald-400'
                  : selectedCategory === 'neutral'
                    ? 'text-amber-400'
                    : selectedCategory === 'deception'
                      ? 'text-cyan-400'
                      : 'text-red-400'
              }`}>
                <Heart className="w-3.5 h-3.5" />
                What it means
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-4 rounded-xl">
                {selectedSignal.meaning}
              </p>
            </div>

            {/* What to do */}
            <div>
              <h3 className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-2">
                ⚡ What to do
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl">
                {selectedSignal.whatToDo}
              </p>
            </div>

            {/* Intensity indicator */}
            <div className="mt-5 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Signal Strength</span>
                <span className={`text-xs px-3 py-1 rounded-full border ${getIntensityColor(selectedSignal.intensity)}`}>
                  {selectedSignal.intensity === 'high' ? '🔥 Strong Signal' : selectedSignal.intensity === 'medium' ? '✨ Moderate Signal' : '💫 Subtle Signal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyLanguageGuide;
