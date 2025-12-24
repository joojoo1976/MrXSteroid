import React, { useState, useEffect } from 'react';
import { Download, Pause, Play, Volume2, ArrowUpRight, Lock, CheckCircle, User } from 'lucide-react';
import { ContentStrings, PricingTier } from '../types';

interface HeroProps {
  content: ContentStrings;
  isRTL: boolean;
  lang: string;
  openCheckout: (tier: PricingTier) => void;
  playerState: { isPlaying: boolean; togglePlay: () => void; };
}

// Internal BookCover Component to keep Hero self-contained
const BookCover: React.FC<{ content: ContentStrings, isRTL: boolean, lang: string, onClick: () => void }> = ({ content, isRTL, lang, onClick }) => {
  const getDefaultImg = () => {
    if (lang === 'he') return "/cover-he.png";
    return isRTL ? "/cover-ar.webp" : "/cover-en.webp";
  };
  const [imgSrc, setImgSrc] = useState<string>(getDefaultImg());
  const [retryCount, setRetryCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // State is reset via key on BookCover in Hero component when lang or isRTL changes

  const handleError = () => {
    const base = lang === 'he' ? "/cover-he" : isRTL ? "/cover-ar" : "/cover-en";
    if (retryCount === 0) { setImgSrc(`${base}.jpg`); setRetryCount(1); }
    else if (retryCount === 1) { setImgSrc(`${base}.png`); setRetryCount(2); }
    else if (retryCount === 2) { setImgSrc("https://placehold.co/600x900/18181b/EAB308?text=MR+X+STEROID&font=oswald"); setRetryCount(3); }
  };

  return (
    <div className="relative w-72 md:w-[24rem] aspect-[2/3] mx-auto my-12 animate-float group cursor-pointer z-20 [perspective:1500px]" onClick={(e) => { e.stopPropagation(); setIsFlipped(!isFlipped); }}>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold-500/20 blur-[60px] rounded-full opacity-60 transition-all duration-700 ${isFlipped ? 'opacity-30 scale-90' : 'group-hover:opacity-100'}`}></div>
      <div className={`relative w-full h-full transition-transform duration-700 ease-in-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(-180deg)]' : 'group-hover:[transform:rotateY(-10deg)_rotateX(5deg)]'}`}>
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] z-20">
          <div className={`relative w-full h-full ${isRTL ? 'rounded-l-xl rounded-r-sm' : 'rounded-r-xl rounded-l-sm'} shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-zinc-900 ${isRTL ? 'border-l' : 'border-r'} border-t border-b border-zinc-700 overflow-hidden`}>
            <div className={`absolute top-[2px] bottom-[2px] ${isRTL ? 'right-0' : 'left-0'} w-4 bg-gradient-to-r ${isRTL ? 'from-zinc-600 to-zinc-800' : 'from-zinc-800 to-zinc-600'} ${isRTL ? 'rounded-r-sm' : 'rounded-l-sm'} z-10 ${isRTL ? 'border-r' : 'border-l'} border-zinc-600`}></div>
            <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-gold-500 text-black text-[10px] font-black px-2 py-1 rounded-sm z-30 shadow-md uppercase tracking-wider`}>
              {content.heroEditions[lang as keyof typeof content.heroEditions]}
            </div>
            <div className={`absolute inset-0 ${isRTL ? 'mr-4' : 'ml-4'} bg-zinc-900 ${isRTL ? 'rounded-l-xl' : 'rounded-r-xl'} overflow-hidden relative z-20 ${isRTL ? 'border-r' : 'border-l'} border-zinc-800 h-full p-1`}>
              <img key={imgSrc} src={imgSrc} alt="Mr. X Steroid Book Cover" className={`w-full h-full object-cover ${isRTL ? 'rounded-l-lg' : 'rounded-r-lg'}`} onError={handleError} />
            </div>
            <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${isRTL ? 'rounded-l-xl mr-4' : 'rounded-r-xl ml-4'} z-30`}></div>
          </div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] z-10">
          <div className={`w-full h-full ${isRTL ? 'rounded-r-xl rounded-l-sm' : 'rounded-l-xl rounded-r-sm'} bg-zinc-900 border border-zinc-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col p-1 relative overflow-hidden`}>
            <div className={`flex-1 bg-zinc-950 ${isRTL ? 'rounded-r-lg rounded-l-sm ml-4' : 'rounded-l-lg rounded-r-sm mr-4'} border border-zinc-800 relative overflow-hidden p-6 flex flex-col items-center justify-between`}>
              <div className="relative z-20 text-center"><div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-700"><Lock className="w-6 h-6 text-gold-500" /></div><h3 className="text-xl font-black text-white mb-1">SECRET PROTOCOLS</h3></div>
              <div className="relative z-20 w-full pt-4"><button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-black font-black text-sm uppercase tracking-wider rounded-lg shadow-lg shadow-gold-500/20 transition-all flex items-center justify-center gap-2">{content.buyNow} <ArrowUpRight className="w-4 h-4" /></button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AudioPlayer: React.FC<{ content: ContentStrings, playerState: { isPlaying: boolean, togglePlay: () => void } }> = ({ content, playerState }) => (
  <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center gap-4 animate-fade-in-up">
    <button aria-label={playerState.isPlaying ? "Pause Audio" : "Play Audio"} title={playerState.isPlaying ? "Pause Audio" : "Play Audio"} onClick={playerState.togglePlay} className="w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 transition-transform">
      {playerState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
    </button>
    <div className="flex-1 text-left rtl:text-right">
      <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{content.audioPlayer.title}</h4>
      <p className="text-xs text-zinc-500">{content.audioPlayer.subtitle}</p>
    </div>
    <div className="text-xs font-mono font-bold text-zinc-400">{content.audioPlayer.duration}</div>
  </div>
);

