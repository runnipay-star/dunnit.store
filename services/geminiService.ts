
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProductDetails, GeneratedContent, FormFieldConfig, Testimonial, UiTranslation, PageTone, AIImageStyle } from "../types";

const DISCLAIMER_BASE = "Il nostro sito web agisce esclusivamente come affiliato e si concentra sulla promozione dei prodotti tramite campagne pubblicitarie. Non ci assumiamo alcuna responsabilità per la spedizione, la qualità o qualsiasi altra questione riguardante i prodotti venduti tramite link di affiliazione. Ti preghiamo di notare che le immagini utilizzate a scopo illustrativo potrebbero non corrispondere alla reale immagine del prodotto acquistato. Ti invitiamo a contattare il servizio assistenza clienti dopo aver inserito i dati nel modulo per chiedere qualsiasi domanda o informazione sul prodotto prima di confermare l’ordine. Ti informiamo inoltre che i prodotti in omaggio proposti sul sito possono essere soggetti a disponibilità limitata, senza alcuna garanzia di disponibilità da parte del venditore che spedisce il prodotto. Ricorda che, qualora sorgessero problemi relativi alle spedizioni o alla qualità dei prodotti, la responsabilità ricade direttamente sull’azienda fornitrice.";

export const TIKTOK_SLIDER_HTML = `
<style>
    .slider-containerv8 {
        position: relative;
        width: 100%;
        overflow-x: auto;
        display: flex;
        align-items: center;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        max-width: 1200px;
        margin-left: auto;
        margin-right: auto;
        padding: 40px 10px;
        overscroll-behavior-x: contain;
    }
    .sliderv8 {
        display: flex;
        gap: 15px;
        padding-right: 40px;
    }
    .slidev8 {
        flex: 0 0 75%;
        max-width: 320px;
        scroll-snap-align: center;
        scroll-snap-stop: always;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        will-change: transform;
        transform: translateZ(0);
    }
    @media screen and (min-width: 769px){
        .slidev8 {
            flex: 0 0 25%;
            max-width: 260px;
        }
    }
    .tiktok-videov8 {
        width: 100%;
        height: auto;
        aspect-ratio: 9 / 16;
        border-radius: 15px;
        display: block;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
        background: #000;
        object-fit: cover;
    }
    .slider-containerv8::-webkit-scrollbar { height: 4px; }
    .slider-containerv8::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
    .slider-containerv8::-webkit-scrollbar-track { background: transparent; }
    .with-borderv8 {
        padding: 4px;
        border-radius: 18px;
        background: linear-gradient(0deg, #fe2d52, #28ffff);
        width: 100%;
        pointer-events: none; /* Assicura che i tocchi passino al video/slider */
    }
    .with-borderv8 > video { pointer-events: auto; }
</style>
<div class="slider-containerv8">
    <div class="sliderv8">
        <div class="slidev8">
           <div class="with-borderv8">
            <video class="tiktok-videov8" playsinline loop muted preload="metadata">
                <source src="https://cdn.shopify.com/videos/c/o/v/0e7bd7ed6340476b9b94ab12a8e5ab12.mp4">
            </video>
            </div>
        </div>
        <div class="slidev8">
            <div class="with-borderv8">
            <video class="tiktok-videov8" playsinline loop muted preload="metadata">
                <source src="https://cdn.shopify.com/videos/c/o/v/d4dfdd955f2840b1b63b223ecc77cafd.mp4" type="video/mp4">
            </video>
            </div>
        </div>
        <div class="slidev8">
            <div class="with-borderv8">
            <video class="tiktok-videov8" playsinline loop muted preload="metadata">
                <source src="https://cdn.shopify.com/videos/c/o/v/171162a47d1b44f1a042656ad7f85d02.mp4" type="video/mp4">
            </video>
            </div>
        </div>
        <div class="slidev8">
            <div class="with-borderv8">
            <video class="tiktok-videov8" playsinline loop muted preload="metadata">
                <source src="https://cdn.shopify.com/videos/c/o/v/d8d1ca1c53114802a2d840e57fcd7e75.mp4" type="video/mp4">
            </video>
            </div>
        </div>
    </div>
</div>
<script>
    (function() {
        const videos = document.querySelectorAll(".tiktok-videov8");
        
        // Interaction: click to toggle mute/play
        videos.forEach(v => {
            v.addEventListener('click', () => {
                if (v.paused) v.play();
                else v.pause();
                v.muted = false; // Attiva l'audio alla prima interazione
            });
        });

        // Smart loading/playback via IntersectionObserver
        if ('IntersectionObserver' in window) {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    if (entry.isIntersecting) {
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.6 });

            videos.forEach(v => obs.observe(v));
        } else {
            // Fallback for older browsers
            videos.forEach(v => v.play().catch(() => {}));
        }
    })();
</script>
`;

