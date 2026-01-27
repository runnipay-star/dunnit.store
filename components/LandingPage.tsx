
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedContent, TemplateId, FormFieldConfig, TypographyConfig, Testimonial, AnnouncementItem, SiteConfig, FinalOfferSection } from '../types';
import { CheckCircle, Star, ShoppingCart, ArrowRight, ShieldCheck, Clock, Menu, User, CheckSquare, Truck, MessageCircle, X, Phone, MapPin, FileText, Loader2, Mail, Home, Image as ImageIcon, CreditCard, Banknote, ChevronDown, Zap, RefreshCcw, Check, Lock, Package, Eye, ThumbsUp, Flame, AlertTriangle, ShoppingBag, Bell, Maximize2, Gift, Shield, BadgeCheck } from 'lucide-react';

export interface OrderData {
    name?: string;
    phone?: string;
    price?: string;
}

interface LandingPageProps {
  content: GeneratedContent;
  thankYouSlug?: string; // Optional: if present, enables redirect logic
  onRedirect?: (data?: OrderData) => void; // Optional: handles redirect in preview mode without reload
  onPurchase?: (pageUrl: string) => void; // For live tracking
  siteConfig?: SiteConfig; // NEW: Per mostrare info globali nel footer
}

interface TemplateProps {
    content: GeneratedContent;
    onBuy: () => void;
    btnClass?: string;
    textClass?: string;
    styles: ReturnType<typeof getTypographyStyles>;
    siteConfig?: SiteConfig;
}

const TY_SUFFIXES: Record<string, string> = {
    'Italiano': '-grazie'
};

/**
 * Componente per iniettare HTML in modo memorizzato.
 * Previene il re-mounting del DOM (e il reset dello scroll degli slider) 
 * quando il componente padre si aggiorna per stati frequenti come annunci o notifiche.
 */
const MemoizedHTML = React.memo(({ html, className }: { html: string, className?: string }) => {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
});

const getIconById = (id?: string, size: number = 14) => {
    const props = { className: "shrink-0", style: { width: `${size}px`, height: `${size}px` } };
    switch (id) {
        case 'truck': return <Truck {...props} />;
        case 'zap': return <Zap {...props} />;
        case 'star': return <Star {...props} />;
        case 'clock': return <Clock {...props} />;
        case 'gift': return <Gift {...props} />;
        case 'shield': return <Shield {...props} />;
        case 'flame': return <Flame {...props} />;
        case 'bell': return <Bell {...props} />;
        default: return <Truck {...props} />;
    }
};

const injectCustomScript = (html: string) => {
    if (!html) return;
    try {
        const range = document.createRange();
        const fragment = range.createContextualFragment(html);
        document.head.appendChild(fragment);
    } catch (e) {
        console.warn("Custom Script Injection Error:", e);
    }
};

const generateContentId = (text: string) => {
    return text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50) : 'sku-default';
};

const trackEvent = (
    eventName: 'AddToCart' | 'Purchase' | 'Lead' | 'Contact' | 'ViewContent', 
    data?: { value?: number, currency?: string, content_id?: string }, 
    userInfo?: { email?: string, phone?: string }
) => {
};

const getTypographyStyles = (config?: TypographyConfig) => {
    const defaults = {
        fontFamily: 'sans',
        h1Size: 'lg',
        h2Size: 'md',
        bodySize: 'md'
    };
    
    const settings = { ...defaults, ...config };

    const fonts = {
        'sans': 'font-sans',
        'serif': 'font-serif',
        'mono': 'font-mono'
    };

    const h1Sizes = {
        'sm': 'text-xl md:text-3xl',
        'md': 'text-2xl md:text-4xl', 
        'lg': 'text-2xl md:text-5xl', 
        'xl': 'text-3xl md:text-6xl',
        '2xl': 'text-3xl md:text-7xl'
    };

    const h2Sizes = {
        'sm': 'text-lg md:text-xl',
        'md': 'text-lg md:text-2xl',
        'lg': 'text-xl md:text-3xl',
        'xl': 'text-2xl md:text-4xl'
    };

    const bodySizes = {
        'sm': 'text-xs md:text-sm',
        'md': 'text-sm md:text-base', 
        'lg': 'text-base md:text-lg'
    };

    return {
        font: fonts[settings.fontFamily as keyof typeof fonts],
        h1: h1Sizes[settings.h1Size as keyof typeof h1Sizes],
        h2: h2Sizes[settings.h2Size as keyof typeof h2Sizes],
        body: bodySizes[settings.bodySize as keyof typeof bodySizes]
    };
};

const getEffectiveImage = (content: GeneratedContent, specificImage?: string, index: number = 0) => {
    if (specificImage) return specificImage;
    if (content.generatedImages && content.generatedImages.length > 0) {
        return content.generatedImages[index % content.generatedImages.length];
    }
    if (content.heroImageBase64) return content.heroImageBase64;
    return null;
};

const DEFAULT_CULTURAL_DATA = {
    cities: ['Milano', 'Roma', 'Napoli', 'Torino', 'Palermo', 'Genova', 'Bologna', 'Firenze', 'Bari', 'Catania'], 
    names: ['Alice', 'Marco', 'Giulia', 'Luca', 'Sofia', 'Alessandro', 'Francesca', 'Matteo', 'Chiara', 'Lorenzo'],
    action: 'ha appena acquistato',
    from: 'da'
};

const stripCurrency = (val: string, curr: string) => {
    if (!val) return "";
    const regex = new RegExp(`[€$£]|lei|zł|kr|лв|Ft|din|EUR|USD|GBP|RON|PLN|SEK|BGN|HUF|RSD|${curr}`, 'gi');
    return val.replace(regex, '').trim();
};

const DeliveryTimeline: React.FC<{ labels: any, language: string }> = ({ labels, language }) => {
    const [dates, setDates] = useState<{ ordered: string; ready: string; delivered: string }>({ ordered: '', ready: '', delivered: '' });

    useEffect(() => {
        const today = new Date();
        const locale = 'it-IT';

        const formatDate = (date: Date) => {
            const day = date.getDate();
            const month = date.toLocaleString(locale, { month: 'short' }).replace('.', '');
            return `${day} ${month}`;
        };

        const readyStart = new Date(today);
        const readyEnd = new Date(today);
        readyEnd.setDate(today.getDate() + 1);

        const deliveryStart = new Date(today);
        deliveryStart.setDate(today.getDate() + 1);
        const deliveryEnd = new Date(today);
        deliveryEnd.setDate(today.getDate() + 2);

        setDates({
            ordered: formatDate(today),
            ready: `${formatDate(readyStart)} - ${formatDate(readyEnd)}`,
            delivered: `${formatDate(deliveryStart)} - ${formatDate(deliveryEnd)}`
        });
    }, [language]);

    const timelineItem = (icon: React.ReactNode, dateText: string, label: string) => (
        <div className="flex flex-col items-center flex-1 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-full flex items-center justify-center text-white mb-2 shadow-md relative z-10">
                {icon}
            </div>
            <div className="space-y-0.5">
                <p className="text-[10px] md:text-xs font-black text-slate-800 tracking-tight leading-none">{dateText}</p>
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );

    return (
        <div className="w-full py-4 relative px-4">
            <div className="absolute top-[20px] md:top-[24px] left-[20%] right-[20%] h-[2px] bg-slate-200 z-0"></div>
            <div className="flex justify-between items-start gap-2 max-w-sm mx-auto">
                {timelineItem(<ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />, dates.ordered, labels.timelineOrdered || "Ordinato")}
                {timelineItem(<Truck className="w-4 h-4 md:w-5 md:h-5" />, dates.ready, labels.timelineReady || "Ordine Pronto")}
                {timelineItem(<Gift className="w-4 h-4 md:w-5 md:h-5" />, dates.delivered, labels.timelineDelivered || "Consegnato")}
            </div>
        </div>
    );
};