const Hero: React.FC<HeroProps> = ({ content, isRTL, lang, openCheckout, playerState }) => {
  return (
    <section className="pt-12 pb-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-zinc-200/50 dark:bg-grid-white/5 [mask-image:linear-gradient(0deg,white,transparent)] pointer-events-none" />
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 pb-2">{content.heroTitle}</h1>
        <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed">{content.heroSubtitle}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 flex-wrap">
          <button onClick={() => openCheckout(content.pricingTiers[0])} className="px-8 py-4 bg-gold-500 hover:bg-gold-400 text-black border border-zinc-900 font-bold text-lg rounded-full transition-all shadow-lg shadow-gold-500/20 hover:scale-105 hover:shadow-gold-500/30">{content.heroCta}</button>
          <a
            href={isRTL ? "/Example_MrXSteroid_Book_Ar.pdf" : "/Example_MrXSteroid_Book.pdf"}
            download
            className="px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-800 hover:border-gold-500 dark:hover:border-gold-500 font-bold text-lg rounded-full transition-all flex items-center gap-2 group"
          >
            <Download className="w-5 h-5 group-hover:text-gold-500 transition-colors" />
            {content.downloadPreview}
          </a>
          <button onClick={playerState.togglePlay} className={`px-8 py-4 border font-bold text-lg rounded-full transition-all flex items-center gap-2 group ${playerState.isPlaying ? 'bg-gold-500 border-gold-500 text-black shadow-lg shadow-gold-500/30' : 'bg-transparent text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-gold-500 hover:text-gold-600 dark:hover:text-gold-500'}`}>{playerState.isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}{content.audioPreviewBtn}</button>
        </div>
        <BookCover key={`${lang}-${isRTL}`} content={content} isRTL={isRTL} lang={lang} onClick={() => openCheckout(content.pricingTiers[0])} />
        <div className="max-w-md mx-auto"><AudioPlayer content={content} playerState={playerState} /></div>
      </div>
    </section>
  );
};

export default Hero;
