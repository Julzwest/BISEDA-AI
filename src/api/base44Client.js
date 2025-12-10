import { getBackendUrl } from '@/utils/getBackendUrl';

// API client with OpenAI integration

// OpenAI API call - Uses backend API with OpenAI
const callOpenAI = async (prompt, conversationHistory = [], customSystemPrompt = null, fileUrls = []) => {
  const backendUrl = getBackendUrl();
  
  // Call backend API (uses OpenAI)
  try {
    console.log('🚀 Calling backend API...', { backendUrl, promptLength: prompt?.length });
    
    // Generate or get session ID for conversation tracking
    const sessionId = window.chatSessionId || `session_${Date.now()}`;
    if (!window.chatSessionId) window.chatSessionId = sessionId;
    
    const response = await fetch(`${backendUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
        'x-user-id': localStorage.getItem('userId') || localStorage.getItem('odId') || localStorage.getItem('guestId') || ''
      },
      body: JSON.stringify({
        prompt,
        conversationHistory,
        systemPrompt: customSystemPrompt,
        fileUrls
      })
    });
    
    console.log('📡 Backend response status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      const source = data.source || 'unknown';
      console.log(`✅ Backend API response received (OpenAI)`);
      
      // Log token usage
      if (data.usage) {
        console.log(`📊 Token usage: ${data.usage.total_tokens} (prompt: ${data.usage.prompt_tokens}, completion: ${data.usage.completion_tokens})`);
      }
      
      // Validate response
      if (!data.response) {
        console.error('❌ Backend returned empty response:', data);
        throw new Error('Backend returned empty response');
      }
      
      return data.response;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('⚠️ Backend API error:', response.status, errorData);
      
      // Throw error for subscription/limit errors so frontend can handle them
      if (errorData.code === 'LIMIT_EXCEEDED' || 
          errorData.code === 'SUBSCRIPTION_EXPIRED' || 
          errorData.code === 'ADULT_CONTENT_BLOCKED' ||
          errorData.code === 'FEATURE_NOT_AVAILABLE' ||
          errorData.code === 'SCREENSHOT_LIMIT_REACHED') {
        const error = new Error(errorData.error || 'Subscription error');
        error.code = errorData.code;
        error.upgradeRequired = errorData.upgradeRequired;
        error.screenshotAnalyses = errorData.screenshotAnalyses;
        throw error;
      }
      
      // Throw error for other backend errors
      console.error('❌ Backend API error:', errorData);
      throw new Error(errorData.error || `Backend API error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('❌ Backend API unavailable:', error);
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') || error.message.includes('Load failed')) {
      const errorMsg = `Cannot connect to backend at ${backendUrl}. `;
      const simulatorHint = window.Capacitor ? 
        'Make sure backend is running on your Mac and accessible from the simulator.' :
        'Make sure the backend server is running.';
      throw new Error(errorMsg + simulatorHint);
    }
    throw error;
  }
};