const COMMON_UI_DEFAULTS: Partial<UiTranslation> = {
    reviews: "Recensioni",
    cardErrorTitle: "Attenzione",
    cardErrorMsg: "Al momento non possiamo accettare pagamenti con carta. Scegli come procedere:",
    switchToCod: "Paga comodamente alla consegna",
    mostPopular: "Più scelto",
    giveUpOffer: "Rinuncia all'offerta e allo sconto",
    confirmCod: "Conferma Contrassegno",
    card: "Carta di Credito",
    cod: "Pagamento alla Consegna",
    paymentMethod: "Metodo di Pagamento",
    shippingInfo: "Dati per la Spedizione",
    checkoutHeader: "Checkout",
    completeOrder: "Completa l'Ordine",
    backToShop: "Torna allo Shop",
    socialProof: "altre {x} persone hanno acquistato",
    shippingInsurance: "Assicurazione Spedizione",
    gadgetLabel: "Aggiungi Gadget",
    shippingInsuranceDescription: "Pacco protetto contro furto e smarrimento.",
    gadgetDescription: "Aggiungilo al tuo ordine.",
    freeLabel: "Gratis",
    summaryProduct: "Prodotto:",
    summaryShipping: "Spedizione:",
    summaryInsurance: "Assicurazione:",
    summaryGadget: "Gadget:",
    summaryTotal: "Totale:",
    socialProofAction: "ha appena acquistato",
    socialProofFrom: "da",
    socialProofBadgeName: "Alessandro",
    onlyLeft: "Solo {x} rimasti a magazzino",
    original: "Originale",
    express: "Espresso",
    warranty: "Garanzia",
    certified: "Acquisto Verificato",
    techDesign: "Tecnologia & Design",
    localizedCities: ["Roma", "Milano", "Napoli", "Torino", "Palermo", "Genova", "Bologna", "Firenze", "Bari", "Catania"],
    localizedNames: ["Alessandro", "Marco", "Giulia", "Luca", "Sofia", "Alessandro", "Francesca", "Matteo", "Chiara", "Lorenzo"],
    timelineOrdered: "Ordinato",
    timelineReady: "Ordine Pronto",
    timelineDelivered: "Consegnato",
    thankYouTitle: "Grazie per il tuo acquisto {name}! ",
    thankYouMsg: " Il tuo ordine è in fase di elaborazione. Verrai contattato telefonicamente o su whatsapp al numero {phone} per la conferma."
};

/**
 * Fixed to strictly follow API key usage guidelines.
 * Always initializes GoogleGenAI with process.env.API_KEY.
 */
const getAIInstance = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getLanguageConfig = (lang: string) => {
    const configs: Record<string, any> = {
        'Italiano': { currency: '€', locale: 'it-IT', country: 'Italia' },
    };
    return configs[lang] || configs['Italiano'];
};