const SocialProofBadge: React.FC<{ 
    language: string, 
    defaultText: string, 
    config?: { name?: string, text?: string, avatarUrls?: string[] },
    localizedName?: string,
    count?: number
}> = ({ language, defaultText, config, localizedName, count = 856 }) => {
    const fallbackName = 'Alessandro';
    let name = config?.name || localizedName || fallbackName;
    
    const marketingTerms = ['bestseller', 'best seller', 'top seller', 'views', 'sales', 'vendite', 'visualizzato', 'prodotto'];
    if (marketingTerms.some(term => name.toLowerCase().includes(term))) {
        name = fallbackName;
    }

    let text = config?.text || defaultText;
    if (text.toLowerCase().includes('visualizzato') || text.toLowerCase().includes('visto')) {
        text = "e altre {x} persone hanno acquistato";
    }

    text = text.replace('{x}', count.toString());
    
    const avatars = config?.avatarUrls || [
        "https://randomuser.me/api/portraits/women/44.jpg",
        "https://randomuser.me/api/portraits/women/68.jpg",
        "https://randomuser.me/api/portraits/women/33.jpg"
    ];
    
    return (
        <div className="inline-flex items-center gap-3 bg-white py-1.5 px-2 pr-4 rounded-full shadow-sm border border-slate-100 w-fit animate-in fade-in slide-in-from-bottom-2 mt-2 mb-2">
            <div className="flex -space-x-2 items-center">
                {avatars.map((url, idx) => (
                    <img key={idx} src={url} alt={`User ${idx + 1}`} className="w-6 h-6 rounded-full border-2 border-white" />
                ))}
            </div>
            <div className="text-xs text-slate-700 leading-none flex items-center gap-1">
                <span className="font-bold text-slate-900">{name}</span>
                <div className="bg-blue-500 rounded-full p-[1px]"><Check className="w-2 h-2 text-white" strokeWidth={4} /></div>
                <span className="text-slate-500">{text}</span>
            </div>
        </div>
    );
};

const FeatureImage = ({ src, alt, className }: { src: string | null, alt: string, className?: string }) => {
    if (!src) {
        return (
            <div className={`bg-slate-100 flex items-center justify-center text-slate-300 ${className}`}>
                <ImageIcon className="w-12 h-12 opacity-50" />
            </div>
        );
    }
    return <img src={src} alt={alt} className={className} />;
};

