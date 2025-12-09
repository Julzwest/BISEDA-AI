import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { text } = await req.json();

        if (!text) {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }

        const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'tts-1',
                voice: 'nova',
                input: text,
                speed: 1.0
            }),
        });

        if (!openaiResponse.ok) {
            const error = await openaiResponse.text();
            return Response.json({ error: `OpenAI API error: ${error}` }, { status: openaiResponse.status });
        }

        const audioBuffer = await openaiResponse.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

        return Response.json({ 
            audio: base64Audio,
            type: 'audio/mpeg'
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});