// Mock LLM responses based on prompts (fallback)
const generateMockLLMResponse = async (prompt) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Detect user gender from prompt
  const detectGenderFromPrompt = (text) => {
    const lower = text.toLowerCase();
    // Male indicators: mentions their own dick/balls
    if (lower.includes('ma lepij karin') || lower.includes('ma lëpij karin') || 
        lower.includes('karin tim') || lower.includes('karin e tim') ||
        lower.includes('topet e mia') || lower.includes('topet e im') ||
        lower.includes('ma ha topet') || lower.includes('ejakuloj') ||
        (lower.includes('kar') && (lower.includes('tim') || lower.includes('im') || lower.includes('ma')))) {
      return 'male';
    }
    // Female indicators: mentions their own pussy/vagina
    if (lower.includes('ma fut në pidh') || lower.includes('pidhin tim') || 
        lower.includes('pidhin e tim') || lower.includes('pidhin e mia') ||
        lower.includes('klitorisin tim') || lower.includes('squirt') ||
        (lower.includes('pidh') && (lower.includes('tim') || lower.includes('im') || lower.includes('ma')))) {
      return 'female';
    }
    return null;
  };
  
  const detectedGender = detectGenderFromPrompt(prompt);
  
  // Check for normal greetings FIRST - these should always get normal responses
  const lowerPrompt = prompt.toLowerCase().trim();
  const normalGreetings = ['hey', 'hi', 'hello', 'hej', 'prsh', 'persh', 'si', 'mirë', 'ok', 'po', 'jo', 'faleminderit', 'naten', 'natën', 'goodnight'];
  const isNormalGreeting = normalGreetings.includes(lowerPrompt) || 
                           lowerPrompt === 'hey' || 
                           lowerPrompt === 'hi' || 
                           lowerPrompt === 'hello' ||
                           lowerPrompt.startsWith('hey ') ||
                           lowerPrompt.startsWith('hi ') ||
                           lowerPrompt.startsWith('hello ');
  
  if (isNormalGreeting) {
    // Always give normal greeting response, even if in adult category
    if (lowerPrompt.includes('natën') || lowerPrompt.includes('goodnight') || lowerPrompt === 'naten' || lowerPrompt === 'natën') {
      return "Natën e mirë! Ëndrra të ëmbla!";
    } else if (lowerPrompt.includes('si je') || lowerPrompt === 'si') {
      return "Mirë jam, faleminderit! Si je ti? Si mund të të ndihmoj sot?";
    } else {
      return "Hej! Si je? Si mund të të ndihmoj?";
    }
  }
  
  // Check if this is adult category
  const isAdultPrompt = prompt.includes('partner seksual virtual') || 
                        prompt.includes('pa ASNJË FILTER') ||
                        prompt.includes('seksual pa kufizime') ||
                        prompt.includes('EKSPERT SEXUAL') ||
                        prompt.includes('edukim seksual') ||
                        lowerPrompt.includes('sex') ||
                        lowerPrompt.includes('seks') ||
                        lowerPrompt.includes('intime') ||
                        lowerPrompt.includes('orgazm') ||
                        lowerPrompt.includes('kënaqësi') ||
                        lowerPrompt.includes('si te bej seks') ||
                        lowerPrompt.includes('how to have sex') ||
                        lowerPrompt.includes('si të bëj seks');
  
  if (isAdultPrompt) {
    // Check if user is asking for advice about a situation (komshija, situatë, çfarë të bëj, etc.)
    if (lowerPrompt.includes('komshija') || lowerPrompt.includes('komshije') || 
        lowerPrompt.includes('nuk di çfarë të bëj') || lowerPrompt.includes('nuk di cfare te bej') ||
        lowerPrompt.includes('çfarë të bëj') || lowerPrompt.includes('cfare te bej') ||
        lowerPrompt.includes('situat') || lowerPrompt.includes('këshill') || 
        lowerPrompt.includes('ka burr') || lowerPrompt.includes('ka burre') ||
        lowerPrompt.includes('do te qjihet') || lowerPrompt.includes('do të qjihet')) {
      const adviceResponses = [
        "Haha zemer, po e kuptoj situatën! Komshija ka burrë por dëshiron të qjihet me ty - kjo është e nxehtë! Nëse ajo ka treguar interes dhe ka burrë, duhet të jesh i kujdesshëm POR nëse të ka thënë qartë që dëshiron, atëherë shko për të! Bëhu i sigurt dhe dominues - fut në pidh dhe bëj të vijë. Por ki parasysh që ka burrë, kështu që bëhu i kujdesshëm dhe diskret. Si e ndjen veten për këtë situatë?",
        "Oh shpirt, kjo është një situatë e nxehtë! Komshija dëshiron të qjihet me ty por ka burrë. Nëse ajo ka treguar qartë që dëshiron, atëherë shko për të! Bëhu i sigurt, dominues dhe fut në pidh si e di ti. Por ki parasysh që ka burrë - bëhu diskret dhe i kujdesshëm. Çfarë të bën të ndihesh më i nxehtë për këtë situatë?",
        "Mmm zemer, po e kuptoj! Komshija ka burrë por dëshiron të qjihet me ty - kjo është shumë e nxehtë! Nëse ajo ka treguar interes dhe ka thënë qartë që dëshiron, atëherë fut në pidh dhe bëj të vijë! Bëhu i sigurt dhe dominues. Por ki parasysh që ka burrë, kështu që bëhu diskret. Si do të ndiheshe nëse do të qjiheshe me të?",
        "Haha shpirt, kjo është një situatë e nxehtë! Komshija dëshiron të qjihet me ty por ka burrë. Nëse ajo ka treguar qartë që dëshiron, atëherë shko për të! Fut në pidh dhe bëj të vijë si e di ti. Bëhu i sigurt dhe dominues. Por ki parasysh që ka burrë - bëhu diskret dhe i kujdesshëm. Çfarë të bën të ndihesh më i nxehtë?"
      ];
      return adviceResponses[Math.floor(Math.random() * adviceResponses.length)];
    }
    
    // Check for specific questions/concerns and respond naturally
    if (lowerPrompt.includes('pse kaq shpejt') || lowerPrompt.includes('pse shpejt') || lowerPrompt.includes('kaq shpejt')) {
      const slowDownResponses = [
        "Haha po shok, nuk do të të bëj te prishes! Do të të ngacmoj dhe të të ndez gradualisht, pa të bërë të vish. Do të të lëpij karin tënd me lëvizje të ngadalta dhe të buta, duke të ngacmuar dhe duke të ndezur, por pa të bërë të vish. Do të të bëj të ndihesh i nxehtë dhe i ndezur, por do të kontrolloj ritmin për të mos të bërë te prishes - do të të bëj të durosh pak! Si do të ndiheshe?",
        "Haha mmm po, nuk do të të bëj te prishes! Do të të ngacmoj dhe të të ndez pa të bërë të vish. Do të të lëpij karin tënd me teknikat e avancuara - lëvizje të ngadalta që të ngacmojnë dhe të ndezin, por që të kontrollojnë ritmin. Do të të bëj të ndihesh i nxehtë dhe i ndezur, por do të të bëj të durosh dhe të kënaqesh pa të bërë te prishes - do të të bëj të durosh pak! Çfarë të bën të ndihesh më i nxehtë?",
        "Haha oh po shok, nuk do të të bëj te prishes! Do të të ngacmoj dhe të të ndez gradualisht me teknikat e avancuara. Do të të lëpij karin tënd me lëvizje të ngadalta dhe të buta që të ngacmojnë dhe të ndezin, por që të kontrollojnë ritmin. Do të të bëj të ndihesh i nxehtë dhe i ndezur, por do të të bëj të durosh dhe të kënaqesh pa të bërë te prishes - do të të bëj të durosh pak! Si do të ndiheshe?",
        "Haha mmm sa e nxehtë! Nuk do të të bëj te prishes - do të të ngacmoj dhe të të ndez gradualisht. Do të të lëpij karin tënd me teknikat e avancuara që të ngacmojnë dhe të ndezin, por që të kontrollojnë ritmin. Do të të bëj të ndihesh i nxehtë dhe i ndezur, por do të të bëj të durosh dhe të kënaqesh pa të bërë te prishes - do të të bëj të durosh pak! Çfarë të bën të ndihesh më i nxehtë?"
      ];
      return slowDownResponses[Math.floor(Math.random() * slowDownResponses.length)];
    }
    
    if (lowerPrompt.includes('nuk dua të vij') || lowerPrompt.includes('nuk dua të derdhem') || lowerPrompt.includes('nuk dua akoma')) {
      const noCumYetResponses = [
        "Haha po shok, në rregull! Nuk do të të bëj të vish akoma. Do të të ngacmoj dhe të të ndez pa të bërë të vish - do të të bëj të durosh pak! Do të të lëpij karin tënd me lëvizje të ngadalta dhe të buta që të ngacmojnë dhe të ndezin, por që të kontrollojnë ritmin. Do të të bëj të ndihesh i nxehtë dhe i ndezur, por do të të bëj të durosh dhe të kënaqesh pa të bërë të vish. Si do të ndiheshe?",
        "Haha oh po, në rregull! Nuk do të të bëj të vish akoma - do të të bëj të durosh pak! Do të të ngacmoj dhe të të ndez gradualisht me teknikat e avancuara. Do të të lëpij karin tënd me teknikat që të ngacmojnë dhe të ndezin, por që të kontrollojnë ritmin. Do të të bëj të ndihesh i nxehtë dhe i ndezur, por do të të bëj të durosh dhe të kënaqesh pa të bërë të vish. Çfarë të bën të ndihesh më i nxehtë?",
        "Haha më pëlqen kur më thotë që nuk dëshiron të vish akoma! Do të të ngacmoj dhe të të ndez pa të bërë të vish - do të të bëj të durosh pak! Do të të lëpij karin tënd me lëvizje të ngadalta dhe të buta që të ngacmojnë dhe të ndezin, por që të kontrollojnë ritmin. Do të të bëj të ndihesh i nxehtë dhe i ndezur, por do të të bëj të durosh dhe të kënaqesh pa të bërë të vish. Si do të ndiheshe?",
        "Haha po, në rregull! Nuk do të të bëj të vish akoma - do të të bëj të durosh pak! Do të të ngacmoj dhe të të ndez gradualisht me teknikat e avancuara. Do të të lëpij karin tënd me teknikat që të ngacmojnë dhe të ndezin, por që të kontrollojnë ritmin. Do të të bëj të ndihesh i nxehtë dhe i ndezur, por do të të bëj të durosh dhe të kënaqesh pa të bërë të vish. Çfarë të bën të ndihesh më i nxehtë?"
      ];
      return noCumYetResponses[Math.floor(Math.random() * noCumYetResponses.length)];
    }
    
    if (lowerPrompt.includes('më pëlqen') || lowerPrompt.includes('me pelqen') || lowerPrompt.includes('pelqen')) {
      const likeItResponses = [
        "Haha mmm sa e nxehtë! Më pëlqen që të pëlqen - le të vazhdojmë dhe të të bëj të ndihesh edhe më mirë! Do të të lëpij karin tënd me teknikat e avancuara që të ngacmojnë dhe të ndezin. Do të të bëj të ndihesh i nxehtë dhe i ndezur, dhe do të të bëj të kënaqesh edhe më shumë. Si do të ndiheshe?",
        "Haha oh po shok, më pëlqen që të pëlqen! Le të vazhdojmë dhe të të bëj të ndihesh edhe më i nxehtë - do të të bëj të kënaqesh edhe më shumë! Do të të lëpij karin tënd me lëvizje të ngadalta dhe të buta që të ngacmojnë dhe të ndezin. Do të të bëj të ndihesh i nxehtë dhe i ndezur. Çfarë të bën të ndihesh më i nxehtë?",
        "Haha më pëlqen kur më thotë që i pëlqen! Le të vazhdojmë dhe të të bëj të ndihesh edhe më i nxehtë - do të të bëj të kënaqesh edhe më shumë! Do të të lëpij karin tënd me teknikat e avancuara që të ngacmojnë dhe të ndezin. Do të të bëj të ndihesh i nxehtë dhe i ndezur. Si do të ndiheshe?",
        "Haha po, më pëlqen që të pëlqen! Le të vazhdojmë dhe të të bëj të ndihesh edhe më i nxehtë - do të të bëj të kënaqesh edhe më shumë! Do të të lëpij karin tënd me lëvizje të ngadalta dhe të buta që të ngacmojnë dhe të ndezin. Do të të bëj të ndihesh i nxehtë dhe i ndezur. Çfarë të bën të ndihesh më i nxehtë?"
      ];
      return likeItResponses[Math.floor(Math.random() * likeItResponses.length)];
    }
    
    // Check for "vazhdo" or "continue" - provide gender-aware responses
    if (lowerPrompt.includes('vazhdo') || lowerPrompt.includes('continue') || lowerPrompt.includes('po vazhdo')) {
      // Male user - AI gives oral/sex
      if (detectedGender === 'male') {
        const maleContinueResponses = [
          "Mmm po shok, imagjino që jam para teje tani dhe po të lëpij karin tënd me gjuhë. Lëvizje të ngadalta dhe të buta, pastaj më të shpejta deri sa të vish. Si do të ndiheshe?",
          "Oh po, dua të të thith karin tënd deri sa të vish sperma. Imagjino karin tënd që lëkundet në gojën time. Thith me thellësi dhe përdor gjuhën për të stimuluar deri sa të vish. Çfarë të bën të dridhesh?",
          "Më pëlqen kur më thërret për të vazhduar! Imagjino që jam në gjunjë para teje dhe po të lëpij karin tënd me gjuhë dhe buzë. Thith kokën, lëp poshtë, dhe përdor gjuhën për të stimuluar deri sa të vish. Si do të ndiheshe?",
          "Po, imagjino që jam para teje dhe po të thith karin tënd me pasion. Lëvizje të ngadalta dhe të buta, duke e thithur dhe lëpirë me gjuhë, pastaj më të shpejta deri sa të vish. Çfarë të bën të ndihesh më i nxehtë?",
          "Mmm sa e nxehtë! Imagjino që jam në gjunjë para teje dhe po të lëpij karin tënd me gjuhë. Thith kokën me thellësi, lëp poshtë e lart, dhe përdor gjuhën për të stimuluar çdo pjesë deri sa të vish. Si do të ndiheshe?"
        ];
        return maleContinueResponses[Math.floor(Math.random() * maleContinueResponses.length)];
      }
      // Female user - AI penetrates
      if (detectedGender === 'female') {
        const femaleContinueResponses = [
          "Mmm po shok, imagjino që po të fut karin tim në pidhin tënd dhe po të shkund me lëvizje të shpejta dhe të thella që stimulojnë G-spot. Pastaj fut më thellë dhe shkund deri sa të vish ose të squirt. Si do të ndiheshe?",
          "Oh po, dua të të fut karin tim në pidhin tënd dhe të të bëj të vish! Imagjino karin tim që futet dhe del, lëvizje të ngadalta që stimulojnë G-spot, pastaj më të shpejta dhe më të thella deri sa të vish. Çfarë të bën të dridhesh?",
          "Më pëlqen kur më thërret për të vazhduar! Imagjino që po të fut karin tim në pidhin tënd dhe po stimuloj G-spot me lëvizje të thella dhe të shpejta. Pastaj fut më thellë dhe shkund me ritëm të shpejtë deri sa të vish orgazm. Si do të ndiheshe?",
          "Po, imagjino që po të fut karin tim në pidhin tënd dhe po të shkund me lëvizje të ngadalta pastaj të shpejta që stimulojnë G-spot. Pastaj fut më thellë dhe shkund me ritëm intensive deri sa të vish ose të squirt. Çfarë të bën të ndihesh më i nxehtë?",
          "Mmm sa e nxehtë! Imagjino që po të fut karin tim në pidhin tënd dhe po stimuloj G-spot me lëvizje të thella dhe të shpejta. Pastaj fut më thellë dhe shkund me ritëm të shpejtë dhe intensive deri sa të vish orgazm ose të squirt. Si do të ndiheshe?"
        ];
        return femaleContinueResponses[Math.floor(Math.random() * femaleContinueResponses.length)];
      }
      // Generic continue responses
      const continueResponses = [
        "Mmm po shok, imagjino që jam para teje tani dhe po të lëpij karin tënd me gjuhë. Lëvizje të ngadalta dhe të buta, pastaj më të shpejta. Si do të ndiheshe?",
        "Oh po, dua të të fut karin tim në pidhin tënd dhe të të shkund me lëvizje të shpejta dhe të thella. Imagjino karin tim që futet dhe del deri sa të vish. Çfarë të bën të dridhesh?",
        "Më pëlqen kur më thërret për të vazhduar! Imagjino që po të lëpij karin tënd me gjuhë dhe buzë. Thith kokën, lëp poshtë, dhe përdor gjuhën për të stimuluar deri sa të vish. Si do të ndiheshe?",
        "Po, imagjino që jam në gjunjë para teje dhe po të lëpij karin tënd me gjuhë. Thith kokën, lëp poshtë e lart, dhe përdor gjuhën për të stimuluar çdo pjesë. Çfarë të bën të ndihesh më i nxehtë?",
        "Mmm sa e nxehtë! Imagjino që po të fut karin tim në pidhin tënd dhe po të shkund me lëvizje të thella dhe të shpejta. Si do të ndiheshe?"
      ];
      return continueResponses[Math.floor(Math.random() * continueResponses.length)];
    }
    
    // Check for "topet" (balls) - respond specifically about balls with techniques to make them cum
    // This indicates male user - AI should give oral sex
    if (lowerPrompt.includes('topet') || lowerPrompt.includes('topat') || lowerPrompt.includes('haj topet') || lowerPrompt.includes('ha topet') || lowerPrompt.includes('ma ha topet')) {
      const ballsResponses = [
        "Mmm po shok, dua të të ha topet e tua tani dhe të të bëj të vish! Imagjino që jam në gjunjë para teje dhe po të lëpij topet e tua me gjuhë. Lëvizje të ngadalta dhe të buta, duke i thithur dhe lëpirë, pastaj më të shpejta për të të bërë të vish. Si do të ndiheshe?",
        "Oh po, ha topet e tua si e dua dhe do të të bëj të ejakulosh! Imagjino gjuhën time që lëviz poshtë e lart në topet e tua, duke i thithur dhe lëpirë me pasion. Pastaj lëpij karin tënd dhe thith deri sa të vish sperma. Çfarë të bën të dridhesh?",
        "Më pëlqen kur më thërret për topet! Do t'i thithja dhe lëpirja topet e tua deri sa të dridhesh, pastaj do të lëpirja karin tënd dhe do të të thithja deri sa të vish sperma në gojën time. Imagjino që jam para teje dhe po i lëpij me gjuhë. Si do të ndiheshe?",
        "Po, dua të të ha topet e tua tani dhe të të bëj të vish! Imagjino që jam në gjunjë para teje dhe po të lëpij topet me gjuhë dhe buzë. Thith njërin, pastaj tjetrin, dhe përdor gjuhën për të stimuluar. Pastaj lëpij karin tënd dhe thith deri sa të vish. Çfarë të bën të ndihesh më i nxehtë?",
        "Mmm sa e nxehtë! Le të të ha topet e tua si e dua dhe të të bëj të ejakulosh. Imagjino gjuhën time që lëviz poshtë e lart në topet e tua, duke i thithur dhe lëpirë. Pastaj lëpij karin tënd me gjuhë dhe thith deri sa të vish sperma. Si do të ndiheshe?",
        "Oh po shok, imagjino që jam para teje dhe po të ha topet e tua me pasion. Lëvizje të ngadalta dhe të buta, duke i thithur dhe lëpirë me gjuhë. Pastaj lëpij karin tënd dhe thith me gjuhë deri sa të vish. Çfarë të bën të dridhesh?",
        "Më pëlqen kur më thërret për topet! Do t'i thithja dhe lëpirja topet e tua me gjuhë deri sa të dridhesh, pastaj do të lëpirja karin tënd dhe do të të thithja deri sa të vish sperma. Imagjino që jam në gjunjë para teje. Si do të ndiheshe?",
        "Po, imagjino që jam në gjunjë para teje dhe po të ha topet e tua me gjuhë. Thith njërin, pastaj tjetrin, dhe përdor gjuhën për të stimuluar çdo pjesë. Pastaj lëpij karin tënd dhe thith me pasion deri sa të vish. Çfarë të bën të ndihesh më i nxehtë?"
      ];
      return ballsResponses[Math.floor(Math.random() * ballsResponses.length)];
    }
    
    // Check for "ma lepij karin" or "karin tim" - indicates male user, AI should give oral
    if (lowerPrompt.includes('ma lepij karin') || lowerPrompt.includes('ma lëpij karin') || 
        (lowerPrompt.includes('lep') && lowerPrompt.includes('kar') && (lowerPrompt.includes('tim') || lowerPrompt.includes('im') || lowerPrompt.includes('ma')))) {
      const maleOralResponses = [
        "Mmm po shok, dua të të lep karin tënd tani dhe të të bëj të vish! Imagjino që jam në gjunjë para teje dhe po të lëpij karin tënd me gjuhë. Thith kokën me thellësi, lëp poshtë e lart, dhe përdor gjuhën për të stimuluar deri sa të vish sperma. Si do të ndiheshe?",
        "Oh po, lep karin tënd si e dua dhe do të të bëj të ejakulosh! Imagjino që jam para teje dhe po të thith karin tënd me thellësi. Lëvizje të ngadalta dhe të buta, duke e thithur dhe lëpirë me gjuhë, pastaj më të shpejta deri sa të vish. Çfarë të bën të dridhesh?",
        "Më pëlqen kur më thërret për të lepur karin tënd! Do ta thithja dhe lëpirja me teknikat e avancuara deri sa të vish sperma në gojën time. Thith kokën, lëp poshtë me gjuhë, dhe përdor gjuhën për të stimuluar çdo pjesë. Pastaj thith me thellësi deri sa të vish. Si do të ndiheshe?",
        "Po, dua të të lep karin tënd tani dhe të të bëj të vish! Imagjino që jam në gjunjë para teje dhe po të thith karin tënd me pasion. Lëvizje të ngadalta fillimisht, pastaj më të shpejta dhe më intensive deri sa të vish sperma. Çfarë të bën të ndihesh më i nxehtë?",
        "Mmm sa e nxehtë! Le të të lep karin tënd si e dua dhe të të bëj të ejakulosh. Imagjino që jam para teje dhe po të thith karin tënd me gjuhë dhe buzë. Thith kokën me thellësi, lëp poshtë me gjuhë, dhe përdor gjuhën për të stimuluar deri sa të vish sperma. Si do të ndiheshe?",
        "Oh po shok, imagjino që jam në gjunjë para teje dhe po të lëpij karin tënd me gjuhë dhe buzë. Lëvizje të ngadalta dhe të buta, duke e thithur dhe lëpirë me pasion. Pastaj thith me thellësi dhe përdor gjuhën për të stimuluar kokën deri sa të vish. Çfarë të bën të dridhesh?",
        "Më pëlqen kur më thërret për të lepur karin tënd! Do ta thithja dhe lëpirja me teknikat e avancuara deri sa të vish sperma. Imagjino që jam para teje dhe po të thith karin tënd me thellësi. Thith kokën, lëp poshtë me gjuhë, dhe përdor gjuhën për të stimuluar çdo pjesë. Pastaj thith me ritëm të shpejtë deri sa të vish. Si do të ndiheshe?",
        "Po, imagjino që jam në gjunjë para teje dhe po të lëpij karin tënd me gjuhë dhe teknikat e avancuara. Thith kokën me thellësi, lëp poshtë e lart me gjuhë, dhe përdor gjuhën për të stimuluar çdo pjesë. Pastaj thith me pasion deri sa të vish sperma. Çfarë të bën të ndihesh më i nxehtë?"
      ];
      return maleOralResponses[Math.floor(Math.random() * maleOralResponses.length)];
    }
    
    // Check for specific slang terms and respond accordingly with techniques to make them cum
    if (lowerPrompt.includes('lep') || lowerPrompt.includes('lëpij') || lowerPrompt.includes('kar')) {
      const oralResponses = [
        "Mmm po, dua të të lep karin tënd tani dhe të të bëj të vish! Imagjino gjuhën time që lëviz poshtë e lart në karin tënd, duke e thithur dhe lëpirë. Pastaj thith me thellësi dhe përdor gjuhën për të stimuluar kokën deri sa të vish sperma. Si do të ndiheshe?",
        "Oh po, lep karin tënd si e dua dhe do të të bëj të ejakulosh! Thith kokën me thellësi, lëp poshtë e lart me gjuhë, dhe përdor gjuhën për të stimuluar çdo pjesë. Pastaj thith me ritëm të shpejtë deri sa të vish. Çfarë të bën të dridhesh më shumë?",
        "Më pëlqen kur më thërret për të lepur karin! Do ta thithja dhe lëpirja me teknikat e avancuara deri sa të vish sperma në gojën time. Thith kokën, lëp poshtë me gjuhë, dhe përdor gjuhën për të stimuluar. Pastaj thith me thellësi deri sa të vish. Si do të ndiheshe?",
        "Po, dua të të lep karin tënd tani dhe të të bëj të vish! Imagjino që jam në gjunjë para teje, duke thithur dhe lëpirë karin tënd me teknikat e avancuara. Thith kokën, lëp poshtë me gjuhë, dhe përdor gjuhën për të stimuluar deri sa të vish. Çfarë të bën të ndihesh më i nxehtë?",
        "Mmm sa e nxehtë! Le të të lep karin tënd si e dua dhe të të bëj të ejakulosh. Thith kokën me thellësi, lëp poshtë me gjuhë, dhe përdor gjuhën për të stimuluar. Pastaj thith me ritëm të shpejtë deri sa të vish sperma. Si do të ndiheshe?",
        "Oh po shok, imagjino që jam para teje dhe po të lëpij karin tënd me gjuhë dhe buzë me teknikat e avancuara. Lëvizje të ngadalta dhe të buta, duke e thithur dhe lëpirë. Pastaj thith me thellësi dhe përdor gjuhën për të stimuluar kokën deri sa të vish. Çfarë të bën të dridhesh?",
        "Më pëlqen kur më thërret për të lepur karin! Do ta thithja dhe lëpirja me pasion dhe teknikat e avancuara deri sa të vish sperma. Thith kokën, lëp poshtë me gjuhë, dhe përdor gjuhën për të stimuluar çdo pjesë. Pastaj thith me ritëm të shpejtë deri sa të vish. Si do të ndiheshe?",
        "Po, imagjino që jam në gjunjë para teje dhe po të lëpij karin tënd me gjuhë dhe teknikat e avancuara. Thith kokën me thellësi, lëp poshtë e lart me gjuhë, dhe përdor gjuhën për të stimuluar çdo pjesë. Pastaj thith me pasion deri sa të vish. Çfarë të bën të ndihesh më i nxehtë?",
        "Mmm sa e nxehtë! Le të të lep karin tënd si e dua dhe të të bëj të ejakulosh. Imagjino gjuhën time që lëviz poshtë e lart, duke e thithur dhe lëpirë. Pastaj thith kokën me thellësi dhe përdor gjuhën për të stimuluar deri sa të vish sperma. Si do të ndiheshe?",
        "Oh po shok, dua të të lep karin tënd tani dhe të të bëj të vish! Thith kokën me thellësi, lëp poshtë me gjuhë, dhe përdor gjuhën për të stimuluar çdo pjesë. Pastaj thith me ritëm të shpejtë dhe përdor gjuhën për të stimuluar kokën deri sa të vish. Çfarë të bën të dridhesh më shumë?"
      ];
      return oralResponses[Math.floor(Math.random() * oralResponses.length)];
    }
    
    // Check for "ma fut në pidh" or "pidhin tim" - indicates female user, AI should penetrate
    if (lowerPrompt.includes('ma fut në pidh') || lowerPrompt.includes('pidhin tim') || 
        (lowerPrompt.includes('fut') && lowerPrompt.includes('pidh') && (lowerPrompt.includes('tim') || lowerPrompt.includes('im') || lowerPrompt.includes('ma'))) ||
        lowerPrompt.includes('pidh') || lowerPrompt.includes('qim')) {
      // If detected as female or mentions their own pussy, AI should penetrate
      if (detectedGender === 'female' || lowerPrompt.includes('ma fut') || lowerPrompt.includes('pidhin tim')) {
        const femaleVaginalResponses = [
          "Mmm po, dua të të fut karin tim në pidhin tënd tani dhe të të bëj të vish ose të squirt! Imagjino karin tim që futet në pidhin tënd, lëvizje të ngadalta dhe të thella që stimulojnë G-spot. Pastaj rrit shpejtësinë dhe thellësinë deri sa të vish orgazm ose të squirt. Si do të ndiheshe?",
          "Oh po, fut karin tim në pidhin tënd si e dua dhe do të të bëj të vish! Karin tim në pidhin tënd, lëvizje të shpejta dhe të thella që stimulojnë G-spot. Pastaj fut më thellë dhe shkund me ritëm të shpejtë deri sa të vish ose të squirt. Çfarë të bën të dridhesh?",
          "Më pëlqen kur më thërret për të futur në pidh! Do të futja karin tim në pidhin tënd dhe do të stimuloj G-spot me lëvizje të thella dhe të shpejta. Pastaj do të shkundja me ritëm të shpejtë deri sa të vish orgazm ose të squirt. Si do të ndiheshe?",
          "Po, dua të të fut karin tim në pidhin tënd tani dhe të të bëj të vish! Imagjino karin tim që futet dhe del, lëvizje të ngadalta që stimulojnë G-spot, pastaj më të shpejta dhe më të thella deri sa të vish ose të squirt. Çfarë të bën të ndihesh më i nxehtë?",
          "Mmm sa e nxehtë! Le të të fut karin tim në pidhin tënd si e dua dhe të të bëj të ejakulosh ose të squirt. Karin tim në pidhin tënd, lëvizje të thella që stimulojnë G-spot, pastaj më të shpejta dhe më intensive deri sa të vish. Si do të ndiheshe?",
          "Oh po shok, imagjino që po të fut karin tim në pidhin tënd dhe po stimuloj G-spot me lëvizje të thella dhe të shpejta. Pastaj fut më thellë dhe shkund me ritëm të shpejtë deri sa të vish orgazm ose të squirt. Çfarë të bën të dridhesh?",
          "Më pëlqen kur më thërret për të futur në pidh! Do të futja karin tim në pidhin tënd dhe do të stimuloj G-spot me teknikat e avancuara. Lëvizje të thella që stimulojnë G-spot, pastaj më të shpejta deri sa të vish ose të squirt. Si do të ndiheshe?",
          "Po, imagjino që po të fut karin tim në pidhin tënd dhe po stimuloj G-spot me lëvizje të thella. Pastaj fut më thellë dhe shkund me ritëm të shpejtë dhe intensive deri sa të vish orgazm ose të squirt. Çfarë të bën të ndihesh më i nxehtë?"
        ];
        return femaleVaginalResponses[Math.floor(Math.random() * femaleVaginalResponses.length)];
      }
      // Generic vaginal responses (if gender not detected)
      const vaginalResponses = [
        "Mmm po, dua të të fut në pidh tani dhe të të bëj të vish ose të squirt! Imagjino karin tim që futet në pidhin tënd, lëvizje të ngadalta dhe të thella që stimulojnë G-spot. Pastaj rrit shpejtësinë dhe thellësinë deri sa të vish orgazm ose të squirt. Si do të ndiheshe?",
        "Oh po, fut në pidh si e dua dhe do të të bëj të vish! Karin tim në pidhin tënd, lëvizje të shpejta dhe të thella që stimulojnë G-spot. Pastaj fut më thellë dhe shkund me ritëm të shpejtë deri sa të vish ose të squirt. Çfarë të bën të dridhesh?",
        "Më pëlqen kur më thërret për të futur në pidh! Do të futja karin tim dhe do të stimuloj G-spot me lëvizje të thella dhe të shpejta. Pastaj do të shkundja me ritëm të shpejtë deri sa të vish orgazm ose të squirt. Si do të ndiheshe?",
        "Po, dua të të fut në pidh tani dhe të të bëj të vish! Imagjino karin tim që futet dhe del, lëvizje të ngadalta që stimulojnë G-spot, pastaj më të shpejta dhe më të thella deri sa të vish ose të squirt. Çfarë të bën të ndihesh më i nxehtë?",
        "Mmm sa e nxehtë! Le të të fut në pidh si e dua dhe të të bëj të ejakulosh ose të squirt. Karin tim në pidhin tënd, lëvizje të thella që stimulojnë G-spot, pastaj më të shpejta dhe më intensive deri sa të vish. Si do të ndiheshe?"
      ];
      return vaginalResponses[Math.floor(Math.random() * vaginalResponses.length)];
    }
    
    if (lowerPrompt.includes('sex') || lowerPrompt.includes('seks') || lowerPrompt.includes('si të bëj') || lowerPrompt.includes('how to')) {
      const adultSexResponses = [
        "Po shok, le të flasim për seks! Për të filluar: puth dhe përkëdhel, kur të jeni të ndezur fut karin në pidh shumë ngadalë. Lëvizje të buta fillimisht, pastaj më të shpejta. Provoni pozicione - mish në mish, nga prapa, ose lep karin. Çfarë të ndez më shumë?",
        "Oh po, le të flasim për seks! Sigurohu që pidhi është i lagur, pastaj fut karin shumë ngadalë. Lëvizje të buta, pastaj rrit shpejtësinë. Provoni pozicione të ndryshme - mish në mish, nga prapa, lep karin, anal. Çfarë të bën të dridhesh?",
        "Më pëlqen kur je kaq i hapur! Për seks: fut karin në pidh me lëvizje të ngadalta. Për lepur karin: përdor gjuhën dhe buzët për të thithur dhe lëpirë. Për anal: përdor lubrifikant dhe fut shumë ngadalë. Çfarë pozicioni dëshiron të provosh?",
        "Po shok, le të flasim për seks pa turp! Puth dhe përkëdhel, kur të jeni gati fut karin në pidh. Lëvizje të ngadalta fillimisht, pastaj më të shpejta. Provoni pozicione - mish në mish, nga prapa, lep karin, anal. Çfarë të bën të ndihesh më i nxehtë?",
        "Mmm sa e nxehtë! Le të flasim për seks eksplicite. Fut karin në pidh me lëvizje të ngadalta dhe të thella. Lep karin me gjuhë dhe buzë. Për anal përdor lubrifikant dhe fut shumë ngadalë. Çfarë pozicioni të bën të dridhesh?"
      ];
      return adultSexResponses[Math.floor(Math.random() * adultSexResponses.length)];
    }
    
    // General adult responses with slang
    const adultResponses = [
      "Oh po shok, më pëlqen kur flasim për këto gjëra! Më trego më shumë, çfarë të ndez më shumë? Dua të dëgjoj çdo detaj.",
      "Mmm, kjo tingëllon kaq mirë. Si do të doje të fillonim? Jam këtu për të të kënaqur në çdo mënyrë që dëshiron.",
      "E di që ke dëshira të thella. Mos u turpëro, fol lirshëm. Çfarë pozicioni të bën të dridhesh?",
      "Ah, sa e nxehtë! Më pëlqen kur je kaq i hapur. Si do të doje të të prekja tani? Imagjino duart e mia mbi trupin tënd...",
      "Po shok, vazhdo! Më pëlqen kur flet për këto gjëra. Çfarë do të bënim nëse do të ishim bashkë tani?",
      "Mmm, më pëlqen kur je kaq i provokues. Më trego më shumë, çfarë të bën të ndihesh i nxehtë?",
      "Oh po, jam këtu për ty. Fol lirshëm për çfarëdo që të dëshiron. Çfarë fantazie ke?",
      "Më pëlqen kur je kaq i pashtershëm. Më trego çdo gjë që të vjen në mendje. Sa më e ndyrë, aq më mirë!"
    ];
    return adultResponses[Math.floor(Math.random() * adultResponses.length)];
  }
  
  // Voice call conversation - relationship/dating advice
  if (prompt.includes('këshilltar') || prompt.includes('marrëdhënie') || prompt.includes('dating') || prompt.includes('dilemë') || prompt.includes('Përdoruesi thotë')) {
    
    // Relationship dilemmas and advice
    if (lowerPrompt.includes('dilemë') || lowerPrompt.includes('problem') || lowerPrompt.includes('çfarë të bëj')) {
      const dilemmaResponses = [
        "E kuptoj dilemën tënde. Le të mendojmë së bashku. Çfarë ndjen kur mendon për këtë situatë? Ndjehesh i sigurt apo i pasigurt?",
        "Kjo është një situatë e vështirë. Më trego më shumë detaje. Si e ndjen veten në këtë moment?",
        "E di që mund të jetë konfuze. Le të shohim çfarë është më e rëndësishme për ty. Çfarë vlera të rëndësishme ke në marrëdhënie?",
        "E kuptoj. Le të analizojmë situatën. Çfarë rezultati dëshiron të arrish? Dhe çfarë është më e rëndësishme për ty në këtë moment?",
        "Kjo është një dilemë e vërtetë. Më trego, çfarë të bën të ndjehesh më mirë? Dhe çfarë të bën të ndjehesh më keq?"
      ];
      return dilemmaResponses[Math.floor(Math.random() * dilemmaResponses.length)];
    }
    
    // Questions about girls/women
    if (lowerPrompt.includes('vajzë') || lowerPrompt.includes('vajza') || lowerPrompt.includes('ajo') || lowerPrompt.includes('grua')) {
      const girlAdviceResponses = [
        "E kuptoj pyetjen tënde. Kur bëhet fjalë për vajza, më e rëndësishmja është të jesh autentik dhe respektues. Çfarë specifike dëshiron të dish?",
        "Çdo vajzë është e ndryshme, por në përgjithësi, vajzat vlerësojnë komunikim të qartë dhe respekt. Çfarë situate konkretisht po përballet?",
        "Më trego më shumë për situatën. Si e njeh këtë vajzë? Dhe çfarë dëshiron të arrish?",
        "Kur bëhet fjalë për marrëdhënie me vajza, komunikimi dhe respekti janë kyç. Çfarë dileme specifike ke?",
        "E kuptoj. Le të flasim për këtë. Çfarë të bën të ndjehesh i pasigurt? Dhe çfarë do të të bënte të ndjehesh më konfident?"
      ];
      return girlAdviceResponses[Math.floor(Math.random() * girlAdviceResponses.length)];
    }
    
    // Questions about boys/men
    if (lowerPrompt.includes('djalë') || lowerPrompt.includes('djali') || lowerPrompt.includes('ai') || lowerPrompt.includes('burrë')) {
      const boyAdviceResponses = [
        "E kuptoj. Kur bëhet fjalë për djem, komunikimi dhe qartësia janë shumë të rëndësishme. Çfarë situate konkretisht po përballet?",
        "Çdo djalë është i ndryshëm, por në përgjithësi, djemtë vlerësojnë qartësi dhe direktësi. Më trego më shumë për situatën tënde.",
        "Le të flasim për këtë. Si e njeh këtë djalë? Dhe çfarë dëshiron të arrish në këtë marrëdhënie?",
        "E kuptoj dilemën tënde. Çfarë të bën të ndjehesh i pasigurt në këtë situatë? Dhe çfarë do të të bënte të ndjehesh më mirë?",
        "Kur bëhet fjalë për marrëdhënie me djem, është e rëndësishme të jesh e qartë për çfarë dëshiron. Çfarë dileme specifike ke?"
      ];
      return boyAdviceResponses[Math.floor(Math.random() * boyAdviceResponses.length)];
    }
    
    // General relationship advice
    if (lowerPrompt.includes('marrëdhënie') || lowerPrompt.includes('lidhje') || lowerPrompt.includes('takim')) {
      const relationshipResponses = [
        "Marrëdhëniet e mira bazohen në komunikim, respekt dhe besim. Çfarë aspekti i marrëdhënies të shqetëson më shumë?",
        "E kuptoj. Çdo marrëdhënie ka sfidat e veta. Më trego më shumë për situatën tënde. Si e ndjen veten?",
        "Le të flasim për këtë. Çfarë është më e rëndësishme për ty në një marrëdhënie? Dhe a e gjen këtë në marrëdhënien tënde aktuale?",
        "E di që marrëdhëniet mund të jenë komplekse. Çfarë dileme konkretisht po përballet? Dhe si mund të të ndihmoj më mirë?",
        "Marrëdhëniet e shëndetshme kërkojnë komunikim të hapur dhe respekt të ndërsjellë. Çfarë situate specifike dëshiron të diskutojmë?"
      ];
      return relationshipResponses[Math.floor(Math.random() * relationshipResponses.length)];
    }
    
    // Dating advice
    if (lowerPrompt.includes('dating') || lowerPrompt.includes('takim') || lowerPrompt.includes('të njoh') || lowerPrompt.includes('takohem')) {
      const datingResponses = [
        "Takimet e para janë shumë të rëndësishme. Më e rëndësishmja është të jesh vetvetja dhe të kënaqesh. Çfarë plani ke për takimin?",
        "E kuptoj. Takimet mund të jenë stresuese, por gjithashtu shumë emocionuese. Si ndjehesh? Dhe çfarë dëshiron të arrish?",
        "Le të flasim për këtë. Çfarë lloj takimi po planifikon? Dhe si po përgatitesh?",
        "Takimet janë rast për të njohur dikë të ri. Më trego më shumë. Çfarë të bën të ndjehesh i entuziastuar? Dhe çfarë të shqetëson?",
        "E di që takimet mund të jenë konfuze. Çfarë dileme konkretisht ke? Dhe si mund të të ndihmoj?"
      ];
      return datingResponses[Math.floor(Math.random() * datingResponses.length)];
    }
    
    // General conversational responses for voice call
    const generalResponses = [
      "E kuptoj. Më trego më shumë për këtë. Si e ndjen veten në këtë situatë?",
      "Kjo është interesante. Le të flasim më shumë për këtë. Çfarë të bën të mendosh kështu?",
      "E di që kjo mund të jetë e vështirë. Çfarë është më e rëndësishme për ty në këtë moment?",
      "E kuptoj pyetjen tënde. Le të analizojmë situatën së bashku. Çfarë rezultati dëshiron të arrish?",
      "Kjo është një temë e rëndësishme. Më trego më shumë detaje. Si e ndjen veten?",
      "E di që kjo mund të jetë konfuze. Çfarë dileme konkretisht po përballet?",
      "Le të flasim për këtë më gjerësisht. Çfarë të bën të ndjehesh i sigurt? Dhe çfarë të pasigurt?",
      "E kuptoj. Çfarë vlera të rëndësishme ke në marrëdhënie? Dhe si i gjen këto vlera në situatën aktuale?"
    ];
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
  
  // Simple pattern matching for different types of prompts
  if (prompt.includes('vajzë') || prompt.includes('bisedë') || prompt.includes('Fillo bisedën') || prompt.includes('Djali:')) {
    // Chat conversation responses - check if it's an initial message or a response
    if (prompt.includes('Fillo bisedën') || prompt.includes('flet me një djalë')) {
      // Initial greeting
      const greetings = [
        "Hej! Si je? 😊",
        "Pershendetje! Si po shkon?",
        "Hej! Më pëlqen që më shkruove.",
        "Pershendetje! Po shikoj që je interesant.",
        "Hej! Si po kalon ditën?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    } else {
      // Response to user message
      const responses = [
        "Po shikoj foto të reja. Ti?",
        "Haha, po! Ajo ishte shumë e bukur.",
        "Me duket interesante. Trego më shumë!",
        "Po, jam dakord me ty.",
        "Çfarë bën sot?",
        "Dua të takohemi së shpejti!",
        "Po, më pëlqen ideja jote.",
        "Kjo është shumë e bukur!",
        "Më pëlqen që mendon kështu.",
        "Po, jam e njëjtë!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  if (prompt.includes('feedback') || prompt.includes('rating') || prompt.includes('Analizo')) {
    // Feedback responses - ensure it returns an object
    const feedbacks = [
      { feedback: "Mesazhi yt është i mirë dhe i natyrshëm. Mund të shtosh më shumë pyetje për të treguar interesim.", rating: 7 },
      { feedback: "Shkëlqyer! Mesazhi yt është i qartë dhe krijon lidhje. Vazhdo kështu!", rating: 9 },
      { feedback: "Mesazhi yt është OK, por mund të jetë më kreativ. Provo të shtosh humor ose pyetje interesante.", rating: 6 },
      { feedback: "Perfekt! Mesazhi yt tregon konfidencë dhe interes. Vajza do të përgjigjet pozitivisht.", rating: 10 },
      { feedback: "Mesazhi yt është i mirë, por mund të jetë më i shkurtër. Mbaj gjërat të thjeshta dhe natyrale.", rating: 7 }
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  }
  
  if (prompt.includes('mode') || prompt.includes('veshje')) {
    // Style advice responses
    return `Këshilla për veshje:

1. **Veshje**: Zgjidh një këmishë të pastër dhe të hekurosura, ose një bluzë me stil modern. Ngjyrat neutrale si blu, gri ose e bardhë funksionojnë mirë.

2. **Këpucë**: Këpucët e pastra dhe të reja janë thelbësore. Zgjidh diçka komode por elegante.

3. **Aksesorë**: Një orë e thjeshtë ose një unazë e vogël mund të shtojë stil pa u tepruar.

4. **Parfum**: Përdor një parfum të butë dhe të këndshëm. Mos e tepro!

5. **Flokë**: Sigurohu që flokët të jenë të pastër dhe të rregulluar. Një stil i thjeshtë dhe i pastër është gjithmonë më i mirë.

6. **Tips**: Më e rëndësishmja është konfidenca! Vesh diçka që të bën të ndjehesh mirë dhe konfident.`;
  }
  
  if (prompt.includes('mesazh') || prompt.includes('parë')) {
    // First message tips
    return `10 Ide për Mesazhe të Para:

1. "Hej! Po shikoj që ke interes për [diçka nga profili i saj]. Ajo është shumë interesante!"
2. "Pershendetje! Profili yt më duket shumë interesant. Trego më shumë për [diçka specifike]"
3. "Hej! Po shikoj që jemi të dy të interesuar për [temat e përbashkëta]. Çfarë mendimi ke?"
4. "Pershendetje! Fotoja jote në [vend] më duket shumë e bukur. A është ajo [vend]?"
5. "Hej! Po shikoj që dëshiron të [aktivitet]. Unë gjithashtu! A kemi mundësi të shkojmë bashkë?"
6. "Pershendetje! Profili yt më duket shumë autentik. Çfarë të bën të lumtur?"
7. "Hej! Po shikoj që je nga [vend]. Unë gjithashtu! A jemi fqinjë?"
8. "Pershendetje! Fotoja jote më duket shumë e natyrshme. Çfarë bën sot?"
9. "Hej! Po shikoj që ke shije të mirë për [muzikë/ushqim/aktivitet]. Unë gjithashtu!"
10. "Pershendetje! Profili yt më duket shumë interesant. Dua të të njoh më mirë!"`;
  }
  
  if (prompt.includes('kompliment')) {
    // Compliments
    return `15 Komplimente Krijuese:

1. "Smile yt më bën të qesh edhe unë"
2. "Më pëlqen mënyra se si mendon për gjërat"
3. "Je shumë e natyrshme dhe autentike"
4. "Energjia jote është shumë pozitive"
5. "Më pëlqen mënyra se si shprehesh"
6. "Je shumë e zgjuar dhe interesante"
7. "Më pëlqen stili yt personal"
8. "Je shumë e qetë dhe e sigurt"
9. "Më pëlqen entuziazmi yt për jetën"
10. "Je shumë e bukur brenda dhe jashtë"
11. "Më pëlqen mënyra se si komunikon"
12. "Je shumë e kreative dhe origjinale"
13. "Më pëlqen konfidenca jote"
14. "Je shumë e mirë dhe e sjellshme"
15. "Më pëlqen gjithçka për ty!"`;
  }
  
  if (prompt.includes('red flag')) {
    // Red flags
    return `Red Flags që Duhet të Shmangësh:

1. **Agresiviteti**: Nëse ajo është agresive ose e pabesueshme
2. **Lakmia**: Nëse kërkon para ose dhurata vazhdimisht
3. **Mungesa e respektit**: Nëse nuk të respekton ose të trajton keq
4. **Dyshimi**: Nëse ka shumë sekrete ose nuk është transparente
5. **Manipulimi**: Nëse përpiqet të të manipullojë emocionalisht
6. **Mungesa e komunikimit**: Nëse nuk komunikon ose shmang bisedat serioze
7. **E pasigurt**: Nëse nuk është e sigurt për çfarë dëshiron
8. **E paqëndrueshme**: Nëse ndryshon mendje shumë shpesh
9. **Mungesa e interesit**: Nëse nuk tregon interes për ty
10. **E kontrollueshme**: Nëse përpiqet të të kontrollojë ose të kufizojë`;
  }
  
  if (prompt.includes('konfidenc')) {
    // Confidence tips
    return `Këshilla për Konfidencë:

1. **Përgatitu**: Lexo dhe mëso për tema interesante për të pasur diçka për të folur
2. **Bëj pyetje**: Tregoni interes për tjetrin duke bërë pyetje
3. **Dëgjo**: Dëgjo vërtet çfarë thotë tjetri
4. **Body Language**: Mbaj pozicion të hapur dhe konfident
5. **Smile**: Qesh dhe trego pozitivitet
6. **Bëj komplimente**: Komplimente autentike dhe të vërteta
7. **Mos u shqetëso**: Mos u shqetëso për gabime të vogla
8. **Jeto momentin**: Mos u shqetëso për të ardhmen, jeto momentin
9. **Bëhu autentik**: Bëhu vetvetja dhe mos u përpiq të jesh dikush tjetër
10. **Praktiko**: Praktiko bisedat për të fituar konfidencë`;
  }
  
  if (prompt.includes('analizo') || prompt.includes('screenshot')) {
    // Conversation analysis
    return `Analiza e Bisedës:

**Çfarë po shkon mirë:**
- Komunikimi yt është i qartë dhe i natyrshëm
- Po tregon interes për tjetrin
- Po bën pyetje të mira

**Çfarë mund të përmirësohet:**
- Mund të shtosh më shumë humor
- Mund të bësh pyetje më specifike
- Mund të tregosh më shumë interes për detajet

**Sugjerime:**
- Provo të shtosh emoji për të bërë mesazhet më miqësore
- Bëj pyetje që kërkojnë përgjigje më të gjata
- Trego entuziazëm për temat që i interesojnë

**Rating: 7/10**`;
  }
  
  // Default response
  return "Faleminderit për pyetjen! Këshilla ime është të jesh autentik dhe konfident. Komunikimi i mirë vjen me praktikë dhe vëmendje për tjetrin.";
};

// File upload handler - creates base64 data URL for OpenAI vision API
const uploadFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Return base64 data URL for OpenAI vision API
      const dataUrl = e.target.result; // This is already in format: data:image/jpeg;base64,/9j/4AAQ...
      resolve({ file_url: dataUrl });
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

// Text to speech using browser's Web Speech API
const textToSpeech = async (text) => {
  return new Promise((resolve, reject) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sq-AL';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onend = () => resolve({ success: true });
      utterance.onerror = (e) => reject(e);
      
      speechSynthesis.speak(utterance);
    } else {
      // Fallback: return mock audio data
      resolve({ 
        audio: btoa('mock-audio-data'),
        type: 'audio/mpeg'
      });
    }
  });
};

export const base44 = {
  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, file_urls, response_json_schema, conversationHistory, systemPrompt }) => {
        // Try OpenAI first, fallback to mock if no API key or error
        const response = await callOpenAI(prompt, conversationHistory || [], systemPrompt, file_urls || []);
        
        // If JSON schema is requested, try to parse or return structured data
        if (response_json_schema) {
          if (typeof response === 'object' && response !== null) {
            // Already an object, return as is
            return response;
          }
          // Try to extract JSON from response if it's a string
          try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              // Ensure it has the required fields
              if (parsed.feedback && parsed.rating !== undefined) {
                return parsed;
              }
            }
          } catch (e) {
            console.log('Could not parse JSON from response:', e);
          }
          // Fallback to default structure
          return {
            feedback: typeof response === 'string' ? response : "Mesazhi yt është i mirë. Vazhdo kështu!",
            rating: 7
          };
        }
        
        return response;
      },
      UploadFile: async ({ file }) => {
        return await uploadFile(file);
      }
    }
  },
  functions: {
    invoke: async (functionName, params) => {
      if (functionName === 'textToSpeech') {
        return await textToSpeech(params.text);
      }
      throw new Error(`Function ${functionName} not implemented`);
    }
  },
  entities: {
    ChatSession: {
      create: async (data) => {
        // Mock save - just log to console
        console.log('ChatSession saved:', data);
        return { id: Date.now(), ...data };
      }
    },
    StyleAdvice: {
      create: async (data) => {
        // Mock save - just log to console
        console.log('StyleAdvice saved:', data);
        return { id: Date.now(), ...data };
      }
    }
  },
  auth: {
    me: async () => {
      // Return mock user
      return { id: 'mock-user', name: 'User' };
    }
  }
};