const Gallery = ({ content, className, layout = 'standard' }: { content: GeneratedContent, className?: string, layout?: 'standard' | 'overlay' }) => {
    const allImages = Array.from(new Set([
        content.heroImageBase64,
        ...(content.generatedImages || [])
    ].filter(Boolean))) as string[];

    const [activeImage, setActiveImage] = useState<string | undefined>(allImages[0]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setActiveImage(content.heroImageBase64 || (allImages.length > 0 ? allImages[0] : undefined));
    }, [content.heroImageBase64, content.generatedImages]);

    if (allImages.length === 0) {
         return (
             <div className={`bg-slate-100 flex items-center justify-center text-slate-300 relative overflow-hidden ${className}`}>
                <ImageIcon className="w-16 h-16 opacity-30" />
            </div>
        );
    }

    const MainImage = () => (
        <img 
            src={activeImage} 
            alt="Product Hero" 
            className={`w-full h-auto object-contain bg-white transition-opacity duration-300`} 
        />
    );

    const scrollToImage = (index: number) => {
        if (scrollRef.current) {
            const width = scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({
                left: width * index,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className={`w-full ${className} bg-transparent md:bg-white`}>
            <div className="md:hidden flex flex-col w-full gap-2">
                <div ref={scrollRef} className="flex w-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-none">
                    {allImages.map((img, idx) => (
                        <div key={idx} className="snap-center min-w-full w-full flex-shrink-0 bg-white relative flex items-center justify-center">
                            <img 
                                src={img} 
                                alt={`Slide ${idx}`} 
                                className="w-full h-auto object-contain" 
                            />
                            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm z-10">
                                {idx + 1} / {allImages.length}
                            </div>
                        </div>
                    ))}
                </div>

                {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {allImages.map((img, idx) => (
                            <button 
                                key={idx}
                                onClick={() => scrollToImage(idx)}
                                className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200"
                            >
                                <img src={img} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="hidden md:flex flex-col gap-3 w-full">
                <div className="relative overflow-hidden bg-white border-b border-slate-100 md:border-0 md:rounded-2xl md:shadow-sm w-full">
                    <MainImage />
                </div>
                
                {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-1 snap-x scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible w-full flex-shrink-0">
                        {allImages.map((img, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => setActiveImage(img)}
                                className={`
                                    snap-start w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all 
                                    md:w-full md:h-auto md:aspect-square bg-white
                                    ${activeImage === img ? 'border-slate-900 ring-1 ring-slate-900 shadow-md opacity-100' : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-200'}
                                `}
                            >
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const DEFAULT_LABELS = {
    reviews: 'Recensioni',
    offer: 'Offerta',
    onlyLeft: 'Solo {x} rimasti a magazzino',
    secure: 'Sicuro',
    returns: 'Resi',
    original: 'Originale',
    express: 'Espresso',
    warranty: 'Garanzia',
    checkoutHeader: 'Checkout',
    paymentMethod: 'Metodo di Pagamento',
    cod: 'Pagamento alla Consegna',
    card: 'Carta di Credito',
    shippingInfo: 'Dati Spedizione',
    completeOrder: 'Completa Ordine',
    orderReceived: 'OK!',
    orderReceivedMsg: 'Ordine Ricevuto.',
    techDesign: 'Tecnologia & Design',
    discountLabel: '-50%',
    certified: 'Acquisto Verificato',
    currencyPos: 'before' as 'before' | 'after', 
    legalDisclaimer: 'Disclaimer...',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Termini & Condizioni',
    cookiePolicy: 'Cookie Policy',
    rightsReserved: 'Tutti i diritti riservati.',
    generatedPageNote: 'Pagina generata.',
    cardErrorTitle: "Attenzione",
    cardErrorMsg: "Errore",
    switchToCod: "Cambia",
    mostPopular: "Popolare",
    giveUpOffer: "Annulla",
    confirmCod: "Conferma",
    thankYouTitle: "Grazie per il tuo acquisto {name}! ",
    thankYouMsg: " Il tuo ordine è in fase di elaborazione. Verrai contattato telefonicamente o su whatsapp al numero {phone} per la conferma.",
    backToShop: "Torna",
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
    timelineOrdered: "Ordinato",
    timelineReady: "Ordine Pronto",
    timelineDelivered: "Consegnato"
};

const OrderPopup: React.FC<{ isOpen: boolean; onClose: () => void; content: GeneratedContent; thankYouSlug?: string; onRedirect?: (data?: OrderData) => void; onPurchase?: (pageUrl: string) => void; }> = ({ isOpen, onClose, content, thankYouSlug, onRedirect, onPurchase }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [showCardErrorModal, setShowCardErrorModal] = useState(false);
    const [clientIp, setClientIp] = useState<string>('');
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
    const [isInsuranceChecked, setIsInsuranceChecked] = useState(content.insuranceConfig?.enabled && content.insuranceConfig.defaultChecked);
    const [isGadgetChecked, setIsGadgetChecked] = useState(content.gadgetConfig?.enabled && content.gadgetConfig.defaultChecked);
    const customFormRef = useRef<HTMLDivElement>(null);

    const labels = { ...DEFAULT_LABELS, ...(content.uiTranslation || {}) };

    useEffect(() => {
        if(isOpen) {
            setPaymentMethod('cod');
            setShowCardErrorModal(false);
            setCardData({ number: '', expiry: '', cvc: '' });
            setIsInsuranceChecked(content.insuranceConfig?.enabled && content.insuranceConfig.defaultChecked);
            setIsGadgetChecked(content.gadgetConfig?.enabled && content.gadgetConfig.defaultChecked);
            fetch('https://api.ipify.org?format=json')
                .then(res => res.json())
                .then(data => setClientIp(data.ip))
                .catch(err => console.warn("IP fetch failed", err));
        }
    }, [isOpen, content.insuranceConfig, content.gadgetConfig]);

    useEffect(() => {
        if (isOpen && content.formType === 'html' && customFormRef.current) {
            const form = customFormRef.current.querySelector('form');
            if (form) {
                const handleCustomSubmit = (e: Event) => {
                    e.preventDefault();
                    
                    const htmlFormData = new FormData(form);
                    const extractedData: Record<string, string> = {};
                    htmlFormData.forEach((value, key) => {
                        extractedData[key] = value.toString();
                    });

                    setFormData(prev => ({ ...prev, ...extractedData }));
                    finalizeOrder('cod', extractedData);
                };
                
                form.addEventListener('submit', handleCustomSubmit);
                return () => form.removeEventListener('submit', handleCustomSubmit);
            }
        }
    }, [isOpen, content.formType]);

    if (!isOpen) return null;

    const currency = content.currency || '€';
    const price = stripCurrency(content.price || "49.00", currency);
    const heroImage = content.heroImageBase64 || (content.generatedImages && content.generatedImages.length > 0 ? content.generatedImages[0] : null);
    const contentId = generateContentId(content.headline);
    const formFields = content.formConfiguration || [];
    const enabledFields = formFields.filter(f => f.enabled);

    const handleInputChange = (field: FormFieldConfig, value: string) => {
        let sanitizedValue = value;
        
        if (field.validationType === 'numeric') {
            sanitizedValue = value.replace(/[^0-9]/g, '');
        } else if (field.validationType === 'alpha') {
            sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '');
        } else if (field.validationType === 'alphanumeric') {
            sanitizedValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
        }

        setFormData(prev => ({ ...prev, [field.id]: sanitizedValue }));
    };

    const parsePrice = (val?: string | number) => {
        if (val === undefined || val === null) return 0;
        const str = String(val)
            .replace(/[^\d,.]/g, '') 
            .replace(',', '.');       
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    }

    const calculateTotal = () => {
        let total = parsePrice(content.price);
        if (content.enableShippingCost && content.shippingCost) {
            total += parsePrice(content.shippingCost);
        }
        if (isInsuranceChecked && content.insuranceConfig?.enabled && content.insuranceConfig.cost) {
            total += parsePrice(content.insuranceConfig.cost);
        }
        if (isGadgetChecked && content.gadgetConfig?.enabled && content.gadgetConfig.cost) {
            total += parsePrice(content.gadgetConfig.cost);
        }
        return total.toFixed(2);
    };

    const finalizeOrder = async (method: 'cod' | 'card', manualData?: Record<string, string>) => {
        setIsLoading(true);

        if (onPurchase) {
            onPurchase(window.location.pathname + window.location.search);
        }
        
        const totalPrice = calculateTotal();
        const currentData = manualData || formData;
        
        const currentName = currentData.name || currentData.nome || currentData.full_name || '';
        const currentPhone = currentData.phone || currentData.telefono || currentData.tel || '';

        const payloadData: Record<string, any> = {
            event_type: 'new_order',
            product_name: content.headline || 'Unknown Product',
            price: `${price} ${currency}`,
            shipping_cost: content.enableShippingCost ? `${content.shippingCost} ${currency}` : `0 ${currency}`,
            total_price: `${totalPrice} ${currency}`,
            payment_method: method,
            customer_ip: clientIp,
            timestamp: new Date().toISOString(),
            shipping_insurance_selected: isInsuranceChecked ? 'yes' : 'no',
            shipping_insurance_cost: (isInsuranceChecked && content.insuranceConfig?.enabled) ? `${content.insuranceConfig.cost} ${currency}` : '0',
            gadget_selected: isGadgetChecked ? 'yes' : 'no',
            gadget_cost: (isGadgetChecked && content.gadgetConfig?.enabled) ? `${content.gadgetConfig.cost} ${currency}` : '0',
            ...currentData,
            name: currentName,
            phone: currentPhone
        };

        if (content.webhookUrl && content.webhookUrl.trim() !== '') {
            const webhookUrl = content.webhookUrl.trim();
            const bodyJSON = JSON.stringify(payloadData);
            
            // FIX: Invio singolo per evitare dati doppi. Fetch con keepalive è preferibile a Beacon per consistenza payload.
            fetch(webhookUrl, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: bodyJSON,
                keepalive: true 
            }).catch(err => console.debug("Webhook Delivery failed", err));
        }

        trackEvent('Lead', { content_id: contentId }, { email: currentData.email, phone: currentPhone });
        trackEvent('Contact', {}, { email: currentData.email, phone: currentPhone });
        
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            if (content.customThankYouUrl && content.customThankYouUrl.trim() !== '') {
                let baseUrl = content.customThankYouUrl.trim();
                baseUrl = baseUrl
                    .replace('{name}', encodeURIComponent(currentName))
                    .replace('{phone}', encodeURIComponent(currentPhone))
                    .replace('[name]', encodeURIComponent(currentName))
                    .replace('[phone]', encodeURIComponent(currentPhone));

                if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://') && !baseUrl.startsWith('/')) {
                    baseUrl = 'https://' + baseUrl;
                }
                
                try {
                    const targetUrl = new URL(baseUrl);
                    if (currentName) targetUrl.searchParams.set('name', currentName);
                    if (currentPhone) targetUrl.searchParams.set('phone', currentPhone);
                    window.location.href = targetUrl.toString();
                } catch (urlErr) {
                    const separator = baseUrl.includes('?') ? '&' : '?';
                    const params = `name=${encodeURIComponent(currentName)}&phone=${encodeURIComponent(currentPhone)}`;
                    window.location.href = `${baseUrl}${separator}${params}`;
                }
                return;
            }

            if (onRedirect) {
                onRedirect({ name: currentName, phone: currentPhone, price: totalPrice });
                onClose();
                return;
            }

            if (thankYouSlug) {
                const cleanTySlug = thankYouSlug.replace(/^\//, '');
                const url = new URL(window.location.origin + '/' + cleanTySlug);
                if (currentName) url.searchParams.set('name', currentName);
                if (currentPhone) url.searchParams.set('phone', currentPhone);
                window.location.href = url.toString();
                return;
            }
            
            const url = new URL(window.location.origin + '/' + (thankYouSlug || '').replace(/^\//, ''));
            if (currentName) url.searchParams.set('name', currentName);
            if (currentPhone) url.searchParams.set('phone', currentPhone);
            window.location.href = url.toString();
            
        } catch (navError) {
            console.warn("Navigation/Redirect failed:", navError);
            setIsLoading(false);
            onClose();
        }
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
        setCardData(prev => ({ ...prev, number: val.substring(0, 19) }));
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 2) {
            val = val.substring(0, 2) + '/' + val.substring(2, 4);
        }
        setCardData(prev => ({ ...prev, expiry: val.substring(0, 5) }));
    };

    const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setCardData(prev => ({ ...prev, cvc: val.substring(0, 4) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentMethod === 'card') {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsLoading(false);
            setShowCardErrorModal(true);
        } else {
            finalizeOrder('cod');
        }
    };

    const handleSwitchToCod = () => { setPaymentMethod('cod'); setShowCardErrorModal(false); finalizeOrder('cod'); };
    const handleGiveUp = () => { setShowCardErrorModal(false); onClose(); };

    const inputClass = "w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium";

    const hfConfig = content.htmlFormConfig || { showName: true, showProductLine: true, showTotalLine: true };
    const showHeader = content.formType !== 'html' || (hfConfig.showName || hfConfig.showProductLine || hfConfig.showTotalLine);

    // Mappatura statica per essere sicuri che Tailwind JIT non le purghi
    const getColSpanClass = (width?: number) => {
        const widths: Record<number, string> = {
            1: 'col-span-1',
            2: 'col-span-2',
            3: 'col-span-3',
            4: 'col-span-4',
            5: 'col-span-5',
            6: 'col-span-6',
            7: 'col-span-7',
            8: 'col-span-8',
            9: 'col-span-9',
            10: 'col-span-10',
            11: 'col-span-11',
            12: 'col-span-12'
        };
        if (!width || width > 12) return 'col-span-12';
        if (width < 1) return 'col-span-1';
        return widths[width] || 'col-span-12';
    };

    const checkoutBtnClass = content.checkoutButtonColor || content.buttonColor || "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200";

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 flex flex-col max-h-[90vh]">
                {showCardErrorModal && (
                    <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <div className="bg-amber-100 p-4 rounded-full mb-4 animate-bounce"><AlertTriangle className="w-10 h-10 text-amber-600" /></div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{labels.cardErrorTitle}</h3>
                        <p className="text-slate-600 mb-8 max-w-xs leading-relaxed">{labels.cardErrorMsg}</p>
                        <div className="w-full space-y-3">
                            <button onClick={handleSwitchToCod} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center relative border-2 border-emerald-400/50">
                                <div className="flex items-center gap-2 text-lg"><Truck className="w-5 h-5" /> {labels.switchToCod}</div>
                                <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">{labels.mostPopular}</div>
                            </button>
                            <button onClick={handleGiveUp} className="w-full bg-transparent hover:bg-slate-50 text-slate-400 hover:text-slate-600 font-bold py-3 rounded-xl transition-colors text-xs uppercase tracking-wide">{labels.giveUpOffer}</button>
                        </div>
                    </div>
                )}
                <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
                    <div><h3 className="text-lg font-bold text-slate-900">{labels.checkoutHeader}</h3></div>
                    <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><X className="w-5 h-5 text-slate-600" /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {/* LIVE ASSISTANT SECTION */}
                    <div className="flex items-center justify-end mb-6 gap-3 animate-in fade-in slide-in-from-right-4">
                        <div className="bg-slate-900 text-white p-3.5 rounded-2xl rounded-tr-none text-xs font-bold shadow-xl max-w-[190px] relative border border-white/10 leading-tight">
                            Ciao! Compila il modulo, ci vorrà solo un minuto.
                            <div className="absolute top-0 -right-2 w-0 h-0 border-t-[10px] border-t-slate-900 border-r-[10px] border-r-transparent"></div>
                        </div>
                        <div className="w-16 h-16 rounded-full border-2 border-white shadow-2xl overflow-hidden shrink-0 bg-slate-100 ring-4 ring-slate-900/5">
                            <video
                                src="https://www.cloudtalk.io/wp-content/uploads/2026/01/video-wave-hanka3.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover scale-110"
                            />
                        </div>
                    </div>

                    {showHeader && (
                        <div className="flex items-start gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 animate-in fade-in">
                            <div className="w-16 h-16 bg-white rounded-lg shadow-sm overflow-hidden flex-shrink-0 border border-slate-200">
                                {heroImage && <img src={heroImage} alt="Product" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1">
                                {(content.formType !== 'html' || hfConfig.showName !== false) && (
                                    <h4 className="font-bold text-slate-900 line-clamp-1 text-sm mb-1">{content.headline}</h4>
                                )}
                                <div className="space-y-1 mt-2 pt-2 border-t border-slate-200/60 text-xs">
                                    {(content.formType !== 'html' || hfConfig.showProductLine !== false) && (
                                        <div className="flex justify-between text-slate-500"><span>{labels.summaryProduct}</span><span>{labels.currencyPos === 'before' ? `${currency} ${price}` : `${price} ${currency}`}</span></div>
                                    )}
                                    {content.enableShippingCost && <div className="flex justify-between text-slate-500"><span>{labels.summaryShipping}</span><span>{labels.currencyPos === 'before' ? `${currency} ${stripCurrency(content.shippingCost || '0', currency)}` : `${stripCurrency(content.shippingCost || '0', currency)} ${currency}`}</span></div>}
                                    {isInsuranceChecked && content.insuranceConfig?.enabled && <div className="flex justify-between text-emerald-600"><span>{labels.summaryInsurance}</span><span>+ {labels.currencyPos === 'before' ? `${currency} ${stripCurrency(content.insuranceConfig.cost, currency)}` : `${stripCurrency(content.insuranceConfig.cost, currency)} ${currency}`}</span></div>}
                                    {isGadgetChecked && content.gadgetConfig?.enabled && <div className="flex justify-between text-purple-600"><span>{labels.summaryGadget}</span><span>+ {labels.currencyPos === 'before' ? `${currency} ${stripCurrency(content.gadgetConfig.cost, currency)}` : `${stripCurrency(content.gadgetConfig.cost, currency)}${currency}`}</span></div>}
                                    
                                    {(content.formType !== 'html' || hfConfig.showTotalLine !== false) && (
                                        <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200"><span>{labels.summaryTotal}</span><span>{labels.currencyPos === 'before' ? `${currency} ${calculateTotal()}` : `${calculateTotal()} ${currency}`}</span></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {content.formType === 'html' ? (
                        <div 
                            ref={customFormRef}
                            className="custom-form-container animate-in fade-in duration-500" 
                            dangerouslySetInnerHTML={{ __html: content.customFormHtml || '' }} 
                        />
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {content.insuranceConfig?.enabled && (
                                <div className="bg-emerald-50 border-2 border-emerald-200/50 p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-emerald-300">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={!!isInsuranceChecked}
                                                    onChange={(e) => setIsInsuranceChecked(e.target.checked)}
                                                    className="w-5 h-5 accent-emerald-600 rounded-md border-emerald-400 focus:ring-emerald-500"
                                                />
                                            </div>
                                        
                                            <div className="flex flex-col">
                                                <span className="font-bold text-emerald-900 text-sm leading-tight flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600"/>{content.insuranceConfig.label}</span>
                                                <span className="text-emerald-700 text-xs">{labels.shippingInsuranceDescription}</span>
                                            </div>
                                        </div>
                                        <span className="font-black text-emerald-800 text-sm">
                                            {parsePrice(content.insuranceConfig.cost) > 0 ? 
                                                `+${labels.currencyPos === 'before' ? `${currency}${stripCurrency(content.insuranceConfig.cost, currency)}` : `${stripCurrency(content.insuranceConfig.cost, currency)}${currency}`}`
                                                : (labels.freeLabel || 'Gratis')
                                            }
                                        </span>
                                    </label>
                                </div>
                            )}

                            {content.gadgetConfig?.enabled && (
                                <div className="bg-purple-50 border-2 border-purple-200/50 p-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:border-purple-300">
                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 flex items-center justify-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={!!isGadgetChecked}
                                                    onChange={(e) => setIsGadgetChecked(e.target.checked)}
                                                    className="w-5 h-5 accent-purple-600 rounded-md border-purple-400 focus:ring-purple-500"
                                                />
                                            </div>
                                        
                                            <div className="flex flex-col">
                                                <span className="font-bold text-purple-900 text-sm leading-tight flex items-center gap-1.5"><Gift className="w-4 h-4 text-purple-600"/>{content.gadgetConfig.label}</span>
                                                <span className="text-purple-700 text-xs">{labels.gadgetDescription}</span>
                                            </div>
                                        </div>
                                        <span className="font-black text-purple-800 text-sm">
                                            {parsePrice(content.gadgetConfig.cost) > 0 ? 
                                                `+${labels.currencyPos === 'before' ? `${currency}${stripCurrency(content.gadgetConfig.cost, currency)}` : `${stripCurrency(content.gadgetConfig.cost, currency)}${currency}`}`
                                                : (labels.freeLabel || 'Gratis')
                                            }
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{labels.paymentMethod}</label>
                                <div className="space-y-2">
                                    <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-slate-900 accent-slate-900"/>
                                        <div className="ml-3 flex-1"><div className="flex items-center justify-between"><span className="font-bold text-slate-900 text-sm">{labels.cod}</span><Banknote className="w-5 h-5 text-slate-600" /></div></div>
                                    </label>
                                    <label className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900' : 'border-slate-200 hover:border-slate-300'}`}>
                                        <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-4 h-4 text-slate-900 accent-slate-900"/>
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-slate-900 text-sm">{labels.card}</span>
                                                <div className="flex items-center gap-1">
                                                    <img src="http://fadicon.com/wp-content/uploads/2025/12/20336392-visa-logo-vettore-visa-icona-gratuito-vettore-gratuito-vettoriale.jpg" alt="Visa" className="h-4" />
                                                    <img src="http://fadicon.com/wp-content/uploads/2025/12/images-1.png" alt="Maestro" className="h-4" />
                                                    <img src="http://fadicon.com/wp-content/uploads/2025/12/images.png" alt="American Express" className="h-4" />
                                                    <img src="http://fadicon.com/wp-content/uploads/2025/12/MasterCard_Logo.svg.png" alt="Mastercard" className="h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                {paymentMethod === 'card' && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <input type="text" placeholder="0000 0000 0000 0000" className={inputClass} required value={cardData.number} onChange={handleCardNumberChange}/>
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" placeholder="MM/YY" className={inputClass} required value={cardData.expiry} onChange={handleExpiryChange}/>
                                            <input type="text" placeholder="CVC" className={inputClass} required value={cardData.cvc} onChange={handleCvcChange}/>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{labels.shippingInfo}</label>
                                <div className="grid grid-cols-12 gap-x-3 gap-y-4">
                                    {enabledFields.map((field) => (
                                        <div key={field.id} className={getColSpanClass(field.width)}>
                                            {field.type === 'textarea' ? (
                                                    <textarea 
                                                        required={field.required} 
                                                        placeholder={field.label} 
                                                        value={formData[field.id] || ''}
                                                        onChange={(e) => handleInputChange(field, e.target.value)} 
                                                        className={`${inputClass} h-20 resize-none`}
                                                    />
                                            ) : (
                                                <input 
                                                    type={field.type} 
                                                    required={field.required} 
                                                    placeholder={field.label} 
                                                    value={formData[field.id] || ''}
                                                    inputMode={field.validationType === 'numeric' ? 'numeric' : (field.type === 'tel' ? 'tel' : (field.type === 'email' ? 'email' : 'text'))}
                                                    maxLength={field.id === 'province' ? 2 : undefined}
                                                    onChange={(e) => {
                                                        let val = e.target.value;
                                                        if (field.id === 'province') {
                                                            val = val.toUpperCase().replace(/[^A-Z]/g, '');
                                                        }
                                                        handleInputChange(field, val);
                                                    }} 
                                                    className={`${inputClass} ${field.id === 'province' ? 'uppercase' : ''}`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-2">
                                <button type="submit" disabled={isLoading} className={`w-full ${checkoutBtnClass} font-bold text-lg py-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70`}>
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (labels.completeOrder)}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Fixed to export ThankYouPage and resolve import errors in App.tsx.
 */
export const ThankYouPage: React.FC<{ content: GeneratedContent; initialData?: OrderData }> = ({ content, initialData }) => {
    const [params] = useState(new URLSearchParams(window.location.search));
    const name = initialData?.name || params.get('name') || '';
    const phone = initialData?.phone || params.get('phone') || '...';
    const labels = { ...DEFAULT_LABELS, ...(content.uiTranslation || {}) };

    const titleTemplate = content.headline || labels.thankYouTitle;
    const msgTemplate = content.subheadline || labels.thankYouMsg;

    const finalTitle = titleTemplate.replace('{name}', name).replace('{phone}', phone);
    const finalMsg = msgTemplate.replace('{name}', name).replace('{phone}', phone);
    
    const backgroundStyle = content.backgroundColor ? { background: content.backgroundColor } : {};
    const heroImage = content.heroImageBase64 || (content.generatedImages && content.generatedImages.length > 0 ? content.generatedImages[0] : null);

    useEffect(() => {
        if (content.customThankYouHtml) injectCustomScript(content.customThankYouHtml);
        if (content.metaThankYouHtml) injectCustomScript(content.metaThankYouHtml);
        if (content.tiktokThankYouHtml) injectCustomScript(content.tiktokThankYouHtml);
    }, [content.customThankYouHtml, content.metaThankYouHtml, content.tiktokThankYouHtml]);

    const HeroImage = () => {
        if (!heroImage) return null;
        const imgElement = (
            <img src={heroImage} alt="Thank You" className="w-full h-auto object-cover" />
        );
        
        if (content.thankYouImageLink && content.thankYouImageLink.trim() !== '') {
            return (
                <a href={content.thankYouImageLink} className="block cursor-pointer hover:opacity-95 transition-opacity">
                    {imgElement}
                </a>
            );
        }
        return imgElement;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500 relative" style={backgroundStyle}>
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center relative z-10">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500 shadow-sm ring-4 ring-green-50">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">{finalTitle}</h3>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 relative">
                        <div className="absolute -top-3 -right-3 bg-blue-500 text-white p-1.5 rounded-full shadow-md"><Phone className="w-4 h-4" /></div>
                        <p className="text-slate-600 leading-relaxed font-medium text-lg">{finalMsg}</p>
                </div>

                {heroImage && (
                    <div className="mt-2 mb-2 rounded-xl overflow-hidden shadow-md border border-slate-100">
                        <HeroImage />
                    </div>
                )}
            </div>
            {content.extraThankYouHtml && (<MemoizedHTML className="w-full max-w-4xl mx-auto mt-8 relative z-0" html={content.extraThankYouHtml} />)}
            <p className="mt-8 text-slate-400 text-xs">© {new Date().getFullYear()}</p>
        </div>
    );
};

const LegalModal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; contentText: string; disclaimer: string; }> = ({ isOpen, onClose, title, contentText, disclaimer }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar text-sm text-slate-600 leading-relaxed">
                   <div className="space-y-4 text-justify"><p><strong>{title}</strong></p><p>{disclaimer}</p><p>{contentText}</p></div>
                </div>
            </div>
        </div>
    );
};

const BottomOfferSection: React.FC<{ content: GeneratedContent; onBuy: () => void; currency: string; labels: any }> = ({ content, onBuy, currency, labels }) => {
    const offer = content.bottomOffer;
    if (!offer || !offer.enabled) return null;

    const price = stripCurrency(content.price || "59.90", currency);
    const originalPrice = stripCurrency(content.originalPrice || "119.90", currency);

    // Dynamic background styles
    const bgClass = offer.bgClass || "bg-gradient-to-br from-[#13a38e] to-[#0a665a]";
    const bgStyle = offer.bgColor && !offer.bgClass ? { backgroundColor: offer.bgColor } : {};

    return (
        <div 
            className={`w-full ${bgClass} rounded-3xl p-8 md:p-12 mb-16 text-white text-center relative overflow-hidden shadow-2xl border-4 border-white/10`}
            style={bgStyle}
        >
            {/* Subtle dot pattern overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-md">{offer.title}</h2>
                <p className="text-sm md:text-lg opacity-90 mb-8 max-w-2xl mx-auto font-medium leading-relaxed">{offer.subtitle}</p>

                <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-10 border border-white/20 shadow-inner mb-8 transition-transform hover:scale-[1.02] duration-300">
                    <div className="flex items-center justify-center gap-4 md:gap-6 mb-4">
                        <span className="text-5xl md:text-6xl font-black tracking-tighter">
                            {labels.currencyPos === 'before' ? `${currency}${price}` : `${price}${currency}`}
                        </span>
                        <div className="flex flex-col items-start justify-center text-left">
                            <span className="text-xl opacity-60 line-through decoration-white/50 decoration-2">
                                {labels.currencyPos === 'before' ? `${currency}${originalPrice}` : `${originalPrice}${currency}`}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">1 CONFEZIONE</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-8 bg-black/20 py-2 px-4 rounded-full w-fit mx-auto border border-white/5">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-tighter">{offer.scarcityText}</span>
                    </div>

                    <button 
                        onClick={onBuy}
                        className="w-full bg-white text-[#0a665a] hover:bg-slate-100 font-black py-4 px-6 rounded-xl shadow-xl transform active:scale-[0.98] transition-all text-sm md:text-lg leading-tight flex items-center justify-center"
                    >
                        {offer.ctaText}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 mt-12 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-md">
                            <Truck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-wider">Spedizione Veloce</p>
                            <p className="text-[11px] opacity-70">Consegna in 24/48 ore</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-md">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-wider">Prova Senza Rischi</p>
                            <p className="text-[11px] opacity-70">30 giorni soddisfatti o rimborsati</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-md">
                            <BadgeCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-black text-sm uppercase tracking-wider">Garanzia 12 Mesi</p>
                            <p className="text-[11px] opacity-70">Copertura completa inclusa</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GadgetTemplate: React.FC<TemplateProps> = ({ content, onBuy, styles, siteConfig }) => {
    const reviews = content.testimonials && content.testimonials.length > 0 
        ? content.testimonials 
        : (content.testimonial ? [content.testimonial] : []);
    
    const [currentStock, setCurrentStock] = useState(content.stockConfig?.quantity || 13);
    const [socialNotification, setSocialNotification] = useState<{visible: boolean, name: string, city: string} | null>(null);
    const spConfig = content.socialProofConfig || { enabled: true, intervalSeconds: 10, maxShows: 4 };
    
    // FIX: Cambiato limite iniziale a 30 recensioni come richiesto
    const [visibleReviewsCount, setVisibleReviewsCount] = useState(30);
    const reviewsToShow = reviews.slice(0, visibleReviewsCount);
    const [activeReviewImage, setActiveReviewImage] = useState<string | null>(null);

    const [currentAnnIndex, setCurrentAnnIndex] = useState(0);
    const announcements = content.announcements && content.announcements.length > 0 
        ? content.announcements 
        : [{ text: content.announcementBarText || '', icon: 'truck', iconSize: 14 }];

    useEffect(() => {
        if (announcements.length <= 1) return;
        const intervalTime = (content.announcementInterval || 5) * 1000;
        const timer = setInterval(() => {
            setCurrentAnnIndex((prev) => (prev + 1) % announcements.length);
        }, intervalTime);
        return () => clearInterval(timer);
    }, [announcements.length, content.announcementInterval]);

    useEffect(() => {
        if (!spConfig.enabled) return;
        let iterations = 0;
        const maxIterations = spConfig.maxShows;
        const intervalTime = Math.max(2, spConfig.intervalSeconds) * 1000;
        
        const culture = {
            names: content.uiTranslation?.localizedNames || DEFAULT_CULTURAL_DATA.names,
            cities: content.uiTranslation?.localizedCities || DEFAULT_CULTURAL_DATA.cities,
            action: content.uiTranslation?.socialProofAction || DEFAULT_CULTURAL_DATA.action,
            from: content.uiTranslation?.socialProofFrom || DEFAULT_CULTURAL_DATA.from
        };

        const getRandomItem = (arr: string[]) => arr[Math.floor(arr.length * Math.random())];
        const interval = setInterval(() => {
            if (iterations >= maxIterations) { clearInterval(iterations); return; }
            const name = getRandomItem(culture.names);
            const city = getRandomItem(culture.cities);
            setSocialNotification({ visible: true, name, city });
            if (content.stockConfig?.enabled) { setCurrentStock(prev => Math.max(2, prev - 1)); }
            setTimeout(() => { setSocialNotification(prev => prev ? { ...prev, visible: false } : null); }, 4000);
            iterations++;
        }, intervalTime);
        return () => clearInterval(interval);
    }, [spConfig, content.stockConfig?.enabled, content.uiTranslation]);

    // FIX: Aggiunta logica per gestire i video TikTok in MemoizedHTML
    useEffect(() => {
        const initVideos = () => {
            const videos = document.querySelectorAll<HTMLVideoElement>(".tiktok-videov8");
            if (videos.length === 0) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target as HTMLVideoElement;
                    if (entry.isIntersecting) {
                        video.play().catch(() => {
                            // Autoplay silenzioso fallito (comune su mobile/Safari se non mutato)
                            video.muted = true;
                            video.play().catch(() => {});
                        });
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.6 });

            const handleVideoClick = (e: Event) => {
                const video = e.currentTarget as HTMLVideoElement;
                if (video.paused) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
                video.muted = false; // Attiva l'audio alla prima interazione
            };

            videos.forEach(v => {
                v.muted = true; // Obbligatorio per autoplay
                v.setAttribute('playsinline', 'true');
                v.setAttribute('webkit-playsinline', 'true');
                observer.observe(v);
                v.addEventListener('click', handleVideoClick);
            });

            return () => {
                videos.forEach(v => {
                    observer.unobserve(v);
                    v.removeEventListener('click', handleVideoClick);
                });
            };
        };

        // Piccolo delay per attendere il rendering del MemoizedHTML
        const timer = setTimeout(initVideos, 500);
        return () => clearTimeout(timer);
    }, [content.extraLandingHtml]);

    const priceColor = content.priceStyles?.color || "text-blue-600";
    const isCustomColor = content.priceStyles?.color?.startsWith('#');
    const defaultCtaClass = "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200";
    const ctaButtonClass = content.buttonColor ? content.buttonColor : defaultCtaClass;
    const offerBoxClass = "bg-sky-50 border-2 border-sky-100 rounded-xl p-4 mb-6 shadow-sm relative overflow-hidden";
    const currency = content.currency || '€';
    const labels = { ...DEFAULT_LABELS, ...(content.uiTranslation || {}) };
    const [activeLegalModal, setActiveLegalModal] = useState<string | null>(null);

    const h1Style = content.customTypography?.h1 ? { fontSize: `${content.customTypography.h1}px` } : {};
    const h2Style = content.customTypography?.h2 ? { fontSize: `${content.customTypography.h2}px` } : {};
    const h3Style = content.customTypography?.h3 ? { fontSize: `${content.customTypography.h3}px` } : {};
    const bodyStyle = content.customTypography?.body ? { fontSize: `${content.customTypography.body}px` } : {};
    const smallStyle = content.customTypography?.small ? { fontSize: `${content.customTypography.small}px` } : {};
    const ctaStyle = content.customTypography?.cta ? { fontSize: `${content.customTypography.cta}px` } : {};
    
    const backgroundStyle = content.backgroundColor ? { background: content.backgroundColor } : {};
    
    const priceStyle = {
        ...(content.priceStyles?.fontSize ? { fontSize: `${content.priceStyles.fontSize}px` } : {}),
        ...(isCustomColor ? { color: content.priceStyles?.color } : {})
    };

    const PriceDisplay = ({ p, op, big = false }: { p: string, op?: string, big?: boolean }) => {
        const customPriceClass = content.priceStyles?.className || (big ? priceColor : 'text-slate-900');
        const cleanP = stripCurrency(p, currency);
        const cleanOp = op ? stripCurrency(op, currency) : undefined;
        
        return (
            <div className={`flex items-center ${big ? 'justify-center gap-4' : 'justify-start gap-1'}`}>
                 <span className={`${big ? 'text-5xl' : 'text-2xl'} font-black tracking-tight ${customPriceClass}`} style={big ? priceStyle : {}}>
                    {labels.currencyPos === 'before' ? `${currency} ${cleanP}` : `${cleanP} ${currency}`}
                 </span>
                 {cleanOp && (
                     <div className="flex flex-col items-start justify-center pt-1">
                        <span className={`text-sm text-slate-400 line-through font-medium mb-0.5`}>{labels.currencyPos === 'before' ? `${currency} ${cleanOp}` : `${cleanOp} ${currency}`}</span>
                        {content.showDiscount !== false && big && (<span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-blue-200">{labels.discountLabel}</span>)}
                     </div>
                 )}
            </div>
        );
    };

    const ReviewsSection = () => (
        <div className="bg-white rounded-none md:rounded-3xl p-6 md:p-12 md:shadow-xl md:border border-slate-100 mb-20 relative overflow-hidden border-t border-slate-100 md:border-t-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 md:h-2"></div>
            <h3 className="text-center text-2xl md:text-3xl font-bold mb-8 text-slate-900" style={h2Style}>{labels.reviews}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {reviewsToShow.map((review, i) => (
                    <div key={i} className="flex flex-col h-full bg-slate-50 p-5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex text-yellow-400">
                                {[...Array(review.rating || 5)].map((_, k) => <Star key={k} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">{review.date}</span>
                        </div>
                        
                        {(review.images && review.images.length > 0) ? (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
                                {review.images.filter(img => img && img.trim() !== '').map((img, imgIdx) => (
                                    <div 
                                        key={imgIdx}
                                        className="flex-shrink-0 rounded-lg overflow-hidden h-40 w-32 bg-slate-100 cursor-pointer relative group"
                                        onClick={() => setActiveReviewImage(img)}
                                    >
                                        <img src={img} alt={`Review ${imgIdx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <Maximize2 className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            review.image && (
                                 <div 
                                    className="mb-3 rounded-lg overflow-hidden h-56 w-full bg-slate-100 cursor-pointer relative group"
                                    onClick={() => setActiveReviewImage(review.image || null)}
                                 >
                                     <img src={review.image} alt="User Review" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <div className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg">
                                            <Maximize2 className="w-5 h-5 text-slate-900" />
                                        </div>
                                     </div>
                                 </div>
                            )
                        )}

                        <h4 className="font-bold text-slate-900 text-base mb-2" style={h3Style}>{review.title || "Recensione"}</h4>
                        <p className="text-slate-600 italic mb-6 flex-grow leading-relaxed text-sm" style={bodyStyle}>"{review.text}"</p>
                        <div className="flex items-center gap-3 mt-auto border-t border-slate-200 pt-4">
                            <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm">{review.name.charAt(0)}</div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">{review.name}</p>
                                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {labels.certified}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* FIX: Sostituito con logica "Mostra tutte le recensioni" se > 30 */}
            {reviews.length > visibleReviewsCount && (
                <div className="mt-12 flex flex-col items-center justify-center gap-4">
                    <button 
                        onClick={() => setVisibleReviewsCount(reviews.length)}
                        className="bg-slate-900 text-white border-2 border-slate-900 hover:bg-slate-800 px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" />
                        Mostra tutte le recensioni ({reviews.length})
                    </button>
                </div>
            )}
        </div>
    );

    const BoxContentSection = () => {
        if (!content.boxContent || !content.boxContent.enabled) return null;
        
        return (
             <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12 mb-16 relative overflow-hidden max-w-2xl mx-auto border-l-[8px] border-l-emerald-500">
                <h3 className="text-xl md:text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
                    <Package className="w-6 h-6 md:w-8 md:h-8 text-emerald-600" />
                    {content.boxContent.title}
                </h3>
                
                <div className={`flex flex-col gap-4`}>
                    <ul className="space-y-3.5">
                        {content.boxContent.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-4 bg-[#f8fafc] p-4.5 rounded-2xl shadow-sm border border-slate-50 transition-transform hover:translate-x-1 duration-200">
                                <div className="bg-emerald-100 text-emerald-600 rounded-full p-1 w-7 h-7 flex items-center justify-center shrink-0">
                                    <Check className="w-4 h-4" strokeWidth={4} />
                                </div>
                                <span className="font-bold text-slate-800 text-sm md:text-lg">{item}</span>
                            </li>
                        ))}
                    </ul>
                    {content.boxContent.image && (
                        <div className="w-full mt-6 h-auto max-h-64 flex items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner overflow-hidden">
                            <img src={content.boxContent.image} alt="Package Items" className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const FeatureBlock = React.memo(({ f, i }: { f: any, i: number }) => (
        <div className={`flex flex-col gap-6 md:gap-16 items-center ${i % 2 !== 0 ? 'md:flex-row-reverse' : 'md:flex-row'} bg-white md:bg-transparent p-0 md:p-0 rounded-2xl shadow-none md:shadow-none`}>
            <div className="w-full md:w-1/2">
                <div className="relative rounded-2xl overflow-hidden shadow-md md:shadow-xl bg-white w-full">
                    <FeatureImage 
                        src={getEffectiveImage(content, f.image, i)} 
                        alt="Feature" 
                        className="w-full h-auto" 
                    />
                </div>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-3">
                {content.showFeatureIcons && (
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 rounded-full mb-1">
                        <Zap className="w-5 h-5" />
                    </div>
                )}
                <h3 className="text-xl md:text-3xl font-bold text-slate-900 break-words" style={h3Style}>{f.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium" style={bodyStyle}>{f.description}</p>
                {f.showCta && (
                    <div className="mt-2">
                        <button 
                            onClick={onBuy} 
                            className={`${ctaButtonClass} py-3 px-6 rounded-lg shadow-md text-sm font-bold flex items-center gap-2 active:scale-95 transition-transform`}
                            style={ctaStyle}
                        >
                            {content.ctaText || "ORDINA ORA"} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    ));

    const reviewsPos = content.reviewsPosition === undefined ? content.features.length : content.reviewsPosition;
    const featuresBefore = content.features.slice(0, reviewsPos);
    const featuresAfter = content.features.slice(reviewsPos);

    const currentAnnouncement = announcements[currentAnnIndex];
    const cleanMainPrice = stripCurrency(content.price || "39", currency);

    return (
        <div className={`min-h-screen ${!content.backgroundColor ? 'bg-slate-50' : ''} text-slate-800 pb-32 md:pb-0 selection:bg-blue-100 selection:text-blue-900 ${styles.font}`} style={{...bodyStyle, ...backgroundStyle}}>
            <div 
                className={`text-center py-2.5 text-[10px] md:text-xs font-bold tracking-wide flex justify-center items-center h-9 sticky top-0 z-30 shadow-md transition-all duration-500 ${content.announcementBgClass || ''}`}
                style={{ 
                    backgroundColor: content.announcementBgClass ? undefined : (content.announcementBgColor || '#0f172a'), 
                    color: content.announcementTextColor || '#ffffff' 
                }}
            >
                <div key={currentAnnIndex} className="flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1 duration-500">
                    {getIconById(currentAnnouncement.icon, currentAnnouncement.iconSize)}
                    <span style={{ ...smallStyle, fontSize: `${content.announcementFontSize || 15}px` }}>{currentAnnouncement.text}</span>
                </div>
            </div>
            <div className="container mx-auto px-0 md:px-4 py-0 md:py-12 max-w-5xl">
                <div className="flex flex-col md:grid md:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-16 bg-white md:bg-transparent shadow-sm md:shadow-none pb-8 md:pb-0">
                    <div className="w-full order-1 flex-shrink-0">
                        <Gallery content={content} className="md:rounded-2xl shadow-none md:shadow-sm bg-white rounded-none border-none w-full block" />
                    </div>
                    <div className="w-full order-2 px-5 md:px-0 flex flex-col gap-5">
                        <div className="w-full">
                            <h1 className={`font-extrabold leading-[1.1] mb-3 text-slate-900 ${styles.h1} tracking-tight break-words w-full`} style={h1Style}>{content.headline}</h1>
                            <div className="flex items-center gap-2 w-full">
                                <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}</div>
                                <span className="text-sm text-slate-500 font-medium underline decoration-slate-300 decoration-dotted underline-offset-2" style={smallStyle}>4.9/5 - {reviews.length} {labels.reviews}</span>
                            </div>
                            {content.showSocialProofBadge !== false && (
                                <SocialProofBadge 
                                    language={'Italiano'} 
                                    defaultText={labels.socialProof} 
                                    config={content.socialProofBadgeConfig}
                                    localizedName={content.uiTranslation?.socialProofBadgeName}
                                    count={content.socialProofCount}
                                />
                            )}
                        </div>
                        <div className={`${offerBoxClass} w-full mt-2`}>
                             <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-lg uppercase z-10">{labels.offer}</div>
                             {content.stockConfig?.enabled && (
                                 <div className="flex items-center justify-center gap-1.5 mb-3 bg-red-50 border border-red-100 rounded-md py-2 px-3 mx-auto w-full animate-pulse">
                                     <Flame className="w-4 h-4 text-red-500 fill-red-500" />
                                     <span className="text-xs font-bold text-red-600 uppercase tracking-wide">{content.stockConfig.textOverride ? content.stockConfig.textOverride.replace('{x}', currentStock.toString()) : labels.onlyLeft.replace('{x}', currentStock.toString())}</span>
                                 </div>
                             )}
                             <div className="flex wrap items-center justify-center gap-4 mb-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm mt-2 relative z-0 w-full">
                                <PriceDisplay p={content.price || "39"} op={content.originalPrice || "79"} big={true} />
                             </div>
                             <div className="bg-blue-100/50 text-blue-900 text-center text-sm font-bold py-2.5 rounded border border-blue-200/50 mb-4 flex items-center justify-center gap-2 w-full">
                                <CheckCircle className="w-4 h-4 text-blue-600" /><span style={smallStyle}>{content.ctaSubtext}</span>
                             </div>
                             <div className="space-y-2 mb-5 px-1 w-full">
                                {content.benefits.slice(0, 4).map((b, i) => (
                                    <div key={i} className="flex items-start gap-2.5">
                                        <div className="mt-0.5 text-blue-500 flex-shrink-0 bg-white rounded-full p-0.5 shadow-sm"><Check className="w-3 h-3" /></div>
                                        <span className="text-sm font-medium text-slate-700 leading-tight" style={bodyStyle}>{b}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <button onClick={onBuy} className={`w-full ${ctaButtonClass} font-bold text-lg py-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide group mb-4`} style={ctaStyle}>
                                <span>{content.ctaText || "ORDINA ORA"}</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            {content.showDeliveryTimeline !== false && (
                                <div className="mb-6 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <DeliveryTimeline labels={labels} language={'Italiano'} />
                                </div>
                            )}

                            <div className="flex justify-center gap-3 mt-3 text-[10px] text-slate-400 font-bold w-full" style={smallStyle}>
                                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {labels.secure}</span>
                                <span className="flex items-center gap-1"><RefreshCcw className="w-3 h-3" /> {labels.returns}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 py-4 mb-2 w-full">
                             <div className="flex flex-col items-center text-center gap-1.5"><ShieldCheck className="w-6 h-6 text-blue-600"/><span className="text-[10px] font-bold text-slate-600 leading-tight" style={smallStyle}>{labels.original}</span></div>
                             <div className="flex flex-col items-center text-center gap-1.5"><Truck className="w-6 h-6 text-blue-600"/><span className="text-[10px] font-bold text-slate-600 leading-tight" style={smallStyle}>{labels.express}</span></div>
                             <div className="flex flex-col items-center text-center gap-1.5"><CheckSquare className="w-6 h-6 text-blue-600"/><span className="text-[10px] font-bold text-slate-600 leading-tight" style={smallStyle}>{labels.warranty}</span></div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500 text-slate-700 italic text-sm leading-relaxed mb-4 w-full">
                           <p style={h2Style}>"{content.subheadline}"</p>
                        </div>
                    </div>
                </div>

                {/* SEZIONE TikTok Slider prima dei paragrafi features */}
                {content.extraLandingHtml && (<MemoizedHTML className="w-full mt-4 mb-12" html={content.extraLandingHtml} />)}

                <div className="space-y-16 md:space-y-24 mb-16 px-5 md:px-0">
                    <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12">
                         <h2 className={`font-bold text-slate-900 mb-2 ${styles.h2}`} style={h2Style}>{labels.techDesign}</h2>
                    </div>
                    {featuresBefore.map((f, i) => (
                        <FeatureBlock key={i} f={f} i={i} />
                    ))}
                    <BoxContentSection />
                    {reviews.length > 0 && <ReviewsSection />}
                    
                    {/* Visual Pricing Section requested by user (replicates the image design) */}
                    <BottomOfferSection content={content} onBuy={onBuy} currency={currency} labels={labels} />

                    {featuresAfter.map((f, i) => (
                        <FeatureBlock key={i + featuresBefore.length} f={f} i={i + featuresBefore.length} />
                    ))}
                </div>

                <footer className="bg-slate-50 pt-10 pb-24 md:pb-12 border-t border-slate-200 mt-auto">
                    <div className="container mx-auto px-6 max-w-4xl text-center">
                        {siteConfig && (
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-8">
                                {siteConfig.phone && <div className="flex flex-col items-center gap-1"><Phone className="w-4 h-4 text-slate-300 mb-1" /><span>{siteConfig.phone}</span></div>}
                                {siteConfig.email && <div className="flex flex-col items-center gap-1"><Mail className="w-4 h-4 text-slate-300 mb-1" /><span>{siteConfig.email}</span></div>}
                                {siteConfig.vatNumber && <div className="flex flex-col items-center gap-1"><FileText className="w-4 h-4 text-slate-300 mb-1" /><span>P.IVA: {siteConfig.vatNumber}</span></div>}
                            </div>
                        )}
                        <div className="text-[10px] text-slate-400 text-justify leading-relaxed mb-6 space-y-2" style={smallStyle}>
                            <p>{labels.legalDisclaimer}</p>
                        </div>
                        <div className="flex wrap justify-center gap-6 mb-8">
                            <button onClick={() => setActiveLegalModal('Privacy Policy')} className="text-xs text-slate-500 hover:text-slate-900 font-bold hover:underline" style={smallStyle}>{labels.privacyPolicy}</button>
                            <button onClick={() => setActiveLegalModal('Termini')} className="text-xs text-slate-500 hover:text-slate-900 font-bold hover:underline" style={smallStyle}>{labels.termsConditions}</button>
                            <button onClick={() => setActiveLegalModal('Cookie Policy')} className="text-xs text-slate-500 hover:text-slate-900 font-bold hover:underline" style={smallStyle}>{labels.cookiePolicy}</button>
                        </div>
                        <p className="text-[10px] text-slate-300">© {new Date().getFullYear()} {siteConfig?.siteName || labels.rightsReserved}</p>
                        <p className="text-[9px] text-slate-200 mt-1">{labels.generatedPageNote}</p>
                    </div>
                </footer>
            </div>
            
            {socialNotification && socialNotification.visible && (
                <div className="fixed bottom-24 md:bottom-6 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 z-[60] animate-in slide-in-from-bottom-5 fade-in duration-500 w-[90%] md:w-auto">
                    <div className="bg-white/95 backdrop-blur shadow-2xl rounded-xl p-3 border border-slate-200 flex items-center gap-3 pr-6">
                         <div className="relative">
                            <div className="w-10 h-10 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <img src={`https://ui-avatars.com/api/?name=${socialNotification.name}&background=random&color=fff`} alt={socialNotification.name} />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white"><Check className="w-2 h-2 text-white" strokeWidth={4} /></div>
                         </div>
                         <div>
                             <div className="flex items-center gap-2 mb-0.5">
                                 <span className="text-xs text-slate-800 font-bold">{socialNotification.name}</span>
                                 <span className="flex items-center gap-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-wide leading-none"><ShieldCheck className="w-2.5 h-2.5" />{labels.certified}</span>
                             </div>
                             <div className="text-[10px] text-slate-500 font-medium leading-tight">
                                {labels.socialProofAction} {labels.socialProofFrom} <span className="font-semibold">{socialNotification.city}</span>
                             </div>
                         </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 px-4 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] safe-area-bottom pb-6">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col min-w-[80px]">
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider leading-none mb-0.5 animate-pulse">{labels.offer}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-black text-2xl text-slate-900 leading-none">
                                {labels.currencyPos === 'before' ? `${currency} ${cleanMainPrice}` : cleanMainPrice}
                            </span>
                            {labels.currencyPos === 'after' && <span className="text-xs font-bold text-slate-900">{currency}</span>}
                        </div>
                    </div>
                    <button onClick={onBuy} className={`flex-1 ${ctaButtonClass} font-bold text-base py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform uppercase tracking-wide`} style={ctaStyle}>
                        {content.ctaText || "ORDINA ORA"} <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <LegalModal isOpen={!!activeLegalModal} onClose={() => setActiveLegalModal(null)} title={activeLegalModal === 'Privacy Policy' ? labels.privacyPolicy : (activeLegalModal === 'Termini' ? labels.termsConditions : labels.cookiePolicy)} contentText="Lorem ipsum dolor sit amet..." disclaimer={labels.legalDisclaimer}/>
            
            {activeReviewImage && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveReviewImage(null)}>
                    <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
                        <X className="w-8 h-8" />
                    </button>
                    <div className="max-w-4xl max-h-[90vh] p-4 relative" onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={activeReviewImage} 
                            alt="Recensione a tutto schermo" 
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

const LandingPage: React.FC<LandingPageProps> = ({ content, thankYouSlug, onRedirect, onPurchase, siteConfig }) => {
    const [isOrderOpen, setIsOrderOpen] = useState(false);
    const styles = getTypographyStyles(content.typography);

    useEffect(() => {
        if (content.customHeadHtml) injectCustomScript(content.customHeadHtml);
        if (content.customHeadHtml2) injectCustomScript(content.customHeadHtml2);
        if (content.metaLandingHtml) injectCustomScript(content.metaLandingHtml);
        if (content.tiktokLandingHtml) injectCustomScript(content.tiktokLandingHtml);
    }, [content.customHeadHtml, content.customHeadHtml2, content.metaLandingHtml, content.tiktokLandingHtml]);

    const handleOpenOrder = () => {
        const price = parseFloat(content.price?.replace(',', '.') || '0');
        trackEvent('AddToCart', { content_id: generateContentId(content.headline), value: isNaN(price) ? 0 : price, currency: content.currency || 'EUR' });
        setIsOrderOpen(true);
    }

    return (
        <>
            <GadgetTemplate content={content} onBuy={handleOpenOrder} styles={styles} siteConfig={siteConfig} />
            <OrderPopup isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)} content={content} thankYouSlug={thankYouSlug} onRedirect={onRedirect} onPurchase={onPurchase} />
        </>
    );
};

export default LandingPage;