const cleanJson = (text: any) => {
    if (typeof text !== 'string') return '{}';
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIdx = -1;
    let endChar = '';
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        endChar = '}';
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
        endChar = ']';
    }
    if (startIdx !== -1) {
        const lastIdx = cleaned.lastIndexOf(endChar);
        if (lastIdx !== -1) {
            return cleaned.substring(startIdx, lastIdx + 1);
        }
    }
    return cleaned;
};

export const generateLandingPage = async (product: ProductDetails, reviewCount: number): Promise<GeneratedContent> => {
    const ai = getAIInstance();
    const langConfig = getLanguageConfig('Italiano');
    
    const prompt = `
    Generate a high-converting landing page JSON for a product with the following details:
    Name: ${product.name}
    Niche: ${product.niche}
    Target: ${product.targetAudience}
    Description: ${product.description}
    Tone: ${product.tone}
    Language: Italiano
    Features Count: ${product.featureCount || 3}
    Currency Symbol: ${langConfig.currency}

    Instructions:
    - All text content must be in Italiano.
    - MANDATORY: DO NOT use generic slogans like "Miglior Scelta 2023" or "Prodotto scelto da migliaia".
    - Instead, focus on product-specific benefits and clear calls to action.
    - FORBIDDEN: Do not mention dates like "2023" or "2024" in marketing slogans.
    - Provide 10 real common Italian cities and 10 common Italian names for localizedCities and localizedNames.
    - IMPORTANT: Include a "boxContent" object with a title like "Cosa Trovi nella Confezione?" and an array of items (exactly what's in the box, e.g., "1x Prodotto", "Manuale d'istruzioni").
    - IMPORTANT: Include a "bottomOffer" section for a special price block at the end of the page.
      - bottomOffer.title: Must be "${product.name} Oggi"
      - bottomOffer.subtitle: A persuasive short text.
      - bottomOffer.scarcityText: Must be "OFFERTA VALIDA SOLO PER OGGI"
      - bottomOffer.ctaText: A long persuasive button text like "Acquista Ora e Rivoluziona i Tuoi Lavori con Sconto del 50%" (personalized for this specific product niche).
    - Follow the GeneratedContent interface structure strictly.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    subheadline: { type: Type.STRING },
                    ctaText: { type: Type.STRING },
                    ctaSubtext: { type: Type.STRING },
                    announcements: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                icon: { type: Type.STRING }
                            },
                            required: ["text", "icon"]
                        }
                    },
                    featuresSectionTitle: { type: Type.STRING },
                    benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                    features: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                showCta: { type: Type.BOOLEAN }
                            },
                            required: ["title", "description"]
                        }
                    },
                    boxContent: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            items: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["title", "items"]
                    },
                    bottomOffer: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            subtitle: { type: Type.STRING },
                            ctaText: { type: Type.STRING },
                            scarcityText: { type: Type.STRING }
                        },
                        required: ["title", "subtitle", "ctaText", "scarcityText"]
                    },
                    uiTranslation: { 
                        type: Type.OBJECT,
                        properties: {
                            reviews: { type: Type.STRING },
                            checkoutHeader: { type: Type.STRING },
                            completeOrder: { type: Type.STRING },
                            shippingInsurance: { type: Type.STRING },
                            shippingInsuranceDescription: { type: Type.STRING },
                            gadgetLabel: { type: Type.STRING },
                            gadgetDescription: { type: Type.STRING },
                            paymentMethod: { type: Type.STRING },
                            cod: { type: Type.STRING },
                            card: { type: Type.STRING },
                            shippingInfo: { type: Type.STRING },
                            secure: { type: Type.STRING },
                            returns: { type: Type.STRING },
                            original: { type: Type.STRING },
                            express: { type: Type.STRING },
                            warranty: { type: Type.STRING },
                            certified: { type: Type.STRING },
                            techDesign: { type: Type.STRING },
                            privacyPolicy: { type: Type.STRING },
                            termsConditions: { type: Type.STRING },
                            cookiePolicy: { type: Type.STRING },
                            rightsReserved: { type: Type.STRING },
                            generatedPageNote: { type: Type.STRING },
                            nameLabel: { type: Type.STRING },
                            phoneLabel: { type: Type.STRING },
                            emailLabel: { type: Type.STRING },
                            addressLabel: { type: Type.STRING },
                            cityLabel: { type: Type.STRING },
                            capLabel: { type: Type.STRING },
                            provinceLabel: { type: Type.STRING },
                            addressNumberLabel: { type: Type.STRING },
                            legalDisclaimer: { type: Type.STRING },
                            thankYouTitle: { type: Type.STRING },
                            thankYouMsg: { type: Type.STRING },
                            socialProofAction: { type: Type.STRING },
                            socialProofFrom: { type: Type.STRING },
                            socialProofBadgeName: { type: Type.STRING },
                            socialProof: { type: Type.STRING },
                            onlyLeft: { type: Type.STRING },
                            summaryProduct: { type: Type.STRING },
                            summaryShipping: { type: Type.STRING },
                            summaryInsurance: { type: Type.STRING },
                            summaryGadget: { type: Type.STRING },
                            summaryTotal: { type: Type.STRING },
                            localizedCities: { type: Type.ARRAY, items: { type: Type.STRING } },
                            localizedNames: { type: Type.ARRAY, items: { type: Type.STRING } },
                            timelineOrdered: { type: Type.STRING },
                            timelineReady: { type: Type.STRING },
                            timelineDelivered: { type: Type.STRING }
                        }
                    },
                    price: { type: Type.STRING },
                    originalPrice: { type: Type.STRING },
                },
                required: ["headline", "subheadline", "ctaText", "benefits", "features", "uiTranslation", "announcements", "boxContent", "bottomOffer"]
            }
        }
    });

    const responseText = response.text || '{}';
    const baseContent = JSON.parse(cleanJson(responseText)) as any;
    
    const randomSocialProofCount = Math.floor(Math.random() * (1500 - 401) + 401);
    const names = baseContent.uiTranslation?.localizedNames || COMMON_UI_DEFAULTS.localizedNames || [];
    const randomName = names.length > 0 ? names[Math.floor(Math.random() * names.length)] : "Alessandro";

    return {
        ...baseContent,
        language: 'Italiano',
        currency: langConfig.currency,
        niche: product.niche,
        templateId: 'gadget-cod',
        colorScheme: 'blue',
        backgroundColor: '#ffffff',
        buttonColor: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200',
        checkoutButtonColor: 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200',
        announcementBgColor: '#0f172a',
        announcementTextColor: '#ffffff',
        stockConfig: { enabled: true, quantity: 13, textOverride: "Solo {x} rimasti a magazzino" },
        socialProofConfig: { enabled: true, intervalSeconds: 10, maxShows: 4 },
        socialProofCount: randomSocialProofCount,
        showSocialProofBadge: true,
        showDeliveryTimeline: true,
        extraLandingHtml: TIKTOK_SLIDER_HTML, // Integrazione del blocco video TikTok
        insuranceConfig: { enabled: true, label: baseContent.uiTranslation?.shippingInsurance || "Assicurazione Spedizione", cost: "4.90", defaultChecked: true },
        gadgetConfig: { enabled: true, label: baseContent.uiTranslation?.gadgetLabel || "Gadget Omaggio", cost: "0.00", defaultChecked: true },
        boxContent: {
            enabled: true,
            title: baseContent.boxContent?.title || "Cosa Trovi nella Confezione?",
            items: baseContent.boxContent?.items || []
        },
        bottomOffer: {
            enabled: true,
            ...baseContent.bottomOffer
        },
        formConfiguration: [
            { id: 'name', label: baseContent.uiTranslation?.nameLabel || 'Nome e Cognome', enabled: true, required: true, type: 'text', width: 12, validationType: 'none' },
            { id: 'phone', label: baseContent.uiTranslation?.phoneLabel || 'Telefono', enabled: true, required: true, type: 'tel', width: 12, validationType: 'numeric' },
            { id: 'email', label: baseContent.uiTranslation?.emailLabel || 'Email', enabled: false, required: false, type: 'email', width: 12, validationType: 'none' },
            { id: 'address', label: baseContent.uiTranslation?.addressLabel || 'Indirizzo', enabled: true, required: true, type: 'text', width: 9, validationType: 'none' },
            { id: 'address_number', label: baseContent.uiTranslation?.addressNumberLabel || 'N° Civico', enabled: true, required: true, type: 'text', width: 3, validationType: 'numeric' },
            { id: 'city', label: baseContent.uiTranslation?.cityLabel || 'Città', enabled: true, required: true, type: 'text', width: 8, validationType: 'none' },
            { id: 'province', label: baseContent.uiTranslation?.provinceLabel || 'Provincia (Sigla)', enabled: true, required: true, type: 'text', width: 4, validationType: 'alpha' },
            { id: 'cap', label: baseContent.uiTranslation?.capLabel || 'CAP', enabled: true, required: true, type: 'text', width: 12, validationType: 'numeric' },
        ],
        uiTranslation: {
            ...COMMON_UI_DEFAULTS,
            ...baseContent.uiTranslation,
            socialProof: "altre {x} persone hanno acquistato",
            socialProofBadgeName: randomName,
            certified: "Acquisto Verificato",
            currencyPos: 'before',
            legalDisclaimer: baseContent.uiTranslation?.legalDisclaimer || DISCLAIMER_BASE,
        } as UiTranslation
    };
};

export const translateLandingPage = async (content: GeneratedContent, targetLang: string): Promise<GeneratedContent> => {
    return content;
};

/**
 * Generates customer reviews.
 * If a high count is requested (like 697), we batch the requests because 
 * LLMs cannot output hundreds of structured JSON objects in one go without truncation.
 */
export const generateReviews = async (product: ProductDetails, language: string, count: number): Promise<Testimonial[]> => {
    const ai = getAIInstance();
    const today = new Date();
    const dateStr = today.toLocaleDateString('it-IT');
    const referenceImages = (product.images || []).filter(img => img.startsWith('data:image'));

    const allReviews: Testimonial[] = [];
    const batchSize = 25; // Safe number for consistent JSON output
    // Cap at 100 total generated unique reviews to keep response times within reasonable limits
    const target = Math.min(count, 100); 

    for (let currentStart = 0; currentStart < target; currentStart += batchSize) {
        const remaining = target - currentStart;
        const batchToGen = Math.min(remaining, batchSize);
        
        const contentsParts: any[] = [];
        const promptText = `
        TASK: Generate EXACTLY ${batchToGen} unique and realistic customer reviews for the product "${product.name}" in Italiano.

        CONTEXT:
        - Description: "${product.description}"
        - Current Date: ${dateStr}
        
        Instructions:
        - Return ONLY a JSON Array of EXACTLY ${batchToGen} objects.
        - Each review must have a unique tone, unique name, and unique city.
        - Focus on different product-specific aspects (speed, quality, ease of use).
        - MANDATORY: The verification status is ALWAYS "Acquisto Verificato".
        - Dates should be formatted as "DD MMM YYYY".
        - Each review needs name, title, rating (4-5 stars), text, and date.`;

        contentsParts.push({ text: promptText });

        if (referenceImages.length > 0) {
            const refImg = referenceImages[Math.floor(Math.random() * referenceImages.length)];
            const base64Data = refImg.split(',')[1];
            const mimeType = refImg.split(';')[0].split(':')[1];
            contentsParts.push({
                inlineData: { data: base64Data, mimeType: mimeType }
            });
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: { parts: contentsParts },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                title: { type: Type.STRING },
                                text: { type: Type.STRING },
                                role: { type: Type.STRING },
                                rating: { type: Type.NUMBER },
                                date: { type: Type.STRING },
                                images: { type: Type.ARRAY, items: { type: Type.STRING } }
                            },
                            required: ["name", "text", "rating", "date"]
                        }
                    }
                }
            });

            const responseText = response.text || '[]';
            const parsed = JSON.parse(cleanJson(responseText));
            if (Array.isArray(parsed)) {
                allReviews.push(...parsed);
            }
        } catch (e) {
            console.error(`Failed to parse reviews batch starting at ${currentStart}:`, e);
        }
    }

    return allReviews;
};

export const generateActionImages = async (product: ProductDetails, styles: AIImageStyle[], count: number, customPrompt?: string): Promise<string[]> => {
    const ai = getAIInstance();
    const referenceImages = (product.images || []).filter(img => img.startsWith('data:image'));

    // Eseguiamo le generazioni in parallelo per velocità e per rispettare il numero richiesto
    const generationTasks = Array.from({ length: count }).map(async (_, i) => {
        const style = styles[i % styles.length];
        const stylePrompts: Record<AIImageStyle, string> = {
            'lifestyle': 'Place the product in a realistic home or outdoor environment with natural lighting and human interaction.',
            'technical': 'Professional studio close-up focusing on premium textures, materials and mechanical details.',
            'informative': 'Clear commercial product shot, perfectly centered, showing the full object with no distractions.'
        };

        const promptText = `TASK: Generate a professional ultra-high quality ${style} photograph for the product "${product.name}".
        
        Product Context: "${product.description}"
        ${customPrompt ? `SPECIFIC USER REQUEST: "${customPrompt}"` : ''}
        
        Visual Style: ${stylePrompts[style]}.
        Ensure the lighting is cinematic and the colors are vibrant but realistic.`;

        const contentsParts: any[] = [{ text: promptText }];
        
        if (referenceImages.length > 0) {
            const refImg = referenceImages[i % referenceImages.length];
            const base64Data = refImg.split(',')[1];
            const mimeType = refImg.split(';')[0].split(':')[1];
            
            contentsParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            });
        }

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: contentsParts },
                config: {
                    imageConfig: { aspectRatio: "1:1" }
                }
            });

            const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
            if (part?.inlineData?.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        } catch (err) {
            console.error(`AI Image generation task ${i} failed:`, err);
        }
        return null;
    });

    const results = await Promise.all(generationTasks);
    return results.filter(img => img !== null) as string[];
};

export const rewriteLandingPage = async (content: GeneratedContent, tone: PageTone): Promise<GeneratedContent> => {
    const ai = getAIInstance();
    
    const textFields = {
        headline: content.headline,
        subheadline: content.subheadline,
        ctaText: content.ctaText,
        ctaSubtext: content.ctaSubtext,
        benefits: content.benefits,
        features: content.features.map(f => ({ title: f.title, description: f.description })),
        announcements: content.announcements?.map(a => a.text),
        boxContent: content.boxContent,
        bottomOffer: content.bottomOffer
    };

    const prompt = `Rewrite the following landing page content to have a ${tone} tone in Italiano: ${JSON.stringify(textFields)}`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    headline: { type: Type.STRING },
                    subheadline: { type: Type.STRING },
                    ctaText: { type: Type.STRING },
                    ctaSubtext: { type: Type.STRING },
                    benefits: { type: Type.ARRAY, items: { type: Type.STRING } },
                    features: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING }
                            }
                        }
                    },
                    boxContent: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            items: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    },
                    bottomOffer: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            subtitle: { type: Type.STRING },
                            ctaText: { type: Type.STRING },
                            scarcityText: { type: Type.STRING }
                        }
                    },
                    announcements: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
        }
    });

    const translated = JSON.parse(cleanJson(response.text || '{}'));

    return {
        ...content,
        ...translated,
        features: content.features.map((f, i) => ({
            ...f,
            title: translated.features?.[i]?.title || f.title,
            description: translated.features?.[i]?.description || f.description
        })),
        announcements: content.announcements?.map((a, i) => ({
            ...a,
            text: translated.announcements?.[i] || a.text
        }))
    };
};
